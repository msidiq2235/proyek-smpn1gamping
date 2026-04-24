import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function Beranda() {
  const role = localStorage.getItem('role');
  const nis = localStorage.getItem('nis');
  const [waktu, setWaktu] = useState('');
  const [profil, setProfil] = useState({ nama: 'Memuat...', rombel: '-', nis: '-' });
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Logika Waktu
    const updateWaktu = () => {
      const sekarang = new Date();
      const opsiTanggal = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      setWaktu(`${sekarang.toLocaleDateString('id-ID', opsiTanggal)} | ${sekarang.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB`);
    };
    updateWaktu();
    const interval = setInterval(updateWaktu, 60000);

    // 2. Logika Profil Dinamis
    const fetchProfil = async () => {
      if (role === 'admin' || nis === 'admin') {
        setProfil({ nama: 'Administrator', rombel: 'Sistem', nis: 'Admin-Root' });
        return;
      }

      if (nis) {
        try {
          const res = await axios.get(`${API_BASE_URL}/get_profil.php?nis=${nis}`);
          if (res.data && res.data.profil) {
            setProfil(res.data.profil);
          }
        } catch (err) {
          console.error("Gagal ambil data:", err);
          setProfil({ nama: 'User', rombel: '-', nis: nis });
        }
      }
    };

    fetchProfil();
    return () => clearInterval(interval);
  }, [nis, role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '50px' }}>
      
      <style>
        {`
          .menu-card {
            transition: all 0.3s ease;
            border-radius: 16px;
          }
          .menu-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 30px rgba(13, 110, 253, 0.15) !important;
            border-color: #0d6efd !important;
          }
          .menu-icon-wrapper {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px auto;
            transition: all 0.3s ease;
          }
          .menu-card:hover .menu-icon-wrapper {
            background-color: #0d6efd !important;
            color: white !important;
            transform: scale(1.1);
          }
          .exam-card:hover .menu-icon-wrapper {
            background-color: #ff4757 !important;
          }
        `}
      </style>

      <nav className="navbar navbar-expand-lg bg-white shadow-sm py-3 mb-4">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2">
            <img src="/logo_smpn1gmp.png" alt="Logo" style={{ width: '35px', height: '35px' }} />
            Portal Akademik SMPN 1 Gamping
          </span>
          <span className="navbar-text text-muted small d-none d-md-block">
            📅 {waktu}
          </span>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '1100px' }}>
        
        <div className="bg-primary text-white p-4 p-md-5 mb-5 shadow-sm" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #0d6efd 0%, #0043a8 100%)' }}>
          <h2 className="fw-bold mb-1">Selamat Datang, {profil.nama}! 👋</h2>
          <p className="mb-0 text-white-50 fs-5">Kelas {profil.rombel} | NIS: {profil.nis}</p>
        </div>

        {/* Grid Menu Utama (Sekarang 5 Kolom) */}
        <div className="row g-3 justify-content-center">
          
          <div className="col-6 col-md-4 col-lg">
            <Link to="/profil" className="card menu-card border border-light shadow-sm p-4 text-center text-decoration-none bg-white h-100">
              <div className="menu-icon-wrapper bg-light text-primary fs-2">👤</div>
              <h6 className="text-dark fw-bold mb-0">Profil Siswa</h6>
            </Link>
          </div>

          <div className="col-6 col-md-4 col-lg">
            <Link to="/kartu-tes" className="card menu-card border border-light shadow-sm p-4 text-center text-decoration-none bg-white h-100">
              <div className="menu-icon-wrapper bg-light text-primary fs-2">🪪</div>
              <h6 className="text-dark fw-bold mb-0">Kartu Tes</h6>
            </Link>
          </div>

          <div className="col-6 col-md-4 col-lg">
            <Link to="/data-nilai" className="card menu-card border border-light shadow-sm p-4 text-center text-decoration-none bg-white h-100">
              <div className="menu-icon-wrapper bg-light text-primary fs-2">📊</div>
              <h6 className="text-dark fw-bold mb-0">Data Nilai</h6>
            </Link>
          </div>

          {/* MENU BARU: UJIAN ONLINE */}
          <div className="col-6 col-md-4 col-lg">
            <Link to="/daftar-ujian" className="card menu-card exam-card border border-light shadow-sm p-4 text-center text-decoration-none bg-white h-100">
              <div className="menu-icon-wrapper bg-danger bg-opacity-10 text-danger fs-2">📝</div>
              <h6 className="text-dark fw-bold mb-0">Ujian Online</h6>
              <span className="badge bg-danger rounded-pill mt-2" style={{ fontSize: '10px' }}>Baru</span>
            </Link>
          </div>

          <div className="col-6 col-md-4 col-lg">
            <button onClick={handleLogout} className="card menu-card border border-light shadow-sm p-4 text-center bg-white h-100 w-100 border-0">
              <div className="menu-icon-wrapper bg-secondary bg-opacity-10 text-secondary fs-2">🚪</div>
              <h6 className="text-secondary fw-bold mb-0">Logout</h6>
            </button>
          </div>

        </div>

        {/* Panel Admin (Tetap sama) */}
        {(role === 'admin' || nis === 'admin') && (
          <div className="row mt-5">
            <div className="col-12">
              <Link to="/admin" className="text-decoration-none">
                <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: '20px', backgroundColor: '#fff3cd' }}>
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', fontSize: '20px' }}>⚙️</div>
                    <div className="text-start">
                      <h5 className="fw-bold text-dark mb-0">Panel Administrasi</h5>
                      <p className="text-muted small mb-0">Kelola data seluruh siswa, nilai, dan sistem ujian</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Beranda;