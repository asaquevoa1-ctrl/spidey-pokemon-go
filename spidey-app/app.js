const state = {
  events: [],
  month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  deferredInstall: null,
};

const $ = (selector) => document.querySelector(selector);
const calendar = $('#calendar');
const eventList = $('#eventList');
const dialog = $('#eventDialog');
const detail = $('#eventDetail');
const toast = $('#toast');

const MONTHS = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const DATE_SHORT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const DATE_TIME = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function parseDate(value) {
  return value ? new Date(value) : null;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function getBrazilRange(event) {
  return {
    start: parseDate(event.schedule?.start_brazil || event.schedule?.start_local),
    end: parseDate(event.schedule?.end_brazil || event.schedule?.end_local),
  };
}

function overlapsDay(event, day) {
  const { start, end } = getBrazilRange(event);
  if (!start || !end) return false;
  return start <= endOfDay(day) && end >= startOfDay(day);
}

function formatRange(event) {
  const { start, end } = getBrazilRange(event);
  if (!start || !end) return 'Horário a confirmar';
  return `${DATE_TIME.format(start)} → ${DATE_TIME.format(end)}`;
}

function eventImage(event) {
  return event.art?.url || 'assets/spidey-logo-oficial.jpg';
}

function renderStats() {
  const now = new Date();
  const monthStart = new Date(state.month.getFullYear(), state.month.getMonth(), 1);
  const monthEnd = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 0, 23, 59, 59);
  const happening = state.events.filter((event) => {
    const { start, end } = getBrazilRange(event);
    return start && end && start <= now && end >= now;
  }).length;
  const inMonth = state.events.filter((event) => {
    const { start, end } = getBrazilRange(event);
    return start && end && start <= monthEnd && end >= monthStart;
  }).length;
  const upcoming = state.events.filter((event) => {
    const { start } = getBrazilRange(event);
    return start && start > now;
  }).length;
  $('#nowCount').textContent = happening;
  $('#monthCount').textContent = inMonth;
  $('#nextCount').textContent = upcoming;
}

function renderCalendar() {
  calendar.innerHTML = '';
  $('#monthLabel').textContent = MONTHS.format(state.month);

  const year = state.month.getFullYear();
  const month = state.month.getMonth();
  const first = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - first.getDay());
  const today = startOfDay(new Date()).getTime();

  for (let i = 0; i < 42; i += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    const events = state.events.filter((event) => overlapsDay(event, day));
    const button = document.createElement('button');
    button.className = 'calendar-day';
    if (day.getMonth() !== month) button.classList.add('outside');
    if (startOfDay(day).getTime() === today) button.classList.add('today');
    if (events.length) button.classList.add('has-event');
    button.innerHTML = `<span class="day-number">${day.getDate()}</span><span class="event-dots">${events.slice(0, 4).map(() => '<i class="event-dot"></i>').join('')}</span>`;
    button.title = events.length ? `${events.length} evento(s)` : 'Sem eventos';
    button.addEventListener('click', () => {
      if (events.length === 1) openEvent(events[0]);
      else if (events.length > 1) renderEvents(events, `Eventos de ${DATE_SHORT.format(day)}`);
      else showToast('Nenhum evento neste dia.');
    });
    calendar.appendChild(button);
  }
  renderStats();
}

