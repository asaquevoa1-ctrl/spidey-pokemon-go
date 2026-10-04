const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function worker(overrides = {}) {
  const listeners = {};
  const self = { location: { origin: 'https://spidey.test', href: 'https://spidey.test/spidey-app/sw.js' }, addEventListener: (name, fn) => { listeners[name] = fn; }, clients: { claim: async () => {} }, skipWaiting: async () => {} };
  const cached = new Response('cached');
  const matches = [];
  const caches = { match: async (request, options) => { matches.push({ request, options }); return cached; }, open: async () => ({ put: async () => {} }), keys: async () => [], delete: async () => {} };
  vm.runInNewContext(fs.readFileSync('spidey-app/sw.js', 'utf8'), { self, URL, Response, atob, Uint8Array, caches, fetch: async () => { throw new Error('offline'); }, ...overrides });
  return { listeners, cached, matches };
}
test('offline shell and event data use the stored response including versioned requests', async () => {
  const w = worker();
  for (const url of ['https://spidey.test/spidey-app/app.js?v=current', 'https://spidey.test/spidey-app/data/events.json', 'https://spidey.test/spidey-app/data/space-museums.json?v=current']) {
    let result; w.listeners.fetch({ request: { method: 'GET', url, mode: 'cors' }, respondWith: p => { result = p; } });
    assert.equal(await result, w.cached);
  }
  assert.equal(w.matches.length, 3); assert.ok(w.matches.every(m => m.options.ignoreSearch));
});
test('API requests bypass offline cache and updates preserve unrelated caches', async () => {
  const removed = []; const caches = { keys: async () => ['spidey-app-old', 'unrelated-cache'], delete: async key => removed.push(key) };
  const w = worker({ caches }); let handled = false;
  w.listeners.fetch({ request: { method: 'GET', url: 'https://spidey.test/spidey-app/api/push/public-key' }, respondWith: () => { handled = true; } });
  assert.equal(handled, false);
  let done; w.listeners.activate({ waitUntil: p => { done = p; } }); await done;
  assert.deepEqual(removed, ['spidey-app-old']);
});
test('notification clicks open the application scope and focus its own window', async () => {
  const opened = []; const navigated = []; let focused = 0;
  const clients = { matchAll: async () => [{ url: 'https://spidey.test/other', focus: () => { throw Error('wrong window'); } }], openWindow: async url => opened.push(url) };
  const w = worker({ clients }); let done;
  w.listeners.notificationclick({ notification: { close() {}, data: {} }, waitUntil: p => { done = p; } }); await done;
  assert.deepEqual(opened, ['https://spidey.test/spidey-app/']);
  clients.matchAll = async () => [{ url: 'https://spidey.test/spidey-app/', navigate: url => navigated.push(url), focus: () => { focused++; } }];
  w.listeners.notificationclick({ notification: { close() {}, data: { url: '?event=zorua' } }, waitUntil: p => { done = p; } }); await done;
  assert.deepEqual(navigated, ['https://spidey.test/spidey-app/?event=zorua']); assert.equal(focused, 1);
});
