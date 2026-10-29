const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..', 'spidey-app');
const read = file => fs.readFileSync(path.join(base, file), 'utf8');

test('Home Premium inclui estilos e comportamento com cache versionado', () => {
  const html = read('index.html');
  const sw = read('sw.js');
  assert.match(html, /home-premium-20261029\.css\?v=20261029-graphite1/);
  assert.match(html, /home-premium-20261029\.js\?v=20261029-graphite1/);
  assert.match(sw, /\.\/home-premium-20261029\.css/);
  assert.match(sw, /\.\/home-premium-20261029\.js/);
});
test('Atalhos usam as abas do app sem criar menus duplicados nem caçador', () => {
  const js = read('home-premium-20261029.js');
  assert.match(js, /\.app-tab\[data-view\]/);
  assert.match(js, /original\.click\(\)/);
  assert.match(js, /notification-controls/);
  assert.doesNotMatch(js, /hunterView|ca[cç]ador|mapView|innerHTML\s*=.*<img/i);
});
test('Arte e identidade oficiais permanecem sem substituição', () => {
  const html = read('index.html');
  const css = read('home-premium-20261029.css');
  assert.match(html, /assets\/branding\/20261019\/spidey-icon-cosmic-192\.png/);
  assert.match(html, /id="nowExperience"/);
  assert.match(html, /id="spideyMobileMenuPanel"/);
  assert.doesNotMatch(css, /\.experience-feature-art\s*\{[^}]*filter\s*:/);
  assert.doesNotMatch(css, /\.app-tabs\s*\{[^}]*display\s*:/);
});
