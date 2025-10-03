/**
 * Authentication utilities
 * Handles session validation and CSRF token management
 */

let csrfToken = null;

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function checkAuth() {
  try {
    const response = await fetch('/api/auth.php');
    const data = await response.json();

    if (data.authenticated) {
      csrfToken = data.csrf_token;
      return true;
    }

    // Not authenticated, redirect to login
    window.location.href = '/login.html';
    return false;
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '/login.html';
    return false;
  }
}

/**
 * Get CSRF token
 * @returns {string|null}
 */
export function getCSRFToken() {
  return csrfToken;
}

/**
 * Logout user
 */
export async function logout() {
  try {
    await fetch('/api/auth.php', {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': csrfToken
      }
    });

    window.location.href = '/login.html';
  } catch (error) {
    console.error('Logout failed:', error);
    window.location.href = '/login.html';
  }
}

/**
 * Wrapper for fetch that includes CSRF token
 * @param {string} url
 * @param {Object} options
 * @returns {Promise<Response>}
 */
export async function authFetch(url, options = {}) {
  const token = getCSRFToken();

  // Add CSRF token to headers for state-changing requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    options.headers = {
      ...options.headers,
      'X-CSRF-Token': token
    };
  }

  const response = await fetch(url, options);

  // Handle 401 (unauthorized) - redirect to login
  if (response.status === 401) {
    const data = await response.json();
    if (data.redirect) {
      window.location.href = data.redirect;
    } else {
      window.location.href = '/login.html';
    }
    throw new Error('Not authenticated');
  }

  return response;
}
