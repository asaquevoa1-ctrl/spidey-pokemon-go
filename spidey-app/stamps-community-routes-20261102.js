/* Rotas extras enviadas pela comunidade; não alteram os Stamp Rallies oficiais. */
(function () {
  'use strict';
  const DATA_URL = 'data/community-routes-20261102.json';
  const SECTION_ID = 'stampCommunityRoutes20261102';
  const officialSource = 'https://pokemongo.com/en/news/go-wild-area-stamp-rally-details-2026';
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
          <span class="eyebrow">COMPARTILHADO PELA COMUNIDADE</span>
          <h2>Pontos extras para explorar</h2>
          <p>Hawlucha na Cidade do México e Lapras na região de Sendai. São 8 coordenadas para cada um, prontas para copiar.</p>
        </div>
        <span class="stamp-community-total">16 pontos</span>
      </div>
      <div class="stamp-community-grid">
        ${data.routes.map((route, index) => `
          <article class="stamp-community-card" data-community-route="${esc(route.id)}">
            <div class="stamp-community-title">
              <span class="stamp-community-symbol" aria-hidden="true">${index === 0 ? 'H' : 'L'}</span>
              <div><span class="eyebrow">${esc(route.city)}</span><h3>${esc(route.pokemon)}</h3></div>
              <span class="stamp-community-counter">8 pontos</span>
            </div>
            <p class="stamp-community-note">Referências compartilhadas por jogadores. Aparições e fundos especiais não são garantidos.</p>
            <ol class="stamp-community-points">
              ${route.points.map((point, idx) => {
                const coord = asText(point);
                return `<li><span class="stamp-community-number">${idx + 1}</span>
                  <code>${esc(coord)}</code>
                  <button type="button" data-community-copy-one="${idx}" aria-label="Copiar ponto ${idx + 1} de ${esc(route.pokemon)}">Copiar</button>
                  <a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(coord)}" target="_blank" rel="noopener noreferrer" aria-label="Ver no mapa o ponto ${idx + 1} de ${esc(route.pokemon)}">Mapa</a></li>`;
              }).join('')}
            </ol>
            <button type="button" class="action-btn gold stamp-community-copy-all" data-community-copy-all="${esc(route.id)}">Copiar as 8 coordenadas</button>
          </article>`).join('')}
      </div>
      <p class="stamp-community-disclaimer"><strong>Importante:</strong> estas listas compartilhadas não são as 7 PokéStops oficiais de cada GO Stamp Rally da Área Selvagem 2026. Consulte os locais oficiais nas coleções acima ou no <a href="${officialSource}" target="_blank" rel="noopener noreferrer">comunicado do Pokémon GO</a>.</p>`;
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
      root.innerHTML = '<div class="stamp-community-head"><h2>Pontos extras para explorar</h2></div><p class="microcopy">Não foi possível abrir as coordenadas agora. Confira sua conexão e reabra o Spidey.</p>';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
