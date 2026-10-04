(() => {
  const fields = { events: 'events', stamps: 'rallies', weekly: 'days', 'local-events': 'events' };
  async function load(file) {
    if (!Object.hasOwn(fields, file)) throw new Error('Unknown catalog');
    let response;
    try {
      response = await fetch(`api/catalog?file=${encodeURIComponent(file)}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Agenda indisponível');
      const data = await response.json();
      if (!Array.isArray(data[fields[file]])) throw new Error('Agenda incompleta');
      return data;
    } catch {
      response = await fetch(`data/${file}.json`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Agenda indisponível');
      const data = await response.json();
      if (!Array.isArray(data[fields[file]])) throw new Error('Agenda incompleta');
      return data;
    }
  }
  window.SpideyCatalog = Object.freeze({ load });
})();
