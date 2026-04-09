<?php
include 'config.php';
$data = json_decode(file_get_contents("php://input"));
if(isset($data->nama_kategori)) {
    $nama = $conn->real_escape_string($data->nama_kategori);
    $id_kategori = 'kat_' . time(); // Membuat ID unik berdasar waktu
    
    // 1. Simpan nama kategorinya
    $sql1 = "INSERT INTO kategori_nilai (id_kategori, nama_kategori) VALUES ('$id_kategori', '$nama')";
    // 2. Buat kolom barunya di tabel nilai
    $sql2 = "ALTER TABLE nilai_ujian ADD COLUMN `$id_kategori` FLOAT DEFAULT 0";
    
    if($conn->query($sql1) && $conn->query($sql2)) echo json_encode(["success"=>true]);
    else echo json_encode(["success"=>false, "error"=>$conn->error]);
}
?>