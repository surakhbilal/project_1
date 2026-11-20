# Project 1: REST API (Bun + ElysiaJS + Drizzle + MySQL)

Boilerplate backend REST API modern menggunakan runtime **Bun**, framework **ElysiaJS**, ORM **Drizzle**, dan database **MySQL**.

---

## 🛠️ Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [ElysiaJS](https://elysiajs.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database Driver:** [mysql2](https://github.com/sidorares/node-mysql2)
- **Database:** MySQL
- **Validation:** Elysia TypeBox (`t`)

---

## 📁 Struktur Folder

```text
project_1/
├── src/
│   ├── index.ts             # Entry point server Elysia
│   ├── db/
│   │   ├── index.ts          # Koneksi database & pooling singleton
│   │   └── schema/
│   │       ├── index.ts      # Re-export schema
│   │       └── users.ts      # Definisi schema tabel users
│   └── routes/
│       └── users.ts          # CRUD routes handler untuk resource users
├── drizzle/                  # File migration SQL hasil generate Drizzle
├── drizzle.config.ts         # Konfigurasi Drizzle Kit
├── package.json              # Dependensi dan scripts
├── tsconfig.json             # Konfigurasi TypeScript untuk Bun
├── .env.example              # Template variabel environment
├── .env                      # Variabel environment lokal
├── .gitignore
└── README.md
```

---

## 🚀 Memulai

### 1. Prasyarat
- [Bun](https://bun.sh/) (v1.0+)
- Server MySQL yang sedang berjalan

### 2. Instalasi Dependensi
```bash
bun install
```

### 3. Konfigurasi Environment
Salin file `.env.example` ke `.env` dan sesuaikan dengan kredensial database Anda:

```bash
cp .env.example .env
```

Isi file `.env`:
```env
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=project_1_db

# Atau gunakan DATABASE_URL
DATABASE_URL=mysql://root:@localhost:3306/project_1_db
```

Pastikan database `project_1_db` sudah dibuat di MySQL Anda:
```sql
CREATE DATABASE project_1_db;
```

---

## 🗄️ Database & Migration

Gunakan script berikut untuk mengelola skema database:

| Perintah | Deskripsi |
| :--- | :--- |
| `bun run db:generate` | Menghasilkan file migrasi SQL baru di folder `drizzle/` berdasarkan schema |
| `bun run db:migrate` | Menjalankan file migrasi SQL ke database MySQL |
| `bun run db:push` | Langsung sinkronisasi schema TypeScript ke database (bagus untuk prototyping) |
| `bun run db:studio` | Membuka web UI Drizzle Studio untuk melihat & mengedit isi database |

---

## 💻 Menjalankan Server

### Mode Development (Hot Reload)
```bash
bun run dev
```

### Mode Production
```bash
bun run start
```

### Type Checking
```bash
bun run typecheck
```

Server default berjalan di: `http://localhost:3000`

---

## 📡 API Endpoints

### Health Check
- **`GET /health`**
  - Response: `{ "status": "ok", "timestamp": "2026-11-20T..." }`

### Users CRUD
- **`GET /users`**
  - Mengambil daftar semua user.
- **`GET /users/:id`**
  - Mengambil detail satu user berdasarkan ID.
- **`POST /users`**
  - Membuat user baru.
  - Body (JSON):
    ```json
    {
      "name": "Surakh Bilal",
      "email": "bilal@example.com"
    }
    ```
- **`PUT /users/:id`**
  - Memperbarui data user berdasarkan ID.
  - Body (JSON, opsional):
    ```json
    {
      "name": "Nama Baru",
      "email": "baru@example.com"
    }
    ```
- **`DELETE /users/:id`**
  - Menghapus user berdasarkan ID.

### Registrasi User (Baru)
- **`POST /api/users`**
  - Mendaftarkan user baru dengan password yang di-hash menggunakan bcrypt.
  - Body (JSON):
    ```json
    {
      "name": "rakhbil",
      "email": "rakhbil@localhost",
      "password": "rahasia"
    }
    ```
  - Response Success (201):
    ```json
    {
      "data": "OK"
    }
    ```
  - Response Error (400 - Email Duplikat):
    ```json
    {
      "error": "Email sudah terdaftar"
    }
    ```

### Login User (Baru)
- **`POST /api/users/login`**
  - Autentikasi user dan membuat sesi login baru (token UUID).
  - Body (JSON):
    ```json
    {
      "email": "rakhbil@localhost",
      "password": "rahasia"
    }
    ```
  - Response Success (200):
    ```json
    {
      "data": "e2a3b4c5-..."
    }
    ```
  - Response Error (400 - Kredensial Salah):
    ```json
    {
      "error": "Email atau password salah"
    }
    ```

### Get Current User (Baru)
- **`GET /api/users/current`**
  - Mengambil data user yang sedang login berdasarkan Bearer token sesi.
  - Headers:
    ```
    Authorization: Bearer <token>
    ```
  - Response Success (200):
    ```json
    {
      "data": {
        "id": 1,
        "name": "Rakhbil",
        "email": "rakhbil@localhost",
        "created_at": "2026-11-20T09:00:00.000Z"
      }
    }
    ```
  - Response Error (401 - Unauthorized):
    ```json
    {
      "error": "Unauthorized"
    }
    ```

### Logout User (Baru)
- **`DELETE /api/users/current`**
  - Menghapus sesi login user saat ini dari database.
  - Headers:
    ```
    Authorization: Bearer <token>
    ```
  - Response Success (200):
    ```json
    {
      "data": "OK"
    }
    ```
  - Response Error (401 - Unauthorized):
    ```json
    {
      "error": "Unauthorized"
    }
    ```
