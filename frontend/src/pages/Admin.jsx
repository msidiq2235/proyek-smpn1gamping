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

  const [kategori, setKategori] = useState('pp1');
  const [inputKolektif, setInputKolektif] = useState({
    nis: '', indo: '', mtk: '', inggris: '', ipa: ''
  });

  useEffect(() => {
    if (role !== 'admin') navigate('/beranda');
    muatDaftarSiswa();
  }, [role, navigate]);

  const [daftarNilai, setDaftarNilai] = useState([]); // State baru untuk simpan semua nilai

const muatDaftarSiswa = async () => {
  try {
    const [resSiswa, resNilai] = await Promise.all([
      axios.get('http://localhost:5000/api/siswa_all'),
      axios.get('http://localhost:5000/api/nilai_all')
    ]);

    // GABUNGKAN DATA: Masukkan array nilai ke dalam objek tiap siswa
    const dataGabungan = resSiswa.data.map(siswa => {
      return {
        ...siswa,
        // Cari semua nilai yang punya NIS sama dengan siswa ini
        daftar_nilai: resNilai.data.filter(n => n.nis === siswa.nis)
      };
    });

    setDaftarSiswa(dataGabungan);
  } catch (err) {
    console.error("Gagal sinkronisasi data:", err);
  }
};

  const handleCariKolektif = async (nisInput, kategoriInput) => {
  // Bersihkan NIS dari karakter aneh (seperti tanda titik dua)
  const cleanNIS = nisInput.trim();

  if (cleanNIS.length > 2) {
    try {
      // 1. Cari Profil Siswa
      const resSiswa = await axios.get(`http://localhost:5000/api/siswa/${cleanNIS}`);
      
      if (resSiswa.data && resSiswa.data.profil) {
        setNamaTerdeteksi(resSiswa.data.profil.nama);

        // 2. Ambil Nilai (Gunakan .catch agar jika 404 tidak menghentikan proses)
        const resNilai = await axios.get(`http://localhost:5000/api/nilai/${cleanNIS}`)
          .catch(() => ({ data: [] })); // Jika 404, anggap belum punya nilai ([])

        const dataNilai = Array.isArray(resNilai.data) ? resNilai.data : [];
        
        // 3. Masukkan ke input (Jika mapel belum ada nilainya, beri string kosong)
        const getVal = (m) => dataNilai.find(n => n.mapel === m)?.[kategoriInput] || '';

        setInputKolektif({
          nis: cleanNIS,
          indo: getVal('Bahasa Indonesia'),
          mtk: getVal('Matematika'),
          inggris: getVal('Bahasa Inggris'),
          ipa: getVal('IPA')
        });
      } else {
        setNamaTerdeteksi('');
      }
    } catch (err) {
      // Jika siswa sama sekali tidak ada di database (404)
      setNamaTerdeteksi('');
      console.warn("Siswa belum terdaftar atau NIS salah.");
      
      // Kosongkan input agar tidak sisa data dari NIS sebelumnya
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

  const simpanNilaiKolektif = async (e) => {
  e.preventDefault();
  try {
    // Kita hanya mengirim kategori yang sedang dipilih (misal: pp1 saja atau pp2 saja)
    const payload = [
      { nis: inputKolektif.nis, mapel: 'Bahasa Indonesia', [kategori]: inputKolektif.indo },
      { nis: inputKolektif.nis, mapel: 'Matematika', [kategori]: inputKolektif.mtk },
      { nis: inputKolektif.nis, mapel: 'Bahasa Inggris', [kategori]: inputKolektif.inggris },
      { nis: inputKolektif.nis, mapel: 'IPA', [kategori]: inputKolektif.ipa }
    ];

    for (const data of payload) {
      await axios.post('http://localhost:5000/api/nilai', data);
    }

    setPesan({ tipe: 'success', isi: `Nilai ${kategori.toUpperCase()} Berhasil Disimpan!` });
    
    // Refresh data setelah simpan agar input tetap sinkron
    handleCariKolektif(inputKolektif.nis, kategori); 

  } catch (err) {
    console.error(err);
    setPesan({ tipe: 'danger', isi: 'Gagal menyimpan nilai.' });
  }
};

  const handleImportExcel = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    try {
      setPesan({ tipe: 'info', isi: '🚀 Sedang memproses data... Jangan tutup halaman ini.' });
      
      for (const row of jsonData) {
        // 1. DAFTARKAN SISWA (Jika belum ada)
        try {
          await axios.post('http://localhost:5000/api/siswa', {
            nis: row.nis,
            nama: row.nama || `Siswa ${row.nis}`,
            password: row.nis, // Password default adalah NIS nya sendiri
            rombel: row.rombel || '-',
            asal_sekolah: row.asal_sekolah || '-'
          });
        } catch (err) {
          // Jika sudah ada (Duplicate), abaikan dan lanjut isi nilai
          console.log(`NIS ${row.nis} sudah ada, lanjut ke nilai.`);
        }

        // 2. INPUT NILAI BERDASARKAN KATEGORI YANG DIPILIH DI DROPDOWN
        const payload = [
          { nis: row.nis, mapel: 'Bahasa Indonesia', [kategori]: row.indo || 0 },
          { nis: row.nis, mapel: 'Matematika', [kategori]: row.mtk || 0 },
          { nis: row.nis, mapel: 'Bahasa Inggris', [kategori]: row.inggris || 0 },
          { nis: row.nis, mapel: 'IPA', [kategori]: row.ipa || 0 }
        ];

        for (const d of payload) {
          await axios.post('http://localhost:5000/api/nilai', d);
        }
      }

      setPesan({ tipe: 'success', isi: `🎉 Berhasil! Data Siswa & Nilai ${kategori.toUpperCase()} telah diperbarui.` });
      muatDaftarSiswa(); // Refresh tabel biar datanya langsung muncul
    } catch (err) {
      console.error(err);
      setPesan({ tipe: 'danger', isi: '❌ Import gagal! Pastikan format kolom Excel sudah benar.' });
    }
  };
  reader.readAsArrayBuffer(file);
};

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '50px' }}>
      <nav className="navbar navbar-expand-lg bg-primary shadow-sm py-3 mb-5">
        <div className="container px-4">
          <span className="navbar-brand fw-bold text-white">🎓 Panel Administrasi</span>
          <div className="ms-auto">
            <Link to="/beranda" className="btn btn-light text-primary btn-sm fw-bold">⬅ Beranda</Link>
          </div>
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
                <h5 className="fw-bold mb-0">📊 Input Nilai Kolektif</h5>
                <div>
                  <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="d-none" id="importExcel" />
                  <label htmlFor="importExcel" className="btn btn-success btn-sm fw-bold">📂 Import Excel</label>
                </div>
              </div>

              <form onSubmit={simpanNilaiKolektif}>
                <div className="row g-2 mb-3">
                  <div className="col-8">
                    <input type="text" className="form-control" placeholder="Cari NIS..." value={inputKolektif.nis} 
                      onChange={(e)=>{
                        const val=e.target.value;
                        setInputKolektif({...inputKolektif, nis:val});
                        handleCariKolektif(val, kategori);
                      }}
                    />
                  </div>
                  <div className="col-4">
                    <select className="form-select fw-bold text-primary" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                      <option value="wu">WU TKA</option>
                      <option value="pp1">PP1</option>
                      <option value="pp2">PP2</option>
                      <option value="pp3">PP3</option>
                      <option value="pp4">PP4</option>
                    </select>
                  </div>
                </div>

                {namaTerdeteksi && <div className="alert alert-info py-2 small fw-bold">Siswa: {namaTerdeteksi}</div>}

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="small fw-bold">B. Indonesia</label>
                    <input type="number" className="form-control" value={inputKolektif.indo} onChange={(e)=>setInputKolektif({...inputKolektif, indo:e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="small fw-bold">Matematika</label>
                    <input type="number" className="form-control" value={inputKolektif.mtk} onChange={(e)=>setInputKolektif({...inputKolektif, mtk:e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="small fw-bold">B. Inggris</label>
                    <input type="number" className="form-control" value={inputKolektif.inggris} onChange={(e)=>setInputKolektif({...inputKolektif, inggris:e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="small fw-bold">IPA</label>
                    <input type="number" className="form-control" value={inputKolektif.ipa} onChange={(e)=>setInputKolektif({...inputKolektif, ipa:e.target.value})} />
                  </div>
                </div>

                <button className="btn btn-success w-100 fw-bold" disabled={!namaTerdeteksi}>
                  💾 Simpan Nilai {kategori.toUpperCase()}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* TABEL DATA SISWA */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h5 className="fw-bold mb-0">📋 Rekap Nilai Siswa ({kategori.toUpperCase()})</h5>
    <div className="badge bg-primary px-3 py-2">Mode: Latihan {kategori.toUpperCase()}</div>
  </div>
  
  <div className="table-responsive">
    <table className="table table-hover align-middle">
      <thead className="table-light">
        <tr>
          <th>NIS</th>
          <th>Nama Siswa</th>
          <th>Rombel</th>
          <th className="text-center text-danger">Indo</th>
          <th className="text-center text-danger">Mtk</th>
          <th className="text-center text-danger">Inggris</th>
          <th className="text-center text-danger">IPA</th>
          <th className="text-center">Aksi</th>
        </tr>
      </thead>
      <tbody>
  {daftarSiswa.map((s) => {
  const getSkor = (mapel) => {
    // Cari di dalam daftar_nilai milik siswa ini
    const data = s.daftar_nilai.find(n => n.mapel === mapel);
    return data && data[kategori] !== null ? data[kategori] : '-';
  };
return (
    <tr key={s.nis}>
      <td>{s.nis}</td>
      <td>{s.nama}</td>
      <td>{s.rombel}</td>
      <td className="text-center fw-bold">{getSkor('Bahasa Indonesia')}</td>
      <td className="text-center fw-bold">{getSkor('Matematika')}</td>
      <td className="text-center fw-bold">{getSkor('Bahasa Inggris')}</td>
      <td className="text-center fw-bold">{getSkor('IPA')}</td>
      {/* ... tombol aksi */}
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