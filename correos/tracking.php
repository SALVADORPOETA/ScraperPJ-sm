<?php
date_default_timezone_set('America/Mexico_City');

// Obtener el ID del query string
$id = isset($_GET['id']) ? $_GET['id'] : null;

if ($id) {
    $registro = [
        'id' => $id,
        'timestamp' => date('Y-m-d H:i:s')
    ];

    $file = 'tracking_data.json';
    $datos = [];

    if (file_exists($file)) {
        $datos = json_decode(file_get_contents($file), true);
    }

    if (!isset($datos[$id])) {
        $datos[$id] = [];
    }

    $datos[$id][] = $registro;

    file_put_contents($file, json_encode($datos, JSON_PRETTY_PRINT));
}

// Devolver una imagen de 1x1 (pixel transparente)
header('Content-Type: image/gif');
echo base64_decode('R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=');
exit;
?>
