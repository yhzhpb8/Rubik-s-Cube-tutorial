/* 魔方教学器 PWA service worker —— 离线缓存应用外壳 */
const CACHE = 'cubetutor-v1';
const ASSETS = [
  './',
  './index.html',
  './three.min.js',
  './manifest.webmanifest',
  './assets/logo-80.png',
  './assets/favicon.ico',
  './assets/favicon-16.png',
  './assets/favicon-32.png',
  './assets/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (resp) {
        // 只缓存同源（同目录）的本地资源
        if (resp && resp.ok && new URL(e.request.url).origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return resp;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});
