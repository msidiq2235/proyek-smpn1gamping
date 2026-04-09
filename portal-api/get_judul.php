<?php
include 'config.php';
$sql = "SELECT judul FROM pengaturan_judul WHERE id = 1";
$res = $conn->query($sql);
if ($res->num_rows > 0) {
    echo json_encode($res->fetch_assoc());
} else {
    echo json_encode(["judul" => "Laporan Hasil Evaluasi"]);
}
?>