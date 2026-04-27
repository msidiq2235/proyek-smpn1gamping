import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2';

function DaftarUjian() {
    const [listUjian, setListUjian] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const role = localStorage.getItem('role');
    const nis = localStorage.getItem('nis');
    const isAdmin = role === 'admin';

    const colors = {
        primary: '#023874',
        secondary: '#B8860B',
        bgLight: '#F4F1EA',
        white: '#ffffff'
    };

    useEffect(() => {
        fetchUjian();
    }, []);

    const fetchUjian = async () => {
        try {
            setLoading(true);
            // Pastikan API mengirimkan kolom 'jumlah_percobaan'
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_list_ujian&nis=${nis}`);
            setListUjian(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const hapusUjian = async (id) => {
        Swal.fire({
            title: 'Hapus Ujian?',
            text: "Seluruh data soal dan nilai siswa pada ujian ini akan hilang permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=hapus_ujian&id_ujian=${id}`);
                    Swal.fire({ title: 'Terhapus!', text: 'Paket ujian telah dihapus.', icon: 'success', timer: 1500, showConfirmButton: false });
                    fetchUjian();
                } catch (err) {
                    Swal.fire('Error', 'Gagal menghapus data.', 'error');
                }
            }
        });
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: colors.bgLight }}>
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', paddingBottom: '50px', fontFamily: "'Inter', sans-serif" }}>
            
            <nav className="navbar shadow-sm py-3 mb-5" style={{ backgroundColor: colors.primary, borderBottom: `4px solid ${colors.secondary}` }}>
                <div className="container px-4">
                    <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-3">
                        <img src="logosekolah.png" alt="Logo" style={{ width: '35px' }} />
                        <span style={{ letterSpacing: '1px', fontSize: '1.1rem' }}>
                            {isAdmin ? 'MANAJEMEN UJIAN' : 'DAFTAR UJIAN'}
                        </span>
                    </span>
                    <button onClick={() => navigate('/beranda')} className="btn btn-outline-light btn-sm fw-bold px-4 rounded-pill shadow-sm">
                        BERANDA
                    </button>
                </div>
            </nav>

            <div className="container px-4" style={{ maxWidth: '800px' }}>
                
                <div className="mb-4 border-start border-4 border-primary ps-3">
                    <h3 className="fw-bold text-dark m-0">{isAdmin ? 'Daftar Paket Soal' : 'Daftar Ujian Aktif'}</h3>
                    <p className="text-muted small m-0">Unit Pelaksana Teknis SMP Negeri 1 Gamping</p>
                </div>

                {isAdmin && (
                    <div className="row g-3 mb-5">
                        <div className="col-md-6">
                            <Link to="/admin-exam" className="btn w-100 fw-bold py-3 shadow-sm border-0 d-flex align-items-center justify-content-center gap-2" 
                                  style={{ backgroundColor: colors.primary, color: '#fff', borderRadius: '12px' }}>
                                <span>➕</span> BUAT UJIAN BARU
                            </Link>
                        </div>
                        <div className="col-md-6">
                            <Link to="/nilai-exam" className="btn w-100 fw-bold py-3 shadow-sm border-0 d-flex align-items-center justify-content-center gap-2" 
                                  style={{ backgroundColor: colors.secondary, color: '#fff', borderRadius: '12px' }}>
                                <span>📊</span> REKAP NILAI CBT
                            </Link>
                        </div>
                    </div>
                )}

                <div className="row g-4">
                    {listUjian.length > 0 ? listUjian.map((u) => {
                        // KUNCI PERBAIKAN: Gunakan nama properti yang konsisten (u.jumlah_percobaan)
                        const totalJatah = parseInt(u.max_attempt) || 1;
                        const dikerjakan = parseInt(u.jumlah_percobaan) || 0;
                        const sisaJatah = totalJatah - dikerjakan;
                        const sudahPernah = dikerjakan > 0;

                        return (
                            <div className="col-12" key={u.id_ujian}>
                                <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
                                    <div className="card-body p-4">
                                        <div className="row align-items-center">
                                            <div className="col-md-8">
                                                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                                    <span className="badge px-3 py-2 rounded-pill" style={{ backgroundColor: colors.bgLight, color: colors.primary, border: `1px solid ${colors.primary}33` }}>
                                                        {u.mapel}
                                                    </span>
                                                    <span className="text-muted small fw-bold">⏱ {u.durasi} Menit</span>
                                                    
                                                    {isAdmin && (
                                                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-bold">
                                                            🔑 TOKEN: {u.token}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="fw-bold text-dark mb-3">{u.judul_ujian}</h4>
                                                
                                                {!isAdmin && (
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="small fw-bold text-muted">
                                                            Sisa Jatah: <span style={{ color: sisaJatah > 0 ? colors.primary : '#dc3545' }}>{sisaJatah} kali</span>
                                                        </div>
                                                        <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '150px' }}>
                                                            <div className="progress-bar" role="progressbar" 
                                                                 style={{ 
                                                                    width: `${(dikerjakan / totalJatah) * 100}%`, 
                                                                    backgroundColor: colors.secondary 
                                                                 }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-4 text-md-end mt-4 mt-md-0">
                                                {isAdmin ? (
                                                    <div className="d-flex flex-column gap-2">
                                                        <Link to={`/admin-exam?edit=${u.id_ujian}`} className="btn btn-warning fw-bold rounded-pill px-4 shadow-sm text-dark">
                                                            ✏️ EDIT SOAL
                                                        </Link>
                                                        <button onClick={() => hapusUjian(u.id_ujian)} className="btn btn-outline-danger btn-sm rounded-pill border-0 fw-bold">
                                                            🗑️ HAPUS
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column gap-2">
                                                        {sisaJatah > 0 ? (
                                                            <Link to={`/ujian/${u.id_ujian}`} className="btn fw-bold rounded-pill px-4 shadow-sm text-white" 
                                                                  style={{ backgroundColor: colors.primary }}>
                                                                {sudahPernah ? 'ULANGI UJIAN' : 'MULAI UJIAN'}
                                                            </Link>
                                                        ) : (
                                                            <button className="btn btn-secondary rounded-pill px-4 fw-bold shadow-sm" disabled>
                                                                SUDAH DIKERJAKAN
                                                            </button>
                                                        )}
                                                        
                                                        {sudahPernah && (
                                                            <button onClick={() => navigate(`/nilai-exam?id_ujian=${u.id_ujian}`)} 
                                                                    className="btn btn-outline-success btn-sm rounded-pill border-2 fw-bold shadow-sm">
                                                                📊 LIHAT HASIL
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ height: '4px', background: isAdmin ? colors.primary : colors.secondary, opacity: 0.3 }}></div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-12 text-center py-5 bg-white shadow-sm rounded-4">
                            <div className="display-4 opacity-25 mb-3">📁</div>
                            <h5 className="text-muted fw-bold">Belum Ada Ujian Tersedia</h5>
                            <p className="text-muted small px-5">Hubungi pengajar jika jadwal Anda tidak muncul.</p>
                        </div>
                    )}
                </div>

                <div className="text-center mt-5">
                    <p className="text-muted small">UPT SMP Negeri 1 Gamping &copy; 2026</p>
                </div>
            </div>
        </div>
    );
}

export default DaftarUjian;