<?php
/**
 * Session validation middleware
 * Include this file at the top of protected endpoints
 */

require_once __DIR__ . '/env.php';

// Start session with secure settings
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);

$sessionName = getenv('SESSION_NAME') ?: 'mediahub_session';
$sessionLifetime = intval(getenv('SESSION_LIFETIME') ?: 3600);

session_name($sessionName);
session_start();

// Check session timeout
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $sessionLifetime)) {
    session_unset();
    session_destroy();
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Sesión expirada',
        'redirect' => '/login.html'
    ]);
    exit;
}

// Update last activity time
$_SESSION['last_activity'] = time();

// Validate authentication
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'No autenticado',
        'redirect' => '/login.html'
    ]);
    exit;
}

/**
 * Validate CSRF token for state-changing requests
 */
function validateCSRF() {
    $method = $_SERVER['REQUEST_METHOD'];

    // Only validate for state-changing methods
    if (!in_array($method, ['POST', 'PUT', 'DELETE', 'PATCH'])) {
        return true;
    }

    $token = null;

    // Check for token in headers
    if (isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'];
    }
    // Check for token in POST data
    elseif (isset($_POST['csrf_token'])) {
        $token = $_POST['csrf_token'];
    }
    // Check for token in JSON body
    else {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        if (isset($data['csrf_token'])) {
            $token = $data['csrf_token'];
        }
    }

    $sessionToken = $_SESSION['csrf_token'] ?? null;

    if (!$token || !$sessionToken || !hash_equals($sessionToken, $token)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'Token CSRF inválido'
        ]);
        exit;
    }

    return true;
}

// Auto-validate CSRF for protected endpoints
validateCSRF();
