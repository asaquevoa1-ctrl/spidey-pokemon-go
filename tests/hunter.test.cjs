const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'..','spidey-app','hunter-v1.js'),'utf8');
const window={};
const document={readyState:'loading',addEventListener(){}};
vm.runInNewContext(source,{window,document});
const {classifyIV,parseCoords,parseMessageCoords}=window.SpideyHunterCore;

test('hunter: 100% and 0% IV are classified exactly',()=>{
  assert.equal(classifyIV([15,15,15]).hundo,true);
  assert.equal(classifyIV([15,15,15]).percent,100);
  assert.equal(classifyIV([0,0,0]).nundo,true);
  assert.equal(classifyIV([0,0,0]).percent,0);
  assert.equal(classifyIV([0,15,15]).hundo,false);
});
test('hunter: IV rejects missing, fractional and out-of-range values',()=>{
  for(const v of [[15,15],[16,15,15],[-1,0,0],[15,15,14.5],['15',15,15],null])assert.equal(classifyIV(v),null);
});
test('hunter: coordinates preserve precision and accept signed decimal degrees',()=>{
  assert.equal(parseCoords(' -25.422100, -49.271700 '),'-25.422100,-49.271700');
  assert.equal(parseCoords('38.8315,-77.31472'),'38.8315,-77.31472');
  assert.equal(parseCoords('0,0'),'0,0');
  assert.equal(parseCoords('90,-180'),'90,-180');
});
test('hunter: coordinates reject unsafe, out-of-bounds or incomplete input',()=>{
  for(const input of ['abc','91,1','-91,1','12,181','1,-181','1,2,3','NaN,NaN','<script>,2','12;34',''])assert.equal(parseCoords(input),null);
});
test('hunter: external search is clearly identified, no hidden provider requests',()=>{
  assert.match(source,/pogocoordinates\.com\/feeds\/high-cp-100iv/);
  assert.match(source,/pogocoordinates\.com\/feeds\/zero-iv/);
  for (const slug of ['rare-100iv','regional-100iv','level-35-100iv']) assert.ok(source.includes(slug));
  assert.match(source,/hunterPaste/);
  assert.doesNotMatch(source,/\bfetch\s*\(/);
  assert.match(source,/rel="noopener noreferrer"/);
});
test('hunter: parses coordinate messages locally without fetching personal data',()=>{
  assert.equal(parseMessageCoords('100 IV • 40.712345,-73.987654 • desparece em 8 min'),'40.712345,-73.987654');
  assert.equal(parseMessageCoords('Poke #025\nLat: -25.4221\nLon: -49.2717'),'-25.4221,-49.2717');
  assert.equal(parseMessageCoords('IV 15,15,15 | PC 891'),null);
  assert.equal(parseMessageCoords('teste (91.12,-73.88)'),null);
  assert.equal(parseMessageCoords('Visit https://evil.example/login'),null);
  assert.equal(parseMessageCoords('<script>alert(1)</script>'),null);
  assert.doesNotMatch(source,/\b(?:localStorage|sessionStorage)\.setItem\s*\(/);
  assert.doesNotMatch(source,/\bfetch\s*\(/);
});
test('hunter: independent Filtro page and tab, no longer mounted inside FLY',()=>{
  assert.match(source,/s\.id='hunterView'/);
  assert.match(source,/tab\.dataset\.view='hunterView'/);
  assert.match(source,/tab\.textContent='Filtro'/);
  assert.match(source,/setView\('hunterView'\)/);
  assert.doesNotMatch(source,/fly\.prepend\(s\)|hero\.insertAdjacentElement\('afterend',s\)/);
});
