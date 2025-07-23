#!/usr/bin/env node

import chalk from 'chalk';
import boxen from 'boxen';

console.log(boxen(
    chalk.cyan.bold('🔑 DEMO: SETUP API KEY OTOMATIS\n\n') +
    chalk.yellow('AI Code Assistant sekarang akan meminta API key saat pertama kali dijalankan!\n\n') +
    
    chalk.green('✨ Fitur Setup API Key:\n') +
    chalk.white('• ') + chalk.cyan('Otomatis') + chalk.white(' meminta API key saat pertama kali run\n') +
    chalk.white('• ') + chalk.cyan('Validasi') + chalk.white(' API key dengan test connection\n') +
    chalk.white('• ') + chalk.cyan('Penyimpanan') + chalk.white(' aman di konfigurasi lokal\n') +
    chalk.white('• ') + chalk.cyan('Command') + chalk.white(' untuk mengubah API key kapan saja\n\n') +
    
    chalk.blue('🎯 Proses Setup:\n') +
    chalk.gray('1. Aplikasi deteksi API key belum dikonfigurasi\n') +
    chalk.gray('2. Tampilkan panduan mendapatkan API key\n') +
    chalk.gray('3. Input API key dari user\n') +
    chalk.gray('4. Test validitas API key\n') +
    chalk.gray('5. Simpan jika valid, ulangi jika tidak\n\n') +
    
    chalk.magenta('🔧 Command yang tersedia:\n') +
    chalk.white('• ') + chalk.cyan('setup-api') + chalk.white(' - Setup/ubah API key\n') +
    chalk.white('• ') + chalk.cyan('api-key') + chalk.white(' - Alias untuk setup-api\n') +
    chalk.white('• ') + chalk.cyan('config') + chalk.white(' - Tampilkan opsi konfigurasi\n') +
    chalk.white('• ') + chalk.cyan('config status') + chalk.white(' - Status konfigurasi\n\n') +
    
    chalk.red('🛡️ Keamanan:\n') +
    chalk.white('• API key disimpan di file konfigurasi lokal\n') +
    chalk.white('• Validasi panjang minimum API key\n') +
    chalk.white('• Test connection sebelum menyimpan\n') +
    chalk.white('• Tidak pernah menampilkan API key di console\n\n') +
    
    chalk.blue('🚀 Demo: ') + chalk.green('npm start'),
    {
        padding: 2,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
    }
));

console.log(boxen(
    chalk.cyan.bold('📋 LANGKAH MENDAPATKAN API KEY\n\n') +
    
    chalk.yellow('1. 🌐 Daftar Account:\n') +
    chalk.white('   • Buka ') + chalk.cyan('https://inference.do-ai.run/') + '\n' +
    chalk.white('   • Klik "Sign Up" untuk daftar account baru\n') +
    chalk.white('   • Atau "Sign In" jika sudah punya account\n\n') +
    
    chalk.yellow('2. 🔑 Dapatkan API Key:\n') +
    chalk.white('   • Login ke dashboard\n') +
    chalk.white('   • Cari menu "API Keys" atau "Settings"\n') +
    chalk.white('   • Generate API key baru\n') +
    chalk.white('   • Copy API key yang dihasilkan\n\n') +
    
    chalk.yellow('3. ⚙️ Setup di Aplikasi:\n') +
    chalk.white('   • Jalankan ') + chalk.cyan('npm start') + '\n' +
    chalk.white('   • Paste API key saat diminta\n') +
    chalk.white('   • Aplikasi akan test dan menyimpan otomatis\n\n') +
    
    chalk.yellow('4. 🎉 Siap Digunakan:\n') +
    chalk.white('   • Semua fitur AI sudah dapat digunakan\n') +
    chalk.white('   • API key tersimpan untuk sesi selanjutnya\n') +
    chalk.white('   • Gunakan ') + chalk.cyan('setup-api') + chalk.white(' untuk mengubah jika perlu'),
    {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'blue',
        title: '📖 Tutorial',
        titleAlignment: 'center'
    }
));

console.log(boxen(
    chalk.cyan.bold('💡 CONTOH FLOW APLIKASI\n\n') +
    
    chalk.gray('$ npm start\n\n') +
    
    chalk.yellow('╭─────────────────────────────────────╮\n') +
    chalk.yellow('│  🔑 KONFIGURASI API KEY             │\n') +
    chalk.yellow('│                                     │\n') +
    chalk.yellow('│  Untuk menggunakan fitur AI, Anda   │\n') +
    chalk.yellow('│  perlu mengonfigurasi API key.      │\n') +
    chalk.yellow('│                                     │\n') +
    chalk.yellow('│  📋 Langkah-langkah:               │\n') +
    chalk.yellow('│  1. Daftar di inference.do-ai.run   │\n') +
    chalk.yellow('│  2. Dapatkan API key dari dashboard │\n') +
    chalk.yellow('│  3. Masukkan API key di bawah ini   │\n') +
    chalk.yellow('╰─────────────────────────────────────╯\n\n') +
    
    chalk.cyan('📝 Masukkan API key Anda: ') + chalk.gray('[user input]\n') +
    chalk.blue('🧪 Menguji API key...\n') +
    chalk.green('✅ API key valid dan berhasil dikonfigurasi!\n\n') +
    
    chalk.green('╭─────────────────────────────────────╮\n') +
    chalk.green('│  🎉 KONFIGURASI BERHASIL!           │\n') +
    chalk.green('│                                     │\n') +
    chalk.green('│  API key telah disimpan dan siap    │\n') +
    chalk.green('│  digunakan. Anda sekarang dapat     │\n') +
    chalk.green('│  menggunakan semua fitur AI!        │\n') +
    chalk.green('╰─────────────────────────────────────╯'),
    {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'green',
        title: '📱 Demo Flow',
        titleAlignment: 'center'
    }
));

console.log(chalk.yellow('\n💡 Tips Penting:'));
console.log(chalk.white('• API key hanya diminta sekali saat pertama kali'));
console.log(chalk.white('• Gunakan "setup-api" untuk mengubah API key'));
console.log(chalk.white('• API key disimpan aman di ~/.ai-assistant-config.json'));
console.log(chalk.white('• Jangan share API key dengan orang lain'));

console.log(chalk.green('\n🎉 Coba sekarang!'));
console.log(chalk.blue('🚀 Jalankan: ') + chalk.cyan('npm start') + chalk.blue(' untuk memulai setup\n'));