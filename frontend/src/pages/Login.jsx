import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2';

function Login() {
  const [nis, setNis] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const colors = {
    primary: '#023874',    // Biru Navy Elit
    secondary: '#B8860B',  // Emas Tua
    bgLight: '#F4F1EA',    // Krem Putih
    white: '#ffffff'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (nis === 'admin' && password === 'Yogatama123') {
      localStorage.setItem('nis', 'admin');
      localStorage.setItem('role', 'admin');
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        text: 'Selamat datang, Administrator!',
        timer: 1500,
        showConfirmButton: false,
        iconColor: colors.secondary
      }).then(() => { navigate('/beranda'); });
      return;
    } 

    try {
      const response = await axios.post(`${API_BASE_URL}/login.php`, { nis, password });
      if (response.data.success) {
        localStorage.setItem('nis', response.data.user.nis); 
        localStorage.setItem('role', 'siswa');
        Swal.fire({
          icon: 'success',
          title: 'Akses Diterima',
          text: `Selamat datang, ${response.data.user.nama}!`,
          timer: 1500,
          showConfirmButton: false,
          iconColor: colors.primary
        }).then(() => { navigate('/beranda'); });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: response.data.message || 'NIS atau Password salah.',
          confirmButtonColor: colors.primary
        });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Opps...', text: 'Kesalahan Server', confirmButtonColor: colors.primary });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center min-vh-100 p-3" 
      style={{ backgroundColor: colors.bgLight, fontFamily: "'Inter', sans-serif" }} 
    >
      <div 
        className="card border-0 shadow-lg overflow-hidden" 
        style={{ width: '100%', maxWidth: '1000px', borderRadius: '20px', backgroundColor: colors.white }}
      >
        <div className="row g-0">
          
          {/* --- BAGIAN KIRI: VISI & MISI (MODERN INFO) --- */}
          <div className="col-lg-6 d-none d-lg-block p-5 text-white" style={{ backgroundColor: colors.primary, position: 'relative' }}>
            {/* Dekorasi Background */}
            <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            
            <div className="position-relative">
              <div className="d-flex align-items-center gap-3 mb-4">
                <img src="logosekolah.png" alt="Logo" style={{ width: '50px' }} />
                <div>
                  <h5 className="fw-bold m-0" style={{ letterSpacing: '1px' }}>PROFIL SEKOLAH</h5>
                  <small className="text-white-50">SMP NEGERI 1 GAMPING</small>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold text-uppercase" style={{ color: colors.secondary, letterSpacing: '2px' }}>Visi</h6>
                <p className="fst-italic" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                  “Bertaqwa, Unggul, Berbudaya, Berwawasan Lingkungan dan Berwawasan Global”
                </p>
              </div>

              <div>
                <h6 className="fw-bold text-uppercase" style={{ color: colors.secondary, letterSpacing: '2px' }}>Misi</h6>
                <ul className="ps-3" style={{ fontSize: '0.85rem', lineHeight: '1.8', opacity: '0.9' }}>
                  <li>Mewujudkan kesadaran dalam menghayati dan mengamalkan ajaran agama</li>
                  <li>Menumbuhkembangkan potensi yang dimiliki peserta didik</li>
                  <li>Mewujudkan peserta didik yang cerdas, terampil akademik & non-akademik</li>
                  <li>Melestarikan dan mengembangkan kebudayaan</li>
                  <li>Mewujudkan peserta didik yang cinta budaya</li>
                  <li>Mewujudkan sekolah berwawasan lingkungan</li>
                  <li>Meningkatkan SDM melalui penguasaan teknologi</li>
                  <li>Mengembangkan komunikasi nasional & internasional</li>
                </ul>
              </div>
            </div>
          </div>

          {/* --- BAGIAN KANAN: FORM LOGIN --- */}
          <div className="col-lg-6 p-4 p-md-5">
            <div className="text-center mb-5">
              <img 
                src="logosekolah.png" 
                alt="Logo"
                className="mb-3 d-lg-none"
                style={{ width: '60px' }}
              />
              <h4 className="fw-bold text-dark">Portal Akademik</h4>
              <p className="text-muted small">Silahkan masuk menggunakan akun Anda</p>
              <div style={{ width: '40px', height: '3px', backgroundColor: colors.secondary, margin: '15px auto' }}></div>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">USER ID / NIS</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">👤</span>
                  <input 
                    type="text" 
                    className="form-control border-0 bg-light" 
                    placeholder="Masukkan NIS Anda"
                    style={{ padding: '12px', fontSize: '14px' }}
                    value={nis} 
                    onChange={(e) => setNis(e.target.value)} 
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">PASSWORD</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">🔒</span>
                  <input 
                    type="password" 
                    className="form-control border-0 bg-light" 
                    placeholder="••••••••"
                    style={{ padding: '12px', fontSize: '14px' }}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 fw-bold py-3 shadow border-0"
                style={{ borderRadius: '12px', backgroundColor: colors.primary, letterSpacing: '1px' }}
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm"></span> : 'MASUK KE SISTEM'}
              </button>
            </form>
            
            <div className="text-center mt-5">
              <p className="text-muted" style={{ fontSize: '11px' }}>
                Unit Pelaksana Teknis SMP Negeri 1 Gamping. <br/> 
                <span className="fw-bold" style={{ color: colors.secondary }}>Magang UMY TI 23</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;