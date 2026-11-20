# 🚆 EduRail — Platform Tiket Kereta Khusus Mahasiswa (Full-Stack Bun + ElysiaJS + Drizzle + MySQL + React)

**EduRail** adalah aplikasi web full-stack pemesanan tiket kereta api khusus mahasiswa Indonesia dengan fitur **Subsidi Diskon KTM (20%–25%)**, rute antar-kota pendidikan, penerbitan **Digital Boarding Pass (QR E-Ticket)**, serta **Panel Inspeksi Database MySQL Real-Time** yang terintegrasi langsung di antarmuka pengguna.

---

## 🛠️ Tech Stack

### Backend
- **Runtime & Bundler:** [Bun](https://bun.sh/)
- **Web Framework:** [ElysiaJS](https://elysiajs.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) + `drizzle-kit`
- **Database:** MySQL (`mysql2/promise` connection pool)
- **Authentication & Security:** `bcryptjs` (10 salt rounds) + Session Token UUID (`sessions` table) + TypeBox Schema Validation

### Frontend
- **UI Library:** React 19 + TypeScript (dibundle langsung secara on-the-fly oleh `Bun.build`)
- **Styling:** Tailwind CSS + Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*)
- **Icons:** `lucide-react`
- **State Management:** React Context (`AuthContext`) + LocalStorage Session Persistence

---

## 📁 Struktur Folder

```text
project_1/
├── public/
│   ├── index.html                    # Entry HTML aplikasi Front-End EduRail
│   └── app.js                        # Bundle hasil build UI (opsional/fallback)
├── src/
│   ├── index.ts                      # Entry point Full-Stack Server (UI + REST API)
│   ├── errors.ts                     # HttpError + centralized route error handler
│   ├── lib/
│   │   └── auth.ts                   # Helper ekstraksi Bearer token
│   ├── db/
│   │   ├── index.ts                  # Koneksi pool MySQL & instance Drizzle
│   │   └── schema/
│   │       ├── index.ts              # Re-export semua schema
│   │       ├── users.ts              # Tabel `users` (id, name, email, password, created_at)
│   │       └── sessions.ts           # Tabel `sessions` (id, token, user_id FK cascade, created_at)
│   ├── routes/
│   │   ├── users-route.ts            # Auth API: POST /api/users, POST /api/users/login, GET & DELETE /api/users/current
│   │   └── users.ts                  # CRUD API: GET/POST/PUT/DELETE /users
│   ├── services/
│   │   └── users-service.ts          # Business logic registrasi, login, getCurrentUser, logout
│   └── frontend/                     # Source code Front-End EduRail (React + TypeScript)
│       ├── main.tsx                  # React DOM Root
│       ├── App.tsx                   # Halaman utama EduRail + Toast + Modal
│       ├── types.ts                  # Definisi tipe TypeScript Front-End
│       ├── data/
│       │   └── trains.ts             # Data stasiun kampus, jadwal kereta, promo KTM, FAQ
│       ├── services/
│       │   └── api.ts                # API Client pembungkus seluruh endpoint backend ElysiaJS
│       ├── context/
│       │   └── AuthContext.tsx       # State autentikasi reaktif & health check monitor
│       └── components/
│           ├── Navbar.tsx            # Navigasi, badge KTM Aktif, & tombol Cek Data Backend
│           ├── HeroSearch.tsx        # Hero banner & widget pencarian kereta mahasiswa
│           ├── TrainCatalog.tsx      # Katalog kereta, filter kelas/jam/harga, & diskon KTM
│           ├── BookingModal.tsx      # Form NIM/Kampus & Digital E-Ticket Boarding Pass QR
│           ├── PromoSection.tsx      # Kartu kode voucher mahasiswa & akordion FAQ KTM
│           ├── AuthModal.tsx         # Modal Login & Registrasi terhubung ke backend
│           └── BackendInspector.tsx  # Panel Live Inspector untuk cek isi database MySQL langsung dari UI
├── test/
│   └── index.test.ts                 # 17 unit & integration tests (bun test)
├── drizzle/                          # File migrasi SQL Drizzle
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Panduan Menjalankan Web dari Awal (Step-by-Step)

Ikuti langkah berikut secara berurutan dari awal hingga aplikasi web **EduRail** berjalan di browser Anda:

### Langkah 1: Pastikan Prasyarat Terpasang
1. **[Bun](https://bun.sh/)** sudah terinstal (`bun --version`).
2. **MySQL Server** (XAMPP / Laragon / MySQL Service / Docker) sedang berjalan di komputer Anda (default port `3306`).

### Langkah 2: Install Semua Dependensi
Jalankan perintah berikut di terminal pada folder proyek:
```bash
bun install
```

### Langkah 3: Konfigurasi File `.env`
Salin `.env.example` menjadi `.env` (jika belum ada) dan sesuaikan kredensial MySQL Anda:
```bash
cp .env.example .env
```
Contoh isi `.env`:
```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=project_1_db

DATABASE_URL=mysql://root:@localhost:3306/project_1_db
```
*(Jika MySQL Anda menggunakan password, ubah `DB_PASSWORD` dan `DATABASE_URL=mysql://root:PASSWORD_ANDA@localhost:3306/project_1_db`)*.

### Langkah 4: Buat Database di MySQL & Sinkronkan Tabel (`users` & `sessions`)
1. Buat database kosong bernama `project_1_db` di MySQL Anda:
   ```sql
   CREATE DATABASE IF NOT EXISTS project_1_db;
   ```
2. Dorong (push) skema tabel `users` dan `sessions` dari Drizzle ke MySQL:
   ```bash
   bun run db:push
   ```
   *(Atau jalankan migrasi SQL menggunakan `bun run db:migrate`)*.

### Langkah 5: Cara Menjalankan Aplikasi (Front-End & Back-End)

Aplikasi **EduRail** dirancang secara modular dan efisien: Bun + ElysiaJS dapat menyajikan REST API Back-End dan antarmuka Front-End React secara bersamaan (Full-Stack), maupun dijalankan dan dikembangkan secara terpisah.

#### 🌟 Opsi A: Menjalankan Secara Sekaligus (Full-Stack Mode — Paling Direkomendasikan)
Cukup jalankan **satu perintah** berikut di root folder proyek:
```bash
bun run dev
```
- **Front-End & Back-End aktif bersamaan** di: 👉 **`http://localhost:3000`**
- Halaman web EduRail langsung dapat diakses di browser Anda.
- Route `/health`, `/api/users`, `/users`, dan semua endpoint backend aktif di port yang sama.
- Fitur *live watch/hot-reload* aktif otomatis untuk setiap perubahan kode file frontend maupun backend.

---

#### ⚙️ Opsi B: Menjalankan Bagian Back-End Saja (REST API & Database Service)
Jika Anda hanya ingin menjalankan atau menguji sisi server API tanpa membuka antarmuka grafis:

1. **Jalankan Server Back-End:**
   ```bash
   # Mode pengembangan dengan auto-reload
   bun run dev

   # Atau mode production
   bun run start
   ```
2. **Periksa Kesehatan Server (Health Check):**
   ```bash
   curl http://localhost:3000/health
   # Response: {"status":"ok","timestamp":"..."}
   ```
3. **Akses & Uji Endpoint Back-End:**
   - Registrasi Mahasiswa: `POST http://localhost:3000/api/users`
   - Login & Sesi Token: `POST http://localhost:3000/api/users/login`
   - Verifikasi Profil User Aktif: `GET http://localhost:3000/api/users/current` *(Header `Authorization: Bearer <token>`)*
   - Logout & Revoke Token: `DELETE http://localhost:3000/api/users/current`
   - Data Seluruh User di DB: `GET http://localhost:3000/users`
4. **GUI Database MySQL via Drizzle Studio:**
   ```bash
   bun run db:studio
   ```
   Buka `https://local.drizzle.studio` di browser untuk menginspeksi tabel database secara visual.

---

#### 🎨 Opsi C: Menjalankan & Membangun (Build) Bagian Front-End Saja
Front-End EduRail dibangun menggunakan **React 19 + TypeScript + Tailwind CSS** yang terletak di folder `src/frontend/`.

1. **Build Bundle Front-End untuk Produksi:**
   Untuk mengompilasi seluruh source code React & ikon Lucide menjadi satu file JavaScript bundle statis:
   ```bash
   bun run build:ui
   ```
   Bundle siap pakai akan dihasilkan di: `public/app.js`.

2. **Mekanisme Bundling & Serving Front-End:**
   - **On-the-Fly (Otomatis):** Saat menjalankan `bun run dev`, endpoint `GET /app.js` di `src/index.ts` menggunakan API bawaan `Bun.build` untuk mem-bundle kode `src/frontend/main.tsx` secara dinamis setiap kali halaman di-refresh.
   - **Standalone / Static Hosting (Deploy Terpisah):** Jika Anda ingin mendeploy front-end secara terpisah (misalnya di hosting statis seperti Vercel, Netlify, Cloudflare Pages, atau Nginx):
     1. Jalankan `bun run build:ui`.
     2. Salin folder `public/` (berisi `index.html` dan `app.js`) ke web server statis pilihan Anda.
     3. Pastikan konfigurasi URL backend di `src/frontend/services/api.ts` mengarah ke alamat server backend Anda (default: `http://localhost:3000`).

---

## 🔍 Cara Mengetahui & Memastikan Data Backend Sudah Masuk ke Database MySQL

Ada **4 cara mudah** untuk membuktikan bahwa data registrasi mahasiswa, hash password bcrypt, dan token sesi login benar-benar masuk ke database MySQL Anda:

### Cara 1: Langsung dari Web UI EduRail (Paling Mudah!)
1. Buka **`http://localhost:3000`** di browser.
2. Klik tombol **"Daftar KTM"** di pojok kanan atas, lalu daftarkan akun mahasiswa baru (misal: Nama `Rakhbilal`, Email `rakhbil@kampus.ac.id`, Password `rahasia123`).
3. Setelah otomatis login, klik tombol **"Cek Data Backend"** (ikon Database dengan indikator hijau) di bagian atas navbar.
4. Panel **Inspeksi Backend & Database MySQL** akan terbuka dan menampilkan:
   - **`GET /health`**: Status server `200 OK` beserta latensi dalam milidetik.
   - **`GET /api/users/current`**: Menampilkan **Bearer Token UUID** aktif dari tabel `sessions` beserta ID, nama, dan email mahasiswa yang sedang login.
   - **`GET /users` (Isi Tabel `users` MySQL)**: Tabel interaktif yang menampilkan seluruh baris user yang tersimpan di MySQL. Anda bahkan bisa menguji tombol **Edit Nama (`PUT /users/:id`)** dan **Hapus User (`DELETE /users/:id`)** secara langsung dari tabel tersebut!

### Cara 2: Menggunakan Drizzle Studio (GUI Database Resmi di Browser)
Jalankan perintah berikut di terminal baru:
```bash
bun run db:studio
```
Buka URL yang muncul (biasanya `https://local.drizzle.studio`). Anda akan melihat tampilan spreadsheet visual untuk tabel **`users`** (lengkap dengan kolom `password` yang sudah di-hash bcrypt `$2b$10$...`) dan tabel **`sessions`** (lengkap dengan `token` UUID dan `user_id`).

### Cara 3: Cek Langsung via Query MySQL CLI / phpMyAdmin
Buka terminal MySQL atau phpMyAdmin Anda, lalu jalankan query berikut:
```sql
USE project_1_db;

-- 1. Cek apakah data mahasiswa sudah masuk & password ter-hash bcrypt
SELECT id, name, email, password, created_at FROM users;

-- 2. Cek apakah token UUID sesi login sudah masuk saat user login
SELECT s.id, s.token, s.user_id, u.name, u.email, s.created_at
FROM sessions s
JOIN users u ON u.id = s.user_id;
```
> **Catatan:** Saat Anda menekan tombol **Keluar (Logout)** di web EduRail (`DELETE /api/users/current`), jalankan kembali query ke-2 di atas — baris sesi dengan token tersebut akan **hilang/terhapus** dari tabel `sessions`!

### Cara 4: Cek Melalui Endpoint API / `curl` di Terminal
Saat server `bun run dev` menyala, Anda dapat mengetes langsung dari terminal:
```bash
# Cek daftar seluruh user di database MySQL
curl http://localhost:3000/users
```

---

## 🧪 Menjalankan Pengujian (Unit Tests & Typecheck)

```bash
# Jalankan typecheck TypeScript (Backend + Frontend React)
bun run typecheck

# Jalankan seluruh unit & integration test
bun test
```

---

## 📡 Ringkasan Endpoint Backend yang Dibungkus oleh Frontend

| Method & Endpoint | Fungsi di Frontend EduRail | Tabel MySQL Terkait |
| :--- | :--- | :--- |
| `GET /` & `GET /app.js` | Menyajikan aplikasi web React **EduRail** | - |
| `GET /health` | Indikator lampu status server & latensi di Navbar & Inspector | - |
| `POST /api/users` | Form **Daftar Baru (Register)** di `AuthModal` | `INSERT INTO users` |
| `POST /api/users/login` | Form **Masuk (Login)** di `AuthModal` | `SELECT users` & `INSERT INTO sessions` |
| `GET /api/users/current` | Verifikasi sesi otomatis & badge **KTM Aktif** di Navbar | `SELECT sessions` & `SELECT users` |
| `DELETE /api/users/current` | Tombol **Keluar (Logout)** di Navbar | `DELETE FROM sessions` |
| `GET /users` | Tabel **Live Data Monitor** di panel `BackendInspector` | `SELECT id, name, email, created_at FROM users` |
| `PUT /users/:id` | Tombol **Edit Nama Mahasiswa** di panel `BackendInspector` | `UPDATE users SET name = ?` |
| `DELETE /users/:id` | Tombol **Hapus User** di panel `BackendInspector` | `DELETE FROM users` (cascade `sessions`) |
