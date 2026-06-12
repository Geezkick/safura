const CACHE_NAME = 'safura-ai-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/styles/main.css',
  '/src/app.js',
  '/assets/icons/web/favicon-192x192.png',
  '/assets/icons/web/favicon-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => console.log('SW Cache failed:', url, err));
          })
        );
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response and save it to cache so it works offline later
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => {
        // If network fails (offline), fall back to cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force all active tabs to reload immediately so the user sees the new version
      self.clients.matchAll({ type: 'window' }).then(windowClients => {
        windowClients.forEach(client => {
          client.navigate(client.url);
        });
      });
    })
  );
});
