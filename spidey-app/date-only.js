(() => {
  'use strict';
  // Calendar bounds are date indexes, never a claim about activity hours.
  function valid(event) {
    const s = event?.schedule;
    if (s?.precision !== 'date' || !/^\d{4}-\d{2}-\d{2}$/.test(s.start_date || '') || !/^\d{4}-\d{2}-\d{2}$/.test(s.end_date || '') || s.end_date < s.start_date) return false;
    if (!s.local_timezone && !s.timezone) return false;
    for (const value of [s.start_date, s.end_date]) {
      const date = new Date(`${value}T12:00:00Z`);
      if (!Number.isFinite(+date) || date.toISOString().slice(0, 10) !== value) return false;
    }
    try { new Intl.DateTimeFormat('en-CA', {timeZone: s.local_timezone || s.timezone}).format(); return true; } catch { return false; }
  }
  function localDay(event, now = new Date()) {
    const s = event.schedule;
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone: s.local_timezone || s.timezone, year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(now).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
    return `${p.year}-${p.month}-${p.day}`;
  }
  function status(event, now = new Date()) {
    if (!valid(event)) return 'Horário a confirmar';
    const today = localDay(event, now), s = event.schedule;
    return today < s.start_date ? 'Data confirmada · horário a confirmar' : today > s.end_date ? 'Data encerrada' : 'Hoje · horário a confirmar';
  }
  function bounds(event) {
    if (!valid(event)) return {start: null, end: null};
    return {start: new Date(`${event.schedule.start_date}T00:00:00-03:00`), end: new Date(`${event.schedule.end_date}T23:59:59.999-03:00`), dateOnly: true};
  }
  function label(event) {
    if (!valid(event)) return 'Horário a confirmar';
    const date = value => value.split('-').reverse().join('/');
    const s = event.schedule;
    return `${date(s.start_date)}${s.end_date === s.start_date ? '' : ` → ${date(s.end_date)}`} · horário do evento a confirmar`;
  }
  window.SpideyDateOnly = Object.freeze({valid, localDay, status, bounds, label});
})();
