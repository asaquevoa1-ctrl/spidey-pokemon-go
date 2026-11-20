'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../spidey-app/wild-area-20261109.js'), 'utf8');

test('Home não mantém destaque da Wild Area depois de 15/11/2026', () => {
  assert.match(source, /function homeStatus\(\)/);
  assert.match(source, /2026-11-15T23:59:59-12:00/);
  assert.match(source, /if\(homeStatus\(\)===['"]Arquivo dos eventos['"]\)\s*\{\s*if\(tile\)tile\.remove\(\);\s*return;/);
});

test('Guias históricos da Semana e do Global permanecem disponíveis', () => {
  assert.match(source, /mount\(['"]wildIntoView['"]\)/);
  assert.match(source, /mount\(['"]wildGlobalView['"]\)/);
});
