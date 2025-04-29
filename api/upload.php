<?php
session_start();

// Configuración
$uploadDir = __DIR__ . '/../files/';
$maxSizeMB = 20;
$allowedExtensions = [
    'mp3',
    'wav',
    'ogg',
    'mp4',
    'mov',
    'webm',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp'
];
$allowedMimeTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

// Función para generar un nombre seguro
function generateSafeName($extension)
{
    return time() . '_' . bin2hex(random_bytes(5)) . '.' . $extension;
}

// Validación principal
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['archivo'])) {
    $errores = [];

    foreach ($_FILES['archivo']['tmp_name'] as $index => $tmpName) {
        if (!is_uploaded_file($tmpName)) {
            $errores[] = "Archivo inválido (no es upload válido).";
            continue;
        }

        // Verificar tamaño
        $fileSizeMB = filesize($tmpName) / 1024 / 1024;
        if ($fileSizeMB > $maxSizeMB) {
            $errores[] = "Archivo demasiado grande (" . round($fileSizeMB, 2) . " MB). Máximo permitido: {$maxSizeMB} MB.";
            continue;
        }

        $originalName = $_FILES['archivo']['name'][$index];
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        // Validar extensión
        if (!in_array($extension, $allowedExtensions)) {
            $errores[] = "Extensión no permitida: {$originalName}";
            continue;
        }

        // Validar tipo MIME real
        $mime = mime_content_type($tmpName);
        if (!in_array($mime, $allowedMimeTypes)) {
            $errores[] = "Tipo MIME inválido para: {$originalName} (detectado: {$mime})";
            continue;
        }

        // Generar nombre seguro

        $clean = preg_replace('~[^a-zA-Z0-9 _.-]~', '', pathinfo($originalName, PATHINFO_FILENAME));
        $clean = preg_replace('~\\s+~', '_', $clean);       // espacios → guión bajo
        $clean = trim($clean, '._');                        // limpia bordes
        // si existe duplicado, agrega -1, -2…
        $counter = 0;
        $safeName = $clean . '.' . $extension;
        while (file_exists($uploadDir . $safeName)) {
            $counter++;
            $safeName = $clean . '-' . $counter . '.' . $extension;
        }

        $targetPath = $uploadDir . $safeName;

        // Mover el archivo
        if (!move_uploaded_file($tmpName, $targetPath)) {
            $errores[] = "Error al mover archivo: {$originalName}";
        }
    }

    if (!empty($errores)) {
        $_SESSION['upload_error'] = implode('<br>', $errores);
    } else {
        $_SESSION['upload_success'] = "¡Archivo(s) subido(s) exitosamente!";
    }

    // Redirigir para limpiar POST
    header("Location: ../index.html");
    exit;
} else {
    http_response_code(405);
    echo "Método no permitido.";
}
