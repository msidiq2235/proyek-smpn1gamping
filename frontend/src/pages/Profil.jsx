import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function Profil() {
  const [siswa, setSiswa] = useState({
    nis: '', password: '', nama: '', rombel: '', asal_sekolah: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const nis = localStorage.getItem('nis');
  const role = localStorage.getItem('role');

  // Palette Warna Eksklusif
  const colors = {
    primary: '#023874',   // Biru Navy
    secondary: '#B8860B', // Emas Tua
    bgLight: '#F4F1EA',   // Krem Putih
    white: '#ffffff'
  };

  useEffect(() => {
    const fetchProfil = async () => {
      if (role === 'admin' || nis === 'admin') {
        setSiswa({
          nis: 'ADMIN-ROOT',
          password: '•••••',
          nama: 'System Administrator',
          rombel: 'Semua Akses',
          asal_sekolah: 'SMP Negeri 1 Gamping'
        });
        setLoading(false);
        return;
      }

      if (!nis) return navigate('/');

      try {
        const res = await axios.get(`${API_BASE_URL}/get_profil.php?nis=${nis}`);
        if (res.data && res.data.profil) {
          setSiswa(res.data.profil);
        }
      } catch (err) {
        console.error("Gagal mengambil data profil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, [nis, role, navigate]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', paddingBottom: '50px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Navbar Style */}
      <nav className="navbar shadow-sm py-3 mb-5" style={{ backgroundColor: colors.primary, borderBottom: `4px solid ${colors.secondary}` }}>
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-3">
            <img src="logosekolah.png" alt="Logo" style={{ width: '30px' }} />
            <span style={{ letterSpacing: '1px', fontSize: '1.1rem' }}>PROFIL PENGGUNA</span>
          </span>
          <button onClick={() => navigate('/beranda')} className="btn btn-outline-light btn-sm fw-bold px-4 rounded-pill shadow-sm">
            🏠 KEMBALI
          </button>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '600px' }}>
        <div className="card border-0 shadow-lg overflow-hidden" style={{ borderRadius: '20px' }}>
          
          {/* Header Profil */}
          <div className="text-center p-5 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #011f41 100%)` }}>
            <div className="mb-3 d-inline-block p-3 rounded-circle bg-white shadow-sm">
              <span style={{ fontSize: '50px' }}>{role === 'admin' ? '🛡️' : '👤'}</span>
            </div>
            <h3 className="fw-bold m-0 text-uppercase" style={{ letterSpacing: '1px' }}>{siswa.nama}</h3>
            <span className="badge mt-2 px-3 py-2 rounded-pill" style={{ backgroundColor: colors.secondary, color: colors.primary }}>
              {role === 'admin' ? 'ADMINISTRATOR' : `SISWA - ${siswa.rombel}`}
            </span>
          </div>

          <div className="card-body p-4 p-md-5 bg-white">
            <div className="row g-4">
              
              <div className="col-12">
                <label className="small fw-bold text-muted text-uppercase mb-1" style={{ letterSpacing: '1px' }}>ID Registrasi (NIS)</label>
                <div className="p-3 bg-light rounded-3 fw-bold text-dark border-start border-4 border-primary">
                  {siswa.nis}
                </div>
              </div>

              <div className="col-12">
                <label className="small fw-bold text-muted text-uppercase mb-1" style={{ letterSpacing: '1px' }}>Kata Sandi / Token</label>
                <div className="p-3 bg-light rounded-3 text-dark d-flex justify-content-between align-items-center">
                  <span className="fw-bold">{siswa.password}</span>
                  <small className="text-muted italic">Bersifat Rahasia</small>
                </div>
              </div>

              <div className="col-md-6">
                <label className="small fw-bold text-muted text-uppercase mb-1">Rombongan Belajar</label>
                <div className="p-3 bg-light rounded-3 text-dark fw-medium">
                  {siswa.rombel}
                </div>
              </div>

              <div className="col-md-6">
                <label className="small fw-bold text-muted text-uppercase mb-1">Unit Pendidikan</label>
                <div className="p-3 bg-light rounded-3 text-dark fw-medium">
                  {siswa.asal_sekolah}
                </div>
              </div>

            </div>

            <div className="mt-5">
              <button onClick={() => navigate('/beranda')} className="btn btn-primary w-100 fw-bold py-3 shadow-sm rounded-pill" style={{ backgroundColor: colors.primary, letterSpacing: '1px' }}>
                KEMBALI KE DASHBOARD
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
            <p className="text-muted small">
                {role === 'admin' 
                    ? "Akses kontrol penuh sistem aktif." 
                    : "Lapor ke Admin jika terdapat kesalahan data biografi."}
            </p>
        </div>
      </div>
    </div>
  );
}

export default Profil;