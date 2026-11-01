'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..','spidey-app',p),'utf8');
const points=JSON.parse(read('data/world-event-points.json')).points.filter(p=>p.current_user_list_20261031);
const earth=JSON.parse(read('data/fly-earth-land-110m.json'));
const script=read('fly-globe-motion.js');
const sandbox={window:{matchMedia:()=>({matches:false})},navigator:{connection:{}},console,Intl,Math,Date};
vm.runInNewContext(script,sandbox);
const proj=sandbox.window.SpideyFlyGlobe.projectCoordinates;
const near=(lat,lon)=>earth.points.reduce((d,p)=>
 Math.min(d,Math.hypot(p[0]-lat,(p[1]-lon)*Math.cos(lat*Math.PI/180))),Infinity);
test('Natural Earth is public-domain, georeferenced WGS84-like lon/lat and replaces the fake continents',()=>{
 assert.equal(earth.license,'Public Domain');
 assert.match(earth.source,/Natural Earth/);
 assert.equal(earth.coordinate_order,'lat_lon');
 assert(earth.points.length>3000);
 assert(earth.points.every(p=>p.length===2&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180));
 assert.doesNotMatch(script,/const landPolygons=/);
 assert.match(script,/fly-earth-land-110m\.json/);
 assert.match(script,/data\.points\.every/);
});
test('Known cities align with their actual continents and exact globe coordinates',()=>{
 const known=[
  [-23.5841713,-46.66072464,'São Paulo'],[35.68895,139.69054,'Tóquio'],
  [40.7803,-73.963,'Nova York'],[-33.866173,151.205945,'Sydney'],
  [51.501,-0.1246,'Londres']];
 for(const [lat,lon,name] of known){
  assert(near(lat,lon)<2.7,name+' must fall close to actual land shape');
  const center=proj(lat,lon,lat,lon);
  assert(Math.abs(center.x)<1e-10 && Math.abs(center.y)<1e-10 && Math.abs(center.z-1)<1e-10,name+' must be exactly centered');
  assert(points.some(p=>Math.abs(p.lat-lat)<.001&&Math.abs(p.lon-lon)<.001),name+' exists in the approved list');
 }
});
test('Longitude orientation, dateline and hidden rear hemisphere are correctly projected',()=>{
 const center=proj(0,0,0,0),east=proj(0,10,0,0),west=proj(0,-10,0,0),rear=proj(0,180,0,0);
 assert.equal(center.z,1);
 assert(east.x>0 && west.x<0);
 assert(rear.z<0);
 const dateline=proj(1.987149,-157.477137,0,179);
 assert(dateline.z>0 && dateline.x>0); // 23.5° east across the date line
 assert.match(script,/if\(q\.z<0\)return/);
});
test('Original FLY points, controls and cache are retained with updated geography',()=>{
 assert.equal(points.length,64);
 assert.equal(points.filter(p=>p.essential).length,17);
 const sw=read('sw.js'),html=read('index.html');
 assert(sw.includes("'./data/fly-earth-land-110m.json'"));
 assert(html.includes('fly-globe-motion.js?v=20261101-geo2'));
 assert(script.includes('viewLat=rows[0].lat'));
 assert(script.includes('viewLat+=(p.lat-viewLat)'));
 assert(script.includes('Pausar animação'));
 assert(script.includes('America/Sao_Paulo'));
 assert.doesNotMatch(script,/Sequência ilustrativa das janelas confirmadas/);
 assert.doesNotMatch(script,/fly-globe-note/);
 assert(!html.includes('fly-globe-motion.js?v=20261101-geo2'));
});
