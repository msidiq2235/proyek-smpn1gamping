-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 27, 2026 at 07:17 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_penilaian_siswa`
--

-- --------------------------------------------------------

--
-- Table structure for table `exam_hasil`
--

CREATE TABLE `exam_hasil` (
  `id_hasil` int(11) NOT NULL,
  `nis` varchar(20) DEFAULT NULL,
  `id_ujian` int(11) DEFAULT NULL,
  `jawaban_json` longtext DEFAULT NULL,
  `nilai_total` float DEFAULT NULL,
  `waktu_selesai` timestamp NOT NULL DEFAULT current_timestamp(),
  `status_koreksi` enum('selesai','proses') DEFAULT 'proses',
  `is_publish` int(11) DEFAULT 0,
  `nilai_manual` int(11) DEFAULT NULL,
  `waktu_mulai` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_hasil`
--

INSERT INTO `exam_hasil` (`id_hasil`, `nis`, `id_ujian`, `jawaban_json`, `nilai_total`, `waktu_selesai`, `status_koreksi`, `is_publish`, `nilai_manual`, `waktu_mulai`) VALUES
(8, '20230140044', 4, '{\"3\":\"29\",\"38\":\"Yo\",\"39\":\"yoi\"}', 62.5, '2026-04-24 10:47:07', 'selesai', 1, NULL, '2026-04-24 19:58:43'),
(9, '20230140044', 3, '{\"2\":\"22\",\"5\":\"10\",\"6\":\"5\",\"8\":\"rrt\",\"36\":\"18\",\"37\":\"31 Februari 1988\",\"7_13\":\"merah\",\"7_14\":\"merah\"}', 3.5, '2026-04-24 10:55:11', 'selesai', 1, NULL, '2026-04-24 19:58:43'),
(10, '20230140044', 3, '{\"2\":\"22\",\"5\":\"9\",\"6\":\"5\",\"8\":\"rrt\",\"36\":\"18\",\"37\":\"31 Februari 1988\",\"7_13\":\"merah\",\"7_14\":\"biru\"}', 42.8571, '2026-04-24 11:00:34', 'selesai', 1, NULL, '2026-04-24 19:58:43'),
(11, '20230140044', 8, '{\"40\":\"42\",\"41\":\"45\"}', 100, '2026-04-24 11:05:55', 'selesai', 1, NULL, '2026-04-24 19:58:43'),
(12, '20230140044', 9, '{\"42\":\"Yo\",\"43\":\"Yo\"}', 0, '2026-04-24 11:07:42', 'selesai', 1, NULL, '2026-04-24 19:58:43'),
(14, '20230140044', 9, '{\"42\":\"Dontol\",\"43\":\"Yo\"}', 100, '2026-04-24 11:08:10', 'selesai', 1, NULL, '2026-04-24 19:58:43'),
(15, '20230140044', 9, '{\"42\":\"Yo\",\"43\":\"Yo\"}', 100, '2026-04-24 11:12:03', 'selesai', 1, NULL, '2026-04-24 19:58:43'),
(17, '20230140044', 3, '{\"2\":\"22\",\"5\":\"10\",\"6\":\"5\",\"8\":\"rrt\",\"36\":\"18\",\"37\":\"31 Februari 1988\",\"7_13\":\"merah\",\"7_14\":\"biru\"}', 85.7143, '2026-04-24 13:17:48', 'selesai', 1, NULL, '2026-04-24 15:17:48');

-- --------------------------------------------------------

--
-- Table structure for table `exam_mapel`
--

