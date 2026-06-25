# DBA Demo — User Management System

Aplikasi demo **sistem manajemen user** untuk pembelajaran konsep **Database Administrator (DBA)** menggunakan Node.js, Express.js, dan **Neon PostgreSQL** (serverless).

Dirancang khusus untuk hands-on di kelas — setiap query SQL yang dieksekusi ditampilkan secara real-time di antarmuka web.

---

## Tampilan Fitur

| Fitur | Keterangan |
|---|---|
| Register User | Tambah user baru ke database (INSERT) |
| Tabel Data | Tampilkan semua user (SELECT) |
| Edit Email | Update email user (UPDATE) |
| Hapus User | Hapus user dari database (DELETE) |
| DBA Panel | Simulasi GRANT dan REVOKE akses |
| SQL Query Log | Tampilkan raw query yang dieksekusi secara real-time |

---

## Prerequisites

Pastikan sudah terinstall di komputer kamu:

1. **Node.js** versi 18 ke atas  
   Download: https://nodejs.org  
   Cek versi: `node --version`

2. **npm** (sudah otomatis terinstall bersama Node.js)  
   Cek versi: `npm --version`

3. **Akun Neon** (gratis)  
   Daftar di: https://neon.tech

---

## Setup Neon PostgreSQL (Langkah Lengkap)

### Langkah 1 — Buat Akun Neon
1. Buka https://neon.tech
2. Klik **Sign Up** — bisa menggunakan akun GitHub atau Google
3. Ikuti proses verifikasi email jika diminta

### Langkah 2 — Buat Project Baru
1. Setelah login, klik tombol **New Project**
2. Isi konfigurasi:
   - **Project name**: `dba-demo` (atau nama apa saja)
   - **Database name**: `neondb` (biarkan default)
   - **Region**: Pilih yang paling dekat, misalnya `Asia Pacific (Singapore)`
   - **PostgreSQL version**: Pilih versi terbaru (16 atau 17)
3. Klik **Create Project**
4. Neon akan membuat database dan menampilkan halaman detail project

### Langkah 3 — Ambil Connection String
1. Di halaman project, cari section **Connection string**
2. Pastikan mode yang dipilih adalah **Node.js**
3. Salin string koneksi yang terlihat seperti ini:
   ```
   postgresql://neondb_owner:AbcXyz123@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **Simpan string ini** — akan dipakai di file `.env`

> **Tips:** Kamu juga bisa menemukan connection string kapan saja di:  
> Neon Dashboard → Project kamu → tab **Connection Details**

---

## Install dan Konfigurasi

### Langkah 1 — Clone / Download Project
Jika kamu menggunakan Git:
```bash
git clone <url-repo>
cd dba-demo-app
```

Atau extract folder project ke direktori pilihan kamu.

### Langkah 2 — Install Dependencies
Buka terminal di folder project, lalu jalankan:
```bash
npm install
```

Perintah ini akan menginstall:
- `express` — framework web server
- `pg` — driver koneksi ke PostgreSQL
- `dotenv` — membaca variabel dari file `.env`
- `cors` — mengizinkan request dari browser

### Langkah 3 — Konfigurasi File .env
Buka file `.env` di folder project, ganti nilai `DATABASE_URL` dengan connection string dari Neon kamu:

```env
DATABASE_URL=postgresql://neondb_owner:PASSWORD_KAMU@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

PORT=3000
```

> **Penting:** Jangan pernah upload file `.env` ke GitHub atau bagikan ke orang lain — file ini berisi password database kamu.

---

## Menjalankan Aplikasi

```bash
node index.js
```

Atau menggunakan npm:
```bash
npm start
```

Jika berhasil, terminal akan menampilkan:
```
✅ Berhasil terhubung ke Neon PostgreSQL
✅ Tabel "users" siap digunakan

========================================
  🚀 Server berjalan!
  📌 Buka di browser: http://localhost:3000
========================================
```

Buka browser dan akses: **http://localhost:3000**

---

## Struktur Folder

```
project/
├── .env              # Konfigurasi environment (DATABASE_URL)
├── index.js          # Entry point — server Express + inisialisasi DB
├── db.js             # Konfigurasi koneksi pool ke Neon PostgreSQL
├── package.json      # Dependensi Node.js
├── routes/
│   └── users.js      # Semua endpoint API (CRUD + DBA)
└── public/
    ├── index.html    # Halaman utama (struktur HTML)
    ├── style.css     # Styling tampilan
    └── app.js        # JavaScript frontend (fetch API, render DOM)
