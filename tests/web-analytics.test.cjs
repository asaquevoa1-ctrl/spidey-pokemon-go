const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('spidey-app/web-analytics.js', 'utf8');
const token = '1234567890abcdef1234567890abcdef';
function run(options = {}) {
  const appended = [];
  const context = {
    navigator: options.navigator || {},
    window: options.window || {},
    location: { hostname: 'asaquevoa1-ctrl.github.io', pathname: '/spidey-pokemon-go/spidey-app/', ...options.location },
    document: {
      currentScript: { dataset: { siteToken: options.token === undefined ? token : options.token } },
      querySelector: () => options.existing || null,
      createElement: () => ({ dataset: {} }),
      head: { appendChild: element => appended.push(element) },
    },
  };
  // Access to personal state is an error, not a source for analytics.
  for (const name of ['localStorage', 'sessionStorage', 'indexedDB', 'fetch']) {
    Object.defineProperty(context, name, { get() { throw new Error('Forbidden: ' + name); } });
  }
  vm.runInNewContext(source, context);
  return appended;
}

test('loads only the official beacon with SPA tracking disabled and no personal state', () => {
  const scripts = run();
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].type, 'module');
  assert.equal(scripts[0].src, 'https://static.cloudflareinsights.com/beacon.min.js');
  assert.deepEqual(JSON.parse(scripts[0].dataset.cfBeacon), { token, spa: false });
});

test('does not measure previews, other sites, or pages outside Spidey', () => {
  for (const location of [
    { hostname: 'localhost' },
    { hostname: 'preview.example.org' },
    { pathname: '/another-app/' },
  ]) assert.equal(run({ location }).length, 0);
});

test('respects privacy preferences before contacting Cloudflare', () => {
  for (const navigator of [
    { globalPrivacyControl: true },
    { doNotTrack: '1' },
    { doNotTrack: 'yes' },
  ]) assert.equal(run({ navigator }).length, 0);
  assert.equal(run({ window: { doNotTrack: '1' } }).length, 0);
});

test('an absent identifier or duplicate loader sends nothing', () => {
  for (const token of [null, '', 'not-a-public-site-token']) assert.equal(run({ token }).length, 0);
  assert.equal(run({ existing: {} }).length, 0);
});
