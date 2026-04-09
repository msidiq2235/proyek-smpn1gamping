<?php
include 'config.php';
$data = json_decode(file_get_contents("php://input"));
if(isset($data->id_mapel)) {
    $id = (int)$data->id_mapel;
    $sql = "DELETE FROM mata_pelajaran WHERE id_mapel=$id";
    if($conn->query($sql)) echo json_encode(["success"=>true]);
    else echo json_encode(["success"=>false, "error"=>$conn->error]);
}
?>