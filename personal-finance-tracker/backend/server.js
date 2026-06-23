const express = require('express');
const initSqlJs = require('sql.js');
const helmet = require('helmet');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'database.db');

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', /^http:\/\/192\.168\./],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Database (sql.js) ───────────────────────────────────────────────────────
let db;

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function execute(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] ?? null;
  const changes = db.exec('SELECT changes() as n')[0]?.values[0]?.[0] ?? 0;
  saveDB();
  return { lastInsertRowid: lastId, changes };
}

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Database dimuat dari file:', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ Database baru dibuat di:', DB_PATH);
  }

  execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      nama       TEXT    NOT NULL,
      jenis      TEXT    NOT NULL CHECK(jenis IN ('pemasukan','pengeluaran')),
      nominal    INTEGER NOT NULL CHECK(nominal > 0),
      created_at TEXT    DEFAULT (datetime('now','localtime'))
    )
  `);
  // saveDB called in execute above
}

// ─── Validation ──────────────────────────────────────────────────────────────
const transactionValidation = [
  body('nama')
    .trim()
    .notEmpty().withMessage('Nama transaksi wajib diisi')
    .isLength({ min: 1, max: 255 }).withMessage('Nama harus 1-255 karakter')
    .escape(),
  body('jenis')
    .trim()
    .isIn(['pemasukan', 'pengeluaran']).withMessage('Jenis harus "pemasukan" atau "pengeluaran"'),
  body('nominal')
    .isInt({ min: 1 }).withMessage('Nominal harus angka bulat positif minimal 1')
    .toInt()
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID tidak valid').toInt()
];

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
    return true;
  }
  return false;
}

// ─── Routes ─────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server berjalan', timestamp: new Date().toISOString() });
});

// GET all transactions
app.get('/api/transactions', (req, res) => {
  try {
    const transactions = queryAll('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json({ success: true, data: transactions });
  } catch (err) {
    console.error('GET /api/transactions:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi' });
  }
});

// GET summary
app.get('/api/transactions/summary', (req, res) => {
  try {
    const rows = queryAll(`
      SELECT jenis, SUM(nominal) as total, COUNT(*) as count
      FROM transactions
      GROUP BY jenis
    `);

    const result = { pemasukan: 0, pengeluaran: 0, pemasukan_count: 0, pengeluaran_count: 0 };
    rows.forEach(row => {
      result[row.jenis] = row.total;
      result[`${row.jenis}_count`] = row.count;
    });
    result.saldo = result.pemasukan - result.pengeluaran;

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('GET /api/transactions/summary:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan' });
  }
});

// POST new transaction
app.post('/api/transactions', transactionValidation, (req, res) => {
  if (handleValidation(req, res)) return;
  const { nama, jenis, nominal } = req.body;
  try {
    const { lastInsertRowid } = execute(
      'INSERT INTO transactions (nama, jenis, nominal) VALUES (?, ?, ?)',
      [nama, jenis, nominal]
    );
    const newTransaction = queryOne('SELECT * FROM transactions WHERE id = ?', [lastInsertRowid]);
    res.status(201).json({ success: true, data: newTransaction, message: 'Transaksi berhasil ditambahkan' });
  } catch (err) {
    console.error('POST /api/transactions:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan transaksi' });
  }
});

// PUT update transaction
app.put('/api/transactions/:id', [...idValidation, ...transactionValidation], (req, res) => {
  if (handleValidation(req, res)) return;
  const id = parseInt(req.params.id);
  const { nama, jenis, nominal } = req.body;
  try {
    const existing = queryOne('SELECT id FROM transactions WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });

    execute('UPDATE transactions SET nama = ?, jenis = ?, nominal = ? WHERE id = ?', [nama, jenis, nominal, id]);
    const updated = queryOne('SELECT * FROM transactions WHERE id = ?', [id]);
    res.json({ success: true, data: updated, message: 'Transaksi berhasil diperbarui' });
  } catch (err) {
    console.error('PUT /api/transactions/:id:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui transaksi' });
  }
});

// DELETE transaction
app.delete('/api/transactions/:id', idValidation, (req, res) => {
  if (handleValidation(req, res)) return;
  const id = parseInt(req.params.id);
  try {
    const existing = queryOne('SELECT id FROM transactions WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });

    execute('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    console.error('DELETE /api/transactions/:id:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus transaksi' });
  }
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend berjalan di http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/transactions`);
  });
}).catch(err => {
  console.error('❌ Gagal inisialisasi database:', err);
  process.exit(1);
});
