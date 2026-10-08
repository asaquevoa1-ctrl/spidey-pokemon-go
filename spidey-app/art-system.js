const SPIDEY_ART_LIMITS = {
  thumb: { minWidth: 480, minHeight: 600 },
  card: { minWidth: 720, minHeight: 900 },
  weekly: { minWidth: 720, minHeight: 900 },
  hero: { minWidth: 800, minHeight: 1200 },
  poster: { minWidth: 800, minHeight: 1200 },
};

const SPIDEY_ART_ROLE_ORDER = {
  thumb: ['thumb', 'card', 'hero', 'poster'],
  card: ['card', 'thumb', 'hero', 'poster'],
  weekly: ['card', 'thumb', 'hero', 'poster'],
  hero: ['hero', 'poster', 'card'],
  poster: ['poster', 'hero'],
};

const SPIDEY_CATEGORY_LABELS = {
  spotlight_hour: 'Hora do Holofote',
  raid_hour: 'Hora de Reides',
  raid_rotation: 'Reides',
  mega_raid_rotation: 'Megarreides',
  shadow_raids: 'Reides Sombrosas',
  max_monday: 'Segunda Max',
  max_battle_day: 'Dia de Batalhas Max',
  community_day: 'Dia Comunitário',
  go_battle_league: 'Liga de Batalha GO',
  team_go_rocket: 'Equipe GO Rocket',
  raid_day: 'Dia de Reides',
  halloween: 'Halloween',
  city_safari: 'City Safari',
  go_pass: 'GO Pass',
  temporada: 'Temporada',
  hatch_day: 'Dia de Chocar',
  evento_especial: 'Evento Especial',
  regional_event: 'Evento Regional',
  daily_discovery: 'Descoberta Diária',
  go_fest: 'GO Fest',
  timed_research: 'Pesquisa Temporária',
};

function spideyNormalizeArtAsset(raw, art, sourceRole = 'legacy') {
  if (!raw) return null;
  if (typeof raw === 'string') {
    return {
      url: raw,
      width: Number(art?.[`${sourceRole}_width`] || art?.web_width || art?.width || 0),
      height: Number(art?.[`${sourceRole}_height`] || art?.web_height || art?.height || 0),
      sha256: art?.[`${sourceRole}_sha256`] || art?.web_sha256 || art?.sha256 || '',
      sourceRole,
    };
  }
  if (typeof raw !== 'object') return null;
  return {
    url: raw.url || raw.src || '',
    width: Number(raw.width || 0),
    height: Number(raw.height || 0),
    sha256: raw.sha256 || raw.web_sha256 || '',
    sourceRole,
  };
}

function spideyLegacyArtAsset(event) {
  const art = event?.art || {};
  if (!art.url) return null;
  return {
    url: art.url,
    width: Number(art.web_width || art.width || 0),
    height: Number(art.web_height || art.height || 0),
    sha256: art.web_sha256 || art.sha256 || '',
    sourceRole: 'legacy',
  };
}

function spideyGeneratedArtId(event) {
  return String(event?.id || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'evento';
}

function spideyGeneratedArtAsset(event) {
  if (!event?.id) return null;
  return {
    url: `assets/events/generated/${spideyGeneratedArtId(event)}.svg`,
    width: 1080,
    height: 1620,
    sha256: '',
    sourceRole: 'generated_vector',
  };
}

function spideyArtIsLogo(url) {
  return /spidey-logo-oficial/i.test(String(url || ''));
}

function spideyArtUsable(asset, role) {
  if (!asset?.url) return false;
  const url = String(asset.url).trim();
  if (!url || /^data:/i.test(url) || /\.b64(?:$|\?)/i.test(url) || spideyArtIsLogo(url)) return false;
  const limits = SPIDEY_ART_LIMITS[role] || SPIDEY_ART_LIMITS.card;
  const width = Number(asset.width || 0);
  const height = Number(asset.height || 0);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < limits.minWidth || height < limits.minHeight) return false;
  if ((role === 'hero' || role === 'poster') && height <= width) return false;
  return true;
}

