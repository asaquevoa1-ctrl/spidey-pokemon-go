(() => {
  'use strict';

  // Regra já aprovada do projeto: o catálogo Premium só pode conter peça que
  // realmente atingiu spidey-premium-v1. Qualquer SVG antigo, character-art,
  // placeholder ou fallback técnico sai deste catálogo e permanece apenas como
  // fallback do sistema base, sem o selo Premium.
  const catalog = window.SPIDEY_PREMIUM_EVENT_ART || (window.SPIDEY_PREMIUM_EVENT_ART = {});
  for (const key of Object.keys(catalog)) delete catalog[key];

  const STANDARD = 'spidey-premium-v1';

  function assets(url, width = 960, height = 1200) {
    const make = () => ({ url, width, height });
    return {
      thumb: make(),
      card: make(),
      hero: make(),
      poster: make()
    };
  }

  function approved(url, alt) {
    return {
      standard: STANDARD,
      visualApproved: true,
      premium_visual_approved: true,
      alt,
      assets: assets(url)
    };
  }

  // Referências visuais aprovadas pelo responsável editorial do Spidey.
  catalog['2026-09-30-raid-hour-xerneas'] = approved(
    'assets/events/premium/xerneas-premium-approved-v1.avif',
    'Hora de Reides — Xerneas — arte Premium Spidey aprovada'
  );

  catalog['2026-10-01-spotlight-seedot'] = approved(
    'assets/events/premium/seedot-premium-approved-v1.avif',
    'Hora do Holofote — Seedot — arte Premium Spidey aprovada'
  );

  catalog['2026-10-05-max-monday-sizzlipede'] = approved(
    'assets/events/premium/sizzlipede-premium-approved-v1.avif',
    'Segunda Max — Sizzlipede Dynamax — arte Premium Spidey aprovada'
  );

  catalog['2026-10-zorua-community-day'] = approved(
    'assets/events/premium/zorua-premium-approved-v1.avif',
    'Dia da Comunidade — Zorua — arte Premium Spidey aprovada'
  );

  window.SPIDEY_PREMIUM_ART_PACK_V1 = {
    version: '2026-09-29.5-approved-premium-only',
    standard: STANDARD,
    failClosed: true,
    events: Object.keys(catalog)
  };
})();
