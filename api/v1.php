<?php
// v1.php
// === HEADERS PARA API ===
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// === CONFIGURACIÓN ===
// Cambia manualmente según tu entorno
$isLocal = true; // true = desarrollo (localhost), false = producción (servidor)

$folder = $isLocal ? '../files' : __DIR__ . '/../files';
$webPath = '/files';

// === EXTENSIONES PERMITIDAS ===
$allowed_extensions = [
    'audio' => ['mp3', 'wav', 'ogg'],
    'video' => ['mp4', 'mov', 'webm'],
    'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp']
];

// === FUNCIONES ===
function getFileType($ext, $allowed_extensions)
{
    foreach ($allowed_extensions as $type => $exts) {
        if (in_array($ext, $exts)) {
            return $type;
        }
    }
    return 'other';
}

// === VALIDAR CARPETA ===
if (!is_dir($folder)) {
    echo json_encode(['error' => 'Carpeta no encontrada: ' . $folder]);
    exit;
}

// === ESCANEAR ARCHIVOS ===
$files = array_diff(scandir($folder), ['.', '..']);
$list = [];

foreach ($files as $file) {
    $filePath = $folder . '/' . $file;

    if (is_file($filePath)) {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $type = getFileType($ext, $allowed_extensions);

        $list[] = [
            'name' => $file,
            'url' => $webPath . '/' . rawurlencode($file),
            'sizeMB' => round(filesize($filePath) / 1024 / 1024, 2),
            'modified' => filemtime($filePath), // timestamp
            'type' => $type,
            'extension' => $ext
        ];
    }
}

// === ORDENAR LISTA ===
$order = isset($_GET['order']) ? strtolower($_GET['order']) : 'date';

if ($order === 'name') {
    usort($list, fn($a, $b) => strcmp($a['name'], $b['name']));
} elseif ($order === 'name_desc') {
    usort($list, fn($a, $b) => strcmp($b['name'], $a['name']));
} elseif ($order === 'date_asc') {
    usort($list, fn($a, $b) => $a['modified'] - $b['modified']);
} else {
    usort($list, fn($a, $b) => $b['modified'] - $a['modified']);
}

// === FORMATEAR FECHA LEGIBLE ===
foreach ($list as &$item) {
    $item['modified'] = date('Y-m-d H:i:s', $item['modified']);
}

// === RESPUESTA JSON ===
echo json_encode($list, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

/* 
=== EJEMPLO DE SALIDA ===
[
  {
    "name": "cancion1.mp3",
    "url": "/files/cancion1.mp3",
    "sizeMB": 5.43,
    "modified": "2025-04-28 11:32:21",
    "type": "audio",
    "extension": "mp3"
  },
  ...
]
*/