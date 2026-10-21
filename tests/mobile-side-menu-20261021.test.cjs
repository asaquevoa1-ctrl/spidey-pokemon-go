'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const root = 'spidey-app/';
const load = file => fs.readFileSync(root + file, 'utf8');

test('Menu mobile keeps approved cosmic S icon, responsive visibility and no disruption to tabs', () => {
  const html = load('index.html');
  const css = load('mobile-side-menu.css');
  const script = load('mobile-side-menu.js');
  const sw = load('sw.js');
  assert.doesNotThrow(() => new vm.Script(script, {filename:'mobile-side-menu.js'}));
  for (const id of ['spideyMenuToggle','spideyMobileMenuPanel','spideyMobileMenuShade','spideyMobileMenuClose','spideyMobileMenuLinks','spideyMobileTheme']) {
    assert.ok(html.includes('id="' + id + '"'),id);
  }
  assert.ok(html.includes('aria-expanded="false"'));
  assert.ok(html.includes('aria-controls="spideyMobileMenuPanel"'));
  assert.ok(html.includes('aria-modal="true"'));
  assert.ok(html.includes('mobile-side-menu.css?v=20261021-drawer-only2'));
  assert.ok(html.includes('mobile-side-menu.js?v=20261021-drawer1'));
  assert.ok(html.includes('assets/branding/20261019/spidey-icon-cosmic-192.png'));
  assert.ok(css.includes('@media (max-width: 760px)'));
  assert.ok(css.includes('@media (min-width: 761px)'));
  assert.ok(css.includes('env(safe-area-inset-top)'));
  assert.ok(css.includes('#spideyMobileMenuPanel[hidden]'));
  assert.ok(script.includes('original.click()'), 'existing routes must retain their own side effects');
  assert.ok(script.includes('MutationObserver'), 'new FLY, Hunter and News tabs must join automatically');
  assert.ok(script.includes("hunterView:'Caçador'"),'Menu needs a short, human Caçador label');
  assert.ok(script.includes("anaView:'ANA'"),'Avoid double airplane symbol');
  assert.ok(script.includes("nationalTrustView:'Trust'"),'Avoid double Trust ticket symbol');

  assert.ok(script.includes("event.key === 'Escape'"));
  assert.ok(script.includes("event.key === 'Tab'"));
  assert.ok(script.includes('document.getElementById(\'privacyButton\')?.click()'));
  assert.ok(sw.includes("'./mobile-side-menu.js'"));
  assert.ok(sw.includes("'./mobile-side-menu.css'"));
  assert.ok(html.includes('<nav class="app-tabs"'), 'original tab handlers remain in DOM but must not be visible on mobile');
  assert.ok(css.includes('.topbar .theme-control { display: none; }'));
  assert.match(css, /html\\.spidey-mobile-menu-ready body(?:\\.spidey-command-center)? nav\\.app-tabs\\s*,?/, 'the original tabs must be hidden after menu initialization');
  assert.ok(css.includes('display: none !important;'), 'legacy Command Center bottom-nav !important must be overridden');
  assert.ok(css.includes('main {\\n    padding-bottom: calc(28px + env(safe-area-inset-bottom)) !important;'), 'remove the unused bottom-bar spacing');
  assert.match(css, /@media \\(max-width: 760px\\)/, 'the bottom nav change is mobile-only');
  assert.match(css, /@media \\(min-width: 761px\\)/, 'desktop navigation remains');

});

