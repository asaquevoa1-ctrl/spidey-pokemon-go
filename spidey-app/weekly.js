let spideyWeeklyData = null;
let spideyWeeklyLoading = false;

const WEEKDAY_PT = {
  monday: 'SEG',
  tuesday: 'TER',
  wednesday: 'QUA',
  thursday: 'QUI',
  friday: 'SEX',
  saturday: 'SÁB',
  sunday: 'DOM',
};

const WEEKLY_SECTION_LABELS = {
  featured: 'Eventos da semana',
  raids: 'Reides',
  max_pvp: 'Max & PvP',
  also_happening: 'Também acontecendo',
};

function weeklyDateLabel(value) {
  if (!value) return '';
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(year, month - 1, day));
}

function weeklyTimeLabel(item) {
  const value = item?.start_brazil;
  if (!value) return 'Horário a confirmar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Horário a confirmar';
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

function weeklyArtUrl(item) {
  const art = item?.weekly_art || {};
  if (art.url && !/spidey-logo/i.test(art.url) && !/^data:/i.test(art.url)) return art.url;
  return typeof generatedEventArtUrl === 'function' ? generatedEventArtUrl(item) : '';
}

function weeklyFindEvent(id) {
  return state.events.find((event) => event.id === id) || null;
}

function weeklyOpenItem(item) {
  const event = weeklyFindEvent(item?.id);
  if (event) {
    openEvent(event);
    return;
  }
  showToast('Detalhes deste item ainda não estão disponíveis no calendário.');
}

function weeklyItemCard(item, compact = false) {
  const art = weeklyArtUrl(item);
  const tags = (item.tags || []).slice(0, compact ? 1 : 2);
  return `
    <article class="weekly-item ${compact ? 'compact' : ''}" tabindex="0" data-weekly-event="${item.id || ''}">
      ${art ? `<img src="${art}" alt="${item.title || 'Evento'}" loading="lazy" onerror="this.hidden=true">` : ''}
      <div class="weekly-item-copy">
        <span class="weekly-time">${weeklyTimeLabel(item)}</span>
        <strong>${item.title || 'Evento'}</strong>
        ${!compact && item.summary ? `<p>${item.summary}</p>` : ''}
        ${tags.length ? `<div class="weekly-tags">${tags.map((tag) => `<span>${tag}</span>`).join('')}</div>` : ''}
      </div>
    </article>`;
}

function bindWeeklyItems(root) {
  root.querySelectorAll('[data-weekly-event]').forEach((node) => {
    const id = node.dataset.weeklyEvent;
    const item = [...(spideyWeeklyData?.days || []).flatMap((day) => day.items || []), ...Object.values(spideyWeeklyData?.sections || {}).flat()]
      .find((candidate) => candidate.id === id);
    if (!item) return;
    node.addEventListener('click', () => weeklyOpenItem(item));
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        weeklyOpenItem(item);
      }
    });
  });
}

function renderWeeklyDays(data) {
  const strip = document.querySelector('#weeklyDays');
  if (!strip) return;
  strip.innerHTML = (data.days || []).map((day) => {
    const items = day.items || [];
    return `
      <article class="weekly-day ${items.length ? 'has-items' : ''}">
        <div class="weekly-day-head">
          <span>${WEEKDAY_PT[day.weekday] || day.weekday || ''}</span>
          <strong>${weeklyDateLabel(day.date)}</strong>
        </div>
        <div class="weekly-day-items">
          ${items.length ? items.slice(0, 3).map((item) => weeklyItemCard(item, true)).join('') : '<span class="weekly-empty-day">Sem destaque</span>'}
        </div>
      </article>`;
  }).join('');
  bindWeeklyItems(strip);
}

function renderWeeklySections(data) {
  const root = document.querySelector('#weeklySections');
  if (!root) return;
  const sections = data.sections || {};
  const html = Object.entries(WEEKLY_SECTION_LABELS).map(([key, label]) => {
    const items = sections[key] || [];
    if (!items.length) return '';
    return `
      <section class="weekly-block">
        <div class="weekly-block-head">
          <div>
            <span class="eyebrow">SPIDEY WEEKLY</span>
            <h2>${label}</h2>
          </div>
          <span class="weekly-count">${items.length}</span>
        </div>
        <div class="weekly-grid">${items.map((item) => weeklyItemCard(item)).join('')}</div>
      </section>`;
  }).join('');
  root.innerHTML = html || '<p class="empty">Nenhum destaque semanal disponível.</p>';
  bindWeeklyItems(root);
}

function renderWeeklyStamps(data) {
  const root = document.querySelector('#weeklyStampStrip');
  if (!root) return;
  const stamps = data.stamps || [];
  if (!stamps.length) {
    root.hidden = true;
    return;
  }
  root.hidden = false;
  root.innerHTML = `
    <div class="weekly-block-head">
      <div><span class="eyebrow">STAMPS</span><h2>Rallies ativos</h2></div>
    </div>
    <div class="weekly-stamp-grid">
      ${stamps.map((stamp) => `<button class="weekly-stamp-card" data-open-stamps="1"><span>◎</span><div><strong>${stamp.title}</strong><small>${stamp.stamp_count || 0} selos</small></div></button>`).join('')}
    </div>`;
  root.querySelectorAll('[data-open-stamps]').forEach((button) => button.addEventListener('click', () => setView('stampsView')));
}

function renderWeeklyView() {
  const root = document.querySelector('#weeklyView');
  if (!root) return;
  if (!spideyWeeklyData) {
    if (!spideyWeeklyLoading) loadWeeklyData();
    return;
  }
  const data = spideyWeeklyData;
  const period = document.querySelector('#weeklyPeriod');
  if (period) period.textContent = `${weeklyDateLabel(data.week_start)} → ${weeklyDateLabel(data.week_end)}`;
  const eventCount = document.querySelector('#weeklyEventCount');
  const artCount = document.querySelector('#weeklyArtCount');
  const stampCount = document.querySelector('#weeklyStampCount');
  if (eventCount) eventCount.textContent = data.meta?.calendar_events_in_week ?? 0;
  if (artCount) artCount.textContent = data.meta?.events_with_weekly_art ?? 0;
  if (stampCount) stampCount.textContent = (data.stamps || []).length;
  renderWeeklyDays(data);
  renderWeeklySections(data);
  renderWeeklyStamps(data);
}

async function loadWeeklyData() {
  if (spideyWeeklyLoading) return;
  spideyWeeklyLoading = true;
  const status = document.querySelector('#weeklyLoadStatus');
  if (status) status.textContent = 'Carregando semana…';
  try {
    const response = await fetch('data/weekly.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`weekly HTTP ${response.status}`);
    spideyWeeklyData = await response.json();
    if (status) status.textContent = '';
    renderWeeklyView();
  } catch (error) {
    console.error(error);
    if (status) status.textContent = 'Não foi possível carregar o resumo semanal.';
  } finally {
    spideyWeeklyLoading = false;
  }
}

loadWeeklyData();
