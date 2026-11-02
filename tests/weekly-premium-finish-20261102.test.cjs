'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('Weekly premium finishes existing UI without changing weekly data or approved images',()=>{
 const html=read('spidey-app/index.html');
 const sw=read('spidey-app/sw.js');
 const css=read('spidey-app/weekly-premium-finish-20261102.css');
 const source=read('spidey-app/weekly.js');
 assert.match(html,/weekly-premium-finish-20261102\.css\?v=20261102-weekly1/);
 assert.match(sw,/\.\/weekly-premium-finish-20261102\.css/);
 assert.match(sw,/spidey-app-20261102-weekly1/);
 assert.match(css,/#weeklyView \.weekly-item/);
 assert.match(css,/#weeklyView \.weekly-day/);
 assert.match(css,/#weeklyView \.weekly-hero-card/);
 assert.match(css,/object-fit:contain/);
 assert.match(css,/prefers-reduced-motion/);
 assert.doesNotMatch(css,/object-fit\s*:\s*cover|SpideyNexus|old-spider/i);
 assert.match(source,/data-weekly-art-owner="canonical"/);
 assert.match(source,/weeklyOpenItem\(item\)/);
});
test('Monthly calendar keeps its original policy of hidden and start-day-only events',()=>{
 const js=read('spidey-app/month-premium-20261102.js');
 const html=read('spidey-app/index.html');
 assert.match(js,/event\.calendar\?\.mode/);
 assert.match(js,/mode==='hidden'/);
 assert.match(js,/mode!=='start'/);
 assert.match(html,/month-premium-20261102\.js\?v=20261102-month2/);
});
