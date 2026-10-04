const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup() {
  const context = vm.createContext({window:{},document:{readyState:'loading',addEventListener(){}},Intl,Date});
  vm.runInContext(fs.readFileSync('spidey-app/space-week.js','utf8'),context);
  return context.window.SpideySpace;
}

test('museum clocks follow European daylight saving while Brasília keeps its own date and clock',()=> {
  const space = setup();
  assert.equal(space.clock('Europe/London',new Date('2026-10-24T12:00:00Z')),'24/10, 13:00');
  assert.equal(space.clock('Europe/London',new Date('2026-10-25T12:00:00Z')),'25/10, 12:00');
  assert.equal(space.clock('America/Sao_Paulo',new Date('2026-10-25T12:00:00Z')),'25/10, 09:00');
  assert.equal(space.clock('Europe/Paris',new Date('2026-10-25T02:00:00Z')),'25/10, 03:00');
  assert.equal(space.clock('America/Sao_Paulo',new Date('2026-10-25T02:00:00Z')),'24/10, 23:00');
});

test('museum maps use verified venue coordinates or an address without inventing coordinates or precision',()=> {
  const space = setup();
  const data = JSON.parse(fs.readFileSync('spidey-app/data/space-museums.json','utf8'));
  const euro = data.museums.find(venue=>venue.id==='euro-space-center-transinne');
  const london = data.museums.find(venue=>venue.id==='science-museum-london');
  assert.equal(new URL(space.mapUrl(euro)).searchParams.get('query'),'50.007,5.22');
  assert.equal(new URL(space.mapUrl(london)).searchParams.get('query'),'Science Museum, Exhibition Road, South Kensington, London SW7 2DD, Londres, Reino Unido');
  const html = space.museumRows(data,new Date('2026-10-04T12:00:00Z'));
  assert.equal((html.match(/data-space-copy-kind="coordinate"/g)||[]).length,4);
  assert.equal((html.match(/data-space-copy-kind="address"/g)||[]).length,2);
  assert.equal((html.match(/>Abrir mapa</g)||[]).length,6);
  assert.ok(!html.includes('GPX'));
  assert.ok(!html.includes('50.007000'));
});

test('museum content escapes text and copy values so a venue name cannot inject controls',()=> {
  const space = setup();
  const venue = {id:'test',name:'<img src=x onerror=alert(1)>',city:'City',country:'Country',address:'" data-open-space-museums="injected',timezone:'Europe/London',coordinate:null,source:{url:'https://example.com'}};
  const html = space.museumRows({museums:[venue]},new Date('2026-10-04T12:00:00Z'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('data-open-space-museums="injected'));
});
