# 🎓 Sistem Informasi Penilaian Siswa (Fullstack)

Aplikasi berbasis web untuk manajemen dan visualisasi nilai evaluasi tahunan siswa . Dibangun menggunakan **React (Vite)** di sisi Frontend dan **Node.js (Express)** di sisi Backend dengan database **MySQL**.

## 🚀 Fitur Unggulan
- **Dashboard Admin**: Kelola data siswa (CRUD) secara real-time.
- **Import Excel Modern**: Input ratusan data siswa & nilai sekaligus. Sistem otomatis mendaftarkan siswa baru jika NIS belum ada di database.
- **Grafik Interaktif**: Visualisasi nilai pribadi vs rata-rata sekolah menggunakan **Chart.js**.
- **Cetak Laporan**: Fitur cetak rapor evaluasi yang simetris dan rapi (Format A4).
- **Auto-Login System**: Siswa login menggunakan NIS sebagai Username dan Password default.

---

## 🛠️ Persiapan Lingkungan (Prerequisites)
Sebelum menjalankan, pastikan laptop Anda sudah terinstal:
- **Node.js** (Versi 18.x atau terbaru)
- **MySQL Server** (XAMPP / Laragon / MySQL Workbench)
- **Git** (Untuk manajemen versi)

---

## 📥 Langkah Instalasi & Konfigurasi

### 1. Kloning Repositori
```bash
git clone [https://github.com/msidiq2235/proyek-smpn1gamping.git](https://github.com/msidiq2235/proyek-smpn1gamping.git)
cd proyek-smpn1gamping

```

### 2. Konfigurasi Database

1. Jalankan MySQL (XAMPP/Laragon).
2. Buat database baru bernama: `db_penilaian_siswa`.
3. Import file `db_penilaian_siswa.sql` yang ada di folder utama proyek ini ke dalam database tersebut.

### 3. Setup Backend (Server)

1. Buka folder `backend`.
2. Buka file `server.js` dan sesuaikan konfigurasi database:
```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    port : 3307,        // SESUAIKAN PORT (Standar XAMPP: 3306)
    password: '', // SESUAIKAN PASSWORD MYSQL ANDA
    database: 'db_penilaian_siswa'
});

```


3. Instal library & Jalankan:
```bash
npm install
node server.js

```



### 4. Setup Frontend (Client)

1. Buka folder `frontend`.
2. Instal library & Jalankan:
```bash
npm install
npm run dev

```


3. Akses aplikasi di browser: `http://localhost:5173`

---

## 📊 Spesifikasi Data & Format Excel

Untuk fitur **Import Excel**, gunakan format header kolom sebagai berikut (Huruf Kecil Semua):

| nis | nama | rombel | asal_sekolah | indo | mtk | inggris | ipa |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1234567 | Brody Black | 9A | SMPN 1 Gamping | 85 | 80 | 90 | 88 |

> **Catatan**:
> * Kolom `indo`, `mtk`, `inggris`, `ipa` akan masuk ke kategori yang sedang Anda pilih di dropdown menu (Misal: Latihan 1).
> * Password default siswa setelah diimport adalah **NIS** mereka sendiri.
> 
> 

---

## 📁 Struktur Folder Proyek

```text
.
├── frontend/                # React Vite Project (UI & Chart Logic)
├── backend/                 # Node.js Express (REST API & Database)
├── db_penilaian_siswa.sql    # Backup Database (Wajib di-import)
├── .gitignore               # Daftar file yang diabaikan Git (node_modules)
└── README.md                # Dokumentasi Proyek

```

---

## 🛠️ Troubleshooting (Jika Terjadi Masalah)

* **Error 404 (Not Found)**: Pastikan semua endpoint API di `server.js` sudah sesuai dengan `axios.get` di frontend.
* **Gagal Koneksi Database**: Cek port MySQL (3306 atau 3307) dan password di `server.js`.
* **Node Modules Error**: Jika pindah laptop, hapus folder `node_modules` yang lama lalu jalankan `npm install` kembali.

---
