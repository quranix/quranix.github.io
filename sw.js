const CACHE = 'quranix-v2.0.76';
const FULL_SURAH_AUDIO_CACHE = 'quranix-full-surah-audio-v4';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/quran-data.js',
  '/data/topics.js',
  '/data/dictionary.js',
  '/data/district.js',
  '/data/hadith.js',
  '/js/quran.js',
  '/js/apps.js',
  '/audio/surah-audio-manifest.json'
];

const OPTIONAL_ASSETS = [
  '/fonts/material-symbols-rounded.woff2',
  '/fonts/islamic-icons.ttf',
  '/fonts/hind-siliguri-300.woff',
  '/fonts/hind-siliguri-400.woff',
  '/fonts/hind-siliguri-500.woff',
  '/fonts/hind-siliguri-600.woff',
  '/fonts/hind-siliguri-700.woff',
  '/fonts/noto-naskh-arabic.woff',
  '/fonts/amiri-quran.woff2',
  '/fonts/noto-serif-bengali-400.woff2',
  '/fonts/noto-serif-bengali-700.woff2',
  '/fonts/kalpurush.woff2',
  '/icons/icon-32.png',
  '/icons/icon-48.png',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

async function cleanOldCaches() {
  const keys = await caches.keys();

  await Promise.all(
    keys
      .filter(key =>
        key !== CACHE &&
        key !== FULL_SURAH_AUDIO_CACHE
      )
      .map(key => caches.delete(key))
  );
}

async function cacheAsset(url) {
  const cache = await caches.open(CACHE);

  try {
    const response = await fetch(
      new Request(url, { cache: 'no-store' })
    );

    if (response && response.ok) {
      await cache.put(url, response.clone());
      return true;
    }
  } catch (error) {}

  return false;
}

// Online হলে core files ব্যাকগ্রাউন্ডে আপডেট
async function syncAssets() {
  for (let i = 0; i < CORE_ASSETS.length; i += 4) {
    await Promise.all(
      CORE_ASSETS.slice(i, i + 4).map(cacheAsset)
    );
  }
}

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache => {
        await Promise.all(
          CORE_ASSETS.map(async url => {
            try {
              const response = await fetch(
                new Request(url, { cache: 'reload' })
              );

              if (response && response.ok) {
                await cache.put(url, response);
              }
            } catch (error) {}
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    cleanOldCaches().then(() => self.clients.claim())
  );
});

function isCodeRequest(request, url) {
  return request.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    /\.(html|js|css|json)$/.test(url.pathname);
}

// Cache First + Background Network Update
async function cacheFirstWithBackgroundUpdate(
  request,
  cacheRequest,
  event
) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(cacheRequest);

  const refresh = (async () => {
    try {
      const response = await fetch(request);

      if (response && response.ok) {
        await cache.put(cacheRequest, response.clone());
      }

      return response;
    } catch (error) {
      return null;
    }
  })();

  event.waitUntil(refresh);

  if (cached) return cached;

  const networkResponse = await refresh;

  if (networkResponse) return networkResponse;

  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}

// Images and fonts: Cache First
async function cacheFirst(request, cacheRequest) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(cacheRequest);

  if (cached) return cached;

  try {
    const response = await fetch(request);

    if (response && response.ok) {
      await cache.put(cacheRequest, response.clone());
    }

    return response;
  } catch (error) {
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
}

// Apps.js থেকে online sync message
self.addEventListener('message', event => {
  if (
    event.data &&
    event.data.type === 'QX_SYNC_ASSETS'
  ) {
    event.waitUntil(syncAssets());
  }
});

// Fetch
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // MP3 media requests (especially Range requests) must reach the server directly.
  // Cache-first handling can turn a valid 206 partial response into a broken audio stream.
  if (/\.(mp3|m4a|ogg|wav|aac)$/i.test(url.pathname)) return;

  const ignoreSearch =
    url.pathname.includes('/api/') ||
    url.pathname.includes('quran-data');

  const cacheRequest = ignoreSearch
    ? new Request(url.origin + url.pathname)
    : request;

  if (isCodeRequest(request, url)) {
    event.respondWith(
      cacheFirstWithBackgroundUpdate(
        request,
        cacheRequest,
        event
      )
    );
  } else {
    event.respondWith(
      cacheFirst(request, cacheRequest)
    );
  }
});
