import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import fileManager from '../utils/fileManager.js';

const execAsync = promisify(exec);

export class CommandExecutor {
    constructor() {
        this.commandHistory = [];
        this.safeCommands = new Set([
            'mkdir', 'touch', 'cp', 'mv', 'ls', 'cat', 'echo', 'pwd', 'find',
            'grep', 'head', 'tail', 'wc', 'sort', 'uniq', 'chmod', 'chown'
        ]);
        this.dangerousCommands = new Set([
            'rm', 'rmdir', 'dd', 'format', 'fdisk', 'mkfs', 'kill', 'killall',
            'shutdown', 'reboot', 'halt', 'init', 'service', 'systemctl'
        ]);
    }

    /**
     * Parse AI response untuk mengekstrak perintah yang harus dijalankan
     */
    parseAICommands(aiResponse) {
        const commands = [];
        const lines = aiResponse.split('\n');
        
        for (let line of lines) {
            // Cari pattern untuk terminal commands
            const bashPattern = /```bash\s*([\s\S]*?)```/g;
            const shellPattern = /```shell\s*([\s\S]*?)```/g;
            const commandPattern = /```\s*([\s\S]*?)```/g;
            
            let match;
            
            // Extract dari bash blocks
            while ((match = bashPattern.exec(line)) !== null) {
                const commandBlock = match[1].trim();
                const individualCommands = commandBlock.split('\n')
                    .map(cmd => cmd.trim())
                    .filter(cmd => cmd && !cmd.startsWith('#'))
                    .map(cmd => cmd.replace(/^\$\s*/, '')); // Remove $ prefix
                
                commands.push(...individualCommands);
            }
            
            // Extract dari shell blocks
            while ((match = shellPattern.exec(line)) !== null) {
                const commandBlock = match[1].trim();
                const individualCommands = commandBlock.split('\n')
                    .map(cmd => cmd.trim())
                    .filter(cmd => cmd && !cmd.startsWith('#'))
                    .map(cmd => cmd.replace(/^\$\s*/, ''));
                
                commands.push(...individualCommands);
            }
            
            // Extract perintah yang dimulai dengan keyword tertentu
            if (line.includes('mkdir ') || line.includes('touch ') || 
                line.includes('echo ') || line.includes('cp ') ||
                line.includes('mv ') || line.includes('cat ')) {
                const commandMatch = line.match(/(?:mkdir|touch|echo|cp|mv|cat)\s+[^\s]+(?:\s+[^\s]+)*/);
                if (commandMatch) {
                    commands.push(commandMatch[0]);
                }
            }
        }
        
        return [...new Set(commands)]; // Remove duplicates
    }

    /**
     * Analisis tingkat keamanan perintah
     */
    analyzeCommandSafety(command) {
        const baseCommand = command.split(' ')[0];
        
        if (this.dangerousCommands.has(baseCommand)) {
            return {
                level: 'dangerous',
                message: '⚠️ Perintah berbahaya yang dapat merusak sistem',
                color: 'red'
            };
        }
        
        if (this.safeCommands.has(baseCommand)) {
            return {
                level: 'safe',
                message: '✅ Perintah aman untuk dijalankan',
                color: 'green'
            };
        }
        
        return {
            level: 'unknown',
            message: '❓ Perintah tidak dikenal, perlu perhatian',
            color: 'yellow'
        };
    }

