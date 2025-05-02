// js/ui/player.js

let globalPlayer = null;

export function playAudio(url) {
  if (globalPlayer) {
    globalPlayer.pause();
    globalPlayer.remove();
  }

  globalPlayer = document.createElement('audio');
  globalPlayer.controls = true;
  globalPlayer.autoplay = true;
  globalPlayer.src = url;

  const playerContainer = document.getElementById('playerContainer');
  playerContainer.innerHTML = '';
  playerContainer.appendChild(globalPlayer);
}

export function downloadFile(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
