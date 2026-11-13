(() => {
  'use strict';
  // Date-only entries cover complete calendar days in their own IANA timezone.
  // End is exclusive: the first instant after the final local day.
  const formatterCache = new Map();
  const dayStartCache = new Map();
  const boundsCache = new Map();
  function formatter(timeZone) {
    if (!formatterCache.has(timeZone)) formatterCache.set(timeZone, new Intl.DateTimeFormat('en-US', {
      timeZone, calendar: 'gregory', numberingSystem: 'latn',
      year: 'numeric', month: '2-digit', day: '2-digit'
    }));
    return formatterCache.get(timeZone);
  }
  function partsObject(parts) {
    return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  }
  function valid(event) {
    const s = event?.schedule;
    if (s?.precision !== 'date' || !/^\d{4}-\d{2}-\d{2}$/.test(s.start_date || '') || !/^\d{4}-\d{2}-\d{2}$/.test(s.end_date || '') || s.end_date < s.start_date) return false;
    const zone = s.local_timezone || s.timezone;
    if (!zone) return false;
    for (const value of [s.start_date, s.end_date]) {
      const date = new Date(value + 'T12:00:00Z');
      if (!Number.isFinite(+date) || date.toISOString().slice(0, 10) !== value) return false;
    }
    try { formatter(zone).format(new Date()); return true; } catch { return false; }
  }
  function localDay(event, now = new Date()) {
    const s = event.schedule, zone = s.local_timezone || s.timezone;
    const p = partsObject(formatter(zone).formatToParts(now));
    return p.year + '-' + p.month + '-' + p.day;
  }
  function nextDate(value) {
    const date = new Date(value + 'T12:00:00Z');
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
  }
  function localDateKey(instant, timeZone) {
    const p = partsObject(formatter(timeZone).formatToParts(instant));
    return p.year + '-' + p.month + '-' + p.day;
  }
  function firstInstantOfLocalDay(value, timeZone) {
    const cacheKey = timeZone + '|' + value;
    if (dayStartCache.has(cacheKey)) {
      const cached = dayStartCache.get(cacheKey);
      return cached === null ? null : new Date(cached);
    }
    const [year, month, day] = value.split('-').map(Number);
    const target = Date.UTC(year, month - 1, day);
    let low = target - 36 * 60 * 60 * 1000;
    let high = target + 36 * 60 * 60 * 1000;
    for (let attempt = 0; attempt < 64 && low < high; attempt++) {
      const middle = Math.floor((low + high) / 2);
      if (localDateKey(new Date(middle), timeZone) < value) low = middle + 1;
      else high = middle;
    }
    const result = new Date(low);
    const timestamp = localDateKey(result, timeZone) === value ? result.getTime() : null;
    dayStartCache.set(cacheKey, timestamp);
    return timestamp === null ? null : new Date(timestamp);
  }
  function bounds(event) {
    if (!valid(event)) return {start: null, end: null};
    const s = event.schedule, zone = s.local_timezone || s.timezone;
    const cacheKey = zone + '|' + s.start_date + '|' + s.end_date;
    if (boundsCache.has(cacheKey)) {
      const cached = boundsCache.get(cacheKey);
      return cached ? {start: new Date(cached.start), end: new Date(cached.end), dateOnly: true} : {start: null, end: null};
    }
    const start = firstInstantOfLocalDay(s.start_date, zone);
    const end = firstInstantOfLocalDay(nextDate(s.end_date), zone);
    if (!start || !end || end <= start) {
      boundsCache.set(cacheKey, null);
      return {start: null, end: null};
    }
    boundsCache.set(cacheKey, {start: start.getTime(), end: end.getTime()});
    return {start, end, dateOnly: true};
  }
  function status(event, now = new Date()) {
    if (!valid(event)) return 'Horário a confirmar';
    const today = localDay(event, now), s = event.schedule;
    return today < s.start_date ? 'Data confirmada · horário a confirmar' : today > s.end_date ? 'Data encerrada' : 'Hoje · horário a confirmar';
  }
  function label(event) {
    if (!valid(event)) return 'Horário a confirmar';
    const date = value => value.split('-').reverse().join('/');
    const s = event.schedule;
    return date(s.start_date) + (s.end_date === s.start_date ? '' : ' → ' + date(s.end_date)) + ' · horário do evento a confirmar';
  }
  window.SpideyDateOnly = Object.freeze({valid, localDay, status, bounds, label});
})();
