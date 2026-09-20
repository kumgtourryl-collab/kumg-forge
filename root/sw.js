// KUMG Forge service worker
const CACHE = 'kumg-v1';
const ASSETS = [
  './',
  './index.html',
  './auth.html',
  './editor.html',
  './templates.html',
  './publish.html',
  './settings.html',
  './profile.html',
  './tools.html',
  './css/style.css',
  './js/supabase.js',
  './js/settings.js',
  './js/auth.js',
  './js/projects.js',
  './js/editor.js',
  './js/templates-data.js',
  './js/tools-data.js',
  './js/publish.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Never cache Supabase or Render API calls
  if (url.hostname.includes('supabase') || url.hostname.includes('onrender')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
