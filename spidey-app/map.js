let spideyMap = null;
let spideyMapLayer = null;
let spideyMapTiles = null;
let spideyLeafletPromise = null;
let spideyMapFilter = 'all';

const EXACT_EVENT_COORDINATE_TYPES = new Set([
  'exact_pokestop',
  'exact_event_point',
  'exact_venue',
  'event_venue_exact',
]);

function mapPointAllowed(point) {
  if (!validCoordinate(point)) return false;
  if (point.coordinate_confidence === 'unconfirmed') return false;
  const type = String(point.coordinate_type || '').toLowerCase();
  if (!type) return false;
  if (type.includes('reference') || type === 'country_reference' || type === 'venue_reference') return false;
  return EXACT_EVENT_COORDINATE_TYPES.has(type);
}

function collectSpideyMapPoints() {
  const points = [];

  state.stamps.forEach((rally) => {
    (rally.stops || []).forEach((stop) => {
      if (!exactPokestop(stop)) return;
      points.push({
        id: `stamp:${rally.id}:${stop.id}`,
        type: 'stamp',
        title: `${stop.city} · ${rally.title}`,
        subtitle: stop.venue || 'PokéStop',
        latitude: Number(stop.latitude),
        longitude: Number(stop.longitude),
        rally,
        stop,
      });
    });
  });

  state.events.forEach((event) => {
    (event.locations || []).forEach((location, index) => {
      if (!mapPointAllowed(location)) return;
      points.push({
        id: `event:${event.id}:${index}`,
        type: 'event',
        title: event.title,
        subtitle: location.label || 'Local confirmado',
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        event,
        location,
      });
    });
  });

  return points;
}

function pendingStampVenues() {
  return state.stamps.filter(rally => rally.collection_type !== 'pokelids').flatMap((rally) => (rally.stops || [])
    .filter((stop) => !exactPokestop(stop))
    .map((stop) => ({ rally, stop })));
}

function filteredMapPoints() {
  const points = collectSpideyMapPoints();
  return spideyMapFilter === 'all' ? points : points.filter((point) => point.type === spideyMapFilter);
}

function leafletAvailable() {
  return typeof window.L !== 'undefined';
}

function ensureLeaflet() {
  if (leafletAvailable()) return Promise.resolve(window.L);
  if (spideyLeafletPromise) return spideyLeafletPromise;
  spideyLeafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-spidey-leaflet]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      css.dataset.spideyLeaflet = '1';
      document.head.appendChild(css);
    }
    const existing = document.querySelector('script[data-spidey-leaflet]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.dataset.spideyLeaflet = '1';
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return spideyLeafletPromise;
}

