# 🚀 Cara Menjalankan Proyek QuickTurn

Panduan singkat untuk menjalankan Backend (via Docker) dan Frontend (secara lokal/native menggunakan npm).

---

## 🗄️ 1. Menjalankan Backend & Database (via Docker)
Pastikan Docker Desktop sudah aktif. Pilih salah satu cara berikut dari root folder proyek (`/QuickTurn`):

### Opsi A: Build dari Source Code Lokal (Direkomendasikan untuk Development)
Jika Anda ingin melakukan build backend langsung dari source code lokal yang ada saat ini:
```bash
docker-compose -f docker-compose.dev.yml up -d --build mysql mongodb backend
```

### Opsi B: Menggunakan Image yang Sudah Jadi (Pre-built)
Jika Anda ingin langsung menarik image backend yang sudah siap pakai dari Docker Hub (`sakahere4uy/quickturn-backend:latest`) tanpa proses build lokal:
```bash
docker-compose up -d mysql mongodb backend
```

---

## 💻 2. Menjalankan Frontend React (Secara Lokal)
Buka terminal baru, masuk ke folder frontend, instal dependensi, lalu jalankan aplikasinya:

```bash
cd Frontend/quickturn
npm install
npm start
```
> **Keterangan:** Aplikasi Frontend akan otomatis terbuka di browser pada **`http://localhost:3000`**.

---

## 🛑 3. Menghentikan Backend & Database
Untuk menghentikan container Docker yang berjalan:
* Jika menggunakan **Opsi A**:
  ```bash
  docker-compose -f docker-compose.dev.yml down
  ```
* Jika menggunakan **Opsi B**:
  ```bash
  docker-compose down
  ```
