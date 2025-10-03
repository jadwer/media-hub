<?php
/**
 * Security headers configuration
 * Sets secure HTTP headers to protect against common web vulnerabilities
 */

/**
 * Set security headers
 */
function setSecurityHeaders() {
    // Content Security Policy (CSP)
    // Prevents XSS attacks by controlling which resources can be loaded
    header("Content-Security-Policy: " .
        "default-src 'self'; " .
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " .  // Allow inline scripts for now
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
        "font-src 'self' https://fonts.gstatic.com; " .
        "img-src 'self' data: blob:; " .
        "media-src 'self' blob:; " .
        "connect-src 'self'; " .
        "frame-ancestors 'none';"
    );

    // X-Content-Type-Options
    // Prevents MIME type sniffing
    header("X-Content-Type-Options: nosniff");

    // X-Frame-Options
    // Prevents clickjacking attacks
    header("X-Frame-Options: DENY");

    // X-XSS-Protection
    // Enables browser's XSS filter (legacy, but still useful for older browsers)
    header("X-XSS-Protection: 1; mode=block");

    // Referrer-Policy
    // Controls how much referrer information is sent
    header("Referrer-Policy: strict-origin-when-cross-origin");

    // Permissions-Policy (formerly Feature-Policy)
    // Controls which browser features can be used
    header("Permissions-Policy: " .
        "geolocation=(), " .
        "microphone=(), " .
        "camera=(), " .
        "payment=(), " .
        "usb=(), " .
        "magnetometer=(), " .
        "gyroscope=(), " .
        "accelerometer=()"
    );

    // Strict-Transport-Security (HSTS)
    // Forces HTTPS connections (only set if using HTTPS)
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
    }

    // Remove server information headers
    header_remove("X-Powered-By");
}

// Auto-apply security headers when this file is included
setSecurityHeaders();
