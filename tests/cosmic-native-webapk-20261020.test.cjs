const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const root='spidey-app/';
test('Android manifest uses only the two approved cosmic icons without legacy fallbacks',()=>{
 const m=JSON.parse(fs.readFileSync(root+'manifest.webmanifest','utf8'));
 assert.equal(m.id,'./','Keep installed PWA identity stable');
 assert.equal(m.scope,'./');
 assert.equal(m.icons.length,2);
 assert.deepEqual(m.icons.map(i=>i.src),[
  'assets/branding/20261019/spidey-icon-cosmic-192.png',
  'assets/branding/20261019/spidey-icon-cosmic-512.png'
 ]);
 for(const icon of m.icons){
  assert.equal(icon.type,'image/png');
  assert.ok(fs.statSync(root+icon.src).size>50000,'Installed icon binary must be present');
 }
 assert.ok(fs.existsSync(root+'assets/spidey-logo-oficial.jpg'),'Do not delete historical approved identity');
});
test('service worker refreshes manifest from network with offline fallback',()=>{
 const sw=fs.readFileSync(root+'sw.js','utf8');
 const html=fs.readFileSync(root+'index.html','utf8');
 assert.ok(html.includes('manifest.webmanifest?v=20261020-cosmic-android2'));
 assert.ok(sw.includes("const isManifest = url.origin === self.location.origin && url.pathname.endsWith('/manifest.webmanifest')"));
 assert.ok(sw.includes('if (isAppShell || isData || isManifest)'));
 assert.ok(sw.includes("fetch(request, { cache: 'no-store' })"));
 assert.ok(sw.includes('caches.match(request, { ignoreSearch: true })'));
 assert.ok(sw.includes("const CACHE = 'spidey-app-20261020-android-cosmic-icon-v4'"));
 assert.ok(sw.includes("'./manifest.webmanifest'"));
});
