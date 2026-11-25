const CACHE = 'quranix-v2.0.36';
const ASSETS = [
  '/',
  '/index.html',
  '/js/quran.js',
  '/js/apps.js',
  '/quran-data.js',
  '/data/topics.js',
  '/data/dictionary.js',
  '/data/district.js',
  '/icons/icon-32.png',
  '/icons/icon-48.png',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// P9: clean old caches
async function clean(){
  const keys = await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
}

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    clean().then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  const url = new URL(req.url);
  // P9: same-origin only
  if(url.origin !== self.location.origin) return;
  // P9: ignoreSearch for api / quran data
  const ignoreSearch = url.pathname.includes('/api/') || url.pathname.includes('quran-data');
  const cacheReq = ignoreSearch ? new Request(url.origin + url.pathname, {method: req.method, headers: req.headers}) : req;
  
  if(req.method !== 'GET'){
    return;
  }

  e.respondWith(
    (async ()=>{
      try{
        const cached = await caches.match(cacheReq);
        if(cached) return cached;
        const res = await fetch(req);
        if(res && res.ok){
          const clone = res.clone();
          const cache = await caches.open(CACHE);
          cache.put(cacheReq, clone);
        }
        return res;
      }catch(err){
        // P9: 503 fallback
        const cached = await caches.match(cacheReq);
        if(cached) return cached;
        return new Response('Offline', {status: 503, statusText: 'Service Unavailable', headers: {'Content-Type':'text/plain'}});
      }
    })()
  );
});
