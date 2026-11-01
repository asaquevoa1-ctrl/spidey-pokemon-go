'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Rocket Shadow Premium: poster binary hash integrity and dimensions',()=>{
 const manifest=JSON.parse(read('spidey-app/data/rocket-premium-art-manifest-20261101.json'));
 assert.equal(manifest.images.length,4);
 for(const image of manifest.images){
  const buf=fs.readFileSync(path.join(root,'spidey-app',image.path));
  assert.equal(buf.length,image.bytes,image.id);
  assert.equal(crypto.createHash('sha256').update(buf).digest('hex'),image.sha256,image.id);
  assert.equal(buf.toString('ascii',0,4),'RIFF',image.id);
  assert.equal(buf.toString('ascii',8,12),'WEBP',image.id);
 }
});
test('Rocket Shadow Premium: official dynamic source and stale-lineup guard intact',()=>{
 const js=read('spidey-app/rocket-premium-3d.js');
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const id of ['giovanni','cliff','arlo','sierra'])assert.match(js,new RegExp(id+'-premium-shadow\.webp'));
 assert.match(js,/member\.slots\.every/);
 assert.match(js,/matchingPoster\(member\)/);
 assert.match(js,/card\.classList\.add\('rocket-3d-card-poster'\)/);
 assert.match(js,/addEventListener\('error'/);
 const html=read('spidey-app/index.html');
 assert.match(html,/rocket-premium-3d\.js\?v=20261101-shadow1/);
 assert.match(html,/rocket-premium-3d\.css\?v=20261101-shadow1/);
 const css=read('spidey-app/rocket-premium-3d.css');
 assert.match(css,/object-fit:contain/);
 assert.match(css,/rocket-3d-card-poster/);
});
