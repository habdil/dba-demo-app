// app.js - Frontend JavaScript untuk DBA Demo App
// Menghubungkan tampilan web dengan REST API backend

const API_BASE = '/api/users';

// ID user yang sedang diedit (untuk modal edit)
let currentEditId = null;

// ============================================================
// INISIALISASI - Jalankan saat halaman selesai dimuat
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  checkDbConnection();
  loadUsers();

  // Tangani submit form register
  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    registerUser();
  });
});

// ============================================================
// CEK STATUS KONEKSI DATABASE
// ============================================================
async function checkDbConnection() {
  const statusEl = document.getElementById('db-status');
  const textEl = statusEl.querySelector('.status-text');

  try {
    const res = await fetch(API_BASE);
    if (res.ok) {
      statusEl.className = 'db-status connected';
      textEl.textContent = 'Terhubung ke Neon PostgreSQL';
    } else {
      throw new Error();
    }
  } catch {
    statusEl.className = 'db-status error';
    textEl.textContent = 'Gagal terhubung ke database';
  }
}

// ============================================================
// LOAD SEMUA USER - Tampilkan di tabel
// ============================================================
let allUsers = []; // simpan data untuk keperluan filter

async function loadUsers() {
  const tbody = document.getElementById('user-tbody');
  tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Memuat data...</td></tr>';
  document.getElementById('user-count').textContent = '';
  document.getElementById('search-input').value = '';
  document.getElementById('filter-info').textContent = '';

  try {
    const res  = await fetch(API_BASE);
    const json = await res.json();

    // Tampilkan query di log
    if (json.query) addToLog('SELECT', 'Mengambil semua data user', json.query);

    if (!json.success || json.data.length === 0) {
      allUsers = [];
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Belum ada data user. Coba tambahkan user baru.</td></tr>';
      document.getElementById('user-count').textContent = '0 user';
      return;
    }

    allUsers = json.data;
    document.getElementById('user-count').textContent = `${allUsers.length} user`;
    renderTable(allUsers);

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Gagal memuat data. Pastikan server berjalan.</td></tr>';
  }
}

