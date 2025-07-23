import chalk from 'chalk';
import path from 'path';
import { createDiffPatch } from 'diff';
import fileManager from '../utils/fileManager.js';
import aiService from '../services/aiService.js';

export class CommandProcessor {
    constructor() {
        this.commandHistory = [];
        this.lastCommand = null;
    }

    /**
     * Proses perintah pengguna
     */
    async processCommand(command) {
        const trimmedCommand = command.trim();
        
        if (!trimmedCommand) {
            return '';
        }

        // Simpan ke history
        this.commandHistory.push(trimmedCommand);
        this.lastCommand = trimmedCommand;

        const commandLower = trimmedCommand.toLowerCase();

        try {
            // File operations
            if (commandLower.startsWith('mv ') || commandLower.startsWith('move ')) {
                return await this._handleMove(trimmedCommand);
            }
            if (commandLower.startsWith('cp ') || commandLower.startsWith('copy ')) {
                return await this._handleCopy(trimmedCommand);
            }
            if (commandLower.startsWith('rm ') || commandLower.startsWith('delete ')) {
                return await this._handleDelete(trimmedCommand);
            }
            if (commandLower.startsWith('mkdir ') || commandLower.startsWith('create dir ')) {
                return await this._handleMkdir(trimmedCommand);
            }
            if (commandLower.startsWith('touch ') || commandLower.startsWith('create file ')) {
                return await this._handleTouch(trimmedCommand);
            }
            if (commandLower.startsWith('cat ') || commandLower.startsWith('show ')) {
                return await this._handleCat(trimmedCommand);
            }
            if (commandLower.startsWith('ls') || commandLower === 'list' || commandLower === 'files') {
                return await this._handleList();
            }
            if (commandLower.startsWith('find ')) {
                return await this._handleFind(trimmedCommand);
            }
            if (commandLower === 'pwd') {
                return this._handlePwd();
            }
            if (commandLower.startsWith('cd ')) {
                return await this._handleCd(trimmedCommand);
            }
            
            // AI and model commands
            if (commandLower === 'models') {
                return this._handleModels();
            }
            if (commandLower.startsWith('model ')) {
                return this._handleSelectModel(trimmedCommand);
            }
            if (commandLower === 'scan' || commandLower === 'refresh') {
                return await this._handleScan();
            }
            if (commandLower === 'status') {
                return this._handleStatus();
            }
            
            // Advanced file operations
            if (commandLower.startsWith('diff ')) {
                return await this._handleDiff(trimmedCommand);
            }
            if (commandLower.startsWith('backup ')) {
                return await this._handleBackup(trimmedCommand);
            }
            if (commandLower.startsWith('search ')) {
                return this._handleSearch(trimmedCommand);
            }
            
            // AI-specific commands
            if (commandLower.startsWith('analyze') || commandLower.startsWith('analisis')) {
                return await this._handleAnalyze(trimmedCommand);
            }
            if (commandLower.startsWith('test ') || commandLower.startsWith('tests ')) {
                return await this._handleGenerateTests(trimmedCommand);
            }
            if (commandLower.startsWith('refactor ')) {
                return await this._handleRefactor(trimmedCommand);
            }
            if (commandLower.startsWith('fix ') || commandLower.startsWith('perbaiki ')) {
                return await this._handleFix(trimmedCommand);
            }
            if (commandLower.startsWith('optimize ') || commandLower.startsWith('optimasi ')) {
                return await this._handleOptimize(trimmedCommand);
            }
            if (commandLower.startsWith('explain ') || commandLower.startsWith('jelaskan ')) {
                return await this._handleExplain(trimmedCommand);
            }
            if (commandLower.startsWith('review ')) {
                return await this._handleReview(trimmedCommand);
            }
            
            // Configuration commands
            if (commandLower.startsWith('config ')) {
                return this._handleConfig(trimmedCommand);
            }
            if (commandLower === 'history') {
                return this._handleHistory();
            }
            if (commandLower === 'help') {
                return this._showHelp();
            }
            if (commandLower === 'clear') {
                console.clear();
                return '';
            }
            
            // Default: treat as AI command
            return await this._handleAICommand(trimmedCommand);
            
        } catch (error) {
            return chalk.red(`❌ Error saat memproses perintah: ${error.message}`);
        }
    }

    /**
     * Handle move file/directory
     */
    async _handleMove(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 3) {
            return chalk.red('❌ Penggunaan: mv <source> <destination>');
        }

        const [, src, dst] = parts;
        const success = await fileManager.moveFile(src, dst);
        
        if (success) {
            await aiService.scanProject(true); // Refresh project scan
            return chalk.green(`✅ Berhasil memindahkan ${src} ke ${dst}`);
        }
        
