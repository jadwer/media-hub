<?php
/**
 * API endpoint for playlist management (CRUD operations)
 * Stores playlists in JSON format
 */

// Protect endpoint with session validation
require_once __DIR__ . '/session.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get configuration
$config = require __DIR__ . '/../config.php';
$env = $config['env'];
$folder = $config['paths'][$env]['folder'];

// Playlists file path
$playlistsFile = $folder . '/playlists.json';

// Initialize playlists file if it doesn't exist
if (!file_exists($playlistsFile)) {
    file_put_contents($playlistsFile, json_encode([]));
}

// Get request method and input
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Route to appropriate handler
switch ($method) {
    case 'GET':
        handleGet();
        break;
    case 'POST':
        handlePost($input);
        break;
    case 'PUT':
        handlePut($input);
        break;
    case 'DELETE':
        handleDelete($input);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

/**
 * GET - List all playlists
 */
function handleGet() {
    global $playlistsFile;

    $playlists = json_decode(file_get_contents($playlistsFile), true);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'playlists' => $playlists,
        'total' => count($playlists)
    ]);
}

/**
 * POST - Create new playlist
 */
function handlePost($input) {
    global $playlistsFile;

    if (!isset($input['name']) || empty(trim($input['name']))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El nombre de la playlist es requerido']);
        return;
    }

    $playlists = json_decode(file_get_contents($playlistsFile), true);

    // Generate unique ID
    $id = uniqid('pl_');

    // Create new playlist
    $newPlaylist = [
        'id' => $id,
        'name' => trim($input['name']),
        'description' => isset($input['description']) ? trim($input['description']) : '',
        'files' => isset($input['files']) ? $input['files'] : [],
        'created' => time(),
        'updated' => time()
    ];

    $playlists[] = $newPlaylist;

    // Save to file
    if (file_put_contents($playlistsFile, json_encode($playlists, JSON_PRETTY_PRINT))) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Playlist creada correctamente',
            'playlist' => $newPlaylist
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al guardar la playlist']);
    }
}

/**
 * PUT - Update existing playlist
 */
function handlePut($input) {
    global $playlistsFile;

    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El ID de la playlist es requerido']);
        return;
    }

    $playlists = json_decode(file_get_contents($playlistsFile), true);
    $found = false;

    // Find and update playlist
    foreach ($playlists as &$playlist) {
        if ($playlist['id'] === $input['id']) {
            $found = true;

            // Update fields
            if (isset($input['name'])) {
                $playlist['name'] = trim($input['name']);
            }
            if (isset($input['description'])) {
                $playlist['description'] = trim($input['description']);
            }
            if (isset($input['files'])) {
                $playlist['files'] = $input['files'];
            }

            $playlist['updated'] = time();

            // Save to file
            if (file_put_contents($playlistsFile, json_encode($playlists, JSON_PRETTY_PRINT))) {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Playlist actualizada correctamente',
                    'playlist' => $playlist
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al guardar la playlist']);
            }

            break;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Playlist no encontrada']);
    }
}

/**
 * DELETE - Delete playlist
 */
function handleDelete($input) {
    global $playlistsFile;

    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El ID de la playlist es requerido']);
        return;
    }

    $playlists = json_decode(file_get_contents($playlistsFile), true);
    $initialCount = count($playlists);

    // Filter out the playlist to delete
    $playlists = array_values(array_filter($playlists, function($pl) use ($input) {
        return $pl['id'] !== $input['id'];
    }));

    if (count($playlists) < $initialCount) {
        // Playlist was found and removed
        if (file_put_contents($playlistsFile, json_encode($playlists, JSON_PRETTY_PRINT))) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Playlist eliminada correctamente'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al guardar los cambios']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Playlist no encontrada']);
    }
}
