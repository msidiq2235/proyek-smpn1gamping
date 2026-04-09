<?php
include 'config.php';
$nis = isset($_GET['nis']) ? $conn->real_escape_string($_GET['nis']) : '';
$sql = "SELECT * FROM siswa WHERE nis='$nis'";
$res = $conn->query($sql);
if($res->num_rows > 0) echo json_encode(["profil" => $res->fetch_assoc()]);
else echo json_encode(["error" => "Siswa tidak ditemukan"]);
?>