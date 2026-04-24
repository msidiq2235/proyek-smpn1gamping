<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include '../config.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

$action = $_GET['action'] ?? '';

// --- 1. MASTER MAPEL ---
if ($action == 'get_mapel_exam') {
    $res = $conn->query("SELECT * FROM exam_mapel ORDER BY nama_mapel ASC");
    $data = [];
    if ($res) {
        while($row = $res->fetch_assoc()) { $data[] = $row; }
    }
    echo json_encode($data);
    exit();
}

// --- 2. DAFTAR UJIAN (Cek Kuota Percobaan Siswa) ---
if ($action == 'get_list_ujian') {
    $nis = mysqli_real_escape_string($conn, $_GET['nis'] ?? '');
    $sql = "SELECT u.*, m.nama_mapel AS mapel, 
            (SELECT COUNT(*) FROM exam_hasil WHERE id_ujian = u.id_ujian AND nis = '$nis') as jumlah_percobaan
            FROM exam_ujian u 
            JOIN exam_mapel m ON u.id_mapel = m.id_exam_mapel 
            WHERE u.status = 'aktif'";
    $res = $conn->query($sql);
    $data = [];
    while($row = $res->fetch_assoc()) { $data[] = $row; }
    echo json_encode($data);
    exit();
}

// --- 3. RIWAYAT NILAI PER PERCOBAAN (Sisi Siswa) ---
if ($action == 'get_riwayat_nilai') {
    $nis = mysqli_real_escape_string($conn, $_GET['nis']);
    $id_ujian = (int)$_GET['id_ujian'];
    $sql = "SELECT h.*, u.judul_ujian 
            FROM exam_hasil h
            JOIN exam_ujian u ON h.id_ujian = u.id_ujian
            WHERE h.nis = '$nis' AND h.id_ujian = $id_ujian AND h.is_publish = 1 
            ORDER BY h.waktu_selesai ASC";
    $res = $conn->query($sql);
    $data = [];
    $no = 1;
    while($row = $res->fetch_assoc()) {
        $row['percobaan_ke'] = $no++;
        $row['nilai'] = $row['nilai_total'];
        $data[] = $row;
    }
    echo json_encode($data);
    exit();
}

// --- 4. AMBIL SOAL & OPSI ---
if ($action == 'get_soal') {
    $id_ujian = (int)$_GET['id_ujian'];
    $sql_soal = "SELECT * FROM exam_soal WHERE id_ujian = $id_ujian ORDER BY id_soal ASC";
    $res_soal = $conn->query($sql_soal);
    $data = [];
    if ($res_soal) {
        while($soal = $res_soal->fetch_assoc()) {
            $id_soal = $soal['id_soal'];
            $res_opsi = $conn->query("SELECT id_opsi, teks_opsi, kunci_matching, is_benar FROM exam_opsi WHERE id_soal = $id_soal");
            $opsi = [];
            while($o = $res_opsi->fetch_assoc()) { $opsi[] = $o; }
            $soal['opsi'] = $opsi;
            $data[] = $soal;
        }
    }
    echo json_encode($data);
    exit();
}

