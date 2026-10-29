import {execFileSync,spawn} from 'node:child_process';
import fs from 'node:fs';
import {chromium} from 'playwright-core';
const out='test-results/reforma-trilhas-20261029',pub=out+'/pages-preview';
fs.mkdirSync(out,{recursive:true});
execFileSync('python3',['scripts/build_spidey_pages.py','--output',pub],{stdio:'pipe'});
const server=spawn('python3',['-m','http.server','4194','--directory',pub],{stdio:'ignore'});
for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:4194/spidey-app/')).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const guideId='2026-dia-de-muertos-reforma-stamp-guide',trailId='2026-11-16-dynamax-trails';
const expected=['19.42790, -99.16620','19.42941, -99.16447','19.42910, -99.16164','19.42800, -99.16446','19.42530, -99.17020','19.42770, -99.16760'];
const checks=[],errors=[];let page,active;
function check(ok,message){if(!ok)throw Error(message);checks.push({...active,check:message});}
async function overflow(){return page.evaluate(()=>({page:document.documentElement.scrollWidth>document.documentElement.clientWidth,dialog:document.querySelector('#eventDialog').scrollWidth>document.querySelector('#eventDialog').clientWidth}));}
try{
 for(const width of [390,1280])for(const theme of ['light','dark']){
  active={width,theme};
  const context=await browser.newContext({viewport:{width,height:900},timezoneId:'America/Sao_Paulo',serviceWorkers:'block',permissions:['clipboard-read','clipboard-write']});
  page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await page.route('https://**/*',route=>route.abort());
  await page.addInitScript(theme=>localStorage.setItem('spidey-theme',theme),theme);
  await page.goto('http://127.0.0.1:4194/spidey-app/',{waitUntil:'networkidle'});
  await page.waitForFunction(id=>state.stamps.some(e=>e.id===id)&&window.SpideyFindShareEvent?.('2026-11-16-dynamax-trails'),guideId);
  await page.evaluate(()=>setView('stampsView'));
  await page.locator(`[data-stamp-guide="${guideId}"]`).click();await page.locator('#eventDialog').waitFor({state:'visible'});
  check(await page.locator('[data-reforma-reference]').count()===6,'six community references rendered');
  const text=await page.locator('#eventDetail').innerText();
  check(text.includes('mapa da comunidade')&&!text.includes('0/0')&&await page.locator('#downloadRallyGpx').count()===0,'community source without false progress or GPX');
  const buttons=page.locator('[data-copy-guide-coordinate]');
  for(let i=0;i<6;i++){await buttons.nth(i).click();check(await page.evaluate(()=>navigator.clipboard.readText())===expected[i],`copy point ${i+1}`);}
  await page.locator('[data-copy-guide-route]').click();
  check(await page.evaluate(()=>navigator.clipboard.readText())===expected.join('\n'),'copy all six in map order');
  check(await page.locator('#stampGuideCoordinates').inputValue()===expected.join('\n'),'selectable coordinate list matches clipboard');
  const hrefs=await page.locator('[data-reforma-reference] a').evaluateAll(nodes=>nodes.map(n=>n.href));
  check(hrefs.length===6&&hrefs.every((v,i)=>new URL(v).searchParams.get('query')===expected[i]),'six maps use their own supplied coordinates');
  const a=await overflow();check(!a.page&&!a.dialog,'Reforma has no horizontal overflow');
  await page.locator('.stamp-guide-route').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${width}-${theme}-reforma.png`,fullPage:false});
  await page.locator('[data-reforma-reference]').last().scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${width}-${theme}-reforma-last.png`,fullPage:false});
  await page.locator('#dialogBackButton').click();await page.locator('#eventDialog').waitFor({state:'hidden'});
  await page.evaluate(()=>setView('newsView'));
  await page.locator(`[data-news-event="${trailId}"]`).click();await page.locator('#eventDialog').waitFor({state:'visible'});
  const roster=page.locator('.dynamax-roster');await roster.locator('summary').click();
  check(await page.locator('.dynamax-roster-list li').count()===56,'illustrative 56-slot roster opens');
  const t=await page.locator('.dynamax-guide').innerText();
  check(t.includes('Lendários e Míticos')&&t.includes('Não é garantido')&&t.includes('comunidade'),'official eligibility and community background distinction');
  const b=await overflow();check(!b.page&&!b.dialog,'Dynamax roster has no horizontal overflow');
  await roster.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${width}-${theme}-trilhas.png`,fullPage:false});
  await context.close();page=null;
 }
 if(errors.length)throw Error(errors.join('\n'));
 fs.writeFileSync(out+'/result.json',JSON.stringify({status:'PASSED_PREVIEW',checks,physical_android_tested:false},null,2)+'\n');
 console.log(JSON.stringify({status:'PASSED_PREVIEW',checks:checks.length,physical_android_tested:false}));
}catch(error){if(page){fs.writeFileSync(out+'/failure.json',JSON.stringify({active,error:String(error),errors,body:await page.locator('body').innerText()},null,2));await page.screenshot({path:out+'/failure.png',fullPage:true});}throw error;
}finally{await browser.close();server.kill('SIGTERM');fs.rmSync(pub,{recursive:true,force:true});}
