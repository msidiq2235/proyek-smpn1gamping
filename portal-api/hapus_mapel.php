<?php
include 'config.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->id_mapel)) {
    $id = (int)$data->id_mapel;
    
    // 1. Cari tahu dulu siapa "nama" mapel yang mau dihapus ini
    $cek_mapel = $conn->query("SELECT nama_mapel FROM mata_pelajaran WHERE id_mapel = $id");
    
    if($cek_mapel->num_rows > 0) {
        $row = $cek_mapel->fetch_assoc();
        $nama_mapel = $row['nama_mapel'];
        
        // 2. HAPUS KE AKAR: Hapus semua nilai siswa yang berkaitan dengan mapel ini
        // Kita pakai prepare statement agar aman jika ada mapel pakai spasi atau tanda baca
        $stmt_hapus_nilai = $conn->prepare("DELETE FROM nilai_ujian WHERE mapel = ?");
        $stmt_hapus_nilai->bind_param("s", $nama_mapel);
        $stmt_hapus_nilai->execute();
        $stmt_hapus_nilai->close();
    }

    // 3. Terakhir, hapus mapel tersebut dari daftar master di Admin
    $sql_hapus_master = "DELETE FROM mata_pelajaran WHERE id_mapel = $id";
    
    if($conn->query($sql_hapus_master)) {
        echo json_encode(["success"=>true, "pesan"=>"Mapel beserta seluruh nilai siswanya berhasil dihapus!"]);
    } else {
        echo json_encode(["success"=>false, "error"=>$conn->error]);
    }
}
?>