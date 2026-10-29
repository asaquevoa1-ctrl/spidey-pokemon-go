'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const local=JSON.parse(fs.readFileSync('spidey-app/data/local-events.json','utf8')).events;
const ids=['2026-pokemon-night-out-la','2026-pokemon-night-out-london'];
const [la,ld]=ids.map(id=>events.find(e=>e.id===id));
const guide=events.find(e=>e.id==='2026-10-24-spidey-full-day-guide');
const twitch=events.find(e=>e.id==='2026-10-pokemon-night-out-twitch');
const originalPath='assets/events/premium/pokemon-night-out-20261024-approved-v1.png';
const originalHash='a340c9e232cbe34a9a392d300ca3a287cf5df9a54af7bdb3d1e98b8cece933d3';
test('Night Out is updated in place, without duplicate events or loss of approved art',()=>{
 assert.ok(la&&ld&&guide&&twitch);
 assert.equal(events.filter(e=>ids.includes(e.id)).length,2);
 // A arte original de 24/10 continua aprovada para o evento histórico de LA.
 assert.equal(la.art.url,originalPath);
 assert.equal(la.art.web_sha256,originalHash);
 assert.equal(la.presentation.uses_existing_approved_event_poster,true);
 // Londres (10/11) não pode publicar pôster cuja data impressa é 24/10.
 assert.equal(ld.art,null);
 assert.equal(ld.presentation.uses_existing_approved_event_poster,false);
 assert.equal(ld.presentation.hide_poster_until_corrected,true);
 assert.equal(ld.presentation.fallback_visual,'date');
 for(const e of [la,ld]){
  assert.equal(e.schedule.precision,'date');
  assert.equal(e.notifications.enabled,false);
  assert.equal(e.gpx.enabled,false);
  assert.ok(!e.tags?.some(tag=>String(tag).toLowerCase()==='global'));
  assert.equal(e.locations[0].coordinate_type,'venue_reference');
  assert.equal(e.locations[0].coordinate_confidence,'user_supplied_reference');
  assert.equal(e.locations[0].exact_raid_gym_verified,false);
  assert.equal(e.locations[0].exact_pokestop_verified,false);
  assert.ok(e.notes.some(n=>/horário|janela|gameplay/i.test(n)));
  assert.ok(e.bonuses.some(s=>s.includes('Pikachu')&&s.includes('Gengar')));
  assert.ok(e.bonuses.every(x=>!/Mewtwo Sombroso/i.test(x)));
 }
 const win={};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),{window:win});
 const master=win.SPIDEY_APPROVED_ART_MASTER;
 for(const id of ['2026-pokemon-night-out-la','2026-10-pokemon-night-out-twitch']){
  assert.equal(master[id].file,originalPath,id);
  assert.equal(master[id].sha256,originalHash,id);
  assert.equal(master[id].status,'APPROVED',id);
 }
 assert.equal(master['2026-pokemon-night-out-london'],undefined,
  'Londres nao pode herdar aprovacao Twitch/LA de 24/10');
});
test('Arena coordinates from owner are references, not gym spawns or fake GPX',()=>{
 assert.equal(la.locations[0].coordinate_text,'33.943723,-118.342295');
 assert.equal(ld.locations[0].coordinate_text,'51.502579,0.003202');
 assert.ok(guide.locations.some(p=>p.coordinate_text==='33.943723,-118.342295'));
 for(const id of ids){const e=local.find(x=>x.id===id);assert.ok(e,id);assert.equal(e.gpx.enabled,false);assert.equal(e.schedule.precision,'date');assert.equal(e.schedule.start_time,undefined);}
 const sb={window:{},Intl,Date,Math,Object,Set};
 vm.runInNewContext(fs.readFileSync('spidey-app/fly-core.js','utf8'),sb);
 for(const e of [la,ld])assert.equal(sb.window.SpideyFlyCore.eligible(e),false,'No false global FLY route');
});
test('London show and LA stream are separately grounded from unconfirmed Pokémon GO windows',()=>{
 assert.equal(la.venue_program.pokemon_go_gameplay_hours_confirmed,false);
 assert.equal(ld.venue_program.pokemon_go_gameplay_hours_confirmed,false);
 assert.equal(ld.venue_program.london_livestream_announced,false);
 const time=s=>new Date(s).getTime();
 assert.equal(time(la.venue_program.concert_starts_local),time(la.venue_program.concert_starts_brazil));
 assert.equal(time(la.venue_program.concert_starts_brazil),time(twitch.schedule.start_brazil));
 assert.equal(time(ld.venue_program.doors_open_local),time(ld.venue_program.doors_open_brazil));
 assert.equal(time(ld.venue_program.concert_starts_local),time(ld.venue_program.concert_starts_brazil));
 assert.equal(ld.venue_program.doors_open_brazil,'2026-11-10T15:00:00-03:00');
 assert.equal(ld.venue_program.concert_starts_brazil,'2026-11-10T16:30:00-03:00');
 assert.ok(ld.notes.some(s=>s.includes('15h30')&&s.includes('NÃO')));
 assert.ok(twitch.notes.some(s=>s.includes('TWITCH')===false||s.includes('Twitch')));
 assert.ok(guide.notes.some(s=>s.includes('23h30')&&s.includes('TWITCH')));
});

test('Londres não mostra campanha Twitch vencida nem texto interno de curadoria',()=>{
 const londonLocal=local.find(e=>e.id==='2026-pokemon-night-out-london');
 const laLocal=local.find(e=>e.id==='2026-pokemon-night-out-la');
 assert.ok(londonLocal&&laLocal);
 assert.equal(londonLocal.artApproved,false);
 assert.ok(!('note' in londonLocal));
 assert.ok(!('note' in laLocal));
 assert.equal(ld.schedule.start_date,'2026-11-10');
 assert.equal(ld.schedule.end_date,'2026-11-10');
 const app=fs.readFileSync('spidey-app/app.js','utf8');
 const player=fs.readFileSync('spidey-app/player-ui.js','utf8');
 const premium=fs.readFileSync('spidey-app/premium-event-art.js','utf8');
 const mini=fs.readFileSync('spidey-app/app-v2-4.js','utf8');
 assert.match(app,/event\?\.presentation\?\.hide_poster_until_corrected === true/);
 assert.match(player,/presentation\?\.hide_poster_until_corrected === true/);
 assert.match(premium,/presentation\?\.hide_poster_until_corrected === true/);
 assert.match(mini,/presentation\?\.hide_poster_until_corrected === true/);
 assert.ok(!JSON.stringify(local).includes('A arte Premium existente permanece preservada'));
 // O arquivo histórico continua aprovado e não é excluído nem regravado.
 const master=(()=>{const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('spidey-app/premium-approved-master.js','utf8'),sandbox);return sandbox.window.SPIDEY_APPROVED_ART_MASTER;})();
 assert.equal(master['2026-10-pokemon-night-out-twitch'].file,originalPath);
 assert.equal(master['2026-pokemon-night-out-london'],undefined);
});

test('Renderer local respeita artApproved e nao publica instrucoes de bastidores',()=>{
 const renderer=fs.readFileSync('spidey-app/trust-world-v1.js','utf8');
 const source=renderer.slice(renderer.indexOf('function posterFigure(event) {'),renderer.indexOf('function eventCard(event) {'));
 assert.match(source,/event\.artApproved !== true/);
 assert.match(source,/hide_poster_until_corrected/);
 assert.match(renderer,/event\.note\?\x60<p>/);
 assert.equal(local.find(e=>e.id==='2026-pokemon-night-out-london').artApproved,false);
});
