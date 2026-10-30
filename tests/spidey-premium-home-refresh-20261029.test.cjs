const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('spidey-app/player-ui.js','utf8');

test('A Home Premium deixa de recriar a galeria WebGL quando a agenda não mudou',()=>{
  assert.match(ui,/setInterval\(refreshHomeIfChanged,60000\)/);
  assert.doesNotMatch(ui,/setInterval\(\(\)=>\{if\(!home\.hidden\)renderHome\(\)\},60000\)/);
  assert.match(ui,/homeTimelineSignature\(selection,now\)!==lastTimelineSignature/);
  assert.match(ui,/window\.addEventListener\('spideycontentready',renderHome\)/);
  assert.match(ui,/document\.addEventListener\('visibilitychange'/);
  assert.match(ui,/spideyviewchange/);
  assert.match(ui,/spideyDispose\?\.\(\)/);
});

test('Chave do calendário só muda ao mudar dia, destaque, eventos ativos ou próximos',()=>{
  const from=ui.indexOf('  function homeTimelineSignature(');
  const to=ui.indexOf('  function refreshHomeIfChanged(',from);
  assert.ok(from>0&&to>from,'A assinatura do calendário deve existir separadamente do DOM');
  const signature=vm.runInNewContext(
    'const brazilDateKey = d => d.toISOString().slice(0,10);\n'+ui.slice(from,to)+'\nhomeTimelineSignature;',
    {});
  const current=new Date('2026-10-29T12:00:00Z');
  const later=new Date('2026-10-29T12:01:00Z');
  const same={focus:{id:'active-a'},dated:[{id:'date-1'}],active:[{id:'active-b'}],upcoming:[{id:'soon'}]};
  const original=signature(same,current);
  assert.equal(original,signature(same,later),'Sem mudança, não recriar 3D');
  assert.notEqual(original,signature({...same,active:[{id:'other-event'}]},later),'Atualizar quando mudar evento ativo');
  assert.notEqual(original,signature({...same,upcoming:[{id:'next-event'}]},later),'Atualizar quando mudar evento futuro');
  assert.notEqual(original,signature({...same,focus:{id:'new-highlight'}},later),'Atualizar quando mudar destaque');
  assert.notEqual(original,signature(same,new Date('2026-10-30T12:00:00Z')),'Atualizar data da Home no novo dia');
});
