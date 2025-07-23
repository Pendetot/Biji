#!/usr/bin/env python3

import os
import json
import requests
import glob
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import difflib
import sys

class FileManager:
    """Mengelola operasi file system"""
    
    @staticmethod
    def move_file(src: str, dst: str) -> bool:
        """Pindahkan file atau direktori"""
        try:
            shutil.move(src, dst)
            return True
        except Exception as e:
            print(f"❌ Gagal memindahkan {src} ke {dst}: {e}")
            return False
    
    @staticmethod
    def copy_file(src: str, dst: str) -> bool:
        """Salin file atau direktori"""
        try:
            if os.path.isdir(src):
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)
            return True
        except Exception as e:
            print(f"❌ Gagal menyalin {src} ke {dst}: {e}")
            return False
    
    @staticmethod
    def delete_file(path: str) -> bool:
        """Hapus file atau direktori"""
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
            else:
                os.remove(path)
            return True
        except Exception as e:
            print(f"❌ Gagal menghapus {path}: {e}")
            return False
    
    @staticmethod
    def create_file(path: str, content: str = "") -> bool:
        """Buat file baru dengan konten"""
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            print(f"❌ Gagal membuat file {path}: {e}")
            return False
    
    @staticmethod
    def create_directory(path: str) -> bool:
        """Buat direktori baru"""
        try:
            os.makedirs(path, exist_ok=True)
            return True
        except Exception as e:
            print(f"❌ Gagal membuat direktori {path}: {e}")
            return False

