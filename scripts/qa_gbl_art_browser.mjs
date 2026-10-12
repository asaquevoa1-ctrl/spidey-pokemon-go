import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const eventId='2026-10-gbl-13-20';
const expected='assets/events/review/gbl-20261013-20-v1.png';
const output='test-results/gbl-art';
fs.mkdirSync(output,{recursive:true});
const server=spawn('python3',['-m','http.server','4173','--directory','.'],{stdio:'ignore'});
const fixed='2026-10-13T12:00:00-03:00';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const checks=[];
try{
  for(const width of [390,1280])for(const theme of ['light','dark']){
    const page=await browser.newPage({viewport:{width,height:900},timezoneId:'America/Sao_Paulo'});
    await page.addInitScript(({fixed,theme})=>{
      const NativeDate=Date,now=new NativeDate(fixed).valueOf();
      class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
      Object.setPrototypeOf(FixedDate,NativeDate);window.Date=FixedDate;
      localStorage.setItem('spidey-theme',theme);
    },{fixed,theme});
    await page.goto('http://127.0.0.1:4173/spidey-app/index.html',{waitUntil:'networkidle'});
    await page.waitForFunction(id=>window.state?.events?.some(event=>event.id===id),eventId);
    await page.evaluate(()=>{state.month=new Date(2026,9,1);renderCalendar();});
    const calendarButtons=page.locator('#calendar .calendar-day');
    const index=await page.evaluate(()=>{const first=new Date(2026,9,1);const gridStart=new Date(2026,9,1-first.getDay());return Math.round((new Date(2026,9,13)-gridStart)/86400000);});
    await calendarButtons.nth(index).click();
    const dayEvent=page.locator(`#eventDetail [data-event-id="${eventId}"]`);
    await dayEvent.waitFor();
    checks.push({width,theme,view:'calendar',event:true});
    await page.screenshot({path:`${output}/${width}-${theme}-calendar.png`,fullPage:true});
    await dayEvent.click();
    const hero=page.locator('#eventDetail .detail-hero');
    await hero.waitFor();
    await hero.evaluate(img=>img.decode());
    const detail=await hero.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],rect:[img.getBoundingClientRect().width,img.getBoundingClientRect().height],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!detail.src.includes(expected)||detail.natural[0]!==1122||detail.natural[1]!==1402||detail.overflow)throw new Error(`detail failed ${JSON.stringify(detail)}`);
    checks.push({width,theme,view:'detail',...detail});
    await page.screenshot({path:`${output}/${width}-${theme}-detail.png`,fullPage:true});
    await page.evaluate(()=>{document.querySelector('#eventDialog')?.close();setView('weeklyView');renderWeeklyView();});
    const weekly=page.locator(`[data-weekly-event="${eventId}"]`).first();
    await weekly.waitFor();
    const weeklyImg=weekly.locator('img');await weeklyImg.waitFor();await weeklyImg.evaluate(img=>img.decode());
    const week=await weeklyImg.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!week.src.includes(expected)||week.natural[0]!==1122||week.natural[1]!==1402||week.overflow)throw new Error(`weekly failed ${JSON.stringify(week)}`);
    checks.push({width,theme,view:'weekly',...week});
    await page.screenshot({path:`${output}/${width}-${theme}-weekly.png`,fullPage:true});
    await page.close();
  }
  fs.writeFileSync(`${output}/result.json`,JSON.stringify({status:'PASSED_PREVIEW',event_id:eventId,checks,physical_android_tested:false},null,2)+'\n');
  console.log(JSON.stringify({status:'PASSED_PREVIEW',checks:checks.length}));
}finally{
  await browser.close();server.kill('SIGTERM');
}
