<?php
include 'config.php';
$res = $conn->query("SELECT * FROM siswa ORDER BY nis ASC");
$data = [];
while($row = $res->fetch_assoc()) { $data[] = $row; }
echo json_encode($data);
?>