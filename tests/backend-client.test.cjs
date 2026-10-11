const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');

function client(config) {
  const tab = { hidden: true }, classes = {};
  const window = { SPIDEY_BACKEND: config };
  vm.runInNewContext(fs.readFileSync('spidey-app/backend.js', 'utf8'), {
    window, URL, document: { querySelector: selector => selector.includes('friendsView') ? tab : { classList: { toggle: (key, value) => { classes[key] = value; } } } },
  });
  return { ...window.SpideyBackend, tab, classes };
}
test('unconfigured Pages keeps optional Friends hidden and alerts use the static availability endpoint', () => {
  const c = client({ enabled: false, url: null });
  assert.equal(c.tab.hidden, true);
  assert.equal(c.url('api/push/public-key'), 'api/push/public-key');
  assert.equal(c.enabled, false);
});
test('verified additional service receives API calls while the app URL stays on Pages', () => {
  const c = client({ enabled: true, url: 'https://spidey-backend.example.workers.dev' });
  assert.equal(c.tab.hidden, false);
  assert.equal(c.classes['has-friends'], true);
  assert.equal(c.url('api/social'), 'https://spidey-backend.example.workers.dev/api/social');
  assert.equal(c.url('/api/push/subscribe'), 'https://spidey-backend.example.workers.dev/api/push/subscribe');
});
