'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('spidey-app/national-trust-v1.js');
const data=JSON.parse(read('spidey-app/data/national-trust-2026.json'));
class El{
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.textContent='';this.className='';this.isConnected=true;this.listeners={};this.open=false;}
 append(...nodes){this.children.push(...nodes.flatMap(n=>n.tag==='fragment'?n.children:[n]));}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 addEventListener(type,fn){this.listeners[type]=fn;}
 contains(){return true;}
}
const fakeDoc={
 readyState:'loading',addEventListener(){},
 createElement:tag=>new El(tag),
 createDocumentFragment:()=>new El('fragment')
};
const copied=[];
const w={};
vm.runInNewContext(source,{window:w,document:fakeDoc,fetch:async()=>({ok:true,json:async()=>data}),
  navigator:{clipboard:{writeText:async s=>{copied.push(s)}}},console,Error,Promise,Map,Number,Math,Array,String});
const nextTick=()=>new Promise(resolve=>setImmediate(resolve));
test('all 27 community references are intact and individually valid',()=>{
 assert.equal(data.places.length,27);
 assert.equal(w.SpideyNationalTrustCore.validPlaces(data).length,27);
 assert.equal(new Set(data.places.map(p=>p.id)).size,27);
 assert.equal(new Set(data.places.map(p=>p.coordinates)).size,27);
 assert(data.places.every(p=>p.coordinate_type==='community_site_reference'&&p.exact_pokestop_verified===false&&p.exact_research_trigger_verified===false));
 assert(data.places.every(p=>w.SpideyNationalTrustCore.parseCoord(p.coordinates)===p.coordinates));
});
test('National Trust opens 27 grouped coordinates inside the event dialog, with working copy buttons',async()=>{
 const target=new El('section');const status=new El('p');const list=new El('div');
 target.querySelector=selector=>selector==='[data-nt-event-status]'?status:selector==='[data-nt-event-list]'?list:null;
 w.SpideyNationalTrustCore.renderEventCoordinates(target);
 for(let i=0;i<5;i++)await nextTick();
 assert.match(status.textContent,/27 locais com coordenadas/);
 assert.equal(list.children.length,4);
 const siteNodes=list.children.flatMap(group=>group.children.filter(x=>x.tag==='div').flatMap(grid=>grid.children));
 assert.equal(siteNodes.length,27);
 const buttons=siteNodes.flatMap(site=>site.children.filter(x=>x.tag==='button'));
 assert.equal(buttons.length,27);
 assert.deepEqual(buttons.map(b=>b.dataset.coord).sort(),data.places.map(p=>p.coordinates).sort());
 assert(siteNodes.every(site=>site.children.some(x=>x.tag==='code')));
 assert(siteNodes.every(site=>site.children.some(x=>x.tag==='strong')));
 const btn=buttons[0];btn.closest=selector=>selector==='button.nt-event-copy[data-coord]'?btn:null;
 await target.listeners.click({target:btn});
 assert.deepEqual(copied,[btn.dataset.coord]);
});
test('the 3D event detail contains an in-place coordinate list, not only a Trust-tab pointer',()=>{
 const app=read('spidey-app/app.js'),html=read('spidey-app/index.html'),sw=read('spidey-app/sw.js');
 const events=JSON.parse(read('spidey-app/data/events.json')).events;
 const nt=events.find(e=>e.id==='2026-national-trust-27-sites');
 assert(nt && nt.status==='published');
 assert.match(app,/id="nationalTrustEventCoords"/);
 assert.match(app,/SpideyNationalTrustCore\?\.renderEventCoordinates\?\./);
 assert.match(app,/detail\.dataset\.eventId===event\.id/);
 assert.match(nt.summary,/27 coordenadas de referência/);
 assert.match(nt.notes.join(' '),/copiados aqui ou na aba Trust/);
 assert.match(html,/national-trust-v1\.js\?v=20261101-eventcoords1/);
 assert.match(html,/app\.js\?v=20261101-eventcoords1/);
 assert.match(html,/national-trust-v1\.css\?v=20261101-eventcoords1/);
 assert.match(sw,/20261101-eventcoords1/);
 assert.match(sw,/\.\/data\/national-trust-2026\.json/);
 assert.equal(nt.gpx.enabled,false);
 assert.equal(nt.locations.length,0);
});
