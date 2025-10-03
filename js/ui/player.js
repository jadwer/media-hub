/**
 * @fileoverview Universal media player for audio, video, and images.
 * Manages playback with advanced controls and keyboard shortcuts.
 */

/** @type {HTMLElement|null} Global player instance (audio, video, or image container) */
let globalPlayer = null;

/** @type {Array<Object>} Current file list for navigation */
let currentFileList = [];

/** @type {number} Current file index in the list */
let currentFileIndex = -1;

/**
 * Determines the media type from file extension
 * @param {string} url - File URL
 * @returns {string} Media type: 'audio', 'video', 'image', or 'unknown'
 */
function getMediaType(url) {
  const ext = url.split('.').pop().toLowerCase();

  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';

  return 'unknown';
}

/**
 * Marks a file as active in the list
 * @param {string} url - URL of the active file
 */
function markActiveFile(url) {
  // Remove previous active state
  document.querySelectorAll('.file-item.active').forEach(item => {
    item.classList.remove('active');
  });

  // Add active state to current file
  const playButtons = document.querySelectorAll('.play-btn');
  playButtons.forEach(btn => {
    if (btn.dataset.url === url) {
      btn.closest('.file-item')?.classList.add('active');
    }
  });
}

/**
 * Plays a media file (audio, video, or image)
 * @param {string} url - URL of the media file
 * @param {Object} fileData - File metadata object
 * @param {Array<Object>} fileList - Complete list of files for navigation
 */
export function playMedia(url, fileData = null, fileList = []) {
  const mediaType = getMediaType(url);

  // Store file list and index for navigation
  currentFileList = fileList;
  currentFileIndex = fileList.findIndex(f => f.url === url);

  // Mark active file in list
  markActiveFile(url);

  // Clean up previous player
  if (globalPlayer) {
    if (globalPlayer.pause) globalPlayer.pause();
    globalPlayer.remove();
  }

  const playerContainer = document.getElementById('playerContainer');
  playerContainer.innerHTML = '';

  if (mediaType === 'audio') {
    globalPlayer = createAudioPlayer(url, fileData);
  } else if (mediaType === 'video') {
    globalPlayer = createVideoPlayer(url, fileData);
  } else if (mediaType === 'image') {
    globalPlayer = createImageViewer(url, fileData);
  } else {
    playerContainer.innerHTML = '<p>⚠️ Tipo de archivo no soportado</p>';
    return;
  }

  playerContainer.appendChild(globalPlayer);
  setupKeyboardShortcuts();
}

/**
 * Creates an audio player element with controls
 * @param {string} url - Audio file URL
 * @param {Object} fileData - File metadata
 * @returns {HTMLAudioElement} Audio element
 */
function createAudioPlayer(url, fileData) {
  const audio = document.createElement('audio');
  audio.controls = true;
  audio.autoplay = true;
  audio.src = url;
  audio.className = 'media-player audio-player';

  // Add playback speed control
  const container = document.createElement('div');
  container.className = 'player-wrapper';

  if (fileData) {
    const title = document.createElement('div');
    title.className = 'player-title';
    title.textContent = `🎵 ${fileData.name}`;
    container.appendChild(title);
  }

  container.appendChild(audio);
  container.appendChild(createSpeedControl(audio));
  container.appendChild(createNavigationControls());

  return container;
}

/**
 * Creates a video player element with controls
 * @param {string} url - Video file URL
 * @param {Object} fileData - File metadata
 * @returns {HTMLVideoElement} Video element
 */
function createVideoPlayer(url, fileData) {
  const video = document.createElement('video');
  video.controls = true;
  video.autoplay = true;
  video.src = url;
  video.className = 'media-player video-player';

  const container = document.createElement('div');
  container.className = 'player-wrapper';

  if (fileData) {
    const title = document.createElement('div');
    title.className = 'player-title';
    title.textContent = `🎬 ${fileData.name}`;
    container.appendChild(title);
  }

  container.appendChild(video);

  const controls = document.createElement('div');
  controls.className = 'player-controls';
  controls.appendChild(createSpeedControl(video));
  controls.appendChild(createFullscreenButton(video));
  controls.appendChild(createNavigationControls());

  container.appendChild(controls);

  return container;
}

/**
 * Creates an image viewer with lightbox effect
 * @param {string} url - Image file URL
 * @param {Object} fileData - File metadata
 * @returns {HTMLDivElement} Image container
 */
