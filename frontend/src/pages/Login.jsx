import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Pastikan axios diimport

function Login() {
  const [nis, setNis] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // 1. LOGIKA UNTUK ADMIN (Statik)
    if (nis === 'admin' && password === 'admin123') {
      localStorage.setItem('nis', 'admin');
      localStorage.setItem('role', 'admin');
      navigate('/admin');
      return;
    } 

    // 2. LOGIKA UNTUK SISWA (Cek ke Database)
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        nis: nis,
        password: password
      });

      if (response.data.success) {
        // SIMPAN KE LOCALSTORAGE (Penting!)
        localStorage.setItem('nis', response.data.nis); 
        localStorage.setItem('role', 'siswa');
        
        navigate('/beranda');
      }
    } catch (err) {
      console.error("Login Error:", err);
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.message || "NIS atau Password salah!");
      } else {
        setErrorMsg("Tidak dapat terhubung ke server backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex flex-column align-items-center justify-content-center vh-100" 
      style={{ background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }} 
    >
      <div 
        className="card border-0 p-5 mb-4" 
        style={{ width: '100%', maxWidth: '420px', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', backgroundColor: 'white' }}
      >
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '65px', height: '65px', fontSize: '28px' }}>
            🎓
          </div>
          <h4 className="text-primary fw-bold mb-1">Portal Siswa</h4>
          <p className="text-muted small">SMP Negeri 1 Gamping</p>
        </div>
        
        {errorMsg && <div className="alert alert-danger py-2 text-center small rounded-3">{errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small text-muted fw-bold mb-1">User ID (NIS)</label>
            <input 
              type="text" className="form-control form-control-lg bg-light border-0" placeholder="Masukkan User ID"
              style={{ borderRadius: '12px', fontSize: '15px' }} value={nis} onChange={(e) => setNis(e.target.value)} 
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label small text-muted fw-bold mb-1">Password</label>
            <input 
              type="password" className="form-control form-control-lg bg-light border-0" placeholder="Masukkan Password"
              style={{ borderRadius: '12px', fontSize: '15px' }} value={password} onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          <button 
            type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
            style={{ borderRadius: '12px' }}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;