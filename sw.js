// YARD Service Worker — v1
// Cache-first strategy. All app assets served from cache after first load.
// Zero network calls for app shell. localStorage data never leaves the device.

const CACHE_NAME = 'yard-v1';

const ASSETS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache all assets, activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: purge old caches, claim all clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin resources
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
