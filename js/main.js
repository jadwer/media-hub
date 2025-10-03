/**
 * @fileoverview Main entry point for Media Hub application.
 * Coordinates all UI modules and manages global application state.
 * @author Gabino Ramírez
 */

import { checkAuth, logout } from './utils/auth.js';
import { uploadFile, getFiles, deleteFile, renameFile } from './api/index.js';
import { switchTheme, toggleTheme, loadTheme } from './ui/themeManager.js';
import { playMedia, downloadFile } from './ui/player.js';
import { setupUploader } from './ui/uploader.js';
import { showConfirmModal } from './ui/modal.js';
import { showSuccess, showError, showInfo } from './ui/toast.js';
import { initNavigation } from './ui/navigation.js';
import { initBottomPlayer, play as playInBottomPlayer } from './ui/bottomPlayer.js';
import { initPlaylistManager, updateAvailableFiles } from './ui/playlistManager.js';

/** @type {number} Current page number for pagination */
let currentPage = 1;

/** @type {number|string} Items per page */
let perPage = 10;

/** @type {number} Total number of files */
let totalFiles = 0;

/** @type {string} Current search query */
let searchQuery = '';

/** @type {Array} Current file list for media player navigation */
let currentFiles = [];

/** @type {string} Current view mode (list or grid) */
let viewMode = 'list';

/** @type {string} Current sort order */
let sortOrder = 'date_desc';

/** @type {Set} Selected files for batch operations */
let selectedFiles = new Set();

/** @type {Object} Current filters */
let currentFilters = {
  type: 'all',
  size: 'all'
};

/**
 * Shows the loading spinner
 */
function showSpinner() {
  document.querySelector('.spinner').style.display = 'flex';
}

/**
 * Hides the loading spinner
 */
function hideSpinner() {
  document.querySelector('.spinner').style.display = 'none';
}

/**
 * Loads files from the API with current pagination settings
 * @async
 * @throws {Error} If API request fails
 */
async function loadFiles() {
  showSpinner();
  try {
    const response = await getFiles({
      type: 'all',
      page: currentPage,
      perPage: perPage === 'all' ? 9999 : perPage,
      order: sortOrder
    });

    totalFiles = response.total;
    currentFiles = response.files;

    renderFiles(currentFiles);
    updatePaginationInfo();

    // Update available files for playlist manager
    updateAvailableFiles(currentFiles);
  } catch (error) {
    showError("Error al cargar archivos. Por favor, intenta de nuevo.");
    console.log(error);
  } finally {
    hideSpinner();
  }
}

/**
 * Renders files to the DOM
 * @param {Array<Object>} files - Array of file objects to render
 */
function renderFiles(files) {
  const listContainer = document.getElementById('fileList');
  listContainer.innerHTML = '';

  // Apply view mode class
  listContainer.className = `file-list view-${viewMode}`;

  // Apply filters
  let filteredFiles = applyFilters(files);

  if (filteredFiles.length === 0) {
    listContainer.innerHTML = '<p>No se encontraron archivos.</p>';
    return;
  }

  for (const file of filteredFiles) {
    const fileItem = document.createElement('div');
    fileItem.classList.add('file-item');

    // Checkbox for selection
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('file-checkbox');
    checkbox.dataset.filename = file.name;
    checkbox.dataset.url = file.url;
    checkbox.checked = selectedFiles.has(file.url);
    checkbox.addEventListener('change', handleFileSelection);

    const fileName = document.createElement('p');
    fileName.textContent = file.name;

    const controls = document.createElement('div');
    controls.classList.add('file-controls');

    const playBtn = document.createElement('button');
    playBtn.textContent = '▶';
    playBtn.classList.add('play-btn');
    playBtn.dataset.url = file.url;

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '⬇';
    downloadBtn.classList.add('download-btn');
    downloadBtn.dataset.url = file.url;

    const renameBtn = document.createElement('button');
    renameBtn.textContent = '✏️';
    renameBtn.classList.add('rename-btn');
    renameBtn.dataset.filename = file.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.dataset.filename = file.name;

    controls.appendChild(playBtn);
    controls.appendChild(downloadBtn);
    controls.appendChild(renameBtn);
    controls.appendChild(deleteBtn);

    fileItem.appendChild(checkbox);
    fileItem.appendChild(fileName);
    fileItem.appendChild(controls);

    listContainer.appendChild(fileItem);
  }
}

