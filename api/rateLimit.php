<?php
/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per time window
 */

require_once __DIR__ . '/env.php';

/**
 * Check if rate limit is exceeded
 * @param string $action - Action name (e.g., 'upload', 'delete')
 * @param int $maxRequests - Maximum requests allowed
 * @param int $windowSeconds - Time window in seconds
 * @return bool True if allowed, false if limit exceeded
 */
function checkRateLimit($action, $maxRequests, $windowSeconds) {
    $key = "ratelimit_{$action}";
    $now = time();

    // Initialize or get existing rate limit data
    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = [
            'requests' => [],
            'blocked_until' => 0
        ];
    }

    $data = &$_SESSION[$key];

    // Check if currently blocked
    if ($data['blocked_until'] > $now) {
        $remainingSeconds = $data['blocked_until'] - $now;
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'Demasiadas solicitudes. Intenta de nuevo en ' . $remainingSeconds . ' segundos.',
            'retry_after' => $remainingSeconds
        ]);
        exit;
    }

    // Remove old requests outside the time window
    $data['requests'] = array_filter($data['requests'], function($timestamp) use ($now, $windowSeconds) {
        return ($now - $timestamp) < $windowSeconds;
    });

    // Check if limit exceeded
    if (count($data['requests']) >= $maxRequests) {
        // Block for the window duration
        $data['blocked_until'] = $now + $windowSeconds;

        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => "Límite de $maxRequests solicitudes por $windowSeconds segundos excedido. Intenta más tarde.",
            'retry_after' => $windowSeconds
        ]);
        exit;
    }

    // Add current request
    $data['requests'][] = $now;

    return true;
}

/**
 * Rate limit for file uploads
 * Max 10 uploads per minute by default
 */
function rateLimitUpload() {
    $maxUploads = intval(getenv('MAX_UPLOADS_PER_MINUTE') ?: 10);
    $windowSeconds = 60;

    return checkRateLimit('upload', $maxUploads, $windowSeconds);
}

/**
 * Rate limit for file deletions
 * Max 20 deletes per minute
 */
function rateLimitDelete() {
    $maxDeletes = 20;
    $windowSeconds = 60;

    return checkRateLimit('delete', $maxDeletes, $windowSeconds);
}

/**
 * Rate limit for API requests
 * Max 100 requests per minute
 */
function rateLimitAPI() {
    $maxRequests = 100;
    $windowSeconds = 60;

    return checkRateLimit('api', $maxRequests, $windowSeconds);
}
