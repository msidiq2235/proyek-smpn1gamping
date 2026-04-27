<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include '../config.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Otomatis mencari action dari URL (GET) atau dari Body (POST FormData)
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

switch ($action) {

    // --- 1. MASTER MAPEL ---
    case 'get_mapel_exam':
        $res = $conn->query("SELECT * FROM exam_mapel ORDER BY nama_mapel ASC");
        $data = [];
        while($row = $res->fetch_assoc()) { $data[] = $row; }
        echo json_encode($data);
        break;

    // --- 2. DAFTAR UJIAN (ADMIN/SISWA) ---
    case 'get_list_ujian':
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
        break;

    // --- 3. INFO DETAIL UJIAN (UNTUK VERIFIKASI TOKEN) ---
    case 'get_info_ujian':
        $id = (int)$_GET['id_ujian'];
        $sql = "SELECT judul_ujian, durasi, token, total_bobot, max_attempt FROM exam_ujian WHERE id_ujian = $id";
        $res = $conn->query($sql);
        echo json_encode($res->fetch_assoc());
        break;

    // --- 4. RIWAYAT NILAI (SISWA) ---
    case 'get_riwayat_nilai':
        $nis = mysqli_real_escape_string($conn, $_GET['nis']);
        $id_ujian = (int)$_GET['id_ujian'];
        $sql = "SELECT h.*, u.judul_ujian 
                FROM exam_hasil h
                JOIN exam_ujian u ON h.id_ujian = u.id_ujian
                WHERE h.nis = '$nis' AND h.id_ujian = $id_ujian 
                ORDER BY h.waktu_selesai ASC";
        $res = $conn->query($sql);
        $data = []; $no = 1;
        while($row = $res->fetch_assoc()) {
            $row['percobaan_ke'] = $no++;
            $row['nilai'] = $row['nilai_total'];
            $data[] = $row;
        }
        echo json_encode($data);
        break;

    // --- 5. AMBIL SOAL & OPSI ---
    case 'get_soal':
        $id_ujian = (int)$_GET['id_ujian'];
        $res_soal = $conn->query("SELECT * FROM exam_soal WHERE id_ujian = $id_ujian ORDER BY id_soal ASC");
        $data = [];
        while($soal = $res_soal->fetch_assoc()) {
            $id_s = $soal['id_soal'];
            $res_opsi = $conn->query("SELECT id_opsi, teks_opsi, kunci_matching, is_benar FROM exam_opsi WHERE id_soal = $id_s");
            $opsi = [];
            while($o = $res_opsi->fetch_assoc()) { $opsi[] = $o; }
            $soal['opsi'] = $opsi;
            $data[] = $soal;
        }
        echo json_encode($data);
        break;

    // --- 6. SUBMIT JAWABAN SISWA ---
    case 'submit_ujian':
        $input = json_decode(file_get_contents("php://input"), true);
        $nis = mysqli_real_escape_string($conn, $input['nis']);
        $id_ujian = (int)$input['id_ujian'];
        $jawaban_siswa = $input['jawaban']; 
        $waktu_mulai = mysqli_real_escape_string($conn, $input['waktu_mulai'] ?? date('Y-m-d H:i:s'));

        $sql_kunci = "SELECT s.id_soal, s.tipe_soal, s.bobot, s.kunci_esai, o.id_opsi, o.is_benar FROM exam_soal s LEFT JOIN exam_opsi o ON s.id_soal = o.id_soal WHERE s.id_ujian = $id_ujian";
        $res_kunci = $conn->query($sql_kunci);
        $kunci_data = [];
        while($k = $res_kunci->fetch_assoc()) { $kunci_data[$k['id_soal']][] = $k; }

        $skor_didapat = 0; $total_bobot_soal = 0;
        foreach ($kunci_data as $id_s => $opsis) {
            $tipe = $opsis[0]['tipe_soal'];
            $bobot = (float)$opsis[0]['bobot'];
            $total_bobot_soal += $bobot;
            if ($tipe === 'pilgan') {
                $k_id = null;
                foreach($opsis as $o) if($o['is_benar'] == 1) $k_id = $o['id_opsi'];
                if (isset($jawaban_siswa[$id_s]) && $jawaban_siswa[$id_s] == $k_id) $skor_didapat += $bobot;
            } else if ($tipe === 'esai') {
                $k_e = trim($opsis[0]['kunci_esai']);
                if (isset($jawaban_siswa[$id_s]) && stripos(trim($jawaban_siswa[$id_s]), $k_e) !== false) $skor_didapat += $bobot;
            }
        }
        $q_u = $conn->query("SELECT total_bobot FROM exam_ujian WHERE id_ujian = $id_ujian");
        $target_maks = (float)($q_u->fetch_assoc()['total_bobot'] ?? 100);
        $nilai_akhir = ($total_bobot_soal > 0) ? ($skor_didapat / $total_bobot_soal) * $target_maks : 0;
        $j_json = mysqli_real_escape_string($conn, json_encode($jawaban_siswa));
        $sql = "INSERT INTO exam_hasil (nis, id_ujian, jawaban_json, nilai_total, status_koreksi, is_publish, waktu_mulai) 
                VALUES ('$nis', $id_ujian, '$j_json', $nilai_akhir, 'selesai', 0, '$waktu_mulai')";
        if ($conn->query($sql)) echo json_encode(["success" => true, "nilai" => round($nilai_akhir, 2)]);
        else echo json_encode(["success" => false, "error" => $conn->error]);
        break;

    // --- 7. PUBLISH MASAL ---
    case 'publish_masal':
        $input = json_decode(file_get_contents("php://input"), true);
        $ids = $input['ids'] ?? [];
        $status = (int)($input['status'] ?? 1);
        if (!empty($ids)) {
            $id_list = implode(',', array_map('intval', $ids));
            $sql = "UPDATE exam_hasil SET is_publish = $status WHERE id_hasil IN ($id_list)";
            if ($conn->query($sql)) echo json_encode(["success" => true, "count" => $conn->affected_rows]);
            else echo json_encode(["success" => false, "error" => $conn->error]);
        }
        break;

    // --- 8. REKAP NILAI ADMIN (FILTER UJIAN) ---
    case 'get_semua_nilai':
        $id_u = (int)($_GET['id_ujian'] ?? 0);
        $where = "WHERE 1=1";
        if ($id_u > 0) $where .= " AND h.id_ujian = $id_u";
        $sql = "SELECT h.*, s.nama, u.judul_ujian FROM exam_hasil h
                LEFT JOIN siswa s ON h.nis = s.nis
                LEFT JOIN exam_ujian u ON h.id_ujian = u.id_ujian
                $where ORDER BY h.waktu_selesai DESC";
        $res = $conn->query($sql);
        $data = []; $no = 1;
        while($row = $res->fetch_assoc()) { 
            $row['percobaan_ke'] = $no++;
            $row['nilai'] = $row['nilai_total'];
            $data[] = $row; 
        }
        echo json_encode($data);
        break;

    // --- 9. GET NILAI SISWA ---
    case 'get_nilai_siswa':
        $nis = mysqli_real_escape_string($conn, $_GET['nis']);
        $sql = "SELECT h.*, s.nama, u.judul_ujian FROM exam_hasil h
                LEFT JOIN siswa s ON h.nis = s.nis
                LEFT JOIN exam_ujian u ON h.id_ujian = u.id_ujian
                WHERE h.nis = '$nis' AND h.is_publish = 1 
                ORDER BY h.waktu_selesai DESC";
        $res = $conn->query($sql);
        $data = [];
        while($row = $res->fetch_assoc()) { 
            $row['nilai'] = $row['nilai_total'];
            $data[] = $row; 
        }
        echo json_encode($data);
        break;

    // --- 10. CRUD UJIAN (TERMASUK TOKEN) ---
    case 'tambah_ujian':
    case 'update_ujian':
        $input = json_decode(file_get_contents("php://input"), true);
        $judul = $conn->real_escape_string($input['judul_ujian']);
        $mapel = (int)$input['id_mapel'];
        $durasi = (int)$input['durasi'];
        $target = (float)($input['total_bobot'] ?? 100);
        $attempt = (int)($input['max_attempt'] ?? 1);
        $token = $conn->real_escape_string($input['token'] ?? 'ABCDE');

        if ($action == 'tambah_ujian') {
            $sql = "INSERT INTO exam_ujian (judul_ujian, id_mapel, durasi, total_bobot, max_attempt, token, status) VALUES ('$judul', $mapel, $durasi, $target, $attempt, '$token', 'aktif')";
        } else {
            $id = (int)$input['id_ujian'];
            $sql = "UPDATE exam_ujian SET judul_ujian='$judul', id_mapel=$mapel, durasi=$durasi, total_bobot=$target, max_attempt=$attempt, token='$token' WHERE id_ujian=$id";
        }
        if ($conn->query($sql)) echo json_encode(["success" => true, "id_ujian" => ($action == 'tambah_ujian' ? $conn->insert_id : $id)]);
        break;

    case 'toggle_publish':
        $input = json_decode(file_get_contents("php://input"), true);
        $id = (int)$input['id_hasil'];
        $st = (int)$input['status'];
        $conn->query("UPDATE exam_hasil SET is_publish = $st WHERE id_hasil = $id");
        echo json_encode(["success" => true]);
        break;

    case 'hapus_attempt':
        $id = (int)$_GET['id_hasil'];
        $conn->query("DELETE FROM exam_hasil WHERE id_hasil = $id");
        echo json_encode(["success" => true]);
        break;

    case 'get_detail_hasil':
        $id_hasil = (int)$_GET['id_hasil'];
        $q_hasil = $conn->query("SELECT * FROM exam_hasil WHERE id_hasil = $id_hasil");
        $data_h = $q_hasil->fetch_assoc();
        $jawaban_s = json_decode($data_h['jawaban_json'], true);
        $id_u = $data_h['id_ujian'];
        $res_soal = $conn->query("SELECT * FROM exam_soal WHERE id_ujian = $id_u ORDER BY id_soal ASC");
        $detail = [];
        while($soal = $res_soal->fetch_assoc()) {
            $id_s = $soal['id_soal'];
            $res_o = $conn->query("SELECT * FROM exam_opsi WHERE id_soal = $id_s");
            $opsi = [];
            while($o = $res_o->fetch_assoc()) { $opsi[] = $o; }
            $soal['opsi'] = $opsi;
            $soal['jawaban_siswa'] = $jawaban_s[$id_s] ?? null;
            $detail[] = $soal;
        }
        echo json_encode(["info" => $data_h, "soal" => $detail]);
        break;

    // --- 11. CRUD SOAL (TAMBAH & UPDATE SOAL) ---
    case 'tambah_soal':
    case 'update_soal':
        // Karena React mengirim pakai FormData (ada file gambar), kita tangkap pakai $_POST
        $id_ujian = (int)$_POST['id_ujian'];
        $pertanyaan = $conn->real_escape_string($_POST['pertanyaan']);
        $tipe_soal = $conn->real_escape_string($_POST['tipe_soal']);
        $bobot = (float)$_POST['bobot'];
        $kunci_esai = $conn->real_escape_string($_POST['kunci_esai'] ?? '');
        $opsi_arr = json_decode($_POST['opsi'], true);
        
        $gambar_nama = null;
        
        // --- LOGIKA UPLOAD GAMBAR ---
        if(isset($_FILES['gambar_soal']) && $_FILES['gambar_soal']['error'] == 0) {
            $ext = pathinfo($_FILES['gambar_soal']['name'], PATHINFO_EXTENSION);
            $gambar_nama = time() . '_' . rand(100,999) . '.' . $ext;
            
            // Pastikan folder untuk menyimpan gambar ujian ini ada
            $target_dir = "../uploads/exam/";
            if (!is_dir($target_dir)) {
                mkdir($target_dir, 0777, true); // Buat folder otomatis kalau belum ada
            }
            move_uploaded_file($_FILES['gambar_soal']['tmp_name'], $target_dir . $gambar_nama);
        }

        // --- PROSES SIMPAN SOAL UTAMA ---
        if ($action == 'tambah_soal') {
            $gambar_insert = $gambar_nama ? "'$gambar_nama'" : "NULL";
            $sql_soal = "INSERT INTO exam_soal (id_ujian, pertanyaan, tipe_soal, bobot, gambar, kunci_esai) 
                         VALUES ($id_ujian, '$pertanyaan', '$tipe_soal', $bobot, $gambar_insert, '$kunci_esai')";
                         
            if($conn->query($sql_soal)) {
                $id_soal = $conn->insert_id; // Ambil ID soal yang baru saja dibuat
            } else {
                echo json_encode(["success" => false, "error" => "Gagal simpan soal: " . $conn->error]);
                exit;
            }
        } else {
            // Logika Update Soal
            $id_soal = (int)$_POST['id_soal'];
            $gambar_update = $gambar_nama ? "gambar = '$gambar_nama'," : ""; // Hanya update nama gambar kalau diganti
            
            $sql_soal = "UPDATE exam_soal SET pertanyaan='$pertanyaan', tipe_soal='$tipe_soal', bobot=$bobot, $gambar_update kunci_esai='$kunci_esai' WHERE id_soal=$id_soal";
            
            if(!$conn->query($sql_soal)) {
                echo json_encode(["success" => false, "error" => "Gagal update soal: " . $conn->error]);
                exit;
            }
            
            // Sapu bersih opsi lama sebelum memasukkan opsi yang baru (untuk update)
            $conn->query("DELETE FROM exam_opsi WHERE id_soal=$id_soal");
        }

        // --- PROSES SIMPAN OPSI (Pilihan Ganda / Matching) ---
        if ($tipe_soal != 'esai' && is_array($opsi_arr)) {
            foreach($opsi_arr as $o) {
                $teks = $conn->real_escape_string($o['teks'] ?? '');
                $kunci = $conn->real_escape_string($o['kunci'] ?? '');
                $is_benar = (int)($o['is_benar'] ?? 0);
                
                $conn->query("INSERT INTO exam_opsi (id_soal, teks_opsi, kunci_matching, is_benar) 
                              VALUES ($id_soal, '$teks', '$kunci', $is_benar)");
            }
        }

        echo json_encode(["success" => true, "message" => "Butir soal berhasil diamankan ke database!"]);
        break;

    default:
        echo json_encode(["error" => "Action not found"]);
        break;
}
?>