'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const script=read('spidey-app/month-premium-20261102.js');

class El{
 constructor(tag){
   this.tagName=tag.toUpperCase();this.id='';this.className='';this.dataset={};
   this.attributes={};this.children=[];this.events={};this.parentElement=null;
   this.textContent='';this.src='';this.disabled=false;
   this.classList={add:(...names)=>{
     const parts=new Set(this.className.split(/\s+/).filter(Boolean));
     names.forEach(n=>parts.add(n));this.className=[...parts].join(' ');
   }};
 }
 append(...items){for(const item of items){item.parentElement=this;this.children.push(item)}}
 replaceChildren(...items){this.children=[];this.append(...items)}
 setAttribute(name,value){this.attributes[name]=value}
 addEventListener(name,fn){this.events[name]=fn}
 insertAdjacentElement(place,item){
   assert.equal(place,'afterend');
   const i=this.parentElement.children.indexOf(this);
   assert(i>=0);
   this.parentElement.children.splice(i+1,0,item);item.parentElement=this.parentElement;
 }
 querySelector(sel){
   const matches=node=>{
     if(sel.startsWith('#'))return node.id===sel.slice(1);
     if(sel.startsWith('.'))return node.className.split(/\s+/).includes(sel.slice(1));
     const match=sel.match(/^\[data-month-shift="(-?1)"\]$/);
     if(match)return node.dataset.monthShift===match[1];
     return false;
   };
   const find=node=>{
     for(const child of node.children){if(matches(child))return child;
       const found=find(child);if(found)return found}
     return null;
   };
   return find(this);
 }
 closest(sel){
   if(sel==='.section'&&this===calendar)return legacy;
   return null;
 }
}
const home=new El('main');home.id='playerHome';
const cockpit=new El('section');cockpit.className='spidey-command-cockpit';home.append(cockpit);
const agenda=new El('section');agenda.id='spideyCalendarPremium';home.append(agenda);
const legacyParent=new El('section');legacyParent.id='calendarView';
const legacy=new El('section');legacy.className='section';legacyParent.append(legacy);
const calendar=new El('div');calendar.id='calendar';legacy.append(calendar);
const body=new El('body');
const fixtures=[
 {id:'halloween',title:'Halloween II',category:'halloween',status:'published',content_type:'event',
  schedule:{start_brazil:'2026-11-01T10:00:00-03:00',end_brazil:'2026-11-03T20:00:00-03:00'}},
 {id:'giratina',title:'Reides Giratina',category:'raid_hour',status:'published',content_type:'event',
  schedule:{start_brazil:'2026-11-04T18:00:00-03:00',end_brazil:'2026-11-04T19:00:00-03:00'}},
 {id:'singapore',title:'Sessão Singapura',category:'regional_event',status:'published',content_type:'event',
  schedule:{sessions:[{start:'2026-11-07T10:00:00+08:00',end:'2026-11-07T22:00:00+08:00'}]}}
];
const toDay=date=>{
 const parts=new Intl.DateTimeFormat('en-CA',{
  timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'
 }).formatToParts(date).filter(x=>x.type!=='literal');
 const obj=Object.fromEntries(parts.map(x=>[x.type,x.value]));
 return obj.year+'-'+obj.month+'-'+obj.day;
};
const covered=(e,key)=>{
 const s=e.schedule||{},r=s.sessions?.length
  ?s.sessions:[{start:s.start_brazil,end:s.end_brazil}];
 return r.some(x=>{
   const start=new Date(x.start),end=new Date(x.end);
   return toDay(start)<=key&&key<=toDay(new Date(+end-1));
 });
};
const winner={addEventListener(){},SPIDEY_APPROVED_ART_MASTER:{giratina:{file:'approved.webp'}},
 SPIDEY_UNAVAILABLE_ART:{},SpideyPlayer:{art:e=>e.id==='giratina'?'approved.webp':''},
 SpideyCalendarPremium:{
  choose:(events,key,mode)=>events.filter(e=>covered(e,key)&&
   (mode==='raids'?e.category==='raid_hour':mode==='local'?e.category==='regional_event':true)),
  isRaid:e=>e.category==='raid_hour',isRegional:e=>e.category==='regional_event'
 }};
