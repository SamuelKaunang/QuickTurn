# 2.2 Deskripsi Arsitektur Perangkat Lunak

*Diisi dengan daftar modul. Daftar modul bisa dalam bentuk tabel berikut:*

## Isinya Komponen Diagram

| No | Nama Komponen | Keterangan |
|----|---------------|------------|
| | **BACKEND (Spring Boot)** | |
| 1 | Controller Layer | Menangani HTTP request dari frontend, routing API endpoints, dan validasi input. Terdiri dari: AuthController, UserController, ProjectController, ApplicationController, ChatController, ReviewController, ReportController, NotificationController, FileController. |
| 2 | Service Layer | Berisi business logic aplikasi. Memproses data dari Controller sebelum disimpan ke database. Terdiri dari: AuthService, UserService, ProjectService, ApplicationService, ChatService, ReviewService, EmailService, FileStorageService, NotificationService. |
| 3 | Repository Layer | Interface untuk komunikasi dengan database menggunakan Spring Data JPA. Menyediakan operasi CRUD untuk setiap Entity. Terdiri dari: UserRepository, ProjectRepository, ApplicationRepository, ChatRoomRepository, MessageRepository, ReviewRepository. |
| 4 | Entity Layer | Representasi objek database (ORM). Mendefinisikan struktur tabel dan relasi antar tabel. Terdiri dari: User, Project, Application, ChatRoom, Message, Review, Notification, PasswordResetToken. |
| 5 | DTO (Data Transfer Object) | Objek untuk transfer data antara layer. Memisahkan representasi internal (Entity) dengan data yang dikirim ke client. Terdiri dari: AuthResponse, LoginRequest, RegisterRequest, ProjectDTO, UserProfileResponse. |
| 6 | Security Layer | Menangani autentikasi dan otorisasi. Terdiri dari: JwtService (generate/validate JWT token), SecurityConfig (konfigurasi Spring Security), RateLimitingFilter, CustomOAuth2UserService, OAuth2AuthenticationSuccessHandler. |
| 7 | Config Layer | Konfigurasi aplikasi Spring Boot. Terdiri dari: CorsConfig (Cross-Origin Resource Sharing), WebSocketConfig, MongoConfig, DatabaseMigrationRunner. |
| | **FRONTEND (React.js)** | |
| 8 | Landing Page | Halaman utama publik yang menampilkan informasi tentang QuickTurn, fitur-fitur, dan call-to-action untuk registrasi/login. |
| 9 | Authentication Module | Modul untuk autentikasi pengguna. Terdiri dari: LoginPage (login email/password dan Google OAuth), RegistrationPageM (registrasi Talent), RegistrationPageU (registrasi Client), OAuth2Callback (handler Google login), SelectRole (pemilihan role untuk user OAuth baru). |
| 10 | Dashboard Module | Halaman utama setelah login. DashboardM untuk Talent (menampilkan project tersedia, statistik), DashboardU untuk Client (menampilkan project yang dipost, applicants). |
| 11 | Project Module | Modul manajemen project. Terdiri dari: PostProject (form posting project baru), ProjectsM (browse project untuk Talent), ProjectsU (list project milik Client), ApplicantsModalU (lihat applicants). |
| 12 | Profile Module | Modul manajemen profil pengguna. Terdiri dari: ProfileM (profil Talent), ProfileU (profil Client), PublicProfile (profil publik yang bisa dilihat user lain). |
| 13 | Chat Module | Modul real-time messaging menggunakan WebSocket/STOMP. ChatPage menampilkan daftar konversasi dan interface chat. |
| 14 | Admin Module | Modul administrasi sistem. Terdiri dari: AdminDashboard (statistik sistem, user management), AdminReports (pengelolaan laporan/report dari user). |
| 15 | Utility Components | Komponen pendukung yang reusable. Terdiri dari: Toast (notifikasi popup), Skeleton (loading placeholder), RouteGuards (proteksi route), SettingsContext (pengaturan user), UserAvatar, Modal components. |
| | **DATABASE** | |
| 16 | MySQL | Database relasional utama untuk menyimpan data user, project, application, review, dan data transaksional lainnya. |
| 17 | MongoDB | Database NoSQL untuk menyimpan data chat/messaging yang membutuhkan struktur fleksibel dan volume tinggi. |
| | **EXTERNAL SERVICES** | |
| 18 | Azure Blob Storage | Cloud storage untuk menyimpan file upload (profile picture, portfolio, submission files). |
| 19 | Resend API | Email service provider untuk mengirim email verifikasi, reset password, dan notifikasi. |
| 20 | Google OAuth2 | Layanan autentikasi pihak ketiga untuk login menggunakan akun Google. |

---

## Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React.js)                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  Landing    │ │   Auth      │ │  Dashboard  │ │   Profile   │            │
│  │   Page      │ │  Module     │ │   Module    │ │   Module    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  Project    │ │    Chat     │ │   Admin     │ │  Utilities  │            │
│  │   Module    │ │   Module    │ │   Module    │ │ Components  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ HTTP/REST, WebSocket
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Spring Boot)                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Controller Layer                              │   │
│  │  Auth │ User │ Project │ Application │ Chat │ Review │ Report │ File │   │
│  └───────────────────────────────┬──────────────────────────────────────┘   │
│                                  ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                          Service Layer                                │   │
│  │  AuthService │ UserService │ ProjectService │ ChatService │ etc.     │   │
│  └───────────────────────────────┬──────────────────────────────────────┘   │
│                                  ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Repository Layer                              │   │
│  │  UserRepo │ ProjectRepo │ ApplicationRepo │ ChatRepo │ MessageRepo   │   │
│  └───────────────────────────────┬──────────────────────────────────────┘   │
│                                  │                                           │
│  ┌─────────────────┐  ┌──────────┴───────────┐  ┌──────────────────────┐   │
│  │  Security Layer │  │                      │  │    Config Layer      │   │
│  │  JWT, OAuth2    │  │                      │  │  CORS, WebSocket     │   │
│  └─────────────────┘  │                      │  └──────────────────────┘   │
└───────────────────────┼──────────────────────┼──────────────────────────────┘
                        ▼                      ▼
        ┌───────────────────────┐  ┌───────────────────────┐
        │        MySQL          │  │       MongoDB         │
        │  (Users, Projects,    │  │  (Chat Messages,      │
        │   Applications,       │  │   Conversations)      │
        │   Reviews)            │  │                       │
        └───────────────────────┘  └───────────────────────┘

                        ┌───────────────────────────────────┐
                        │        EXTERNAL SERVICES          │
                        │  ┌─────────┐ ┌────────┐ ┌───────┐ │
                        │  │  Azure  │ │ Resend │ │Google │ │
                        │  │  Blob   │ │  API   │ │OAuth2 │ │
                        │  └─────────┘ └────────┘ └───────┘ │
                        └───────────────────────────────────┘
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React.js 18, React Router, CSS3 |
| Backend | Spring Boot 3.x, Spring Security, Spring Data JPA |
| Database (SQL) | MySQL 8.0 |
| Database (NoSQL) | MongoDB |
| Authentication | JWT, Google OAuth2 |
| Real-time | WebSocket with STOMP |
| File Storage | Azure Blob Storage |
| Email Service | Resend API |
| Deployment | Railway (Backend), Vercel (Frontend) |
