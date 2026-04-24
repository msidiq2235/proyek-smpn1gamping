<?php
include '../config.php';

$sql = "SELECT u.*, m.mapel 
        FROM exam_ujian u 
        JOIN mata_pelajaran m ON u.id_mapel = m.id_mapel 
        WHERE u.status = 'aktif'";

$res = $conn->query($sql);
$data = [];
while($row = $res->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
?>