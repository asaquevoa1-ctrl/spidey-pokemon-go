'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const script=read('spidey-app/calendar-premium-20261101.js');
const fixture=[
 {id:'regional',title:'Festival local',category:'regional_event',status:'published',content_type:'event',
  schedule:{start_brazil:'2026-11-01T10:00:00-03:00',end_brazil:'2026-11-02T20:00:00-03:00'}},
 {id:'raids',title:'Hora de Reides',category:'raid_hour',status:'published',content_type:'event',
  schedule:{start_brazil:'2026-11-04T18:00:00-03:00',end_brazil:'2026-11-04T19:00:00-03:00'}},
 {id:'date',title:'Rotação de reides',category:'raid_rotation',status:'published',content_type:'event',
  schedule:{precision:'date',start_date:'2026-11-04',end_date:'2026-11-08'}},
 {id:'midnight',title:'Evento noturno',category:'local_event',status:'published',content_type:'event',
  schedule:{start_brazil:'2026-11-01T23:30:00-03:00',end_brazil:'2026-11-02T00:30:00-03:00'}},
 {id:'expired',title:'Evento encerrado',category:'regional_event',status:'published',content_type:'event',
  schedule:{start_brazil:'2026-10-30T10:00:00-03:00',end_brazil:'2026-10-31T19:00:00-03:00'}},
 {id:'draft',title:'Rascunho',category:'local_event',status:'draft',content_type:'event',
  schedule:{start_brazil:'2026-11-01T12:00:00-03:00',end_brazil:'2026-11-01T18:00:00-03:00'}},
 {id:'news',title:'Notícia',category:'regional_event',status:'published',content_type:'news',
  schedule:{start_brazil:'2026-11-01T12:00:00-03:00',end_brazil:'2026-11-01T18:00:00-03:00'}}
];
class Element{
 constructor(tag){
  this.tagName=tag.toUpperCase();this.parent=null;this.children=[];
  this.className='';this.id='';this.dataset={};this.attributes={};
  this.textContent='';this.events={};this.type='';this.src='';
  this.classList={add:(...names)=>{
    const parts=new Set(this.className.split(/\s+/).filter(Boolean));
    names.forEach(n=>parts.add(n));this.className=[...parts].join(' ');
  }};
 }
 append(...children){for(const x of children){x.parent=this;this.children.push(x);}}
 replaceChildren(...children){this.children=[];this.append(...children);}
 setAttribute(name,value){this.attributes[name]=value;}
 addEventListener(name,cb){this.events[name]=cb;}
 insertAdjacentElement(place,el){
  assert.equal(place,'afterend');
  const i=this.parent.children.indexOf(this);
  assert(i>=0);this.parent.children.splice(i+1,0,el);el.parent=this.parent;
 }
 querySelector(selector){
  const check=x=>selector.startsWith('#')?x.id===selector.slice(1):x.className.split(/\s+/).includes(selector.slice(1));
  const search=x=>{for(const child of x.children){if(check(child))return child;const found=search(child);if(found)return found;}return null;};
  return search(this);
 }
}
const home=new Element('main');home.id='playerHome';
const cockpit=new Element('section');cockpit.className='spidey-command-cockpit';home.append(cockpit);
const w={addEventListener(){},SPIDEY_APPROVED_ART_MASTER:{regional:{file:'assets/premium.webp'}},
 SpideyPlayer:{art:e=>'assets/'+e.id+'.webp',title:e=>e.title}};
const doc={readyState:'complete',hidden:false,createElement:tag=>new Element(tag),
 getElementById:id=>id==='playerHome'?home:null,addEventListener(){}};
