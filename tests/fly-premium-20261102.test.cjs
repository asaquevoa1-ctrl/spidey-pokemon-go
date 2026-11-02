'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const css=read('spidey-app/fly-premium-20261102.css');
const js=read('spidey-app/fly-premium-20261102.js');
const core=read('spidey-app/fly-v1.js');
const html=read('spidey-app/index.html');
const sw=read('spidey-app/sw.js');

test('FLY usa aba dinâmica existente sem modificar eventos, coordenadas nem rota IANA',()=>{
 assert.match(core,/id='flyView'/);
 assert.match(core,/flyRouteList/);
 assert.match(core,/flyNow/);
 assert.match(core,/data-coord/);
 assert.match(core,/SpideyFlyCore/);
 assert.match(core,/loadPoints\(/);
 assert.match(js,/getElementById\('flyView'\)/);
 assert.doesNotMatch(js,/fetch\(|SpideyFlyCore|loadPoints\(|coords|longitude|latitude/);
});
test('Aparência Premium tem cartões legíveis, controles grandes e preserva mapa',()=>{
 assert.match(css,/#flyView \.fly-point-actions/);
 assert.match(css,/#flyView \.fly-event-select/);
 assert.match(css,/#flyView \.fly-live-grid/);
 assert.match(css,/#flyGlobeMotion/);
 assert.match(css,/@media\(max-width:740px\)/);
 assert.match(css,/@media\(max-width:400px\)/);
 assert.match(css, /min-height:46px/);
 assert.match(css,/focus-visible/);
 assert.match(css,/prefers-reduced-motion/);
 assert.doesNotMatch(css,/object-fit\s*:\s*cover|display\s*:\s*none\s*!important/i);
});
test('Botoes de salto fazem scroll real, focam destino e nao se duplicam',()=>{
 const elements={};
 function make(tag){
   const e={tag,children:[],dataset:{},attributes:{},
     setAttribute(k,v){this.attributes[k]=v;},
     hasAttribute(k){return Object.hasOwn(this.attributes,k);},
     append(...n){this.children.push(...n);},
     appendChild(n){this.children.push(n);},
     addEventListener(k,fn){this[k]=fn;},
     contains(item){return this.children.includes(item);},
     closest(){return this.dataset.flyJump?this:null;},
     insertAdjacentElement(k,n){this.inserted=n;elements.navigation=n;},
     focus(opts){this.focused=opts;},
     scrollIntoView(opts){this.scrolled=opts;}
   };
   return e;
 }
 const hero=make('header'),route=make('div'),now=make('h2');
 const root={querySelector(q){
   if(q==='.hero.hero-compact')return hero;
   if(q==='.fly-premium-quick-nav')return elements.navigation||null;
   if(q==='#flyRouteList')return route;
   if(q==='#flyNow')return now;
   return null;
 }};
 const document={readyState:'complete',getElementById:id=>id==='flyView'?root:null,createElement:make,addEventListener(){}};
 const events=[];
 const window={addEventListener:(name,fn)=>events.push([name,fn]),matchMedia:()=>({matches:true})};
 vm.runInNewContext(js,{window,document});
 const nav=elements.navigation;
 assert.ok(nav,'controls inserted after hero');
 assert.equal(nav.children.length,2);
 assert.equal(nav.attributes['aria-label'],'Atalhos da rota mundial');
 assert.equal(window.SpideyFlyPremium.init(),false,'idempotent');
 assert.equal(nav.children[0].dataset.flyJump,'flyRouteList');
 assert.equal(nav.children[1].dataset.flyJump,'flyNow');
 nav.click({target:nav.children[0]});
 assert.equal(route.scrolled.behavior,'auto');
 assert.equal(route.attributes.tabindex,'-1');
 assert.equal(route.focused.preventScroll,true);
 nav.click({target:nav.children[1]});
 assert.equal(now.scrolled.behavior,'auto');
 assert.ok(events.some(x=>x[0]==='spideycontentready'));
});
test('HTML e PWA carregam estilo e JS novos sem mudar shell de FLY',()=>{
 assert.match(html,/fly-premium-20261102\.css\?v=20261102-flypremium1/);
 assert.match(html,/fly-premium-20261102\.js\?v=20261102-flypremium1/);
 assert.match(html,/fly-v1\.js\?v=/);
 assert.ok(html.indexOf('fly-v1.js?v=')<html.indexOf('fly-premium-20261102.js?v='));
 assert.match(sw,/const CACHE = 'spidey-app-20261102-fly-clean1'/);
 assert.match(sw,/\.\/fly-premium-20261102\.js/);
 assert.match(sw,/\.\/fly-premium-20261102\.css/);
});
