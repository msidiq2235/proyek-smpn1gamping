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
    
    // --- STATE NAVIGASI & FLAG ---
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flaggedSoal, setFlaggedSoal] = useState({}); 

    // Palette Warna SMPN 1 Gamping
    const colors = { 
        primary: '#023874',   // Biru Navy
        secondary: '#B8860B', // Emas Tua
        bgLight: '#F4F1EA',   // Krem Putih
        textDark: '#1A1A1A'   // Hitam
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

    // --- TIMER LOGIC ---
    useEffect(() => {
        let timer;
        if (step === 'pengerjaan' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
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
            alert("❌ Token yang Anda masukkan salah!");
        }
    };

    const handleStartTest = () => {
        setStartTime(new Date().toISOString().slice(0, 19).replace('T', ' ')); 
        setStep('pengerjaan');
    };

    const handleSubmit = async (isAuto = false) => {
        if (!isAuto && !window.confirm("Yakin ingin mengakhiri ujian dan kirim jawaban? Pastikan semua soal telah terjawab dan tidak ada yang di-flag!")) return;

        const payload = {
            nis: localStorage.getItem('nis'),
            id_ujian: id_ujian,
            jawaban: jawabanSiswa,
            waktu_mulai: startTime
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=submit_ujian`, payload);
            if (res.data.success) {
                // 🚀 PERUBAHAN: Notifikasi sukses tanpa menampilkan nilai akhir
                alert("Ujian Selesai! Jawaban Anda berhasil dikirim.");
                navigate('/beranda'); 
            }
        } catch (err) {
            alert("Gagal mengirim jawaban. Cek koneksi internet Anda.");
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const isAnswered = (id_soal) => {
        const ans = jawabanSiswa[id_soal];
        if (ans === undefined || ans === null) return false;
        if (typeof ans === 'string' && ans.trim() === '') return false; 
        return true;
    };

    const toggleFlag = (id_soal) => {
        setFlaggedSoal(prev => ({
            ...prev,
            [id_soal]: !prev[id_soal]
        }));
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100 fw-bold" style={{ color: colors.primary, backgroundColor: colors.bgLight }}>Menyiapkan Lembar Ujian...</div>;

    // --- 1. VIEW TOKEN ---
    if (step === 'token') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-5 text-center" style={{ width: '450px', borderRadius: '20px' }}>
                    <div className="mb-3">
                        <span style={{ fontSize: '3rem' }}>🔐</span>
                    </div>
                    <h4 className="fw-bold mb-1" style={{ color: colors.primary }}>VERIFIKASI TOKEN</h4>
                    <p className="text-muted small mb-4">Ujian: <strong>{infoUjian?.judul_ujian}</strong></p>
                    
                    <input 
                        type="text" 
                        className="form-control form-control-lg text-center fw-bold mb-4 border-2 shadow-sm" 
                        placeholder="MASUKKAN KODE TOKEN" 
                        style={{ letterSpacing: '5px', borderRadius: '12px', borderColor: colors.secondary, color: colors.primary }}
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                    />
                    
                    <button className="btn w-100 fw-bold py-3 shadow-sm mb-2" onClick={handleVerifikasiToken} style={{ backgroundColor: colors.primary, color: 'white', borderRadius: '12px' }}>
                        AKSES SOAL UJIAN
                    </button>
                    <button className="btn btn-link btn-sm mt-2 text-muted text-decoration-none fw-bold" onClick={() => navigate(-1)}>Batalkan</button>
                </div>
            </div>
        );
    }

    // --- 2. VIEW PETUNJUK ---
    if (step === 'petunjuk') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-5" style={{ maxWidth: '650px', borderRadius: '20px' }}>
                    <h3 className="fw-bold mb-4 border-bottom pb-3" style={{ color: colors.primary }}>📜 Petunjuk Pengerjaan</h3>
                    <div className="mb-4 text-dark" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                        <ul className="list-unstyled">
                            <li className="mb-2">⏱ Waktu pengerjaan: <strong>{infoUjian?.durasi} Menit</strong>.</li>
                            <li className="mb-2">📝 Terdapat <strong>{listSoal.length} soal</strong> evaluasi.</li>
                            <li className="mb-2">🔴 Gunakan fitur <strong>Flag Question</strong> jika Anda belum yakin dengan jawaban.</li>
                            <li className="mb-2">🚫 Dilarang me-refresh (F5) halaman saat ujian berlangsung.</li>
                            <li className="mb-2">🔒 Sistem akan mengunci jawaban otomatis jika waktu habis.</li>
                        </ul>
                    </div>
                    <button className="btn w-100 fw-bold py-3 shadow" onClick={handleStartTest} style={{ backgroundColor: colors.secondary, color: colors.primary, borderRadius: '12px', fontSize: '1.1rem' }}>
                        MULAI KERJAKAN SEKARANG 🚀
                    </button>
                </div>
            </div>
        );
    }

    // --- 3. VIEW PENGERJAAN ---
    const soalAktif = listSoal[currentIndex];

    return (
        <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '100px' }}>
            
            {/* HEADER NAVBAR PENGERJAAN */}
            <div className="sticky-top shadow-sm py-3 mb-4" style={{ backgroundColor: colors.primary, borderBottom: `4px solid ${colors.secondary}` }}>
                <div className="container d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold m-0 text-white d-none d-md-block" style={{ letterSpacing: '0.5px' }}>{infoUjian?.judul_ujian}</h5>
                    
                    {/* TIMER */}
                    <div className={`badge rounded-pill px-4 py-2 fw-bold shadow-sm ${timeLeft < 300 ? 'bg-danger text-white animate__animated animate__pulse animate__infinite' : 'bg-white'}`} style={{ fontSize: '1.1rem', color: timeLeft < 300 ? '#fff' : colors.primary, border: timeLeft < 300 ? 'none' : `2px solid ${colors.secondary}` }}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                    
                    <button className="btn btn-sm fw-bold rounded-pill px-4 shadow-sm" onClick={() => handleSubmit(false)} style={{ backgroundColor: colors.secondary, color: '#fff', fontSize: '0.9rem' }}>
                        SELESAI 🏁
                    </button>
                </div>
            </div>

            <div className="container py-2">
                <div className="row g-4">
                    {/* AREA KIRI: TAMPILAN 1 SOAL */}
                    <div className="col-lg-8">
                        {soalAktif && (
                            <div className="card border-0 shadow-sm p-4 p-md-5 h-100" style={{ borderRadius: '20px' }}>
                                
                                {/* HEADER SOAL: NOMOR, FLAG QUESTION, & BOBOT */}
                                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-2">
                                    <span className="badge rounded-pill py-2 px-3 fw-bold" style={{ backgroundColor: colors.primary, fontSize: '1rem' }}>
                                        Soal {currentIndex + 1} dari {listSoal.length}
                                    </span>
                                    
                                    <div className="d-flex align-items-center gap-3">
                                        <label className="d-flex align-items-center gap-2 m-0" style={{ cursor: 'pointer' }}>
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input m-0 shadow-none" 
                                                checked={!!flaggedSoal[soalAktif.id_soal]}
                                                onChange={() => toggleFlag(soalAktif.id_soal)}
                                                style={{ cursor: 'pointer', border: '2px solid #dc3545', width: '1.2rem', height: '1.2rem' }}
                                            />
                                            <span className="fw-bold" style={{ color: '#dc3545', fontSize: '0.95rem' }}>
                                                Flag Question
                                            </span>
                                        </label>

                                        <span className="badge rounded-pill py-2 px-3 fw-bold" style={{ backgroundColor: '#e9ecef', color: colors.textDark, fontSize: '0.9rem' }}>
                                            Bobot: {soalAktif.bobot} Poin
                                        </span>
                                    </div>
                                </div>
                                
                                <p className="fw-bold text-dark mb-4" style={{ fontSize: '1.25rem', lineHeight: '1.7' }}>
                                    {soalAktif.pertanyaan}
                                </p>
                                
                                {soalAktif.gambar && (
                                    <div className="text-center mb-4">
                                        <img src={`${API_BASE_URL.replace('/exam', '')}/uploads/exam/${soalAktif.gambar}`} 
                                        className="img-fluid rounded shadow-sm border p-1" style={{ maxHeight: '350px', objectFit: 'contain' }} alt="Soal" />
                                    </div>
                                )}

                                {/* OPSI JAWABAN */}
                                <div className="mt-2 d-flex flex-column gap-3">
                                    {soalAktif.tipe_soal === 'esai' ? (
                                        <div>
                                            <textarea 
                                                className="form-control bg-light border-2 p-3 fw-medium" 
                                                rows="6" 
                                                placeholder="Ketik jawaban esai Anda di sini..."
                                                value={jawabanSiswa[soalAktif.id_soal] || ''}
                                                onChange={(e) => setJawabanSiswa({...jawabanSiswa, [soalAktif.id_soal]: e.target.value})}
                                                style={{ borderRadius: '15px', borderColor: '#ccc', fontSize: '1.1rem' }}
                                                onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                onBlur={(e) => e.target.style.borderColor = '#ccc'}
                                            ></textarea>
                                        </div>
                                    ) : (
                                        soalAktif.opsi?.map(o => {
                                            const isSelected = jawabanSiswa[soalAktif.id_soal] === o.id_opsi;
                                            return (
                                                <button 
                                                    key={o.id_opsi} 
                                                    className={`btn w-100 text-start py-3 px-4 rounded-4 fw-bold border-2 transition-all ${isSelected ? 'shadow' : 'bg-light text-dark'}`}
                                                    onClick={() => setJawabanSiswa({...jawabanSiswa, [soalAktif.id_soal]: o.id_opsi})}
                                                    style={{
                                                        backgroundColor: isSelected ? colors.primary : '#f8f9fa',
                                                        color: isSelected ? '#fff' : colors.textDark,
                                                        borderColor: isSelected ? colors.primary : '#dee2e6',
                                                        fontSize: '1.05rem'
                                                    }}
                                                >
                                                    {o.teks_opsi}
                                                </button>
                                            )
                                        })
                                    )}
                                </div>

                                {/* TOMBOL NAVIGASI BAWAH (SEBELUMNYA & SELANJUTNYA) */}
                                <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top flex-wrap gap-3">
                                    <button 
                                        className="btn fw-bold px-4 rounded-pill border-2" 
                                        disabled={currentIndex === 0} 
                                        onClick={() => setCurrentIndex(currentIndex - 1)}
                                        style={{ color: colors.primary, borderColor: colors.primary, backgroundColor: 'transparent' }}
                                    >
                                        ⬅ Sebelumnya
                                    </button>

                                    {currentIndex === listSoal.length - 1 ? (
                                        <button className="btn fw-bold px-4 rounded-pill shadow-sm" onClick={() => handleSubmit(false)} style={{ backgroundColor: '#198754', color: '#fff' }}>
                                            Selesai Ujian 🏁
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn fw-bold px-4 rounded-pill shadow-sm" 
                                            style={{ backgroundColor: colors.primary, color: '#fff' }} 
                                            onClick={() => setCurrentIndex(currentIndex + 1)}
                                        >
                                            Selanjutnya ➡
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AREA KANAN: NAVIGASI NOMOR SOAL */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm sticky-top" style={{ borderRadius: '20px', top: '100px' }}>
                            <div className="card-header border-0 py-3 text-center" style={{ backgroundColor: colors.primary, borderTopLeftRadius: '20px', borderTopRightRadius: '20px', borderBottom: `3px solid ${colors.secondary}` }}>
                                <h6 className="fw-bold m-0 text-white" style={{ letterSpacing: '1px' }}>NAVIGASI SOAL</h6>
                            </div>
                            <div className="card-body p-4">
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    {listSoal.map((s, idx) => {
                                        const terjawab = isAnswered(s.id_soal);
                                        const isFlagged = flaggedSoal[s.id_soal];
                                        const aktif = currentIndex === idx;
                                        
                                        // LOGIKA WARNA KOTAK NAVIGASI
                                        let btnStyle = {
                                            width: '60px', 
                                            height: '60px', 
                                            borderRadius: '12px',
                                            borderWidth: '2px', 
                                            borderStyle: 'solid',
                                            transition: 'all 0.2s',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 0
                                        };

                                        if (aktif) {
                                            btnStyle.backgroundColor = colors.textDark;
                                            btnStyle.borderColor = colors.textDark;
                                            btnStyle.color = '#fff';
                                            btnStyle.transform = 'scale(1.05)';
                                            btnStyle.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                        } else if (isFlagged) {
                                            btnStyle.backgroundColor = colors.secondary;
                                            btnStyle.borderColor = colors.secondary;
                                            btnStyle.color = '#fff';
                                        } else if (terjawab) {
                                            btnStyle.backgroundColor = colors.primary;
                                            btnStyle.borderColor = colors.primary;
                                            btnStyle.color = '#fff';
                                        } else {
                                            btnStyle.backgroundColor = '#fff';
                                            btnStyle.borderColor = '#ced4da';
                                            btnStyle.color = '#495057';
                                        }

                                        return (
                                            <button 
                                                key={s.id_soal} 
                                                onClick={() => setCurrentIndex(idx)}
                                                className="btn"
                                                style={btnStyle}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                {/* Legenda Warna */}
                                <div className="mt-4 pt-3 border-top small d-flex flex-column gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: '15px', height: '15px', backgroundColor: '#fff', border: '2px solid #6c757d', borderRadius: '3px' }}></div>
                                        <span className="text-muted">Belum Dijawab</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: '15px', height: '15px', backgroundColor: colors.primary, borderRadius: '3px' }}></div>
                                        <span className="text-muted">Sudah Dijawab</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: '15px', height: '15px', backgroundColor: colors.secondary, borderRadius: '3px' }}></div>
                                        <span className="text-muted">Ragu-ragu (Ditandai)</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: '15px', height: '15px', backgroundColor: colors.textDark, borderRadius: '3px' }}></div>
                                        <span className="text-muted">Sedang Dilihat</span>
                                    </div>
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