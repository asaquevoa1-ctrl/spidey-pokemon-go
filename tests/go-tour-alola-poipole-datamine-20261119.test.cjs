const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const story = events.find(event => event.id === '2027-02-go-tour-alola-save-the-date');
const windowIds = [
  '2027-go-tour-alola-kaohsiung',
  '2027-go-tour-alola-los-angeles',
  '2027-go-tour-alola-global'
];

test('Poipole datamine stays in the existing GO Tour news story and is visibly unconfirmed', () => {
  assert.ok(story);
  assert.equal(story.content_type, 'news');
  assert.equal(story.calendar.mode, 'hidden');
  assert.match(story.news.label, /NÃO CONFIRMADO/);
  assert.match(story.news.summary, /datamine comunitário/);
  assert.match(story.notes.join(' '), /DATAMINE DA COMUNIDADE • NÃO CONFIRMADO/);
  assert.equal(story.source.confidence, 'official');
  const community = story.verification_sources.find(source => source.url.includes('/1y0bl9y/'));
  assert.equal(community.confidence, 'community_unconfirmed');
  assert.equal(story.audit.official_poipole_confirmation_found, false);
  assert.equal(story.audit.calendar_changed_by_datamine, false);
  assert.equal(story.audit.editorial_detail_pending, false);
});

test('official GO Tour windows remain distinct and contain no invented Poipole details', () => {
  assert.deepEqual(story.related_event_ids, windowIds);
  const windows = windowIds.map(id => events.find(event => event.id === id));
  assert.ok(windows.every(Boolean));
  assert.deepEqual(windows.map(event => event.schedule.start_date), ['2027-02-19', '2027-02-19', '2027-02-27']);
  assert.deepEqual(windows.map(event => event.schedule.end_date), ['2027-02-21', '2027-02-21', '2027-02-28']);
  assert.deepEqual(windows.map(event => event.schedule.local_timezone), ['Asia/Taipei', 'America/Los_Angeles', 'America/Sao_Paulo']);
  for (const event of windows) {
    assert.doesNotMatch(JSON.stringify(event), /Poipole/i);
    assert.equal(event.notifications.enabled, false);
  }
});
