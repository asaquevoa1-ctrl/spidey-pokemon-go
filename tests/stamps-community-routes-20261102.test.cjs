'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const data=JSON.parse(read('spidey-app/data/community-routes-20261102.json'));
const js=read('spidey-app/stamps-community-routes-20261102.js');
const css=read('spidey-app/stamps-community-routes-20261102.css');
const html=read('spidey-app/index.html');
const sw=read('spidey-app/sw.js');
const stamps=JSON.parse(read('spidey-app/data/stamps.json'));
const expected={
 'hawlucha-mexico-city':[
 [19.435019,-99.141343],[19.432514,-99.13204],[19.42592,-99.18578],[19.425135,-99.17162],
 [19.349138,-99.16353],[19.415812,-99.19599],[19.377789,-99.179115],[19.440695,-99.2047]
 ],
 'lapras-sendai-tohoku':[
 [38.252922,140.85649],[38.26527,140.86559],[38.302784,140.98834],[38.258724,140.879],
 [38.4214,141.30533],[38.002476,140.61714],[38.369698,141.06287],[38.22543,140.72697]
 ]
};

test('As dezesseis coordenadas do usuário estão preservadas e na ordem original',()=>{
 assert.equal(data.schema_version,'spidey-community-routes-v1');
 assert.equal(data.routes.length,2);
 for(const route of data.routes){
   assert.deepEqual(route.points.map(p=>[p.latitude,p.longitude]),expected[route.id]);
   assert.equal(route.points.length,8);
   assert.deepEqual(route.points.map(p=>p.order),[1,2,3,4,5,6,7,8]);
   assert.equal(new Set(route.points.map(p=>p.latitude+','+p.longitude)).size,8);
   assert.equal(route.pokestop_verified,false);
   assert.equal(route.background_guaranteed,false);
   assert.equal(route.coordinate_type,'community_reference');
 }
});

test('As rotas da comunidade não viram os selos oficiais de 7 PokéStops por cidade',()=>{
 assert.equal(data.source_type,'user_shared_unverified');
 assert.match(data.verification,/Não há confirmação independente/);
 assert.match(data.official_event_stamp_rally_source,/pokemongo.com/);
 assert.equal(stamps.rallies.find(r=>r.id==='2026-go-wild-area-sendai-stamp-rally').stops.length,7);
 assert.equal(stamps.rallies.find(r=>r.id==='2026-go-wild-area-mexico-city-stamp-rally').stops.length,7);
 assert.doesNotMatch(js,/saveStampProgress|getStampProgress|Marcar como feito/);
 assert.match(js,/não são as 7 PokéStops oficiais/);
});

test('Hawlucha e Lapras exibem cartazes Premium existentes sem alterar os selos oficiais',()=>{
 const assets=[
  'wild-area-mexico-city-2026-approved-v1.png',
  'wild-area-sendai-2026-approved-v1.png'
 ];
 for(const name of assets){
  assert(js.includes(name),'Cartaz não conectado: '+name);
  assert(fs.existsSync(path.resolve(__dirname,'../spidey-app/assets/events/premium',name)));
 }
 assert.match(js,/class="stamp-community-visual"/);
 assert.match(js,/class="stamp-community-card"/);
 assert.match(css,/\.stamp-community-visual img/);
 assert.match(css,/object-fit:contain!important/);
 assert.doesNotMatch(js,/Marcar como feito|Carimbado|\.is-done/);
});

test('App inclui listas Premium para copiar individuais, grupos e mapas',()=>{
 assert.match(html,/stamps-community-routes-20261102\.js\?v=20261102-hawlucha-lapras-art2/);
 assert.match(html,/stamps-community-routes-20261102\.css\?v=20261102-hawlucha-lapras-art2/);
 assert.match(sw,/\.\/stamps-community-routes-20261102\.js/);
 assert.match(sw,/\.\/stamps-community-routes-20261102\.css/);
 assert.match(sw,/\.\/data\/community-routes-20261102\.json/);
 assert.match(sw,/communityroutes1/);
 assert.match(js,/data-community-copy-one/);
 assert.match(js,/data-community-copy-all/);
 assert.match(js,/route\.points\.map\(asText\)\.join\('\\n'\)/);
 assert.match(js,/www\.google\.com\/maps\/search/);
 assert.match(js,/navigator\.clipboard/);
 assert.match(js,/document\.execCommand/);
 assert.match(js,/getElementById\('stampsView'\)/);
 assert.match(css,/#stampsView \.stamp-community-grid/);
 assert.match(css,/@media\(max-width:480px\)/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/html\[data-theme='light'\]/);
 assert.doesNotThrow(()=>new (require('node:vm').Script)(js));
});
