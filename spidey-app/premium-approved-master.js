(() => {
  'use strict';
  // ÚNICA FONTE DE VERDADE VISUAL DO SPIDEY.
  // Somente artes aprovadas explicitamente pelo Anderson entram aqui.
  // Nenhum fallback, thumbnail ou gerador pode substituir uma entrada APPROVED.
  const MASTER = Object.freeze({
    'harvest-festival-2026': { file:'assets/events/premium/approved/harvest-festival-2026.png', status:'APPROVED', source:'user-approved-2026-09-30' },
    'team-go-rocket-takeover-2026': { file:'assets/events/premium/approved/team-go-rocket-takeover-2026.png', detailFile:'assets/events/premium/approved/team-go-rocket-takeover-2026-wide.png', status:'APPROVED', source:'user-approved-2026-09-30' },
    'gmax-cinderace-2026': { file:'assets/events/premium/approved/gmax-cinderace-2026.png', status:'APPROVED', source:'user-approved-2026-09-30' },
    'october-mystery-event-2026': { file:'assets/events/premium/approved/october-mystery-event-2026.png', status:'APPROVED', source:'user-approved-2026-09-30' },
    'zorua-october-2026': { file:'assets/events/premium/approved/zorua-october-2026.png', status:'APPROVED', source:'user-approved-2026-09-30' },
    'seedot-community-day-2026': { file:'assets/events/premium/approved/seedot-community-day-2026.png', status:'APPROVED', source:'user-approved-2026-09-30' },
    'hatch-day-october-2026': { file:'assets/events/premium/approved/hatch-day-october-2026.png', status:'APPROVED', source:'user-approved-2026-09-30' },
    'xerneas-raids-october-2026': { file:'assets/events/premium/approved/xerneas-raids-october-2026.png', status:'APPROVED', source:'user-approved-2026-09-30' },
    'halloween-part-1-2026': { file:'assets/events/premium/approved/halloween-part-1-2026.png', status:'APPROVED', source:'user-approved-2026-09-30' }
  });
  window.SPIDEY_APPROVED_ART_MASTER = MASTER;
  window.getSpideyApprovedArt = (eventId, context='card') => {
    const entry = MASTER[eventId];
    if (!entry || entry.status !== 'APPROVED') return null;
    return context === 'detail' && entry.detailFile ? entry.detailFile : entry.file;
  };
})();