<?php
include 'config.php';
$res = $conn->query("SELECT * FROM kategori_nilai ORDER BY dibuat_pada ASC");
$data = [];
while($row = $res->fetch_assoc()) { $data[] = $row; }
echo json_encode($data);
?>