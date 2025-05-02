<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

// Configuración
$uploadDir = __DIR__ . '/../files/';
$maxSizeMB = 20;
$allowedExtensions = ['mp3','wav','ogg','mp4','mov','webm','jpg','jpeg','png','gif','webp'];
$allowedMimeTypes = [
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'video/mp4', 'video/quicktime', 'video/webm',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp'
];

$errors = [];

// Función segura para nombre único
function generateSafeName($name, $ext, $dir) {
    $slug = iconv('UTF-8', 'ASCII//TRANSLIT', pathinfo($name, PATHINFO_FILENAME));
    $slug = preg_replace('~[^A-Za-z0-9 _.-]~', '', $slug);
    $slug = preg_replace('~\\s+~', '_', $slug);
    $slug = trim($slug, '._');

    $safeName = $slug . '.' . $ext;
    $counter = 0;
    while (file_exists($dir . $safeName)) {
        $counter++;
        $safeName = $slug . '-' . $counter . '.' . $ext;
    }
    return $safeName;
}

// Reorganiza $_FILES si viene múltiple
function normalizeFilesArray($files) {
    if (!is_array($files['name'])) return [$files];
    $normalized = [];
    foreach ($files['name'] as $i => $name) {
        $normalized[] = [
            'name' => $name,
            'type' => $files['type'][$i],
            'tmp_name' => $files['tmp_name'][$i],
            'error' => $files['error'][$i],
            'size' => $files['size'][$i]
        ];
    }
    return $normalized;
}

if (!isset($_FILES['archivo'])) {
    echo json_encode(['success' => false, 'message' => 'No se recibió ningún archivo.']);
    exit;
}

$files = normalizeFilesArray($_FILES['archivo']);
$successCount = 0;

foreach ($files as $file) {
    if (!is_uploaded_file($file['tmp_name'])) {
        $errors[] = "Archivo inválido: {$file['name']}";
        continue;
    }

    $fileSizeMB = $file['size'] / 1024 / 1024;
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $mime = mime_content_type($file['tmp_name']);

    if ($fileSizeMB > $maxSizeMB) {
        $errors[] = "{$file['name']} excede el límite de {$maxSizeMB} MB.";
        continue;
    }
    if (!in_array($ext, $allowedExtensions)) {
        $errors[] = "{$file['name']} tiene extensión no permitida.";
        continue;
    }
    if (!in_array($mime, $allowedMimeTypes)) {
        $errors[] = "{$file['name']} tiene tipo MIME no permitido: $mime.";
        continue;
    }

    $safeName = generateSafeName($file['name'], $ext, $uploadDir);
    if (!move_uploaded_file($file['tmp_name'], $uploadDir . $safeName)) {
        $errors[] = "Error al mover {$file['name']}.";
        continue;
    }

    $successCount++;
}

echo json_encode([
    'success' => $successCount > 0,
    'uploaded' => $successCount,
    'errors' => $errors
]);
exit;
