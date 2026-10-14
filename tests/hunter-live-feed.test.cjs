const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'..','spidey-app','hunter-live-feed.js'),'utf8');
const base=fs.readFileSync(path.join(__dirname,'..','spidey-app','hunter-v1.js'),'utf8');
const window={};
const document={readyState:'loading',addEventListener(){}};
vm.runInNewContext(base,{window,document});
vm.runInNewContext(code,{window,document});
const core=window.SpideyLiveFeedCore;
const iso=ms=>new Date(ms).toISOString();
const now=Date.parse('2026-10-13T23:00:00Z');
const item=(extra={})=>({
 pokemon:'Shieldon',coordinates:'50.105208,8.7271780',iv_percent:100,
 cp:827,level:35,gender:'Macho',source:'Fornecedor autorizado',
 reported_at:iso(now-60000),expires_at:iso(now+8*60000),
 shiny_eligible:false,pvp_rank:null,...extra
});
const payload=(items,status='connected')=>({
 schema:'spidey-hunter-feed-v1',source_status:status,
 generated_at:iso(now-30000),items
});
test('feed stays empty until a source has explicit connection',()=>{
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','spidey-app','data','hunter-feed.json'),'utf8'));
 assert.equal(data.source_status,'awaiting_authorization');
 assert.equal(data.items.length,0);
 assert.equal(core.sanitizeFeed(data,now).connected,false);
 assert.equal(core.sanitizeFeed(data,now).items.length,0);
});
test('authorized feed yields exact coordinate cards and reports IV as source claim',()=>{
 const report=core.sanitizeFeed(payload([item()]),now);
 assert.equal(report.connected,true);
 assert.equal(report.items.length,1);
 assert.equal(report.items[0].pokemon,'Shieldon');
 assert.equal(report.items[0].coordinates,'50.105208,8.7271780');
 assert.equal(report.items[0].iv_percent,100);
 assert.equal(report.items[0].cp,827);
 assert.equal(report.items[0].level,35);
 assert.equal(report.items[0].gender,'Macho');
 assert.equal(core.relevant(report.items[0],'hundo'),true);
 assert.equal(core.relevant(report.items[0],'nundo'),false);
 assert.equal(core.countdown(report.items[0].expires_at,now),'8 min restantes');
});
test('no fake active feed for expired, stale, inaccurate or malformed coordinates',()=>{
 assert.equal(core.sanitizeFeed(payload([item({expires_at:iso(now-1)})]),now).items.length,0);
 assert.equal(core.sanitizeFeed(payload([item({expires_at:iso(now+31*60000)})]),now).items.length,0);
 assert.equal(core.sanitizeFeed(payload([item({coordinates:'91,-181'})]),now).items.length,0);
 assert.equal(core.sanitizeFeed(payload([item({reported_at:iso(now-31*60000)})]),now).items.length,0);
 assert.equal(core.sanitizeFeed({...payload([item()]),generated_at:iso(now-31*60000)},now).connected,false);
 assert.throws(()=>core.sanitizeFeed({schema:'bad',items:[]},now));
});
test('duplicate coordinate+species reports are consolidated',()=>{
 const items=core.sanitizeFeed(payload([item(),item({source:'duplicate'})]),now).items;
 assert.equal(items.length,1);
});
test('Shiny eligibility is not asserted from IV100; PvP requires ranking',()=>{
 const a=core.sanitizeFeed(payload([item()]),now).items[0];
 assert.equal(core.relevant(a,'shiny'),false);
 assert.equal(core.relevant(a,'shundo'),false);
 const shiny=core.sanitizeFeed(payload([item({shiny_eligible:true})]),now).items[0];
 assert.equal(core.relevant(shiny,'shundo'),true);
 const pvp=core.sanitizeFeed(payload([item({iv_percent:null,pvp_rank:17})]),now).items[0];
 assert.equal(core.relevant(pvp,'pvp'),true);
 assert.equal(core.relevant(pvp,'hundo'),false);
});
test('frontend never scrapes social media, collects trainer identity or injects markup from feed',()=>{
 assert.doesNotMatch(code,/(?:discord|telegram)\.(?:com|org)|api\.telegram|t\.me\//);
 assert.doesNotMatch(code,/innerHTML\s*=/);
 assert.doesNotMatch(code,/localStorage\.setItem|sessionStorage\.setItem/);
 assert.match(code,/button\.dataset\.hunterCopy/);
 assert.match(code,/navigator\.clipboard\.writeText/);
});
