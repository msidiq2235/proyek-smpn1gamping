import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import Swal from 'sweetalert2';

function NilaiExam() {
    const [nilai, setNilai] = useState([]);
    const [listUjian, setListUjian] = useState([]); 
    const [selectedUjian, setSelectedUjian] = useState(''); 
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams] = useSearchParams();
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
        fetchDropdownUjian();
        const idFromParam = searchParams.get('id_ujian');
        if (idFromParam) setSelectedUjian(idFromParam);
    }, [searchParams]);

    useEffect(() => {
        if (isAdmin) {
            if (selectedUjian) fetchData();
            else setNilai([]);
        } else {
            fetchData();
        }
    }, [selectedUjian, role, nis]);

    const fetchDropdownUjian = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=get_list_ujian`);
            setListUjian(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Gagal load dropdown"); }
    };

    const fetchData = async () => {
        try {
            let url = isAdmin 
                ? `${API_BASE_URL}/exam/exam_controller.php?action=get_semua_nilai&id_ujian=${selectedUjian}`
                : `${API_BASE_URL}/exam/exam_controller.php?action=get_nilai_siswa&nis=${nis}`;
            const res = await axios.get(url);
            setNilai(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Gagal fetch data"); }
    };

    // --- FIX DURASI 420 MENIT ---
    // --- FIX DURASI (MENGHAPUS SELISIH 7 JAM) ---
    const hitungDurasi = (mulai, selesai) => {
        if (!mulai || !selesai || selesai === "0000-00-00 00:00:00") return "-";
        
        const start = new Date(mulai.replace(' ', 'T'));
        const end = new Date(selesai.replace(' ', 'T'));
        
        let diffMs = end - start;
        
        // 🚀 LOGIKA ANTI-LONDON: Jika selisih lebih dari 6 jam, potong 7 jam (25.200.000 ms)
        // Ini untuk mengakali data lama yang terlanjur tersimpan dengan format zona waktu UTC
        if (diffMs > 21600000) { 
            diffMs -= 25200000;
        }

        if (diffMs < 0) return "0m 0s";

        const totalDetik = Math.floor(diffMs / 1000);
        const h = Math.floor(totalDetik / 3600);
        const m = Math.floor((totalDetik % 3600) / 60);
        const s = totalDetik % 60;
        
        if (h > 0) return `${h}j ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    const handlePublish = async (id, currentStatus) => {
        const newStatus = currentStatus == 1 ? 0 : 1;
        try {
            await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=toggle_publish`, { id_hasil: id, status: newStatus });
            fetchData();
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: `Status nilai berhasil diperbarui.`,
                timer: 1000,
                showConfirmButton: false
            });
        } catch (err) { Swal.fire('Error', 'Gagal memperbarui status.', 'error'); }
    };

    const handleActionMasal = async (status) => {
        const label = status === 1 ? 'Mempublikasikan' : 'Menyembunyikan';
        if (!selectedUjian) return Swal.fire('Peringatan', 'Pilih paket ujian terlebih dahulu!', 'warning');
        
        const result = await Swal.fire({
            title: 'Konfirmasi Masal',
            text: `Apakah Anda yakin ingin ${label.toLowerCase()} seluruh nilai pada paket ini?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: colors.primary,
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Lanjutkan'
        });

        if (result.isConfirmed) {
            const ids = filteredNilai.map(n => n.id_hasil);
            if (ids.length === 0) return Swal.fire('Opps', 'Tidak ada data untuk diproses.', 'info');
            
            Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            try {
                const res = await axios.post(`${API_BASE_URL}/exam/exam_controller.php?action=publish_masal`, { ids, status });
                if (res.data.success) {
                    Swal.fire('Berhasil', `Status masal berhasil diubah.`, 'success');
                    fetchData();
                }
            } catch (err) { Swal.fire('Error', 'Gagal memproses data masal.', 'error'); }
        }
    };

    const handleHapusAttempt = async (id, nama) => {
        const result = await Swal.fire({
            title: 'Hapus Sesi Ujian?',
            text: `Data hasil ujian atas nama ${nama} akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Hapus'
        });

        if (result.isConfirmed) {
            try {
                await axios.get(`${API_BASE_URL}/exam/exam_controller.php?action=hapus_attempt&id_hasil=${id}`);
                fetchData();
                Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
            } catch (err) { Swal.fire('Error', 'Gagal menghapus data.', 'error'); }
        }
    };

    const filteredNilai = nilai.filter((item) => {
        const s = searchTerm.toLowerCase();
        return (item.nama || "").toLowerCase().includes(s) || (item.nis || "").toLowerCase().includes(s);
    });

    return (
        <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', paddingBottom: '50px', fontFamily: "'Inter', sans-serif" }}>
            <nav className="navbar shadow-sm py-3 mb-5" style={{ backgroundColor: colors.primary, borderBottom: `4px solid ${colors.secondary}` }}>
                <div className="container px-4">
                    <span className="navbar-brand fw-bold text-white d-flex align-items-center gap-3">
                        <img src="logosekolah.png" alt="Logo" style={{ width: '35px' }} />
                        <span style={{ letterSpacing: '1px' }}>{isAdmin ? 'ADMINISTRASI NILAI' : 'HASIL EVALUASI'}</span>
                    </span>
                    <button onClick={() => navigate('/daftar-ujian')} className="btn btn-outline-light btn-sm fw-bold px-4 rounded-pill">KEMBALI</button>
                </div>
            </nav>

            <div className="container px-4" style={{ maxWidth: '1100px' }}>
                {isAdmin && (
                    <div className="card border-0 shadow-sm mb-4 p-4" style={{ borderRadius: '15px' }}>
                        <div className="row align-items-end g-3">
                            <div className="col-md-5">
                                <label className="small fw-bold text-muted text-uppercase mb-2 d-block">Filter Paket Ujian:</label>
                                <select className="form-select border-0 bg-light py-2 px-3 fw-bold shadow-none" value={selectedUjian} onChange={(e) => setSelectedUjian(e.target.value)} style={{ borderRadius: '10px' }}>
                                    <option value="">-- Pilih Paket Ujian --</option>
                                    {listUjian.map(u => <option key={u.id_ujian} value={u.id_ujian}>{u.mapel} - {u.judul_ujian}</option>)}
                                </select>
                            </div>
                            <div className="col-md-7 text-md-end">
                                {selectedUjian && (
                                    <div className="d-flex gap-2 justify-content-md-end">
                                        <button onClick={() => handleActionMasal(1)} className="btn btn-success btn-sm fw-bold px-3 rounded-pill shadow-sm">PUBLISH SEMUA</button>
                                        <button onClick={() => handleActionMasal(0)} className="btn btn-danger btn-sm fw-bold px-3 rounded-pill shadow-sm">SEMBUNYIKAN SEMUA</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="row align-items-center mb-3 g-3">
                    <div className="col-md-6">
                        <h4 className="fw-bold text-dark m-0">Rekapitulasi Hasil</h4>
                    </div>
                    <div className="col-md-6">
                        <div className="input-group shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            <span className="input-group-text bg-white border-0 text-muted">🔍</span>
                            <input type="text" className="form-control border-0 shadow-none" placeholder="Cari berdasarkan Nama atau NIS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: '15px' }}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 text-nowrap">
                            <thead style={{ backgroundColor: colors.primary, color: '#fff' }}>
                                <tr className="text-uppercase small" style={{ letterSpacing: '1px' }}>
                                    {isAdmin && <th className="ps-4 py-3">Nama Lengkap</th>}
                                    <th className="ps-4 py-3">Sesi / Evaluasi</th>
                                    <th className="text-center py-3">Skor Akhir</th>
                                    <th className="text-center py-3">Durasi</th>
                                    {isAdmin && <th className="text-center py-3">Visibilitas</th>}
                                    <th className="text-end pe-4 py-3">{isAdmin ? 'Aksi' : 'Diselesaikan'}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {filteredNilai.length > 0 ? filteredNilai.map((n, i) => (
                                    <tr key={i} style={{ fontSize: '14px' }}>
                                        {isAdmin && <td className="ps-4"><div className="fw-bold text-dark">{n.nama}</div><small className="text-muted">{n.nis}</small></td>}
                                        <td className="ps-4"><div className="fw-bold" style={{ color: colors.primary }}>{n.percobaan_ke ? `Percobaan #${n.percobaan_ke}` : n.judul_ujian}</div><small className="text-muted">{n.judul_ujian}</small></td>
                                        <td className="text-center"><span className="badge rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: parseFloat(n.nilai) >= 75 ? '#198754' : colors.primary, minWidth: '45px' }}>{n.nilai}</span></td>
                                        <td className="text-center fw-bold text-muted">⏱ {hitungDurasi(n.waktu_mulai, n.waktu_selesai)}</td>
                                        {isAdmin && (
                                            <td className="text-center">
                                                <span className={`badge px-2 py-1 ${n.is_publish == 1 ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ border: `1px solid ${n.is_publish == 1 ? '#198754' : '#6c757d'}`, fontSize: '10px' }}>
                                                    {n.is_publish == 1 ? '● PUBLISHED' : '● HIDDEN'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="text-end pe-4">
                                            {isAdmin ? (
                                                <div className="btn-group shadow-sm border rounded-pill overflow-hidden bg-white">
                                                    <button onClick={() => navigate(`/detail-hasil/${n.id_hasil}`)} className="btn btn-sm btn-white border-end px-3" title="Lihat Detail">👁️</button>
                                                    <button onClick={() => handlePublish(n.id_hasil, n.is_publish)} className={`btn btn-sm fw-bold px-3 ${n.is_publish == 1 ? 'text-danger' : 'text-success'}`}>{n.is_publish == 1 ? 'HIDE' : 'SHOW'}</button>
                                                    <button onClick={() => handleHapusAttempt(n.id_hasil, n.nama)} className="btn btn-sm btn-white text-danger px-3" title="Hapus Data">🗑️</button>
                                                </div>
                                            ) : (
                                                <div className="small fw-bold text-muted text-uppercase">{new Date(n.waktu_selesai).toLocaleString('id-ID', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" className="text-center p-5 text-muted">{isAdmin && !selectedUjian ? "Silahkan pilih paket ujian." : "Data tidak ditemukan."}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4 row g-3">
                    <div className="col-md-4">
                        <div className="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-success h-100">
                            <small className="text-muted fw-bold d-block mb-1 text-uppercase">Nilai Tertinggi</small>
                            <h3 className="fw-bold m-0 text-success">{nilai.length > 0 ? Math.max(...nilai.map(o => parseFloat(o.nilai) || 0)) : 0}</h3>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-white rounded-4 shadow-sm border-start border-4 border-primary h-100">
                            <small className="text-muted fw-bold d-block mb-1 text-uppercase">Total Data</small>
                            <h3 className="fw-bold m-0" style={{ color: colors.primary }}>{nilai.length} <small className="fs-6 fw-normal">Sesi</small></h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NilaiExam;