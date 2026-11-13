'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('GitHub Pages serializes releases and verifies ACTUAL public deployment',()=>{
 const yml=read('.github/workflows/spidey-pages.yml');
 const checker=read('scripts/qa_trust_27_public_pages.mjs');
 assert.match(yml,/group: spidey-pages-/);
 assert.match(yml,/cancel-in-progress: false/);
 assert.match(yml,/cron: '47 \* \* \* \*'/); // Scheduled release catches HEAD after catalog-only commits.
 assert.match(yml,/uses: actions\/deploy-pages@v5/);
 // O pacote que sobe ao Pages precisa corresponder ao commit do build,
 // mesmo se outros fluxos atualizarem a branch principal enquanto ele roda.
 assert(yml.includes('source_sha: ${{ steps.capture_sha.outputs.sha }}'));
 assert(yml.includes('echo "sha=$(git rev-parse HEAD)"'));
 assert(yml.includes('ref: ${{ needs.build.outputs.source_sha }}'));
 const deploy=yml.slice(yml.indexOf('  deploy:'));
 assert.match(deploy,/uses: actions\/checkout@v5/);
 assert(deploy.indexOf('uses: actions/checkout@v5')<deploy.indexOf('uses: actions/deploy-pages@v5'));
 assert(deploy.indexOf('uses: actions/checkout@v5')<deploy.indexOf('node scripts/qa_trust_27_public_pages.mjs'));

 assert(yml.indexOf('uses: actions/deploy-pages@v5')<yml.indexOf('node scripts/qa_trust_27_public_pages.mjs'));
 for(const file of ['app.js','national-trust-v1.js','national-trust-v1.css','data/events.json']) {
   assert(checker.includes("'"+file+"'"),file);
 }
 assert(checker.includes("const packageApp='pages-public/spidey-app/';"),'Hash must compare BUILT files, not source SW');
 assert(yml.includes('Preparar pacote identico para auditoria publica'));
 assert(yml.indexOf('Preparar pacote identico para auditoria publica')<yml.indexOf('node scripts/qa_trust_27_public_pages.mjs'));
 assert.match(checker,/createHash\('sha256'\)/);
 assert.match(checker,/hash\(bytes\)!==hash\(source\)/);
 assert.match(checker,/ntEventCopyAll/);
 assert.match(checker,/Copiar todas as 27/);
 assert.doesNotMatch(checker,/v=20261101-copyall5/);
});
