# 🚀 AI Code Assistant Indonesia

> **Asisten Kode AI dengan Kemampuan Mirip Gemini CLI**

AI Code Assistant adalah aplikasi command-line interface (CLI) yang canggih dan powerful untuk analisis, optimasi, dan manajemen kode. Dibangun dengan Node.js dan terinspirasi dari Gemini CLI, aplikasi ini menyediakan fitur-fitur AI terdepan untuk membantu developer dalam berbagai tugas pengembangan.

## ✨ Fitur Utama

### 🔍 **Analisis Kode Mendalam**
- Analisis struktur dan kualitas kode
- Deteksi potensi bug dan masalah keamanan
- Saran perbaikan berbasis best practices
- Code review otomatis dengan feedback detail

### 🐛 **Deteksi & Perbaikan Bug**
- Identifikasi bug secara otomatis
- Saran perbaikan dengan contoh kode
- Analisis error handling
- Validasi logic flow

### ⚡ **Optimasi Performa**
- Identifikasi bottleneck performa
- Saran optimasi algoritma
- Memory usage analysis
- Database query optimization

### 🧪 **Pembuatan Unit Test**
- Generate unit test otomatis
- Coverage analysis
- Mock dan stub generation
- Edge case identification

### 📚 **Dokumentasi Kode**
- Auto-generate documentation
- Code explanation
- API documentation
- Comment generation

### 🔄 **Refactoring Otomatis**
- Code restructuring
- Design pattern suggestions
- Clean code implementation
- Dependency management

### 📁 **Manajemen File Lengkap**
- File operations (move, copy, delete)
- Project scanning
- File search dan filtering
- Backup management

### 🚀 **Natural Language Commands (NEW!)**
- Eksekusi perintah terminal dengan bahasa natural
- AI mengkonversi instruksi ke terminal commands
- Preview dan konfirmasi sebelum eksekusi  
- Sistem keamanan untuk mencegah perintah berbahaya

## 🛠️ Instalasi

### Prasyarat
- Node.js >= 18.0.0
- npm atau yarn

### Instalasi Lokal
```bash
# Clone repository
git clone https://github.com/ai-code-assistant/ai-assistant.git
cd ai-assistant

# Install dependencies
npm install

# Jalankan aplikasi
npm start

# Lihat demo fitur baru
npm run demo
```

### Instalasi Global
```bash
# Install secara global
npm install -g .

# Jalankan dari mana saja
ai-assistant
```

### Instalasi via NPM (Jika sudah dipublish)
```bash
npm install -g ai-code-assistant
ai-assistant
```

## 🚀 Penggunaan

### Memulai Aplikasi
```bash
# Cara 1: Jalankan langsung
node index.js

# Cara 2: Menggunakan npm script
npm start

# Cara 3: Jika sudah install global
ai-assistant
```

### Konfigurasi API Key
Sebelum menggunakan fitur AI, konfigurasikan API key Anda:

```bash
# Di dalam aplikasi
config apiKey YOUR_API_KEY_HERE
```

## 📋 Perintah Utama

### 📁 **Operasi File**
```bash
# Manajemen file
mv <source> <destination>    # Pindahkan file/direktori
cp <source> <destination>    # Salin file/direktori
rm <path>                    # Hapus file/direktori
mkdir <directory>            # Buat direktori baru
touch <filename>             # Buat file kosong

# Navigasi
ls                          # List file dalam direktori
cd <directory>              # Pindah direktori
pwd                         # Tampilkan direktori saat ini
find <pattern>              # Cari file berdasarkan nama

# Utilitas
cat <filename>              # Tampilkan isi file
diff <file1> <file2>        # Bandingkan dua file
backup <filename>           # Buat backup file
```

### 🤖 **Perintah AI**
```bash
# Analisis kode
analyze                     # Analisis seluruh project
analyze <filename>          # Analisis file spesifik
review <filename>           # Code review untuk file
search <query>              # Cari dalam project

# Optimasi dan perbaikan
optimize                    # Saran optimasi project
optimize <filename>         # Optimasi file spesifik
fix <masalah>              # Perbaiki masalah spesifik
refactor <filename>         # Refactor file

# Testing dan dokumentasi
test <filename>             # Generate unit test
explain <filename>          # Jelaskan cara kerja kode
```

### 🚀 **Natural Language Commands**
```bash
# Mode eksekusi otomatis dengan prefix /do
/do buat folder components           # Buat folder
/do buat file index.js              # Buat file
/do copy package.json ke backup/    # Copy file
/do install express dengan npm      # Install package
/do pindahkan old.js ke archive/    # Move file
/do tampilkan semua file            # List files

# AI akan mengkonversi ke terminal commands yang aman
# Preview perintah sebelum eksekusi
# Konfirmasi user diperlukan
```

