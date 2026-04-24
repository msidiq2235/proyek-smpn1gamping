import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function AdminExam() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('edit');

    // --- STATE INFO UJIAN ---
    const [judul, setJudul] = useState('');
    const [mapelId, setMapelId] = useState('');
    const [durasi, setDurasi] = useState(60);
    const [targetNilai, setTargetNilai] = useState(100);
    const [maxAttempt, setMaxAttempt] = useState(1); 
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
        }
    }, [editId]);

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
        if (!judul || !mapelId) return alert("Lengkapi data utama ujian!");
        const action = editId ? 'update_ujian' : 'tambah_ujian';
        const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=${action}`, {
            id_ujian: editId || idUjianBaru, 
            judul_ujian: judul, 
            id_mapel: mapelId, 
            durasi: durasi, 
            total_bobot: targetNilai,
            max_attempt: maxAttempt 
        });
        if (res.data.success) {
            if (!editId) setIdUjianBaru(res.data.id_ujian);
            alert("Informasi Ujian Berhasil Disimpan!");
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
                alert("Soal Berhasil Disimpan!");
                resetFormSoal();
                fetchExistingSoal();
            }
        } catch (err) { alert("Error saat menyimpan soal."); }
    };

    return (
        <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0 text-dark">{editId ? '🛠️ Kelola Butir Soal' : '✨ Buat Ujian Baru'}</h3>
                <button onClick={() => navigate('/daftar-ujian')} className="btn btn-outline-danger btn-sm fw-bold px-3">Keluar</button>
            </div>

            <div className="row">
                <div className={editId ? "col-lg-8" : "col-12 mx-auto"} style={{ maxWidth: editId ? '' : '800px' }}>
                    
                    {/* --- I. INFO UJIAN --- */}
                    <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '15px' }}>
                        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center" 
                             style={{ cursor: 'pointer' }} onClick={() => setShowInfoUjian(!showInfoUjian)}>
                            <h6 className="fw-bold m-0 text-primary text-uppercase">I. Data Utama Ujian</h6>
                            <span className="text-muted small">{showInfoUjian ? '▲ Tutup' : '▼ Edit Info'}</span>
                        </div>
                        {showInfoUjian && (
                            <div className="card-body border-top bg-light">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">NAMA UJIAN</label>
                                        <input className="form-control" value={judul} onChange={e => setJudul(e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold text-danger">SKOR MAKS</label>
                                        <input className="form-control fw-bold border-danger" type="number" value={targetNilai} onChange={e => setTargetNilai(e.target.value)} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="small fw-bold text-primary">JATAH PERCOBAAN</label>
                                        <input className="form-control fw-bold border-primary" type="number" value={maxAttempt} onChange={e => setMaxAttempt(e.target.value)} />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="small fw-bold">MATA PELAJARAN</label>
                                        <div className="input-group">
                                            <select className="form-select" value={mapelId} onChange={e => setMapelId(e.target.value)}>
                                                <option value="">-- Pilih --</option>
                                                {listMapel.map(m => <option key={m.id_exam_mapel} value={m.id_exam_mapel}>{m.nama_mapel}</option>)}
                                            </select>
                                            <button className="btn btn-outline-primary" onClick={() => navigate('/manage-mapel-exam')}>⚙️</button>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">DURASI (MENIT)</label>
                                        <input className="form-control" type="number" value={durasi} onChange={e => setDurasi(e.target.value)} />
                                    </div>

                                    <div className="col-12 text-end">
                                        <button className="btn btn-primary fw-bold px-4 shadow-sm" onClick={simpanInfoUjian}>Simpan Info</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- II. INPUT SOAL --- */}
                    {idUjianBaru && (
                        <div className="card p-4 shadow-sm border-0 bg-white mb-4" style={{ borderRadius: '15px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                <h5 className="fw-bold m-0"><span className="badge bg-success me-2">{nomorAktif}</span> {idSoalEdit ? 'Edit Soal' : 'Soal Baru'}</h5>
                                {idSoalEdit && <button className="btn btn-sm btn-link text-danger text-decoration-none fw-bold" onClick={resetFormSoal}>+ Batal & Baru</button>}
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-md-8">
                                    <label className="small fw-bold text-muted">GAMBAR (OPSIONAL):</label>
                                    <input type="file" className="form-control" onChange={handleFileChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="small fw-bold text-primary">BOBOT POIN:</label>
                                    <input type="number" className="form-control border-primary fw-bold" value={bobotSoal} onChange={e => setBobotSoal(e.target.value)} />
                                </div>
                            </div>

                            {preview && (
                                <div className="mb-3 position-relative d-inline-block border rounded p-1 bg-light text-center w-100">
                                    <img src={preview} alt="preview" style={{ maxHeight: '150px' }} className="rounded" />
                                    <button className="btn btn-sm btn-danger position-absolute top-0 end-0" onClick={() => {setGambar(null); setPreview(null);}}>✕</button>
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="small fw-bold text-muted">PERTANYAAN:</label>
                                <textarea className="form-control" rows="4" value={pertanyaan} onChange={e => setPertanyaan(e.target.value)} />
                            </div>

                            <div className="mb-3">
                                <label className="small fw-bold text-muted mb-2">TIPE:</label>
                                <div className="d-flex gap-2">
                                    {['pilgan', 'esai', 'matching'].map(t => (
                                        <button key={t} className={`btn btn-sm flex-grow-1 py-2 fw-bold ${tipe === t ? 'btn-dark' : 'btn-outline-dark'}`}
                                            onClick={() => { setTipe(t); setOpsi([{ teks: '', kunci: '', is_benar: 0 }]); }}>{t.toUpperCase()}</button>
                                    ))}
                                </div>
                            </div>

                            {tipe === 'esai' ? (
                                <div className="mb-4">
                                    <label className="small fw-bold text-success">KUNCI REFERENSI:</label>
                                    <textarea className="form-control border-success bg-light" rows="3" value={kunciEsai} onChange={e => setKunciEsai(e.target.value)} placeholder="Tuliskan kata kunci/jawaban..." />
                                </div>
                            ) : (
                                <div className="p-3 rounded-4 bg-light border mb-4">
                                    <h6 className="fw-bold small text-muted mb-3">OPSI JAWABAN:</h6>
                                    {opsi.map((o, i) => (
                                        <div key={i} className="d-flex gap-2 mb-2">
                                            <input className="form-control" placeholder={tipe === 'matching' ? "Kiri" : "Pilihan"} value={o.teks} onChange={e => { const n = [...opsi]; n[i].teks = e.target.value; setOpsi(n); }} />
                                            {tipe === 'matching' && <input className="form-control" placeholder="Kanan" value={o.kunci} onChange={e => { const n = [...opsi]; n[i].kunci = e.target.value; setOpsi(n); }} />}
                                            {tipe === 'pilgan' && (
                                                <button className={`btn btn-sm px-3 ${o.is_benar ? 'btn-success' : 'btn-outline-secondary'}`} 
                                                    onClick={() => {
                                                        const n = [...opsi];
                                                        n[i].is_benar = n[i].is_benar === 1 ? 0 : 1;
                                                        setOpsi(n);
                                                    }}>{o.is_benar ? 'KUNCI' : 'SET'}</button>
                                            )}
                                            <button className="btn btn-sm text-danger" onClick={() => setOpsi(opsi.filter((_, idx) => idx !== i))}>✕</button>
                                        </div>
                                    ))}
                                    <button className="btn btn-sm btn-link text-dark fw-bold text-decoration-none" onClick={() => setOpsi([...opsi, { teks: '', kunci: '', is_benar: 0 }])}>+ Tambah Baris</button>
                                </div>
                            )}

                            <button className="btn btn-success w-100 fw-bold py-3 shadow-sm" onClick={simpanSoal}>SIMPAN SOAL</button>
                        </div>
                    )}
                </div>

                {/* --- III. NAVIGASI --- */}
                {idUjianBaru && editId && (
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 sticky-top" style={{ borderRadius: '15px', top: '20px' }}>
                            <div className="card-body p-4">
                                <h6 className="fw-bold text-muted mb-3">NAVIGASI SOAL</h6>
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {existingSoal.map((s, idx) => (
                                        <button key={idx} onClick={() => loadSoalEdit(s, idx)}
                                            className={`btn rounded-3 fw-bold border-2 ${idSoalEdit === s.id_soal ? 'btn-primary shadow' : 'btn-outline-primary'}`}
                                            style={{ width: '45px', height: '45px' }}>{idx + 1}</button>
                                    ))}
                                    <button onClick={resetFormSoal} className="btn btn-success rounded-3 fw-bold shadow-sm" style={{ width: '45px', height: '45px' }}>+</button>
                                </div>
                                <div className="bg-light p-3 rounded-3 small text-muted">
                                    <div>Total Soal: {existingSoal.length}</div>
                                    <div>Akumulasi Bobot: {existingSoal.reduce((acc, curr) => acc + (parseFloat(curr.bobot) || 0), 0)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminExam;