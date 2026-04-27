import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2'; // --- 1. Import Swal ---

function HalamanUjian() {
    const { id_ujian } = useParams();
    const navigate = useNavigate();
    
    const [soal, setSoal] = useState([]);
    const [indexAktif, setIndexAktif] = useState(0); 
    const [jawaban, setJawaban] = useState({}); 
    const [loading, setLoading] = useState(true);

    const colors = {
        primary: '#023874',
        secondary: '#B8860B'
    };

    // Fungsi path gambar
    const getBaseUploadPath = () => {
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
        if (!nis) {
            return Swal.fire('Sesi Berakhir', 'Silakan login ulang untuk melanjutkan.', 'error');
        }
        
        // 2. Gunakan Swal Confirm daripada window.confirm
        const confirmResult = await Swal.fire({
            title: 'Selesai Ujian?',
            text: "Seluruh jawaban akan dikirim dan tidak bisa diubah lagi.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: colors.primary,
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Kirim Sekarang!',
            cancelButtonText: 'Batal'
        });

        if (!confirmResult.isConfirmed) return;

        // Tampilkan loading saat kirim
        Swal.fire({
            title: 'Mengirim Jawaban...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=submit_ujian`, {
                nis, 
                id_ujian, 
                jawaban
            });

            if (res.data && res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Jawaban Anda telah tersimpan. Terima kasih.',
                    confirmButtonColor: colors.primary
                }).then(() => {
                    navigate('/daftar-ujian');
                });
            } else {
                Swal.fire('Gagal Simpan', res.data?.error || "Terjadi kesalahan di server.", 'error');
            }
        } catch (err) {
            Swal.fire('Server Error', 'Koneksi gagal atau database bermasalah.', 'error');
        }
    };

    if (loading) return <div className="text-center p-5 fw-bold" style={{color: colors.primary}}>Menyiapkan lembar soal...</div>;
    if (soal.length === 0) return <div className="text-center p-5 text-muted">Belum ada soal pada ujian ini.</div>;

    const s = soal[indexAktif]; 

    return (
        <div className="container-fluid py-4 px-md-5 bg-light min-vh-100" style={{fontFamily: "'Inter', sans-serif"}}>
            <div className="row">
                
                {/* --- KIRI: AREA KERJA SOAL --- */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 p-4 mb-4 bg-white" style={{ borderRadius: '15px', minHeight: '500px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <h5 className="fw-bold m-0 text-dark">PERTANYAAN NO. {indexAktif + 1}</h5>
                            <span className="badge px-3 py-2 text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px', backgroundColor: colors.primary }}>
                                {s.tipe_soal}
                            </span>
                        </div>

                        {/* GAMBAR SOAL */}
                        {s.gambar && (
                            <div className="mb-4 text-center">
                                <img 
                                    src={`${getBaseUploadPath()}${s.gambar}`} 
                                    alt="Bahan Soal" 
                                    className="img-fluid rounded shadow-sm border"
                                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}

                        <div className="fs-5 mb-5 text-dark fw-bold" style={{ lineHeight: '1.6' }}>
                            {s.pertanyaan}
                        </div>

                        <div className="options-area">
                            {/* 1. PILGAN */}
                            {s.tipe_soal === 'pilgan' && s.opsi.map((o, i) => {
                                const isSelected = jawaban[s.id_soal] === o.id_opsi;
                                return (
                                    <div key={i} onClick={() => handlePilihJawaban(s.id_soal, o.id_opsi)}
                                        className={`card mb-3 p-3 border-2 transition-all ${isSelected ? 'border-primary bg-primary text-white shadow' : 'bg-white text-dark border-light-subtle'}`}
                                        style={{ cursor: 'pointer', borderRadius: '12px' }}>
                                        <div className="d-flex align-items-center">
                                            <div className={`fw-bold me-3 rounded-circle border d-flex justify-content-center align-items-center ${isSelected ? 'bg-white text-primary' : 'bg-light text-dark'}`} style={{ width: '35px', height: '35px' }}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className="fs-6">{o.teks_opsi}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* 2. ESAI */}
                            {s.tipe_soal === 'esai' && (
                                <textarea className="form-control border-2 p-3 shadow-none" rows="8" placeholder="Tulis jawaban lengkap..." 
                                    value={jawaban[s.id_soal] || ''} 
                                    onChange={(e) => handlePilihJawaban(s.id_soal, e.target.value)}
                                    style={{ borderRadius: '15px', borderColor: jawaban[s.id_soal] ? colors.primary : '#dee2e6' }} />
                            )}

                            {/* 3. MATCHING */}
                            {s.tipe_soal === 'matching' && (
                                <div className="bg-light p-3 rounded-4 border">
                                    {s.opsi.map((o, i) => {
                                        const val = jawaban[`${s.id_soal}_${o.id_opsi}`];
                                        return (
                                            <div key={i} className="row mb-3 align-items-center bg-white p-3 rounded-3 mx-0 shadow-sm border">
                                                <div className="col-md-7 fw-bold text-dark border-end small">{o.teks_opsi}</div>
                                                <div className="col-md-5">
                                                    <select className="form-select border-2 shadow-none" value={val || ''}
                                                        onChange={(e) => handlePilihMatching(s.id_soal, o.id_opsi, e.target.value)}
                                                        style={{ borderRadius: '8px', borderColor: val ? colors.primary : '#ced4da' }}>
                                                        <option value="">-- Pilih Jawaban --</option>
                                                        {s.opsi.map((kunci, idx) => <option key={idx} value={kunci.kunci_matching}>{kunci.kunci_matching}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* NAVIGASI BAWAH */}
                        <div className="d-flex justify-content-between mt-auto pt-5 border-top">
                            <button className="btn btn-light px-4 fw-bold border" disabled={indexAktif === 0} onClick={() => setIndexAktif(indexAktif - 1)}>⬅ PREV</button>
                            {indexAktif === soal.length - 1 ? (
                                <button className="btn btn-success px-5 fw-bold shadow-sm" onClick={handleSubmit}>SUBMIT SEKARANG 🏁</button>
                            ) : (
                                <button className="btn btn-primary px-5 fw-bold shadow-sm" style={{backgroundColor: colors.primary}} onClick={() => setIndexAktif(indexAktif + 1)}>NEXT ➡</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- KANAN: SIDEBAR NAVIGASI --- */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 sticky-top bg-white p-2" style={{ borderRadius: '15px', top: '20px' }}>
                        <div className="card-body">
                            <h6 className="fw-bold text-muted mb-4 small text-uppercase" style={{ letterSpacing: '1px' }}>Daftar Soal</h6>
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                {soal.map((item, idx) => {
                                    const isDijawab = item.tipe_soal === 'matching' 
                                        ? Object.keys(jawaban).some(key => key.startsWith(`${item.id_soal}_`) && jawaban[key] !== "")
                                        : (jawaban[item.id_soal] && jawaban[item.id_soal] !== "");

                                    return (
                                        <button key={idx} onClick={() => setIndexAktif(idx)}
                                            className={`btn rounded-3 fw-bold d-flex align-items-center justify-content-center transition-all ${
                                                indexAktif === idx ? 'btn-dark' : (isDijawab ? 'btn-primary' : 'btn-outline-secondary opacity-50')
                                            }`}
                                            style={{ width: '48px', height: '48px', backgroundColor: indexAktif === idx ? colors.secondary : (isDijawab ? colors.primary : '') }}>
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="border-top pt-3">
                                <button className="btn btn-outline-danger w-100 fw-bold py-3" onClick={handleSubmit} style={{ borderRadius: '12px' }}>
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