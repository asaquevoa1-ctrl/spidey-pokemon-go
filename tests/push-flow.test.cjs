const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function setup(options = {}) {
  const status = { textContent: '', hidden: true };
  const button = { disabled: false, textContent: 'Ativar alertas' };
  const calls = { permission: 0, subscribe: 0, saved: 0 };
  const subscription = { toJSON: () => ({ endpoint: 'https://example.test/push', keys: { p256dh: 'test', auth: 'test' } }) };
  const Notification = { permission: options.permission || 'default', async requestPermission() { calls.permission++; return options.answer || 'granted'; } };
  const registration = { pushManager: { async getSubscription() { return options.existing ? subscription : null; }, async subscribe() { calls.subscribe++; return subscription; } } };
  const window = { addEventListener() {}, Notification, PushManager: function () {} };
  const context = vm.createContext({
    window, Notification, navigator: { serviceWorker: { ready: options.timeout ? new Promise(() => {}) : Promise.resolve(registration) }, language: 'pt-BR', userAgent: 'QA' },
    document: { querySelector: s => s === '#notificationStatus' ? status : button, addEventListener() {} },
    console: { error() {} }, Intl, Uint8Array, atob, URLSearchParams,
    setTimeout: options.timeout ? fn => { queueMicrotask(fn); return 1; } : setTimeout, clearTimeout,
    async fetch(url) {
      if (options.networkError) throw new Error('offline');
      if (url.endsWith('public-key')) return { ok: !options.unconfigured, json: async () => ({ publicKey: options.emptyKey ? '' : 'AQ' }) };
      calls.saved++;
      return { ok: !options.saveFailure, status: options.saveFailure ? 503 : 201 };
    },
  });
  if (options.unsupported) delete window.PushManager;
  vm.runInContext(fs.readFileSync('spidey-app/push.js', 'utf8'), context);
  return { run: window.SpideyPush.subscribeRemotePush, check: window.SpideyPush.checkRemotePushAvailability, status, button, calls };
}

test('unavailable server or missing key never requests permission or claims activation', async () => {
  for (const options of [{ unconfigured: true }, { emptyKey: true }, { networkError: true }, { unsupported: true }]) {
    const s = setup(options); assert.equal(await s.run(), false);
    assert.equal(s.calls.permission, 0); assert.equal(s.calls.subscribe, 0); assert.equal(s.calls.saved, 0);
    assert.equal(s.button.disabled, !options.networkError); assert.equal(s.status.hidden, false);
    assert.equal(s.button.textContent, options.networkError ? 'Verificar alertas' : 'Alertas indisponíveis');
    assert.doesNotMatch(s.status.textContent, /ativadas/);
  }
});
test('availability check never subscribes or asks permission, and recovers when the server becomes ready', async () => {
  const options = { unconfigured: true };
  const s = setup(options);
  assert.equal(await s.check(), null);
  assert.equal(s.button.disabled, true);
  assert.equal(s.button.textContent, 'Alertas indisponíveis');
  assert.deepEqual(s.calls, { permission: 0, subscribe: 0, saved: 0 });
  options.unconfigured = false;
  assert.equal(await s.check(), 'AQ');
  assert.equal(s.button.disabled, false);
  assert.equal(s.button.textContent, 'Ativar alertas');
  assert.deepEqual(s.calls, { permission: 0, subscribe: 0, saved: 0 });
});
test('temporary network failure leaves a retry and a subsequent availability check succeeds', async () => {
  const options = { networkError: true };
  const s = setup(options);
  assert.equal(await s.check(), null);
  assert.equal(s.button.disabled, false);
  assert.equal(s.button.textContent, 'Verificar alertas');
  options.networkError = false;
  assert.equal(await s.check(), 'AQ');
  assert.equal(s.button.textContent, 'Ativar alertas');
  assert.equal(s.calls.permission, 0);
});
test('denied permission and failed storage never report active alerts', async () => {
  const denied = setup({ answer: 'denied' }); assert.equal(await denied.run(), false); assert.equal(denied.calls.saved, 0);
  const failed = setup({ saveFailure: true }); assert.equal(await failed.run(), false);
  assert.doesNotMatch(failed.status.textContent, /ativadas/); assert.equal(failed.button.textContent, 'Ativar alertas');
});
test('repeated taps share one activation and one saved subscription', async () => {
  const s = setup(); const first = s.run(); const second = s.run(); assert.equal(first, second);
  assert.equal(s.button.disabled, true); assert.equal(await first, true); assert.equal(await second, true);
  assert.deepEqual(s.calls, { permission: 1, subscribe: 1, saved: 1 });
  assert.equal(s.button.disabled, false); assert.equal(s.button.textContent, 'Alertas ativos');
});
test('existing subscription is reused and failed worker readiness permits a retry', async () => {
  const existing = setup({ permission: 'granted', existing: true }); assert.equal(await existing.run(), true);
  assert.deepEqual(existing.calls, { permission: 0, subscribe: 0, saved: 1 });
  const timedOut = setup({ timeout: true }); assert.equal(await timedOut.run(), false); assert.equal(timedOut.button.disabled, false);
  assert.equal(await timedOut.run(), false); assert.equal(timedOut.calls.permission, 2);
});
