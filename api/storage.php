<?php
/**
 * Storage monitoring API
 * Provides disk usage information and storage statistics
 */

// Protect endpoint with session validation
require_once __DIR__ . '/session.php';

header('Content-Type: application/json');

$config = require __DIR__ . '/../config.php';
$env = $config['env'];
$filesDir = $config['paths'][$env]['folder'];

/**
 * Get directory size recursively
 */
function getDirSize($dir) {
    $size = 0;

    if (!is_dir($dir)) {
        return 0;
    }

    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($files as $file) {
        if ($file->isFile()) {
            $size += $file->getSize();
        }
    }

    return $size;
}

/**
 * Count files by type
 */
function countFilesByType($dir) {
    $counts = [
        'audio' => 0,
        'video' => 0,
        'image' => 0,
        'other' => 0
    ];

    if (!is_dir($dir)) {
        return $counts;
    }

    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    $audioExt = ['mp3', 'wav', 'ogg'];
    $videoExt = ['mp4', 'mov', 'webm'];
    $imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    foreach ($files as $file) {
        if ($file->isFile()) {
            $ext = strtolower(pathinfo($file->getFilename(), PATHINFO_EXTENSION));

            if (in_array($ext, $audioExt)) {
                $counts['audio']++;
            } elseif (in_array($ext, $videoExt)) {
                $counts['video']++;
            } elseif (in_array($ext, $imageExt)) {
                $counts['image']++;
            } else {
                $counts['other']++;
            }
        }
    }

    return $counts;
}

/**
 * Format bytes to human readable
 */
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];

    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }

    return round($bytes, $precision) . ' ' . $units[$i];
}

// Get storage information
try {
    // Disk space (total and free)
    $diskTotal = disk_total_space($filesDir);
    $diskFree = disk_free_space($filesDir);
    $diskUsed = $diskTotal - $diskFree;
    $diskUsedPercent = ($diskTotal > 0) ? round(($diskUsed / $diskTotal) * 100, 2) : 0;

    // Files directory size
    $filesSize = getDirSize($filesDir);

    // Playlists directory size
    $playlistsDir = __DIR__ . '/../playlists';
    $playlistsSize = getDirSize($playlistsDir);

    // Logs directory size
    $logsDir = __DIR__ . '/../logs';
    $logsSize = getDirSize($logsDir);

    // Backups directory size
    $backupsDir = __DIR__ . '/../backups';
    $backupsSize = getDirSize($backupsDir);

    // Total app size
    $appSize = $filesSize + $playlistsSize + $logsSize + $backupsSize;

    // Count files by type
    $fileCounts = countFilesByType($filesDir);
    $totalFiles = array_sum($fileCounts);

    // Count playlists
    $playlistCount = 0;
    if (is_dir($playlistsDir)) {
        $playlists = glob($playlistsDir . '/*.json');
        $playlistCount = count($playlists);
    }

    // Calculate average file size
    $avgFileSize = $totalFiles > 0 ? $filesSize / $totalFiles : 0;

    // Determine status
    $status = 'ok';
    if ($diskUsedPercent >= 90) {
        $status = 'critical';
    } elseif ($diskUsedPercent >= 80) {
        $status = 'warning';
    }

    // Build response
    $response = [
        'success' => true,
        'status' => $status,
        'disk' => [
            'total' => $diskTotal,
            'used' => $diskUsed,
            'free' => $diskFree,
            'used_percent' => $diskUsedPercent,
            'total_formatted' => formatBytes($diskTotal),
            'used_formatted' => formatBytes($diskUsed),
            'free_formatted' => formatBytes($diskFree)
        ],
        'app' => [
            'total_size' => $appSize,
            'total_size_formatted' => formatBytes($appSize),
            'files' => [
                'size' => $filesSize,
                'size_formatted' => formatBytes($filesSize),
                'count' => $totalFiles,
                'average_size' => $avgFileSize,
                'average_size_formatted' => formatBytes($avgFileSize),
                'by_type' => $fileCounts
            ],
            'playlists' => [
                'size' => $playlistsSize,
                'size_formatted' => formatBytes($playlistsSize),
                'count' => $playlistCount
            ],
            'logs' => [
                'size' => $logsSize,
                'size_formatted' => formatBytes($logsSize)
            ],
            'backups' => [
                'size' => $backupsSize,
                'size_formatted' => formatBytes($backupsSize)
            ]
        ],
        'warnings' => []
    ];

    // Add warnings
    if ($diskUsedPercent >= 90) {
        $response['warnings'][] = 'Espacio en disco crítico (>90%)';
    } elseif ($diskUsedPercent >= 80) {
        $response['warnings'][] = 'Espacio en disco bajo (<20% libre)';
    }

    if ($logsSize > 100 * 1024 * 1024) { // 100 MB
        $response['warnings'][] = 'Logs ocupan mucho espacio (>100 MB)';
    }

    if ($backupsSize > 1 * 1024 * 1024 * 1024) { // 1 GB
        $response['warnings'][] = 'Backups ocupan mucho espacio (>1 GB)';
    }

    echo json_encode($response, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener información de almacenamiento',
        'message' => $e->getMessage()
    ]);
}
