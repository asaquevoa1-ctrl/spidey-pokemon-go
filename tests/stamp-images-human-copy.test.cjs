const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const art=fs.readFileSync('spidey-app/art-coverage-v1.js','utf8'),ui=fs.readFileSync('spidey-app/stamps-v2.js','utf8');
const css=fs.readFileSync('spidey-app/stamps-v2.css','utf8'),ana=fs.readFileSync('spidey-app/ana-airports.js','utf8'),html=fs.readFileSync('spidey-app/index.html','utf8');
const rallies=JSON.parse(fs.readFileSync('spidey-app/data/stamps.json','utf8')).rallies;
test('coleção de selos não recebe arte pendente sobre seus próprios desenhos',()=>{
 assert.ok(art.includes("container.querySelector('.stamp-detail-v2')"));
 assert.ok(art.includes('removeCover(container)'));
 assert.ok(art.includes("img.v23-hidden-art"));
 assert.ok(css.includes('#eventDetail:has(.stamp-detail-v2) > .spidey-cover-art'));
 assert.ok(ui.includes('stamp-active-art-v2--without-image'));
});
test('ANA mostra cartaz sem a nota técnica de arte original',()=>{
 assert.ok(!ana.includes('Arte original • toque para ampliar'));
 assert.ok(ana.includes('Ampliar o cartaz ANA'));
 assert.ok(ana.includes('não são coordenadas verificadas'));
});
test('desenhos oficiais e listas copiáveis continuam disponíveis',()=>{
 const lids=rallies.find(r=>r.collection_type==='pokelids');
 assert.equal(lids.stops.filter(s=>s.image_kind==='lid_artwork'&&s.image_url&&s.official_url).length,482);
 assert.ok(ui.includes('https://www.serebii.net/pokemongo/stamps/'));
 assert.ok(ui.includes('Imagem indisponível. Veja na fonte oficial.'));
 assert.ok(!ui.includes('<small>imagem pendente</small>'));
 assert.ok(ui.includes('id="stampCoordPrefecture"'));
 assert.ok(ui.includes('Copiar toda a lista'));
 assert.match(html,/stamps-v2\.js\?v=[\w-]+/);
 assert.ok(html.includes('stamps-v2.css?v=20261029-pokelids-mobile-pages2'));
});
