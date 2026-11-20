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
  const openView=async view=>{
    if(width<600){
      await page.locator('#spideyMenuToggle').click();
      const item=page.locator('#spideyMobileMenuLinks [data-menu-view="'+view+'"]');
      await item.waitFor({state:'visible',timeout:10000});
      await item.click();
    }else{
      const tab=page.locator('nav.app-tabs [data-view="'+view+'"]');
      await tab.waitFor({state:'visible',timeout:10000});
      await tab.click();
    }
  };
  if(width<600){
    if(await page.locator('nav.app-tabs').isVisible())throw Error('Legacy bottom tabs remain visible with mobile drawer ready');
    await page.locator('#spideyMenuToggle').waitFor({state:'visible',timeout:20000});
  }else{
    await anaTab.waitFor({state:'visible',timeout:20000});
    await trustTab.waitFor({state:'visible',timeout:20000});
  }
  if(await page.locator('#hunterView, .cc-shortcuts [data-cc-view="hunterView"],nav.app-tabs [data-view="hunterView"]').count())throw Error('Retired Caçador remains in public app');
  await page.locator('#anaAirportPanel').waitFor({state:'attached',timeout:10000});
  await page.locator('#nationalTrustGuide').waitFor({state:'attached',timeout:10000});
  if(width<600){
    if(await page.locator('#spideyMobileMenuLinks [data-menu-view="anaView"]').count()!==1)throw Error('ANA missing from mobile drawer');
    if(await page.locator('#spideyMobileMenuLinks [data-menu-view="nationalTrustView"]').count()!==1)throw Error('Trust missing from mobile drawer');
  }
  await openView('anaView');
  if(!await page.locator('#anaView').isVisible())throw Error('ANA did not open its own tab');
  if(await page.locator('#flyView').isVisible())throw Error('ANA incorrectly opens FLY');
  await page.waitForFunction(()=>document.querySelectorAll('#anaAirportList .ana-airport-row').length===7,null,{timeout:15000});
  await page.locator('#anaPosterStage').waitFor({state:'visible',timeout:15000});
  const redPoster=await page.locator('#anaEventPoster').evaluate(image=>({
    src:image.getAttribute('src'),naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,
    width:image.getBoundingClientRect().width,viewport:document.documentElement.clientWidth,
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2
  }));
  if(!redPoster.src?.includes('ana-pokemon-jet-2026-original-overview-v1.jpg')||redPoster.naturalWidth!==1227||redPoster.naturalHeight!==1536||redPoster.width>redPoster.viewport||redPoster.overflow)throw Error('ANA red original failed responsive integrity: '+JSON.stringify(redPoster));
  await page.screenshot({path:output+'/ana-red-'+width+'-'+theme+'.png',fullPage:true});
  if(!String(await page.locator('#anaAirportList').textContent()).includes('Ginásio NÃO verificado'))throw Error('Airport caveat missing');
  await page.locator('[data-ana-phase="2026-ana-pokemon-jet-green"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('#anaAirportList .ana-airport-row').length===14,null,{timeout:10000});
  await page.waitForFunction(()=>document.querySelector('#anaEventPoster')?.naturalWidth===1229,null,{timeout:15000});
  const greenPoster=await page.locator('#anaEventPoster').evaluate(image=>({
    src:image.getAttribute('src'),naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,
    width:image.getBoundingClientRect().width,viewport:document.documentElement.clientWidth,
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2
  }));
  if(!greenPoster.src?.includes('ana-pokemon-jet-2026-original-airports-v1.jpg')||greenPoster.naturalWidth!==1229||greenPoster.naturalHeight!==1536||greenPoster.width>greenPoster.viewport||greenPoster.overflow)throw Error('ANA green original failed responsive integrity: '+JSON.stringify(greenPoster));
  await page.screenshot({path:output+'/ana-green-'+width+'-'+theme+'.png',fullPage:true});
  const search=page.locator('#anaAirportSearch');
  await search.fill('FUK');
  if(await page.locator('#anaAirportList .ana-airport-row').count()!==1)throw Error('ANA airport search not filtered');
  await search.fill('');
  await page.locator('[data-ana-phase="2026-ana-pokemon-jet-blue"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('#anaAirportList .ana-airport-row').length===7,null,{timeout:10000});
  if(await page.locator('#anaPosterStage').isVisible())throw Error('Unapproved poster displayed for ANA Blue');
  if(await page.locator('#anaAirportList [data-ana-coord], #anaAirportList a[href*="google.com/maps"]').count())throw Error('ANA Blue exposed unverified coordinates');
  if(!String(await page.locator('#anaAirportList').textContent()).includes('sem coordenada publicada do Ginásio'))throw Error('ANA Blue coordinate caveat missing');
  await page.screenshot({path:output+'/ana-blue-'+width+'-'+theme+'.png',fullPage:true});
  await openView('nationalTrustView');
  if(!await page.locator('#nationalTrustView').isVisible())throw Error('Trust not direct');
  if(await page.locator('#anaView').isVisible())throw Error('ANA not hidden after switching tab');
  await page.waitForFunction(()=>document.querySelectorAll('#nationalTrustPlaces .nt-place').length===27,null,{timeout:15000});
  if(!await page.locator('#nationalTrustGuide').evaluate(x=>x.open))throw Error('Trust list not open initially');
  if(!String(await page.locator('#nationalTrustGuide').textContent()).includes('coordenadas de referência'))throw Error('National Trust reference label missing');
  await page.locator('#ntSearch').fill('Chirk');
  if(await page.locator('.nt-place').count()!==1)throw Error('Trust place search does not filter');
  await openView('calendarView');
  await page.waitForFunction(()=>window.SpideyCatalog&&document.querySelector('#monthCount'),null,{timeout:10000});
  await page.waitForFunction(()=>document.getElementById('calendarUpdateStatus')?.textContent.includes('Novidades no mesmo link'),null,{timeout:15000});
  const historical=await page.evaluate(()=>{
    const now=new Date();
    return state.events.filter(e=>{const {end}=getBrazilRange(e);return end&&Number.isFinite(end.getTime())&&end<=now}).map(e=>e.id);
  });
  if(historical.length)throw Error('Expired event on public calendar: '+historical.slice(0,10).join(','));
  const todayDisabled=await page.locator('#prevMonth').isDisabled();
  if(!todayDisabled)throw Error('Historical month still directly browsable');
  await openView('weeklyView');
  if(!await page.locator('#weeklyView').isVisible())throw Error('Week view did not open after ANA integration');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+2))throw Error('Week view gained horizontal overflow after ANA integration');
  await page.screenshot({path:output+'/week-'+width+'-'+theme+'.png',fullPage:false});
  await openView('calendarView');
  await page.screenshot({path:output+'/main-'+width+'-'+theme+'.png',fullPage:false});
  results.push({width,theme,ana:7,bulbasaur:14,squirtle:7,nationalTrust:27,redPoster,greenPoster,calendar:true,week:true,anaGuide:true,retiredHunter:true,expiredEvents:0});
  await page.close();
 }
} finally{await browser.close();server.kill('SIGTERM');}
fs.writeFileSync(output+'/results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({checks:results.length,results}));