### 🔧 **Manajemen Model**
```bash
models                      # Tampilkan daftar model AI
model <nomor>              # Pilih model AI
status                     # Tampilkan status sistem
scan                       # Pindai ulang project
refresh                    # Refresh file cache
```

### 🔍 **Utilitas**
```bash
history                    # Tampilkan history perintah
help                       # Tampilkan bantuan
clear                      # Bersihkan layar
exit                       # Keluar dari aplikasi
```

## 💡 Contoh Penggunaan

### Analisis Project Baru
```bash
# 1. Masuk ke direktori project
cd /path/to/your/project

# 2. Scan project
scan

# 3. Analisis keseluruhan
analyze

# 4. Review file spesifik
review src/main.js
```

### Optimasi Performa
```bash
# Analisis performa
optimize

# Optimasi file spesifik
optimize src/utils/heavy-calculation.js

# Generate test untuk memvalidasi
test src/utils/heavy-calculation.js
```

### Refactoring Kode
```bash
# Refactor file yang kompleks
refactor src/legacy-code.js

# Jelaskan kode yang sudah direfactor
explain src/legacy-code.js

# Buat backup sebelum apply changes
backup src/legacy-code.js
```

### Natural Language Commands
```bash
# Setup project baru dengan struktur folder
/do buat project React dengan folder src dan components

# Install dependencies sekaligus
/do install react react-dom react-router-dom dengan npm

# Buat komponen dengan struktur lengkap
/do buat file Header.jsx di src/components dengan template

# Copy dan backup file konfigurasi
/do copy semua file config ke folder backup
```

## 🔧 Konfigurasi

### File Konfigurasi
Aplikasi menggunakan file konfigurasi di `~/.ai-assistant-config.json`:

```json
{
  "apiUrl": "https://inference.do-ai.run/v1/chat/completions",
  "apiKey": "your-api-key",
  "selectedModel": "llama3.3-70b-instruct",
  "maxTokens": 4000,
  "temperature": 0.1,
  "timeout": 60000
}
```

### Model AI Tersedia
- `llama3.3-70b-instruct`
- `anthropic-claude-3.5-sonnet`
- `openai-gpt-4o`
- `deepseek-r1-distill-llama-70b`
- `google-gemini-pro`
- `meta-llama-3.1-405b-instruct`

### File yang Didukung
- JavaScript (.js, .mjs, .cjs)
- TypeScript (.ts, .tsx)
- React (.jsx)
- Python (.py)
- Java (.java)
- C/C++ (.c, .cpp)
- PHP (.php)
- Ruby (.rb)
- Go (.go)
- Rust (.rs)
- HTML/CSS (.html, .css, .scss, .less)
- SQL (.sql)
- Shell (.sh)
- Config files (.json, .yaml, .yml, .xml)
- Documentation (.md, .txt)

## 🏗️ Arsitektur

```
ai-code-assistant/
├── src/
│   ├── config/
│   │   └── config.js          # Konfigurasi aplikasi
│   ├── services/
│   │   └── aiService.js       # Service untuk AI API
│   ├── utils/
│   │   └── fileManager.js     # Manajemen file system
│   ├── commands/
│   │   └── commandProcessor.js # Processor perintah
│   └── app.js                 # Main application class
├── bin/
│   └── cli.js                 # CLI executable
├── package.json
├── index.js                   # Entry point
└── README.md
```

### Komponen Utama

#### 🔧 **Config Manager**
- Manajemen konfigurasi aplikasi
- Penyimpanan API key dan settings
- Default configuration handling

#### 🤖 **AI Service**
- Integrasi dengan multiple AI models
- Context building untuk analisis kode
- Stream processing untuk respons panjang

#### 📁 **File Manager**
- Operasi file system yang aman
- Project scanning dan indexing
- Ignore patterns untuk file yang tidak diperlukan

#### 💻 **Command Processor**
- Parsing dan routing perintah
- Command history management
- Auto-completion support

#### 🎨 **UI Components**
- Beautiful CLI interface
- Progress indicators
- Formatted output dengan colors

## 🔒 Keamanan

### Fitur Keamanan
- ✅ Validasi input untuk mencegah injection
- ✅ Safe file operations dengan path validation
- ✅ API key encryption di konfigurasi
- ✅ Sandbox execution untuk operasi berbahaya
- ✅ Permission checks untuk file operations

### Best Practices
- Selalu backup file penting sebelum modifikasi
- Review saran AI sebelum implementasi
- Gunakan version control untuk tracking changes
- Jangan commit API keys ke repository

## 📊 Performa

### Optimasi
- **Async operations** untuk non-blocking I/O
- **Streaming responses** untuk AI queries
- **Intelligent caching** untuk file contents
- **Batch processing** untuk multiple files
- **Memory management** untuk large codebases

