'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../spidey-app/home-festival-lights-20261101.js'),'utf8');
function appState(provideState=false){
 let openCall=null, inserted=null;
 const node=(tag='div')=>({
   tagName:tag.toUpperCase(),children:[],attributes:{},hidden:false,isConnected:false,style:{},
   setAttribute(key,value){this.attributes[key]=value;},
   addEventListener(name,cb){this.events ||= {};this.events[name]=cb;},
   append(...children){this.children.push(...children);},
   insertAdjacentElement(where,child){assert.equal(where,'afterend');child.isConnected=true;inserted=child;},
   querySelector(selector){
     const id=selector.startsWith('#')?selector.slice(1):null;
     const visit=n=>n.id===id?n:n.children?.map(visit).find(Boolean);
     return visit(this);
   }
 });
 const feature=node('section'),home=node('main');
 home.querySelector=sel=>sel==='#nowExperience'?{closest:()=>feature}:null;
 const document={
   readyState:'loading',
   addEventListener(){},
   getElementById(id){return id==='calendarView'?home:null;},
   createElement(tag){return node(tag);}
 };
 const global={document,window:{},console,Date,openEvent(event){openCall=event;}};
 if(provideState)global.state={events:[]};
 vm.runInNewContext(code,global);
 return {api:global.window.SpideyFestivalLights,card:()=>inserted,open:()=>openCall};
}
test('Home card is visible 01/11 with no catalog loaded',()=>{
 const app=appState();
 app.api.render(new Date('2026-11-01T18:00:00Z'));
 const card=app.card();
 assert(card,'card mounted');
 assert.equal(card.hidden,false,'visible even when live catalog absent');
 assert.equal(card.querySelector('#festivalLightsStatus').textContent,'PESQUISA DISPONÍVEL DESDE 01/11');
 const openButton=card.children[4].children[0];
 assert.equal(openButton.textContent,'Explorar evento');
 openButton.events.click();
 assert.equal(app.open()?.id,'festival-of-lights-2026-pokeminers-e2');
});
test('Home card stays visible with empty catalog and hides after the official end',()=>{
 const app=appState(true);
 app.api.render(new Date('2026-11-06T04:30:00Z'));
 assert.equal(app.card().hidden,false);
 assert.equal(app.card().querySelector('#festivalLightsStatus').textContent,'FESTIVAL EM ANDAMENTO');
 app.api.render(new Date('2026-11-08T14:30:00Z'));
 assert.equal(app.card().hidden,true);
});
