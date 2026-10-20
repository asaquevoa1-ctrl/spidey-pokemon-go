import { spawn } from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = '1';
const output = 'test-results/cosmic-samsung';
fs.mkdirSync(output,{recursive:true});
const manifest = JSON.parse(fs.readFileSync('spidey-app/manifest.webmanifest','utf8'));
const expectedIcon = 'assets/branding/20261019/spidey-icon-cosmic-';
assert.equal(manifest.icons[0].src,expectedIcon+'192.png');
assert.equal(manifest.icons[1].src,expectedIcon+'512.png');

const server=spawn('python3',['-m','http.server','4187','--directory','.'],{stdio:'ignore'});
const base='http://127.0.0.1:4187/spidey-app/';
let browser;
const checks=[];
try {
  let ready=false;
  for(let i=0;i<50;i++){
    try{if((await fetch(base)).ok){ready=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,200));
  }
  if(!ready)throw Error('Spidey local HTTP server did not start');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
  for(const theme of ['dark','light']){
    const context=await browser.newContext({
      viewport:{width:390,height:844},
      deviceScaleFactor:2.75,
      isMobile:true,hasTouch:true,
      userAgent:'Mozilla/5.0 (Linux; Android 14; SM-A725M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
      serviceWorkers:'block',
      colorScheme:theme
    });
    try {
      const page=await context.newPage();
      await page.addInitScript(t=>{
        localStorage.setItem('spidey-theme',t);
        window.__spideyNativePayload=null;
        Object.defineProperty(navigator,'share',{configurable:true,value:async value=>{window.__spideyNativePayload=value;}});
      },theme);
      const start=Date.now();
      const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:25000});
      assert.equal(response.status(),200);
      assert.equal(await page.evaluate(()=>window.SPIDEY_COSMIC_ASSETS_VERIFIED),true);
      await page.waitForFunction(()=>document.getElementById('spideySplash')?.hidden===true,null,{timeout:11000});
      const elapsed=Date.now()-start;
      assert.ok(elapsed<10500,'Splash did not exit promptly: '+elapsed);
      await page.waitForFunction(()=>document.body.classList.contains('cosmic-inapp-art'),null,{timeout:12000});
      const css=await page.evaluate(()=>getComputedStyle(document.body).backgroundImage);
      assert.ok(css.includes('spidey-clean-cosmic-20261019.webp'),'Approved clean background not applied');
      const loaded=await page.evaluate(async()=>{
        const paths=[
          'assets/branding/20261019/spidey-opening-cosmic-20261019.webp',
          'assets/branding/20261019/spidey-loading-cosmic-20261019.webp',
          'assets/branding/20261019/spidey-icon-cosmic-20261019.webp',
          'assets/branding/20261019/spidey-wallpaper-cosmic-20261019.webp',
          'assets/branding/20261019/spidey-clean-cosmic-20261019.webp',
          'assets/branding/20261019/spidey-icon-cosmic-192.png',
          'assets/branding/20261019/spidey-icon-cosmic-512.png'
        ];
        return Promise.all(paths.map(async path=>({path,ok:(await fetch(path)).ok})));
      });
      assert.ok(loaded.every(x=>x.ok),'Missing new image: '+JSON.stringify(loaded.filter(x=>!x.ok)));
      await page.locator('#shareSpideyButton').waitFor({state:'visible',timeout:11000});
      await page.locator('#shareSpideyButton').click();
      await page.waitForFunction(()=>window.__spideyNativePayload !== null,null,{timeout:4000});
      const shared=await page.evaluate(()=>window.__spideyNativePayload);
      assert.ok(shared?.text?.includes(base),'Android share payload missing working link');
      assert.ok(!shared.text.includes('spidey-nexus'),'Prohibited branding in share text');
      await page.screenshot({path:`${output}/galaxy-390-${theme}.png`,animations:'disabled',timeout:16000});
      checks.push({profile:'Samsung Galaxy Android 14 simulated',width:390,theme,images:loaded.length,splashMs:elapsed,share:'ok',background:'ok'});
    }finally{await context.close();}
  }
  console.log(JSON.stringify({passed:checks.length,checks}));
}finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
}
