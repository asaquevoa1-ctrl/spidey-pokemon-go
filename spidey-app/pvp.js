(() => {
  'use strict';
  const TYPES = {normal:'Normal',fire:'Fogo',water:'Água',electric:'Elétrico',grass:'Planta',ice:'Gelo',fighting:'Lutador',poison:'Veneno',ground:'Terra',flying:'Voador',psychic:'Psíquico',bug:'Inseto',rock:'Pedra',ghost:'Fantasma',dragon:'Dragão',dark:'Sombrio',steel:'Aço',fairy:'Fada'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const teamKey = 'spidey-pvp-team';
  let snapshot, loading, lastCheck = 0, leagueId = 'great', limit = 25;
  let teams;
  try { teams = JSON.parse(localStorage.getItem(teamKey) || '{}'); } catch { teams = {}; }
  if (!teams || typeof teams !== 'object' || Array.isArray(teams)) teams = {};
  const league = () => snapshot?.leagues.find(l => l.id === leagueId);
  const title = id => snapshot?.pokemon[id]?.name || id;
  const team = () => (Array.isArray(teams[leagueId]) ? teams[leagueId] : []).filter((id, i, a) => a.indexOf(id) === i && league()?.entries.some(e => e.id === id)).slice(0,3);
  const badges = id => (snapshot.pokemon[id]?.types || []).map(type => `<span class="pvp-type pvp-type-${esc(type)}">${esc(TYPES[type] || type)}</span>`).join('');
  function filteredEntries(data, query = '', type = '', metadata = snapshot.pokemon) {
    const q = normalize(query.trim());
    return data.entries.map((e, i) => ({...e, rank: i + 1})).filter(e => (!type || metadata[e.id]?.types.includes(type)) && (!q || normalize(`${metadata[e.id]?.name} ${e.id} ${metadata[e.id]?.dex}`).includes(q)));
  }
  function persist() {
    try { localStorage.setItem(teamKey, JSON.stringify(teams)); } catch { showToast('Não foi possível salvar o time neste aparelho.'); }
  }
  function selectTeam(id) {
    if (!league()?.entries.some(e => e.id === id)) return;
    const selected = team();
    if (selected.includes(id)) teams[leagueId] = selected.filter(p => p !== id);
    else if (selected.length < 3) teams[leagueId] = [...selected,id];
    else { showToast('Seu time já tem 3 Pokémon. Remova um para trocar.'); return; }
    persist(); render();
    const button = document.querySelector(`[data-pvp-team="${id}"]`);
    button?.focus({preventScroll:true});
  }
  function threats(data, selected) {
    const counts = new Map();
    data.entries.filter(e => selected.includes(e.id)).forEach(e => new Set(e.counters).forEach(id => counts.set(id,(counts.get(id)||0)+1)));
    return [...counts].filter(([,count]) => count > 1).sort((a,b) => b[1]-a[1]).slice(0,5);
  }
  function renderTeam() {
    const root = document.getElementById('pvpTeam'), selected = team();
    root.innerHTML = `<div class="section-head"><div><span class="eyebrow">MONTE SUA ESCOLHA</span><h2>Meu time <span class="pvp-count">${selected.length}/3</span></h2></div>${selected.length ? '<button class="ghost-btn" id="clearPvpTeam" type="button">Limpar</button>' : ''}</div><div class="pvp-team-slots">${[0,1,2].map(i => selected[i] ? `<article class="pvp-team-slot"><strong>${esc(title(selected[i]))}</strong><div class="pvp-types">${badges(selected[i])}</div><button class="ghost-btn" data-pvp-team="${esc(selected[i])}" aria-label="Remover ${esc(title(selected[i]))} do time">Remover</button></article>` : `<div class="pvp-team-slot pvp-team-empty"><span>${i+1}</span><p>Escolha abaixo</p></div>`).join('')}</div><p class="microcopy">Seu time fica salvo só neste aparelho.</p>${selected.length > 1 ? `<div class="pvp-team-hints"><h3>Atenção aos confrontos</h3>${threats(league(),selected).map(([id,count]) => `<p><strong>${esc(title(id))}</strong> aparece entre as ameaças de ${count} escolhas.</p>`).join('') || '<p>Nenhuma ameaça repetida nas listas consultadas.</p>'}<p class="microcopy">São as principais ameaças do ranking. Para testar a cobertura completa, use o simulador.</p></div>` : ''}<a class="action-btn" href="https://pvpoke.com/team-builder/" target="_blank" rel="noopener noreferrer">Simular meu time no PvPoke ↗</a>`;
    document.getElementById('clearPvpTeam')?.addEventListener('click',() => { teams[leagueId] = []; persist(); render(); });
  }
  function render() {
    if (!snapshot || !league()) return;
    const root = document.getElementById('pvpRankings'); if (!root) return;
    document.querySelectorAll('[data-pvp-league]').forEach(button => { const active = button.dataset.pvpLeague === leagueId; button.classList.toggle('active',active); button.setAttribute('aria-pressed', String(active)); });
    const results = filteredEntries(league(),document.getElementById('pvpSearch').value,document.getElementById('pvpType').value), selected = team();
    document.getElementById('pvpResultCount').textContent = `${results.length} Pokémon · ${league().cp === 10000 ? 'sem limite de PC' : `até ${league().cp.toLocaleString('pt-BR')} PC`}`;
    root.innerHTML = results.slice(0,limit).map(e => `<article class="pvp-card" data-pvp-entry="${esc(e.id)}"><span class="pvp-rank">#${e.rank}</span><div class="pvp-card-copy"><button class="pvp-name" data-pvp-open="${esc(e.id)}">${esc(title(e.id))}</button><div class="pvp-types">${badges(e.id)}</div><p class="pvp-moves">${e.moveset.map(move => esc(snapshot.moves[move].name)).join(' · ')}</p><button class="pvp-team-button" data-pvp-team="${esc(e.id)}" aria-pressed="${selected.includes(e.id)}">${selected.includes(e.id) ? '✓ No time' : '+ Meu time'}</button></div><div class="pvp-score"><strong>${Number(e.score).toFixed(1)}</strong><span>Nota PvPoke</span></div></article>`).join('') || '<p class="empty">Nenhum Pokémon encontrado. Tente outro nome ou tipo.</p>';
    const more = document.getElementById('pvpMore'); more.hidden = limit >= results.length;
    renderTeam();
  }
  function openDetail(id) {
    const entry = league()?.entries.find(e => e.id === id); if (!entry) return;
    beginAppDialog(); if (dialog.open) dialog.close();
    detail.className = '';
    delete detail.dataset.visualCategory; delete detail.dataset.visualCharacter;
    const opponentList = ids => ids.map(opponent => `<button class="pvp-opponent" data-pvp-open="${esc(opponent)}" ${league().entries.some(e => e.id === opponent) ? '' : 'disabled'}>${esc(title(opponent))}</button>`).join('');
    detail.innerHTML = `<div class="detail-body pvp-detail"><span class="eyebrow">PVP · LIGA ${esc(league().name.toUpperCase())}</span><h2>${esc(title(id))}</h2><div class="pvp-types">${badges(id)}</div><p class="pvp-detail-score">#${league().entries.indexOf(entry)+1} <span>· Nota PvPoke ${Number(entry.score).toFixed(1)}/100</span></p><h3>Golpes recomendados</h3><ul class="pvp-detail-moves">${entry.moveset.map((move,i) => `<li><span>${i === 0 ? 'Rápido' : 'Carregado'}</span><strong>${esc(snapshot.moves[move].name)}</strong>${snapshot.pokemon[id].elite?.includes(move) ? '<small>Exige MT de Elite ou evento que libere o golpe.</small>' : ''}</li>`).join('')}</ul><h3>Confrontos em que se destaca</h3><div class="pvp-opponents">${opponentList(entry.matchups)}</div><h3>Principais ameaças</h3><div class="pvp-opponents">${opponentList(entry.counters)}</div><p class="microcopy">Resultado de simulações do PvPoke. IVs, escudos, energia e decisões na batalha mudam o resultado. Os nomes dos golpes seguem o PvPoke.</p><a class="action-btn gold" href="https://pvpoke.com/rankings/all/${league().cp}/overall/${encodeURIComponent(id)}/" target="_blank" rel="noopener noreferrer">Ver análise no PvPoke ↗</a></div>`;
    showAppDialog();
  }
  async function load(force = false) {
    if (loading) return loading;
    if (snapshot && (!force || Date.now()-lastCheck < 60000)) { render(); return; }
    const status = document.getElementById('pvpLoadStatus');
    status.textContent = snapshot ? 'Conferindo os rankings…' : 'Carregando os rankings…';
    loading = window.SpideyCatalog.load('pvp').then(data => {
      if (data.schema_version !== 'spidey-pvp-v1' || !data.pokemon || !data.moves || ['great','ultra','master'].some(id => !data.leagues.some(l => l.id === id && l.entries?.length))) throw Error('Invalid PvP snapshot');
      snapshot = data; lastCheck = Date.now(); render();
      const date = new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(data.updated_at));
      status.textContent = `PvPoke · dados conferidos em ${date}`;
    }).catch(() => { status.textContent = snapshot ? 'Mostrando os últimos rankings carregados. Tentaremos atualizar quando houver conexão.' : 'Não foi possível carregar o PvP. Confira a conexão e tente novamente.'; }).finally(() => { loading = null; });
    return loading;
  }
  function mount() {
    const root = document.getElementById('pvpView'); if (!root) return;
    document.getElementById('pvpType').innerHTML = '<option value="">Todos os tipos</option>' + Object.entries(TYPES).map(([id,name]) => `<option value="${id}">${name}</option>`).join('');
    document.querySelectorAll('[data-pvp-league]').forEach(button => button.addEventListener('click',() => { leagueId = button.dataset.pvpLeague; limit = 25; render(); }));
    document.getElementById('pvpSearch').addEventListener('input',() => { limit=25; render(); });
    document.getElementById('pvpType').addEventListener('change',() => { limit=25; render(); });
    document.getElementById('pvpMore').addEventListener('click',() => { limit += 25; render(); });
    document.getElementById('pvpRetry').addEventListener('click',() => load(true));
    document.addEventListener('click',event => { const target=event.target.closest('[data-pvp-open],[data-pvp-team]'); if (!target) return; if (target.dataset.pvpOpen) openDetail(target.dataset.pvpOpen); else selectTeam(target.dataset.pvpTeam); });
    window.addEventListener('online',() => { if (!root.hidden) load(true); });
    window.addEventListener('spideycatalogchecked',() => { if (!root.hidden) load(true); });
  }
  window.SpideyPvp = Object.freeze({load, filteredEntries, threats});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