        return '';
    }

    /**
     * Handle copy file/directory
     */
    async _handleCopy(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 3) {
            return chalk.red('❌ Penggunaan: cp <source> <destination>');
        }

        const [, src, dst] = parts;
        const success = await fileManager.copyFile(src, dst);
        
        if (success) {
            await aiService.scanProject(true);
            return chalk.green(`✅ Berhasil menyalin ${src} ke ${dst}`);
        }
        
        return '';
    }

    /**
     * Handle delete file/directory
     */
    async _handleDelete(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: rm <file/directory>');
        }

        const filePath = parts[1];
        const success = await fileManager.deleteFile(filePath);
        
        if (success) {
            await aiService.scanProject(true);
            return chalk.green(`✅ Berhasil menghapus ${filePath}`);
        }
        
        return '';
    }

    /**
     * Handle create directory
     */
    async _handleMkdir(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: mkdir <directory>');
        }

        const dirPath = parts[1];
        const success = await fileManager.createDirectory(dirPath);
        
        if (success) {
            return chalk.green(`✅ Berhasil membuat direktori ${dirPath}`);
        }
        
        return '';
    }

    /**
     * Handle create file
     */
    async _handleTouch(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: touch <filename>');
        }

        const filename = parts[1];
        const success = await fileManager.createFile(filename);
        
        if (success) {
            await aiService.scanProject(true);
            return chalk.green(`✅ Berhasil membuat file ${filename}`);
        }
        
        return '';
    }

    /**
     * Handle show file content
     */
    async _handleCat(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: cat <filename>');
        }

        const filename = parts[1];
        const content = await aiService.getFileContent(filename);
        
        if (content) {
            return `${chalk.blue(`📄 ${filename}:`)}\n${'='.repeat(50)}\n${content}\n${'='.repeat(50)}`;
        }
        
        return chalk.red(`❌ File ${filename} tidak ditemukan`);
    }

    /**
     * Handle list files
     */
    async _handleList() {
        const items = await fileManager.listDirectory();
        
        if (items.length === 0) {
            return chalk.yellow('📁 Tidak ada file yang ditemukan');
        }

        let result = chalk.blue(`📁 Ditemukan ${items.length} item:\n`);
        
        items.forEach((item, index) => {
            const icon = item.isDirectory ? '📂' : '📄';
            const sizeInfo = item.isFile ? ` (${this._formatSize(item.size)})` : '';
            const langInfo = item.language && item.language !== 'unknown' ? ` [${item.language}]` : '';
            
            result += `${(index + 1).toString().padStart(2)}. ${icon} ${item.name}${sizeInfo}${langInfo}\n`;
        });

        return result.trim();
    }

    /**
     * Handle find files
     */
    async _handleFind(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: find <pattern>');
        }

        const pattern = parts[1];
        const files = await fileManager.findFiles(`**/*${pattern}*`);
        
        if (files.length === 0) {
            return chalk.yellow(`🔍 Tidak ditemukan file yang cocok dengan '${pattern}'`);
        }

        let result = chalk.blue(`🔍 Ditemukan ${files.length} file yang cocok:\n`);
        files.forEach(file => {
            result += `• ${file}\n`;
        });

        return result.trim();
    }

    /**
     * Handle pwd
     */
    _handlePwd() {
        return chalk.blue(`📂 ${process.cwd()}`);
    }

    /**
     * Handle change directory
     */
    async _handleCd(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return this._handlePwd();
        }

        const targetDir = parts[1];
        
        try {
            process.chdir(targetDir);
            await aiService.scanProject(true);
            return chalk.green(`✅ Pindah ke ${process.cwd()}`);
        } catch (error) {
            return chalk.red(`❌ Direktori ${targetDir} tidak ditemukan`);
        }
    }

    /**
     * Handle show models
     */
    _handleModels() {
        const models = aiService.getAvailableModels();
        const currentModel = aiService.getCurrentModel();
        
        let result = chalk.blue('🤖 Model yang tersedia:\n');
        models.forEach((model, index) => {
            const marker = model === currentModel ? '→' : ' ';
            result += `${marker} ${(index + 1).toString().padStart(2)}. ${model}\n`;
        });

        return result.trim();
    }

    /**
     * Handle select model
     */
    _handleSelectModel(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: model <nomor>');
        }

        try {
            const modelIndex = parseInt(parts[1]) - 1;
            const success = aiService.selectModel(modelIndex);
            
            if (success) {
                return chalk.green(`✅ Model dipilih: ${aiService.getCurrentModel()}`);
            } else {
                return chalk.red('❌ Nomor model tidak valid');
            }
        } catch (error) {
            return chalk.red('❌ Nomor harus berupa angka');
        }
    }

    /**
     * Handle scan project
     */
    async _handleScan() {
        await aiService.scanProject();
        return chalk.green('✅ Project berhasil dipindai ulang');
    }

    /**
     * Handle status
     */
    _handleStatus() {
        const status = aiService.getProjectStatus();
        
        return `${chalk.blue('📊 Status AI Code Assistant:')}
🤖 Model aktif: ${status.currentModel}
📂 Direktori: ${status.currentDirectory}
📁 File kode: ${status.filesCount}
🔑 API Key: ${status.apiKeyConfigured ? '✅ Tersedia' : '❌ Tidak ada'}
💾 Project loaded: ${status.loaded ? '✅ Ya' : '❌ Tidak'}`;
    }

    /**
     * Handle diff files
     */
    async _handleDiff(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 3) {
            return chalk.red('❌ Penggunaan: diff <file1> <file2>');
        }

        const [, file1, file2] = parts;
        const content1 = await aiService.getFileContent(file1);
        const content2 = await aiService.getFileContent(file2);

        if (!content1) {
            return chalk.red(`❌ File ${file1} tidak ditemukan`);
        }
        if (!content2) {
            return chalk.red(`❌ File ${file2} tidak ditemukan`);
        }

        const diff = createDiffPatch(file1, file2, content1, content2);
        
        if (diff) {
            return `${chalk.blue(`📊 Perbedaan antara ${file1} dan ${file2}:`)}\n${diff}`;
        } else {
            return chalk.green(`✅ File ${file1} dan ${file2} identik`);
        }
    }

    /**
     * Handle backup file
     */
    async _handleBackup(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: backup <file>');
        }

        const filename = parts[1];
        const backupPath = await fileManager.createBackup(filename);
        
        if (backupPath) {
            return chalk.green(`✅ Backup dibuat: ${backupPath}`);
        }
        
        return chalk.red(`❌ Gagal membuat backup untuk ${filename}`);
    }

    /**
     * Handle search in project
     */
    _handleSearch(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: search <query>');
        }

        const query = parts.slice(1).join(' ');
        const results = aiService.searchInProject(query);

        if (results.length === 0) {
            return chalk.yellow(`🔍 Tidak ditemukan hasil untuk '${query}'`);
        }

        let output = chalk.blue(`🔍 Hasil pencarian untuk '${query}':\n`);
        
        results.forEach((result, index) => {
            output += `\n${index + 1}. ${chalk.green(result.file)} (${result.language})\n`;
            result.matches.forEach(match => {
                output += `   ${match}\n`;
            });
        });

        return output.trim();
    }

    /**
     * Handle analyze code
     */
    async _handleAnalyze(command) {
        const parts = this._parseCommand(command);
        const filePath = parts.length > 1 ? parts[1] : null;
        
        console.log(chalk.blue('🔍 Menganalisis kode...'));
        
        const analysis = await aiService.analyzeCode(filePath);
        return `${chalk.blue('📋 Hasil Analisis:')}\n${analysis}`;
    }

    /**
     * Handle generate tests
     */
    async _handleGenerateTests(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: test <file>');
        }

        const filePath = parts[1];
        console.log(chalk.blue(`🧪 Membuat unit test untuk ${filePath}...`));
        
        const tests = await aiService.generateTests(filePath);
        return `${chalk.blue('🧪 Unit Tests:')}\n${tests}`;
    }

    /**
     * Handle refactor code
     */
    async _handleRefactor(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: refactor <file>');
        }

        const filePath = parts[1];
        console.log(chalk.blue(`🔄 Merefactor ${filePath}...`));
        
        const refactored = await aiService.refactorCode(filePath);
        return `${chalk.blue('🔄 Hasil Refactor:')}\n${refactored}`;
    }

    /**
     * Handle fix issues
     */
    async _handleFix(command) {
        const prompt = `Cari dan perbaiki masalah dalam kode: ${command.substring(4)}`;
        console.log(chalk.blue('🔧 Mencari dan memperbaiki masalah...'));
        
        const fixes = await aiService.askAI(prompt);
        return `${chalk.blue('🔧 Saran Perbaikan:')}\n${fixes}`;
    }

    /**
     * Handle optimize code
     */
    async _handleOptimize(command) {
        const parts = this._parseCommand(command);
        const filePath = parts.length > 1 ? parts[1] : null;
        
        const prompt = filePath 
            ? `Optimasi file ${filePath} untuk performa yang lebih baik`
            : 'Berikan saran optimasi untuk seluruh project';
            
        console.log(chalk.blue('⚡ Mengoptimasi kode...'));
        
        const optimization = await aiService.askAI(prompt, filePath ? [filePath] : null);
        return `${chalk.blue('⚡ Saran Optimasi:')}\n${optimization}`;
    }

    /**
     * Handle explain code
     */
    async _handleExplain(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: explain <file>');
        }

        const filePath = parts[1];
        const prompt = `Jelaskan cara kerja kode dalam file ${filePath} secara detail`;
        
        console.log(chalk.blue(`📚 Menjelaskan ${filePath}...`));
        
        const explanation = await aiService.askAI(prompt, [filePath]);
        return `${chalk.blue('📚 Penjelasan Kode:')}\n${explanation}`;
    }

    /**
     * Handle code review
     */
    async _handleReview(command) {
        const parts = this._parseCommand(command);
        const filePath = parts.length > 1 ? parts[1] : null;
        
        const prompt = filePath 
            ? `Lakukan code review untuk file ${filePath} dan berikan feedback`
            : 'Lakukan code review untuk seluruh project';
            
        console.log(chalk.blue('🎯 Melakukan code review...'));
        
        const review = await aiService.askAI(prompt, filePath ? [filePath] : null);
        return `${chalk.blue('🎯 Code Review:')}\n${review}`;
    }

    /**
     * Handle configuration
     */
    _handleConfig(command) {
        const parts = this._parseCommand(command);
        if (parts.length < 2) {
            return chalk.red('❌ Penggunaan: config <key> <value>');
        }

        // TODO: Implement configuration management
        return chalk.yellow('⚠️ Fitur konfigurasi belum tersedia');
    }

    /**
     * Handle command history
     */
    _handleHistory() {
        if (this.commandHistory.length === 0) {
            return chalk.yellow('📝 Tidak ada history perintah');
        }

        let result = chalk.blue('📝 History Perintah:\n');
        this.commandHistory.slice(-10).forEach((cmd, index) => {
            result += `${(index + 1).toString().padStart(2)}. ${cmd}\n`;
        });

        return result.trim();
    }

    /**
     * Handle AI command
     */
    async _handleAICommand(command) {
        // Deteksi file spesifik dalam perintah
        const contextFiles = this._extractFileReferences(command);
        
        console.log(chalk.blue('🤖 Memproses dengan AI...'));
        
        const response = await aiService.askAI(command, contextFiles);
        return response;
    }

    /**
     * Extract file references from command
     */
    _extractFileReferences(command) {
        const files = [];
        const filesData = aiService.filesData || {};
        
        // Cari penyebutan file dalam perintah
        for (const filePath of Object.keys(filesData)) {
            const fileName = path.basename(filePath);
            if (command.toLowerCase().includes(fileName.toLowerCase()) || 
                command.toLowerCase().includes(filePath.toLowerCase())) {
                files.push(filePath);
            }
        }
        
        return files.length > 0 ? files : null;
    }

    /**
     * Parse command into parts
     */
    _parseCommand(command) {
        return command.trim().split(/\s+/);
    }

    /**
     * Format file size
     */
    _formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Show help
     */
    _showHelp() {
        return `${chalk.blue('🆘 Bantuan AI Code Assistant:')}

${chalk.yellow('📁 OPERASI FILE:')}
   mv <src> <dst>     - Pindahkan file/direktori
   cp <src> <dst>     - Salin file/direktori  
   rm <path>          - Hapus file/direktori
   mkdir <dir>        - Buat direktori
   touch <file>       - Buat file kosong
   cat <file>         - Tampilkan isi file
   ls / files         - List file dalam project
   find <pattern>     - Cari file berdasarkan nama
   cd <dir>           - Pindah direktori
   pwd                - Tampilkan direktori saat ini
   diff <f1> <f2>     - Bandingkan dua file
   backup <file>      - Buat backup file

${chalk.yellow('🤖 AI & MODEL:')}
   models             - Tampilkan daftar model
   model <nomor>      - Pilih model
   scan / refresh     - Pindai ulang project
   status             - Tampilkan status system

${chalk.yellow('💬 PERINTAH AI:')}
   analyze [file]     - Analisis kode
   test <file>        - Buat unit test
   refactor <file>    - Refactor kode
   fix <masalah>      - Perbaiki masalah
   optimize [file]    - Optimasi kode
   explain <file>     - Jelaskan kode
   review [file]      - Code review
   search <query>     - Cari dalam project

${chalk.yellow('🔧 UTILITAS:')}
   history            - Tampilkan history perintah
   clear              - Bersihkan layar
   help               - Tampilkan bantuan ini
   
${chalk.yellow('🚪 KELUAR:')}
   exit / quit        - Keluar dari aplikasi`;
    }

    /**
     * Get command history
     */
    getHistory() {
        return this.commandHistory;
    }

    /**
     * Get last command
     */
    getLastCommand() {
        return this.lastCommand;
    }
}

export default new CommandProcessor();