// --- 5. SUBMIT JAWABAN & HITUNG SKOR (Revisi: Auto-correct Esai & Security) ---
if ($action == 'submit_ujian') {
    $input = json_decode(file_get_contents("php://input"), true);
    $nis = mysqli_real_escape_string($conn, $input['nis']);
    $id_ujian = (int)$input['id_ujian'];
    $jawaban_siswa = $input['jawaban']; 

    // SECURITY: Cek apakah jatah pengerjaan masih ada
    $q_cek = $conn->query("SELECT max_attempt FROM exam_ujian WHERE id_ujian = $id_ujian");
    $u_data = $q_cek->fetch_assoc();
    $max_a = (int)$u_data['max_attempt'];

    $q_count = $conn->query("SELECT COUNT(*) as total FROM exam_hasil WHERE id_ujian = $id_ujian AND nis = '$nis'");
    $curr_a = (int)$q_count->fetch_assoc()['total'];

    if ($curr_a >= $max_a) {
        echo json_encode(["success" => false, "error" => "Jatah percobaan Anda sudah habis!"]);
        exit();
    }

    // 1. Ambil data soal, opsi, dan Kunci Esai
    $sql_kunci = "SELECT s.id_soal, s.tipe_soal, s.bobot, s.kunci_esai, o.id_opsi, o.is_benar, o.kunci_matching 
                  FROM exam_soal s 
                  LEFT JOIN exam_opsi o ON s.id_soal = o.id_soal 
                  WHERE s.id_ujian = $id_ujian";
    $res_kunci = $conn->query($sql_kunci);
    
    $kunci_data = [];
    while($k = $res_kunci->fetch_assoc()) { 
        $kunci_data[$k['id_soal']][] = $k; 
    }

    $skor_didapat = 0;
    $total_bobot_ujian = 0;

    // 2. Hitung Skor
    foreach ($kunci_data as $id_s => $opsis) {
        $tipe = $opsis[0]['tipe_soal'];
        $bobot = (float)$opsis[0]['bobot'];
        $kunci_e = trim($opsis[0]['kunci_esai']); 
        
        $total_bobot_ujian += $bobot; 
        
        if ($tipe === 'pilgan') {
            $jawaban_benar_ids = [];
            foreach($opsis as $o) {
                if($o['is_benar'] == 1) $jawaban_benar_ids[] = $o['id_opsi'];
            }
            if (isset($jawaban_siswa[$id_s]) && in_array($jawaban_siswa[$id_s], $jawaban_benar_ids)) {
                $skor_didapat += $bobot;
            }
        } 
        else if ($tipe === 'matching') {
            $sub_benar = 0; 
            $total_match = count($opsis);
            foreach ($opsis as $o) {
                $key = $id_s . "_" . $o['id_opsi'];
                if (isset($jawaban_siswa[$key]) && $jawaban_siswa[$key] == $o['kunci_matching']) {
                    $sub_benar++;
                }
            }
            if ($total_match > 0) {
                $skor_didapat += ($sub_benar / $total_match) * $bobot;
            }
        }
        else if ($tipe === 'esai') {
            if (isset($jawaban_siswa[$id_s]) && !empty($kunci_e)) {
                $jawaban_s = trim($jawaban_siswa[$id_s]);
                if (stripos($jawaban_s, $kunci_e) !== false || stripos($kunci_e, $jawaban_s) !== false) {
                    $skor_didapat += $bobot;
                }
            }
        }
    }

    // 3. Ambil Target Skor Maksimal (misal 100)
    $q_target = $conn->query("SELECT total_bobot FROM exam_ujian WHERE id_ujian = $id_ujian");
    $target_maksimal = (float)($q_target->fetch_assoc()['total_bobot'] ?? 100);

    // 4. Hitung Nilai Akhir
    $nilai_akhir = ($total_bobot_ujian > 0) ? ($skor_didapat / $total_bobot_ujian) * $target_maksimal : 0;

    // 5. Simpan
    $j_json = mysqli_real_escape_string($conn, json_encode($jawaban_siswa));
    $sql = "INSERT INTO exam_hasil (nis, id_ujian, jawaban_json, nilai_total, status_koreksi, is_publish) 
            VALUES ('$nis', $id_ujian, '$j_json', $nilai_akhir, 'selesai', 0)";

    if ($conn->query($sql)) {
        echo json_encode(["success" => true, "nilai" => round($nilai_akhir, 2)]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
    exit();
}

// --- 6. TAMBAH / UPDATE UJIAN (ADMIN) ---
if ($action == 'tambah_ujian' || $action == 'update_ujian') {
    $input = json_decode(file_get_contents("php://input"), true);
    $judul = $conn->real_escape_string($input['judul_ujian']);
    $mapel = (int)$input['id_mapel'];
    $durasi = (int)$input['durasi'];
    $target = (float)($input['total_bobot'] ?? 100);
    $attempt = (int)($input['max_attempt'] ?? 1);

    if ($action == 'tambah_ujian') {
        $sql = "INSERT INTO exam_ujian (judul_ujian, id_mapel, durasi, total_bobot, max_attempt, status) 
                VALUES ('$judul', $mapel, $durasi, $target, $attempt, 'aktif')";
    } else {
        $id = (int)$input['id_ujian'];
        $sql = "UPDATE exam_ujian SET judul_ujian='$judul', id_mapel=$mapel, durasi=$durasi, total_bobot=$target, max_attempt=$attempt WHERE id_ujian=$id";
    }
    
    if ($conn->query($sql)) echo json_encode(["success" => true, "id_ujian" => $conn->insert_id]);
    else echo json_encode(["success" => false, "error" => $conn->error]);
    exit();
}

// --- 7. TAMBAH / UPDATE SOAL ---
if ($action == 'tambah_soal' || $action == 'update_soal') {
    $id_ujian = (int)$_POST['id_ujian'];
    $pertanyaan = $conn->real_escape_string($_POST['pertanyaan']);
    $tipe = $_POST['tipe_soal'];
    $bobot = (float)($_POST['bobot'] ?? 1);
    $kunci_esai = $conn->real_escape_string($_POST['kunci_esai'] ?? '');
    $opsi = isset($_POST['opsi']) ? json_decode($_POST['opsi'], true) : [];

    $nama_gambar = "";
    if (isset($_FILES['gambar_soal']) && $_FILES['gambar_soal']['error'] == 0) {
        $target_dir = "../uploads/exam/";
        if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);
        $ext = pathinfo($_FILES["gambar_soal"]["name"], PATHINFO_EXTENSION);
        $nama_gambar = "img_" . time() . "_" . uniqid() . "." . $ext;
        move_uploaded_file($_FILES["gambar_soal"]["tmp_name"], $target_dir . $nama_gambar);
    }

    if ($action == 'tambah_soal') {
        $sql = "INSERT INTO exam_soal (id_ujian, pertanyaan, tipe_soal, bobot, kunci_esai, gambar) 
                VALUES ($id_ujian, '$pertanyaan', '$tipe', $bobot, '$kunci_esai', '$nama_gambar')";
        $conn->query($sql);
        $id_soal = $conn->insert_id;
    } else {
        $id_soal = (int)$_POST['id_soal'];
        $up_img = ($nama_gambar != "") ? ", gambar='$nama_gambar'" : "";
        $sql = "UPDATE exam_soal SET pertanyaan='$pertanyaan', tipe_soal='$tipe', bobot=$bobot, kunci_esai='$kunci_esai' $up_img 
                WHERE id_soal=$id_soal";
        $conn->query($sql);
        $conn->query("DELETE FROM exam_opsi WHERE id_soal=$id_soal");
    }

    foreach ($opsi as $o) {
        $t = $conn->real_escape_string($o['teks']);
        $k = $conn->real_escape_string($o['kunci'] ?? '');
        $b = (int)($o['is_benar'] ?? 0);
        $conn->query("INSERT INTO exam_opsi (id_soal, teks_opsi, kunci_matching, is_benar) VALUES ($id_soal, '$t', '$k', $b)");
    }
    echo json_encode(["success" => true]);
    exit();
}

// --- 8. PUBLISH & REKAP NILAI ---
if ($action == 'toggle_publish') {
    $input = json_decode(file_get_contents("php://input"), true);
    $id = (int)$input['id_hasil'];
    $st = (int)$input['status'];
    $conn->query("UPDATE exam_hasil SET is_publish = $st WHERE id_hasil = $id");
    echo json_encode(["success" => true]);
    exit();
}

if ($action == 'get_semua_nilai' || $action == 'get_nilai_siswa') {
    $where = "";
    if ($action == 'get_nilai_siswa') {
        $nis = $conn->real_escape_string($_GET['nis']);
        $where = "WHERE h.nis = '$nis' AND h.is_publish = 1";
    }
    $sql = "SELECT h.*, s.nama, u.judul_ujian 
            FROM exam_hasil h
            LEFT JOIN siswa s ON h.nis = s.nis
            LEFT JOIN exam_ujian u ON h.id_ujian = u.id_ujian
            $where ORDER BY h.waktu_selesai DESC";
    $res = $conn->query($sql);
    $data = [];
    while($row = $res->fetch_assoc()) { 
        $row['nilai'] = $row['nilai_total'];
        $data[] = $row; 
    }
    echo json_encode($data);
    exit();
}

// --- 9. HAPUS UJIAN ---
if ($action == 'hapus_ujian') {
    $id = (int)$_GET['id_ujian'];
    $conn->query("DELETE FROM exam_ujian WHERE id_ujian = $id");
    echo json_encode(["success" => true]);
    exit();
}

// --- 10. CRUD MAPEL EXAM ---
if ($action == 'update_mapel_exam') {
    $input = json_decode(file_get_contents("php://input"), true);
    $id = (int)$input['id_mapel'];
    $nama = mysqli_real_escape_string($conn, $input['nama_mapel']);
    $sql = "UPDATE exam_mapel SET nama_mapel = '$nama' WHERE id_exam_mapel = $id";
    if ($conn->query($sql)) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false, "error" => $conn->error]);
    exit();
}

