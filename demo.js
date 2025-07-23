#!/usr/bin/env node

import chalk from 'chalk';
import boxen from 'boxen';

console.log(boxen(
    chalk.cyan.bold('🚀 AI CODE ASSISTANT - DEMO FITUR BARU\n\n') +
    chalk.yellow('Mode Natural Language Commands telah ditambahkan!\n\n') +
    
    chalk.green('✨ Fitur Utama:\n') +
    chalk.white('• Gunakan prefix ') + chalk.cyan('/do') + chalk.white(' untuk eksekusi otomatis\n') +
    chalk.white('• AI akan mengkonversi natural language ke terminal commands\n') +
    chalk.white('• Preview dan konfirmasi sebelum eksekusi\n') +
    chalk.white('• Sistem keamanan untuk mencegah perintah berbahaya\n\n') +
    
    chalk.blue('🎯 Contoh Penggunaan:\n') +
    chalk.gray('┌─ Input natural language:') + '\n' +
    chalk.white('│  ') + chalk.cyan('/do buat folder components') + '\n' +
    chalk.gray('├─ AI mengkonversi ke:') + '\n' +
    chalk.white('│  ') + chalk.green('mkdir components') + '\n' +
    chalk.gray('└─ Eksekusi otomatis dengan konfirmasi') + '\n\n' +
    
    chalk.magenta('🎨 Template Commands:\n') +
    chalk.white('• ') + chalk.cyan('/do buat file index.js') + '\n' +
    chalk.white('• ') + chalk.cyan('/do copy package.json ke backup/') + '\n' +
    chalk.white('• ') + chalk.cyan('/do install express dengan npm') + '\n' +
    chalk.white('• ') + chalk.cyan('/do buat folder src/components') + '\n\n' +
    
    chalk.red('⚠️ Keamanan:\n') +
    chalk.white('• Perintah berbahaya secara otomatis diblokir\n') +
    chalk.white('• User confirmation untuk setiap eksekusi\n') +
    chalk.white('• Command history untuk tracking\n\n') +
    
    chalk.blue('🚀 Untuk memulai: ') + chalk.green('npm start'),
    {
        padding: 2,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
    }
));

console.log(chalk.yellow('\n💡 Tips:'));
console.log(chalk.white('• Ketik "help" di dalam aplikasi untuk bantuan lengkap'));
console.log(chalk.white('• Gunakan bahasa Indonesia yang natural'));
console.log(chalk.white('• Review perintah sebelum konfirmasi eksekusi'));
console.log(chalk.white('• Gunakan "cmd-history" untuk melihat riwayat eksekusi\n'));

// Demo examples
console.log(boxen(
    chalk.cyan.bold('📚 CONTOH COMMANDS YANG DIDUKUNG\n\n') +
    
    chalk.yellow('📁 File & Folder Operations:\n') +
    chalk.gray('• ') + chalk.white('/do buat folder components') + '\n' +
    chalk.gray('• ') + chalk.white('/do buat file App.js di src') + '\n' +
    chalk.gray('• ') + chalk.white('/do copy config.js ke backup/') + '\n' +
    chalk.gray('• ') + chalk.white('/do pindahkan old-file.js ke archive/') + '\n\n' +
    
    chalk.yellow('📦 Package Management:\n') +
    chalk.gray('• ') + chalk.white('/do install react react-dom') + '\n' +
    chalk.gray('• ') + chalk.white('/do pasang typescript dengan yarn') + '\n' +
    chalk.gray('• ') + chalk.white('/do install express nodemon --save-dev') + '\n\n' +
    
    chalk.yellow('🔍 Information & Navigation:\n') +
    chalk.gray('• ') + chalk.white('/do tampilkan semua file') + '\n' +
    chalk.gray('• ') + chalk.white('/do cari file dengan nama config') + '\n' +
    chalk.gray('• ') + chalk.white('/do show current directory') + '\n\n' +
    
    chalk.yellow('🎯 Advanced Operations:\n') +
    chalk.gray('• ') + chalk.white('/do setup project struktur untuk React') + '\n' +
    chalk.gray('• ') + chalk.white('/do buat komponen Header di components/') + '\n' +
    chalk.gray('• ') + chalk.white('/do backup semua file javascript') + '\n',
    {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'blue'
    }
));

console.log(chalk.green('\n🎉 Selamat mencoba fitur Natural Language Commands!'));
console.log(chalk.blue('🚀 Jalankan: ') + chalk.cyan('npm start') + chalk.blue(' untuk memulai\n'));