<?php
include 'config.php';
if($conn->query("DELETE FROM siswa WHERE nis != 'admin'")) echo json_encode(["success"=>true]);
else echo json_encode(["success"=>false, "error"=>$conn->error]);
?>