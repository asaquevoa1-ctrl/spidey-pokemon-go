(() => {
  const catalog = window.SPIDEY_PREMIUM_EVENT_ART || (window.SPIDEY_PREMIUM_EVENT_ART = {});

  function assets(url, width = 1080, height = 1350) {
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
    assets: assets('assets/events/premium/xerneas-spidey-v2.svg')
  };

  catalog['2026-10-05-max-monday-sizzlipede'] = {
    standard: 'spidey-premium-v1',
    alt: 'Arte Premium Spidey para Segunda Max de Sizzlipede',
    assets: assets('assets/events/premium/sizzlipede-spidey-v2.svg')
  };

  catalog['2026-10-zorua-community-day'] = {
    standard: 'spidey-premium-v1',
    alt: 'Arte Premium Spidey para Dia Comunitário de Zorua',
    assets: assets('assets/events/premium/zorua-spidey-v2.svg')
  };

  // Seedot fica propositalmente fora deste pack: a arte disponível contém ano incorreto.
  window.SPIDEY_PREMIUM_ART_PACK_V1 = {
    version: '2026-09-29.2-artfix',
    events: [
      '2026-09-30-raid-hour-xerneas',
      '2026-10-05-max-monday-sizzlipede',
      '2026-10-zorua-community-day'
    ]
  };
})();
