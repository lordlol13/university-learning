// Self-destroying service worker to clear any legacy service worker registrations and caches
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      if ('caches' in self) {
        return caches.keys().then((names) => {
          return Promise.all(names.map((name) => caches.delete(name)));
        });
      }
    }).then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        if (client.url && 'navigate' in client) {
          client.navigate(client.url);
        }
      });
    })
  );
});
