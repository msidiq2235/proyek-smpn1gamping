<?php
include 'config.php';
$data = json_decode(file_get_contents("php://input"));
if(isset($data->nis)) {
    $nis = $conn->real_escape_string($data->nis);
    $nama = $conn->real_escape_string($data->nama);
    $password = $conn->real_escape_string($data->password);
    $rombel = $conn->real_escape_string($data->rombel);
    $asal = $conn->real_escape_string($data->asal_sekolah);
    
    $sql = "INSERT INTO siswa (nis, nama, password, rombel, asal_sekolah) VALUES ('$nis', '$nama', '$password', '$rombel', '$asal')";
    if($conn->query($sql)) echo json_encode(["success"=>true]);
    else echo json_encode(["success"=>false, "error"=>$conn->error]);
}
?>