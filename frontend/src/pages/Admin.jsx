import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from "xlsx";
import { API_BASE_URL } from '../apiConfig';

function Admin() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const [pesan, setPesan] = useState({ tipe: '', isi: '' });
  const [namaTerdeteksi, setNamaTerdeteksi] = useState('');
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // State Dinamis untuk Mapel
  const [daftarMapel, setDaftarMapel] = useState([]);
  const [inputNilaiMapel, setInputNilaiMapel] = useState({});
  const [mapelBaru, setMapelBaru] = useState('');

  const [siswa, setSiswa] = useState({
    nis: '', nama: '', password: '', rombel: '', asal_sekolah: ''
  });

  // State Kategori
  const [kategori, setKategori] = useState(''); 
  const [daftarKategori, setDaftarKategori] = useState([]);
  const [modeEditKategori, setModeEditKategori] = useState(false);
  const [kategoriEditData, setKategoriEditData] = useState([]);
  const [kategoriBaru, setKategoriBaru] = useState(''); 

  // State Judul Laporan
  const [judulLaporan, setJudulLaporan] = useState('Laporan Hasil Evaluasi');

  const [nisKolektif, setNisKolektif] = useState('');

  useEffect(() => {
    if (role !== 'admin' && localStorage.getItem('nis') !== 'admin') navigate('/beranda');
    muatDaftarSiswa();
    muatKategori();
    muatJudul();
    muatMapel();
  }, [role, navigate]);

  // ==========================================
  // FUNGSI MEMUAT DATA
  // ==========================================
  const muatMapel = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_mapel.php`);
      setDaftarMapel(res.data);
    } catch (err) { console.error("Gagal muat mapel:", err); }
  };

  const muatDaftarSiswa = async () => {
    try {
      const [resSiswa, resNilai] = await Promise.all([
        axios.get(`${API_BASE_URL}/get_all_siswa.php`),
        axios.get(`${API_BASE_URL}/get_all_nilai.php`)
      ]);
      const dataSiswa = Array.isArray(resSiswa.data) ? resSiswa.data : [];
      const dataNilai = Array.isArray(resNilai.data) ? resNilai.data : [];
      const dataGabungan = dataSiswa.map(siswa => ({
        ...siswa,
        daftar_nilai: dataNilai.filter(n => n.nis === siswa.nis)
      }));
      setDaftarSiswa(dataGabungan);
    } catch (err) { console.error("Gagal sinkronisasi data:", err); }
  };

  const muatKategori = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_kategori.php`);
      setDaftarKategori(res.data);
      setKategoriEditData(res.data); 
      if(res.data.length > 0 && !kategori) setKategori(res.data[0].id_kategori);
    } catch (err) { console.error("Gagal memuat kategori:", err); }
  };

  const muatJudul = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_judul.php`);
      if (res.data?.judul) setJudulLaporan(res.data.judul);
    } catch (err) { console.error("Gagal memuat judul:", err); }
  };

  // ==========================================
  // FUNGSI PENGATURAN (KATEGORI, MAPEL, JUDUL)
  // ==========================================
  const simpanKategori = async () => {
    try {
      for (const item of kategoriEditData) {
        await axios.post(`${API_BASE_URL}/update_kategori.php`, {
          id_kategori: item.id_kategori,
          nama_kategori: item.nama_kategori
        });
      }
      setPesan({ tipe: 'success', isi: 'Nama kategori berhasil diperbarui!' });
      muatKategori(); 
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal memperbarui kategori.' }); }
  };

  const tambahKategori = async () => {
    if (!kategoriBaru) return;
    try {
      await axios.post(`${API_BASE_URL}/tambah_kategori.php`, { nama_kategori: kategoriBaru });
      setKategoriBaru('');
      muatKategori();
      setPesan({ tipe: 'success', isi: `Kategori "${kategoriBaru}" berhasil ditambahkan!` });
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal menambah kategori.' }); }
  };

  const hapusKategori = async (id, nama) => {
    if (window.confirm(`⚠️ Yakin ingin menghapus kategori "${nama}"? SEMUA NILAI AKAN HILANG!`)) {
      try {
        await axios.post(`${API_BASE_URL}/hapus_kategori.php`, { id_kategori: id });
        if (kategori === id) setKategori(''); 
        muatKategori();
        muatDaftarSiswa(); 
        setPesan({ tipe: 'warning', isi: `Kategori "${nama}" telah dihapus.` });
      } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal menghapus kategori.' }); }
    }
  };

  const tambahMapel = async () => {
    if (!mapelBaru) return;
    try {
      await axios.post(`${API_BASE_URL}/tambah_mapel.php`, { nama_mapel: mapelBaru });
      setMapelBaru('');
      muatMapel();
      setPesan({ tipe: 'success', isi: `Mata Pelajaran "${mapelBaru}" berhasil ditambahkan!` });
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal menambah mata pelajaran.' }); }
  };

  const hapusMapel = async (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus mata pelajaran "${nama}"?`)) {
      try {
        await axios.post(`${API_BASE_URL}/hapus_mapel.php`, { id_mapel: id });
        muatMapel();
        muatDaftarSiswa();
        setPesan({ tipe: 'warning', isi: `Mata Pelajaran "${nama}" telah dihapus.` });
      } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal menghapus mata pelajaran.' }); }
    }
  };

  const simpanJudul = async () => {
    try {
      await axios.post(`${API_BASE_URL}/update_judul.php`, { judul: judulLaporan });
      setPesan({ tipe: 'success', isi: 'Judul laporan berhasil diperbarui!' });
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal memperbarui judul.' }); }
  };

  // ==========================================
  // FUNGSI SISWA & NILAI
  // ==========================================
  const handleCariKolektif = async (nisInput, kategoriInput) => {
    const cleanNIS = nisInput.trim();
    if (cleanNIS.length > 2) {
      try {
        const resSiswa = await axios.get(`${API_BASE_URL}/get_profil.php?nis=${cleanNIS}`);
        if (resSiswa.data && resSiswa.data.profil) {
          setNamaTerdeteksi(resSiswa.data.profil.nama);
          const resNilai = await axios.get(`${API_BASE_URL}/get_nilai.php?nis=${cleanNIS}`).catch(() => ({ data: [] }));
          const dataNilai = Array.isArray(resNilai.data) ? resNilai.data : [];
          
          const tempNilai = {};
          daftarMapel.forEach(m => {
             const n = dataNilai.find(dn => dn.mapel === m.nama_mapel);
             tempNilai[m.nama_mapel] = n ? n[kategoriInput] : '';
          });
          setInputNilaiMapel(tempNilai);
        } else { setNamaTerdeteksi(''); setInputNilaiMapel({}); }
      } catch (err) { setNamaTerdeteksi(''); setInputNilaiMapel({}); }
    }
  };

  const simpanSiswa = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.post(`${API_BASE_URL}/update_siswa.php`, siswa);
        setPesan({ tipe: 'success', isi: 'Data Siswa Berhasil Diperbarui!' });
      } else {
        await axios.post(`${API_BASE_URL}/tambah_siswa.php`, siswa);
        setPesan({ tipe: 'success', isi: 'Data Siswa Berhasil Disimpan!' });
      }
      setSiswa({ nis: '', nama: '', password: '', rombel: '', asal_sekolah: '' });
      setIsEditMode(false);
      muatDaftarSiswa();
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal memproses data siswa.' }); }
  };

  const editSiswa = (data) => {
    setSiswa({
      nis: data.nis, nama: data.nama, password: data.password, 
      rombel: data.rombel, asal_sekolah: data.asal_sekolah
    });
    setIsEditMode(true);
    setNisKolektif(data.nis);

    const tempNilai = {};
    daftarMapel.forEach(m => {
      const n = data.daftar_nilai.find(dn => dn.mapel === m.nama_mapel);
      tempNilai[m.nama_mapel] = n ? n[kategori] : '';
    });
    setInputNilaiMapel(tempNilai);
    setNamaTerdeteksi(data.nama);
    window.scrollTo(0, 0);
  };

  const hapusSiswa = async (nis) => {
    if (window.confirm("Hapus siswa ini?")) {
      try {
        await axios.get(`${API_BASE_URL}/hapus_siswa.php?nis=${nis}`);
        muatDaftarSiswa();
        setPesan({ tipe: 'warning', isi: 'Siswa berhasil dihapus.' });
      } catch (err) { console.error(err); }
    }
  };

  const hapusSemuaSiswa = async () => {
    const konfirmasi = window.prompt('Ketik "HAPUS" untuk menghapus semua data:');
    if (konfirmasi === 'HAPUS') {
      try {
        await axios.get(`${API_BASE_URL}/hapus_semua_siswa.php`);
        muatDaftarSiswa();
        setPesan({ tipe: 'danger', isi: 'Semua data telah dikosongkan.' });
      } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal menghapus data.' }); }
    }
  };

  const simpanNilaiKolektif = async (e) => {
    e.preventDefault();
    if (!kategori) return setPesan({ tipe: 'danger', isi: 'Pilih kategori!' });
    try {
      for (const m of daftarMapel) {
        const data = { nis: nisKolektif, mapel: m.nama_mapel, [kategori]: inputNilaiMapel[m.nama_mapel] || 0 };
        await axios.post(`${API_BASE_URL}/simpan_nilai_satuan.php`, data);
      }
      setPesan({ tipe: 'success', isi: 'Nilai Berhasil Disimpan!' });
      muatDaftarSiswa();
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal menyimpan nilai.' }); }
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file || !kategori) return alert("Pilih kategori terlebih dahulu!");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      try {
        setPesan({ tipe: 'info', isi: '🚀 Sedang memproses...' });
        for (const row of jsonData) {
          try {
            await axios.post(`${API_BASE_URL}/tambah_siswa.php`, {
              nis: row.nis, nama: row.nama || `Siswa ${row.nis}`,
              password: row.nis, rombel: row.rombel || '-', asal_sekolah: row.asal_sekolah || '-'
            });
          } catch (err) { }
          for (const m of daftarMapel) {
            const payload = { nis: row.nis, mapel: m.nama_mapel, [kategori]: row[m.nama_mapel] || 0 };
            await axios.post(`${API_BASE_URL}/simpan_nilai_satuan.php`, payload);
          }
        }
        setPesan({ tipe: 'success', isi: `🎉 Import Selesai.` });
        muatDaftarSiswa(); 
      } catch (err) { setPesan({ tipe: 'danger', isi: '❌ Import gagal!' }); }
    };
    reader.readAsArrayBuffer(file);
  };

  const namaKategoriAktif = daftarKategori.find(k => k.id_kategori === kategori)?.nama_kategori || 'Pilih Kategori';

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '50px' }}>
      <nav className="navbar navbar-expand-lg bg-primary shadow-sm py-3 mb-5">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-2">
            <img src="/logo_smpn1gmp.png" alt="Logo" style={{ width: '32px' }} /> Panel Admin
          </span>
          <div className="ms-auto"><Link to="/beranda" className="btn btn-light text-primary btn-sm fw-bold">⬅ Beranda</Link></div>
        </div>
      </nav>

      <div className="container px-4">
        {pesan.isi && <div className={`alert alert-${pesan.tipe} alert-dismissible fade show mb-4`}>{pesan.isi}</div>}

        <div className="row g-4 mb-5">
          {/* CRUD SISWA */}
          <div className="col-md-4">
            <div className="card p-4 border-0 shadow-sm" style={{borderRadius: '15px'}}>
              <h5 className="fw-bold mb-4">{isEditMode ? '✏️ Edit Siswa' : '➕ Tambah Siswa'}</h5>
              <form onSubmit={simpanSiswa}>
                <input type="text" placeholder="NIS" className="form-control mb-2" value={siswa.nis} onChange={(e) => setSiswa({...siswa, nis:e.target.value})} required disabled={isEditMode} />
                <input type="text" placeholder="Nama" className="form-control mb-2" value={siswa.nama} onChange={(e) => setSiswa({...siswa, nama:e.target.value})} required />
                <input type="text" placeholder="Password" className="form-control mb-2" value={siswa.password} onChange={(e) => setSiswa({...siswa, password:e.target.value})} required />
                <input type="text" placeholder="Rombel" className="form-control mb-2" value={siswa.rombel} onChange={(e) => setSiswa({...siswa, rombel:e.target.value})} required />
                <input type="text" placeholder="Asal Sekolah" className="form-control mb-3" value={siswa.asal_sekolah} onChange={(e) => setSiswa({...siswa, asal_sekolah:e.target.value})} required />
                <button className="btn btn-primary w-100 fw-bold">{isEditMode ? 'Update Data' : 'Simpan Siswa'}</button>
                {isEditMode && <button type="button" className="btn btn-link w-100 mt-2 text-muted" onClick={() => {setIsEditMode(false); setSiswa({nis:'', nama:'', password:'', rombel:'', asal_sekolah:''})}}>Batal</button>}
              </form>
            </div>
          </div>

          {/* INPUT NILAI DINAMIS */}
          <div className="col-md-8">
            <div className="card p-4 border-0 shadow-sm" style={{borderRadius: '15px'}}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">📊 Input Nilai </h5>
                <label htmlFor="importExcel" className="btn btn-success btn-sm fw-bold">📂 Import Excel</label>
                <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="d-none" id="importExcel" />
              </div>

              <form onSubmit={simpanNilaiKolektif}>
                <div className="row g-2 mb-3">
                  <div className="col-7">
                    <input type="text" className="form-control" placeholder="Cari NIS..." value={nisKolektif} 
                      onChange={(e)=>{setNisKolektif(e.target.value); handleCariKolektif(e.target.value, kategori);}}
                    />
                  </div>
                  <div className="col-5 d-flex gap-2">
                    <select className="form-select fw-bold text-primary" value={kategori} onChange={(e) => {setKategori(e.target.value); handleCariKolektif(nisKolektif, e.target.value);}}>
                      <option value="" disabled>-- Pilih --</option>
                      {daftarKategori.map((kat) => (<option key={kat.id_kategori} value={kat.id_kategori}>{kat.nama_kategori}</option>))}
                    </select>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setModeEditKategori(!modeEditKategori)}>⚙️</button>
                  </div>
                </div>

                {namaTerdeteksi && <div className="alert alert-info py-2 small fw-bold mb-3">Siswa: {namaTerdeteksi}</div>}

                <div className="row g-3 mb-4">
                  {daftarMapel.map((m) => (
                    <div className="col-6 col-md-4" key={m.id_mapel}>
                      <label className="small fw-bold">{m.nama_mapel}</label>
                      <input type="number" className="form-control" value={inputNilaiMapel[m.nama_mapel] || ''} 
                        onChange={(e)=> setInputNilaiMapel({...inputNilaiMapel, [m.nama_mapel]: e.target.value})} 
                      />
                    </div>
                  ))}
                </div>
                <button className="btn btn-success w-100 fw-bold" disabled={!namaTerdeteksi || !kategori}>💾 Simpan Nilai {namaKategoriAktif}</button>
              </form>

              {/* PANEL PENGATURAN */}
              {modeEditKategori && (
                <div className="mt-4 p-3 bg-light rounded border border-secondary shadow-sm">
                  <h6 className="fw-bold mb-3 text-primary">⚙️ PENGATURAN SISTEM</h6>
                  
                  <p className="small fw-bold mb-2">1. Kelola Kategori Ujian</p>
                  {kategoriEditData.map((kat, index) => (
                    <div className="mb-2 d-flex gap-2" key={kat.id_kategori}>
                      <input type="text" className="form-control form-control-sm" value={kat.nama_kategori} onChange={(e) => {
                        const newData = [...kategoriEditData];
                        newData[index].nama_kategori = e.target.value;
                        setKategoriEditData(newData);
                      }} />
                      <button className="btn btn-sm btn-outline-danger" onClick={() => hapusKategori(kat.id_kategori, kat.nama_kategori)}>🗑️</button>
                    </div>
                  ))}
                  <button className="btn btn-sm btn-primary w-100 mb-2" onClick={simpanKategori}>Simpan Nama Kategori</button>
                  <div className="d-flex gap-2 mb-4">
                    <input type="text" className="form-control form-control-sm" placeholder="Kategori Baru..." value={kategoriBaru} onChange={(e) => setKategoriBaru(e.target.value)} />
                    <button className="btn btn-sm btn-success" onClick={tambahKategori}>Tambah</button>
                  </div>

                  <hr />
                  <p className="small fw-bold mb-2">2. Kelola Mata Pelajaran</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {daftarMapel.map((m) => (
                      <span key={m.id_mapel} className="badge bg-white text-dark border d-flex align-items-center gap-2 p-2">
                        {m.nama_mapel}
                        <button type="button" className="btn-close" style={{ fontSize: '10px' }} onClick={() => hapusMapel(m.id_mapel, m.nama_mapel)}></button>
                      </span>
                    ))}
                  </div>
                  <div className="d-flex gap-2 mb-4">
                    <input type="text" className="form-control form-control-sm" placeholder="Mapel Baru..." value={mapelBaru} onChange={(e) => setMapelBaru(e.target.value)} />
                    <button className="btn btn-sm btn-success" onClick={tambahMapel}>Tambah Mapel</button>
                  </div>

                  <hr />
                  <p className="small fw-bold mb-2">3. Judul Laporan</p>
                  <div className="d-flex gap-2">
                    <input type="text" className="form-control form-control-sm" value={judulLaporan} onChange={(e) => setJudulLaporan(e.target.value)} />
                    <button className="btn btn-sm btn-primary" onClick={simpanJudul}>Simpan Judul</button>
                  </div>
                  <button type="button" className="btn btn-sm btn-secondary w-100 mt-4" onClick={() => setModeEditKategori(false)}>Tutup Panel</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABEL DATA SISWA DINAMIS */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">📋 Rekap Nilai ({namaKategoriAktif})</h5>
            <button className="btn btn-danger btn-sm fw-bold" onClick={hapusSemuaSiswa}>🚨 Hapus Semua Data</button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>NIS</th><th>Nama</th><th>Rombel</th>
                  {daftarMapel.map(m => (<th key={m.id_mapel} className="text-center text-danger">{m.nama_mapel}</th>))}
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftarSiswa.map((s) => (
                  <tr key={s.nis}>
                    <td>{s.nis}</td><td className="fw-bold">{s.nama}</td><td>{s.rombel}</td>
                    {daftarMapel.map(m => {
                       const data = s.daftar_nilai.find(n => n.mapel === m.nama_mapel);
                       return <td key={m.id_mapel} className="text-center fw-bold text-primary">{data ? data[kategori] : '-'}</td>
                    })}
                    <td className="text-center">
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-warning" onClick={() => editSiswa(s)}>✏️</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => hapusSiswa(s.nis)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;