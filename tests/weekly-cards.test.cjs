const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function setup() {
  const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
  const window = {};
  const context = vm.createContext({
    window, state: { events }, Intl, Date,
    document: { querySelector() { return null; } },
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    console, showToast() {},
  });
  for (const file of ['premium-approved-master.js', 'preview-art.js', 'weekly.js']) {
    vm.runInContext(fs.readFileSync(`spidey-app/${file}`, 'utf8'), context);
  }
  return { window, context, events };
}

test('every approved weekly card uses the same original file and version as the canonical master', () => {
  const { window, context } = setup();
  assert.equal(Object.keys(window.SPIDEY_APPROVED_ART_MASTER).length, 25);
  for (const [id, asset] of Object.entries(window.SPIDEY_APPROVED_ART_MASTER)) {
    const html = context.weeklyItemCard({ id, title: 'Event', weekly_art: { premium: true, url: 'competing.png' } });
    assert.ok(html.includes(`${asset.file}?v=${asset.sha256.slice(0, 12)}`), id);
    assert.ok(!html.includes('competing.png'), id);
    assert.ok(!html.includes('weekly-date"'), id);
  }
});

test('Space Week displays the actual astronaut announcement, with credit and without a normal Pikachu fallback', () => {
  const { context, events } = setup();
  const event = events.find(event => event.id === '2026-10-world-space-week');
  const html = context.weeklyItemCard(event);
  assert.ok(html.includes(event.official_media.file));
  assert.ok(html.includes('Imagem do anúncio oficial · Pokémon GO'));
  assert.ok(!html.includes('spidey-cover'));
  assert.ok(!html.includes('sprites/pokemon'));
});

test('missing or unavailable approved art does not become a synthetic or competing poster', () => {
  const { context, window } = setup();
  const html = context.weeklyItemCard({ id: 'unapproved', title: 'No poster', weekly_art: { premium: true, url: 'unreviewed.png' } });
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('weekly-date'));
  const id = '2026-10-world-space-week';
  window.SPIDEY_APPROVED_ART_MASTER = { [id]: { file: 'missing.png', sha256: 'bad' } };
  window.SPIDEY_UNAVAILABLE_ART = { 'missing.png': 'MISSING' };
  const missing = context.weeklyItemCard({ id, title: 'Missing approved poster' });
  assert.ok(!missing.includes('weekly-official-media'));
  assert.ok(!missing.includes('<img'));
});

test('dates and ended status clarify the old Sobble and Malamar entries in this calendar week', () => {
  const { context } = setup();
  const reference = new Date('2026-10-04T17:49:19Z');
  assert.match(context.weeklySchedule({ id: '2026-09-28-max-monday-sobble' }, reference).label, /28.*set.*Encerrado/);
  assert.match(context.weeklySchedule({ id: '2026-09-mega-malamar-raids' }, reference).label, /23.*29.*Encerrado/);
  assert.match(context.weeklySchedule({ id: '2026-10-world-space-week' }, reference).label, /04.*10.*Acontecendo agora/);
  assert.match(context.weeklySchedule({ id: '2026-10-05-max-monday-sizzlipede' }, reference).label, /05.*Vem por aí/);
});

test('weekly dates use Brasília across midnight and fail closed for malformed schedules', () => {
  const { context } = setup();
  const label = context.weeklySchedule({ start_brazil: '2026-10-05T02:30:00Z', end_brazil: '2026-10-05T03:30:00Z' }, new Date('2026-10-05T03:00:00Z'));
  assert.equal(label.day, '04');
  assert.equal(label.month, '10');
  assert.match(label.label, /04.*05/);
  assert.equal(context.weeklySchedule({ start_brazil: 'invalid', end_brazil: 'invalid' }), null);
});

test('weekly text is escaped rather than creating controls from catalog text', () => {
  const { context } = setup();
  const html = context.weeklyItemCard({ id: 'unsafe', title: '<button>Title</button>', summary: '<img src=x>', tags: ['<script>'] });
  assert.ok(html.includes('&lt;button&gt;Title&lt;/button&gt;'));
  assert.ok(!html.includes('<button>'));
  assert.ok(!html.includes('<script>'));
});
