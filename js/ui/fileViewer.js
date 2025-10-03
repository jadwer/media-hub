/**
 * @fileoverview File viewer with pagination and search functionality.
 * Renders file list and handles navigation between pages.
 */

const itemsPerPage = 6;

/**
 * Renders a paginated list of files to the DOM
 * @param {Array<Object>} files - Array of file objects to render
 * @param {number} [page=1] - Page number to display
 */
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

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.dataset.filename = file.name;

    controls.appendChild(playBtn);
    controls.appendChild(downloadBtn);
    controls.appendChild(deleteBtn);
    fileItem.appendChild(fileName);
    fileItem.appendChild(controls);

    listContainer.appendChild(fileItem);
  }

  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
}

/**
 * Changes the current page by a delta amount
 * @param {Array<Object>} files - Array of files to paginate
 * @param {number} currentPage - Current page number
 * @param {number} delta - Change amount (e.g., -1 for previous, +1 for next)
 * @returns {number} The new page number after change
 */
export function changePage(files, currentPage, delta) {
  const totalPages = Math.ceil(files.length / itemsPerPage);
  const newPage = Math.max(1, Math.min(currentPage + delta, totalPages));
  renderFiles(files, newPage);
  return newPage;
}

/**
 * Filters files by name based on search query
 * @param {Array<Object>} files - Full array of file objects from API response
 * @param {string} query - Search query string
 * @returns {Array<Object>} Filtered array of files matching the query
 */
export function searchFiles(files, query) {
  const normalized = query.trim().toLowerCase();
  return files.filter(file => file.name.toLowerCase().includes(normalized));
}
