import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Beranda() {
  const role = localStorage.getItem('role');
  const nis = localStorage.getItem('nis'); // Mengambil NIS dari storage
  const [waktu, setWaktu] = useState('');
  const [profil, setProfil] = useState({ nama: 'Memuat...', rombel: '-', nis: '-' });
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Logika Waktu (Tetap sama)
    const updateWaktu = () => {
      const sekarang = new Date();
      const opsiTanggal = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      setWaktu(`${sekarang.toLocaleDateString('id-ID', opsiTanggal)} | ${sekarang.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB`);
    };
    updateWaktu();
    const interval = setInterval(updateWaktu, 60000);

    // 2. Logika Profil Dinamis
    const fetchProfil = async () => {
      // JIKA ADMIN: Langsung set nama tanpa panggil API siswa
      if (role === 'admin') {
        setProfil({ nama: 'Administrator', rombel: 'Sistem', nis: 'Admin-Root' });
        return;
      }

      // JIKA SISWA: Panggil API seperti biasa
      if (nis) {
        try {
          const res = await axios.get(`http://localhost:5000/api/siswa/${nis}`);
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
  }, [nis, role]); // Tambahkan role di dependency array

  const handleLogout = () => {
    localStorage.clear(); // Hapus semua data session
    navigate('/');
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* CSS internal untuk efek hover kartu menu */}
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
        `}
      </style>

      {/* Header Navigasi Atas */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm py-3 mb-4">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2">
            <img 
              src="/logo_smpn1gmp.png" 
              alt="Logo SMPN 1 Gamping"
              style={{ width: '35px', height: '35px', objectFit: 'contain' }}
            />
            Portal Akademik SMPN 1 Gamping
          </span>
          <span className="navbar-text text-muted small d-none d-md-block">
            📅 {waktu}
          </span>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '1000px' }}>
        
        {/* Area Sapaan Dinamis (Data dari Backend) */}
        <div className="bg-primary text-white p-4 p-md-5 mb-5 shadow-sm" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #0d6efd 0%, #0043a8 100%)' }}>
          <h2 className="fw-bold mb-1">Selamat Datang, {profil.nama}! 👋</h2>
          <p className="mb-0 text-white-50 fs-5">Kelas {profil.rombel} | NIS: {profil.nis}</p>
        </div>

        {/* Grid Menu Utama */}
        <div className="row g-4 justify-content-center">
          
          <div className="col-6 col-md-3">
            <Link to="/profil" className="card menu-card border border-light shadow-sm p-4 text-center text-decoration-none bg-white h-100">
              <div className="menu-icon-wrapper bg-light text-primary fs-2">👤</div>
              <h6 className="text-dark fw-bold mb-0">Profil Siswa</h6>
            </Link>
          </div>

          <div className="col-6 col-md-3">
            <Link to="/kartu-tes" className="card menu-card border border-light shadow-sm p-4 text-center text-decoration-none bg-white h-100">
              <div className="menu-icon-wrapper bg-light text-primary fs-2">🪪</div>
              <h6 className="text-dark fw-bold mb-0">Kartu Tes</h6>
            </Link>
          </div>

          <div className="col-6 col-md-3">
            <Link to="/data-nilai" className="card menu-card border border-light shadow-sm p-4 text-center text-decoration-none bg-white h-100">
              <div className="menu-icon-wrapper bg-light text-primary fs-2">📊</div>
              <h6 className="text-dark fw-bold mb-0">Data Nilai</h6>
            </Link>
          </div>

          <div className="col-6 col-md-3">
            <button onClick={handleLogout} className="card menu-card border border-light shadow-sm p-4 text-center bg-white h-100 w-100 border-0">
              <div className="menu-icon-wrapper bg-danger bg-opacity-10 text-danger fs-2">🚪</div>
              <h6 className="text-danger fw-bold mb-0">Logout</h6>
            </button>
          </div>
        </div>

        {/* Menu Khusus Admin (Hanya muncul jika role === 'admin') */}
        {role === 'admin' && (
          <div className="row mt-5">
            <div className="col-12">
              <Link to="/admin" className="text-decoration-none">
                <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: '20px', backgroundColor: '#fff3cd' }}>
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', fontSize: '20px' }}>
                      ⚙️
                    </div>
                    <div className="text-start">
                      <h5 className="fw-bold text-dark mb-0">Panel Administrasi</h5>
                      <p className="text-muted small mb-0">Kelola data seluruh siswa dan nilai akademik</p>
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