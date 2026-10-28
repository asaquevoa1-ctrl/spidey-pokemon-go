import {execFileSync,spawn} from 'node:child_process';
import fs from 'node:fs';
import {chromium} from 'playwright-core';
const out='test-results/expiry-eternatus-20261028',pub=out+'/pages-preview';
fs.mkdirSync(out,{recursive:true});
execFileSync('python3',['scripts/build_spidey_pages.py','--output',pub],{stdio:'pipe'});
const future=JSON.parse(execFileSync('python3',['-c','from datetime import date; import json; from scripts.build_spidey_weekly import build; print(json.dumps(build(date(2026,11,16))))'],{encoding:'utf8'}));
const server=spawn('python3',['-m','http.server','4188','--directory',pub],{stdio:'ignore'});
let ready=false;
for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:4188/spidey-app/')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
if(!ready){server.kill();throw Error('Pages preview unavailable');}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const ids=['2026-11-16-dynamax-trails','2026-11-19-spotlight-galar-starters','2026-11-21-eternamax-eternatus-max-battles'];
const la='2026-pokemon-night-out-la',london='2026-pokemon-night-out-london';
const key='official:/news/dynamax-trails-eternamax-eternatus-2026';
const checks=[];let page,activeCase;const errors=[];
async function open(width,theme,fixed,weekly){
 const context=await browser.newContext({viewport:{width,height:900},timezoneId:'America/Sao_Paulo',serviceWorkers:'block'});
 page=await context.newPage();
 page.on('pageerror',error=>errors.push(String(error)));
 await page.route('https://**/*',route=>route.abort());
 if(weekly)await page.route('**/data/weekly.json*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(weekly)}));
 await page.addInitScript(({fixed,theme})=>{
   const NativeDate=Date;window.__spideyQaNow=new NativeDate(fixed).valueOf();
   class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[window.__spideyQaNow]));}static now(){return window.__spideyQaNow;}}
   Object.setPrototypeOf(FixedDate,NativeDate);window.Date=FixedDate;localStorage.setItem('spidey-theme',theme);
 },{fixed,theme});
 await page.goto('http://127.0.0.1:4188/spidey-app/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.SPIDEY_WORLD_EVENTS?.some(e=>e.id==='2026-pokemon-night-out-london')&&window.SpideyFindShareEvent?.('2026-11-16-dynamax-trails'));
 return context;
}
async function closeDetail(){await page.locator('#dialogBackButton').click();await page.locator('#eventDialog').waitFor({state:'hidden'});}
async function waitForWeeklyRender(){
 // The legacy QA layer refreshes this DOM after 250/1200 ms; wait for its final render before scrolling cards.
 await page.evaluate(()=>new Promise(resolve=>{
   const root=document.querySelector('#weeklyView');let quiet;
   const finish=()=>{observer.disconnect();resolve();};
   const settle=()=>{clearTimeout(quiet);quiet=setTimeout(finish,1300);};
   const observer=new MutationObserver(settle);observer.observe(root,{childList:true,subtree:true});settle();
 }));
}
function check(value,message){if(!value)throw Error(message);}
try{
 for(const width of [390,1280])for(const theme of ['light','dark']){
   activeCase={phase:'current',width,theme};const context=await open(width,theme,'2026-10-28T18:00:00-03:00');
   check(await page.locator(`[data-world-event="${la}"]`).count()===0,'Expired LA remains on Home/FLY');
   checks.push({...activeCase,view:'home',expired_la_visible:false,london_visible:true});
   await page.evaluate(()=>setView('flyView'));await page.locator('#flyView').waitFor({state:'visible'});
   check(await page.locator(`#flyView [data-world-event="${la}"]`).count()===0,'Expired LA remains in FLY');
   await page.locator(`#flyView [data-world-event="${london}"]`).waitFor();
   checks.push({...activeCase,view:'fly',expired_la_visible:false,london_visible:true});
   await page.evaluate(()=>setView('newsView'));
   const story=page.locator(`[data-news-story="${key}"]`);await story.waitFor({state:'visible'});
   check(await story.count()===1,'Official article duplicated');
   check(await page.locator('[data-news-event="2026-10-26-eternatus-teaser-unconfirmed"]').count()===0,'Old teaser still offered');
   check((await story.innerText()).includes('100 Doces'),'Confirmed encounter restriction missing');
   await page.screenshot({path:`${out}/${width}-${theme}-official-news.png`,fullPage:false});
   checks.push({...activeCase,view:'news',official_story_count:1,old_teaser_visible:false});
   for(const id of ids){
     await story.locator(`[data-news-event="${id}"]`).click();
     await page.locator('#eventDialog').waitFor({state:'visible'});
     check(await page.locator('#eventDetail').getAttribute('data-event-id')===id,'Wrong detail from News');
     const text=await page.locator('#eventDetail').innerText();
     check(text.includes('Anúncio oficial'),'Detail is not credited as official');
     check(!await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),'Horizontal overflow');
     await page.screenshot({path:`${out}/${width}-${theme}-${id}.png`,fullPage:false});
     if(id!=='2026-11-19-spotlight-galar-starters'){
       check(/Passe GO gratuito|trilha gratuita/.test(text),'Free encounter condition missing');
       check(text.includes('8.900 Doces e 8.900 Doces GG')&&text.includes('nível 15 ao 50'),'Power-up level range or costs missing');
       check(text.includes('não inclui melhorar os movimentos Max')&&text.includes('Bulbapedia (comunidade)'),'Power-up exclusions or community attribution missing');
       const guide=page.locator('#eventDetail').getByText('Planeje seus Doces:',{exact:false});
       await guide.scrollIntoViewIfNeeded();
       await page.screenshot({path:`${out}/${width}-${theme}-${id}-guide.png`,fullPage:false});
       checks.push({...activeCase,view:'eternatus_guide',id,free_encounter:true,power_up_from_level:15,power_up_to_level:50,community_cost_labeled:true,max_moves_excluded:true});
     }
     checks.push({...activeCase,view:'news_to_detail',id});await closeDetail();
   }
   await context.close();page=null;
   activeCase={phase:'future_week',width,theme};const futureContext=await open(width,theme,'2026-11-16T12:00:00-03:00',future);
   await page.evaluate(()=>{setView('weeklyView');renderWeeklyView();});await page.locator('#weeklyView').waitFor({state:'visible'});
   await waitForWeeklyRender();
   for(const id of ids){const entry=page.locator(`#weeklyView [data-weekly-event="${id}"]`).first();await entry.waitFor({state:'visible'});await entry.scrollIntoViewIfNeeded();checks.push({...activeCase,view:'weekly',id});}
   await page.screenshot({path:`${out}/${width}-${theme}-future-week.png`,fullPage:false});
   await futureContext.close();page=null;
 }
 activeCase={phase:'local_midnight',width:390,theme:'light'};
 const boundary=await open(390,'light','2026-10-25T06:59:50Z');
 await page.locator(`#worldEvents [data-world-event="${la}"]`).waitFor({state:'visible'});
 await page.evaluate(now=>{window.__spideyQaNow=now;window.dispatchEvent(new Event('focus'));},new Date('2026-10-25T07:00:00Z').valueOf());
 await page.waitForFunction(id=>document.querySelectorAll(`[data-world-event="${id}"]`).length===0,la);
 check(await page.locator(`#worldEvents [data-world-event="${london}"]`).count()===1,'Future London was removed');
 check(await page.evaluate(id=>window.SPIDEY_WORLD_EVENTS.some(e=>e.id===id),la),'Historical source event was deleted');
 checks.push({...activeCase,view:'focus_resume',expired_la_visible:false,history_preserved:true});
 await boundary.close();page=null;
 fs.writeFileSync(out+'/result.json',JSON.stringify({status:'PASSED_PREVIEW',checks,physical_android_tested:false},null,2)+'\n');
 console.log(JSON.stringify({status:'PASSED_PREVIEW',checks:checks.length,physical_android_tested:false}));
}catch(error){
 if(page){fs.writeFileSync(out+'/failure.json',JSON.stringify({case:activeCase,error:String(error),url:page.url(),body:await page.locator('body').innerText(),errors},null,2));await page.screenshot({path:out+'/failure.png',fullPage:true});}
 throw error;
}finally{await browser.close();server.kill('SIGTERM');fs.rmSync(pub,{recursive:true,force:true});}
