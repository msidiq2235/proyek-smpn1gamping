<?php
// 1. PASTIKAN NAMA FILE INI BENAR (koneksi.php bukan config.php)
require 'config.php'; 

$data = json_decode(file_get_contents("php://input"), true);

// 2. Cek apakah NIS dan Mapel benar-benar ada isinya!
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
                
        if($conn->query($sql)) {
            echo json_encode(["success"=>true]);
        } else {
            // 3. JARING PENGAMAN: Paksa status 500 jika MySQL gagal (misal kolom kategori belum ada)
            http_response_code(500); 
            echo json_encode(["success"=>false, "error"=>$conn->error]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success"=>false, "error"=>"Kategori nilai tidak ditemukan!"]);
    }
} else {
    // 4. JARING PENGAMAN: Tolak mentah-mentah jika NIS/Mapel tidak terbaca dari Excel
    http_response_code(400);
    echo json_encode(["success"=>false, "error"=>"Data NIS atau Mapel KOSONG! Cek huruf besar/kecil di judul kolom Excel Anda!"]);
}
?>