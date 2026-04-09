<?php
include 'config.php';
$res = $conn->query("SELECT * FROM nilai_ujian");
$data = [];
while($row = $res->fetch_assoc()) { $data[] = $row; }
echo json_encode($data);
?>