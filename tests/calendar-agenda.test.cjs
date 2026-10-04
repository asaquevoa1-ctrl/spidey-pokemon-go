const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('a day agenda never receives a poster from its first event and removes stale generic covers', async () => {
  let removed = 0;
  let created = 0;
  const agenda = {
    id: 'eventDetail',
    querySelector(selector) {
      if (selector === 'h2') return { textContent: 'Quinta-feira, 01 de outubro' };
      if (selector === '.v24-day-sheet') return {};
      if (selector === '[data-event-id]') return { dataset: { eventId: 'first-event' } };
      return null;
    },
    querySelectorAll(selector) {
      return selector === '.spidey-cover-art' ? [{ remove: () => { removed += 1; } }] : [];
    },
  };
  const sandbox = vm.createContext({
    window: { addEventListener() {} },
    document: {
      readyState: 'complete', body: {}, documentElement: { dataset: {} },
      querySelector: (selector) => selector === '#eventDetail' ? agenda : null,
      querySelectorAll: () => [],
      createElement: () => { created += 1; throw new Error('Agenda must not create an event cover'); },
    },
    state: { events: [{ id: 'first-event', title: 'First event', category: 'regional_event' }] },
    MutationObserver: class { observe() {} },
    requestAnimationFrame: (callback) => callback(),
    fetch: () => { throw new Error('Unexpected fetch'); },
  });
  vm.runInContext(fs.readFileSync('spidey-app/art-coverage-v1.js', 'utf8'), sandbox);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(created, 0);
  assert.equal(removed, 1);
});

test('the weekly renderer owns its visuals and removes a stale generic cover without making another', async () => {
  let removed = 0;
  let created = 0;
  const weekly = {
    dataset: { weeklyArtOwner: 'canonical' },
    querySelectorAll: () => [{ remove() { removed++; } }],
  };
  const context = vm.createContext({
    window: { addEventListener() {} },
    document: {
      readyState: 'complete', body: {}, documentElement: { dataset: {} },
      querySelector: () => null, querySelectorAll: () => [weekly],
      createElement: () => { created++; throw new Error('Unexpected cover'); },
    },
    state: { events: [{ id: 'known', title: 'Known' }] },
    MutationObserver: class { observe() {} }, requestAnimationFrame: callback => callback(),
  });
  vm.runInContext(fs.readFileSync('spidey-app/art-coverage-v1.js', 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(created, 0);
  assert.equal(removed, 1);
});
