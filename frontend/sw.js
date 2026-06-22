// VidyaQuest Service Worker – Low Connectivity Support
// Version: 2.0 — Stale-while-revalidate + Network-first API + Offline fallback

const CACHE_VERSION = 'vidyaquest-v2';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;

// Core static assets that MUST be available offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/js/translations.js',
  '/js/games.js',
  '/js/pico.js',
  '/manifest.json',
];

// ─── INSTALL ────────────────────────────────────────────────────────────────
// Pre-cache all static assets immediately; skip waiting so new SW activates fast
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('[SW] Install failed:', err))
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────────────────────
// Delete old caches so stale assets don't linger
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())  // Take control of all open tabs immediately
  );
});

// ─── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Chrome extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // 1. API requests → Network-first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // 2. Socket.io → Always network (real-time, never cache)
  if (url.pathname.startsWith('/socket.io/')) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // 3. CDN resources (Chart.js, KaTeX, Google Fonts) → Stale-while-revalidate
  if (
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // 4. Everything else (local static files) → Cache-first
  event.respondWith(cacheFirst(request));
});

// ─── STRATEGIES ─────────────────────────────────────────────────────────────

// Cache-first: serve from cache; on miss, fetch + cache + return
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // For HTML navigation requests, return the cached shell
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline – resource not cached', { status: 503 });
  }
}

// Network-first for API: try network first, fall back to cached API response
async function networkFirstAPI(request) {
  const cache = await caches.open(API_CACHE);

  try {
    // Race network against a 6-second timeout (important for 2G)
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return stale cached API response if available
    const cached = await cache.match(request);
    if (cached) return cached;

    return new Response(
      JSON.stringify({ error: 'Offline – no cached data available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Stale-while-revalidate: serve cached copy immediately, update cache in background
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || networkFetch || new Response('', { status: 503 });
}

// ─── BACKGROUND SYNC ────────────────────────────────────────────────────────
// Triggered by the app when coming back online to sync offline quiz progress
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-progress') {
    event.waitUntil(
      // Notify all open clients to run the sync
      self.clients.matchAll().then((clients) =>
        clients.forEach((client) =>
          client.postMessage({ type: 'SYNC_OFFLINE_PROGRESS' })
        )
      )
    );
  }
});

// ─── MESSAGE HANDLING ────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
