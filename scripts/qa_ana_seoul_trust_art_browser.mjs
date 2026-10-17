import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright-core';

process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const files=[
  'ana-pokemon-jet-red-2026-spidey-candidate-v1.svg',
  'ana-pokemon-jet-green-2026-spidey-candidate-v1.svg',
  'fc-seoul-20261024-spidey-candidate-v1.svg',
  'national-trust-27-2026-spidey-candidate-v1.svg',
];
const dir='test-results/spidey-priority-art';fs.mkdirSync(dir,{recursive:true});
const server=spawn('python3',['-m','http.server','4173','--directory','.'],{stdio:'ignore'});
let browser;
try {
 let ready=false;
 for(let i=0;i<35;i++){
   try{const res=await fetch('http://127.0.0.1:4173/spidey-app/index.html');if(res.ok){ready=true;break;}}catch{}
   await new Promise(resolve=>setTimeout(resolve,200));
 }
 if(!ready)throw new Error('Local test server did not start');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
 const results=[];
 for(const filename of files){
  const page=await browser.newPage({viewport:{width:390,height:800},deviceScaleFactor:1,locale:'pt-BR'});
  page.setDefaultTimeout(20000);
  const imageUrl='http://127.0.0.1:4173/spidey-app/assets/events/review/'+filename;
  const response=await fetch(imageUrl);
  if(!response.ok)throw new Error('SVG endpoint failed: '+filename);
  // setContent requires an HTML document; a directly navigated SVG is XML.
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:20000});
  await page.setContent('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#030813;display:grid;place-items:center;min-height:100vh"><img id="poster" alt="Pôster candidato" style="width:390px;max-width:100%;height:auto" src="'+imageUrl+'"></body></html>',{waitUntil:'domcontentloaded'});
  await page.locator('#poster').evaluate(async image=>{if(!image.complete)await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject});if(image.decode)await image.decode();});
  const info=await page.locator('#poster').evaluate(image=>{
   const cv=document.createElement('canvas');cv.width=112;cv.height=140;const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,112,140);
   const pixels=ctx.getImageData(0,0,112,140).data;let color=0,opaque=0;
   for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]>200)opaque++;if(Math.max(pixels[i],pixels[i+1],pixels[i+2])-Math.min(pixels[i],pixels[i+1],pixels[i+2])>35)color++;}
   return {naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,opaque,color};
  });
  if(info.naturalWidth!==1122||info.naturalHeight!==1402||info.opaque<15000||info.color<3500)throw new Error(filename+' failed integrity '+JSON.stringify(info));
  await page.locator('#poster').screenshot({path:dir+'/'+filename+'.png',timeout:18000,animations:'disabled'});
  results.push({filename,...info});await page.close();
 }
 fs.writeFileSync(dir+'/result.json',JSON.stringify({status:'CANDIDATE_RENDER_PASSED',results,approved:false,physical_android_tested:false},null,2)+'\n');
 console.log(JSON.stringify({status:'CANDIDATE_RENDER_PASSED',results}));
} finally {await browser?.close();server.kill('SIGTERM');}
