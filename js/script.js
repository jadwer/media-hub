// Highlight al arrastrar sobre la zona de carga
const dropzone = document.querySelector(".dropzone");
const input = dropzone.querySelector("input");

dropzone.addEventListener("click", () => input.click());

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("hover");
});

dropzone.addEventListener("dragleave", () =>
  dropzone.classList.remove("hover")
);

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("hover");
  input.files = e.dataTransfer.files;
  document.getElementById("uploadForm").submit();
});

function playAudio(fileUrl) {
  const player = document.getElementById("mainPlayer");
  const source = document.getElementById("mainSource");
  source.src = fileUrl;
  player.load();
  player.play();
}


document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const messageDiv = document.getElementById('uploadMessage');
  const spinnerOverlay = document.getElementById('uploadSpinner');

  uploadForm.addEventListener('change', async (event) => {
    event.preventDefault();
    if (!fileInput.files.length) return;

    const formData = new FormData();
    Array.from(fileInput.files).forEach(file => formData.append('archivo[]', file));

    showSpinner(); // Mostrar spinner dependiendo del tema

    try {
      const response = await fetch('./api/upload.php', {
        method: 'POST',
        body: formData
      });

      hideSpinner(); // Ocultar spinner

      if (response.redirected) {
        window.location.href = response.url;
      } else {
        const text = await response.text();
        showMessage('success', '¡Archivos subidos correctamente!');
        fileInput.value = ''; 
      }
    } catch (error) {
      hideSpinner();
      showMessage('error', 'Error al subir los archivos.');
      console.error('Error al subir:', error);
    }
  });

  function showMessage(type, text) {
    messageDiv.innerHTML = `<div style="padding:10px; border-radius:8px; background:${type==='success' ? '#28a745' : '#dc3545'}; color:white;">${text}</div>`;
  }

  function showSpinner() {
    const spinner = document.getElementById('uploadSpinner');
    const body = document.body;
    if (body.classList.contains('metal-mode')) {
      spinner.innerHTML = `
        <div class="wave-spinner">
          <div></div><div></div><div></div><div></div><div></div>
        </div>
      `;
      playRiff(); // Reproducir riff de guitarra
    } else {
      spinner.innerHTML = `<div class="spinner"></div>`;
    }
    spinner.style.display = 'flex';
  }

  function hideSpinner() {
    const spinner = document.getElementById('uploadSpinner');
    spinner.style.display = 'none';
  }
});

function playRiff() {
  const riff = document.getElementById('riffPlayer');
  if (riff) {
    riff.currentTime = 0;    // desde el inicio
    riff.volume = 0.5;       // volumen moderado
    riff.play().catch(() => {/*silenciar errores de autoplay*/});
  }
}