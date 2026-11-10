(() => {
  const fields = { events: 'events', stamps: 'rallies', weekly: 'days', 'local-events': 'events', pvp: 'leagues' };
  async function load(file) {
    if (!Object.hasOwn(fields, file)) throw new Error('Unknown catalog');
    let response;
    if (file === 'stamps') {
      const fresh = await fetch(`data/stamps.json?fresh=${Date.now()}`, {cache:'no-store'});
      if (!fresh.ok) throw new Error('Selos indisponíveis');
      const data = await fresh.json();
      if (!Array.isArray(data.rallies)) throw new Error('Catálogo incompleto');
      return data;
    }
    // GitHub Pages is static: avoid an API request that can only return 404.
    // Use the same fresh catalog files as the published Pages artifact.
    if (location.hostname.endsWith('.github.io')) {
      const fresh = await fetch(`data/${file}.json?fresh=${Date.now()}`, { cache: 'no-store' });
      if (!fresh.ok) throw new Error('Agenda indisponível');
      const data = await fresh.json();
      if (!Array.isArray(data[fields[file]])) throw new Error('Agenda incompleta');
      return data;
    }
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
