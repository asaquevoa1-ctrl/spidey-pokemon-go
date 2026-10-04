const test = require('node:test');
const assert = require('node:assert/strict');

test('public endpoint exposes only the public key and rejects incomplete configuration', async () => {
  const { default: handler } = await import('../api/push/public-key.js');
  const names = ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'BLOB_READ_WRITE_TOKEN'];
  const original = Object.fromEntries(names.map(n => [n, process.env[n]]));
  function invoke(method = 'GET') {
    const result = { headers: {} };
    const response = { setHeader: (k, v) => { result.headers[k] = v; }, status(code) { result.code = code; return response; }, json(body) { result.body = body; return result; } };
    return handler({ method }, response);
  }
  try {
    for (const name of names) process.env[name] = 'qa-dummy-value';
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const ready = invoke(); assert.equal(ready.code, 200); assert.deepEqual(ready.body, { publicKey: 'qa-dummy-value' });
    assert.equal(ready.headers['Cache-Control'], 'no-store');
    for (const name of names.filter(name => name !== 'BLOB_READ_WRITE_TOKEN')) {
      delete process.env[name]; const unavailable = invoke();
      assert.equal(unavailable.code, 503, name); assert.deepEqual(unavailable.body, { error: 'push_not_configured' });
      process.env[name] = 'qa-dummy-value';
    }
    delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.BLOB_READ_WRITE_TOKEN = 'private-test-token'; assert.equal(invoke().code, 200);
    delete process.env.BLOB_READ_WRITE_TOKEN; assert.equal(invoke().code, 503);
    assert.equal(invoke('POST').code, 405);
  } finally {
    for (const name of names) if (original[name] === undefined) delete process.env[name]; else process.env[name] = original[name];
  }
});
