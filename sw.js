const CACHE = 'quranix-v14';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './js/quran.js',
  './js/main.js',
  './manifest.json',
  './icons/favicon.ico',
  './icons/icon-32x32.png',
  './icons/icon-48x48.png',
  './icons/icon-180x180.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-maskable-192x192.png',
  './icons/icon-maskable-512x512.png',
  './icons/apple-touch-icon.png'
];

// fonts আলাদা করে রাখা: কোনো ফন্ট ফাইল না থাকলেও install ভাঙবে না
const FONTS = [
  './fonts/material-symbols-rounded.woff2',
  './fonts/hind-siliguri-300.woff2', './fonts/hind-siliguri-400.woff2', './fonts/hind-siliguri-500.woff2',
  './fonts/hind-siliguri-600.woff2', './fonts/hind-siliguri-700.woff2',
  './fonts/noto-naskh-arabic.woff2', './fonts/amiri-quran.woff2',
  './fonts/noto-serif-bengali-400.woff2', './fonts/noto-serif-bengali-700.woff2',
  './fonts/kalpurush.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).then(() => Promise.all(FONTS.map(u => c.add(u).catch(() => {})))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first; same-origin files (fonts সহ) প্রথমবার লোড হলেই cache-এ জমা হয়, তাই fonts-এর নাম এখানে লিখতে হয় না
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : undefined))
  );
});
