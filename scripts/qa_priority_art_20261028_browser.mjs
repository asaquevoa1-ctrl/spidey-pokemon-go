import {execFileSync,spawn} from 'node:child_process';
import fs from 'node:fs';
import {chromium} from 'playwright-core';
// Prevent Chromium screenshot from hanging on fonts.ready in archived-event QA.
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const record=JSON.parse(fs.readFileSync('docs/qa/PRIORITY_ART_APPROVAL_20261028.json'));
const output='test-results/priority-art-20261028';
fs.mkdirSync(output,{recursive:true});
const publicDirectory=`${output}/pages-preview`;
execFileSync('python3',['scripts/build_spidey_pages.py','--output',publicDirectory],{stdio:'pipe'});
const server=spawn('python3',['-m','http.server','4177','--directory',publicDirectory],{stdio:'ignore'});
let ready=false;
for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:4177/spidey-app/')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
if(!ready){server.kill();throw Error('Preview not available');}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const checks=[];
let activePage,activeCase;
const errors=[];
try{
  for(const width of [390,1280])for(const theme of ['light','dark'])for(const art of record.assets){
    const november=art.event_id==='2026-11-go-pass-groudon';
    const fixed=november?'2026-11-03T12:00:00-03:00':'2026-10-28T12:00:00-03:00';
    const weekly=JSON.parse(execFileSync('python3',['-c',`from datetime import date; import json; from scripts.build_spidey_weekly import build; print(json.dumps(build(date(2026,${november?11:10},${november?2:26}))))`],{encoding:'utf8'}));
    const context=await browser.newContext({viewport:{width,height:900},timezoneId:'America/Sao_Paulo',serviceWorkers:'block'});
    const page=await context.newPage();
    activePage=page;activeCase={width,theme,id:art.event_id};
    page.on('pageerror',error=>errors.push({case:activeCase,error:String(error)}));
    page.on('console',message=>{if(message.type()==='error')errors.push({case:activeCase,error:message.text()});});
    await page.route('https://**/*',route=>route.abort());
    await page.route('**/data/weekly.json*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(weekly)}));
    await page.addInitScript(({fixed,theme})=>{
      const NativeDate=Date,now=new NativeDate(fixed).valueOf();
      class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
      Object.setPrototypeOf(FixedDate,NativeDate);window.Date=FixedDate;localStorage.setItem('spidey-theme',theme);
    },{fixed,theme});
    await page.goto('http://127.0.0.1:4177/spidey-app/#evento='+art.event_id,{waitUntil:'networkidle'});
    await page.waitForFunction(id=>window.SpideyFindShareEvent?.(id),art.event_id,{timeout:30000});
    const expected=art.file.replace('spidey-app/','');
    const hero=page.locator(`#eventDetail img[src*="${expected}"]`).first();
    await hero.waitFor({state:'visible',timeout:15000});await hero.evaluate(img=>img.decode());
    const detail=await hero.evaluate(img=>({src:img.getAttribute('src'),width:img.naturalWidth,height:img.naturalHeight,fit:getComputedStyle(img).objectFit,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}));
    if(!detail.src.includes(expected)||detail.width!==1024||detail.height!==1536||detail.fit!=='contain'||detail.overflow)throw Error(JSON.stringify(detail));
    checks.push({width,theme,id:art.event_id,view:'detail',...detail});
    await page.screenshot({path:`${output}/${art.event_id}-${width}-${theme}.png`,fullPage:false});
    await page.locator('#dialogBackButton').click();
    await page.locator('#eventDialog').waitFor({state:'hidden'});
    await page.evaluate(()=>{setView('weeklyView');renderWeeklyView();});
    await page.locator('#weeklyView').waitFor({state:'visible'});
    const fullCard=page.locator(`#weeklyView .weekly-item:not(.compact)[data-weekly-event="${art.event_id}"]`).first();
    const entry=await fullCard.count()?fullCard:page.locator(`#weeklyView [data-weekly-event="${art.event_id}"]`).first();
    await entry.waitFor({state:'visible'});await entry.scrollIntoViewIfNeeded();
    let tile=entry.locator('img').first(),mode='visible_weekly_thumbnail';
    if(!await tile.isVisible()){
      // The approved daily strip intentionally uses compact text entries.
      // Verify its real click path instead of forcing a hidden image visible.
      const compact=await entry.evaluate(node=>node.classList.contains('compact'));
      if(!compact||!(await tile.getAttribute('src'))?.includes(expected))throw Error('Unexpected missing weekly poster');
      await page.screenshot({path:`${output}/${art.event_id}-${width}-${theme}-weekly-entry.png`,fullPage:false});
      await entry.click();
      tile=page.locator(`#eventDetail img[src*="${expected}"]`).first();
      mode='compact_weekly_entry_opens_full_poster';
    }
    await tile.waitFor({state:'visible'});await tile.evaluate(img=>img.decode());
    const week=await tile.evaluate(img=>({src:img.getAttribute('src'),width:img.naturalWidth,height:img.naturalHeight}));
    if(!week.src.includes(expected)||week.width!==1024||week.height!==1536)throw Error(JSON.stringify(week));
    checks.push({width,theme,id:art.event_id,view:'weekly',mode,...week});
    await page.screenshot({path:`${output}/${art.event_id}-${width}-${theme}-weekly.png`,fullPage:false});
    await context.close();
    activePage=null;
  }
  fs.writeFileSync(output+'/result.json',JSON.stringify({status:'PASSED_PREVIEW',checks,physical_android_tested:false},null,2)+'\n');
  console.log(JSON.stringify({status:'PASSED_PREVIEW',checks:checks.length,physical_android_tested:false}));
}catch(error){
  if(activePage){
    fs.writeFileSync(output+'/failure.json',JSON.stringify({case:activeCase,error:String(error),url:activePage.url(),body:await activePage.locator('body').innerText(),errors},null,2)+'\n');
    try { await activePage.screenshot({path:output+'/failure.png',fullPage:true,timeout:9000,animations:'disabled'}); } catch (_) { /* Preserve original failure.json and error. */ }
  }
  throw error;
}finally{await browser.close();server.kill('SIGTERM');fs.rmSync(publicDirectory,{recursive:true,force:true});}