const doc={readyState:'loading',hidden:false,body,createElement:tag=>new El(tag),
 getElementById:id=>id==='playerHome'?home:id==='calendar'?calendar:null,
 addEventListener(){}};
vm.runInNewContext(script,{window:winner,document:doc,state:{events:fixtures},Date,Intl});
const api=winner.SpideyMonthPremium;
const fixed=new Date('2026-11-01T15:00:00.000Z');

test('Monthly calendar uses real 42-day Sunday-first grid and BRT date',()=>{
 assert.equal(api.dateKey(fixed),'2026-11-01');
 const days=Array.from(api.monthDays('2026-11'));
 assert.equal(days.length,42);
 assert.equal(days[0].key,'2026-11-01');
 assert.equal(days.filter(x=>x.inside).length,30);
 assert.equal(days[30].key,'2026-12-01');
 assert.equal(api.monthDays('2026-13').length,0);
});
test('Month is mounted after the 7-day agenda and hides legacy only after mount',()=>{
 assert.equal(api.render(fixed),true);
 const month=home.querySelector('#spideyMonthPremium');
 assert(month);
 assert.equal(home.children.indexOf(month),home.children.indexOf(agenda)+1);
 assert(legacy.className.includes('spidey-premium-legacy-month'));
 assert(body.className.includes('spidey-month-premium-ready'));
 const days=month.querySelector('.spidey-month-grid').children;
 assert.equal(days.length,42);
 assert.equal(days[0].dataset.monthDay,'2026-11-01');
 assert.equal(days[0].attributes['aria-pressed'],'true');
 assert.equal(month.querySelector('.spidey-month-cards').children[0].dataset.playDetail,'halloween');
});
test('Day selection, raid filter and canonical art keep native details working',()=>{
 const month=home.querySelector('#spideyMonthPremium');
 const day4=month.querySelector('.spidey-month-grid').children[3];
 month.events.click({target:{closest:selector=>selector==='[data-month-day]'?day4:null}});
 assert.equal(month.querySelector('.spidey-month-date-heading').textContent.includes('4 de novembro'),true);
 const filters=month.querySelector('.spidey-month-filters').children;
 month.events.click({target:{closest:selector=>selector==='[data-month-filter]'?filters[2]:null}});
 const cards=month.querySelector('.spidey-month-cards').children;
 assert.equal(cards.length,1);
 assert.equal(cards[0].dataset.playDetail,'giratina');
 assert.equal(cards[0].querySelector('.spidey-month-event-poster').children[0].src,'approved.webp');
 assert.equal(month.querySelector('.spidey-month-filters').children[2].attributes['aria-pressed'],'true');
});
test('PWA, script order and visual guardrails are integrated',()=>{
 const html=read('spidey-app/index.html');
 const sw=read('spidey-app/sw.js');
 const css=read('spidey-app/month-premium-20261102.css');
 assert.match(html,/month-premium-20261102\.css\?v=20261102-month1/);
 assert.match(html,/month-premium-20261102\.js\?v=20261102-month2/);
 assert(html.indexOf('calendar-premium-20261101.js?v=')<
   html.indexOf('month-premium-20261102.js?v='));
 assert.match(sw,/const CACHE = 'spidey-app-[0-9]{8}-[^']+'/);
 assert.match(sw,/\.\/month-premium-20261102\.css/);
 assert.match(sw,/\.\/month-premium-20261102\.js/);
 assert.match(css,/spidey-month-premium-ready/);
 assert.match(css,/object-fit:contain/);
 assert.doesNotMatch(script,/SpideyNexus|old-spider|aranha/i);
});