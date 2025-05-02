// js/ui/uploader.js

import { uploadFile } from '../api/index.js';

export function setupUploader(onUploadComplete) {
  const dropzone = document.querySelector('.dropzone');
  const input = dropzone.querySelector('input');
  const preview = document.getElementById('preview');

  input.setAttribute('multiple', true); // permite varios archivos

  dropzone.addEventListener('click', () => input.click());

  input.addEventListener('change', (e) => {
    handleFiles([...e.target.files], onUploadComplete);
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
    handleFiles(files, onUploadComplete);
  });

  function handleFiles(files, onFinish) {
    showPreview(files);
    const formData = new FormData();

    for (const file of files) {
      formData.append('archivo[]', file); // el [] hace que PHP los reciba como múltiples
    }

    uploadFile(formData).then(response => {
      if (response.success) {
        playRiffIfMetal();
        onFinish();
      } else {
        alert('❌ Error: ' + (response.errors || []).join('\n'));
      }
    }).catch(() => {
      alert('Error al conectar con el servidor.');
    });
  }

  function showPreview(files) {
    preview.innerHTML = '';
    for (const file of files) {
      const type = file.type;
      if (type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = 'Vista previa';
        preview.appendChild(img);
      } else if (type.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);
        audio.controls = true;
        preview.appendChild(audio);
      } else if (type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        preview.appendChild(video);
      } else {
        const msg = document.createElement('p');
        msg.textContent = `Vista previa no disponible para: ${file.name}`;
        preview.appendChild(msg);
      }
    }
  }

  function playRiffIfMetal() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'metal') {
      const riff = document.getElementById('riffPlayer');
      riff?.play().catch(() => {});
    }
  }
}
