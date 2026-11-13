/* Coordenadas comunitárias dos rallies de 7 selos com ingresso.
 * Complementam o detalhe da coleção oficial; não criam uma segunda galeria por cidade.
 */
(() => {
  'use strict';
  const source = 'data/ticket-rally-community-20261107.json';
  const ROUTE_BY_RALLY = Object.freeze({
    '2026-go-wild-area-sendai-stamp-rally': 'sendai',
    '2026-go-wild-area-mexico-city-stamp-rally': 'mexico'
  });
  const CITY_LABEL = Object.freeze({ sendai: 'Sendai', mexico: 'Cidade do México' });
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const validCoordinate = value => typeof value === 'string'
    && /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(value)
    && Math.abs(Number(value.split(',')[0])) <= 90
    && Math.abs(Number(value.split(',')[1])) <= 180;

  let data = null;
  let loadError = false;

  async function copy(text) {
    if (!text) return false;
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) {}
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true;
    field.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(field);
    field.focus();
    field.select();
    let copied = false;
    try { copied = Boolean(document.execCommand?.('copy')); } catch (_) {}
    field.remove();
    return copied;
  }

  function routeFor(rally) {
    const routeId = ROUTE_BY_RALLY[rally?.id];
    return data?.routes?.find(route => route.id === routeId) || null;
  }

  function render(detail, rally) {
    const body = detail?.querySelector?.('.stamp-detail-v2');
    const routeId = ROUTE_BY_RALLY[rally?.id];
    if (!body || !routeId) return;

    let section = body.querySelector('.ticket-rally-inline');
    if (!section) {
      section = document.createElement('section');
      section.className = 'ticket-rally-inline';
      body.appendChild(section);
    }
    section.dataset.ticketRallyId = rally.id;

    if (!data) {
      section.innerHTML = loadError
        ? '<p class="microcopy">As referências comunitárias não estão disponíveis agora. A coleção oficial continua íntegra.</p>'
        : '<p class="microcopy">Carregando as referências comunitárias de localização…</p>';
      return;
    }

    const route = routeFor(rally);
    if (!route) {
      section.remove();
      return;
    }

    const city = CITY_LABEL[route.id];
    section.innerHTML = `
      <div class="ticket-rally-inline-head">
        <span class="eyebrow">COMUNIDADE · EVENTO COM INGRESSO</span>
        <h3>Referências de localização · ${escapeHtml(city)}</h3>
        <p>Este bloco complementa a coleção oficial de 7 selos acima; não é uma segunda coleção. ${route.id === 'mexico' ? 'A coleção oficial também apresenta referências de marcos turísticos; esta lista comunitária é adicional e independente.' : 'A coleção oficial de Sendai lista os nomes dos locais, sem coordenadas exatas; esta lista comunitária é independente.'} As coordenadas abaixo não têm correspondência individual confirmada com os nomes oficiais e não são localizações exatas de Poképaradas verificadas. Sem GPX.</p>
      </div>
      <details class="ticket-rally-inline-details">
        <summary>Ver as 7 coordenadas comunitárias</summary>
        <ol class="ticket-rally-inline-points">
          ${route.coords.map((point, index) => {
            const value = escapeHtml(point);
            const map = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(point);
            return `<li><span>${index + 1}</span><code>${value}</code>
              <button type="button" data-ticket-copy-point="${index}">Copiar</button>
              <a href="${map}" target="_blank" rel="noopener noreferrer">Mapa</a></li>`;
          }).join('')}
        </ol>
        <button type="button" class="action-btn gold ticket-rally-inline-copy-all" data-ticket-copy-all>Copiar todas as 7 coordenadas</button>
      </details>`;

    if (section.dataset.copyHandlerInstalled !== 'true') {
      section.dataset.copyHandlerInstalled = 'true';
      section.addEventListener('click', async event => {
        const button = event.target.closest('[data-ticket-copy-all],[data-ticket-copy-point]');
        if (!button || !section.contains(button)) return;
        const currentRoute = routeFor({ id: section.dataset.ticketRallyId });
        if (!currentRoute) return;
        const payload = button.hasAttribute('data-ticket-copy-all')
          ? currentRoute.coords.join('\n')
          : currentRoute.coords[Number(button.dataset.ticketCopyPoint)] || '';
        const original = button.textContent;
        const ok = await copy(payload);
        button.textContent = ok ? 'Copiado!' : 'Selecione e copie';
        window.setTimeout(() => { button.textContent = original; }, 1800);
      });
    }
  }

  function renderPending() {
    const section = document.querySelector('#eventDetail .ticket-rally-inline[data-ticket-rally-id]');
    if (!section) return;
    const detail = document.getElementById('eventDetail');
    render(detail, { id: section.dataset.ticketRallyId });
  }

  async function load() {
    try {
      const response = await fetch(source, { cache: 'no-store' });
      if (!response.ok) throw Error('HTTP ' + response.status);
      const payload = await response.json();
      const ids = new Set((payload.routes || []).map(route => route.id));
      if (payload.schema_version !== 'spidey-ticket-rally-community-v1'
        || payload.ticket_required !== true
        || payload.exact_pokestops_verified !== false
        || payload.gpx_enabled !== false
        || !Array.isArray(payload.routes)
        || payload.routes.length !== 2
        || !ids.has('sendai') || !ids.has('mexico')
        || !payload.routes.every(route => Array.isArray(route.coords)
          && route.coords.length === 7 && route.coords.every(validCoordinate))) {
        throw Error('Conjunto de referências comunitárias incompleto.');
      }
      data = payload;
    } catch (_) {
      loadError = true;
    }
    renderPending();
  }

  window.SpideyTicketRallyCommunity = Object.freeze({ render });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once: true });
  } else {
    load();
  }
})();
