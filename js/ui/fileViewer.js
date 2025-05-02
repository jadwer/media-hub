// js/ui/fileViewer.js

const itemsPerPage = 6;

export function renderFiles(files, page = 1) {
  const listContainer = document.getElementById('fileList');
  const pageInfo = document.getElementById('pageInfo');

  const totalPages = Math.ceil(files.length / itemsPerPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = files.slice(start, end);

  console.log('🔍 renderFiles: files.length =', files.length);
  console.log('🔍 currentPage =', currentPage);
  console.log('🔍 totalPages =', totalPages);
  console.log('🔍 start =', start, ', end =', end);
  console.log('🔍 pageItems =', pageItems.map(f => f.name));

  listContainer.innerHTML = '';

  if (pageItems.length === 0) {
    listContainer.innerHTML = '<p>No se encontraron archivos.</p>';
    pageInfo.textContent = '';
    return;
  }

  for (const file of pageItems) {
    const fileItem = document.createElement('div');
    fileItem.classList.add('file-item');

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

    controls.appendChild(playBtn);
    controls.appendChild(downloadBtn);
    fileItem.appendChild(fileName);
    fileItem.appendChild(controls);

    listContainer.appendChild(fileItem);
  }

  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
}

export function changePage(files, currentPage, delta) {
  const totalPages = Math.ceil(files.length / itemsPerPage);
  const newPage = Math.max(1, Math.min(currentPage + delta, totalPages));
  renderFiles(files, newPage);
  return newPage;
}

export function searchFiles(files, query) {
  const normalized = query.trim().toLowerCase();
  return files.filter(file => file.name.toLowerCase().includes(normalized));
}