// Render baris tabel dari array data
function renderTable(data) {
  const tbody = document.getElementById('user-tbody');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Tidak ada hasil yang cocok.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(user => `
    <tr data-username="${escapeAttr(user.username)}" data-email="${escapeAttr(user.email)}">
      <td class="td-id">${user.id}</td>
      <td class="td-username">${escapeHtml(user.username)}</td>
      <td class="td-email">${escapeHtml(user.email)}</td>
      <td class="td-date">${formatDate(user.created_at)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-ghost btn-sm" title="Edit email" onclick="openEditModal(${user.id}, '${escapeAttr(user.username)}', '${escapeAttr(user.email)}')">✎</button>
          <button class="btn btn-ghost-danger btn-sm" title="Hapus user" onclick="deleteUser(${user.id}, '${escapeAttr(user.username)}')">✕</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Filter tabel berdasarkan input search
function filterTable() {
  const keyword   = document.getElementById('search-input').value.toLowerCase().trim();
  const infoEl    = document.getElementById('filter-info');

  if (!keyword) {
    renderTable(allUsers);
    infoEl.textContent = '';
    return;
  }

  const filtered = allUsers.filter(u =>
    u.username.toLowerCase().includes(keyword) ||
    u.email.toLowerCase().includes(keyword)
  );

  renderTable(filtered);
  infoEl.textContent = filtered.length === 0
    ? 'Tidak ada user yang cocok.'
    : `Menampilkan ${filtered.length} dari ${allUsers.length} user`;
}

// ============================================================
// REGISTER USER BARU
// ============================================================
async function registerUser() {
  const username = document.getElementById('username').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const msgEl    = document.getElementById('register-msg');

  setMsg(msgEl, '', '');

  try {
    const res  = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const json = await res.json();

    // Tampilkan query di log
    if (json.query) addToLog('INSERT', json.message, json.query);

    if (json.success) {
      setMsg(msgEl, json.message, 'success');
      document.getElementById('register-form').reset();
      loadUsers(); // Refresh tabel
    } else {
      setMsg(msgEl, json.message, 'error');
    }
  } catch (err) {
    setMsg(msgEl, 'Gagal terhubung ke server', 'error');
  }
}

// ============================================================
// BUKA MODAL EDIT EMAIL
// ============================================================
function openEditModal(id, username, currentEmail) {
  currentEditId = id;
  document.getElementById('edit-username-label').textContent = `Mengedit user: ${username} (ID: ${id})`;
  document.getElementById('edit-email').value = currentEmail;
  document.getElementById('edit-msg').textContent = '';
  document.getElementById('edit-modal').style.display = 'flex';
}

// ============================================================
// TUTUP MODAL EDIT
// ============================================================
function closeModal() {
  document.getElementById('edit-modal').style.display = 'none';
  currentEditId = null;
}

// ============================================================
// SIMPAN PERUBAHAN EMAIL (dari modal)
// ============================================================
async function saveEdit() {
  const email = document.getElementById('edit-email').value.trim();
  const msgEl = document.getElementById('edit-msg');

  if (!email) {
    setMsg(msgEl, 'Email tidak boleh kosong', 'error');
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/${currentEditId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await res.json();

    if (json.query) addToLog('UPDATE', json.message, json.query);

    if (json.success) {
      closeModal();
      loadUsers();
    } else {
      setMsg(msgEl, json.message, 'error');
    }
  } catch (err) {
    setMsg(msgEl, 'Gagal terhubung ke server', 'error');
  }
}

// ============================================================
// HAPUS USER
// ============================================================
async function deleteUser(id, username) {
  // Konfirmasi sebelum hapus
  if (!confirm(`Hapus user "${username}" (ID: ${id})?\nAksi ini tidak bisa dibatalkan.`)) return;

  try {
    const res  = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const json = await res.json();

    if (json.query) addToLog('DELETE', json.message, json.query);

    if (json.success) {
      loadUsers();
    } else {
      alert('Gagal menghapus: ' + json.message);
    }
  } catch (err) {
    alert('Gagal terhubung ke server');
  }
}

// ============================================================
// GRANT AKSES (DBA Panel)
// ============================================================
async function doGrant() {
  const targetUser = document.getElementById('grant-user').value.trim();
  const permission = document.getElementById('grant-perm').value;
  const tableName  = document.getElementById('grant-table').value.trim();
  const msgEl      = document.getElementById('grant-msg');

  if (!targetUser) {
    setMsg(msgEl, 'Nama user database wajib diisi', 'error');
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/dba/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUser, permission, tableName })
    });
    const json = await res.json();

    if (json.query) addToLog('GRANT', json.message + (json.penjelasan ? '\n→ ' + json.penjelasan : ''), json.query);

    if (json.success) {
      setMsg(msgEl, json.message, 'success');
    } else {
      setMsg(msgEl, json.message, 'error');
    }
  } catch (err) {
    setMsg(msgEl, 'Gagal terhubung ke server', 'error');
  }
}

// ============================================================
// REVOKE AKSES (DBA Panel)
// ============================================================
async function doRevoke() {
  const targetUser = document.getElementById('revoke-user').value.trim();
  const permission = document.getElementById('revoke-perm').value;
  const tableName  = document.getElementById('revoke-table').value.trim();
  const msgEl      = document.getElementById('revoke-msg');

  if (!targetUser) {
    setMsg(msgEl, 'Nama user database wajib diisi', 'error');
    return;
  }

  try {
    const res  = await fetch(`${API_BASE}/dba/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUser, permission, tableName })
    });
    const json = await res.json();

    if (json.query) addToLog('REVOKE', json.message + (json.penjelasan ? '\n→ ' + json.penjelasan : ''), json.query);

    if (json.success) {
      setMsg(msgEl, json.message, 'success');
    } else {
      setMsg(msgEl, json.message, 'error');
    }
  } catch (err) {
    setMsg(msgEl, 'Gagal terhubung ke server', 'error');
  }
}

