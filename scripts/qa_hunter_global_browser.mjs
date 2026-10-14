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
  for (const width of [390,1280]) for (const theme of ['light','dark']) {
    const page = await browser.newPage({viewport:{width,height:900},timezoneId:'America/Sao_Paulo'});
    await page.addInitScript(value=>localStorage.setItem('spidey-theme',value),theme);
    await page.goto('http://127.0.0.1:4175/spidey-app/index.html',{waitUntil:'domcontentloaded'});
    await page.locator('[data-view="flyView"]').first().waitFor({state:'attached',timeout:20000});
    await page.locator('[data-view="flyView"]').first().click();
    const panel=page.locator('#hunterPanel');
    await panel.waitFor({state:'visible',timeout:10000});
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
    await page.locator('#hunterCoords').fill('91,0');
    if(!await page.locator('#hunterCopy').isDisabled()||await map.isVisible())throw Error('Invalid coordinates were accepted');
    await page.locator('#hunterCoords').fill('-25.4221,-49.2717');
    const sizes=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth, push:!!document.getElementById('notificationButton'), fly:!!document.getElementById('flyRouteList'), pvp:!!document.getElementById('pvpView'), disabledNetwork:document.querySelector('[data-hunter-category="shiny"]')!==null}));
    if(sizes.overflow||!sizes.push||!sizes.fly||!sizes.pvp||!sizes.disabledNetwork) throw Error('Regression or horizontal scroll '+JSON.stringify(sizes));
    await page.screenshot({path:`${output}/${width}-${theme}.png`,fullPage:true});
    checks.push({width,theme,filters:6,iv:'100% + 0%',coord:'valid + invalid',pushPreserved:true,pvpPreserved:true,overflow:false});
    await page.close();
  }
  fs.writeFileSync(output+'/results.json', JSON.stringify({status:'PASSED_PREVIEW',checks,physical_android_tested:false},null,2)+'\n');
  console.log('Hunter responsive QA passed',JSON.stringify(checks));
} finally {await browser.close();server.kill('SIGTERM');}
