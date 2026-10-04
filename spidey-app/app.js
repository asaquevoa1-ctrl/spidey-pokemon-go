const BRAZIL_CALENDAR_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
});

function brazilDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const parts = Object.fromEntries(BRAZIL_CALENDAR_FORMAT.formatToParts(date)
    .filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Grid dates represent the day printed on a button, rather than an instant.
function calendarDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calendarToday(reference = new Date()) {
  const [year, month, day] = brazilDateKey(reference).split('-').map(Number);
  return new Date(year, month - 1, day);
}

const initialCalendarDay = calendarToday();
const state = {
  events: [],
  stamps: [],
  month: new Date(initialCalendarDay.getFullYear(), initialCalendarDay.getMonth(), 1),
  deferredInstall: null,
};

const $ = (selector) => document.querySelector(selector);
const calendar = $('#calendar');
const eventList = $('#eventList');
const stampList = $('#stampList');
const mapSummary = $('#mapSummary');
const dialog = $('#eventDialog');
const detail = $('#eventDetail');
const toast = $('#toast');

const MONTHS = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function parseDate(value) {
  return value ? new Date(value) : null;
}

function formatDateTime(date, timeZone = 'America/Sao_Paulo') {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    hour12: false, timeZone,
  }).format(date);
}

function formatDateOnly(value) {
  if (!value) return 'A confirmar';
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day));
}

function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function endOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999); }

function getBrazilRange(event) {
  return {
    start: parseDate(event.schedule?.start_brazil || event.schedule?.start_local),
    end: parseDate(event.schedule?.end_brazil || event.schedule?.end_local),
  };
}

function overlapsDay(event, day) {
  const { start, end } = getBrazilRange(event);
  if (!start || !end) return false;
  const firstDay = brazilDateKey(start);
  const lastDay = brazilDateKey(end);
  const selectedDay = calendarDateKey(day);
  return Boolean(firstDay && lastDay && firstDay <= selectedDay && lastDay >= selectedDay);
}

function formatRange(event) {
  const { start, end } = getBrazilRange(event);
  if (!start || !end) return 'Horário a confirmar';
  const zone = event.schedule?.brazil_timezone || 'America/Sao_Paulo';
  return `${formatDateTime(start, zone)} → ${formatDateTime(end, zone)}`;
}

function generatedEventArtUrl(event) {
  const id = String(event?.id || 'evento')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'evento';
  return `assets/events/generated/${id}.svg`;
}

function eventImage(event) {
  const artUrl = String(event.art?.url || '').trim();
  const forbidden = !artUrl || /^data:/i.test(artUrl) || /spidey-logo/i.test(artUrl) || /fallback.*logo/i.test(artUrl);
  const url = forbidden ? generatedEventArtUrl(event) : artUrl;
  const version = forbidden ? '' : (event.art?.web_sha256 || event.art?.sha256);
  return url.startsWith('assets/') && version ? `${url}?v=${String(version).slice(0, 12)}` : url;
}

function validCoordinate(point) {
  const latRaw = point?.latitude;
  const lonRaw = point?.longitude;
  if (latRaw === null || latRaw === undefined || latRaw === '' || lonRaw === null || lonRaw === undefined || lonRaw === '') return false;
  const latitude = Number(latRaw);
  const longitude = Number(lonRaw);
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function exactPokestop(stop) {
  return validCoordinate(stop) && stop.coordinate_type === 'exact_pokestop' && ['confirmed', 'verified', 'official', 'community_verified'].includes(stop.coordinate_confidence);
}

function renderStats() {
  const now = new Date();
  const monthStart = calendarDateKey(new Date(state.month.getFullYear(), state.month.getMonth(), 1));
  const monthEnd = calendarDateKey(new Date(state.month.getFullYear(), state.month.getMonth() + 1, 0));
  $('#nowCount').textContent = state.events.filter((event) => {
    const { start, end } = getBrazilRange(event);
    return start && end && start <= now && end >= now;
  }).length;
  $('#monthCount').textContent = state.events.filter((event) => {
    const { start, end } = getBrazilRange(event);
    return start && end && brazilDateKey(start) <= monthEnd && brazilDateKey(end) >= monthStart;
  }).length;
  $('#nextCount').textContent = state.events.filter((event) => {
    const { start } = getBrazilRange(event);
    return start && start > now;
  }).length;
}

function renderCalendar() {
  calendar.innerHTML = '';
  $('#monthLabel').textContent = MONTHS.format(state.month);
  const year = state.month.getFullYear();
  const month = state.month.getMonth();
  const first = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - first.getDay());
  const today = calendarDateKey(calendarToday());

  for (let i = 0; i < 42; i += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    const events = state.events.filter((event) => overlapsDay(event, day));
    const button = document.createElement('button');
    button.className = 'calendar-day';
    if (day.getMonth() !== month) button.classList.add('outside');
    if (calendarDateKey(day) === today) button.classList.add('today');
    if (events.length) button.classList.add('has-event');
    button.innerHTML = `<span class="day-number">${day.getDate()}</span><span class="event-dots">${events.slice(0, 4).map(() => '<i class="event-dot"></i>').join('')}</span>`;
    button.title = events.length ? `${events.length} evento(s)` : 'Sem eventos';
    button.addEventListener('click', () => {
      if (events.length === 1) openEvent(events[0]);
      else if (events.length > 1) renderEvents(events);
      else showToast('Nenhum evento neste dia.');
    });
    calendar.appendChild(button);
  }
  renderStats();
}

