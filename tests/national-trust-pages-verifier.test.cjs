const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const qa = readFileSync(join(root, 'scripts/qa_trust_27_public_pages.mjs'), 'utf8');
const sw = readFileSync(join(root, 'spidey-app/sw.js'), 'utf8');

test('verificador público acompanha a versão corrente do cache do service worker', () => {
  assert.match(sw, /const CACHE = ['"]spidey-app-[^'"]+['"]/);
  assert.match(qa, /assert\.match\(sw,\/const CACHE =/);
  assert.match(qa, /client\.navigate\(client\.url\)/);
  assert.doesNotMatch(qa, /fly-clean2-autorefresh/);
});
