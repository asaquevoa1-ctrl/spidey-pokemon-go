import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adaptRadarFeed,normalizeFeed,importLicensedFeed} from '../scripts/hunter-provider-import.mjs';
const now=Date.parse('2026-10-20T18:00:00Z');
const iso=x=>new Date(x).toISOString();
const sample=(extra={})=>({
 pokemon_id:25,pokemon_name:'Pikachu',
 lat:-25.425,lon:-49.28,
 percent_iv:100,cp:850,level:35,
 expires_at:iso(now+12*60_000),observed_at:iso(now-30_000),
 account_id:'private',trainer_code:'private',shiny_confirmed:true,...extra
});
test('normalizes licensed radar records without identities or ungrounded Shiny',()=>{
 const raw=adaptRadarFeed({items:[sample()]},{now});
 const out=normalizeFeed(raw,{now,providerName:'Authorized Radar'});
 assert.equal(out.items.length,1);
 assert.equal(out.items[0].pokemon,'Pikachu');
 assert.equal(out.items[0].iv_percent,100);
 assert.equal(out.items[0].coordinates,'-25.425,-49.28');
 assert.equal(out.items[0].shiny_eligible,false);
 assert.equal(out.items[0].source,'Authorized Radar');
 assert.equal(out.items[0].reported_at,iso(now-30_000));
 assert.ok(!JSON.stringify(out).includes('account_id'));
 assert.ok(!JSON.stringify(out).includes('trainer_code'));
});
test('does not invent expiry or shiny',()=>{
 const input={spawns:[sample({expires_at:null}),sample({percent_iv:43,attack_iv:9,defense_iv:8,stamina_iv:7})]};
 const out=normalizeFeed(adaptRadarFeed(input,{now}),{now,providerName:'Partner'});
 assert.equal(out.items.length,0);
});
test('supports 0 IV with exact stats and observation time where timestamp absent',()=>{
 const raw=adaptRadarFeed({spawns:[sample({pokemon_name:null,pokemon_id:129,percent_iv:33,attack_iv:0,defense_iv:0,stamina_iv:0,observed_at:null,updated_at:null})]},{now});
 const out=normalizeFeed(raw,{now,providerName:'Partner'});
 assert.equal(out.items[0].pokemon,'Pokémon 129');
 assert.equal(out.items[0].iv_percent,0);
 assert.equal(out.items[0].reported_at,iso(now));
});
test('refuses unexpected radar shapes, extra-large batches, or license not approved',async()=>{
 assert.throws(()=>adaptRadarFeed({html:'not a feed'},{now}),/invalid_radar_items/);
 assert.throws(()=>adaptRadarFeed({items:new Array(1001).fill(sample())},{now}),/invalid_radar_items/);
 await assert.rejects(importLicensedFeed({providerFormat:'iflowgo',url:'https://example.org/',providerName:'Partner',licenseApproved:false}),/not_approved/);
});
