window.SPIDEY_PREMIUM_EVENT_ART = {
  '2026-09-30-raid-hour-xerneas': {
    standard: 'spidey-premium-v1',
    alt: 'Hora de Reides — Xerneas — arte Premium Spidey aprovada',
    assets: {
      thumb: { url: 'assets/events/premium/xerneas-premium-approved-v1.avif', width: 960, height: 1200 },
      card: { url: 'assets/events/premium/xerneas-premium-approved-v1.avif', width: 960, height: 1200 },
      hero: { url: 'assets/events/premium/xerneas-premium-approved-v1.avif', width: 960, height: 1200 },
      poster: { url: 'assets/events/premium/xerneas-premium-approved-v1.avif', width: 960, height: 1200 }
    }
  },
  '2026-10-01-spotlight-seedot': {
    standard: 'spidey-premium-v1',
    alt: 'Hora do Holofote — Seedot — arte Premium Spidey aprovada',
    assets: {
      thumb: { url: 'assets/events/premium/seedot-premium-approved-v1.avif', width: 960, height: 1200 },
      card: { url: 'assets/events/premium/seedot-premium-approved-v1.avif', width: 960, height: 1200 },
      hero: { url: 'assets/events/premium/seedot-premium-approved-v1.avif', width: 960, height: 1200 },
      poster: { url: 'assets/events/premium/seedot-premium-approved-v1.avif', width: 960, height: 1200 }
    }
  },
  '2026-10-05-max-monday-sizzlipede': {
    standard: 'spidey-premium-v1',
    alt: 'Segunda Max — Sizzlipede Dynamax — arte Premium Spidey aprovada',
    assets: {
      thumb: { url: 'assets/events/premium/sizzlipede-premium-approved-v1.avif', width: 960, height: 1200 },
      card: { url: 'assets/events/premium/sizzlipede-premium-approved-v1.avif', width: 960, height: 1200 },
      hero: { url: 'assets/events/premium/sizzlipede-premium-approved-v1.avif', width: 960, height: 1200 },
      poster: { url: 'assets/events/premium/sizzlipede-premium-approved-v1.avif', width: 960, height: 1200 }
    }
  },
  '2026-10-zorua-community-day': {
    standard: 'spidey-premium-v1',
    alt: 'Dia Comunitário — Zorua — arte Premium Spidey aprovada',
    assets: {
      thumb: { url: 'assets/events/premium/zorua-premium-approved-v1.avif', width: 960, height: 1200 },
      card: { url: 'assets/events/premium/zorua-premium-approved-v1.avif', width: 960, height: 1200 },
      hero: { url: 'assets/events/premium/zorua-premium-approved-v1.avif', width: 960, height: 1200 },
      poster: { url: 'assets/events/premium/zorua-premium-approved-v1.avif', width: 960, height: 1200 }
    }
  }
};

// O catálogo aprovado é soberano. Nenhum fallback, pack tardio ou script de
// compatibilidade pode trocar estas quatro artes por SVG, placeholder ou
// artwork genérico.
Object.freeze(window.SPIDEY_PREMIUM_EVENT_ART);
for (const entry of Object.values(window.SPIDEY_PREMIUM_EVENT_ART)) {
  Object.freeze(entry.assets);
  Object.freeze(entry);
}

(function installSpideyArtPriorityFix() {
  if (typeof spideyResolveEventArt !== 'function' || typeof spideyArtUsable !== 'function') return;

  const baseResolve = spideyResolveEventArt;
  const roleOrder = {
    thumb: ['thumb', 'card', 'hero', 'poster'],
    card: ['card', 'thumb', 'hero', 'poster'],
    weekly: ['card', 'thumb', 'hero', 'poster'],
    hero: ['hero', 'poster', 'card'],
    poster: ['poster', 'hero']
  };

  function premiumAsset(event, role = 'card') {
    const entry = window.SPIDEY_PREMIUM_EVENT_ART?.[event?.id];
    if (!entry?.assets) return null;
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
        standard: entry.standard || 'spidey-premium-v1'
      };
      if (spideyArtUsable(asset, role)) return asset;
    }
    return null;
  }

  spideyResolveEventArt = function spideyResolveEventArtPriorityFixed(event, role = 'card') {
    return premiumAsset(event, role) || baseResolve(event, role);
  };

  if (window.SpideyArt) window.SpideyArt.resolve = spideyResolveEventArt;
  window.SpideyPremiumArt = { resolve: premiumAsset };
})();

