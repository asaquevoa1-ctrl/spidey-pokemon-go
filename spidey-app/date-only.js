(() => {
  'use strict';
  function valid(event) {
    const s = event && event.schedule;
    if (!s || s.precision !== 'date' || !/^\d{4}-\d{2}-\d{2}$/.test(s.start_date || '') || !/^\d{4}-\d{2}-\d{2}$/.test(s.end_date || '') || s.end_date < s.start_date) return false;
    if (!s.local_timezone && !s.timezone) return false;
    for (const value of [s.start_date, s.end_date]) {
      const date = new Date(value + 'T12:00:00Z');
      if (!Number.isFinite(+date) || date.toISOString().slice(0, 10) !== value) return false;
    }
    try { new Intl.DateTimeFormat('en-CA', {timeZone: s.local_timezone || s.timezone}).format(); return true; } catch (_) { return false; }
  }
  function formatter(zone) {
    return new Intl.DateTimeFormat('en-CA', {timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit'});
  }
  function formattedDay(date, fmt) {
    const parts = Object.fromEntries(fmt.formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
    return parts.year + '-' + parts.month + '-' + parts.day;
  }
  function addDays(value, amount) {
    const date = new Date(value + 'T12:00:00Z');
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
  }
  function firstInstantOfLocalDay(value, zone) {
    const pieces = value.split('-').map(Number);
    const center = Date.UTC(pieces[0], pieces[1] - 1, pieces[2], 12, 0, 0, 0);
    let low = center - 48 * 60 * 60 * 1000;
    let high = center + 48 * 60 * 60 * 1000;
    const fmt = formatter(zone);
    const dayAt = ms => formattedDay(new Date(ms), fmt);
    if (dayAt(low) >= value || dayAt(high) < value) return null;
    while (high - low > 1) {
      const mid = low + Math.floor((high - low) / 2);
      if (dayAt(mid) >= value) high = mid;
      else low = mid;
    }
    return dayAt(high) === value ? new Date(high) : null;
  }
  function localDay(event, now) {
    const s = event.schedule;
    return formattedDay(now || new Date(), formatter(s.local_timezone || s.timezone));
  }
  function status(event, now) {
    if (!valid(event)) return 'Horário a confirmar';
    const today = localDay(event, now), s = event.schedule;
    return today < s.start_date ? 'Data confirmada · horário a confirmar' : today > s.end_date ? 'Data encerrada' : 'Hoje · horário a confirmar';
  }
  function bounds(event) {
    if (!valid(event)) return {start: null, end: null, dateOnly: true};
    const s = event.schedule, zone = s.local_timezone || s.timezone;
    const start = firstInstantOfLocalDay(s.start_date, zone);
    const end = firstInstantOfLocalDay(addDays(s.end_date, 1), zone);
    if (!start || !end) return {start: null, end: null, dateOnly: true};
    return {start: start, end: end, dateOnly: true};
  }
  function label(event) {
    if (!valid(event)) return 'Horário a confirmar';
    const date = value => value.split('-').reverse().join('/');
    const s = event.schedule;
    return date(s.start_date) + (s.end_date === s.start_date ? '' : ' → ' + date(s.end_date)) + ' · horário do evento a confirmar';
  }
  window.SpideyDateOnly = Object.freeze({valid, localDay, status, bounds, label});
})();
