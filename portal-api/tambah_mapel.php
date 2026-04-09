<?php
include 'config.php';
$data = json_decode(file_get_contents("php://input"));
if(isset($data->nama_mapel)) {
    $nama = $conn->real_escape_string($data->nama_mapel);
    $sql = "INSERT INTO mata_pelajaran (nama_mapel) VALUES ('$nama')";
    if($conn->query($sql)) echo json_encode(["success"=>true]);
    else echo json_encode(["success"=>false, "error"=>$conn->error]);
}
?>