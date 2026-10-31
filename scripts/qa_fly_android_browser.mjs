import {spawn} from 'node:child_process';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const output='test-results/fly-android';
fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server','4186','--directory','.'],{stdio:'ignore'});
let ready=false;
for(let i=0;i<45;i++){try{if((await fetch('http://127.0.0.1:4186/spidey-app/index.html')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
if(!ready){server.kill();throw Error('FLY preview server not ready');}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const fixed='2026-10-31T12:05:00Z';
let results=[];
try {
  for(const type of ['detail-secondary','detail-primary','drawer']){
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',timezoneId:'America/Sao_Paulo'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(({fixed})=>{
      const NativeDate=Date,now=new NativeDate(fixed).valueOf();
      class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
      Object.setPrototypeOf(FixedDate,NativeDate);window.Date=FixedDate;
      localStorage.setItem('spidey-theme','dark');
    },{fixed});
    await page.goto('http://127.0.0.1:4186/spidey-app/index.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>typeof state!=='undefined'&&state.events.some(e=>e.id==='2026-10-super-mega-raid-day'),null,{timeout:25000});
    if(type==='drawer'){
      await page.locator('#spideyMenuToggle').click();
      await page.locator('#spideyMobileMenuLinks [data-menu-view="flyView"]').click();
      await page.waitForTimeout(450);
      await page.locator('#flyEventSelect').selectOption('2026-10-super-mega-raid-day');
    } else {
      await page.evaluate(()=>openEvent(state.events.find(e=>e.id==='2026-10-super-mega-raid-day')));
      const button=type==='detail-secondary'?'#eventDialog .cc-fly-action':'#eventDialog #openEventFly';
      await page.locator(button).click({timeout:15000});
    }
    await page.waitForTimeout(600);
    const stateRead=await page.evaluate(()=>{
      const fly=document.getElementById('flyView'),calendar=document.getElementById('calendarView');
      const selector=fly?.querySelector('#flyEventSelect');
      const controls=fly?.querySelector('#flyRouteList');
      const native=fly?.querySelector(':scope > .section');
      const promo=fly?.querySelector('.space-entry');
      const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),height:Math.round(r.height)};};
      return {flyHidden:fly?.hidden,calendarHidden:calendar?.hidden,flyDisplay:fly?getComputedStyle(fly).display:null,calendarDisplay:calendar?getComputedStyle(calendar).display:null,routeSectionOpacity:native?Number(getComputedStyle(native).opacity):null,routeSectionVisibility:native?getComputedStyle(native).visibility:null,selected:selector?.value,selectRect:rect(selector),nativeRect:rect(native),promoRect:rect(promo),routeRect:rect(controls),routeCards:controls?.querySelectorAll('.fly-point').length,flyChildren:[...(fly?.children||[])].map(e=>({tag:e.tagName,class:e.className,head:e.textContent?.trim().slice(0,70)})),docScrollY:window.scrollY};
    });
    await page.screenshot({path:`${output}/${type}.png`,fullPage:false,animations:'disabled',timeout:15000});
    results.push({type,...stateRead,errors});
    console.log('FLY_DIAGNOSTIC '+JSON.stringify(results.at(-1)));
    if(stateRead.flyHidden || !stateRead.calendarHidden || stateRead.flyDisplay==='none')throw Error(type+': FLY view navigation failed');
    if(stateRead.selected!=='2026-10-super-mega-raid-day'||stateRead.routeCards!==64)throw Error(type+': event or 70 world coordinates missing');
    if(stateRead.routeSectionOpacity<0.99 || stateRead.routeSectionVisibility!=='visible')throw Error(type+': main route is visually hidden despite correct DOM data');
    if(type!=='drawer' && (!stateRead.selectRect||stateRead.selectRect.top<0||stateRead.selectRect.top>760))throw Error(type+': route controls are buried behind unrelated cards');
    await context.close();
  }
  fs.writeFileSync(output+'/result.json',JSON.stringify({status:'PASS',physical_android_tested:false,checks:results},null,2));
}finally{
  fs.writeFileSync(output+'/diagnostics.json',JSON.stringify(results,null,2));
  await browser.close();server.kill('SIGTERM');
}
