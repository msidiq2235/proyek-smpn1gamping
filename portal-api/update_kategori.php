<?php
include 'config.php';
$data = json_decode(file_get_contents("php://input"));
if(isset($data->id_kategori) && isset($data->nama_kategori)) {
    $id = $conn->real_escape_string($data->id_kategori);
    $nama = $conn->real_escape_string($data->nama_kategori);
    
    $sql = "UPDATE kategori_nilai SET nama_kategori='$nama' WHERE id_kategori='$id'";
    if($conn->query($sql)) echo json_encode(["success"=>true]);
    else echo json_encode(["success"=>false, "error"=>$conn->error]);
}
?>