```

---

## Dokumentasi REST API

Base URL: `http://localhost:3000/api/users`

---

### GET /api/users
Mengambil semua data user dari database.

**Request:**
```
GET /api/users
```

**Response sukses:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "budi_santoso",
      "email": "budi@email.com",
      "created_at": "2024-01-15T08:30:00.000Z"
    }
  ],
  "count": 1,
  "query": "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC"
}
```

---

### POST /api/users
Menambahkan user baru ke database.

**Request:**
```
POST /api/users
Content-Type: application/json

{
  "username": "siti_rahayu",
  "email": "siti@email.com",
  "password": "password123"
}
```

**Response sukses:**
```json
{
  "success": true,
  "message": "User 'siti_rahayu' berhasil ditambahkan",
  "data": {
    "id": 2,
    "username": "siti_rahayu",
    "email": "siti@email.com",
    "created_at": "2024-01-15T08:35:00.000Z"
  },
  "query": "INSERT INTO users (username, email, password)\nVALUES ('siti_rahayu', 'siti@email.com', 'password123')\nRETURNING id, username, email, created_at;"
}
```

**Response error (duplikat):**
```json
{
  "success": false,
  "message": "Username atau email sudah digunakan"
}
```

---

### PUT /api/users/:id
Memperbarui email user berdasarkan ID.

**Request:**
```
PUT /api/users/2
Content-Type: application/json

{
  "email": "siti.baru@email.com"
}
```

**Response sukses:**
```json
{
  "success": true,
  "message": "Email user ID 2 berhasil diperbarui",
  "data": {
    "id": 2,
    "username": "siti_rahayu",
    "email": "siti.baru@email.com"
  },
  "query": "UPDATE users\nSET email = 'siti.baru@email.com'\nWHERE id = 2\nRETURNING id, username, email;"
}
```

---

### DELETE /api/users/:id
Menghapus user berdasarkan ID.

**Request:**
```
DELETE /api/users/2
```

**Response sukses:**
```json
{
  "success": true,
  "message": "User 'siti_rahayu' berhasil dihapus",
  "query": "DELETE FROM users WHERE id = 2;"
}
```

---

### POST /api/users/dba/grant
Simulasi pemberian hak akses (GRANT) ke user database.

**Request:**
```
POST /api/users/dba/grant
Content-Type: application/json

{
  "targetUser": "mahasiswa_db",
  "permission": "SELECT",
  "tableName": "users"
}
```

**Response:**
```json
{
  "success": true,
  "message": "[SIMULASI] GRANT SELECT berhasil diberikan ke 'mahasiswa_db'",
  "penjelasan": "GRANT memberikan hak akses 'SELECT' pada tabel 'users' kepada user 'mahasiswa_db'...",
  "query": "GRANT SELECT ON TABLE users TO mahasiswa_db;"
}
```

---

### POST /api/users/dba/revoke
Simulasi pencabutan hak akses (REVOKE) dari user database.

**Request:**
```
POST /api/users/dba/revoke
Content-Type: application/json

{
  "targetUser": "mahasiswa_db",
  "permission": "SELECT",
  "tableName": "users"
}
```

**Response:**
```json
{
  "success": true,
  "message": "[SIMULASI] REVOKE SELECT berhasil dicabut dari 'mahasiswa_db'",
  "penjelasan": "REVOKE mencabut hak akses 'SELECT' pada tabel 'users' dari user 'mahasiswa_db'...",
  "query": "REVOKE SELECT ON TABLE users FROM mahasiswa_db;"
}
```

---

## Konsep DBA: GRANT dan REVOKE

### Apa itu GRANT?

`GRANT` adalah perintah SQL yang digunakan oleh DBA untuk **memberikan hak akses (privilege)** kepada user atau role tertentu pada objek database (tabel, view, function, dll).

**Sintaks:**
```sql
GRANT privilege ON objek TO user;
```

**Jenis privilege yang umum:**
| Privilege | Keterangan |
|---|---|
| `SELECT` | Bisa membaca data (query SELECT) |
| `INSERT` | Bisa menambah data baru |
| `UPDATE` | Bisa mengubah data yang ada |
| `DELETE` | Bisa menghapus data |
| `ALL` | Semua privilege di atas sekaligus |

**Contoh:**
```sql
-- Izinkan user 'reporter' hanya bisa membaca tabel users
GRANT SELECT ON TABLE users TO reporter;

