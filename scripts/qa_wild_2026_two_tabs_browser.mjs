import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright-core';

const output='test-results/wild-2026';
fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server','4192','--directory','.'],{stdio:'ignore'});
const base='http://127.0.0.1:4192/spidey-app/';
let browser;
try {
  let online=false;
  for(let i=0;i<50;i++){
    try{if((await fetch(base)).ok){online=true;break;}}catch(_){}
    await new Promise(r=>setTimeout(r,200));
  }
  assert.ok(online,'Local server unavailable');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--disable-dev-shm-usage']});
  for(const theme of ['dark','light']){
    const context=await browser.newContext({
      viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,
      colorScheme:theme,timezoneId:'America/Sao_Paulo',serviceWorkers:'block',
      permissions:['clipboard-read','clipboard-write']
    });
    try{
      const page=await context.newPage();
      const errorMessages=[];
      page.on('pageerror',error=>errorMessages.push(String(error.message)));
      await page.addInitScript(t=>localStorage.setItem('spidey-theme',t),theme);
      const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
      assert.equal(response.status(),200);
      await page.waitForFunction(()=>!!window.SpideyWild2026,{timeout:12000});
      assert.equal(await page.locator('.app-tab[data-view="wildIntoView"]').count(),1);
      assert.equal(await page.locator('.app-tab[data-view="wildGlobalView"]').count(),1);
      assert.equal(await page.locator('.app-tab[data-view="wildAreaMexicoView"]').count(),1);
      await page.locator('.app-tab[data-view="wildIntoView"]').evaluate(button=>button.click());
      await page.locator('#wildIntoView .wild-route-summary').waitFor({state:'visible',timeout:22000});
      assert.match(await page.locator('#wildIntoView h1').innerText(),/aventura/i);
      assert.equal(await page.locator('#wildIntoView [data-wild-day]').count(),5);
      assert.match(await page.locator('#wildIntoView .wild-route-summary').innerText(),/64 referências/);
      await page.locator('#wildIntoView [data-wild-day="2026-11-12"]').click();
      assert.match(await page.locator('#wildIntoView .wild-day-picker button[aria-pressed="true"]').innerText(),/12/);
      await page.locator('#wildIntoView [data-wild-mode="all"]').click();
      assert.equal(await page.locator('#wildIntoView .wild-route-list li').count(),64);
      await page.locator('#wildIntoView [data-wild-copy-all]').click();
      const weekText=await page.evaluate(()=>navigator.clipboard.readText());
      assert.equal(weekText.trim().split('\n').length,64,'Week route must copy all points');
      assert.ok(weekText.includes('1.987149,-157.477137'),'Kiritimati must be included');
      const weekImg=page.locator('#wildIntoView .wild-event-art img');
      await page.waitForFunction(()=>document.querySelector('#wildIntoView .wild-event-art img')?.complete,{timeout:13000});
      assert.ok(await weekImg.evaluate(img=>img.naturalWidth>0),'Week hero image did not load (including local fallback)');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false,'Week has horizontal overflow');
      await page.screenshot({path:output+'/week-'+theme+'.png',animations:'disabled',fullPage:true,timeout:30000});

      await page.locator('.app-tab[data-view="wildGlobalView"]').evaluate(button=>button.click());
      await page.locator('#wildGlobalView .wild-route-summary').waitFor({state:'visible',timeout:16000});
      assert.equal(await page.locator('#wildGlobalView [data-wild-day]').count(),2);
      assert.match(await page.locator('#wildGlobalView h1').innerText(),/Área Selvagem/i);
      assert.match(await page.locator('#wildGlobalView .wild-route-summary').innerText(),/64 referências/);
      await page.locator('#wildGlobalView [data-wild-mode="all"]').click();
      assert.equal(await page.locator('#wildGlobalView .wild-route-list li').count(),64);
      const first=await page.locator('#wildGlobalView .wild-route-list li').first().innerText();
      assert.match(first,/Kiritimati/);
      assert.match(first,/13\/11 17:00/,'10h Kiritimati must be 17h Brasília on Nov 13');
      await page.locator('#wildGlobalView [data-wild-copy-all]').click();
      const globalText=await page.evaluate(()=>navigator.clipboard.readText());
      assert.equal(globalText.trim().split('\n').length,64,'Global route must copy all points');
      assert.match(globalText,/1\.987149,-157\.477137/);
      const globalImg=page.locator('#wildGlobalView .wild-event-art img');
      await globalImg.evaluate(img=>img.decode());
      assert.ok(await globalImg.evaluate(img=>img.naturalWidth>0),'Approved Global poster missing');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3),false,'Global horizontal overflow');
      await page.screenshot({path:output+'/global-'+theme+'.png',animations:'disabled',fullPage:true,timeout:30000});

      await page.locator('[data-wild-day="2026-11-15"]').click();
      assert.match(await page.locator('#wildGlobalView .wild-route-summary').innerText(),/64 referências/);
      await page.locator('.app-tab[data-view="wildAreaMexicoView"]').evaluate(button=>button.click());
      assert.match(await page.locator('#wildAreaMexicoView').getAttribute('aria-label'),/México/);
      assert.equal(await page.locator('.app-tab[data-view="wildAreaMexicoView"]').innerText(),'México · arquivo');
      assert.match(await page.locator('#wildAreaMexicoView .wild-mx-hero-tags').innerText(),/encerrado/i);
      const archiveAction=page.locator('#wildAreaMexicoView .wild-mx-hero-actions [data-wild-stamps]');
      assert.equal(await archiveAction.count(),1,'Expired event must not keep a dead detail button');
      await archiveAction.click();
      await page.waitForFunction(()=>!document.getElementById('stampsView').hidden,{timeout:9000});
      assert.doesNotMatch(await page.locator('#wildGlobalView .wild-event-art figcaption').innerText(),/aprovada/i,
        'Public visual should not expose internal art approval records');

      const ownErrors=errorMessages.filter(message=>/wild-area-20261109|SpideyWild2026/i.test(message));
      assert.deepEqual(ownErrors,[],'Wild module must not throw runtime errors');
      console.log('WILD_TWO_TABS_OK',JSON.stringify({theme,weekPoints:weekText.trim().split('\n').length,globalPoints:globalText.trim().split('\n').length,media:'loaded'}));
    } finally {await context.close();}
  }
} finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
}
