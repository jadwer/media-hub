/**
 * @fileoverview Playlist manager UI
 * Handles creating, editing, and displaying playlists
 */

import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from '../api/index.js';
import { showSuccess, showError, showInfo } from './toast.js';
import { showConfirmModal } from './modal.js';
import { play as playInBottomPlayer } from './bottomPlayer.js';

let allPlaylists = [];
let allAvailableFiles = [];

/**
 * Initializes playlist manager
 * @param {Array} files - All available files for adding to playlists
 */
export async function initPlaylistManager(files = []) {
  allAvailableFiles = files;

  // Load playlists
  await loadPlaylists();

  // Setup create button
  document.getElementById('createPlaylistBtn').addEventListener('click', showCreatePlaylistModal);
}

/**
 * Loads all playlists from API
 */
export async function loadPlaylists() {
  try {
    const response = await getPlaylists();
    if (response.success) {
      allPlaylists = response.playlists || [];
      renderPlaylists();
    }
  } catch (error) {
    showError('Error al cargar las playlists');
    console.error(error);
  }
}

/**
 * Renders all playlists to the DOM
 */
function renderPlaylists() {
  const container = document.getElementById('playlistsContainer');

  if (allPlaylists.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay playlists creadas. ¡Crea tu primera playlist!</p>';
    return;
  }

  container.innerHTML = '';

  allPlaylists.forEach(playlist => {
    const card = createPlaylistCard(playlist);
    container.appendChild(card);
  });
}

/**
 * Creates a playlist card element
 * @param {Object} playlist - Playlist data
 * @returns {HTMLElement} Playlist card
 */
function createPlaylistCard(playlist) {
  const card = document.createElement('div');
  card.className = 'playlist-card';
  card.innerHTML = `
    <div class="playlist-card-header">
      <h3>${playlist.name}</h3>
      <div class="playlist-card-actions">
        <button class="playlist-action-btn" data-action="play" data-id="${playlist.id}" title="Reproducir">▶</button>
        <button class="playlist-action-btn" data-action="edit" data-id="${playlist.id}" title="Editar">✏️</button>
        <button class="playlist-action-btn" data-action="delete" data-id="${playlist.id}" title="Eliminar">🗑️</button>
      </div>
    </div>
    <p class="playlist-description">${playlist.description || 'Sin descripción'}</p>
    <div class="playlist-stats">
      <span>📁 ${playlist.files ? playlist.files.length : 0} archivos</span>
      <span>🕐 ${formatDate(playlist.created)}</span>
    </div>
  `;

  // Add event listeners
  card.querySelector('[data-action="play"]').addEventListener('click', () => playPlaylist(playlist));
  card.querySelector('[data-action="edit"]').addEventListener('click', () => showEditPlaylistModal(playlist));
  card.querySelector('[data-action="delete"]').addEventListener('click', () => handleDeletePlaylist(playlist.id));

  return card;
}

/**
 * Shows create playlist modal
 */
function showCreatePlaylistModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal-container';
  modal.innerHTML = `
    <div class="modal-header">
      <h3>Nueva Playlist</h3>
    </div>
    <div class="modal-body">
      <label>Nombre:</label>
      <input type="text" id="playlistName" placeholder="Mi Playlist" maxlength="50"
        style="width:100%; background:var(--card-hover); color:var(--fg); border:1px solid var(--accent);
        padding:10px; border-radius:6px; margin-bottom:15px;">

      <label>Descripción:</label>
      <textarea id="playlistDescription" placeholder="Descripción opcional" maxlength="200"
        style="width:100%; background:var(--card-hover); color:var(--fg); border:1px solid var(--accent);
        padding:10px; border-radius:6px; resize:vertical; min-height:80px;"></textarea>
    </div>
    <div class="modal-footer">
      <button class="modal-btn modal-btn-cancel" id="cancelCreate">Cancelar</button>
      <button class="modal-btn modal-btn-confirm" id="confirmCreate">Crear</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const nameInput = modal.querySelector('#playlistName');
  const descInput = modal.querySelector('#playlistDescription');
  const cancelBtn = modal.querySelector('#cancelCreate');
  const confirmBtn = modal.querySelector('#confirmCreate');

  nameInput.focus();

  const closeModal = () => overlay.remove();

  cancelBtn.onclick = closeModal;
  overlay.onclick = (e) => e.target === overlay && closeModal();

  confirmBtn.onclick = async () => {
    const name = nameInput.value.trim();

    if (!name) {
      showError('El nombre de la playlist es requerido');
      return;
    }

    confirmBtn.disabled = true;

    try {
      const response = await createPlaylist({
        name,
        description: descInput.value.trim(),
        files: []
      });

      if (response.success) {
        showSuccess('Playlist creada correctamente');
        await loadPlaylists();
        closeModal();
      } else {
        showError(response.message || 'Error al crear la playlist');
        confirmBtn.disabled = false;
      }
    } catch (error) {
      showError('Error al crear la playlist');
      console.error(error);
      confirmBtn.disabled = false;
    }
  };
}

/**
 * Shows edit playlist modal
 * @param {Object} playlist - Playlist to edit
 */
function showEditPlaylistModal(playlist) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal-container';
  modal.style.maxWidth = '600px';
  modal.innerHTML = `
    <div class="modal-header">
      <h3>Editar Playlist</h3>
    </div>
    <div class="modal-body">
      <label>Nombre:</label>
      <input type="text" id="playlistName" value="${playlist.name}" maxlength="50"
        style="width:100%; background:var(--card-hover); color:var(--fg); border:1px solid var(--accent);
        padding:10px; border-radius:6px; margin-bottom:15px;">

      <label>Descripción:</label>
      <textarea id="playlistDescription" maxlength="200"
        style="width:100%; background:var(--card-hover); color:var(--fg); border:1px solid var(--accent);
        padding:10px; border-radius:6px; resize:vertical; min-height:80px; margin-bottom:15px;">${playlist.description || ''}</textarea>

      <label>Archivos en la playlist (${playlist.files.length}):</label>
      <div id="playlistFiles" style="max-height:200px; overflow-y:auto; background:var(--card-hover);
        padding:10px; border-radius:6px; margin-bottom:15px;">
        ${playlist.files.length === 0 ? '<p style="opacity:0.6; text-align:center;">Sin archivos</p>' : ''}
      </div>

      <button id="addFilesBtn" class="btn-primary" style="width:100%; margin-bottom:10px;">
        ➕ Agregar archivos
      </button>
    </div>
    <div class="modal-footer">
      <button class="modal-btn modal-btn-cancel" id="cancelEdit">Cancelar</button>
      <button class="modal-btn modal-btn-confirm" id="confirmEdit">Guardar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const nameInput = modal.querySelector('#playlistName');
  const descInput = modal.querySelector('#playlistDescription');
  const filesContainer = modal.querySelector('#playlistFiles');
  const addFilesBtn = modal.querySelector('#addFilesBtn');
  const cancelBtn = modal.querySelector('#cancelEdit');
  const confirmBtn = modal.querySelector('#confirmEdit');

  // Render current files
  renderPlaylistFiles(filesContainer, playlist.files);

  const closeModal = () => overlay.remove();

  cancelBtn.onclick = closeModal;
  overlay.onclick = (e) => e.target === overlay && closeModal();

  addFilesBtn.onclick = () => showAddFilesModal(playlist, filesContainer);

  confirmBtn.onclick = async () => {
    const name = nameInput.value.trim();

    if (!name) {
      showError('El nombre de la playlist es requerido');
      return;
    }

    confirmBtn.disabled = true;

    try {
      const response = await updatePlaylist({
        id: playlist.id,
        name,
        description: descInput.value.trim(),
        files: playlist.files
      });

      if (response.success) {
        showSuccess('Playlist actualizada correctamente');
        await loadPlaylists();
        closeModal();
      } else {
        showError(response.message || 'Error al actualizar la playlist');
        confirmBtn.disabled = false;
      }
    } catch (error) {
      showError('Error al actualizar la playlist');
      console.error(error);
      confirmBtn.disabled = false;
    }
  };
}

