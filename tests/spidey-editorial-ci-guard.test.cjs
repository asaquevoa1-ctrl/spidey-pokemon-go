const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
test('GitHub Pages não empacota nem publica catálogo sem gate editorial',()=>{
  const s=read('.github/workflows/spidey-pages.yml');
  const gate=s.indexOf('run: node scripts/check_editorial_integrity.cjs');
  const build=s.indexOf('run: python scripts/build_spidey_pages.py');
  assert.ok(gate>0&&build>gate,'O gate deve acontecer antes do empacotamento público');
  assert.match(s,/config\/spidey-art-date-scopes\.json/);
});
test('Autopublicação do catálogo bloqueia erro antes do commit',()=>{
  const s=read('.github/workflows/spidey-app-auto-publish.yml');
  const gate=s.indexOf('run: node scripts/check_editorial_integrity.cjs');
  const commit=s.indexOf('- name: Gravar resultado');
  assert.ok(gate>0&&commit>gate,'O gate deve acontecer antes do commit de eventos');
});
