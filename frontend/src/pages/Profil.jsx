import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig'; // Pastikan import ini ada

function Profil() {
  const [siswa, setSiswa] = useState({
    nis: '',
    password: '',
    nama: '',
    rombel: '',
    asal_sekolah: ''
  });
  const [loading, setLoading] = useState(true);
  const nis = localStorage.getItem('nis');
  const role = localStorage.getItem('role'); // Ambil role dari localstorage

  useEffect(() => {
    const fetchProfil = async () => {
      // Jika Admin, tidak perlu fetch data siswa berdasarkan NIS
      if (role === 'admin' || nis === 'admin') {
        setSiswa({
          nis: 'ADMIN-ACCESS',
          password: '*****',
          nama: 'Administrator Sistem',
          rombel: 'All Access',
          asal_sekolah: 'SMPN 1 Gamping'
        });
        setLoading(false);
        return;
      }

      if (!nis) return;
      try {
        // PERUBAHAN DI SINI: Menggunakan API PHP XAMPP
        const res = await axios.get(`${API_BASE_URL}/get_profil.php?nis=${nis}`);
        if (res.data && res.data.profil) {
          setSiswa(res.data.profil);
        }
      } catch (err) {
        console.error("Gagal load profil dari server PHP");
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, [nis, role]);

  if (loading) return <div className="text-center mt-5 fw-bold text-primary">Memuat Profil...</div>;

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* Navbar Biru */}
      <nav className="navbar navbar-expand-lg bg-primary shadow-sm py-3 mb-5">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-2">
            <img
              src="/logo_smpn1gmp.png"
              alt="Logo SMPN 1 Gamping"
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
            Portal Akademik
          </span>
          <Link to="/beranda" className="btn btn-light text-primary btn-sm shadow-sm fw-bold px-3" style={{ borderRadius: '8px' }}>
            ⬅ Beranda
          </Link>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '480px' }}>
        <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="card-body p-4 p-md-5">
            
            {/* Header Icon */}
            <div className="text-center mb-4">
              <div className={(role === 'admin' || nis === 'admin') ? "text-danger mb-2" : "text-primary mb-2"} style={{ fontSize: '50px' }}>
                {(role === 'admin' || nis === 'admin') ? '🛡️' : '👤'}
              </div>
              <h4 className="fw-bold text-dark">{(role === 'admin' || nis === 'admin') ? 'Profil Administrator' : 'Profil Siswa'}</h4>
            </div>

            <div className="row g-3">
              {/* Field NIS */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">NIS (Nomor Induk Siswa)</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  value={siswa.nis} 
                  disabled 
                  style={{ borderRadius: '10px', cursor: 'not-allowed' }} 
                />
              </div>

              {/* Field Password */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Password</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  value={siswa.password} 
                  disabled 
                  style={{ borderRadius: '10px', cursor: 'not-allowed' }} 
                />
              </div>

              {/* Field Nama */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Nama Lengkap</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  value={siswa.nama} 
                  disabled 
                  style={{ borderRadius: '10px', cursor: 'not-allowed' }} 
                />
              </div>

              {/* Field Rombel */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Rombel / Kelas</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  value={siswa.rombel} 
                  disabled 
                  style={{ borderRadius: '10px', cursor: 'not-allowed' }} 
                />
              </div>

              {/* Field Asal Sekolah */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Asal Sekolah</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0 py-2" 
                  value={siswa.asal_sekolah} 
                  disabled 
                  style={{ borderRadius: '10px', cursor: 'not-allowed' }} 
                />
              </div>

              {/* Tombol Kembali Saja */}
              <div className="col-12 mt-4">
                <Link to="/beranda" className="btn btn-primary w-100 fw-bold py-2 shadow-sm" style={{ borderRadius: '10px' }}>
                  Kembali ke Beranda
                </Link>
              </div>
            </div>

          </div>
        </div>
        
        {/* Pesan Tambahan khusus Admin atau Siswa */}
        {(role === 'admin' || nis === 'admin') ? (
          <div className="alert alert-warning mt-4 text-center small border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <strong>Mode Admin:</strong> Anda melihat tampilan profil sistem. Data siswa hanya dapat diubah melalui menu <strong>Admin Panel</strong>.
          </div>
        ) : (
          <p className="text-center mt-3 text-muted small">
            *Data ini dikunci. Hubungi operator jika ada kesalahan data.
          </p>
        )}
      </div>
    </div>
  );
}

export default Profil;