/**
 * Updates pagination info display
 */
function updatePaginationInfo() {
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');

  if (perPage === 'all' || perPage >= totalFiles) {
    pageInfo.textContent = `Mostrando ${totalFiles} archivo${totalFiles !== 1 ? 's' : ''}`;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  } else {
    const totalPages = Math.ceil(totalFiles / perPage);
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, totalFiles);

    pageInfo.textContent = `${start}-${end} de ${totalFiles} (Pág. ${currentPage}/${totalPages})`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
  }
}

/**
 * Searches files by name using client-side filtering
 * @param {string} query - Search query
 */
function searchFiles(query) {
  searchQuery = query.trim().toLowerCase();

  if (!searchQuery) {
    renderFiles(currentFiles);
    return;
  }

  const filtered = currentFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery)
  );

  renderFiles(filtered);
}

/**
 * Applies filters to file list
 * @param {Array} files - Files to filter
 * @returns {Array} Filtered files
 */
function applyFilters(files) {
  return files.filter(file => {
    // Filter by type
    if (currentFilters.type !== 'all' && file.type !== currentFilters.type) {
      return false;
    }

    // Filter by size
    const sizeMB = file.sizeMB || 0;
    switch (currentFilters.size) {
      case 'small':
        if (sizeMB >= 1) return false;
        break;
      case 'medium':
        if (sizeMB < 1 || sizeMB >= 10) return false;
        break;
      case 'large':
        if (sizeMB < 10 || sizeMB >= 50) return false;
        break;
      case 'xlarge':
        if (sizeMB < 50) return false;
        break;
    }

    return true;
  });
}

/**
 * Handles file selection checkbox
 * @param {Event} e - Change event
 */
function handleFileSelection(e) {
  const url = e.target.dataset.url;
  const filename = e.target.dataset.filename;

  if (e.target.checked) {
    selectedFiles.add(url);
  } else {
    selectedFiles.delete(url);
  }

  updateBatchActionsBar();
}

/**
 * Updates batch actions bar visibility and count
 */
function updateBatchActionsBar() {
  const bar = document.getElementById('batchActionsBar');
  const count = document.getElementById('selectedCount');

  if (selectedFiles.size > 0) {
    bar.style.display = 'flex';
    count.textContent = `${selectedFiles.size} seleccionado${selectedFiles.size > 1 ? 's' : ''}`;
  } else {
    bar.style.display = 'none';
  }
}

/**
 * Handles select all checkbox
 */
function handleSelectAll(checked) {
  const checkboxes = document.querySelectorAll('.file-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = checked;
    const url = cb.dataset.url;
    if (checked) {
      selectedFiles.add(url);
    } else {
      selectedFiles.delete(url);
    }
  });
  updateBatchActionsBar();
}

/**
 * Handles batch download
 */
async function handleBatchDownload() {
  if (selectedFiles.size === 0) return;

  showInfo(`Descargando ${selectedFiles.size} archivo(s)...`);

  for (const url of selectedFiles) {
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    link.click();
    await new Promise(resolve => setTimeout(resolve, 500)); // Delay between downloads
  }

  showSuccess('Descargas iniciadas');
}

/**
 * Handles batch delete
 */
