const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json')).events;
const locals=JSON.parse(fs.readFileSync('spidey-app/data/local-events.json')).events;
const globalEvent=events.find(e=>e.id==='2026-11-go-wild-area-global');
const brazil=locals.find(e=>e.id==='2026-11-go-wild-area-global-brazil-community');
function setup(){
 const window={addEventListener(){}};
 const context=vm.createContext({window,Date,Intl,URL,Map,Set,Object,Math,document:{readyState:'loading',addEventListener(){},querySelectorAll(){return[];}}});
 for(const name of ['date-only.js','fly-core.js','trust-world-v1.js'])vm.runInContext(fs.readFileSync('spidey-app/'+name,'utf8'),context);
 return window;
}
test('the existing global story is enriched instead of duplicated',()=>{
 assert.ok(globalEvent);
 assert.equal(globalEvent.schedule.start_local,'2026-11-14T10:00:00-03:00');
 assert.equal(globalEvent.schedule.end_local,'2026-11-15T18:00:00-03:00');
 assert.equal(globalEvent.news.updated_on,'2026-10-29');
 assert.equal(globalEvent.brazil_community_program.community_venue_reference_count,96);
 assert.match(globalEvent.brazil_community_program.source_date_conflict,/2025/);
 const canonical='https://pokemongo.com/pt-BR/news/gowa-global-2026-brazil';
 assert.equal(events.filter(e=>e.source?.url===canonical).length,0,'the article must not create a duplicate headline-only event');
 assert.equal(globalEvent.verification_sources.filter(s=>s.url===canonical).length,1);
});
test('Brazil community venues remain useful without invented game coordinates',()=>{
 assert.ok(brazil);
 assert.deepEqual([brazil.schedule.start_date,brazil.schedule.start_time,brazil.schedule.end_date,brazil.schedule.end_time],['2026-11-14','10:00','2026-11-15','18:00']);
 assert.equal(brazil.locations.length,97);
 assert.equal(brazil.audit.community_venue_reference_count,96);
 assert.equal(brazil.gpx.enabled,false);
 for(const location of brazil.locations){
  assert.equal('latitude' in location,false,location.id);
  assert.equal('longitude' in location,false,location.id);
  assert.equal(location.exact_pokestop_verified,false,location.id);
 }
 assert.ok(brazil.locations.some(l=>l.name.includes('Passeio Público · Curitiba/PR')));
 assert.ok(brazil.locations.some(l=>l.name.includes('Pavilhão Japonês')));
});
test('the local event disappears exactly at the last daily closing boundary',()=>{
 const w=setup();
 assert.equal(w.SpideyWorld.visible(brazil,new Date('2026-11-15T20:59:59.999Z')),true);
 assert.equal(w.SpideyWorld.visible(brazil,new Date('2026-11-15T21:00:00.000Z')),false);
});
test('automatic collector item is curated text-first without push, art fabrication or GPX',()=>{
 const pending=JSON.parse(fs.readFileSync('queue/pending/2026-10-29/oficial-noticia-82ebfd6d4753.json'));
 const curated=JSON.parse(fs.readFileSync(pending.curated_path));
 assert.equal(pending.status,'curated');
 assert.equal(pending.arte_obrigatoria,false);
 assert.equal(curated.source_verified,true);
 assert.equal(curated.status,'published_without_new_art');
 assert.equal(curated.gerar_gpx,false);
 assert.deepEqual(curated.coordenadas,[]);
});
