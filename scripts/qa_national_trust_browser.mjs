import {spawn} from 'node:child_process';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const output='test-results/national-trust-27';
fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server','4183','--directory','.'],{stdio:'ignore'});
let alive=false;
for(let i=0;i<60;i++){
  try{if((await fetch('http://127.0.0.1:4183/spidey-app/index.html')).ok){alive=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,250));
}
if(!alive){server.kill('SIGTERM');throw Error('Test server unavailable');}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const checks=[];
try{
 for(const width of [390,1280])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.addInitScript(v=>{
    localStorage.setItem('spidey-theme',v);
    window.__ntLastCopy=null;
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__ntLastCopy=text;}}});
  },theme);
  await page.goto('http://127.0.0.1:4183/spidey-app/index.html',{waitUntil:'domcontentloaded'});
  const tab=page.locator('[data-view="flyView"]').first();
  await tab.waitFor({state:'attached',timeout:15000});
  await tab.click();
  const jump=page.locator('.nt-jump');
  await jump.waitFor({state:'visible',timeout:15000});
  await jump.click();
  await page.waitForFunction(()=>document.querySelectorAll('#nationalTrustPlaces .nt-place').length===27,null,{timeout:15000});
  const guide=page.locator('#nationalTrustGuide');
  if(!await guide.evaluate(el=>el.open))throw Error('National Trust guide did not expand');
  if(!String(await guide.textContent()).includes('não são pontos exatos'))throw Error('False precision warning missing');
  if(!String(await guide.textContent()).includes('30 lançamentos bons'))throw Error('Research objective missing');
  if(!String(await page.locator('#nationalTrustCount').textContent()).includes('27 de 27'))throw Error('Not all 27 sites available');
  await page.locator('#ntGroup').selectOption('Norte e Irlanda do Norte');
  if(await page.locator('#nationalTrustPlaces .nt-place').count()!==5)throw Error('Northern grouping not 5');
  await page.locator('#ntGroup').selectOption('all');
  await page.locator('#ntSearch').fill('Wimpole');
  if(await page.locator('#nationalTrustPlaces .nt-place').count()!==1)throw Error('Wimpole search failed');
  const coords=await page.locator('#nationalTrustPlaces code').first().textContent();
  if(coords!=='52.14105,-0.04978')throw Error('Wimpole decimal comma normalization wrong: '+coords);
  await page.locator('#nationalTrustPlaces .nt-copy').first().click();
  if(await page.evaluate(()=>window.__ntLastCopy)!=='52.14105,-0.04978')throw Error('One tap copy did not preserve exact precision');
  await page.locator('#ntSearch').fill('Tyntesfield');
  if(await page.locator('#nationalTrustPlaces .nt-place').count()!==1)throw Error('Tyntesfield search failed');
  if(await page.locator('#nationalTrustPlaces code').first().textContent()!=='51.44079,-2.71242')throw Error('Tyntesfield decimal comma normalization wrong');
  await page.locator('#ntSearch').fill('');
  if(await page.locator('#nationalTrustPlaces .nt-place').count()!==27)throw Error('List did not restore after search');
  if(!await page.locator('.ana-airport-panel').count())throw Error('ANA route regressed');
  if(!await page.locator('#pvpView').count())throw Error('PvP regressed');
  if(!await page.locator('#notificationButton').count())throw Error('Notifications regressed');
  const clip=await page.evaluate(()=>{
    const guide=document.getElementById('nationalTrustGuide').getBoundingClientRect();
    return {width:guide.width,viewport:window.innerWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2};
  });
  if(clip.width>clip.viewport||clip.overflow)throw Error('Mobile horizontal overflow '+JSON.stringify(clip));
  await page.screenshot({path:output+'/'+width+'-'+theme+'.png',fullPage:false});
  checks.push({width,theme,sites:27,groups:4,copy:true,sourceCaveat:true,alertsPreserved:true});
  await page.close();
 }
 fs.writeFileSync(output+'/results.json',JSON.stringify({status:'PASS',checks,androidPhysicalQA:false},null,2));
 console.log('National Trust 27 QA PASSED',JSON.stringify(checks));
}finally{await browser.close();server.kill('SIGTERM');}
