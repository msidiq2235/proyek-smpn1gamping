<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$conn = new mysqli("localhost", "root", "", "db_penilaian_siswa");
if ($conn->connect_error) die(json_encode(["error" => "Koneksi Gagal"]));
$conn->set_charset("utf8");
?>