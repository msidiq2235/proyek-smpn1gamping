import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function Ujian() {
    const { id_ujian } = useParams();
    const navigate = useNavigate();

    // State Alur Tes
    const [step, setStep] = useState('token'); // 'token', 'petunjuk', 'pengerjaan'
    const [inputToken, setInputToken] = useState('');
    const [dataUjian, setDataUjian] = useState(null);
    
    const colors = { primary: '#023874', secondary: '#B8860B', bgLight: '#F4F1EA' };

    useEffect(() => {
        // Ambil info ujian (durasi, judul, token asli)
        axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_info_ujian&id_ujian=${id_ujian}`)
            .then(res => setDataUjian(res.data))
            .catch(err => console.error(err));
    }, [id_ujian]);

    const handleVerifikasiToken = () => {
        if (inputToken.toUpperCase() === dataUjian.token.toUpperCase()) {
            setStep('petunjuk');
        } else {
            alert("Token yang Anda masukkan salah!");
        }
    };

    // --- VIEW 1: INPUT TOKEN ---
    if (step === 'token') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-4 text-center" style={{ width: '400px', borderRadius: '20px' }}>
                    <div className="mb-4">
                        <div className="display-4 mb-2">🔐</div>
                        <h4 className="fw-bold">Konfirmasi Tes</h4>
                        <p className="text-muted small">Silahkan masukkan token untuk memulai</p>
                    </div>
                    <input 
                        type="text" 
                        className="form-control form-control-lg text-center fw-bold mb-3 border-0 bg-light" 
                        placeholder="Ketik Token..." 
                        style={{ letterSpacing: '5px', borderRadius: '12px' }}
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value)}
                    />
                    <div className="d-grid gap-2">
                        <button className="btn btn-primary fw-bold py-2 rounded-3" onClick={handleVerifikasiToken} style={{ backgroundColor: colors.primary }}>
                            VERIFIKASI TOKEN
                        </button>
                        <button className="btn btn-link text-muted btn-sm" onClick={() => navigate(-1)}>Batalkan</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: PETUNJUK PENGERJAAN ---
    if (step === 'petunjuk') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
                <div className="card border-0 shadow-lg p-5" style={{ maxWidth: '600px', borderRadius: '20px' }}>
                    <h3 className="fw-bold mb-4 border-bottom pb-2" style={{ color: colors.primary }}>📜 Petunjuk Pengerjaan</h3>
                    <div className="mb-4 text-dark" style={{ lineHeight: '1.8' }}>
                        <ol>
                            <li>Pastikan koneksi internet stabil selama pengerjaan.</li>
                            <li>Waktu pengerjaan untuk ujian ini adalah <strong>{dataUjian?.durasi} Menit</strong>.</li>
                            <li>Terdapat 3 tipe soal: Pilihan Ganda, Esai, dan Menjodohkan (Matching).</li>
                            <li>Klik tombol <strong>"Submit"</strong> di bagian bawah jika sudah selesai.</li>
                            <li>Dilarang membuka tab lain atau memuat ulang (refresh) halaman.</li>
                        </ol>
                    </div>
                    <div className="p-3 bg-warning bg-opacity-10 border border-warning rounded-3 mb-4">
                        <small className="fw-bold text-warning-emphasis">⚠️ Ujian akan otomatis terkirim jika waktu habis.</small>
                    </div>
                    <button className="btn btn-success w-100 fw-bold py-3 shadow" 
                            style={{ borderRadius: '12px', fontSize: '1.1rem' }}
                            onClick={() => setStep('pengerjaan')}>
                        SAYA MENGERTI, MULAI TES 🚀
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW 3: PENGERJAAN (KODE SOAL KAMU DISINI) ---
    return (
        <div className="container py-4">
            <h2 className="fw-bold">Sedang Mengerjakan: {dataUjian?.judul_ujian}</h2>
            {/* Tampilkan Loop Soal Kamu Disini */}
        </div>
    );
}

export default Ujian;