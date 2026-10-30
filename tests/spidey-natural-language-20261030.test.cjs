'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Home fala com o jogador e não usa slogans vagos no cabeçalho visível', () => {
  const home = read('spidey-app/player-ui.js');
  assert.match(home, /O que vale jogar hoje\?/);
  assert.match(home, /Veja o que está ativo, confira horários e escolha seu próximo evento/);
  assert.doesNotMatch(home, /O melhor do Pokémon GO em uma experiência feita para explorar/);
  assert.match(home, /Ainda não há detalhes confirmados para este evento/);
  assert.match(home, /Ver locais e horários/);
});

test('Atalhos e Semana explicam a utilidade sem prometer recursos inexistentes', () => {
  const shortcuts = read('spidey-app/home-premium-20261029.js');
  const index = read('spidey-app/index.html');
  assert.match(shortcuts, /Veja o que vale jogar hoje/);
  assert.match(index, /Veja os eventos por dia, confira os horários e escolha o que quer jogar/);
  assert.doesNotMatch(shortcuts, /O melhor da aventura, agora/);
});

test('Nova redação chega ao PWA sem reaproveitar os scripts antigos em cache', () => {
  const index = read('spidey-app/index.html');
  const sw = read('spidey-app/sw.js');
  assert.match(index, /player-ui\.js\?v=20261030-human-editorial1/);
  assert.match(index, /home-premium-20261029\.js\?v=20261030-human-editorial1/);
  assert.match(sw, /20261030-human-editorial1/);
});
