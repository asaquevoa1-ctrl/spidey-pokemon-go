(() => {
  const catalog = window.SPIDEY_PREMIUM_EVENT_ART || (window.SPIDEY_PREMIUM_EVENT_ART = {});

  const OFFICIAL_ART_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

  function assets(url, width = 475, height = 475) {
    return {
      thumb: { url, width, height },
      card: { url, width, height },
      hero: { url, width, height },
      poster: { url, width, height }
    };
  }

  function pokemonArt(id) {
    return `${OFFICIAL_ART_BASE}/${id}.png`;
  }

  // App key art: personagem oficial em PNG transparente + cenário Spidey renderizado pelo CSS.
  // Isto é deliberadamente separado do Gold Standard editorial usado na fila de publicação.
  catalog['2026-09-30-raid-hour-xerneas'] = {
    standard: 'spidey-app-keyart-v4',
    alt: 'Xerneas — Hora de Reides',
    assets: assets(pokemonArt(716))
  };

  catalog['2026-10-01-spotlight-seedot'] = {
    standard: 'spidey-app-keyart-v4',
    alt: 'Seedot — Hora do Holofote de 1 de outubro de 2026',
    assets: assets(pokemonArt(273))
  };

  catalog['2026-10-05-max-monday-sizzlipede'] = {
    standard: 'spidey-app-keyart-v4',
    alt: 'Sizzlipede — Segunda Max',
    assets: assets(pokemonArt(850))
  };

  catalog['2026-10-zorua-community-day'] = {
    standard: 'spidey-app-keyart-v4',
    alt: 'Zorua — Dia Comunitário de outubro de 2026',
    assets: assets(pokemonArt(570))
  };

  window.SPIDEY_PREMIUM_ART_PACK_V1 = {
    version: '2026-09-29.4-character-keyart',
    events: [
      '2026-09-30-raid-hour-xerneas',
      '2026-10-01-spotlight-seedot',
      '2026-10-05-max-monday-sizzlipede',
      '2026-10-zorua-community-day'
    ]
  };
})();
