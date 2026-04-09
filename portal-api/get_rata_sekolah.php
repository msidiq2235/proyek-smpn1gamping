<?php
include 'config.php';
// Ambil daftar kolom kategori secara dinamis
$katRes = $conn->query("SELECT id_kategori FROM kategori_nilai");
$selectCols = ["mapel"];
while($k = $katRes->fetch_assoc()) {
    $id = $k['id_kategori'];
    $selectCols[] = "AVG(`$id`) as `$id`";
}
$queryStr = implode(", ", $selectCols);

$sql = "SELECT $queryStr FROM nilai_ujian GROUP BY mapel";
$res = $conn->query($sql);
$data = [];
if($res) {
    while($row = $res->fetch_assoc()) { $data[] = $row; }
}
echo json_encode($data);
?>