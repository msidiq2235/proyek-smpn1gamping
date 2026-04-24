<?php
include '../config.php';

$id_ujian = isset($_GET['id_ujian']) ? (int)$_GET['id_ujian'] : 0;

if ($id_ujian <= 0) {
    die(json_encode(["error" => "ID Ujian tidak valid"]));
}

// 1. Ambil Data Soal
$sql_soal = "SELECT * FROM exam_soal WHERE id_ujian = $id_ujian";
$res_soal = $conn->query($sql_soal);

$data_ujian = [];

while($soal = $res_soal->fetch_assoc()) {
    $id_soal = $soal['id_soal'];
    
    // 2. Ambil Opsi untuk setiap soal (Pilgan atau Matching)
    $sql_opsi = "SELECT id_opsi, teks_opsi, kunci_matching FROM exam_opsi WHERE id_soal = $id_soal";
    $res_opsi = $conn->query($sql_opsi);
    
    $opsi = [];
    while($o = $res_opsi->fetch_assoc()) {
        $opsi[] = $o;
    }
    
    $soal['opsi'] = $opsi;
    $data_ujian[] = $soal;
}

echo json_encode($data_ujian);
?>