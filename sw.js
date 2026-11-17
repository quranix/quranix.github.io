// Quranix SW - v6 maskable fix
const CACHE = 'quranix-v6-maskable';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-32x32.png',
  './icon-48x48.png',
  './icon-180x180.png',
  './icon-192x192.png',
  './icon-192-maskable.png',
  './icon-512x512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
  './favicon.ico'
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if (k !== CACHE) return caches.delete(k); })
    )).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request, {cache: 'no-store'}).then(r => {
      if (r.ok && e.request.method === 'GET') {
        caches.open(CACHE).then(c => c.put(e.request, r.clone()));
      }
      return r;
    }).catch(() => caches.match(e.request))
  );
});
