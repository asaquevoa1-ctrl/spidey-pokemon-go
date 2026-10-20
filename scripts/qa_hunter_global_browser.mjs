import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const output = 'test-results/hunter-global';
fs.mkdirSync(output, {recursive:true});
const server = spawn('python3', ['-m', 'http.server', '4175', '--directory', '.'], {stdio:'ignore'});
let ready = false;
for (let i=0;i<50;i++) {
  try { if ((await fetch('http://127.0.0.1:4175/spidey-app/index.html')).ok) {ready=true;break;} } catch {}
  await new Promise(resolve=>setTimeout(resolve,250));
}
if (!ready) {server.kill('SIGTERM');throw Error('Caçador preview server unavailable');}
const browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const checks = [];
try {
  // Production data starts empty: never advertise yesterday's Shieldon as live.
  const empty=await browser.newPage({viewport:{width:390,height:850}});
  await empty.goto('http://127.0.0.1:4175/spidey-app/index.html',{waitUntil:'domcontentloaded'});
  await empty.locator('.app-tabs [data-view="hunterView"]').click();
  await empty.locator('#hunterLiveStatus').waitFor({state:'visible',timeout:10000});
  await empty.waitForFunction(()=>document.getElementById('hunterLiveStatus')?.textContent.includes('Aguardando acesso autorizado'),null,{timeout:10000});
  if(await empty.locator('.hunter-live-card').count()!==0)throw Error('Historical or fake card present with unauthorized source');
  if(await empty.locator('#hunterMessage').count()!==0)throw Error('Manual message paste should not be primary UI');
  await empty.close();
  for (const width of [360,390,1280]) for (const theme of ['light','dark']) {
    const page = await browser.newPage({viewport:{width,height:900},timezoneId:'America/Sao_Paulo'});
    const time=Date.now(),iso=t=>new Date(t).toISOString();
    const fixture={schema:'spidey-hunter-feed-v1',source_status:'connected',generated_at:iso(time),items:[
      {pokemon:'Shieldon',iv_percent:100,cp:827,level:35,gender:'Macho',coordinates:'50.105208,8.7271780',reported_at:iso(time-60000),expires_at:iso(time+8*60000),source:'Teste autorizado (sintético)',pvp_rank:null,shiny_eligible:false},
      {pokemon:'Magikarp',iv_percent:0,cp:10,level:1,gender:null,coordinates:'-23.5505,-46.6333',reported_at:iso(time-30000),expires_at:iso(time+6*60000),source:'Teste autorizado (sintético)',pvp_rank:null,shiny_eligible:false}
    ]};
    await page.route('**/data/hunter-feed.json',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)}));
    await page.addInitScript(value=>localStorage.setItem('spidey-theme',value),theme);
    await page.goto('http://127.0.0.1:4175/spidey-app/index.html',{waitUntil:'domcontentloaded'});
    await page.locator('[data-view="flyView"]').first().waitFor({state:'attached',timeout:20000});
    const shortcut=page.locator('.cc-shortcuts [data-cc-view="hunterView"]');
    await shortcut.waitFor({state:'attached',timeout:10000});
    const shortcutVisible=await shortcut.isVisible();
    if(shortcutVisible) await shortcut.click();
    else {
      // Some compact home layouts hide promotional shortcuts; the primary tab must still work.
      const homeStatus=await page.evaluate(()=>{
        const b=document.querySelector('.cc-shortcuts [data-cc-view="hunterView"]');
        const a=b?.closest('.app-view');
        return {view:a?.id,hidden:a?.hidden,buttonDisplay:b?getComputedStyle(b).display:null};
      });
      console.log('Hunter home shortcut hidden in viewport',width,theme,JSON.stringify(homeStatus));
      await page.locator('.app-tabs [data-view="hunterView"]').click();
    }
    if(!await page.locator('#hunterView').isVisible()) throw Error('Caçador navigation failed');
    await page.locator('[data-view="flyView"]').first().click();
    if(await page.locator('#hunterPanel').isVisible())throw Error('Caçador must not appear inside FLY');
    const filterTab=page.locator('.app-tabs [data-view="hunterView"]');
    if(await filterTab.count()!==1)throw Error('Dedicated Filtro tab missing');
    if((await filterTab.textContent()).trim()!=='Filtro')throw Error('Filtro tab label missing');
    await filterTab.click();
    const panel=page.locator('#hunterPanel');
    await panel.waitFor({state:'visible',timeout:10000});
    const hunterScreen=page.locator('#hunterView');
    if(!await hunterScreen.isVisible()||await page.locator('#flyView').isVisible())throw Error('Separate screen navigation failed');
    const navStyle=await filterTab.evaluate(el=>({background:getComputedStyle(el).backgroundImage,width:el.getBoundingClientRect().width}));
    if(!String(navStyle.background).includes('gradient')||navStyle.width<55) {
      const diag=await page.evaluate(()=>{
        const el=document.querySelector('.app-tabs .hunter-tab');
        const style=el?getComputedStyle(el):null;
        const home=document.querySelector('.cc-hunter-link'),hero=document.querySelector('.experience-intro');
        return {body:document.body.className,tab:el?.outerHTML,background:style?.background,backgroundImage:style?.backgroundImage,display:style?.display,visibility:style?.visibility,width:el?.getBoundingClientRect().width,cssLink:!!document.querySelector('link[href*="hunter-v1.css"]'),cssLoaded:[...document.styleSheets].some(x=>String(x.href||'').includes('hunter-v1.css')),heroDisplay:hero?getComputedStyle(hero).display:null,homeVisible:home?getComputedStyle(home).visibility:null};
      });
      throw Error('Caçador tab highlight: '+JSON.stringify(diag));
    }
    const visual=await page.evaluate(()=>{
      const nav=document.querySelector('nav.app-tabs');
      const tabs=[...nav.querySelectorAll('.app-tab')];
      const navRect=nav.getBoundingClientRect(),rects=tabs.map(tab=>tab.getBoundingClientRect());
      const hero=document.querySelector('.hunter-intro h1');
      return {
        navDisplay:getComputedStyle(nav).display,navWrap:getComputedStyle(nav).flexWrap,
        navHeight:navRect.height,tabRows:new Set(rects.map(r=>Math.round(r.top))).size,
        overlap:rects.some((r,i)=>rects.some((q,j)=>i!==j&&Math.min(r.right,q.right)-Math.max(r.left,q.left)>3&&Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top)>3)),
        heroColor:getComputedStyle(hero).color,
        heroTextFill:getComputedStyle(hero).webkitTextFillColor,
        mobileScroll:nav.scrollWidth>nav.clientWidth,
        sources:[...document.querySelectorAll('#hunterTrustedSources a')].map(a=>a.href)
      };
    });
    if(width<=760){
      if(visual.navDisplay!=='flex'||visual.navWrap!=='nowrap'||visual.tabRows!==1||visual.navHeight>85||visual.overlap)
        throw Error('Mobile nav wrapped or collided '+JSON.stringify(visual));
    }
    if(visual.heroColor!=='rgb(247, 251, 255)'||visual.heroTextFill!=='rgb(247, 251, 255)')
      throw Error('Poor hero contrast '+JSON.stringify(visual));
    if(!visual.sources.some(v=>v.includes('map-s.spsmapping.eu'))||!visual.sources.some(v=>v.includes('pogoalerts.net')))
      throw Error('External source links missing');
    const cats=page.locator('[data-hunter-category]');
    if(await cats.count()!==6)throw Error('The six Caçador filters are missing');
    await page.locator('[data-hunter-category="nundo"]').click();
    if(await page.locator('[data-hunter-category="nundo"]').getAttribute('aria-pressed')!=='true') throw Error('Nundo filter not selectable');
    if(!String(await page.locator('#hunterExternal').getAttribute('href')).includes('/feeds/zero-iv'))throw Error('0% target wrong');
    await page.locator('[data-hunter-category="hundo"]').click();
    await page.locator('.hunter-feed-alternatives summary').first().click();
    if(!await page.locator('#hunterHundoFeeds').isVisible())throw Error('100% shortcuts not visible in optional search');
    await page.locator('.hunter-checker summary').click();
    await page.locator('#hunterAttack').fill('15');
    await page.locator('#hunterDefense').fill('15');
    await page.locator('#hunterStamina').fill('15');
    if(!String(await page.locator('#hunterIvStatus').textContent()).includes('IV 100%'))throw Error('100% IV calculation failed');
    await page.locator('#hunterAttack').fill('0');
    await page.locator('#hunterDefense').fill('0');
    await page.locator('#hunterStamina').fill('0');
    if(!String(await page.locator('#hunterIvStatus').textContent()).includes('IV 0%'))throw Error('0% IV calculation failed');
    await page.locator('#hunterCoords').fill('-25.4221,-49.2717');
    if(await page.locator('#hunterCopy').isDisabled())throw Error('Valid coordinates not copyable');
    const map=page.locator('#hunterMap');
    if(!await map.isVisible()||!String(await map.getAttribute('href')).includes('maps/search/'))throw Error('Location map URL missing');
    await page.locator('#hunterLiveStatus').waitFor({state:'visible',timeout:10000});
    await page.waitForFunction(()=>document.querySelectorAll('.hunter-live-card').length===1 && document.querySelector('.hunter-live-name')?.textContent==='Shieldon',null,{timeout:10000});
    if(!String(await page.locator('.hunter-live-card').textContent()).includes('Shieldon'))throw Error('Fresh 100% Shieldon card missing');
    if(!String(await page.locator('.hunter-live-card').textContent()).includes('50.105208,8.7271780'))throw Error('Shieldon precise coordinate missing');
    if(!String(await page.locator('.hunter-live-card').textContent()).includes('min restantes'))throw Error('Valid expiry missing');
    await page.evaluate(()=>{window.__copied=null;navigator.clipboard.writeText=async function(v){window.__copied=v;};});
    await page.locator('.hunter-live-copy').first().click();
    if(await page.evaluate(()=>window.__copied)!=='50.105208,8.7271780')throw Error('One-tap copy failed');
    await page.locator('[data-hunter-category="nundo"]').click();
    await page.waitForFunction(()=>document.querySelector('.hunter-live-name')?.textContent==='Magikarp',null,{timeout:10000});
    if(await page.locator('.hunter-live-card').count()!==1)throw Error('0% filter includes wrong species');
    await page.locator('[data-hunter-category="shundo"]').click();
    if(await page.locator('.hunter-live-card').count()!==0)throw Error('Incorrect fake Shundo from Hundo');
    await page.locator('[data-hunter-category="hundo"]').click();
    await page.waitForFunction(()=>document.querySelector('.hunter-live-name')?.textContent==='Shieldon',null,{timeout:10000});
    if(await page.locator('#hunterMessage').count()!==0)throw Error('Paste box still shown as primary feature');
    await page.locator('#hunterCoords').fill('91,0');
    if(!await page.locator('#hunterCopy').isDisabled()||await map.isVisible())throw Error('Invalid coordinates were accepted');
    await page.locator('#hunterCoords').fill('-25.4221,-49.2717');
    const sizes=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth, push:!!document.getElementById('notificationButton'), fly:!!document.getElementById('flyRouteList'), pvp:!!document.getElementById('pvpView'), disabledNetwork:document.querySelector('[data-hunter-category="shiny"]')!==null}));
    if(sizes.overflow||!sizes.push||!sizes.fly||!sizes.pvp||!sizes.disabledNetwork) throw Error('Regression or horizontal scroll '+JSON.stringify(sizes));
    await page.screenshot({path:`${output}/${width}-${theme}.png`,fullPage:true});
    checks.push({width,theme,dedicatedTab:true,shortcutVisible,highlighted:true,flyFreeOfHunter:true,filters:6,message:'automatic feed cards, source status and one-tap copy',iv:'100% + 0%',coord:'valid + invalid',pushPreserved:true,pvpPreserved:true,overflow:false});
    await page.close();
  }
  fs.writeFileSync(output+'/results.json', JSON.stringify({status:'PASSED_PREVIEW',checks,physical_android_tested:false},null,2)+'\n');
  console.log('Hunter responsive QA passed',JSON.stringify(checks));
} finally {await browser.close();server.kill('SIGTERM');}