if ($action == 'hapus_mapel_exam') {
    $id = (int)$_GET['id_mapel'];
    $sql = "DELETE FROM exam_mapel WHERE id_exam_mapel = $id";
    if ($conn->query($sql)) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false, "error" => $conn->error]);
    exit();
}

if ($action == 'tambah_mapel_exam') {
    $input = json_decode(file_get_contents("php://input"), true);
    $nama = $conn->real_escape_string($input['nama_mapel']);
    $conn->query("INSERT INTO exam_mapel (nama_mapel) VALUES ('$nama')");
    echo json_encode(["success" => true]);
    exit();
}

// --- 11. HAPUS PERCOBAAN & DETAIL ---
if ($action == 'hapus_attempt') {
    $id_hasil = (int)$_GET['id_hasil'];
    if ($conn->query("DELETE FROM exam_hasil WHERE id_hasil = $id_hasil")) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
    exit();
}

if ($action == 'get_detail_hasil') {
    $id_hasil = (int)$_GET['id_hasil'];
    $q_hasil = $conn->query("SELECT * FROM exam_hasil WHERE id_hasil = $id_hasil");
    $data_hasil = $q_hasil->fetch_assoc();
    $jawaban_siswa = json_decode($data_hasil['jawaban_json'], true);
    $id_ujian = $data_hasil['id_ujian'];

    $sql_soal = "SELECT * FROM exam_soal WHERE id_ujian = $id_ujian ORDER BY id_soal ASC";
    $res_soal = $conn->query($sql_soal);
    
    $detail = [];
    while($soal = $res_soal->fetch_assoc()) {
        $id_s = $soal['id_soal'];
        $res_opsi = $conn->query("SELECT * FROM exam_opsi WHERE id_soal = $id_s");
        $opsi = [];
        while($o = $res_opsi->fetch_assoc()) { $opsi[] = $o; }
        
        $soal['opsi'] = $opsi;
        $soal['jawaban_siswa'] = $jawaban_siswa[$id_s] ?? null;
        
        if($soal['tipe_soal'] == 'matching') {
            $jwb_match = [];
            foreach($opsi as $op) {
                $key = $id_s . "_" . $op['id_opsi'];
                $jwb_match[$op['id_opsi']] = $jawaban_siswa[$key] ?? '';
            }
            $soal['jawaban_siswa_matching'] = $jwb_match;
        }
        $detail[] = $soal;
    }
    echo json_encode(["info" => $data_hasil, "soal" => $detail]);
    exit();
}

if ($action == 'update_nilai_manual') {
    $input = json_decode(file_get_contents("php://input"), true);
    $id_hasil = (int)$input['id_hasil'];
    $nilai_baru = (float)$input['nilai_baru'];
    $sql = "UPDATE exam_hasil SET nilai_total = $nilai_baru, status_koreksi = 'selesai' WHERE id_hasil = $id_hasil";
    if ($conn->query($sql)) echo json_encode(["success" => true]);
    else echo json_encode(["success" => false, "error" => $conn->error]);
    exit();
}
?>