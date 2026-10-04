const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const catalog = JSON.parse(fs.readFileSync('spidey-app/data/stamps.json', 'utf8'));
const japan = catalog.rallies.find(rally => rally.id === 'pokemon-centre-japan-stamp-rally-2026');
const gpxModule = import('../lib/rally-gpx.js');
const endpoint = import('../api/gpx.js');

function responseRecorder() {
  return {
    headers: {}, statusCode: null, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('Japan download preserves the previously verified 17 waypoints byte for byte', async () => {
  const { rallyGpx } = await gpxModule;
  const result = rallyGpx(catalog, japan.id);
  const verified = fs.readFileSync('docs/qa/japan-rally-browser-download-0433c32-20261002.gpx', 'utf8');
  assert.equal(result.status, 200);
  assert.equal(result.content, verified);
  assert.equal((result.content.match(/<wpt /g) || []).length, 17);
  assert.equal(result.filename, 'pokemon-centre-stamp-rally-japan-2026.gpx');
  assert.equal(rallyGpx(catalog, japan.slug).content, verified);
});

test('partial rally and every unverified or invalid coordinate block the full download', async () => {
  const { rallyGpx } = await gpxModule;
  assert.equal(rallyGpx(catalog, 'pokexciting-cross-region-2026').status, 409);
  const invalidStops = [
    { latitude: null }, { longitude: '' }, { latitude: 91 }, { longitude: -181 },
    { latitude: 'NaN' }, { coordinate_type: 'venue_reference' },
    { coordinate_confidence: 'unconfirmed' }, { gpx_enabled: false },
  ];
  for (const invalid of invalidStops) {
    const changed = structuredClone(japan);
    Object.assign(changed.stops[0], invalid);
    assert.equal(rallyGpx({ rallies: [changed] }, japan.id).status, 409);
  }
  assert.equal(rallyGpx({ rallies: [{ ...japan, stops: [] }] }, japan.id).status, 409);
});

test('rally selection rejects unknown IDs, multiple query values and header injection', async () => {
  const { rallyGpx } = await gpxModule;
  assert.equal(rallyGpx(catalog, 'unknown-rally').status, 404);
  for (const identifier of [undefined, [japan.id, japan.id], '../data/stamps.json', 'foo\r\nbar']) {
    assert.equal(rallyGpx(catalog, identifier).status, 400);
  }
});

test('names are XML escaped without losing precision or ordering', async () => {
  const { rallyGpx } = await gpxModule;
  const changed = structuredClone(japan);
  changed.title = 'A & B <route>';
  changed.stops[0].venue = 'Center & <shop>';
  const result = rallyGpx({ rallies: [changed] }, japan.id);
  assert.match(result.content, /A &amp; B &lt;route&gt;/);
  assert.match(result.content, /Center &amp; &lt;shop&gt;/);
  assert.match(result.content, /lat="33\.5891079" lon="130\.4189541"/);
});

test('HTTP endpoint serves a named GPX attachment and HEAD without a body', async () => {
  const { default: handler } = await endpoint;
  for (const method of ['GET', 'HEAD']) {
    const response = responseRecorder();
    handler({ method, query: { rally: japan.id } }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['Content-Disposition'], 'attachment; filename="pokemon-centre-stamp-rally-japan-2026.gpx"');
    assert.equal(response.headers['Content-Type'], 'application/gpx+xml;charset=utf-8');
    assert.equal(response.headers['Cache-Control'], 'no-store');
    if (method === 'HEAD') assert.equal(response.body, '');
    else assert.equal(response.body, fs.readFileSync('docs/qa/japan-rally-browser-download-0433c32-20261002.gpx', 'utf8'));
  }
});

test('HTTP endpoint rejects writes and incomplete routes rather than inventing coordinates', async () => {
  const { default: handler } = await endpoint;
  const response = responseRecorder();
  handler({ method: 'POST', query: { rally: japan.id } }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'GET, HEAD');
  const partial = responseRecorder();
  handler({ method: 'GET', query: { rally: 'pokexciting-cross-region-2026' } }, partial);
  assert.equal(partial.statusCode, 409);
  assert.deepEqual(partial.body, { error: 'exact_coordinates_required' });
});
