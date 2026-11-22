const CACHE = 'quranix-v16';
const ASSETS = [
  './',
  './index.html',
  './bundle.js',
  './dictionary.js',
  './quran-data.js',
  './manifest.json',
  './icons/favicon.ico',
  './icons/apple-touch-icon.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-maskable-192x192.png',
  './icons/icon-maskable-512x512.png',
  './fonts/hind-siliguri-300.woff',
  './fonts/hind-siliguri-400.woff',
  './fonts/hind-siliguri-500.woff',
  './fonts/hind-siliguri-600.woff',
  './fonts/hind-siliguri-700.woff',
  './fonts/noto-naskh-arabic.woff',
  './fonts/amiri-quran.woff2',
  './fonts/kalpurush.woff2',
  './fonts/noto-serif-bengali-400.woff2',
  './fonts/noto-serif-bengali-700.woff2',
  './fonts/material-symbols-rounded.woff2'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
