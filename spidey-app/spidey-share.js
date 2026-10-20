/* Compartilhamento orgânico do Spidey — sem SDKs, cookies, cadastro ou rastreadores. */
(() => {
  'use strict';
  const base = () => new URL('./', window.location.href).href.split('#')[0].split('?')[0];
  const eventUrl = id => base() + '#evento=' + encodeURIComponent(id);
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const visibleText = value => clean(value).slice(0, 220);
  function payload(event) {
    if (event?.id) {
      const title = clean(event.public_title || event.title);
      const summary = visibleText(event.public_summary || event.summary);
      const text = ['🎮 ' + title, summary, 'Veja os detalhes e horários no Spidey:', eventUrl(event.id)].filter(Boolean).join('\n');
      return { title: title + ' | Spidey', text, url: eventUrl(event.id) };
    }
    return {
      title: 'Spidey — seu companheiro Pokémon GO',
      text: '🎮 Calendário Pokémon GO, reides, bônus, eventos, Selos e PvP em um lugar só. Conheça o Spidey, um app gratuito e independente:\n' + base(),
      url: base()
    };
  }
  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) {}
    }
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    let done = false;
    try { done = document.execCommand('copy'); } catch (_) {}
    el.remove();
    return done;
  }
  async function share(event) {
    const data = payload(event);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: data.title, text: data.text });
        return 'shared';
      } catch (error) {
        if (error?.name === 'AbortError') return 'cancelled';
      }
    }
    const ok = await copyText(data.text);
    if (ok) {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = 'Link e detalhes copiados. Envie aos amigos!';
        toast.classList.add('show');
        window.setTimeout(() => toast.classList.remove('show'), 3000);
      }
    }
    return ok ? 'copied' : 'unavailable';
  }
  const findById = id => window.SpideyFindShareEvent?.(id) || null;
  function enhanceDetail() {
    const detail = document.getElementById('eventDetail');
    if (!detail?.dataset.eventId) return;
    const box = detail.querySelector('.detail-body');
    if (!box || box.querySelector('[data-share-event]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'action-btn spidey-share-event';
    button.dataset.shareEvent = detail.dataset.eventId;
    button.textContent = '↗ Compartilhar evento';
    button.setAttribute('aria-label','Compartilhar este evento com amigos');
    button.addEventListener('click', () => share(findById(detail.dataset.eventId)));
    const actions = box.querySelector('.action-row');
    if (actions) actions.appendChild(button);
    else {
      const row = document.createElement('div');
      row.className = 'action-row';
      row.appendChild(button);
      box.appendChild(row);
    }
  }
  let lastOpened = '';
  function tryOpenShared() {
    const match = window.location.hash.match(/^#evento=([A-Za-z0-9_%-]{1,180})$/);
    if (!match) return;
    let id = '';
    try { id = decodeURIComponent(match[1]); } catch (_) { return; }
    if (!/^[a-zA-Z0-9_\-]{1,120}$/.test(id) || id === lastOpened) return;
    if (window.SpideyOpenSharedEvent?.(id) === true) lastOpened = id;
  }
  function setup() {
    const header = document.querySelector('.topbar-actions');
    if (header && !header.querySelector('#shareSpideyButton')) {
      const btn = document.createElement('button');
      btn.id = 'shareSpideyButton';
      btn.type = 'button';
      btn.className = 'ghost-btn spidey-share-main';
      btn.textContent = '↗ Compartilhar';
      btn.setAttribute('aria-label','Compartilhar o aplicativo Spidey');
      btn.addEventListener('click', () => share(null));
      header.appendChild(btn);
    }
    const dialog = document.getElementById('eventDetail');
    if (dialog && typeof MutationObserver === 'function') {
      new MutationObserver(enhanceDetail).observe(dialog,{ childList:true,subtree:false,attributes:true,attributeFilter:['data-event-id'] });
      enhanceDetail();
    }
    window.addEventListener('spideycontentready', tryOpenShared);
    window.addEventListener('spideycontentsettled', tryOpenShared);
    window.addEventListener('hashchange', () => {lastOpened = ''; tryOpenShared();});
    const eventDialog = document.getElementById('eventDialog');
    eventDialog?.addEventListener('close', () => {
      if (window.location.hash.startsWith('#evento=')) {
        window.history.replaceState(window.history.state,'',window.location.pathname + window.location.search);
        lastOpened = '';
      }
    });
    tryOpenShared();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, {once:true});
  else setup();
  window.SpideyShare = { payload, eventUrl, share, tryOpenShared };
})();
