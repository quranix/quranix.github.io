// Quranix SW - v7 minimal 12-files fix
const CACHE='quranix-v7-final';
const ASSETS=['./','./index.html','./manifest.json','./favicon.ico','./icon-192x192.png','./icon-512x512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>{if(k!==CACHE)return caches.delete(k)}))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.url.includes('favicon.ico')){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));return;}e.respondWith(fetch(e.request).then(r=>{if(r.ok&&e.request.method==='GET')caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r;}).catch(()=>caches.match(e.request)))});
