'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const appRoot = path.join(__dirname, '../spidey-app');
const read = p => fs.readFileSync(path.join(appRoot, p), 'utf8');
const events = JSON.parse(read('data/events.json')).events;
const matches = events.filter(event => event.id === '2026-11-20-laic-2027-sao-paulo');

test('LAIC 2027: apenas um evento, janelas oficiais de 8h a 18h preservadas', () => {
  assert.equal(matches.length, 1);
  const event = matches[0];
  assert.equal(event.source.confidence, 'official');
  assert.equal(event.schedule.sessions.length, 3);
  for (const session of event.schedule.sessions) {
    assert.match(session.start, /T08:00:00-03:00$/);
    assert.match(session.end, /T18:00:00-03:00$/);
  }
  assert.equal(event.audit.editorial_detail_pending, false);
});

test('LAIC 2027: coordenada fornecida é referência da sede, não um GPX falso', () => {
  const event = matches[0];
  assert.equal(event.locations.length, 1);
  assert.equal(event.locations[0].latitude, -23.5147);
  assert.equal(event.locations[0].longitude, -46.6375);
  assert.equal(event.locations[0].exact_pokestop_verified, false);
  assert.equal(event.locations[0].exact_raid_gym_verified, false);
  assert.equal(event.gpx.enabled, false);
});

test('LAIC 2027: informações presenciais comunitárias não são declaradas oficiais', () => {
  const event = matches[0];
  assert.equal(event.audit.community_reports_pending_confirmation, true);
  assert.equal(event.audit.no_gameplay_bonuses_announced, true);
  assert.equal(event.community_reports.groups.length, 3);
  assert.match(event.community_reports.claimed_window, /NÃO confirmada/);
  assert.match(event.community_reports.warning, /NÃO à cidade inteira/);
  assert.match(JSON.stringify(event.community_reports), /Heracross ou Kangaskhan/);
  assert.match(JSON.stringify(event.community_reports), /Corsola de Galar/);
  assert.ok(event.verification_sources.some(src => src.url.includes('latin-america-international-championships-2026')));
});

test('LAIC 2027: imagem oficial com tratamento editorial Spidey, visível em mobile e PWA', () => {
  const event = matches[0], js = read('app.js'), css = read('laic-2027.css');
  const html = read('index.html'), sw = read('sw.js');
  assert.match(event.art.url, /^https:\/\/championships\.pokemon\.com\/.*2027-sao-paulo-2048\.webp$/);
  assert.match(js, /function renderCommunityReports/);
  assert.match(js, /siteReference/);
  assert.match(js, /spidey-laic-hero-overlay/);
  assert.match(js, /spidey-icon-cosmic-192\.png/);
  assert.match(css, /@media\(max-width:520px\)/);
  assert.match(html, /laic-2027\.css\?v=20261116-laic1/);
  assert.match(sw, /'\.\/laic-2027\.css'/);
});
