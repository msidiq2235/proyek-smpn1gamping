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
import Ujian from './pages/Ujian'; // <--- Pastikan nama file ini sesuai (Ujian.jsx)
import NilaiExam from './pages/NilaiExam';
import AdminExam from './pages/AdminExam';
import ManageMapelExam from './pages/ManageMapelExam';
import DetailHasil from './pages/DetailHasil';

function App() {
  return (
    // Sesuaikan basename jika di hosting atau folder XAMPP berbeda
    <Router basename="/proyek-smpn1gamping/">
      <Routes>
        {/* --- PUBLIC ROUTE --- */}
        <Route path="/" element={<Login />} />
        
        {/* --- PROTECTED ROUTES (SISWA & ADMIN) --- */}
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/kartu-tes" element={<KartuTes />} />
        
        {/* Fitur Nilai Raport Statis */}
        <Route path="/data-nilai" element={<DataNilai />} />
        
        {/* --- EXAM SYSTEM (SISWA) --- */}
        <Route path="/daftar-ujian" element={<DaftarUjian />} />
        
        {/* Route Ujian ini akan masuk ke Gerbang Token dulu baru soal */}
        <Route path="/ujian/:id_ujian" element={<Ujian />} />
        
        {/* --- REKAPITULASI & AUDIT (SISWA & ADMIN) --- */}
        <Route path="/nilai-exam" element={<NilaiExam />} />
        
        {/* Detail Jawaban & Koreksi Manual (Khusus Admin/Guru) */}
        <Route path="/detail-hasil/:id_hasil" element={<DetailHasil />} />
        
        {/* --- MANAGEMENT UJIAN (ADMIN ONLY) --- */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-exam" element={<AdminExam />} />
        <Route path="/manage-mapel-exam" element={<ManageMapelExam />} />

        {/* --- FALLBACK ROUTE --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;