/**
 * Renders files in playlist
 * @param {HTMLElement} container - Container element
 * @param {Array} files - Files array
 */
function renderPlaylistFiles(container, files) {
  if (files.length === 0) {
    container.innerHTML = '<p style="opacity:0.6; text-align:center;">Sin archivos</p>';
    return;
  }

  container.innerHTML = '';
  files.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px; background:var(--card); border-radius:4px; margin-bottom:5px;';
    fileItem.innerHTML = `
      <span style="flex:1; font-size:0.9rem;">${file.name}</span>
      <button class="remove-file-btn" data-index="${index}" style="background:#ff4444; color:white; border:none;
        padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.8rem;">✕</button>
    `;

    fileItem.querySelector('.remove-file-btn').addEventListener('click', () => {
      files.splice(index, 1);
      renderPlaylistFiles(container, files);
    });

    container.appendChild(fileItem);
  });
}

/**
 * Shows modal to add files to playlist
 * @param {Object} playlist - Playlist object
 * @param {HTMLElement} filesContainer - Container to update after adding
 */
function showAddFilesModal(playlist, filesContainer) {
  // Get files not already in playlist
  const availableFiles = allAvailableFiles.filter(file =>
    !playlist.files.some(pf => pf.url === file.url)
  );

  if (availableFiles.length === 0) {
    showInfo('No hay más archivos disponibles para agregar');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal-container';
  modal.style.maxWidth = '500px';
  modal.innerHTML = `
    <div class="modal-header">
      <h3>Agregar archivos</h3>
    </div>
    <div class="modal-body">
      <div id="availableFilesList" style="max-height:400px; overflow-y:auto;">
        ${availableFiles.map(file => `
          <label style="display:flex; align-items:center; padding:8px; background:var(--card-hover);
            border-radius:4px; margin-bottom:5px; cursor:pointer;">
            <input type="checkbox" value="${file.url}" data-name="${file.name}"
              style="margin-right:10px; cursor:pointer;">
            <span style="font-size:0.9rem;">${file.name}</span>
          </label>
        `).join('')}
      </div>
    </div>
    <div class="modal-footer">
      <button class="modal-btn modal-btn-cancel" id="cancelAdd">Cancelar</button>
      <button class="modal-btn modal-btn-confirm" id="confirmAdd">Agregar seleccionados</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const cancelBtn = modal.querySelector('#cancelAdd');
  const confirmBtn = modal.querySelector('#confirmAdd');

  const closeModal = () => overlay.remove();

  cancelBtn.onclick = closeModal;

  confirmBtn.onclick = () => {
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
      playlist.files.push({
        url: checkbox.value,
        name: checkbox.dataset.name
      });
    });

    renderPlaylistFiles(filesContainer, playlist.files);
    showSuccess(`${checkboxes.length} archivo(s) agregado(s)`);
    closeModal();
  };
}

/**
 * Plays a playlist
 * @param {Object} playlist - Playlist to play
 */
function playPlaylist(playlist) {
  if (!playlist.files || playlist.files.length === 0) {
    showInfo('La playlist está vacía');
    return;
  }

  showSuccess(`Reproduciendo: ${playlist.name}`);
  playInBottomPlayer(playlist.files);
}

/**
 * Handles playlist deletion
 * @param {string} playlistId - ID of playlist to delete
 */
function handleDeletePlaylist(playlistId) {
  const playlist = allPlaylists.find(p => p.id === playlistId);

  showConfirmModal({
    title: '¿Eliminar playlist?',
    message: `¿Estás seguro de que quieres eliminar "${playlist.name}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      try {
        const response = await deletePlaylist(playlistId);
        if (response.success) {
          showSuccess('Playlist eliminada correctamente');
          await loadPlaylists();
        } else {
          showError(response.message || 'Error al eliminar');
        }
      } catch (error) {
        showError('Error al eliminar la playlist');
        console.error(error);
      }
    }
  });
}

/**
 * Formats timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date
 */
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/**
 * Updates available files list
 * @param {Array} files - New files list
 */
export function updateAvailableFiles(files) {
  allAvailableFiles = files;
}
