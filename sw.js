/* Quranix service worker — NETWORK-FIRST
   অনলাইনে থাকলে সবসময় সার্ভার থেকে নতুন ফাইল আনে (এবং ক্যাশ আপডেট করে)।
   নেট না থাকলে বা সার্ভার ৪ সেকেন্ডে সাড়া না দিলে ক্যাশ থেকে চালায়, তাই অফলাইনেও চলে।
   ফাইল বদলালে নিচের CACHE-এর ভার্সন নম্বর বাড়িয়ে দাও (v20 → v21), না বাড়ালেও নতুন ফাইল অনলাইনে আসবে,
   কিন্তু পুরোনো ক্যাশ পরিষ্কার হবে ভার্সন বদলালেই। */
const CACHE = 'quranix-v21';
const NETWORK_TIMEOUT_MS = 4000;
const ASSETS = [
  './',
  './index.html',
  './bundle.js',
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
  './fonts/material-symbols-rounded.woff2',
  './fonts/islamic-icons.ttf'
];

/* একটা ফাইল না পেলেও বাকিগুলো ক্যাশ হবে (আগে একটা ফেল করলে সব ক্যাশ ফেল করত) */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => {}))))
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

function fetchWithTimeout(request){
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS);
    fetch(request, { cache: 'no-cache' }).then(
      r => { clearTimeout(timer); resolve(r); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}

/* redirect-করা রেসপন্স দিয়ে পেজ খোলা ব্রাউজার আটকায় (অফলাইনে "You are offline"/এরর পেজ আসে), তাই কপি করে সাধারণ রেসপন্স বানাই */
function clean(res){
  if (!res || !res.redirected) return Promise.resolve(res);
  return res.blob().then(b => new Response(b, { headers: res.headers, status: res.status, statusText: res.statusText }));
}

function offlineFallback(req){
  return caches.match(req, { ignoreSearch: true })
    .then(hit => hit || (req.mode === 'navigate'
      ? caches.match('./index.html', { ignoreSearch: true }).then(h => h || caches.match('./', { ignoreSearch: true }))
      : undefined))
    .then(hit => clean(hit))
    .then(hit => hit || new Response('Offline', { status: 503, statusText: 'Offline' }));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   /* API/অডিও ইত্যাদি বাইরের রিকোয়েস্ট যেমন আছে তেমনই যাবে */
  e.respondWith(
    fetchWithTimeout(req).then(res => {
      if (res && res.ok && !res.redirected) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => offlineFallback(req))
  );
});
