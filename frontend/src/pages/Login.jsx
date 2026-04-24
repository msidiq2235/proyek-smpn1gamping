import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function Login() {
  const [nis, setNis] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Palette Warna Eksklusif
  const colors = {
    primary: '#023874',    // Biru Navy Elit
    secondary: '#B8860B',  // Emas Tua (Aksen)
    bgLight: '#F4F1EA',    // Krem Putih
    white: '#ffffff'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // 1. LOGIKA UNTUK ADMIN (Statik)
    if (nis === 'admin' && password === 'Yogatama123') {
      localStorage.setItem('nis', 'admin');
      localStorage.setItem('role', 'admin');
      navigate('/beranda'); // Diarahkan ke Dashboard Utama
      return;
    } 

    // 2. LOGIKA UNTUK SISWA (Cek Database)
    try {
      const response = await axios.post(`${API_BASE_URL}/login.php`, {
        nis: nis,
        password: password
      });

      if (response.data.success) {
        localStorage.setItem('nis', response.data.user.nis); 
        localStorage.setItem('role', 'siswa');
        navigate('/beranda');
      }
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.message || "Kredensial tidak valid.");
      } else {
        setErrorMsg("Koneksi ke server gagal.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center vh-100" 
      style={{ backgroundColor: colors.bgLight, fontFamily: "'Inter', sans-serif" }} 
    >
      <div 
        className="card border-0 shadow-lg" 
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          borderRadius: '15px', 
          overflow: 'hidden',
          backgroundColor: colors.white 
        }}
      >
        {/* Header Biru Navy */}
        <div 
          className="p-4 text-center text-white" 
          style={{ backgroundColor: colors.primary, borderBottom: `4px solid ${colors.secondary}` }}
        >
          <img 
            src="logosekolah.png" 
            alt="Logo"
            className="mb-3 shadow-sm p-1 rounded"
            style={{ width: '70px', height: '70px', objectFit: 'contain' }}
          />
          <h4 className="fw-bold m-0" style={{ letterSpacing: '1px' }}>Login Siswa</h4>
          <small className="text-white-50">SMP NEGERI 1 GAMPING</small>
        </div>

        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h5 className="fw-bold text-dark">Sistem Autentikasi</h5>
            <div style={{ width: '40px', height: '3px', backgroundColor: colors.secondary, margin: '8px auto' }}></div>
          </div>
          
          {errorMsg && (
            <div className="alert alert-danger py-2 text-center small border-0 shadow-sm mb-4" style={{ borderRadius: '8px' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>User ID / NIS</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><i className="bi bi-person"></i>👤</span>
                <input 
                  type="text" 
                  className="form-control border-0 bg-light" 
                  placeholder="Masukkan User ID"
                  style={{ fontSize: '14px', padding: '12px' }} 
                  value={nis} 
                  onChange={(e) => setNis(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '10px' }}>Security Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0">🔒</span>
                <input 
                  type="password" 
                  className="form-control border-0 bg-light" 
                  placeholder="Masukkan Password"
                  style={{ fontSize: '14px', padding: '12px' }} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 fw-bold py-3 shadow border-0"
              style={{ 
                borderRadius: '8px', 
                backgroundColor: colors.primary,
                letterSpacing: '1px'
              }}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : 'MASUK KE SISTEM'}
            </button>
          </form>
          
          <div className="text-center mt-5">
            <p className="text-muted" style={{ fontSize: '11px' }}>
              &copy; 2026 SMP Negeri 1 Gamping. <br/> 
              <span className="fw-bold" style={{ color: colors.secondary }}>Magang UMY TI 23</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;