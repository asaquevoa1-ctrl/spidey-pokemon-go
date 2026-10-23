const CACHE = 'spidey-app-20261023-rocket1-20261022-credits-dst-v1-minior-cosmic-png1-chandelure-cosmic-png1-fc-seoul-cosmic-png1-national-trust-cosmic-png1';
const CORE = [
  './cosmic-brand-20261019.js',
  './cosmic-brand-20261019.css',
  './hunter-v1.js',
  './hunter-live-feed.js',
  './hunter-v1.css',
  './data/hunter-feed.json',
  './mobile-side-menu.js',
  './rocket-guide.js',
  './rocket-guide.css',
  './data/rocket-lineups.json',
  './mobile-side-menu.css',
  './spidey-companion-art.css',
  './assets/branding/20261019/spidey-opening-cosmic-20261019.webp',
  './assets/branding/20261019/spidey-loading-cosmic-20261019.webp',
  './assets/branding/20261019/spidey-icon-cosmic-20261019.webp',
  './assets/branding/20261019/spidey-wallpaper-cosmic-20261019.webp',
  './assets/branding/20261019/spidey-clean-cosmic-20261019.webp',
  './assets/branding/20261019/spidey-icon-cosmic-192.png',
  './assets/branding/20261019/spidey-icon-cosmic-512.png',
  './assets/events/premium/spidey-2026-10-24-full-day-flow-approved-v1.webp',
  './assets/events/premium/spidey-2026-10-24-full-day-flow-eevee-only-hat-v2.webp',
  './assets/events/premium/spidey-2026-10-24-fc-seoul-text-no-thumbnails-v3.webp',
  './assets/events/premium/fc-seoul-20261024-cosmic-s-approved-v2.png',
  './assets/events/premium/national-trust-27-sites-20261023-cosmic-s-approved-v2.png',
  './assets/events/premium/spidey-2026-10-24-full-day-community-share-v4.webp',
  './assets/events/premium/spidey-2026-10-24-full-day-community-share-v4-approved-v1.png',
  './assets/events/premium/spidey-2026-10-24-coordinates-reference-v1.webp',
  './assets/events/premium/spidey-2026-11-21-pawniard-community-day-v1-approved-v1.png',
  './assets/events/premium/sableye-max-monday-20261026-approved-v1.png',
  './assets/events/premium/mega-charizard-xy-raids-20261021-27-approved-v1.png',
  './assets/events/premium/mega-dragonite-raids-20261014-20-approved-v1.png',
  './assets/events/premium/mega-sableye-raids-20261028-1103-approved-v1.png',
  './assets/events/premium/palkia-five-star-raids-20261021-27-approved-v1.png',
  './assets/events/premium/morelull-spotlight-hour-20261022-approved-v1.png',
  './assets/events/premium/landorus-shadow-raids-20261017-18-approved-v1.png',
  './assets/events/premium/sneasel-max-monday-20261019-approved-v1.png',
  './assets/events/premium/palkia-raid-hour-20261021-approved-v1.png',
  './assets/events/premium/stufful-spotlight-hour-20261015-approved-v1.png',
  './assets/events/premium/minior-geminids-20261211-16-spidey-reference-approved-v1.webp',
  './assets/events/premium/minior-leonids-20261114-19-spidey-reference-approved-v2.webp',
  './assets/events/premium/minior-orionids-20261019-24-spidey-reference-approved-v3.webp',
  './assets/events/premium/minior-orionids-20261019-24-cosmic-s-approved-v4.png',
  './assets/events/premium/mega-chandelure-super-mega-raid-day-20261031-spidey-reference-approved-v2.webp',
  './assets/events/premium/mega-chandelure-super-mega-raid-day-20261031-cosmic-s-approved-v3.png',
  './assets/events/premium/dialga-five-star-raids-20261014-20-spidey-reference-approved-v2.webp',
  './assets/events/premium/dialga-five-star-raids-20261014-20-approved-v1.png',
  './assets/events/premium/minior-leonids-20261114-19-approved-v1.png',
  './assets/events/premium/mega-chandelure-super-mega-raid-day-20261031-approved-v1.png',
  './assets/events/premium/apac-mall-exploration-20261001-20270328-approved-v1.png',
  './assets/events/premium/adidas-avatar-research-20260925-20270115-approved-v1.png',
  './assets/events/premium/pokemon-night-out-20261024-approved-v1.png',
  './assets/events/premium/city-safari-boston-20261024-25-approved-v1.png',
  './assets/events/premium/gbl-20261027-1103-approved-v1.png',
  './assets/events/premium/lake-trio-max-battle-day-20261024-approved-v1.png',
  './assets/events/premium/sandile-hatch-day-20261017-approved-v1.png',
  './assets/events/premium/halloween-go-pass-20261027-1105-approved-v1.png',
  './assets/events/premium/gbl-20261020-27-approved-v2.png',
  './assets/events/premium/minior-orionids-20261019-24-approved-v2.png',
  './assets/events/premium/gbl-20261013-20-approved-v2.png',
  './assets/events/premium/gbl-20261020-27-approved-v1.png',
  './assets/events/premium/minior-orionids-20261019-24-approved-v1.png',
  './assets/events/premium/tcg-30th-20260927-1020-approved-v1.png',
  './assets/events/premium/gbl-20261013-20-approved-v1.png',
  './assets/events/premium/bramblin-20261011-approved-v1.png',
  './assets/events/premium/halloween2-20261011-approved-v1.png',

  './opening-20261019.css',
  './loading-screen.css',
  './samsung-video-fixes-20261019.css',
  './night-out-location-backgrounds.css',
  './loading-screen.js',
  './spidey-share.js',
  './spidey-share.css',
  './date-only.js',
  './event-locations.js',
  './assets/events/premium/scenic-sunday-october-2026-approved-v1.png',
  './assets/events/premium/showcase-tuesday-october-2026-approved-v1.png',
  './assets/events/premium/go-battle-thursday-october-2026-approved-v1.png',
  './assets/events/premium/friendship-friday-october-2026-approved-v1.png',
  './assets/events/premium/nfl-cardinals-20261011-approved-v1.png',

  './assets/spidey-icon-192.svg',
  './assets/spidey-icon-512.svg',
  './assets/events/premium/mega-malamar-rotation-20260923-29-approved-v1.png',
  './assets/events/premium/ultra-beasts-rotation-20260923-29-approved-v1.png',
  './assets/events/premium/sobble-max-monday-20260928-approved-v1.png',
  './assets/events/premium/showcase-tuesday-20260929-approved-v1.png',
  './assets/events/premium/choose-your-path-20260923-28-approved-v1.png',
  './assets/events/premium/gbl-ultra-master-retro-20260922-29-approved-v1.png',
  './assets/events/premium/halloween-mystery-teaser-20261004-approved-v1.png',
  './data/local-events.json',
  './data/pvp.json',
  './pvp.js',
  './pvp.css',
  './assets/events/local-backgrounds/lc_2026_ComicCon_Malaga.png',
  './space-week.js',
  './space-week.css',
  './data/space-museums.json',
  './assets/events/esa-backgrounds/lc_ESA_citeDeEspace.png',
  './assets/events/esa-backgrounds/lc_ESA_ciudadDeLasArtes.png',
  './assets/events/esa-backgrounds/lc_ESA_euroSpaceCenter.png',
  './assets/events/esa-backgrounds/lc_ESA_scienceMuseumLondon.png',
  './assets/events/esa-backgrounds/lc_ESA_spaceCenterGermany.png',
  './assets/events/esa-backgrounds/lc_ESA_spaceExpoNL.png',
  './assets/events/official/world-space-week-2026.jpg',
  './assets/events/official/esa-museums-2026.jpg',
  './assets/events/premium/twilight-trails-season-2026-approved-v1.png',
  './assets/events/premium/gbl-20260929-1006-approved-v1.png',
  './assets/events/premium/gbl-mega-20261006-13-approved-v1.png',
  './assets/events/premium/iit-delhi-rendezvous-2026-approved-v1.png',
  './assets/events/premium/patterns-wild-indonesia-20261002-approved-v1.png',
  './assets/events/premium/go-battle-thursday-20261001-approved-v1.png',
  './assets/events/premium/friendship-friday-20261002-approved-v1.png',
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
  './ana-airports.js',
  './ana-airports.css',
  './national-trust-v1.js',
  './national-trust-v1.css',
  './data/national-trust-2026.json',
  './fly-v1.css',
  './hunter-v1.js',
  './hunter-v1.css',
  './news-feed.js',
  './command-center.js',
  './world-route-preview.js',
  './assets/events/official/pokexciting-taipei-2026.jpg',
  './player-ui.js',
  './player-ui.css',
  './preview-art.js',
  './assets/events/premium/showcase-tuesday-20261006-approved-v1.png',
  './assets/events/premium/scenic-sunday-20261004-approved-v1.png',
  './assets/events/premium/go-pass-september-latios-approved-v1.png',
  './assets/events/premium/go-pass-october-kyogre-approved-v1.png',
  './assets/events/premium/thundurus-shadow-weekend-approved-v1.png',
  './assets/events/premium/elgyem-spotlight-approved-v1.png',
  './assets/events/review/zorua-community-day-correction-v1.png',
  './assets/events/premium/zorua-community-day-approved-v1.png',
  './command-center.css',
  './assets/events/premium/wild-area-sendai-2026-approved-v1.png',
  './assets/events/premium/wild-area-mexico-city-2026-approved-v1.png',
  './assets/events/premium/wild-area-global-2026-approved-v1.png',
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
  './weekly-cards.css',
  './premium-event-art.js',
  './map.js',
  './push-config.json',
  './push-config.js',
  './push-endpoint.js',
  './push.js',
  './catalog.js',
  './navigation.js',
  './navigation.css',
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
  const isData = url.origin === self.location.origin && /\/data\/(events|stamps|weekly|world-event-points|space-museums|local-events|pvp|national-trust-2026|hunter-feed|rocket-lineups)\.json$/.test(url.pathname);
  // Update WebAPK/Android launcher metadata from the network, never from a stale offline manifest.
  const isManifest = url.origin === self.location.origin && url.pathname.endsWith('/manifest.webmanifest');

  if (isAppShell || isData || isManifest) {
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
    icon: 'assets/branding/20261019/spidey-icon-cosmic-192.png', badge: 'assets/branding/20261019/spidey-icon-cosmic-192.png', tag: data.tag || 'spidey-update',
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
      const config = await fetch(new URL('push-config.json', self.location.href), {cache:'no-store'}).then(r=>r.json());
      if (config?.enabled !== true || !/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.workers\.dev$/.test(config.url || '')) return;
      const endpoint = path => new URL(path, config.url + '/').href;
      const keyResponse = await fetch(endpoint('api/push/public-key'), { cache: 'no-store', credentials:'omit' });
      if (!keyResponse.ok) return;
      const { publicKey } = await keyResponse.json();
      if (!publicKey) return;
      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await fetch(endpoint('api/push/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
    } catch (error) {
      console.error('Spidey pushsubscriptionchange', error);
    }
  })());
});
