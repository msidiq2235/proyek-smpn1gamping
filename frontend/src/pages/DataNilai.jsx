import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import 'chart.js/auto';

function DataNilai() {

  const [dataMapel, setDataMapel] = useState([]);
  const [profil, setProfil] = useState({
    nama: '',
    nis: '',
    rombel: '',
    asal_sekolah: ''
  });
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

        if (resSiswa.data?.profil) setProfil(resSiswa.data.profil);
        if (Array.isArray(resNilai.data)) setDataMapel(resNilai.data);
        if (Array.isArray(resRata.data)) setRataSekolah(resRata.data);

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

  const chartSiswa = {
    labels: dataMapel.map(d => d.mapel),
    datasets: [
      { label: 'Lat1', backgroundColor: '#dc3545', data: dataMapel.map(d => d.latihan1) },
      { label: 'Lat2', backgroundColor: '#0d6efd', data: dataMapel.map(d => d.latihan2) },
      { label: 'Lat3', backgroundColor: '#212529', data: dataMapel.map(d => d.latihan3) },
      { label: 'Lat4', backgroundColor: '#ffc107', data: dataMapel.map(d => d.latihan4) },
      { label: 'Lat5', backgroundColor: '#198754', data: dataMapel.map(d => d.latihan5) }
    ]
  };

  const chartPerbandingan = {
    labels: ['Lat1', 'Lat2', 'Lat3', 'Lat4', 'Lat5'],
    datasets: rataSekolah.map((item, index) => ({
      label: item.mapel,
      backgroundColor: [
        '#dc3545',
        '#0d6efd',
        '#212529',
        '#ffc107',
        '#198754',
        '#6f42c1',
        '#fd7e14'
      ][index % 7],
      data: [
        item.latihan1,
        item.latihan2,
        item.latihan3,
        item.latihan4,
        item.latihan5
      ]
    }))
  };

  if (loading) {
    return (
      <div className="text-center p-5 fw-bold">
        Memuat laporan...
      </div>
    );
  }

  return (

    <div style={{ background: '#f4f7f6', minHeight: '100vh', paddingBottom: '30px' }}>

      <style>{`
        @media print {

          @page {
            size: A4 portrait;
            margin: 6mm;
          }

          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .d-print-none {
            display: none !important;
          }

          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }

          .card {
            border: none !important;
            box-shadow: none !important;
          }

          table {
            width: 100%;
            font-size: 11px;
            border-collapse: collapse;
            page-break-inside: avoid;
          }

          th, td {
            padding: 4px;
            white-space: nowrap;
          }

          .chart-container {
            height: 260px !important;
          }

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

            <button
              onClick={() => window.print()}
              className="btn btn-success btn-sm fw-bold"
            >
              🖨️ Cetak
            </button>

            <Link
              to="/beranda"
              className="btn btn-light btn-sm fw-bold text-primary"
            >
              ⬅ Beranda
            </Link>

          </div>

        </div>

      </nav>

      <div className="container" style={{ maxWidth: '900px' }}>

        <div className="card bg-white shadow-sm p-4">

          {/* HEADER SEKOLAH */}

          <div className="text-center border-bottom pb-3 mb-3">

            <img src="/logo_smpn1gmp.png" style={{ width: '60px' }} alt="logo" />

            <h5 className="fw-bold mt-2 mb-0">
              SMP NEGERI 1 GAMPING
            </h5>

            <small className="text-muted">
              YOGATAMA
            </small>

            <hr className="mt-2 mb-2" />

            <h6 className="fw-bold text-uppercase">
              Laporan Hasil Evaluasi
            </h6>

          </div>

          {/* DATA SISWA */}

          <div className="mb-3 small">
            <b>Nama :</b> {profil.nama}
            &nbsp;&nbsp; | &nbsp;&nbsp;
            <b>NIS :</b> {profil.nis}
            &nbsp;&nbsp; | &nbsp;&nbsp;
            <b>Kelas :</b> {profil.rombel}
            &nbsp;&nbsp; | &nbsp;&nbsp;
            <b>Asal Sekolah :</b> {profil.asal_sekolah}
          </div>

          {/* TABEL */}

          <table className="table table-bordered text-center align-middle small mb-4">

            <thead className="table-light">

              <tr>
                <th rowSpan="2" style={{ width: '40px' }}>No</th>
                <th rowSpan="2" className="text-start">Mata Pelajaran</th>
                <th colSpan="5">Nilai Evaluasi Tahunan</th>
              </tr>

              <tr>
                <th>Lat1</th>
                <th>Lat2</th>
                <th>Lat3</th>
                <th>Lat4</th>
                <th>Lat5</th>
              </tr>

            </thead>

            <tbody>

              {dataMapel.map((item, index) => (

                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="text-start">{item.mapel}</td>
                  <td>{item.latihan1}</td>
                  <td>{item.latihan2}</td>
                  <td>{item.latihan3}</td>
                  <td>{item.latihan4}</td>
                  <td>{item.latihan5}</td>
                </tr>

              ))}

              <tr className="fw-bold bg-primary bg-opacity-10">

                <td colSpan="2" className="text-end">
                  RATA-RATA PRIBADI
                </td>

                <td>{hitungRerata(dataMapel, 'latihan1').toFixed(1)}</td>
                <td>{hitungRerata(dataMapel, 'latihan2').toFixed(1)}</td>
                <td>{hitungRerata(dataMapel, 'latihan3').toFixed(1)}</td>
                <td>{hitungRerata(dataMapel, 'latihan4').toFixed(1)}</td>
                <td>{hitungRerata(dataMapel, 'latihan5').toFixed(1)}</td>

              </tr>

            </tbody>

          </table>

          {/* GRAFIK SISWA */}

          <h6 className="text-center fw-bold small">
            Visualisasi Nilai Pribadi
          </h6>

          <div style={{ height: '245px' }} className="mb-3">
            <Bar
              data={chartSiswa}
              options={{ maintainAspectRatio: false }}
            />
          </div>

          {/* GRAFIK SEKOLAH */}

          <h6 className="text-center fw-bold small">
            Perbandingan Rata-rata Sekolah
          </h6>

          <div style={{ height: '245px' }} className="mb-3">
            <Bar
              data={chartPerbandingan}
              options={{ maintainAspectRatio: false }}
            />
          </div>

          {/* FOOTER */}

          <div className="mt-3 border-top pt-2 small d-flex justify-content-between">

            <span>
              Portal Akademik SMPN 1 Gamping
            </span>

            <span>
              Dicetak: {new Date().toLocaleDateString('id-ID')}
            </span>

          </div>

        </div>

      </div>

    </div>

  );

}

export default DataNilai;