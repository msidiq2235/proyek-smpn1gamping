const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    port : 3307,
    password: 'MSidiq',      
    database: 'db_penilaian_siswa'
});

db.connect((err) => {
    if (err) {
        console.error('Gagal Terhubung ke MySQL:', err.message);
        return;
    }
    console.log('Database MySQL Terhubung! (Port 3307)');
});

// 1. API Login
app.post('/api/login', (req, res) => {
    const { nis, password } = req.body;
    const query = 'SELECT nis FROM siswa WHERE nis = ? AND password = ?';
    db.query(query, [nis, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.json({ success: true, nis: results[0].nis });
        } else {
            res.status(401).json({ success: false, message: 'NIS atau Password salah!' });
        }
    });
});

// 2. API Cari Siswa Tunggal
app.get('/api/siswa/:nis', (req, res) => {
    db.query('SELECT * FROM siswa WHERE nis = ?', [req.params.nis], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) res.json({ profil: result[0] });
        else res.status(404).json({ message: "Kosong" });
    });
});

// 3. API Tambah Siswa Baru
app.post('/api/siswa', (req, res) => {
  const { nis, nama, password, rombel, asal_sekolah } = req.body;
  const sql = "INSERT INTO siswa (nis, nama, password, rombel, asal_sekolah) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [nis, nama, password, rombel, asal_sekolah], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json({ message: "Data siswa berhasil disimpan!" });
  });
});

// 4. API Simpan/Update Nilai (Hanya update kolom yang dikirim agar tidak menimpa nilai lain)
app.post('/api/nilai', (req, res) => {
    const { nis, mapel, latihan1, latihan2, latihan3, latihan4, latihan5 } = req.body;
    
    // Query sakti: Jika data sudah ada, update kolom yang dikirim. 
    // Jika kolom tidak dikirim (null), tetap gunakan nilai lama (IFNULL).
    const sql = `
        INSERT INTO nilai_ujian (nis, mapel, latihan1, latihan2, latihan3, latihan4, latihan5)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        latihan1 = IFNULL(?, latihan1),
        latihan2 = IFNULL(?, latihan2),
        latihan3 = IFNULL(?, latihan3),
        latihan4 = IFNULL(?, latihan4),
        latihan5 = IFNULL(?, latihan5)
    `;

    const values = [
        nis, mapel, latihan1 || null, latihan2 || null, latihan3 || null, latihan4 || null, latihan5 || null,
        latihan1 || null, latihan2 || null, latihan3 || null, latihan4 || null, latihan5 || null
    ];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Nilai berhasil disimpan/diperbarui" });
    });
});

// 5. API Ambil Nilai Per Siswa (DIPERBAIKI)
app.get('/api/siswa/:nis', (req, res) => {
    const sql = "SELECT * FROM siswa WHERE nis = ?";
    db.query(sql, [req.params.nis], (err, result) => {
        if (err) return res.status(500).json(err);
        
        // Jika data tidak ada, kirim objek kosong, jangan biarkan gantung
        if (result.length === 0) {
            return res.json({ profil: null, message: "Siswa tidak ditemukan" });
        }
        
        res.json({ profil: result[0] });
    });
});

// 6. API Ambil Semua Siswa (Admin)
// Ambil semua data siswa
app.get('/api/siswa_all', (req, res) => {
    db.query("SELECT * FROM siswa", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Ambil semua data nilai (Baru)
app.get('/api/nilai_all', (req, res) => {
    db.query("SELECT * FROM nilai_ujian", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// 7. API Update Siswa
app.put('/api/siswa/:nis', (req, res) => {
    const { nama, password, rombel, asal_sekolah } = req.body;
    const sql = "UPDATE siswa SET nama=?, password=?, rombel=?, asal_sekolah=? WHERE nis=?";
    db.query(sql, [nama, password, rombel, asal_sekolah, req.params.nis], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Update sukses" });
    });
});

// 8. API Delete Siswa
app.delete('/api/siswa/:nis', (req, res) => {
    db.query('DELETE FROM siswa WHERE nis = ?', [req.params.nis], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Hapus sukses" });
    });
});

// 9. API Rata-rata Sekolah (DITAMBAHKAN latihan5)
app.get('/api/rata_sekolah', (req, res) => {
    const sql = `
        SELECT 
            mapel, 
            ROUND(AVG(NULLIF(latihan1, 0)), 1) as latihan1, 
            ROUND(AVG(NULLIF(latihan2, 0)), 1) as latihan2, 
            ROUND(AVG(NULLIF(latihan3, 0)), 1) as latihan3, 
            ROUND(AVG(NULLIF(latihan4, 0)), 1) as latihan4, 
            ROUND(AVG(NULLIF(latihan5, 0)), 1) as latihan5 
        FROM nilai_ujian 
        GROUP BY mapel
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result); 
    });
});

// 10. API Ambil Nilai Berdasarkan NIS (WAJIB ADA UNTUK HALAMAN SISWA)
app.get('/api/nilai/:nis', (req, res) => {
    const sql = "SELECT * FROM nilai_ujian WHERE nis = ?";
    db.query(sql, [req.params.nis], (err, result) => {
        if (err) return res.status(500).json(err);
        
        // Kirim hasil pencarian (bisa array berisi beberapa mapel atau array kosong)
        // Kita tidak kirim 404 agar Frontend tidak error merah
        res.json(result); 
    });
});

app.listen(5000, () => {
    console.log('Server Backend aktif di http://localhost:5000');
});