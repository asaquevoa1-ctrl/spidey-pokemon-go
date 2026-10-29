'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const guide=JSON.parse(fs.readFileSync('spidey-app/data/stamps.json')).rallies.find(e=>e.id==='2026-dia-de-muertos-reforma-stamp-guide');
const expected=['19.42790, -99.16620','19.42941, -99.16447','19.42910, -99.16164','19.42800, -99.16446','19.42530, -99.17020','19.42770, -99.16760'];
function render(rally=guide){
 const copied=[],handlers=new Map();
 const buttons=(rally.route_references||[]).map(p=>({dataset:{copyGuideCoordinate:p.id},addEventListener(k,fn){handlers.set(p.id,fn)}}));
 const all={addEventListener(k,fn){handlers.set('all',fn)}};
 const field={value:'',closest(){return {open:false}},focus(){},select(){},setSelectionRange(){}};
 const detail={innerHTML:'',querySelectorAll(){return buttons},querySelector(s){return s==='[data-copy-guide-route]'?all:field}};
 const scope={window:{},detail,navigator:{clipboard:{writeText:async text=>copied.push(text)}},beginAppDialog(){},showAppDialog(){},showToast(){},validCoordinate:p=>Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90&&Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180};
 vm.runInNewContext(fs.readFileSync('spidey-app/stamps-v2.js','utf8'),scope);scope.openStampRally(rally);
 return {copied,handlers,html:detail.innerHTML};
}
test('six map references retain the supplied coordinates without claiming exact stops or adding stamp progress',()=>{
 assert.equal(guide.route_references.length,6);assert.equal(guide.stamp_count,null);assert.deepEqual(guide.stops,[]);
 for(const p of guide.route_references){assert.equal(p.coordinate_type,'venue_reference');assert.equal(p.exact_pokestop_verified,false);assert.equal(p.gpx_enabled,false);assert.equal(p.coordinate_confidence,'community_reported')}
 assert.deepEqual(guide.route_references.map(p=>p.latitude.toFixed(5)+', '+p.longitude.toFixed(5)),expected);
});
test('copying each point and the complete list uses only the six references, in map order',async()=>{
 const r=render();for(const p of guide.route_references)r.handlers.get(p.id)();r.handlers.get('all')();await Promise.resolve();
 assert.deepEqual(r.copied,[...expected,expected.join('\n')]);
 assert.equal((r.html.match(/data-reforma-reference=/g)||[]).length,6);assert.ok(!r.html.includes('downloadRallyGpx'));assert.ok(!r.html.includes('0/0'));
});
test('invalid or unverified copy permissions cannot generate a coordinate card; labels are escaped',()=>{
 const bad=structuredClone(guide);bad.route_references[0].latitude=91;bad.route_references[1].reference_only_copyable=false;bad.route_references[2].name='<img src=x onerror=bad()>';
 const r=render(bad);assert.equal((r.html.match(/data-reforma-reference=/g)||[]).length,4);assert.ok(r.html.includes('&lt;img'));assert.ok(!r.html.includes('<img src=x'));
});
