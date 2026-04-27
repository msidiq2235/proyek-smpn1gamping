import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import 'chart.js/auto';
import { API_BASE_URL } from '../apiConfig';

function DataNilai() {
  const [dataMapel, setDataMapel] = useState([]);
  const [daftarKategori, setDaftarKategori] = useState([]); 
  const [profil, setProfil] = useState({ nama: '', nis: '', rombel: '', asal_sekolah: '' });
  const [rataSekolah, setRataSekolah] = useState([]);
  const [judulLaporan, setJudulLaporan] = useState('Laporan Hasil Evaluasi');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const nis = localStorage.getItem('nis');
  const colors = {
    primary: '#023874',
    secondary: '#B8860B',
    bgLight: '#F4F7F6',
    white: '#ffffff'
  };

  const warnaGrafik = ['#dc3545', '#0d6efd', '#212529', '#ffc107', '#198754', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resSiswa, resNilai, resRata, resKategori, resJudul, resMapel] = await Promise.all([
          axios.get(`${API_BASE_URL}/get_profil.php?nis=${nis}`),
          axios.get(`${API_BASE_URL}/get_nilai.php?nis=${nis}`),
          axios.get(`${API_BASE_URL}/get_rata_sekolah.php`),
          axios.get(`${API_BASE_URL}/get_kategori.php`),
          axios.get(`${API_BASE_URL}/get_judul.php`),
          axios.get(`${API_BASE_URL}/get_mapel.php`)
        ]);

        if (resSiswa.data?.profil) setProfil(resSiswa.data.profil);
        if (resJudul.data?.judul) setJudulLaporan(resJudul.data.judul);
        setDaftarKategori(Array.isArray(resKategori.data) ? resKategori.data : []);

        const masterMapel = Array.isArray(resMapel.data) ? resMapel.data : [];
        const nilaiSiswa = Array.isArray(resNilai.data) ? resNilai.data : [];

        const dataGabungan = masterMapel.map(master => {
          const nilaiCocok = nilaiSiswa.find(n => n.mapel === master.nama_mapel);
          return { mapel: master.nama_mapel, ...nilaiCocok };
        });
        setDataMapel(dataGabungan);

        const rataSekolahAsli = Array.isArray(resRata.data) ? resRata.data : [];
        setRataSekolah(rataSekolahAsli.filter(r => masterMapel.some(m => m.nama_mapel === r.mapel)));
      } catch (err) {
        console.error("Gagal memuat laporan:", err);
      } finally {
        setLoading(false);
      }
    };
    if (nis) fetchData();
    else setLoading(false);
  }, [nis]);

  const hitungRerata = (arr, key) => {
    if (!arr || !arr.length) return 0;
    const total = arr.reduce((a, b) => a + (parseFloat(b[key]) || 0), 0);
    return total / arr.length;
  };

  const chartSiswa = {
    labels: dataMapel.map(d => d.mapel || 'Mapel'),
    datasets: daftarKategori.map((kat, index) => ({
      label: kat.nama_kategori,
      backgroundColor: warnaGrafik[index % warnaGrafik.length],
      data: dataMapel.map(d => parseFloat(d[kat.id_kategori]) || 0)
    }))
  };

  const chartPerbandingan = {
    labels: daftarKategori.map(k => k.nama_kategori),
    datasets: rataSekolah.map((item, index) => ({
      label: item.mapel || 'Mapel',
      backgroundColor: warnaGrafik[index % warnaGrafik.length],
      data: daftarKategori.map(kat => parseFloat(item[kat.id_kategori]) || 0)
    }))
  };

  if (loading) return <div className="text-center p-5">Memuat laporan akademik...</div>;

  return (
    <div style={{ background: colors.bgLight, minHeight: '100vh', paddingBottom: '30px' }}>
      
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 6mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .d-print-none { display: none !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
          
          /* Paksa card agar tinggi penuh halaman A4 */
          .card { 
            border: none !important; 
            box-shadow: none !important; 
            min-height: 280mm !important; /* Dekati tinggi A4 (297mm) */
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          
          .table-elit th, .table-elit td { padding: 4px; font-size: 11px; }
          
          /* Grafik dibuat lebih proporsional agar mengisi ruang */
          .chart-container { height: 350px !important; } 
          
          .footer-laporan { 
            margin-top: auto !important; /* Paksa footer ke paling bawah halaman */
            padding-top: 10px !important;
          }
        }
        
        .web-nav { background-color: ${colors.primary}; border-bottom: 4px solid ${colors.secondary}; }
        .table-web thead th { background-color: ${colors.primary}; color: white; text-transform: uppercase; font-size: 0.8rem; }
        .info-card-web { border-left: 5px solid ${colors.secondary}; background-color: #fff; }
      `}</style>

      <nav className="navbar web-nav mb-4 py-3 d-print-none">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-3">
            <img src="logosekolah.png" alt="logo" style={{ width: '30px' }} />
            PORTAL AKADEMIK
          </span>
          <div className="ms-auto d-flex gap-2">
            <button onClick={() => window.print()} className="btn btn-success btn-sm fw-bold px-3">Cetak</button>
            <button onClick={() => navigate('/beranda')} className="btn btn-light btn-sm fw-bold text-primary px-3">kembali</button>
          </div>
        </div>
      </nav>

      <div className="container px-3" style={{ maxWidth: '900px' }}>
        <div className="card bg-white shadow-lg p-4 p-md-5" style={{ borderRadius: '15px' }}>
          
          <div className="content-wrapper">
            <div className="text-center border-bottom pb-3 mb-4">
                <img src="logosekolah.png" style={{ width: '60px' }} alt="logo" className="mb-2" />
                <h5 className="fw-bold mb-0">SMP NEGERI 1 GAMPING</h5>
                <small className="text-muted text-uppercase">Yogyakarta</small>
                <h6 className="fw-bold text-uppercase mt-3 mb-0" style={{ color: colors.primary }}>{judulLaporan}</h6>
            </div>

            <div className="mb-4 p-3 info-card-web rounded shadow-sm d-flex flex-wrap gap-4 small">
                <div><span className="text-muted fw-bold">NAMA:</span> <span className="fw-bold text-dark">{profil.nama || '-'}</span></div>
                <div><span className="text-muted fw-bold">NIS:</span> <span className="fw-bold text-dark">{profil.nis || '-'}</span></div>
                <div><span className="text-muted fw-bold">KELAS:</span> <span className="fw-bold text-dark">{profil.rombel || '-'}</span></div>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-web text-center align-middle small mb-4">
                <thead>
                    <tr>
                    <th rowSpan="2" style={{ width: '40px' }}>No</th>
                    <th rowSpan="2" className="text-start">Mata Pelajaran</th>
                    <th colSpan={daftarKategori.length || 1}>Nilai Evaluasi</th>
                    </tr>
                    <tr>
                    {daftarKategori.length > 0 ? (
                        daftarKategori.map(kat => (
                        <th key={kat.id_kategori}>{kat.nama_kategori}</th>
                        ))
                    ) : (<th>-</th>)}
                    </tr>
                </thead>
                <tbody>
                    {dataMapel.map((item, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className="text-start fw-bold">{item.mapel}</td>
                        {daftarKategori.map(kat => (
                        <td key={kat.id_kategori} className="fw-bold">{item[kat.id_kategori] ?? '-'}</td>
                        ))}
                    </tr>
                    ))}
                    <tr className="fw-bold" style={{ backgroundColor: '#f8f9fa' }}>
                    <td colSpan="2" className="text-end">RATA-RATA PRIBADI</td>
                    {daftarKategori.map(kat => (
                        <td key={kat.id_kategori} style={{ color: colors.secondary }}>
                        {hitungRerata(dataMapel, kat.id_kategori).toFixed(1)}
                        </td>
                    ))}
                    </tr>
                </tbody>
                </table>
            </div>

            <h6 className="fw-bold mb-3" style={{ fontSize: '12px' }}>Visualisasi Capaian Akademik</h6>
            <div className="row g-3 mb-4">
                <div className="col-6">
                <div className="chart-container" style={{ height: '350px', position: 'relative' }}>
                    <Bar data={chartSiswa} options={{ maintainAspectRatio: false }} />
                </div>
                </div>
                <div className="col-6">
                <div className="chart-container" style={{ height: '350px', position: 'relative' }}>
                    <Bar data={chartPerbandingan} options={{ maintainAspectRatio: false }} />
                </div>
                </div>
            </div>
          </div>

          <div className="footer-laporan border-top pt-3 small d-flex justify-content-between text-muted">
            <span className="fw-bold">Portal Akademik SMPN 1 Gamping</span>
            <span>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataNilai;