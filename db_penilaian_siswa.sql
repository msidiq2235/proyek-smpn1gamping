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

INSERT INTO `pengaturan_judul` (`id`, `judul`) VALUES 
(1, 'Laporan Hasil Evaluasi');


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

-- Data Awal Kategori
INSERT INTO `kategori_nilai` (`id_kategori`, `nama_kategori`) VALUES 
('latihan1', 'Latihan 1'),
('latihan2', 'Latihan 2');


-- ==========================================
-- 3. TABEL MATA PELAJARAN 
-- ==========================================
DROP TABLE IF EXISTS `mata_pelajaran`;
CREATE TABLE `mata_pelajaran` (
  `id_mapel` int NOT NULL AUTO_INCREMENT,
  `nama_mapel` varchar(50) NOT NULL,
  PRIMARY KEY (`id_mapel`),
  UNIQUE KEY `nama_mapel` (`nama_mapel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data Awal Mata Pelajaran agar tidak kosong saat baru buka
INSERT INTO `mata_pelajaran` (`nama_mapel`) VALUES 
('Bahasa Indonesia'),
('Matematika'),
('Bahasa Inggris'),
('IPA');


-- ==========================================
-- 4. TABEL SISWA
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

-- Akun Admin Default
INSERT INTO `siswa` (`nis`, `nama`, `password`, `rombel`, `asal_sekolah`) VALUES 
('admin', 'Administrator', 'admin123', 'Sistem', 'SMPN 1 Gamping');


-- ==========================================
-- 5. TABEL NILAI UJIAN
-- ==========================================
DROP TABLE IF EXISTS `nilai_ujian`;
CREATE TABLE `nilai_ujian` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nis` varchar(20) DEFAULT NULL,
  `mapel` varchar(50) DEFAULT NULL,
  `latihan1` float DEFAULT '0',
  `latihan2` float DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nis_mapel` (`nis`,`mapel`),
  CONSTRAINT `nilai_ujian_ibfk_1` FOREIGN KEY (`nis`) REFERENCES `siswa` (`nis`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;