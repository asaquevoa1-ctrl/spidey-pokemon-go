window.SPIDEY_PREMIUM_EVENT_ART = {
  '2026-09-30-raid-hour-xerneas': {
    standard: 'spidey-event-premium-v1',
    alt: 'Arte Premium Spidey para Raid Hour de Xerneas',
    assets: {
      thumb: { url: 'assets/events/premium/raid-hour-xerneas-v1.svg', width: 1080, height: 1620 },
      card: { url: 'assets/events/premium/raid-hour-xerneas-v1.svg', width: 1080, height: 1620 },
      hero: { url: 'assets/events/premium/raid-hour-xerneas-v1.svg', width: 1080, height: 1620 },
      poster: { url: 'assets/events/premium/raid-hour-xerneas-v1.svg', width: 1080, height: 1620 }
    }
  },
  '2026-10-01-spotlight-seedot': {
    standard: 'spidey-event-premium-v1',
    alt: 'Arte Premium Spidey para Hora do Holofote de Seedot',
    assets: {
      thumb: { url: 'assets/events/premium/spotlight-seedot-v1.svg', width: 1080, height: 1620 },
      card: { url: 'assets/events/premium/spotlight-seedot-v1.svg', width: 1080, height: 1620 },
      hero: { url: 'assets/events/premium/spotlight-seedot-v1.svg', width: 1080, height: 1620 },
      poster: { url: 'assets/events/premium/spotlight-seedot-v1.svg', width: 1080, height: 1620 }
    }
  },
  '2026-09-gible-community-day-classic': {
    standard: 'spidey-event-premium-v1',
    alt: 'Arte Premium Spidey para Dia Comunitário Clássico de Gible',
    assets: {
      thumb: { url: 'assets/events/premium/community-day-gible-v1.svg', width: 1080, height: 1620 },
      card: { url: 'assets/events/premium/community-day-gible-v1.svg', width: 1080, height: 1620 },
      hero: { url: 'assets/events/premium/community-day-gible-v1.svg', width: 1080, height: 1620 },
      poster: { url: 'assets/events/premium/community-day-gible-v1.svg', width: 1080, height: 1620 }
    }
  }
};

(function installSpideyPremiumEventArt() {
  if (typeof spideyResolveEventArt !== 'function' || typeof spideyArtUsable !== 'function') return;

  const baseResolve = spideyResolveEventArt;
  const roleOrder = {
    thumb: ['thumb', 'card', 'hero', 'poster'],
    card: ['card', 'thumb', 'hero', 'poster'],
    weekly: ['card', 'thumb', 'hero', 'poster'],
    hero: ['hero', 'poster', 'card'],
    poster: ['poster', 'hero']
  };

  spideyResolveEventArt = function spideyResolveEventArtWithPremiumCatalog(event, role = 'card') {
    const entry = window.SPIDEY_PREMIUM_EVENT_ART?.[event?.id];
    if (entry?.assets) {
      const roles = roleOrder[role] || roleOrder.card;
      for (const candidateRole of roles) {
        const raw = entry.assets[candidateRole];
        if (!raw?.url) continue;
        const asset = {
          url: raw.url,
          width: Number(raw.width || 0),
          height: Number(raw.height || 0),
          sha256: raw.sha256 || '',
          sourceRole: `premium_catalog:${candidateRole}`,
          standard: entry.standard || 'spidey-event-premium-v1'
        };
        if (spideyArtUsable(asset, role)) return asset;
      }
    }
    return baseResolve(event, role);
  };

  if (window.SpideyArt) window.SpideyArt.resolve = spideyResolveEventArt;
})();
