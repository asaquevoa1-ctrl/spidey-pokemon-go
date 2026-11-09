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

test('Dia a dia acompanha a semana atual sem depender de datas congeladas',()=>{
 const api=createWeekly();
 assert.match(weekly.week_start,/^\d{4}-\d{2}-\d{2}$/);
 assert.equal(weekly.days.length,7);
 assert.equal(weekly.days[0].date,weekly.week_start);
 assert.equal(weekly.days[6].date,weekly.week_end);
 const output=weekly.days.map(day=>({date:day.date,items:api.weeklyCuratedDayItems(day,weekly,now)}));
 for(const day of output)assert.equal(day.items.length,new Set(day.items.map(x=>x.id)).size,'sem duplicatas em '+day.date);
 assert.ok(output.some(day=>day.items.length>0),'ao menos um dia possui programação');
});

test('Eventos curados só ocupam os dias da sua janela real',()=>{
 const api=createWeekly();
 const output=weekly.days.map(day=>({date:day.date,ids:api.weeklyCuratedDayItems(day,weekly,now).map(x=>x.id)}));
 const scheduled=weekly.sections.also_happening.filter(x=>x.start_brazil&&x.end_brazil);
 assert.ok(scheduled.length>0,'existem eventos com horários confirmados');
 for(const event of scheduled){
   const start=event.start_brazil.slice(0,10),end=event.end_brazil.slice(0,10);
   for(const day of output){
     if(day.date<start||day.date>end)assert.ok(!day.ids.includes(event.id),event.id+' fora de '+day.date);
   }
 }
});

test('Cards compactos não duplicam datas, horários indefinidos nem tags',()=>{
 const api=createWeekly();
 const guide=weekly.sections.also_happening.find(x=>x.start_brazil&&x.end_brazil);
 assert.ok(guide,'existe evento com data confirmada');
 const mini=api.weeklyItemCard(guide,true);
 const full=api.weeklyItemCard(guide,false);
 assert.ok(mini.length>0&&full.length>0);
 assert.doesNotMatch(mini,/Horário a confirmar|Horário não divulgado|weekly-date-range|weekly-tags/);
 assert.doesNotMatch(full,/Horário a confirmar/);
});

test('Carrossel Samsung largura legível e PWA atualizado sem mudar pôsteres',()=>{
 const html=read('spidey-app/index.html'),sw=read('spidey-app/sw.js'),css=read('spidey-app/weekly-day-fix-20261102.css');
 assert.match(html,/weekly-day-fix-20261102\.css\?v=20261102-weekday2/);
 assert.match(html,/weekly\.js\?v=20261102-weekday2/);
 assert.match(sw,/const CACHE = 'spidey-app-[0-9]{8}-[^']+'/);
 assert.match(sw,/\.\/weekly-day-fix-20261102\.css/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(css,/scroll-snap-type:x mandatory/);
 assert.match(css,/width:min\(76vw,290px\)/);
 assert.match(css,/object-fit:contain!important/);
 assert.doesNotMatch(css,/object-fit:\s*cover/i);
 assert.match(src,/data-weekly-art-owner="canonical"/);
 assert.match(src,/weeklyArtUrl\(item\)/);
});
