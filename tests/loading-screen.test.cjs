const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const root = 'spidey-app/';
function makeHarness(reduced = false) {
  const handlers = new Map();
  const pending = new Map();
  const classes = new Set();
  const bodyClasses = new Set();
  let id = 0, now = 0;
  const splash = {
    hidden: false, attrs: {},
    classList: { add(name) { classes.add(name); } },
    setAttribute(name, value) { this.attrs[name] = value; },
  };
  const window = {
    matchMedia: () => ({ matches: reduced }),
    addEventListener: (name, fn) => handlers.set(name, fn),
    setTimeout: (fn, delay) => {
      const key = ++id;
      pending.set(key, { fn, at: now + delay });
      return key;
    },
    clearTimeout: key => pending.delete(key),
  };
  const document = {
    getElementById: () => splash,
    body: { classList: { add: v => bodyClasses.add(v), remove: v => bodyClasses.delete(v) } },
  };
  const clock = { now: () => now };
  vm.runInNewContext(fs.readFileSync(root + 'loading-screen.js', 'utf8'), { window, document, Date: clock });
  function flush() {
    for (let i = 0; i < 10 && pending.size; i++) {
      const [key, task] = [...pending.entries()].sort((a,b) => a[1].at - b[1].at)[0];
      pending.delete(key);
      now = task.at;
      task.fn();
    }
  }
  return { handlers, splash, classes, bodyClasses, flush };
}

test('loading screen uses newly approved cosmic logo, covers page briefly and caches assets offline', () => {
  const html = fs.readFileSync(root + 'index.html', 'utf8');
  const css = fs.readFileSync(root + 'loading-screen.css', 'utf8');
  const sw = fs.readFileSync(root + 'sw.js', 'utf8');
  assert.ok(html.includes('id="spideySplash"'));
  assert.ok(html.indexOf('id="spideySplash"') < html.indexOf('<header class="topbar">'));
  assert.ok(html.includes('spidey-splash-logo" src="assets/branding/20261019/spidey-icon-cosmic-192.png"'));
  assert.ok(html.includes('loading-screen.css?v='));
  assert.ok(html.includes('loading-screen.js?v='));
  assert.ok(html.includes('2100);</script>'));
  assert.ok(css.includes('2.05s'));
  assert.ok(html.includes('spidey-critical-exit'));
  assert.ok(fs.existsSync(root + 'assets/spidey-logo-oficial.jpg'));
  assert.ok(css.includes('position: fixed;'));
  assert.ok(css.includes('prefers-reduced-motion: reduce'));
  assert.ok(css.includes('.spidey-splash[hidden]'));
  assert.ok(sw.includes("'./loading-screen.css'"));
  assert.ok(sw.includes("'./loading-screen.js'"));
  assert.ok(!html.slice(html.indexOf('id="spideySplash"'), html.indexOf('<header')).includes('SpideyNexus'));
});

test('first catalog render automatically dismisses screen', () => {
  const h = makeHarness();
  assert.ok(h.bodyClasses.has('spidey-loading'));
  assert.equal(h.splash.hidden, false);
  h.handlers.get('spideycontentready')();
  h.flush();
  assert.equal(h.splash.hidden, true);
  assert.equal(h.splash.attrs['aria-hidden'], 'true');
  assert.ok(h.classes.has('is-leaving'));
  assert.equal(h.bodyClasses.has('spidey-loading'), false);
});

test('offline failure or stalled network cannot trap user behind loading screen', () => {
  for (const reason of ['spideycontentsettled', 'timeout']) {
    const h = makeHarness();
    if (reason !== 'timeout') h.handlers.get(reason)();
    h.flush();
    assert.equal(h.splash.hidden, true, reason);
    assert.equal(h.bodyClasses.has('spidey-loading'), false);
  }
});

test('reduced motion dismisses immediately and no tab change reopens splash', () => {
  const h = makeHarness(true);
  h.handlers.get('spideycontentready')();
  h.flush();
  assert.equal(h.splash.hidden, true);
  assert.ok(!h.handlers.has('popstate'));
  const app = fs.readFileSync(root + 'app.js', 'utf8');
  assert.ok(app.includes('spideycontentsettled'));
  assert.doesNotThrow(() => new vm.Script(fs.readFileSync(root + 'loading-screen.js', 'utf8')));
});
