(() => {
  const catalog = window.SPIDEY_PREMIUM_EVENT_ART || (window.SPIDEY_PREMIUM_EVENT_ART = {});

  function assets(url, width = 1080, height = 1620) {
    return {
      thumb: { url, width, height },
      card: { url, width, height },
      hero: { url, width, height },
      poster: { url, width, height }
    };
  }

  catalog['2026-09-30-raid-hour-xerneas'] = {
    standard: 'spidey-premium-v1',
    alt: 'Arte Premium Spidey para Hora de Reides de Xerneas',
    assets: assets('assets/events/premium/raid-hour-xerneas-v1.svg')
  };

  catalog['2026-10-05-max-monday-sizzlipede'] = {
    standard: 'spidey-premium-v1',
    alt: 'Arte Premium Spidey para Segunda Max de Sizzlipede',
    assets: assets('assets/events/premium/sizzlipede-spidey-v3.svg')
  };

  catalog['2026-10-zorua-community-day'] = {
    standard: 'spidey-premium-v1',
    alt: 'Arte Premium Spidey para Dia Comunitário de Zorua',
    assets: assets('assets/events/premium/zorua-spidey-v3.svg')
  };

  // Seedot permanece fora deste pack até entrar a arte corrigida de 2026.
  window.SPIDEY_PREMIUM_ART_PACK_V1 = {
    version: '2026-09-29.3-self-contained',
    events: [
      '2026-09-30-raid-hour-xerneas',
      '2026-10-05-max-monday-sizzlipede',
      '2026-10-zorua-community-day'
    ]
  };
})();
