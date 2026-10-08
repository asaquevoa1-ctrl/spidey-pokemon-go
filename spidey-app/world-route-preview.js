(() => {
  'use strict';
  const core = window.SpideyFlyCore;
  const cache = new WeakMap();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const clock = (date, zone) => new Intl.DateTimeFormat('pt-BR', {
    timeZone: zone, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(date);
  function windows(event, points = []) {
    if (core?.eligible(event) && points.length) {
      const saved = cache.get(event);
      if (saved?.points === points) return saved.rows;
      const rows = core.route(event, points);
      cache.set(event, { points, rows });
      return rows;
    }
    const schedule = event?.schedule || {};
    const sessions = schedule.sessions || [{start: schedule.start_brazil || schedule.start_local, end: schedule.end_brazil || schedule.end_local}];
    const rows = sessions.map(session => ({ start: new Date(session.start), end: new Date(session.end) }));
    return rows.every(row => Number.isFinite(+row.start) && row.end > row.start) ? rows : [];
  }
  function model(event, points, now = new Date()) {
    if (!core?.eligible(event) || !points?.length) return {rows: [], active: [], next: [], last: null};
    const rows = windows(event, points);
    const active = rows.filter(row => row.start <= now && now < row.end);
    const first = rows.find(row => row.start > now);
    const next = first ? rows.filter(row => +row.start === +first.start) : [];
    const last = rows.reduce((previous, row) => !previous || row.end > previous.end ? row : previous, null);
    return {rows, active, next, last};
  }
  function place(row, event, now, active, last) {
    const coordinates = `${row.lat},${row.lon}`;
    const status = active ? (+row.end === +last?.end ? 'ÚLTIMA CHANCE' : 'ATIVO AGORA') : 'PRÓXIMO';
    return `<article class="player-route-place ${active ? 'player-route-active' : ''}"><span class="player-kicker">${status}</span><h4>${esc(row.flag)} ${esc(row.name)}</h4><p>Agora no local: <strong>${esc(clock(now, row.timezone))}</strong></p><p>Janela local: ${esc(clock(row.start, row.timezone))} → ${esc(clock(row.end, row.timezone))}</p><p><strong>Brasília: ${esc(clock(row.start, 'America/Sao_Paulo'))} → ${esc(clock(row.end, 'America/Sao_Paulo'))}</strong></p>${row.featuredPokemon ? `<p>${esc(row.featuredPokemon)} Dinamax nesta região</p>` : ''}<code>${esc(coordinates)}</code><small>Ponto de referência aproximado</small><div class="player-actions"><button class="action-btn" data-route-coord="${esc(coordinates)}">Copiar coordenadas</button><a class="action-btn" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(coordinates)}" target="_blank" rel="noopener">Abrir mapa</a></div></article>`;
  }
  function render(event, points, now = new Date(), error = false) {
    if (!core?.eligible(event)) return '';
    const route = model(event, points, now);
    const body = !route.rows.length
      ? `<p role="status">${error ? 'Não foi possível carregar a rota. Recarregue o app para tentar novamente.' : points?.length ? 'Os horários deste evento ainda não estão confirmados.' : 'Carregando os horários pelo mundo…'}</p>`
      : `<h3>Onde jogar agora</h3>${route.active.length ? `<div class="player-route-grid">${route.active.map(row => place(row, event, now, true, route.last)).join('')}</div>` : '<p>Nenhuma janela ativa neste momento.</p>'}${route.next.length ? `<h3>Próxima etapa · em ${Math.ceil((route.next[0].start - now) / 60000)} min</h3><div class="player-route-grid">${route.next.map(row => place(row, event, now, false, route.last)).join('')}</div>` : '<p>Todas as etapas já começaram.</p>'}${route.last ? `<p class="player-route-last">${now >= route.last.end ? 'Rota encerrada.' : `Última janela: ${esc(route.last.name)} · até ${esc(clock(route.last.end, 'America/Sao_Paulo'))} (Brasília).`}</p>` : ''}`;
    return `<section class="player-world-route" data-world-route-event="${esc(event.id)}" aria-label="Rota mundial de ${esc(event.title)}"><header><span class="player-kicker">FLY · ROTA MUNDIAL${route.rows.length ? ` · ${route.rows.length} LOCAIS` : ''}</span><button class="action-btn gold" data-play-fly="${esc(event.id)}">Ver rota mundial completa →</button></header>${body}</section>`;
  }
  window.SpideyWorldRoute = Object.freeze({windows, model, render});
})();
