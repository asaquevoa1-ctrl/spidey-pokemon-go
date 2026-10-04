const CONFIRMED_COORDINATES = new Set(['confirmed', 'verified', 'official', 'community_verified']);

function exactStop(stop) {
  if (!stop || stop.gpx_enabled === false || stop.coordinate_type !== 'exact_pokestop'
    || !CONFIRMED_COORDINATES.has(stop.coordinate_confidence)) return false;
  const { latitude, longitude } = stop;
  if (latitude === null || latitude === undefined || latitude === ''
    || longitude === null || longitude === undefined || longitude === '') return false;
  return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    && Number(latitude) >= -90 && Number(latitude) <= 90
    && Number(longitude) >= -180 && Number(longitude) <= 180;
}

function xmlSafe(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function rallyGpx(catalog, identifier) {
  if (typeof identifier !== 'string' || !/^[a-z0-9-]+$/.test(identifier)) {
    return { status: 400, error: 'invalid_rally' };
  }
  const rally = (catalog.rallies || []).find(item => item.id === identifier || item.slug === identifier);
  if (!rally) return { status: 404, error: 'rally_not_found' };
  if (!Array.isArray(rally.stops) || !rally.stops.length || !rally.stops.every(exactStop)) {
    return { status: 409, error: 'exact_coordinates_required' };
  }
  if (!/^[a-z0-9-]+$/.test(rally.slug || '')) return { status: 409, error: 'invalid_rally_slug' };
  const stops = rally.stops.map((stop, index) => ({ stop, index })).sort((a, b) => {
    const ao = Number(a.stop.route_order ?? a.stop.stamp_number ?? a.index + 1);
    const bo = Number(b.stop.route_order ?? b.stop.stamp_number ?? b.index + 1);
    return ao - bo || a.index - b.index;
  }).map(({ stop }) => stop);
  const waypoints = stops.map(stop => {
    const name = `${stop.stamp_number || ''} ${stop.city || ''} - ${stop.venue || ''}`.trim();
    return `  <wpt lat="${Number(stop.latitude)}" lon="${Number(stop.longitude)}"><name>${xmlSafe(name)}</name></wpt>`;
  }).join('\n');
  return {
    status: 200,
    filename: `${rally.slug}.gpx`,
    content: `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Spidey Pokemon GO" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>${xmlSafe(rally.title)}</name></metadata>\n${waypoints}\n</gpx>`,
  };
}
