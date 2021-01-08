<?php
header("Content-Type: text/plain");

$url = "https://apiv2.oroszi.net/elvira/maps";

echo file_get_contents($url);
?>