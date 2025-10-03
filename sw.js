/**
 * Service Worker para Media Hub PWA
 * Estrategia de cache: Network First para API, Cache First para assets
 */

const CACHE_VERSION = 'v1.3.0';
const STATIC_CACHE = `mediahub-static-${CACHE_VERSION}`;
const MEDIA_CACHE = `mediahub-media-${CACHE_VERSION}`;
const API_CACHE = `mediahub-api-${CACHE_VERSION}`;

// Assets estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/index.php',
  '/login.html',
  '/manifest.json',
  '/styles/index.css',
  '/styles/themes/metal.css',
  '/styles/themes/dark.css',
  '/styles/themes/light.css',
  '/js/main.js',
  '/js/api/index.js',
  '/js/ui/themeManager.js',
  '/js/ui/player.js',
  '/js/ui/uploader.js',
  '/js/ui/modal.js',
  '/js/ui/toast.js',
  '/js/ui/fileViewer.js',
  '/js/ui/navigation.js',
  '/js/ui/bottomPlayer.js',
  '/js/ui/playlistManager.js',
  '/js/utils/auth.js',
  '/js/utils/debounce.js',
  '/assets/riff.mp3',
  '/assets/logo.svg'
];

// Install event - cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.error('[SW] Install failed:', err))
  );
});

// Activate event - limpiar caches viejos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== MEDIA_CACHE && cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - estrategias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear peticiones del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Estrategia para APIs: Network First (siempre intenta red primero)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Estrategia para archivos multimedia: Cache First (cache primero, red después)
  if (url.pathname.startsWith('/files/')) {
    event.respondWith(cacheFirstStrategy(request, MEDIA_CACHE));
    return;
  }

  // Estrategia para assets estáticos: Cache First
  event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
});

/**
 * Network First Strategy
 * Intenta red primero, si falla usa cache
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);

    // Solo cachear respuestas exitosas
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, using cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Si no hay cache, retornar error offline
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Sin conexión a internet',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache First Strategy
 * Usa cache primero, si no existe busca en red
 */
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log('[SW] Serving from cache:', request.url);
    return cachedResponse;
  }

  try {
    const response = await fetch(request);

    // Cachear archivos multimedia y assets estáticos
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      console.log('[SW] Cached new resource:', request.url);
    }

    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);

    // Si es una navegación, mostrar página offline
    if (request.mode === 'navigate') {
      return caches.match('/login.html');
    }

    return new Response('Offline', { status: 503 });
  }
}

// Message event - limpiar cache manual
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificar al cliente cuando hay una actualización
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

console.log('[SW] Service Worker loaded, version:', CACHE_VERSION);