-- Izinkan user 'app_user' bisa INSERT dan SELECT
GRANT SELECT, INSERT ON TABLE users TO app_user;
```

---

### Apa itu REVOKE?

`REVOKE` adalah kebalikan dari GRANT — digunakan untuk **mencabut hak akses** yang sebelumnya sudah diberikan.

**Sintaks:**
```sql
REVOKE privilege ON objek FROM user;
```

**Contoh:**
```sql
-- Cabut semua hak akses user 'reporter' dari tabel users
REVOKE ALL ON TABLE users FROM reporter;

-- Cabut hanya hak DELETE dari user 'app_user'
REVOKE DELETE ON TABLE users FROM app_user;
```

---

### Mengapa GRANT dan REVOKE Penting?

1. **Keamanan (Security)** — Mencegah user yang tidak berwenang mengakses atau memodifikasi data sensitif
2. **Least Privilege Principle** — Setiap user hanya boleh punya hak akses minimum yang diperlukan untuk tugasnya
3. **Audit & Compliance** — DBA bisa mengontrol dan melacak siapa yang bisa melakukan apa
4. **Manajemen Tim** — Developer hanya dapat SELECT, Admin mendapat ALL, dsb.

---

## SQL Demo untuk Neon SQL Editor

Buka **Neon Console** → project kamu → tab **SQL Editor**, lalu coba query-query berikut:

---

### 1. Membuat Tabel users

```sql
-- Membuat tabel users dengan beberapa kolom
-- SERIAL = auto increment (angka bertambah otomatis)
-- UNIQUE = tidak boleh ada nilai duplikat
-- NOT NULL = kolom wajib diisi
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50) UNIQUE NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. INSERT — Menambah Data Contoh

```sql
-- Menambah beberapa user contoh sekaligus
INSERT INTO users (username, email, password) VALUES
  ('budi_santoso',   'budi@email.com',   'pass123'),
  ('siti_rahayu',    'siti@email.com',   'pass456'),
  ('andi_wijaya',    'andi@email.com',   'pass789'),
  ('dewi_permata',   'dewi@email.com',   'pass321'),
  ('reza_pratama',   'reza@email.com',   'pass654');
```

---

### 3. SELECT — Membaca Semua Data

```sql
-- Mengambil semua kolom dari tabel users
-- ORDER BY created_at DESC = urutkan dari yang terbaru
SELECT id, username, email, created_at
FROM users
ORDER BY created_at DESC;
```

---

### 4. SELECT dengan WHERE — Filter Data

```sql
-- Mencari user berdasarkan username tertentu
SELECT * FROM users
WHERE username = 'budi_santoso';

-- Mencari user yang emailnya mengandung kata 'email.com'
SELECT * FROM users
WHERE email LIKE '%email.com';

-- Mengambil hanya 3 user pertama
SELECT * FROM users
ORDER BY id ASC
LIMIT 3;
```

---

### 5. UPDATE — Mengubah Data

```sql
-- Mengubah email user dengan id = 1
-- PENTING: Selalu gunakan WHERE agar tidak mengubah semua baris!
UPDATE users
SET email = 'budi.baru@gmail.com'
WHERE id = 1;

-- Cek hasilnya
SELECT * FROM users WHERE id = 1;
```

---

### 6. DELETE — Menghapus Data

```sql
-- Menghapus user dengan username tertentu
-- PENTING: Selalu gunakan WHERE agar tidak menghapus semua data!
DELETE FROM users
WHERE username = 'reza_pratama';

-- Cek sisa data
SELECT COUNT(*) AS total_user FROM users;
```

---

### 7. CREATE USER — Membuat User PostgreSQL Baru

```sql
-- Membuat user baru di PostgreSQL (bukan user di tabel kita)
-- Ini adalah user yang bisa login ke database server
CREATE USER mahasiswa_db WITH PASSWORD 'passwordrahasia';

-- Membuat role (group) untuk mengelompokkan hak akses
CREATE ROLE role_readonly;
```

