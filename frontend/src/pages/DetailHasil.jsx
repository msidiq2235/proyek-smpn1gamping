import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2'; // --- 1. Import Swal ---

function DetailHasil() {
    const { id_hasil } = useParams();
    const [data, setData] = useState(null);
    const [nilaiBaru, setNilaiBaru] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const colors = {
        primary: '#023874',
        secondary: '#B8860B',
        bgLight: '#F4F1EA',
    };

    useEffect(() => {
        fetchDetail();
    }, [id_hasil]);

    const fetchDetail = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_detail_hasil&id_hasil=${id_hasil}`);
            setData(res.data);
            setNilaiBaru(res.data.info.nilai_total);
        } catch (err) {
            console.error("Gagal memuat detail:", err);
            Swal.fire('Error', 'Gagal memuat detail jawaban.', 'error');
        }
    };

    // --- 2. Update Nilai Manual dengan Swal ---
    const handleUpdateNilai = async () => {
        const confirmResult = await Swal.fire({
            title: 'Koreksi Nilai Manual?',
            text: `Nilai sistem (${data.info.nilai_total}) akan diganti menjadi (${nilaiBaru}). Lanjutkan?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: colors.primary,
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Update Nilai',
            cancelButtonText: 'Batal'
        });

        if (!confirmResult.isConfirmed) return;

        setIsSaving(true);
        Swal.fire({
            title: 'Memperbarui Nilai...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=update_nilai_manual`, {
                id_hasil: id_hasil,
                nilai_baru: nilaiBaru
            });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Nilai akhir siswa berhasil diperbarui!',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchDetail();
            }
        } catch (err) {
            Swal.fire('Gagal', 'Terjadi kesalahan sistem saat update.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!data) return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
            <div className="spinner-border text-primary" role="status"></div>
            <span className="ms-2 fw-bold">Memuat Data Audit...</span>
        </div>
    );

    return (
        <div className="container py-4" style={{ maxWidth: '950px', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold m-0 text-dark">🔍 Audit Jawaban Peserta</h4>
                    <p className="text-muted small m-0 text-uppercase" style={{letterSpacing:'1px'}}>Evaluasi & Koreksi Manual Hasil CBT</p>
                </div>
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm fw-bold px-4 rounded-pill shadow-sm">
                    ⬅ KEMBALI
                </button>
            </div>

            {/* PANEL UPDATE NILAI (STICKY) */}
            <div className="card mb-5 border-0 shadow-lg sticky-top" style={{ borderRadius: '15px', top: '20px', zIndex: 1020, overflow:'hidden' }}>
                <div className="card-body bg-dark text-white p-3">
                    <div className="row align-items-center">
                        <div className="col-md-6 border-end border-secondary">
                            <div className="small opacity-75 text-uppercase fw-bold" style={{ fontSize:'10px' }}>Nama Peserta:</div>
                            <h5 className="fw-bold m-0 text-warning">{data.info.nama || 'Siswa'}</h5>
                            <small className="text-muted">Skor Awal Sistem: {data.info.nilai_total}</small>
                        </div>
                        <div className="col-md-6 mt-3 mt-md-0">
                            <div className="input-group shadow-sm">
                                <span className="input-group-text bg-primary text-white border-0 fw-bold px-3">SKOR BARU</span>
                                <input 
                                    type="number" 
                                    className="form-control fw-bold border-0 text-center fs-5" 
                                    value={nilaiBaru} 
                                    onChange={(e) => setNilaiBaru(e.target.value)}
                                    style={{maxWidth:'120px'}}
                                />
                                <button className="btn btn-primary fw-bold px-4" onClick={handleUpdateNilai} disabled={isSaving}>
                                    {isSaving ? '...' : 'SIMPAN PERUBAHAN'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Soal Audit */}
            <h6 className="fw-bold text-muted mb-4 border-bottom pb-2">REVIEW BUTIR PERTANYAAN</h6>
            {data.soal.map((s, index) => (
                <div key={index} className="card mb-4 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
                    <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-bold shadow-sm">SOAL #{index + 1}</span>
                        <span className="badge text-uppercase px-3 py-2" style={{ fontSize: '10px', backgroundColor: colors.primary, borderRadius:'8px' }}>{s.tipe_soal}</span>
                    </div>
                    
                    <div className="card-body px-4 pb-4">
                        {/* Pertanyaan Box */}
                        <div className="p-3 bg-light rounded-4 mb-4 border-start border-4 border-primary">
                            <p className="fw-bold m-0 fs-6" style={{ color: colors.primary, lineHeight:'1.6' }}>{s.pertanyaan}</p>
                            {s.gambar && (
                                <div className="mt-3 text-center bg-white p-2 rounded-3 border">
                                    <img 
                                        src={`${API_BASE_URL.replace('/exam', '')}/uploads/exam/${s.gambar}`} 
                                        alt="Soal" 
                                        className="img-fluid rounded shadow-sm" 
                                        style={{ maxHeight: '250px' }} 
                                    />
                                </div>
                            )}
                        </div>

                        {/* RENDER PILGAN */}
                        {s.tipe_soal === 'pilgan' && (
                            <div className="list-group gap-2">
                                {s.opsi.map((o, idx) => {
                                    const isKunci = o.is_benar == 1;
                                    const isDipilih = s.jawaban_siswa == o.id_opsi;
                                    let borderStyle = "border-light-subtle";
                                    let bgStyle = "bg-white";

                                    if (isKunci) { borderStyle = "border-success"; bgStyle = "bg-success bg-opacity-10"; }
                                    if (isDipilih && !isKunci) { borderStyle = "border-danger"; bgStyle = "bg-danger bg-opacity-10"; }
                                    
                                    return (
                                        <div key={idx} className={`list-group-item p-3 rounded-3 d-flex justify-content-between align-items-center border-2 ${borderStyle} ${bgStyle} shadow-sm transition-all`}>
                                            <span className={isKunci ? "fw-bold text-success" : "text-dark"}>{o.teks_opsi}</span>
                                            <div className="d-flex gap-2">
                                                {isDipilih && <span className="badge bg-dark rounded-pill px-3 py-2">Pilihan Siswa</span>}
                                                {isKunci && <span className="badge bg-success rounded-pill px-3 py-2">Kunci Jawaban</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* RENDER ESAI */}
                        {s.tipe_soal === 'esai' && (
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="small fw-bold text-muted mb-2 text-uppercase">Jawaban Peserta:</label>
                                    <div className="p-3 bg-white border-2 border border-light-subtle rounded-4 h-100 shadow-sm" style={{ minHeight: '120px', whiteSpace: 'pre-line' }}>
                                        {s.jawaban_siswa ? s.jawaban_siswa : <em className="text-danger fw-bold">Siswa tidak menjawab</em>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="small fw-bold text-success mb-2 text-uppercase">Pedoman Koreksi:</label>
                                    <div className="p-3 bg-success bg-opacity-10 border border-success border-2 rounded-4 h-100 shadow-sm" style={{ minHeight: '120px', whiteSpace: 'pre-line' }}>
                                        {s.kunci_esai ? s.kunci_esai : <em className="text-muted small">Tidak ada kunci referensi</em>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RENDER MATCHING */}
                        {s.tipe_soal === 'matching' && (
                            <div className="table-responsive rounded-4 border-2 border shadow-sm">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-dark">
                                        <tr className="small text-uppercase">
                                            <th className="ps-3 py-3">Pernyataan</th>
                                            <th>Pasangan Benar</th>
                                            <th className="pe-3">Jawaban Siswa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {s.opsi.map((o, idx) => {
                                            const matchingData = s.jawaban_siswa_matching || {};
                                            const jwbSiswa = matchingData[o.id_opsi];
                                            const isBenar = jwbSiswa === o.kunci_matching;

                                            return (
                                                <tr key={idx} className={isBenar ? "table-success" : (jwbSiswa ? "table-danger" : "")}>
                                                    <td className="ps-3 fw-bold small">{o.teks_opsi}</td>
                                                    <td className="text-success fw-bold small">{o.kunci_matching}</td>
                                                    <td className={`pe-3 fw-bold small ${isBenar ? 'text-success' : 'text-danger'}`}>
                                                        {jwbSiswa || <em className="small opacity-50">Tidak Terjawab</em>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            <div className="text-center py-4">
                 <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="btn btn-light btn-sm rounded-pill px-4 border shadow-sm fw-bold">☝ Kembali ke Atas</button>
            </div>
        </div>
    );
}

export default DetailHasil;