(function installSpideyExperienceV1() {
  const CATEGORY_PTBR = {
    spotlight_hour: 'Hora do Holofote',
    raid_hour: 'Hora de Reides',
    raid_rotation: 'Reides',
    mega_raid_rotation: 'Mega-Reides',
    shadow_raids: 'Reides Sombrosas',
    max_monday: 'Segunda Max',
    max_battle_day: 'Dia de Batalhas Max',
    community_day: 'Dia Comunitário',
    go_battle_league: 'Liga de Batalha GO',
    evento_especial: 'Evento especial',
    regional_event: 'Evento regional',
    daily_discovery: 'Descoberta diária',
    go_fest: 'GO Fest',
    timed_research: 'Pesquisa temporária',
  };

  const CATEGORY_PRIORITY = {
    community_day: 100,
    raid_hour: 96,
    spotlight_hour: 92,
    max_battle_day: 91,
    max_monday: 88,
    regional_event: 86,
    evento_especial: 84,
    go_fest: 84,
    timed_research: 70,
    mega_raid_rotation: 58,
    raid_rotation: 55,
    shadow_raids: 53,
    go_battle_league: 28,
    daily_discovery: 18,
  };

  if (typeof spideyCategoryLabel === 'function') {
    const fallbackCategoryLabel = spideyCategoryLabel;
    spideyCategoryLabel = function spideyCategoryLabelPtBr(event) {
      return CATEGORY_PTBR[event?.category] || fallbackCategoryLabel(event);
    };
  }

  const now = new Date();
  const focusOffset = now.getDate() >= 25 ? 1 : 0;
  state.month = new Date(now.getFullYear(), now.getMonth() + focusOffset, 1);

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function eventRange(event) {
    return getBrazilRange(event);
  }

  function activeNow(event, reference = new Date()) {
    const { start, end } = eventRange(event);
    return Boolean(start && end && start <= reference && end >= reference);
  }

  function priority(event) {
    const base = CATEGORY_PRIORITY[event?.category] || 45;
    const { start, end } = eventRange(event);
    if (!start || !end) return base;
    const durationHours = Math.max(0, (end - start) / 3600000);
    const shortBoost = durationHours <= 4 ? 12 : durationHours <= 24 ? 7 : durationHours <= 72 ? 3 : 0;
    return base + shortBoost;
  }

  function artUrl(event, role = 'card') {
    if (typeof spideyResolveEventArt === 'function') {
      const asset = spideyResolveEventArt(event, role);
      if (asset?.url) return typeof spideyVersionedArtUrl === 'function' ? spideyVersionedArtUrl(asset) : asset.url;
    }
    return generatedEventArtUrl(event);
  }

  function relativeLabel(event, reference = new Date()) {
    const { start, end } = eventRange(event);
    if (!start || !end) return 'Horário a confirmar';
    if (start <= reference && end >= reference) return 'Acontecendo agora';
    const minutes = Math.round((start - reference) / 60000);
    if (minutes < 0) return 'Encerrado';
    if (minutes < 60) return `Começa em ${minutes} min`;
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      return rest ? `Começa em ${hours}h ${rest}min` : `Começa em ${hours}h`;
    }
    const days = Math.ceil(minutes / 1440);
    return days === 1 ? 'Começa amanhã' : `Começa em ${days} dias`;
  }

  function visibleUpcoming(reference = new Date()) {
    return state.events
      .filter((event) => {
        const { end } = eventRange(event);
        return end && end >= reference;
      })
      .sort((a, b) => {
        const aActive = activeNow(a, reference) ? 1 : 0;
        const bActive = activeNow(b, reference) ? 1 : 0;
        if (aActive !== bActive) return bActive - aActive;
        if (aActive && bActive) return priority(b) - priority(a);
        const aStart = eventRange(a).start?.getTime() || Number.MAX_SAFE_INTEGER;
        const bStart = eventRange(b).start?.getTime() || Number.MAX_SAFE_INTEGER;
        if (aStart !== bStart) return aStart - bStart;
        return priority(b) - priority(a);
      });
  }

  function selectFeature(reference = new Date()) {
    const upcoming = visibleUpcoming(reference);
    const active = upcoming.filter((event) => activeNow(event, reference)).sort((a, b) => priority(b) - priority(a));
    if (active.length) return active[0];

    const near = upcoming.filter((event) => {
      const start = eventRange(event).start;
      return start && start - reference <= 72 * 3600000;
    });
    if (near.length) {
      return [...near].sort((a, b) => {
        const startDiff = (eventRange(a).start - reference) - (eventRange(b).start - reference);
        if (Math.abs(startDiff) < 8 * 3600000) return priority(b) - priority(a);
        return startDiff;
      })[0];
    }
    return upcoming[0] || null;
  }

  function miniCard(event) {
    return `
      <article class="experience-mini experience-event" tabindex="0" data-event-id="${esc(event.id)}">
        <img src="${esc(artUrl(event, 'card'))}" alt="${esc(event.art?.alt || event.title)}" onerror="this.onerror=null;this.src='${esc(generatedEventArtUrl(event))}'">
        <div class="experience-mini-copy">
          <span class="experience-kicker">${esc(spideyCategoryLabel(event))}</span>
          <strong>${esc(event.title)}</strong>
          <div class="experience-mini-meta">${esc(relativeLabel(event))}<br>${esc(formatRange(event))}</div>
        </div>
      </article>`;
  }

  function bindExperienceEvents(root) {
    root?.querySelectorAll('.experience-event').forEach((node) => {
      const open = () => {
        const event = state.events.find((item) => item.id === node.dataset.eventId);
        if (event) openEvent(event);
      };
      node.addEventListener('click', open);
      node.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') open(); });
    });
  }

  function renderFeature(reference = new Date()) {
    const target = document.querySelector('#nowExperience');
    if (!target) return;
    const event = selectFeature(reference);
    if (!event) {
      target.innerHTML = '<div class="experience-empty">Nenhum próximo evento confirmado por enquanto.</div>';
      return;
    }
    target.innerHTML = `
      <article class="experience-feature">
        <button class="experience-feature-button experience-event" type="button" data-event-id="${esc(event.id)}">
          <span class="experience-feature-art-wrap">
            <img class="experience-feature-art" src="${esc(artUrl(event, 'hero'))}" alt="${esc(event.art?.alt || event.title)}" onerror="this.onerror=null;this.src='${esc(generatedEventArtUrl(event))}'">
          </span>
          <span class="experience-feature-copy">
            <span class="experience-kicker">${esc(spideyCategoryLabel(event))}</span>
            <h3>${esc(event.title)}</h3>
            <span class="experience-countdown">${esc(relativeLabel(event, reference))}</span>
            <span class="experience-range">${esc(formatRange(event))}</span>
            ${event.summary ? `<span class="experience-summary">${esc(event.summary)}</span>` : ''}
            <span class="experience-cta">Abrir evento →</span>
          </span>
        </button>
      </article>`;
    bindExperienceEvents(target);
  }

  function renderToday(reference = new Date()) {
    const target = document.querySelector('#todayExperience');
    if (!target) return;
    const today = state.events
      .filter((event) => overlapsDay(event, calendarToday(reference)))
      .filter((event) => eventRange(event).end >= reference)
      .sort((a, b) => {
        const activeDiff = Number(activeNow(b, reference)) - Number(activeNow(a, reference));
        if (activeDiff) return activeDiff;
        return (eventRange(a).start || 0) - (eventRange(b).start || 0);
      })
      .slice(0, 5);
    if (!today.length) {
      const next = visibleUpcoming(reference)[0];
      target.innerHTML = `<div class="experience-empty">Sem evento pontual restante hoje.${next ? ` Próximo destaque: <strong>${esc(next.title)}</strong>.` : ''}</div>`;
      return;
    }
    target.innerHTML = today.map(miniCard).join('');
    bindExperienceEvents(target);
  }

  function renderWeek(reference = new Date()) {
    const target = document.querySelector('#weekExperience');
    if (!target) return;
    const limit = new Date(reference.getTime() + 7 * 86400000);
    const week = visibleUpcoming(reference)
      .filter((event) => {
        const { start, end } = eventRange(event);
        return start && end && start <= limit && end >= reference;
      })
      .sort((a, b) => {
        const aStart = eventRange(a).start || new Date(8640000000000000);
        const bStart = eventRange(b).start || new Date(8640000000000000);
        if (aStart.getTime() !== bStart.getTime()) return aStart - bStart;
        return priority(b) - priority(a);
      })
      .slice(0, 7);
    if (!week.length) {
      target.innerHTML = '<div class="experience-empty">Nenhum evento confirmado nos próximos sete dias.</div>';
      return;
    }
    target.innerHTML = week.map(miniCard).join('');
    bindExperienceEvents(target);
  }

  function renderExperience() {
    if (!state.events?.length) return;
    const reference = new Date();
    renderFeature(reference);
    renderToday(reference);
    renderWeek(reference);
    const note = document.querySelector('#calendarFocusNote');
    if (note) {
      note.textContent = `O calendário abre no próximo mês relevante quando o mês atual já está no fim. Setembro permanece disponível como histórico.`;
    }
  }

  const baseRenderEventsExperience = renderEvents;
  renderEvents = function renderEventsWithExperience(...args) {
    const result = baseRenderEventsExperience(...args);
    renderExperience();
    return result;
  };

  const baseRenderCalendarExperience = renderCalendar;
  renderCalendar = function renderCalendarWithExperience(...args) {
    const result = baseRenderCalendarExperience(...args);
    renderExperience();
    return result;
  };

  document.querySelector('#weekShortcut')?.addEventListener('click', () => setView('weeklyView'));

  setTimeout(() => {
    if (!state.events?.length) return;
    renderCalendar();
    renderExperience();
  }, 0);

  window.SpideyExperience = {
    render: renderExperience,
    focusMonth: state.month,
    categoryLabels: CATEGORY_PTBR,
  };
})();
