/* Caças aos Selos permanentes: locais oficiais com coordenadas de referência comunitárias. */
(function () {
  'use strict';
  const DATA_URL = 'data/community-routes-20261102.json';
  const SECTION_ID = 'stampCommunityRoutes20261102';
  const officialSource = 'https://pokemongo.com/news/forever-stamp-rally-go-wild-area-2026';
  // Cartazes Premium já aprovados do evento; não substituem as imagens oficiais das PokéLids.
  const ROUTE_ART=Object.freeze({
    'hawlucha-mexico-city':{
      file:'assets/events/premium/wild-area-mexico-city-2026-approved-v1.png',
      alt:'Cartaz Premium do GO Wild Area 2026 na Cidade do México'
    },
    'lapras-sendai-tohoku':{
      file:'assets/events/premium/wild-area-sendai-2026-approved-v1.png',
      alt:'Cartaz Premium do GO Wild Area 2026 em Sendai'
    }
  });
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[char]);
  const validCoord = p => Number.isFinite(p?.latitude) && Number.isFinite(p?.longitude)
    && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180;
  const asText = point => Number(point.latitude) + ',' + Number(point.longitude);
  const notify = message => {
    if (typeof showToast === 'function') showToast(message);
    else {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      window.setTimeout(() => toast.classList.remove('show'), 2500);
    }
  };
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
  function render(root, data) {
    if (data?.schema_version !== 'spidey-community-routes-v1' || !Array.isArray(data.routes)
      || data.routes.length !== 2 || !data.routes.every(route =>
        Array.isArray(route.points) && route.points.length === 8 && route.points.every(validCoord))) {
      throw Error('Conjunto de coordenadas incompleto.');
    }
    const byId = new Map(data.routes.map(route => [route.id, route]));
    root.innerHTML = `
      <div class="stamp-community-head">
        <div>
          <span class="eyebrow">CAÇAS OFICIAIS · SEM DATA DE TÉRMINO</span>
          <h2>Hawlucha e Lapras: 8 selos por cidade</h2>
          <p>O Pokémon GO confirmou oito locais na Cidade do México e oito em Sendai/Tohoku. As coordenadas ajudam a chegar aos lugares, mas a Poképarada exata deve ser conferida no jogo.</p>
        </div>
        <span class="stamp-community-total">16 pontos</span>
      </div>
      <div class="stamp-community-grid">
        ${data.routes.map((route, index) => `
          <article class="stamp-community-card" data-community-route="${esc(route.id)}">
            <figure class="stamp-community-visual">
              <img src="${esc(ROUTE_ART[route.id]?.file || '')}" alt="${esc(ROUTE_ART[route.id]?.alt || 'Cartaz do evento regional')}" loading="lazy" decoding="async" width="920" height="520">
              <figcaption><span>✦ CAÇA AOS SELOS PERMANENTE</span><strong>${esc(route.pokemon)}</strong><small>${esc(route.city)}</small></figcaption>
            </figure>
            <div class="stamp-community-title">
              <span class="stamp-community-symbol" aria-hidden="true">${index === 0 ? 'H' : 'L'}</span>
              <div><span class="eyebrow">${esc(route.city)}</span><h3>${esc(route.pokemon)}</h3></div>
              <span class="stamp-community-counter">8 pontos</span>
            </div>
            <p class="stamp-community-note">Ao completar os oito selos, o encontro com ${esc(route.pokemon)} e o Fundo de Localização são recompensas oficiais. Brilhante é possível, nunca garantido. As coordenadas são referências comunitárias dos lugares.</p>
            <ol class="stamp-community-points">
              ${route.points.map((point, idx) => {
                const coord = asText(point);
                return `<li><span class="stamp-community-number">${idx + 1}</span>
                  <span><strong>${esc(point.venue || ('Ponto ' + (idx + 1)))}</strong><code>${esc(coord)}</code></span>
                  <button type="button" data-community-copy-one="${idx}" aria-label="Copiar ponto ${idx + 1} de ${esc(route.pokemon)}">Copiar</button>
                  <a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(coord)}" target="_blank" rel="noopener noreferrer" aria-label="Ver no mapa o ponto ${idx + 1} de ${esc(route.pokemon)}">Mapa</a></li>`;
              }).join('')}
            </ol>
            <button type="button" class="action-btn gold stamp-community-copy-all" data-community-copy-all="${esc(route.id)}">Copiar as 8 coordenadas</button>
          </article>`).join('')}
      </div>
      <p class="stamp-community-disclaimer"><strong>Importante:</strong> estas duas rotas contínuas são separadas das Caças aos Selos de 7 pontos exclusivas do fim de semana da Área Selvagem. Os nomes e as recompensas vêm do <a href="${officialSource}" target="_blank" rel="noopener noreferrer">comunicado oficial</a>; as coordenadas não são posições oficiais das Poképaradas e não geram GPX.</p>`;
    root.addEventListener('click', async event => {
      const button = event.target.closest('[data-community-copy-one],[data-community-copy-all]');
      if (!button || !root.contains(button)) return;
      const card = button.closest('[data-community-route]');
      const route = byId.get(card?.dataset.communityRoute);
      if (!route) return;
      const one = button.hasAttribute('data-community-copy-one');
      const pointIndex = Number(button.dataset.communityCopyOne);
      const payload = one ? (route.points[pointIndex] ? asText(route.points[pointIndex]) : '')
        : route.points.map(asText).join('\n');
      const copied = await copy(payload);
      notify(copied ? (one ? 'Coordenada copiada.' : 'As 8 coordenadas foram copiadas. É só colar no DataHub.')
        : 'Não foi possível copiar automaticamente. Selecione as coordenadas na lista.');
    });
  }
  function mount() {
    const view = document.getElementById('stampsView');
    if (!view || document.getElementById(SECTION_ID)) return;
    const root = document.createElement('section');
    root.id = SECTION_ID;
    root.className = 'section stamp-community-section';
    root.setAttribute('aria-label', 'Pontos extras de Hawlucha e Lapras');
    root.innerHTML = '<p class="microcopy">Carregando pontos compartilhados…</p>';
    view.appendChild(root);
    fetch(DATA_URL, {cache:'no-store'}).then(r => {
      if (!r.ok) throw Error('HTTP ' + r.status);
      return r.json();
    }).then(data => render(root, data)).catch(() => {
      root.innerHTML = '<div class="stamp-community-head"><h2>Caças aos Selos de Hawlucha e Lapras</h2></div><p class="microcopy">Não foi possível abrir os locais agora. Confira sua conexão e reabra o Spidey.</p>';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
