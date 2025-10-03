/**
 * @fileoverview Enhanced file uploader with drag & drop, progress bar, preview, and upload queue.
 * Handles multiple file uploads with client-side validation and preview.
 */

import { uploadFile } from '../api/index.js';
import { showSuccess, showError, showWarning, showInfo } from './toast.js';

// Maximum file size in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Upload queue
let uploadQueue = [];
let isUploading = false;
let currentUploadController = null;

/**
 * Sets up the file uploader with drag-and-drop and click-to-select functionality
 * @param {Function} onUploadComplete - Callback function to execute after successful upload
 */
export function setupUploader(onUploadComplete) {
  const dropzone = document.querySelector('.dropzone');
  const input = dropzone.querySelector('input');
  const preview = document.getElementById('preview');

  input.setAttribute('multiple', true);

  dropzone.addEventListener('click', () => input.click());

  input.addEventListener('change', (e) => {
    prepareFiles([...e.target.files], onUploadComplete);
    e.target.value = ''; // Reset input
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('hover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('hover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('hover');
    const files = [...e.dataTransfer.files];
    prepareFiles(files, onUploadComplete);
  });

  /**
   * Validates and prepares files for upload
   * @param {File[]} files - Array of files to validate and prepare
   * @param {Function} onFinish - Callback after upload completes
   */
  function prepareFiles(files, onFinish) {
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Excede el tamaño máximo (50MB)`);
        continue;
      }

      // Validate file type
      const isValidType =
        file.type.startsWith('audio/') ||
        file.type.startsWith('video/') ||
        file.type.startsWith('image/');

      if (!isValidType) {
        errors.push(`${file.name}: Tipo de archivo no soportado`);
        continue;
      }

      validFiles.push(file);
    }

    // Show errors
    errors.forEach(error => showWarning(error));

    if (validFiles.length === 0) {
      return;
    }

    // Show preview with upload/cancel options
    showPreviewWithControls(validFiles, onFinish);
  }

  /**
   * Shows preview with upload and cancel buttons
   * @param {File[]} files - Files to preview
   * @param {Function} onFinish - Callback after upload completes
   */
  function showPreviewWithControls(files, onFinish) {
    preview.innerHTML = '';

    const previewContainer = document.createElement('div');
    previewContainer.className = 'upload-preview-container';

    // Preview header
    const header = document.createElement('div');
    header.className = 'upload-preview-header';
    header.innerHTML = `
      <h3>Vista previa (${files.length} archivo${files.length > 1 ? 's' : ''})</h3>
      <p>Tamaño total: ${formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}</p>
    `;
    previewContainer.appendChild(header);

    // Preview items
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'upload-preview-items';

    for (const file of files) {
      const item = document.createElement('div');
      item.className = 'upload-preview-item';

      const type = file.type;
      if (type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = 'Vista previa';
        item.appendChild(img);
      } else if (type.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);
        audio.controls = true;
        item.appendChild(audio);
      } else if (type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        item.appendChild(video);
      }

      const info = document.createElement('div');
      info.className = 'upload-preview-info';
      info.innerHTML = `
        <p class="file-name">${file.name}</p>
        <p class="file-size">${formatFileSize(file.size)}</p>
      `;
      item.appendChild(info);

      itemsContainer.appendChild(item);
    }

    previewContainer.appendChild(itemsContainer);

    // Progress bar (hidden initially)
    const progressContainer = document.createElement('div');
    progressContainer.className = 'upload-progress-container';
    progressContainer.style.display = 'none';
    progressContainer.innerHTML = `
      <div class="upload-progress-bar">
        <div class="upload-progress-fill" style="width: 0%"></div>
      </div>
      <p class="upload-progress-text">0%</p>
    `;
    previewContainer.appendChild(progressContainer);

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'upload-preview-actions';

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'upload-btn-confirm';
    uploadBtn.textContent = '✓ Subir archivos';
    uploadBtn.onclick = () => {
      uploadBtn.disabled = true;
      cancelBtn.textContent = '✕ Cancelar subida';
      startUpload(files, onFinish, progressContainer);
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'upload-btn-cancel';
    cancelBtn.textContent = '✕ Cancelar';
    cancelBtn.onclick = () => {
      if (isUploading && currentUploadController) {
        currentUploadController.abort();
        showInfo('Subida cancelada');
      }
      preview.innerHTML = '';
      uploadQueue = [];
      isUploading = false;
    };

    actions.appendChild(uploadBtn);
    actions.appendChild(cancelBtn);
    previewContainer.appendChild(actions);

    preview.appendChild(previewContainer);
  }

  /**
   * Starts the upload process with progress tracking
   * @param {File[]} files - Files to upload
   * @param {Function} onFinish - Callback after upload completes
   * @param {HTMLElement} progressContainer - Progress bar container
   */
  async function startUpload(files, onFinish, progressContainer) {
    isUploading = true;
    progressContainer.style.display = 'block';

    const formData = new FormData();
    for (const file of files) {
      formData.append('archivo[]', file);
    }

    currentUploadController = new AbortController();

    try {
      const response = await uploadFileWithProgress(formData, progressContainer);

      if (response.success) {
        const count = response.uploaded || 1;
        showSuccess(`${count} archivo${count > 1 ? 's' : ''} subido${count > 1 ? 's' : ''} correctamente`);

        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(error => showWarning(error));
        }

        playRiffIfMetal();
        onFinish();
        preview.innerHTML = '';
      } else {
        const errors = response.errors || ['Error desconocido'];
        errors.forEach(error => showError(error));

        // Show retry button
        showRetryOption(files, onFinish);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        showInfo('Subida cancelada');
      } else {
        showError('Error al conectar con el servidor.');
        showRetryOption(files, onFinish);
      }
      console.error(error);
    } finally {
      isUploading = false;
      currentUploadController = null;
    }
  }

  /**
   * Uploads file with progress tracking
   * @param {FormData} formData - Form data with files
   * @param {HTMLElement} progressContainer - Progress bar container
   * @returns {Promise<Object>} Upload response
   */
  function uploadFileWithProgress(formData, progressContainer) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          updateProgress(progressContainer, percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      currentUploadController.signal.addEventListener('abort', () => xhr.abort());

      xhr.open('POST', 'api/upload.php');
      xhr.send(formData);
    });
  }

  /**
   * Updates progress bar
   * @param {HTMLElement} container - Progress container
   * @param {number} percent - Progress percentage
   */
  function updateProgress(container, percent) {
    const fill = container.querySelector('.upload-progress-fill');
    const text = container.querySelector('.upload-progress-text');

    fill.style.width = `${percent}%`;
    text.textContent = `${Math.round(percent)}%`;
  }

  /**
   * Shows retry option after failed upload
   * @param {File[]} files - Files that failed to upload
   * @param {Function} onFinish - Callback after upload completes
   */
  function showRetryOption(files, onFinish) {
    const retryContainer = document.createElement('div');
    retryContainer.className = 'upload-retry-container';

    const retryBtn = document.createElement('button');
    retryBtn.className = 'upload-btn-retry';
    retryBtn.textContent = '↻ Reintentar subida';
    retryBtn.onclick = () => {
      preview.innerHTML = '';
      prepareFiles(files, onFinish);
    };

    retryContainer.appendChild(retryBtn);
    preview.appendChild(retryContainer);
  }

  /**
   * Formats file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Plays metal riff if theme is metal
   */
  function playRiffIfMetal() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'metal') {
      const riff = document.getElementById('riffPlayer');
      riff?.play().catch(() => {});
    }
  }
}
