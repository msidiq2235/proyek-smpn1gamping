import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function DaftarUjian() {
    const [listUjian, setListUjian] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const role = localStorage.getItem('role');
    const nis = localStorage.getItem('nis');
    const isAdmin = role === 'admin';

    useEffect(() => {
        fetchUjian();
    }, []);

    const fetchUjian = async () => {
        try {
            // Memanggil API dengan parameter NIS untuk cek jumlah pengerjaan
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_list_ujian&nis=${nis}`);
            setListUjian(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const hapusUjian = async (id) => {
        if (window.confirm("Hapus ujian ini beserta seluruh soalnya?")) {
            await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=hapus_ujian&id_ujian=${id}`);
            fetchUjian();
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="container py-4 px-3" style={{ maxWidth: '600px' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold m-0 text-dark">{isAdmin ? '⚙️ Panel Admin' : '📝 Daftar Ujian'}</h3>
                    <p className="text-muted small m-0">SMP Negeri 1 Gamping</p>
                </div>
                <Link to="/beranda" className="btn btn-white shadow-sm rounded-circle p-2">
                    🏠
                </Link>
            </div>

            {/* Quick Actions Admin */}
            {isAdmin && (
                <div className="row g-2 mb-4">
                    <div className="col-6">
                        <Link to="/admin-exam" className="btn btn-success w-100 fw-bold py-2 shadow-sm rounded-3">
                            + Ujian Baru
                        </Link>
                    </div>
                    <div className="col-6">
                        <Link to="/nilai-exam" className="btn btn-primary w-100 fw-bold py-2 shadow-sm rounded-3">
                            📊 Rekap Nilai
                        </Link>
                    </div>
                </div>
            )}

            {/* Grid List Ujian */}
            <div className="row g-3">
                {listUjian.length > 0 ? listUjian.map((u) => {
                    // Logika Sisa Jatah Pengerjaan
                    const sisaJatah = parseInt(u.max_attempt) - parseInt(u.jumlah_percobaan);
                    const sudahPernah = parseInt(u.jumlah_percobaan) > 0;

                    return (
                        <div className="col-12" key={u.id_ujian}>
                            <div className="card shadow-sm border-0" style={{ borderRadius: '18px' }}>
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <span className="badge bg-soft-primary text-primary px-2 py-1" style={{ backgroundColor: '#e7f1ff', fontSize: '11px' }}>
                                            {u.mapel}
                                        </span>
                                        <div className="text-end">
                                            <div className="text-muted small fw-bold">⏱ {u.durasi} Menit</div>
                                            <div className="text-primary fw-bold" style={{ fontSize: '10px' }}>
                                                Jatah: {u.jumlah_percobaan}/{u.max_attempt}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <h5 className="fw-bold text-dark mb-3">{u.judul_ujian}</h5>

                                    <div className="d-grid gap-2">
                                        {isAdmin ? (
                                            <div className="d-flex gap-2">
                                                <Link to={`/admin-exam?edit=${u.id_ujian}`} className="btn btn-warning flex-grow-1 fw-bold rounded-3">
                                                    ✏️ Edit Soal
                                                </Link>
                                                <button onClick={() => hapusUjian(u.id_ujian)} className="btn btn-outline-danger rounded-3 px-3">
                                                    🗑️
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Tombol Mulai / Ulangi */}
                                                {sisaJatah > 0 ? (
                                                    <Link to={`/ujian/${u.id_ujian}`} className="btn btn-primary fw-bold py-2 rounded-3 shadow-sm">
                                                        {sudahPernah ? `Ulangi Ujian (${sisaJatah} Jatah)` : 'Mulai Ujian 🚀'}
                                                    </Link>
                                                ) : (
                                                    <button className="btn btn-secondary py-2 rounded-3 fw-bold" disabled>
                                                        🚫 Jatah Habis
                                                    </button>
                                                )}

                                                {/* Tombol Lihat Riwayat Nilai */}
                                                {sudahPernah && (
                                                    <button 
                                                        onClick={() => navigate(`/nilai-exam?id_ujian=${u.id_ujian}`)} 
                                                        className="btn btn-outline-success fw-bold py-2 rounded-3"
                                                    >
                                                        📊 Lihat Hasil & Riwayat
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-12 text-center py-5">
                        <div className="display-1 text-muted opacity-25 mb-3">📭</div>
                        <p className="text-muted">Belum ada ujian aktif untuk mata pelajaran Anda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DaftarUjian;