CREATE TABLE `exam_mapel` (
  `id_exam_mapel` int(11) NOT NULL,
  `nama_mapel` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_mapel`
--

INSERT INTO `exam_mapel` (`id_exam_mapel`, `nama_mapel`) VALUES
(1, 'Matematika (Ujian)'),
(6, 'PWF'),
(7, 'tes');

-- --------------------------------------------------------

--
-- Table structure for table `exam_opsi`
--

CREATE TABLE `exam_opsi` (
  `id_opsi` int(11) NOT NULL,
  `id_soal` int(11) DEFAULT NULL,
  `teks_opsi` text DEFAULT NULL,
  `kunci_matching` text DEFAULT NULL,
  `is_benar` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_opsi`
--

INSERT INTO `exam_opsi` (`id_opsi`, `id_soal`, `teks_opsi`, `kunci_matching`, `is_benar`) VALUES
(9, 5, '5', '', 0),
(10, 5, '8', '', 1),
(11, 5, '2', '', 0),
(13, 7, 'merah', 'merah', 0),
(14, 7, 'biru', 'biru', 0),
(18, 36, 'Merbabu', '', 1),
(19, 36, 'sindoro', '', 0),
(22, 2, '2', '', 1),
(23, 2, '3', '', 0),
(24, 6, '', '', 0),
(25, 37, '', '', 0),
(28, 3, '3', '', 0),
(29, 3, '4', '', 1),
(33, 38, '', '', 0),
(34, 39, '', '', 0),
(35, 8, '', '', 0),
(48, 42, '', '', 0),
(49, 43, '', '', 0),
(50, 44, '', '', 0),
(51, 45, '', '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `exam_soal`
--

CREATE TABLE `exam_soal` (
  `id_soal` int(11) NOT NULL,
  `id_ujian` int(11) DEFAULT NULL,
  `pertanyaan` text NOT NULL,
  `tipe_soal` enum('pilgan','esai','matching') NOT NULL,
  `bobot_nilai` int(11) DEFAULT 1,
  `gambar` varchar(255) DEFAULT '',
  `bobot` float DEFAULT 1,
  `kunci_esai` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_soal`
--

INSERT INTO `exam_soal` (`id_soal`, `id_ujian`, `pertanyaan`, `tipe_soal`, `bobot_nilai`, `gambar`, `bobot`, `kunci_esai`) VALUES
(2, 3, '1+1', 'pilgan', 1, '', 1, ''),
(3, 4, '2+2', 'pilgan', 1, '', 10, ''),
(5, 3, '2x4', 'pilgan', 1, '', 1, NULL),
(6, 3, '4+1', 'esai', 1, '', 1, '5'),
(7, 3, '9x9\n6+7', 'matching', 1, '', 1, NULL),
(8, 3, 'hut smp?', 'esai', 1, '', 1, 'rrt'),
(36, 3, 'gunung apa ini', 'pilgan', 1, 'img_1777023516_69eb3a1c6bf0e.png', 1, NULL),
(37, 3, 'Kapan Sandy Lahir', 'esai', 1, '', 1, '31 Februari 1988'),
(38, 4, 'Hoo', 'esai', 1, '', 5, 'Yo'),
(39, 4, 'om', 'esai', 1, '', 1, 'yoi'),
(42, 9, 'Hoo', 'esai', 1, '', 1, 'Yo'),
(43, 9, 'Benar', 'esai', 1, '', 2, 'Yo'),
(44, 10, 'dari game apa ini', 'esai', 1, 'img_1777029493_69eb51754d7bc.png', 1, 'Roblox'),
(45, 10, 'Apa ini', 'esai', 1, 'img_1777029534_69eb519e3ca9c.jpeg', 1, 'Gambar');

-- --------------------------------------------------------

--
-- Table structure for table `exam_ujian`
--

CREATE TABLE `exam_ujian` (
  `id_ujian` int(11) NOT NULL,
  `judul_ujian` varchar(255) NOT NULL,
  `id_mapel` int(11) DEFAULT NULL,
  `durasi` int(11) DEFAULT NULL,
  `status` enum('aktif','nonaktif') DEFAULT 'nonaktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_bobot` float DEFAULT 100,
  `max_attempt` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_ujian`
--

INSERT INTO `exam_ujian` (`id_ujian`, `judul_ujian`, `id_mapel`, `durasi`, `status`, `created_at`, `total_bobot`, `max_attempt`) VALUES
(3, 'MTK', 1, 60, 'aktif', '2026-04-23 20:14:38', 100, 3),
(4, 'UCP MTK', 1, 60, 'aktif', '2026-04-23 20:15:25', 100, 1),
(9, 'Essai', 6, 60, 'aktif', '2026-04-24 11:06:47', 100, 3),
(10, 'TES', 7, 60, 'aktif', '2026-04-24 11:17:43', 100, 3);

-- --------------------------------------------------------

--
-- Table structure for table `kategori_nilai`
--

CREATE TABLE `kategori_nilai` (
  `id_kategori` varchar(30) NOT NULL,
  `nama_kategori` varchar(50) NOT NULL,
  `dibuat_pada` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kategori_nilai`
--

INSERT INTO `kategori_nilai` (`id_kategori`, `nama_kategori`, `dibuat_pada`) VALUES
('latihan1', 'Latihan 1', '2026-04-16 10:00:20'),
('latihan2', 'Latihan 2', '2026-04-16 10:00:20');

-- --------------------------------------------------------

--
-- Table structure for table `mata_pelajaran`
--

CREATE TABLE `mata_pelajaran` (
  `id_mapel` int(11) NOT NULL,
  `nama_mapel` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mata_pelajaran`
--

INSERT INTO `mata_pelajaran` (`id_mapel`, `nama_mapel`) VALUES
(1, 'Bahasa Indonesia'),
(3, 'Bahasa Inggris'),
(4, 'IPA'),
(2, 'Matematika'),
(11, 'Multimedia');

-- --------------------------------------------------------

--
-- Table structure for table `nilai_ujian`
--

CREATE TABLE `nilai_ujian` (
  `id` int(11) NOT NULL,
  `nis` varchar(20) DEFAULT NULL,
  `mapel` varchar(50) DEFAULT NULL,
  `latihan1` float DEFAULT 0,
  `latihan2` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nilai_ujian`
--

INSERT INTO `nilai_ujian` (`id`, `nis`, `mapel`, `latihan1`, `latihan2`) VALUES
(25, '20230140044', 'Bahasa Indonesia', 70, 0),
(26, '20230140044', 'Matematika', 70, 0),
(27, '20230140044', 'Bahasa Inggris', 70, 0),
(28, '20230140044', 'IPA', 70, 0),
(29, '20230140044', 'Multimedia', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `pengaturan_judul`
--

CREATE TABLE `pengaturan_judul` (
  `id` int(11) NOT NULL DEFAULT 1,
  `judul` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengaturan_judul`
--

INSERT INTO `pengaturan_judul` (`id`, `judul`) VALUES
(1, 'Laporan Hasil Evaluasi TES');

-- --------------------------------------------------------

--
-- Table structure for table `siswa`
--

CREATE TABLE `siswa` (
  `nis` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rombel` varchar(50) DEFAULT NULL,
  `asal_sekolah` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `siswa`
--

INSERT INTO `siswa` (`nis`, `nama`, `password`, `rombel`, `asal_sekolah`) VALUES
('20230140044', 'Yazid Ardiyan', '20230140044', '9A', 'SMPN 1 Gamping'),
('admin', 'admin bolo', '123', 'admin om', 'umy');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `exam_hasil`
--
ALTER TABLE `exam_hasil`
  ADD PRIMARY KEY (`id_hasil`);

--
-- Indexes for table `exam_mapel`
--
ALTER TABLE `exam_mapel`
  ADD PRIMARY KEY (`id_exam_mapel`);

--
-- Indexes for table `exam_opsi`
--
ALTER TABLE `exam_opsi`
  ADD PRIMARY KEY (`id_opsi`),
  ADD KEY `id_soal` (`id_soal`);

--
-- Indexes for table `exam_soal`
--
ALTER TABLE `exam_soal`
  ADD PRIMARY KEY (`id_soal`),
  ADD KEY `id_ujian` (`id_ujian`);

--
-- Indexes for table `exam_ujian`
--
ALTER TABLE `exam_ujian`
  ADD PRIMARY KEY (`id_ujian`);

--
-- Indexes for table `kategori_nilai`
--
ALTER TABLE `kategori_nilai`
  ADD PRIMARY KEY (`id_kategori`);

--
-- Indexes for table `mata_pelajaran`
--
ALTER TABLE `mata_pelajaran`
  ADD PRIMARY KEY (`id_mapel`),
  ADD UNIQUE KEY `nama_mapel` (`nama_mapel`);

--
-- Indexes for table `nilai_ujian`
--
ALTER TABLE `nilai_ujian`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nis_mapel` (`nis`,`mapel`);

--
-- Indexes for table `pengaturan_judul`
--
ALTER TABLE `pengaturan_judul`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `siswa`
--
ALTER TABLE `siswa`
  ADD PRIMARY KEY (`nis`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `exam_hasil`
--
ALTER TABLE `exam_hasil`
  MODIFY `id_hasil` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `exam_mapel`
--
ALTER TABLE `exam_mapel`
  MODIFY `id_exam_mapel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `exam_opsi`
--
ALTER TABLE `exam_opsi`
  MODIFY `id_opsi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `exam_soal`
--
ALTER TABLE `exam_soal`
  MODIFY `id_soal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `exam_ujian`
--
ALTER TABLE `exam_ujian`
  MODIFY `id_ujian` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `mata_pelajaran`
--
ALTER TABLE `mata_pelajaran`
  MODIFY `id_mapel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `nilai_ujian`
--
ALTER TABLE `nilai_ujian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `exam_opsi`
--
ALTER TABLE `exam_opsi`
  ADD CONSTRAINT `exam_opsi_ibfk_1` FOREIGN KEY (`id_soal`) REFERENCES `exam_soal` (`id_soal`) ON DELETE CASCADE;

--
-- Constraints for table `exam_soal`
--
ALTER TABLE `exam_soal`
  ADD CONSTRAINT `exam_soal_ibfk_1` FOREIGN KEY (`id_ujian`) REFERENCES `exam_ujian` (`id_ujian`) ON DELETE CASCADE;

--
-- Constraints for table `nilai_ujian`
--
ALTER TABLE `nilai_ujian`
  ADD CONSTRAINT `nilai_ujian_ibfk_1` FOREIGN KEY (`nis`) REFERENCES `siswa` (`nis`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
