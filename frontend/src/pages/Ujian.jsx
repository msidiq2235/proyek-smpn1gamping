import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function Ujian() {
    const { id_ujian } = useParams();
    const navigate = useNavigate();

    // --- STATE ALUR & DATA ---
    const [step, setStep] = useState('token'); // 'token', 'petunjuk', 'pengerjaan'
    const [inputToken, setInputToken] = useState('');
    const [infoUjian, setInfoUjian] = useState(null);
    const [listSoal, setListSoal] = useState([]);
    const [jawabanSiswa, setJawabanSiswa] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState(0); 

    const colors = { primary: '#023874', secondary: '#B8860B', bgLight: '#F4F1EA' };

    useEffect(() => {
        // 1. Ambil Info Ujian (untuk verifikasi token & durasi)
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

    // Timer Logic
    useEffect(() => {
        if (step === 'pengerjaan' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (step === 'pengerjaan' && timeLeft === 0) {
            handleSubmit(); // Auto submit jika waktu habis
        }
    }, [step, timeLeft]);

    const handleVerifikasiToken = () => {
        if (!infoUjian) return;
        if (inputToken.toUpperCase() === infoUjian.token.toUpperCase()) {
            // Jika benar, ambil soalnya sekarang (Lazy Load untuk keamanan)
            fetchSoal();
        } else {
            alert("❌ Token yang Anda masukkan salah!");
        }
    };

    const fetchSoal = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_soal&id_ujian=${id_ujian}`);
            setListSoal(res.data);
            setTimeLeft(parseInt(infoUjian.durasi) * 60); // Set timer dalam detik
            setStep('petunjuk');
        } catch (err) {
            alert("Gagal memuat butir soal");
        }
    };

    const handleSubmit = async () => {
        if (window.confirm("Apakah Anda yakin ingin mengakhiri ujian ini?")) {
            // Logic Kirim Jawaban ke Backend
            const payload = {
                nis: localStorage.getItem('nis'),
                id_ujian: id_ujian,
                jawaban: jawabanSiswa,
                waktu_mulai: new Date().toISOString() // Bisa disesuaikan
            };
            
            try {
                const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=submit_ujian`, payload);
                if (res.data.success) {
                    alert("Ujian Berhasil Dikirim! Skor Anda: " + res.data.nilai);
                    navigate('/daftar-ujian');
                }
            } catch (err) {
                alert("Gagal mengirim jawaban.");
            }
        }
    };

    if (loading) return <div className="text-center p-5">Menyiapkan Lembar Ujian...</div>;

    // --- VIEW 1: INPUT TOKEN ---
    if (step === 'token') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-4 text-center" style={{ width: '400px', borderRadius: '20px' }}>
                    <div className="mb-4">
                        <div className="display-4 mb-2">🔐</div>
                        <h4 className="fw-bold">Gerbang Evaluasi</h4>
                        <p className="text-muted small">Masukkan token untuk paket: <br/><strong>{infoUjian?.judul_ujian}</strong></p>
                    </div>
                    <input 
                        type="text" 
                        className="form-control form-control-lg text-center fw-bold mb-3 border-0 bg-light" 
                        placeholder="TOKEN" 
                        style={{ letterSpacing: '5px', borderRadius: '12px', color: colors.primary }}
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                    />
                    <div className="d-grid gap-2">
                        <button className="btn btn-primary fw-bold py-3 rounded-pill" onClick={handleVerifikasiToken} style={{ backgroundColor: colors.primary }}>
                            BUKA AKSES SOAL
                        </button>
                        <button className="btn btn-link text-muted btn-sm text-decoration-none" onClick={() => navigate(-1)}>Kembali ke Daftar</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: PETUNJUK PENGERJAAN ---
    if (step === 'petunjuk') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-5" style={{ maxWidth: '650px', borderRadius: '25px' }}>
                    <h3 className="fw-bold mb-4 border-bottom pb-3" style={{ color: colors.primary }}>📜 Petunjuk Ujian</h3>
                    <div className="mb-4 text-dark" style={{ lineHeight: '2' }}>
                        <ul className="list-unstyled">
                            <li>✅ Durasi pengerjaan: <strong>{infoUjian?.durasi} Menit</strong>.</li>
                            <li>✅ Total soal yang harus dikerjakan: <strong>{listSoal.length} Butir</strong>.</li>
                            <li>✅ Jawaban tersimpan otomatis saat Anda memilih opsi.</li>
                            <li>❌ Dilarang keras menekan tombol Back atau Refresh.</li>
                            <li>❌ Jangan menutup jendela browser sebelum menekan Submit.</li>
                        </ul>
                    </div>
                    <div className="p-3 bg-warning bg-opacity-10 border border-warning rounded-4 mb-4">
                        <small className="fw-bold text-warning-emphasis">⚠️ Perhatian: Sistem akan menutup ujian secara otomatis saat waktu habis.</small>
                    </div>
                    <button className="btn btn-success w-100 fw-bold py-3 shadow-lg rounded-pill" 
                            style={{ fontSize: '1.1rem' }}
                            onClick={() => setStep('pengerjaan')}>
                        SAYA MENGERTI & SIAP MULAI 🚀
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW 3: PENGERJAAN ---
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header Status */}
            <div className="sticky-top bg-white shadow-sm border-bottom py-2">
                <div className="container d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="fw-bold m-0">{infoUjian?.judul_ujian}</h6>
                        <small className="text-muted">Jumlah Soal: {listSoal.length}</small>
                    </div>
                    <div className={`px-4 py-2 rounded-pill fw-bold ${timeLeft < 300 ? 'bg-danger text-white' : 'bg-dark text-white'}`}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="container py-4" style={{ maxWidth: '800px' }}>
                {listSoal.map((s, idx) => (
                    <div key={s.id_soal} className="card border-0 shadow-sm mb-4 p-4" style={{ borderRadius: '15px' }}>
                        <div className="d-flex gap-3 mb-3">
                            <span className="badge bg-primary h-100 py-2 px-3 rounded-3">{idx + 1}</span>
                            <p className="fw-bold m-0" style={{ fontSize: '1.1rem' }}>{s.pertanyaan}</p>
                        </div>
                        
                        {/* Jika ada gambar */}
                        {s.gambar && (
                            <img src={`${API_BASE_URL.replace('/exam', '')}/uploads/exam/${s.gambar}`} 
                                 className="img-fluid rounded mb-3 border" style={{ maxHeight: '300px', objectFit: 'contain' }} alt="Soal" />
                        )}

                        {/* Rendering Opsi (Hanya contoh pilgan) */}
                        <div className="mt-2">
                            {s.opsi && s.opsi.map(o => (
                                <div key={o.id_opsi} className="form-check p-0 mb-2">
                                    <input 
                                        type="radio" 
                                        className="btn-check" 
                                        name={`soal_${s.id_soal}`} 
                                        id={`opt_${o.id_opsi}`} 
                                        onChange={() => setJawabanSiswa({...jawabanSiswa, [s.id_soal]: o.id_opsi})}
                                    />
                                    <label className="btn btn-outline-primary w-100 text-start py-2 px-3 border-2 rounded-3" htmlFor={`opt_${o.id_opsi}`}>
                                        {o.teks_opsi}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button className="btn btn-success w-100 fw-bold py-3 rounded-pill shadow-lg mb-5" onClick={handleSubmit}>
                    SELESAI & KIRIM JAWABAN 🏁
                </button>
            </div>
        </div>
    );
}

export default Ujian;