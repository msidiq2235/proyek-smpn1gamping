import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';

function KartuTes() {
  const [profil, setProfil] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const nis = localStorage.getItem('nis');
    if (!nis) return navigate('/');
    axios.get(`http://localhost:5000/api/siswa/${nis}`)
      .then(res => setProfil(res.data.profil))
      .catch(err => console.error(err));
  }, [navigate]);

  if (!profil) return <div className="text-center mt-5">Memuat Kartu Tes...</div>;

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* --- INI KUNCI RAHASIANYA --- */}
      {/* CSS internal ini akan memaksa browser mengeprint semua warna background */}
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

      {/* Navbar Biru Teks Putih */}
      <nav className="navbar navbar-expand-lg bg-primary shadow-sm py-3 mb-5 d-print-none">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white">🎓 Portal Akademik</span>
          <div className="ms-auto d-flex gap-2">
            <button onClick={() => window.print()} className="btn btn-success btn-sm shadow-sm fw-bold px-3 border border-light" style={{ borderRadius: '8px' }}>
              🖨️ Cetak
            </button>
            <Link to="/beranda" className="btn btn-light text-primary btn-sm shadow-sm fw-bold px-3" style={{ borderRadius: '8px' }}>
              ⬅ Beranda
            </Link>
          </div>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '750px' }}>
        {/* Desain Kartu Ujian */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div className="bg-primary text-white text-center py-3" style={{ borderBottom: '5px solid #ffc107' }}>
            <h4 className="fw-bold mb-0 text-uppercase tracking-wide">Kartu Peserta Ujian</h4>
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
                        <span className="badge bg-light text-dark border px-3 py-2 fs-6 shadow-sm">
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
                  <QRCode value={profil.nis} size={110} level="M" />
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer bg-light text-center text-muted small py-3 border-top-0">
            <em>Kartu ini wajib dibawa saat pelaksanaan evaluasi akademik.</em>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KartuTes;