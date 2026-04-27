import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function Ujian() {
    const { id_ujian } = useParams();
    const navigate = useNavigate();

    // --- STATE UTAMA ---
    const [step, setStep] = useState('token'); 
    const [inputToken, setInputToken] = useState('');
    const [infoUjian, setInfoUjian] = useState(null);
    const [listSoal, setListSoal] = useState([]);
    const [jawabanSiswa, setJawabanSiswa] = useState({});
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0); 
    const [startTime, setStartTime] = useState(null); 
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flaggedSoal, setFlaggedSoal] = useState({}); 

    const colors = { 
        primary: '#023874', secondary: '#B8860B', bgLight: '#F4F1EA', textDark: '#1A1A1A' 
    };

    useEffect(() => {
        axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_info_ujian&id_ujian=${id_ujian}`)
            .then(res => {
                setInfoUjian(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                alert("Gagal memuat data ujian");
            });
    }, [id_ujian]);

    useEffect(() => {
        let timer;
        if (step === 'pengerjaan' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (step === 'pengerjaan' && timeLeft === 0) {
            alert("Waktu habis! Jawaban Anda akan dikirim otomatis.");
            handleSubmit(true); 
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const handleVerifikasiToken = async () => {
        if (!infoUjian) return;
        if (inputToken.toUpperCase() === infoUjian.token.toUpperCase()) {
            try {
                const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_soal&id_ujian=${id_ujian}`);
                setListSoal(res.data);
                setTimeLeft(parseInt(infoUjian.durasi) * 60);
                setStep('petunjuk'); 
            } catch (err) {
                alert("Gagal mengambil butir soal.");
            }
        } else {
            alert("❌ Token salah!");
        }
    };

    const handleStartTest = () => {
        setStartTime(new Date().toISOString().slice(0, 19).replace('T', ' ')); 
        setStep('pengerjaan');
    };

    const handleSubmit = async (isAuto = false) => {
        if (!isAuto && !window.confirm("Yakin ingin mengakhiri ujian dan kirim jawaban?")) return;

        const payload = {
            nis: localStorage.getItem('nis'),
            id_ujian: id_ujian,
            jawaban: jawabanSiswa,
            waktu_mulai: startTime
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=submit_ujian`, payload);
            if (res.data.success) {
                alert("Ujian Selesai! Jawaban Anda berhasil dikirim.");
                navigate('/daftar-ujian'); 
            }
        } catch (err) {
            alert("Gagal mengirim jawaban. Cek koneksi Anda.");
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const isAnswered = (id_soal, tipe) => {
        if (tipe === 'matching') {
            return Object.keys(jawabanSiswa).some(key => key.startsWith(`${id_soal}_`));
        }
        const ans = jawabanSiswa[id_soal];
        return ans !== undefined && ans !== null && ans !== '';
    };

    const toggleFlag = (id_soal) => {
        setFlaggedSoal(prev => ({ ...prev, [id_soal]: !prev[id_soal] }));
    };

    // Fungsi klik Pilgan (Undo Only, Tanpa Auto-Next)
    const handleSelectPilgan = (idSoal, idOpsi) => {
        if (jawabanSiswa[idSoal] === idOpsi) {
            const copy = { ...jawabanSiswa };
            delete copy[idSoal];
            setJawabanSiswa(copy);
        } else {
            setJawabanSiswa({ ...jawabanSiswa, [idSoal]: idOpsi });
        }
    };

    if (loading) return <div className="text-center p-5 fw-bold">Menyiapkan Lembar Ujian...</div>;

    if (step === 'token') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-5 text-center" style={{ width: '450px', borderRadius: '20px' }}>
                    <div className="mb-3"><span style={{ fontSize: '3rem' }}>🔐</span></div>
                    <h4 className="fw-bold mb-1" style={{ color: colors.primary }}>VERIFIKASI TOKEN</h4>
                    <p className="text-muted small mb-4"><strong>{infoUjian?.judul_ujian}</strong></p>
                    <input type="text" className="form-control form-control-lg text-center fw-bold mb-4 border-2 shadow-sm" placeholder="_ _ _ _ _" value={inputToken} onChange={(e) => setInputToken(e.target.value.toUpperCase())} style={{ letterSpacing: '5px', borderRadius: '12px', borderColor: colors.secondary }} />
                    <button className="btn w-100 fw-bold py-3 shadow-sm mb-2" onClick={handleVerifikasiToken} style={{ backgroundColor: colors.primary, color: 'white', borderRadius: '12px' }}>AKSES SOAL</button>
                    <button className="btn btn-link btn-sm mt-2 text-muted text-decoration-none fw-bold" onClick={() => navigate(-1)}>Batal</button>
                </div>
            </div>
        );
    }

    if (step === 'petunjuk') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-5" style={{ maxWidth: '650px', borderRadius: '20px' }}>
                    <h3 className="fw-bold mb-4 border-bottom pb-3" style={{ color: colors.primary }}>📜 Petunjuk Pengerjaan</h3>
                    <div className="mb-4 text-dark" style={{ lineHeight: '1.8' }}>
                        <ul>
                            <li>Waktu pengerjaan: <strong>{infoUjian?.durasi} Menit</strong>.</li>
                            <li>Total soal: <strong>{listSoal.length} butir</strong>.</li>
                            <li>Klik jawaban yang sama pada pilihan ganda untuk <b>membatalkan (undo)</b> jawaban.</li>
                            <li>Gunakan fitur <b>Flag</b> (bendera) jika masih ragu-ragu.</li>
                        </ul>
                    </div>
                    <button className="btn w-100 fw-bold py-3 shadow" onClick={handleStartTest} style={{ backgroundColor: colors.secondary, color: 'white', borderRadius: '12px', fontSize: '1.1rem' }}>MULAI SEKARANG 🚀</button>
                </div>
            </div>
        );
    }

    const soalAktif = listSoal[currentIndex];

    return (
        <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '100px' }}>
            <div className="sticky-top shadow-sm py-3 mb-4" style={{ backgroundColor: colors.primary, borderBottom: `4px solid ${colors.secondary}` }}>
                <div className="container d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold m-0 text-white d-none d-md-block">{infoUjian?.judul_ujian}</h5>
                    <div className={`badge rounded-pill px-4 py-2 fw-bold shadow-sm ${timeLeft < 300 ? 'bg-danger text-white' : 'bg-white'}`} style={{ fontSize: '1.1rem', color: timeLeft < 300 ? '#fff' : colors.primary }}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                    <button className="btn btn-sm fw-bold rounded-pill px-4" onClick={() => handleSubmit(false)} style={{ backgroundColor: colors.secondary, color: '#fff' }}>SELESAI</button>
                </div>
            </div>

            <div className="container py-2">
                <div className="row g-4">
                    <div className="col-lg-8">
                        {soalAktif && (
                            <div className="card border-0 shadow-sm p-4 p-md-5 h-100" style={{ borderRadius: '20px' }}>
                                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                    <span className="badge rounded-pill py-2 px-3 fw-bold" style={{ backgroundColor: colors.primary }}>Soal {currentIndex + 1} / {listSoal.length}</span>
                                    <label className="d-flex align-items-center gap-2 m-0" style={{ cursor: 'pointer', color: '#dc3545' }}>
                                        <input type="checkbox" className="form-check-input m-0" checked={!!flaggedSoal[soalAktif.id_soal]} onChange={() => toggleFlag(soalAktif.id_soal)} />
                                        <b>Ragu-ragu (Flag)</b>
                                    </label>
                                </div>
                                
                                <p className="fw-bold text-dark mb-4" style={{ fontSize: '1.2rem' }}>{soalAktif.pertanyaan}</p>
                                {soalAktif.gambar && <div className="text-center mb-4"><img src={`${API_BASE_URL.replace('/exam', '')}/uploads/exam/${soalAktif.gambar}`} className="img-fluid rounded border shadow-sm" style={{ maxHeight: '300px' }} alt="Soal" /></div>}

                                <div className="mt-2 d-flex flex-column gap-3">
                                    {soalAktif.tipe_soal === 'esai' && (
                                        <textarea className="form-control bg-light border-2 p-3" rows="5" placeholder="Jawaban esai..." value={jawabanSiswa[soalAktif.id_soal] || ''} onChange={(e) => setJawabanSiswa({...jawabanSiswa, [soalAktif.id_soal]: e.target.value})} style={{ borderRadius: '15px' }} />
                                    )}

                                    {soalAktif.tipe_soal === 'matching' && (
                                        <div className="bg-light p-4 rounded-4 border">
                                            {soalAktif.opsi?.map((o, idx) => {
                                                const key = `${soalAktif.id_soal}_${o.id_opsi}`;
                                                return (
                                                    <div key={idx} className="row align-items-center mb-3 g-2">
                                                        <div className="col-md-6"><div className="p-3 bg-white border rounded shadow-sm fw-bold small">{o.teks_opsi}</div></div>
                                                        <div className="col-md-1 text-center d-none d-md-block">➡</div>
                                                        <div className="col-md-5">
                                                            <select className="form-select border-2 py-2 fw-bold" style={{ borderRadius: '12px', borderColor: jawabanSiswa[key] ? colors.primary : '#dee2e6' }} value={jawabanSiswa[key] || ''} onChange={(e) => setJawabanSiswa({...jawabanSiswa, [key]: e.target.value})}>
                                                                <option value="">-- Pilih Opsi --</option>
                                                                {soalAktif.opsi.map((opt, i) => <option key={i} value={opt.kunci_matching}>{opt.kunci_matching}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {soalAktif.tipe_soal === 'pilgan' && soalAktif.opsi?.map(o => {
                                        const isSel = jawabanSiswa[soalAktif.id_soal] === o.id_opsi;
                                        return (
                                            <button key={o.id_opsi} className={`btn w-100 text-start py-3 px-4 rounded-4 fw-bold border-2 transition-all ${isSel ? 'shadow' : ''}`} onClick={() => handleSelectPilgan(soalAktif.id_soal, o.id_opsi)} style={{ backgroundColor: isSel ? colors.primary : '#f8f9fa', color: isSel ? '#fff' : colors.textDark, borderColor: isSel ? colors.primary : '#dee2e6' }}>
                                                <span className="me-2">{isSel ? '🔵' : '⚪'}</span> {o.teks_opsi}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                                    <button className="btn fw-bold px-4 rounded-pill border-2" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)} style={{ color: colors.primary, borderColor: colors.primary }}>Soal Sebelumnya</button>
                                    <button className="btn fw-bold px-4 rounded-pill shadow-sm" style={{ backgroundColor: colors.primary, color: '#fff' }} onClick={() => currentIndex < listSoal.length - 1 ? setCurrentIndex(currentIndex + 1) : handleSubmit(false)}>
                                        {currentIndex === listSoal.length - 1 ? 'Selesai' : 'Selanjutnya ➡'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm sticky-top" style={{ borderRadius: '20px', top: '100px' }}>
                            <div className="card-header border-0 py-3 text-center" style={{ backgroundColor: colors.primary, color: '#fff', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                                <h6 className="fw-bold m-0">NAVIGASI SOAL</h6>
                            </div>
                            <div className="card-body p-4 text-center">
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    {listSoal.map((s, idx) => {
                                        const terjawab = isAnswered(s.id_soal, s.tipe_soal);
                                        const isFlag = flaggedSoal[s.id_soal];
                                        const isAktif = currentIndex === idx;
                                        
                                        let bg = '#fff', text = colors.textDark, bdr = '#ced4da';
                                        if (isAktif) { bg = colors.textDark; text = '#fff'; bdr = colors.textDark; }
                                        else if (isFlag) { bg = colors.secondary; text = '#fff'; bdr = colors.secondary; }
                                        else if (terjawab) { bg = colors.primary; text = '#fff'; bdr = colors.primary; }

                                        return (
                                            <button key={s.id_soal} onClick={() => setCurrentIndex(idx)} className="btn shadow-sm" style={{ width: '48px', height: '48px', borderRadius: '12px', border: `2px solid ${bdr}`, backgroundColor: bg, color: text, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</button>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 pt-3 border-top small text-start">
                                    <div className="d-flex align-items-center gap-2 mb-1"><div style={{ width: '12px', height: '12px', backgroundColor: colors.primary, borderRadius: '3px' }}></div> Terjawab</div>
                                    <div className="d-flex align-items-center gap-2 mb-1"><div style={{ width: '12px', height: '12px', backgroundColor: colors.secondary, borderRadius: '3px' }}></div> Ragu-ragu</div>
                                    <div className="d-flex align-items-center gap-2"><div style={{ width: '12px', height: '12px', backgroundColor: colors.textDark, borderRadius: '3px' }}></div> Sedang Dilihat</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Ujian;