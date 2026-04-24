import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

function NilaiExam() {
    const [nilai, setNilai] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // State untuk input search
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const role = localStorage.getItem('role'); 
    const nis = localStorage.getItem('nis');
    const idUjianParam = searchParams.get('id_ujian');

    useEffect(() => {
        fetchData();
    }, [role, nis, idUjianParam]);

    const fetchData = async () => {
        try {
            let url = "";
            if (role === 'admin') {
                url = `${API_BASE_URL}/exam/exam_controller.php?action=get_semua_nilai`;
            } else if (idUjianParam) {
                url = `${API_BASE_URL}/exam/exam_controller.php?action=get_riwayat_nilai&nis=${nis}&id_ujian=${idUjianParam}`;
            } else {
                url = `${API_BASE_URL}/exam/exam_controller.php?action=get_nilai_siswa&nis=${nis}`;
            }
            const res = await axios.get(url);
            setNilai(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Gagal mengambil data nilai:", err);
        }
    };

    const handlePublish = async (id, currentStatus) => {
        const newStatus = currentStatus == 1 ? 0 : 1;
        try {
            const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=toggle_publish`, {
                id_hasil: id,
                status: newStatus
            });
            if (res.data.success) fetchData(); 
        } catch (err) {
            alert("Gagal memperbarui status publikasi");
        }
    };

    const handleHapusAttempt = async (id, namaSiswa) => {
        if (window.confirm(`Hapus data percobaan milik ${namaSiswa}? Tindakan ini akan mengembalikan jatah pengerjaan siswa.`)) {
            try {
                const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=hapus_attempt&id_hasil=${id}`);
                if (res.data.success) {
                    fetchData(); 
                } else {
                    alert("Gagal menghapus: " + res.data.error);
                }
            } catch (err) {
                alert("Terjadi kesalahan koneksi.");
            }
        }
    };

    // LOGIKA FILTERING (SEARCH)
    const filteredNilai = nilai.filter((item) => {
        const lowerSearch = searchTerm.toLowerCase();
        // Mencari di Nama atau NIS
        return (
            (item.nama && item.nama.toLowerCase().includes(lowerSearch)) || 
            (item.nis && item.nis.toLowerCase().includes(lowerSearch)) ||
            (item.judul_ujian && item.judul_ujian.toLowerCase().includes(lowerSearch))
        );
    });

    return (
        <div className="container py-4" style={{ maxWidth: '1000px' }}>
            {/* Header Area */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h3 className="fw-bold m-0 text-dark">
                        {role === 'admin' ? '📊 Rekap Nilai Siswa' : (idUjianParam ? '📚 Riwayat Nilai' : '📈 Hasil Ujian Saya')}
                    </h3>
                    <p className="text-muted small m-0">
                        {role === 'admin' ? 'Kelola publikasi, hapus sesi, atau lihat detail jawaban.' : 'Data perolehan skor Anda.'}
                    </p>
                </div>
                
                <div className="d-flex gap-2">
                    {/* INPUT SEARCH (Hanya muncul jika admin atau jika datanya banyak) */}
                    {role === 'admin' && (
                        <div className="input-group shadow-sm" style={{ maxWidth: '300px' }}>
                            <span className="input-group-text bg-white border-end-0">🔍</span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 ps-0" 
                                placeholder="Cari NISN atau Nama..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                    
                    <button 
                        onClick={() => navigate('/daftar-ujian')} 
                        className="btn btn-outline-secondary btn-sm fw-bold px-3 rounded-pill shadow-sm"
                    >
                        ⬅ Kembali
                    </button>
                </div>
            </div>

            <div className="card shadow-sm border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className={role === 'admin' ? "table-dark" : "table-success text-dark"}>
                            <tr style={{ fontSize: '14px' }}>
                                {role === 'admin' && <th className="ps-4">Siswa</th>}
                                <th className="ps-4">Mata Ujian / Sesi</th>
                                <th className="text-center">Skor</th>
                                {role === 'admin' && <th className="text-center">Status</th>}
                                {role === 'admin' && <th className="text-center pe-4">Aksi</th>}
                                {role !== 'admin' && <th className="text-end pe-4">Waktu Selesai</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNilai.length > 0 ? filteredNilai.map((n, i) => (
                                <tr key={i} style={{ fontSize: '14px' }}>
                                    {role === 'admin' && (
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{n.nama}</div>
                                            <small className="text-secondary">{n.nis}</small>
                                        </td>
                                    )}
                                    
                                    <td className="ps-4">
                                        <div className="fw-bold text-dark">
                                            {n.percobaan_ke ? `Percobaan #${n.percobaan_ke}` : n.judul_ujian}
                                        </div>
                                        {n.percobaan_ke && <small className="text-muted">{n.judul_ujian}</small>}
                                    </td>

                                    <td className="text-center">
                                        <span className={`badge rounded-pill px-3 py-2 ${parseFloat(n.nilai) >= 75 ? 'bg-success' : 'bg-primary'}`}>
                                            {n.nilai}
                                        </span>
                                    </td>
                                    
                                    {role === 'admin' && (
                                        <>
                                            <td className="text-center">
                                                <span className={`badge ${n.is_publish == 1 ? 'bg-success' : 'bg-secondary'}`}>
                                                    {n.is_publish == 1 ? 'Published' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="text-center pe-4">
                                                <div className="d-flex gap-1 justify-content-center">
                                                    <button 
                                                        className="btn btn-sm btn-info text-white"
                                                        onClick={() => navigate(`/detail-hasil/${n.id_hasil}`)}
                                                        title="Lihat Jawaban Siswa"
                                                        style={{ padding: '2px 8px' }}
                                                    >
                                                        👁️
                                                    </button>

                                                    <button 
                                                        className={`btn btn-sm fw-bold ${n.is_publish == 1 ? 'btn-outline-danger' : 'btn-success'}`}
                                                        onClick={() => handlePublish(n.id_hasil, n.is_publish)}
                                                        style={{ fontSize: '10px', width: '65px' }}
                                                    >
                                                        {n.is_publish == 1 ? 'Hide' : 'Show'}
                                                    </button>

                                                    <button 
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleHapusAttempt(n.id_hasil, n.nama)}
                                                        style={{ padding: '2px 8px' }}
                                                        title="Hapus Attempt"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}

                                    {role !== 'admin' && (
                                        <td className="text-end pe-4 text-muted" style={{ fontSize: '12px' }}>
                                            {new Date(n.waktu_selesai).toLocaleString('id-ID')}
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-5 text-muted">
                                        {searchTerm ? `Data "${searchTerm}" tidak ditemukan.` : "Tidak ada data nilai yang tersedia."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default NilaiExam;