// Quranix SW - v9 - precaches Quran data + icon font for offline use
const CACHE='quranix-v9';
const ASSETS=[
  './','./index.html','./manifest.json','./favicon.ico',
  './icon-32x32.png','./icon-48x48.png','./icon-180x180.png',
  './icon-192x192.png','./icon-512x512.png',
  './icon-maskable-192x192.png','./icon-maskable-512x512.png','./apple-touch-icon.png',
  './quran-data.js','./fonts/material-symbols-rounded.woff2'
];
self.addEventListener('install',e=>{
  // one missing file must not break the whole install
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(a=>c.add(new Request(a,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const isIcon=/(favicon\.ico|icon-[^/]*\.png|apple-touch-icon\.png|manifest\.json)/.test(req.url);
  // icons + manifest: always revalidate with network, fall back to cache offline
  e.respondWith(
    fetch(req,isIcon?{cache:'no-cache'}:undefined).then(r=>{
      if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return r;
    }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')))
  );
});
