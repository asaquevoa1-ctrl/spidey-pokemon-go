(() => {
  'use strict';
  const core=window.SpideyFlyCore;if(!core)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const brazil=d=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(d);
  let points=[],selected='',mode='essential';
  // Rewriting long routes on every clock tick causes unnecessary mobile layout and scrolling work.
  const renderedMarkup = new WeakMap();
  function setMarkupIfChanged(node,markup){
    if(!node || renderedMarkup.get(node)===markup)return;
    node.innerHTML=markup;
    renderedMarkup.set(node,markup);
  }
  function events(){return state.events.filter(core.eligible).sort((a,b)=>a.schedule.start_local.localeCompare(b.schedule.start_local))}
  // O Holofote acontece às 18h–19h NO FUSO DE CADA CIDADE.
  // Mostre um atalho temporário a partir das 12 horas anteriores à primeira
  // janela mundial até o fim da última, sem confundir coordenadas urbanas com
  // localização garantida de Pokémon/PokéStops.
  // Visibilidade global permanente: cada evento elegível terá cartão de rota
  // na semana correspondente, sem exigir um destaque codificado por Pokémon.
  // Cacheia conversões IANA, mantendo status sempre recalculado pelo relógio.
  const cachedWindows=new Map();
  function upcomingGlobalRoutes(list,now){
    if(!points.length)return [];
    const horizon=now.getTime()+7*86400000;
    return list.filter(e=>{
      const approx=Date.parse(e.schedule.start_local);
      return Number.isFinite(approx)&&approx<=horizon&&approx>=now.getTime()-3*86400000;
    }).map(e=>{
      const key=[e.id,e.updated_at,e.schedule.start_local,e.schedule.end_local,points.length].join(':');
      if(!cachedWindows.has(key))cachedWindows.set(key,core.route(e,points,new Date(0)));
      const windows=cachedWindows.get(key);
      if(!windows.length)return null;
      const first=windows[0],last=windows[windows.length-1];
      if(last.end<=now)return null;
      const active=windows.filter(p=>p.start<=now&&p.end>now);
      const next=windows.find(p=>p.start>now);
      return {event:e,first,last,active,next,sortTime:active.length?now.getTime():next?.start?.getTime()||Number.MAX_SAFE_INTEGER};
    }).filter(Boolean).sort((a,b)=>a.sortTime-b.sortTime||a.first.start-b.first.start).slice(0,5);
  }
  const MORELULL_ID='2026-10-22-spotlight-morelull';
  function spotlightStatus(list,now){
    const e=list.find(item=>item.id===MORELULL_ID);
    if(!e||!points.length)return null;
    const route=core.route(e,points,now),first=route[0],last=route.at(-1);
    if(!first||!last||now<first.start-12*3600000||now>=last.end)return null;
    const active=route.filter(p=>p.start<=now&&p.end>now);
    const next=route.find(p=>p.start>now);
    const minutes=next?Math.max(0,Math.ceil((next.start-now)/60000)):0;
    const status=active.length?`ATIVO: ${active.slice(0,3).map(p=>p.name).join(', ')}`
      :next?`Próxima janela: ${next.name} às ${brazil(next.start)} · em ${Math.floor(minutes/60)}h ${minutes%60}min`
      :'Últimas janelas do mundo em andamento';
    return {e,route,first,last,active,status};
  }
  function showSourceCredits(){
    const box=document.getElementById('flySourceCredits');
    if(!box)return;
    const source=window.SPIDEY_FLY_REFERENCE_SOURCE;
    box.hidden=!source;
    if(!source)return;
    const raw=box.querySelector('.fly-original-credits');
    if(raw && raw.textContent!==source.credits)raw.textContent=source.credits;
  }
  function render(){
    const s=document.getElementById('flyView');if(!s)return;
    showSourceCredits();
    const list=events(),select=s.querySelector('#flyEventSelect'),now=new Date();
    const spotlight=spotlightStatus(list,now);
    const preview=upcomingGlobalRoutes(list,now);
    const previews=s.querySelector('#flyUpcomingRoutes');
    if(previews){
      previews.hidden=preview.length===0;
      setMarkupIfChanged(previews,preview.length ? `<h2>ROTAS ATIVAS E PRÓXIMAS</h2><div class="fly-upcoming-items">
        ${preview.map(item=>{
          const status=item.active.length?`ATIVO AGORA: ${item.active.slice(0,2).map(p=>p.name).join(' • ')}`:item.next?`Próxima janela: ${item.next.name} · ${brazil(item.next.start)}`:'Últimas regiões';
          return `<button class="fly-upcoming-item" type="button" data-fly-select="${esc(item.event.id)}" aria-label="Abrir rota de ${esc(item.event.title)}">
            <span>${esc(item.event.title)}</span><small>${esc(status)} (Brasília) · ${points.length} referências</small>
          </button>`;
        }).join('')}</div>` : '');
    }
    const feature=s.querySelector('#flyMorelullSpotlight');
    if(feature){
      feature.hidden=!spotlight;
      if(spotlight){
        const first=spotlight.first;
        setMarkupIfChanged(feature,`<div class="fly-spotlight-copy">
          <span class="eyebrow">🍄 HOLOFOTE MUNDIAL • 22/10</span>
          <h2>Morelull no FLY</h2>
          <p><strong>18h às 19h no horário de cada cidade · 2× Poeira Estelar por captura</strong></p>
          <p aria-live="polite">${esc(spotlight.status)}</p>
          <small>Primeira referência: ${esc(first.name)} · ${brazil(first.start)} (Brasília) • ${spotlight.route.length} locais em todos os fusos. São referências geográficas, não pontos de captura confirmados.</small>
        </div><button class="action-btn gold" type="button" data-fly-morespotlight>Ver rota do Morelull →</button>`);
      }
    }
    if(points.length && (!selected||!list.some(e=>e.id===selected))){
      selected=spotlight?.e.id||preview[0]?.event.id||list.at(-1)?.id||'';
      // No primeiro acesso ao Holofote, mostrar TODOS os pontos do mundo.
      if(selected===MORELULL_ID)mode='all';
    }
    const signature=JSON.stringify(list.map(e=>[e.id,e.title]));if(select.dataset.signature!==signature){select.innerHTML=list.map(e=>`<option value="${esc(e.id)}">${esc(e.title.replace(/^Spotlight Hour:/,'Hora do Holofote:').replace(/^Raid Hour:/,'Hora de Reides:').replace(/^Max Monday:/,'Segunda Max:'))}</option>`).join('');select.dataset.signature=signature}select.value=selected;
    const e=list.find(e=>e.id===selected),all=e?core.route(e,points,now):[],rows=mode==='essential'?all.filter(p=>p.essential):all;
    const summary=s.querySelector('#flyEventSummary'),summaryKey=JSON.stringify([selected,e?.updated_at,e?.title]);if(summary&&summary.dataset.event!==summaryKey){summary.innerHTML=window.SpideyPlayer?.panel(e,{fly:true})||'';summary.dataset.event=summaryKey;}
    const active=all.filter(p=>['ATIVO AGORA','ÚLTIMA CHANCE'].includes(p.status)),next=all.find(p=>p.status==='PRÓXIMO');
    s.querySelector('#flyNow').textContent=active.length?active.slice(0,2).map(p=>p.name).join(' • '):'Nenhuma janela ativa';
    s.querySelector('#flyNext').textContent=next?`${next.name} · ${brazil(next.start)}`:'Sem próxima janela';
    const minutes=next?Math.ceil((next.start-now)/60000):0;
    s.querySelector('#flyCountdown').textContent=next?`Começa em ${Math.floor(minutes/60)}h ${minutes%60}min (Brasília)`:'O evento já terminou ou aguarda confirmação do horário.';
    s.querySelector('#flyCount').textContent=String(rows.length);
    const last=all.reduce((r,p)=>!r||p.end>r.end?p:r,null);
    s.querySelector('#flyLast').textContent=last?`Última janela: ${last.name} · até ${brazil(last.end)} (Brasília)`:'Horário não informado';
    setMarkupIfChanged(s.querySelector('#flyRouteList'),rows.length?rows.map((p,i)=>{
      const q=`${p.lat},${p.lon}`,date=e.schedule.start_local.slice(8,10)+'/'+e.schedule.start_local.slice(5,7);
      return `<article class="fly-point ${['ATIVO AGORA','ÚLTIMA CHANCE'].includes(p.status)?'fly-active':''}"><span class="fly-order">${String(i+1).padStart(2,'0')}</span><div class="fly-place"><span class="fly-state">${esc(p.status)}</span><h3>${esc(p.flag)} ${esc(p.name)}</h3>${p.featuredPokemon?`<p class="fly-regional-pokemon"><strong>${esc(p.featuredPokemon)} Dinamax nesta região</strong></p>`:e.regional_pokemon?'<p>Pokémon regional a confirmar neste local.</p>':''}<p>Local: ${esc(date)} · ${esc(e.schedule.start_local.slice(11,16))} → ${esc(e.schedule.end_local.slice(11,16))}</p><p><strong>Brasília: ${brazil(p.start)} → ${brazil(p.end)}</strong></p>${brazil(p.start).slice(0,5)!==date?'<small>O início cai em outro dia em Brasília.</small>':''}<small>Local aproximado · confira no mapa</small><code>${q}</code></div><div class="fly-point-actions"><button class="action-btn" data-coord="${q}">Copiar coordenadas</button><a class="action-btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}" target="_blank" rel="noopener">Abrir mapa</a></div></article>`;
    }).join(''):'<p class="empty">Ainda não temos os horários deste evento.</p>');
    s.querySelectorAll('[data-fly-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.flyMode===mode)));
  }
  function open(id){selected=id;mode='all';render();setView('flyView');if(dialog.open)dialog.close()}
  function mount(){
    if(document.getElementById('flyView'))return;
    const main=document.querySelector('main'),nav=document.querySelector('.app-tabs');if(!main||!nav)return;
    const s=document.createElement('section');s.id='flyView';s.className='app-view';s.hidden=true;
    s.innerHTML=`<section class="hero hero-compact"><span class="eyebrow">FLY • JOGAR PELO MUNDO</span><h1>Rota Mundial</h1><p>Do primeiro fuso à última chance. Horário local, Brasília e coordenadas na mesma rota.</p></section><section class="section"><label class="fly-event-label" for="flyEventSelect">Escolha o evento</label><select id="flyEventSelect" class="fly-event-select"></select><div id="flyMorelullSpotlight" class="fly-spotlight-feature" hidden></div><div id="flyUpcomingRoutes" class="fly-upcoming-routes" hidden></div><div id="flyEventSummary"></div><div class="fly-live-grid"><article><span class="eyebrow">ONDE JOGAR AGORA</span><h2 id="flyNow">Carregando…</h2></article><article><span class="eyebrow">PRÓXIMO</span><h2 id="flyNext">Carregando…</h2><p id="flyCountdown" role="status"></p></article></div><p id="flyLast" class="fly-last"></p><div class="fly-toolbar"><button class="action-btn" data-fly-mode="essential" aria-pressed="true">Essenciais</button><button class="action-btn" data-fly-mode="all" aria-pressed="false">Todos os locais</button><span><strong id="flyCount">0</strong> locais</span></div><p class="microcopy">Os pontos abaixo ajudam a escolher onde jogar. Não representam PokéStops exatas.</p><div id="flyRouteList" class="fly-route-list"></div><details id="flySourceCredits" class="fly-reference-credits" hidden><summary>Créditos e origem da lista mundial</summary><p>Coordenadas fornecidas em lista de 10/11/2023. Os horários são recalculados automaticamente para a data do evento e o fuso de Brasília; não são copiados da lista antiga.</p><pre class="fly-original-credits"></pre></details></section>`;main.append(s);
    const b=document.createElement('button');b.className='app-tab';b.dataset.view='flyView';b.textContent='FLY';nav.insertBefore(b,nav.querySelector('[data-view="stampsView"]'));b.addEventListener('click',()=>{render();setView('flyView')});
    s.querySelector('#flyEventSelect').addEventListener('change',e=>{selected=e.target.value;mode='all';render()});
    s.addEventListener('click',async e=>{const quick=e.target.closest('[data-fly-select]');
      if(quick){selected=quick.dataset.flySelect;mode='all';render();return}
      const spotlightButton=e.target.closest('[data-fly-morespotlight]');if(spotlightButton){selected=MORELULL_ID;mode='all';render();return}const f=e.target.closest('[data-fly-mode]');if(f){mode=f.dataset.flyMode;render();return}const c=e.target.closest('[data-coord]');if(!c)return;try{await navigator.clipboard.writeText(c.dataset.coord);showToast('Coordenadas copiadas.')}catch{prompt('Copie as coordenadas:',c.dataset.coord)}});
    core.loadPoints().then(p=>{points=p;window.SPIDEY_FLY_POINTS=p;showSourceCredits();render()}).catch(()=>{s.querySelector('#flyRouteList').innerHTML='<p class="empty">Não foi possível carregar a rota. Recarregue para tentar novamente.</p>'});
    window.addEventListener('spideycontentready',render);
    // Text clocks are minute-granular; no benefit in rebuilding a multi-stop route every 30s.
    setInterval(()=>{if(!document.hidden&&!s.hidden)render()},60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!s.hidden)render()});
  }
  window.SpideyFly=Object.freeze({open,render});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
