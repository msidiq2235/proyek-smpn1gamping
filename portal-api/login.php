<?php
include 'config.php';
$data = json_decode(file_get_contents("php://input"));
if(isset($data->nis) && isset($data->password)){
    $nis = $conn->real_escape_string($data->nis);
    $pass = $conn->real_escape_string($data->password);
    $sql = "SELECT * FROM siswa WHERE nis='$nis' AND password='$pass'";
    $result = $conn->query($sql);
    if($result->num_rows > 0) echo json_encode(["success" => true, "user" => $result->fetch_assoc()]);
    else echo json_encode(["success" => false, "message" => "NIS atau Password salah"]);
}
?>