function createImageViewer(url, fileData) {
  const container = document.createElement('div');
  container.className = 'player-wrapper image-viewer';

  if (fileData) {
    const title = document.createElement('div');
    title.className = 'player-title';
    title.textContent = `🖼️ ${fileData.name}`;
    container.appendChild(title);
  }

  const img = document.createElement('img');
  img.src = url;
  img.alt = fileData ? fileData.name : 'Image';
  img.className = 'media-player image-display';
  img.onclick = () => openLightbox(url, fileData);

  container.appendChild(img);
  container.appendChild(createNavigationControls());

  return container;
}

/**
 * Creates playback speed control
 * @param {HTMLMediaElement} mediaElement - Audio or video element
 * @returns {HTMLDivElement} Speed control container
 */
function createSpeedControl(mediaElement) {
  const container = document.createElement('div');
  container.className = 'speed-control';

  const label = document.createElement('label');
  label.textContent = 'Velocidad: ';

  const select = document.createElement('select');
  select.className = 'speed-select';

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  speeds.forEach(speed => {
    const option = document.createElement('option');
    option.value = speed;
    option.textContent = speed === 1 ? 'Normal' : `${speed}x`;
    if (speed === 1) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener('change', (e) => {
    mediaElement.playbackRate = parseFloat(e.target.value);
  });

  container.appendChild(label);
  container.appendChild(select);

  return container;
}

/**
 * Creates fullscreen toggle button
 * @param {HTMLVideoElement} videoElement - Video element
 * @returns {HTMLButtonElement} Fullscreen button
 */
function createFullscreenButton(videoElement) {
  const button = document.createElement('button');
  button.textContent = '⛶ Pantalla completa';
  button.className = 'fullscreen-btn';

  button.addEventListener('click', () => {
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.webkitRequestFullscreen) {
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.mozRequestFullScreen) {
      videoElement.mozRequestFullScreen();
    }
  });

  return button;
}

/**
 * Creates navigation controls (previous/next)
 * @returns {HTMLDivElement} Navigation controls container
 */
function createNavigationControls() {
  const container = document.createElement('div');
  container.className = 'navigation-controls';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '⏮ Anterior';
  prevBtn.className = 'nav-btn prev-btn';
  prevBtn.onclick = () => navigateMedia(-1);
  prevBtn.disabled = currentFileIndex <= 0;

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Siguiente ⏭';
  nextBtn.className = 'nav-btn next-btn';
  nextBtn.onclick = () => navigateMedia(1);
  nextBtn.disabled = currentFileIndex >= currentFileList.length - 1;

  container.appendChild(prevBtn);
  container.appendChild(nextBtn);

  return container;
}

/**
 * Navigates to previous or next media file
 * @param {number} direction - -1 for previous, 1 for next
 */
function navigateMedia(direction) {
  const newIndex = currentFileIndex + direction;

  if (newIndex >= 0 && newIndex < currentFileList.length) {
    const nextFile = currentFileList[newIndex];
    playMedia(nextFile.url, nextFile, currentFileList);
  }
}

/**
 * Opens image in fullscreen lightbox
 * @param {string} url - Image URL
 * @param {Object} fileData - File metadata
 */
function openLightbox(url, fileData) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.onclick = () => lightbox.remove();

  const img = document.createElement('img');
  img.src = url;
  img.alt = fileData ? fileData.name : 'Image';
  img.onclick = (e) => e.stopPropagation();

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.className = 'lightbox-close';
  closeBtn.onclick = () => lightbox.remove();

  lightbox.appendChild(closeBtn);
  lightbox.appendChild(img);
  document.body.appendChild(lightbox);
}

/**
 * Sets up keyboard shortcuts for media control
 */
function setupKeyboardShortcuts() {
  // Remove previous listener if exists
  document.removeEventListener('keydown', handleKeyPress);
  document.addEventListener('keydown', handleKeyPress);
}

/**
 * Handles keyboard shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyPress(e) {
  if (!globalPlayer) return;

  const mediaElement = globalPlayer.querySelector('audio, video');

  // Space: play/pause
  if (e.code === 'Space' && mediaElement) {
    e.preventDefault();
    if (mediaElement.paused) {
      mediaElement.play();
    } else {
      mediaElement.pause();
    }
  }

  // Arrow Left: previous file
  if (e.code === 'ArrowLeft' && currentFileIndex > 0) {
    e.preventDefault();
    navigateMedia(-1);
  }

  // Arrow Right: next file
  if (e.code === 'ArrowRight' && currentFileIndex < currentFileList.length - 1) {
    e.preventDefault();
    navigateMedia(1);
  }
}

/**
 * Legacy function for backward compatibility
 * @param {string} url - URL of the audio file to play
 */
export function playAudio(url) {
  playMedia(url);
}

/**
 * Triggers a file download
 * @param {string} url - URL of the file to download
 */
export function downloadFile(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