    /**
     * Tampilkan preview perintah yang akan dijalankan
     */
    displayCommandPreview(commands) {
        if (commands.length === 0) {
            return;
        }

        console.log(boxen(
            chalk.cyan.bold('🔍 PERINTAH YANG AKAN DIJALANKAN\n') +
            commands.map((cmd, index) => {
                const safety = this.analyzeCommandSafety(cmd);
                const safetyIcon = safety.level === 'safe' ? '✅' : 
                                 safety.level === 'dangerous' ? '⚠️' : '❓';
                
                return `${index + 1}. ${safetyIcon} ${chalk.white(cmd)}
   ${chalk.gray('└─')} ${chalk[safety.color](safety.message)}`;
            }).join('\n\n'),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'cyan',
                title: '🤖 AI Command Executor',
                titleAlignment: 'center'
            }
        ));
    }

    /**
     * Eksekusi perintah dengan konfirmasi
     */
    async executeCommands(commands, autoExecute = false) {
        if (commands.length === 0) {
            console.log(chalk.yellow('📝 Tidak ada perintah yang dapat dieksekusi dari respons AI'));
            return;
        }

        this.displayCommandPreview(commands);

        // Filter perintah berbahaya
        const dangerousCommands = commands.filter(cmd => 
            this.analyzeCommandSafety(cmd).level === 'dangerous'
        );

        if (dangerousCommands.length > 0 && !autoExecute) {
            console.log(boxen(
                chalk.red.bold('⚠️ PERINGATAN KEAMANAN\n\n') +
                chalk.yellow('Ditemukan perintah berbahaya yang dapat merusak sistem:\n\n') +
                dangerousCommands.map(cmd => `• ${cmd}`).join('\n') + '\n\n' +
                chalk.white('Perintah ini TIDAK akan dijalankan untuk keamanan Anda.'),
                {
                    padding: 1,
                    borderStyle: 'double',
                    borderColor: 'red'
                }
            ));
            
            // Filter out dangerous commands
            commands = commands.filter(cmd => 
                this.analyzeCommandSafety(cmd).level !== 'dangerous'
            );
        }

        if (commands.length === 0) {
            return;
        }

        if (!autoExecute) {
            const readline = await import('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                rl.question(chalk.yellow('❓ Jalankan perintah-perintah di atas? (y/n): '), resolve);
            });
            rl.close();

            if (!['y', 'yes', 'ya'].includes(answer.toLowerCase())) {
                console.log(chalk.gray('❌ Eksekusi dibatalkan oleh user'));
                return;
            }
        }

        // Eksekusi perintah satu per satu
        const results = [];
        
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const spinner = ora(`🔄 Menjalankan: ${chalk.cyan(command)}`).start();
            
            try {
                const result = await this.executeSingleCommand(command);
                spinner.succeed(`✅ Berhasil: ${chalk.green(command)}`);
                
                if (result.stdout) {
                    console.log(chalk.gray('📤 Output:'));
                    console.log(chalk.white(result.stdout));
                }
                
                results.push({
                    command,
                    success: true,
                    output: result.stdout,
                    error: null
                });
                
                this.commandHistory.push({
                    command,
                    timestamp: new Date(),
                    success: true
                });

            } catch (error) {
                spinner.fail(`❌ Gagal: ${chalk.red(command)}`);
                console.log(chalk.red(`   Error: ${error.message}`));
                
                results.push({
                    command,
                    success: false,
                    output: null,
                    error: error.message
                });
                
                this.commandHistory.push({
                    command,
                    timestamp: new Date(),
                    success: false,
                    error: error.message
                });
            }
            
            // Delay kecil antar perintah
            if (i < commands.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        this.displayExecutionSummary(results);
        return results;
    }

    /**
     * Eksekusi perintah tunggal
     */
    async executeSingleCommand(command) {
        // Special handling untuk operasi file menggunakan fileManager
        const parts = command.trim().split(/\s+/);
        const baseCommand = parts[0];

        try {
            switch (baseCommand) {
                case 'mkdir':
                    if (parts.length >= 2) {
                        const success = await fileManager.createDirectory(parts[1]);
                        return { stdout: success ? `Directory ${parts[1]} created` : '', stderr: '' };
                    }
                    break;
                    
                case 'touch':
                    if (parts.length >= 2) {
                        const success = await fileManager.createFile(parts[1]);
                        return { stdout: success ? `File ${parts[1]} created` : '', stderr: '' };
                    }
                    break;
                    
                case 'cp':
                    if (parts.length >= 3) {
                        const success = await fileManager.copyFile(parts[1], parts[2]);
                        return { stdout: success ? `Copied ${parts[1]} to ${parts[2]}` : '', stderr: '' };
                    }
                    break;
                    
                case 'mv':
                    if (parts.length >= 3) {
                        const success = await fileManager.moveFile(parts[1], parts[2]);
                        return { stdout: success ? `Moved ${parts[1]} to ${parts[2]}` : '', stderr: '' };
                    }
                    break;
                    
                default:
                    // Untuk perintah lain, gunakan exec
                    const result = await execAsync(command, { 
                        timeout: 30000,
                        maxBuffer: 1024 * 1024 // 1MB buffer
                    });
                    return result;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Tampilkan ringkasan eksekusi
     */
    displayExecutionSummary(results) {
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        const summaryColor = failed === 0 ? 'green' : failed < successful ? 'yellow' : 'red';
        const summaryIcon = failed === 0 ? '🎉' : failed < successful ? '⚠️' : '❌';
        
        console.log(boxen(
            `${summaryIcon} ${chalk[summaryColor].bold('RINGKASAN EKSEKUSI')}\n\n` +
            `✅ Berhasil: ${chalk.green(successful)} perintah\n` +
            `❌ Gagal: ${chalk.red(failed)} perintah\n` +
            `📊 Total: ${chalk.blue(results.length)} perintah`,
            {
                padding: 1,
                borderStyle: 'round',
                borderColor: summaryColor,
                margin: 1
            }
        ));

        if (failed > 0) {
            const failedCommands = results.filter(r => !r.success);
            console.log(chalk.red('\n📋 Perintah yang gagal:'));
            failedCommands.forEach(result => {
                console.log(chalk.red(`   • ${result.command}`));
                console.log(chalk.gray(`     └─ ${result.error}`));
            });
        }
    }

    /**
     * Ekstrak intent dari prompt natural language
     */
    extractCommandIntent(prompt) {
        const intents = [];
        
        // File creation intents
        if (prompt.match(/buat|create|bikin.*?(file|folder|direktori|directory)/i)) {
            intents.push('create_file');
        }
        
        // File manipulation intents
        if (prompt.match(/pindah|move|mv.*?(file|folder)/i)) {
            intents.push('move_file');
        }
        
        if (prompt.match(/copy|salin|cp.*?(file|folder)/i)) {
            intents.push('copy_file');
        }
        
        if (prompt.match(/hapus|delete|remove|rm.*?(file|folder)/i)) {
            intents.push('delete_file');
        }
        
        // Code modification intents
        if (prompt.match(/ubah|edit|modify|change.*?(code|kode|file)/i)) {
            intents.push('modify_code');
        }
        
        // Installation intents
        if (prompt.match(/install|pasang.*?(package|npm|yarn)/i)) {
            intents.push('install_package');
        }

        return intents;
    }

    /**
     * Generate contextual commands based on intent
     */
    generateContextualCommands(prompt, intents) {
        const commands = [];
        
        // Extract file/folder names dari berbagai pattern
        let fileName = 'new-file';
        let source = '';
        let destination = '';
        
        // Pattern untuk nama file/folder
        const patterns = [
            /(?:file|folder|direktori|directory)\s+['""]?([^'"".\s]+(?:\.[a-z]+)?)['""]?/i,
            /(?:buat|create|bikin)\s+(?:file|folder|direktori|directory)?\s*['""]?([^'"".\s]+(?:\.[a-z]+)?)['""]?/i,
            /['""]([^'"".\s]+(?:\.[a-z]+)?)['""]/, // Quoted names
            /\b([a-zA-Z0-9_-]+\.(?:js|ts|jsx|tsx|py|java|cpp|c|php|rb|go|rs|html|css|json|md|txt))\b/i, // File extensions
            /\b([a-zA-Z0-9_-]+)\s*(?:folder|direktori|directory)/i // Folder names
        ];
        
        for (const pattern of patterns) {
            const match = prompt.match(pattern);
            if (match) {
                fileName = match[1].trim();
                break;
            }
        }
        
        // Pattern untuk copy/move operations
        const copyPattern = /(?:copy|salin|cp)\s+['""]?([^'"".\s]+(?:\.[a-z]+)?)['""]?\s+(?:ke|to)\s+['""]?([^'"".\s]+)['""]?/i;
        const movePattern = /(?:move|mv|pindah)\s+['""]?([^'"".\s]+(?:\.[a-z]+)?)['""]?\s+(?:ke|to)\s+['""]?([^'"".\s]+)['""]?/i;
        
        const copyMatch = prompt.match(copyPattern);
        const moveMatch = prompt.match(movePattern);
        
        if (copyMatch) {
            source = copyMatch[1];
            destination = copyMatch[2];
            commands.push(`cp ${source} ${destination}`);
        } else if (moveMatch) {
            source = moveMatch[1];
            destination = moveMatch[2];
            commands.push(`mv ${source} ${destination}`);
        }
        
        // Pattern untuk instalasi package
        const installPattern = /(?:install|pasang)\s+([a-zA-Z0-9@_-]+(?:\s+[a-zA-Z0-9@_-]+)*)/i;
        const installMatch = prompt.match(installPattern);
        
        if (installMatch && intents.includes('install_package')) {
            const packages = installMatch[1];
            if (prompt.match(/npm/i)) {
                commands.push(`npm install ${packages}`);
            } else if (prompt.match(/yarn/i)) {
                commands.push(`yarn add ${packages}`);
            } else {
                commands.push(`npm install ${packages}`); // Default to npm
            }
        }
        
        // Create file/folder commands
        if (intents.includes('create_file')) {
            if (prompt.match(/folder|direktori|directory/i)) {
                commands.push(`mkdir ${fileName}`);
                
                // Jika ada path dengan struktur folder
                const pathMatch = prompt.match(/(?:di|in|dalam)\s+([a-zA-Z0-9/_-]+)/i);
                if (pathMatch) {
                    const path = pathMatch[1];
                    commands.unshift(`mkdir -p ${path}`); // Create parent directories first
                    commands.push(`mkdir ${path}/${fileName}`);
                    commands.splice(1, 1); // Remove the simple mkdir
                }
            } else {
                // Create file
                commands.push(`touch ${fileName}`);
                
                // Jika ada path dengan struktur folder
                const pathMatch = prompt.match(/(?:di|in|dalam)\s+([a-zA-Z0-9/_-]+)/i);
                if (pathMatch) {
                    const path = pathMatch[1];
                    commands.unshift(`mkdir -p ${path}`);
                    commands.push(`touch ${path}/${fileName}`);
                    commands.splice(1, 1); // Remove the simple touch
                }
            }
        }
        
        // List/show commands
        if (prompt.match(/(?:list|tampilkan|show)\s+(?:file|folder|direktori)/i)) {
            commands.push('ls -la');
        }
        
        // Delete commands (dengan konfirmasi extra)
        if (intents.includes('delete_file') && fileName !== 'new-file') {
            // Tidak otomatis generate delete command untuk keamanan
            // Biarkan AI yang memberikan saran
        }
        
        return commands.filter(cmd => cmd.trim().length > 0);
    }

    /**
     * Get command history
     */
    getHistory() {
        return this.commandHistory;
    }

    /**
     * Clear command history
     */
    clearHistory() {
        this.commandHistory = [];
    }

    /**
     * Display command history
     */
    displayHistory() {
        if (this.commandHistory.length === 0) {
            console.log(chalk.yellow('📝 Tidak ada history perintah'));
            return;
        }

        console.log(boxen(
            chalk.blue.bold('📚 HISTORY PERINTAH\n\n') +
            this.commandHistory.slice(-10).map((entry, index) => {
                const icon = entry.success ? '✅' : '❌';
                const time = entry.timestamp.toLocaleTimeString();
                return `${index + 1}. ${icon} ${chalk.white(entry.command)} ${chalk.gray(`(${time})`)}`;
            }).join('\n'),
            {
                padding: 1,
                borderStyle: 'round',
                borderColor: 'blue',
                title: '📋 Command History',
                titleAlignment: 'center'
            }
        ));
    }
}

export default new CommandExecutor();