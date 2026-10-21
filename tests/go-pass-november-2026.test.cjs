const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8'));const arr=data.events;
const ev=arr.filter(x=>x.id==='2026-11-go-pass-groudon');
test('monthly November pass appears exactly once, independently of Into the Wild and Halloween',()=>{
 assert.equal(ev.length,1);
 assert.ok(arr.some(x=>x.id==='2026-10-go-pass'));
 assert.ok(arr.some(x=>x.id==='2026-11-09-into-the-wild'));
 assert.ok(arr.some(x=>x.id==='2026-10-halloween-go-pass'));
});
test('official dates and separate claim deadline are correct for Brazilian local time',()=>{
 const e=ev[0];assert.equal(e.source.confidence,'official');
 assert.equal(e.schedule.start_brazil,'2026-11-03T10:00:00-03:00');
 assert.equal(e.schedule.end_brazil,'2026-12-01T10:00:00-03:00');
 assert.ok(e.notes.some(x=>x.includes('03/12/2026 às 10h')));
 assert.ok(e.notes.some(x=>x.includes('28 e 29/11')));
});
test('free 400 coins are never described as 1400 free and shiny is not guaranteed',()=>{
 const e=ev[0];const all=JSON.stringify(e);
 assert.match(e.summary,/gratuito.*400.*Deluxe.*1\.400/);
 assert.ok(e.notes.some(x=>x.includes('1.000 PokéMoedas adicionais')));
 assert.ok(e.pokemon[0].note.includes('não é garantido'));
 assert.ok(e.bonuses.some(x=>x.includes('Ranque 75')));
 assert.equal(e.gpx.enabled,false);
});
test('approved premium artworks remain untouched and no invented November artwork is claimed',()=>{
 const e=ev[0],q=JSON.parse(fs.readFileSync('queue/pending/2026-10-20/earn-pokecoins-for-progressing-in-go-pass-november-2818d6f061e8.json','utf8'));
 assert.equal(e.presentation.requires_art,false);
 assert.equal(e.presentation.fallback_visual,'date');
 assert.equal(e.presentation.no_unverified_poster,true);
 assert.equal(q.arte_obrigatoria,true);
 assert.equal(q.proibir_fallback,true);
 // A factual article already present in the catalog may be deduped to its own official URL,
 // while its independent original Premium artwork brief remains pending.
 const pending=['aguardando_curadoria_premium','aguardando_arte_chatgpt'].includes(q.status);
 const ownArticleDuplicate=q.status==='duplicado'
   && q.duplicate_of==='oficial-https://pokemongo.com/pt-BR/news/go-pass-november-2026'
   && q.etapa_editorial==='aguardando_arte_premium_original';
 assert.ok(pending || ownArticleDuplicate,'Editorial art brief must not be lost or deduped to an unrelated event');
 const master=fs.readFileSync('spidey-app/premium-approved-master.js','utf8');
 assert.ok(master.includes('go-pass-october-kyogre-approved-v1.png'));
 assert.ok(!master.includes('2026-11-go-pass-groudon'));
});
