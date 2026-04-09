<?php
include 'config.php';
$data = json_decode(file_get_contents("php://input"));
if (isset($data->judul)) {
    $judul = $conn->real_escape_string($data->judul);
    $sql = "UPDATE pengaturan_judul SET judul = '$judul' WHERE id = 1";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
}
?>