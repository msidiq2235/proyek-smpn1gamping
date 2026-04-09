<?php
include 'config.php';
$data = json_decode(file_get_contents("php://input"));
if(isset($data->id_kategori)) {
    $id = $conn->real_escape_string($data->id_kategori);
    
    // 1. Hapus dari daftar
    $sql1 = "DELETE FROM kategori_nilai WHERE id_kategori='$id'";
    // 2. Hapus kolom beserta seluruh isinya dari tabel nilai
    $sql2 = "ALTER TABLE nilai_ujian DROP COLUMN `$id`";
    
    $conn->query($sql2); // Eksekusi hapus kolom
    if($conn->query($sql1)) echo json_encode(["success"=>true]);
    else echo json_encode(["success"=>false, "error"=>$conn->error]);
}
?>