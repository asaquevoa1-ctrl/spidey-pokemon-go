'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..','spidey-app',file),'utf8');
const html=read('index.html');
const js=read('wild-mexico-image-fallback-20261102.js');
const css=read('wild-mexico-image-fallback-20261102.css');
const sw=read('sw.js');
const {statSync}=require('node:fs');

test('Tratamento das imagens quebradas é carregado na aba',()=>{
  assert.match(html,/wild-mexico-image-fallback-20261102\.js\?v=20261102-wildfix1/);
  assert.match(html,/wild-mexico-image-fallback-20261102\.css\?v=20261102-wildfix1/);
  assert.match(sw,/spidey-app-20261102-safarireal2/);
  assert.match(sw,/\.\/wild-mexico-image-fallback-20261102\.js/);
  assert.match(sw,/\.\/wild-mexico-image-fallback-20261102\.css/);
});

test('Safari Ball usa só a imagem real local e nunca a ilustração de contingência',()=>{
  const official='assets/events/wild-area/official-local-20261102/safari-ball.webp';
  assert.match(html,/src="assets\/events\/wild-area\/official-local-20261102\/safari-ball\.webp"/);
  assert.match(html,/Bola Safári GO<\/figcaption>/);
  assert.match(html,/loading="eager"/);
  assert.doesNotMatch(html,/ilustração de referência/);
  assert.doesNotMatch(js,/ilustração de referência|go-safari-ball-fallback-20261102\.svg/);
  assert.match(js,/const BALL='assets\/events\/wild-area\/official-local-20261102\/safari-ball\.webp'/);
  assert.match(js,/img\.src=BALL\+SAFARI_RETRY/);
  assert.doesNotMatch(sw,/go-safari-ball-fallback-20261102\.svg/);
  assert.match(sw,/\.\/assets\/events\/wild-area\/official-local-20261102\/safari-ball\.webp/);
  assert.ok(statSync(path.join(__dirname,'..','spidey-app',official)).size>10000);
  assert.match(css,/wild-mx-ball-retry/);
});
test('Remover imagem quebrada também desativa estilos display importantes',()=>{
  assert.match(js,/img\.style\.setProperty\('display','none','important'\)/);
  assert.match(js,/img\.hidden=true/);
  assert.match(js,/img\.removeAttribute\('src'\)/);
  assert.match(js,/parent\.replaceChildren\(label\(type\)\)/);
  assert.match(js,/wild-mx-photo-unavailable/);
  assert.match(css,/wild-mx-fallback-machamp/);
  assert.match(css,/wild-mx-fallback-dragon/);
  assert.match(css,/wild-mx-fallback-steel/);
  assert.match(css,/wild-mx-fallback-mighty/);
});

test('Home renovada e conexão ruim também acionam proteção',()=>{
  assert.match(js,/spideyhomeupdated/);
  assert.match(js,/spideycontentready/);
  assert.match(js,/setTimeout\(\(\)=>/);
  assert.match(js,/,9000\)/);
  assert.match(js,/Ver a imagem no anúncio oficial/);
  assert.match(js,/pokemongo\.com\/gowildarea\/mexico-city\/gameplay/);
});
