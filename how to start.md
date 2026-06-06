# 🚀 Cara Menjalankan Proyek QuickTurn

Panduan singkat untuk menjalankan Backend (via Docker) dan Frontend (secara lokal/native menggunakan npm).

---

## 🗄️ 1. Menjalankan Backend & Database (via Docker)
Pastikan Docker Desktop sudah aktif, lalu jalankan perintah ini dari root folder proyek (`/QuickTurn`):

```bash
docker-compose up -d mysql mongodb backend
```
> **Keterangan:** Perintah ini akan menyalakan database MySQL, MongoDB, serta server Backend Spring Boot di latar belakang.

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
```bash
docker-compose down
```