function mapCoordinateText(point) {
  return `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;
}

function bindMapPointActions(root) {
  root.querySelectorAll('[data-copy-map-point]').forEach((button) => {
    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(button.dataset.copyMapPoint);
      showToast('Coordenada copiada.');
    });
  });
  root.querySelectorAll('[data-open-map-event]').forEach((button) => {
    button.addEventListener('click', () => {
      const event = state.events.find((item) => item.id === button.dataset.openMapEvent);
      if (event) openEvent(event);
    });
  });
  root.querySelectorAll('[data-open-map-stamp]').forEach((button) => {
    button.addEventListener('click', () => {
      const rally = state.stamps.find((item) => item.id === button.dataset.openMapStamp);
      if (rally) openStampRally(rally);
    });
  });
}

function renderMapPointList(points) {
  const root = document.querySelector('#mapPointList');
  if (!root) return;
  if (!points.length) {
    root.innerHTML = '<p class="empty">Nenhum ponto exato confirmado para este filtro.</p>';
    return;
  }
  root.innerHTML = points.map((point) => {
    const value = mapCoordinateText(point);
    const action = point.type === 'event'
      ? `<button class="action-btn" data-open-map-event="${point.event.id}">Detalhes</button>`
      : `<button class="action-btn" data-open-map-stamp="${point.rally.id}">Ver selos</button>`;
    return `
      <article class="map-location-card">
        <div class="map-location-type">${point.type === 'stamp' ? 'STAMP' : 'EVENTO'}</div>
        <strong>${point.title}</strong>
        <span>${point.subtitle}</span>
        <code>${value}</code>
        <div class="map-location-actions">
          <button class="action-btn gold" data-copy-map-point="${value}">Copiar</button>
          ${action}
          <a class="action-btn" href="https://www.google.com/maps?q=${point.latitude},${point.longitude}" target="_blank" rel="noopener">Abrir mapa</a>
        </div>
      </article>`;
  }).join('');
  bindMapPointActions(root);
}

function renderPendingVenues() {
  const root = document.querySelector('#mapPendingList');
  if (!root) return;
  const pending = pendingStampVenues();
  if (!pending.length) {
    root.innerHTML = '<p class="empty">Todos os locais disponíveis estão confirmados.</p>';
    return;
  }
  root.innerHTML = pending.map(({ rally, stop }) => `
    <article class="map-pending-card">
      <span class="coordinate-state pending">Localização a confirmar</span>
      <strong>${stop.city} · ${stop.country}</strong>
      <span>${stop.venue || 'Local a confirmar'}</span>
      <small>${rally.title}</small>
    </article>`).join('');
}

function fitSpideyMap(bounds) {
  if (!spideyMap || !bounds.length) return;

  // O mapa é criado quando a aba ainda pode estar oculta. Sempre recalcular o
  // tamanho depois que a aba Mapa estiver visível, antes de calcular o zoom.
  spideyMap.invalidateSize({ pan: false, animate: false });
  if (bounds.length === 1) spideyMap.setView(bounds[0], 15, { animate: false });
  else spideyMap.fitBounds(bounds, { padding: [30, 30], animate: false });

  setTimeout(() => {
    if (!spideyMap) return;
    spideyMap.invalidateSize({ pan: false, animate: false });
    if (bounds.length === 1) spideyMap.setView(bounds[0], 15, { animate: false });
    else spideyMap.fitBounds(bounds, { padding: [30, 30], animate: false });
  }, 100);
}

async function drawLeafletMap(points) {
  const mapEl = document.querySelector('#worldMap');
  const fallback = document.querySelector('#mapEngineStatus');
  if (!mapEl) return;
  if (!points.length) {
    mapEl.hidden = true;
    if (fallback) fallback.textContent = 'O mapa será ativado assim que existir pelo menos uma coordenada exata confirmada.';
    return;
  }
  mapEl.hidden = false;
  if (fallback) fallback.textContent = 'Carregando mapa…';
  try {
    const L = await ensureLeaflet();
    if (!spideyMap) {
      spideyMap = L.map(mapEl, { zoomControl: true, attributionControl: true });
      spideyMapTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: true,
        attribution: '&copy; OpenStreetMap contributors',
      });
      spideyMapTiles.on('tileerror', () => {
        if (fallback) fallback.textContent = 'O mapa base não carregou. As coordenadas continuam disponíveis abaixo.';
      });
      spideyMapTiles.addTo(spideyMap);
      spideyMapLayer = L.layerGroup().addTo(spideyMap);
    }
    spideyMapLayer.clearLayers();
    const bounds = [];
    points.forEach((point) => {
      const marker = L.marker([point.latitude, point.longitude]).addTo(spideyMapLayer);
      marker.bindPopup(`<strong>${point.title}</strong><br>${point.subtitle}<br><code>${mapCoordinateText(point)}</code>`);
      bounds.push([point.latitude, point.longitude]);
    });
    fitSpideyMap(bounds);
    if (fallback) fallback.textContent = `${points.length} locais confirmados no mapa.`;
  } catch (error) {
    console.error(error);
    if (fallback) fallback.textContent = 'O mapa visual não carregou, mas a lista de coordenadas continua disponível abaixo.';
  }
}

function updateMapCounters(points) {
  const all = collectSpideyMapPoints();
  const stampCount = all.filter((point) => point.type === 'stamp').length;
  const eventCount = all.filter((point) => point.type === 'event').length;
  const totalEl = document.querySelector('#mapExactCount');
  const stampEl = document.querySelector('#mapStampCount');
  const eventEl = document.querySelector('#mapEventCount');
  if (totalEl) totalEl.textContent = all.length;
  if (stampEl) stampEl.textContent = stampCount;
  if (eventEl) eventEl.textContent = eventCount;
  const visibleEl = document.querySelector('#mapVisibleCount');
  if (visibleEl) visibleEl.textContent = points.length;
}

function bindMapFilters() {
  document.querySelectorAll('[data-map-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.mapFilter === spideyMapFilter);
    button.onclick = () => {
      spideyMapFilter = button.dataset.mapFilter;
      renderMapV2();
    };
  });
}

function renderMapV2() {
  const points = filteredMapPoints();
  updateMapCounters(points);
  bindMapFilters();
  renderMapPointList(points);
  renderPendingVenues();
  drawLeafletMap(points);
}
