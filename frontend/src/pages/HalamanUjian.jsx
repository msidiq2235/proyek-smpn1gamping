import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function HalamanUjian() {
    const { id_ujian } = useParams();
    const navigate = useNavigate();
    
    const [soal, setSoal] = useState([]);
    const [indexAktif, setIndexAktif] = useState(0); 
    const [jawaban, setJawaban] = useState({}); 
    const [loading, setLoading] = useState(true);

    // Fungsi untuk mendapatkan URL dasar file (membersihkan path exam)
    const getBaseUploadPath = () => {
        // Jika API_BASE_URL: http://localhost/proyek/portal-api/exam
        // Hasilnya: http://localhost/proyek/portal-api/uploads/exam/
        return API_BASE_URL.replace('/exam', '') + '/uploads/exam/';
    };

    useEffect(() => {
        fetchSoal();
    }, [id_ujian]);

    const fetchSoal = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_soal&id_ujian=${id_ujian}`);
            setSoal(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePilihJawaban = (idSoal, nilai) => {
        setJawaban({ ...jawaban, [idSoal]: nilai });
    };

    const handlePilihMatching = (idSoal, idOpsi, nilai) => {
        const key = `${idSoal}_${idOpsi}`;
        setJawaban({ ...jawaban, [key]: nilai });
    };

    const handleSubmit = async () => {
    const nis = localStorage.getItem('nis');
    if (!nis) return alert("Sesi login berakhir, silakan login ulang.");
    
    // Validasi apakah sudah menjawab (opsional)
    if (!window.confirm("Apakah Anda yakin ingin mengumpulkan semua jawaban?")) return;

    try {
        const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=submit_ujian`, {
            nis, 
            id_ujian, 
            jawaban
        });

        // Debugging: Cek apa yang dikirim balik oleh PHP
        console.log("Respon Server:", res.data);

        if (res.data && res.data.success) {
            alert("Jawaban berhasil dikirim! Terima kasih.");
            navigate('/daftar-ujian');
        } else {
            // Jika res.data.error tidak ada (undefined), tampilkan pesan default
            const pesanError = res.data?.error || "Terjadi kegagalan sistem di server (database reject).";
            alert("Gagal mengirim: " + pesanError);
        }
    } catch (err) {
        console.error("Detail Error:", err);
        // Menangkap error jika PHP crash (500) atau tidak bisa dihubungi
        const serverMsg = err.response?.data || err.message;
        alert("Koneksi Server Gagal: " + (typeof serverMsg === 'object' ? JSON.stringify(serverMsg) : serverMsg));
    }
};

    if (loading) return <div className="text-center p-5 fw-bold">Memuat bank soal...</div>;
    if (soal.length === 0) return <div className="text-center p-5 text-muted">Ujian belum memiliki soal.</div>;

    const s = soal[indexAktif]; 

    return (
        <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
            <div className="row">
                
                {/* --- KIRI: AREA KERJA SOAL --- */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 p-4 mb-4 bg-white" style={{ borderRadius: '15px', minHeight: '500px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <h5 className="fw-bold m-0 text-dark">PERTANYAAN NO. {indexAktif + 1}</h5>
                            <span className="badge bg-secondary px-3 py-2 text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                                {s.tipe_soal}
                            </span>
                        </div>

                        {/* --- BAGIAN GAMBAR SOAL --- */}
                        {s.gambar && (
                            <div className="mb-4 text-center">
                                <img 
                                    src={`${getBaseUploadPath()}${s.gambar}`} 
                                    alt="Bahan Soal" 
                                    className="img-fluid rounded shadow-sm border"
                                    style={{ maxHeight: '350px', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        console.error("Gambar tidak ditemukan di folder uploads/exam/");
                                    }}
                                />
                            </div>
                        )}

                        <div className="fs-5 mb-5 text-dark" style={{ lineHeight: '1.8', fontWeight: '500' }}>
                            {s.pertanyaan}
                        </div>

                        {/* --- RENDER JAWABAN BERDASARKAN TIPE --- */}
                        <div className="options-area">
                            
                            {/* 1. PILIHAN GANDA */}
                            {s.tipe_soal === 'pilgan' && s.opsi.map((o, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => handlePilihJawaban(s.id_soal, o.id_opsi)}
                                    className={`card mb-3 p-3 border-2 transition-all ${jawaban[s.id_soal] === o.id_opsi ? 'border-primary bg-primary text-white shadow' : 'bg-white text-dark hover-shadow'}`}
                                    style={{ cursor: 'pointer', borderRadius: '12px' }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className={`fw-bold me-3 rounded-circle border d-flex justify-content-center align-items-center ${jawaban[s.id_soal] === o.id_opsi ? 'bg-white text-primary' : 'bg-light text-dark'}`} style={{ width: '35px', height: '35px' }}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <span className="fs-6">{o.teks_opsi}</span>
                                    </div>
                                </div>
                            ))}

                            {/* 2. ESAI */}
                            {s.tipe_soal === 'esai' && (
                                <textarea 
                                    className="form-control border-2 p-3" 
                                    rows="8" 
                                    placeholder="Ketikkan jawaban esai Anda di sini secara lengkap..."
                                    value={jawaban[s.id_soal] || ''}
                                    onChange={(e) => handlePilihJawaban(s.id_soal, e.target.value)}
                                    style={{ borderRadius: '15px' }}
                                />
                            )}

                            {/* 3. MATCHMAKING (DROP DOWN MODE) */}
                            {s.tipe_soal === 'matching' && (
                                <div className="bg-light p-3 rounded-4 border">
                                    {s.opsi.map((o, i) => (
                                        <div key={i} className="row mb-3 align-items-center bg-white p-3 rounded-3 mx-0 shadow-sm border">
                                            <div className="col-md-7 fw-bold text-dark border-end">
                                                {i + 1}. {o.teks_opsi}
                                            </div>
                                            <div className="col-md-5">
                                                <select 
                                                    className="form-select border-2"
                                                    value={jawaban[`${s.id_soal}_${o.id_opsi}`] || ''}
                                                    onChange={(e) => handlePilihMatching(s.id_soal, o.id_opsi, e.target.value)}
                                                    style={{ borderRadius: '8px' }}
                                                >
                                                    <option value="">-- Pilih Jawaban --</option>
                                                    {s.opsi.map((kunci, idx) => (
                                                        <option key={idx} value={kunci.kunci_matching}>
                                                            {kunci.kunci_matching}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- NAVIGASI FOOTER --- */}
                        <div className="d-flex justify-content-between mt-auto pt-5 border-top mt-4">
                            <button 
                                className="btn btn-outline-secondary px-4 fw-bold" 
                                disabled={indexAktif === 0}
                                onClick={() => setIndexAktif(indexAktif - 1)}
                            >
                                PREVIOUS
                            </button>
                            
                            {indexAktif === soal.length - 1 ? (
                                <button className="btn btn-danger px-5 fw-bold shadow" onClick={handleSubmit}>FINISH & SUBMIT</button>
                            ) : (
                                <button className="btn btn-dark px-5 fw-bold" onClick={() => setIndexAktif(indexAktif + 1)}>
                                    NEXT QUESTION
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- KANAN: SIDEBAR NAVIGASI --- */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 sticky-top bg-white p-2" style={{ borderRadius: '15px', top: '20px' }}>
                        <div className="card-body">
                            <h6 className="fw-bold text-muted mb-4 small text-uppercase" style={{ letterSpacing: '1px' }}>
                                Navigasi Soal
                            </h6>
                            <div className="d-flex flex-wrap gap-2 mb-4 justify-content-start">
                                {soal.map((item, idx) => {
                                    const isDijawab = item.tipe_soal === 'matching' 
                                        ? Object.keys(jawaban).some(key => key.startsWith(`${item.id_soal}_`) && jawaban[key] !== "")
                                        : (jawaban[item.id_soal] && jawaban[item.id_soal] !== "");

                                    return (
                                        <button 
                                            key={idx}
                                            onClick={() => setIndexAktif(idx)}
                                            className={`btn rounded-3 fw-bold d-flex align-items-center justify-content-center transition-all ${
                                                indexAktif === idx 
                                                ? 'btn-primary shadow border-2' 
                                                : (isDijawab ? 'btn-success text-white' : 'btn-outline-secondary opacity-75')
                                            }`}
                                            style={{ width: '50px', height: '50px', fontSize: '16px' }}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="border-top pt-3 text-center">
                                <button 
                                    className="btn btn-outline-danger w-100 fw-bold py-3" 
                                    onClick={handleSubmit}
                                    style={{ borderRadius: '12px', fontSize: '14px' }}
                                >
                                    AKHIRI UJIAN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default HalamanUjian;