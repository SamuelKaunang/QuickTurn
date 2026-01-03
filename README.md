# QuickTurn

QuickTurn adalah platform yang menghubungkan mahasiswa dengan UMKM untuk proyek freelance, mempercepat kolaborasi dan pengembangan karir.

## Technologi Stack
Project ini dibangun menggunakan teknologi berikut:

### Core
- **Backend**: Java (Spring Boot)
- **Frontend**: React.js
- **Database**: 
  - MySQL (Data Utama)
  - MongoDB (Fitur Chat)

## Prerequisites (Prasyarat)
Sebelum menjalankan aplikasi, pastikan komputer Anda telah terinstall:

1. **Java Development Kit (JDK) 17** atau lebih baru.
2. **Node.js** (Versi LTS disarankan).
3. **MySQL Server**.
4. **MongoDB Server**.

## Panduan Instalasi & Menjalankan Aplikasi

### 1. Setup Database
1. Pastikan MySQL Server berjalan.
2. Buat database baru bernama `quickturn`.
   ```sql
   CREATE DATABASE quickturn;
   ```
3. (Opsional) Jika ada data inisial, import file dari folder `database/quickturn.sql`.
4. Pastikan MongoDB berjalan (Default port: `27017`).

### 2. Setup Backend (Spring Boot)
1. Buka terminal dan arahkan ke folder `Backend`.
   ```bash
   cd Backend
   ```
2. Konfigurasi Environment Variable. Anda perlu mengatur variabel berikut (bisa via IDE atau System Environment):
   - `APP_JWT_SECRET`: Generate string acak (base64) untuk keamanan token.
   - `SPRING_DATASOURCE_PASSWORD`: Password user root MySQL Anda.
   - `SPRING_DATASOURCE_USERNAME`: Username MySQL (Default: `root`).
   - `RESEND_API_KEY`: API Key Resend (untuk fitur email).
   - `AZURE_STORAGE_CONNECTION_STRING`: Connection string Azure Blob Storage (untuk upload file).

3. Jalankan aplikasi menggunakan Maven Wrapper:
   ```bash
   # Windows
   .\mvnw.cmd spring-boot:run
   
   # Linux/Mac
   ./mvnw spring-boot:run
   ```
4. Backend akan berjalan di `http://localhost:8080`.

### 3. Setup Frontend (React)
1. Buka terminal baru dan arahkan ke folder Frontend.
   ```bash
   cd Frontend/quickturn
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm start
   ```
4. Aplikasi akan terbuka otomatis di `http://localhost:3000`.

## Struktur Project

- **/Backend**: Berisi kode sumber aplikasi sisi server (API, Logic, Security).
- **/Frontend/quickturn**: Berisi kode sumber antarmuka pengguna (React).
- **/database**: Skrip SQL untuk skema database.

## Catatan Tambahan
Pastikan port `8080` (Backend) dan `3000` (Frontend) tidak sedang digunakan oleh aplikasi lain.
