// routes/users.js - Semua endpoint API untuk manajemen user
// Setiap endpoint mengembalikan juga raw SQL query untuk ditampilkan di frontend

const express = require('express');
const router = express.Router();
const pool = require('../db');

// ============================================================
// GET /api/users - Ambil semua data user dari database
// ============================================================
router.get('/', async (req, res) => {
  // Query SQL untuk mengambil semua user, diurutkan dari terbaru
  const sql = 'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC';

  try {
    const result = await pool.query(sql);
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
      query: sql // Kirim raw query ke frontend
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data user',
      error: err.message,
      query: sql
    });
  }
});

// ============================================================
// POST /api/users - Tambah user baru (Register)
// ============================================================
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  // Validasi: semua field harus diisi
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, dan password wajib diisi',
      query: null
    });
  }

  // Query SQL untuk insert user baru
  // RETURNING * = kembalikan data yang baru dimasukkan
  const sql = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at`;
  const values = [username, email, password];

  // Query yang akan ditampilkan di frontend (dengan nilai asli, bukan placeholder)
  const displayQuery = `INSERT INTO users (username, email, password)\nVALUES ('${username}', '${email}', '${password}')\nRETURNING id, username, email, created_at;`;

  try {
    const result = await pool.query(sql, values);
    res.status(201).json({
      success: true,
      message: `User '${username}' berhasil ditambahkan`,
      data: result.rows[0],
      query: displayQuery
    });
  } catch (err) {
    // Tangani error duplikat username atau email
    let pesan = 'Gagal menambahkan user';
    if (err.code === '23505') {
      pesan = 'Username atau email sudah digunakan';
    }
    res.status(500).json({
      success: false,
      message: pesan,
      error: err.message,
      query: displayQuery
    });
  }
});

// ============================================================
// PUT /api/users/:id - Update email user berdasarkan ID
// ============================================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  // Validasi: email harus diisi
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email baru wajib diisi',
      query: null
    });
  }

  // Query SQL untuk update email user
  const sql = `UPDATE users SET email = $1 WHERE id = $2 RETURNING id, username, email`;
  const values = [email, id];
  const displayQuery = `UPDATE users\nSET email = '${email}'\nWHERE id = ${id}\nRETURNING id, username, email;`;

  try {
    const result = await pool.query(sql, values);

    // Jika tidak ada baris yang terupdate, berarti ID tidak ditemukan
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `User dengan ID ${id} tidak ditemukan`,
        query: displayQuery
      });
    }

    res.json({
      success: true,
      message: `Email user ID ${id} berhasil diperbarui`,
      data: result.rows[0],
      query: displayQuery
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui email',
      error: err.message,
      query: displayQuery
    });
  }
});

// ============================================================
// DELETE /api/users/:id - Hapus user berdasarkan ID
// ============================================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Query SQL untuk menghapus user
  const sql = `DELETE FROM users WHERE id = $1 RETURNING id, username`;
  const displayQuery = `DELETE FROM users WHERE id = ${id};`;

  try {
    const result = await pool.query(sql, [id]);

    // Jika tidak ada baris yang terhapus, berarti ID tidak ditemukan
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `User dengan ID ${id} tidak ditemukan`,
        query: displayQuery
      });
    }

    res.json({
      success: true,
      message: `User '${result.rows[0].username}' berhasil dihapus`,
      query: displayQuery
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus user',
      error: err.message,
      query: displayQuery
    });
  }
});

// ============================================================
// POST /api/users/dba/grant - Simulasi GRANT akses database
// ============================================================
router.post('/dba/grant', async (req, res) => {
  const { targetUser, permission, tableName } = req.body;

  if (!targetUser || !permission || !tableName) {
    return res.status(400).json({
      success: false,
      message: 'targetUser, permission, dan tableName wajib diisi',
      query: null
    });
  }

  // Query GRANT — ini adalah simulasi konsep, bukan eksekusi nyata
  // Di Neon free tier, kita tidak bisa buat user PostgreSQL baru
  const displayQuery = `GRANT ${permission.toUpperCase()} ON TABLE ${tableName} TO ${targetUser};`;

  // Penjelasan konsep GRANT untuk edukasi
  const penjelasan = `GRANT memberikan hak akses '${permission.toUpperCase()}' pada tabel '${tableName}' kepada user '${targetUser}'. Setelah ini, '${targetUser}' dapat melakukan operasi ${permission.toUpperCase()} pada tabel tersebut.`;

  res.json({
    success: true,
    message: `[SIMULASI] GRANT ${permission.toUpperCase()} berhasil diberikan ke '${targetUser}'`,
    penjelasan,
    query: displayQuery
  });
});

// ============================================================
// POST /api/users/dba/revoke - Simulasi REVOKE akses database
// ============================================================
router.post('/dba/revoke', async (req, res) => {
  const { targetUser, permission, tableName } = req.body;

  if (!targetUser || !permission || !tableName) {
    return res.status(400).json({
      success: false,
      message: 'targetUser, permission, dan tableName wajib diisi',
      query: null
    });
  }

  // Query REVOKE — simulasi konsep DBA
  const displayQuery = `REVOKE ${permission.toUpperCase()} ON TABLE ${tableName} FROM ${targetUser};`;

  const penjelasan = `REVOKE mencabut hak akses '${permission.toUpperCase()}' pada tabel '${tableName}' dari user '${targetUser}'. Setelah ini, '${targetUser}' tidak lagi bisa melakukan operasi ${permission.toUpperCase()} pada tabel tersebut.`;

  res.json({
    success: true,
    message: `[SIMULASI] REVOKE ${permission.toUpperCase()} berhasil dicabut dari '${targetUser}'`,
    penjelasan,
    query: displayQuery
  });
});

module.exports = router;
