// db.js - Modul koneksi ke database PostgreSQL (Neon)
// Menggunakan library 'pg' (node-postgres)

const { Pool } = require('pg');
require('dotenv').config();

// Membuat pool koneksi ke Neon PostgreSQL
// Pool = kumpulan koneksi yang bisa digunakan ulang (efisien)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Diperlukan untuk koneksi ke Neon (serverless)
  }
});

// Test koneksi saat modul dimuat
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Gagal terhubung ke database:', err.message);
    return;
  }
  console.log('✅ Berhasil terhubung ke Neon PostgreSQL');
  release(); // Kembalikan koneksi ke pool setelah selesai test
});

module.exports = pool;
