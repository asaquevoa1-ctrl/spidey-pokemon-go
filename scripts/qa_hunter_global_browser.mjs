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
  for (const width of [360,390,1280]) for (const theme of ['light','dark']) {
    const page = await browser.newPage({viewport:{width,height:900},timezoneId:'America/Sao_Paulo'});
    await page.addInitScript(value=>localStorage.setItem('spidey-theme',value),theme);
    await page.goto('http://127.0.0.1:4175/spidey-app/index.html',{waitUntil:'domcontentloaded'});
    await page.locator('[data-view="flyView"]').first().waitFor({state:'attached',timeout:20000});
    const shortcut=page.locator('.cc-shortcuts [data-cc-view="hunterView"]');
    await shortcut.waitFor({state:'visible',timeout:10000});
    await shortcut.click();
    if(!await page.locator('#hunterView').isVisible()) throw Error('Home shortcut did not navigate to Filtro');
    await page.locator('[data-view="flyView"]').first().click();
    const ana=page.locator('#anaAirportPanel');
    await ana.waitFor({state:'visible',timeout:10000});
    await page.waitForFunction(()=>document.querySelectorAll('#anaAirportList .ana-airport-row').length===7,null,{timeout:10000});
    if(!String(await page.locator('#anaAirportStatus').textContent()).includes('nenhum Ginásio'))throw Error('ANA source disclaimer missing');
    if(!String(await page.locator('#anaAirportList').textContent()).includes('35.550815,139.788233'))throw Error('Haneda T2 reference missing');
    if(!String(await page.locator('#anaAirportList').textContent()).includes('35.543887,139.768652'))throw Error('Haneda T3 reference missing');
    await page.locator('[data-ana-phase="2026-ana-pokemon-jet-green"]').click();
    if(await page.locator('.ana-airport-row').count()!==14)throw Error('Green 14 airport points missing');
    if(!String(await page.locator('#anaAirportList').textContent()).includes('26.2064,127.6465'))throw Error('Naha reference missing');
    await page.locator('[data-ana-phase="2026-ana-pokemon-jet-red"]').click();
    if(await page.locator('.ana-airport-row').count()!==7)throw Error('Red 7 terminal points missing');
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
    if(!String(navStyle.background).includes('gradient')||navStyle.width<55) throw Error('Tab not highlighted');
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
        sources:[...document.querySelectorAll('.hunter-community-links a')].map(a=>a.href)
      };
    });
    if(width<=760){
      if(visual.navDisplay!=='flex'||visual.navWrap!=='nowrap'||visual.tabRows!==1||visual.navHeight>85||visual.overlap)
        throw Error('Mobile nav wrapped or collided '+JSON.stringify(visual));
    }
    if(visual.heroColor!=='rgb(247, 251, 255)'||visual.heroTextFill!=='rgb(247, 251, 255)')
      throw Error('Poor hero contrast '+JSON.stringify(visual));
    if(!visual.sources.some(v=>v.includes('discord.gg/pokedex100'))||!visual.sources.some(v=>v.includes('t.me/pokemon_pogo_iv100_100iv_100_pvp')))
      throw Error('Community links missing');
    const cats=page.locator('[data-hunter-category]');
    if(await cats.count()!==6)throw Error('The six Caçador filters are missing');
    await page.locator('[data-hunter-category="nundo"]').click();
    if(await page.locator('[data-hunter-category="nundo"]').getAttribute('aria-pressed')!=='true') throw Error('Nundo filter not selectable');
    if(!String(await page.locator('#hunterExternal').getAttribute('href')).includes('/feeds/zero-iv'))throw Error('0% target wrong');
    await page.locator('[data-hunter-category="hundo"]').click();
    if(!await page.locator('#hunterHundoFeeds').isVisible())throw Error('100% shortcuts not visible');
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
    const intake=page.locator('#hunterMessage');
    await intake.fill('Discord: Pokémon 100% ✨ | 40.712345,-73.987654 | expires in 10m');
    await page.locator('#hunterExtract').click();
    if(await page.locator('#hunterCoords').inputValue()!=='40.712345,-73.987654')throw Error('Message extraction failed');
    await intake.fill('👽 #Shieldon 💯\n827 ♂ 35 👈🏼\niv100.cc ∙ ΔΓΞΔ ⁵¹\n50.105208,8.7271780');
    await page.locator('#hunterExtract').click();
    const parsed=page.locator('#hunterParsed');
    if(!await parsed.isVisible())throw Error('IV100 preview not displayed');
    if((await page.locator('#hunterParsedPokemon').textContent())!=='Shieldon')throw Error('Shieldon species not extracted');
    for(const [id,match] of [['hunterParsedIV','100% informado'],['hunterParsedCP','827'],['hunterParsedGender','Macho'],['hunterParsedLevel','35'],['hunterParsedSource','iv100.cc'],['hunterParsedCoords','50.105208,8.7271780']]){
      if(!String(await page.locator('#'+id).textContent()).includes(match))throw Error('IV100 field '+id+' not extracted');
    }
    if(!String(await parsed.textContent()).includes('Sem horário de desaparecimento'))throw Error('Unknown expiry was incorrectly claimed');
    if((await page.locator('#hunterCoords').inputValue())!=='50.105208,8.7271780')throw Error('Shieldon precise coordinates not copied into editor');
    await intake.fill('CP 891 IV 15,15,15');
    await page.locator('#hunterExtract').click();
    if(!String(await page.locator('#hunterExtractStatus').textContent()).includes('Não encontrei')||await page.locator('#hunterParsed').isVisible())throw Error('Invalid IV-only message was incorrectly accepted');
    await page.locator('#hunterCoords').fill('91,0');
    if(!await page.locator('#hunterCopy').isDisabled()||await map.isVisible())throw Error('Invalid coordinates were accepted');
    await page.locator('#hunterCoords').fill('-25.4221,-49.2717');
    const sizes=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth, push:!!document.getElementById('notificationButton'), fly:!!document.getElementById('flyRouteList'), pvp:!!document.getElementById('pvpView'), disabledNetwork:document.querySelector('[data-hunter-category="shiny"]')!==null}));
    if(sizes.overflow||!sizes.push||!sizes.fly||!sizes.pvp||!sizes.disabledNetwork) throw Error('Regression or horizontal scroll '+JSON.stringify(sizes));
    await page.screenshot({path:`${output}/${width}-${theme}.png`,fullPage:true});
    checks.push({width,theme,dedicatedTab:true,highlighted:true,flyFreeOfHunter:true,filters:6,message:'Discord/Telegram local parsing',iv:'100% + 0%',coord:'valid + invalid',pushPreserved:true,pvpPreserved:true,overflow:false});
    await page.close();
  }
  fs.writeFileSync(output+'/results.json', JSON.stringify({status:'PASSED_PREVIEW',checks,physical_android_tested:false},null,2)+'\n');
  console.log('Hunter responsive QA passed',JSON.stringify(checks));
} finally {await browser.close();server.kill('SIGTERM');}
