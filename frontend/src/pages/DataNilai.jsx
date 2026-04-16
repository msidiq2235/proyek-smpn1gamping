import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  const nis = localStorage.getItem('nis');
  const warnaGrafik = ['#dc3545', '#0d6efd', '#212529', '#ffc107', '#198754', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Penting: Reset data ke array kosong sebelum fetch agar tidak ada data sisa
        setDataMapel([]);
        
        const [resSiswa, resNilai, resRata, resKategori, resJudul] = await Promise.all([
          axios.get(`${API_BASE_URL}/get_profil.php?nis=${nis}`),
          axios.get(`${API_BASE_URL}/get_nilai.php?nis=${nis}`),
          axios.get(`${API_BASE_URL}/get_rata_sekolah.php`),
          axios.get(`${API_BASE_URL}/get_kategori.php`),
          axios.get(`${API_BASE_URL}/get_judul.php`)
        ]);

        if (resSiswa.data?.profil) setProfil(resSiswa.data.profil);
        
        // Pastikan hasil adalah Array untuk menghindari error .map()
        setDataMapel(Array.isArray(resNilai.data) ? resNilai.data : []);
        setRataSekolah(Array.isArray(resRata.data) ? resRata.data : []);
        setDaftarKategori(Array.isArray(resKategori.data) ? resKategori.data : []);
        
        if (resJudul.data?.judul) setJudulLaporan(resJudul.data.judul);

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

  // Guarding Chart: Jika data kosong, berikan array kosong agar tidak crash
  const chartSiswa = {
    labels: dataMapel.length > 0 ? dataMapel.map(d => d.mapel || 'Mapel') : [],
    datasets: daftarKategori.map((kat, index) => ({
      label: kat.nama_kategori,
      backgroundColor: warnaGrafik[index % warnaGrafik.length],
      data: dataMapel.map(d => parseFloat(d[kat.id_kategori]) || 0)
    }))
  };

  const chartPerbandingan = {
    labels: daftarKategori.length > 0 ? daftarKategori.map(k => k.nama_kategori) : [],
    datasets: rataSekolah.length > 0 ? rataSekolah.map((item, index) => ({
      label: item.mapel || 'Mapel',
      backgroundColor: warnaGrafik[index % warnaGrafik.length],
      data: daftarKategori.map(kat => parseFloat(item[kat.id_kategori]) || 0)
    })) : []
  };

  if (loading) {
    return <div className="text-center p-5 fw-bold">Memuat laporan akademik...</div>;
  }

  return (
    <div style={{ background: '#f4f7f6', minHeight: '100vh', paddingBottom: '30px' }}>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 6mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .d-print-none { display: none !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
          .card { border: none !important; box-shadow: none !important; }
          table { width: 100%; font-size: 11px; border-collapse: collapse; page-break-inside: avoid; }
          th, td { padding: 4px; white-space: nowrap; }
          .chart-container { height: 260px !important; }
        }
      `}</style>

      <nav className="navbar bg-primary mb-4 py-3 d-print-none">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-2">
            {/* Hapus garis miring di depan agar terbaca di subfolder dist XAMPP */}
            <img src="logo_smpn1gmp.png" alt="logo" style={{ width: '32px' }} />
            Portal Akademik
          </span>
          <div className="ms-auto d-flex gap-2">
            <button onClick={() => window.print()} className="btn btn-success btn-sm fw-bold">🖨️ Cetak</button>
            <Link to="/beranda" className="btn btn-light btn-sm fw-bold text-primary">⬅ Beranda</Link>
          </div>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="card bg-white shadow-sm p-4">
          
          <div className="text-center border-bottom pb-3 mb-3">
            <img src="logo_smpn1gmp.png" style={{ width: '60px' }} alt="logo" />
            <h5 className="fw-bold mt-2 mb-0">SMP NEGERI 1 GAMPING</h5>
            <small className="text-muted">YOGYAKARTA</small>
            <hr className="mt-2 mb-2" />
            <h6 className="fw-bold text-uppercase">{judulLaporan}</h6>
          </div>

          <div className="mb-3 small">
            <b>Nama :</b> {profil.nama || '-'} &nbsp;&nbsp; | &nbsp;&nbsp;
            <b>NIS :</b> {profil.nis || '-'} &nbsp;&nbsp; | &nbsp;&nbsp;
            <b>Kelas :</b> {profil.rombel || '-'}
          </div>

          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle small mb-4">
              <thead className="table-light">
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
                  ) : (
                    <th>Kategori Belum Ada</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {dataMapel.length > 0 ? (
                  dataMapel.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="text-start">{item.mapel}</td>
                      {daftarKategori.map(kat => (
                        <td key={kat.id_kategori}>{item[kat.id_kategori] ?? '-'}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={daftarKategori.length + 2} className="text-center p-3 text-muted">
                      Tidak ada data nilai yang aktif.
                    </td>
                  </tr>
                )}
                
                {dataMapel.length > 0 && daftarKategori.length > 0 && (
                  <tr className="fw-bold bg-primary bg-opacity-10">
                    <td colSpan="2" className="text-end">RATA-RATA PRIBADI</td>
                    {daftarKategori.map(kat => (
                      <td key={kat.id_kategori}>
                        {hitungRerata(dataMapel, kat.id_kategori).toFixed(1)}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h6 className="text-center fw-bold small">Visualisasi Nilai Pribadi</h6>
          <div style={{ height: '245px' }} className="mb-3 chart-container">
            {dataMapel.length > 0 ? (
              <Bar data={chartSiswa} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="text-center text-muted small">Grafik tidak tersedia</div>
            )}
          </div>

          <h6 className="text-center fw-bold small">Perbandingan Rata-rata Sekolah</h6>
          <div style={{ height: '245px' }} className="mb-3 chart-container">
            {rataSekolah.length > 0 ? (
              <Bar data={chartPerbandingan} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="text-center text-muted small">Grafik perbandingan tidak tersedia</div>
            )}
          </div>

          <div className="mt-3 border-top pt-2 small d-flex justify-content-between">
            <span>Portal Akademik SMPN 1 Gamping</span>
            <span>Dicetak: {new Date().toLocaleDateString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataNilai;