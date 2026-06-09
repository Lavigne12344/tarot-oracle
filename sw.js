const CACHE_NAME = 'tarot-oracle-v1';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/data.js',
  '/js/features.js',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
