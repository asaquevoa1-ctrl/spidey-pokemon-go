'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.id = '';
    this.className = '';
    this.children = [];
    this.parent = null;
    this.attributes = {};
    this.dataset = {};
    this.events = {};
    this.textContent = '';
    this.classList = {
      add: (...names) => {
        const parts = new Set(this.className.split(/\s+/).filter(Boolean));
        names.forEach(name => parts.add(name));
        this.className = [...parts].join(' ');
      }
    };
  }
  append(...children) {
    children.forEach(child => { child.parent = this; this.children.push(child); });
  }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, fn) { this.events[name] = fn; }
  querySelector(selector) {
    const matches = el => selector.startsWith('#') ?
      el.id === selector.slice(1) : el.className.split(/\s+/).includes(selector.slice(1));
    const visit = el => {
      for (const child of el.children) {
        if (matches(child)) return child;
        const found = visit(child);
        if (found) return found;
      }
      return null;
    };
    return visit(this);
  }
  insertAdjacentElement(position, node) {
    assert.equal(position, 'afterend');
    const index = this.parent.children.indexOf(this);
    assert.ok(index >= 0);
    this.parent.children.splice(index + 1, 0, node);
    node.parent = this.parent;
  }
}

function agendaFixture(withCockpit) {
  const home = new Element('main');
  home.id = 'playerHome';
  const head = new Element('header');
  head.className = 'spidey-cockpit-home-head player-home-head';
  home.append(head);
  let cockpit;
  if (withCockpit) {
    cockpit = new Element('section');
    cockpit.className = 'spidey-command-cockpit';
    home.append(cockpit);
  }
  const document = {
    readyState: 'loading', hidden: false,
    getElementById: id => id === 'playerHome' ? home : null,
    createElement: tag => new Element(tag),
    addEventListener() {}
  };
  const window = { addEventListener() {}, SPIDEY_APPROVED_ART_MASTER: {} };
  vm.runInNewContext(read('spidey-app/calendar-premium-20261101.js'), {
    window, document, Intl, Date, state: { events: [] }
  });
  return { home, head, cockpit, api: window.SpideyCalendarPremium };
}

test('agenda mounts and shows all seven days even when the 3D cockpit is absent', () => {
  const { home, head, api } = agendaFixture(false);
  assert.equal(api.render(new Date('2026-11-08T21:00:00Z')), true);
  const agenda = home.querySelector('#spideyCalendarPremium');
  assert.ok(agenda, 'The seven-day agenda must not depend on the gallery');
  assert.equal(home.children.indexOf(agenda), home.children.indexOf(head) + 1);
  assert.equal(agenda.querySelector('.spidey-agenda-days').children.length, 7);
});

test('existing cockpit still anchors seven-day agenda immediately after it', () => {
  const { home, cockpit, api } = agendaFixture(true);
  assert.equal(api.render(new Date('2026-11-08T21:00:00Z')), true);
  assert.equal(home.children.indexOf(home.querySelector('#spideyCalendarPremium')),
    home.children.indexOf(cockpit) + 1);
});

test('Home assembles navigation and KPIs without fake 3D posters', () => {
  const player = read('spidey-app/player-ui.js');
  const css = read('spidey-app/spidey-command-cockpit-20261029.css');
  assert.match(player, /if\(head&&shortcuts&&metrics\)/);
  assert.doesNotMatch(player, /if\(universe&&shortcuts&&metrics\)/);
  assert.match(player, /cockpit\.append\(fallback\)/);
  assert.match(player, /fallback\.className='spidey-universe-fallback'/);
  assert.match(player, /head\.querySelector\('\.spidey-cockpit-explore'\)\?\.remove\(\)/);
  assert.match(css, /spidey-universe-fallback/);
  assert.doesNotMatch(player, /fallback\.innerHTML/);
});

test('PWA versions and sources for the correction are kept in sync', () => {
  const html = read('spidey-app/index.html');
  const sw = read('spidey-app/sw.js');
  assert.match(html, /player-ui\.js\?v=20261108-homeguard1/);
  assert.match(html, /calendar-premium-20261101\.js\?v=20261108-homeguard1/);
  assert.match(html, /SPIDEY_BUILD='2026-11-08-homeguard1'/);
  assert.match(sw, /spidey-app-20261108-homeguard1/);
  for (const file of ['spidey-app/player-ui.js','spidey-app/calendar-premium-20261101.js','spidey-app/sw.js']) {
    assert.equal(spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding:'utf8' }).status, 0, file + ' has a syntax error');
  }
});


test('catalog includes future approved events for the 3D gallery on 8 Nov 2026', () => {
  const window = {};
  vm.runInNewContext(read('spidey-app/premium-approved-master.js'), { window });
  vm.runInNewContext(read('spidey-app/spidey-universe-3d.js'), { window });
  const events = JSON.parse(read('spidey-app/data/events.json')).events;
  const now = new Date('2026-11-08T23:00:00Z');
  const art = event => {
    const approved = window.SPIDEY_APPROVED_ART_MASTER?.[event.id];
    return approved ? approved.file + '?v=' + approved.sha256.slice(0, 12) : null;
  };
  const range = e => ({
    start: new Date(e.schedule?.start_brazil || e.schedule?.start_local || ''),
    end: new Date(e.schedule?.end_brazil || e.schedule?.end_local || '')
  });
  const selection = window.SpideyUniverse3D.approvedEvents(events, null, now,
    art, e => e.title, () => '', range);
  assert.ok(selection.length >= 2,
    'Approved future posters should be available independently of the Home loading state');
  assert.ok(selection.every(e => e.art.startsWith('assets/')));
});
