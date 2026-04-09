<?php
include 'config.php';
$nis = isset($_GET['nis']) ? $conn->real_escape_string($_GET['nis']) : '';
$res = $conn->query("SELECT * FROM nilai_ujian WHERE nis='$nis'");
$data = [];
while($row = $res->fetch_assoc()) { $data[] = $row; }
echo json_encode($data);
?>