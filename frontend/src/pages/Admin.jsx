import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from "xlsx";

function Admin() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const [pesan, setPesan] = useState({ tipe: '', isi: '' });
  const [namaTerdeteksi, setNamaTerdeteksi] = useState('');
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const [siswa, setSiswa] = useState({
    nis: '', nama: '', password: '', rombel: '', asal_sekolah: ''
  });

  // State Kategori
  const [kategori, setKategori] = useState(''); 
  const [daftarKategori, setDaftarKategori] = useState([]);
  const [modeEditKategori, setModeEditKategori] = useState(false);
  const [kategoriEditData, setKategoriEditData] = useState([]);
  const [kategoriBaru, setKategoriBaru] = useState(''); // State untuk input nambah kategori

  const [inputKolektif, setInputKolektif] = useState({
    nis: '', indo: '', mtk: '', inggris: '', ipa: ''
  });

  useEffect(() => {
    if (role !== 'admin') navigate('/beranda');
    muatDaftarSiswa();
    muatKategori();
  }, [role, navigate]);

  const muatDaftarSiswa = async () => {
    try {
      const [resSiswa, resNilai] = await Promise.all([
        axios.get('http://localhost:5000/api/siswa_all'),
        axios.get('http://localhost:5000/api/nilai_all')
      ]);

      const dataGabungan = resSiswa.data.map(siswa => ({
        ...siswa,
        daftar_nilai: resNilai.data.filter(n => n.nis === siswa.nis)
      }));

      setDaftarSiswa(dataGabungan);
    } catch (err) { console.error("Gagal sinkronisasi data:", err); }
  };

  const muatKategori = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/kategori');
      setDaftarKategori(res.data);
      setKategoriEditData(res.data); 
      // Set default ke kategori pertama yang ada (kalau belum diset)
      if(res.data.length > 0 && !kategori) {
          setKategori(res.data[0].id_kategori);
      }
    } catch (err) { console.error("Gagal memuat kategori:", err); }
  };

  const simpanKategori = async () => {
    try {
      for (const item of kategoriEditData) {
        await axios.put(`http://localhost:5000/api/kategori/${item.id_kategori}`, {
          nama_kategori: item.nama_kategori
        });
      }
      setPesan({ tipe: 'success', isi: 'Nama kategori berhasil diperbarui!' });
      muatKategori(); 
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal memperbarui kategori.' }); }
  };

  // --- FUNGSI BARU: TAMBAH KATEGORI ---
  const tambahKategori = async () => {
    if (!kategoriBaru) return;
    try {
      setPesan({ tipe: 'info', isi: '⏳ Sedang membuat kolom di database...' });
      await axios.post('http://localhost:5000/api/kategori', { nama_kategori: kategoriBaru });
      setKategoriBaru('');
      muatKategori();
      setPesan({ tipe: 'success', isi: `Kategori "${kategoriBaru}" berhasil ditambahkan!` });
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal menambah kategori.' }); }
  };

  // --- FUNGSI BARU: HAPUS KATEGORI ---
  const hapusKategori = async (id, nama) => {
    if (window.confirm(`⚠️ Yakin ingin menghapus kategori "${nama}"? SEMUA NILAI SISWA DI KATEGORI INI AKAN HILANG PERMANEN!`)) {
      try {
        setPesan({ tipe: 'info', isi: '⏳ Sedang menghapus kolom dari database...' });
        await axios.delete(`http://localhost:5000/api/kategori/${id}`);
        
        if (kategori === id) setKategori(''); // Reset tampilan jika yg dihapus sedang aktif
        muatKategori();
        muatDaftarSiswa(); // Refresh nilai yg ada di memori
        setPesan({ tipe: 'warning', isi: `Kategori "${nama}" telah dihapus.` });
      } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal menghapus kategori.' }); }
    }
  };

  const handleCariKolektif = async (nisInput, kategoriInput) => {
    const cleanNIS = nisInput.trim();
    if (cleanNIS.length > 2) {
      try {
        const resSiswa = await axios.get(`http://localhost:5000/api/siswa/${cleanNIS}`);
        if (resSiswa.data && resSiswa.data.profil) {
          setNamaTerdeteksi(resSiswa.data.profil.nama);
          const resNilai = await axios.get(`http://localhost:5000/api/nilai/${cleanNIS}`).catch(() => ({ data: [] }));
          const dataNilai = Array.isArray(resNilai.data) ? resNilai.data : [];
          const getVal = (m) => dataNilai.find(n => n.mapel === m)?.[kategoriInput] || '';

          setInputKolektif({
            nis: cleanNIS,
            indo: getVal('Bahasa Indonesia'), mtk: getVal('Matematika'),
            inggris: getVal('Bahasa Inggris'), ipa: getVal('IPA')
          });
        } else { setNamaTerdeteksi(''); }
      } catch (err) {
        setNamaTerdeteksi('');
        setInputKolektif({ ...inputKolektif, nis: cleanNIS, indo: '', mtk: '', inggris: '', ipa: '' });
      }
    }
  };

  const simpanSiswa = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/siswa/${siswa.nis}`, siswa);
        setPesan({ tipe: 'success', isi: 'Data Siswa Berhasil Diperbarui!' });
      } else {
        await axios.post('http://localhost:5000/api/siswa', siswa);
        setPesan({ tipe: 'success', isi: 'Data Siswa Berhasil Disimpan!' });
      }
      setSiswa({ nis: '', nama: '', password: '', rombel: '', asal_sekolah: '' });
      setIsEditMode(false);
      muatDaftarSiswa();
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal memproses data siswa.' }); }
  };

  const editSiswa = (data) => {
    setSiswa(data);
    setIsEditMode(true);
    window.scrollTo(0, 0);
  };

  const hapusSiswa = async (nis) => {
    if (window.confirm("Hapus siswa ini? Semua nilai siswa ini juga akan hilang.")) {
      try {
        await axios.delete(`http://localhost:5000/api/siswa/${nis}`);
        setPesan({ tipe: 'warning', isi: 'Siswa berhasil dihapus.' });
        muatDaftarSiswa();
      } catch (err) { console.error(err); }
    }
  };

  const hapusSemuaSiswa = async () => {
    const konfirmasi = window.prompt('🚨 PERINGATAN KERAS! 🚨\nAksi ini akan menghapus SEMUA data siswa beserta nilainya secara permanen untuk pergantian tahun ajaran.\n\nKetik "HAPUS" untuk melanjutkan:');
    if (konfirmasi === 'HAPUS') {
      try {
        setPesan({ tipe: 'info', isi: 'Memproses penghapusan data masal...' });
        await axios.delete('http://localhost:5000/api/siswa_all');
        setPesan({ tipe: 'danger', isi: 'Semua data siswa berhasil dikosongkan untuk tahun ajaran baru.' });
        muatDaftarSiswa(); 
      } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal menghapus semua data.' }); }
    }
  };

  const simpanNilaiKolektif = async (e) => {
    e.preventDefault();
    if (!kategori) return setPesan({ tipe: 'danger', isi: 'Pilih kategori nilai terlebih dahulu!' });

    try {
      const payload = [
        { nis: inputKolektif.nis, mapel: 'Bahasa Indonesia', [kategori]: inputKolektif.indo },
        { nis: inputKolektif.nis, mapel: 'Matematika', [kategori]: inputKolektif.mtk },
        { nis: inputKolektif.nis, mapel: 'Bahasa Inggris', [kategori]: inputKolektif.inggris },
        { nis: inputKolektif.nis, mapel: 'IPA', [kategori]: inputKolektif.ipa }
      ];

      for (const data of payload) {
        await axios.post('http://localhost:5000/api/nilai', data);
      }

      const namaKat = daftarKategori.find(k => k.id_kategori === kategori)?.nama_kategori || kategori;
      setPesan({ tipe: 'success', isi: `Nilai ${namaKat} Berhasil Disimpan!` });
      handleCariKolektif(inputKolektif.nis, kategori); 
    } catch (err) { setPesan({ tipe: 'danger', isi: 'Gagal menyimpan nilai.' }); }
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file || !kategori) return alert("Pilih kategori nilai terlebih dahulu sebelum import!");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      try {
        setPesan({ tipe: 'info', isi: '🚀 Sedang memproses data... Jangan tutup halaman ini.' });
        
        for (const row of jsonData) {
          try {
            await axios.post('http://localhost:5000/api/siswa', {
              nis: row.nis, nama: row.nama || `Siswa ${row.nis}`,
              password: row.nis, rombel: row.rombel || '-', asal_sekolah: row.asal_sekolah || '-'
            });
          } catch (err) { /* Abaikan jika siswa sudah ada */ }

          const payload = [
            { nis: row.nis, mapel: 'Bahasa Indonesia', [kategori]: row.indo || 0 },
            { nis: row.nis, mapel: 'Matematika', [kategori]: row.mtk || 0 },
            { nis: row.nis, mapel: 'Bahasa Inggris', [kategori]: row.inggris || 0 },
            { nis: row.nis, mapel: 'IPA', [kategori]: row.ipa || 0 }
          ];

          for (const d of payload) { await axios.post('http://localhost:5000/api/nilai', d); }
        }
        const namaKat = daftarKategori.find(k => k.id_kategori === kategori)?.nama_kategori || kategori;
        setPesan({ tipe: 'success', isi: `🎉 Berhasil! Data Siswa & Nilai ${namaKat} telah diperbarui.` });
        muatDaftarSiswa(); 
      } catch (err) { setPesan({ tipe: 'danger', isi: '❌ Import gagal! Pastikan format kolom Excel sudah benar.' }); }
    };
    reader.readAsArrayBuffer(file);
  };

  const namaKategoriAktif = daftarKategori.find(k => k.id_kategori === kategori)?.nama_kategori || 'Pilih Kategori';

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '50px' }}>
      <nav className="navbar navbar-expand-lg bg-primary shadow-sm py-3 mb-5">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-2">
            <img src="/logo_smpn1gmp.png" alt="Logo SMPN 1 Gamping" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            Panel Admin
          </span>
          <div className="ms-auto"><Link to="/beranda" className="btn btn-light text-primary btn-sm fw-bold">⬅ Beranda</Link></div>
        </div>
      </nav>

      <div className="container px-4">
        {pesan.isi && <div className={`alert alert-${pesan.tipe} alert-dismissible fade show mb-4`}>
          {pesan.isi}
          <button type="button" className="btn-close" onClick={() => setPesan({tipe:'', isi:''})}></button>
        </div>}

        <div className="row g-4 mb-5">
          {/* CRUD SISWA */}
          <div className="col-md-5">
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

          {/* INPUT NILAI & IMPORT */}
          <div className="col-md-7">
            <div className="card p-4 border-0 shadow-sm" style={{borderRadius: '15px'}}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">📊 Input Nilai </h5>
                <div>
                  <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="d-none" id="importExcel" />
                  <label htmlFor="importExcel" className="btn btn-success btn-sm fw-bold">📂 Import Excel</label>
                </div>
              </div>

              <form onSubmit={simpanNilaiKolektif}>
                <div className="row g-2 mb-3">
                  <div className="col-7">
                    <input type="text" className="form-control" placeholder="Cari NIS..." value={inputKolektif.nis} 
                      onChange={(e)=>{
                        const val=e.target.value;
                        setInputKolektif({...inputKolektif, nis:val});
                        handleCariKolektif(val, kategori);
                      }}
                    />
                  </div>
                  
                  <div className="col-5 d-flex gap-2">
                    <select className="form-select fw-bold text-primary" value={kategori} onChange={(e) => {
                      setKategori(e.target.value);
                      handleCariKolektif(inputKolektif.nis, e.target.value);
                    }}>
                      <option value="" disabled>-- Pilih --</option>
                      {daftarKategori.map((kat) => (
                        <option key={kat.id_kategori} value={kat.id_kategori}>{kat.nama_kategori}</option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setModeEditKategori(!modeEditKategori)} title="Atur Kategori">⚙️</button>
                  </div>
                </div>

                {namaTerdeteksi && <div className="alert alert-info py-2 small fw-bold">Siswa: {namaTerdeteksi}</div>}

                <div className="row g-3 mb-4">
                  <div className="col-6"><label className="small fw-bold">B. Indonesia</label><input type="number" className="form-control" value={inputKolektif.indo} onChange={(e)=>setInputKolektif({...inputKolektif, indo:e.target.value})} /></div>
                  <div className="col-6"><label className="small fw-bold">Matematika</label><input type="number" className="form-control" value={inputKolektif.mtk} onChange={(e)=>setInputKolektif({...inputKolektif, mtk:e.target.value})} /></div>
                  <div className="col-6"><label className="small fw-bold">B. Inggris</label><input type="number" className="form-control" value={inputKolektif.inggris} onChange={(e)=>setInputKolektif({...inputKolektif, inggris:e.target.value})} /></div>
                  <div className="col-6"><label className="small fw-bold">IPA</label><input type="number" className="form-control" value={inputKolektif.ipa} onChange={(e)=>setInputKolektif({...inputKolektif, ipa:e.target.value})} /></div>
                </div>

                <button className="btn btn-success w-100 fw-bold" disabled={!namaTerdeteksi || !kategori}>💾 Simpan Nilai {namaKategoriAktif}</button>
              </form>

              {/* PANEL PENGATURAN KATEGORI */}
              {modeEditKategori && (
                <div className="mt-4 p-3 bg-light rounded border border-secondary shadow-sm">
                  <h6 className="fw-bold mb-3">⚙️ Pengaturan Kategori Nilai</h6>
                  
                  {/* List Edit & Hapus */}
                  {kategoriEditData.map((kat, index) => (
                    <div className="mb-2 d-flex align-items-center gap-2" key={kat.id_kategori}>
                      <span className="badge bg-secondary" style={{ width: '70px' }}>Urutan {index + 1}</span>
                      <input type="text" className="form-control form-control-sm" value={kat.nama_kategori} onChange={(e) => {
                        const newData = [...kategoriEditData];
                        newData[index].nama_kategori = e.target.value;
                        setKategoriEditData(newData);
                      }} />
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => hapusKategori(kat.id_kategori, kat.nama_kategori)} title="Hapus Kategori">🗑️</button>
                    </div>
                  ))}
                  
                  <div className="d-flex justify-content-end mb-4">
                    <button type="button" className="btn btn-sm btn-primary" onClick={simpanKategori}>💾 Simpan Nama Baru</button>
                  </div>

                  <hr />
                  
                  {/* Form Tambah Baru */}
                  <h6 className="fw-bold mb-2 text-success">➕ Tambah Kategori Ujian Baru</h6>
                  <div className="d-flex gap-2">
                    <input type="text" className="form-control form-control-sm" placeholder="Misal: Ujian Praktek, PTS, dll." value={kategoriBaru} onChange={(e) => setKategoriBaru(e.target.value)} />
                    <button type="button" className="btn btn-sm btn-success text-nowrap" onClick={tambahKategori} disabled={!kategoriBaru}>Tambah</button>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setModeEditKategori(false)}>Tutup Panel</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* TABEL DATA SISWA */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">📋 Rekap Nilai Siswa ({namaKategoriAktif})</h5>
            <div className="d-flex gap-2 align-items-center">
              <div className="badge bg-primary px-3 py-2">{namaKategoriAktif}</div>
              <button className="btn btn-danger btn-sm fw-bold shadow-sm" onClick={hapusSemuaSiswa} title="Kosongkan data">🚨 Hapus Semua Data</button>
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>NIS</th><th>Nama Siswa</th><th>Rombel</th>
                  <th className="text-center text-danger">Indo</th><th className="text-center text-danger">Mtk</th>
                  <th className="text-center text-danger">Inggris</th><th className="text-center text-danger">IPA</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftarSiswa.map((s) => {
                  const getSkor = (mapel) => {
                    const data = s.daftar_nilai.find(n => n.mapel === mapel);
                    return data && data[kategori] !== undefined && data[kategori] !== null ? data[kategori] : '-';
                  };

                  return (
                    <tr key={s.nis}>
                      <td>{s.nis}</td><td className="fw-bold">{s.nama}</td>
                      <td><span className="badge bg-secondary">{s.rombel}</span></td>
                      <td className="text-center fw-bold text-primary">{getSkor('Bahasa Indonesia')}</td>
                      <td className="text-center fw-bold text-primary">{getSkor('Matematika')}</td>
                      <td className="text-center fw-bold text-primary">{getSkor('Bahasa Inggris')}</td>
                      <td className="text-center fw-bold text-primary">{getSkor('IPA')}</td>
                      <td className="text-center">
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-warning" onClick={() => editSiswa(s)}>✏️</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => hapusSiswa(s.nis)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;