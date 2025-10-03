/**
 * @fileoverview API communication layer for Media Hub.
 * Handles all HTTP requests to backend PHP endpoints.
 */

import { authFetch } from '../utils/auth.js';

const API_URL = '/api/v1.php';

/**
 * Fetches files from the API with filtering and pagination
 * @async
 * @param {Object} options - Query options
 * @param {string} [options.type='all'] - File type filter (all|audio|video|image)
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.perPage=10] - Items per page
 * @param {string} [options.order='date_desc'] - Sort order (date_desc|date_asc|name_desc|name_asc)
 * @returns {Promise<Object>} Response with files array and metadata
 * @throws {Error} If fetch fails
 */
export async function getFiles({ type = 'all', page = 1, perPage = 10, order = 'date_desc' } = {}) {
  try {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';
    const url = new URL(API_URL, baseURL);
    url.searchParams.set('type', type);
    url.searchParams.set('page', page);
    url.searchParams.set('perPage', perPage);
    url.searchParams.set('order', order);

    const response = await authFetch(url);
    console.log(`📥 [API] GET ${url}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching files:', error);
    throw error;
  }
}

/**
 * Uploads one or multiple files to the server
 * @async
 * @param {FormData} formData - FormData object with files under 'archivo[]' key
 * @returns {Promise<Object>} Response with success status, uploaded count, and errors
 * @throws {Error} If upload fails
 */
export async function uploadFile(formData) {
  try {
    console.log(formData);
    const response = await authFetch('/api/upload.php', {
      method: 'POST',
      body: formData
    });

    console.log('📤 Upload response status:', response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
}

/**
 * Fetches files for all media types in parallel
 * @async
 * @param {Object} options - Query options
 * @param {number} [options.perPage=4] - Items per page per type
 * @param {string} [options.order='date_desc'] - Sort order
 * @returns {Promise<Object>} Object with audio, video, and image keys containing respective file data
 * @throws {Error} If any fetch fails
 */
export async function getAllTypes({ perPage = 4, order = 'date_desc' } = {}) {
  const types = ['audio', 'video', 'image'];
  const promises = types.map(type =>
    getFiles({ type, page: 1, perPage, order }).then(data => ({ type, data }))
  );

  try {
    const results = await Promise.all(promises);
    return results.reduce((acc, { type, data }) => {
      acc[type] = data;
      return acc;
    }, {});
  } catch (error) {
    console.error('❌ Error loading all types:', error);
    throw error;
  }
}

/**
 * Deletes a file from the server
 * @async
 * @param {string} filename - Name of the file to delete
 * @returns {Promise<Object>} Response with success status and message
 * @throws {Error} If delete fails
 */
export async function deleteFile(filename) {
  try {
    const response = await authFetch('/api/delete.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filename })
    });

    console.log('🗑️ Delete response status:', response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
}

/**
 * Renames a file on the server
 * @async
 * @param {string} oldName - Current name of the file
 * @param {string} newName - New name for the file
 * @returns {Promise<Object>} Response with success status and message
 * @throws {Error} If rename fails
 */
export async function renameFile(oldName, newName) {
  try {
    const response = await authFetch('/api/rename.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ oldName, newName })
    });

    console.log('✏️ Rename response status:', response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error renaming file:', error);
    throw error;
  }
}

/**
 * Gets all playlists
 * @async
 * @returns {Promise<Object>} Response with playlists array
 * @throws {Error} If fetch fails
 */
export async function getPlaylists() {
  try {
    const response = await authFetch('/api/playlists.php');
    console.log('📋 Get playlists response status:', response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching playlists:', error);
    throw error;
  }
}

/**
 * Creates a new playlist
 * @async
 * @param {Object} playlistData - Playlist data
 * @param {string} playlistData.name - Playlist name
 * @param {string} [playlistData.description] - Playlist description
 * @param {Array} [playlistData.files] - Array of file objects
 * @returns {Promise<Object>} Response with created playlist
 * @throws {Error} If creation fails
 */
export async function createPlaylist(playlistData) {
  try {
    const response = await authFetch('/api/playlists.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(playlistData)
    });

    console.log('➕ Create playlist response status:', response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error creating playlist:', error);
    throw error;
  }
}

/**
 * Updates an existing playlist
 * @async
 * @param {Object} playlistData - Playlist data with id
 * @param {string} playlistData.id - Playlist ID
 * @param {string} [playlistData.name] - New playlist name
 * @param {string} [playlistData.description] - New description
 * @param {Array} [playlistData.files] - Updated files array
 * @returns {Promise<Object>} Response with updated playlist
 * @throws {Error} If update fails
 */
export async function updatePlaylist(playlistData) {
  try {
    const response = await authFetch('/api/playlists.php', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(playlistData)
    });

    console.log('✏️ Update playlist response status:', response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error updating playlist:', error);
    throw error;
  }
}

/**
 * Deletes a playlist
 * @async
 * @param {string} playlistId - ID of playlist to delete
 * @returns {Promise<Object>} Response with success status
 * @throws {Error} If deletion fails
 */
export async function deletePlaylist(playlistId) {
  try {
    const response = await authFetch('/api/playlists.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: playlistId })
    });

    console.log('🗑️ Delete playlist response status:', response.status);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error deleting playlist:', error);
    throw error;
  }
}