class CodeAnalyzer:
    """Menganalisis dan memproses kode"""
    
    def __init__(self):
        self.api_url = "https://inference.do-ai.run/v1/chat/completions"
        self.models_url = "https://inference.do-ai.run/v1/models"
        self.api_key = " "
        self.available_models = []
        self.selected_model = "llama3.3-70b-instruct"
        self.files_data = {}
        self.project_loaded = False
        
        self._load_models()
    
    def _load_models(self):
        """Load daftar model yang tersedia"""
        try:
            response = requests.get(
                self.models_url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.available_models = [model["id"] for model in data["data"]]
            else:
                self.available_models = [
                    "llama3.3-70b-instruct",
                    "anthropic-claude-3.5-sonnet", 
                    "openai-gpt-4o",
                    "deepseek-r1-distill-llama-70b"
                ]
        except:
            self.available_models = ["llama3.3-70b-instruct"]
    
    def scan_project(self, silent: bool = False):
        """Scan semua file dalam project"""
        if not silent:
            print("🔍 Memindai project...")
        
        extensions = {
            '.py': 'python', '.js': 'javascript', '.ts': 'typescript', 
            '.java': 'java', '.cpp': 'cpp', '.c': 'c', '.cs': 'csharp',
            '.php': 'php', '.rb': 'ruby', '.go': 'go', '.rs': 'rust',
            '.html': 'html', '.css': 'css', '.sql': 'sql', '.sh': 'bash',
            '.json': 'json', '.xml': 'xml', '.yaml': 'yaml', '.yml': 'yaml',
            '.vue': 'vue', '.jsx': 'jsx', '.tsx': 'tsx', '.scss': 'scss',
            '.less': 'less', '.md': 'markdown', '.txt': 'text'
        }
        
        ignore_dirs = {'.git', 'node_modules', '__pycache__', '.vscode', 'venv', 'env', 'dist', 'build', '.next', 'target'}
        ignore_files = {'package-lock.json', '.gitignore', '.env', '.DS_Store'}
        
        self.files_data = {}
        
        for ext, lang in extensions.items():
            files = glob.glob(f"**/*{ext}", recursive=True)
            
            for file_path in files:
                if any(ignored in file_path for ignored in ignore_dirs):
                    continue
                
                filename = os.path.basename(file_path)
                if filename in ignore_files:
                    continue
                    
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if len(content.strip()) == 0 or len(content) > 100000:
                        continue
                        
                    self.files_data[file_path] = {
                        'content': content,
                        'language': lang,
                        'size': len(content),
                        'lines': len(content.splitlines())
                    }
                    
                except:
                    continue
        
        if not silent:
            print(f"✅ Ditemukan {len(self.files_data)} file kode")
        
        self.project_loaded = True
    
    def get_file_content(self, file_path: str) -> Optional[str]:
        """Ambil konten file"""
        if file_path in self.files_data:
            return self.files_data[file_path]['content']
        
        # Cari file yang mengandung nama
        matches = [f for f in self.files_data.keys() if file_path in f]
        if matches:
            return self.files_data[matches[0]]['content']
        
        # Coba baca langsung dari disk
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except:
            return None
    
    def ask_ai(self, prompt: str, context_files: List[str] = None) -> str:
        """Tanya AI dengan konteks file"""
        if not self.project_loaded:
            self.scan_project(silent=True)
        
        # Buat konteks dari file yang relevan
        context = self._build_context(context_files)
        
        system_msg = f"""Anda adalah asisten kode AI yang ahli dalam analisis dan modifikasi kode.

KONTEKS PROJECT:
{context}

Berikan respons dalam bahasa Indonesia yang:
1. Spesifik dan actionable
2. Mengacu pada kode yang sebenarnya
3. Memberikan contoh konkret
4. Menjelaskan reasoning di balik saran

Jika diminta untuk memodifikasi kode, berikan kode lengkap yang sudah diperbaiki."""

        messages = [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = requests.post(
                self.api_url,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                },
                json={
                    "model": self.selected_model,
                    "messages": messages,
                    "max_tokens": 4000,
                    "temperature": 0.1
                },
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                return f"❌ Error API: {response.status_code}"
                
        except Exception as e:
            return f"❌ Error: {str(e)}"
    
    def _build_context(self, specific_files: List[str] = None) -> str:
        """Bangun konteks dari file yang relevan"""
        if not self.files_data:
            return "Tidak ada file kode yang ditemukan."
        
        context_parts = []
        max_size = 30000
        current_size = 0
        
        files_to_include = specific_files or list(self.files_data.keys())
        
        # Prioritaskan file yang diminta
        sorted_files = []
        if specific_files:
            for f in specific_files:
                if f in self.files_data:
                    sorted_files.append((f, self.files_data[f]))
        
        # Tambahkan file lain berdasarkan ukuran
        remaining_files = [(f, d) for f, d in self.files_data.items() 
                          if f not in [sf[0] for sf in sorted_files]]
        remaining_files.sort(key=lambda x: x[1]['size'])
        sorted_files.extend(remaining_files)
        
        for file_path, data in sorted_files:
            if current_size + data['size'] > max_size:
                if max_size - current_size > 1000:
                    truncated = data['content'][:max_size - current_size]
                    context_parts.append(f"=== {file_path} ({data['language']}) [DIPOTONG] ===\n{truncated}")
                break
            
            context_parts.append(f"=== {file_path} ({data['language']}) ===\n{data['content']}")
            current_size += data['size']
        
        return "\n\n".join(context_parts)

class CommandProcessor:
    """Memproses perintah pengguna"""
    
    def __init__(self, analyzer: CodeAnalyzer, file_manager: FileManager):
        self.analyzer = analyzer
        self.file_manager = file_manager
        self.command_history = []
    
    def process_command(self, command: str) -> str:
        """Proses perintah pengguna"""
        self.command_history.append(command)
        command = command.strip().lower()
        
        # File operations
        if command.startswith('mv ') or command.startswith('move '):
            return self._handle_move(command)
        elif command.startswith('cp ') or command.startswith('copy '):
            return self._handle_copy(command)
        elif command.startswith('rm ') or command.startswith('delete '):
            return self._handle_delete(command)
        elif command.startswith('mkdir ') or command.startswith('create dir '):
            return self._handle_mkdir(command)
        elif command.startswith('touch ') or command.startswith('create file '):
            return self._handle_touch(command)
        elif command.startswith('cat ') or command.startswith('show '):
            return self._handle_cat(command)
        elif command.startswith('ls') or command == 'list' or command == 'files':
            return self._handle_list()
        elif command.startswith('find '):
            return self._handle_find(command)
        elif command == 'pwd':
            return f"📂 {os.getcwd()}"
        elif command.startswith('cd '):
            return self._handle_cd(command)
        elif command == 'models':
            return self._handle_models()
        elif command.startswith('model '):
            return self._handle_select_model(command)
        elif command == 'scan' or command == 'refresh':
            self.analyzer.scan_project()
            return "✅ Project berhasil dipindai ulang"
        elif command == 'status':
            return self._handle_status()
        elif command.startswith('diff '):
            return self._handle_diff(command)
        elif command.startswith('backup '):
            return self._handle_backup(command)
        elif command == 'help':
            return self._show_help()
        else:
            # Perintah untuk AI
            return self._handle_ai_command(command)
    
    def _handle_move(self, command: str) -> str:
        """Handle perintah mv/move"""
        parts = command.split()[1:]
        if len(parts) < 2:
            return "❌ Penggunaan: mv <source> <destination>"
        
        src, dst = parts[0], parts[1]
        if self.file_manager.move_file(src, dst):
            self.analyzer.scan_project(silent=True)  # Refresh file list
            return f"✅ Berhasil memindahkan {src} ke {dst}"
        return f"❌ Gagal memindahkan {src}"
    
    def _handle_copy(self, command: str) -> str:
        """Handle perintah cp/copy"""
        parts = command.split()[1:]
        if len(parts) < 2:
            return "❌ Penggunaan: cp <source> <destination>"
        
        src, dst = parts[0], parts[1]
        if self.file_manager.copy_file(src, dst):
            self.analyzer.scan_project(silent=True)
            return f"✅ Berhasil menyalin {src} ke {dst}"
        return f"❌ Gagal menyalin {src}"
    
    def _handle_delete(self, command: str) -> str:
        """Handle perintah rm/delete"""
        parts = command.split()[1:]
        if not parts:
            return "❌ Penggunaan: rm <file/directory>"
        
        path = parts[0]
        
        # Konfirmasi untuk operasi berbahaya
        if path in ['*', '.', '..', '/']:
            return "❌ Operasi tidak aman ditolak"
        
        if self.file_manager.delete_file(path):
            self.analyzer.scan_project(silent=True)
            return f"✅ Berhasil menghapus {path}"
        return f"❌ Gagal menghapus {path}"
    
    def _handle_mkdir(self, command: str) -> str:
        """Handle perintah mkdir"""
        parts = command.split()[1:]
        if not parts:
            return "❌ Penggunaan: mkdir <directory>"
        
        path = parts[0]
        if self.file_manager.create_directory(path):
            return f"✅ Berhasil membuat direktori {path}"
        return f"❌ Gagal membuat direktori {path}"
    
    def _handle_touch(self, command: str) -> str:
        """Handle perintah touch/create file"""
        parts = command.split()[1:]
        if not parts:
            return "❌ Penggunaan: touch <filename>"
        
        filename = parts[0]
        if self.file_manager.create_file(filename):
            self.analyzer.scan_project(silent=True)
            return f"✅ Berhasil membuat file {filename}"
        return f"❌ Gagal membuat file {filename}"
    
    def _handle_cat(self, command: str) -> str:
        """Handle perintah cat/show"""
        parts = command.split()[1:]
        if not parts:
            return "❌ Penggunaan: cat <filename>"
        
        filename = parts[0]
        content = self.analyzer.get_file_content(filename)
        if content:
            return f"📄 {filename}:\n{'='*50}\n{content}\n{'='*50}"
        return f"❌ File {filename} tidak ditemukan"
    
    def _handle_list(self) -> str:
        """Handle perintah ls/list"""
        if not self.analyzer.project_loaded:
            self.analyzer.scan_project(silent=True)
        
        if not self.analyzer.files_data:
            return "📁 Tidak ada file kode yang ditemukan"
        
        result = f"📁 Ditemukan {len(self.analyzer.files_data)} file:\n"
        for i, (file_path, data) in enumerate(self.analyzer.files_data.items(), 1):
            result += f"{i:2d}. {file_path} ({data['language']}, {data['lines']} baris)\n"
        
        return result.rstrip()
    
    def _handle_find(self, command: str) -> str:
        """Handle perintah find"""
        parts = command.split()[1:]
        if not parts:
            return "❌ Penggunaan: find <pattern>"
        
        pattern = parts[0].lower()
        matches = []
        
        for file_path in self.analyzer.files_data.keys():
            if pattern in file_path.lower():
                matches.append(file_path)
        
        if matches:
            result = f"🔍 Ditemukan {len(matches)} file yang cocok:\n"
            for match in matches:
                result += f"• {match}\n"
            return result.rstrip()
        
        return f"❌ Tidak ditemukan file yang mengandung '{pattern}'"
    
    def _handle_cd(self, command: str) -> str:
        """Handle perintah cd"""
        parts = command.split()[1:]
        if not parts:
            return f"📂 {os.getcwd()}"
        
        path = parts[0]
        try:
            os.chdir(path)
            self.analyzer.scan_project(silent=True)
            return f"✅ Pindah ke {os.getcwd()}"
        except:
            return f"❌ Direktori {path} tidak ditemukan"
    
    def _handle_models(self) -> str:
        """Handle perintah models"""
        result = "🤖 Model yang tersedia:\n"
        for i, model in enumerate(self.analyzer.available_models, 1):
            marker = "→" if model == self.analyzer.selected_model else " "
            result += f"{marker} {i:2d}. {model}\n"
        return result.rstrip()
    
    def _handle_select_model(self, command: str) -> str:
        """Handle pemilihan model"""
        parts = command.split()[1:]
        if not parts:
            return "❌ Penggunaan: model <nomor>"
        
        try:
            idx = int(parts[0]) - 1
            if 0 <= idx < len(self.analyzer.available_models):
                self.analyzer.selected_model = self.analyzer.available_models[idx]
                return f"✅ Model dipilih: {self.analyzer.selected_model}"
            else:
                return "❌ Nomor model tidak valid"
        except ValueError:
            return "❌ Nomor harus berupa angka"
    
    def _handle_status(self) -> str:
        """Handle perintah status"""
        result = f"""📊 Status AI Code Assistant:
🤖 Model aktif: {self.analyzer.selected_model}
📂 Direktori: {os.getcwd()}
📁 File kode: {len(self.analyzer.files_data)}
🔑 API Key: {'✅ Tersedia' if self.analyzer.api_key else '❌ Tidak ada'}
💾 Project loaded: {'✅ Ya' if self.analyzer.project_loaded else '❌ Tidak'}"""
        return result
    
    def _handle_diff(self, command: str) -> str:
        """Handle perintah diff"""
        parts = command.split()[1:]
        if len(parts) < 2:
            return "❌ Penggunaan: diff <file1> <file2>"
        
        file1_content = self.analyzer.get_file_content(parts[0])
        file2_content = self.analyzer.get_file_content(parts[1])
        
        if not file1_content:
            return f"❌ File {parts[0]} tidak ditemukan"
        if not file2_content:
            return f"❌ File {parts[1]} tidak ditemukan"
        
        diff = difflib.unified_diff(
            file1_content.splitlines(keepends=True),
            file2_content.splitlines(keepends=True),
            fromfile=parts[0],
            tofile=parts[1]
        )
        
        diff_text = ''.join(diff)
        if diff_text:
            return f"📊 Perbedaan antara {parts[0]} dan {parts[1]}:\n{diff_text}"
        else:
            return f"✅ File {parts[0]} dan {parts[1]} identik"
    
    def _handle_backup(self, command: str) -> str:
        """Handle perintah backup"""
        parts = command.split()[1:]
        if not parts:
            return "❌ Penggunaan: backup <file>"
        
        filename = parts[0]
        backup_name = f"{filename}.backup"
        
        if self.file_manager.copy_file(filename, backup_name):
            return f"✅ Backup dibuat: {backup_name}"
        return f"❌ Gagal membuat backup untuk {filename}"
    
    def _show_help(self) -> str:
        """Tampilkan bantuan"""
        return """🆘 Bantuan AI Code Assistant:

📁 OPERASI FILE:
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

🤖 AI & MODEL:
   models             - Tampilkan daftar model
   model <nomor>      - Pilih model
   scan / refresh     - Pindai ulang project
   status             - Tampilkan status system

💬 PERINTAH AI:
   analisis kode      - Analisis seluruh project
   perbaiki bug       - Cari dan perbaiki bug
   refactor <file>    - Refactor file tertentu
   explain <file>     - Jelaskan kode dalam file
   optimize           - Optimasi kode
   add tests          - Tambahkan unit test
   
🚪 exit / quit        - Keluar dari aplikasi"""
    
    def _handle_ai_command(self, command: str) -> str:
        """Handle perintah untuk AI"""
        # Deteksi file spesifik dalam perintah
        context_files = []
        
        # Cari penyebutan file dalam perintah
        for file_path in self.analyzer.files_data.keys():
            filename = os.path.basename(file_path)
            if filename.lower() in command or file_path.lower() in command:
                context_files.append(file_path)
        
        # Jika tidak ada file spesifik, gunakan semua file
        if not context_files and "seluruh" in command:
            context_files = list(self.analyzer.files_data.keys())
        
        return self.analyzer.ask_ai(command, context_files)

class AICodeAssistant:
    """Main application class"""
    
    def __init__(self):
        self.analyzer = CodeAnalyzer()
        self.file_manager = FileManager()
        self.processor = CommandProcessor(self.analyzer, self.file_manager)
        self.running = True
    
    def start(self):
        """Start the assistant"""
        print("🚀 AI Code Assistant Indonesia")
        print("=" * 50)
        
        # Scan project pertama kali
        self.analyzer.scan_project()
        
        print(f"\n🤖 AI Code Assistant siap digunakan!")
        print(f"📡 Model: {self.analyzer.selected_model}")
        print(f"📂 Direktori: {os.getcwd()}")
        print(f"💡 Ketik 'help' untuk bantuan, 'exit' untuk keluar\n")
        
        while self.running:
            try:
                user_input = input("💬 Anda: ").strip()
                
                if not user_input:
                    continue
                
                if user_input.lower() in ['exit', 'quit', 'q']:
                    print("👋 Sampai jumpa!")
                    break
                
                response = self.processor.process_command(user_input)
                print(f"\n🤖 Assistant: {response}\n")
                
            except KeyboardInterrupt:
                print("\n👋 Sampai jumpa!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")

def main():
    assistant = AICodeAssistant()
    assistant.start()

if __name__ == "__main__":
    main()