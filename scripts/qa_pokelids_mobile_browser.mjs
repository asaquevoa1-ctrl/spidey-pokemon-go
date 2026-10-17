import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const output = 'test-results/pokelids-mobile';
fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server','4178','--directory','.'],{stdio:'ignore'});
let ready=false;
for(let i=0;i<40;i++){
  try{if((await fetch('http://127.0.0.1:4178/spidey-app/index.html')).ok){ready=true;break;}}catch{}
  await new Promise(r=>setTimeout(r,250));
}
if(!ready){server.kill('SIGTERM');throw Error('Pokelids local preview not available');}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const results=[];
try{
  for(const width of [390,430])for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
    const page=await context.newPage();
    await page.addInitScript(v=>localStorage.setItem('spidey-theme',v),theme);
    // Simulate the official external host being unreachable from Android.
    await page.route('https://local.pokemon.jp/img/p/manhole/**',route=>route.abort('failed'));
    await page.goto('http://127.0.0.1:4178/spidey-app/index.html',{waitUntil:'domcontentloaded'});
    await page.locator('.app-tabs [data-view="stampsView"]').click();
    const card=page.locator('.stamp-card').filter({hasText:'PokéLids — Japão'});
    await card.waitFor({state:'visible',timeout:15000});
    await card.click();
    await page.locator('#stampActiveStop .pokelid-place-copy code').waitFor({state:'visible',timeout:12000});
    const v=await page.locator('#stampActiveStop .pokelid-place-copy code').textContent();
    if(v.trim()!=='43.585848,141.423898')throw Error('Official Ishikari coordinate unavailable: '+v);
    if(!String(await page.locator('#stampActiveStop').textContent()).includes('NÃO É POKÉSTOP VERIFICADA'))
      throw Error('PokéStop disclaimer missing');
    if(await page.locator('#downloadRallyGpxV2').count())throw Error('GPX incorrectly enabled for unverified PokéStops');
    await page.evaluate(()=>{
      window.__lastCopied=null;
      const copy=v=>{window.__lastCopied=v;return Promise.resolve()};
      if(navigator.clipboard)Object.defineProperty(navigator.clipboard,'writeText',{value:copy,configurable:true});
      else Object.defineProperty(navigator,'clipboard',{value:{writeText:copy},configurable:true});
    });
    // Clipboard copying must be tested by the observed payload, not by waiting
    // on unrelated pending page navigation triggered in Chromium headless.
    await page.locator('#copyActiveStampCoord').click({noWaitAfter:true});
    if(await page.evaluate(()=>window.__lastCopied)!=='43.585848,141.423898')throw Error('One-tap lid coordinate copy failed');
    await page.locator('#stampActiveStop .stamp-art-load-failed').waitFor({state:'visible',timeout:15000});
    if(await page.locator('#stampActiveStop img').count())throw Error('Broken external image icon remained');
    if(!await page.locator('#stampActiveStop a').filter({hasText:'Ver tampa oficial'}).count())throw Error('Official link missing');
    // Changing a lid is an in-app action, not a page navigation.
    await page.locator('#stampNext').click({noWaitAfter:true});
    await page.waitForFunction((previous) => {
      const code=document.querySelector('#stampActiveStop .pokelid-place-copy code');
      return code && code.textContent.trim() && code.textContent.trim() !== previous;
    }, v.trim(), {timeout:12000});
    const other=await page.locator('#stampActiveStop .pokelid-place-copy code').textContent();
    if(!other.trim()||other.trim()===v.trim())throw Error('Next lid coordinate missing');
    const box=await page.locator('#stampActiveStop .pokelid-place-copy').boundingBox();
    if(!box||box.width<120)throw Error('Mobile layout broken');
    await page.screenshot({path:`${output}/pokelids-${width}-${theme}.png`,fullPage:false});
    results.push({width,theme,copy:'ok',coordinates:'ok',imageFallback:'ok',gpx:'blocked'});
    await context.close();
  }
  console.log(JSON.stringify({passed:results.length,checks:results}));
}finally{
  await browser.close();server.kill('SIGTERM');
}
