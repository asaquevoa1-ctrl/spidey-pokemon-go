import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';
const output='test-results/nav-partnerships';
fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server','4175','--directory','.'],{stdio:'ignore'});
let ready=false;
for(let i=0;i<55;i++){
  try{if((await fetch('http://127.0.0.1:4175/spidey-app/index.html')).ok){ready=true;break;}}catch{}
  await new Promise(r=>setTimeout(r,250));
}
if(!ready){server.kill();throw Error('Spidey local server unavailable');}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const results=[];
try {
 for(const width of [390,1280])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:880},timezoneId:'America/Sao_Paulo'});
  await page.addInitScript(t=>localStorage.setItem('spidey-theme',t),theme);
  await page.goto('http://127.0.0.1:4175/spidey-app/index.html',{waitUntil:'domcontentloaded'});
  const anaTab=page.locator('nav.app-tabs [data-view="anaView"]');
  const trustTab=page.locator('nav.app-tabs [data-view="nationalTrustView"]');
  await anaTab.waitFor({state:'visible',timeout:20000});
  await trustTab.waitFor({state:'visible',timeout:20000});
  if(await page.locator('#hunterView, .cc-shortcuts [data-cc-view="hunterView"],nav.app-tabs [data-view="hunterView"]').count())throw Error('Retired Caçador remains in public app');
  await page.locator('#anaAirportPanel').waitFor({state:'attached',timeout:10000});
  await page.locator('#nationalTrustGuide').waitFor({state:'attached',timeout:10000});
  if(width<600){
    const nav=await page.locator('nav.app-tabs').evaluate(el=>{
      const tabs=[...el.querySelectorAll('.app-tab')].map(x=>x.getBoundingClientRect());
      const rows=new Set(tabs.map(x=>Math.round(x.top))).size;
      const cs=getComputedStyle(el);
      return {display:cs.display,flexWrap:cs.flexWrap,rows,height:el.getBoundingClientRect().height,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};
    });
    if(nav.display!=='flex'||nav.flexWrap!=='nowrap'||nav.rows!==1||nav.height>90)throw Error('Mobile bottom tabs wrapped: '+JSON.stringify(nav));
  }
  await anaTab.click();
  if(!await page.locator('#anaView').isVisible())throw Error('ANA did not open its own tab');
  if(await page.locator('#flyView').isVisible())throw Error('ANA incorrectly opens FLY');
  await page.waitForFunction(()=>document.querySelectorAll('#anaAirportList .ana-airport-row').length===7,null,{timeout:15000});
  if(!String(await page.locator('#anaAirportList').textContent()).includes('Ginásio NÃO verificado'))throw Error('Airport caveat missing');
  await page.locator('[data-ana-phase="2026-ana-pokemon-jet-green"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('#anaAirportList .ana-airport-row').length===14,null,{timeout:10000});
  const search=page.locator('#anaAirportSearch');
  await search.fill('FUK');
  if(await page.locator('#anaAirportList .ana-airport-row').count()!==1)throw Error('ANA airport search not filtered');
  await search.fill('');
  await trustTab.click();
  if(!await page.locator('#nationalTrustView').isVisible())throw Error('Trust not direct');
  if(await page.locator('#anaView').isVisible())throw Error('ANA not hidden after switching tab');
  await page.waitForFunction(()=>document.querySelectorAll('#nationalTrustPlaces .nt-place').length===27,null,{timeout:15000});
  if(!await page.locator('#nationalTrustGuide').evaluate(x=>x.open))throw Error('Trust list not open initially');
  if(!String(await page.locator('#nationalTrustGuide').textContent()).includes('não são pontos exatos verificados'))throw Error('National Trust point caveat missing');
  await page.locator('#ntSearch').fill('Chirk');
  if(await page.locator('.nt-place').count()!==1)throw Error('Trust place search does not filter');
  await page.locator('nav.app-tabs [data-view="calendarView"]').click();
  await page.waitForFunction(()=>window.SpideyCatalog&&document.querySelector('#monthCount'),null,{timeout:10000});
  await page.waitForFunction(()=>document.getElementById('calendarUpdateStatus')?.textContent.includes('Novidades no mesmo link'),null,{timeout:15000});
  const historical=await page.evaluate(()=>{
    const now=new Date();
    return state.events.filter(e=>{const {end}=getBrazilRange(e);return end&&Number.isFinite(end.getTime())&&end<=now}).map(e=>e.id);
  });
  if(historical.length)throw Error('Expired event on public calendar: '+historical.slice(0,10).join(','));
  const todayDisabled=await page.locator('#prevMonth').isDisabled();
  if(!todayDisabled)throw Error('Historical month still directly browsable');
  await page.screenshot({path:output+'/main-'+width+'-'+theme+'.png',fullPage:false});
  results.push({width,theme,ana:7,bulbasaur:14,nationalTrust:27,retiredHunter:true,expiredEvents:0});
  await page.close();
 }
} finally{await browser.close();server.kill('SIGTERM');}
fs.writeFileSync(output+'/results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({checks:results.length,results}));
