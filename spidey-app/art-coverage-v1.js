(() => {
  'use strict';

  const VERSION = 'spidey-art-coverage-v1-20261004-space-v1';
  const BAD_PUBLIC_ART = /(?:assets\/events\/generated\/|generated_vector|placeholder|preview|fallback|festival-das-luzes-approved\.png|festival-das-luzes-2026\.jpg)/i;
  const PREMIUM_ART = /\/assets\/events\/premium\//i;
  const SOURCE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
  let eventsCache = [];
  let scheduled = false;

  const POKEMON = [
    ['mega victreebel', 71, 'Victreebel'], ['victreebel', 71, 'Victreebel'],
    ['giratina', 487, 'Giratina'], ['xerneas', 716, 'Xerneas'], ['yveltal', 717, 'Yveltal'],
    ['dialga', 483, 'Dialga'], ['palkia', 484, 'Palkia'], ['seedot', 273, 'Seedot'],
    ['elgyem', 605, 'Elgyem'], ['stufful', 759, 'Stufful'], ['morelull', 755, 'Morelull'],
    ['gastly', 92, 'Gastly'], ['sizzlipede', 850, 'Sizzlipede'], ['zorua', 570, 'Zorua'],
    ['landorus', 645, 'Landorus'], ['pikachu', 25, 'Pikachu'], ['gible', 443, 'Gible'],
    ['latios', 381, 'Latios'], ['maschiff', 942, 'Maschiff'], ['mabosstiff', 943, 'Mabosstiff'],
    ['rattata', 19, 'Rattata'], ['regirock', 377, 'Regirock'], ['regice', 378, 'Regice'],
    ['registeel', 379, 'Registeel'], ['zacian', 888, 'Zacian'], ['zamazenta', 889, 'Zamazenta'],
    ['xurkitree', 796, 'Xurkitree'], ['buzzwole', 794, 'Buzzwole'], ['pheromosa', 795, 'Pheromosa'],
    ['ralts', 280, 'Ralts'], ['rhyhorn', 111, 'Rhyhorn'], ['articuno', 144, 'Articuno'],
    ['zapdos', 145, 'Zapdos'], ['moltres', 146, 'Moltres'], ['cinderace', 815, 'Cinderace'],
    ['beedrill', 15, 'Beedrill'], ['houndoom', 229, 'Houndoom'], ['venusaur', 3, 'Venusaur'],
    ['malamar', 687, 'Malamar'], ['zekrom', 644, 'Zekrom'], ['sableye', 302, 'Sableye'],
    ['sneasel', 215, 'Sneasel'], ['sobble', 816, 'Sobble'], ['rookidee', 821, 'Rookidee'],
  ];

  const CATEGORY = {
    raid_hour: ['raid', '✦'], raid_rotation: ['raid', '✦'], mega_raid_rotation: ['mega', '✧'],
    shadow_raids: ['shadow', '☾'], max_monday: ['max', '×'], max_battle_day: ['max', '×'],
    spotlight_hour: ['spotlight', '◉'], community_day: ['community', '✦'], go_fest: ['festival', '◆'],
    team_go_rocket: ['rocket', 'R'], go_battle_league: ['battle', '△'], timed_research: ['research', '⌁'],
    go_pass: ['research', '◇'], temporada: ['season', '∞'], regional_event: ['regional', '◎'],
    city_safari: ['regional', '◎'], evento_especial: ['special', '✦'], daily_discovery: ['season', '◌'],
    halloween: ['shadow', '☾'], raid_day: ['raid', '✦'], hatch_day: ['special', '◉'],
  };

  function normalize(value) {
    return String(value || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function stateEvents() {
    try {
      if (typeof state !== 'undefined' && Array.isArray(state?.events) && state.events.length) return state.events;
    } catch (_) {}
    return eventsCache;
  }

  async function primeEvents() {
    if (stateEvents().length) return;
    try {
      const response = await fetch('data/events.json', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      eventsCache = (data.events || []).filter((event) => event.status === 'published');
    } catch (_) {}
  }

  function textForEvent(event) {
    return normalize([
      event?.title,
      event?.summary,
      ...(event?.tags || []),
      ...(event?.pokemon || []).map((item) => item?.name),
    ].filter(Boolean).join(' '));
  }

  function primaryPokemon(event) {
    const text = textForEvent(event);
    for (const [key, id, label] of POKEMON) {
      if (text.includes(normalize(key))) return { id, label, url: `${SOURCE_BASE}/${id}.png` };
    }
    return null;
  }

  function toneFor(event) { return CATEGORY[event?.category] || ['special', '✦']; }
  function eventById(id) { return id ? stateEvents().find((event) => String(event.id) === String(id)) || null : null; }
  function eventByTitle(title) {
    const key = normalize(title);
    if (!key) return null;
    return stateEvents().find((event) => normalize(event.title) === key)
      || stateEvents().find((event) => key.includes(normalize(event.title)) || normalize(event.title).includes(key))
      || null;
  }

  function eventFor(container) {
    const direct = container?.dataset?.v22Event
      || container?.dataset?.weeklyEvent
      || container?.dataset?.eventId
      || container?.querySelector?.('[data-event-id]')?.dataset?.eventId
      || container?.querySelector?.('[data-weekly-event]')?.dataset?.weeklyEvent
      || container?.querySelector?.('[data-v22-event]')?.dataset?.v22Event;
    if (direct) { const found = eventById(direct); if (found) return found; }
    const title = container?.querySelector?.('h2,h3,.experience-mini-copy strong,.weekly-item-copy strong,.v22-event-copy strong')?.textContent;
    return eventByTitle(title);
  }

  function roleFor(container) {
    if (container?.id === 'eventDetail' || container?.classList?.contains('experience-feature')) return 'hero';
    if (container?.classList?.contains('event-card')) return 'card';
    if (container?.classList?.contains('weekly-item')) return 'weekly';
    return 'thumb';
  }

  function badImage(img, event, role) {
    if (window.isSpideyApprovedImage?.(img?.currentSrc || img?.src)) return false;
    if (!img) return true;
    const src = String(img.currentSrc || img.src || '');
    if (!src) return true;
    if (PREMIUM_ART.test(src)) return false;
    if (img.hidden || img.classList.contains('v23-hidden-art')) return true;
    if (BAD_PUBLIC_ART.test(src)) return true;
    if (/festival[- ]das[- ]luzes|festival of lights/i.test(`${src} ${event?.title || ''}`)) return true;
    if (!img.complete) return false;
    if (!img.naturalWidth || !img.naturalHeight) return true;
    const min = role === 'hero' ? 760 : role === 'card' ? 560 : 360;
    return Math.max(img.naturalWidth, img.naturalHeight) < min;
  }

  function coverNode(event, role) {
    const [tone, mark] = toneFor(event);
    const pokemon = primaryPokemon(event);
    const node = document.createElement('div');
    node.className = `spidey-cover-art spidey-cover-art--${role} tone-${tone}`;
    node.dataset.coverageEvent = event?.id || normalize(event?.title);
    node.setAttribute('role', 'img');
    node.setAttribute('aria-label', `Arte de ${event?.title || 'evento Pokémon GO'}`);
    node.innerHTML = `<span class="spidey-cover-orbit" aria-hidden="true"></span><span class="spidey-cover-mark" aria-hidden="true">${mark}</span><span class="spidey-cover-brand" aria-hidden="true">SPIDEY</span>${pokemon ? `<img class="spidey-cover-pokemon" src="${pokemon.url}" alt="" loading="lazy" decoding="async">` : '<span class="spidey-cover-emblem" aria-hidden="true">◈</span>'}`;
    node.querySelector('.spidey-cover-pokemon')?.addEventListener('error', (e) => {
      e.currentTarget.remove();
      if (!node.querySelector('.spidey-cover-emblem')) {
        const emblem = document.createElement('span');
        emblem.className = 'spidey-cover-emblem';
        emblem.setAttribute('aria-hidden', 'true');
        emblem.textContent = '◈';
        node.appendChild(emblem);
      }
    });
    return node;
  }

  function insertionPoint(container) {
    if (container.id === 'eventDetail') return { parent: container, before: container.querySelector('.detail-body') };
    if (container.classList.contains('experience-feature')) {
      const wrap = container.querySelector('.experience-feature-art-wrap');
      return { parent: wrap || container, before: wrap?.firstChild || container.firstChild };
    }
    if (container.matches('[data-v22-event]')) {
      const main = container.querySelector('.v22-event-main');
      return { parent: main || container, before: main?.querySelector('.v22-event-copy') || null };
    }
    const copy = container.querySelector('.weekly-item-copy,.experience-mini-copy');
    return { parent: container, before: copy || container.firstChild };
  }

  function removeNoArtState(container) {
    container.classList.remove('v23-no-art');
    if (container.id === 'eventDetail') container.classList.remove('v23-no-hero');
    container.closest?.('.experience-feature')?.classList.remove('v23-no-art');
  }

  function ensureCover(container, event, role) {
    if (!container || !event) return null;
    const existing = container.querySelector(':scope > .spidey-cover-art, .experience-feature-art-wrap > .spidey-cover-art, .v22-event-main > .spidey-cover-art');
    if (existing?.dataset.coverageEvent === String(event.id || normalize(event.title))) { removeNoArtState(container); return existing; }
    existing?.remove();
    const cover = coverNode(event, role);
    const point = insertionPoint(container);
    if (!point.parent) return null;
    point.parent.insertBefore(cover, point.before || null);
    removeNoArtState(container);
    return cover;
  }

  function removeCover(container) { container?.querySelectorAll?.('.spidey-cover-art').forEach((node) => node.remove()); }

  function decorateContainer(container) {
    if (container?.dataset?.weeklyArtOwner === 'canonical') {
      removeCover(container);
      return;
    }
    // A day agenda lists several events and does not own an event poster.
    if (container?.id === 'eventDetail' && (container.querySelector('.v24-day-sheet') || container.querySelector('.space-detail'))) {
      removeCover(container);
      return;
    }
    const event = eventFor(container);
    if (!event) return;
    const role = roleFor(container);
    const image = container.querySelector('img:not(.spidey-cover-pokemon)');
    const decide = () => {
      if (image && !badImage(image, event, role)) {
        if (image.hidden !== false) image.hidden = false;
        image.classList.remove('v23-hidden-art');
        delete image.dataset.v23ArtReason;
        removeCover(container);
        removeNoArtState(container);
        return;
      }
      if (image) { if (image.hidden !== true) image.hidden = true; image.classList.add('v23-hidden-art'); }
      ensureCover(container, event, role);
    };
    if (image && !image.complete && !BAD_PUBLIC_ART.test(String(image.src || '')) && !PREMIUM_ART.test(String(image.src || ''))) {
      if (image.dataset.coverageProbe !== '1') {
        image.dataset.coverageProbe = '1';
        image.addEventListener('load', decide, { once: true });
        image.addEventListener('error', decide, { once: true });
      }
      return;
    }
    decide();
  }

  function decorate(root = document) {
    root.querySelectorAll?.('[data-v22-event],.event-card,.weekly-item,.experience-mini,.experience-feature').forEach(decorateContainer);
    const detail = document.querySelector('#eventDetail');
    if (detail?.querySelector('h2')) decorateContainer(detail);
    document.documentElement.dataset.spideyArtCoverage = VERSION;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; decorate(); });
  }

  async function init() {
    await primeEvents();
    decorate();
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length || m.type === 'characterData' || (m.type === 'attributes' && ['src', 'hidden'].includes(m.attributeName)))) schedule();
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['src', 'hidden'] });
    window.addEventListener('spideythemechange', schedule);
    window.SpideyArtCoverage = {
      version: VERSION,
      refresh: schedule,
      primaryPokemon,
      create: coverNode,
      coverageFor(event) {
        return {
          event_id: event?.id,
          tier: window.SPIDEY_PREMIUM_EVENT_ART?.[event?.id] ? 'premium' : event?.art?.url && !BAD_PUBLIC_ART.test(event.art.url) ? 'curated' : 'coverage',
          pokemon: primaryPokemon(event)?.label || null,
        };
      },
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
