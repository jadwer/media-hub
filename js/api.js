
// === CONFIG ===
const API_URL = `${window.location.origin}/api/v1.php`;
const FILES_PER_PAGE = 20;


// === GLOBALS ===
let files=[], filteredFiles=[];
let currentPage=1;
let currentOrder=localStorage.getItem('order')||'date';
let currentSearch=localStorage.getItem('search')||'';
let currentTheme = localStorage.getItem('theme') || 'metal';

// === INIT ===
document.addEventListener('DOMContentLoaded', ()=>{
  applyTheme(currentTheme);
  document.getElementById('searchInput').value=currentSearch;
  document.getElementById('orderSelect').value=currentOrder;
  addThemeButtons();
  addLightboxListeners();
  addControlListeners();
  fetchFiles(currentOrder);

  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const messageDiv = document.getElementById('uploadMessage');

  uploadForm.addEventListener('change', async (event) => {
    event.preventDefault();
    if (!fileInput.files.length) return;
    console.log("trying to play the riff...");
    playRiff();

    const formData = new FormData();
    Array.from(fileInput.files).forEach(file => formData.append('archivo[]', file));

    try {
      const response = await fetch('./api/upload.php', {
        method: 'POST',
        body: formData
      });

      if (response.redirected) {
        window.location.href = response.url;
      } else {
        const text = await response.text();
        showMessage('success', '¡Archivos subidos correctamente!');
        fileInput.value = ''; // Limpiar input
      }
    } catch (error) {
      showMessage('error', 'Error al subir los archivos.');
      console.error('Error al subir:', error);
    }
  });

  function showMessage(type, text) {
    messageDiv.innerHTML = `<div style="padding:10px; border-radius:8px; background:${type==='success' ? '#28a745' : '#dc3545'}; color:white;">${text}</div>`;
  }
});
// === FETCH ===
async function fetchFiles(order=currentOrder){
  currentOrder=order;
  localStorage.setItem('order',order);
  showSkeletonLoader();

  const res = await fetch(`${API_URL}?order=${order}`);
  const data     = await res.json();

  if (!Array.isArray(data)) {             // el backend devolvió un objeto de error
    showMessage('error', data.error || 'Error inesperado del servidor');
    hideSpinner();                        // quita skeleton / spinner si sigue activo
    return;                               // detén la ejecución
  }

  files = data;
  applyFilters();
}

// === FILTER ===
function applyFilters(){
  currentSearch=document.getElementById('searchInput').value.trim();
  localStorage.setItem('search',currentSearch);
  filteredFiles = currentSearch?
      files.filter(f=>f.name.toLowerCase().includes(currentSearch.toLowerCase()))
      :[...files];
  currentPage=1;
  renderFiles();
  renderPagination();
}

// === RENDER LIST ===
function renderFiles(){
  const list = document.getElementById('fileList');
  list.innerHTML='';
  const start=(currentPage-1)*FILES_PER_PAGE, end=start+FILES_PER_PAGE;
  const slice=filteredFiles.slice(start,end);
  if(!slice.length){list.innerHTML='<p>No se encontraron archivos.</p>';return;}
  slice.forEach(file=>{
    const li=document.createElement('li');li.className='file-item';
    const name=document.createElement('span');name.className='file-name';name.textContent=file.name;
    name.addEventListener('click',()=>handleFileClick(file));
    const meta=document.createElement('span');meta.className='file-meta';meta.textContent=`${file.sizeMB} MB · ${file.modified}`;
    const dl=document.createElement('a');dl.href=file.url;dl.download=file.name;dl.textContent='⬇️';dl.className='file-download';
    li.append(name,dl,meta);
    list.append(li);
  });
}

// === PAGINATION ===
function renderPagination(){
  const pag=document.getElementById('pagination');pag.innerHTML='';
  const total=Math.ceil(filteredFiles.length/FILES_PER_PAGE);
  for(let i=1;i<=total;i++){
    const btn=document.createElement('button');btn.textContent=i;btn.className='page-btn';
    if(i===currentPage)btn.classList.add('active');
    btn.onclick=()=>{currentPage=i;renderFiles();renderPagination()};
    pag.append(btn);
  }
}

// === FILE CLICK ===
function handleFileClick(file){
  if(file.type==='image'){openLightbox(file.url);return;}
  const container=document.getElementById('playerContainer');
  container.innerHTML='';
  if(file.type==='video'){
    const vid=document.createElement('video');vid.controls=true;vid.src=file.url;vid.style.width='100%';vid.style.borderRadius='8px';
    container.appendChild(vid);vid.play();
  }else{
    const aud=document.createElement('audio');aud.controls=true;aud.src=file.url;aud.style.width='100%';aud.style.borderRadius='8px';
    container.appendChild(aud);aud.play();
  }
}

// === THEME ===
function applyTheme(t){
  document.body.classList.remove('dark-mode','light-mode','metal-mode');
  if(t==='light')document.body.classList.add('light-mode');
  else if(t==='metal')document.body.classList.add('metal-mode');
  else document.body.classList.add('dark-mode');
  localStorage.setItem('theme',t);
}
function addThemeButtons(){
  document.querySelectorAll('.theme-switcher button').forEach(btn=>{
    btn.onclick=()=>{applyTheme(btn.dataset.theme)};
  });
}
// === CONTROLS ===
function addControlListeners(){
  document.getElementById('searchInput').addEventListener('input',applyFilters);
  document.getElementById('orderSelect').addEventListener('change',e=>fetchFiles(e.target.value));
}
// === SKELETON ===
function showSkeletonLoader(count=5){
  const list=document.getElementById('fileList');list.innerHTML='';
  for(let i=0;i<count;i++){
    const s=document.createElement('div');s.className='skeleton-item';
    const top=document.createElement('div');top.className='skeleton-top';
    const title=document.createElement('div');title.className='skeleton-title';
    const dl=document.createElement('div');dl.className='skeleton-download';
    top.append(title,dl);
    const meta=document.createElement('div');meta.className='skeleton-meta';
    s.append(top,meta);list.append(s);
  }
}
// === LIGHTBOX ===
function openLightbox(url){
  const lb=document.getElementById('lightbox');const img=document.getElementById('lightboxImg');
  img.src=url;lb.classList.remove('hidden');
}
function addLightboxListeners(){
  const lb=document.getElementById('lightbox');
  document.getElementById('closeLightbox').onclick=()=>lb.classList.add('hidden');
  lb.onclick=e=>{if(e.target===lb)lb.classList.add('hidden');}
}

// === PLAY RIFF ===
function playRiff() {
  const riff = document.getElementById('riffPlayer');
  if (riff) {
    console.log("playing riff...");
    riff.currentTime = 0;    // desde el inicio
    riff.volume = 0.5;       // volumen moderado
    riff.play().catch(() => {/*silenciar errores de autoplay*/});
  }
}