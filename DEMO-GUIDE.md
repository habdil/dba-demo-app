# Panduan Demo — DBA User Management System

Dokumen ini berisi langkah-langkah demo yang bisa diikuti step-by-step di depan mahasiswa.  
Durasi estimasi: **45–60 menit**.

---

## Persiapan Sebelum Demo

Pastikan sebelum kelas dimulai:

- [ ] Server sudah berjalan (`node index.js`)
- [ ] Browser sudah terbuka di `http://localhost:3000`
- [ ] Tab kedua browser sudah terbuka di **Neon Console** → SQL Editor
- [ ] Proyektor / layar sudah terhubung
- [ ] File `.env` sudah berisi connection string yang valid

---

## Alur Demo

---

### Bagian 1 — Pengenalan Sistem (5 menit)

**Tunjukkan tampilan web di browser.**

> *"Ini adalah aplikasi web sederhana yang terhubung langsung ke database PostgreSQL yang ada di cloud — namanya Neon. Setiap aksi yang kita lakukan di sini, langsung tersimpan ke database sungguhan."*

Poin yang dijelaskan:
- Section **Register User** → untuk menambah data (INSERT)
- Section **Tabel Data** → menampilkan isi database (SELECT)
- Section **DBA Panel** → simulasi manajemen akses
- Section **SQL Query Log** → ini yang menarik: setiap aksi menampilkan query SQL-nya

---

### Bagian 2 — Demo CRUD (20 menit)

#### 2.1 Tambah User Baru (INSERT)

1. Isi form Register:
   - Username: `budi_santoso`
   - Email: `budi@email.com`
   - Password: `pass123`
2. Klik **Register User**
3. **Tunjukkan di Query Log** — query INSERT yang muncul:
   ```sql
   INSERT INTO users (username, email, password)
   VALUES ('budi_santoso', 'budi@email.com', 'pass123')
   RETURNING id, username, email, created_at;
   ```
4. Tambah 2–3 user lagi agar tabel terlihat berisi data

> *"Perhatikan query yang muncul di bawah. Ini adalah perintah SQL yang sebenarnya dikirim ke Neon PostgreSQL. Kalian bisa copy dan coba langsung di SQL Editor."*

---

#### 2.2 Lihat Data di Tabel (SELECT)

1. Klik tombol **Refresh** di section tabel
2. **Tunjukkan di Query Log:**
   ```sql
   SELECT id, username, email, created_at FROM users ORDER BY created_at DESC
   ```

> *"Setiap kali halaman dimuat, aplikasi menjalankan query SELECT ini ke database untuk mengambil data terbaru."*

---

#### 2.3 Edit Email User (UPDATE)

1. Pilih salah satu user, klik tombol **Edit**
2. Ganti email-nya
3. Klik **Simpan**
4. **Tunjukkan di Query Log:**
   ```sql
   UPDATE users
   SET email = 'email.baru@gmail.com'
   WHERE id = 1
   RETURNING id, username, email;
   ```

> *"Perhatikan klausa WHERE — ini penting! Kalau tidak ada WHERE, semua baris di tabel akan ikut terupdate. Inilah kenapa seorang DBA harus hati-hati saat menjalankan UPDATE."*

---

#### 2.4 Hapus User (DELETE)

1. Pilih salah satu user, klik tombol **Hapus**
2. Konfirmasi di dialog
3. **Tunjukkan di Query Log:**
   ```sql
   DELETE FROM users WHERE id = 3;
   ```

> *"Sama seperti UPDATE, DELETE tanpa WHERE akan menghapus SEMUA data. Selalu verifikasi kondisi WHERE sebelum eksekusi."*

---

### Bagian 3 — Verifikasi di Neon SQL Editor (10 menit)

**Pindah ke tab browser Neon Console → SQL Editor.**

> *"Sekarang kita buktikan bahwa data yang tadi kita masukkan lewat web, benar-benar tersimpan di cloud database."*

Jalankan query berikut satu per satu:

**1. Lihat semua data:**
```sql
SELECT * FROM users ORDER BY id;
```

**2. Hitung jumlah user:**
```sql
SELECT COUNT(*) AS total_user FROM users;
```

**3. Lihat struktur tabel:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**4. Tambah data langsung dari SQL Editor:**
```sql
INSERT INTO users (username, email, password)
VALUES ('demo_sql', 'demo@neon.tech', 'secret')
RETURNING *;
```

Kembali ke browser, klik **Refresh** — data baru langsung muncul.

> *"Terbukti — web app dan SQL Editor berbicara ke database yang sama."*

---

