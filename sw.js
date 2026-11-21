const CACHE = 'quranix-v14';

// Both .woff2 and .woff are listed for the fonts the page can load in either format.
// A file that does not exist is skipped (the install loop below catches each failure).
const ASSETS = [
  './',
  './index.html',
  './fonts/hind-siliguri-300.woff2',
  './fonts/hind-siliguri-300.woff',
  './fonts/hind-siliguri-400.woff2',
  './fonts/hind-siliguri-400.woff',
  './fonts/hind-siliguri-500.woff2',
  './fonts/hind-siliguri-500.woff',
  './fonts/hind-siliguri-600.woff2',
  './fonts/hind-siliguri-600.woff',
  './fonts/hind-siliguri-700.woff2',
  './fonts/hind-siliguri-700.woff',
  './fonts/noto-naskh-arabic.woff2',
  './fonts/noto-naskh-arabic.woff',
  './fonts/amiri-quran.woff2',
  './fonts/amiri-quran.woff',
  './fonts/kalpurush.woff2',
  './fonts/kalpurush.woff',
  './fonts/noto-serif-bengali-400.woff2',
  './fonts/noto-serif-bengali-400.woff',
  './fonts/noto-serif-bengali-700.woff2',
  './fonts/noto-serif-bengali-700.woff',
  './material-symbols-rounded.woff2',
  './fonts/material-symbols-rounded.woff2',
  './manifest.json'
];

// INSTALL
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.add('./index.html');
    await Promise.all(
      ASSETS
        .filter(url => url !== './index.html')
        .map(async url => {
          try {
            await cache.add(url);
          } catch (error) {
            console.warn('Cache failed:', url, error);
          }
        })
    );

    await self.skipWaiting();
  })());
});


// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key =>
          /^quranix(?:[-_]|$)/i.test(key) &&
          key !== CACHE
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});


// FETCH: NETWORK FIRST, OFFLINE FALLBACK
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const allowedTypes = [
    'document',
    'script',
    'style',
    'font',
    'image',
    'manifest'
  ];

  if (!allowedTypes.includes(request.destination)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    try {
      const response = await fetch(request, {
        cache: 'no-cache'
      });

      if (response.ok && response.type === 'basic') {
        try {
          await cache.put(request, response.clone());
        } catch (error) {
          console.warn('Cache update failed:', error);
        }
      }

      return response;

    } catch (error) {
      const cached = await cache.match(request);

      if (cached) return cached;
      if (request.mode === 'navigate') {
        const fallback = await cache.match(
          new URL('./index.html', self.registration.scope).href
        );

        if (fallback) return fallback;
      }

      return new Response('Offline - Content unavailable', {
        status: 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        }
      });
    }
  })());
});
