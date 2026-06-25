// index.js - Entry point aplikasi
// Menjalankan server Express dan membuat tabel otomatis jika belum ada

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE - Konfigurasi Express
// ============================================================

// Aktifkan CORS agar frontend bisa akses API dari domain berbeda
app.use(cors());

// Parse body request dalam format JSON
app.use(express.json());

// Sajikan file statis dari folder 'public' (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// INISIALISASI DATABASE - Buat tabel jika belum ada
// ============================================================
async function initDatabase() {
  // Query untuk membuat tabel users
  // IF NOT EXISTS = tidak error jika tabel sudah ada
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      username   VARCHAR(50) UNIQUE NOT NULL,
      email      VARCHAR(100) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(createTableQuery);
    console.log('✅ Tabel "users" siap digunakan');
  } catch (err) {
    console.error('❌ Gagal membuat tabel:', err.message);
    process.exit(1); // Hentikan server jika tabel tidak bisa dibuat
  }
}

// ============================================================
// ROUTES - Daftarkan semua endpoint API
// ============================================================

// Semua endpoint user (CRUD + DBA) terdaftar di satu router
// Endpoint yang tersedia:
//   GET    /api/users          → ambil semua user
//   POST   /api/users          → tambah user baru
//   PUT    /api/users/:id      → update email user
//   DELETE /api/users/:id      → hapus user
//   POST   /api/users/dba/grant  → simulasi GRANT
//   POST   /api/users/dba/revoke → simulasi REVOKE
app.use('/api/users', usersRouter);

// Route untuk halaman utama — kirim file index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
// JALANKAN SERVER
// ============================================================
async function startServer() {
  await initDatabase(); // Pastikan database siap dulu

  app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('  🚀 Server berjalan!');
    console.log(`  📌 Buka di browser: http://localhost:${PORT}`);
    console.log('========================================');
    console.log('');
  });
}

startServer();
