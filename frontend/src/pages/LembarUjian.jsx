import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2'; // --- 1. Import Swal ---

function LembarUjian({ idUjian = 1 }) { 
    const [soal, setSoal] = useState([]);
    const [indexSoal, setIndexSoal] = useState(0);
    const [jawaban, setJawaban] = useState({});
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(3600); 

    const colors = {
        primary: '#023874',
        secondary: '#B8860B'
    };

    useEffect(() => {
        fetchSoal();
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit(); // Jalankan auto submit kalau waktu habis
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchSoal = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/get_soal.php?id_ujian=${idUjian}`);
            setSoal(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Gagal ambil soal", err);
        }
    };

    // Fungsi Submit Jawaban
    const handleSubmit = async () => {
        const result = await Swal.fire({
            title: 'Selesai Ujian?',
            text: "Pastikan semua soal sudah terjawab dengan benar sebelum mengirim.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: colors.primary,
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Selesai!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            prosesSubmit();
        }
    };

    // Fungsi Auto Submit saat waktu habis
    const handleAutoSubmit = () => {
        Swal.fire({
            title: 'Waktu Habis!',
            text: 'Waktu pengerjaan telah berakhir. Jawaban Anda akan dikirim otomatis.',
            icon: 'warning',
            confirmButtonColor: colors.primary,
            allowOutsideClick: false
        }).then(() => {
            prosesSubmit();
        });
    };

    const prosesSubmit = async () => {
        Swal.fire({
            title: 'Mengirim Jawaban...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            // Simulasi kirim data ke server
            // await axios.post(`${API_BASE_URL}/exam/submit_jawaban.php`, { idUjian, jawaban });
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Jawaban Anda telah tersimpan di sistem.',
                confirmButtonColor: colors.primary
            }).then(() => {
                // navigate('/daftar-ujian'); // Contoh redirect
            });
        } catch (err) {
            Swal.fire('Gagal!', 'Terjadi kendala koneksi saat mengirim.', 'error');
        }
    };

    const handlePilihJawaban = (idSoal, isiJawaban) => {
        setJawaban({ ...jawaban, [idSoal]: isiJawaban });
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return (
        <div className="text-center p-5 fw-bold" style={{ color: colors.primary }}>
            Menyiapkan Butir Soal...
        </div>
    );

    const soalAktif = soal[indexSoal];

    return (
        <div className="container mt-4" style={{ maxWidth: '800px', fontFamily: "'Inter', sans-serif" }}>
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                {/* Header & Timer */}
                <div className="card-header text-white d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: colors.primary }}>
                    <span className="fw-bold">Soal {indexSoal + 1} / {soal.length}</span>
                    <div className="badge bg-white text-dark px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '0.9rem' }}>
                        ⏱ Sisa Waktu: {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="card-body p-4 p-md-5">
                    {/* Pertanyaan */}
                    <h5 className="fw-bold mb-4" style={{ lineHeight: '1.6' }}>{soalAktif?.pertanyaan}</h5>

                    {/* Tipe Pilihan Ganda */}
                    {soalAktif?.tipe_soal === 'pilgan' && (
                        <div className="d-flex flex-column gap-3">
                            {soalAktif.opsi.map((o) => (
                                <button 
                                    key={o.id_opsi}
                                    onClick={() => handlePilihJawaban(soalAktif.id_soal, o.id_opsi)}
                                    className={`btn text-start p-3 fw-bold border-2 transition-all ${jawaban[soalAktif.id_soal] === o.id_opsi ? 'border-primary bg-primary text-white shadow' : 'btn-outline-light text-dark border-light-subtle'}`}
                                    style={{ borderRadius: '12px' }}
                                >
                                    <span className="me-2">{jawaban[soalAktif.id_soal] === o.id_opsi ? '🔵' : '⚪'}</span> {o.teks_opsi}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Tipe Esai */}
                    {soalAktif?.tipe_soal === 'esai' && (
                        <textarea 
                            className="form-control border-2 p-3" 
                            rows="5" 
                            placeholder="Tulis jawaban lengkap Anda di sini..."
                            onChange={(e) => handlePilihJawaban(soalAktif.id_soal, e.target.value)}
                            value={jawaban[soalAktif.id_soal] || ''}
                            style={{ borderRadius: '12px' }}
                        />
                    )}

                    {/* Tipe Matching */}
                    {soalAktif?.tipe_soal === 'matching' && (
                        <div className="list-group gap-2">
                            {soalAktif.opsi.map((o) => (
                                <div key={o.id_opsi} className="list-group-item d-flex justify-content-between align-items-center border-2 py-3" style={{ borderRadius: '12px' }}>
                                    <span className="fw-bold">{o.teks_opsi}</span>
                                    <select 
                                        className="form-select w-50 fw-bold border-primary"
                                        onChange={(e) => handlePilihJawaban(`${soalAktif.id_soal}_${o.id_opsi}`, e.target.value)}
                                        value={jawaban[`${soalAktif.id_soal}_${o.id_opsi}`] || ''}
                                    >
                                        <option value="">Pilih Pasangan...</option>
                                        {soalAktif.opsi.map((item, i) => (
                                            <option key={i} value={item.kunci_matching}>{item.kunci_matching}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigasi Tombol Bawah */}
                <div className="card-footer bg-white d-flex justify-content-between py-3 px-4 border-top">
                    <button 
                        disabled={indexSoal === 0} 
                        onClick={() => setIndexSoal(indexSoal - 1)}
                        className="btn btn-light fw-bold px-4 rounded-pill border"
                    >⬅ Sebelumnya</button>

                    {indexSoal === soal.length - 1 ? (
                        <button className="btn btn-success fw-bold px-4 rounded-pill shadow" onClick={handleSubmit}>
                            SELESAI & KIRIM 🏁
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIndexSoal(indexSoal + 1)}
                            className="btn btn-primary fw-bold px-4 rounded-pill shadow"
                            style={{ backgroundColor: colors.primary }}
                        >Selanjutnya ➡</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LembarUjian;