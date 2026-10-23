/* Guia Rocket: conteúdo factual estático, com origem e data visíveis; sem rastrear jogadores. */
(() => {
  'use strict';
  const view = document.getElementById('rocketGuideView');
  if (!view) return;
  const board = document.getElementById('rocketRoster');
  const status = document.getElementById('rocketStatus');
  const search = document.getElementById('rocketSearch');
  const count = document.getElementById('rocketCount');
  const updated = document.getElementById('rocketUpdated');
  const refresh = document.getElementById('rocketRefresh');
  const filter = document.getElementById('rocketFilter');
  let current = null;
  let lastCheck = 0;
  let selected = 'all';
  let pending = null;

  function plain(node, tag, value, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    e.textContent = String(value == null ? '' : value);
    node.appendChild(e);
    return e;
  }
  function slug(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function safe(data) {
    if (!data || data.schema_version !== 'spidey-rocket-v1' || !Array.isArray(data.members) || data.members.length < 20) return false;
    return data.members.every(m => m && Array.isArray(m.slots) && m.slots.length === 3 &&
      m.slots.every(s => Number.isInteger(s.position) && Array.isArray(s.pokemon) && s.pokemon.length));
  }
  function freshness(data) {
    const sourceDate = data.source?.source_updated_on;
    let title = 'Data da fonte indisponível';
    if (/^\d{4}-\d\d-\d\d$/.test(sourceDate || '')) {
      const [year, month, day] = sourceDate.split('-');
      title = 'Leek Duck: escalação de ' + day + '/' + month + '/' + year;
      const age = (Date.now() - new Date(sourceDate + 'T12:00:00Z').getTime()) / 86400000;
      if (age > 30) title += ' · Fonte antiga — conferir antes de jogar';
    }
    updated.textContent = title;
  }

  function card(m) {
    const article = document.createElement('details');
    article.className = 'rocket-card';
    const head = plain(article, 'summary', '', 'rocket-card-head');
    const over = plain(head, 'span', '', 'rocket-card-over');
    plain(over, 'span', m.group === 'boss' ? 'CHEFE' : m.group === 'leader' ? 'LÍDER' : 'RECRUTA', 'rocket-card-tag');
    plain(over, 'strong', m.label, 'rocket-card-title');
    const first = m.slots[0].pokemon.map(p => p.name).join(' / ');
    plain(head, 'span', '1º: ' + first, 'rocket-first');
    const body = plain(article, 'div', '', 'rocket-card-body');
    if (m.hint) plain(body, 'p', 'Fala de referência (inglês): “' + m.hint + '”', 'rocket-hint');
    const list = plain(body, 'div', '', 'rocket-slots');
    m.slots.forEach(slot => {
      const row = plain(list, 'div', '', 'rocket-slot');
      const heading = plain(row, 'div', '', 'rocket-slot-heading');
      plain(heading, 'strong', slot.position + 'ª posição', '');
      if (slot.encounter_possible) plain(heading, 'span', 'Resgate possível', 'rocket-catchable');
      const names = plain(row, 'div', '', 'rocket-pokemons');
      slot.pokemon.forEach(mon => {
        const chip = plain(names, 'span', mon.name, 'rocket-mon');
        if (mon.shiny_possible) {
          chip.title = 'O Pokémon da recompensa pode ser Brilhante, segundo a fonte.';
          plain(chip, 'sup', ' ✦', 'rocket-shiny');
        }
      });
    });
    if (m.tip) plain(body, 'p', m.tip, 'rocket-type-tip');
    plain(body, 'p', 'Os adversários variam. “Resgate possível” não é garantia de captura nem de Brilhante.', 'rocket-footnote');
    return article;
  }

  function show() {
    if (!current) return;
    const q = slug(search.value.trim());
    const matches = current.members.filter(m => {
      if (selected === 'leaders' && m.group === 'grunt') return false;
      if (selected === 'grunts' && m.group !== 'grunt') return false;
      if (!q) return true;
      const hay = [m.label, m.source_key, m.type_label, m.hint, ...m.slots.flatMap(s => s.pokemon.map(p => p.name))].join(' ');
      return slug(hay).includes(q);
    });
    board.replaceChildren(...matches.map(card));
    count.textContent = matches.length + (matches.length === 1 ? ' adversário encontrado' : ' adversários encontrados');
    if (!matches.length) plain(board, 'p', 'Nenhum resultado. Tente o nome de um Pokémon, líder ou tipo.', 'rocket-empty');
  }

  async function load(force = false) {
    if (pending) return pending;
    if (!force && current && Date.now() - lastCheck < 300000) { show(); return; }
    status.textContent = 'Conferindo o elenco salvo no Spidey...';
    refresh.disabled = true;
    pending = (async () => {
      try {
        const response = await fetch('data/rocket-lineups.json', {cache:'no-store'});
        if (!response.ok) throw new Error('Dados indisponíveis');
        const json = await response.json();
        if (!safe(json)) throw new Error('Elenco incompleto; não será exibido como atualizado');
        current = json;
        lastCheck = Date.now();
        freshness(json);
        show();
        status.textContent = 'Referência comunitária com fonte e data. O roteiro é checado automaticamente, mas pode mudar no jogo sem aviso.';
      } catch (error) {
        status.textContent = current
          ? 'Não foi possível conferir a fonte agora. Exibindo a última lista carregada; confira o Leek Duck.'
          : 'Não foi possível abrir uma lista validada. Consulte o Leek Duck no link abaixo; não exibiremos palpites.';
      } finally {
        refresh.disabled = false;
        pending = null;
      }
    })();
    return pending;
  }
  filter?.addEventListener('click', event => {
    const btn = event.target.closest('[data-rocket-group]');
    if (!btn) return;
    selected = btn.dataset.rocketGroup;
    filter.querySelectorAll('[data-rocket-group]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    show();
  });
  search?.addEventListener('input', show);
  refresh?.addEventListener('click', () => load(true));
  window.SpideyRocket = Object.freeze({load});
})();