### Benchmark
- Scan 1000+ files: < 5 detik
- AI analysis response: 2-10 detik
- File operations: Instant
- Memory usage: < 100MB untuk project besar

## 🧪 Testing

### Menjalankan Test
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/
│   ├── config.test.js
│   ├── fileManager.test.js
│   ├── aiService.test.js
│   └── commandProcessor.test.js
├── integration/
│   └── app.test.js
└── fixtures/
    └── sample-projects/
```

## 🚀 Development

### Setup Development Environment
```bash
# Clone dan install
git clone https://github.com/ai-code-assistant/ai-assistant.git
cd ai-assistant
npm install

# Development mode dengan hot reload
npm run dev

# Linting
npm run lint

# Format code
npm run format
```

### Contributing
1. Fork repository
2. Buat feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push ke branch: `git push origin feature/amazing-feature`
5. Buat Pull Request

### Code Style
- ESLint configuration untuk consistency
- Prettier untuk formatting
- Conventional commits
- JSDoc untuk documentation

## 📱 Platform Support

### Sistem Operasi
- ✅ Linux (Ubuntu, Debian, CentOS, Arch)
- ✅ macOS (Intel & Apple Silicon)
- ✅ Windows (10, 11 dengan WSL recommended)

### Node.js Versions
- ✅ Node.js 18.x (LTS)
- ✅ Node.js 20.x (LTS)
- ✅ Node.js 21.x

## 🔧 Troubleshooting

### Common Issues

#### ❌ "API Key tidak dikonfigurasi"
```bash
# Solusi: Set API key
config apiKey YOUR_API_KEY
```

#### ❌ "Module not found"
```bash
# Solusi: Install dependencies
npm install
```

#### ❌ "Permission denied"
```bash
# Solusi: Fix executable permissions
chmod +x bin/cli.js
```

#### ❌ "Project tidak ditemukan"
```bash
# Solusi: Pastikan di direktori yang benar
pwd
cd /path/to/your/project
scan
```

### Debug Mode
```bash
# Jalankan dengan debug output
DEBUG=ai-assistant:* npm start
```

### Log Files
- Application logs: `~/.ai-assistant/logs/`
- Error logs: `~/.ai-assistant/logs/error.log`
- Access logs: `~/.ai-assistant/logs/access.log`

## 📈 Roadmap

### Version 1.1.0
- [ ] Plugin system untuk custom AI models
- [ ] Git integration (commit analysis, branch comparison)
- [ ] Project templates generator
- [ ] Performance metrics dashboard

### Version 1.2.0
- [ ] Web interface (optional)
- [ ] Team collaboration features
- [ ] Cloud project synchronization
- [ ] Advanced code metrics

### Version 2.0.0
- [ ] Multi-language support (English, Spanish, French)
- [ ] Machine learning model training
- [ ] Advanced refactoring patterns
- [ ] Enterprise features

## 🤝 Contributing

Kami menerima kontribusi dari komunitas! Berikut cara berkontribusi:

### Bug Reports
- Gunakan GitHub Issues
- Sertakan informasi environment
- Berikan langkah reproduksi yang jelas

### Feature Requests
- Diskusikan di GitHub Discussions
- Jelaskan use case dan manfaat
- Berikan mockup jika memungkinkan

### Code Contributions
- Fork repository
- Buat feature branch
- Tulis test untuk fitur baru
- Submit pull request

## 📄 License

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

```
MIT License

Copyright (c) 2024 AI Code Assistant Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- Terinspirasi oleh [Gemini CLI](https://github.com/google-ai-edge/gemini-cli)
- Menggunakan AI models dari berbagai provider
- Built with ❤️ untuk komunitas developer Indonesia

## 📞 Support

### Komunitas
- 💬 [Discord Server](https://discord.gg/ai-assistant)
- 📧 Email: support@ai-assistant.dev
- 🐛 Issues: [GitHub Issues](https://github.com/ai-code-assistant/ai-assistant/issues)
- 💭 Discussions: [GitHub Discussions](https://github.com/ai-code-assistant/ai-assistant/discussions)

### Professional Support
Untuk kebutuhan enterprise dan support profesional, hubungi tim kami di enterprise@ai-assistant.dev

---

## ⭐ Star History

Jika project ini membantu Anda, jangan lupa beri ⭐ di GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=ai-code-assistant/ai-assistant&type=Date)](https://star-history.com/#ai-code-assistant/ai-assistant&Date)

---

<div align="center">

**[🏠 Home](https://github.com/ai-code-assistant/ai-assistant)** •
**[📚 Docs](https://docs.ai-assistant.dev)** •
**[🚀 Examples](https://github.com/ai-code-assistant/examples)** •
**[💬 Community](https://discord.gg/ai-assistant)**

Made with ❤️ by the AI Code Assistant Team

</div>
