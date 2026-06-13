// ── ProgramDict Service Worker v1.0 ──
const CACHE_NAME = 'programdict-v1';

const ASSETS = [
  './',
  './index.html',
  './index_part1.html',
  './index_part2.html',
  './index_part3.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap'
];

// ── INSTALL: সব file cache করো ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.filter(url => !url.startsWith('http')));
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: পুরানো cache মুছো ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: Cache-first strategy ──
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Google Fonts ও external resource cache করো
        if (event.request.url.includes('fonts.googleapis') ||
            event.request.url.includes('fonts.gstatic')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
