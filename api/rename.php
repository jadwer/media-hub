<?php
/**
 * API endpoint to rename files
 * Validates file names and prevents path traversal attacks
 */

// Protect endpoint with session validation
require_once __DIR__ . '/session.php';

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido. Use POST.']);
    exit;
}

// Get configuration
$config = require __DIR__ . '/../config.php';
$env = $config['env'];
$folder = $config['paths'][$env]['folder'];

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['oldName']) || !isset($input['newName'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parámetros faltantes: oldName y newName son requeridos.']);
    exit;
}

$oldName = trim($input['oldName']);
$newName = trim($input['newName']);

// Validate old file name
if (empty($oldName) || strpos($oldName, '..') !== false || strpos($oldName, '/') !== false || strpos($oldName, '\\') !== false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nombre de archivo antiguo inválido.']);
    exit;
}

// Validate new file name
if (empty($newName) || strpos($newName, '..') !== false || strpos($newName, '/') !== false || strpos($newName, '\\') !== false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nombre de archivo nuevo inválido.']);
    exit;
}

// Check if new name contains only valid characters
if (!preg_match('/^[\w\-. ]+$/u', $newName)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El nombre solo puede contener letras, números, espacios, guiones y puntos.']);
    exit;
}

$oldPath = $folder . '/' . $oldName;
$newPath = $folder . '/' . $newName;

// Check if old file exists
if (!file_exists($oldPath)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Archivo original no encontrado.']);
    exit;
}

// Check if new file name already exists
if (file_exists($newPath)) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Ya existe un archivo con ese nombre.']);
    exit;
}

// Validate that extension remains the same
$oldExt = strtolower(pathinfo($oldName, PATHINFO_EXTENSION));
$newExt = strtolower(pathinfo($newName, PATHINFO_EXTENSION));

if ($oldExt !== $newExt) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No puedes cambiar la extensión del archivo.']);
    exit;
}

// Attempt to rename
if (rename($oldPath, $newPath)) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Archivo renombrado correctamente.',
        'oldName' => $oldName,
        'newName' => $newName
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al renombrar el archivo.']);
}
