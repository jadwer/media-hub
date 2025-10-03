<?php
// Protect endpoint with session validation
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/rateLimit.php';

// Rate limiting: Max deletes per minute
rateLimitDelete();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido. Use POST.']);
    exit;
}

// Configuración
$config = require __DIR__ . '/../config.php';
$env = $config['env'];
$folder = $config['paths'][$env]['folder'];

// Recibir nombre del archivo
$input = json_decode(file_get_contents('php://input'), true);
$fileName = $input['filename'] ?? null;

if (!$fileName) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nombre de archivo no proporcionado.']);
    exit;
}

// Validar que el nombre no contenga path traversal
if (strpos($fileName, '..') !== false || strpos($fileName, '/') !== false || strpos($fileName, '\\') !== false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nombre de archivo inválido.']);
    exit;
}

$filePath = $folder . '/' . $fileName;

// Verificar que el archivo existe
if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Archivo no encontrado.']);
    exit;
}

// Verificar que es un archivo (no un directorio)
if (!is_file($filePath)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La ruta no corresponde a un archivo.']);
    exit;
}

// Intentar eliminar el archivo
if (unlink($filePath)) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Archivo eliminado correctamente.',
        'filename' => $fileName
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al eliminar el archivo.']);
}
exit;