> **Catatan:** Di Neon free tier, CREATE USER mungkin memerlukan hak superuser. Konsep ini lebih relevan untuk PostgreSQL yang di-install sendiri atau Neon dengan plan berbayar.

---

### 8. GRANT — Memberikan Hak Akses

```sql
-- Berikan hak SELECT (hanya baca) ke user mahasiswa_db pada tabel users
GRANT SELECT ON TABLE users TO mahasiswa_db;

-- Berikan hak SELECT dan INSERT (baca dan tambah data)
GRANT SELECT, INSERT ON TABLE users TO mahasiswa_db;

-- Berikan SEMUA hak akses
GRANT ALL ON TABLE users TO mahasiswa_db;

-- Berikan hak akses pada role, lalu assign role ke user
GRANT SELECT ON TABLE users TO role_readonly;
GRANT role_readonly TO mahasiswa_db;
```

---

### 9. REVOKE — Mencabut Hak Akses

```sql
-- Cabut hak DELETE dari user mahasiswa_db
REVOKE DELETE ON TABLE users FROM mahasiswa_db;

-- Cabut semua hak akses dari user mahasiswa_db
REVOKE ALL ON TABLE users FROM mahasiswa_db;

-- Cabut role dari user
REVOKE role_readonly FROM mahasiswa_db;
```

---

### 10. Cek Hak Akses yang Dimiliki User

```sql
-- Lihat semua privilege pada tabel users
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants
WHERE table_name = 'users';

-- Lihat semua user dan role di database
SELECT usename AS username, usesuper AS is_superuser
FROM pg_user
ORDER BY usename;
```

---

### 11. Query Berguna Lainnya untuk Demo

```sql
-- Hitung jumlah total user
SELECT COUNT(*) AS total_user FROM users;

-- Cari user yang dibuat hari ini
SELECT * FROM users
WHERE created_at::date = CURRENT_DATE;

-- Tampilkan struktur tabel
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

---

## Troubleshooting

### Error: `ECONNREFUSED` atau `connect ETIMEDOUT`
**Penyebab:** Connection string salah atau Neon project tidak aktif.  
**Solusi:**
1. Pastikan `DATABASE_URL` di file `.env` sudah benar dan tidak ada spasi
2. Buka Neon Console dan pastikan project dalam status **Active** (bukan Suspended)
3. Coba salin ulang connection string dari Neon Console

---

### Error: `password authentication failed`
**Penyebab:** Password di connection string salah.  
**Solusi:**
1. Buka Neon Console → Connection Details
2. Reset password jika perlu dengan klik **Reset Password**
3. Salin ulang connection string yang baru

---

### Error: `Cannot find module 'express'`
**Penyebab:** Dependencies belum diinstall.  
**Solusi:**
```bash
npm install
```

---

### Error: `Error: listen EADDRINUSE: address already in use :::3000`
**Penyebab:** Port 3000 sudah dipakai proses lain.  
**Solusi:**
- Hentikan proses lain yang menggunakan port 3000, atau
- Ganti PORT di file `.env`:
  ```env
  PORT=3001
  ```
  Lalu akses di `http://localhost:3001`

---

### Halaman web tidak bisa akses API (CORS error)
**Penyebab:** Browser memblokir request karena CORS policy.  
**Solusi:** Pastikan middleware `cors` sudah aktif di `index.js` (sudah dikonfigurasi secara default).

---

### Tabel tidak terbuat otomatis
**Penyebab:** Koneksi ke database gagal saat server pertama kali dijalankan.  
**Solusi:**
1. Periksa pesan error di terminal
2. Pastikan koneksi database berhasil (lihat log `✅ Berhasil terhubung`)
3. Jalankan ulang server setelah masalah koneksi diperbaiki

---

## Catatan untuk Pengajar

- **DBA Panel** menggunakan mode **simulasi** — query GRANT dan REVOKE ditampilkan tapi tidak dieksekusi ke database nyata, karena Neon free tier membatasi pembuatan user PostgreSQL tambahan
- Untuk demo GRANT/REVOKE yang nyata, gunakan **Neon SQL Editor** di website neon.tech
- Kolom `password` disimpan sebagai plain text untuk kemudahan demo — **jangan gunakan pola ini di aplikasi production**
- Query Log di frontend menampilkan query dengan nilai asli (bukan `$1, $2`) agar mudah dipahami mahasiswa
