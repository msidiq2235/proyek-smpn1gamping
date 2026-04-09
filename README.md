# 🏫 Portal Akademik SMPN 1 Gamping

Portal Akademik ini adalah aplikasi web berbasis **React (Vite)** untuk antarmuka pengguna dan **PHP (XAMPP/MySQL)** untuk pengelolaan server. Aplikasi ini dirancang untuk memudahkan sekolah dalam mengelola data siswa, rekapitulasi nilai ujian secara dinamis, dan pencetakan kartu tes.

## Fitur Utama

### 👨‍💻 Panel Admin
* **Dashboard Statistik:** Manajemen terpusat untuk operator sekolah.
* **Manajemen Siswa (CRUD):** Tambah, Edit, dan Hapus data profil siswa.
* **Kategori Ujian Dinamis:** Admin dapat membuat, mengubah nama, atau menghapus kategori ujian baru (misal: Latihan 1, PTS, PAS) tanpa batas. Sistem akan otomatis membuatkan kolom di database.
* **Input Nilai Terintegrasi:** Input nilai persiswa atau import data siswa beserta nilainya sekaligus menggunakan file **Excel (.xlsx)**.
* **Pengaturan Cetak:** Mengubah judul laporan evaluasi secara dinamis.
* **Reset Data:** Fitur hapus semua data siswa (Kecuali Admin) untuk persiapan tahun ajaran baru.

### 🎓 Panel Siswa
* **Profil Siswa:** Menampilkan informasi biodata siswa terdaftar.
* **Kartu Tes Peserta:** Kartu ujian siap cetak yang dilengkapi dengan sistem **QR Code** berdasarkan Nomor Induk Siswa (NIS).
* **Data Nilai & Grafik:** Menampilkan tabel nilai ujian secara lengkap beserta visualisasi **Chart.js** untuk grafik nilai pribadi dan perbandingan rata-rata satu sekolah.

---

## 🛠️ Teknologi yang Digunakan

**Frontend:**
* [React.js](https://reactjs.org/) (via Vite)
* [React Router DOM](https://reactrouter.com/) (Routing)
* [Axios](https://axios-http.com/) (HTTP Client)
* [Bootstrap 5](https://getbootstrap.com/) (UI/CSS Framework)
* [Chart.js](https://www.chartjs.org/) & React-Chartjs-2 (Visualisasi Data)
* SheetJS / xlsx (Import Data Excel)
* React-QR-Code (Generator QR)

**Backend:**
* PHP 8+ (Native / Procedural)
* MySQL / MariaDB
* XAMPP Server

---

## ⚙️ Panduan Instalasi Lengkap (Local Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di komputer/laptop Anda dari nol.

### Tahap 1: Persiapan Aplikasi Wajib (Prerequisites)
Pastikan komputer Anda sudah terinstal aplikasi berikut:
1. **[XAMPP](https://www.apachefriends.org/index.html)** (Sebagai server lokal untuk PHP dan MySQL).
2. **[Node.js](https://nodejs.org/)** (Untuk menjalankan *environment* React).

### Tahap 2: Pemasangan Backend & Database (XAMPP)
1. Buka aplikasi **XAMPP Control Panel**, lalu klik **Start** pada modul `Apache` dan `MySQL`.
2. Buka browser dan akses `http://localhost/phpmyadmin`.
3. Buat database baru dengan nama **`db_penilaian_siswa`**.
4. Masuk ke menu **SQL**, lalu eksekusi (jalankan) *query* SQL untuk membuat struktur tabel yang dibutuhkan.
5. Buka folder instalasi XAMPP Anda (biasanya `C:\xampp\htdocs\`).
6. Buat folder untuk proyek ini (misal: `proyek-smpn1gamping`), dan di dalamnya buat folder **`portal-api`**.
7. Pindahkan seluruh **18 file `.php`** (seperti `config.php`, `login.php`, dll) ke dalam folder `portal-api` tersebut.

### Tahap 3: Pemasangan Frontend (React)
1. Buka folder proyek Frontend ini di Visual Studio Code (VS Code).
2. Pastikan file konfigurasi API di `src/apiConfig.js` sudah mengarah ke folder XAMPP Anda. Contoh:
   ```javascript
   export const API_BASE_URL = "http://localhost/proyek-smpn1gamping/portal-api";
   ```
3. Buka terminal di VS Code, lalu instal semua dependensi yang dibutuhkan:
   ```bash
   npm install
   ```

### Tahap 4: Menjalankan Aplikasi
1. Pastikan XAMPP (Apache & MySQL) masih dalam keadaan menyala.
2. Pada terminal VS Code, jalankan server pengembangan:
   ```bash
   npm run dev
   ```
3. Aplikasi akan terbuka di browser secara otomatis pada `http://localhost:5173`.

---

## 🔐 Akun Akses Default

Gunakan kredensial berikut untuk login pertama kali ke dalam sistem (Panel Admin):

* **User ID (NIS):** `admin`
* **Password:** `admin123`

*(Catatan: Anda dapat menambahkan akun siswa secara massal menggunakan fitur Import Excel di dalam Panel Admin).*

---

## 📄 Lisensi
Proyek ini dibuat untuk keperluan akademik, tugas akhir, dan edukasi.
