const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('spidey-app/data/pvp.json','utf8'));
const context=vm.createContext({window:{},document:{readyState:'loading',addEventListener(){}},localStorage:{getItem(){return null}},Object,Set,Map,Date,Intl});
vm.runInContext(fs.readFileSync('spidey-app/pvp.js','utf8'),context);
test('all three leagues have unique ranks, complete moves and real opponents from the pinned PvPoke snapshot',()=>{
  assert.deepEqual(data.leagues.map(l=>l.cp),[1500,2500,10000]);
  assert.match(data.source.commit,/^[a-f0-9]{40}$/);assert.equal(data.source.license,'MIT');
  for(const l of data.leagues){
    assert.ok(l.entries.length>100);assert.equal(new Set(l.entries.map(e=>e.id)).size,l.entries.length);
    for(const e of l.entries){assert.ok(data.pokemon[e.id]?.name);assert.ok(e.score>=0&&e.score<=100);assert.ok(e.moveset.every(m=>data.moves[m]?.name));assert.ok([...e.matchups,...e.counters].every(id=>data.pokemon[id]?.name));}
  }
});
test('search handles accents, Pokédex numbers and type selection without changing the original rank',()=>{
  const l={entries:[{id:'a'},{id:'b'},{id:'c'}]},metadata={a:{name:'Flabébé',dex:669,types:['fairy']},b:{name:'Pikachu',dex:25,types:['electric']},c:{name:'Raichu',dex:26,types:['electric']}};
  const search=context.window.SpideyPvp.filteredEntries;
  assert.equal(search(l,'flabebe','',metadata)[0].id,'a');
  assert.equal(search(l,'25','',metadata)[0].rank,2);
  assert.equal(search(l,'','electric',metadata).length,2);
  assert.equal(search(l,'Pikachu','fairy',metadata).length,0);
  assert.equal(search(l,'<script>','',metadata).length,0);
});
test('team hints only report threats repeated across distinct selected Pokémon',()=>{
  const l={entries:[{id:'a',counters:['x','x','y']},{id:'b',counters:['x','z']},{id:'c',counters:['w']}]};
  assert.equal(JSON.stringify(context.window.SpideyPvp.threats(l,['a','b'])),'[["x",2]]');
  assert.equal(context.window.SpideyPvp.threats(l,['a','c']).length,0);
});