### Bagian 4 — Demo DBA Panel: GRANT & REVOKE (15 menit)

**Kembali ke browser, scroll ke section DBA Panel.**

#### Konsep Awal (jelaskan dulu)

> *"Di dunia nyata, sebuah database tidak hanya punya satu user. Ada developer, ada reporter, ada aplikasi — masing-masing hanya boleh melakukan hal tertentu. Inilah tugas DBA: mengatur siapa boleh melakukan apa."*

Gambarkan skenario:
| User Database | Boleh Lakukan |
|---|---|
| `app_backend` | SELECT, INSERT, UPDATE |
| `reporter` | SELECT saja |
| `admin_db` | ALL (semua) |
| `guest` | Tidak ada |

---

#### 4.1 Simulasi GRANT

1. Di DBA Panel bagian **GRANT**:
   - Nama User Database: `reporter`
   - Permission: `SELECT`
   - Nama Tabel: `users`
2. Klik **Jalankan GRANT**
3. **Tunjukkan query yang muncul di Query Log:**
   ```sql
   GRANT SELECT ON TABLE users TO reporter;
   ```

> *"Dengan perintah ini, user 'reporter' sekarang bisa menjalankan SELECT pada tabel users — tapi tidak bisa INSERT, UPDATE, atau DELETE."*

---

#### 4.2 Coba Permission Berbeda

Ulangi GRANT dengan skenario berbeda:
- Permission: `ALL`, User: `admin_db`
- Permission: `INSERT`, User: `app_backend`

Setiap kali, **tunjukkan query yang berbeda** di log.

---

#### 4.3 Simulasi REVOKE

1. Di DBA Panel bagian **REVOKE**:
   - Nama User Database: `reporter`
   - Permission: `SELECT`
   - Nama Tabel: `users`
2. Klik **Jalankan REVOKE**
3. **Tunjukkan query di Query Log:**
   ```sql
   REVOKE SELECT ON TABLE users FROM reporter;
   ```

> *"REVOKE mencabut hak yang sudah diberikan. User 'reporter' sekarang kembali tidak punya akses."*

---

#### 4.4 Demo GRANT & REVOKE di Neon SQL Editor (opsional)

Pindah ke Neon Console → SQL Editor, tunjukkan query asli:

```sql
-- Buat role khusus untuk demo
CREATE ROLE role_readonly;

-- Berikan SELECT ke role
GRANT SELECT ON TABLE users TO role_readonly;

-- Cek siapa yang punya akses ke tabel users
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants
WHERE table_name = 'users';

-- Cabut akses
REVOKE SELECT ON TABLE users FROM role_readonly;
```

---

### Bagian 5 — Diskusi & Tanya Jawab (5–10 menit)

Pertanyaan pemantik diskusi:

1. **"Kenapa password di tabel disimpan sebagai teks biasa? Apa risikonya?"**  
   → Arahkan ke konsep hashing (bcrypt, Argon2)

2. **"Kalau kalian jadi DBA di perusahaan, siapa yang kalian beri akses ALL?"**  
   → Diskusi prinsip *least privilege*

3. **"Apa bedanya GRANT ke user langsung vs GRANT ke role?"**  
   → Role memudahkan pengelolaan grup user

4. **"Bagaimana cara tahu siapa saja yang punya akses ke tabel tertentu?"**  
   → Tunjukkan query `information_schema.role_table_grants`

---

## Catatan Pengajar

- **Query Log** adalah fitur paling penting untuk demo — selalu arahkan perhatian mahasiswa ke sana setiap kali ada aksi
- Urutan CRUD → Neon Console → DBA Panel sangat disengaja: dari konkret (web) ke abstrak (SQL) ke konsep (hak akses)
- Jika ada mahasiswa bertanya soal keamanan password, ini momen bagus untuk memperkenalkan *bcrypt* sebagai topik lanjutan
- DBA Panel mode **simulasi** — query GRANT/REVOKE ditampilkan tapi tidak dieksekusi ke Neon (karena keterbatasan free tier). Untuk eksekusi nyata, gunakan Neon SQL Editor

---

## Troubleshooting Cepat Saat Demo

| Masalah | Solusi Cepat |
|---|---|
| Web tidak bisa dibuka | Pastikan `node index.js` sudah jalan di terminal |
| Data tidak muncul di tabel | Klik Refresh, cek koneksi database di pojok kanan atas |
| Error saat Register | Kemungkinan username/email duplikat — coba nama berbeda |
| Neon SQL Editor lambat | Refresh halaman Neon Console, tunggu sebentar |
| Port 3000 sudah terpakai | Ganti PORT di `.env` ke 3001, restart server |
