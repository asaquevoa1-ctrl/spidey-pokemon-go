const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const root = 'spidey-app/';
const events = JSON.parse(fs.readFileSync(root + 'data/events.json', 'utf8')).events;
const aeon = events.find(e => e.id === '2026-aeon-mall-halloween-japan');

test('AEON Halloween has dates, official source, distinct research windows and no invented daily hours', () => {
  assert.ok(aeon);
  assert.equal(events.filter(e => e.id === aeon.id).length, 1);
  assert.equal(aeon.status, 'published');
  assert.equal(aeon.source.confidence, 'official');
  assert.equal(aeon.source.url, 'https://pokemongo.com/ja/news/202610aeonmall-halloween');
  assert.equal(aeon.schedule.precision, 'date');
  assert.equal(aeon.schedule.local_timezone, 'Asia/Tokyo');
  assert.equal(aeon.schedule.start_date, '2026-10-19');
  assert.equal(aeon.schedule.end_date, '2026-11-01');
  for (const field of ['start_local','end_local','start_brazil','end_brazil']) {
    assert.equal(aeon.schedule[field], undefined, 'Do not invent ' + field);
  }
  const notes = aeon.notes.join(' ');
  assert.match(notes, /19 a 25\/10\/2026/);
  assert.match(notes, /26\/10 a 01\/11\/2026/);
  assert.match(notes, /08\/11\/2026 às 20h/);
  assert.match(notes, /15\/11\/2026 às 20h/);
  assert.ok(aeon.pokemon.some(p => /Pikachu com chapéu de bruxa/.test(p.name)));
  assert.ok(aeon.bonuses.some(p => /2 horas/.test(p)));
});

test('AEON uses venue reference not GPX or a false exact gym/stop', () => {
  assert.equal(aeon.locations.length, 1);
  const p = aeon.locations[0];
  assert.equal(p.latitude, 35.7463);
  assert.equal(p.longitude, 139.3849);
  assert.equal(p.coordinate_type, 'venue_reference');
  assert.equal(p.exact_pokestop_verified, false);
  assert.equal(p.exact_raid_gym_verified, false);
  assert.equal(aeon.gpx.enabled, false);
  assert.equal(aeon.notifications.enabled, false);
});

test('AEON date-only state stays within Japanese calendar dates', () => {
  const window = {};
  vm.runInNewContext(fs.readFileSync(root + 'date-only.js', 'utf8'), {window, Date, Intl});
  assert.equal(window.SpideyDateOnly.valid(aeon), true);
  assert.match(window.SpideyDateOnly.label(aeon), /19\/10\/2026.*01\/11\/2026/);
  assert.match(window.SpideyDateOnly.status(aeon, new Date('2026-10-19T02:00:00Z')), /^Hoje/);
  assert.equal(window.SpideyDateOnly.status(aeon, new Date('2026-11-01T15:00:00Z')), 'Data encerrada');
});

test('opening uses exact approved logo, no duplicate brand asset and no unverified poster', () => {
  const html = fs.readFileSync(root + 'index.html', 'utf8');
  const css = fs.readFileSync(root + 'opening-20261019.css', 'utf8');
  const app = fs.readFileSync(root + 'app.js', 'utf8');
  const experience = fs.readFileSync(root + 'experience-v1.js', 'utf8');
  assert.match(html, /spidey-opening-screen/);
  assert.match(html, /opening-20261019\.css/);
  assert.match(html, /spidey-opening-emblem.*assets\/spidey-logo-oficial\.jpg/);
  assert.match(css, /prefers-reduced-motion/);
  assert.equal(aeon.presentation.no_unverified_poster, true);
  assert.match(app, /function eventArtVisible/);
  assert.match(app, /function verifiedDateVisual/);
  assert.match(experience, /eventArtVisible\(event\)/);
  for (const file of ['app.js','experience-v1.js','player-ui.js']) {
    assert.doesNotThrow(() => new vm.Script(fs.readFileSync(root + file, 'utf8'), {filename: file}));
  }
});
