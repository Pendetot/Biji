import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Config {
    constructor() {
        this.configPath = join(process.env.HOME || process.env.USERPROFILE, '.ai-assistant-config.json');
        this.defaultConfig = {
            apiUrl: 'https://inference.do-ai.run/v1/chat/completions',
            modelsUrl: 'https://inference.do-ai.run/v1/models',
            apiKey: ' ',
            selectedModel: 'llama3.3-70b-instruct',
            maxTokens: 4000,
            temperature: 0.1,
            timeout: 60000,
            maxFileSize: 100000,
            maxContextSize: 30000,
            supportedExtensions: {
                '.js': 'javascript',
                '.mjs': 'javascript', 
                '.cjs': 'javascript',
                '.ts': 'typescript',
                '.tsx': 'tsx',
                '.jsx': 'jsx',
                '.py': 'python',
                '.java': 'java',
                '.cpp': 'cpp',
                '.c': 'c',
                '.cs': 'csharp',
                '.php': 'php',
                '.rb': 'ruby',
                '.go': 'go',
                '.rs': 'rust',
                '.html': 'html',
                '.css': 'css',
                '.scss': 'scss',
                '.less': 'less',
                '.sql': 'sql',
                '.sh': 'bash',
                '.json': 'json',
                '.xml': 'xml',
                '.yaml': 'yaml',
                '.yml': 'yaml',
                '.vue': 'vue',
                '.md': 'markdown',
                '.txt': 'text'
            },
            ignoreDirs: new Set([
                '.git', 
                'node_modules', 
                '__pycache__', 
                '.vscode', 
                'venv', 
                'env', 
                'dist', 
                'build', 
                '.next', 
                'target',
                '.nuxt',
                'coverage',
                '.cache'
            ]),
            ignoreFiles: new Set([
                'package-lock.json',
                'yarn.lock',
                '.gitignore',
                '.env',
                '.env.local',
                '.env.production',
                '.DS_Store',
                'Thumbs.db'
            ])
        };
        
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            if (existsSync(this.configPath)) {
                const configData = JSON.parse(readFileSync(this.configPath, 'utf8'));
                return { ...this.defaultConfig, ...configData };
            }
        } catch (error) {
            console.warn('⚠️ Gagal memuat konfigurasi, menggunakan default');
        }
        
        return { ...this.defaultConfig };
    }

    saveConfig() {
        try {
            writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            return true;
        } catch (error) {
            console.error('❌ Gagal menyimpan konfigurasi:', error.message);
            return false;
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.saveConfig();
    }

    getApiUrl() {
        return this.config.apiUrl;
    }

    getModelsUrl() {
        return this.config.modelsUrl;
    }

    getApiKey() {
        return this.config.apiKey;
    }

    setApiKey(apiKey) {
        this.set('apiKey', apiKey);
    }

    getSelectedModel() {
        return this.config.selectedModel;
    }

    setSelectedModel(model) {
        this.set('selectedModel', model);
    }

    getSupportedExtensions() {
        return this.config.supportedExtensions;
    }

    getIgnoreDirs() {
        return this.config.ignoreDirs;
    }

    getIgnoreFiles() {
        return this.config.ignoreFiles;
    }

    getMaxFileSize() {
        return this.config.maxFileSize;
    }

    getMaxContextSize() {
        return this.config.maxContextSize;
    }

    getTimeout() {
        return this.config.timeout;
    }

    getMaxTokens() {
        return this.config.maxTokens;
    }

    getTemperature() {
        return this.config.temperature;
    }
}

export default new Config();