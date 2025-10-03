/**
 * @fileoverview Bottom persistent player for audio/video/images
 * Handles playback with auto-advance and 5-second timer for images
 */

// Player state
let currentPlaylist = [];
let currentIndex = 0;
let currentMedia = null;
let isPlaying = false;
let currentSpeed = 1;
let imageTimer = null;

// Media elements
let audioElement = null;
let videoElement = null;
let imageElement = null;

/**
 * Initializes the bottom player
 */
export function initBottomPlayer() {
  audioElement = document.getElementById('playerAudio');
  videoElement = document.getElementById('playerVideo');
  imageElement = document.getElementById('playerImage');

  setupEventListeners();
}

/**
 * Sets up all player event listeners
 */
function setupEventListeners() {
  // Play/Pause button
  document.getElementById('playerPlayPause').addEventListener('click', togglePlayPause);

  // Previous/Next buttons
  document.getElementById('playerPrev').addEventListener('click', playPrevious);
  document.getElementById('playerNext').addEventListener('click', playNext);

  // Speed control
  document.getElementById('playerSpeed').addEventListener('click', cycleSpeed);

  // Progress bar click
  document.getElementById('playerProgressBar').addEventListener('click', seekTo);

  // Audio/Video time update
  audioElement.addEventListener('timeupdate', updateProgress);
  videoElement.addEventListener('timeupdate', updateProgress);

  // Audio/Video ended
  audioElement.addEventListener('ended', playNext);
  videoElement.addEventListener('ended', playNext);

  // Audio/Video loaded metadata
  audioElement.addEventListener('loadedmetadata', updateDuration);
  videoElement.addEventListener('loadedmetadata', updateDuration);
}

/**
 * Plays a file or playlist
 * @param {string|Array} urlOrPlaylist - Single URL or array of file objects
 * @param {Object} [fileData] - File metadata (when playing single file)
 * @param {Array} [fullList] - Full file list for navigation
 */
export function play(urlOrPlaylist, fileData = null, fullList = []) {
  // If it's an array, treat as playlist
  if (Array.isArray(urlOrPlaylist)) {
    currentPlaylist = urlOrPlaylist;
    currentIndex = 0;
  }
  // If it's a single URL with a full list
  else if (fullList.length > 0) {
    currentPlaylist = fullList;
    currentIndex = fullList.findIndex(f => f.url === urlOrPlaylist);
    if (currentIndex === -1) currentIndex = 0;
  }
  // Single file
  else {
    currentPlaylist = [{ url: urlOrPlaylist, ...fileData }];
    currentIndex = 0;
  }

  playCurrentTrack();
  showPlayer();
}

/**
 * Plays the current track in the playlist
 */
function playCurrentTrack() {
  if (currentPlaylist.length === 0) return;

  stopAllMedia();

  const track = currentPlaylist[currentIndex];
  currentMedia = track;

  // Determine media type
  const url = track.url;
  const extension = url.split('.').pop().toLowerCase();

  // Update UI
  updatePlayerInfo(track);

  // Play appropriate media type
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(extension)) {
    playAudio(url);
  } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
    playVideo(url);
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    playImage(url);
  }

  isPlaying = true;
  updatePlayPauseButton();
}

/**
 * Plays audio file
 * @param {string} url - Audio file URL
 */
function playAudio(url) {
  audioElement.src = url;
  audioElement.playbackRate = currentSpeed;
  audioElement.play().catch(err => console.error('Error playing audio:', err));
}

/**
 * Plays video file
 * @param {string} url - Video file URL
 */
function playVideo(url) {
  videoElement.src = url;
  videoElement.playbackRate = currentSpeed;
  videoElement.play().catch(err => console.error('Error playing video:', err));
}

/**
 * Displays image with 5-second timer
 * @param {string} url - Image file URL
 */
function playImage(url) {
  imageElement.src = url;

  // Clear existing timer
  if (imageTimer) {
    clearTimeout(imageTimer);
  }

  // Set 5-second timer to auto-advance
  imageTimer = setTimeout(() => {
    playNext();
  }, 5000);

  // Simulate progress for images
  simulateImageProgress();
}

/**
 * Simulates progress bar for images (5 seconds)
 */
function simulateImageProgress() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 2; // 2% every 100ms = 5 seconds total
    if (progress >= 100) {
      clearInterval(interval);
      progress = 100;
    }
    document.getElementById('playerProgressFill').style.width = progress + '%';
  }, 100);
}

/**
 * Toggles play/pause
 */
function togglePlayPause() {
  if (isPlaying) {
    pause();
  } else {
    resume();
  }
}

