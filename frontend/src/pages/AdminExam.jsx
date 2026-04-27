import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function AdminExam() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('edit');

    const colors = {
        primary: '#023874',
        secondary: '#B8860B',
        bgLight: '#F4F1EA',
        white: '#ffffff'
    };

    // --- STATE INFO UJIAN ---
    const [judul, setJudul] = useState('');
    const [mapelId, setMapelId] = useState('');
    const [durasi, setDurasi] = useState(60);
    const [targetNilai, setTargetNilai] = useState(100);
    const [maxAttempt, setMaxAttempt] = useState(1); 
    const [token, setToken] = useState(''); // State Token Baru
    const [idUjianBaru, setIdUjianBaru] = useState(editId || null);
    const [listMapel, setListMapel] = useState([]);
    const [showInfoUjian, setShowInfoUjian] = useState(editId ? false : true);

    // --- STATE SOAL & NAVIGASI ---
    const [existingSoal, setExistingSoal] = useState([]);
    const [idSoalEdit, setIdSoalEdit] = useState(null);
    const [nomorAktif, setNomorAktif] = useState(1);

    // --- STATE INPUT SOAL ---
    const [pertanyaan, setPertanyaan] = useState('');
    const [tipe, setTipe] = useState('pilgan');
    const [bobotSoal, setBobotSoal] = useState(1);
    const [opsi, setOpsi] = useState([{ teks: '', kunci: '', is_benar: 0 }]);
    const [gambar, setGambar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [kunciEsai, setKunciEsai] = useState('');

    useEffect(() => {
        fetchMapel();
        if (editId) {
            fetchInfoUjian();
            fetchExistingSoal();
        } else {
            generateToken(); // Generate token otomatis jika buat ujian baru
        }
    }, [editId]);

    // FUNGSI GENERATE TOKEN OTOMATIS
    const generateToken = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Tanpa O dan I agar tidak bingung
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setToken(result);
    };

    const fetchMapel = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_mapel_exam`);
            if (Array.isArray(res.data)) setListMapel(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchInfoUjian = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_list_ujian`);
            const current = res.data.find(u => u.id_ujian == editId);
            if (current) {
                setJudul(current.judul_ujian);
                setMapelId(current.id_mapel);
                setDurasi(current.durasi);
                setTargetNilai(current.total_bobot || 100);
                setMaxAttempt(current.max_attempt || 1);
                setToken(current.token || ''); // Ambil token dari database
            }
        } catch (err) { console.error(err); }
    };

    const fetchExistingSoal = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_soal&id_ujian=${editId || idUjianBaru}`);
            if (Array.isArray(res.data)) {
                setExistingSoal(res.data);
                if (!idSoalEdit) setNomorAktif(res.data.length + 1);
            }
        } catch (err) { console.error(err); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGambar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const simpanInfoUjian = async () => {
        if (!judul || !mapelId || !token) return alert("Lengkapi data utama termasuk Token!");
        const action = editId ? 'update_ujian' : 'tambah_ujian';
        const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=${action}`, {
            id_ujian: editId || idUjianBaru, 
            judul_ujian: judul, 
            id_mapel: mapelId, 
            durasi: durasi, 
            total_bobot: targetNilai,
            max_attempt: maxAttempt,
            token: token.toUpperCase() // Kirim token ke backend
        });
        if (res.data.success) {
            if (!editId) setIdUjianBaru(res.data.id_ujian);
            alert("Konfigurasi Ujian Berhasil Disimpan!");
            setShowInfoUjian(false);
        }
    };

    const loadSoalEdit = (s, idx) => {
        setIdSoalEdit(s.id_soal);
        setNomorAktif(idx + 1);
        setPertanyaan(s.pertanyaan);
        setTipe(s.tipe_soal);
        setBobotSoal(s.bobot || 1);
        setKunciEsai(s.kunci_esai || '');
        setPreview(s.gambar ? `${API_BASE_URL.replace('/exam', '')}/uploads/exam/${s.gambar}` : null);
        setOpsi(s.opsi.length > 0 ? s.opsi.map(o => ({
            teks: o.teks_opsi, kunci: o.kunci_matching, is_benar: parseInt(o.is_benar)
        })) : [{ teks: '', kunci: '', is_benar: 0 }]);
        window.scrollTo(0, 0);
    };

    const resetFormSoal = () => {
        setIdSoalEdit(null);
        setPertanyaan('');
        setTipe('pilgan');
        setBobotSoal(1);
        setKunciEsai('');
        setOpsi([{ teks: '', kunci: '', is_benar: 0 }]);
        setGambar(null);
        setPreview(null);
        setNomorAktif(existingSoal.length + 1);
    };

    const simpanSoal = async () => {
        if (!pertanyaan) return alert("Pertanyaan soal tidak boleh kosong!");
        if (tipe === 'pilgan' && !opsi.some(o => o.is_benar === 1)) return alert("Wajib pilih kunci jawaban!");
        
        const formData = new FormData();
        formData.append('id_ujian', idUjianBaru);
        if (idSoalEdit) formData.append('id_soal', idSoalEdit);
        formData.append('pertanyaan', pertanyaan);
        formData.append('tipe_soal', tipe);
        formData.append('bobot', bobotSoal);
        formData.append('kunci_esai', kunciEsai);
        formData.append('opsi', JSON.stringify(opsi));
        if (gambar) formData.append('gambar_soal', gambar);

        const action = idSoalEdit ? 'update_soal' : 'tambah_soal';
        try {
            const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=${action}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                alert("Butir Soal Berhasil Disimpan!");
                resetFormSoal();
                fetchExistingSoal();
            }
        } catch (err) { alert("Sistem gagal menyimpan soal."); }
    };

    return (
        <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', paddingBottom: '50px', fontFamily: "'Inter', sans-serif" }}>
            
            <nav className="navbar shadow-sm py-3 mb-5" style={{ backgroundColor: colors.primary, borderBottom: `4px solid ${colors.secondary}` }}>
                <div className="container-fluid px-md-5">
                    <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-3">
                        <img src="logosekolah.png" alt="Logo" style={{ width: '35px' }} />
                        <span style={{ letterSpacing: '1px', fontSize: '1.1rem' }}>CONSOLE MANAJEMEN UJIAN</span>
                    </span>
                    <button onClick={() => navigate('/daftar-ujian')} className="btn btn-outline-light btn-sm fw-bold px-4 rounded-pill shadow-sm">
                        ⬅ KELUAR
                    </button>
                </div>
            </nav>

            <div className="container-fluid px-md-5">
                <div className="row g-4">
                    <div className={editId ? "col-lg-8" : "col-lg-10 mx-auto"}>
                        
                        <div className="card shadow-sm border-0 mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
                            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center" 
                                 style={{ cursor: 'pointer', borderLeft: `6px solid ${colors.secondary}` }} onClick={() => setShowInfoUjian(!showInfoUjian)}>
                                <div>
                                    <h6 className="fw-bold m-0 text-dark text-uppercase" style={{ letterSpacing: '1px' }}>I. Konfigurasi Utama Ujian</h6>
                                    {editId && <small className="text-muted">Sedang mengelola: <strong>{judul}</strong></small>}
                                </div>
                                <span className="badge bg-light text-primary rounded-pill px-3 py-2">{showInfoUjian ? '▲ TUTUP' : '▼ BUKA'}</span>
                            </div>
                            {showInfoUjian && (
                                <div className="card-body border-top bg-white p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Nama Ujian / Evaluasi</label>
                                            <input className="form-control border-0 bg-light py-2 px-3" style={{borderRadius: '10px'}} value={judul} onChange={e => setJudul(e.target.value)} placeholder="Contoh: Penilaian Harian Matematika" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Target Skor (Max)</label>
                                            <input className="form-control border-0 bg-light py-2 px-3 fw-bold" style={{borderRadius: '10px'}} type="number" value={targetNilai} onChange={e => setTargetNilai(e.target.value)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Jatah Percobaan</label>
                                            <input className="form-control border-0 bg-light py-2 px-3 fw-bold" style={{borderRadius: '10px'}} type="number" value={maxAttempt} onChange={e => setMaxAttempt(e.target.value)} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Mata Pelajaran</label>
                                            <div className="input-group">
                                                <select className="form-select border-0 bg-light py-2 px-3" style={{borderRadius: '10px 0 0 10px'}} value={mapelId} onChange={e => setMapelId(e.target.value)}>
                                                    <option value="">-- Pilih Mata Pelajaran --</option>
                                                    {listMapel.map(m => <option key={m.id_exam_mapel} value={m.id_exam_mapel}>{m.nama_mapel}</option>)}
                                                </select>
                                                <button className="btn btn-dark" onClick={() => navigate('/manage-mapel-exam')}>⚙️</button>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Durasi (Menit)</label>
                                            <input className="form-control border-0 bg-light py-2 px-3" style={{borderRadius: '10px'}} type="number" value={durasi} onChange={e => setDurasi(e.target.value)} />
                                        </div>

                                        {/* BAGIAN TOKEN DENGAN GENERATE OTOMATIS */}
                                        <div className="col-md-3">
                                            <label className="small fw-bold text-success text-uppercase mb-2">Token Masuk</label>
                                            <div className="input-group">
                                                <input 
                                                    className="form-control border-0 bg-success bg-opacity-10 py-2 px-3 fw-bold text-success" 
                                                    style={{borderRadius: '10px 0 0 10px', letterSpacing: '2px'}} 
                                                    value={token} 
                                                    onChange={e => setToken(e.target.value.toUpperCase())} 
                                                    placeholder="TOKEN"
                                                />
                                                <button className="btn btn-success" type="button" onClick={generateToken} title="Generate Token Acak">🎲</button>
                                            </div>
                                        </div>

                                        <div className="col-12 text-end mt-4">
                                            <button className="btn btn-primary fw-bold px-5 py-2 rounded-pill shadow-sm" style={{ backgroundColor: colors.primary }} onClick={simpanInfoUjian}>SIMPAN KONFIGURASI</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- II. INPUT SOAL --- */}
                        {idUjianBaru && (
                            <div className="card shadow-sm border-0 bg-white mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
                                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center"
                                     style={{ borderLeft: `6px solid ${colors.primary}` }}>
                                    <h6 className="fw-bold m-0 text-dark text-uppercase" style={{ letterSpacing: '1px' }}>
                                        <span className="badge me-2" style={{backgroundColor: colors.primary}}>SOAL NO. {nomorAktif}</span> 
                                        {idSoalEdit ? 'MODIFIKASI BUTIR SOAL' : 'TAMBAH BUTIR SOAL BARU'}
                                    </h6>
                                    {idSoalEdit && <button className="btn btn-sm btn-link text-danger text-decoration-none fw-bold" onClick={resetFormSoal}>+ BATAL & BUAT BARU</button>}
                                </div>

                                <div className="card-body p-4 border-top">
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-8">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Unggah Gambar (Opsional)</label>
                                            <input type="file" className="form-control border-0 bg-light" onChange={handleFileChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Bobot Poin Soal</label>
                                            <input type="number" className="form-control border-0 bg-light fw-bold text-center" value={bobotSoal} onChange={e => setBobotSoal(e.target.value)} />
                                        </div>
                                    </div>

                                    {preview && (
                                        <div className="mb-4 text-center position-relative d-inline-block w-100 p-3 bg-light rounded-4 border border-dashed">
                                            <img src={preview} alt="preview" style={{ maxHeight: '200px', objectFit: 'contain' }} className="rounded shadow-sm" />
                                            <button className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 m-2" onClick={() => {setGambar(null); setPreview(null);}}>✕</button>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <label className="small fw-bold text-muted text-uppercase mb-2">Isi Pertanyaan</label>
                                        <textarea className="form-control border-0 bg-light px-3 py-3" style={{borderRadius: '12px'}} rows="4" value={pertanyaan} onChange={e => setPertanyaan(e.target.value)} placeholder="Ketikkan teks pertanyaan di sini..." />
                                    </div>

                                    <div className="mb-4 text-center p-3 bg-light rounded-4">
                                        <label className="small fw-bold text-muted text-uppercase mb-3 d-block">Pilih Tipe Evaluasi</label>
                                        <div className="btn-group w-100 shadow-sm rounded-pill overflow-hidden" style={{ maxWidth: '500px', margin: '0 auto' }}>
                                            {['pilgan', 'esai', 'matching'].map(t => (
                                                <button key={t} className={`btn py-2 fw-bold ${tipe === t ? 'btn-primary' : 'btn-white'}`}
                                                    style={{ backgroundColor: tipe === t ? colors.primary : '#fff', color: tipe === t ? '#fff' : '#555', border: 'none' }}
                                                    onClick={() => { setTipe(t); setOpsi([{ teks: '', kunci: '', is_benar: 0 }]); }}>{t.toUpperCase()}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {tipe === 'esai' ? (
                                        <div className="mb-4">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Kunci Jawaban / Referensi (Esai)</label>
                                            <textarea className="form-control border-0 bg-light px-3 py-3" style={{borderRadius: '12px', borderLeft: '4px solid #198754'}} rows="3" value={kunciEsai} onChange={e => setKunciEsai(e.target.value)} placeholder="Tuliskan kata kunci untuk mempermudah koreksi..." />
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-4 bg-light mb-4 border">
                                            <h6 className="fw-bold small text-muted mb-4 text-uppercase" style={{letterSpacing:'1px'}}>Pilihan Jawaban & Kunci:</h6>
                                            {opsi.map((o, i) => (
                                                <div key={i} className="d-flex gap-2 mb-3 align-items-center">
                                                    <input className="form-control border-0 shadow-sm py-2" placeholder={tipe === 'matching' ? "Teks Kiri" : "Isi pilihan..."} value={o.teks} onChange={e => { const n = [...opsi]; n[i].teks = e.target.value; setOpsi(n); }} />
                                                    {tipe === 'matching' && <input className="form-control border-0 shadow-sm py-2" placeholder="Teks Kanan" value={o.kunci} onChange={e => { const n = [...opsi]; n[i].kunci = e.target.value; setOpsi(n); }} />}
                                                    {tipe === 'pilgan' && (
                                                        <button className={`btn fw-bold px-4 ${o.is_benar ? 'btn-success' : 'btn-outline-secondary'}`} 
                                                            style={{borderRadius: '8px'}}
                                                            onClick={() => {
                                                                const n = opsi.map((item, idx) => ({ ...item, is_benar: idx === i ? 1 : 0 }));
                                                                setOpsi(n);
                                                            }}>{o.is_benar ? 'KUNCI' : 'SET'}</button>
                                                    )}
                                                    <button className="btn btn-outline-danger border-0" onClick={() => setOpsi(opsi.filter((_, idx) => idx !== i))}>✕</button>
                                                </div>
                                            ))}
                                            <button className="btn btn-sm fw-bold text-primary mt-2" onClick={() => setOpsi([...opsi, { teks: '', kunci: '', is_benar: 0 }])}>+ TAMBAH OPSI BARU</button>
                                        </div>
                                    )}

                                    <button className="btn w-100 fw-bold py-3 shadow-lg rounded-pill" style={{ backgroundColor: colors.primary, color: '#fff', letterSpacing: '1px' }} onClick={simpanSoal}>
                                        {idSoalEdit ? 'UPDATE BUTIR SOAL' : 'PUBLIKASIKAN SOAL'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-lg-4">
                        {idUjianBaru && editId && (
                            <div className="card shadow-sm border-0 sticky-top overflow-hidden" style={{ borderRadius: '15px', top: '20px' }}>
                                <div className="card-header bg-white py-3 border-0" style={{ borderLeft: `6px solid ${colors.secondary}` }}>
                                    <h6 className="fw-bold m-0 text-dark text-uppercase" style={{ letterSpacing: '1px' }}>Navigasi Butir Soal</h6>
                                </div>
                                <div className="card-body p-4 border-top">
                                    <div className="d-flex flex-wrap gap-3 mb-4 justify-content-center">
                                        {existingSoal.map((s, idx) => (
                                            <button key={idx} onClick={() => loadSoalEdit(s, idx)}
                                                className={`btn rounded-3 fw-bold border-2 d-flex align-items-center justify-content-center`}
                                                style={{ 
                                                    width: '50px', 
                                                    height: '50px',
                                                    backgroundColor: idSoalEdit === s.id_soal ? colors.primary : '#fff',
                                                    color: idSoalEdit === s.id_soal ? '#fff' : colors.primary,
                                                    borderColor: colors.primary
                                                }}>{idx + 1}</button>
                                        ))}
                                        <button onClick={resetFormSoal} className="btn btn-success rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>+</button>
                                    </div>
                                    
                                    <div className="p-3 rounded-4 bg-light">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="small text-muted fw-bold">Total Soal</span>
                                            <span className="fw-bold">{existingSoal.length}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="small text-muted fw-bold">Target Skor</span>
                                            <span className="fw-bold text-danger">{targetNilai}</span>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <span className="small text-muted fw-bold">Terakumulasi</span>
                                            <span className="fw-bold text-success">{existingSoal.reduce((acc, curr) => acc + (parseFloat(curr.bobot) || 0), 0)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-white border-0 text-center py-3">
                                    <button onClick={() => navigate('/daftar-ujian')} className="btn btn-outline-dark btn-sm rounded-pill px-4">Selesai & Tutup Panel</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminExam;