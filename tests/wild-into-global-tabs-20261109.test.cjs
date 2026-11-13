'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const app='spidey-app/';
const points=JSON.parse(read(app+'data/world-event-points.json'));

async function loaded(){
  const window={};
  const document={readyState:'loading',hidden:false,getElementById:()=>null,addEventListener(){}};
  const context={
    window,document,navigator:{},Intl,Date,console,
    fetch:async()=>({ok:true,json:async()=>points})
  };
  vm.runInNewContext(read(app+'fly-core.js'),context);
  vm.runInNewContext(read(app+'wild-area-20261109.js'),context);
  await window.SpideyWild2026.loadPoints();
  return window.SpideyWild2026;
}
test('two independent views are wired into the existing navigation and Samsung menu',()=>{
  const html=read(app+'index.html');
  const menu=read(app+'mobile-side-menu.js');
  const script=read(app+'wild-area-20261109.js');
  const css=read(app+'wild-area-20261109.css');
  for(const id of ['wildIntoView','wildGlobalView']){
    assert.match(html,new RegExp('id="'+id+'" class="app-view'));
    assert.match(html,new RegExp('data-view="'+id+'"'));
    assert.match(menu,new RegExp(id));
    assert.match(script,new RegExp("mount\\('"+id+"'\\)"));
  }
  assert.match(html,/wildAreaMexicoView/,'historical Mexico page is preserved');
  assert.match(html,/México · arquivo/);
  assert.match(html,/wild-area-20261109\.css\?v=[^"']+/);
  assert.match(html,/wild-area-20261109\.js\?v=[^"']+/);
  assert.match(css,/max-width:680px/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(read(app+'sw.js'),/const CACHE = 'spidey-app-[^']+'/);
  assert.match(read(app+'sw.js'),/\.\/wild-area-20261109\.js/);
  assert.match(read(app+'sw.js'),/\.\/wild-area-20261109\.css/);
});
test('official programming and Premium art use accurate dedicated sources',()=>{
  const script=read(app+'wild-area-20261109.js');
  assert.match(script,/2026-11-09[\s\S]*Zacian Espada Coroada/);
  assert.match(script,/2026-11-10[\s\S]*Zamazenta Escudo Coroado/);
  assert.match(script,/2026-11-11[\s\S]*Registeel Dinamax/);
  assert.match(script,/2026-11-12[\s\S]*Regidrago Dinamax/);
  assert.match(script,/2026-11-13[\s\S]*Latias e Latios Dinamax/);
  assert.match(script,/2026-11-14[\s\S]*Dialga Dinamax/);
  assert.match(script,/2026-11-15[\s\S]*Palkia Dinamax/);
  assert.match(script,/pokemongo\.com\/news\/into-the-wild-2026/);
  assert.match(script,/pokemongo\.com\/gowildarea\/global/);
  assert.match(script,/wild-area-global-2026-approved-v1\.png/);
  assert.doesNotMatch(script,/WEEK_IMAGE|googleusercontent\.com/);
  assert.match(script,/wild-week-mosaic-grid/);
  assert.match(script,/wild-week-mosaic-panel--steel/);
  assert.match(script,/wild-week-mosaic-panel--dragon/);
  assert.match(script,/Imagens oficiais da temática Aço e Dragão/);
  const steel='spidey-app/assets/events/wild-area/official-local-20261102/solid-as-steel.webp';
  const dragon='spidey-app/assets/events/wild-area/official-local-20261102/daring-as-dragons.webp';
  assert.ok(fs.statSync(path.join(root,steel)).size>20000);
  assert.ok(fs.statSync(path.join(root,dragon)).size>20000);
  assert.match(script,/Créditos: LendáriosBrasil, FlyGPS, PokemonTrail/);
  assert.doesNotMatch(script,/fake-spawn|invented-gym|representa ginásios confirmados/i);
  assert.ok(fs.statSync(path.join(root,app,'assets/events/premium/wild-area-global-2026-approved-v1.png')).size>100000);
});
test('World route keeps precisely 64 user references and local 10h/18h timing',async()=>{
  const api=await loaded();
  assert.equal(points.points.filter(x=>x.current_user_list_20261031===true).length,64);
  for(const day of ['2026-11-14','2026-11-15']){
    const rows=api.allRows('wildGlobalView',day);
    assert.equal(rows.length,64);
    assert.ok(rows.every(r=>Number.isFinite(r.start.getTime())&&r.end-r.start===8*3600000));
    assert.ok(rows.every(r=>r.coord===r.point.lat+','+r.point.lon));
    assert.ok(rows.every((r,i)=>i===0||rows[i-1].start<=r.start));
  }
  for(const day of ['2026-11-09','2026-11-10','2026-11-11','2026-11-12','2026-11-13']){
    const rows=api.allRows('wildIntoView',day);
    assert.equal(rows.length,64);
    assert.ok(rows.every(r=>r.end-r.start===3600000));
  }
});
test('Kiritimati and Samoa are converted against Brasília for November 14',async()=>{
  const api=await loaded();
  const rows=api.allRows('wildGlobalView','2026-11-14');
  const kir=rows.find(r=>r.point.timezone==='Pacific/Kiritimati');
  const samoa=rows.find(r=>r.point.timezone==='Pacific/Apia');
  assert.ok(kir,'Kiritimati must remain visible');
  assert.ok(samoa,'Samoa must remain visible');
  assert.equal(kir.start.toISOString(),'2026-11-13T20:00:00.000Z');
  assert.equal(samoa.start.toISOString(),'2026-11-13T21:00:00.000Z');
});
test('JS is valid and Data Hub copy retains one coordinate per line',()=>{
  const code=read(app+'wild-area-20261109.js');
  assert.match(code,/all\.map\(r=>r\.coord\)\.join\('\\n'\)/);
  assert.match(code,/data-wild-copy-all/);
  assert.match(code,/navigator\.clipboard\.writeText/);
  assert.match(code,/document\.execCommand\('copy'\)/);
  const check=spawnSync(process.execPath,['--check',path.join(root,app,'wild-area-20261109.js')],{encoding:'utf8'});
  assert.equal(check.status,0,check.stderr);
});


test('global guide exposes full official detail without changing the approved poster or route',()=>{
  const script=read(app+'wild-area-20261109.js');
  const catalog=JSON.parse(read(app+'data/events.json')).events;
  const global=catalog.find(e=>e.id==='2026-11-go-wild-area-global');
  assert.ok(global);
  for(const term of [
    'Hora Sólido como Aço','Hora de Determinação de Dragão','Leek Duck (fonte comunitária)','Tinkatink','Frigibax',
    'Exeggutor de Alola','Haxorus','Clodsire','Honedge','Klefki','Drampa',
    'Unown D, I, L e W','Golpe de Caratê','Poder da Terra','Meteoro Esmagador',
    'Bomba Ímã','Golpe Deslizante','Balanço Violento','Martelo Gigatônico',
    '1.600 Partículas Max','3.200 Partículas Max','6 trocas especiais',
    'Strange Ball','Grupo privado com código','Behemoth Blade','Behemoth Bash',
    'pose de avatar exclusiva','Bolas Safári GO'
  ]) assert.ok(script.includes(term)||JSON.stringify(global).includes(term),'detalhe ausente: '+term);
  assert.equal(global.audit.editorial_detail_pending,false);
  assert.ok(global.verification_sources.some(x=>x.url==='https://pokemongo.com/pt-BR/gowildarea/global'&&x.confidence==='official'));
  assert.ok(global.verification_sources.some(x=>x.url==='https://pokemongo.com/news/get-ready-for-gowildarea-2026'&&x.confidence==='official'));
  assert.match(script,/wild-area-global-2026-approved-v1\.png/);
  assert.ok(fs.statSync(path.join(root,app,'assets/events/premium/wild-area-global-2026-approved-v1.png')).size>100000);
  assert.equal(points.points.filter(x=>x.current_user_list_20261031===true).length,64);
});

test('Minior mantém as janelas separadas e as confirmações comunitárias rotuladas',()=>{
  const catalog=JSON.parse(read(app+'data/events.json')).events;
  const leonids=catalog.find(e=>e.id==='2026-11-minior-leonids');
  const geminids=catalog.find(e=>e.id==='2026-12-minior-geminids');
  assert.ok(leonids&&geminids);
  assert.notEqual(leonids.schedule.start_local,geminids.schedule.start_local);
  assert.equal(leonids.audit.community_stardust_per_catch,1000);
  assert.equal(geminids.audit.official_stardust_quantity_disclosed,false);
  assert.ok(leonids.notes.some(x=>x.includes('Núcleo Verde')));
  assert.ok(geminids.notes.some(x=>x.includes('eventos sobrepostos')));
  assert.ok(leonids.verification_sources.some(x=>x.confidence==='official'&&x.url.includes('/pt-BR/')));
  assert.ok(leonids.verification_sources.some(x=>x.confidence==='community'));
  assert.equal(leonids.audit.no_2027_year_inferred,true);
});


test('notícia oficial de recursos da Wild Area é atualizada no mesmo ID, sem evento novo',()=>{
  const catalog=JSON.parse(read(app+'data/events.json')).events;
  const item=catalog.find(e=>e.id==='official-news-auto-5e1b1cd68f6c');
  assert.ok(item);
  assert.equal(item.content_type,'news');
  assert.equal(item.audit.editorial_detail_pending,false);
  for(const term of ['Fundos de Localização','Grupo Privado por código','Behemoth Blade','Behemoth Bash','Strange Ball','pose de avatar exclusiva']) {
    assert.ok(item.news.summary.includes(term)||item.notes.some(x=>x.includes(term)),'detalhe ausente: '+term);
  }
  assert.ok(item.related_event_ids.includes('2026-11-go-wild-area-global'));
  assert.equal(catalog.filter(e=>e.id==='official-news-auto-5e1b1cd68f6c').length,1);
});
