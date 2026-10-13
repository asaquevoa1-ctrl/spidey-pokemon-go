const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'..','spidey-app','hunter-v1.js'),'utf8');
const window={};
const document={readyState:'loading',addEventListener(){}};
vm.runInNewContext(source,{window,document});
const {classifyIV,parseCoords}=window.SpideyHunterCore;

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
  assert.doesNotMatch(source,/\bfetch\s*\(/);
  assert.match(source,/rel="noopener noreferrer"/);
});