const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=name=>fs.readFileSync('spidey-app/'+name,'utf8');

test('ANA, Trust and Selos keep valid scripts and no approved image data is changed',()=>{
  for(const name of ['ana-airports.js','national-trust-v1.js','app.js'])
    assert.doesNotThrow(()=>new vm.Script(read(name),{filename:name}),name);
  const ana=read('ana-airports.js');
  assert.match(ana,/poster\.getAttribute\('src'\)!==target/);
  assert.match(ana,/if\(isNewPoster\)\{/);
  assert.match(ana,/lastAirportMarkup!==markup/);
  assert.match(ana,/exact_raid_gym_verified===false/);
  assert.match(ana,/poster\.dataset\.activeFile=original\.file/);
  const trust=read('national-trust-v1.js');
  assert.match(trust,/if\(identity===lastDisplayedPlaces\)return/);
  assert.match(trust,/document\.createDocumentFragment\(\)/);
  assert.match(trust,/placesRevision\+\+/);
  assert.match(trust,/exact_pokestop_verified===false/);
});

test('Reabrir Selos sem mudar dados nem progresso reutiliza cartões, mas atualização invalida cache',()=>{
  const app=read('app.js');
  const first=app.indexOf('let lastStampCatalog=null, lastStampProgressSignature=');
  const last=app.indexOf('function stampCoordinateLabel(',first);
  assert.ok(first>=0&&last>first);
  const code=app.slice(first,last);
  let writes=0,stats=0,value='';
  const stampList={
    dataset:{},
    set innerHTML(v){value=v;writes++;},
    get innerHTML(){return value;}
  };
  const state={stamps:[]};
  const {renderStamps}=vm.runInNewContext(code+'\n({renderStamps})',{state,stampList,renderStampStats:()=>stats++});
  renderStamps();
  assert.equal(writes,2,'Empty state should be rendered once');
  renderStamps();
  assert.equal(writes,2,'Returning to unchanged Selos should not recreate the DOM');
  assert.equal(stats,2,'Counts remain refreshed');
  state.stamps=[];
  renderStamps();
  assert.equal(writes,4,'New catalog must invalidate rendered state');
  stampList.dataset.stampCardsReady='false';
  renderStamps();
  assert.equal(writes,6,'External list reset must invalidate rendered state');
});

test('New PWA build versions preserve the official cosmic logo and original data',()=>{
  const html=read('index.html'),sw=read('sw.js');
  for(const name of ['app','ana-airports','national-trust-v1'])
    assert.ok(html.includes(name+'.js?v=20261029-guides-stable1'),name);
  assert.match(sw,/20261029-guides-stable1/);
  assert.match(html,/spidey-icon-cosmic-192\.png/);
  assert.match(html,/stamps-v2\.js\?v=20261029-pokelids-mobile-pages2/);
});