/**
 * Pauses playback
 */
function pause() {
  audioElement.pause();
  videoElement.pause();

  if (imageTimer) {
    clearTimeout(imageTimer);
  }

  isPlaying = false;
  updatePlayPauseButton();
}

/**
 * Resumes playback
 */
function resume() {
  if (audioElement.src) {
    audioElement.play();
  } else if (videoElement.src) {
    videoElement.play();
  } else if (imageElement.src) {
    // Restart image timer
    imageTimer = setTimeout(() => playNext(), 5000);
  }

  isPlaying = true;
  updatePlayPauseButton();
}

/**
 * Plays previous track
 */
function playPrevious() {
  if (currentIndex > 0) {
    currentIndex--;
    playCurrentTrack();
  }
}

/**
 * Plays next track
 */
function playNext() {
  if (currentIndex < currentPlaylist.length - 1) {
    currentIndex++;
    playCurrentTrack();
  } else {
    // End of playlist
    stop();
  }
}

/**
 * Stops playback
 */
function stop() {
  stopAllMedia();
  isPlaying = false;
  updatePlayPauseButton();
}

/**
 * Stops all media elements
 */
function stopAllMedia() {
  audioElement.pause();
  audioElement.src = '';
  videoElement.pause();
  videoElement.src = '';
  imageElement.src = '';

  if (imageTimer) {
    clearTimeout(imageTimer);
    imageTimer = null;
  }
}

/**
 * Cycles through playback speeds
 */
function cycleSpeed() {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const currentIdx = speeds.indexOf(currentSpeed);
  currentSpeed = speeds[(currentIdx + 1) % speeds.length];

  audioElement.playbackRate = currentSpeed;
  videoElement.playbackRate = currentSpeed;

  document.getElementById('playerSpeed').textContent = currentSpeed + 'x';
}

/**
 * Seeks to a position in the media
 * @param {MouseEvent} e - Click event on progress bar
 */
function seekTo(e) {
  const bar = document.getElementById('playerProgressBar');
  const rect = bar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;

  if (audioElement.duration) {
    audioElement.currentTime = audioElement.duration * percent;
  } else if (videoElement.duration) {
    videoElement.currentTime = videoElement.duration * percent;
  }
}

/**
 * Updates progress bar
 */
function updateProgress() {
  let current = 0;
  let duration = 1;

  if (audioElement.duration) {
    current = audioElement.currentTime;
    duration = audioElement.duration;
  } else if (videoElement.duration) {
    current = videoElement.currentTime;
    duration = videoElement.duration;
  }

  const percent = (current / duration) * 100;
  document.getElementById('playerProgressFill').style.width = percent + '%';
  document.getElementById('playerCurrentTime').textContent = formatTime(current);
}

/**
 * Updates duration display
 */
function updateDuration() {
  let duration = 0;

  if (audioElement.duration) {
    duration = audioElement.duration;
  } else if (videoElement.duration) {
    duration = videoElement.duration;
  }

  document.getElementById('playerDuration').textContent = formatTime(duration);
}

/**
 * Updates play/pause button text
 */
function updatePlayPauseButton() {
  document.getElementById('playerPlayPause').textContent = isPlaying ? '⏸' : '▶';
}

/**
 * Updates player info display
 * @param {Object} track - Track metadata
 */
function updatePlayerInfo(track) {
  const filename = track.name || track.url.split('/').pop();
  document.getElementById('playerTitle').textContent = filename;
  document.getElementById('playerSubtitle').textContent = `${currentIndex + 1} / ${currentPlaylist.length}`;

  // Update thumbnail based on file type
  const extension = filename.split('.').pop().toLowerCase();
  const thumbnail = document.getElementById('playerThumbnail');

  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    thumbnail.innerHTML = `<img src="${track.url}" alt="Thumbnail" />`;
  } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
    thumbnail.innerHTML = '<span>🎬</span>';
  } else {
    thumbnail.innerHTML = '<span>🎵</span>';
  }
}

/**
 * Shows the bottom player
 */
function showPlayer() {
  document.getElementById('bottomPlayer').style.display = 'grid';
}

/**
 * Hides the bottom player
 */
export function hidePlayer() {
  document.getElementById('bottomPlayer').style.display = 'none';
  stopAllMedia();
}

/**
 * Formats time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Gets current playlist
 * @returns {Array} Current playlist
 */
export function getCurrentPlaylist() {
  return currentPlaylist;
}

/**
 * Gets current track index
 * @returns {number} Current index
 */
export function getCurrentIndex() {
  return currentIndex;
}
