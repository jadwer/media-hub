/**
 * @fileoverview Toast notification system for user feedback.
 * Provides non-intrusive notifications with different types and auto-dismiss.
 */

/** @type {number} Auto-dismiss timeout in milliseconds */
const DEFAULT_DURATION = 4000;

/**
 * Toast types with their corresponding icons and styles
 */
const TOAST_TYPES = {
  success: { icon: '✅', class: 'toast-success' },
  error: { icon: '❌', class: 'toast-error' },
  warning: { icon: '⚠️', class: 'toast-warning' },
  info: { icon: 'ℹ️', class: 'toast-info' }
};

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Toast configuration
 * @param {string} [options.type='info'] - Toast type (success|error|warning|info)
 * @param {number} [options.duration=4000] - Duration in ms (0 for persistent)
 * @param {boolean} [options.dismissible=true] - Can be manually dismissed
 */
export function showToast(message, { type = 'info', duration = DEFAULT_DURATION, dismissible = true } = {}) {
  // Ensure toast container exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Get toast configuration
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${config.class}`;

  // Create icon
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = config.icon;

  // Create message
  const messageEl = document.createElement('span');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(messageEl);

  // Add close button if dismissible
  if (dismissible) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.textContent = '✕';
    closeBtn.onclick = () => removeToast(toast);
    toast.appendChild(closeBtn);
  }

  // Add to container with animation
  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('toast-show'), 10);

  // Auto-dismiss if duration is set
  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }

  return toast;
}

/**
 * Removes a toast with animation
 * @param {HTMLElement} toast - The toast element to remove
 */
function removeToast(toast) {
  if (!toast || !toast.parentElement) return;

  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');

  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 300);
}

/**
 * Shows a success toast
 * @param {string} message - Success message
 * @param {Object} options - Additional options
 */
export function showSuccess(message, options = {}) {
  return showToast(message, { ...options, type: 'success' });
}

/**
 * Shows an error toast
 * @param {string} message - Error message
 * @param {Object} options - Additional options
 */
export function showError(message, options = {}) {
  return showToast(message, { ...options, type: 'error', duration: 6000 });
}

/**
 * Shows a warning toast
 * @param {string} message - Warning message
 * @param {Object} options - Additional options
 */
export function showWarning(message, options = {}) {
  return showToast(message, { ...options, type: 'warning', duration: 5000 });
}

/**
 * Shows an info toast
 * @param {string} message - Info message
 * @param {Object} options - Additional options
 */
export function showInfo(message, options = {}) {
  return showToast(message, { ...options, type: 'info' });
}

/**
 * Clears all toasts
 */
export function clearAllToasts() {
  const container = document.getElementById('toast-container');
  if (container) {
    const toasts = container.querySelectorAll('.toast');
    toasts.forEach(toast => removeToast(toast));
  }
}
