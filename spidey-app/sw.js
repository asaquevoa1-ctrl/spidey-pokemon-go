const CACHE = 'spidey-app-v1-20260928-push1';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './stamps.css',
  './app.js',
  './push.js',
  './calendar-enhancements.js',
  './manifest.webmanifest',
  './data/events.json',
  './data/stamps.json',
  './assets/spidey-logo-oficial.jpg',
  './assets/festival-das-luzes-approved.png',
  './assets/festival-das-luzes-2026.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.url.includes('/data/events.json') || request.url.includes('/data/stamps.json')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && new URL(request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data?.text() || '' }; }
  event.waitUntil(self.registration.showNotification(data.title || 'Spidey Pokémon GO', {
    body: data.body || 'Há uma novidade no Spidey.',
    icon: 'assets/spidey-logo-oficial.jpg',
    badge: 'assets/spidey-logo-oficial.jpg',
    data: { url: data.url || './' },
    tag: data.tag || 'spidey-update',
    renotify: false,
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const relativeUrl = event.notification.data?.url || './';
  const targetUrl = new URL(relativeUrl, self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    for (const client of windows) {
      if ('focus' in client) {
        client.navigate(targetUrl);
        return client.focus();
      }
    }
    return clients.openWindow ? clients.openWindow(targetUrl) : undefined;
  }));
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    try {
      const keyResponse = await fetch('api/push/public-key', { cache: 'no-store' });
      if (!keyResponse.ok) return;
      const { publicKey } = await keyResponse.json();
      if (!publicKey) return;
      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await fetch('api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON(), device: { source: 'pushsubscriptionchange' } }),
      });
    } catch (error) {
      console.error('Spidey pushsubscriptionchange', error);
    }
  })());
});