async function handleBatchDelete() {
  if (selectedFiles.size === 0) return;

  const filenames = Array.from(document.querySelectorAll('.file-checkbox:checked'))
    .map(cb => cb.dataset.filename);

  showConfirmModal({
    title: '¿Eliminar archivos?',
    message: `¿Estás seguro de que quieres eliminar ${selectedFiles.size} archivo(s)? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      showSpinner();
      let deleted = 0;
      let errors = 0;

      for (const filename of filenames) {
        try {
          const response = await deleteFile(filename);
          if (response.success) {
            deleted++;
          } else {
            errors++;
          }
        } catch (error) {
          errors++;
        }
      }

      hideSpinner();

      if (deleted > 0) {
        showSuccess(`${deleted} archivo(s) eliminado(s)`);
      }
      if (errors > 0) {
        showError(`${errors} archivo(s) no se pudieron eliminar`);
      }

      selectedFiles.clear();
      updateBatchActionsBar();
      await loadFiles();
    }
  });
}

/**
 * Changes the view mode (list or grid)
 * @param {string} mode - View mode ('list' or 'grid')
 */
function changeViewMode(mode) {
  viewMode = mode;
  localStorage.setItem('viewMode', mode);

  // Update button states
  document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`view${mode.charAt(0).toUpperCase() + mode.slice(1)}`).classList.add('active');

  renderFiles(currentFiles);
}

/**
 * Loads saved preferences from localStorage
 */
function loadPreferences() {
  const savedView = localStorage.getItem('viewMode');
  if (savedView) {
    viewMode = savedView;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${savedView.charAt(0).toUpperCase() + savedView.slice(1)}`).classList.add('active');
  }
}

/**
 * Initializes all event listeners for the application
 */
function initEvents() {
  loadTheme();
  loadPreferences();
  initNavigation();
  initBottomPlayer();

  // Set year in footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  document.querySelectorAll('[data-theme]').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      const theme = e.target.dataset.theme;
      switchTheme(theme);
    })
  );

  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    const confirmed = confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmed) {
      await logout();
    }
  });

  // View mode buttons
  document.getElementById('viewList').addEventListener('click', () => {
    changeViewMode('list');
  });

  document.getElementById('viewGrid').addEventListener('click', () => {
    changeViewMode('grid');
  });

  // Sort selector
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    sortOrder = e.target.value;
    currentPage = 1;
    loadFiles();
  });

  // Search input
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchFiles(e.target.value);
  });

  // Toggle filters
  document.getElementById('toggleFilters').addEventListener('click', () => {
    const filtersDiv = document.getElementById('advancedFilters');
    const toggleBtn = document.getElementById('toggleFilters');

    if (filtersDiv.style.display === 'none') {
      filtersDiv.style.display = 'flex';
      toggleBtn.textContent = '🔼 Ocultar filtros';
    } else {
      filtersDiv.style.display = 'none';
      toggleBtn.textContent = '🔽 Filtros avanzados';
    }
  });

  // Filter by type
  document.getElementById('filterType').addEventListener('change', (e) => {
    currentFilters.type = e.target.value;
    renderFiles(currentFiles);
  });

  // Filter by size
  document.getElementById('filterSize').addEventListener('change', (e) => {
    currentFilters.size = e.target.value;
    renderFiles(currentFiles);
  });

  // Clear filters
  document.getElementById('clearFilters').addEventListener('click', () => {
    currentFilters = { type: 'all', size: 'all' };
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterSize').value = 'all';
    renderFiles(currentFiles);
    showInfo('Filtros limpiados');
  });

  // Select all
  document.getElementById('selectAll').addEventListener('change', (e) => {
    handleSelectAll(e.target.checked);
  });

  // Batch actions
  document.getElementById('batchDownload').addEventListener('click', handleBatchDownload);
  document.getElementById('batchDelete').addEventListener('click', handleBatchDelete);
  document.getElementById('batchAddToPlaylist').addEventListener('click', () => {
    showInfo('Función de agregar a playlist próximamente');
  });

  // Per page selector
  document.getElementById('perPageSelect').addEventListener('change', (e) => {
    perPage = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
    currentPage = 1;
    loadFiles();
  });

  // Previous page button
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadFiles();
    }
  });

  // Next page button
  document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(totalFiles / perPage);
    if (currentPage < totalPages) {
      currentPage++;
      loadFiles();
    }
  });

  setupUploader(loadFiles);

  // File actions (play, download, rename, delete)
  document.addEventListener('click', (e) => {
    if (e.target.matches('.play-btn')) {
      const url = e.target.dataset.url;
      const fileData = currentFiles.find(f => f.url === url);
      // Use new bottom player
      playInBottomPlayer(url, fileData, currentFiles);
    }
    if (e.target.matches('.download-btn')) {
      const url = e.target.dataset.url;
      downloadFile(url);
    }
    if (e.target.matches('.rename-btn')) {
      const filename = e.target.dataset.filename;
      showRenameModal(filename);
    }
    if (e.target.matches('.delete-btn')) {
      const filename = e.target.dataset.filename;
      handleDelete(filename);
    }
  });
}