(function installSpideyVisualV3() {
  const POKEMON_ART = [
    { keys: ['giratina forma origem', 'giratina origin'], id: 10007, label: 'Giratina (Forma Origem)' },
    { keys: ['xerneas'], id: 716, label: 'Xerneas' },
    { keys: ['yveltal'], id: 717, label: 'Yveltal' },
    { keys: ['dialga'], id: 483, label: 'Dialga' },
    { keys: ['palkia'], id: 484, label: 'Palkia' },
    { keys: ['seedot'], id: 273, label: 'Seedot' },
    { keys: ['elgyem'], id: 605, label: 'Elgyem' },
    { keys: ['stufful'], id: 759, label: 'Stufful' },
    { keys: ['morelull'], id: 755, label: 'Morelull' },
    { keys: ['gastly'], id: 92, label: 'Gastly' },
    { keys: ['sizzlipede'], id: 850, label: 'Sizzlipede' },
    { keys: ['rookidee'], id: 821, label: 'Rookidee' },
    { keys: ['sneasel'], id: 215, label: 'Sneasel' },
    { keys: ['sableye'], id: 302, label: 'Sableye' },
    { keys: ['sobble'], id: 816, label: 'Sobble' },
    { keys: ['zekrom'], id: 644, label: 'Zekrom' },
    { keys: ['pikachu'], id: 25, label: 'Pikachu' },
    { keys: ['gible'], id: 443, label: 'Gible' },
    { keys: ['zorua'], id: 570, label: 'Zorua' }
  ];

  const TAG_PTBR = {
    'Spotlight Hour': 'Hora do Holofote',
    'Raid Hour': 'Hora de Reides',
    'Max Monday': 'Segunda Max',
    'Raid Day': 'Dia de Reides',
    'Shadow Raids': 'Reides Sombrosas',
    'Team GO Rocket': 'Equipe GO Rocket',
    'Community Day': 'Dia Comunitário',
    'Max Battle Day': 'Dia de Batalhas Max'
  };

  const CATEGORY_TONE = {
    spotlight_hour: 'spotlight',
    raid_hour: 'raid',
    raid_rotation: 'raid',
    mega_raid_rotation: 'raid',
    shadow_raids: 'rocket',
    max_monday: 'max',
    max_battle_day: 'max',
    community_day: 'community',
    team_go_rocket: 'rocket',
    halloween: 'halloween',
    raid_day: 'raid',
    regional_event: 'regional',
    city_safari: 'regional',
    go_fest: 'festival',
    evento_especial: 'special'
  };

  function normalize(value) {
    return String(value || '').toLocaleLowerCase('pt-BR');
  }

  function localizeTitle(value) {
    return String(value || '')
      .replace(/^Spotlight Hour:/i, 'Hora do Holofote:')
      .replace(/^Raid Hour:/i, 'Hora de Reides:')
      .replace(/^Max Monday:/i, 'Segunda Max:')
      .replace(/^Community Day:/i, 'Dia Comunitário:')
      .replace(/^Max Battle Day:/i, 'Dia de Batalhas Max:')
      .replace(/\bChoose Your Path\b/gi, 'Escolha seu caminho')
      .replace(/\bRaid Day\b/gi, 'Dia de Reides');
  }

  function localizeEvent(event) {
    if (!event) return event;
    event.title = localizeTitle(event.title);
    if (Array.isArray(event.tags)) event.tags = event.tags.map((tag) => TAG_PTBR[tag] || tag);
    return event;
  }

  function haystack(event) {
    return normalize([
      event?.title,
      event?.summary,
      ...(event?.tags || []),
      ...(event?.pokemon || []).map((item) => item?.name)
    ].filter(Boolean).join(' | '));
  }

  function findPokemon(event) {
    const text = haystack(event);
    return POKEMON_ART.find((entry) => entry.keys.some((key) => text.includes(normalize(key)))) || null;
  }

  function visualTone(event) {
    return CATEGORY_TONE[event?.category] || 'default';
  }

  function isLocalSpecificAsset(asset) {
    const role = String(asset?.sourceRole || '');
    const url = String(asset?.url || '');
    return role.startsWith('premium_catalog:') || /festival-das-luzes-approved\.png/i.test(url) || /assets\/events\/premium\//i.test(url);
  }

  function applyResolvedImage(image, event, role) {
    if (!image || !event || typeof spideyResolveEventArt !== 'function') return;
    const asset = spideyResolveEventArt(event, role);
    if (!asset?.url) return;
    const next = typeof spideyVersionedArtUrl === 'function' ? spideyVersionedArtUrl(asset) : asset.url;
    if (image.getAttribute('src') !== next) image.setAttribute('src', next);
    image.classList.toggle('spidey-poster-art-v3', isLocalSpecificAsset(asset));
    image.classList.remove('spidey-specific-art-v2');
    image.onerror = () => {
      image.onerror = null;
      image.classList.remove('spidey-poster-art-v3');
      image.src = typeof generatedEventArtUrl === 'function' ? generatedEventArtUrl(event) : '';
    };
  }

  function decorateNode(node, event, role = 'card') {
    if (!node || !event) return;
    localizeEvent(event);
    node.dataset.visualCategory = visualTone(event);
    node.dataset.eventCategory = event.category || '';
    const pokemon = findPokemon(event);
    if (pokemon) node.dataset.visualCharacter = pokemon.label;
    const image = node.matches?.('img') ? node : node.querySelector?.('img');
    if (image) applyResolvedImage(image, event, role);
  }

  function decorateEventCards() {
    document.querySelectorAll('#eventList .event-card').forEach((card) => {
      const title = card.querySelector('h3')?.textContent || '';
      const event = state?.events?.find((item) => localizeTitle(item.title) === title || item.title === title);
      if (event) decorateNode(card, event, 'card');
    });
  }

  function decorateExperience() {
    document.querySelectorAll('.experience-event[data-event-id]').forEach((node) => {
      const event = state?.events?.find((item) => item.id === node.dataset.eventId);
      if (!event) return;
      const feature = node.closest('.experience-feature');
      decorateNode(feature || node.closest('.experience-mini') || node, event, feature ? 'hero' : 'card');
    });
  }

  function decorateWeekly() {
    document.querySelectorAll('[data-weekly-event]').forEach((node) => {
      const event = state?.events?.find((item) => item.id === node.dataset.weeklyEvent);
      if (event) decorateNode(node, event, 'weekly');
    });
    document.querySelectorAll('#weeklyView .eyebrow').forEach((node) => {
      if (node.textContent.trim().toUpperCase() === 'SPIDEY WEEKLY') node.textContent = 'SEMANA SPIDEY';
      if (node.textContent.trim().toUpperCase() === 'STAMPS') node.textContent = 'SELOS';
    });
  }

  function decorateDetail(event) {
    const root = document.querySelector('#eventDetail');
    if (!root || !event) return;
    localizeEvent(event);
    root.classList.add('spidey-detail-v3');
    root.dataset.visualCategory = visualTone(event);
    const pokemon = findPokemon(event);
    if (pokemon) root.dataset.visualCharacter = pokemon.label;

    const hero = root.querySelector('.detail-hero');
    if (hero) applyResolvedImage(hero, event, 'hero');

    const body = root.querySelector('.detail-body');
    if (body && !body.querySelector('.spidey-detail-ribbon')) {
      const ribbon = document.createElement('div');
      ribbon.className = 'spidey-detail-ribbon';
      const category = typeof spideyCategoryLabel === 'function' ? spideyCategoryLabel(event) : 'Evento';
      ribbon.innerHTML = `<span>${category}</span>${pokemon ? `<strong>${pokemon.label}</strong>` : ''}`;
      body.insertBefore(ribbon, body.firstChild);
    }
  }

  function decorateAll() {
    decorateEventCards();
    decorateExperience();
    decorateWeekly();
  }

  if (typeof weeklyArtUrl === 'function') {
    const previousWeeklyArtUrl = weeklyArtUrl;
    weeklyArtUrl = function weeklyArtUrlV3(item) {
      if (item) {
        item.title = localizeTitle(item.title);
        if (Array.isArray(item.tags)) item.tags = item.tags.map((tag) => TAG_PTBR[tag] || tag);
      }
      const event = typeof weeklyFindEvent === 'function' ? weeklyFindEvent(item?.id) : null;
      if (event && typeof spideyResolveEventArt === 'function') {
        const asset = spideyResolveEventArt(event, 'weekly');
        if (asset?.url) return typeof spideyVersionedArtUrl === 'function' ? spideyVersionedArtUrl(asset) : asset.url;
      }
      return previousWeeklyArtUrl(item);
    };
  }

  if (typeof renderEvents === 'function') {
    const base = renderEvents;
    renderEvents = function renderEventsV3(events = state.events) {
      (events || []).forEach(localizeEvent);
      const result = base(events);
      queueMicrotask(decorateAll);
      return result;
    };
  }

  if (typeof renderCalendar === 'function') {
    const base = renderCalendar;
    renderCalendar = function renderCalendarV3(...args) {
      state?.events?.forEach(localizeEvent);
      const result = base(...args);
      queueMicrotask(decorateAll);
      return result;
    };
  }

  if (typeof openEvent === 'function') {
    const base = openEvent;
    openEvent = function openEventV3(event) {
      localizeEvent(event);
      const result = base(event);
      decorateDetail(event);
      return result;
    };
  }

  if (typeof renderWeeklyView === 'function') {
    const base = renderWeeklyView;
    renderWeeklyView = function renderWeeklyViewV3(...args) {
      if (typeof spideyWeeklyData !== 'undefined' && spideyWeeklyData) {
        for (const day of spideyWeeklyData.days || []) {
          for (const item of day.items || []) item.title = localizeTitle(item.title);
        }
        for (const items of Object.values(spideyWeeklyData.sections || {})) {
          for (const item of items || []) item.title = localizeTitle(item.title);
        }
      }
      const result = base(...args);
      queueMicrotask(decorateAll);
      return result;
    };
  }

  setTimeout(() => {
    state?.events?.forEach(localizeEvent);
    decorateAll();
  }, 0);

  window.SpideyVisualV3 = { localizeTitle, findPokemon, decorate: decorateAll };
})();