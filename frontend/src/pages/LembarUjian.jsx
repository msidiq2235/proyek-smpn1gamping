import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function LembarUjian({ idUjian = 1 }) { // Contoh ID Ujian = 1
    const [soal, setSoal] = useState([]);
    const [indexSoal, setIndexSoal] = useState(0);
    const [jawaban, setJawaban] = useState({});
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(3600); // Contoh 60 Menit (dalam detik)

    useEffect(() => {
        fetchSoal();
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
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

    const handlePilihJawaban = (idSoal, isiJawaban) => {
        setJawaban({ ...jawaban, [idSoal]: isiJawaban });
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return <div className="text-center p-5">Menyiapkan soal...</div>;

    const soalAktif = soal[indexSoal];

    return (
        <div className="container mt-4" style={{ maxWidth: '800px' }}>
            <div className="card shadow-sm">
                {/* Header & Timer */}
                <div className="card-header bg-dark text-white d-flex justify-content-between">
                    <span>Soal Nomor {indexSoal + 1} dari {soal.length}</span>
                    <span className="fw-bold">Sisa Waktu: {formatTime(timeLeft)}</span>
                </div>

                <div className="card-body">
                    {/* Pertanyaan */}
                    <h5 className="mb-4">{soalAktif?.pertanyaan}</h5>

                    {/* Tipe Pilihan Ganda */}
                    {soalAktif?.tipe_soal === 'pilgan' && (
                        <div className="d-flex flex-column gap-2">
                            {soalAktif.opsi.map((o) => (
                                <button 
                                    key={o.id_opsi}
                                    onClick={() => handlePilihJawaban(soalAktif.id_soal, o.id_opsi)}
                                    className={`btn text-start ${jawaban[soalAktif.id_soal] === o.id_opsi ? 'btn-primary' : 'btn-outline-secondary'}`}
                                >
                                    {o.teks_opsi}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Tipe Esai */}
                    {soalAktif?.tipe_soal === 'esai' && (
                        <textarea 
                            className="form-control" 
                            rows="4" 
                            placeholder="Tulis jawaban kamu di sini..."
                            onChange={(e) => handlePilihJawaban(soalAktif.id_soal, e.target.value)}
                            value={jawaban[soalAktif.id_soal] || ''}
                        />
                    )}

                    {/* Tipe Matching (Dropdown Sederhana) */}
                    {soalAktif?.tipe_soal === 'matching' && (
                        <div className="list-group">
                            {soalAktif.opsi.map((o) => (
                                <div key={o.id_opsi} className="list-group-item d-flex justify-content-between align-items-center">
                                    <span>{o.teks_opsi}</span>
                                    <select 
                                        className="form-select w-50"
                                        onChange={(e) => handlePilihJawaban(`${soalAktif.id_soal}_${o.id_opsi}`, e.target.value)}
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

                {/* Navigasi */}
                <div className="card-footer d-flex justify-content-between">
                    <button 
                        disabled={indexSoal === 0} 
                        onClick={() => setIndexSoal(indexSoal - 1)}
                        className="btn btn-secondary"
                    >Sebelumnya</button>

                    {indexSoal === soal.length - 1 ? (
                        <button className="btn btn-success fw-bold" onClick={() => alert("Submit Jawaban!")}>Selesai Ujian</button>
                    ) : (
                        <button 
                            onClick={() => setIndexSoal(indexSoal + 1)}
                            className="btn btn-primary"
                        >Selanjutnya</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LembarUjian;