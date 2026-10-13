import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const eventId='2026-10-apac-mall-exploration';
const approved='assets/events/premium/apac-mall-exploration-20261001-20270328-approved-v1.png';
const sha256='b9d7f2107198fe5fec8826c3ac6ff383c4c3e3be05bae34fe7c9113ed1893ff9';
const output='test-results/apac-mall-exploration-art';
fs.mkdirSync(output,{recursive:true});
const eventsDoc=JSON.parse(fs.readFileSync('spidey-app/data/events.json'));
const previewEvents=structuredClone(eventsDoc);
const previewEvent=previewEvents.events.find(event=>event.id===eventId);
if(!previewEvent)throw new Error('catalog event is missing');
previewEvent.calendar={mode:'span'};
const futureWeekly=JSON.parse(execFileSync('python3',['-c',"from datetime import date; import json; from scripts.build_spidey_weekly import build; print(json.dumps(build(date(2026,10,12))))"],{encoding:'utf8'}));
const weeklyItem={id:previewEvent.id,title:previewEvent.title,summary:previewEvent.summary,category:previewEvent.category,tags:previewEvent.tags,start_brazil:previewEvent.schedule.start_brazil,end_brazil:previewEvent.schedule.end_brazil,source:previewEvent.source,art:{},weekly_art:{url:approved,width:1024,height:1536,sha256,source_role:'canonical_master',kind:'approved_master',premium:true}};
futureWeekly.sections.also_happening.push(weeklyItem);
const server=spawn('python3',['-m','http.server','4173','--directory','.'],{stdio:'ignore'});
let ready=false;
for(let attempt=0;attempt<40;attempt+=1){try{const response=await fetch('http://127.0.0.1:4173/spidey-app/index.html');if(response.ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}
if(!ready){server.kill('SIGTERM');throw new Error('static preview server did not become ready');}
const fixed='2026-10-13T18:45:00-03:00';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const checks=[];
try{
  for(const width of [390,1280])for(const theme of ['light','dark']){
    const page=await browser.newPage({viewport:{width,height:900},timezoneId:'America/Sao_Paulo'});
    await page.route('**/data/events.json*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(previewEvents)}));
    await page.route('**/data/weekly.json*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(futureWeekly)}));
    await page.addInitScript(({fixed,theme})=>{const NativeDate=Date,now=new NativeDate(fixed).valueOf();class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}Object.setPrototypeOf(FixedDate,NativeDate);window.Date=FixedDate;localStorage.setItem('spidey-theme',theme);},{fixed,theme});
    await page.goto('http://127.0.0.1:4173/spidey-app/index.html',{waitUntil:'networkidle'});
    await page.waitForFunction(id=>window.state?.events?.some(event=>event.id===id),eventId);
    const expected=await page.evaluate(id=>window.SPIDEY_APPROVED_ART_MASTER?.[id]?.file,eventId);
    if(expected!==approved)throw new Error(`unexpected artwork ${expected}`);
    await page.evaluate(()=>{state.month=new Date(2026,9,1);renderCalendar();});
    const index=await page.evaluate(()=>{const first=new Date(2026,9,1);const gridStart=new Date(2026,9,1-first.getDay());return Math.round((new Date(2026,9,13)-gridStart)/86400000);});
    await page.locator('#calendar .calendar-day').nth(index).click();
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
    const weekly=page.locator(`[data-weekly-event="${eventId}"]`).first();await weekly.waitFor();
    const weeklyImg=weekly.locator('img').first();await weeklyImg.waitFor();await weeklyImg.evaluate(img=>img.decode());
    const week=await weeklyImg.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!week.src.includes(expected)||week.natural[0]!==1024||week.natural[1]!==1536||week.overflow)throw new Error(`weekly failed ${JSON.stringify(week)}`);
    checks.push({width,theme,view:'weekly',...week});await page.screenshot({path:`${output}/${width}-${theme}-weekly.png`,fullPage:true});await page.close();
  }
  fs.writeFileSync(`${output}/result.json`,JSON.stringify({status:'PASSED_PREVIEW',event_id:eventId,week:'2026-10-12..2026-10-18',fixture:'qa-only-calendar-and-weekly-visibility',checks,physical_android_tested:false},null,2)+'\n');
  console.log(JSON.stringify({status:'PASSED_PREVIEW',checks:checks.length}));
}finally{await browser.close();server.kill('SIGTERM');}
