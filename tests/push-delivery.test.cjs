const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const now = Date.parse('2026-10-04T23:00:00Z');
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
function jwt(claims, key = privateKey, algorithm = 'RS256') {
  const head = Buffer.from(JSON.stringify({ alg: algorithm, kid: 'qa-key' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${head}.${body}.${crypto.sign('RSA-SHA256', Buffer.from(`${head}.${body}`), key).toString('base64url')}`;
}
function subscription(id) {
  const curve = crypto.createECDH('prime256v1'); curve.generateKeys();
  return { endpoint: `https://fcm.googleapis.com/fcm/send/${id}`, keys: { p256dh: curve.getPublicKey().toString('base64url'), auth: crypto.randomBytes(16).toString('base64url') } };
}
test('only a genuine signed token for this main-branch workflow authorizes delivery', async () => {
  const { verifyGithubToken, DISPATCH_AUDIENCE } = await import('../spidey-app/api/push/_auth.js');
  const repo = 'asaquevoa1-ctrl/spidey-pokemon-go';
  const claims = { iss: 'https://token.actions.githubusercontent.com', aud: DISPATCH_AUDIENCE, repository: repo, ref: 'refs/heads/main', workflow_ref: `${repo}/.github/workflows/spidey-push-dispatch.yml@refs/heads/main`, sub: `repo:${repo}:ref:refs/heads/main`, event_name: 'schedule', iat: now / 1000 - 10, nbf: now / 1000 - 10, exp: now / 1000 + 300 };
  const options = { now, fetchKeys: async () => [{ ...publicKey.export({ format: 'jwk' }), kid: 'qa-key' }] };
  assert.equal(await verifyGithubToken(jwt(claims), options), true);
  for (const patch of [{ repository: 'outsider/other' }, { ref: 'refs/pull/1/merge' }, { workflow_ref: `${repo}/.github/workflows/untrusted.yml@refs/heads/main` }, { aud: 'different-api' }, { exp: now / 1000 - 1 }, { event_name: 'pull_request' }, { sub: `repo:${repo}:pull_request` }]) assert.equal(await verifyGithubToken(jwt({ ...claims, ...patch }), options), false);
  const other = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  assert.equal(await verifyGithubToken(jwt(claims, other.privateKey), options), false);
  assert.equal(await verifyGithubToken(jwt(claims, privateKey, 'none'), options), false);
});
test('subscription validation blocks private network, arbitrary host, misleading suffixes and malformed encryption keys', async () => {
  const { validSubscription, parseBody } = await import('../spidey-app/api/push/_config.js');
  const valid = subscription('qa'); assert.equal(validSubscription(valid), true);
  for (const endpoint of ['http://fcm.googleapis.com/a', 'https://127.0.0.1/a', 'https://10.1.1.1/a', 'https://example.com/a', 'https://fcm.googleapis.com.evil.test/a', 'https://user:password@fcm.googleapis.com/a', 'https://fcm.googleapis.com:8000/a']) assert.equal(validSubscription({ ...valid, endpoint }), false, endpoint);
  assert.equal(validSubscription({ ...valid, keys: { auth: 'a', p256dh: 'b' } }), false);
  assert.equal(parseBody({ body: '{invalid' }), null);
});
test('partial push delivery retries failures while successful recipients never receive duplicates', async () => {
  const { deliverJob } = await import('../spidey-app/api/push/dispatch.js');
  const job = { id: 'test-job', event_id: 'e', event_title: 'Teste', event_start: '2026-10-05T09:00:00-03:00' };
  const records = ['first', 'retry', 'expired'].map(id => ({ id, subscription: subscription(id) }));
  const calls = [];
  const first = await deliverJob({ job, records, receipt: { delivered: {} }, send: async sub => { calls.push(sub.endpoint); if (sub.endpoint.endsWith('retry')) throw { statusCode: 503 }; if (sub.endpoint.endsWith('expired')) throw { statusCode: 410 }; }, remove: async endpoint => assert.ok(endpoint.endsWith('expired')) });
  assert.equal(first.deliveries, 1); assert.equal(first.removed, 1); assert.equal(first.receipt.complete, false);
  const secondCalls = [];
  const second = await deliverJob({ job, records, receipt: first.receipt, send: async sub => secondCalls.push(sub.endpoint), remove: async () => assert.fail('Already removed') });
  assert.deepEqual(secondCalls, [records[1].subscription.endpoint]); assert.equal(second.receipt.complete, true);
});
test('a late runner never sends old start warnings or treats future jobs as due', async () => {
  const { dueJobs } = await import('../spidey-app/api/push/dispatch.js');
  const base = { id: 'e', status: 'pending', lead_minutes: 60, scheduled_for: '2026-10-04T22:30:00Z', event_start: '2026-10-04T23:30:00Z' };
  assert.equal(dueJobs({ jobs: [base] }, now).length, 1);
  for (const patch of [{ scheduled_for: '2026-10-04T23:01:00Z' }, { event_start: '2026-10-04T22:59:00Z' }, { scheduled_for: '2026-10-04T20:00:00Z' }, { scheduled_for: 'bad' }]) assert.equal(dueJobs({ jobs: [{ ...base, ...patch }] }, now).length, 0);
});
