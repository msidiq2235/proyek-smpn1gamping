CREATE DATABASE IF NOT EXISTS `db_penilaian_siswa`;
USE `db_penilaian_siswa`;

-- ==========================================
-- 1. TABEL PENGATURAN JUDUL
-- ==========================================
DROP TABLE IF EXISTS `pengaturan_judul`;
CREATE TABLE `pengaturan_judul` (
  `id` int NOT NULL DEFAULT '1',
  `judul` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Default (Wajib ada agar tidak error)
INSERT INTO `pengaturan_judul` (`id`, `judul`) VALUES 
(1, 'Laporan Hasil Ulangan');


-- ==========================================
-- 2. TABEL KATEGORI NILAI
-- ==========================================
DROP TABLE IF EXISTS `kategori_nilai`;
CREATE TABLE `kategori_nilai` (
  `id_kategori` varchar(30) NOT NULL,
  `nama_kategori` varchar(50) NOT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Default Kategori (Wajib ada untuk dropdown)
INSERT INTO `kategori_nilai` (`id_kategori`, `nama_kategori`) VALUES 
('latihan1', 'Latihan 1'),
('latihan2', 'Latihan 2'),
('latihan3', 'Latihan 3'),
('latihan4', 'Latihan 4'),
('latihan5', 'Latihan 5'),
('kat_1775721594402', 'Latihan 6');


-- ==========================================
-- 3. TABEL SISWA (KOSONG)
-- ==========================================
DROP TABLE IF EXISTS `siswa`;
CREATE TABLE `siswa` (
  `nis` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rombel` varchar(50) DEFAULT NULL,
  `asal_sekolah` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`nis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Akun Default Admin (Agar kamu bisa login pertama kali)
INSERT INTO `siswa` (`nis`, `nama`, `password`, `rombel`, `asal_sekolah`) VALUES 
('admin', 'Administrator', 'admin123', 'Sistem', 'SMPN 1 Gamping');


-- ==========================================
-- 4. TABEL NILAI UJIAN (KOSONG)
-- ==========================================
DROP TABLE IF EXISTS `nilai_ujian`;
CREATE TABLE `nilai_ujian` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nis` varchar(20) DEFAULT NULL,
  `mapel` varchar(50) DEFAULT NULL,
  `latihan1` float DEFAULT '0',
  `latihan2` float DEFAULT '0',
  `latihan3` float DEFAULT '0',
  `latihan4` float DEFAULT '0',
  `latihan5` float DEFAULT '0',
  `kat_1775721594402` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nis_mapel` (`nis`,`mapel`),
  CONSTRAINT `nilai_ujian_ibfk_1` FOREIGN KEY (`nis`) REFERENCES `siswa` (`nis`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;