function renderEvents(events = state.events) {
  const sorted = [...events].sort((a, b) => (getBrazilRange(a).start?.getTime() || Number.MAX_SAFE_INTEGER) - (getBrazilRange(b).start?.getTime() || Number.MAX_SAFE_INTEGER));
  eventList.innerHTML = '';
  if (!sorted.length) {
    eventList.innerHTML = '<p class="empty">Nenhum evento disponível.</p>';
    return;
  }
  sorted.forEach((event) => {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <img class="event-thumb" src="${eventImage(event)}" alt="${event.art?.alt || event.title}" onerror="this.onerror=null;this.src=generatedEventArtUrl(event)">
      <div>
        <span class="eyebrow">${event.location_label || event.locations?.[0]?.label || 'Evento'}</span>
        <h3>${event.title}</h3>
        <div class="event-meta">${formatRange(event)}<br>${event.summary || ''}</div>
        <div class="badges">${(event.tags || []).slice(0, 3).map((tag) => `<span class="badge">${tag}</span>`).join('')}</div>
      </div>`;
    card.addEventListener('click', () => openEvent(event));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openEvent(event); });
    eventList.appendChild(card);
  });
}

function locationRows(event) {
  const locations = event.locations || [];
  if (!locations.length) return '<p class="empty">Sem coordenadas cadastradas.</p>';
  return locations.map((loc, index) => {
    const value = `${Number(loc.latitude).toFixed(4)}, ${Number(loc.longitude).toFixed(4)}`;
    return `<div class="coordinates"><div><strong>${loc.label || `Ponto ${index + 1}`}</strong><br><code>${value}</code></div><button class="action-btn copy-coord" data-value="${value}">Copiar</button></div>`;
  }).join('');
}

function xmlSafe(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function downloadText(filename, content, type = 'application/gpx+xml;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function gpxDocument(name, points) {
  const waypoints = points.map((point) => `  <wpt lat="${point.latitude}" lon="${point.longitude}"><name>${xmlSafe(point.name)}</name></wpt>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Spidey Pokemon GO" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>${xmlSafe(name)}</name></metadata>\n${waypoints}\n</gpx>`;
}

function downloadGpx(event) {
  const points = (event.locations || []).filter(validCoordinate).map((loc) => ({ ...loc, name: loc.label || event.title }));
  downloadText(event.gpx?.filename || `${event.slug || event.id || 'spidey-evento'}.gpx`, gpxDocument(event.title, points));
  showToast('GPX gerado.');
}

function stampProgressKey(rally) { return `spidey-stamps:${rally.id}`; }
function getStampProgress(rally) {
  try { return new Set(JSON.parse(localStorage.getItem(stampProgressKey(rally)) || '[]')); }
  catch (_) { return new Set(); }
}
function saveStampProgress(rally, set) {
  try { localStorage.setItem(stampProgressKey(rally), JSON.stringify([...set])); } catch { showToast('Não foi possível salvar o progresso neste aparelho.'); }
}

function renderStampStats() {
  const rallies = state.stamps.filter((rally) => rally.status === 'published');
  const stops = rallies.flatMap((rally) => rally.stops || []);
  $('#stampRallyCount').textContent = rallies.length;
  $('#stampStopCount').textContent = stops.length;
  $('#stampReadyCount').textContent = rallies.filter(r => r.stops?.length && r.stops.every(exactPokestop)).length;
}

function renderStamps() {
  const rallies = state.stamps.filter((rally) => rally.status === 'published');
  stampList.innerHTML = '';
  if (!rallies.length) {
    stampList.innerHTML = '<p class="empty">Nenhum Stamp Rally disponível.</p>';
    renderStampStats();
    return;
  }
  rallies.forEach((rally) => {
    const progress = getStampProgress(rally);
    const stops = rally.stops || [];
    const exact = stops.filter(exactPokestop).length;
    const card = document.createElement('article');
    card.className = 'stamp-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="stamp-card-top">
        <span class="stamp-icon">◎</span>
        <div>
          <span class="eyebrow">${rally.stamp_count || stops.length} ${rally.collection_type === 'pokelids' ? 'POKÉLIDS' : 'SELOS'}</span>
          <h3>${rally.title}</h3>
        </div>
      </div>
      <p>${rally.public_summary ?? rally.summary ?? ''}</p>
      <div class="stamp-progress"><span style="width:${stops.length ? Math.min(100, (progress.size / stops.length) * 100) : 0}%"></span></div>
      <div class="stamp-meta"><strong>${progress.size}/${stops.length}</strong> ${rally.collection_type === 'pokelids' ? 'registradas' : 'carimbados'} · <strong>${rally.collection_type === 'pokelids' ? stops.filter(validCoordinate).length : exact}</strong> ${rally.collection_type === 'pokelids' ? `locais oficiais · ${rally.prefecture_count} prefeituras` : 'coordenadas exatas'}</div>
      <div class="badges">${stops.slice(0, 4).map((stop) => `<span class="badge">${stop.city}</span>`).join('')}</div>`;
    card.addEventListener('click', () => openStampRally(rally));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openStampRally(rally); });
    stampList.appendChild(card);
  });
  renderStampStats();
}

function stampCoordinateLabel(stop) {
  if (stop.coordinate_type === 'exact_pokestop' && exactPokestop(stop)) return 'PokéStop exata';
  if (stop.image_kind === 'lid_artwork' && validCoordinate(stop)) return 'Local oficial da PokéLid';
  if (stop.coordinate_type === 'venue_reference') return 'Local do evento • coordenada ainda não confirmada';
  return 'Coordenada a confirmar';
}

function stampStopHtml(rally, stop, progress) {
  const exact = exactPokestop(stop);
  const checked = progress.has(stop.id);
  const value = validCoordinate(stop) ? `${Number(stop.latitude).toFixed(6)}, ${Number(stop.longitude).toFixed(6)}` : '';
  return `
    <article class="stamp-stop ${exact ? 'is-exact' : 'needs-coordinate'}">
      <div class="stamp-stop-head">
        <div>
          <span class="eyebrow">SELO ${stop.stamp_number || ''}</span>
          <h3>${stop.city} · ${stop.country}</h3>
        </div>
        <label class="stamp-check"><input type="checkbox" class="stamp-toggle" data-stop-id="${stop.id}" ${checked ? 'checked' : ''}> Carimbado</label>
      </div>
      <p><strong>${stop.venue || 'Local a confirmar'}</strong></p>
      <p class="microcopy">${formatDateOnly(stop.available_from)} → ${formatDateOnly(stop.available_until)}</p>
      <div class="coordinate-state ${exact ? 'confirmed' : 'pending'}">${stampCoordinateLabel(stop)}</div>
      ${value ? `<div class="coordinates"><code>${value}</code><button class="action-btn copy-stamp-coord" data-value="${value}">Copiar</button></div>` : '<p class="microcopy">Sem latitude/longitude confirmada. GPX bloqueado para evitar ponto falso.</p>'}
      ${exact && stop.gpx_enabled !== false ? `<button class="action-btn gold download-stop-gpx" data-stop-id="${stop.id}">Baixar GPX desta Stop</button>` : ''}
    </article>`;
}

function openStampRally(rally) {
  beginAppDialog();
  const stops = rally.stops || [];
  const progress = getStampProgress(rally);
  const exactStops = stops.filter(exactPokestop);
  const fullGpx = exactStops.length === stops.length && stops.length > 0;
  detail.innerHTML = `
    <div class="detail-body stamp-detail">
      <span class="eyebrow">GO STAMP RALLY</span>
      <h2>${rally.title}</h2>
      <p>${rally.public_summary ?? rally.summary ?? ''}</p>
      <div class="info-grid">
        <div class="info-box"><span>Progresso</span><strong id="rallyProgressText">${progress.size}/${stops.length} selos</strong></div>
        <div class="info-box"><span>GPX confirmado</span><strong>${exactStops.length}/${stops.length} Stops</strong></div>
      </div>
      <div class="action-row">
        ${fullGpx ? '<button id="downloadRallyGpx" class="action-btn gold">Baixar GPX completo</button>' : ''}
        ${rally.source?.url ? `<a class="action-btn" href="${rally.source.url}" target="_blank" rel="noopener">Fonte oficial</a>` : ''}
      </div>
      ${!fullGpx ? '<p class="microcopy">GPX completo fica bloqueado até todas as PokéStops terem coordenadas exatas confirmadas.</p>' : ''}
      <div class="stamp-stops">${stops.map((stop) => stampStopHtml(rally, stop, progress)).join('')}</div>
      ${(rally.rewards || []).length ? `<h3>Recompensas</h3><ul class="bonus-list">${rally.rewards.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
      ${(rally.public_notes ?? rally.notes ?? []).length ? `<h3>Observações</h3><ul class="bonus-list">${(rally.public_notes ?? rally.notes ?? []).map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
    </div>`;

  detail.querySelectorAll('.stamp-toggle').forEach((input) => {
    input.addEventListener('change', () => {
      const current = getStampProgress(rally);
      if (input.checked) current.add(input.dataset.stopId); else current.delete(input.dataset.stopId);
      saveStampProgress(rally, current);
      $('#rallyProgressText').textContent = `${current.size}/${stops.length} selos`;
      renderStamps();
    });
  });
  detail.querySelectorAll('.copy-stamp-coord').forEach((button) => {
    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(button.dataset.value);
      showToast('Coordenada da Poképarada copiada.');
    });
  });
  detail.querySelectorAll('.download-stop-gpx').forEach((button) => {
    button.addEventListener('click', () => {
      const stop = stops.find((item) => item.id === button.dataset.stopId);
      if (!stop || !exactPokestop(stop)) return;
      downloadText(`${rally.slug}-${stop.city.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.gpx`, gpxDocument(`${rally.title} - ${stop.city}`, [{ ...stop, name: stop.venue || stop.city }]));
      showToast('Rota da Poképarada baixada.');
    });
  });
  detail.querySelector('#downloadRallyGpx')?.addEventListener('click', () => {
    if (!fullGpx) return;
    downloadText(`${rally.slug}.gpx`, gpxDocument(rally.title, exactStops.map((stop) => ({ ...stop, name: `${stop.city} - ${stop.venue}` }))));
    showToast('Rota completa baixada.');
  });
  showAppDialog();
}

function renderMapSummary() {
  const exact = state.stamps.flatMap((rally) => (rally.stops || []).map((stop) => ({ rally, stop }))).filter(({ stop }) => exactPokestop(stop));
  if (!exact.length) {
    mapSummary.innerHTML = '<span class="eyebrow">SEM PONTOS FALSOS</span><h2>Mapa aguardando coordenadas exatas</h2><p>A estrutura está pronta, mas nenhuma local será convertida em PokéStop por aproximação. Quando uma Stop for confirmada, ela aparecerá aqui.</p>';
    return;
  }
  mapSummary.innerHTML = `<span class="eyebrow">COORDENADAS CONFIRMADAS</span><h2>${exact.length} Poképaradas no mapa</h2><div class="map-point-list">${exact.map(({ rally, stop }) => `<div class="coordinates"><div><strong>${stop.city} · ${rally.title}</strong><br><code>${Number(stop.latitude).toFixed(6)}, ${Number(stop.longitude).toFixed(6)}</code></div><button class="action-btn copy-map-coord" data-value="${Number(stop.latitude).toFixed(6)}, ${Number(stop.longitude).toFixed(6)}">Copiar</button></div>`).join('')}</div>`;
  mapSummary.querySelectorAll('.copy-map-coord').forEach((button) => button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(button.dataset.value);
    showToast('Coordenada copiada.');
  }));
}

function openEvent(event) {
  if (!event) return;
  beginAppDialog();
  const localStart = parseDate(event.schedule?.start_local);
  const localEnd = parseDate(event.schedule?.end_local);
  const brazilStart = parseDate(event.schedule?.start_brazil || event.schedule?.start_local);
  const brazilEnd = parseDate(event.schedule?.end_brazil || event.schedule?.end_local);
  const localZone = event.schedule?.local_timezone || 'UTC';
  const brazilZone = event.schedule?.brazil_timezone || 'America/Sao_Paulo';
  const bonuses = event.bonuses || [];
  const pokemon = event.pokemon || [];
  detail.innerHTML = `
    <img class="detail-hero" src="${eventImage(event)}" alt="${event.art?.alt || event.title}" onerror="this.onerror=null;this.src=generatedEventArtUrl(event)">
    <div class="detail-body">
      <span class="eyebrow">${event.source?.name || 'SPIDEY'}</span>
      <h2>${event.public_title || event.title}</h2><p>${event.public_summary || event.summary || ''}</p>
      <div class="info-grid">
        <div class="info-box"><span>Horário local</span><strong>${localStart && localEnd ? `${formatDateTime(localStart, localZone)} → ${formatDateTime(localEnd, localZone)}` : 'A confirmar'}</strong></div>
        <div class="info-box"><span>Brasil</span><strong>${brazilStart && brazilEnd ? `${formatDateTime(brazilStart, brazilZone)} → ${formatDateTime(brazilEnd, brazilZone)}` : 'A confirmar'}</strong></div>
      </div>
      <h3>Coordenadas</h3>${locationRows(event)}
      <div class="action-row">
        ${event.gpx?.enabled !== false && (event.locations || []).length ? '<button id="downloadGpx" class="action-btn gold">Baixar GPX</button>' : ''}
        ${event.source?.url ? `<a class="action-btn" href="${event.source.url}" target="_blank" rel="noopener">Fonte</a>` : ''}
      </div>
      ${pokemon.length ? `<h3>Pokémon em destaque</h3><ul class="bonus-list">${pokemon.map((item) => `<li>${item.name}${item.note ? ` — ${item.note}` : ''}</li>`).join('')}</ul>` : ''}
      ${bonuses.length ? `<h3>Bônus e informações</h3><ul class="bonus-list">${bonuses.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
      ${event.notes?.length ? `<h3>Observações</h3><ul class="bonus-list">${event.notes.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
    </div>`;
  detail.querySelectorAll('.copy-coord').forEach((button) => button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(button.dataset.value);
    showToast('Coordenadas copiadas.');
  }));
  detail.querySelector('#downloadGpx')?.addEventListener('click', () => downloadGpx(event));
  showAppDialog();
}

function setView(viewId) {
  window.SpideyNavigation?.trackView(viewId);
  document.querySelectorAll('.app-view').forEach((view) => { view.hidden = view.id !== viewId; });
  document.querySelectorAll('.app-tab').forEach((tab) => {
    const active = tab.dataset.view === viewId;
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
  });
  if (viewId === 'weeklyView' && typeof renderWeeklyView === 'function') renderWeeklyView();
  if (viewId === 'stampsView') renderStamps();
  if (viewId === 'mapView') {
    if (typeof renderMapV2 === 'function') renderMapV2();
    else renderMapSummary();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

let contentLoading = null;
let catalogFingerprint = '';
let lastContentCheck = 0;
function beginAppDialog() { window.SpideyNavigation?.beginDialog(); }
function showAppDialog() {
  if (window.SpideyNavigation) window.SpideyNavigation.openDialog();
  else if (!dialog.open) dialog.showModal();
}
async function loadContent({ refresh = false } = {}) {
  if (contentLoading) return contentLoading;
  contentLoading = (async () => {
    try {
      const [eventsData, stampsData] = await Promise.all([
        window.SpideyCatalog.load('events'), window.SpideyCatalog.load('stamps'),
      ]);
      const events = eventsData.events.filter(event => event.status === 'published');
      const stamps = stampsData.rallies.filter(rally => rally.status === 'published');
      const fingerprint = JSON.stringify([events, stamps]);
      lastContentCheck = Date.now();
      const status = document.getElementById('calendarUpdateStatus');
      if (status) status.textContent = 'Agenda em dia. As novidades aparecem aqui automaticamente.';
      window.dispatchEvent(new Event('spideycatalogchecked'));
      if (fingerprint === catalogFingerprint) return;
      catalogFingerprint = fingerprint;
      state.events = events; state.stamps = stamps;
      renderCalendar(); renderEvents(); renderStamps();
      if (typeof renderWeeklyView === 'function') renderWeeklyView();
      if (typeof renderMapV2 === 'function') renderMapV2(); else renderMapSummary();
      window.dispatchEvent(new Event('spideycontentready'));
      if (refresh) window.dispatchEvent(new Event('spideycatalogupdated'));
    } catch (error) {
      console.error('Spidey agenda indisponível');
      const status = document.getElementById('calendarUpdateStatus');
      if (status) status.textContent = state.events.length ? 'Mostrando a última agenda salva. Tentaremos atualizar quando houver conexão.' : 'Não foi possível atualizar a agenda. Tente novamente quando estiver online.';
      if (!state.events.length) {
        eventList.innerHTML = '<p class="empty">Não foi possível carregar os eventos.</p>';
        if (stampList) stampList.innerHTML = '<p class="empty">Não foi possível carregar os selos.</p>';
      }
    }
  })().finally(() => { contentLoading = null; });
  return contentLoading;
}
function refreshContent() {
  if (Date.now() - lastContentCheck >= 60000) loadContent({ refresh: true });
}
setInterval(() => { if (document.visibilityState === 'visible') refreshContent(); }, 15 * 60000);
window.addEventListener('online', refreshContent);
window.addEventListener('focus', refreshContent);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshContent(); });

async function enableNotifications() {
  if (window.SpideyPush?.subscribeRemotePush) return window.SpideyPush.subscribeRemotePush();
  $('#notificationStatus').textContent = 'Notificações indisponíveis no momento.';
}

$('#prevMonth').addEventListener('click', () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); renderCalendar(); });
$('#nextMonth').addEventListener('click', () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); renderCalendar(); });
$('#todayButton').addEventListener('click', () => {
  const now = calendarToday();
  state.month = new Date(now.getFullYear(), now.getMonth(), 1);
  renderCalendar();
  renderEvents(state.events.filter((event) => overlapsDay(event, now)));
  document.querySelector('.event-list').scrollIntoView({ behavior: 'smooth' });
});
$('#notificationButton').addEventListener('click', enableNotifications);
$('#closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
document.querySelectorAll('.app-tab').forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));

function installedAsApp() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}
function showInstallGuide() {
  beginAppDialog();
  detail.innerHTML = `<div class="detail-body"><span class="eyebrow">SPIDEY NO SEU CELULAR</span><h2>Instalar o Spidey</h2><p>Use o ícone na tela inicial para abrir o app.</p><h3>Android · Chrome</h3><ol class="bonus-list"><li>Abra este site no Chrome, fora do navegador interno do WhatsApp ou ChatGPT.</li><li>Toque no menu de três pontos (⋮).</li><li>Escolha <strong>Instalar e criar atalho</strong> e depois <strong>Instalar</strong>.</li><li>Confirme e abra o Spidey pelo novo ícone.</li></ol><p>Dependendo da versão do navegador, a opção pode se chamar “Instalar app” ou “Adicionar à tela inicial”.</p><h3>iPhone · Safari</h3><p>Abra o site no Safari. Toque em Compartilhar e em Adicionar à Tela de Início.</p><p class="microcopy">Para receber avisos, toque em Ativar alertas e permita as notificações. No iPhone, abra o Spidey pelo ícone instalado. Seu progresso de selos fica salvo neste aparelho e navegador.</p></div>`;
  showAppDialog();
}
const installButton = $('#installButton');
installButton.hidden = installedAsApp();
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  state.deferredInstall = event;
  installButton.hidden = installedAsApp();
});
installButton.addEventListener('click', async () => {
  if (!state.deferredInstall) { showInstallGuide(); return; }
  const prompt = state.deferredInstall;
  state.deferredInstall = null;
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    installButton.hidden = choice.outcome === 'accepted' || installedAsApp();
  } catch (_) { showInstallGuide(); }
});
window.addEventListener('appinstalled', () => {
  state.deferredInstall = null;
  installButton.hidden = true;
});

if ('serviceWorker' in navigator) window.addEventListener('load', async () => { try { const reg = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }); await reg.update(); } catch (error) { console.error(error); } });
loadContent();
