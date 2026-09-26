// KUMG Forge — Service Worker
const CACHE = 'kumg-v8';

const ASSETS = [
  './',
  './index.html',
  './auth.html',
  './verify.html',
  './editor.html',
  './templates.html',
  './publish.html',
  './settings.html',
  './profile.html',
  './tools.html',
  './ai.html',
  './terms.html',
  './privacy.html',
  './store.html',
  './store-edit.html',
  './store-products.html',
  './store-public.html',
  './wallet.html',
  './discover.html',
  './sponsor-signup.html',
  './sponsors.html',
  './js/tap.js',
  './manifest.json',
  './css/style.css',
  './js/supabase.js',
  './js/settings.js',
  './js/auth.js',
  './js/verify.js',
  './js/projects.js',
  './js/editor.js',
  './js/templates-data.js',
  './js/tools-data.js',
  './js/publish.js',
  './js/store.js',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(
        ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('SW skipped:', url, err))
        )
      )
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('supabase') || url.hostname.includes('onrender')) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic'){
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
