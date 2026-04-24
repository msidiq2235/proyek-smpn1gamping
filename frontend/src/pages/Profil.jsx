import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  // Warna Biru Navy Pilihan Bos
  const colors = {
    primary: '#023874',
    light: '#f4f7f6',
    white: '#ffffff'
  };

  useEffect(() => {
    const fetchProfil = async () => {
      if (role === 'admin' || nis === 'admin') {
        setSiswa({
          nis: 'ADMIN',
          password: '*****',
          nama: 'Administrator',
          rombel: 'Semua Kelas',
          asal_sekolah: 'SMP Negeri 1 Gamping'
        });
        setLoading(false);
        return;
      }

      if (!nis) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/get_profil.php?nis=${nis}`);
        if (res.data && res.data.profil) {
          setSiswa(res.data.profil);
        }
      } catch (err) {
        console.error("Gagal ambil data profil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, [nis, role]);

  if (loading) return <div className="text-center mt-5">Memuat data...</div>;

  return (
    <div style={{ backgroundColor: colors.light, minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* Navbar Simple */}
      <nav className="navbar navbar-dark shadow-sm py-3 mb-5" style={{ backgroundColor: colors.primary }}>
        <div className="container px-4">
          <span className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <img src="logosekolah.png" alt="Logo" style={{ width: '30px' }} />
            Data Profil
          </span>
          <button onClick={() => navigate('/beranda')} className="btn btn-light btn-sm fw-bold px-3">
            Kembali
          </button>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '500px' }}>
        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
          <div className="card-body p-4">
            
            <div className="text-center mb-4">
              <div className="mb-2" style={{ fontSize: '40px' }}>
                {role === 'admin' ? '' : '👤'}
              </div>
              <h4 className="fw-bold">{role === 'admin' ? 'Profil Admin' : 'Profil Siswa'}</h4>
              <hr />
            </div>

            <div className="mb-3">
              <label className="small fw-bold text-muted">NIS / Username</label>
              <div className="p-2 border-bottom fw-bold text-dark">{siswa.nis}</div>
            </div>

            <div className="mb-3">
              <label className="small fw-bold text-muted">Password</label>
              <div className="p-2 border-bottom text-dark">{siswa.password}</div>
            </div>

            <div className="mb-3">
              <label className="small fw-bold text-muted">Nama Lengkap</label>
              <div className="p-2 border-bottom text-dark">{siswa.nama}</div>
            </div>

            <div className="mb-3">
              <label className="small fw-bold text-muted">Kelas</label>
              <div className="p-2 border-bottom text-dark">{siswa.rombel}</div>
            </div>

            <div className="mb-4">
              <label className="small fw-bold text-muted">Asal Sekolah</label>
              <div className="p-2 border-bottom text-dark">{siswa.asal_sekolah}</div>
            </div>

            {/* Tombol Balik */}
            <button onClick={() => navigate('/beranda')} className="btn btn-primary w-100 fw-bold py-2" style={{ backgroundColor: colors.primary }}>
              Selesai
            </button>

          </div>
        </div>

        <p className="text-center mt-4 text-muted small">
          {role === 'admin' 
            ? "Mode Admin Aktif." 
            : "*Jika ada kesalahan data, silakan lapor ke Admin."}
        </p>
      </div>
    </div>
  );
}

export default Profil;