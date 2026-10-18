import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const eventId='2026-10-mega-charizard-xy-raids';
const approved='assets/events/premium/mega-charizard-xy-raids-20261021-27-approved-v1.png';
const output='test-results/mega-charizard-xy-raids-art';
fs.mkdirSync(output,{recursive:true});
const eventsDoc=JSON.parse(fs.readFileSync('spidey-app/data/events.json'));
if(!eventsDoc.events.some(item=>item.id===eventId))throw new Error('catalog event is missing');
const weekly=JSON.parse(execFileSync('python3',['-c',"from datetime import date; import json; from scripts.build_spidey_weekly import build; print(json.dumps(build(date(2026,10,19))))"],{encoding:'utf8'}));
const weeklyItems=[...Object.values(weekly.sections).flat(),...weekly.days.flatMap(day=>day.items)];
if(!weeklyItems.some(item=>item.id===eventId))throw new Error('weekly fixture is missing the event');
const server=spawn('python3',['-m','http.server','4173','--directory','.'],{stdio:'ignore'});
let ready=false;
for(let attempt=0;attempt<40;attempt+=1){try{const response=await fetch('http://127.0.0.1:4173/spidey-app/index.html');if(response.ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}
if(!ready){server.kill('SIGTERM');throw new Error('static preview server did not become ready');}
const fixed='2026-10-22T12:00:00-03:00';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const checks=[];
try{
  for(const width of [390,1280])for(const theme of ['light','dark']){
    const page=await browser.newPage({viewport:{width,height:900},timezoneId:'America/Sao_Paulo'});
    await page.route('**/data/weekly.json*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(weekly)}));
    await page.addInitScript(({fixed,theme})=>{const NativeDate=Date,now=new NativeDate(fixed).valueOf();class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}Object.setPrototypeOf(FixedDate,NativeDate);window.Date=FixedDate;localStorage.setItem('spidey-theme',theme);},{fixed,theme});
    await page.goto('http://127.0.0.1:4173/spidey-app/index.html',{waitUntil:'domcontentloaded'});
    await page.locator('#calendar .calendar-day').first().waitFor({state:'attached'});
    const expected=await page.evaluate(id=>window.SPIDEY_APPROVED_ART_MASTER?.[id]?.file,eventId);
    if(expected!==approved)throw new Error(`unexpected artwork ${expected}`);
    await page.evaluate(()=>{setView('calendarView');state.month=new Date(2026,9,1);renderCalendar();});
    const index=await page.evaluate(()=>{const first=new Date(2026,9,1);const gridStart=new Date(2026,9,1-first.getDay());return Math.round((new Date(2026,9,21)-gridStart)/86400000);});
    await page.locator('#calendar .calendar-day').nth(index).evaluate(button=>button.click());
    const dayEvent=page.locator(`#eventDetail [data-event-id="${eventId}"]`);await dayEvent.waitFor();
    const calendarImg=dayEvent.locator('img').first();await calendarImg.waitFor();await calendarImg.evaluate(img=>img.decode());
    const calendar=await calendarImg.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!calendar.src.includes(expected)||calendar.natural[0]!==1024||calendar.natural[1]!==1536||calendar.overflow)throw new Error(`calendar failed ${JSON.stringify(calendar)}`);
    checks.push({width,theme,view:'calendar',...calendar});await page.screenshot({path:`${output}/${width}-${theme}-calendar.png`,fullPage:true});
    await dayEvent.click();
    const hero=page.locator('#eventDialog img').first();await hero.waitFor();await hero.evaluate(img=>img.decode());
    const detail=await hero.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!detail.src.includes(expected)||detail.natural[0]!==1024||detail.natural[1]!==1536||detail.overflow)throw new Error(`detail failed ${JSON.stringify(detail)}`);
    checks.push({width,theme,view:'detail',...detail});await page.screenshot({path:`${output}/${width}-${theme}-detail.png`,fullPage:true});
    await page.evaluate(()=>{document.querySelector('#eventDialog')?.close();setView('weeklyView');renderWeeklyView();});
    const weeklyEvent=page.locator(`[data-weekly-event="${eventId}"]`).first();await weeklyEvent.waitFor();
    const weeklyImg=weeklyEvent.locator('img').first();await weeklyImg.waitFor({state:'attached'});await weeklyImg.evaluate(img=>img.decode());
    const week=await weeklyImg.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!week.src.includes(expected)||week.natural[0]!==1024||week.natural[1]!==1536||week.overflow)throw new Error(`weekly failed ${JSON.stringify(week)}`);
    checks.push({width,theme,view:'weekly',...week});await page.screenshot({path:`${output}/${width}-${theme}-weekly.png`,fullPage:true});await page.close();
  }
  fs.writeFileSync(`${output}/result.json`,JSON.stringify({status:'PASSED_PREVIEW',event_id:eventId,week:'2026-10-19..2026-10-25',checks,physical_android_tested:false},null,2)+'\n');
  console.log(JSON.stringify({status:'PASSED_PREVIEW',checks:checks.length}));
}finally{await browser.close();server.kill('SIGTERM');}
