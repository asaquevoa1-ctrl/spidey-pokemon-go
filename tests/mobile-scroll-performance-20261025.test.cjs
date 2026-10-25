'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

const read = name => fs.readFileSync('spidey-app/' + name, 'utf8');

test('Mobile scroll avoids costly sticky blur without altering desktop or approved artwork',()=>{
 const css=read('mobile-side-menu.css');
 assert.match(css, /@media \(max-width: 760px\)[\s\S]*?html \{ scroll-behavior: auto; \}/);
 assert.match(css, /-webkit-backdrop-filter:\s*none !important/);
 assert.match(css, /backdrop-filter:\s*none !important/);
 assert.match(css, /background:\s*var\(--surface, #0a1730\) !important/);
 assert.match(css, /:root\[data-theme="light"\] \.topbar/);
 const html=read('index.html');
 for(const path of ['mobile-side-menu.css','command-center.js','experience-v1.js','app.js'])
  assert.ok(html.includes(path + '?v=20261025-scroll1'), path+' cache version');
 const sw=read('sw.js');
 assert.ok(sw.includes('spidey-app-20261022-credits-dst-v1-20261023-no-hunter1-20261025-scroll1'));
 assert.ok(sw.includes('20261023-no-hunter1'),'Legacy Caçador cache version remains invalidated');
 for(const name of ['assets/branding/20261019/spidey-icon-cosmic-192.png','rocket-guide.js','pvp.js','fly-v1.js'])
  assert.ok(html.includes(name),name);
});

test('Deferred poster decoding keeps hero eager and lowers off-screen poster work',()=>{
 const card=read('experience-v1.js');
 const event=read('app.js');
 assert.match(card, /<img loading="lazy" decoding="async" src=/);
 assert.match(card, /<img class="experience-feature-art" decoding="async" src=/);
 assert.doesNotMatch(card, /<img class="experience-feature-art" loading="lazy"/);
 assert.match(event, /<img class="event-thumb" loading="lazy" decoding="async" src=/);
 assert.match(event, /<img class="detail-hero"/);
});

test('FLY buttons decorate newly added event subtrees without rescanning page for unrelated UI mutations',()=>{
 const source=read('command-center.js');
 let boot, observer, scheduled=0, fullScans=0;
 const EVENT_SELECTOR='[data-event-id],[data-v22-event]';
 class Node {
  constructor() {this.nodeType=1;this.dataset={};this.children=[];this.isConnected=true;this.className='';this.textContent='';this.listeners={};this.parent=null;}
  matches(selector){return selector===EVENT_SELECTOR?Boolean(this.dataset.eventId||this.dataset.v22Event):selector==='.cc-fly-action'?this.className.includes('cc-fly-action'):false;}
  querySelectorAll(selector){
   if(selector!==EVENT_SELECTOR)return [];
   const all=[]; const walk=n=>{for(const child of n.children){if(child.matches(selector))all.push(child);walk(child);}};
   walk(this);return all;
  }
  querySelector(selector){
   if(selector==='.eyebrow')return {textContent:''};
   if(selector==='.cc-fly-action')return this.children.find(n=>n.className.includes('cc-fly-action')) || null;
   return null;
  }
  closest(selector){if(selector==='button,a')return null;if(selector===EVENT_SELECTOR)return this.parent?.matches(selector)?this.parent:null;return null;}
  addEventListener(type,fn){this.listeners[type]=fn;}
  append(child){this.children.push(child);child.parent=this;}
 }
 const nav=new Node(),main=new Node(),intro=new Node();
 const document={
  readyState:'loading',
  addEventListener(type,fn){if(type==='DOMContentLoaded')boot=fn;},
  querySelector(selector){return selector==='.app-tabs'?nav:selector==='main'?main:selector==='.experience-intro'?intro:null;},
  querySelectorAll(selector){if(selector===EVENT_SELECTOR){fullScans++;return [];}return []},
  getElementById(){return null;},
  createElement(){return new Node()},
  body:{classList:{add(){}}},
 };
 const window={
  SpideyPlayer:{source(){return 'Fonte'}},
  SpideyNews:{build(){return []}},
  SpideyFlyCore:{eligible(e){return e?.id==='test-event'}},
  SpideyFly:{open(){}},
  addEventListener(){}
 };
 class MutationObserver {constructor(fn){observer=fn;}observe(){}}
 vm.runInNewContext(source,{
  window,document,MutationObserver,
  requestAnimationFrame(fn){scheduled++;fn();},
  state:{events:[{id:'test-event'}]},
  getBrazilRange(){return{}},
  openEvent(){},detail:{},dialog:{},setView(){},
 });
 assert.equal(typeof boot,'function');
 boot();
 assert.equal(fullScans,1,'initial public page scanned once');
 const unrelated=new Node();
 observer([{addedNodes:[unrelated]}]);
 assert.equal(fullScans,1,'unrelated UI mutation triggered an expensive full-page scan');
 assert.equal(scheduled,0,'unrelated UI mutation scheduled a frame');
 const eventCard=new Node();eventCard.dataset.eventId='test-event';
 observer([{addedNodes:[eventCard]}]);
 assert.equal(eventCard.children.length,1,'new eligible card gets one FLY action');
 assert.match(eventCard.children[0].className,/cc-fly-action/);
 assert.equal(fullScans,1,'new cards are processed locally, not by rescanning document');
 observer([{addedNodes:[eventCard.children[0]]}]);
 assert.equal(eventCard.children.length,1,'observer ignores self-inserted FLY actions');
 assert.equal(scheduled,1,'event mutation is batched into a single frame');
});
