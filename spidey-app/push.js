(() => {
  const statusEl = document.querySelector('#notificationStatus');
  const notificationButton = document.querySelector('#notificationButton');
  let subscribing = null;

  function setStatus(message) {
    if (statusEl && message) {
      statusEl.textContent = message;
      statusEl.hidden = false;
    }
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

  async function activateRemotePush() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('Este navegador não oferece notificações.');
      return false;
    }
    setStatus('Preparando seus alertas…');
    try {
      const keyResponse = await fetch('api/push/public-key', { cache: 'no-store' });
      if (!keyResponse.ok) {
        setStatus('Notificações indisponíveis no momento.');
        return false;
      }
      const { publicKey } = await keyResponse.json();
      if (!publicKey) {
        setStatus('Notificações indisponíveis no momento.');
        return false;
      }
      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission;
      if (permission !== 'granted') {
        setStatus('Notificações não autorizadas neste navegador.');
        return false;
      }
      let timeout;
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('service_worker_timeout')), 10000); }),
      ]).finally(() => clearTimeout(timeout));
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
      if (notificationButton) notificationButton.textContent = 'Alertas ativos';
      return true;
    } catch (error) {
      console.error('Spidey Push subscribe:', error);
      setStatus('Não foi possível ativar os alertas. Tente novamente.');
      return false;
    }
  }

  function subscribeRemotePush() {
    if (subscribing) return subscribing;
    if (notificationButton) notificationButton.disabled = true;
    subscribing = activateRemotePush().finally(() => {
      subscribing = null;
      if (notificationButton) notificationButton.disabled = false;
    });
    return subscribing;
  }

  window.addEventListener('load', () => {
    openDeepLink();
  });

  window.SpideyPush = {
    openDeepLink,
    subscribeRemotePush,
  };
})();
