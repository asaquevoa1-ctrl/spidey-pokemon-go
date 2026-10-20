const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root='spidey-app/';
const assets=JSON.parse(fs.readFileSync(root+'data/cosmic-brand-assets-20261019.json','utf8'));
const list=Object.fromEntries(assets.images.map(i=>[i.role,i]));
test('five independent image compositions and 192/512 launcher variants registered',()=>{
  assert.equal(assets.status,'BINARIES_COMMITTED');
  for(const role of ['opening','loading','icon','wallpaper','clean','icon-192','icon-512']){
    assert.ok(list[role],role);
    assert.match(list[role].path,/^assets\/branding\/20261019\//);
    assert.match(list[role].sha256,/^[a-f0-9]{64}$/);
    assert.ok(list[role].size>15000);
    const binary=fs.readFileSync(root+list[role].path);
    assert.equal(binary.length,list[role].size,role+' size');
    assert.equal(crypto.createHash('sha256').update(binary).digest('hex'),list[role].sha256,role+' hash');
  }
});
test('verified cosmic artwork and launcher safely integrated into app and offline cache',()=>{
  const html=fs.readFileSync(root+'index.html','utf8');
  const manifest=JSON.parse(fs.readFileSync(root+'manifest.webmanifest','utf8'));
  const sw=fs.readFileSync(root+'sw.js','utf8');
  assert.ok(html.includes('window.SPIDEY_COSMIC_ASSETS_VERIFIED=true'));
  assert.ok(html.includes('cosmic-brand-20261019.js?v=20261020-release1'));
  assert.ok(html.includes('cosmic-brand-20261019.css?v=20261020-release1'));
  assert.equal(manifest.icons[0].src,'assets/branding/20261019/spidey-icon-cosmic-192.png');
  assert.equal(manifest.icons[1].src,'assets/branding/20261019/spidey-icon-cosmic-512.png');
  assert.ok(sw.includes("'./assets/spidey-logo-oficial.jpg'"));
  for(const image of assets.images) assert.ok(sw.includes("'./"+image.path+"'"),'Not cached: '+image.role);
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