function spideyResolveEventArt(event, role = 'card') {
  const official = event?.official_media;
  if (!window.SPIDEY_APPROVED_ART_MASTER?.[event?.id] && official?.classification === 'official_illustration'
      && /^assets\/events\/official\//.test(official.file || '') && /^[a-f0-9]{64}$/.test(official.sha256 || '')
      && official.width >= 360 && official.height >= 360) {
    return {url: official.file, width: official.width, height: official.height, sha256: official.sha256, sourceRole: 'official_illustration'};
  }
  const art = event?.art || {};
  const assets = art.assets || {};
  const roles = SPIDEY_ART_ROLE_ORDER[role] || SPIDEY_ART_ROLE_ORDER.card;
  const seen = new Set();
  const candidates = [];

  for (const candidateRole of roles) {
    const nested = spideyNormalizeArtAsset(assets[candidateRole], art, candidateRole);
    const direct = spideyNormalizeArtAsset(art[candidateRole], art, candidateRole);
    if (nested) candidates.push(nested);
    if (direct) candidates.push(direct);
  }

  const legacy = spideyLegacyArtAsset(event);
  if (legacy) candidates.push(legacy);

  const generated = spideyGeneratedArtAsset(event);
  if (generated) candidates.push(generated);

  for (const candidate of candidates) {
    const key = `${candidate.url}|${candidate.width}|${candidate.height}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (spideyArtUsable(candidate, role)) return candidate;
  }
  return null;
}

function spideyVersionedArtUrl(asset) {
  if (!asset?.url) return '';
  if (!String(asset.url).startsWith('assets/') || !asset.sha256) return asset.url;
  const joiner = String(asset.url).includes('?') ? '&' : '?';
  return `${asset.url}${joiner}v=${String(asset.sha256).slice(0, 12)}`;
}

function spideyCategoryLabel(event) {
  return SPIDEY_CATEGORY_LABELS[event?.category] || (event?.category || 'Evento').replace(/_/g, ' ');
}

function spideyFallbackNode(event, role = 'card') {
  const wrapper = document.createElement('div');
  wrapper.className = `spidey-event-art spidey-event-art--${role}`;
  wrapper.dataset.eventId = event?.id || '';
  const range = typeof formatRange === 'function' ? formatRange(event) : '';
  wrapper.innerHTML = `
    <span class="spidey-art-kicker">SPIDEY • ${spideyCategoryLabel(event)}</span>
    <strong class="spidey-art-title"></strong>
    <span class="spidey-art-range"></span>
    <span class="spidey-art-status">Arte específica em preparação</span>`;
  wrapper.querySelector('.spidey-art-title').textContent = event?.title || 'Evento Pokémon GO';
  wrapper.querySelector('.spidey-art-range').textContent = range;
  return wrapper;
}

function spideyApplyImageAsset(image, event, role) {
  const asset = spideyResolveEventArt(event, role);
  if (!asset) {
    image.replaceWith(spideyFallbackNode(event, role));
    return;
  }
  image.removeAttribute('onerror');
  image.src = spideyVersionedArtUrl(asset);
  image.alt = event?.art?.alt || event?.title || 'Arte do evento';
  image.dataset.artSource = asset.sourceRole || 'unknown';
  image.onerror = () => {
    if (image.isConnected) image.replaceWith(spideyFallbackNode(event, role));
  };
}

const spideyBaseRenderEvents = renderEvents;
renderEvents = function renderEventsWithPremiumArt(events = state.events) {
  spideyBaseRenderEvents(events);
  const sorted = [...events].sort((a, b) => (getBrazilRange(a).start?.getTime() || Number.MAX_SAFE_INTEGER) - (getBrazilRange(b).start?.getTime() || Number.MAX_SAFE_INTEGER));
  const cards = [...eventList.querySelectorAll('.event-card')];
  cards.forEach((card, index) => {
    const event = sorted[index];
    const image = card.querySelector('.event-thumb');
    if (event && image) spideyApplyImageAsset(image, event, 'thumb');
  });
};

const spideyBaseOpenEvent = openEvent;
openEvent = function openEventWithPremiumArt(event) {
  spideyBaseOpenEvent(event);
  const image = detail.querySelector('.detail-hero');
  if (image) spideyApplyImageAsset(image, event, 'hero');
  if (image && !window.SPIDEY_APPROVED_ART_MASTER?.[event.id] && event.official_media?.classification === 'official_illustration') image.classList.add('official-illustration');
};

const spideyArtObserver = new MutationObserver(() => {
  if (!state?.events?.length) return;
  const cards = [...eventList.querySelectorAll('.event-card')];
  if (!cards.length) return;
  const visibleTitles = cards.map((card) => card.querySelector('h3')?.textContent || '');
  cards.forEach((card, index) => {
    const image = card.querySelector('.event-thumb');
    if (!image) return;
    const title = visibleTitles[index];
    const event = state.events.find((item) => item.title === title);
    if (event) spideyApplyImageAsset(image, event, 'thumb');
  });
});

spideyArtObserver.observe(eventList, { childList: true, subtree: true });

window.SpideyArt = {
  resolve: spideyResolveEventArt,
  usable: spideyArtUsable,
  generated: spideyGeneratedArtAsset,
  limits: SPIDEY_ART_LIMITS,
};
