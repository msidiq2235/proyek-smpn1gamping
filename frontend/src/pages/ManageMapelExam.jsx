import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function ManageMapelExam() {
    const [listMapel, setListMapel] = useState([]);
    const [namaMapel, setNamaMapel] = useState('');
    const [idEdit, setIdEdit] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        if (!namaMapel.trim()) return alert("Nama Mata Pelajaran tidak boleh kosong!");

        setLoading(true);
        const action = idEdit ? 'update_mapel_exam' : 'tambah_mapel_exam';
        
        try {
            const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=${action}`, {
                id_mapel: idEdit,
                nama_mapel: namaMapel
            });

            if (res.data.success) {
                alert(idEdit ? "Mapel diperbarui!" : "Mapel ditambahkan!");
                setNamaMapel('');
                setIdEdit(null);
                fetchMapel();
            } else {
                alert("Gagal menyimpan: " + res.data.error);
            }
        } catch (err) {
            alert("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (m) => {
        setIdEdit(m.id_exam_mapel);
        setNamaMapel(m.nama_mapel);
        window.scrollTo(0, 0);
    };

    const handleHapus = async (id) => {
        if (window.confirm("Hapus Mata Pelajaran ini? Ujian yang menggunakan mapel ini mungkin akan bermasalah.")) {
            try {
                const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=hapus_mapel_exam&id_mapel=${id}`);
                if (res.data.success) {
                    fetchMapel();
                } else {
                    alert("Gagal menghapus: " + res.data.error);
                }
            } catch (err) {
                alert("Gagal koneksi ke server.");
            }
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: '600px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">📚 Kelola Mapel</h3>
                <button onClick={() => navigate('/admin-exam')} className="btn btn-dark btn-sm rounded-pill px-3">
                    Kembali ke Admin
                </button>
            </div>

            {/* Form Input */}
            <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: '15px' }}>
                <form onSubmit={handleSimpan}>
                    <label className="small fw-bold text-muted mb-2 text-uppercase">
                        {idEdit ? 'Edit Nama Mapel' : 'Tambah Mata Pelajaran Baru'}
                    </label>
                    <div className="input-group">
                        <input 
                            type="text" 
                            className="form-control fw-bold" 
                            placeholder="Contoh: Matematika (Ujian Tengah Semester)"
                            value={namaMapel}
                            onChange={(e) => setNamaMapel(e.target.value)}
                        />
                        <button className={`btn ${idEdit ? 'btn-warning' : 'btn-primary'} fw-bold`} type="submit" disabled={loading}>
                            {loading ? '...' : (idEdit ? 'UPDATE' : 'TAMBAH')}
                        </button>
                        {idEdit && (
                            <button className="btn btn-light border" type="button" onClick={() => { setIdEdit(null); setNamaMapel(''); }}>
                                BATAL
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List Mapel */}
            <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: '15px' }}>
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="ps-4 py-3" style={{ width: '50px' }}>No</th>
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
                                    <div className="btn-group shadow-sm">
                                        <button className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(m)}>
                                            ✏️
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleHapus(m.id_exam_mapel)}>
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="text-center p-5 text-muted">Belum ada mapel terdaftar.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageMapelExam;