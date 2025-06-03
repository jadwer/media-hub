// js/main.js

import { uploadFile, getFiles } from './api/index.js';
import { switchTheme, toggleTheme, loadTheme } from './ui/themeManager.js';
import { renderFiles, changePage, searchFiles } from './ui/fileViewer.js';
import { playAudio, downloadFile } from './ui/player.js';
import { setupUploader } from './ui/uploader.js';

let files = [];
let filteredFiles = [];
let currentPage = 1;

function showSpinner() {
  document.querySelector('.spinner').style.display = 'flex';
}

function hideSpinner() {
  document.querySelector('.spinner').style.display = 'none';
}

async function loadFiles() {
  showSpinner();
  try {
    files = await getFiles();
    filteredFiles = files.files;
    currentPage = 1;
    renderFiles(filteredFiles, currentPage);
  } catch (error) {
    alert("Error al cargar archivos.");
    console.log(error);
  } finally {
    hideSpinner();
  }
}

function initEvents() {
  loadTheme();

  document.querySelectorAll('[data-theme]').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      const theme = e.target.dataset.theme;
      switchTheme(theme);
    })
  );

  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  document.getElementById('searchInput').addEventListener('input', (e) => {
    filteredFiles = searchFiles(files, e.target.value);
    currentPage = 1;
    renderFiles(filteredFiles, currentPage);
  });

  document.getElementById('prevPage').addEventListener('click', () => {
    currentPage = changePage(filteredFiles, currentPage, -1);
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage = changePage(filteredFiles, currentPage, 1);
  });

  setupUploader(loadFiles);

  document.addEventListener('click', (e) => {
    if (e.target.matches('.play-btn')) {
      const url = e.target.dataset.url;
      playAudio(url);
    }
    if (e.target.matches('.download-btn')) {
      const url = e.target.dataset.url;
      downloadFile(url);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  loadFiles();
});
