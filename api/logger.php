<?php
/**
 * Error logging system
 * Logs errors and important events to file
 */

require_once __DIR__ . '/env.php';

/**
 * Log levels
 */
define('LOG_ERROR', 'ERROR');
define('LOG_WARNING', 'WARNING');
define('LOG_INFO', 'INFO');
define('LOG_DEBUG', 'DEBUG');

/**
 * Log a message to file
 * @param string $level - Log level (ERROR, WARNING, INFO, DEBUG)
 * @param string $message - Log message
 * @param array $context - Additional context data
 */
function logMessage($level, $message, $context = []) {
    $logDir = __DIR__ . '/../logs';

    // Create logs directory if it doesn't exist
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }

    $logFile = $logDir . '/app.log';
    $timestamp = date('Y-m-d H:i:s');
    $username = $_SESSION['username'] ?? 'anonymous';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

    // Format context as JSON if present
    $contextStr = !empty($context) ? ' | Context: ' . json_encode($context) : '';

    // Format log entry
    $logEntry = sprintf(
        "[%s] [%s] [User: %s] [IP: %s] %s%s\n",
        $timestamp,
        $level,
        $username,
        $ip,
        $message,
        $contextStr
    );

    // Write to log file
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

    // Also log to PHP error log for critical errors
    if ($level === LOG_ERROR) {
        error_log($message);
    }
}

/**
 * Log an error
 * @param string $message
 * @param array $context
 */
function logError($message, $context = []) {
    logMessage(LOG_ERROR, $message, $context);
}

/**
 * Log a warning
 * @param string $message
 * @param array $context
 */
function logWarning($message, $context = []) {
    logMessage(LOG_WARNING, $message, $context);
}

/**
 * Log info
 * @param string $message
 * @param array $context
 */
function logInfo($message, $context = []) {
    logMessage(LOG_INFO, $message, $context);
}

/**
 * Log debug info (only in development)
 * @param string $message
 * @param array $context
 */
function logDebug($message, $context = []) {
    $env = getenv('APP_ENV') ?: 'local';
    if ($env === 'local') {
        logMessage(LOG_DEBUG, $message, $context);
    }
}

/**
 * Set up error and exception handlers
 */
function setupErrorHandlers() {
    // Error handler
    set_error_handler(function($severity, $message, $file, $line) {
        logError("PHP Error: $message in $file:$line", [
            'severity' => $severity,
            'file' => $file,
            'line' => $line
        ]);

        // Don't execute PHP internal error handler
        return true;
    });

    // Exception handler
    set_exception_handler(function($exception) {
        logError("Uncaught Exception: " . $exception->getMessage(), [
            'exception' => get_class($exception),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ]);

        // Show generic error to user in production
        $env = getenv('APP_ENV') ?: 'local';
        if ($env === 'production') {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error interno del servidor'
            ]);
        } else {
            // Show detailed error in development
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine()
            ]);
        }
        exit;
    });

    // Shutdown handler for fatal errors
    register_shutdown_function(function() {
        $error = error_get_last();
        if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
            logError("Fatal Error: {$error['message']}", [
                'type' => $error['type'],
                'file' => $error['file'],
                'line' => $error['line']
            ]);
        }
    });
}

// Auto-setup error handlers when this file is included
setupErrorHandlers();
