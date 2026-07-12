// VidyaQuest Service Worker – Low Connectivity & Low-Cost Device Support
// Version: 3.0 — Enhanced pre-cache, stale-while-revalidate, offline fallback, reduced-data mode

const CACHE_VERSION  = 'vidyaquest-v3';
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const API_CACHE      = `${CACHE_VERSION}-api`;
const CDN_CACHE      = `${CACHE_VERSION}-cdn`;

// ── Core static assets pre-cached on install (must work fully offline) ──────
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/js/translations.js',
  '/js/games.js',
  '/js/pico.js',
  '/manifest.json',
  '/login_bg.jpg',
];

// ── CDN assets pre-cached for offline math/markdown rendering ───────────────
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
];

// ── Font URLs (Google Fonts) — cached for offline and low-bandwidth ──────────
const FONT_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Hind:wght@400;500;600&display=swap',
];

// ─── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Pre-cache core app shell
      caches.open(STATIC_CACHE).then((cache) =>
        cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('[SW] Some static assets failed to pre-cache (may be offline):', err);
        })
      ),
      // Pre-cache CDN libraries (best-effort — won't fail install if offline)
      caches.open(CDN_CACHE).then((cache) =>
        Promise.all(
          [...CDN_ASSETS, ...FONT_ASSETS].map((url) =>
            fetch(url, { mode: 'cors' })
              .then((res) => { if (res.ok) cache.put(url, res); })
              .catch(() => {}) // Silently skip if CDN unreachable
          )
        )
      ),
    ]).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE && key !== CDN_CACHE)
          .map((key) => {
            console.log('[SW] Deleting stale cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome extensions, and browser-sync
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.hostname === 'localhost' && url.port === '3001') return; // browser-sync

  // 1. API requests → Network-first with 5s timeout (faster fallback for 2G)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // 2. Socket.io → Always network (never cache real-time)
  if (url.pathname.startsWith('/socket.io/')) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // 3. CDN resources (KaTeX, Chart.js, marked, Google Fonts) → Cache-first
  //    On slow/offline devices, always serve from cache instantly
  if (
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(cacheFirst(request, CDN_CACHE));
    return;
  }

  // 4. PhET Labs (large files) → Cache-first (they almost never change)
  if (url.pathname.startsWith('/labs/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 5. Local static files (CSS, JS, images) → Stale-while-revalidate
  //    Serves cached version instantly, updates in background
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
});

// ─── STRATEGIES ─────────────────────────────────────────────────────────────

// Cache-first: ideal for immutable assets (CDN, fonts, PhET labs)
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type !== 'opaque') {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline – resource not cached', { status: 503 });
  }
}

// Stale-while-revalidate: serve cached copy instantly, update cache in background
// Ideal for app shell (CSS, JS) — user sees content immediately even on slow 2G
async function staleWhileRevalidate(request, cacheName = STATIC_CACHE) {
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

  // Return cached immediately if available, otherwise await network
  return cached || networkFetch || offlineFallback(request);
}

// Network-first for API: try network first, fall back to stale cached data
// Timeout set to 5s (down from 8s) — faster fallback on 2G/flaky connections
async function networkFirstAPI(request) {
  const cache = await caches.open(API_CACHE);

  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response && response.status === 200) {
      // Only cache safe GET API responses (not auth/profile mutation endpoints)
      const url = new URL(request.url);
      const cacheable = ['/api/subjects', '/api/lessons', '/api/leaderboard', '/api/badges'];
      if (cacheable.some((p) => url.pathname.startsWith(p))) {
        cache.put(request, response.clone());
      }
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      // Add a custom header so the app knows this is stale data
      const headers = new Headers(cached.headers);
      headers.set('X-From-Cache', 'true');
      const body = await cached.blob();
      return new Response(body, { status: 200, headers });
    }

    return new Response(
      JSON.stringify({ error: 'offline', message: 'No internet connection. Check offline lessons.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Offline fallback for navigation requests
async function offlineFallback(request) {
  if (request.mode === 'navigate') {
    const cached = await caches.match('/index.html');
    if (cached) return cached;
  }
  return new Response('Offline', { status: 503 });
}

// ─── BACKGROUND SYNC ────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-progress') {
    event.waitUntil(
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
  // Handle cache-clear message from app (called on logout)
  if (event.data && event.data.type === 'CLEAR_API_CACHE') {
    caches.delete(API_CACHE).then(() =>
      console.log('[SW] API cache cleared on logout')
    );
  }
});
