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

const NET_WAIT_MS = 4000;

async function clean(){
  const keys = await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
}

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>Promise.all(ASSETS.map(u=>c.add(new Request(u, {cache: 'reload'})).catch(err=>{console.warn('SW cache miss:',u,err);}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(clean().then(()=>self.clients.claim()));
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
    throw err;
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
    throw err;
  }
}

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;
  const ignoreSearch = url.pathname.includes('/api/') || url.pathname.includes('quran-data');
  const cacheReq = ignoreSearch ? new Request(url.origin + url.pathname) : req;
  e.respondWith(isCode(req, url) ? networkFirst(req, cacheReq) : cacheFirst(req, cacheReq));
});
