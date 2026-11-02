'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const weekly=JSON.parse(read('spidey-app/data/weekly.json'));
const events=JSON.parse(read('spidey-app/data/events.json')).events;
const src=read('spidey-app/weekly.js');
const now=new Date('2026-11-02T19:57:00Z');
function createWeekly(){
  const window={
    SPIDEY_APPROVED_ART_MASTER:{},SPIDEY_UNAVAILABLE_ART:{},
    SpideyDateOnly:{valid:e=>e?.schedule?.precision==='date',status:e=>'Hoje'},
    addEventListener(){}
  };
  const state={events:events.filter(e=>e.status==='published')};
  const visible=e=>{
    if(e?.schedule?.precision==='date')return e.schedule.end_date>='2026-11-02';
    if(e?.schedule?.end_brazil)return new Date(e.schedule.end_brazil)>now;
    return true;
  };
  const safeSource=src.replace(/window\.addEventListener\?\.\('spideycatalogchecked', loadWeeklyData\);\s*loadWeeklyData\(\);\s*$/,'');
  assert.notEqual(safeSource,src,'weekly scripts have to remain inert during unit tests');
  return new Function('state','window','document','eventVisibleInPublicAgenda','openEvent','showToast','setView','spideyResolveEventArt','spideyVersionedArtUrl',
    safeSource+'\nreturn {weeklyCuratedDayItems,weeklySchedule,weeklyItemCard,weeklyBrazilDayKey};')(
    state,window,{},visible,()=>{},()=>{},()=>{},()=>{},()=>{});
}

test('Dia a dia usa dados confirmados de eventos curados em vez de apenas 3 itens do snapshot',()=>{
 const api=createWeekly();
 assert.equal(weekly.week_start,'2026-11-02');
 const output=weekly.days.map(day=>({date:day.date,items:api.weeklyCuratedDayItems(day,weekly,now)}));
 for(const day of output)assert.ok(day.items.length>0,day.date+' tem eventos na programação da semana');
 const has=(date,id)=>output.find(x=>x.date===date).items.some(x=>x.id===id);
 assert.ok(has('2026-11-02','2026-11-02-max-machop'),'Machop Dinamax no dia 2');
 assert.ok(has('2026-11-03','2026-11-go-pass-groudon'),'Groudon no dia 3');
 assert.ok(has('2026-11-04','2026-11-04-raid-hour-altered-giratina'),'Hora de Reides Giratina no dia 4');
 assert.ok(has('2026-11-06','2026-11-go-wild-area-mexico-city'),'Wild Area CDMX só na data válida');
 assert.equal(has('2026-11-03','2026-11-go-wild-area-mexico-city'),false);
 for(const day of output)assert.equal(day.items.length,new Set(day.items.map(x=>x.id)).size,'sem duplicatas em '+day.date);
});

test('Eventos só ocupam os dias da sua janela real',()=>{
 const api=createWeekly();
 const ranges=weekly.days.map(day=>({date:day.date,ids:api.weeklyCuratedDayItems(day,weekly,now).map(x=>x.id)}));
 assert.ok(!ranges.find(x=>x.date==='2026-11-02').ids.includes('2026-11-go-pass-groudon'));
 assert.ok(!ranges.find(x=>x.date==='2026-11-02').ids.includes('2026-11-04-raid-hour-altered-giratina'));
 assert.ok(!ranges.find(x=>x.date==='2026-11-04').ids.includes('2026-11-07-shadow-tornadus-weekend'));
});

test('Cards compactos não duplicam data, horários indefinidos nem tags',()=>{
 const api=createWeekly();
 const guide=weekly.days[0].items.find(x=>x.id==='2026-11-02-monthly-daily-discoveries-guide');
 const mini=api.weeklyItemCard(guide,true);
 const full=api.weeklyItemCard(guide,false);
 assert.match(mini,/Guia: bônus semanais de novembro/);
 assert.doesNotMatch(mini,/Horário a confirmar|Horário não divulgado|02\/11\/2026|weekly-date-range|weekly-tags/);
 assert.match(full,/02 de nov/);
 assert.doesNotMatch(full,/02\/11\/2026 · horário do evento a confirmar/);
 assert.doesNotMatch(full,/Horário a confirmar/);
 const raid=weekly.sections.also_happening.find(x=>x.id==='2026-11-04-raid-hour-altered-giratina');
 assert.match(api.weeklyItemCard(raid,true),/18:00/);
});

test('Carrossel Samsung largura legível e PWA atualizado sem mudar pôsteres',()=>{
 const html=read('spidey-app/index.html'),sw=read('spidey-app/sw.js'),css=read('spidey-app/weekly-day-fix-20261102.css');
 assert.match(html,/weekly-day-fix-20261102\.css\?v=20261102-weekday2/);
 assert.match(html,/weekly\.js\?v=20261102-weekday2/);
 assert.match(sw,/spidey-app-20261102-weekday2/);
 assert.match(sw,/\.\/weekly-day-fix-20261102\.css/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(css,/scroll-snap-type:x mandatory/);
 assert.match(css,/width:min\(76vw,290px\)/);
 assert.match(css,/object-fit:contain!important/);
 assert.doesNotMatch(css,/object-fit:\s*cover/i);
 assert.match(src,/data-weekly-art-owner="canonical"/);
 assert.match(src,/weeklyArtUrl\(item\)/);
});
