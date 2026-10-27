'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const main=JSON.parse(read('spidey-app/data/events.json')).events;
const local=JSON.parse(read('spidey-app/data/local-events.json')).events;
const byId=id=>{const e=main.find(x=>x.id===id);assert.ok(e,'Missing event '+id);return e;};
const ids=['2026-10-27-dia-de-muertos-mexico','2026-10-31-dia-de-muertos-paseo-reforma','2026-11-go-wild-area-mexico-city','2026-11-go-wild-area-sendai','2026-pokemon-night-out-london','2026-pokemon-night-out-la','2026-10-24-fc-seoul','2026-10-24-spidey-full-day-guide','2026-aeon-mall-halloween-japan','2026-national-trust-27-sites','2026-10-pokexciting-taipei'];
test('Regional activities explain the game region and include FLY audiences without fake universal access',()=>{
 for(const id of ids){
  const e=byId(id);const copy=[e.summary,...(e.notes||[]),e.news?.summary||''].join(' ');
  assert.match(copy, /FLY/i,'FLY audience missing from '+id);
  assert.doesNotMatch(copy, /Vai estar no México\?|Se estiver em Los Angeles|Se você estiver em Seul|não é jogável do Brasil|somente para jogadores presentes|não é acessível mundialmente/i,'Travel-first copy in '+id);
  assert.equal(e.gpx.enabled,false,'No fabricated GPX allowed for '+id);
 }
 assert.equal(local.find(e=>e.id==='2026-10-31-dia-de-muertos-paseo-reforma').gpx.enabled,false);
});
test('Tickets, geography, location trust, regional scheduling and global FLY are unchanged',()=>{
 const mx=byId('2026-11-go-wild-area-mexico-city');
 assert.match(mx.summary,/ingresso/i);
 assert.match(mx.notes.join(' '),/ingresso/);
 const sendai=byId('2026-11-go-wild-area-sendai');
 assert.match(sendai.summary,/ingresso/i);
 const dia=byId('2026-10-31-dia-de-muertos-paseo-reforma');
 assert.equal(dia.schedule.start_local,'2026-10-31T10:00:00-06:00');
 assert.equal(dia.locations[0].coordinate_text,'19.4269903,-99.1676463');
 assert.equal(byId('2026-pokemon-night-out-london').schedule.precision,'date');
 assert.ok(main.find(e=>e.id==='2026-10-22-spotlight-morelull'));
 const source=read('spidey-app/trust-world-v1.js');
 assert.match(source,/REGIÃO DO EVENTO/);
 assert.match(source,/Região para jogar • FLY/);
 assert.doesNotMatch(source,/>PRESENCIAL · \$\{esc\(event\.place\.toUpperCase\(\)\)\}/);
});
test('Current canonical decision overrides travel-only wording without reviving retired features',()=>{
 const decisions=read('SPIDEY_DECISIONS_CURRENT.md');
 assert.match(decisions,/27\/10\/2026 — Regra editorial permanente: eventos regionais para jogadores FLY/);
 assert.match(decisions,/Caçador removido do aplicativo público/);
 assert.match(decisions,/67 pontos originais\/70 localidades FLY/);
 const html=read('spidey-app/index.html');
 assert.ok(html.includes('rocket-guide.js'));
 assert.ok(!html.includes('hunter-live-feed.js'));
});
