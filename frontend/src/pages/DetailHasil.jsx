import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function DetailHasil() {
    const { id_hasil } = useParams();
    const [data, setData] = useState(null);
    const [nilaiBaru, setNilaiBaru] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDetail();
    }, []);

    const fetchDetail = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_detail_hasil&id_hasil=${id_hasil}`);
            setData(res.data);
            setNilaiBaru(res.data.info.nilai_total); // Set initial value
        } catch (err) {
            console.error("Gagal memuat detail:", err);
        }
    };

    const handleUpdateNilai = async () => {
        if (!window.confirm("Apakah Anda yakin ingin mengubah nilai akhir siswa ini secara manual?")) return;
        
        setIsSaving(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=update_nilai_manual`, {
                id_hasil: id_hasil,
                nilai_baru: nilaiBaru
            });
            if (res.data.success) {
                alert("Nilai berhasil diperbarui!");
                fetchDetail(); // Refresh data
            }
        } catch (err) {
            alert("Gagal memperbarui nilai.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!data) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status"></div>
            <span className="ms-2">Memuat Data Audit...</span>
        </div>
    );

    return (
        <div className="container py-4" style={{ maxWidth: '900px' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold m-0 text-dark">🔍 Detail Jawaban Siswa</h4>
                    <p className="text-muted small m-0">Audit & Koreksi Manual</p>
                </div>
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm fw-bold px-3 rounded-pill">
                    ⬅ Kembali
                </button>
            </div>

            {/* PANEL BERI NILAI (Sticky Top) */}
            <div className="card mb-4 border-0 shadow-sm sticky-top" style={{ borderRadius: '15px', top: '20px', zIndex: 1020 }}>
                <div className="card-body bg-dark text-white rounded-3 p-3">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <div className="small opacity-75">Siswa: {data.info.nama || 'User'}</div>
                            <h6 className="fw-bold m-0 text-truncate">Skor Sistem: {data.info.nilai_total}</h6>
                        </div>
                        <div className="col-md-6 mt-2 mt-md-0">
                            <div className="input-group">
                                <span className="input-group-text bg-primary text-white border-0 fw-bold">Update Skor:</span>
                                <input 
                                    type="number" 
                                    className="form-control fw-bold" 
                                    value={nilaiBaru} 
                                    onChange={(e) => setNilaiBaru(e.target.value)}
                                />
                                <button 
                                    className="btn btn-primary fw-bold" 
                                    onClick={handleUpdateNilai}
                                    disabled={isSaving}
                                >
                                    {isSaving ? '...' : 'SIMPAN'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Soal */}
            {data.soal.map((s, index) => (
                <div key={index} className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <div className="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">Soal #{index + 1}</span>
                        <span className="badge bg-secondary text-uppercase" style={{ fontSize: '10px' }}>{s.tipe_soal}</span>
                    </div>
                    
                    <div className="card-body">
                        {/* Pertanyaan */}
                        <div className="p-3 bg-light rounded-3 mb-3 border-start border-4 border-primary">
                            <p className="fw-bold m-0">{s.pertanyaan}</p>
                            {s.gambar && (
                                <img 
                                    src={`${API_BASE_URL.replace('/exam', '')}/uploads/exam/${s.gambar}`} 
                                    alt="Soal" 
                                    className="img-fluid rounded mt-2 border" 
                                    style={{ maxHeight: '200px' }} 
                                />
                            )}
                        </div>

                        {/* --- PILGAN --- */}
                        {s.tipe_soal === 'pilgan' && (
                            <div className="list-group">
                                {s.opsi.map((o, idx) => {
                                    const isKunci = o.is_benar == 1;
                                    const isDipilih = s.jawaban_siswa == o.id_opsi;
                                    let cls = "";
                                    if (isKunci) cls = "list-group-item-success border-success";
                                    if (isDipilih && !isKunci) cls = "list-group-item-danger border-danger";
                                    
                                    return (
                                        <div key={idx} className={`list-group-item mb-1 rounded-3 d-flex justify-content-between align-items-center ${cls}`}>
                                            <span className={isKunci ? "fw-bold" : ""}>{o.teks_opsi}</span>
                                            <div className="d-flex gap-2">
                                                {isDipilih && <span className="badge bg-dark rounded-pill">Pilihan Siswa</span>}
                                                {isKunci && <span className="badge bg-success rounded-pill">Kunci</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* --- ESAI --- */}
                        {s.tipe_soal === 'esai' && (
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="small fw-bold text-muted mb-1">JAWABAN SISWA:</label>
                                    <div className="p-3 bg-white border rounded-3 h-100" style={{ minHeight: '100px', whiteSpace: 'pre-line' }}>
                                        {s.jawaban_siswa ? s.jawaban_siswa : <em className="text-danger">Kosong</em>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="small fw-bold text-success mb-1">KUNCI REFERENSI:</label>
                                    <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 h-100" style={{ minHeight: '100px', whiteSpace: 'pre-line' }}>
                                        {s.kunci_esai ? s.kunci_esai : <em className="text-muted small">Tidak ada pedoman</em>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- MATCHING --- */}
                        {s.tipe_soal === 'matching' && (
                            <div className="table-responsive rounded-3 border">
                                <table className="table table-sm table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr className="small">
                                            <th className="ps-3">Kiri</th>
                                            <th>Kunci</th>
                                            <th>Pilihan Siswa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {s.opsi.map((o, idx) => {
                                            const jwbSiswa = s.jawaban_siswa_matching[o.id_opsi];
                                            const isBenar = jwbSiswa === o.kunci_matching;
                                            return (
                                                <tr key={idx} className={isBenar ? "table-success bg-opacity-10" : "table-danger bg-opacity-10"}>
                                                    <td className="ps-3">{o.teks_opsi}</td>
                                                    <td className="fw-bold text-success">{o.kunci_matching}</td>
                                                    <td className={isBenar ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                                        {jwbSiswa || '(Kosong)'}
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
        </div>
    );
}

export default DetailHasil;