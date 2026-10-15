const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const ids=['2026-ana-pokemon-jet-red','2026-ana-pokemon-jet-green'];
const expected={
 '2026-ana-pokemon-jet-red':{n:7,uniqueAirports:6,pokemon:'Charmander',start:'2026-07-28T16:00:00+09:00',source:'2026_ana_red'},
 '2026-ana-pokemon-jet-green':{n:14,uniqueAirports:14,pokemon:'Bulbasaur',start:'2026-09-18T14:00:00+09:00',source:'2026_ana_green'}
};
test('ANA red/green event dates and airports follow the official announcement',()=>{
 for(const id of ids){
  const a=events.filter(e=>e.id===id);assert.equal(a.length,1);
  const e=a[0],x=expected[id];
  assert.equal(e.locations.length,x.n);
  assert.equal(new Set(e.locations.map(loc=>loc.airport_code)).size,x.uniqueAirports);
  assert.ok(e.source.url.includes(x.source));
  assert.equal(e.source.confidence,'official');
  assert.equal(e.schedule.local_timezone,'Asia/Tokyo');
  assert.equal(e.schedule.start_local,x.start);
  assert.equal(e.schedule.end_local,'2027-08-31T20:00:00+09:00');
  assert.ok(e.pokemon.some(p=>p.name===x.pokemon));
  assert.equal(e.notifications.enabled,false,'Do not spam users with repeating yearlong raid notices');
  assert.equal(e.gpx.enabled,false,'Airport references cannot be used as verified raid-gym GPX points');
 }
});
test('All 21 coordinates are copyable airport/terminal references, not purported exact gyms',()=>{
 const points=events.filter(e=>ids.includes(e.id)).flatMap(e=>e.locations);
 assert.equal(points.length,21);
 assert.equal(new Set(points.map(p=>p.airport_code)).size,20);
 const indices=points.map(p=>p.coordinate_text);
 assert.equal(new Set(indices).size,21);
 for(const p of points){
  const [lat,lon]=p.coordinate_text.split(',').map(Number);
  assert.ok(Number.isFinite(lat)&&Math.abs(lat)<=90);
  assert.ok(Number.isFinite(lon)&&Math.abs(lon)<=180);
  assert.equal(p.latitude,lat);
  assert.equal(p.longitude,lon);
  assert.equal(p.coordinate_type,'airport_terminal_reference');
  assert.equal(p.coordinate_confidence,'community_reference');
  assert.equal(p.exact_raid_gym_verified,false);
  assert.ok(p.coordinate_source.startsWith('https://'));
 }
 const haneda=points.filter(p=>p.airport_code==='HND');
 assert.equal(haneda.length,2);
 assert.ok(haneda.some(p=>p.label.includes('Terminal 2')));
 assert.ok(haneda.some(p=>p.label.includes('Terminal 3')));
});
test('dedicated ANA view shows source-labelled coordinates without implying gym precision',()=>{
 const js=fs.readFileSync('spidey-app/ana-airports.js','utf8');
 const app=fs.readFileSync('spidey-app/app.js','utf8');
 const w={},document={readyState:'loading',addEventListener(){}};
 vm.runInNewContext(js,{window:w,document});
 assert.equal(w.SpideyAnaAirportCore.parse('35.550815,139.788233'),'35.550815,139.788233');
 assert.equal(w.SpideyAnaAirportCore.parse('91.55,139.788233'),null);
 assert.match(js,/data-ana-coord/);
 assert.match(js,/id='anaView'/);
 assert.match(js,/main.appendChild\(view\)/);
 assert.match(js,/navigator\.clipboard\.writeText/);
 assert.match(js,/Ginásio NÃO verificado/);
 assert.match(app,/Referência do aeroporto\/terminal/);
 assert.doesNotMatch(js,/localStorage\.setItem/);
});
