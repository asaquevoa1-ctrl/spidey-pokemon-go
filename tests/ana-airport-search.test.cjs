const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('spidey-app/ana-airports.js','utf8');
const doc={readyState:'loading',addEventListener(){}};
const window={};
vm.runInNewContext(source,{window,document:doc});
const core=window.SpideyAnaAirportCore;
const red={label:'Aeroporto Haneda · Terminal 2 (HND)',airport:'Haneda',airport_code:'HND',region:'Tóquio'};
const green={label:'Aeroporto Fukuoka (FUK)',airport:'Fukuoka',airport_code:'FUK',region:'Fukuoka'};
test('ANA airport search matches airport name and IATA code without accents',()=>{
 assert.equal(core.matchesAirport(red,'HND'),true);
 assert.equal(core.matchesAirport(red,'Haneda'),true);
 assert.equal(core.matchesAirport(red,'toquio'),true);
 assert.equal(core.matchesAirport(red,'fuk'),false);
 assert.equal(core.matchesAirport(green,'FUK'),true);
 assert.equal(core.matchesAirport(green,'Fukuoka'),true);
 assert.equal(core.matchesAirport(red,''),true);
});
test('airport search respects exact coordinates and one-tap copy semantics',()=>{
 assert.equal(core.parse('35.550815,139.788233'),'35.550815,139.788233');
 assert.equal(core.parse('91.0000,139.788233'),null);
 assert.match(source,/navigator\.clipboard\.writeText\(value\)/);
 assert.match(source,/data-ana-coord/);
 assert.match(source,/Ginásio NÃO verificado/);
 assert.match(source,/id="anaAirportSearch"/);
 assert.match(source,/addEventListener\('input'/);
});
