import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const eventId='2026-10-halloween-go-pass';
const review='assets/events/review/halloween-go-pass-20261027-1105-v1.png';
const approved='assets/events/premium/halloween-go-pass-20261027-1105-approved-v1.png';
const output='test-results/halloween-go-pass-art';
fs.mkdirSync(output,{recursive:true});
const futureWeekly=JSON.parse(execFileSync('python3',['-c',"from datetime import date; import json; from scripts.build_spidey_weekly import build; print(json.dumps(build(date(2026,10,26))))"],{encoding:'utf8'}));
if(futureWeekly.week_start!=='2026-10-26'||![...futureWeekly.days.flatMap(day=>day.items),...Object.values(futureWeekly.sections).flat()].some(item=>item.id===eventId))throw new Error('future weekly fixture does not contain Halloween GO Pass');
const server=spawn('python3',['-m','http.server','4173','--directory','.'],{stdio:'ignore'});
let ready=false;
for(let attempt=0;attempt<40;attempt+=1){
  try{const response=await fetch('http://127.0.0.1:4173/spidey-app/index.html');if(response.ok){ready=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,250));
}
if(!ready){server.kill('SIGTERM');throw new Error('static preview server did not become ready');}
const fixed='2026-10-27T11:00:00-03:00';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const checks=[];
try{
  for(const width of [390,1280])for(const theme of ['light','dark']){
    const page=await browser.newPage({viewport:{width,height:900},timezoneId:'America/Sao_Paulo'});
    await page.route('**/data/weekly.json*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(futureWeekly)}));
    await page.addInitScript(({fixed,theme})=>{
      const NativeDate=Date,now=new NativeDate(fixed).valueOf();
      class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
      Object.setPrototypeOf(FixedDate,NativeDate);window.Date=FixedDate;
      localStorage.setItem('spidey-theme',theme);
    },{fixed,theme});
    await page.goto('http://127.0.0.1:4173/spidey-app/index.html',{waitUntil:'networkidle'});
    await page.waitForFunction(id=>window.state?.events?.some(event=>event.id===id),eventId);
    const expected=await page.evaluate(({eventId,review,approved})=>window.SPIDEY_APPROVED_ART_MASTER?.[eventId]?.file||window.SPIDEY_PREVIEW_ART?.[eventId]?.file||review,{eventId,review,approved});
    if(![review,approved].includes(expected))throw new Error(`unexpected artwork ${expected}`);
    await page.evaluate(()=>{state.month=new Date(2026,9,1);renderCalendar();});
    const index=await page.evaluate(()=>{const first=new Date(2026,9,1);const gridStart=new Date(2026,9,1-first.getDay());return Math.round((new Date(2026,9,27)-gridStart)/86400000);});
    await page.locator('#calendar .calendar-day').nth(index).click();
    const dayEvent=page.locator(`#eventDetail [data-event-id="${eventId}"]`);await dayEvent.waitFor();
    checks.push({width,theme,view:'calendar',event:true});
    await page.screenshot({path:`${output}/${width}-${theme}-calendar.png`,fullPage:true});
    await dayEvent.click();
    const hero=page.locator('#eventDetail .detail-hero');await hero.waitFor();await hero.evaluate(img=>img.decode());
    const detail=await hero.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!detail.src.includes(expected)||detail.natural[0]!==1024||detail.natural[1]!==1536||detail.overflow)throw new Error(`detail failed ${JSON.stringify(detail)}`);
    checks.push({width,theme,view:'detail',...detail});
    await page.screenshot({path:`${output}/${width}-${theme}-detail.png`,fullPage:true});
    await page.evaluate(()=>{document.querySelector('#eventDialog')?.close();setView('weeklyView');renderWeeklyView();});
    const weekly=page.locator(`[data-weekly-event="${eventId}"]`).first();await weekly.waitFor();
    const weeklyImg=weekly.locator('img');await weeklyImg.waitFor();await weeklyImg.evaluate(img=>img.decode());
    const week=await weeklyImg.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!week.src.includes(expected)||week.natural[0]!==1024||week.natural[1]!==1536||week.overflow)throw new Error(`weekly failed ${JSON.stringify(week)}`);
    checks.push({width,theme,view:'weekly',...week});
    await page.screenshot({path:`${output}/${width}-${theme}-weekly.png`,fullPage:true});
    await page.close();
  }
  fs.writeFileSync(`${output}/result.json`,JSON.stringify({status:'PASSED_PREVIEW',event_id:eventId,week:'2026-10-26..2026-11-01',checks,physical_android_tested:false},null,2)+'\n');
  console.log(JSON.stringify({status:'PASSED_PREVIEW',checks:checks.length}));
}finally{await browser.close();server.kill('SIGTERM');}
