import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2'; // --- 1. Import Swal ---

function Beranda() {
  const role = localStorage.getItem('role');
  const nis = localStorage.getItem('nis');
  const [waktu, setWaktu] = useState('');
  const [profil, setProfil] = useState({ nama: 'Memuat...', rombel: '-', nis: '-' });
  const navigate = useNavigate();

  const colors = {
    primary: '#023874',    // Biru Navy Elit
    secondary: '#B8860B',  // Emas Tua (Aksen)
    bgLight: '#F4F1EA',    // Krem Putih
    white: '#ffffff'
  };

  useEffect(() => {
    const updateWaktu = () => {
      const sekarang = new Date();
      const opsiTanggal = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      setWaktu(`${sekarang.toLocaleDateString('id-ID', opsiTanggal)} | ${sekarang.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB`);
    };
    updateWaktu();
    const interval = setInterval(updateWaktu, 60000);

    const fetchProfil = async () => {
      if (role === 'admin' || nis === 'admin') {
        setProfil({ nama: 'Administrator', rombel: 'Sistem', nis: 'Admin-Root' });
        return;
      }
      if (nis) {
        try {
          const res = await axios.get(`${API_BASE_URL}/get_profil.php?nis=${nis}`);
          if (res.data && res.data.profil) setProfil(res.data.profil);
        } catch (err) {
          setProfil({ nama: 'User', rombel: '-', nis: nis });
        }
      }
    };

    fetchProfil();
    return () => clearInterval(interval);
  }, [nis, role]);

  // --- 2. Ganti handleLogout dengan SweetAlert2 ---
  const handleLogout = () => {
    Swal.fire({
      title: 'Konfirmasi Keluar',
      text: "Apakah Anda yakin ingin mengakhiri sesi manajemen akademik ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      background: colors.white,
      iconColor: colors.secondary,
      borderRadius: '15px'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        // Popup sukses kecil sebelum redirect
        Swal.fire({
            title: 'Berhasil Keluar',
            text: 'Sesi Anda telah dihentikan.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false,
            iconColor: colors.primary
        }).then(() => {
            navigate('/');
        });
      }
    });
  };

  return (
    <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', paddingBottom: '100px', fontFamily: "'Inter', sans-serif" }}>
      
      <style>
        {`
          .nav-custom { background-color: ${colors.primary}; border-bottom: 4px solid ${colors.secondary}; }
          .welcome-banner { background: linear-gradient(135deg, ${colors.primary} 0%, #011f41 100%); border-radius: 20px; overflow: hidden; }
          .menu-card-elit { border: none; border-radius: 15px; transition: all 0.4s ease; background: #ffffff; }
          .menu-card-elit:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; }
          .icon-box { width: 60px; height: 60px; background-color: ${colors.bgLight}; color: ${colors.primary}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px; }
          .admin-bar-card { background-color: ${colors.white}; border-radius: 15px; border: 1px solid rgba(0,0,0,0.05); transition: 0.3s; }
          .admin-bar-card:hover { transform: scale(1.01); box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important; }
        `}
      </style>

      {/* NAVBAR */}
      <nav className="navbar nav-custom shadow-sm py-3 mb-5">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-3">
            <img src="logosekolah.png" alt="Logo" style={{ width: '40px' }} />
            <div className="d-none d-md-block">
              <span style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>DASHBOARD</span>
              <small className="d-block text-white-50 fw-normal" style={{ fontSize: '0.7rem' }}>SMP NEGERI 1 GAMPING</small>
            </div>
          </span>
          <div className="ms-auto">
            <button onClick={handleLogout} className="btn btn-sm btn-outline-light rounded-pill px-4 fw-bold shadow-sm">LOGOUT</button>
          </div>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '1000px' }}>
        
        {/* INFO WAKTU (Tambahan visual) */}
        <div className="text-end mb-3">
            <small className="fw-bold text-muted" style={{ letterSpacing: '0.5px' }}>📅 {waktu}</small>
        </div>

        {/* HERO BANNER */}
        <div className="welcome-banner p-4 p-md-5 mb-5 shadow-lg text-white">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="fw-bold mb-2">
                Selamat Datang, {profil.nama} 
                {(role === 'admin' || nis === 'admin') && <span className="ms-2 badge bg-white text-dark fw-bold" style={{fontSize:'0.4em', verticalAlign:'middle'}}>ADMIN</span>}
              </h1>
              <p className="lead opacity-75 mb-0">Sistem CBT dan Rekapitulasi Nilai Online</p>
            </div>
            <div className="col-md-4 text-md-end mt-4 mt-md-0">
               <span className="badge px-4 py-2 rounded-pill shadow-sm fw-bold" style={{ backgroundColor: colors.secondary, color: colors.primary }}>
                 {role === 'admin' ? 'SYSTEM ADMINISTRATOR' : `SISWA - KELAS ${profil.rombel}`}
               </span>
            </div>
          </div>
        </div>

        {/* MENU UTAMA SISWA */}
        <div className="row g-4">
          <div className="col-md-4">
            <Link to="/profil" className="card menu-card-elit p-4 shadow-sm h-100 text-decoration-none">
              <div className="icon-box">👤</div>
              <h5 className="fw-bold text-dark mb-2">Profil Siswa</h5>
              <p className="text-muted small">Kelola informasi biografi dan data administrasi kesiswaan Anda.</p>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/kartu-tes" className="card menu-card-elit p-4 shadow-sm h-100 text-decoration-none">
              <div className="icon-box">🪪</div>
              <h5 className="fw-bold text-dark mb-2">Kartu Ujian</h5>
              <p className="text-muted small">Akses kartu identitas resmi untuk mengikuti pelaksanaan evaluasi.</p>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/data-nilai" className="card menu-card-elit p-4 shadow-sm h-100 text-decoration-none">
              <div className="icon-box">📊</div>
              <h5 className="fw-bold text-dark mb-2">Laporan Nilai</h5>
              <p className="text-muted small">Tinjau akumulasi perolehan hasil belajar dan evaluasi akhir di sini.</p>
            </Link>
          </div>

          {/* Tombol CBT Siswa (Hanya tampil jika bukan admin) */}
          {role !== 'admin' && (
            <div className="col-md-12 mt-4">
                <Link to="/daftar-ujian" className="card menu-card-elit p-4 shadow-sm text-decoration-none border-0" style={{ background: `linear-gradient(to right, #fff, ${colors.bgLight})`, borderLeft: `6px solid ${colors.primary}` }}>
                    <div className="row align-items-center">
                        <div className="col-auto"><div className="icon-box m-0 shadow-sm" style={{ backgroundColor: colors.primary, color: '#fff' }}>📝</div></div>
                        <div className="col">
                            <h4 className="fw-bold text-dark mb-1">Ujian CBT Online</h4>
                            <p className="text-muted m-0 small">Masuk ke ruang pengerjaan ujian online terintegrasi.</p>
                        </div>
                        <div className="col-auto"><span className="badge rounded-pill px-4 py-2 fw-bold shadow-sm text-white" style={{backgroundColor: colors.primary}}>MULAI UJIAN</span></div>
                    </div>
                </Link>
            </div>
          )}
        </div>

        {/* --- AREA ADMIN --- */}
        {(role === 'admin' || nis === 'admin') && (
          <div className="mt-5 pt-4">
            <div className="d-flex align-items-center gap-3 mb-4 text-muted fw-bold text-uppercase" style={{ letterSpacing: '2px', fontSize: '0.8rem' }}>
               <span>Akses Kontrol Admin</span>
               <div className="flex-grow-1" style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }}></div>
            </div>
            
            <div className="row g-3">
              <div className="col-12 mb-2">
                <Link to="/daftar-ujian" className="text-decoration-none">
                  <div className="card admin-bar-card p-4 shadow-sm">
                    <div className="row align-items-center">
                        <div className="col-auto"><div className="icon-box m-0 shadow-sm" style={{ backgroundColor: colors.primary, color: '#fff' }}>⚙️</div></div>
                        <div className="col">
                            <h5 className="fw-bold text-dark mb-1">Kelola CBT</h5>
                            <p className="text-muted small mb-0">Kelola daftar ujian, butir soal, dan durasi waktu pengerjaan.</p>
                        </div>
                        <div className="col-auto"><span className="btn btn-sm fw-bold rounded-pill px-4 text-white" style={{backgroundColor: colors.primary}}>KELOLA SOAL</span></div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="col-12">
                <Link to="/admin" className="text-decoration-none">
                  <div className="card admin-bar-card p-4 shadow-sm">
                    <div className="row align-items-center">
                        <div className="col-auto"><div className="icon-box m-0 shadow-sm" style={{ backgroundColor: colors.secondary, color: '#fff' }}>📜</div></div>
                        <div className="col">
                            <h5 className="fw-bold text-dark mb-1">Sistem Rekap Nilai</h5>
                            <p className="text-muted small mb-0">Input nilai kategori ujian, kelola mapel utama, dan konfigurasi judul laporan.</p>
                        </div>
                        <div className="col-auto"><span className="btn btn-sm btn-dark fw-bold rounded-pill px-4">Buka Panel</span></div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Beranda;