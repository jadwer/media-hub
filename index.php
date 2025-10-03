<?php
// Set security headers
require_once __DIR__ . '/api/security.php';
?>
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Global Currency Exchange - Money Transfer & FX Services</title>
    <!-- Google Fonts -->
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
      rel="stylesheet" />
    <!-- Favicon & (nuevo) logo SVG mono  -->
    <link rel="icon" href="./assets/logo.svg" type="image/svg+xml" />

    <!-- Viewport -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- ‑‑‑ SEO / Social meta restored  ‑‑‑ -->
    <meta
      name="description"
      content="Global currency exchange platform. Compare real-time foreign exchange rates, transfer money internationally, and access premium financial services." />
    <meta
      name="keywords"
      content="currency exchange, forex, foreign exchange, money transfer, international payments, financial services, exchange rates, FX trading, remittance, wire transfer, banking, swift transfer, cross-border payments" />
    <meta name="author" content="Global Exchange Services" />

    <!-- PWA bar colour para tema rosa‑metal por defecto -->
    <meta name="theme-color" content="#ff4da6" />

    <!-- Indexing -->
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />
    <meta name="google" content="notranslate" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Global Currency Exchange - Financial Services" />
    <meta
      name="twitter:description"
      content="International money transfer and currency exchange services with competitive rates." />

    <!-- Open Graph -->
    <meta property="og:title" content="Global Currency Exchange - Financial Services Platform" />
    <meta
      property="og:description"
      content="Compare exchange rates and transfer money internationally with competitive rates and secure financial services." />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Global Exchange Platform" />
    <meta property="og:locale" content="en_US" />

    <!-- Facebook Article tags (si FB se usa) -->
    <meta property="fb:app_id" content="1234567890" />
    <meta property="article:published_time" content="2023-10-01T12:00:00Z" />
    <meta property="article:modified_time" content="2025-04-28T12:00:00Z" />
    <meta name="category" content="Finance" />
    <meta name="classification" content="Financial Services, Banking, Currency Exchange" />
    <meta name="subject" content="Foreign Exchange and Money Transfer Services" />
    <meta name="coverage" content="Worldwide" />
    <meta name="distribution" content="Global" />
    <meta name="rating" content="General" />
    <meta name="target" content="business, financial services, international trade" />
    <meta name="page-topic" content="Finance" />
    <meta name="page-type" content="Financial Services Platform" />
    <meta name="audience" content="Business, Financial Professionals, International Traders" />

    <!-- Main CSS -->
    <link id="themeStylesheet" rel="stylesheet" href="styles/themes/metal.css" />
    <link rel="stylesheet" href="styles/index.css" />

    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Media Hub" />
    <link rel="apple-touch-icon" href="/assets/icon-192.svg" />

    <!-- JS app -->
    <script type="module" src="js/main.js"></script>

    <!-- Service Worker Registration -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('✅ Service Worker registered:', registration.scope);

              // Check for updates
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nueva versión disponible
                    if (confirm('Nueva versión disponible. ¿Recargar para actualizar?')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }
                  }
                });
              });
            })
            .catch((error) => {
              console.error('❌ Service Worker registration failed:', error);
            });

          // Recargar cuando el SW tome control
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        });
      }
    </script>

  </head>
  <body>

    <!-- Header -->
    <header class="app-header">
      <h1>💱 Global Exchange</h1>
      <button id="themeToggle" title="Cambiar tema">🌓</button>
    </header>

    <!-- Main Layout: Sidebar + Content -->
    <div class="app-container">

      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <button class="sidebar-item active" data-section="browse">
            <span class="sidebar-icon">🔍</span>
            <span class="sidebar-text">Transactions</span>
          </button>
          <button class="sidebar-item" data-section="manage">
            <span class="sidebar-icon">📁</span>
            <span class="sidebar-text">Documents</span>
          </button>
          <button class="sidebar-item" data-section="playlists">
            <span class="sidebar-icon">📋</span>
            <span class="sidebar-text">Reports</span>
          </button>
        </nav>
        <div class="sidebar-footer">
          <p>Global Exchange © <span id="year"></span></p>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">

        <!-- Section: Browse Files -->
        <section id="section-browse" class="content-section active">
          <h2 class="section-title">Transaction History</h2>

          <!-- Controles de búsqueda y orden -->
          <div class="controls">
            <div class="search-bar">
              <input type="text" id="searchInput" placeholder="Search transactions..." />
              <div class="view-controls">
                <button id="viewList" class="view-btn active" title="Vista lista">☰</button>
                <button id="viewGrid" class="view-btn" title="Vista cuadrícula">⊞</button>
              </div>
            </div>

            <!-- Advanced Filters -->
            <div class="filter-controls">
              <button id="toggleFilters" class="filter-toggle-btn">
                🔽 Filtros avanzados
              </button>
              <div id="advancedFilters" class="advanced-filters" style="display: none;">
                <div class="filter-group">
                  <label>Tipo:</label>
                  <select id="filterType">
                    <option value="all">Todos</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="image">Imagen</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Tamaño:</label>
                  <select id="filterSize">
                    <option value="all">Cualquiera</option>
                    <option value="small">&lt; 1 MB</option>
                    <option value="medium">1 - 10 MB</option>
                    <option value="large">10 - 50 MB</option>
                    <option value="xlarge">&gt; 50 MB</option>
                  </select>
                </div>
                <button id="clearFilters" class="clear-filters-btn">✕ Limpiar</button>
              </div>
            </div>

            <div class="sort-controls">
              <label for="sortSelect">Ordenar:</label>
              <select id="sortSelect">
                <option value="date_desc" selected>Fecha (más reciente)</option>
                <option value="date_asc">Fecha (más antiguo)</option>
                <option value="name_asc">Nombre (A-Z)</option>
                <option value="name_desc">Nombre (Z-A)</option>
              </select>
            </div>
            <div class="pagination-controls">
              <label for="perPageSelect">Mostrar:</label>
              <select id="perPageSelect">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="all">Todos</option>
              </select>
              <button id="prevPage">◀</button>
              <span id="pageInfo"></span>
              <button id="nextPage">▶</button>
            </div>
          </div>

          <!-- Batch Actions Bar (hidden by default) -->
          <div id="batchActionsBar" class="batch-actions-bar" style="display: none;">
            <div class="batch-info">
              <input type="checkbox" id="selectAll" />
              <span id="selectedCount">0 seleccionados</span>
            </div>
            <div class="batch-buttons">
              <button id="batchDownload" class="batch-btn">⬇ Descargar</button>
              <button id="batchDelete" class="batch-btn batch-btn-danger">🗑️ Eliminar</button>
              <button id="batchAddToPlaylist" class="batch-btn">➕ Agregar a playlist</button>
            </div>
          </div>

          <!-- File List -->
          <div id="fileList" class="file-list"></div>
        </section>

        <!-- Section: Manage Files -->
        <section id="section-manage" class="content-section">
          <h2 class="section-title">Document Management</h2>

          <!-- Drag & Drop -->
          <div class="dropzone">
            <input type="file" hidden />
            <p>Arrastra aquí tu archivo o haz clic para seleccionarlo</p>
          </div>

          <div id="preview" class="preview-container"></div>

          <div class="manage-actions">
            <h3>Acciones rápidas</h3>
            <p>Desde la sección <strong>Explorar</strong> puedes:</p>
            <ul>
              <li>✏️ Renombrar archivos</li>
              <li>🗑️ Eliminar archivos</li>
              <li>⬇ Descargar archivos</li>
            </ul>
          </div>

          <!-- Storage Stats -->
          <div class="storage-stats" id="storageStats">
            <h3>📊 Estadísticas de Almacenamiento</h3>
            <div class="storage-loading">Cargando estadísticas...</div>
          </div>
        </section>

        <!-- Section: Playlists -->
        <section id="section-playlists" class="content-section">
          <h2 class="section-title">Financial Reports</h2>

          <div class="playlist-header">
            <button id="createPlaylistBtn" class="btn-primary">
              ➕ New Report
            </button>
          </div>

          <div id="playlistsContainer" class="playlists-container">
            <p class="empty-state">No reports available. Create your first report!</p>
          </div>
        </section>

      </main>

    </div>

    <!-- Bottom Player (Persistent) -->
    <div id="bottomPlayer" class="bottom-player" style="display: none;">
      <div class="player-info">
        <div class="player-thumbnail" id="playerThumbnail">
          <span>🎵</span>
        </div>
        <div class="player-details">
          <p class="player-title" id="playerTitle">Nada reproduciendo</p>
          <p class="player-subtitle" id="playerSubtitle">Selecciona un archivo para reproducir</p>
        </div>
      </div>

      <div class="player-controls">
        <button id="playerPrev" class="player-btn" title="Anterior">⏮</button>
        <button id="playerPlayPause" class="player-btn player-btn-main" title="Reproducir/Pausar">▶</button>
        <button id="playerNext" class="player-btn" title="Siguiente">⏭</button>
      </div>

      <div class="player-progress">
        <span id="playerCurrentTime">0:00</span>
        <div class="progress-bar" id="playerProgressBar">
          <div class="progress-fill" id="playerProgressFill"></div>
        </div>
        <span id="playerDuration">0:00</span>
      </div>

      <div class="player-extra">
        <button id="playerSpeed" class="player-btn-small" title="Velocidad">1x</button>
        <button id="playerVolume" class="player-btn-small" title="Volumen">🔊</button>
        <button id="playerPlaylist" class="player-btn-small" title="Ver playlist">📋</button>
      </div>

      <!-- Hidden media elements -->
      <audio id="playerAudio" style="display: none;"></audio>
      <video id="playerVideo" style="display: none;"></video>
      <img id="playerImage" style="display: none;" />
    </div>

    <!-- Spinner de carga -->
    <div class="spinner" style="display: none;">Cargando...</div>
    <audio id="riffPlayer" src="./assets/riff.mp3" preload="auto"></audio>

  </body>
</html>

