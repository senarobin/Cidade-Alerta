const CACHE = 'cidadealerta-v1';

const urlsCache = ['/', '/index.html', '/manifest.json', '/favicon.svg',];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => {
    return cache.addAll(urlsCache);
  })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.filter((name) => name !== CACHE).map((name) => caches.delete(name))
    );
  })
  );

  self.clients.claim();
});

self.addEventListener('fetch', (e) => {

  if (e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    fetch(e.request).then((response) => {

      if (response.status === 200) {
        const responseClone = response.clone();

        caches.open(CACHE).then((cache) => {
          cache.put(e.request, responseClone);
        });
      }

      return response;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});
