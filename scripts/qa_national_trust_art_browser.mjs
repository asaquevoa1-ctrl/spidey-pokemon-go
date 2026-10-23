import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const eventId='2026-national-trust-27-sites';
const approved='assets/events/premium/national-trust-27-sites-20261023-cosmic-s-approved-v2.png';
const output='test-results/national-trust-art';
fs.mkdirSync(output,{recursive:true});
const eventsFixture=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8'));
const event=eventsFixture.events.find(item=>item.id===eventId);
event.calendar={mode:'span'};
const weekly=JSON.parse(execFileSync('python3',['-c',"from datetime import date; import json; from scripts.build_spidey_weekly import build; print(json.dumps(build(date(2026,10,19))))"],{encoding:'utf8'}));
weekly.sections.also_happening.unshift({id:event.id,title:event.title,summary:event.summary,category:event.category,tags:event.tags,start_brazil:event.schedule.start_brazil,end_brazil:event.schedule.end_brazil,source:event.source,art:{},weekly_art:{url:approved,width:1024,height:1536,sha256:'24fb9fd024dd92c934d98d3af289733ac9bdfdcab29ab40b84912ee876eba9aa',source_role:'canonical_master',kind:'approved_master',premium:true}});
const server=spawn('python3',['-m','http.server','4173','--directory','.'],{stdio:'ignore'});
let ready=false;
for(let attempt=0;attempt<40;attempt+=1){try{const response=await fetch('http://127.0.0.1:4173/spidey-app/index.html');if(response.ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}
if(!ready){server.kill('SIGTERM');throw new Error('static preview server did not become ready');}
const fixed='2026-10-23T12:00:00-03:00';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const checks=[];
try{
  for(const width of [390,1280])for(const theme of ['light','dark']){
    const page=await browser.newPage({viewport:{width,height:900},timezoneId:'America/Sao_Paulo'});
    await page.route('**/data/events.json*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(eventsFixture)}));
    await page.route('**/data/weekly.json*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(weekly)}));
    await page.addInitScript(({fixed,theme})=>{const NativeDate=Date,now=new NativeDate(fixed).valueOf();class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}Object.setPrototypeOf(FixedDate,NativeDate);window.Date=FixedDate;localStorage.setItem('spidey-theme',theme);},{fixed,theme});
    await page.goto('http://127.0.0.1:4173/spidey-app/index.html',{waitUntil:'domcontentloaded'});
    await page.locator('#calendar .calendar-day').first().waitFor({state:'attached'});
    const expected=await page.evaluate(id=>window.SPIDEY_APPROVED_ART_MASTER?.[id]?.file,eventId);
    if(expected!==approved)throw new Error(`unexpected artwork ${expected}`);
    await page.evaluate(()=>{setView('calendarView');state.month=new Date(2026,9,1);renderCalendar();});
    const index=await page.evaluate(()=>{const first=new Date(2026,9,1),gridStart=new Date(2026,9,1-first.getDay());return Math.round((new Date(2026,9,23)-gridStart)/86400000);});
    await page.locator('#calendar .calendar-day').nth(index).evaluate(button=>button.click());
    const dayEvent=page.locator(`#eventList .event-card[data-event-id="${eventId}"]`);await dayEvent.waitFor({state:'attached'});
    await page.evaluate(id=>{const source=document.querySelector(`#eventList .event-card[data-event-id="${id}"]`),host=document.createElement('section');host.id='nationalTrustQaCalendar';host.className='section';host.style.cssText='position:static;width:min(968px,calc(100vw - 24px));margin:12px;padding:0;background:transparent';const clone=source.cloneNode(true);clone.style.cssText='display:grid!important;position:relative!important;visibility:visible!important;content-visibility:visible!important;contain:none!important;margin:0!important';host.appendChild(clone);for(const child of [...document.body.children]){child.dataset.ntQaBodyHidden=child.hidden?'1':'0';child.hidden=true;}document.body.prepend(host);},eventId);
    const calendarPreview=page.locator('#nationalTrustQaCalendar'),calendarImg=calendarPreview.locator('img').first();await calendarImg.waitFor({state:'visible'});await calendarImg.evaluate(img=>img.decode());
    const calendar=await calendarImg.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!calendar.src.includes(expected)||calendar.natural[0]!==1024||calendar.natural[1]!==1536||calendar.overflow)throw new Error(`calendar failed ${JSON.stringify(calendar)}`);
    checks.push({width,theme,view:'calendar',...calendar});await calendarPreview.screenshot({path:`${output}/${width}-${theme}-calendar.png`});
    await calendarPreview.evaluate(host=>{host.remove();for(const child of [...document.body.children]){if(child.dataset.ntQaBodyHidden!==undefined){child.hidden=child.dataset.ntQaBodyHidden==='1';delete child.dataset.ntQaBodyHidden;}}});
    await dayEvent.evaluate(el=>el.click());await page.waitForFunction(id=>document.querySelector('#eventDetail')?.dataset.eventId===id,eventId);
    const hero=page.locator(`#eventDetail img[src*="${approved}"]`).first(),eventDialog=page.locator('#eventDialog');await eventDialog.evaluate(dialog=>{if(!dialog.open)dialog.showModal();});await hero.waitFor({state:'visible'});await hero.evaluate(img=>img.decode());
    const detail=await hero.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!detail.src.includes(expected)||detail.natural[0]!==1024||detail.natural[1]!==1536||detail.overflow)throw new Error(`detail failed ${JSON.stringify(detail)}`);
    checks.push({width,theme,view:'detail',...detail});await eventDialog.screenshot({path:`${output}/${width}-${theme}-detail.png`});
    await page.evaluate(()=>{document.querySelector('#eventDialog')?.close();setView('weeklyView');renderWeeklyView();});
    const weeklyEvent=page.locator(`[data-weekly-event="${eventId}"]`).first();await weeklyEvent.waitFor({state:'attached'});await weeklyEvent.evaluate(el=>{for(let node=el;node;node=node.parentElement){node.hidden=false;node.style.setProperty('display','block','important');node.style.setProperty('opacity','1','important');node.style.setProperty('transform','none','important');if(node.id==='weeklyView')break;}const img=el.querySelector('img');if(img){img.loading='eager';img.hidden=false;}el.scrollIntoView({block:'center'});});
    const weeklyImg=weeklyEvent.locator('img').first();await weeklyImg.waitFor({state:'attached'});await weeklyImg.evaluate(img=>img.decode());
    const week=await weeklyImg.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),expected);
    if(!week.src.includes(expected)||week.natural[0]!==1024||week.natural[1]!==1536||week.overflow)throw new Error(`weekly failed ${JSON.stringify(week)}`);
    checks.push({width,theme,view:'weekly',...week});await weeklyEvent.screenshot({path:`${output}/${width}-${theme}-weekly.png`});await page.close();
  }
  fs.writeFileSync(`${output}/result.json`,JSON.stringify({status:'PASSED_PREVIEW',event_id:eventId,fixture:'qa-only-calendar-and-weekly-visibility',week:'2026-10-19..2026-10-25',checks,physical_android_tested:false},null,2)+'\n');
  console.log(JSON.stringify({status:'PASSED_PREVIEW',checks:checks.length}));
}finally{await browser.close();server.kill('SIGTERM');}