const baseNow=new Date('2026-11-01T21:00:00.000Z');
class FixedDate extends Date { constructor(...args){ super(...(args.length?args:[baseNow])); } static now(){ return +baseNow; } }
const fixed=new FixedDate(baseNow.getTime());
vm.runInNewContext(script,{window:w,document:doc,Intl,Date:FixedDate,state:{events:fixture}});
const api=w.SpideyCalendarPremium;
test('BRT dates, cross-midnight and date-only schedule are accurate',()=>{
 assert.equal(api.brazilKey(fixed),'2026-11-01');
 assert.deepEqual(Array.from(api.weekDays(fixed),x=>x.key),
 ['2026-11-01','2026-11-02','2026-11-03','2026-11-04','2026-11-05','2026-11-06','2026-11-07']);
 assert(api.covers(fixture[3],'2026-11-01')&&api.covers(fixture[3],'2026-11-02'));
 assert(!api.covers(fixture[3],'2026-11-03'));
 assert(api.covers(fixture[2],'2026-11-04'));
 assert(!api.covers(fixture[2],'2026-11-03'));
 assert(!api.covers(fixture[4],'2026-11-01'));
 assert(!api.covers(fixture[5],'2026-11-01'));
 assert(!api.covers(fixture[6],'2026-11-01'));
});
test('Regional and raid filters select only published event categories',()=>{
 assert.deepEqual(api.choose(fixture,'2026-11-01','local').map(x=>x.id).sort(),['midnight','regional']);
 assert.deepEqual(api.choose(fixture,'2026-11-04','raids').map(x=>x.id).sort(),['date','raids']);
 assert.equal(api.choose(fixture,'2026-11-04','local').length,0);
});
test('International sessions override local dates and appear on the correct Brazil day',()=>{
 const singapore={id:'singapore',title:'Sessões em Singapura',status:'published',content_type:'event',
  category:'regional_event',schedule:{
   local_timezone:'Asia/Singapore',start_date:'2026-11-07',end_date:'2026-11-08',
   start_brazil:'2026-11-06T23:00:00-03:00',end_brazil:'2026-11-08T11:00:00-03:00',
   sessions:[{start:'2026-11-07T10:00:00+08:00',end:'2026-11-07T22:00:00+08:00'},
             {start:'2026-11-08T10:00:00+08:00',end:'2026-11-08T22:00:00+08:00'}]}};
 assert(api.covers(singapore,'2026-11-06'),'First local session starts on Nov 6 in Brazil');
 assert(api.covers(singapore,'2026-11-07'));
 assert(api.covers(singapore,'2026-11-08'));
 assert(!api.covers(singapore,'2026-11-09'));
 assert.equal(api.choose([singapore],'2026-11-06')[0].id,'singapore');
});
test('Fresh daily events and raids precede older long-running campaigns',()=>{
 const older={id:'older',title:'Temporada longa',status:'published',content_type:'event',category:'temporada',
  schedule:{start_brazil:'2026-09-01T10:00:00-03:00',end_brazil:'2026-12-01T20:00:00-03:00'}};
 const newRaid={id:'newRaid',title:'Nova rotação',status:'published',content_type:'event',category:'raid_rotation',
  schedule:{start_brazil:'2026-11-04T10:00:00-03:00',end_brazil:'2026-11-10T10:00:00-03:00'}};
 const raidHour={id:'raidHour',title:'Hora de Reides',status:'published',content_type:'event',category:'raid_hour',
  schedule:{start_brazil:'2026-11-04T18:00:00-03:00',end_brazil:'2026-11-04T19:00:00-03:00'}};
 const recurring={id:'recurring',title:'Sessão nova',status:'published',content_type:'event',category:'evento_especial',
  schedule:{sessions:[{start:'2026-11-01T10:00:00-03:00',end:'2026-11-01T12:00:00-03:00'},
                      {start:'2026-11-04T14:00:00-03:00',end:'2026-11-04T16:00:00-03:00'}]}};
 assert.deepEqual(api.choose([older,raidHour,recurring,newRaid],'2026-11-04').map(e=>e.id),
  ['newRaid','recurring','raidHour','older']);
 assert.deepEqual(api.choose([older,raidHour,recurring,newRaid],'2026-11-04','raids').map(e=>e.id),
  ['newRaid','raidHour']);
});
test('Actual Player Home receives interactive date rail after the existing 3D cockpit',()=>{
 assert.equal(api.render(fixed),true);
 const agenda=home.querySelector('#spideyCalendarPremium');
 assert(agenda,'agenda mounted on visible Player Home, not the legacy calendar');
 assert.equal(home.children.indexOf(agenda),home.children.indexOf(cockpit)+1);
 const days=agenda.querySelector('.spidey-agenda-days');
 assert.equal(days.children.length,7);
 assert.equal(days.children[0].dataset.agendaDay,'2026-11-01');
 assert.equal(days.children[0].attributes['aria-pressed'],'true');
 let cards=agenda.querySelector('.spidey-agenda-cards');
 assert.equal(cards.children.length,2);
 assert.deepEqual(cards.children.map(x=>x.dataset.playDetail).sort(),['midnight','regional']);
 assert.equal(cards.children.filter(x=>x.querySelector('.spidey-agenda-poster').children.some(c=>c.tagName==='IMG')).length,1,
 'Only approved art is displayed; no generic sprite replaces missing art');
 const region=agenda.querySelector('.spidey-agenda-filters').children[1];
 agenda.events.click({target:{closest:sel=>sel==='button[data-agenda-mode]'?region:null}});
 assert.equal(agenda.querySelector('.spidey-agenda-filters').children[1].attributes['aria-pressed'],'true');
 const fourth=agenda.querySelector('.spidey-agenda-days').children[3];
 agenda.events.click({target:{closest:sel=>sel==='button[data-agenda-day]'?fourth:null}});
 assert.equal(agenda.querySelector('.spidey-agenda-days').children[3].attributes['aria-pressed'],'true');
 assert.ok(agenda.querySelector('.spidey-agenda-status').textContent.length>0);
 assert.equal(agenda.querySelector('.spidey-agenda-cards').children[0].textContent,'Nenhum evento dessa categoria neste dia. Tente outro filtro.');
 const raids=agenda.querySelector('.spidey-agenda-filters').children[2];
 agenda.events.click({target:{closest:sel=>sel==='button[data-agenda-mode]'?raids:null}});
 cards=agenda.querySelector('.spidey-agenda-cards');
 assert.equal(cards.children.length,2);
 assert.deepEqual(cards.children.map(x=>x.dataset.playDetail).sort(),['date','raids']);
});
test('Premium agenda is integrated without hiding legacy calendar or duplicating events',()=>{
 const html=read('spidey-app/index.html'),css=read('spidey-app/calendar-premium-20261101.css');
 const sw=read('spidey-app/sw.js'),player=read('spidey-app/player-ui.js');
 assert.match(html,/calendar-premium-20261101\.js\?v=20261101-agenda2/);
 assert.match(html,/calendar-premium-20261101\.css\?v=20261101-agenda1/);
 assert(html.indexOf('player-ui.js?v=')<html.indexOf('calendar-premium-20261101.js?v='));
 assert.match(html,/id="calendar"/);
 assert.match(html,/id="worldEvents"/);
 assert.match(sw,/\.\/calendar-premium-20261101\.js/);
 assert.match(sw,/\.\/calendar-premium-20261101\.css/);
 assert.match(script,/spideyhomeupdated/);
 assert.match(player,/data-play-detail/);
 assert.match(css,/prefers-reduced-motion/);
 assert.doesNotMatch(script,/SpideyNexus|old-spider|aranha/i);
});
