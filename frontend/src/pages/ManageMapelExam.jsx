import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2'; // --- 1. Import Swal ---

function ManageMapelExam() {
    const [listMapel, setListMapel] = useState([]);
    const [namaMapel, setNamaMapel] = useState('');
    const [idEdit, setIdEdit] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const colors = {
        primary: '#023874',
        secondary: '#B8860B'
    };

    useEffect(() => {
        fetchMapel();
    }, []);

    const fetchMapel = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_mapel_exam`);
            if (Array.isArray(res.data)) setListMapel(res.data);
        } catch (err) {
            console.error("Gagal mengambil mapel:", err);
        }
    };

    const handleSimpan = async (e) => {
    e.preventDefault();
    if (!namaMapel.trim()) return Swal.fire('Opps', 'Nama Mata Pelajaran wajib diisi!', 'warning');

    setLoading(true);
    const action = idEdit ? 'update_mapel_exam' : 'tambah_mapel_exam';
    
    try {
        // PERBAIKAN: Kirim data sebagai objek JSON murni {}
        // Sesuai dengan PHP kamu yang pakai json_decode(file_get_contents("php://input"))
        const res = await axios.post(
            `${API_BASE_URL}/exam/exam_controller.php?action=${action}`, 
            {
                id_mapel: idEdit,
                nama_mapel: namaMapel
            }
        );

        if (res.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: idEdit ? "Mata pelajaran diperbarui!" : "Mata pelajaran baru ditambahkan!",
                timer: 1500,
                showConfirmButton: false,
                iconColor: colors.primary
            });
            setNamaMapel('');
            setIdEdit(null);
            fetchMapel();
        } else {
            Swal.fire('Gagal', res.data.error || 'Terjadi kesalahan saat menyimpan.', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Terjadi kesalahan koneksi sistem.', 'error');
    } finally {
        setLoading(false);
    }
};

    const handleEdit = (m) => {
        setIdEdit(m.id_exam_mapel);
        setNamaMapel(m.nama_mapel);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleHapus = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Mata Pelajaran?',
            text: "Ujian yang menggunakan mapel ini mungkin akan bermasalah!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Hapus Tetap'
        });

        if (result.isConfirmed) {
            try {
                const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=hapus_mapel_exam&id_mapel=${id}`);
                if (res.data.success) {
                    Swal.fire('Terhapus!', 'Mata pelajaran telah dihapus.', 'success');
                    fetchMapel();
                } else {
                    Swal.fire('Gagal', res.data.error, 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Gagal koneksi ke server.', 'error');
            }
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '650px', fontFamily: "'Inter', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0" style={{ color: colors.primary }}>📚 Kelola Mapel</h3>
                <button onClick={() => navigate('/admin-exam')} className="btn btn-dark btn-sm rounded-pill px-4 shadow-sm fw-bold">
                    ⬅ KEMBALI
                </button>
            </div>

            {/* Form Input */}
            <div className="card shadow-sm border-0 p-4 mb-5" style={{ borderRadius: '15px', borderLeft: `6px solid ${colors.secondary}` }}>
                <form onSubmit={handleSimpan}>
                    <label className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>
                        {idEdit ? 'Edit Nama Mapel' : 'Tambah Mata Pelajaran Baru'}
                    </label>
                    <div className="input-group shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                        <input 
                            type="text" 
                            className="form-control border-0 bg-light fw-bold px-3 py-2" 
                            placeholder="Contoh: Matematika Dasar" 
                            value={namaMapel}
                            onChange={(e) => setNamaMapel(e.target.value)}
                        />
                        <button className={`btn ${idEdit ? 'btn-warning' : 'btn-primary'} fw-bold px-4`} type="submit" disabled={loading} style={{ backgroundColor: idEdit ? '#ffc107' : colors.primary }}>
                            {loading ? '...' : (idEdit ? 'UPDATE' : 'TAMBAH')}
                        </button>
                        {idEdit && (
                            <button className="btn btn-light border-start fw-bold" type="button" onClick={() => { setIdEdit(null); setNamaMapel(''); }}>
                                BATAL
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List Mapel */}
            <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: '15px' }}>
                <div className="bg-white p-3 border-bottom">
                    <h6 className="m-0 fw-bold text-muted small text-uppercase">Daftar Mapel Aktif</h6>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-uppercase small" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                            <tr>
                                <th className="ps-4 py-3" style={{ width: '60px' }}>No</th>
                                <th className="py-3">Mata Pelajaran</th>
                                <th className="text-center pe-4 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listMapel.length > 0 ? listMapel.map((m, i) => (
                                <tr key={m.id_exam_mapel}>
                                    <td className="ps-4 text-muted small">{i + 1}</td>
                                    <td className="fw-bold text-dark">{m.nama_mapel}</td>
                                    <td className="text-center pe-4">
                                        <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                                            <button className="btn btn-sm btn-white border-end px-3 py-2" onClick={() => handleEdit(m)} title="Edit">
                                                ✏️
                                            </button>
                                            <button className="btn btn-sm btn-white text-danger px-3 py-2" onClick={() => handleHapus(m.id_exam_mapel)} title="Hapus">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center p-5 text-muted italic">Belum ada mata pelajaran terdaftar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ManageMapelExam;