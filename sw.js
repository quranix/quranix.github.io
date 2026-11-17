// Quranix SW - v9 - full offline app shell + safe precache
const CACHE = 'quranix-v9';
const ASSETS = [
  './', './index.html', './quran-data.js', './manifest.json', './favicon.ico',
  './icon-32x32.png', './icon-48x48.png', './icon-180x180.png',
  './icon-192x192.png', './icon-512x512.png',
  './icon-maskable-192x192.png', './icon-maskable-512x512.png', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(a => c.add(new Request(a, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;

  if (url.includes('everyayah.com') || url.includes('api.quran.com') || url.includes('api.alquran.cloud')) {
    return;
  }

  const isIcon = /(favicon\.ico|icon-[^/]*\.png|apple-touch-icon\.png|manifest\.json)/.test(url);
  e.respondWith(
    fetch(req, isIcon ? { cache: 'no-cache' } : undefined)
      .then(r => {
        if (r && r.ok) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return r;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
