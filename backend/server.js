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
    port : 3308,
    password: 'Tahu13bulat11',      
    database: 'db_penilaian_siswa'
});

db.connect((err) => {
    if (err) {
        console.error('Gagal Terhubung ke MySQL:', err.message);
        return;
    }
    console.log('Database MySQL Terhubung! (Port 3308)');
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

// 4. API Simpan/Update Nilai (SUDAH DINAMIS)
app.post('/api/nilai', (req, res) => {
    // Pisahkan data dasar dan data kategori dinamis
    const { nis, mapel, ...nilaiKategori } = req.body;
    
    // Ambil nama kolom kategori yang dikirim (misal: 'latihan1' atau 'kat_171...')
    const kategoriKey = Object.keys(nilaiKategori)[0]; 
    const nilaiValue = nilaiKategori[kategoriKey];

    if (!kategoriKey) return res.status(400).json({ error: "Kategori tidak valid" });

    // Query dinamis yang beradaptasi dengan kategori yang dikirim
    // Tanda ?? digunakan untuk nama kolom, tanda ? untuk nilai (mencegah SQL error)
    const sql = `
        INSERT INTO nilai_ujian (nis, mapel, ??)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE ?? = ?
    `;

    const values = [kategoriKey, nis, mapel, nilaiValue, kategoriKey, nilaiValue];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Nilai berhasil disimpan/diperbarui" });
    });
});

// 5. API Ambil Nilai Per Siswa
app.get('/api/siswa/:nis', (req, res) => {
    const sql = "SELECT * FROM siswa WHERE nis = ?";
    db.query(sql, [req.params.nis], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) {
            return res.json({ profil: null, message: "Siswa tidak ditemukan" });
        }
        res.json({ profil: result[0] });
    });
});

// 6. API Ambil Semua Siswa & Nilai
app.get('/api/siswa_all', (req, res) => {
    db.query("SELECT * FROM siswa", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

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

// 9. API Rata-rata Sekolah
app.get('/api/rata_sekolah', (req, res) => {
    // Cari tahu dulu kategori apa saja yang sedang aktif
    db.query("SELECT id_kategori FROM kategori_nilai", (err, cats) => {
        if (err) return res.status(500).json(err);
        
        if (cats.length === 0) {
            return res.json([]); // Jika belum ada kategori, kembalikan array kosong
        }

        // Buat query dinamis: ROUND(AVG(NULLIF(kat_123, 0)), 1) as kat_123, ...
        const avgSelects = cats.map(c => 
            `ROUND(AVG(NULLIF(${c.id_kategori}, 0)), 1) as ${c.id_kategori}`
        ).join(', ');

        const sql = `SELECT mapel, ${avgSelects} FROM nilai_ujian GROUP BY mapel`;
        
        db.query(sql, (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result); 
        });
    });
});

// 10. API Ambil Nilai Berdasarkan NIS
app.get('/api/nilai/:nis', (req, res) => {
    const sql = "SELECT * FROM nilai_ujian WHERE nis = ?";
    db.query(sql, [req.params.nis], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result); 
    });
});

// ==========================================
// API KATEGORI NILAI (DINAMIS & CRUD)
// ==========================================

// Ambil Semua Kategori
app.get('/api/kategori', (req, res) => {
    // Tambahkan ORDER BY dibuat_pada ASC agar yang lama di atas, yang baru di bawah
    db.query("SELECT * FROM kategori_nilai ORDER BY dibuat_pada ASC, id_kategori ASC", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Update Nama Kategori
app.put('/api/kategori/:id', (req, res) => {
    const { nama_kategori } = req.body;
    const sql = "UPDATE kategori_nilai SET nama_kategori = ? WHERE id_kategori = ?";
    db.query(sql, [nama_kategori, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Nama kategori berhasil diperbarui!" });
    });
});

// Tambah Kategori (Otomatis ALTER TABLE ADD COLUMN)
app.post('/api/kategori', (req, res) => {
    const { nama_kategori } = req.body;
    const id_kategori = 'kat_' + Date.now(); // Buat ID unik anti bentrok

    // 1. Simpan ke daftar kategori
    db.query("INSERT INTO kategori_nilai (id_kategori, nama_kategori) VALUES (?, ?)", [id_kategori, nama_kategori], (err) => {
        if (err) return res.status(500).json(err);

        // 2. Tambah fisik kolom di tabel nilai_ujian
        db.query(`ALTER TABLE nilai_ujian ADD COLUMN ?? INT DEFAULT NULL`, [id_kategori], (errAlter) => {
            if (errAlter) return res.status(500).json(errAlter);
            res.json({ message: "Kategori dan kolom database berhasil ditambahkan!" });
        });
    });
});

// Hapus Kategori (Otomatis ALTER TABLE DROP COLUMN)
app.delete('/api/kategori/:id', (req, res) => {
    const id_kategori = req.params.id;

    // 1. Hapus dari daftar kategori
    db.query("DELETE FROM kategori_nilai WHERE id_kategori = ?", [id_kategori], (err) => {
        if (err) return res.status(500).json(err);

        // 2. Hapus fisik kolom dari tabel nilai_ujian
        db.query(`ALTER TABLE nilai_ujian DROP COLUMN ??`, [id_kategori], (errAlter) => {
            if (errAlter) return res.status(500).json(errAlter);
            res.json({ message: "Kategori beserta semua nilainya berhasil dihapus!" });
        });
    });
});

// ==========================================
// API RESET DATA TAHUNAN
// ==========================================
app.delete('/api/siswa_all', (req, res) => {
    // Hapus nilai_ujian dulu agar aman dari constraint relasi
    db.query('DELETE FROM nilai_ujian', (err1) => {
        if (err1) return res.status(500).json({ error: err1.message });
        
        // Setelah nilai terhapus, hapus semua data siswa
        db.query('DELETE FROM siswa', (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: "Semua data siswa dan nilai berhasil dikosongkan!" });
        });
    });
});

app.get('/api/judul', (req, res) => {
    db.query("SELECT judul FROM pengaturan_judul WHERE id = 1", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0] || { judul: 'Laporan Hasil Evaluasi' });
    });
});

app.put('/api/judul', (req, res) => {
    db.query("UPDATE pengaturan_judul SET judul = ? WHERE id = 1", [req.body.judul], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Judul cetak laporan berhasil diubah!" });
    });
});

app.listen(5000, () => {
    console.log('Server Backend aktif di http://localhost:5000');
});