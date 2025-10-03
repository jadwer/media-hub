<?php
/**
 * Authentication API
 * Handles login, logout, and session validation
 */

require_once __DIR__ . '/env.php';
require_once __DIR__ . '/logger.php';

header('Content-Type: application/json');

// Start session with secure settings
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);

$sessionName = getenv('SESSION_NAME') ?: 'mediahub_session';
$sessionLifetime = intval(getenv('SESSION_LIFETIME') ?: 3600);

session_name($sessionName);
session_start();

// Set session timeout
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $sessionLifetime)) {
    session_unset();
    session_destroy();
    session_start();
}
$_SESSION['last_activity'] = time();

$method = $_SERVER['REQUEST_METHOD'];

/**
 * POST /api/auth.php - Login
 */
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    // Get credentials from environment
    $validUsername = getenv('AUTH_USERNAME') ?: 'admin';
    $validPassword = getenv('AUTH_PASSWORD') ?: 'admin';

    if ($username === $validUsername && $password === $validPassword) {
        // Regenerate session ID to prevent session fixation
        session_regenerate_id(true);

        $_SESSION['authenticated'] = true;
        $_SESSION['username'] = $username;
        $_SESSION['login_time'] = time();

        // Generate CSRF token
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

        logInfo("User logged in successfully", ['username' => $username]);

        echo json_encode([
            'success' => true,
            'message' => 'Login exitoso',
            'user' => $username,
            'csrf_token' => $_SESSION['csrf_token']
        ]);
    } else {
        logWarning("Failed login attempt", ['username' => $username]);

        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario o contraseña incorrectos'
        ]);
    }
    exit;
}

/**
 * DELETE /api/auth.php - Logout
 */
if ($method === 'DELETE') {
    $username = $_SESSION['username'] ?? 'unknown';

    session_unset();
    session_destroy();

    logInfo("User logged out", ['username' => $username]);

    echo json_encode([
        'success' => true,
        'message' => 'Logout exitoso'
    ]);
    exit;
}

/**
 * GET /api/auth.php - Check session status
 */
if ($method === 'GET') {
    if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
        echo json_encode([
            'authenticated' => true,
            'username' => $_SESSION['username'] ?? 'unknown',
            'login_time' => $_SESSION['login_time'] ?? null,
            'csrf_token' => $_SESSION['csrf_token'] ?? null
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'authenticated' => false,
            'message' => 'No autenticado'
        ]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