/**
 * Handles file deletion with confirmation modal
 * @param {string} filename - Name of the file to delete
 */
async function handleDelete(filename) {
  showConfirmModal({
    title: '¿Eliminar archivo?',
    message: `¿Estás seguro de que quieres eliminar "${filename}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      showSpinner();
      try {
        const response = await deleteFile(filename);
        if (response.success) {
          showSuccess(`Archivo "${filename}" eliminado correctamente`);
          await loadFiles(); // Reload file list
        } else {
          showError('Error al eliminar: ' + response.message);
        }
      } catch (error) {
        showError('Error al eliminar el archivo. Por favor, intenta de nuevo.');
        console.error(error);
      } finally {
        hideSpinner();
      }
    }
  });
}

/**
 * Shows rename modal for a file
 * @param {string} oldFilename - Current filename
 */
function showRenameModal(oldFilename) {
  // Get file extension
  const extension = oldFilename.substring(oldFilename.lastIndexOf('.'));
  const nameWithoutExt = oldFilename.substring(0, oldFilename.lastIndexOf('.'));

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal-container';
  modal.innerHTML = `
    <div class="modal-header">
      <h3>Renombrar archivo</h3>
    </div>
    <div class="modal-body">
      <p style="margin-bottom: 15px; color: var(--fg); opacity: 0.8;">
        Nombre actual: <strong>${oldFilename}</strong>
      </p>
      <label for="newFileName" style="display: block; margin-bottom: 8px; color: var(--fg);">
        Nuevo nombre:
      </label>
      <div style="display: flex; gap: 5px; align-items: center;">
        <input
          type="text"
          id="newFileName"
          value="${nameWithoutExt}"
          style="flex: 1; background: var(--card-hover); color: var(--fg); border: 1px solid var(--accent); padding: 10px; border-radius: 6px; font-size: 14px;"
          maxlength="100"
        />
        <span style="color: var(--fg); font-weight: 600;">${extension}</span>
      </div>
      <p style="margin-top: 10px; font-size: 0.85rem; color: var(--fg); opacity: 0.6;">
        Solo letras, números, espacios, guiones y puntos.
      </p>
    </div>
    <div class="modal-footer">
      <button class="modal-btn modal-btn-cancel" id="cancelRename">Cancelar</button>
      <button class="modal-btn modal-btn-confirm" id="confirmRename">Renombrar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const input = modal.querySelector('#newFileName');
  const cancelBtn = modal.querySelector('#cancelRename');
  const confirmBtn = modal.querySelector('#confirmRename');

  // Focus input and select text
  setTimeout(() => {
    input.focus();
    input.select();
  }, 100);

  // Close modal
  const closeModal = () => {
    overlay.remove();
  };

  // Cancel button
  cancelBtn.onclick = closeModal;

  // Close on background click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  };

  // Close on ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Confirm rename
  const handleRename = async () => {
    const newName = input.value.trim();

    if (!newName) {
      showError('El nombre no puede estar vacío');
      return;
    }

    // Validate characters
    if (!/^[\w\-. ]+$/u.test(newName)) {
      showError('El nombre solo puede contener letras, números, espacios, guiones y puntos');
      return;
    }

    const newFilename = newName + extension;

    if (newFilename === oldFilename) {
      showInfo('El nombre es el mismo, no hay cambios');
      closeModal();
      return;
    }

    confirmBtn.disabled = true;
    showSpinner();

    try {
      const response = await renameFile(oldFilename, newFilename);
      if (response.success) {
        showSuccess(`Archivo renombrado a "${newFilename}"`);
        await loadFiles(); // Reload file list
        closeModal();
      } else {
        showError(response.message || 'Error al renombrar el archivo');
        confirmBtn.disabled = false;
      }
    } catch (error) {
      showError('Error al conectar con el servidor');
      console.error(error);
      confirmBtn.disabled = false;
    } finally {
      hideSpinner();
    }
  };

  confirmBtn.onclick = handleRename;

  // Enter key to confirm
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleRename();
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return; // Will redirect to login
  }

  initEvents();
  await loadFiles();
  await initPlaylistManager(currentFiles);
});
