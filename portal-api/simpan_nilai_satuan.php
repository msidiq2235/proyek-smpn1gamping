<?php
include 'config.php';
$data = json_decode(file_get_contents("php://input"), true);
if(isset($data['nis']) && isset($data['mapel'])) {
    $nis = $conn->real_escape_string($data['nis']);
    $mapel = $conn->real_escape_string($data['mapel']);
    
    $kategori = ''; $skor = 0;
    foreach($data as $key => $val) {
        if($key !== 'nis' && $key !== 'mapel') {
            $kategori = $conn->real_escape_string($key);
            $skor = (float)$val; break;
        }
    }
    
    if($kategori) {
        $sql = "INSERT INTO nilai_ujian (nis, mapel, `$kategori`) VALUES ('$nis', '$mapel', $skor) 
                ON DUPLICATE KEY UPDATE `$kategori` = $skor";
        if($conn->query($sql)) echo json_encode(["success"=>true]);
        else echo json_encode(["success"=>false, "error"=>$conn->error]);
    }
}
?>