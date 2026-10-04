(() => {
  const statusEl = document.querySelector('#notificationStatus');
  const notificationButton = document.querySelector('#notificationButton');
  const testButton = document.querySelector('#testNotificationButton');
  const stopButton = document.querySelector('#stopNotificationButton');
  let subscribing = null;
  let checking = null;
  let availability = null;
  let active = false;
  let availableKey = null;
  let currentSubscription = null;

  function setActive(value) {
    active = value;
    if (testButton) testButton.hidden = !value;
    if (stopButton) stopButton.hidden = !value;
    if (notificationButton) notificationButton.textContent = value ? 'Alertas ativos' : 'Ativar alertas';
  }

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
        const payload = await window.SpideyCatalog.load('events');
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
        const payload = await window.SpideyCatalog.load('stamps');
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

  async function readAvailability() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      availability = false;
      if (notificationButton) {
        notificationButton.disabled = true;
        notificationButton.textContent = 'Alertas indisponíveis';
      }
      setStatus(/iPhone|iPad/i.test(navigator.userAgent || '')
        ? 'No iPhone, instale o Spidey pelo Safari e abra pelo ícone na tela inicial para ativar os avisos.'
        : 'Para receber avisos, abra o Spidey no Chrome ou em outro navegador com notificações.');
      return null;
    }
    try {
      const keyResponse = await fetch('api/push/public-key', { cache: 'no-store' });
      const payload = keyResponse.ok ? await keyResponse.json() : {};
      if (!payload.publicKey) {
        availability = false;
        if (notificationButton) {
          notificationButton.disabled = true;
          notificationButton.textContent = 'Alertas indisponíveis';
        }
        setStatus('Notificações indisponíveis no momento.');
        return null;
      }
      availability = true;
      availableKey = payload.publicKey;
      if (notificationButton && !active) {
        notificationButton.disabled = Boolean(subscribing);
        notificationButton.textContent = 'Ativar alertas';
      }
      if (!active && !subscribing) setStatus('Ative os alertas para receber avisos neste aparelho.');
      return payload.publicKey;
    } catch (error) {
      availability = null;
      if (notificationButton && !active) {
        notificationButton.disabled = Boolean(subscribing);
        notificationButton.textContent = 'Verificar alertas';
      }
      setStatus('Não foi possível verificar os alertas. Tente novamente quando estiver online.');
      return null;
    }
  }

  function checkRemotePushAvailability() {
    if (checking) return checking;
    checking = readAvailability().finally(() => { checking = null; });
    return checking;
  }

  async function activateRemotePush() {
    const publicKey = availableKey || await checkRemotePushAvailability();
    if (!publicKey) return false;
    setStatus('Preparando seus alertas…');
    try {
      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission;
      if (permission !== 'granted') {
        setStatus('Os avisos estão bloqueados. Permita as notificações do Spidey nas configurações deste navegador e tente novamente.');
        return false;
      }
      let timeout;
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('service_worker_timeout')), 10000); }),
      ]).finally(() => clearTimeout(timeout));
      let subscription = await registration.pushManager.getSubscription();
      const previousKey = subscription?.options?.applicationServerKey;
      if (previousKey && String(new Uint8Array(previousKey)) !== String(urlBase64ToUint8Array(publicKey))) {
        await subscription.unsubscribe(); subscription = null;
      }
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
          },
        }),
      });

      if (!saveResponse.ok) throw new Error(`subscribe HTTP ${saveResponse.status}`);
      currentSubscription = subscription;
      setActive(true);
      setStatus('Alertas ativados. Toque em Testar alerta e confira o aviso neste aparelho.');
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
      if (notificationButton) notificationButton.disabled = availability === false;
    });
    return subscribing;
  }

  function prepareAlerts() {
    if (notificationButton) {
      notificationButton.disabled = true;
      notificationButton.textContent = 'Verificando alertas…';
    }
    checkRemotePushAvailability().then(async key => {
      if (!key || Notification.permission !== 'granted') return;
      try {
        const registration = await navigator.serviceWorker.ready;
        if (await registration.pushManager.getSubscription()) subscribeRemotePush();
      } catch { /* A user can retry with the visible activation button. */ }
    });
  }
  async function testAlert() {
    if (!currentSubscription || !active) return;
    if (testButton) testButton.disabled = true;
    try {
      const response = await fetch('api/push/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: currentSubscription.toJSON() }) });
      if (response.status === 429) { setStatus('Aguarde um minuto antes de enviar outro teste.'); return; }
      if (!response.ok) throw new Error('test_failed');
      setStatus('Enviamos o alerta de teste. Confira as notificações deste aparelho.');
    } catch { setStatus('Não foi possível enviar o teste. Confira sua conexão e tente novamente.'); }
    finally { if (testButton) testButton.disabled = false; }
  }
  async function stopAlerts() {
    if (!currentSubscription) return;
    if (stopButton) stopButton.disabled = true;
    try {
      const response = await fetch('api/push/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: currentSubscription.endpoint || currentSubscription.toJSON().endpoint }) });
      if (!response.ok) throw new Error('remove_failed');
      await currentSubscription.unsubscribe();
      currentSubscription = null; setActive(false);
      setStatus('Alertas desativados neste aparelho. Você pode ativá-los novamente quando quiser.');
    } catch { setStatus('Não foi possível desativar agora. Confira a conexão e tente novamente.'); }
    finally { if (stopButton) stopButton.disabled = false; }
  }
  testButton?.addEventListener?.('click', testAlert);
  stopButton?.addEventListener?.('click', stopAlerts);
  window.addEventListener('load', openDeepLink);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepareAlerts, { once: true });
  else prepareAlerts();
  window.addEventListener('online', () => {
    if (!active && !subscribing) checkRemotePushAvailability();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !active && !subscribing) checkRemotePushAvailability();
  });

  window.SpideyPush = {
    openDeepLink,
    subscribeRemotePush,
    checkRemotePushAvailability,
    testAlert,
    stopAlerts,
  };
})();
