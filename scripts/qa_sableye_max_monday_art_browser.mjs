import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';
const eventId='2026-10-26-max-monday-sableye',approved='assets/events/premium/sableye-max-monday-20261026-approved-v1.png',output='test-results/sableye-max-monday-art';
fs.mkdirSync(output,{recursive:true});
const weekly=JSON.parse(execFileSync('python3',['-c',"from datetime import date; import json; from scripts.build_spidey_weekly import build; print(json.dumps(build(date(2026,10,26))))"],{encoding:'utf8'}));
if(!Object.values(weekly.sections).flat().some(item=>item.id===eventId))throw new Error('weekly fixture missing event');
const server=spawn('python3',['-m','http.server','4173','--directory','.'],{stdio:'ignore'});let ready=false;
for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:4173/spidey-app/index.html')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
if(!ready){server.kill('SIGTERM');throw new Error('preview server unavailable');}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'}),checks=[];
try{for(const width of [390,1280])for(const theme of ['light','dark']){
 const page=await browser.newPage({viewport:{width,height:900},timezoneId:'America/Sao_Paulo'});
 await page.route('**/data/weekly.json*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(weekly)}));
 await page.addInitScript(({theme})=>{const N=Date,now=new N('2026-10-26T12:00:00-03:00').valueOf();class F extends N{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}}Object.setPrototypeOf(F,N);window.Date=F;localStorage.setItem('spidey-theme',theme);},{theme});
 await page.goto('http://127.0.0.1:4173/spidey-app/index.html',{waitUntil:'networkidle'});await page.waitForFunction(id=>typeof state!=='undefined'&&state.events.some(x=>x.id===id),eventId);
 if(await page.evaluate(id=>window.SPIDEY_APPROVED_ART_MASTER?.[id]?.file,eventId)!==approved)throw new Error('wrong master artwork');
 await page.evaluate(()=>{document.querySelectorAll('.app-view').forEach(view=>{view.hidden=view.id!=='calendarView';});state.month=new Date(2026,9,1);renderCalendar();});
 const index=await page.evaluate(()=>{const first=new Date(2026,9,1),grid=new Date(2026,9,1-first.getDay());return Math.round((new Date(2026,9,26)-grid)/86400000);});
 await page.evaluate(id=>renderEvents([state.events.find(item=>item.id===id)]),eventId);const card=page.locator(`#eventList [data-event-id="${eventId}"]`);await card.waitFor({state:'attached'});console.log(JSON.stringify(await card.evaluate(el=>{const chain=[];for(let node=el;node&&chain.length<8;node=node.parentElement){const cs=getComputedStyle(node),r=node.getBoundingClientRect();chain.push({tag:node.tagName,id:node.id,className:node.className,hidden:node.hidden,display:cs.display,visibility:cs.visibility,opacity:cs.opacity,rect:[r.width,r.height]});}return chain;})));await card.waitFor();
 for(const [view,img] of [['calendar',card.locator('img').first()]]){await img.evaluate(x=>x.decode());const m=await img.evaluate(x=>({src:x.getAttribute('src'),natural:[x.naturalWidth,x.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}));if(!m.src.includes(approved)||m.natural[0]!==1024||m.natural[1]!==1536||m.overflow)throw new Error(`${view} ${JSON.stringify(m)}`);checks.push({width,theme,view,...m});await page.screenshot({path:`${output}/${width}-${theme}-${view}.png`,fullPage:true});}
 await card.click();const hero=page.locator('#eventDialog img').first();await hero.waitFor();await hero.evaluate(x=>x.decode());let m=await hero.evaluate(x=>({src:x.getAttribute('src'),natural:[x.naturalWidth,x.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}));if(!m.src.includes(approved)||m.natural[0]!==1024||m.natural[1]!==1536||m.overflow)throw new Error(`detail ${JSON.stringify(m)}`);checks.push({width,theme,view:'detail',...m});await page.screenshot({path:`${output}/${width}-${theme}-detail.png`,fullPage:true});
 await page.evaluate(()=>{document.querySelector('#eventDialog')?.close();setView('weeklyView');renderWeeklyView();});const wc=page.locator(`[data-weekly-event="${eventId}"]`).first(),wi=wc.locator('img').first();await wi.waitFor();await wi.evaluate(x=>x.decode());m=await wi.evaluate(x=>({src:x.getAttribute('src'),natural:[x.naturalWidth,x.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}));if(!m.src.includes(approved)||m.natural[0]!==1024||m.natural[1]!==1536||m.overflow)throw new Error(`weekly ${JSON.stringify(m)}`);checks.push({width,theme,view:'weekly',...m});await page.screenshot({path:`${output}/${width}-${theme}-weekly.png`,fullPage:true});await page.close();
 }
 fs.writeFileSync(`${output}/result.json`,JSON.stringify({status:'PASSED_PREVIEW',event_id:eventId,week:'2026-10-26..2026-11-01',checks,physical_android_tested:false},null,2)+'\n');console.log(JSON.stringify({status:'PASSED_PREVIEW',checks:checks.length}));
}finally{await browser.close();server.kill('SIGTERM');}
