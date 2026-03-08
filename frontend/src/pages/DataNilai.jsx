import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import 'chart.js/auto';

function DataNilai() {
  const [dataMapel, setDataMapel] = useState([]);
  const [profil, setProfil] = useState({ nama: '', nis: '', rombel: '', asal_sekolah: '' });
  const [rataSekolah, setRataSekolah] = useState([]);
  const [loading, setLoading] = useState(true);

  const nis = localStorage.getItem('nis');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSiswa, resNilai, resRata] = await Promise.all([
          axios.get(`http://localhost:5000/api/siswa/${nis}`),
          axios.get(`http://localhost:5000/api/nilai/${nis}`),
          axios.get(`http://localhost:5000/api/rata_sekolah`)
        ]);
        if (resSiswa.data && resSiswa.data.profil) setProfil(resSiswa.data.profil);
        if (Array.isArray(resNilai.data)) setDataMapel(resNilai.data);
        if (Array.isArray(resRata.data)) setRataSekolah(resRata.data);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (nis) fetchData();
  }, [nis]);

  const hitungRerata = (arr, key) => {
    if (!arr || arr.length === 0) return 0;
    const total = arr.reduce((acc, curr) => acc + (parseFloat(curr[key]) || 0), 0);
    return (total / arr.length);
  };

  const chartSiswa = {
    labels: dataMapel.map(d => d.mapel),
    datasets: [
      { label: 'latihan1', backgroundColor: '#dc3545', data: dataMapel.map(d => parseFloat(d.latihan1 || 0)) },
      { label: 'latihan2', backgroundColor: '#0d6efd', data: dataMapel.map(d => parseFloat(d.latihan2 || 0)) },
      { label: 'latihan3', backgroundColor: '#212529', data: dataMapel.map(d => parseFloat(d.latihan3 || 0)) },
      { label: 'latihan4', backgroundColor: '#ffc107', data: dataMapel.map(d => parseFloat(d.latihan4 || 0)) },
      { label: 'latihan5', backgroundColor: '#198754', data: dataMapel.map(d => parseFloat(d.latihan5 || 0)) }
    ]
  };

  const chartPerbandingan = {
    labels: ['latihan1', 'latihan2', 'latihan3', 'latihan4', 'latihan5'],
    datasets: rataSekolah.map((item, index) => ({
      label: item.mapel,
      backgroundColor: ['#dc3545', '#0d6efd', '#212529', '#ffc107', '#198754', '#6f42c1', '#fd7e14'][index % 7],
      data: [parseFloat(item.latihan1 || 0), parseFloat(item.latihan2 || 0), parseFloat(item.latihan3 || 0), parseFloat(item.latihan4 || 0), parseFloat(item.latihan5 || 0)]
    }))
  };

  if (loading) return <div className="text-center p-5 fw-bold">Memuat Laporan Nilai...</div>;

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '30px' }}>
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body { background-color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; }
            .d-print-none { display: none !important; }
            .container { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
            .card { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
            
            /* Penyesuaian Tabel agar simetris */
            table { font-size: 11px !important; width: 100% !important; border-collapse: collapse !important; }
            th, td { border: 1px solid #dee2e6 !important; padding: 5px !important; }

            /* Grafik Vertikal Simetris */
            .row { display: block !important; width: 100% !important; margin: 0 !important; }
            .col-md-6 { 
              width: 100% !important; 
              max-width: 100% !important; 
              padding: 0 !important; 
              margin-bottom: 20px !important; 
              display: block !important;
            }
            
            .chart-box { border: 1px solid #dee2e6 !important; padding: 10px !important; border-radius: 10px !important; }
            .chart-container { height: 230px !important; width: 100% !important; }
            
            body { zoom: 98%; }
          }
        `}
      </style>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-primary shadow-sm py-3 mb-4 d-print-none">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white">🎓 Portal Akademik</span>
          <div className="ms-auto d-flex gap-2">
            <button onClick={() => window.print()} className="btn btn-success btn-sm shadow-sm fw-bold px-3 border border-light">🖨️ Cetak Laporan</button>
            <Link to="/beranda" className="btn btn-light text-primary btn-sm shadow-sm fw-bold px-3">⬅ Beranda</Link>
          </div>
        </div>
      </nav>

      <div className="container px-4" style={{ maxWidth: '900px' }}>
        <div className="card border-0 shadow-sm p-4 p-md-5 bg-white" style={{ borderRadius: '20px' }}>
          
          {/* Header Profil Simetris */}
          <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
            <div>
              <h4 className="fw-bold text-dark mb-1 text-uppercase">{profil.nama || 'Siswa'}</h4>
              <p className="text-muted small mb-0">NIS: {profil.nis} | Kelas: {profil.rombel} | {profil.asal_sekolah}</p>
            </div>
            <div className="text-end">
              <h6 className="fw-bold text-primary mb-0">LAPORAN HASIL EVALUASI</h6>
            </div>
          </div>

          {/* Tabel Nilai */}
          <div className="mb-5">
            <table className="table table-bordered text-center align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase fw-bold">
                  <th rowSpan="2" style={{width: '40px'}}>No</th>
                  <th rowSpan="2" className="text-start">Mata Pelajaran</th>
                  <th colSpan="5">Nilai Evaluasi Tahunan</th>
                </tr>
                <tr className="small fw-bold">
                  <th style={{width: '60px'}}>latihan1</th>
                  <th style={{width: '60px'}}>latihan2</th>
                  <th style={{width: '60px'}}>latihan3</th>
                  <th style={{width: '60px'}}>latihan4</th>
                  <th style={{width: '60px'}}>latihan5</th>
                </tr>
              </thead>
              <tbody>
                {dataMapel.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="text-start fw-medium">{item.mapel}</td>
                    <td>{parseFloat(item.latihan1 || 0).toFixed(1)}</td>
                    <td>{parseFloat(item.latihan2 || 0).toFixed(1)}</td>
                    <td>{parseFloat(item.latihan3 || 0).toFixed(1)}</td>
                    <td>{parseFloat(item.latihan4 || 0).toFixed(1)}</td>
                    <td>{parseFloat(item.latihan5 || 0).toFixed(1)}</td>
                  </tr>
                ))}
                <tr className="fw-bold bg-primary bg-opacity-10 text-primary">
                  <td colSpan="2" className="text-end">RATA-RATA PRIBADI</td>
                  <td>{hitungRerata(dataMapel, 'latihan1').toFixed(1)}</td>
                  <td>{hitungRerata(dataMapel, 'latihan2').toFixed(1)}</td>
                  <td>{hitungRerata(dataMapel, 'latihan3').toFixed(1)}</td>
                  <td>{hitungRerata(dataMapel, 'latihan4').toFixed(1)}</td>
                  <td>{hitungRerata(dataMapel, 'latihan5').toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grafik Atas-Bawah (Lebar Sejajar Tabel) */}
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="chart-box border rounded-4 p-3 shadow-sm bg-white">
                <h6 className="text-center mb-3 text-muted fw-bold small text-uppercase">Visualisasi Nilai Pribadi</h6>
                <div className="chart-container" style={{ height: '240px' }}>
                  <Bar data={chartSiswa} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: {size: 10} } } } }} />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="chart-box border rounded-4 p-3 shadow-sm bg-white">
                <h6 className="text-center mb-3 text-muted fw-bold small text-uppercase">Perbandingan Rata-rata Sekolah</h6>
                <div className="chart-container" style={{ height: '240px' }}>
                  <Bar key={`rata-${rataSekolah.length}`} data={chartPerbandingan} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: {size: 10}, usePointStyle: true } } } }} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Laporan */}
          <div className="mt-5 pt-3 border-top d-flex justify-content-between align-items-center">
            <div className="small text-muted">
              Portal Akademik SMPN 1 Gamping
            </div>
            <div className="small text-muted text-end">
              Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DataNilai;