# 🚀 Demo Commands - AI Code Assistant

## Mode Eksekusi Otomatis dengan Natural Language

Gunakan prefix `/do` untuk mengaktifkan mode eksekusi otomatis yang akan menjalankan perintah terminal berdasarkan prompt natural language Anda.

### 📁 Membuat File dan Folder

```bash
# Buat folder baru
/do buat folder components

# Buat file baru
/do buat file index.js

# Buat file dengan path spesifik
/do buat file header.jsx di src/components

# Buat multiple directories
/do buat folder src/utils/helpers
```

### 📋 Operasi File

```bash
# Copy file
/do copy package.json ke backup/package.json

# Pindahkan file
/do pindahkan old-file.js ke archive/

# Tampilkan isi folder
/do tampilkan semua file di direktori ini

# Cari file
/do cari file dengan nama "config"
```

### 📦 Package Management

```bash
# Install npm packages
/do install express dengan npm

# Install multiple packages
/do install react react-dom dengan npm

# Install dengan yarn
/do pasang typescript dengan yarn
```

### 🔄 Development Tasks

```bash
# Inisialisasi project
/do buat project React baru

# Setup folder structure
/do buat struktur folder untuk Express app

# Copy template files
/do copy semua file dari template/ ke src/
```

### 🎯 Contoh Advanced

```bash
# Complex folder creation
/do buat folder structure src/components/ui/buttons

# Project setup
/do setup project Node.js dengan express dan dotenv

# File management
/do backup semua file .js ke backup folder

# Quick scaffold
/do buat komponen React bernama UserCard di src/components
```

## ✨ Fitur Keamanan

- ⚠️ Perintah berbahaya (rm, delete, format) akan diblokir
- 🔍 Preview perintah sebelum eksekusi
- ❓ Konfirmasi user untuk setiap operasi
- 📝 History lengkap semua eksekusi

## 🎨 Tips Penggunaan

1. **Gunakan bahasa natural**: "buat folder", bukan "mkdir"
2. **Spesifik dengan nama**: "buat file user.js" 
3. **Include path**: "di folder src"
4. **Review sebelum eksekusi**: Selalu cek perintah yang akan dijalankan

## 🚀 Mode Comparison

### Traditional Mode
```
mkdir components
touch components/Header.jsx
```

### Natural Language Mode
```
/do buat folder components dan file Header.jsx di dalamnya
```

AI akan mengkonversi menjadi perintah terminal yang tepat dan aman!