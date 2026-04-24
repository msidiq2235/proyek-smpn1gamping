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

$action = $_GET['action'] ?? '';

switch ($action) {

    // --- 1. MASTER MAPEL ---
    case 'get_mapel_exam':
        $res = $conn->query("SELECT * FROM exam_mapel ORDER BY nama_mapel ASC");
        $data = [];
        while($row = $res->fetch_assoc()) { $data[] = $row; }
        echo json_encode($data);
        break;

    // --- 2. DAFTAR UJIAN ---
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

    // --- 3. RIWAYAT NILAI (SISWA) ---
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

    // --- 4. AMBIL SOAL ---
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

    // --- 5. SUBMIT JAWABAN ---
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

        $skor_didapat = 0; $total_bobot_ujian = 0;
        foreach ($kunci_data as $id_s => $opsis) {
            $tipe = $opsis[0]['tipe_soal'];
            $bobot = (float)$opsis[0]['bobot'];
            $total_bobot_ujian += $bobot;
            if ($tipe === 'pilgan') {
                $kunci_benar = null;
                foreach($opsis as $o) { if($o['is_benar'] == 1) $kunci_benar = $o['id_opsi']; }
                if (isset($jawaban_siswa[$id_s]) && $jawaban_siswa[$id_s] == $kunci_benar) $skor_didapat += $bobot;
            } else if ($tipe === 'esai') {
                $k_e = trim($opsis[0]['kunci_esai']);
                if (isset($jawaban_siswa[$id_s]) && stripos(trim($jawaban_siswa[$id_s]), $k_e) !== false) $skor_didapat += $bobot;
            }
        }
        $q_target = $conn->query("SELECT total_bobot FROM exam_ujian WHERE id_ujian = $id_ujian");
        $target_maksimal = (float)($q_target->fetch_assoc()['total_bobot'] ?? 100);
        $nilai_akhir = ($total_bobot_ujian > 0) ? ($skor_didapat / $total_bobot_ujian) * $target_maksimal : 0;
        $j_json = mysqli_real_escape_string($conn, json_encode($jawaban_siswa));
        $sql = "INSERT INTO exam_hasil (nis, id_ujian, jawaban_json, nilai_total, status_koreksi, is_publish, waktu_mulai) 
                VALUES ('$nis', $id_ujian, '$j_json', $nilai_akhir, 'selesai', 0, '$waktu_mulai')";
        if ($conn->query($sql)) echo json_encode(["success" => true, "nilai" => round($nilai_akhir, 2)]);
        else echo json_encode(["success" => false, "error" => $conn->error]);
        break;

    // --- 6. PUBLISH MASAL ---
    case 'publish_masal':
    $input = json_decode(file_get_contents("php://input"), true);
    $ids = $input['ids'] ?? [];
    $status = (int)($input['status'] ?? 1); // <--- Sekarang statusnya dinamis (1 atau 0)
    
    if (!empty($ids)) {
        $id_list = implode(',', array_map('intval', $ids));
        $sql = "UPDATE exam_hasil SET is_publish = $status WHERE id_hasil IN ($id_list)";
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "count" => $conn->affected_rows]);
        } else {
            echo json_encode(["success" => false, "error" => $conn->error]);
        }
    }
    break;

    // --- 7. GET NILAI ADMIN (BERDASARKAN PILIHAN UJIAN) ---
    case 'get_semua_nilai':
        $id_u = (int)($_GET['id_ujian'] ?? 0);
        $where = "WHERE 1=1";
        if ($id_u > 0) {
            $where .= " AND h.id_ujian = $id_u";
        }
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

    // --- 8. GET NILAI SISWA ---
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
        $data_hasil = $q_hasil->fetch_assoc();
        $jawaban_siswa = json_decode($data_hasil['jawaban_json'], true);
        $id_ujian = $data_hasil['id_ujian'];
        $res_soal = $conn->query("SELECT * FROM exam_soal WHERE id_ujian = $id_ujian ORDER BY id_soal ASC");
        $detail = [];
        while($soal = $res_soal->fetch_assoc()) {
            $id_s = $soal['id_soal'];
            $res_opsi = $conn->query("SELECT * FROM exam_opsi WHERE id_soal = $id_s");
            $opsi = [];
            while($o = $res_opsi->fetch_assoc()) { $opsi[] = $o; }
            $soal['opsi'] = $opsi;
            $soal['jawaban_siswa'] = $jawaban_siswa[$id_s] ?? null;
            $detail[] = $soal;
        }
        echo json_encode(["info" => $data_hasil, "soal" => $detail]);
        break;

    default:
        echo json_encode(["error" => "Action not found"]);
        break;
}
?>