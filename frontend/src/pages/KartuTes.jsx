import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { API_BASE_URL } from '../apiConfig'; // Import konfigurasi URL API

function KartuTes() {
  // Inisialisasi state dengan objek kosong agar tidak null
  const [profil, setProfil] = useState({
    nis: '-',
    password: '-',
    nama: '-',
    rombel: '-'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const nis = localStorage.getItem('nis');
    const role = localStorage.getItem('role');

    // Jika yang login Admin, langsung hentikan loading tanpa ambil data API
    if (role === 'admin' || nis === 'admin') {
      setLoading(false);
      return;
    }

    // Jika Siswa tapi NIS tidak ada
    if (!nis) {
      setLoading(false);
      return navigate('/');
    }

    // PERUBAHAN: Memanggil API PHP untuk mengambil profil
    axios.get(`${API_BASE_URL}/get_profil.php?nis=${nis}`)
      .then(res => {
        if (res.data && res.data.profil) {
          setProfil(res.data.profil);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Loading hanya tampil sebentar saat fetch data
  if (loading) return <div className="text-center mt-5 fw-bold text-primary">Memuat Kartu Tes...</div>;

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '50px' }}>
      
      <style>
        {`
          @media print {
            body, .bg-primary, .bg-light, .badge, .card {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-primary shadow-sm py-3 mb-5 d-print-none">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-2">
            <img src="/logo_smpn1gmp.png" alt="Logo" style={{ width: '32px', height: '32px' }} />
            Portal Akademik
          </span>
          <div className="ms-auto d-flex gap-2">
            <button onClick={() => window.print()} className="btn btn-success btn-sm fw-bold">🖨️ Cetak</button>
            <Link to="/beranda" className="btn btn-light text-primary btn-sm fw-bold">⬅ Beranda</Link>
          </div>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '750px' }}>
        <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div className="bg-primary text-white text-center py-3" style={{ borderBottom: '5px solid #ffc107' }}>
            <h4 className="fw-bold mb-0 text-uppercase">Kartu Peserta Ujian</h4>
            <p className="mb-0 small opacity-75">SMP Negeri 1 Gamping</p>
          </div>

          <div className="card-body p-4 p-md-5 bg-white">
            <div className="row align-items-center">
              <div className="col-md-8 col-7 border-end pe-4">
                <table className="table table-borderless mb-0 fs-6">
                  <tbody>
                    <tr>
                      <td width="40%" className="text-muted fw-bold pb-3">User ID</td>
                      <td width="5%">:</td>
                      <td className="fw-bold fs-5 text-primary pb-3">{profil.nis}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold pb-3">Password</td>
                      <td>:</td>
                      <td className="pb-3">
                        <span className="badge bg-light text-dark border px-3 py-2">
                          {profil.password}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold pb-3">Nama Lengkap</td>
                      <td>:</td>
                      <td className="fw-bold pb-3">{profil.nama}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold pb-3">Rombel</td>
                      <td>:</td>
                      <td className="fw-bold pb-3">{profil.rombel}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-4 col-5 text-center ps-md-4">
                <div className="bg-light p-2 d-inline-block border rounded-4 shadow-sm">
                  {/* Gunakan nilai default jika nis kosong agar QR Code tidak error */}
                  <QRCode value={profil.nis || "N/A"} size={110} level="M" />
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer bg-light text-center text-muted small py-3">
            <em>Kartu ini wajib dibawa saat pelaksanaan evaluasi akademik.</em>
          </div>
        </div>
        
        {/* Pesan Tambahan khusus Admin */}
        {(localStorage.getItem('role') === 'admin' || localStorage.getItem('nis') === 'admin') && (
          <div className="alert alert-warning mt-4 d-print-none text-center small">
            <strong>Mode Admin:</strong> Menampilkan layout kartu kosong untuk preview.
          </div>
        )}
      </div>
    </div>
  );
}

export default KartuTes;