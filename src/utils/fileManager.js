import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import config from '../config/config.js';

export class FileManager {
    constructor() {
        this.supportedExtensions = config.getSupportedExtensions();
        this.ignoreDirs = config.getIgnoreDirs();
        this.ignoreFiles = config.getIgnoreFiles();
        this.maxFileSize = config.getMaxFileSize();
    }

    /**
     * Pindahkan file atau direktori
     * @param {string} src - Source path
     * @param {string} dst - Destination path
     * @returns {Promise<boolean>}
     */
    async moveFile(src, dst) {
        try {
            await fs.move(src, dst);
            console.log(chalk.green(`✅ Berhasil memindahkan ${src} ke ${dst}`));
            return true;
        } catch (error) {
            console.error(chalk.red(`❌ Gagal memindahkan ${src} ke ${dst}: ${error.message}`));
            return false;
        }
    }

    /**
     * Salin file atau direktori
     * @param {string} src - Source path
     * @param {string} dst - Destination path
     * @returns {Promise<boolean>}
     */
    async copyFile(src, dst) {
        try {
            await fs.copy(src, dst);
            console.log(chalk.green(`✅ Berhasil menyalin ${src} ke ${dst}`));
            return true;
        } catch (error) {
            console.error(chalk.red(`❌ Gagal menyalin ${src} ke ${dst}: ${error.message}`));
            return false;
        }
    }

    /**
     * Hapus file atau direktori
     * @param {string} filePath - Path to delete
     * @returns {Promise<boolean>}
     */
    async deleteFile(filePath) {
        try {
            // Safety check untuk operasi berbahaya
            const dangerousPaths = ['*', '.', '..', '/', process.cwd()];
            if (dangerousPaths.includes(filePath)) {
                console.error(chalk.red('❌ Operasi tidak aman ditolak'));
                return false;
            }

            await fs.remove(filePath);
            console.log(chalk.green(`✅ Berhasil menghapus ${filePath}`));
            return true;
        } catch (error) {
            console.error(chalk.red(`❌ Gagal menghapus ${filePath}: ${error.message}`));
            return false;
        }
    }

