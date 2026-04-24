import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Pages Utama
import Login from './pages/Login';
import Beranda from './pages/Beranda';
import Profil from './pages/Profil';
import KartuTes from './pages/KartuTes';
import DataNilai from './pages/DataNilai';
import Admin from './pages/Admin';

// Fitur Baru: Exam System
import DaftarUjian from './pages/DaftarUjian'; 
import HalamanUjian from './pages/HalamanUjian'; 
import NilaiExam from './pages/NilaiExam';
import AdminExam from './pages/AdminExam';
import ManageMapelExam from './pages/ManageMapelExam';
import DetailHasil from './pages/DetailHasil'; // <--- WAJIB DITAMBAHKAN INI

function App() {
  return (
    <Router basename="/proyek-smpn1gamping/">
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* Private/Protected Routes */}
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/kartu-tes" element={<KartuTes />} />
        
        {/* Laporan Nilai Raport (Fitur Lama) */}
        <Route path="/data-nilai" element={<DataNilai />} />
        
        {/* Exam System Routes (Siswa & Rekap) */}
        <Route path="/daftar-ujian" element={<DaftarUjian />} />
        <Route path="/ujian/:id_ujian" element={<HalamanUjian />} />
        <Route path="/nilai-exam" element={<NilaiExam />} />
        
        {/* Detail Jawaban (Khusus Admin/Guru) */}
        <Route path="/detail-hasil/:id_hasil" element={<DetailHasil />} />
        
        {/* Admin Routes (Kelola Data & Ujian) */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-exam" element={<AdminExam />} />
        <Route path="/manage-mapel-exam" element={<ManageMapelExam />} />

        {/* FALLBACK ROUTE: Jika URL typo, lempar ke Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;