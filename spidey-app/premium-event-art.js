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

  if (typeof weeklyArtUrl === 'function') {
    const baseWeeklyArtUrl = weeklyArtUrl;
    weeklyArtUrl = function weeklyArtUrlWithPremiumCatalog(item) {
      const event = typeof weeklyFindEvent === 'function' ? weeklyFindEvent(item?.id) : null;
      if (event) {
        const asset = spideyResolveEventArt(event, 'weekly');
        if (asset?.url && String(asset.sourceRole || '').startsWith('premium_catalog:')) {
          return typeof spideyVersionedArtUrl === 'function' ? spideyVersionedArtUrl(asset) : asset.url;
        }
      }
      return baseWeeklyArtUrl(item);
    };
  }

  if (typeof state !== 'undefined' && state?.events?.length && typeof renderEvents === 'function') renderEvents();
  if (typeof spideyWeeklyData !== 'undefined' && spideyWeeklyData && typeof renderWeeklyView === 'function') renderWeeklyView();
})();

(function installSpideyVisualV2October() {
  if (typeof spideyResolveEventArt !== 'function') return;

  const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

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
    { keys: ['gible'], id: 443, label: 'Gible' }
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
    if (!event || event.__spideyPtBrV2) return event;
    event.title = localizeTitle(event.title);
    if (Array.isArray(event.tags)) event.tags = event.tags.map((tag) => TAG_PTBR[tag] || tag);
    event.__spideyPtBrV2 = true;
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

  function specificAsset(event) {
    const pokemon = findPokemon(event);
    if (!pokemon) return null;
    return {
      url: `${SPRITE_BASE}/${pokemon.id}.png`,
      width: 1024,
      height: 1536,
      sha256: '',
      sourceRole: 'event_specific_pokemon_v2',
      standard: 'spidey-event-specific-v2',
      character: pokemon.label
    };
  }

  function keepApprovedLocal(asset) {
    const url = String(asset?.url || '');
    return /festival-das-luzes-approved\.png/i.test(url);
  }

  const previousResolve = spideyResolveEventArt;
  spideyResolveEventArt = function spideyResolveEventArtV2(event, role = 'card') {
    localizeEvent(event);
    const previous = previousResolve(event, role);
    if (keepApprovedLocal(previous)) return previous;
    const specific = specificAsset(event);
    return specific || previous;
  };
  if (window.SpideyArt) window.SpideyArt.resolve = spideyResolveEventArt;

  if (typeof weeklyArtUrl === 'function') {
    const previousWeeklyArtUrl = weeklyArtUrl;
    weeklyArtUrl = function weeklyArtUrlV2(item) {
      if (item) {
        item.title = localizeTitle(item.title);
        if (Array.isArray(item.tags)) item.tags = item.tags.map((tag) => TAG_PTBR[tag] || tag);
      }
      const event = typeof weeklyFindEvent === 'function' ? weeklyFindEvent(item?.id) : null;
      if (event) {
        localizeEvent(event);
        const specific = specificAsset(event);
        if (specific?.url) return specific.url;
      }
      return previousWeeklyArtUrl(item);
    };
  }

  function visualTone(event) {
    return CATEGORY_TONE[event?.category] || 'default';
  }

  function backupImage(image, event) {
    if (!image || !event || !specificAsset(event)) return;
    image.onerror = () => {
      image.onerror = null;
      image.classList.remove('spidey-specific-art-v2');
      image.src = typeof generatedEventArtUrl === 'function' ? generatedEventArtUrl(event) : '';
    };
  }

  function decorateNode(node, event) {
    if (!node || !event) return;
    localizeEvent(event);
    const pokemon = findPokemon(event);
    node.dataset.visualCategory = visualTone(event);
    node.dataset.eventCategory = event.category || '';
    if (pokemon) node.dataset.visualCharacter = pokemon.label;

    const image = node.matches?.('img') ? node : node.querySelector?.('img');
    if (image && pokemon) {
      const asset = specificAsset(event);
      if (asset?.url && image.src !== asset.url) image.src = asset.url;
      image.classList.add('spidey-specific-art-v2');
      image.alt = `${pokemon.label} • ${event.title}`;
      backupImage(image, event);
    }
  }

  function decorateEventCards() {
    const cards = [...document.querySelectorAll('#eventList .event-card')];
    cards.forEach((card) => {
      const title = card.querySelector('h3')?.textContent || '';
      const event = state?.events?.find((item) => localizeTitle(item.title) === title || item.title === title);
      if (event) decorateNode(card, event);
    });
  }

  function decorateExperience() {
    document.querySelectorAll('.experience-event[data-event-id]').forEach((node) => {
      const event = state?.events?.find((item) => item.id === node.dataset.eventId);
      if (!event) return;
      const surface = node.closest('.experience-feature, .experience-mini') || node;
      decorateNode(surface, event);
    });
  }

  function decorateWeekly() {
    document.querySelectorAll('[data-weekly-event]').forEach((node) => {
      const event = state?.events?.find((item) => item.id === node.dataset.weeklyEvent);
      if (event) decorateNode(node, event);
    });
    document.querySelectorAll('#weeklyView .eyebrow').forEach((node) => {
      if (node.textContent.trim().toUpperCase() === 'SPIDEY WEEKLY') node.textContent = 'SEMANA SPIDEY';
      if (node.textContent.trim().toUpperCase() === 'STAMPS') node.textContent = 'SELOS';
    });
    document.querySelectorAll('#weeklyView h2').forEach((node) => {
      if (node.textContent.trim() === 'Rallies ativos') node.textContent = 'Rallies de selos ativos';
    });
  }

  function decorateDetail(event) {
    const root = document.querySelector('#eventDetail');
    if (!root || !event) return;
    localizeEvent(event);
    root.classList.add('spidey-detail-v2');
    root.dataset.visualCategory = visualTone(event);
    const pokemon = findPokemon(event);
    if (pokemon) root.dataset.visualCharacter = pokemon.label;

    const hero = root.querySelector('.detail-hero');
    if (hero && pokemon) {
      const asset = specificAsset(event);
      if (asset?.url) hero.src = asset.url;
      hero.classList.add('spidey-specific-art-v2');
      hero.alt = `${pokemon.label} • ${event.title}`;
      backupImage(hero, event);
    }

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

  if (typeof renderEvents === 'function') {
    const previousRenderEvents = renderEvents;
    renderEvents = function renderEventsV2(events = state.events) {
      (events || []).forEach(localizeEvent);
      const result = previousRenderEvents(events);
      queueMicrotask(decorateAll);
      return result;
    };
  }

  if (typeof renderCalendar === 'function') {
    const previousRenderCalendar = renderCalendar;
    renderCalendar = function renderCalendarV2(...args) {
      state?.events?.forEach(localizeEvent);
      const result = previousRenderCalendar(...args);
      queueMicrotask(decorateAll);
      return result;
    };
  }

  if (typeof openEvent === 'function') {
    const previousOpenEvent = openEvent;
    openEvent = function openEventV2(event) {
      localizeEvent(event);
      const result = previousOpenEvent(event);
      decorateDetail(event);
      return result;
    };
  }

  if (typeof renderWeeklyView === 'function') {
    const previousRenderWeeklyView = renderWeeklyView;
    renderWeeklyView = function renderWeeklyViewV2(...args) {
      if (typeof spideyWeeklyData !== 'undefined' && spideyWeeklyData) {
        for (const day of spideyWeeklyData.days || []) {
          for (const item of day.items || []) item.title = localizeTitle(item.title);
        }
        for (const items of Object.values(spideyWeeklyData.sections || {})) {
          for (const item of items || []) item.title = localizeTitle(item.title);
        }
      }
      const result = previousRenderWeeklyView(...args);
      queueMicrotask(decorateAll);
      return result;
    };
  }

  const observer = new MutationObserver(() => decorateAll());
  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    state?.events?.forEach(localizeEvent);
    if (typeof renderEvents === 'function' && state?.events?.length) renderEvents();
    if (typeof renderWeeklyView === 'function') renderWeeklyView();
    decorateAll();
  }, 0);

  window.SpideyVisualV2 = {
    pokemonArt: POKEMON_ART,
    localizeTitle,
    findPokemon,
    specificAsset,
    decorate: decorateAll
  };
})();