    /**
     * Buat file baru dengan konten
     * @param {string} filePath - File path
     * @param {string} content - File content
     * @returns {Promise<boolean>}
     */
    async createFile(filePath, content = '') {
        try {
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, content, 'utf8');
            console.log(chalk.green(`✅ Berhasil membuat file ${filePath}`));
            return true;
        } catch (error) {
            console.error(chalk.red(`❌ Gagal membuat file ${filePath}: ${error.message}`));
            return false;
        }
    }

    /**
     * Buat direktori baru
     * @param {string} dirPath - Directory path
     * @returns {Promise<boolean>}
     */
    async createDirectory(dirPath) {
        try {
            await fs.ensureDir(dirPath);
            console.log(chalk.green(`✅ Berhasil membuat direktori ${dirPath}`));
            return true;
        } catch (error) {
            console.error(chalk.red(`❌ Gagal membuat direktori ${dirPath}: ${error.message}`));
            return false;
        }
    }

    /**
     * Baca konten file
     * @param {string} filePath - File path
     * @returns {Promise<string|null>}
     */
    async readFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return content;
        } catch (error) {
            console.error(chalk.red(`❌ Gagal membaca file ${filePath}: ${error.message}`));
            return null;
        }
    }

    /**
     * Tulis konten ke file
     * @param {string} filePath - File path
     * @param {string} content - Content to write
     * @returns {Promise<boolean>}
     */
    async writeFile(filePath, content) {
        try {
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, content, 'utf8');
            return true;
        } catch (error) {
            console.error(chalk.red(`❌ Gagal menulis file ${filePath}: ${error.message}`));
            return false;
        }
    }

    /**
     * Cek apakah file/direktori ada
     * @param {string} filePath - Path to check
     * @returns {Promise<boolean>}
     */
    async exists(filePath) {
        try {
            return await fs.pathExists(filePath);
        } catch (error) {
            return false;
        }
    }

    /**
     * Dapatkan informasi file
     * @param {string} filePath - File path
     * @returns {Promise<object|null>}
     */
    async getFileInfo(filePath) {
        try {
            const stats = await fs.stat(filePath);
            const ext = path.extname(filePath);
            
            return {
                path: filePath,
                name: path.basename(filePath),
                extension: ext,
                language: this.supportedExtensions[ext] || 'unknown',
                size: stats.size,
                isDirectory: stats.isDirectory(),
                isFile: stats.isFile(),
                modified: stats.mtime,
                created: stats.birthtime
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Scan project untuk mencari file kode
     * @param {string} rootDir - Root directory to scan
     * @returns {Promise<object>}
     */
    async scanProject(rootDir = process.cwd()) {
        const filesData = {};
        const extensions = Object.keys(this.supportedExtensions);
        
        try {
            // Buat pattern untuk glob
            const patterns = extensions.map(ext => `**/*${ext}`);
            
            for (const pattern of patterns) {
                const files = await glob(pattern, {
                    cwd: rootDir,
                    ignore: this._getIgnorePatterns(),
                    absolute: true
                });
                
                for (const filePath of files) {
                    const relativePath = path.relative(rootDir, filePath);
                    
                    // Skip jika file dalam ignore list
                    if (this._shouldIgnoreFile(relativePath)) {
                        continue;
                    }
                    
                    try {
                        const content = await fs.readFile(filePath, 'utf8');
                        
                        // Skip file yang terlalu besar atau kosong
                        if (content.trim().length === 0 || content.length > this.maxFileSize) {
                            continue;
                        }
                        
                        const ext = path.extname(filePath);
                        const lines = content.split('\n');
                        
                        filesData[relativePath] = {
                            content,
                            language: this.supportedExtensions[ext],
                            size: content.length,
                            lines: lines.length,
                            absolutePath: filePath
                        };
                        
                    } catch (error) {
                        // Skip file yang tidak bisa dibaca
                        continue;
                    }
                }
            }
            
            return filesData;
        } catch (error) {
            console.error(chalk.red(`❌ Gagal memindai project: ${error.message}`));
            return {};
        }
    }

    /**
     * Cari file berdasarkan pattern
     * @param {string} pattern - Search pattern
     * @param {string} rootDir - Root directory
     * @returns {Promise<string[]>}
     */
    async findFiles(pattern, rootDir = process.cwd()) {
        try {
            const files = await glob(pattern, {
                cwd: rootDir,
                ignore: this._getIgnorePatterns()
            });
            
            return files.filter(file => !this._shouldIgnoreFile(file));
        } catch (error) {
            console.error(chalk.red(`❌ Gagal mencari file: ${error.message}`));
            return [];
        }
    }

    /**
     * Buat backup file
     * @param {string} filePath - File to backup
     * @returns {Promise<string|null>}
     */
    async createBackup(filePath) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `${filePath}.backup.${timestamp}`;
            
            await this.copyFile(filePath, backupPath);
            return backupPath;
        } catch (error) {
            console.error(chalk.red(`❌ Gagal membuat backup: ${error.message}`));
            return null;
        }
    }

    /**
     * Dapatkan pola ignore untuk glob
     * @returns {string[]}
     */
    _getIgnorePatterns() {
        const patterns = [];
        
        // Tambahkan direktori yang diabaikan
        for (const dir of this.ignoreDirs) {
            patterns.push(`**/${dir}/**`);
            patterns.push(`${dir}/**`);
        }
        
        // Tambahkan file yang diabaikan
        for (const file of this.ignoreFiles) {
            patterns.push(`**/${file}`);
            patterns.push(file);
        }
        
        return patterns;
    }

    /**
     * Cek apakah file harus diabaikan
     * @param {string} filePath - File path to check
     * @returns {boolean}
     */
    _shouldIgnoreFile(filePath) {
        const fileName = path.basename(filePath);
        const pathParts = filePath.split(path.sep);
        
        // Cek apakah file dalam ignore list
        if (this.ignoreFiles.has(fileName)) {
            return true;
        }
        
        // Cek apakah ada direktori yang diabaikan dalam path
        for (const part of pathParts) {
            if (this.ignoreDirs.has(part)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Dapatkan daftar file dan direktori dalam direktori
     * @param {string} dirPath - Directory path
     * @returns {Promise<object[]>}
     */
    async listDirectory(dirPath = process.cwd()) {
        try {
            const items = await fs.readdir(dirPath);
            const result = [];
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const info = await this.getFileInfo(itemPath);
                
                if (info && !this._shouldIgnoreFile(item)) {
                    result.push(info);
                }
            }
            
            return result.sort((a, b) => {
                // Direktori di atas, lalu file
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
            });
            
        } catch (error) {
            console.error(chalk.red(`❌ Gagal membaca direktori ${dirPath}: ${error.message}`));
            return [];
        }
    }
}

export default new FileManager();