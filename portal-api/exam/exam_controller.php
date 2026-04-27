<?php
// Set Timezone agar durasi pengerjaan akurat (menghindari selisih 7 jam / 420 menit)
date_default_timezone_set('Asia/Jakarta');
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

// Menangkap action dari URL (GET) atau Body (POST FormData)
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

// Helper untuk mengambil input JSON (karena axios mengirim JSON secara default)
$json_input = json_decode(file_get_contents("php://input"), true);

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
                WHERE u.status = 'aktif'
                ORDER BY u.id_ujian DESC";
        $res = $conn->query($sql);
        $data = [];
        while($row = $res->fetch_assoc()) { $data[] = $row; }
        echo json_encode($data);
        break;

    // --- 3. INFO DETAIL UJIAN ---
    case 'get_info_ujian':
        $id = (int)($_GET['id_ujian'] ?? 0);
        $sql = "SELECT judul_ujian, durasi, token, total_bobot, max_attempt FROM exam_ujian WHERE id_ujian = $id";
        $res = $conn->query($sql);
        echo json_encode($res->fetch_assoc());
        break;

    // --- 4. AMBIL SOAL & OPSI ---
    case 'get_soal':
        $id_ujian = (int)($_GET['id_ujian'] ?? 0);
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

    // --- 5. SUBMIT JAWABAN SISWA (DENGAN FIX DURASI) ---
    case 'submit_ujian':
        $input = $json_input;
        $nis = mysqli_real_escape_string($conn, $input['nis']);
        $id_ujian = (int)$input['id_ujian'];
        $jawaban_siswa = $input['jawaban']; 
        
        // SINKRONISASI WAKTU: Gunakan jam PHP Jakarta
        $waktu_mulai = mysqli_real_escape_string($conn, $input['waktu_mulai'] ?? date('Y-m-d H:i:s'));
        $waktu_selesai = date('Y-m-d H:i:s'); 

        // Ambil kunci jawaban untuk scoring otomatis
        $sql_kunci = "SELECT s.id_soal, s.tipe_soal, s.bobot, s.kunci_esai, o.id_opsi, o.is_benar, o.kunci_matching 
                      FROM exam_soal s 
                      LEFT JOIN exam_opsi o ON s.id_soal = o.id_soal 
                      WHERE s.id_ujian = $id_ujian";
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
            } 
            else if ($tipe === 'matching') {
                $benar_baris = 0;
                $total_baris = count($opsis);
                foreach($opsis as $o) {
                    $key_matching = $id_s . "_" . $o['id_opsi'];
                    if (isset($jawaban_siswa[$key_matching]) && $jawaban_siswa[$key_matching] === $o['kunci_matching']) {
                        $benar_baris++;
                    }
                }
                // Skor proporsional untuk matching
                if ($total_baris > 0) $skor_didapat += ($benar_baris / $total_baris) * $bobot;
            }
            else if ($tipe === 'esai') {
                $k_e = trim($opsis[0]['kunci_esai']);
                if (!empty($k_e) && isset($jawaban_siswa[$id_s]) && stripos(trim($jawaban_siswa[$id_s]), $k_e) !== false) {
                    $skor_didapat += $bobot;
                }
            }
        }

        $q_u = $conn->query("SELECT total_bobot FROM exam_ujian WHERE id_ujian = $id_ujian");
        $target_maks = (float)($q_u->fetch_assoc()['total_bobot'] ?? 100);
        $nilai_akhir = ($total_bobot_soal > 0) ? ($skor_didapat / $total_bobot_soal) * $target_maks : 0;
        
        $j_json = mysqli_real_escape_string($conn, json_encode($jawaban_siswa));
        
        // Simpan menggunakan variabel waktu PHP agar tidak selisih 420 menit
        $sql = "INSERT INTO exam_hasil (nis, id_ujian, jawaban_json, nilai_total, status_koreksi, is_publish, waktu_mulai, waktu_selesai) 
                VALUES ('$nis', $id_ujian, '$j_json', $nilai_akhir, 'selesai', 0, '$waktu_mulai', '$waktu_selesai')";
        
        if ($conn->query($sql)) echo json_encode(["success" => true, "nilai" => round($nilai_akhir, 2)]);
        else echo json_encode(["success" => false, "error" => $conn->error]);
        break;

    // --- 6. REKAP NILAI (ADMIN) ---
    case 'get_semua_nilai':
        $id_u = (int)($_GET['id_ujian'] ?? 0);
        $where = ($id_u > 0) ? "WHERE h.id_ujian = $id_u" : "WHERE 1=1";
        $sql = "SELECT h.*, s.nama, u.judul_ujian FROM exam_hasil h
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
        break;

    // --- 7. NILAI SISWA (GET HASIL) ---
    case 'get_nilai_siswa':
        $nis = mysqli_real_escape_string($conn, $_GET['nis'] ?? '');
        $id_u = (int)($_GET['id_ujian'] ?? 0);
        $where = "WHERE h.nis = '$nis' AND h.is_publish = 1";
        if($id_u > 0) $where .= " AND h.id_ujian = $id_u";

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

    // --- 8. CRUD UJIAN ---
    case 'tambah_ujian':
    case 'update_ujian':
        $input = $json_input;
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

    case 'hapus_ujian':
        $id = (int)$_GET['id_ujian'];
        $conn->query("DELETE o FROM exam_opsi o JOIN exam_soal s ON o.id_soal = s.id_soal WHERE s.id_ujian = $id");
        $conn->query("DELETE FROM exam_soal WHERE id_ujian = $id");
        $conn->query("DELETE FROM exam_hasil WHERE id_ujian = $id");
        $conn->query("DELETE FROM exam_ujian WHERE id_ujian = $id");
        echo json_encode(["success" => true]);
        break;

    // --- 9. CRUD SOAL ---
    case 'tambah_soal':
    case 'update_soal':
        $id_ujian = (int)$_POST['id_ujian'];
        $pertanyaan = $conn->real_escape_string($_POST['pertanyaan']);
        $tipe_soal = $conn->real_escape_string($_POST['tipe_soal']);
        $bobot = (float)$_POST['bobot'];
        $kunci_esai = $conn->real_escape_string($_POST['kunci_esai'] ?? '');
        $opsi_arr = json_decode($_POST['opsi'], true);
        
        $gambar_nama = null;
        if(isset($_FILES['gambar_soal']) && $_FILES['gambar_soal']['error'] == 0) {
            $ext = pathinfo($_FILES['gambar_soal']['name'], PATHINFO_EXTENSION);
            $gambar_nama = time() . '_' . rand(100,999) . '.' . $ext;
            $target_dir = "../uploads/exam/";
            if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);
            move_uploaded_file($_FILES['gambar_soal']['tmp_name'], $target_dir . $gambar_nama);
        }

        if ($action == 'tambah_soal') {
            $g_val = $gambar_nama ? "'$gambar_nama'" : "NULL";
            $conn->query("INSERT INTO exam_soal (id_ujian, pertanyaan, tipe_soal, bobot, gambar, kunci_esai) VALUES ($id_ujian, '$pertanyaan', '$tipe_soal', $bobot, $g_val, '$kunci_esai')");
            $id_soal = $conn->insert_id;
        } else {
            $id_soal = (int)$_POST['id_soal'];
            $g_update = $gambar_nama ? ", gambar = '$gambar_nama'" : "";
            $conn->query("UPDATE exam_soal SET pertanyaan='$pertanyaan', tipe_soal='$tipe_soal', bobot=$bobot $g_update, kunci_esai='$kunci_esai' WHERE id_soal=$id_soal");
            $conn->query("DELETE FROM exam_opsi WHERE id_soal=$id_soal");
        }

        if ($tipe_soal != 'esai' && is_array($opsi_arr)) {
            foreach($opsi_arr as $o) {
                $teks = $conn->real_escape_string($o['teks'] ?? '');
                $kunci = $conn->real_escape_string($o['kunci'] ?? '');
                $is_benar = (int)($o['is_benar'] ?? 0);
                $conn->query("INSERT INTO exam_opsi (id_soal, teks_opsi, kunci_matching, is_benar) VALUES ($id_soal, '$teks', '$kunci', $is_benar)");
            }
        }
        echo json_encode(["success" => true]);
        break;

    // --- 10. DETAIL HASIL (AUDIT FIX MATCHING) ---
    case 'get_detail_hasil':
        $id_hasil = (int)$_GET['id_hasil'];
        $q_hasil = $conn->query("SELECT h.*, s.nama FROM exam_hasil h LEFT JOIN siswa s ON h.nis = s.nis WHERE h.id_hasil = $id_hasil");
        $data_h = $q_hasil->fetch_assoc();
        $jawaban_s = json_decode($data_h['jawaban_json'] ?? '{}', true);
        $id_u = $data_h['id_ujian'];
        
        $res_soal = $conn->query("SELECT * FROM exam_soal WHERE id_ujian = $id_u ORDER BY id_soal ASC");
        $detail = [];
        while($soal = $res_soal->fetch_assoc()) {
            $id_s = $soal['id_soal'];
            $res_o = $conn->query("SELECT * FROM exam_opsi WHERE id_soal = $id_s");
            $opsi = [];
            while($o = $res_o->fetch_assoc()) { $opsi[] = $o; }
            $soal['opsi'] = $opsi;
            
            if ($soal['tipe_soal'] === 'matching') {
                $ans_m = [];
                foreach($opsi as $o) {
                    $key = $id_s . "_" . $o['id_opsi'];
                    $ans_m[$o['id_opsi']] = $jawaban_s[$key] ?? null;
                }
                $soal['jawaban_siswa_matching'] = $ans_m;
            } else {
                $soal['jawaban_siswa'] = $jawaban_s[$id_s] ?? null;
            }
            $detail[] = $soal;
        }
        echo json_encode(["info" => $data_h, "soal" => $detail]);
        break;

    case 'update_nilai_manual':
        $input = $json_input;
        $id = (int)$input['id_hasil'];
        $nilai = (float)$input['nilai_baru'];
        $conn->query("UPDATE exam_hasil SET nilai_total = $nilai, status_koreksi = 'selesai' WHERE id_hasil = $id");
        echo json_encode(["success" => true]);
        break;

    case 'publish_masal':
        $input = $json_input;
        $ids = $input['ids'] ?? [];
        $status = (int)($input['status'] ?? 1);
        if (!empty($ids)) {
            $id_list = implode(',', array_map('intval', $ids));
            $conn->query("UPDATE exam_hasil SET is_publish = $status WHERE id_hasil IN ($id_list)");
            echo json_encode(["success" => true]);
        }
        break;

    case 'toggle_publish':
        $input = $json_input;
        $id = (int)$input['id_hasil'];
        $st = (int)$input['status'];
        $conn->query("UPDATE exam_hasil SET is_publish = $st WHERE id_hasil = $id");
        echo json_encode(["success" => true]);
        break;

    case 'hapus_attempt':
        $id = (int)($_GET['id_hasil'] ?? 0);
        $conn->query("DELETE FROM exam_hasil WHERE id_hasil = $id");
        echo json_encode(["success" => true]);
        break;

    // --- MASTER MAPEL EXAM ---
    case 'tambah_mapel_exam':
        $input = $json_input;
        $nama = $conn->real_escape_string($input['nama_mapel'] ?? '');
        $conn->query("INSERT INTO exam_mapel (nama_mapel) VALUES ('$nama')");
        echo json_encode(["success" => true]);
        break;

    case 'update_mapel_exam':
        $input = $json_input;
        $id = (int)($input['id_mapel'] ?? 0);
        $nama = $conn->real_escape_string($input['nama_mapel'] ?? '');
        $conn->query("UPDATE exam_mapel SET nama_mapel = '$nama' WHERE id_exam_mapel = $id");
        echo json_encode(["success" => true]);
        break;

    case 'hapus_mapel_exam':
        $id = (int)($_GET['id_mapel'] ?? 0);
        $conn->query("DELETE FROM exam_mapel WHERE id_exam_mapel = $id");
        echo json_encode(["success" => true]);
        break;

    default:
        echo json_encode(["error" => "Action '$action' not found"]);
        break;
}
?>