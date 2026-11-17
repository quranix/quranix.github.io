const CACHE='quranix-v5-icons';
const CORE_STATIC=[
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './quran-data.js',
  './fonts/material-symbols-rounded.woff2'
];
self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(CORE_STATIC).catch(()=>{}))
      .then(()=>self.skipWaiting())
  );
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.hostname.includes('everyayah.com')) return;
  // HTML - NETWORK FIRST (so new index.html updates instantly)
  if(e.request.destination==='document' || e.request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html')){
    e.respondWith(
      fetch(e.request).then(r=>{
        const clone=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
        return r;
      }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html')))
    );
    return;
  }
  // API - network first
  if(url.hostname.includes('api.quran.com')||url.hostname.includes('api.alquran.cloud')){
    e.respondWith(
      fetch(e.request).then(r=>{
        const c=r.clone();
        caches.open(CACHE).then(cache=>cache.put(e.request,c));
        return r;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }
  // static - cache first
  if(url.origin===location.origin){
    e.respondWith(
      caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{
        const c=r.clone();
        caches.open(CACHE).then(cache=>cache.put(e.request,c));
        return r;
      }))
    );
    return;
  }
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
self.addEventListener('message',e=>{
  if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting();
});
