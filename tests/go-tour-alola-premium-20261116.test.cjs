'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..','spidey-app');
const js=fs.readFileSync(path.join(root,'go-tour-alola-2027.js'),'utf8');
const css=fs.readFileSync(path.join(root,'go-tour-alola-2027.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const events=JSON.parse(fs.readFileSync(path.join(root,'data/events.json'),'utf8')).events;
test('Alola usa cartaz oficial e não cartaz geométrico antigo',()=>{
 assert.match(js,/lh3.googleusercontent.com/);
 assert.doesNotMatch(js,/go-tour-alola-2027\.svg/);
 assert.match(js,/alola-tour-official-art/);
});
test('três eventos permanecem funcionais e sem coordenadas presumidas',()=>{
 const ids=['2027-go-tour-alola-kaohsiung','2027-go-tour-alola-los-angeles','2027-go-tour-alola-global'];
 ids.forEach((id,i)=>{
   const event=events.find(e=>e.id===id);
   assert.ok(event,id);
   assert.equal(event.status,'published');
   assert.equal(event.locations.length,0);
   assert.match(js,new RegExp(id));
   assert.equal(event.schedule.precision,'date');
   assert.equal(event.schedule.start_date,i===2?'2027-02-27':'2027-02-19');
 });
});
test('celular exibe três opções em uma fileira e detalhes fechados de início',()=>{
 assert.match(css,/#spideyGoTourAlola2027 \.alola-tour-card\{/);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(js,/let selected=null/);
 assert.match(css,/#alolaTourDetailMount\[hidden\]\{display:none\}/);
 assert.match(html,/go-tour-alola-2027\.js\?v=20261116-alola2/);
 assert.match(html,/go-tour-alola-2027\.css\?v=20261116-alola2/);
});
