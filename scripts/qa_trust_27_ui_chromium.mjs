// Teste E2E: navegador real no GitHub runner, não apenas busca de texto em arquivo.
import { spawn, execFileSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { chromium } from 'playwright-core';
const port=process.env.SPIDEY_TEST_PORT||'8769';
const server=spawn('python3',['-m','http.server',port,'--bind','127.0.0.1'],{stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let browser;
try{
  let chrome;
  for(const path of ['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser']){
    try{execFileSync(path,['--version'],{stdio:'ignore'});chrome=path;break;}catch{}
  }
  if(!chrome)throw Error('Chromium/Chrome não encontrado no runner');
  browser=await chromium.launch({headless:true,executablePath:chrome,
    args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844},locale:'pt-BR'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:'+port+'/spidey-app/';
  let ready=false;
  for(let i=0;i<25;i++){
    try{const r=await page.goto(url,{waitUntil:'domcontentloaded',timeout:10000});if(r?.ok()){ready=true;break;}}
    catch{}
    await pause(800);
  }
  assert(ready,'App não abriu no navegador');
  await page.waitForFunction(()=>!!window.SpideyNationalTrustCore,{timeout:20000});
  await page.waitForSelector('#nationalTrustView',{state:'attached',timeout:20000});
  const trustTab=page.locator('.app-tab[data-view="nationalTrustView"]');
  assert.match(await trustTab.innerText(),/Trust.*27/);
  await trustTab.click();
  await page.waitForSelector('#nationalTrustPlaces .nt-place',{timeout:15000});
  const count=await page.locator('#nationalTrustPlaces .nt-place').count();
  assert.equal(count,27,'A aba Trust deve exibir 27 coordenadas sem rolar pelo pôster');
  const label=await page.locator('#nationalTrustView h1').innerText();
  assert.match(label,/27 locais, uma lista só/);
  const order=await page.evaluate(()=>{
    const list=document.querySelector('#nationalTrustPlaces');
    const poster=document.querySelector('#nationalTrustView .nt-poster-stage');
    if(!list||!poster)return false;
    return !!(list.compareDocumentPosition(poster) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  assert(order,'Lista deve vir ANTES do pôster Premium');
  const first=await page.locator('#nationalTrustPlaces .nt-place code').first().innerText();
  assert.equal(first,'52.93539,-3.08941');
  // Interação real no Chromium: um toque copia 27 linhas sem cabeçalhos.
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:'http://127.0.0.1:'+port});
  await page.locator('#ntCopyAll').click();
  const exported=await page.evaluate(()=>navigator.clipboard.readText());
  const original=await page.locator('#nationalTrustPlaces .nt-place code').allInnerTexts();
  assert.equal(exported,original.join('\n'));
  assert.equal(exported.split('\n').length,27);
  assert.match(await page.locator('#ntCopyStatus').innerText(),/27 coordenadas copiadas/);
  assert.equal(await page.locator('#nationalTrustView .nt-caution').count(),0);

  await page.waitForFunction(()=>typeof window.SpideyOpenSharedEvent==='function'&&
    !!window.SpideyFindShareEvent?.('2026-national-trust-27-sites'),{timeout:20000});
  await page.evaluate(()=>window.SpideyOpenSharedEvent('2026-national-trust-27-sites'));
  await page.waitForSelector('#eventDialog[open] #nationalTrustEventCoords',{timeout:10000});
  assert.equal(await page.locator('#eventDialog #nationalTrustEventCoords .copy-coord').count(),27,
    'O evento deve abrir 27 botões de copiar no próprio modal');
  assert.equal(await page.locator('#eventDialog #nationalTrustEventCoords code').first().innerText(),first);
  await page.locator('#ntEventCopyAll').click();
  const exportedInEvent=await page.evaluate(()=>navigator.clipboard.readText());
  assert.equal(exportedInEvent,exported);
  assert.match(await page.locator('#ntEventCopyStatus').innerText(),/27 coordenadas copiadas/);

  await page.screenshot({path:'trust-27-verificado-no-navegador.png',fullPage:false});
  console.log('APROVADO: Trust tab=27, lista antes do pôster, evento modal=27, primeiro ponto='+first);
  if(errors.length)console.log('Avisos JS não relacionados: '+errors.slice(0,4).join(' | '));
}finally{
  await browser?.close();
  server.kill('SIGTERM');
}
