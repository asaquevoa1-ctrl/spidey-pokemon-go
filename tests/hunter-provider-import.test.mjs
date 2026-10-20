import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeFeed,importLicensedFeed} from '../scripts/hunter-provider-import.mjs';
const now=Date.parse('2026-10-20T17:00:00Z'),iso=t=>new Date(t).toISOString();
const item=(rest={})=>({pokemon:'Shieldon',coordinates:'50.105208,8.7271780',iv_percent:100,cp:827,level:35,gender:'Macho',pvp_rank:null,shiny_eligible:false,reported_at:iso(now-60000),expires_at:iso(now+8*60000),source:'Untrusted name',account_id:'never publish',...rest});
const input=(items=[item()])=>({schema:'spidey-hunter-feed-v1',source_status:'connected',generated_at:iso(now-30000),items});
test('strips user identity and attributes provider supplied sightings',()=>{
 const out=normalizeFeed(input(),{now,providerName:'Licensed Partner'});
 assert.equal(out.items.length,1);assert.equal(out.items[0].source,'Licensed Partner');
 assert.equal(out.items[0].coordinates,'50.105208,8.7271780');
 assert.ok(!JSON.stringify(out).includes('account_id'));assert.ok(!JSON.stringify(out).includes('Untrusted name'));
});
test('connected provider with no sightings stays connected',()=>{
 const out=normalizeFeed(input([]),{now,providerName:'Licensed Partner'});
 assert.equal(out.source_status,'connected');assert.deepEqual(out.items,[]);
});
test('rejects duplicates, expired reports, old scans and invalid coordinates',()=>{
 const out=normalizeFeed(input([item(),item(),item({coordinates:'91,0'}),item({expires_at:iso(now-1000)}),item({reported_at:iso(now-31*60000)}),item({pokemon:'<script>'})]),{now,providerName:'Licensed Partner'});
 assert.equal(out.items.length,1);
});
test('shiny-eligible never becomes an individual account promise',()=>{
 const out=normalizeFeed(input([item({shiny_eligible:true,shiny_confirmed:true,trainer_code:'private'})]),{now,providerName:'Licensed Partner'});
 assert.equal(out.items[0].shiny_eligible,true);assert.ok(!('shiny_confirmed' in out.items[0]));assert.ok(!('trainer_code' in out.items[0]));
});
test('requires written license, valid HTTPS URL and fresh data',async()=>{
 assert.throws(()=>normalizeFeed({...input(),generated_at:iso(now-9*60000)},{now,providerName:'Licensed Partner'}),/stale/);
 await assert.rejects(importLicensedFeed({url:'https://example.com/',providerName:'Partner',licenseApproved:false}),/not_approved/);
 await assert.rejects(importLicensedFeed({url:'http://example.com/',providerName:'Partner',licenseApproved:true}),/https/);
 await assert.rejects(importLicensedFeed({url:'https://localhost/',providerName:'Partner',licenseApproved:true}),/https/);
});