test('Menu mobile opens, mirrors dynamic nav, delegates existing routes and closes without changing desktop', () => {
  const listeners = new Map();
  const document = { activeElement:null };
  class Node {
    constructor(id='') { this.id=id; this.hidden=false; this.dataset={}; this.children=[]; this.events={}; this.attrs={}; this.className=''; this.value=''; this.textContent=''; this.classList={
      add:(x)=>this.className=Array.from(new Set([...this.className.split(/\s+/).filter(Boolean),x])).join(' '),
      remove:(x)=>this.className=this.className.split(/\s+/).filter(v=>v!==x).join(' '),
      toggle:(x,v)=>{if(v===undefined)v=!this.classList.contains(x);v?this.classList.add(x):this.classList.remove(x);return v;},
      contains:(x)=>this.className.split(/\s+/).includes(x)
    }; }
    addEventListener(name,fn) { (this.events[name] ||= []).push(fn); }
    click() { (this.events.click || []).forEach(fn=>fn({target:this,preventDefault(){}})); }
    dispatchEvent(event) { (this.events[event.type] || []).forEach(fn=>fn(event)); return true; }
    setAttribute(k,v) { this.attrs[k]=String(v); }
    removeAttribute(k) { delete this.attrs[k]; }
    getAttribute(k) { return this.attrs[k] || null; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children=[...children]; }
    focus() { document.activeElement=this; }
    getClientRects() { return [{}]; }
    contains(x) { return this===x || this.children.includes(x); }
    querySelector(selector) { return selector==='[data-menu-privacy]'?privacy:null; }
    querySelectorAll(selector) {
      if(selector==='button.app-tab[data-view]')return this.children;
      if(selector==='[data-menu-view]')return this.children.filter(x=>x.dataset.menuView);
      if(selector.includes('button:not([disabled])'))return [close,...links.children,privacy,theme];
      return [];
    }
  }
  const ids = {};
  for(const id of ['spideyMenuToggle','spideyMobileMenuPanel','spideyMobileMenuShade','spideyMobileMenuClose','spideyMobileMenuLinks','spideyMobileTheme','themeSelect','privacyButton'])ids[id]=new Node(id);
  const [toggle,panel,shade,close,links,theme,canonical,privacyButton] = Object.values(ids);
  let visible='calendarView', clicks=0,privacyClicks=0;
  const tabs = new Node('tabs');
  const makeTab=(view,text)=>{
    const tab=new Node();tab.className='app-tab';tab.dataset.view=view;tab.textContent=text;
    tab.addEventListener('click',()=>{visible=view;clicks++;});return tab;
  };
  tabs.children.push(makeTab('calendarView','Início'),makeTab('flyView','FLY'),makeTab('hunterView','Caçador'));
  const privacy = new Node('privacy');
  privacyButton.addEventListener('click',()=>{visible='privacyView';privacyClicks++;});
  document.getElementById=id=>ids[id]||null;
  document.querySelector = selector => selector==='.app-tabs'?tabs:selector==='.app-view:not([hidden])'?{id:visible}:null;
  document.createElement=()=>new Node();
  document.body=new Node('body');
  document.documentElement=new Node('html');
  document.addEventListener=(type,fn)=>listeners.set(type,fn);
  const media={matches:true,events:{},addEventListener(type,fn){this.events[type]=fn;}};
  const window={matchMedia:()=>media,addEventListener:(type,fn)=>listeners.set('window:'+type,fn)};
  class MutationObserver { constructor(fn){this.callback=fn; MutationObserver.last=this;} observe(){} }
  vm.runInNewContext(load('mobile-side-menu.js'),{window,document,MutationObserver,Event:class Event {constructor(type){this.type=type;}}});
  assert.ok(window.SpideyMobileMenu);
  assert.ok(document.documentElement.classList.contains('spidey-mobile-menu-ready'), 'only hide bottom bar once drawer is fully initialized');
  assert.equal(links.children.length,3);
  assert.ok(links.children.some(x=>x.dataset.menuView==='hunterView'));
  toggle.click();
  assert.equal(panel.hidden,false);
  assert.equal(shade.hidden,false);
  assert.equal(toggle.attrs['aria-expanded'],'true');
  assert.ok(document.body.classList.contains('spidey-mobile-menu-open'));
  const hunter=links.children.find(x=>x.dataset.menuView==='hunterView');
  hunter.click();
  assert.equal(visible,'hunterView');
  assert.equal(clicks,1);
  assert.equal(panel.hidden,true);
  assert.equal(toggle.attrs['aria-expanded'],'false');
  toggle.click();
  let prevented=false;
  listeners.get('keydown')({key:'Escape',preventDefault:()=>prevented=true});
  assert.equal(prevented,true);
  assert.equal(panel.hidden,true);
  toggle.click();
  shade.click();
  assert.equal(panel.hidden,true);
  tabs.children.push(makeTab('newsView','Novidades'));
  MutationObserver.last.callback([{type:'childList'}]);
  assert.ok(links.children.some(x=>x.dataset.menuView==='newsView'));
  toggle.click();
  links.children.find(x=>x.dataset.menuView==='newsView').click();
  assert.equal(visible,'newsView');
  toggle.click();
  privacy.click();
  assert.equal(privacyClicks,1);
  assert.equal(visible,'privacyView');
  theme.value='light';
  let themeEvents=0;
  canonical.addEventListener('change',()=>themeEvents++);
  theme.dispatchEvent({type:'change'});
  assert.equal(canonical.value,'light');
  assert.equal(themeEvents,1);
  toggle.click();
  media.matches=false;
  media.events.change();
  assert.equal(panel.hidden,true);
});
