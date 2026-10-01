(() => {
  'use strict';

  const VERSION = 'spidey-app-v2.4-20260929.1-calendar-art';
  const XERNEAS_ART_URL = 'assets/events/premium/xerneas-premium-approved-v1.avif';
  let scheduled = false;

  function currentState() {
    try { return typeof state !== 'undefined' ? state : null; } catch (_) { return null; }
  }

  function approvedEntry(url, alt, width = 960, height = 1200) {
    const make = () => ({ url, width, height });
    return {
      standard: 'spidey-premium-v1',
      visualApproved: true,
      premium_visual_approved: true,
      alt,
      assets: { thumb: make(), card: make(), hero: make(), poster: make() },
    };
  }

  function repairPremiumCatalog() {
    // Approval belongs exclusively to premium-approved-master.js.
  }

  function dayForButton(button) {
    const current = currentState();
    const calendar = document.querySelector('#calendar');
    if (!current?.month || !calendar) return null;
    const buttons = [...calendar.querySelectorAll('.calendar-day')];
    const index = buttons.indexOf(button);
    if (index < 0) return null;
    const year = current.month.getFullYear();
    const month = current.month.getMonth();
    const first = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - first.getDay());
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  }

  function eventsForDay(day) {
    const current = currentState();
    if (!day || !Array.isArray(current?.events) || typeof overlapsDay !== 'function') return [];
    return current.events
      .filter((event) => overlapsDay(event, day))
      .sort((a, b) => {
        const aStart = typeof getBrazilRange === 'function' ? getBrazilRange(a).start : null;
        const bStart = typeof getBrazilRange === 'function' ? getBrazilRange(b).start : null;
        return (aStart?.getTime() || 0) - (bStart?.getTime() || 0);
      });
  }

  function formatDayTitle(day) {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    }).format(day).replace(/^./, (char) => char.toUpperCase());
  }

  function openDay(day, events) {
    if (!events.length) {
      if (typeof showToast === 'function') showToast('Nenhum evento neste dia.');
      return;
    }
    if (events.length === 1) {
      if (typeof openEvent === 'function') openEvent(events[0]);
      return;
    }

    if (typeof detail === 'undefined' || typeof dialog === 'undefined') return;
    detail.innerHTML = `
      <div class="detail-body v24-day-sheet">
        <span class="eyebrow">AGENDA DO DIA</span>
        <h2>${formatDayTitle(day)}</h2>
        <p>${events.length} eventos neste dia. Toque para abrir.</p>
        <div class="v24-day-events">
          ${events.map((event) => `
            <button type="button" class="v24-day-event" data-event-id="${String(event.id).replace(/"/g, '&quot;')}">
              <span>${typeof formatRange === 'function' ? formatRange(event) : ''}</span>
              <strong>${event.title || 'Evento Pokémon GO'}</strong>
              ${event.summary ? `<small>${event.summary}</small>` : ''}
            </button>`).join('')}
        </div>
      </div>`;

    detail.querySelectorAll('.v24-day-event').forEach((button) => {
      button.addEventListener('click', () => {
        const event = events.find((item) => item.id === button.dataset.eventId);
        if (!event || typeof openEvent !== 'function') return;
        if (dialog.open) dialog.close();
        requestAnimationFrame(() => openEvent(event));
      });
    });
    if (!dialog.open) dialog.showModal();
  }

  function installCalendarClicks() {
    const calendar = document.querySelector('#calendar');
    if (!calendar || calendar.dataset.v24Clicks === '1') return;
    calendar.dataset.v24Clicks = '1';
    calendar.addEventListener('click', (event) => {
      const button = event.target.closest('.calendar-day');
      if (!button || !calendar.contains(button)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const day = dayForButton(button);
      openDay(day, eventsForDay(day));
    }, true);
  }

  function installCalendarNavigation() {
    const calendar = document.querySelector('#calendar');
    const section = calendar?.closest('.section');
    const nav = section?.querySelector('.month-nav');
    if (!section || !nav) return;
    section.classList.add('v24-calendar-section');
    nav.classList.add('v24-month-nav');

    const prev = document.querySelector('#prevMonth');
    const next = document.querySelector('#nextMonth');
    if (prev) prev.textContent = '‹';
    if (next) next.textContent = '›';
  }

  function repairCalendarLabel() {
    const current = currentState();
    const label = document.querySelector('#monthLabel');
    if (!current?.month || !label) return;
    const text = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(current.month);
    label.textContent = text.charAt(0).toUpperCase() + text.slice(1);
  }

  function hideDefectiveFestivalArt(root = document) {
    root.querySelectorAll?.('img').forEach((img) => {
      const src = String(img.currentSrc || img.src || '');
      const owner = img.closest('[data-v22-event], .event-card, .experience-mini, .experience-feature, .weekly-item, #eventDetail');
      const text = `${img.alt || ''} ${owner?.textContent || ''}`;
      if (window.isSpideyApprovedImage?.(src)) return;
      if (!/festival[- ]das[- ]luzes|festival of lights/i.test(`${src} ${text}`)) return;
      img.hidden = true;
      img.classList.add('v23-hidden-art');
      owner?.classList.add('v23-no-art');
      img.closest('#eventDetail')?.classList.add('v23-no-hero');
    });
  }

  function restoreApprovedXerneas(root = document) {
    root.querySelectorAll?.('img').forEach((img) => {
      const owner = img.closest('[data-v22-event], .event-card, .experience-mini, .experience-feature, .weekly-item, #eventDetail');
      const text = `${img.alt || ''} ${owner?.textContent || ''}`;
      if (!/xerneas/i.test(text)) return;
      if (!String(img.currentSrc || img.src || '').includes('xerneas-premium-approved-v1.avif')) return;
      img.hidden = false;
      img.classList.remove('v23-hidden-art');
      delete img.dataset.v23ArtReason;
      owner?.classList.remove('v23-no-art');
      img.closest('#eventDetail')?.classList.remove('v23-no-hero');
    });
  }

  function refreshArt() {
    repairPremiumCatalog();
    queueMicrotask(() => window.SpideyVisualV3?.decorate?.());
    setTimeout(() => window.SpideyVisualV3?.decorate?.(), 120);
    setTimeout(() => {
      restoreApprovedXerneas();
      hideDefectiveFestivalArt();
    }, 220);
  }

  function apply() {
    scheduled = false;
    document.documentElement.dataset.spideyApp = 'v2.4';
    installCalendarNavigation();
    installCalendarClicks();
    repairCalendarLabel();
    refreshArt();
  }

  function scheduleRefresh() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  function init() {
    apply();
    ['prevMonth', 'nextMonth'].forEach((id) => {
      document.getElementById(id)?.addEventListener('click', () => setTimeout(scheduleRefresh, 30));
    });
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length || (m.type === 'attributes' && m.attributeName === 'src'))) {
        scheduleRefresh();
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['src'],
    });
    window.SpideyAppV24 = { version: VERSION, refresh: apply };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();