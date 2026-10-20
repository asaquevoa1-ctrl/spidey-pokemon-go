const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const root='spidey-app/';
function read(path){return fs.readFileSync(root+path,'utf8');}
function api(url='https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/?utm_source=old'){
  const window={location:{href:url}};
  const document={readyState:'loading',addEventListener(){}};
  const context={window,document,URL,navigator:{},MutationObserver:undefined};
  vm.runInNewContext(read('spidey-share.js'),context,{filename:'spidey-share.js'});
  return window.SpideyShare;
}
test('Share prompt uses native Web Share when available; message carries working direct event link',()=>{
  const share=api();
  const event={id:'2026-pokemon-night-out-la',title:'Pokémon Night Out — LA',summary:'Fundo especial Pikachu e Gengar'};
  const result=share.payload(event);
  assert.ok(result.title.includes('Pokémon Night Out'));
  assert.ok(result.text.includes('Fundo especial Pikachu e Gengar'));
  assert.equal(result.url,'https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/#evento=2026-pokemon-night-out-la');
  assert.ok(result.text.includes(result.url));
  assert.ok(read('spidey-share.js').includes('navigator.share'));
  assert.ok(read('spidey-share.js').includes('navigator.clipboard?.writeText'));
  assert.ok(read('spidey-share.js').includes("AbortError"));
});
test('generic share advertises app without collecting personal information',()=>{
  const data=api().payload();
  assert.equal(data.url,'https://asaquevoa1-ctrl.github.io/spidey-pokemon-go/spidey-app/');
  assert.ok(data.text.includes('gratuito e independente'));
  assert.equal(data.text.includes('utm_source=old'),false);
  const script=read('spidey-share.js');
  for(const forbidden of ['localStorage','sendBeacon','gtag(','fbq(','analytics.google','fetch(','XMLHttpRequest']){
    assert.equal(script.includes(forbidden),false,'No user tracking '+forbidden);
  }
});
test('Share controls only render on real event details, and deep link looks up published catalog',()=>{
  const main=read('app.js');
  assert.ok(main.includes("window.SpideyFindShareEvent = (id) => state.events.find(event => event.id === id && event.status === 'published')"));
  assert.ok(main.includes('window.SpideyOpenSharedEvent = (id) => {'));
  const share=read('spidey-share.js');
  assert.ok(share.includes("detail.dataset.eventId"));
  assert.ok(share.includes("box.querySelector('[data-share-event]')"));
  assert.ok(share.includes('new MutationObserver(enhanceDetail)'));
  assert.ok(share.includes("window.addEventListener('spideycontentready', tryOpenShared)"));
  assert.ok(share.includes("window.addEventListener('hashchange'"));
  assert.ok(share.includes("window.history.replaceState("));
  assert.ok(share.includes("button.textContent = '↗ Compartilhar evento'"));
});
test('Search/social metadata are discoverable in initial HTML and assets are existing verified',()=>{
  const html=read('index.html');
  assert.ok(html.includes('<meta property="og:title"'));
  assert.ok(html.includes('<meta property="og:description"'));
  assert.ok(html.includes('<meta property="og:image"'));
  assert.ok(html.includes('<link rel="canonical"'));
  assert.ok(html.includes('spidey-share.js?v=20261019-share1'));
  const sw=read('sw.js');
  assert.ok(sw.includes("'./spidey-share.js'"));
  assert.ok(sw.includes("const CACHE = 'spidey-app-20261019-organic-sharing-v1'"));
  assert.ok(fs.existsSync(root+'assets/spidey-logo-oficial.jpg'));
});
