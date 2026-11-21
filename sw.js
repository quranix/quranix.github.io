const CACHE = 'quranix-v12';
const ASSETS = [
  './',
  './index.html',
  './fonts/hind-siliguri-300.woff',
  './fonts/hind-siliguri-400.woff',
  './fonts/hind-siliguri-500.woff',
  './fonts/hind-siliguri-600.woff',
  './fonts/hind-siliguri-700.woff',
  './fonts/noto-naskh-arabic.woff',
  './fonts/amiri-quran.woff2',
  './fonts/noto-serif-bengali-400.woff2',
  './fonts/noto-serif-bengali-700.woff2',
  './fonts/material-symbols-rounded.woff2',
  './manifest.json'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
