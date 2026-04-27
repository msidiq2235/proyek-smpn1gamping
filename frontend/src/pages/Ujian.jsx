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
    const [startTime, setStartTime] = useState(null); // Untuk database

    const colors = { primary: '#023874', secondary: '#B8860B', bgLight: '#F4F1EA' };

    useEffect(() => {
        // Ambil info dasar (Judul, Durasi, Token Asli)
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
            handleSubmit(true); // Kirim paksa
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const handleVerifikasiToken = async () => {
        if (!infoUjian) return;
        if (inputToken.toUpperCase() === infoUjian.token.toUpperCase()) {
            try {
                // Tarik soal HANYA JIKA token benar (Security)
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
        setStartTime(new Date().toISOString().slice(0, 19).replace('T', ' ')); // Format YYYY-MM-DD HH:MM:SS
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
                alert("Ujian Selesai! Nilai Anda: " + res.data.nilai);
                navigate('/daftar-ujian');
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

    if (loading) return <div className="text-center p-5 fw-bold">Menyiapkan Lembar Ujian...</div>;

    // --- 1. VIEW TOKEN ---
    if (step === 'token') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-4 text-center" style={{ width: '400px', borderRadius: '20px' }}>
                    <div className="display-4 mb-2">🔐</div>
                    <h4 className="fw-bold">Token Masuk</h4>
                    <p className="text-muted small">Ujian: <strong>{infoUjian?.judul_ujian}</strong></p>
                    <input 
                        type="text" 
                        className="form-control form-control-lg text-center fw-bold mb-3 border-0 bg-light shadow-sm" 
                        placeholder="MASUKKAN KODE" 
                        style={{ letterSpacing: '5px', borderRadius: '12px', color: colors.primary }}
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                    />
                    <button className="btn btn-primary w-100 fw-bold py-3 rounded-pill shadow" onClick={handleVerifikasiToken} style={{ backgroundColor: colors.primary }}>
                        VERIFIKASI AKSES
                    </button>
                    <button className="btn btn-link btn-sm mt-2 text-muted text-decoration-none" onClick={() => navigate(-1)}>Batalkan</button>
                </div>
            </div>
        );
    }

    // --- 2. VIEW PETUNJUK ---
    if (step === 'petunjuk') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-5" style={{ maxWidth: '600px', borderRadius: '25px' }}>
                    <h3 className="fw-bold mb-4 border-bottom pb-2" style={{ color: colors.primary }}>📜 Petunjuk Pengerjaan</h3>
                    <div className="mb-4 text-dark" style={{ lineHeight: '1.8' }}>
                        <ol>
                            <li>Waktu pengerjaan: <strong>{infoUjian?.durasi} Menit</strong>.</li>
                            <li>Terdapat <strong>{listSoal.length} soal</strong> evaluasi.</li>
                            <li>Dilarang me-refresh (F5) halaman saat ujian berlangsung.</li>
                            <li>Sistem akan mengunci jawaban secara otomatis jika waktu habis.</li>
                        </ol>
                    </div>
                    <button className="btn btn-success w-100 fw-bold py-3 shadow rounded-pill" onClick={handleStartTest}>
                        MULAI KERJAKAN SEKARANG 🚀
                    </button>
                </div>
            </div>
        );
    }

    // --- 3. VIEW PENGERJAAN ---
    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Navigasi Atas Sticky */}
            <div className="sticky-top bg-white shadow-sm border-bottom py-3">
                <div className="container d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold m-0 text-dark">{infoUjian?.judul_ujian}</h6>
                    <div className={`badge rounded-pill px-4 py-2 fw-bold shadow-sm ${timeLeft < 300 ? 'bg-danger' : 'bg-dark'}`} style={{ fontSize: '1rem' }}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="container py-4" style={{ maxWidth: '800px' }}>
                {listSoal.map((s, idx) => (
                    <div key={s.id_soal} className="card border-0 shadow-sm mb-4 p-4" style={{ borderRadius: '20px' }}>
                        <div className="d-flex gap-2 mb-3">
                            <span className="badge bg-primary rounded-pill h-100 py-2 px-3">{idx + 1}</span>
                            <p className="fw-bold m-0" style={{ fontSize: '1.1rem' }}>{s.pertanyaan}</p>
                        </div>
                        
                        {s.gambar && (
                             <img src={`${API_BASE_URL.replace('/exam', '')}/uploads/exam/${s.gambar}`} 
                             className="img-fluid rounded mb-3 border w-100" style={{ maxHeight: '350px', objectFit: 'contain' }} alt="Soal" />
                        )}

                        <div className="mt-2 d-flex flex-column gap-2">
                            {s.opsi?.map(o => (
                                <button 
                                    key={o.id_opsi} 
                                    className={`btn w-100 text-start py-3 px-4 rounded-4 fw-bold border-2 transition-all ${jawabanSiswa[s.id_soal] === o.id_opsi ? 'btn-primary border-primary shadow-sm' : 'btn-outline-secondary border-light bg-white'}`}
                                    onClick={() => setJawabanSiswa({...jawabanSiswa, [s.id_soal]: o.id_opsi})}
                                >
                                    <span className="me-2">{jawabanSiswa[s.id_soal] === o.id_opsi ? '🔵' : '⚪'}</span>
                                    {o.teks_opsi}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="fixed-bottom bg-white border-top p-3 shadow-lg">
                    <div className="container" style={{ maxWidth: '800px' }}>
                        <button className="btn btn-success w-100 py-3 fw-bold rounded-pill shadow" onClick={() => handleSubmit(false)}>
                            FINISH & SUBMIT JAWABAN 🏁
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Ujian;