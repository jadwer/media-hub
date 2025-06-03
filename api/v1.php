<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// === CONFIGURACIÓN ===
require_once __DIR__ . '/utils.php';
$config = require __DIR__ . '/../config.php';

$env = $config['env'];
$folder = $config['paths'][$env]['folder'];
$webPath = $config['paths'][$env]['webPath'];

$allowed_extensions = [
    'audio' => ['mp3', 'wav', 'ogg'],
    'video' => ['mp4', 'mov', 'webm'],
    'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp']
];

// === PARÁMETROS GET ===
$type = isset($_GET['type']) ? strtolower($_GET['type']) : 'all';
$order = isset($_GET['order']) ? strtolower($_GET['order']) : 'date_desc';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$perPage = isset($_GET['perPage']) ? max(1, intval($_GET['perPage'])) : 10;

// === ESCANEO DE ARCHIVOS ===
if (!is_dir($folder)) {
    echo json_encode(['error' => 'Carpeta no encontrada: '.$folder]);
    exit;
}

$allFiles = array_diff(scandir($folder), ['.', '..']);
$items = [];

foreach ($allFiles as $file) {
    $filePath = $folder . '/' . $file;
    if (!is_file($filePath)) continue;

    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $fileType = getFileType($ext, $allowed_extensions);

    if ($type !== 'all' && $fileType !== $type) continue;

    $items[] = [
        'name' => $file,
        'url' => $webPath . '/' . rawurlencode($file),
        'sizeMB' => round(filesize($filePath) / 1024 / 1024, 2),
        'modified' => filemtime($filePath),
        'type' => $fileType,
        'extension' => $ext
    ];
}

// === ORDENAMIENTO ===
switch ($order) {
    case 'name_asc':
        usort($items, fn($a, $b) => strcmp($a['name'], $b['name']));
        break;
    case 'name_desc':
        usort($items, fn($a, $b) => strcmp($b['name'], $a['name']));
        break;
    case 'date_asc':
        usort($items, fn($a, $b) => $a['modified'] - $b['modified']);
        break;
    default: // date_desc
        usort($items, fn($a, $b) => $b['modified'] - $a['modified']);
        break;
}

// === PAGINACIÓN ===
$total = count($items);
$offset = ($page - 1) * $perPage;
$pagedItems = array_slice($items, $offset, $perPage);

// === FORMATO DE RESPUESTA ===
foreach ($pagedItems as &$item) {
    $item['modified'] = date('Y-m-d H:i:s', $item['modified']);
}

$response = [
    'type' => $type,
    'page' => $page,
    'perPage' => $perPage,
    'total' => $total,
    'order' => $order,
    'files' => $pagedItems
];

echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
