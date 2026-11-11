const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync('spidey-app/data/events.json', 'utf8')).events;
const queue = JSON.parse(fs.readFileSync('queue/pending/2026-11-11/notice-regarding-gameplay-in-osaka-during-pokemon-go-wild-area-global-96fb9d1a575f.json', 'utf8'));

test('official Osaka advisory is news-only and preserves every unspecified detail', () => {
  const item = events.find((event) => event.id === 'official-news-auto-2ff7990f7c9c');
  assert.ok(item);
  assert.equal(item.source.confidence, 'official');
  assert.equal(item.source.url, 'https://pokemongo.com/news/gowildarea-global-2026-osaka-gameplay-update');
  assert.equal(item.calendar.mode, 'hidden');
  assert.equal(item.presentation.requires_art, false);
  assert.equal(item.notifications.enabled, false);
  assert.equal(item.audit.editorial_detail_pending, false);
  assert.equal(item.audit.unspecified_features_preserved, true);
  assert.equal(item.audit.no_coordinates_or_game_objects_inferred, true);
  assert.doesNotMatch(JSON.stringify(item), /latitude|longitude|Poképarada confirmada|Ginásio confirmado|Ponto de Energia confirmado/);
});

test('collector record is curated without making new art a publication gate', () => {
  assert.equal(queue.status, 'curated');
  assert.equal(queue.etapa_editorial, 'curadoria_editorial_concluida');
  assert.equal(queue.arte_obrigatoria, false);
  assert.equal(queue.gerar_gpx, false);
  assert.deepEqual(queue.app_event_ids, ['official-news-auto-2ff7990f7c9c']);
});

test('storage increase remains clearly community-sourced and outside the calendar', () => {
  const item = events.find((event) => event.id === '2026-11-11-storage-cap-increase');
  assert.ok(item);
  assert.equal(item.source.confidence, 'verified_community');
  assert.equal(item.calendar.mode, 'hidden');
  assert.equal(item.notifications.enabled, false);
  assert.equal(item.audit.official_article_found, false);
  assert.equal(item.audit.purchasable_and_level_reward_caps_kept_distinct, true);
  assert.match(item.summary, /13\.150 Pokémon/);
  assert.match(item.summary, /12\.500 itens/);
});

test('canonical stories remain unique', () => {
  for (const id of ['official-news-auto-2ff7990f7c9c', '2026-11-11-storage-cap-increase']) {
    assert.equal(events.filter((event) => event.id === id).length, 1, id);
  }
});
