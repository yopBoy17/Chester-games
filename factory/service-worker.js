const CACHE_NAME = 'factory-pwa-v4';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './factory.js',
  './update-check.js',
  './manifest.webmanifest',
  './game/config.js',
  './game/balance.js',
  './game/conveyor.js',
  './game/resources.js',
  './game/phaser-renderer.js',
  './game/machines/drill.js',
  './game/machines/processing.js',
  './game/inventory/inventory.js',
  './game/inventory/warehouse-output.js',
  './game/energy/energy.js',
  './node_modules/phaser/dist/phaser.min.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/products/conveyor.png',
  './assets/products/filters/filter-mode-1.png',
  './assets/products/filters/filter-mode-2.png',
  './assets/products/filters/filter-mode-3.png',
  './assets/products/distributors/distributor-mode-1.png',
  './assets/products/distributors/distributor-mode-2.png',
  './assets/products/distributors/distributor-mode-3.png',
];

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.startsWith('factory-pwa-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});
