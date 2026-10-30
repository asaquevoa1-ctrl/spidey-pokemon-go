const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = path => fs.readFileSync('spidey-app/' + path, 'utf8');

test('News, Week, FLY, Rocket and PvP remain valid scripts after mobile optimizations', () => {
  for (const file of ['command-center.js','weekly.js','fly-v1.js','rocket-guide.js','pvp.js'])
    assert.doesNotThrow(() => new vm.Script(read(file),{filename:file}),file);
});

test('FLY preserves unchanged route nodes and only refreshes its minute-granular clock while visible', () => {
  const src = read('fly-v1.js');
  const from = src.indexOf('  const renderedMarkup = new WeakMap();');
  const to = src.indexOf('  function events()',from);
  assert.ok(from>0 && to>from,'FLY DOM-diff helper missing');
  const fn = vm.runInNewContext(src.slice(from,to) + '\nsetMarkupIfChanged', {});
  const node = { innerHTML:'' };
  fn(node,'route v1');
  const first = Object.getOwnPropertyDescriptor(node,'innerHTML');
  let writes = 0, value = first.value;
  Object.defineProperty(node,'innerHTML',{get(){return value},set(v){writes++;value=v}});
  fn(node,'route v1');
  assert.equal(writes,0,'Unchanged route must not redraw');
  fn(node,'route v2');
  assert.equal(writes,1,'Updated route must redraw');
  assert.match(src,/setInterval\(\(\)=>\{if\(!document\.hidden&&!s\.hidden\)render\(\)\},60000\)/);
  assert.match(src,/setMarkupIfChanged\(s\.querySelector\('#flyRouteList'\)/);
});

test('Week keeps already-bound cards when the generated HTML does not change', () => {
  const src = read('weekly.js');
  const start = src.indexOf('const weeklyMarkupCache = new WeakMap();');
  const end = src.indexOf('const WEEKDAY_PT',start);
  assert.ok(start>=0 && end>start);
  const fn = vm.runInNewContext(src.slice(start,end) + '\nweeklySetMarkupIfChanged',{});
  let writes=0, value='';
  const node={get innerHTML(){return value},set innerHTML(v){value=v;writes++;}};
  assert.equal(fn(node,'same item'),true);
  assert.equal(fn(node,'same item'),false);
  assert.equal(writes,1);
  assert.equal(fn(node,'new item'),true);
  assert.equal(writes,2);
  assert.match(src,/if\(weeklySetMarkupIfChanged\(strip,markup\)\)bindWeeklyItems\(strip\)/);
});

test('News retains unchanged images; Rocket retains expanded panels; PvP search is buffered', () => {
  const news=read('command-center.js'),rocket=read('rocket-guide.js'),pvp=read('pvp.js');
  assert.match(news,/if\(lastNewsMarkup!==markup\)\{target\.innerHTML=markup;lastNewsMarkup=markup;\}/);
  assert.match(rocket,/const expandedMembers = new Set\(\)/);
  assert.match(rocket,/article\.open = expandedMembers\.has\(m\.id\)/);
  assert.match(rocket,/key !== renderedKey/);
  assert.match(rocket,/if\(!matches\.length\)plain\(board/);
  assert.match(rocket,/addEventListener\('toggle'/);
  assert.match(pvp,/searchRenderTimer=setTimeout/);
  assert.match(pvp,/cancelSearchRender\(\)/);
});

test('Updated modules are versioned in the PWA, without removing existing Premium styles or features', () => {
  const html=read('index.html'),sw=read('sw.js');
  for(const name of ['command-center','weekly','fly-v1','rocket-guide','pvp']){
    assert.match(html,new RegExp(name+'\\.js\\?v=[\\w-]+-20261029-interiors-performance1'));
    assert.ok(sw.includes('./'+name+'.js'),name+' is not cached');
  }
  assert.match(sw,/20261029-interiors-performance1/);
  assert.match(html,/spidey-icon-cosmic-192\.png/);
  assert.match(html,/stamps-v2\.js\?v=/);
  assert.match(html,/spidey-universe-3d\.js\?v=/);
});
