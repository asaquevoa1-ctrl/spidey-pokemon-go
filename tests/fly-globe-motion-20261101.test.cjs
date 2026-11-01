'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=JSON.parse(read('spidey-app/data/world-event-points.json'));
const current=source.points.filter(p=>p.current_user_list_20261031===true);
function initCore(){
 const w={};vm.runInNewContext(read('spidey-app/fly-core.js'),{window:w,fetch(){throw Error('network not allowed')},Intl,Date,Set,Math});
 return w.SpideyFlyCore;
}
test('FLY motion: all 64 user supplied references and 17 essentials retained',()=>{
 assert.equal(current.length,64);
 assert.equal(current.filter(p=>p.essential).length,17);
 assert.match(source.source_list_2023.credits,/LendáriosBrasil/);
 assert.match(source.source_list_2023.credits,/FlyGPS/);
 assert.match(source.source_list_2023.credits,/PokemonTrail/);
 assert.match(source.source_list_2023.credits,/Fantasma/);
});
test('FLY motion: chronological IANA windows are derived, never recycled from 2023',()=>{
 const event={id:'unit-local-window',status:'published',category:'spotlight_hour',tags:['global'],
  schedule:{start_local:'2026-11-03T18:00',end_local:'2026-11-03T19:00'}};
 const route=initCore().route(event,current,new Date('2026-11-01T00:00:00.000Z'));
 assert.equal(route.length,64);
 assert.equal(route[0].timezone,'Pacific/Kiritimati');
 assert.equal(route[0].start.toISOString(),'2026-11-03T04:00:00.000Z');
 assert.equal(route[0].end.toISOString(),'2026-11-03T05:00:00.000Z');
 assert(route.every((r,i)=>i===0||route[i-1].start<=r.start));
 assert(route.every(r=>r.end-r.start===3600000));
 assert.equal(route.filter(r=>r.essential).length,17);
});
test('FLY motion: UI uses same factual FlyCore route, real times and verified coordinates',()=>{
 const js=read('spidey-app/fly-globe-motion.js');
 const fly=read('spidey-app/fly-v1.js');
 const html=read('spidey-app/index.html');
 const sw=read('spidey-app/sw.js');
 assert.doesNotThrow(()=>new vm.Script(js));
 assert.match(fly,/SpideyFlyGlobe\?\.update\(e,rows,mode\)/);
 assert.match(js,/confirmedRows\.slice\(\)/);
 assert.match(js,/p\.lat.*p\.lon/);
 assert.match(js,/timeZone:zone/);
 assert.match(js,/America\/Sao_Paulo/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(js,/saveData/);
 assert.match(js,/IntersectionObserver/);
 assert.match(js,/canvas/);
 assert.match(js,/Pausar animação/);
 assert.match(js,/não representa deslocamento real/i);
 assert.doesNotMatch(js,/spider|aranha|SpideyNexus|Portugal\s*:/i);
 assert.match(html,/fly-globe-motion\.js\?v=20261101-nocaption1/);
 assert.match(html,/fly-globe-motion\.css\?v=20261101-worldglobe1/);
 assert(html.indexOf('fly-globe-motion.js?v=20261101')<html.indexOf('fly-v1.js?v='));
 assert.match(sw,/\.\/fly-globe-motion\.js/);
 assert.match(sw,/\.\/fly-globe-motion\.css/);
});
