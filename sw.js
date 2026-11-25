const CACHE = 'quranix-v2.0.62';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/quran.js',
  '/js/apps.js',
  '/quran-data.js',
  '/data/topics.js',
  '/data/dictionary.js',
  '/data/district.js',
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

// কোড ও ডেটা ফাইল (html/js/css/json): আগে নেটওয়ার্ক, না পেলে ক্যাশ। এতে ফাইল বদলালে সাইটে সাথে সাথে apply হয়।
// ছবি ও ফন্ট: আগে ক্যাশ।
const NET_WAIT_MS = 4000;

// P9: clean old caches
async function clean(){
  const keys = await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
}

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE)
      // একটা ফাইল না থাকলেও পুরো ইনস্টল ব্যর্থ হবে না
      .then(c=>Promise.all(ASSETS.map(u=>c.add(new Request(u, {cache: 'reload'})).catch(()=>{}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    clean().then(()=>self.clients.claim())
  );
});

function isCode(req, url){
  return req.mode === 'navigate' || url.pathname.endsWith('/') || /\.(html|js|css|json)$/.test(url.pathname);
}

async function networkFirst(req, cacheReq){
  const cache = await caches.open(CACHE);
  try{
    const res = await Promise.race([
      fetch(req),
      new Promise((_, rej)=>setTimeout(()=>rej(new Error('timeout')), NET_WAIT_MS))
    ]);
    if(res && res.ok) cache.put(cacheReq, res.clone());
    return res;
  }catch(err){
    const cached = await cache.match(cacheReq);
    if(cached) return cached;
    // P9: 503 fallback
    return new Response('Offline', {status: 503, statusText: 'Service Unavailable', headers: {'Content-Type':'text/plain'}});
  }
}

async function cacheFirst(req, cacheReq){
  const cache = await caches.open(CACHE);
  const cached = await cache.match(cacheReq);
  if(cached) return cached;
  try{
    const res = await fetch(req);
    if(res && res.ok) cache.put(cacheReq, res.clone());
    return res;
  }catch(err){
    return new Response('Offline', {status: 503, statusText: 'Service Unavailable', headers: {'Content-Type':'text/plain'}});
  }
}

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  // P9: same-origin only
  if(url.origin !== self.location.origin) return;
  // P9: ignoreSearch for api / quran data
  const ignoreSearch = url.pathname.includes('/api/') || url.pathname.includes('quran-data');
  const cacheReq = ignoreSearch ? new Request(url.origin + url.pathname) : req;
  e.respondWith(isCode(req, url) ? networkFirst(req, cacheReq) : cacheFirst(req, cacheReq));
});
