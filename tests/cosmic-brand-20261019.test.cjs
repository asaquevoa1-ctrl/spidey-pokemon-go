const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const root='spidey-app/';
const assets=JSON.parse(fs.readFileSync(root+'data/cosmic-brand-assets-20261019.json','utf8'));
const list=Object.fromEntries(assets.images.map(i=>[i.role,i]));
test('five independent image compositions and 192/512 launcher variants registered',()=>{
  assert.equal(assets.status,'STAGED_AWAITING_BINARY_ASSETS');
  for(const role of ['opening','loading','icon','wallpaper','clean','icon-192','icon-512']){
    assert.ok(list[role],role);
    assert.match(list[role].path,/^assets\/branding\/20261019\//);
    assert.match(list[role].sha256,/^[a-f0-9]{64}$/);
    assert.ok(list[role].size>15000);
  }
});
test('do not switch icon or show missing images until actual binaries uploaded',()=>{
  const html=fs.readFileSync(root+'index.html','utf8');
  const manifest=JSON.parse(fs.readFileSync(root+'manifest.webmanifest','utf8'));
  const sw=fs.readFileSync(root+'sw.js','utf8');
  assert.ok(html.includes('window.SPIDEY_COSMIC_ASSETS_VERIFIED=false'));
  assert.ok(html.includes('cosmic-brand-20261019.js?v=1'));
  assert.ok(html.includes('cosmic-brand-20261019.css?v=1'));
  assert.ok(manifest.icons.some(i=>i.src==='assets/spidey-icon-192.svg'));
  assert.ok(sw.includes("'./assets/spidey-logo-oficial.jpg'"));
  assert.equal(sw.includes(list.opening.path),false,'Missing assets must not break PWA install/offline');
});
test('staged JS respects the fast startup, missing assets and reduced-motion choice',()=>{
 const js=fs.readFileSync(root+'cosmic-brand-20261019.js','utf8');
 const css=fs.readFileSync(root+'cosmic-brand-20261019.css','utf8');
 assert.ok(js.includes('SPIDEY_COSMIC_ASSETS_VERIFIED !== true'));
 assert.ok(js.includes('Date.now() - started > 1900'));
 assert.ok(js.includes("preload(files.opening),preload(files.loading)"));
 assert.ok(js.includes("window.matchMedia?.('(prefers-reduced-motion: reduce)')"));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.doesNotThrow(()=>new vm.Script(js));
 let imgTouched=false;
 vm.runInNewContext(js,{window:{SPIDEY_COSMIC_ASSETS_VERIFIED:false},document:{getElementById(){imgTouched=true;throw Error('should not run')}}});
 assert.equal(imgTouched,false);
});
