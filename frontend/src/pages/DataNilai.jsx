import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import 'chart.js/auto';

function DataNilai() {
  const [dataMapel, setDataMapel] = useState([]);
  const [daftarKategori, setDaftarKategori] = useState([]); 
  const [profil, setProfil] = useState({ nama: '', nis: '', rombel: '', asal_sekolah: '' });
  const [rataSekolah, setRataSekolah] = useState([]);
  const [judulLaporan, setJudulLaporan] = useState('Laporan Hasil Evaluasi'); // State untuk Judul
  const [loading, setLoading] = useState(true);

  const nis = localStorage.getItem('nis');
  
  // Array warna untuk grafik agar variatif
  const warnaGrafik = ['#dc3545', '#0d6efd', '#212529', '#ffc107', '#198754', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSiswa, resNilai, resRata, resKategori, resJudul] = await Promise.all([
          axios.get(`http://localhost:5000/api/siswa/${nis}`),
          axios.get(`http://localhost:5000/api/nilai/${nis}`),
          axios.get(`http://localhost:5000/api/rata_sekolah`),
          axios.get(`http://localhost:5000/api/kategori`),
          axios.get(`http://localhost:5000/api/judul`) // Fetch judul dinamis
        ]);

        if (resSiswa.data?.profil) setProfil(resSiswa.data.profil);
        if (Array.isArray(resNilai.data)) setDataMapel(resNilai.data);
        if (Array.isArray(resRata.data)) setRataSekolah(resRata.data);
        if (Array.isArray(resKategori.data)) setDaftarKategori(resKategori.data);
        if (resJudul.data?.judul) setJudulLaporan(resJudul.data.judul); // Set state judul

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (nis) fetchData();
  }, [nis]);

  const hitungRerata = (arr, key) => {
    if (!arr.length) return 0;
    const total = arr.reduce((a, b) => a + (parseFloat(b[key]) || 0), 0);
    return total / arr.length;
  };

  // GRAFIK SISWA (Dinamis berdasarkan kategori)
  const chartSiswa = {
    labels: dataMapel.map(d => d.mapel),
    datasets: daftarKategori.map((kat, index) => ({
      label: kat.nama_kategori,
      backgroundColor: warnaGrafik[index % warnaGrafik.length],
      data: dataMapel.map(d => d[kat.id_kategori] || 0)
    }))
  };

  // GRAFIK SEKOLAH (Dinamis berdasarkan kategori)
  const chartPerbandingan = {
    labels: daftarKategori.map(k => k.nama_kategori),
    datasets: rataSekolah.map((item, index) => ({
      label: item.mapel,
      backgroundColor: warnaGrafik[index % warnaGrafik.length],
      data: daftarKategori.map(kat => item[kat.id_kategori] || 0)
    }))
  };

  if (loading) {
    return <div className="text-center p-5 fw-bold">Memuat laporan...</div>;
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

      {/* NAVBAR */}
      <nav className="navbar bg-primary mb-4 py-3 d-print-none">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-2">
            <img src="/logo_smpn1gmp.png" alt="logo" style={{ width: '32px' }} />
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
          
          {/* HEADER SEKOLAH */}
          <div className="text-center border-bottom pb-3 mb-3">
            <img src="/logo_smpn1gmp.png" style={{ width: '60px' }} alt="logo" />
            <h5 className="fw-bold mt-2 mb-0">SMP NEGERI 1 GAMPING</h5>
            <small className="text-muted">YOGATAMA</small>
            <hr className="mt-2 mb-2" />
            
            {/* JUDUL LAPORAN DINAMIS */}
            <h6 className="fw-bold text-uppercase">{judulLaporan}</h6>
          </div>

          {/* DATA SISWA */}
          <div className="mb-3 small">
            <b>Nama :</b> {profil.nama} &nbsp;&nbsp; | &nbsp;&nbsp;
            <b>NIS :</b> {profil.nis} &nbsp;&nbsp; | &nbsp;&nbsp;
            <b>Kelas :</b> {profil.rombel}
          </div>

          {/* TABEL NILAI DINAMIS */}
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
                    <th>Belum ada kategori</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {dataMapel.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="text-start">{item.mapel}</td>
                    
                    {/* Render nilai dinamis berdasarkan kategori */}
                    {daftarKategori.map(kat => (
                      <td key={kat.id_kategori}>{item[kat.id_kategori] ?? '-'}</td>
                    ))}
                  </tr>
                ))}
                
                {/* Rata-rata dinamis */}
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

          {/* GRAFIK SISWA */}
          <h6 className="text-center fw-bold small">Visualisasi Nilai Pribadi</h6>
          <div style={{ height: '245px' }} className="mb-3">
            <Bar data={chartSiswa} options={{ maintainAspectRatio: false }} />
          </div>

          {/* GRAFIK SEKOLAH */}
          <h6 className="text-center fw-bold small">Perbandingan Rata-rata Sekolah</h6>
          <div style={{ height: '245px' }} className="mb-3">
            <Bar data={chartPerbandingan} options={{ maintainAspectRatio: false }} />
          </div>

          {/* FOOTER */}
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