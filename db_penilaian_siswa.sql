CREATE DATABASE IF NOT EXISTS db_penilaian_siswa;
USE db_penilaian_siswa;

-- 1. Tabel Siswa
CREATE TABLE siswa (
    nis VARCHAR(20) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rombel VARCHAR(50),
    asal_sekolah VARCHAR(100)
);

-- 2. Tabel Nilai
CREATE TABLE nilai_ujian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nis VARCHAR(20),
    mapel VARCHAR(50),
    latihan1 FLOAT DEFAULT 0,
    latihan2 FLOAT DEFAULT 0,
    latihan3 FLOAT DEFAULT 0,
    latihan4 FLOAT DEFAULT 0,
    latihan5 FLOAT DEFAULT 0,
    FOREIGN KEY (nis) REFERENCES siswa(nis) ON DELETE CASCADE,
    UNIQUE KEY nis_mapel (nis, mapel) -- Agar fitur ON DUPLICATE KEY UPDATE bekerja
);