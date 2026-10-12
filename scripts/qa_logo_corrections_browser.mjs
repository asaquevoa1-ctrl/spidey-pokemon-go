import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const cases=[
  {id:'2026-10-gbl-13-20',date:'2026-10-13',week:[2026,10,12],fixed:'2026-10-13T18:00:00-03:00',file:'assets/events/premium/gbl-20261013-20-approved-v2.png',size:[1122,1402],slug:'gbl-13-20'},
  {id:'2026-10-minior-orionids',date:'2026-10-19',week:[2026,10,19],fixed:'2026-10-19T18:00:00-03:00',file:'assets/events/premium/minior-orionids-20261019-24-approved-v2.png',size:[1122,1402],slug:'minior-orionids'},
  {id:'2026-10-gbl-20-27',date:'2026-10-20',week:[2026,10,19],fixed:'2026-10-20T18:00:00-03:00',file:'assets/events/premium/gbl-20261020-27-approved-v2.png',size:[1024,1536],slug:'gbl-20-27'}
];
const output='test-results/logo-corrections';
fs.mkdirSync(output,{recursive:true});
for(const item of cases){
  item.weekly=JSON.parse(execFileSync('python3',['-c',`from datetime import date; import json; from scripts.build_spidey_weekly import build; print(json.dumps(build(date(${item.week.join(',')}))))`],{encoding:'utf8'}));
  if(![...item.weekly.days.flatMap(day=>day.items),...Object.values(item.weekly.sections).flat()].some(event=>event.id===item.id))throw new Error(`weekly fixture missing ${item.id}`);
}
const server=spawn('python3',['-m','http.server','4173','--directory','.'],{stdio:'ignore'});
let ready=false;
for(let attempt=0;attempt<40;attempt+=1){
  try{const response=await fetch('http://127.0.0.1:4173/spidey-app/index.html');if(response.ok){ready=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,250));
}
if(!ready){server.kill('SIGTERM');throw new Error('static preview server did not become ready');}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
const checks=[];
try{
  for(const item of cases)for(const width of [390,1280])for(const theme of ['light','dark']){
    const page=await browser.newPage({viewport:{width,height:900},timezoneId:'America/Sao_Paulo'});
    await page.route('**/data/weekly.json*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(item.weekly)}));
    await page.addInitScript(({fixed,theme})=>{
      const NativeDate=Date,now=new NativeDate(fixed).valueOf();
      class FixedDate extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
      Object.setPrototypeOf(FixedDate,NativeDate);window.Date=FixedDate;localStorage.setItem('spidey-theme',theme);
    },{fixed:item.fixed,theme});
    await page.goto('http://127.0.0.1:4173/spidey-app/index.html',{waitUntil:'networkidle'});
    await page.waitForFunction(id=>window.state?.events?.some(event=>event.id===id),item.id);
    const master=await page.evaluate(id=>window.SPIDEY_APPROVED_ART_MASTER?.[id],item.id);
    if(master?.file!==item.file)throw new Error(`unexpected master art for ${item.id}: ${master?.file}`);
    const target=new Date(`${item.date}T12:00:00-03:00`);
    await page.evaluate(month=>{state.month=new Date(2026,month,1);renderCalendar();},target.getMonth());
    const index=await page.evaluate(iso=>{const d=new Date(`${iso}T12:00:00-03:00`),first=new Date(d.getFullYear(),d.getMonth(),1),gridStart=new Date(d.getFullYear(),d.getMonth(),1-first.getDay());return Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-gridStart)/86400000);},item.date);
    await page.locator('#calendar .calendar-day').nth(index).click();
    const dayEvent=page.locator(`#eventDetail [data-event-id="${item.id}"]`);await dayEvent.waitFor();
    checks.push({event:item.id,width,theme,view:'calendar',ok:true});
    await page.screenshot({path:`${output}/${item.slug}-${width}-${theme}-calendar.png`,fullPage:true});
    await dayEvent.click();
    const hero=page.locator('#eventDetail .detail-hero');await hero.waitFor();await hero.evaluate(img=>img.decode());
    const detail=await hero.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),item.file);
    if(!detail.src.includes(item.file)||detail.natural[0]!==item.size[0]||detail.natural[1]!==item.size[1]||detail.overflow)throw new Error(`detail failed ${item.id} ${JSON.stringify(detail)}`);
    checks.push({event:item.id,width,theme,view:'detail',...detail});
    await page.screenshot({path:`${output}/${item.slug}-${width}-${theme}-detail.png`,fullPage:true});
    await page.evaluate(()=>{document.querySelector('#eventDialog')?.close();setView('weeklyView');renderWeeklyView();});
    const weekly=page.locator(`[data-weekly-event="${item.id}"]`).first();await weekly.waitFor();
    const weeklyImg=weekly.locator('img');await weeklyImg.waitFor();await weeklyImg.evaluate(img=>img.decode());
    const week=await weeklyImg.evaluate((img,expected)=>({src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,expected}),item.file);
    if(!week.src.includes(item.file)||week.natural[0]!==item.size[0]||week.natural[1]!==item.size[1]||week.overflow)throw new Error(`weekly failed ${item.id} ${JSON.stringify(week)}`);
    checks.push({event:item.id,width,theme,view:'weekly',...week});
    await page.screenshot({path:`${output}/${item.slug}-${width}-${theme}-weekly.png`,fullPage:true});
    await page.close();
  }
  fs.writeFileSync(`${output}/result.json`,JSON.stringify({status:'PASSED_PREVIEW',events:cases.map(item=>item.id),checks,physical_android_tested:false},null,2)+'\n');
  console.log(JSON.stringify({status:'PASSED_PREVIEW',checks:checks.length}));
}finally{await browser.close();server.kill('SIGTERM');}
