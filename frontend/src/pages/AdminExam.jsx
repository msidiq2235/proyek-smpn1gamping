import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    const [token, setToken] = useState('');
    const [idUjianBaru, setIdUjianBaru] = useState(editId || null);
    const [listMapel, setListMapel] = useState([]);

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
            generateToken();
        }
    }, [editId]);

    // Mengambil soal jika idUjianBaru berubah (setelah simpan konfigurasi)
    useEffect(() => {
        if (idUjianBaru) fetchExistingSoal();
    }, [idUjianBaru]);

    const generateToken = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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
                setToken(current.token || '');
            }
        } catch (err) { console.error(err); }
    };

    const fetchExistingSoal = async () => {
        if (!idUjianBaru) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_soal&id_ujian=${idUjianBaru}`);
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
            token: token.toUpperCase()
        });
        if (res.data.success) {
            if (!editId) setIdUjianBaru(res.data.id_ujian);
            alert("Konfigurasi Ujian Berhasil Disimpan!");
        }
    };

    const simpanSoal = async () => {
        // VALIDASI CRITICAL: Pastikan idUjianBaru ada
        if (!idUjianBaru) return alert("Simpan Konfigurasi Utama Terlebih Dahulu!");
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

    return (
        <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', paddingBottom: '50px', fontFamily: "'Inter', sans-serif" }}>
            
            <nav className="navbar shadow-sm py-3 mb-5" style={{ backgroundColor: colors.primary, borderBottom: `4px solid ${colors.secondary}` }}>
                <div className="container-fluid px-md-5 text-white d-flex justify-content-between">
                    <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-3">
                        <img src="logosekolah.png" alt="Logo" style={{ width: '35px' }} />
                        <span>CONSOLE MANAJEMEN UJIAN</span>
                    </span>
                    <button onClick={() => navigate('/daftar-ujian')} className="btn btn-outline-light btn-sm fw-bold px-4 rounded-pill">⬅ KELUAR</button>
                </div>
            </nav>

            <div className="container-fluid px-md-5">
                <div className="row g-4">
                    <div className={idUjianBaru ? "col-lg-8" : "col-lg-10 mx-auto"}>
                        
                        {/* I. KONFIGURASI UTAMA (Selalu Terbuka) */}
                        <div className="card shadow-sm border-0 mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
                            <div className="card-header bg-white border-0 py-3" style={{ borderLeft: `6px solid ${colors.secondary}` }}>
                                <h6 className="fw-bold m-0 text-dark text-uppercase">I. Konfigurasi Utama Ujian</h6>
                            </div>
                            <div className="card-body bg-white p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold text-muted text-uppercase mb-2">Nama Ujian</label>
                                        <input className="form-control border-0 bg-light py-2" value={judul} onChange={e => setJudul(e.target.value)} placeholder="Contoh: PH Matematika" />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold text-muted text-uppercase mb-2">Target Skor</label>
                                        <input className="form-control border-0 bg-light fw-bold" type="number" value={targetNilai} onChange={e => setTargetNilai(e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold text-muted text-uppercase mb-2">Jatah Ujian</label>
                                        <input className="form-control border-0 bg-light fw-bold" type="number" value={maxAttempt} onChange={e => setMaxAttempt(e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold text-muted text-uppercase mb-2">Mata Pelajaran</label>
                                        <div className="input-group">
                                            <select className="form-select border-0 bg-light" value={mapelId} onChange={e => setMapelId(e.target.value)}>
                                                <option value="">-- Pilih Mata Pelajaran --</option>
                                                {listMapel.map(m => <option key={m.id_exam_mapel} value={m.id_exam_mapel}>{m.nama_mapel}</option>)}
                                            </select>
                                            <button className="btn btn-dark" onClick={() => navigate('/manage-mapel-exam')}>⚙️</button>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold text-muted text-uppercase mb-2">Waktu (Menit)</label>
                                        <input className="form-control border-0 bg-light" type="number" value={durasi} onChange={e => setDurasi(e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold text-success text-uppercase mb-2">Token Masuk</label>
                                        <div className="input-group">
                                            <input className="form-control border-0 bg-success bg-opacity-10 fw-bold text-success" value={token} onChange={e => setToken(e.target.value.toUpperCase())} />
                                            <button className="btn btn-success" type="button" onClick={generateToken}>🎲</button>
                                        </div>
                                    </div>
                                    <div className="col-12 text-end mt-3">
                                        <button className="btn btn-primary fw-bold px-5 rounded-pill" style={{ backgroundColor: colors.primary }} onClick={simpanInfoUjian}>
                                            {editId || idUjianBaru ? 'UPDATE KONFIGURASI' : 'SIMPAN & LANJUT INPUT SOAL'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* II. INPUT SOAL (Hanya muncul jika ID Ujian sudah ada) */}
                        {idUjianBaru && (
                            <div className="card shadow-sm border-0 bg-white mb-4 overflow-hidden" style={{ borderRadius: '15px' }}>
                                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center" style={{ borderLeft: `6px solid ${colors.primary}` }}>
                                    <h6 className="fw-bold m-0 text-dark text-uppercase">
                                        <span className="badge me-2" style={{backgroundColor: colors.primary}}>SOAL NO. {nomorAktif}</span> 
                                        {idSoalEdit ? 'EDIT SOAL' : 'TAMBAH SOAL'}
                                    </h6>
                                    {idSoalEdit && <button className="btn btn-sm btn-link text-danger fw-bold" onClick={resetFormSoal}>+ BATAL & BARU</button>}
                                </div>
                                <div className="card-body p-4 border-top">
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-8">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Gambar</label>
                                            <input type="file" className="form-control border-0 bg-light" onChange={handleFileChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Bobot Poin</label>
                                            <input type="number" className="form-control border-0 bg-light fw-bold text-center" value={bobotSoal} onChange={e => setBobotSoal(e.target.value)} />
                                        </div>
                                    </div>

                                    {preview && (
                                        <div className="mb-4 text-center bg-light rounded-4 p-3 border border-dashed position-relative">
                                            <img src={preview} alt="preview" style={{ maxHeight: '180px' }} className="rounded shadow-sm" />
                                            <button className="btn btn-sm btn-danger rounded-circle position-absolute m-2 top-0 end-0" onClick={() => {setGambar(null); setPreview(null);}}>✕</button>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <label className="small fw-bold text-muted text-uppercase mb-2">Pertanyaan</label>
                                        <textarea className="form-control border-0 bg-light" rows="3" value={pertanyaan} onChange={e => setPertanyaan(e.target.value)} placeholder="Tulis soal di sini..." />
                                    </div>

                                    <div className="mb-4 text-center p-3 bg-light rounded-4">
                                        <div className="btn-group shadow-sm rounded-pill overflow-hidden">
                                            {['pilgan', 'esai', 'matching'].map(t => (
                                                <button key={t} className={`btn py-2 px-4 fw-bold ${tipe === t ? 'btn-primary' : 'btn-white'}`}
                                                    style={{ backgroundColor: tipe === t ? colors.primary : '#fff', color: tipe === t ? '#fff' : '#555', border: 'none' }}
                                                    onClick={() => { setTipe(t); setOpsi([{ teks: '', kunci: '', is_benar: 0 }]); }}>{t.toUpperCase()}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {tipe === 'esai' ? (
                                        <div className="mb-4">
                                            <label className="small fw-bold text-muted text-uppercase mb-2">Kunci Referensi</label>
                                            <textarea className="form-control border-0 bg-light" rows="2" value={kunciEsai} onChange={e => setKunciEsai(e.target.value)} />
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-4 bg-light mb-4 border">
                                            {opsi.map((o, i) => (
                                                <div key={i} className="d-flex gap-2 mb-2">
                                                    <input className="form-control border-0" placeholder={tipe === 'matching' ? "Kiri" : "Opsi"} value={o.teks} onChange={e => { const n = [...opsi]; n[i].teks = e.target.value; setOpsi(n); }} />
                                                    {tipe === 'matching' && <input className="form-control border-0" placeholder="Kanan" value={o.kunci} onChange={e => { const n = [...opsi]; n[i].kunci = e.target.value; setOpsi(n); }} />}
                                                    {tipe === 'pilgan' && (
                                                        <button className={`btn btn-sm ${o.is_benar ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setOpsi(opsi.map((item, idx) => ({ ...item, is_benar: idx === i ? 1 : 0 })))}>{o.is_benar ? 'KUNCI' : 'SET'}</button>
                                                    )}
                                                    <button className="btn btn-sm text-danger" onClick={() => setOpsi(opsi.filter((_, idx) => idx !== i))}>✕</button>
                                                </div>
                                            ))}
                                            <button className="btn btn-sm text-primary fw-bold" onClick={() => setOpsi([...opsi, { teks: '', kunci: '', is_benar: 0 }])}>+ Opsi</button>
                                        </div>
                                    )}

                                    <button className="btn w-100 fw-bold py-3 shadow rounded-pill text-white" style={{ backgroundColor: colors.primary }} onClick={simpanSoal}>
                                        {idSoalEdit ? 'SIMPAN PERUBAHAN SOAL' : 'PUBLIKASIKAN BUTIR SOAL'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* III. SIDEBAR NAVIGASI */}
                    {idUjianBaru && (
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0 sticky-top" style={{ borderRadius: '15px', top: '20px' }}>
                                <div className="card-header bg-white py-3" style={{ borderLeft: `6px solid ${colors.secondary}` }}>
                                    <h6 className="fw-bold m-0 text-dark">NAVIGASI SOAL</h6>
                                </div>
                                <div className="card-body p-3">
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {existingSoal.map((s, idx) => (
                                            <button key={idx} onClick={() => loadSoalEdit(s, idx)}
                                                className="btn rounded-3 fw-bold border-2"
                                                style={{ 
                                                    width: '45px', height: '45px',
                                                    backgroundColor: idSoalEdit === s.id_soal ? colors.primary : '#fff',
                                                    color: idSoalEdit === s.id_soal ? '#fff' : colors.primary,
                                                    borderColor: colors.primary
                                                }}>{idx + 1}</button>
                                        ))}
                                        <button onClick={resetFormSoal} className="btn btn-success fw-bold" style={{ width: '45px', height: '45px' }}>+</button>
                                    </div>
                                    
                                    <div className="p-3 rounded-4 bg-light small">
                                        <div className="d-flex justify-content-between mb-1"><span>Total</span><b>{existingSoal.length}</b></div>
                                        <div className="d-flex justify-content-between"><span>Poin Terkumpul</span><b className="text-success">{existingSoal.reduce((acc, curr) => acc + (parseFloat(curr.bobot) || 0), 0)} / {targetNilai}</b></div>
                                    </div>
                                </div>
                                <div className="card-footer bg-white border-0 text-center pb-3">
                                    <button onClick={() => navigate('/daftar-ujian')} className="btn btn-outline-dark btn-sm rounded-pill w-100">SELESAI</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminExam;