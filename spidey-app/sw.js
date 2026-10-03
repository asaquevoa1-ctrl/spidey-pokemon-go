const CACHE = 'spidey-app-20261003-latios-review-v1';
const CORE = [
  './',
  './index.html',
  './styles.css',
  './stamps.css',
  './stamps-v2.css',
  './art-system.css',
  './tabs-v2.css',
  './experience-v1.css',
  './visual-v3.css',
  './theme.css',
  './qa-corrections-v1.css',
  './app-v2.css',
  './app-v2-1.css',
  './app-v2-2.css',
  './app-v2-3.css',
  './app-v2-4.css',
  './art-coverage-v1.css',
  './fly-core.js',
  './fly-v1.js',
  './fly-v1.css',
  './news-feed.js',
  './command-center.js',
  './player-ui.js',
  './player-ui.css',
  './preview-art.js',
  './assets/events/review/go-pass-september-latios-v1.png',
  './assets/events/premium/go-pass-october-kyogre-approved-v1.png',
  './assets/events/premium/thundurus-shadow-weekend-approved-v1.png',
  './assets/events/premium/elgyem-spotlight-approved-v1.png',
  './assets/events/review/zorua-community-day-correction-v1.png',
  './assets/events/premium/zorua-community-day-approved-v1.png',
  './command-center.css',
  './premium-approved-master.js',
  './trust-world-v1.js',
  './trust-world-v1.css',
  './assets/festival-das-luzes-approved.png',
  './theme.js',
  './app-v2.js',
  './app-v2-1.js',
  './app-v2-2.js',
  './app-v2-3.js',
  './app-v2-4.js',
  './art-coverage-v1.js',
  './app.js',
  './art-system.js',
  './weekly.js',
  './premium-event-art.js',
  './map.js',
  './push.js',
  './calendar-enhancements.js',
  './experience-v1.js',
  './qa-corrections-v1.js',
  './stamps-v2.js',
  './manifest.webmanifest',
  './data/events.json',
  './data/stamps.json',
  './data/weekly.json',
  './data/world-event-points.json',
  './assets/spidey-logo-oficial.jpg',
  './assets/events/premium/xerneas-rotation-approved-v1.png',
  './assets/events/review/mega-victreebel-rotation-v2.png',
  './assets/events/premium/yveltal-rotation-approved-v1.png',
  './assets/events/premium/yveltal-raid-hour-approved-v1.png',
  './assets/events/premium/mega-blastoise-rotation-approved-v1.png',
  './assets/events/premium/mega-victreebel-rotation-approved-v1.png',
  './assets/events/review/seedot-spotlight-correction-v1.png',
  './assets/events/premium/seedot-spotlight-approved-v1.png',
  './assets/events/premium/cinderace-max-day-approved-v1.png',
  './assets/events/premium/harvest-invasion-approved-v1.png',
  './assets/events/recovered/1000426235.png',
  './assets/events/recovered/1000431445.png',
  './assets/events/recovered/1000431441.png',
  './assets/events/recovered/1000431272.png',
  './assets/events/premium/seedot-premium-approved-v1.avif',
  './assets/events/premium/sizzlipede-premium-approved-v1.avif',
  './assets/events/premium/zorua-premium-approved-v1.avif'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('spidey-app-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin && url.pathname.includes('/api/')) return;
  const isAppShell = url.origin === self.location.origin && (request.mode === 'navigate' || /\.(?:js|css)$/.test(url.pathname));
  const isData = request.url.includes('/data/events.json') || request.url.includes('/data/stamps.json') || request.url.includes('/data/weekly.json') || request.url.includes('/data/world-event-points.json');

  if (isAppShell || isData) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
          }
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }).then(cached => cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: url.origin === self.location.origin && url.pathname.includes('/assets/') }).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && url.origin === self.location.origin) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
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
    icon: 'assets/spidey-logo-oficial.jpg', badge: 'assets/spidey-logo-oficial.jpg', tag: data.tag || 'spidey-update',
    data: { url: data.url || './' },
    renotify: false,
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const relativeUrl = event.notification.data?.url || './';
  const appUrl = new URL('./', self.location.href);
  const requestedUrl = new URL(relativeUrl, appUrl);
  const targetUrl = requestedUrl.origin === appUrl.origin ? requestedUrl.href : appUrl.href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    for (const client of windows) {
      if (client.url.startsWith(appUrl.href) && 'focus' in client) {
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
