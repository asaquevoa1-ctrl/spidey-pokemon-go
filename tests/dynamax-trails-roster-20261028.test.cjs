const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const event = events.find(item => item.id === '2026-11-16-dynamax-trails');
const guide = event?.max_battle_guide;

test('existing canonical Dynamax Trails event has a compact 56-slot illustrated reference', () => {
  assert.equal(events.filter(item => item.id === '2026-11-16-dynamax-trails').length, 1);
  assert.ok(guide);
  assert.equal(guide.illustrated_selection.length, 56);
  assert.ok(guide.illustrated_selection.includes('Magikarp'));
  assert.ok(guide.illustrated_selection.includes('Feebas'));
  assert.ok(guide.illustrated_selection.includes('Duraludon'));
  assert.ok(guide.illustrated_selection.includes('Toxtricity (Forma Aguda)'));
  assert.ok(guide.illustrated_selection.includes('Toxtricity (Forma Grave)'));
  assert.ok(guide.selection_label.includes('comunidade'));
});

test('official eligibility and special-background claims do not promise rates or a 2025 graphic', () => {
  assert.match(guide.official_rule, /Lendários e Míticos/);
  assert.match(guide.special_background, /podem vir com Fundo Especial/);
  assert.match(guide.special_background, /Não é garantido/);
  assert.match(guide.background_reference, /comunidade/);
  assert.match(guide.background_reference, /não identifica expressamente/);
  assert.equal(guide.sources.find(s => s.confidence === 'official').url,
    'https://pokemongo.com/en/news/dynamax-trails-eternamax-eternatus-2026');
  assert.ok(!event.bonuses.some(b => b.includes('Fundo de Localização')));
  assert.equal(event.gpx.enabled, false);
  assert.equal(event.notifications.enabled, false);
});

test('details use an expandable responsive gallery, without touching approved posters', () => {
  const app = fs.readFileSync('spidey-app/app.js', 'utf8');
  const css = fs.readFileSync('spidey-app/styles.css', 'utf8');
  const html = fs.readFileSync('spidey-app/index.html', 'utf8');
  const sw = fs.readFileSync('spidey-app/sw.js', 'utf8');
  assert.match(app, /function renderMaxBattleGuide\(event\)/);
  assert.match(app, /<details class="dynamax-roster">/);
  assert.match(app, /\$\{renderMaxBattleGuide\(event\)\}/);
  assert.match(css, /\.dynamax-roster-list/);
  assert.match(html, /app\.js\?v=20261029-guides-stable1/);
  assert.match(html, /styles\.css\?v=20261028-dynamax-roster1/);
  assert.match(sw, /20261028-dynamax-roster1/);
});
