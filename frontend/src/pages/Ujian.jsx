import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2';

function Ujian() {
    const { id_ujian } = useParams();
    const navigate = useNavigate();

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

    // --- PERBAIKAN: Fungsi Helper Path Gambar ---
    const getBaseUploadPath = () => {
        // Membersihkan '/exam' jika ada di apiConfig agar mengarah ke root uploads
        return API_BASE_URL.replace('/exam', '') + '/uploads/exam/';
    };

    useEffect(() => {
        axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_info_ujian&id_ujian=${id_ujian}`)
            .then(res => {
                setInfoUjian(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                Swal.fire('Error', 'Gagal memuat data ujian', 'error');
            });
    }, [id_ujian]);

    useEffect(() => {
        let timer;
        if (step === 'pengerjaan' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (step === 'pengerjaan' && timeLeft === 0) {
            Swal.fire('Waktu Habis!', 'Jawaban Anda akan dikirim otomatis.', 'warning');
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
                Swal.fire('Error', 'Gagal mengambil butir soal.', 'error');
            }
        } else {
            Swal.fire('Token Salah', 'Silahkan cek kembali kode token Anda.', 'error');
        }
    };

    const handleStartTest = () => {
        setStartTime(new Date().toISOString().slice(0, 19).replace('T', ' ')); 
        setStep('pengerjaan');
    };

    const handleSubmit = async (isAuto = false) => {
        if (!isAuto) {
            const result = await Swal.fire({
                title: 'Selesai Ujian?',
                text: "Pastikan semua jawaban sudah terisi dengan benar.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: colors.primary,
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Kirim!'
            });
            if (!result.isConfirmed) return;
        }

        const payload = {
            nis: localStorage.getItem('nis'),
            id_ujian: id_ujian,
            jawaban: jawabanSiswa,
            waktu_mulai: startTime
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=submit_ujian`, payload);
            if (res.data.success) {
                Swal.fire('Berhasil', 'Jawaban Anda telah terkirim.', 'success');
                navigate('/daftar-ujian'); 
            }
        } catch (err) {
            Swal.fire('Gagal', 'Cek koneksi internet Anda.', 'error');
        }
    };

    const isAnswered = (id_soal, tipe) => {
        if (tipe === 'matching') {
            return Object.keys(jawabanSiswa).some(key => key.startsWith(`${id_soal}_`));
        }
        return jawabanSiswa[id_soal] !== undefined && jawabanSiswa[id_soal] !== '' && jawabanSiswa[id_soal] !== null;
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return <div className="text-center p-5 fw-bold">Menyiapkan...</div>;

    if (step === 'token') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-5 text-center" style={{ width: '450px', borderRadius: '20px' }}>
                    <div className="mb-3"><span style={{ fontSize: '3rem' }}>🔐</span></div>
                    <h4 className="fw-bold mb-1" style={{ color: colors.primary }}>VERIFIKASI TOKEN</h4>
                    <p className="text-muted small mb-4"><strong>{infoUjian?.judul_ujian}</strong></p>
                    <input type="text" className="form-control form-control-lg text-center fw-bold mb-4" placeholder="_ _ _ _ _" value={inputToken} onChange={(e) => setInputToken(e.target.value.toUpperCase())} style={{ letterSpacing: '5px', borderRadius: '12px', borderColor: colors.secondary }} />
                    <button className="btn w-100 fw-bold py-3" onClick={handleVerifikasiToken} style={{ backgroundColor: colors.primary, color: 'white', borderRadius: '12px' }}>BUKA AKSES</button>
                    <button className="btn btn-link btn-sm mt-2 text-muted text-decoration-none" onClick={() => navigate(-1)}>Batalkan</button>
                </div>
            </div>
        );
    }

    if (step === 'petunjuk') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-5" style={{ maxWidth: '600px', borderRadius: '20px' }}>
                    <h3 className="fw-bold mb-4 border-bottom pb-3" style={{ color: colors.primary }}>📜 Petunjuk Pengerjaan</h3>
                    <ul className="mb-4" style={{ lineHeight: '1.8' }}>
                        <li>Waktu: <strong>{infoUjian?.durasi} Menit</strong>.</li>
                        <li>Klik jawaban yang sama pada Pilihan Ganda untuk membatalkan.</li>
                        <li>Gunakan fitur navigasi kotak di kanan untuk pindah soal.</li>
                    </ul>
                    <button className="btn w-100 fw-bold py-3 shadow" onClick={handleStartTest} style={{ backgroundColor: colors.secondary, color: 'white', borderRadius: '12px' }}>MULAI SEKARANG 🚀</button>
                </div>
            </div>
        );
    }

    const soalAktif = listSoal[currentIndex];

    return (
        <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '100px', fontFamily: "'Inter', sans-serif" }}>
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
                                <div className="d-flex justify-content-between mb-4 border-bottom pb-3 text-uppercase small fw-bold text-muted">
                                    <span>Nomor {currentIndex + 1} dari {listSoal.length}</span>
                                    <label style={{ cursor: 'pointer', color: flaggedSoal[soalAktif.id_soal] ? colors.secondary : '#888' }}>
                                        <input type="checkbox" className="me-1" checked={!!flaggedSoal[soalAktif.id_soal]} onChange={() => setFlaggedSoal({...flaggedSoal, [soalAktif.id_soal]: !flaggedSoal[soalAktif.id_soal]})} /> Ragu-ragu
                                    </label>
                                </div>
                                
                                {/* --- PERBAIKAN: BLOK GAMBAR SOAL --- */}
                                {soalAktif.gambar && (
                                    <div className="mb-4 text-center bg-light p-3 rounded-4 border">
                                        <img 
                                            src={`${getBaseUploadPath()}${soalAktif.gambar}`} 
                                            alt="Bahan Soal" 
                                            className="img-fluid rounded shadow-sm"
                                            style={{ maxHeight: '350px', objectFit: 'contain' }}
                                            onError={(e) => e.target.style.display = 'none'} 
                                        />
                                    </div>
                                )}
                                
                                <h5 className="fw-bold mb-4" style={{ lineHeight: '1.6' }}>{soalAktif.pertanyaan}</h5>
                                
                                <div className="d-flex flex-column gap-3">
                                    {soalAktif.tipe_soal === 'pilgan' && soalAktif.opsi.map(o => {
                                        const isSel = jawabanSiswa[soalAktif.id_soal] === o.id_opsi;
                                        return (
                                            <button key={o.id_opsi} className={`btn w-100 text-start py-3 px-4 rounded-4 fw-bold border-2 transition-all ${isSel ? 'shadow' : ''}`}
                                                onClick={() => setJawabanSiswa({...jawabanSiswa, [soalAktif.id_soal]: isSel ? '' : o.id_opsi})}
                                                style={{ backgroundColor: isSel ? colors.primary : '#fff', color: isSel ? '#fff' : '#444', borderColor: isSel ? colors.primary : '#eee' }}>
                                                {isSel ? '🔵 ' : '⚪ '} {o.teks_opsi}
                                            </button>
                                        );
                                    })}

                                    {soalAktif.tipe_soal === 'esai' && (
                                        <textarea className="form-control border-2 p-3 shadow-none" rows="6" placeholder="Ketik jawaban..." 
                                            value={jawabanSiswa[soalAktif.id_soal] || ''} 
                                            onChange={(e) => setJawabanSiswa({...jawabanSiswa, [soalAktif.id_soal]: e.target.value})}
                                            style={{ borderRadius: '15px' }} />
                                    )}

                                    {soalAktif.tipe_soal === 'matching' && (
                                        <div className="bg-light p-3 rounded-4 border">
                                            {soalAktif.opsi.map((o) => {
                                                const key = `${soalAktif.id_soal}_${o.id_opsi}`;
                                                return (
                                                    <div key={o.id_opsi} className="row mb-3 align-items-center bg-white p-3 rounded-3 mx-0 border shadow-sm">
                                                        <div className="col-md-6 fw-bold small">{o.teks_opsi}</div>
                                                        <div className="col-md-6">
                                                            <select className="form-select border-2 shadow-none" value={jawabanSiswa[key] || ''} onChange={(e) => setJawabanSiswa({...jawabanSiswa, [key]: e.target.value})} style={{ borderRadius: '10px' }}>
                                                                <option value="">-- Pilih --</option>
                                                                {soalAktif.opsi.map((opt, i) => <option key={i} value={opt.kunci_matching}>{opt.kunci_matching}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                                    <button className="btn fw-bold px-4 rounded-pill border-2" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)} style={{ color: colors.primary, borderColor: colors.primary }}>Soal Sebelumnya</button>
                                    <button className="btn fw-bold px-4 rounded-pill shadow-sm" style={{ backgroundColor: colors.primary, color: '#fff' }} onClick={() => currentIndex < listSoal.length - 1 ? setCurrentIndex(currentIndex + 1) : handleSubmit(false)}>
                                        {currentIndex === listSoal.length - 1 ? 'Selesai' : 'Selanjutnya'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm sticky-top" style={{ borderRadius: '20px', top: '100px' }}>
                            <div className="card-header border-0 py-3 text-center" style={{ backgroundColor: colors.primary, color: '#fff', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                                <h6 className="fw-bold m-0 small">NAVIGASI SOAL</h6>
                            </div>
                            <div className="card-body p-4 text-center">
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    {listSoal.map((s, idx) => {
                                        const terjawab = isAnswered(s.id_soal, s.tipe_soal);
                                        const isFlag = flaggedSoal[s.id_soal];
                                        const isAktif = currentIndex === idx;
                                        
                                        let bg = '#fff', text = '#444', bdr = '#eee';
                                        if (isAktif) { bg = colors.textDark; text = '#fff'; bdr = colors.textDark; }
                                        else if (isFlag) { bg = colors.secondary; text = '#fff'; bdr = colors.secondary; }
                                        else if (terjawab) { bg = colors.primary; text = '#fff'; bdr = colors.primary; }

                                        return (
                                            <button key={s.id_soal} onClick={() => setCurrentIndex(idx)} className="btn shadow-sm" style={{ width: '45px', height: '45px', borderRadius: '10px', border: `2px solid ${bdr}`, backgroundColor: bg, color: text, fontWeight: 'bold' }}>{idx + 1}</button>
                                        );
                                    })}
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