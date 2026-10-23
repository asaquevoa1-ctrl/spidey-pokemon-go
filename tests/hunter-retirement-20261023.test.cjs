'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=name=>fs.readFileSync(name,'utf8');
test('Owner retired Caçador from the public Spidey experience without removing other tools',()=>{
 const shell=path('spidey-app/index.html');
 const center=path('spidey-app/command-center.js');
 const menu=path('spidey-app/mobile-side-menu.js');
 const sw=path('spidey-app/sw.js');
 const build=path('scripts/build_spidey_pages.py');
 for(const module of ['hunter-v1.js','hunter-live-feed.js','hunter-v1.css','data/hunter-feed.json']) {
   assert.equal(shell.includes(module),false,'Removed Hunter still loaded: '+module);
   assert.equal(sw.includes(module),false,'Removed Hunter still cached: '+module);
   assert.ok(build.includes(module),'Build must exclude dormant Hunter asset: '+module);
 }
 assert.equal(shell.includes('data-view="hunterView"'),false);
 assert.equal(center.includes('data-cc-view="hunterView"'),false);
 assert.equal(menu.includes('hunterView'),false);
 assert.equal(sw.includes('|hunter-feed'),false);
 for(const keep of ['rocket-guide.js','fly-v1.js','pvp.js','push.js','national-trust-v1.js','ana-airports.js'])assert.ok(shell.includes(keep),'Accidentally removed '+keep);
 assert.ok(center.includes('data-cc-view="flyView"'));
 assert.ok(center.includes('data-cc-view="stampsView"'));
 assert.ok(center.includes('data-cc-view="newsView"'));
 assert.ok(sw.includes('rocket-lineups'));
 assert.ok(sw.includes('spidey-app-20261022-credits-dst-v1'));
 assert.ok(sw.includes('20261023-no-hunter1'),'Cache must invalidate previous mobile installs');
});
test('Archive and prevent automatic partner feed ingestion while keeping audited history',()=>{
 assert.ok(fs.existsSync('spidey-app/hunter-v1.js'));
 assert.ok(fs.existsSync('spidey-app/hunter-live-feed.js'));
 assert.ok(fs.existsSync('spidey-app/data/hunter-feed.json'));
 const provider=path('.github/workflows/spidey-hunter-provider.yml');
 assert.ok(provider.includes('if: false'));
 assert.ok(!provider.includes("cron: '*/10 * * * *'"));
 const visual=path('.github/workflows/spidey-hunter-samsung-qa.yml');
 assert.match(visual,/workflow_dispatch/);
 assert.doesNotMatch(visual,/\n  (pull_request|push):/);
 const decision=path('SPIDEY_DECISIONS_CURRENT.md');
 assert.ok(decision.includes('Caçador removido do aplicativo público'));
 assert.ok(decision.includes('Preservar integralmente **Guia GO Rocket**'));
});
