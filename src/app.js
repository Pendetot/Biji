import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';
import ora from 'ora';
import readline from 'readline';
import aiService from './services/aiService.js';
import commandProcessor from './commands/commandProcessor.js';

export class AICodeAssistant {
    constructor() {
        this.running = false;
        this.rl = null;
        this.currentPrompt = '💬 Anda: ';
        this.setupReadline();
    }

    /**
     * Setup readline interface
     */
    setupReadline() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: this.currentPrompt,
            completer: this.completer.bind(this)
        });

        // Handle Ctrl+C
        this.rl.on('SIGINT', () => {
            this.shutdown();
        });

        // Handle line input
        this.rl.on('line', async (input) => {
            await this.handleInput(input.trim());
        });

        // Handle close
        this.rl.on('close', () => {
            this.shutdown();
        });
    }

    /**
     * Tab completion for commands
     */
    completer(line) {
        const commands = [
            // File operations
            'mv', 'move', 'cp', 'copy', 'rm', 'delete', 'mkdir', 'touch', 
            'cat', 'show', 'ls', 'list', 'files', 'find', 'pwd', 'cd',
            'diff', 'backup', 'search',
            
            // AI operations
            'models', 'model', 'scan', 'refresh', 'status', 'analyze', 'analisis',
            'test', 'tests', 'refactor', 'fix', 'perbaiki', 'optimize', 'optimasi',
            'explain', 'jelaskan', 'review',
            
            // Auto execution mode
            '/do', '/do buat folder', '/do buat file', '/do copy', '/do install',
            '/do pindah', '/do hapus', '/do tampilkan',
            
            // Utilities
            'config', 'setup-api', 'api-key', 'history', 'cmd-history', 'help', 'clear', 'exit', 'quit'
        ];

        // Special completion for /do commands
        if (line.startsWith('/do ')) {
            const doCommands = [
                '/do buat folder ',
                '/do buat file ',
                '/do copy ',
                '/do pindah ',
                '/do install ',
                '/do tampilkan file',
                '/do cari file',
                '/do backup '
            ];
            
            const hits = doCommands.filter((c) => c.startsWith(line));
            return [hits.length ? hits : doCommands, line];
        }

        const hits = commands.filter((c) => c.startsWith(line));
        return [hits.length ? hits : commands, line];
    }

    /**
     * Display welcome banner
     */
    displayBanner() {
        const title = figlet.textSync('AI Assistant', {
            font: 'ANSI Shadow',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        });

        const banner = boxen(
            chalk.cyan(title) + '\n\n' +
            chalk.yellow('🚀 AI Code Assistant Indonesia') + '\n' +
            chalk.gray('Asisten kode AI dengan kemampuan mirip Gemini CLI') + '\n\n' +
            chalk.green('✨ Fitur:') + '\n' +
            chalk.white('  • 🔍 Analisis kode mendalam') + '\n' +
            chalk.white('  • 🐛 Deteksi dan perbaikan bug') + '\n' +
            chalk.white('  • ⚡ Optimasi performa') + '\n' +
            chalk.white('  • 🧪 Pembuatan unit test') + '\n' +
            chalk.white('  • 📚 Dokumentasi kode') + '\n' +
            chalk.white('  • 🔄 Refactoring otomatis') + '\n' +
            chalk.white('  • 📁 Manajemen file lengkap') + '\n' +
            chalk.red('  • 🚀 Eksekusi terminal otomatis') + '\n\n' +
            chalk.magenta('🎯 Mode Baru: Natural Language Commands!') + '\n' +
            chalk.white('   Ketik: ') + chalk.cyan('/do buat folder components') + '\n' +
            chalk.white('   Atau: ') + chalk.cyan('/do copy file.js ke backup/') + '\n\n' +
            chalk.blue('💡 Ketik "help" untuk bantuan, "setup-api" untuk konfigurasi API, "exit" untuk keluar'),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'cyan',
                backgroundColor: 'black'
            }
        );

        console.log(banner);
    }

    /**
     * Initialize application
     */
    async initialize() {
        const spinner = ora('🔄 Menginisialisasi AI Code Assistant...').start();

        try {
            // Check if API key is configured
            const status = aiService.getProjectStatus();
            
            if (!status.apiKeyConfigured) {
                spinner.stop();
                await this.setupApiKey();
                spinner.start('🔄 Melanjutkan inisialisasi...');
            }

            // Load models
            await aiService.loadModels();
            spinner.text = '📂 Memindai project...';

            // Scan project
            await aiService.scanProject(true);
            
            spinner.succeed('✅ Inisialisasi selesai');
            
            return true;
        } catch (error) {
            spinner.fail(`❌ Gagal inisialisasi: ${error.message}`);
            return false;
        }
    }

    /**
     * Setup API key for first time users
     */
    async setupApiKey() {
        console.log(boxen(
            chalk.yellow.bold('🔑 KONFIGURASI API KEY\n\n') +
            chalk.white('Untuk menggunakan fitur AI, Anda perlu mengonfigurasi API key.\n\n') +
            chalk.blue('📋 Langkah-langkah:\n') +
            chalk.gray('1. Daftar di ') + chalk.cyan('https://inference.do-ai.run/') + '\n' +
            chalk.gray('2. Dapatkan API key dari dashboard\n') +
            chalk.gray('3. Masukkan API key di bawah ini\n\n') +
            chalk.green('💡 API key akan disimpan secara lokal dan aman'),
            {
                padding: 1,
                borderStyle: 'round',
                borderColor: 'yellow',
                title: '⚙️ Setup',
                titleAlignment: 'center'
            }
        ));

        while (true) {
            try {
                const apiKey = await this.getUserInput('Masukkan API key Anda');
                
                if (!apiKey || apiKey.trim().length === 0) {
                    console.log(chalk.red('❌ API key tidak boleh kosong'));
                    continue;
                }

                if (apiKey.trim().length < 10) {
                    console.log(chalk.red('❌ API key terlalu pendek, mohon periksa kembali'));
                    continue;
                }

                // Test API key
                const testSpinner = ora('🧪 Menguji API key...').start();
                
                aiService.setApiKey(apiKey.trim());
                
                try {
                    await aiService.loadModels();
                    testSpinner.succeed('✅ API key valid dan berhasil dikonfigurasi!');
                    
                    console.log(boxen(
                        chalk.green.bold('🎉 KONFIGURASI BERHASIL!\n\n') +
                        chalk.white('API key telah disimpan dan siap digunakan.\n') +
                        chalk.blue('Anda sekarang dapat menggunakan semua fitur AI!'),
                        {
                            padding: 1,
                            borderStyle: 'round',
                            borderColor: 'green'
                        }
                    ));
                    
                    break;
                } catch (error) {
                    testSpinner.fail('❌ API key tidak valid');
                    console.log(chalk.red(`Error: ${error.message}`));
                    console.log(chalk.yellow('💡 Silakan periksa API key Anda dan coba lagi\n'));
                }
            } catch (error) {
                console.log(chalk.red(`❌ Error: ${error.message}`));
            }
        }
    }

    /**
     * Display project info
     */
    displayProjectInfo() {
        const status = aiService.getProjectStatus();
        
        const info = boxen(
            chalk.blue('📊 Informasi Project:') + '\n\n' +
            chalk.white(`🤖 Model: ${chalk.green(status.currentModel)}`) + '\n' +
            chalk.white(`📂 Direktori: ${chalk.cyan(status.currentDirectory)}`) + '\n' +
            chalk.white(`📁 File kode: ${chalk.yellow(status.filesCount)} file`) + '\n' +
            chalk.white(`🔑 API Key: ${status.apiKeyConfigured ? chalk.green('✅ Dikonfigurasi') : chalk.red('❌ Belum dikonfigurasi')}`) + '\n' +
            chalk.white(`💾 Project: ${status.loaded ? chalk.green('✅ Dimuat') : chalk.red('❌ Belum dimuat')}`),
            {
                padding: 1,
                borderStyle: 'round',
                borderColor: 'blue'
            }
        );

        console.log(info);
    }

    /**
     * Handle user input
     */
    async handleInput(input) {
        if (!input) {
            this.rl.prompt();
            return;
        }

        // Check for exit commands
        if (['exit', 'quit', 'q'].includes(input.toLowerCase())) {
            this.shutdown();
            return;
        }

        try {
            // Process command
            const response = await commandProcessor.processCommand(input);
            
            if (response) {
                console.log(`\n🤖 ${chalk.cyan('Assistant:')} ${response}\n`);
            }
            
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
        }

        this.rl.prompt();
    }

    /**
     * Start the application
     */
    async start() {
        this.running = true;
        
        // Clear screen and show banner
        console.clear();
        this.displayBanner();

        // Initialize
        const initialized = await this.initialize();
        if (!initialized) {
            console.log(chalk.red('\n❌ Gagal menginisialisasi aplikasi. Keluar...'));
            process.exit(1);
        }

        // Show project info
        this.displayProjectInfo();

        // Show ready message
        console.log(chalk.green('\n🎉 AI Code Assistant siap digunakan!\n'));

        // Start interactive session
        this.rl.prompt();
    }

    /**
     * Shutdown application
     */
    shutdown() {
        if (!this.running) {
            return;
        }

        this.running = false;
        
        console.log(chalk.yellow('\n👋 Sampai jumpa! Terima kasih telah menggunakan AI Code Assistant.'));
        
        if (this.rl) {
            this.rl.close();
        }
        
        process.exit(0);
    }

    /**
     * Handle process signals
     */
    handleSignals() {
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
        process.on('uncaughtException', (error) => {
            console.error(chalk.red(`\n💥 Uncaught Exception: ${error.message}`));
            this.shutdown();
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error(chalk.red(`\n💥 Unhandled Rejection at: ${promise}, reason: ${reason}`));
        });
    }

    /**
     * Display error in a nice format
     */
    displayError(error) {
        const errorBox = boxen(
            chalk.red('💥 ERROR') + '\n\n' +
            chalk.white(error.message) + '\n\n' +
            chalk.gray('Stack trace:') + '\n' +
            chalk.gray(error.stack || 'No stack trace available'),
            {
                padding: 1,
                borderStyle: 'round',
                borderColor: 'red'
            }
        );

        console.log(errorBox);
    }

    /**
     * Set custom prompt
     */
    setPrompt(prompt) {
        this.currentPrompt = prompt;
        if (this.rl) {
            this.rl.setPrompt(prompt);
        }
    }

    /**
     * Show loading spinner with custom message
     */
    showLoading(message) {
        return ora(message).start();
    }

    /**
     * Display success message
     */
    displaySuccess(message) {
        console.log(chalk.green(`✅ ${message}`));
    }

    /**
     * Display warning message
     */
    displayWarning(message) {
        console.log(chalk.yellow(`⚠️ ${message}`));
    }

    /**
     * Display info message
     */
    displayInfo(message) {
        console.log(chalk.blue(`ℹ️ ${message}`));
    }

    /**
     * Ask user for confirmation
     */
    async askConfirmation(question) {
        return new Promise((resolve) => {
            this.rl.question(chalk.yellow(`❓ ${question} (y/n): `), (answer) => {
                resolve(['y', 'yes', 'ya'].includes(answer.toLowerCase()));
            });
        });
    }

    /**
     * Get user input
     */
    async getUserInput(question) {
        return new Promise((resolve) => {
            this.rl.question(chalk.cyan(`📝 ${question}: `), (answer) => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * Display formatted table
     */
    displayTable(headers, rows) {
        // Simple table display
        const colWidths = headers.map((header, i) => 
            Math.max(header.length, ...rows.map(row => (row[i] || '').toString().length))
        );

        // Header
        console.log(chalk.blue(
            headers.map((header, i) => header.padEnd(colWidths[i])).join(' | ')
        ));
        
        // Separator
        console.log(chalk.gray(
            colWidths.map(width => '-'.repeat(width)).join('-+-')
        ));

        // Rows
        rows.forEach(row => {
            console.log(
                row.map((cell, i) => (cell || '').toString().padEnd(colWidths[i])).join(' | ')
            );
        });
    }

    /**
     * Display code with syntax highlighting (basic)
     */
    displayCode(code, language = 'javascript') {
        const lines = code.split('\n');
        
        console.log(chalk.blue(`\`\`\`${language}`));
        lines.forEach((line, index) => {
            const lineNumber = (index + 1).toString().padStart(3, ' ');
            console.log(chalk.gray(lineNumber) + ' | ' + line);
        });
        console.log(chalk.blue('```'));
    }

    /**
     * Get is running status
     */
    isRunning() {
        return this.running;
    }
}

export default AICodeAssistant;