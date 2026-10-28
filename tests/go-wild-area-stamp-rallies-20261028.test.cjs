const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = require('../spidey-app/data/events.json').events;
const rallies = require('../spidey-app/data/stamps.json').rallies;

test('automatic official headline is completed as one verified story linked to both rallies', () => {
  const story = events.find((event) => event.id === 'official-news-auto-3226a2a8b105');
  assert.ok(story);
  assert.equal(story.audit.editorial_detail_pending, false);
  assert.equal(story.audit.classification, 'official_announcement_editorially_verified');
  assert.deepEqual(story.related_event_ids, [
    '2026-11-go-wild-area-sendai',
    '2026-11-go-wild-area-mexico-city'
  ]);
  assert.deepEqual(story.related_stamp_rally_ids, [
    '2026-go-wild-area-sendai-stamp-rally',
    '2026-go-wild-area-mexico-city-stamp-rally'
  ]);
  assert.match(story.news.summary, /10h às 20h locais/);
  assert.match(story.news.summary, /qualquer ordem/);
  assert.doesNotMatch(story.news.summary, /ainda não verificou|Confira os detalhes na fonte/);
});

test('Sendai rally preserves the seven official names without invented coordinates, GPX or rewards', () => {
  const rally = rallies.find((item) => item.id === '2026-go-wild-area-sendai-stamp-rally');
  assert.ok(rally);
  assert.equal(rally.stamp_count, 7);
  assert.equal(rally.stamp_window_local, '10:00–20:00');
  assert.equal(rally.stamp_window_brasilia, '22:00 (dia anterior)–08:00');
  assert.equal(rally.main_ticket_day_only, true);
  assert.equal(rally.extra_day_second_rally, false);
  assert.equal(rally.visit_order_required, false);
  assert.deepEqual(rally.stops.map((stop) => stop.venue), [
    'Tsutsujigaoka Park',
    'Daterium',
    'Jyukyo Park Sendai Station West',
    'Sendai City Museum',
    'Nishi Park',
    'Nishikicho Park',
    'AEON Mall Sendai Kamisugi'
  ]);
  for (const stop of rally.stops) {
    assert.equal(stop.latitude, null);
    assert.equal(stop.longitude, null);
    assert.equal(stop.exact_pokestop_verified, false);
    assert.equal(stop.gpx_enabled, false);
    assert.equal(stop.map_url, undefined);
  }
  assert.match(rally.rewards.join(' '), /não informa recompensa final específica/);
  assert.doesNotMatch(JSON.stringify(rally), /Brilhante (?:confirmado|garantido)|Fundo de Localização garantido/i);
});

test('existing Mexico rally and protected product surfaces remain intact', () => {
  const mexico = rallies.find((item) => item.id === '2026-go-wild-area-mexico-city-stamp-rally');
  assert.equal(mexico.stamp_count, 7);
  assert.equal(mexico.stamp_window_local, '10:00–20:00');
  assert.equal(mexico.coordinate_policy, 'venue_references_no_gpx');
  assert.ok(mexico.stops.every((stop) => stop.gpx_enabled === false));
  const index = fs.readFileSync(require.resolve('../spidey-app/index.html'), 'utf8');
  assert.doesNotMatch(index, />Caçador</);
});
