import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const warnaGrafik = ['#023874', '#B8860B', '#198754', '#dc3545', '#0d6efd', '#6f42c1', '#fd7e14'];

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
    labels: dataMapel.map(d => d.mapel),
    datasets: daftarKategori.map((kat, index) => ({
      label: kat.nama_kategori,
      backgroundColor: warnaGrafik[index % warnaGrafik.length],
      data: dataMapel.map(d => parseFloat(d[kat.id_kategori]) || 0)
    }))
  };

  const chartPerbandingan = {
    labels: daftarKategori.map(k => k.nama_kategori),
    datasets: rataSekolah.map((item, index) => ({
      label: item.mapel,
      backgroundColor: warnaGrafik[index % warnaGrafik.length],
      data: daftarKategori.map(kat => parseFloat(item[kat.id_kategori]) || 0)
    }))
  };

  if (loading) return <div className="text-center p-5 fw-bold">Memuat Laporan Akademik...</div>;

  return (
    <div style={{ background: colors.bgLight, minHeight: '100vh', paddingBottom: '30px', fontFamily: "'Inter', sans-serif" }}>
      
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .d-print-none { display: none !important; }
          .report-card { border: 2px solid #eee !important; box-shadow: none !important; padding: 20px !important; width: 100% !important; }
          .table-elit th { background-color: ${colors.primary} !important; color: white !important; }
        }
        .web-nav { background-color: ${colors.primary}; border-bottom: 4px solid ${colors.secondary}; }
        .table-elit thead th { background-color: ${colors.primary}; color: white; font-size: 0.75rem; text-transform: uppercase; }
        .info-header { border-left: 5px solid ${colors.secondary}; background-color: #fff; padding: 15px; border-radius: 8px; }
      `}</style>

      <nav className="navbar web-nav mb-4 py-3 d-print-none">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-3">
            <img src="logosekolah.png" alt="logo" style={{ width: '30px' }} />
            HASIL BELAJAR SISWA
          </span>
          <div className="ms-auto d-flex gap-2">
            <button onClick={() => window.print()} className="btn btn-success btn-sm fw-bold px-4 rounded-pill shadow-sm">🖨️ CETAK</button>
            <button onClick={() => navigate('/beranda')} className="btn btn-light btn-sm fw-bold text-primary px-4 rounded-pill shadow-sm">KEMBALI</button>
          </div>
        </div>
      </nav>

      <div className="container px-3" style={{ maxWidth: '1000px' }}>
        <div className="card report-card bg-white shadow-lg p-4 p-md-5 border-0" style={{ borderRadius: '20px' }}>
          
          {/* Header Kop Surat */}
          <div className="text-center border-bottom border-2 pb-3 mb-4">
              <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                <img src="logosekolah.png" style={{ width: '70px' }} alt="logo" />
                <div className="text-start">
                    <h4 className="fw-bold mb-0">SMP NEGERI 1 GAMPING</h4>
                    <p className="mb-0 small text-muted">Sleman, Daerah Istimewa Yogyakarta</p>
                </div>
              </div>
              <h5 className="fw-bold text-uppercase mt-4 mb-0" style={{ color: colors.primary, letterSpacing: '1px' }}>{judulLaporan}</h5>
          </div>

          {/* Identitas Siswa */}
          <div className="info-header shadow-sm mb-4">
              <div className="row g-3 small">
                  <div className="col-md-4">
                      <span className="text-muted fw-bold d-block">NAMA LENGKAP</span>
                      <span className="fw-bold text-dark h6 mb-0">{profil.nama || '-'}</span>
                  </div>
                  <div className="col-md-4 border-start-md">
                      <span className="text-muted fw-bold d-block">NIS / USERNAME</span>
                      <span className="fw-bold text-dark h6 mb-0">{profil.nis || '-'}</span>
                  </div>
                  <div className="col-md-4 border-start-md">
                      <span className="text-muted fw-bold d-block">ROMBEL / KELAS</span>
                      <span className="fw-bold text-dark h6 mb-0">{profil.rombel || '-'}</span>
                  </div>
              </div>
          </div>

          {/* Tabel Nilai */}
          <div className="table-responsive mb-5">
              <table className="table table-bordered table-elit text-center align-middle small mb-0">
                <thead>
                    <tr>
                      <th rowSpan="2" style={{ width: '50px' }}>No</th>
                      <th rowSpan="2" className="text-start">Mata Pelajaran</th>
                      <th colSpan={daftarKategori.length || 1}>Perolehan Nilai</th>
                    </tr>
                    <tr>
                      {daftarKategori.map(kat => (
                        <th key={kat.id_kategori}>{kat.nama_kategori}</th>
                      ))}
                    </tr>
                </thead>
                <tbody>
                    {dataMapel.map((item, index) => (
                    <tr key={index}>
                        <td className="text-muted">{index + 1}</td>
                        <td className="text-start fw-bold">{item.mapel}</td>
                        {daftarKategori.map(kat => (
                        <td key={kat.id_kategori} className="fw-bold">
                            {item[kat.id_kategori] ?? <span className="text-light-emphasis opacity-25">-</span>}
                        </td>
                        ))}
                    </tr>
                    ))}
                    <tr className="fw-bold" style={{ backgroundColor: '#fcf8e3' }}>
                        <td colSpan="2" className="text-end py-3">RATA-RATA CAPAIAN</td>
                        {daftarKategori.map(kat => (
                            <td key={kat.id_kategori} className="h6 mb-0" style={{ color: colors.primary }}>
                            {hitungRerata(dataMapel, kat.id_kategori).toFixed(1)}
                            </td>
                        ))}
                    </tr>
                </tbody>
              </table>
          </div>

          {/* Statistik Grafik */}
          <div className="mb-2">
            <h6 className="fw-bold border-start border-4 border-warning ps-2 mb-4">STATISTIK PERKEMBANGAN BELAJAR</h6>
            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="p-3 border rounded-4 bg-light shadow-sm" style={{ height: '350px' }}>
                        <p className="small fw-bold text-center text-muted">Grafik Per Mapel</p>
                        <Bar data={chartSiswa} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="p-3 border rounded-4 bg-light shadow-sm" style={{ height: '350px' }}>
                        <p className="small fw-bold text-center text-muted">Perbandingan Rata-Rata</p>
                        <Bar data={chartPerbandingan} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
            </div>
          </div>

          {/* Footer Laporan */}
          <div className="mt-auto border-top pt-4">
              <div className="row small">
                  <div className="col-6">
                      <p className="text-muted mb-0">Portal Akademik Terintegrasi</p>
                      <p className="fw-bold text-dark">SMP NEGERI 1 GAMPING</p>
                  </div>
                  <div className="col-6 text-end">
                      <p className="text-muted mb-0">Dicetak Pada:</p>
                      <p className="fw-bold text-dark">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataNilai;