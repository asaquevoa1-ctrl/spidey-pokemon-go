(() => {
  'use strict';

  const VERSION = 'spidey-app-v2.2-20260929.1';
  const MONTHS = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
  const GROUPS = [
    { id: 'raids', label: 'Reides', hint: 'Rotações e Sombrosas', categories: ['raid_rotation', 'shadow_raids'] },
    { id: 'raid-hour', label: 'Hora de Reides', hint: 'Quarta-feira', categories: ['raid_hour'] },
    { id: 'mega', label: 'Mega-Reides', hint: 'Rotações Mega', categories: ['mega_raid_rotation'] },
    { id: 'max', label: 'Segunda Max', hint: 'Max Battles', categories: ['max_monday'] },
    { id: 'spotlight', label: 'Holofote', hint: 'Pokémon + bônus', categories: ['spotlight_hour'] },
    { id: 'events', label: 'Eventos', hint: 'Destaques do mês', categories: ['community_day','max_battle_day','evento_especial','regional_event','go_fest','timed_research'] },
  ];

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function rangeOf(event) {
    if (typeof getBrazilRange === 'function') return getBrazilRange(event);
    const startRaw = event?.schedule?.start_brazil || event?.schedule?.start_local;
    const endRaw = event?.schedule?.end_brazil || event?.schedule?.end_local;
    return {
      start: startRaw ? new Date(startRaw) : null,
      end: endRaw ? new Date(endRaw) : null,
    };
  }

  function targetMonth() {
    if (window.state?.month instanceof Date && !Number.isNaN(state.month.getTime())) {
      return new Date(state.month.getFullYear(), state.month.getMonth(), 1);
    }
    const now = new Date();
    const offset = now.getDate() >= 25 ? 1 : 0;
    return new Date(now.getFullYear(), now.getMonth() + offset, 1);
  }

  function monthBounds(month) {
    return {
      start: new Date(month.getFullYear(), month.getMonth(), 1),
      end: new Date(month.getFullYear(), month.getMonth() + 1, 1),
    };
  }

  function monthTitle(month) {
    const raw = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(month);
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function dateParts(date) {
    return { day: date.getDate(), month: MONTHS[date.getMonth()] };
  }

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function dateBadge(event) {
    const { start, end } = rangeOf(event);
    if (!start) return { top: '—', bottom: '', range: false };
    const a = dateParts(start);
    if (!end || sameDay(start, end)) return { top: String(a.day), bottom: a.month, range: false };
    const inclusiveEnd = new Date(end.getTime());
    if (inclusiveEnd.getHours() === 0 && inclusiveEnd.getMinutes() === 0) inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);
    const b = dateParts(inclusiveEnd);
    return { top: `${a.day} ${a.month}`, bottom: `${b.day} ${b.month}`, range: true };
  }

  function artUrl(event) {
    try {
      if (typeof spideyResolveEventArt === 'function') {
        const asset = spideyResolveEventArt(event, 'thumb');
        const url = asset?.url || '';
        if (!url || /generated|vector|fallback|placeholder/i.test(url)) return '';
        return typeof spideyVersionedArtUrl === 'function' ? spideyVersionedArtUrl(asset) : url;
      }
    } catch (_) {}
    const direct = event?.art?.url || '';
    return /generated|vector|fallback|placeholder/i.test(direct) ? '' : direct;
  }

  function bonusLine(event) {
    const items = Array.isArray(event?.bonuses) ? event.bonuses : [];
    const first = items.find((item) => typeof item === 'string' && item.trim());
    if (first) return first;
    if (event?.category === 'spotlight_hour' && event?.summary) return event.summary;
    return '';
  }

  function visibleEventsFor(month) {
    const events = Array.isArray(window.state?.events) ? state.events : [];
    const { start: monthStart, end: monthEnd } = monthBounds(month);
    return events.filter((event) => {
      if (!event || ['rejected','rejected_art','blocked_art_standard'].includes(event.status)) return false;
      if (event?.calendar?.mode === 'hidden') return false;
      const { start, end } = rangeOf(event);
      return Boolean(start && end && start < monthEnd && end >= monthStart);
    });
  }

  function eventHtml(event) {
    const badge = dateBadge(event);
    const art = artUrl(event);
    const bonus = bonusLine(event);
    return `
      <button class="v22-event" type="button" data-v22-event="${esc(event.id)}">
        <span class="v22-date ${badge.range ? 'is-range' : ''}">
          <strong>${esc(badge.top)}</strong>
          <span>${esc(badge.bottom)}</span>
        </span>
        <span class="v22-event-main">
          ${art ? `<img class="v22-event-art" src="${esc(art)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : ''}
          <span class="v22-event-copy">
            <strong>${esc(event.title)}</strong>
            ${bonus ? `<small>${esc(bonus)}</small>` : ''}
          </span>
        </span>
      </button>`;
  }

  function groupHtml(group, events) {
    if (!events.length) return '';
    return `
      <div class="v22-group" data-group="${group.id}">
        <div class="v22-group-label">
          <strong>${esc(group.label)}</strong>
          <span>${esc(group.hint)}</span>
        </div>
        <div class="v22-rail">${events.map(eventHtml).join('')}</div>
      </div>`;
  }

  function bindEvents(root) {
    root.querySelectorAll('[data-v22-event]').forEach((button) => {
      button.addEventListener('click', () => {
        const event = state.events.find((item) => item.id === button.dataset.v22Event);
        if (event && typeof openEvent === 'function') openEvent(event);
      });
    });
  }

  function installCalendarToggle() {
    const calendar = document.querySelector('#calendar');
    const section = calendar?.closest('.section');
    if (!section || section.dataset.v22CalendarReady === '1') return;
    section.dataset.v22CalendarReady = '1';
    section.classList.add('v22-calendar-section');
    if (matchMedia('(max-width: 760px)').matches) section.classList.add('v22-calendar-collapsed');

    const head = section.querySelector('.section-head');
    const title = head?.querySelector('h2');
    if (title) title.textContent = 'Calendário completo';
    if (!head) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'v22-calendar-toggle';
    const sync = () => {
      const collapsed = section.classList.contains('v22-calendar-collapsed');
      button.textContent = collapsed ? 'Mostrar' : 'Recolher';
      button.setAttribute('aria-expanded', String(!collapsed));
    };
    button.addEventListener('click', () => {
      section.classList.toggle('v22-calendar-collapsed');
      sync();
    });
    head.insertBefore(button, head.querySelector('.month-nav'));
    sync();
  }

  function hideSupersededWeekRail() {
    document.querySelector('#weekExperience')?.closest('.experience-section')?.classList.add('v22-superseded');
  }

  function render() {
    if (!Array.isArray(window.state?.events) || !state.events.length) return false;
    const calendarSection = document.querySelector('#calendar')?.closest('.section');
    if (!calendarSection) return false;

    let section = document.querySelector('#monthBoardV22');
    if (!section) {
      section = document.createElement('section');
      section.id = 'monthBoardV22';
      section.className = 'section v22-month-section';
      calendarSection.parentNode.insertBefore(section, calendarSection);
    }

    const month = targetMonth();
    const monthly = visibleEventsFor(month);
    const body = GROUPS.map((group) => {
      const events = monthly
        .filter((event) => group.categories.includes(event.category))
        .sort((a, b) => (rangeOf(a).start?.getTime() || 0) - (rangeOf(b).start?.getTime() || 0));
      return groupHtml(group, events);
    }).join('');

    section.innerHTML = `
      <div class="v22-month-head">
        <div>
          <span class="eyebrow">AGENDA DO MÊS</span>
          <h2>${esc(monthTitle(month))}</h2>
          <p>Datas e eventos organizados por tipo — toque para abrir.</p>
        </div>
      </div>
      <div class="v22-board">${body || '<p class="empty">Nenhum evento confirmado para este mês.</p>'}</div>`;

    bindEvents(section);
    hideSupersededWeekRail();
    installCalendarToggle();
    document.documentElement.dataset.spideyMonthBoard = VERSION;
    return true;
  }

  function init() {
    let attempts = 0;
    const tryRender = () => {
      attempts += 1;
      if (render() || attempts > 40) return;
      setTimeout(tryRender, 250);
    };
    tryRender();

    ['prevMonth','nextMonth'].forEach((id) => {
      document.getElementById(id)?.addEventListener('click', () => setTimeout(render, 80));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
