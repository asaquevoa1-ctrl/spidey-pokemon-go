(() => {
  'use strict';
  let worldPoints = null, worldError = false;
  let lastTimelineSignature = null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=e=>window.SpideyVisualV3?.localizeTitle(e.title)||String(e.title||'').replace(/^Spotlight Hour:/,'Hora do Holofote:').replace(/^Raid Hour:/,'Hora de Reides:').replace(/^Max Monday:/,'Segunda Max:');
  function art(e){
    if(e?.presentation?.hide_poster_until_corrected === true || e?.id === '2026-09-tcg-30th-us-retail') return null;
    const approved=window.SPIDEY_APPROVED_ART_MASTER?.[e.id];
    const review=window.SPIDEY_PREVIEW_ART?.[e.id];
    const a=approved?window.SpideyReviewArt.resolve(e):review;
    return a?`${a.file}?v=${a.sha256.slice(0,12)}`:null;
  }
  function reviewCorrection(e){return window.SpideyReviewArt.correction(e)}
  function image(e,thumb=false){
    const url=art(e);if(!url)return '';
    const draft=window.SPIDEY_PREVIEW_ART?.[e.id];
    const asset=window.SPIDEY_APPROVED_ART_MASTER?.[e.id]?window.SpideyReviewArt.resolve(e):draft;
    const size=asset?.width&&asset?.height?`width="${asset.width}" height="${asset.height}"`:'';
    if(draft&&draft.display!=='full_poster'&&!window.SPIDEY_APPROVED_ART_MASTER?.[e.id])return `<span class="player-art-window ${thumb?'player-thumbnail':''}"><img src="${esc(url)}" alt="Ilustração de ${esc(title(e))}"></span>`;
    return `<img class="${thumb?'player-thumbnail':'player-poster'}" src="${esc(url)}" alt="Arte de ${esc(title(e))}" ${size} ${thumb?'loading="lazy"':''}>`;
  }
  function source(e){try{return /(^|\.)(pokemongo\.com|pokemongolive\.com|azcardinals\.com)$/.test(new URL(e.source.url).hostname)?'Anúncio oficial':/pokeminers|datamine/i.test(e.source.name||'')?'Prévia • ainda não confirmada':'Informação da comunidade'}catch{return 'Informação em confirmação'}}
  function facts(e){
    const bonuses=Array.isArray(e.bonuses)?e.bonuses.filter(x=>typeof x==='string'):[];
    return [...new Set([e.summary,...bonuses].filter(Boolean))];
  }
  function time(e){
    if(window.SpideyDateOnly?.valid(e))return window.SpideyDateOnly.label(e);
    const s=e.schedule||{};if(!s.start_local||!s.end_local)return 'Horário a confirmar';
    if(s.sessions?.length)return `${s.start_local.slice(8,10)}–${s.end_local.slice(8,10)}/${s.start_local.slice(5,7)} · ${s.start_local.slice(11,16)}–${s.end_local.slice(11,16)} em ${s.local_place||s.local_timezone}. Brasília: ${formatRange(e)}.`;
    if(!window.SpideyFlyCore?.eligible(e))return `${formatRange(e)} (Brasília)`;
    const date=v=>v.slice(8,10)+'/'+v.slice(5,7);
    const a=date(s.start_local),b=date(s.end_local);
    return `${a} · ${s.start_local.slice(11,16)} → ${a!==b?b+' · ':''}${s.end_local.slice(11,16)} no horário de cada região`;
  }

  function panel(e,{fly=false}={}){
    if(!e)return '<p>Escolha um evento para ver os detalhes.</p>';
    const image=art(e),pokemon=(e.pokemon||[]).map(p=>typeof p==='string'?p:`${p.name}${p.note?' — '+p.note:''}`),notes=(e.notes||[]).filter(n=>typeof n==='string');
    const official=!image&&e.official_media?.classification==='official_illustration'?e.official_media:null;
    const visual=image?window.SpideyPlayer.image(e,fly):official?`<figure class="space-official-figure"><img src="${esc(official.file)}?v=${esc(official.sha256.slice(0,12))}" width="${official.width}" height="${official.height}" alt="${esc(official.alt)}"><figcaption>Imagem do anúncio oficial · ${esc(official.credit||'Pokémon GO')}</figcaption></figure>`:'';
    return `<article class="player-event ${fly?'player-event--fly':''} ${image?'has-poster':official?'has-official-media':'without-poster'}">${visual}<div class="player-event-copy"><span class="player-kicker">${esc(spideyCategoryLabel(e))}</span><h2>${esc(title(e))}</h2><p class="player-time">${esc(time(e))}</p>${window.SpideyNightOutHighlight?.(e)||''}<div class="player-facts">${facts(e).map(f=>`<p>${esc(f)}</p>`).join('')||'<p>Os detalhes deste evento ainda serão anunciados.</p>'}</div>${pokemon.length?`<h3>Pokémon em destaque</h3><ul>${pokemon.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`:''}${notes.length?`<details><summary>O que mais você precisa saber</summary><ul>${notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></details>`:''}<div class="player-actions"><button class="action-btn" data-play-detail="${esc(e.id)}">Todos os detalhes</button>${official&&e.id==='2026-10-world-space-week'?'<button class="action-btn gold" data-open-space-museums>Ver museus e fundos</button>':''}${!fly&&window.SpideyFlyCore?.eligible(e)?`<button class="action-btn gold" data-play-fly="${esc(e.id)}">Jogar pelo mundo →</button>`:''}</div>${e.source?.url?`<a class="player-source" href="${esc(e.source.url)}" target="_blank" rel="noopener">${esc(source(e))} ↗</a>`:''}</div></article>`;
  }
  function row(e){const image=art(e);return `<button class="player-row" data-play-detail="${esc(e.id)}">${image?window.SpideyPlayer.image(e,true):`<span class="player-date" aria-hidden="true">${esc((e.schedule?.start_local||e.schedule?.start_date)?.slice(8,10)||'—')}<small>${esc((e.schedule?.start_local||e.schedule?.start_date)?.slice(5,7)||'')}</small></span>`}<span><small>${esc(spideyCategoryLabel(e))}</small><strong>${esc(title(e))}</strong><span>${esc(time(e))}</span>${facts(e)[0]?`<span class="player-row-bonus">${esc(facts(e)[0])}</span>`:''}</span><span aria-hidden="true">›</span></button>`}
  function homeSelection(events,points,now=new Date()){
    const today=brazilDateKey(now),route=window.SpideyWorldRoute;
    const dateOnly=e=>window.SpideyDateOnly?.valid(e);
    const dateToday=e=>dateOnly(e)&&window.SpideyDateOnly.status(e,now).startsWith('Hoje');
    const periods=e=>route?.windows(e,points||[])||[getBrazilRange(e)];
    const activeAt=e=>!dateOnly(e)&&periods(e).some(p=>p.start<=now&&now<p.end);
    const live=events.filter(e=>dateOnly(e)?window.SpideyDateOnly.status(e,now)!=='Data encerrada':periods(e).some(p=>p.end>now)).sort((a,b)=>getBrazilRange(a).start-getBrazilRange(b).start);
    const scheduled=live.filter(e=>!dateOnly(e));
    const focus=scheduled.find(e=>art(e)&&window.SpideyFlyCore?.eligible(e)&&activeAt(e))||scheduled.find(e=>art(e)&&activeAt(e))||scheduled.find(e=>window.SpideyFlyCore?.eligible(e)&&activeAt(e))||scheduled.find(e=>e.schedule?.start_local?.slice(0,10)===today&&window.SpideyFlyCore?.eligible(e))||scheduled.find(e=>e.id==='2026-10-world-space-week'&&activeAt(e))||scheduled.find(e=>art(e))||scheduled[0];
    return {focus,dated:live.filter(dateToday),active:live.filter(e=>e.id!==focus?.id&&activeAt(e)),upcoming:live.filter(e=>e.id!==focus?.id&&!dateToday(e)&&!activeAt(e)).slice(0,6)};
  }
  // A Home Premium não deve destruir imagens e WebGL a cada minuto sem mudança de agenda.
  // Renderizações por conteúdo novo continuam imediatas; esta assinatura vale só para o relógio.
  function homeTimelineSignature(selection,now){
    const ids=list=>list.map(event=>event.id).join('|');
    return [brazilDateKey(now),selection.focus?.id||'',ids(selection.dated),ids(selection.active),ids(selection.upcoming)].join('::');
  }
  function refreshHomeIfChanged(){
    const root=document.getElementById('playerHome');
    if(!root || document.hidden || document.getElementById('calendarView')?.hidden)return;
    const now=new Date(),selection=homeSelection(state.events,worldPoints,now);
    if(homeTimelineSignature(selection,now)!==lastTimelineSignature)renderHome();
  }
  function renderHome(){
    const root=document.getElementById('playerHome');if(!root)return;
    const now=new Date(),selection=homeSelection(state.events,worldPoints,now);
    const {focus,dated,active,upcoming}=selection;
    lastTimelineSignature=homeTimelineSignature(selection,now);
    root.querySelector('#spideyUniverse3D')?.spideyDispose?.();
    root.innerHTML=`<header class="player-home-head"><span>${esc(new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'long',day:'numeric',month:'long'}).format(now))}</span><h1>Seu próximo encontro.</h1><p>Escolha o evento. Aproveite o bônus. Jogue pelo mundo.</p></header><section aria-label="Destaque do dia">${focus?panel(focus):'<div class="spidey-home-awaiting" role="status"><strong>Seu universo está pronto.</strong><p>Os eventos aparecerão assim que a agenda estiver disponível. Você já pode explorar as outras áreas.</p></div>'}${focus?(window.SpideyWorldRoute?.render(focus,worldPoints,now,worldError)||''):''}</section><div class="player-feed">${dated.length?`<section><h2>Eventos de hoje · horário a confirmar</h2>${dated.map(row).join('')}</section>`:''}${active.length?`<section><h2>Acontecendo agora <span>${active.length}</span></h2>${active.map(row).join('')}</section>`:''}<section><h2>Vem por aí</h2>${upcoming.map(row).join('')||'<p>Novos eventos serão anunciados em breve.</p>'}</section></div>`;
    // Esta e a Home VISIVEL: os blocos legados experience-* estao ocultos pelo Player UI.
    // Construir o dashboard sobre #playerHome, sem substituir os posters aprovados.
    const head=root.querySelector('.player-home-head');
    if(head){
      head.classList.add('spidey-premium-home-head','spidey-cockpit-home-head');
      const kicker=head.querySelector('span'),heading=head.querySelector('h1'),description=head.querySelector('p');
      if(kicker)kicker.textContent='SPIDEY · '+new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'long',day:'numeric',month:'long'}).format(now);
      if(heading)heading.textContent='Seu universo. Seu próximo desafio.';
      if(description)description.textContent='O melhor do Pokémon GO em uma experiência feita para explorar.';
      // O S cósmico oficial, não um novo logo nem a antiga aranha.
      const emblem=document.createElement('img');
      emblem.className='spidey-cockpit-emblem';
      emblem.src='assets/branding/20261019/spidey-icon-cosmic-192.png';
      emblem.width=104;emblem.height=104;emblem.alt='';
      emblem.decoding='async';
      emblem.setAttribute('aria-hidden','true');
      head.append(emblem);
      const actions=document.createElement('div');
      actions.className='spidey-cockpit-hero-actions';
      const explore=document.createElement('a');
      explore.href='#spideyUniverse3D';explore.className='spidey-cockpit-explore';
      explore.textContent='Explorar em 3D';
      const week=document.createElement('button');
      week.type='button';week.className='spidey-cockpit-week';
      week.dataset.premiumView='weeklyView';
      week.textContent='Ver programação';
      actions.append(explore,week);
      head.append(actions);
      const kpis=document.createElement('div');
      kpis.className='spidey-premium-kpis';
      kpis.setAttribute('aria-label','Seleção da agenda');
      kpis.innerHTML='<div class="spidey-premium-kpi"><span>Em destaque</span><strong>'+(focus?1:0)+'</strong><small>Seleção da Home</small></div>'
        +'<div class="spidey-premium-kpi"><span>Outros ativos</span><strong>'+active.length+'</strong><small>Além do destaque</small></div>'
        +'<div class="spidey-premium-kpi"><span>Próximos</span><strong>'+upcoming.length+'</strong><small>Na seleção de eventos</small></div>';
      head.after(kpis);
    }
    const stage=root.querySelector('section[aria-label="Destaque do dia"]');
    if(stage){
      stage.classList.add('spidey-premium-feature-stage');
      const stageTitle=document.createElement('div');
      stageTitle.className='spidey-premium-stage-heading';
      stageTitle.innerHTML='<span class="spidey-premium-stage-icon" aria-hidden="true">✦</span><div><span>'+(focus&&art(focus)?'ARTE PREMIUM & EVENTO':'EVENTO EM DESTAQUE')+'</span><h2>Destaque da agenda</h2></div>';
      stage.prepend(stageTitle);
    }
    const feed=root.querySelector('.player-feed');
    if(feed){
      const nav=document.createElement('nav');
      nav.className='spidey-premium-nav';
      nav.setAttribute('aria-label','Atalhos do aplicativo');
      nav.innerHTML='<div class="spidey-premium-nav-head"><div><span>EXPLORE O SPIDEY</span><h2>Tudo a um toque</h2></div><small>Menu completo no ☰</small></div>'
        +'<div class="spidey-premium-nav-grid">'
        +'<button type="button" data-premium-view="newsView"><span aria-hidden="true">✦</span><strong>Novidades</strong><small>Notícias e eventos</small></button>'
        +'<button type="button" data-premium-view="weeklyView"><span aria-hidden="true">▦</span><strong>Semana</strong><small>Programação</small></button>'
        +'<button type="button" data-premium-view="flyView"><span aria-hidden="true">◈</span><strong>FLY</strong><small>Rotas e fusos</small></button>'
        +'<button type="button" data-premium-view="stampsView"><span aria-hidden="true">◉</span><strong>Selos</strong><small>Coleções</small></button>'
        +'<button type="button" data-premium-view="pvpView"><span aria-hidden="true">⚔</span><strong>PvP</strong><small>Rankings e times</small></button>'
        +'<button type="button" data-premium-view="rocketGuideView"><span aria-hidden="true">R</span><strong>Rocket</strong><small>Guias de batalha</small></button></div>';
      feed.before(nav);
    }
    // A Home REAL (#playerHome) recebe a galeria 3D com eventos aprovados.
    window.SpideyUniverse3D?.mount(root, state.events, focus, now, art, title, time, getBrazilRange);

    // Uma composição: palco principal e console de atalhos à direita no desktop;
    // palco e atalhos empilhados no celular. Mover DOM existente mantém ouvintes.
    const universe=root.querySelector('#spideyUniverse3D');
    const shortcuts=root.querySelector('.spidey-premium-nav');
    const metrics=root.querySelector('.spidey-premium-kpis');
    if(universe&&shortcuts&&metrics){
      const cockpit=document.createElement('section');
      cockpit.className='spidey-command-cockpit';
      cockpit.setAttribute('aria-label','Painel de comando Premium');
      const aside=document.createElement('div');
      aside.className='spidey-command-aside';
      head.insertAdjacentElement('afterend',cockpit);
      cockpit.append(universe,aside);
      aside.append(shortcuts,metrics);
    }else{
      // Sem arte aprovada? O usuário mantém navegação, métricas e conteúdo.
      head.querySelector('.spidey-cockpit-explore')?.remove();
    }

  }
  function mount(){
    const home=document.getElementById('calendarView');if(!home)return;
    const root=document.createElement('section');root.id='playerHome';home.prepend(root);document.body.classList.add('spidey-player-ui');
    document.addEventListener('click',async ev=>{const target=ev.target.closest('[data-premium-view]');if(target){const button=[...document.querySelectorAll('.app-tab[data-view]')].find(item=>item.dataset.view===target.dataset.premiumView);button?.click();if(button)window.scrollTo({top:0,behavior:'instant'});return}const c=ev.target.closest('[data-route-coord]'),f=ev.target.closest('[data-play-fly]'),d=ev.target.closest('[data-play-detail]');if(c){try{await navigator.clipboard.writeText(c.dataset.routeCoord);showToast('Coordenadas copiadas.')}catch{showToast('Não foi possível copiar. As coordenadas estão no card.')}return}if(f){window.SpideyFly?.open(f.dataset.playFly);return}if(d){const e=state.events.find(e=>e.id===d.dataset.playDetail);if(e)openEvent(e)}});
    window.SpideyFlyCore?.loadPoints().then(points=>{worldPoints=points;renderHome()}).catch(()=>{worldError=true;renderHome()});
    window.addEventListener('spideycontentready',renderHome);
    window.addEventListener('spideycontentsettled',()=>{if(!state.events.length)renderHome()});
    renderHome();
    // Sem recarregar toda a Home durante leitura, swipe ou navegação do carrossel.
    setInterval(refreshHomeIfChanged,60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshHomeIfChanged()});
    window.addEventListener('spideyviewchange',event=>{if(event.detail?.to==='calendarView')refreshHomeIfChanged()});
  }
  window.SpideyPlayer=Object.freeze({panel,row,art,image,facts,time,title,source,renderHome,homeSelection,reviewCorrection});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
