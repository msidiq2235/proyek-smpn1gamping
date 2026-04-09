<?php
include 'config.php';
$nis = isset($_GET['nis']) ? $conn->real_escape_string($_GET['nis']) : '';
if($conn->query("DELETE FROM siswa WHERE nis='$nis'")) echo json_encode(["success"=>true]);
else echo json_encode(["success"=>false, "error"=>$conn->error]);
?>