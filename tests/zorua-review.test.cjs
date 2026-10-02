const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');

test('corrected Zorua poster is bound to its original and remains pending across all screens', () => {
  const record = JSON.parse(fs.readFileSync('docs/qa/ZORUA_REVIEW_20261002.json'));
  const window = {}; const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events;
  const context = vm.createContext({ window, URL, state: { events }, document: { addEventListener() {}, querySelectorAll() { return []; } }, eventList: {}, renderEvents() {}, openEvent() {}, MutationObserver: class { observe() {} }, setTimeout() {}, queueMicrotask() {} });
  for (const file of ['premium-approved-master.js', 'preview-art.js', 'art-system.js', 'premium-event-art.js', 'weekly.js']) {
    vm.runInContext(fs.readFileSync('spidey-app/' + file, 'utf8').replace(/\nloadWeeklyData\(\);\s*$/, ''), context);
  }
  assert.equal(record.status, 'PENDING_REVIEW'); assert.equal(record.approval, null);
  const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(hash(record.candidate.file), record.candidate.sha256); assert.equal(hash(record.input.file), record.input.sha256);
  assert.equal(window.SPIDEY_APPROVED_ART_MASTER[record.event_id], undefined);
  const preview = window.SpideyReviewArt.poster({ id: record.event_id });
  assert.equal(preview.sha256, record.candidate.sha256); assert.equal(preview.display, 'full_poster');
  assert.equal(context.weeklyArtUrl({ id: record.event_id }), preview.file + '?v=' + preview.sha256.slice(0, 12));
  const event = JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events.find(e => e.id === record.event_id);
  assert.equal(event.schedule.start_local, '2026-10-10T14:00:00-03:00'); assert.equal(event.schedule.end_local, '2026-10-10T17:00:00-03:00');
  assert.match(event.summary, /3× PE e 2× Doces/); assert.match(event.summary, /21h locais/);
  assert.equal(record.blocked[0].file, null); assert.equal(window.SPIDEY_PREVIEW_ART[record.blocked[0].event_id], undefined);
});