// ============================================================
// HELPER: Tambahkan entri ke Query Log
// ============================================================
function addToLog(type, message, sql) {
  const logEl     = document.getElementById('query-log');
  const wrapperEl = document.getElementById('query-log-wrapper');

  // Hapus placeholder jika masih ada
  const placeholder = logEl.querySelector('.log-placeholder');
  if (placeholder) placeholder.remove();

  // Tentukan badge type
  const validTypes = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'GRANT', 'REVOKE'];
  const badgeType  = validTypes.includes(type) ? type : 'OTHER';

  // Buat elemen log baru
  const entryId = 'log-' + Date.now();
  const entry   = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `
    <div class="log-entry-header">
      <span class="log-badge ${badgeType}">${type}</span>
      <span class="log-time">${formatTime(new Date())}</span>
    </div>
    <div class="log-message">${escapeHtml(message)}</div>
    <div class="log-sql-wrapper">
      <div class="log-sql-toolbar">
        <span class="log-sql-toolbar-label">SQL</span>
        <button class="log-copy-btn" onclick="copyQuery('${entryId}', this)">Salin</button>
      </div>
      <pre class="log-sql" id="${entryId}">${escapeHtml(sql)}</pre>
    </div>
  `;

  // Tambahkan di bagian atas log (terbaru di atas)
  logEl.insertBefore(entry, logEl.firstChild);

  // Scroll ke atas agar entry terbaru langsung terlihat
  logEl.scrollTop = 0;

  // Update counter jumlah log
  updateLogCount();

  // Aktifkan shadow hint jika konten bisa di-scroll
  const canScroll = logEl.scrollHeight > logEl.clientHeight;
  wrapperEl.classList.toggle('has-overflow', canScroll);
}

// ============================================================
// HELPER: Update counter jumlah log
// ============================================================
function updateLogCount() {
  const logEl    = document.getElementById('query-log');
  const countEl  = document.getElementById('log-count');
  const entries  = logEl.querySelectorAll('.log-entry').length;
  countEl.textContent = entries > 0 ? `${entries} query` : '';
}

// ============================================================
// HELPER: Bersihkan Query Log
// ============================================================
function clearLog() {
  const logEl     = document.getElementById('query-log');
  const wrapperEl = document.getElementById('query-log-wrapper');
  logEl.innerHTML = '<div class="log-placeholder">Query SQL akan muncul di sini setelah kamu melakukan aksi di atas.</div>';
  wrapperEl.classList.remove('has-overflow');
  updateLogCount();
}

// ============================================================
// HELPER: Set pesan feedback form
// ============================================================
function setMsg(el, text, type) {
  el.textContent = text;
  el.className   = 'form-msg ' + type;
}

// ============================================================
// HELPER: Format tanggal
// ============================================================
function formatDate(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ============================================================
// HELPER: Format waktu untuk log
// ============================================================
function formatTime(date) {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

// ============================================================
// HELPER: Escape HTML untuk mencegah XSS
// ============================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Escape untuk nilai di dalam atribut HTML (onclick, dll)
function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}

// ============================================================
// HELPER: Salin query ke clipboard
// ============================================================
function copyQuery(preId, btn) {
  const text = document.getElementById(preId)?.textContent || '';
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Tersalin!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Salin';
      btn.classList.remove('copied');
    }, 1500);
  });
}

// Tutup modal jika klik di luar area modal
document.getElementById('edit-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Sembunyikan shadow hint kalau sudah scroll sampai bawah
document.getElementById('query-log').addEventListener('scroll', function() {
  const wrapperEl  = document.getElementById('query-log-wrapper');
  const atBottom   = this.scrollTop + this.clientHeight >= this.scrollHeight - 8;
  wrapperEl.classList.toggle('has-overflow', !atBottom);
});