function renderEvents(events = state.events) {
  const sorted = [...events].sort((a, b) => getBrazilRange(a).start - getBrazilRange(b).start);
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
      <img class="event-thumb" src="${eventImage(event)}" alt="${event.art?.alt || event.title}" onerror="this.src='assets/spidey-logo-oficial.jpg'">
      <div>
        <span class="eyebrow">${event.location_label || event.locations?.[0]?.label || 'Evento'}</span>
        <h3>${event.title}</h3>
        <div class="event-meta">${formatRange(event)}<br>${event.summary || ''}</div>
        <div class="badges">
          ${(event.tags || []).slice(0, 3).map((tag) => `<span class="badge">${tag}</span>`).join('')}
        </div>
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

function gpxFor(event) {
  const points = (event.locations || []).filter((loc) => Number.isFinite(Number(loc.latitude)) && Number.isFinite(Number(loc.longitude)));
  const name = String(event.title || 'Spidey Pokémon GO').replace(/[<>&]/g, '');
  const waypoints = points.map((loc) => `  <wpt lat="${loc.latitude}" lon="${loc.longitude}"><name>${String(loc.label || name).replace(/[<>&]/g, '')}</name></wpt>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Spidey Pokemon GO" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>${name}</name></metadata>\n${waypoints}\n</gpx>`;
}

function downloadGpx(event) {
  const gpx = gpxFor(event);
  const blob = new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = event.gpx?.filename || `${event.slug || event.id || 'spidey-evento'}.gpx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  showToast('GPX gerado.');
}

function openEvent(event) {
  const localStart = parseDate(event.schedule?.start_local);
  const localEnd = parseDate(event.schedule?.end_local);
  const brazilStart = parseDate(event.schedule?.start_brazil || event.schedule?.start_local);
  const brazilEnd = parseDate(event.schedule?.end_brazil || event.schedule?.end_local);
  const bonuses = event.bonuses || [];
  const pokemon = event.pokemon || [];
  detail.innerHTML = `
    <img class="detail-hero" src="${eventImage(event)}" alt="${event.art?.alt || event.title}" onerror="this.src='assets/spidey-logo-oficial.jpg'">
    <div class="detail-body">
      <span class="eyebrow">${event.source?.name || 'SPIDEY'}</span>
      <h2>${event.title}</h2>
      <p>${event.summary || ''}</p>
      <div class="info-grid">
        <div class="info-box"><span>Horário local</span><strong>${localStart && localEnd ? `${DATE_TIME.format(localStart)} → ${DATE_TIME.format(localEnd)}` : 'A confirmar'}</strong></div>
        <div class="info-box"><span>Brasil</span><strong>${brazilStart && brazilEnd ? `${DATE_TIME.format(brazilStart)} → ${DATE_TIME.format(brazilEnd)}` : 'A confirmar'}</strong></div>
      </div>
      <h3>Coordenadas</h3>
      ${locationRows(event)}
      <div class="action-row">
        ${event.gpx?.enabled !== false && (event.locations || []).length ? '<button id="downloadGpx" class="action-btn gold">Baixar GPX</button>' : ''}
        ${event.source?.url ? `<a class="action-btn" href="${event.source.url}" target="_blank" rel="noopener">Fonte</a>` : ''}
      </div>
      ${pokemon.length ? `<h3>Pokémon em destaque</h3><ul class="bonus-list">${pokemon.map((item) => `<li>${item.name}${item.note ? ` — ${item.note}` : ''}</li>`).join('')}</ul>` : ''}
      ${bonuses.length ? `<h3>Bônus e informações</h3><ul class="bonus-list">${bonuses.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
      ${event.notes?.length ? `<h3>Observações</h3><ul class="bonus-list">${event.notes.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
    </div>`;
  detail.querySelectorAll('.copy-coord').forEach((button) => {
    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(button.dataset.value);
      showToast('Coordenadas copiadas.');
    });
  });
  detail.querySelector('#downloadGpx')?.addEventListener('click', () => downloadGpx(event));
  dialog.showModal();
}

async function loadEvents() {
  try {
    const response = await fetch('data/events.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.events = (data.events || []).filter((event) => event.status === 'published');
    renderCalendar();
    renderEvents();
  } catch (error) {
    console.error(error);
    eventList.innerHTML = '<p class="empty">Não foi possível carregar os eventos.</p>';
    showToast('Falha ao carregar eventos.');
  }
}

async function enableNotifications() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    $('#notificationStatus').textContent = 'Este navegador não oferece notificações PWA.';
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    $('#notificationStatus').textContent = 'Notificações não autorizadas.';
    return;
  }
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification('Spidey Pokémon GO', {
    body: 'Notificações ativadas neste aparelho. O push automático será ligado ao motor do Spidey.',
    icon: 'assets/spidey-logo-oficial.jpg',
    badge: 'assets/spidey-logo-oficial.jpg',
    tag: 'spidey-notification-ready',
  });
  $('#notificationStatus').textContent = 'Permissão de notificações ativada.';
}

$('#prevMonth').addEventListener('click', () => {
  state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
  renderCalendar();
});
$('#nextMonth').addEventListener('click', () => {
  state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
  renderCalendar();
});
$('#todayButton').addEventListener('click', () => {
  const now = new Date();
  state.month = new Date(now.getFullYear(), now.getMonth(), 1);
  renderCalendar();
  const todayEvents = state.events.filter((event) => overlapsDay(event, now));
  renderEvents(todayEvents);
  document.querySelector('.event-list').scrollIntoView({ behavior: 'smooth' });
});
$('#notificationButton').addEventListener('click', enableNotifications);
$('#closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  state.deferredInstall = event;
  $('#installButton').hidden = false;
});
$('#installButton').addEventListener('click', async () => {
  if (!state.deferredInstall) return;
  state.deferredInstall.prompt();
  await state.deferredInstall.userChoice;
  state.deferredInstall = null;
  $('#installButton').hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(console.error));
}

loadEvents();
