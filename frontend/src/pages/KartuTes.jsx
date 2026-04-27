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

  // Palette Biru Navy & Emas
  const colors = {
    primary: '#023874',
    secondary: '#B8860B',
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
      .catch(err => console.error("Gagal memuat profil:", err))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="text-center mt-5 fw-bold" style={{ color: colors.primary }}>Menyiapkan Kartu Peserta...</div>;

  return (
    <div style={{ backgroundColor: colors.light, minHeight: '100vh', paddingBottom: '50px', fontFamily: "'Inter', sans-serif" }}>
      
      <style>
        {`
          @media print {
            @page { size: portrait; margin: 0; }
            body { background-color: white !important; margin: 20mm; }
            .d-print-none { display: none !important; }
            .card-main { border: 2px solid ${colors.primary} !important; box-shadow: none !important; width: 100% !important; }
            .header-print { background-color: ${colors.primary} !important; -webkit-print-color-adjust: exact; color: white !important; }
            .bg-gold-print { background-color: ${colors.secondary} !important; -webkit-print-color-adjust: exact; height: 4px; }
          }
          .card-token {
            border: 2px dashed ${colors.secondary};
            background-color: #fffaf0;
            font-family: 'Courier New', Courier, monospace;
            font-size: 1.2rem;
          }
        `}
      </style>

      {/* NAVBAR (Hidden saat Print) */}
      <nav className="navbar navbar-dark shadow-sm py-3 mb-5 d-print-none" style={{ backgroundColor: colors.primary }}>
        <div className="container px-4">
          <span className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <img src="logosekolah.png" alt="Logo" style={{ width: '30px' }} />
            KARTU PESERTA
          </span>
          <div className="ms-auto d-flex gap-2">
            <button onClick={() => window.print()} className="btn btn-success btn-sm fw-bold px-4 rounded-pill shadow-sm">🖨️ CETAK KARTU</button>
            <Link to="/beranda" className="btn btn-light btn-sm fw-bold px-4 rounded-pill shadow-sm text-primary">KEMBALI</Link>
          </div>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '750px' }}>
        <div className="card card-main border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden', backgroundColor: colors.white }}>
          
          {/* Header Kartu */}
          <div className="header-print p-4 text-white" style={{ backgroundColor: colors.primary }}>
            <div className="row align-items-center">
                <div className="col-auto">
                    <img src="logosekolah.png" alt="Logo" style={{ width: '70px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                </div>
                <div className="col text-center text-md-start">
                    <h4 className="fw-bold mb-0 text-uppercase" style={{ letterSpacing: '2px' }}>Kartu Peserta Ujian</h4>
                    <p className="mb-0 opacity-75 fw-bold">SMP NEGERI 1 GAMPING</p>
                </div>
            </div>
          </div>
          <div className="bg-gold-print" style={{ backgroundColor: colors.secondary, height: '5px' }}></div>

          <div className="card-body p-4 p-md-5">
            <div className="row">
              {/* Data Kiri */}
              <div className="col-md-7 border-end-md pe-md-4">
                <div className="mb-4">
                  <label className="small text-muted fw-bold text-uppercase d-block mb-1" style={{ letterSpacing: '1px' }}>ID Peserta / NIS</label>
                  <div className="fs-3 fw-bold" style={{ color: colors.primary }}>{profil.nis}</div>
                </div>

                <div className="mb-4">
                  <label className="small text-muted fw-bold text-uppercase d-block mb-1" style={{ letterSpacing: '1px' }}>Nama Lengkap</label>
                  <div className="h5 fw-bold text-dark">{profil.nama}</div>
                </div>

                <div className="row g-3">
                    <div className="col-6">
                        <label className="small text-muted fw-bold text-uppercase d-block mb-1">Kelas</label>
                        <div className="fw-bold text-dark px-3 py-2 bg-light rounded-3 d-inline-block w-100">{profil.rombel}</div>
                    </div>
                    <div className="col-6">
                        <label className="small text-muted fw-bold text-uppercase d-block mb-1 text-danger">Kunci Akses</label>
                        <div className="card-token px-2 py-2 text-center rounded-3 fw-bold text-dark shadow-sm">
                            {profil.password}
                        </div>
                    </div>
                </div>
              </div>

              {/* QR Code Kanan */}
              <div className="col-md-5 d-flex flex-column align-items-center justify-content-center mt-5 mt-md-0">
                <div className="p-3 border-2 border-light rounded-4 bg-white shadow-sm mb-3">
                    <QRCode 
                        value={`SMPN1GAMPING-${profil.nis}`} 
                        size={150} 
                        fgColor={colors.primary}
                    />
                </div>
                <div className="text-center">
                    <span className="badge bg-light text-muted rounded-pill px-3 py-2 fw-normal" style={{ fontSize: '10px' }}>VERIFIKASI DIGITAL PESERTA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Kartu */}
          <div className="bg-light p-4 text-center border-top">
            <div className="row align-items-center">
                <div className="col-md-8 text-md-start">
                    <p className="mb-0 text-muted small" style={{ fontStyle: 'italic', lineHeight: '1.4' }}>
                      "Kartu ini adalah bukti sah kepesertaan ujian. Harap dibawa setiap sesi ujian berlangsung dan tidak diperkenankan dipindahtangankan."
                    </p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    <img src="ttd_kepsek.png" alt="Cap & TTD" style={{ height: '50px', opacity: 0.8 }} className="d-none d-print-block mx-auto me-md-0" />
                    <div className="small fw-bold text-dark mt-1">Panitia Ujian CBT</div>
                </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center d-print-none">
            <p className="text-muted small">💡 <b>Tips:</b> Gunakan kertas ukuran A4 atau F4 saat mencetak untuk hasil terbaik.</p>
        </div>
      </div>
    </div>
  );
}

export default KartuTes;