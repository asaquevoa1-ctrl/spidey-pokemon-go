const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs');
test('live catalog prefers new main-branch content and falls back to a valid saved catalog on failure', async () => {
  for (const offline of [false, true]) {
    const calls = [];
    const window = {};
    const context = vm.createContext({ window, Object, encodeURIComponent, AbortSignal, fetch: async path => {
      calls.push(path);
      if (path.startsWith('api/') && offline) throw Error('offline');
      return { ok: true, json: async () => ({ events: [{ id: path.startsWith('api/') ? 'new' : 'saved' }] }) };
    } });
    vm.runInContext(fs.readFileSync('spidey-app/catalog.js', 'utf8'), context);
    const data = await window.SpideyCatalog.load('events');
    assert.equal(data.events[0].id, offline ? 'saved' : 'new');
    assert.equal(calls.length, offline ? 2 : 1);
    await assert.rejects(window.SpideyCatalog.load('../../private'));
  }
});
