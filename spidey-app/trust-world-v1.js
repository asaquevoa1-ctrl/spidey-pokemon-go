(() => {
  'use strict';
  const STATUS = {
    official: ['OFICIAL', 'Informação confirmada em fonte primária'],
    datamine: ['DATAMINE', 'Descoberta técnica ainda não confirmada oficialmente'],
    awaiting: ['AGUARDANDO CONFIRMAÇÃO', 'Aguardando confirmação em fonte primária'],
    local: ['EVENTO LOCAL', 'Disponível somente no local indicado'],
  };
  window.SPIDEY_EVENT_TRUST = { version: '2026-09-30.1', statuses: STATUS, failClosed: true };

  // Eventos locais conhecidos podem existir antes de uma arte Premium aprovada.
  // Nenhuma imagem gerada é usada como fallback: dados primeiro, arte somente após aprovação.
  const worldEvents = [
    {
      id: '2026-10-comic-con-malaga',
      title: 'Pokémon GO × Comic-Con Málaga 2026',
      place: 'Málaga, Espanha',
      dates: '1–4 out 2026',
      status: 'awaiting',
      locality: 'local',
      note: 'Evento local em verificação de fonte primária. Arte Premium ainda não aprovada.',
      artApproved: false,
    },
    {
      id: '2026-toyohashi-observatory',
      title: 'Observatório Astronômico de Pokémon — Toyohashi',
      place: 'Toyohashi, Japão',
      dates: 'Evento local',
      status: 'awaiting',
      locality: 'local',
      note: 'Dados preservados para verificação. Arte anterior rejeitada e bloqueada.',
      artApproved: false,
    },
  ];
  window.SPIDEY_WORLD_EVENTS = worldEvents;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function badge(key) {
    const [label] = STATUS[key] || STATUS.awaiting;
    return `<span class="trust-badge trust-${esc(key)}">${esc(label)}</span>`;
  }
  function renderWorldEvents() {
    const root = document.getElementById('worldEvents');
    if (!root) return;
    root.innerHTML = worldEvents.map(event => `
      <article class="world-event-card" data-world-event="${esc(event.id)}">
        <div class="world-event-meta">${badge(event.locality)} ${badge(event.status)}</div>
        <h3>${esc(event.title)}</h3>
        <p><strong>${esc(event.place)}</strong> · ${esc(event.dates)}</p>
        <p class="microcopy">${esc(event.note)}</p>
        <div class="art-state art-pending">SEM ARTE PREMIUM APROVADA</div>
      </article>`).join('');
  }

  // Fail-closed: apenas entradas explicitamente aprovadas podem ser exibidas como Premium.
  function enforceApprovedPremium(root = document) {
    root.querySelectorAll?.('img.spidey-poster-art-v3, img[data-premium-art], .premium-art img').forEach(img => {
      const owner = img.closest('[data-v22-event], .event-card, .experience-mini, .experience-feature, .weekly-item, #eventDetail');
      const eventId = owner?.dataset?.v22Event || owner?.dataset?.eventId;
      if (!eventId) return;
      const entry = window.SPIDEY_PREMIUM_EVENT_ART?.[eventId];
      if (entry?.visualApproved === true && entry?.premium_visual_approved === true) return;
      img.hidden = true;
      owner?.classList.add('spidey-art-unapproved');
    });
  }
  function apply() { renderWorldEvents(); enforceApprovedPremium(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, {once:true}); else apply();
  new MutationObserver(() => enforceApprovedPremium()).observe(document.documentElement, {subtree:true, childList:true});
})();