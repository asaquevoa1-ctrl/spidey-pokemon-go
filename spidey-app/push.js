(() => {
  const statusEl = document.querySelector('#notificationStatus');
  const notificationButton = document.querySelector('#notificationButton');

  function setStatus(message) {
    if (statusEl && message) statusEl.textContent = message;
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
  }

  async function openDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    const stampId = params.get('stamp');
    if (!eventId && !stampId) return;

    try {
      if (eventId) {
        const response = await fetch('data/events.json', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        const event = (payload.events || []).find((item) => item.id === eventId || item.slug === eventId);
        if (event && typeof window.openEvent === 'function') {
          const start = event.schedule?.start_brazil || event.schedule?.start_local;
          if (start) {
            const date = new Date(start);
            const month = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthLabel = document.querySelector('#monthLabel');
            if (monthLabel) {
              document.querySelector('[data-view="calendarView"]')?.click();
            }
          }
          window.openEvent(event);
        }
      }

      if (stampId) {
        const response = await fetch('data/stamps.json', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        const rally = (payload.rallies || []).find((item) => item.id === stampId || item.slug === stampId);
        if (rally && typeof window.openStampRally === 'function') {
          document.querySelector('[data-view="stampsView"]')?.click();
          window.openStampRally(rally);
        }
      }
    } catch (error) {
      console.error('Spidey deep link:', error);
    }
  }

  async function subscribeRemotePush() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission;
      if (permission !== 'granted') return;

      const keyResponse = await fetch('api/push/public-key', { cache: 'no-store' });
      if (!keyResponse.ok) {
        console.info('Spidey Push remoto ainda não configurado:', keyResponse.status);
        return;
      }

      const { publicKey } = await keyResponse.json();
      if (!publicKey) return;

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const saveResponse = await fetch('api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          device: {
            locale: navigator.language || 'pt-BR',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
            userAgent: navigator.userAgent,
          },
        }),
      });

      if (!saveResponse.ok) throw new Error(`subscribe HTTP ${saveResponse.status}`);
      setStatus('Notificações automáticas ativadas neste aparelho.');
    } catch (error) {
      console.error('Spidey Push subscribe:', error);
      setStatus('Permissão ativa. O push remoto ainda está sendo preparado.');
    }
  }

  window.addEventListener('load', () => {
    openDeepLink();
  });

  notificationButton?.addEventListener('click', () => {
    setTimeout(subscribeRemotePush, 0);
  });

  window.SpideyPush = {
    openDeepLink,
    subscribeRemotePush,
  };

  // Hotfix visual definitivo dos quatro eventos já aprovados.
  // O catálogo antigo tinha AVIF corrompido (Xerneas), Seedot com ano errado
  // e o detalhe forçava uma caixa 2:3 que criava letterbox. Aqui a arte aprovada
  // passa a ser soberana, sem depender de fallback, SVG ou catálogo tardio.
  const PREMIUM_FIX_VERSION = '20260929-premium-source-v7';
  const APPROVED_IDS = new Set([
    '2026-09-30-raid-hour-xerneas',
    '2026-10-01-spotlight-seedot',
    '2026-10-05-max-monday-sizzlipede',
    '2026-10-zorua-community-day',
  ]);

  function loadScriptOnce(src, id) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        if (existing.dataset.loaded === '1') resolve();
        else existing.addEventListener('load', resolve, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = `${src}?v=${PREMIUM_FIX_VERSION}`;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = '1';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function makeApprovedEntry(url, alt) {
    const make = () => ({ url, width: 960, height: 1200 });
    return {
      standard: 'spidey-premium-v1',
      visualApproved: true,
      premium_visual_approved: true,
      alt,
      assets: { thumb: make(), card: make(), hero: make(), poster: make() },
    };
  }

  function installNoLetterboxCss() {
    if (document.getElementById('spidey-premium-v7-style')) return;
    const style = document.createElement('style');
    style.id = 'spidey-premium-v7-style';
    style.textContent = `
      .spidey-detail-v3 .detail-hero.spidey-poster-art-v3,
      #eventDetail .detail-hero.spidey-poster-art-v3 {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        aspect-ratio: auto !important;
        object-fit: contain !important;
        object-position: center top !important;
        padding: 0 !important;
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
  }

  async function installApprovedPremiumArt() {
    try {
      await Promise.all([
        loadScriptOnce('premium-inline-xerneas.js', 'spidey-inline-xerneas-v7'),
        loadScriptOnce('premium-inline-seedot.js', 'spidey-inline-seedot-v7'),
      ]);

      const inline = window.SPIDEY_INLINE_ART || {};
      if (!inline.xerneas || !inline.seedot) throw new Error('artes inline aprovadas não carregaram');

      const catalog = {
        '2026-09-30-raid-hour-xerneas': makeApprovedEntry(
          inline.xerneas,
          'Hora de Reides — Xerneas — arte Premium Spidey aprovada'
        ),
        '2026-10-01-spotlight-seedot': makeApprovedEntry(
          inline.seedot,
          'Hora do Holofote — Seedot — arte Premium Spidey aprovada — 2026'
        ),
        '2026-10-05-max-monday-sizzlipede': makeApprovedEntry(
          'assets/events/premium/sizzlipede-premium-approved-v1.avif',
          'Segunda Max — Sizzlipede Dynamax — arte Premium Spidey aprovada'
        ),
        '2026-10-zorua-community-day': makeApprovedEntry(
          'assets/events/premium/zorua-premium-approved-v1.avif',
          'Dia Comunitário — Zorua — arte Premium Spidey aprovada'
        ),
      };

      // Substitui o objeto congelado inteiro; não tenta mutá-lo.
      window.SPIDEY_PREMIUM_EVENT_ART = catalog;

      // Resolver soberano para esses quatro IDs. Bypassa a rejeição histórica
      // de data: URLs e impede SVG/fallback de recuperar prioridade.
      const previousResolve = typeof window.spideyResolveEventArt === 'function'
        ? window.spideyResolveEventArt
        : (typeof spideyResolveEventArt === 'function' ? spideyResolveEventArt : null);

      const premiumResolve = (event, role = 'card') => {
        const entry = catalog[event?.id];
        if (!entry) return previousResolve ? previousResolve(event, role) : null;
        const roleOrder = role === 'hero' || role === 'poster'
          ? [role, 'poster', 'hero', 'card']
          : [role, 'card', 'thumb', 'hero', 'poster'];
        for (const key of roleOrder) {
          const raw = entry.assets?.[key];
          if (raw?.url) {
            return {
              ...raw,
              sourceRole: `premium_catalog:${key}`,
              standard: 'spidey-premium-v1',
            };
          }
        }
        return null;
      };

      window.spideyResolveEventArt = premiumResolve;
      try { spideyResolveEventArt = premiumResolve; } catch (_) {}
      if (window.SpideyArt) window.SpideyArt.resolve = premiumResolve;
      window.SpideyPremiumArt = { resolve: premiumResolve };

      installNoLetterboxCss();

      // Atualiza imagens já renderizadas, sem reabrir/recarregar o app.
      window.SpideyVisualV3?.decorate?.();
      if (typeof state !== 'undefined' && state?.events?.length) {
        document.querySelectorAll('#eventList .event-card').forEach((card) => {
          const title = card.querySelector('h3')?.textContent || '';
          const event = state.events.find((item) => item.title === title || title.endsWith(item.title?.split(':').pop()?.trim() || ''));
          if (!event || !APPROVED_IDS.has(event.id)) return;
          const image = card.querySelector('.event-thumb');
          const asset = premiumResolve(event, 'thumb');
          if (image && asset?.url) {
            image.onerror = null;
            image.src = asset.url;
            image.classList.add('spidey-poster-art-v3');
          }
        });
      }

      const detailHero = document.querySelector('#eventDetail .detail-hero');
      const detailTitle = document.querySelector('#eventDetail h1, #eventDetail h2')?.textContent || '';
      if (detailHero && typeof state !== 'undefined') {
        const event = state.events?.find((item) => detailTitle.includes(item.title?.split(':').pop()?.trim() || '__nope__'));
        if (event && APPROVED_IDS.has(event.id)) {
          const asset = premiumResolve(event, 'hero');
          if (asset?.url) {
            detailHero.onerror = null;
            detailHero.src = asset.url;
            detailHero.classList.add('spidey-poster-art-v3');
          }
        }
      }

      window.SPIDEY_PREMIUM_FIX = {
        version: PREMIUM_FIX_VERSION,
        installed: true,
        events: [...APPROVED_IDS],
      };
    } catch (error) {
      console.error('Spidey Premium v7:', error);
    }
  }

  // O hack antigo do index roda em DOMContentLoaded. Rodamos depois dele e
  // repetimos uma vez para cobrir rerenders tardios da agenda.
  window.addEventListener('DOMContentLoaded', () => setTimeout(installApprovedPremiumArt, 0));
  setTimeout(installApprovedPremiumArt, 400);
  setTimeout(() => window.SpideyVisualV3?.decorate?.(), 1600);
})();
