<?php
include 'config.php';
$res = $conn->query("SELECT * FROM mata_pelajaran ORDER BY id_mapel ASC");
$data = [];
while($row = $res->fetch_assoc()) { $data[] = $row; }
echo json_encode($data);
?>