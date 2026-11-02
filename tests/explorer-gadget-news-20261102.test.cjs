'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const events=JSON.parse(fs.readFileSync('spidey-app/data/events.json','utf8')).events;
const id='2026-11-02-explorer-gadget-visual-updates';
const entry=events.find(item=>item.id===id);
test('Explorer Gadget is one news article, not an invented dated event or duplicate',()=>{
 assert(entry);
 assert.equal(events.filter(item=>item.id===id).length,1);
 assert.equal(entry.content_type,'news');
 assert.equal(entry.calendar.mode,'hidden');
 assert.equal(entry.notifications.enabled,false);
 assert.equal(entry.presentation.requires_art,false);
 assert.equal(entry.presentation.fallback_visual,'none');
 assert.equal(entry.source.confidence,'official');
 assert.equal(entry.source.url,'https://pokemongo.com/pt-BR/news/pgo-explorer-gadget-2026');
 assert(events.some(item=>item.id==='2026-10-08-gameplay-quality-of-life'),'existing October news preserved');
});
test('official phased rollout is not promoted to universal availability',()=>{
 const all=[entry.summary,entry.news.summary,...entry.notes].join(' ');
 assert.match(all,/gradual/i);
 assert.match(all,/nível 20/);
 assert.match(all,/Poké Bolas/);
 assert.match(all,/Pokémon GO Plus \+/);
 assert.equal(entry.audit.official_general_availability_confirmed,false);
 assert.doesNotMatch(entry.news.summary,/liberad[oa] (?:para )?tod[oa]s/i);
 assert(!entry.notifications.enabled);
});
test('reported interface changes are clearly separated from official claims',()=>{
 assert(entry.verification_sources.some(x=>x.confidence==='official'));
 assert(entry.verification_sources.some(x=>x.confidence==='verified_community'));
 assert(entry.notes.some(n=>n.startsWith('RELATO DA COMUNIDADE:')));
 assert(entry.notes.some(n=>n.startsWith('OUTROS AJUSTES MOSTRADOS EM INFOGRÁFICO DA COMUNIDADE:')));
 assert.equal(entry.audit.scope,'news_only');
});
