import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { API_BASE_URL } from '../apiConfig';

function KartuTes() {
  const [profil, setProfil] = useState({
    nis: '-',
    password: '-',
    nama: '-',
    rombel: '-'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Warna Biru Navy Pilihan Bos
  const colors = {
    primary: '#023874',
    secondary: '#B8860B', // Aksen Emas Tua
    light: '#f4f7f6',
    white: '#ffffff'
  };

  useEffect(() => {
    const nis = localStorage.getItem('nis');
    const role = localStorage.getItem('role');

    if (role === 'admin' || nis === 'admin') {
      setProfil({
        nis: 'ADMIN-001',
        password: '*****',
        nama: 'Administrator Sistem',
        rombel: 'All Access'
      });
      setLoading(false);
      return;
    }

    if (!nis) {
      setLoading(false);
      return navigate('/');
    }

    axios.get(`${API_BASE_URL}/get_profil.php?nis=${nis}`)
      .then(res => {
        if (res.data && res.data.profil) {
          setProfil(res.data.profil);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="text-center mt-5">Memuat Kartu...</div>;

  return (
    <div style={{ backgroundColor: colors.light, minHeight: '100vh', paddingBottom: '50px' }}>
      
      <style>
        {`
          @media print {
            body { background-color: white !important; }
            .d-print-none { display: none !important; }
            .card { border: 1px solid #ddd !important; box-shadow: none !important; }
            .bg-primary { background-color: ${colors.primary} !important; -webkit-print-color-adjust: exact; }
          }
          .card-token {
            border: 1px dashed ${colors.primary};
            background-color: #f8f9fa;
            font-family: 'Courier New', Courier, monospace;
          }
        `}
      </style>

      {/* Navbar Simple */}
      <nav className="navbar navbar-dark shadow-sm py-3 mb-5 d-print-none" style={{ backgroundColor: colors.primary }}>
        <div className="container px-4">
          <span className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <img src="logosekolah.png" alt="Logo" style={{ width: '30px' }} />
            Kartu Ujian
          </span>
          <div className="ms-auto d-flex gap-2">
            <button onClick={() => window.print()} className="btn btn-success btn-sm fw-bold px-3">Cetak Kartu</button>
            <Link to="/beranda" className="btn btn-light btn-sm fw-bold px-3">Kembali</Link>
          </div>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '700px' }}>
        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
          
          {/* Header Kartu */}
          <div className="p-4 text-white text-center" style={{ backgroundColor: colors.primary, borderBottom: `4px solid ${colors.secondary}` }}>
            <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                <img src="logosekolah.png" alt="Logo" style={{ width: '50px' }} />
                <div className="text-start">
                    <h5 className="fw-bold mb-0 text-uppercase" style={{ letterSpacing: '1px' }}>Kartu Peserta Ujian</h5>
                    <p className="mb-0 small">SMP NEGERI 1 GAMPING</p>
                </div>
            </div>
          </div>

          <div className="card-body p-4 p-md-5">
            <div className="row">
              {/* Data Kiri */}
              <div className="col-md-8 border-end">
                <div className="mb-3">
                  <label className="small text-muted fw-bold text-uppercase">Nomor Induk Siswa (NIS)</label>
                  <div className="fs-4 fw-bold" style={{ color: colors.primary }}>{profil.nis}</div>
                </div>

                <div className="mb-3">
                  <label className="small text-muted fw-bold text-uppercase">Nama Lengkap</label>
                  <div className="fw-bold text-dark">{profil.nama}</div>
                </div>

                <div className="row">
                    <div className="col-6">
                        <label className="small text-muted fw-bold text-uppercase">Kelas</label>
                        <div className="fw-bold text-dark">{profil.rombel}</div>
                    </div>
                    <div className="col-6">
                        <label className="small text-muted fw-bold text-uppercase">Password</label>
                        <div className="card-token px-2 py-1 text-center rounded fw-bold text-dark">
                            {profil.password}
                        </div>
                    </div>
                </div>
              </div>

              {/* QR Code Kanan */}
              <div className="col-md-4 d-flex align-items-center justify-content-center mt-4 mt-md-0">
                <div className="text-center">
                    <div className="p-2 border rounded bg-white shadow-sm mb-2">
                        <QRCode value={profil.nis || "N/A"} size={120} />
                    </div>
                    <small className="text-muted" style={{ fontSize: '10px' }}>SCAN UNTUK VERIFIKASI</small>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Kartu */}
          <div className="bg-light p-3 text-center border-top">
            <p className="mb-0 text-muted small" style={{ fontStyle: 'italic' }}>
              "Simpan kartu ini baik-baik. Kehilangan kartu dapat menghambat proses ujian."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KartuTes;