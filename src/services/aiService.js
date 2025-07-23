import axios from 'axios';
import chalk from 'chalk';
import config from '../config/config.js';
import fileManager from '../utils/fileManager.js';
import commandExecutor from './commandExecutor.js';

export class AIService {
    constructor() {
        this.apiUrl = config.getApiUrl();
        this.modelsUrl = config.getModelsUrl();
        this.apiKey = config.getApiKey();
        this.selectedModel = config.getSelectedModel();
        this.availableModels = [];
        this.filesData = {};
        this.projectLoaded = false;
        
        this.loadModels();
    }

    /**
     * Load daftar model yang tersedia
     */
    async loadModels() {
        try {
            const response = await axios.get(this.modelsUrl, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: config.getTimeout()
            });

            if (response.status === 200 && response.data?.data) {
                this.availableModels = response.data.data.map(model => model.id);
            } else {
                this.availableModels = this._getDefaultModels();
            }
        } catch (error) {
            console.warn(chalk.yellow('⚠️ Gagal memuat model dari API, menggunakan default'));
            this.availableModels = this._getDefaultModels();
        }
    }

    /**
     * Dapatkan daftar model default
     */
    _getDefaultModels() {
        return [
            'llama3.3-70b-instruct',
            'anthropic-claude-3.5-sonnet',
            'openai-gpt-4o',
            'deepseek-r1-distill-llama-70b',
            'google-gemini-pro',
            'meta-llama-3.1-405b-instruct'
        ];
    }

    /**
     * Scan project untuk analisis AI
     */
    async scanProject(silent = false) {
        if (!silent) {
            console.log(chalk.blue('🔍 Memindai project...'));
        }

        try {
            this.filesData = await fileManager.scanProject();
            this.projectLoaded = true;

            if (!silent) {
                console.log(chalk.green(`✅ Ditemukan ${Object.keys(this.filesData).length} file kode`));
            }

            return this.filesData;
        } catch (error) {
            console.error(chalk.red(`❌ Gagal memindai project: ${error.message}`));
            return {};
        }
    }

    /**
     * Dapatkan konten file
     */
    async getFileContent(filePath) {
        // Cek di cache terlebih dahulu
        if (this.filesData[filePath]) {
            return this.filesData[filePath].content;
        }

        // Cari file yang mengandung nama
        const matches = Object.keys(this.filesData).filter(f => f.includes(filePath));
        if (matches.length > 0) {
            return this.filesData[matches[0]].content;
        }

        // Coba baca langsung dari disk
        return await fileManager.readFile(filePath);
    }

    /**
     * Tanya AI dengan konteks file dan eksekusi otomatis
     */
    async askAI(prompt, contextFiles = null, executeCommands = false) {
        if (!this.projectLoaded) {
            await this.scanProject(true);
        }

        // Buat konteks dari file yang relevan
        const context = this._buildContext(contextFiles);

        const systemMessage = this._createSystemMessage(context, executeCommands);
        
        const messages = [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
        ];

        try {
            const response = await axios.post(this.apiUrl, {
                model: this.selectedModel,
                messages: messages,
                max_tokens: config.getMaxTokens(),
                temperature: config.getTemperature(),
                stream: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: config.getTimeout()
            });

            if (response.status === 200 && response.data?.choices?.[0]?.message?.content) {
                const aiResponse = response.data.choices[0].message.content;
                
                // Jika diminta untuk eksekusi otomatis, ekstrak dan jalankan perintah
                if (executeCommands) {
                    const commands = commandExecutor.parseAICommands(aiResponse);
                    const intents = commandExecutor.extractCommandIntent(prompt);
                    const contextualCommands = commandExecutor.generateContextualCommands(prompt, intents);
                    
                    // Gabungkan perintah dari AI response dan contextual commands
                    const allCommands = [...new Set([...commands, ...contextualCommands])];
                    
                    if (allCommands.length > 0) {
                        console.log(chalk.blue('\n🤖 AI sedang memproses perintah Anda...\n'));
                        await commandExecutor.executeCommands(allCommands, false);
                        console.log(chalk.green('\n✅ Eksekusi selesai!\n'));
                    }
                }
                
                return aiResponse;
            } else {
                return '❌ Respons AI tidak valid';
            }

        } catch (error) {
            if (error.response) {
                return `❌ Error API (${error.response.status}): ${error.response.data?.error?.message || 'Unknown error'}`;
            } else if (error.request) {
                return '❌ Tidak dapat terhubung ke API AI';
            } else {
                return `❌ Error: ${error.message}`;
            }
        }
    }

    /**
     * Stream respons AI (untuk respons yang panjang)
     */
    async askAIStream(prompt, contextFiles = null, onChunk = null) {
        if (!this.projectLoaded) {
            await this.scanProject(true);
        }

        const context = this._buildContext(contextFiles);
        const systemMessage = this._createSystemMessage(context);
        
        const messages = [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
        ];

        try {
            const response = await axios.post(this.apiUrl, {
                model: this.selectedModel,
                messages: messages,
                max_tokens: config.getMaxTokens(),
                temperature: config.getTemperature(),
                stream: true
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: config.getTimeout(),
                responseType: 'stream'
            });

            let fullResponse = '';

            return new Promise((resolve, reject) => {
                response.data.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            
                            if (data === '[DONE]') {
                                resolve(fullResponse);
                                return;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content;
                                
                                if (content) {
                                    fullResponse += content;
                                    if (onChunk) {
                                        onChunk(content);
                                    }
                                }
                            } catch (e) {
                                // Skip invalid JSON
                            }
                        }
                    }
                });

                response.data.on('end', () => {
                    resolve(fullResponse);
                });

                response.data.on('error', (error) => {
                    reject(error);
                });
            });

        } catch (error) {
            throw new Error(`Stream AI error: ${error.message}`);
        }
    }

    /**
     * Buat system message untuk AI
     */
    _createSystemMessage(context, executeCommands = false) {
        const baseMessage = `Anda adalah asisten kode AI yang ahli dalam analisis dan modifikasi kode. Anda mirip dengan Gemini CLI dan memiliki kemampuan:

1. 🔍 Analisis kode mendalam
2. 🐛 Deteksi dan perbaikan bug
3. ⚡ Optimasi performa
4. 🧪 Pembuatan unit test
5. 📚 Dokumentasi kode
6. 🔄 Refactoring kode
7. 🎯 Code review
8. 💡 Saran best practices
9. 🛠️ Eksekusi perintah terminal otomatis

KONTEKS PROJECT:
${context}

INSTRUKSI RESPONS:
- Berikan respons dalam bahasa Indonesia
- Berikan solusi yang spesifik dan actionable
- Sertakan contoh kode yang konkret
- Jelaskan reasoning di balik setiap saran
- Jika diminta memodifikasi kode, berikan kode lengkap
- Gunakan emoji untuk membuat respons lebih menarik
- Prioritaskan keamanan dan best practices`;

        if (executeCommands) {
            return baseMessage + `

INSTRUKSI KHUSUS UNTUK EKSEKUSI:
- Jika user meminta untuk membuat file/folder, berikan perintah terminal yang sesuai
- Gunakan format \`\`\`bash untuk perintah yang akan dieksekusi
- Contoh: jika user bilang "buat folder components", berikan:
  \`\`\`bash
  mkdir components
  \`\`\`
- Untuk file: \`\`\`bash\ntouch filename.js\n\`\`\`
- Untuk copying: \`\`\`bash\ncp source destination\n\`\`\`
- Selalu jelaskan apa yang akan dilakukan sebelum memberikan perintah
- Berikan perintah yang aman dan tidak merusak sistem

Jika user memberikan instruksi natural language, konversi menjadi perintah terminal yang tepat.`;
        }

        return baseMessage + `\n\nJika tidak ada konteks file, berikan saran umum yang berguna.`;
    }

    /**
     * Bangun konteks dari file yang relevan
     */
    _buildContext(specificFiles = null) {
        if (!this.filesData || Object.keys(this.filesData).length === 0) {
            return 'Tidak ada file kode yang ditemukan dalam project.';
        }

        const contextParts = [];
        const maxSize = config.getMaxContextSize();
        let currentSize = 0;

        // Tentukan file yang akan disertakan
        let filesToInclude = [];

        if (specificFiles && specificFiles.length > 0) {
            // Prioritaskan file yang diminta
            for (const file of specificFiles) {
                if (this.filesData[file]) {
                    filesToInclude.push([file, this.filesData[file]]);
                }
            }
        }

        // Tambahkan file lain berdasarkan ukuran (file kecil dulu)
        const remainingFiles = Object.entries(this.filesData)
            .filter(([path]) => !specificFiles?.includes(path))
            .sort((a, b) => a[1].size - b[1].size);

        filesToInclude.push(...remainingFiles);

        // Bangun konteks hingga batas ukuran
        for (const [filePath, data] of filesToInclude) {
            const fileHeader = `=== ${filePath} (${data.language}, ${data.lines} baris) ===\n`;
            const estimatedSize = fileHeader.length + data.content.length + 2; // +2 untuk newlines

            if (currentSize + estimatedSize > maxSize) {
                // Jika masih ada ruang untuk sebagian file
                const remainingSpace = maxSize - currentSize - fileHeader.length - 50; // -50 untuk marker
                if (remainingSpace > 500) {
                    const truncatedContent = data.content.substring(0, remainingSpace);
                    contextParts.push(`${fileHeader}${truncatedContent}\n[... FILE DIPOTONG ...]`);
                }
                break;
            }

            contextParts.push(`${fileHeader}${data.content}`);
            currentSize += estimatedSize;
        }

        return contextParts.join('\n\n');
    }

    /**
     * Analisis kode untuk mencari masalah
     */
    async analyzeCode(filePath = null) {
        const prompt = filePath 
            ? `Analisis file ${filePath} dan berikan laporan lengkap tentang:
               1. Kualitas kode dan struktur
               2. Potensi bug atau masalah
               3. Peluang optimasi
               4. Saran perbaikan
               5. Best practices yang bisa diterapkan`
            : `Analisis seluruh project dan berikan laporan komprehensif tentang:
               1. Struktur dan arsitektur project
               2. Kualitas kode secara keseluruhan
               3. Potensi masalah dan bug
               4. Saran optimasi
               5. Rekomendasi refactoring
               6. Best practices yang perlu diterapkan`;

        return await this.askAI(prompt, filePath ? [filePath] : null);
    }

    /**
     * Generate unit tests untuk file
     */
    async generateTests(filePath) {
        const prompt = `Buatkan unit test lengkap untuk file ${filePath}. Sertakan:
                       1. Test cases untuk semua fungsi/method
                       2. Edge cases dan error handling
                       3. Mock untuk dependencies
                       4. Setup dan teardown yang diperlukan
                       5. Assertion yang komprehensif`;

        return await this.askAI(prompt, [filePath]);
    }

    /**
     * Refactor kode
     */
    async refactorCode(filePath) {
        const prompt = `Refactor file ${filePath} untuk meningkatkan:
                       1. Readability dan maintainability
                       2. Performa dan efisiensi
                       3. Struktur dan organisasi kode
                       4. Error handling
                       5. Kepatuhan terhadap best practices
                       
                       Berikan kode hasil refactor yang lengkap.`;

        return await this.askAI(prompt, [filePath]);
    }

    /**
     * Dapatkan daftar model yang tersedia
     */
    getAvailableModels() {
        return this.availableModels;
    }

    /**
     * Pilih model AI
     */
    selectModel(modelIndex) {
        if (modelIndex >= 0 && modelIndex < this.availableModels.length) {
            this.selectedModel = this.availableModels[modelIndex];
            config.setSelectedModel(this.selectedModel);
            return true;
        }
        return false;
    }

    /**
     * Dapatkan model yang sedang aktif
     */
    getCurrentModel() {
        return this.selectedModel;
    }

    /**
     * Dapatkan status project
     */
    getProjectStatus() {
        return {
            loaded: this.projectLoaded,
            filesCount: Object.keys(this.filesData).length,
            currentModel: this.selectedModel,
            apiKeyConfigured: config.isApiKeyConfigured(),
            currentDirectory: process.cwd()
        };
    }

    /**
     * Set API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        config.setApiKey(apiKey);
    }

    /**
     * Cari file berdasarkan konten atau nama
     */
    searchInProject(query) {
        const results = [];
        const queryLower = query.toLowerCase();

        for (const [filePath, data] of Object.entries(this.filesData)) {
            let matches = [];

            // Cari dalam nama file
            if (filePath.toLowerCase().includes(queryLower)) {
                matches.push(`Nama file cocok: ${filePath}`);
            }

            // Cari dalam konten
            const lines = data.content.split('\n');
            lines.forEach((line, index) => {
                if (line.toLowerCase().includes(queryLower)) {
                    matches.push(`Baris ${index + 1}: ${line.trim()}`);
                }
            });

            if (matches.length > 0) {
                results.push({
                    file: filePath,
                    language: data.language,
                    matches: matches.slice(0, 10) // Batasi hasil per file
                });
            }
        }

        return results;
    }
}

export default new AIService();