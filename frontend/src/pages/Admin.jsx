import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from "xlsx";
import { API_BASE_URL } from '../apiConfig';

function Admin() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  // Palette Warna SMPN 1 Gamping
  const colors = {
    primary: '#023874',    // Biru Navy Bos
    secondary: '#B8860B',  // Emas Tua (Elit)
    bgLight: '#F4F1EA',    // Krem Putih (Kesan Kertas Mahal)
    textDark: '#1A1A1A'    // Hitam Eboni
  };

  const [pesan, setPesan] = useState({ tipe: '', isi: '' }); // Untuk Pop-up umum
  const [pesanImport, setPesanImport] = useState({ tipe: '', isi: '' }); // Khusus Excel
  const [namaTerdeteksi, setNamaTerdeteksi] = useState('');
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [daftarMapel, setDaftarMapel] = useState([]);
  const [inputNilaiMapel, setInputNilaiMapel] = useState({});
  const [mapelBaru, setMapelBaru] = useState('');
  const [siswa, setSiswa] = useState({ nis: '', nama: '', password: '', rombel: '', asal_sekolah: '' });
  const [kategori, setKategori] = useState(''); 
  const [daftarKategori, setDaftarKategori] = useState([]);
  const [modeEditKategori, setModeEditKategori] = useState(false);
  const [kategoriEditData, setKategoriEditData] = useState([]);
  const [kategoriBaru, setKategoriBaru] = useState(''); 
  const [judulLaporan, setJudulLaporan] = useState('Laporan Hasil Evaluasi');
  const [nisKolektif, setNisKolektif] = useState('');

  // Hilangkan notifikasi POP-UP secara otomatis setelah 2 detik
  useEffect(() => {
    if (pesan.isi) {
      const timer = setTimeout(() => {
        setPesan({ tipe: '', isi: '' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pesan]);

  useEffect(() => {
    if (role !== 'admin' && localStorage.getItem('nis') !== 'admin') navigate('/beranda');
    muatDataAwal();
  }, [role, navigate]);

  const muatDataAwal = () => {
    muatMapel();
    muatDaftarSiswa();
    muatKategori();
    muatJudul();
  };

  // --- Fungsi Load Data ---
  const muatMapel = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_mapel.php`);
      setDaftarMapel(res.data);
    } catch (err) { console.error(err); }
  };

  const muatDaftarSiswa = async () => {
    try {
      const [resSiswa, resNilai] = await Promise.all([
        axios.get(`${API_BASE_URL}/get_all_siswa.php`),
        axios.get(`${API_BASE_URL}/get_all_nilai.php`)
      ]);
      const dataSiswa = Array.isArray(resSiswa.data) ? resSiswa.data : [];
      const dataNilai = Array.isArray(resNilai.data) ? resNilai.data : [];
      setDaftarSiswa(dataSiswa.map(s => ({ ...s, daftar_nilai: dataNilai.filter(n => n.nis === s.nis) })));
    } catch (err) { console.error(err); }
  };

  const muatKategori = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_kategori.php`);
      setDaftarKategori(res.data);
      setKategoriEditData(res.data);
      if(res.data.length > 0 && !kategori) setKategori(res.data[0].id_kategori);
    } catch (err) { console.error(err); }
  };

  const muatJudul = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_judul.php`);
      if (res.data?.judul) setJudulLaporan(res.data.judul);
    } catch (err) { console.error(err); }
  };

  // --- Fungsi Tambahan untuk Master Data ---
  const tambahKategori = async () => {
    if (!kategoriBaru) return alert("Nama kategori tidak boleh kosong!");
    try {
      await axios.post(`${API_BASE_URL}/tambah_kategori.php`, { nama_kategori: kategoriBaru });
      setKategoriBaru('');
      muatKategori();
      setPesan({ tipe: 'success', isi: 'Kategori Berhasil Ditambahkan!' });
    } catch (err) { console.error(err); setPesan({ tipe: 'danger', isi: 'Gagal menambah kategori.' }); }
  };

  const tambahMapel = async () => {
    if (!mapelBaru) return alert("Nama mapel tidak boleh kosong!");
    try {
      await axios.post(`${API_BASE_URL}/tambah_mapel.php`, { nama_mapel: mapelBaru });
      setMapelBaru('');
      muatMapel();
      setPesan({ tipe: 'success', isi: 'Mata Pelajaran Berhasil Ditambahkan!' });
    } catch (err) { console.error(err); setPesan({ tipe: 'danger', isi: 'Gagal menambah mata pelajaran.' }); }
  };

  const simpanJudulBaru = async () => {
    try {
      await axios.post(`${API_BASE_URL}/update_judul.php`, { judul: judulLaporan });
      setPesan({ tipe: 'success', isi: 'Judul Laporan Berhasil Diperbarui!' });
    } catch (err) { console.error(err); setPesan({ tipe: 'danger', isi: 'Gagal memperbarui judul.' }); }
  };

  const hapusKategori = async (id) => {
    if (window.confirm("Hapus kategori ini?")) {
      try {
        await axios.post(`${API_BASE_URL}/hapus_kategori.php`, { id_kategori: id, id: id });
        muatKategori();
        setPesan({ tipe: 'success', isi: 'Kategori Berhasil Dihapus!' });
      } catch (err) { console.error(err); }
    }
  };

  const hapusMapel = async (id) => {
    if (window.confirm("Hapus mata pelajaran ini?")) {
      try {
        await axios.post(`${API_BASE_URL}/hapus_mapel.php`, { id_mapel: id, id: id });
        muatMapel();
        setPesan({ tipe: 'success', isi: 'Mata Pelajaran Berhasil Dihapus!' });
      } catch (err) { console.error(err); }
    }
  };

  // --- Fungsi Handler (Simpan, Edit, Import) ---
  const handleCariKolektif = async (nisInput, kategoriInput) => {
    const cleanNIS = nisInput.trim();
    if (cleanNIS.length > 2) {
      try {
        const resSiswa = await axios.get(`${API_BASE_URL}/get_profil.php?nis=${cleanNIS}`);
        if (resSiswa.data?.profil) {
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
      const endpoint = isEditMode ? 'update_siswa.php' : 'tambah_siswa.php';
      await axios.post(`${API_BASE_URL}/${endpoint}`, siswa);
      setPesan({ tipe: 'success', isi: `Data Siswa Berhasil ${isEditMode ? 'Diperbarui' : 'Disimpan'}!` });
      setSiswa({ nis: '', nama: '', password: '', rombel: '', asal_sekolah: '' });
      setIsEditMode(false); muatDaftarSiswa();
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal memproses data.' }); }
  };

  const editSiswa = (data) => {
    setSiswa({ nis: data.nis, nama: data.nama, password: data.password, rombel: data.rombel, asal_sekolah: data.asal_sekolah });
    setIsEditMode(true); setNisKolektif(data.nis);
    const tempNilai = {};
    daftarMapel.forEach(m => {
      const n = data.daftar_nilai.find(dn => dn.mapel === m.nama_mapel);
      tempNilai[m.nama_mapel] = n ? n[kategori] : '';
    });
    setInputNilaiMapel(tempNilai); setNamaTerdeteksi(data.nama);
    window.scrollTo(0, 0);
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
    if (!file || !kategori) return alert("Pilih kategori nilai terlebih dahulu!");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      try {
        setPesanImport({ tipe: 'info', isi: 'Sedang memproses Excel...' });
        for (const row of jsonData) {
          try { await axios.post(`${API_BASE_URL}/tambah_siswa.php`, { nis: row.nis, nama: row.nama, password: row.nis, rombel: row.rombel || '-', asal_sekolah: row.asal_sekolah || '-' }); } catch(e){}
          for (const m of daftarMapel) {
            let val = row[m.nama_mapel] || 0;
            await axios.post(`${API_BASE_URL}/simpan_nilai_satuan.php`, { nis: row.nis, mapel: m.nama_mapel, [kategori]: val });
          }
        }
        setPesanImport({ tipe: 'success', isi: 'Import Selesai!' }); muatDaftarSiswa();
      } catch (err) { setPesanImport({ tipe: 'danger', isi: '❌ Import gagal!' }); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null; // Reset input file
  };

  const namaKategoriAktif = daftarKategori.find(k => k.id_kategori === kategori)?.nama_kategori || 'Pilih Kategori';

  return (
    <div style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* TAMPILAN POP-UP UMUM */}
      {pesan.isi && (
        <div 
          className={`alert alert-${pesan.tipe} shadow-lg border-0 d-flex align-items-center fw-bold`} 
          style={{ 
            position: 'fixed', 
            top: '30px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 9999,
            minWidth: '300px',
            justifyContent: 'center',
            borderRadius: '12px',
            animation: 'fadeInDown 0.3s ease-out'
          }}
        >
          {pesan.isi}
        </div>
      )}

      <style>
        {`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
        `}
      </style>

      {/* NAVBAR STYLE SMPN 1 GAMPING */}
      <nav className="navbar navbar-expand-lg shadow-sm py-3 mb-5" style={{ backgroundColor: colors.primary, borderBottom: `4px solid ${colors.secondary}` }}>
        <div className="container">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-3">
            <img src="logosekolah.png" alt="Logo" style={{ width: '45px', filter: 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' }} /> 
            <div>
                <span style={{ fontSize: '1.2rem', display: 'block', lineHeight: '1' }}>PANEL ADMINISTRATOR</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', opacity: '0.8' }}>SMP NEGERI 1 GAMPING</span>
            </div>
          </span>
          <div className="ms-auto">
            <Link to="/beranda" className="btn btn-outline-light btn-sm fw-bold px-4 rounded-pill">
               KEMBALI
            </Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="row g-4 mb-5">
          {/* FORM SISWA */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
              <div className="p-3 text-white fw-bold text-center" style={{ backgroundColor: colors.primary, borderBottom: `3px solid ${colors.secondary}` }}>
                {isEditMode ? 'EDIT DATA SISWA' : 'REGISTRASI SISWA'}
              </div>
              <div className="card-body p-4">
                <form onSubmit={simpanSiswa}>
                  <div className="mb-2">
                    <label className="small fw-bold text-muted">NIS / USERNAME</label>
                    <input type="text" className="form-control" value={siswa.nis} onChange={(e) => setSiswa({...siswa, nis:e.target.value})} required disabled={isEditMode} style={{ backgroundColor: '#fdfdfd' }} />
                  </div>
                  <div className="mb-2">
                    <label className="small fw-bold text-muted">NAMA LENGKAP</label>
                    <input type="text" className="form-control" value={siswa.nama} onChange={(e) => setSiswa({...siswa, nama:e.target.value})} required />
                  </div>
                  <div className="mb-2">
                    <label className="small fw-bold text-muted">PASSWORD</label>
                    <input type="text" className="form-control" value={siswa.password} onChange={(e) => setSiswa({...siswa, password:e.target.value})} required />
                  </div>
                  <div className="mb-2">
                    <label className="small fw-bold text-muted">ROMBEL / KELAS</label>
                    <input type="text" className="form-control" value={siswa.rombel} onChange={(e) => setSiswa({...siswa, rombel:e.target.value})} required />
                  </div>
                  <div className="mb-4">
                    <label className="small fw-bold text-muted">ASAL SEKOLAH</label>
                    <input type="text" className="form-control" value={siswa.asal_sekolah} onChange={(e) => setSiswa({...siswa, asal_sekolah:e.target.value})} required />
                  </div>
                  <button className="btn w-100 fw-bold shadow-sm" style={{ backgroundColor: colors.primary, color: 'white' }}>
                    {isEditMode ? 'UPDATE SEKARANG' : 'SIMPAN DATA'}
                  </button>
                  {isEditMode && <button type="button" className="btn btn-link w-100 mt-2 text-decoration-none text-muted" onClick={() => {setIsEditMode(false); setSiswa({nis:'', nama:'', password:'', rombel:'', asal_sekolah:''})}}>Batal</button>}
                </form>
              </div>
            </div>
          </div>

          {/* INPUT NILAI */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
              <div className="p-3 text-white fw-bold d-flex justify-content-between align-items-center" style={{ backgroundColor: colors.primary, borderBottom: `3px solid ${colors.secondary}` }}>
                <span>INPUT NILAI EVALUASI</span>
                <div className="d-flex gap-2">
                    <label htmlFor="importExcel" className="btn btn-sm fw-bold rounded-pill mb-0" style={{ backgroundColor: colors.primary, color: '#fff', border: '1px solid #fff', cursor: 'pointer' }}>IMPORT EXCEL</label>
                    <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="d-none" id="importExcel" />
                    
                    <button type="button" className="btn btn-sm rounded-circle text-white d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', border: 'none', width: '32px', height: '32px' }} onClick={() => setModeEditKategori(!modeEditKategori)}>⚙️</button>
                </div>
              </div>
              <div className="card-body p-4">
                
                {/* 🚀 NOTIFIKASI KHUSUS IMPORT EXCEL (Inline, pakai tombol Close) */}
                {pesanImport.isi && (
                  <div className={`alert alert-${pesanImport.tipe} alert-dismissible fade show shadow-sm border-0 mb-4`} role="alert" style={{ borderRadius: '10px' }}>
                    {pesanImport.isi}
                    <button type="button" className="btn-close" onClick={() => setPesanImport({ tipe: '', isi: '' })} aria-label="Close"></button>
                  </div>
                )}

                <form onSubmit={simpanNilaiKolektif}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="small fw-bold text-muted">CARI NIS SISWA</label>
                      <input type="text" className="form-control border-2" placeholder="Masukkan NIS..." value={nisKolektif} 
                        onChange={(e)=>{setNisKolektif(e.target.value); handleCariKolektif(e.target.value, kategori);}}
                        style={{ borderColor: colors.primary }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="small fw-bold text-muted">KATEGORI UJIAN</label>
                      <select className="form-select border-2 fw-bold" value={kategori} onChange={(e) => {setKategori(e.target.value); handleCariKolektif(nisKolektif, e.target.value);}} style={{ color: colors.primary, borderColor: colors.primary }}>
                        <option value="" disabled>-- Pilih Kategori --</option>
                        {daftarKategori.map((kat) => (<option key={kat.id_kategori} value={kat.id_kategori}>{kat.nama_kategori}</option>))}
                      </select>
                    </div>
                  </div>

                  {namaTerdeteksi && (
                    <div className="p-3 mb-4 rounded-3 d-flex align-items-center gap-3" style={{ backgroundColor: '#fff3cd', borderLeft: `5px solid ${colors.secondary}` }}>
                      <span style={{ fontSize: '1.5rem' }}>👤</span>
                      <div>
                          <small className="d-block fw-bold text-muted">Siswa Ditemukan:</small>
                          <span className="fw-bold text-dark h5">{namaTerdeteksi}</span>
                      </div>
                    </div>
                  )}

                  <div className="row g-3 mb-4">
                    {daftarMapel.map((m) => (
                      <div className="col-6 col-lg-3" key={m.id_mapel}>
                        <div className="p-2 border rounded bg-light">
                            <label className="small fw-bold text-uppercase d-block mb-1 text-truncate" title={m.nama_mapel}>{m.nama_mapel}</label>
                            <input type="number" className="form-control form-control-sm fw-bold border-0 shadow-none text-center" value={inputNilaiMapel[m.nama_mapel] || ''} 
                                onChange={(e)=> setInputNilaiMapel({...inputNilaiMapel, [m.nama_mapel]: e.target.value})} 
                                style={{ fontSize: '1.1rem' }}
                            />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn w-100 fw-bold py-2 shadow" disabled={!namaTerdeteksi || !kategori} style={{ backgroundColor: colors.primary, color: colors.bgLight }}>
                    SIMPAN NILAI {namaKategoriAktif.toUpperCase()}
                  </button>
                </form>

                {/* MODAL-LIKE SETTINGS PANEL */}
                {modeEditKategori && (
                  <div className="mt-4 rounded shadow-sm border animate__animated animate__fadeIn" style={{ backgroundColor: '#fff', overflow: 'hidden' }}>
                    <div className="p-3 text-white fw-bold d-flex align-items-center gap-2" style={{ backgroundColor: colors.primary, borderBottom: `3px solid ${colors.secondary}` }}>
                        PENGATURAN MASTER DATA & LAPORAN
                    </div>
                    
                    <div className="p-4">
                        <div className="mb-4 pb-3 border-bottom">
                            <label className="small fw-bold text-muted">JUDUL LAPORAN (HEADER)</label>
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={judulLaporan} 
                                    onChange={(e) => setJudulLaporan(e.target.value)} 
                                    placeholder="Contoh: Laporan Hasil Evaluasi Siswa"
                                />
                                <button type="button" className="btn fw-bold text-white" style={{ backgroundColor: colors.primary }} onClick={simpanJudulBaru}>UPDATE JUDUL</button>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 border-end">
                                <p className="small fw-bold">1. MANAJEMEN KATEGORI NILAI</p>
                                {kategoriEditData.map((kat) => (
                                    <div className="input-group input-group-sm mb-2" key={kat.id_kategori}>
                                        <input type="text" className="form-control" value={kat.nama_kategori} readOnly />
                                        <button type="button" className="btn btn-outline-danger" onClick={() => hapusKategori(kat.id_kategori)}>🗑️</button>
                                    </div>
                                ))}
                                <div className="input-group input-group-sm mt-3">
                                    <input type="text" className="form-control" placeholder="Nama Kategori Baru..." value={kategoriBaru} onChange={(e) => setKategoriBaru(e.target.value)} />
                                    <button type="button" className="btn btn-success" onClick={tambahKategori}>TAMBAH</button>
                                </div>
                            </div>

                            <div className="col-md-6 ps-md-4">
                                <p className="small fw-bold">2. MANAJEMEN MATA PELAJARAN</p>
                                <div className="d-flex flex-wrap gap-1 mb-3">
                                    {daftarMapel.map((m) => (
                                        <span key={m.id_mapel} className="badge bg-light text-dark border p-2 d-flex align-items-center gap-2">
                                            {m.nama_mapel}
                                            <button 
                                                type="button"
                                                className="btn-close" 
                                                style={{fontSize:'8px'}} 
                                                onClick={() => hapusMapel(m.id_mapel)}
                                            ></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="input-group input-group-sm">
                                    <input type="text" className="form-control" placeholder="Nama Mapel Baru..." value={mapelBaru} onChange={(e) => setMapelBaru(e.target.value)} />
                                    <button type="button" className="btn btn-success" onClick={tambahMapel}>TAMBAH</button>
                                </div>
                            </div>
                        </div>
                        <button type="button" className="btn btn-dark btn-sm w-100 mt-4 fw-bold" onClick={() => setModeEditKategori(false)}>TUTUP PENGATURAN</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABEL REKAP */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="p-3 text-white fw-bold d-flex justify-content-between align-items-center" style={{ backgroundColor: colors.textDark }}>
            <span>REKAPITULASI NILAI ({namaKategoriAktif.toUpperCase()})</span>
            <button type="button" className="btn btn-danger btn-sm fw-bold rounded-pill px-3" onClick={() => { /* hapusSemuaSiswa */ }}>KOSONGKAN DATA</button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#eee' }}>
                <tr className="small text-uppercase">
                  <th className="ps-4">NIS</th>
                  <th>Nama Siswa</th>
                  <th>Kelas</th>
                  {daftarMapel.map(m => (<th key={m.id_mapel} className="text-center" style={{ color: colors.primary }}>{m.nama_mapel}</th>))}
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftarSiswa.map((s) => (
                  <tr key={s.nis} style={{ fontSize: '0.9rem' }}>
                    <td className="ps-4 text-muted">{s.nis}</td>
                    <td className="fw-bold">{s.nama}</td>
                    <td><span className="badge bg-secondary">{s.rombel}</span></td>
                    {daftarMapel.map(m => {
                       const data = s.daftar_nilai.find(n => n.mapel === m.nama_mapel);
                       const score = data ? data[kategori] : '-';
                       return (
                        <td key={m.id_mapel} className="text-center fw-bold" style={{ color: score !== '-' ? colors.primary : '#ccc' }}>
                            {score}
                        </td>
                       );
                    })}
                    <td className="text-center pe-4">
                      <div className="btn-group shadow-sm border rounded-pill overflow-hidden">
                        <button type="button" className="btn btn-white btn-sm px-3 border-end" onClick={() => editSiswa(s)}>✏️</button>
                        <button type="button" className="btn btn-white btn-sm px-3 text-danger" onClick={() => { /* hapusSiswa(s.nis) */ }}>🗑️</button>
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