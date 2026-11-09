/* Spidey · Semana Selvagem e GO Wild Area Global 2026.
 * Os 64 pontos são referências urbanas da Rota Mundial, nunca ginásios ou spawns verificados.
 * Horários são calculados por timezone IANA para a data de cada sessão.
 */
(() => {
  'use strict';
  const BR='America/Sao_Paulo';
  const WEEK_SOURCE='https://pokemongo.com/news/into-the-wild-2026';
  const GLOBAL_SOURCE='https://pokemongo.com/gowildarea/global';
  const WEEK_IMAGE='https://lh3.googleusercontent.com/xQzYXbxguNWaaSXG5thVM5x44Luvbb5Pi8rPlYSPIV6kePCzoS_5NWzlM0yzNGIVs1NzhXIPLcg2HKS0iuizGsHZUvSS_ZcemC5-i4My5yA=s0-e365';
  const GLOBAL_POSTER='assets/events/premium/wild-area-global-2026-approved-v1.png';
  const STEEL='assets/events/wild-area/official-local-20261102/solid-as-steel.webp';
  const DRAGON='assets/events/wild-area/official-local-20261102/daring-as-dragons.webp';
  const MACHAMP='assets/events/wild-area/official-local-20261102/machamp-jacket.webp';
  const SAFARI='assets/events/wild-area/official-local-20261102/safari-ball.webp';
  const formatter=new Intl.DateTimeFormat('pt-BR',{timeZone:BR,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const weekday=new Intl.DateTimeFormat('pt-BR',{timeZone:BR,weekday:'short'});
  const ESC=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const WEEK_DAYS=[
    {date:'2026-11-09',short:'SEG 09',pokemon:'Zacian Espada Coroada',activity:'Hora de Reides',time:'18h–19h'},
    {date:'2026-11-10',short:'TER 10',pokemon:'Zamazenta Escudo Coroado',activity:'Hora de Reides',time:'18h–19h'},
    {date:'2026-11-11',short:'QUA 11',pokemon:'Registeel Dinamax',activity:'Hora Max',time:'18h–19h'},
    {date:'2026-11-12',short:'QUI 12',pokemon:'Regidrago Dinamax',activity:'Hora Max',time:'18h–19h'},
    {date:'2026-11-13',short:'SEX 13',pokemon:'Latias e Latios Dinamax',activity:'Hora Max',time:'18h–19h'}
  ];
  const GLOBAL_DAYS=[
    {date:'2026-11-14',short:'SÁB 14',pokemon:'Dialga Dinamax · Zekrom · Kyurem Branco',activity:'10h às 18h locais'},
    {date:'2026-11-15',short:'DOM 15',pokemon:'Palkia Dinamax · Reshiram · Kyurem Preto',activity:'10h às 18h locais'}
  ];
  let points=[],loading=false,loadError=false;
  const state={
    wildIntoView:{day:'2026-11-09',mode:'essential'},
    wildGlobalView:{day:'2026-11-14',mode:'essential'}
  };
  function copy(value){
    return (async()=>{
      try{
        if(!navigator.clipboard?.writeText)throw Error('Clipboard indisponível');
        await navigator.clipboard.writeText(value);return true;
      }catch(_){
        const t=document.createElement('textarea');
        t.value=value;t.setAttribute('readonly','');
        t.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
        document.body.append(t);t.select();
        let ok=false;try{ok=document.execCommand('copy')}catch(_){}
        t.remove();return ok;
      }
    })();
  }
  function notify(host,message){
    const el=host.querySelector('[data-wild-feedback]');
    if(el)el.textContent=message;
  }
  function timeLabel(date){
    return formatter.format(date).replace(',','');
  }
  function localDate(day){
    return day.slice(8,10)+'/'+day.slice(5,7);
  }
  function allRows(view,day){
    const core=window.SpideyFlyCore;
    if(!core?.localToDate)return [];
    const clock=view==='wildIntoView'?'18:00':'10:00';
    const until=view==='wildIntoView'?'19:00':'18:00';
    return points.map(p=>{
      const start=core.localToDate(day,clock,p.timezone);
      const end=core.localToDate(day,until,p.timezone);
      return start&&end&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)
        ?{point:p,start,end,coord:p.lat+','+p.lon}:null;
    }).filter(Boolean).sort((a,b)=>a.start-b.start||a.point.order-b.point.order);
  }
  function status(row,now){
    return now>=row.end?'Encerrado':now>=row.start?'Ativo agora':'Em breve';
  }
  function displayRows(view,day){
    const root=document.getElementById(view);
    if(!root)return;
    const container=root.querySelector('[data-wild-route]');
    if(!container)return;
    const mode=state[view].mode,all=allRows(view,day);
    const shown=mode==='all'?all:all.filter(r=>r.point.essential===true);
    const now=new Date();
    const num=all.length;
    let markup='';
    if(loadError){
      markup='<p class="wild-route-error" role="status">Não foi possível carregar as coordenadas agora. A programação continua disponível acima.</p><button type="button" data-wild-retry>Recarregar coordenadas</button>';
    }else if(loading){
      markup='<p class="wild-route-empty" role="status">Carregando coordenadas e horários…</p>';
    }else if(!num){
      markup='<p class="wild-route-error" role="status">Rota Mundial indisponível. Nenhuma coordenada foi inventada.</p>';
    }else{
      const next=all.find(r=>r.end>now);
      const current=all.filter(r=>r.start<=now&&now<r.end);
      markup='<div class="wild-route-summary"><div><strong>'+num+' referências</strong><span>Locais de referência, não Poképaradas confirmadas</span></div>'+
        '<div><strong>'+current.length+' ativos</strong><span>'+(next?'Próxima janela: '+ESC(next.point.flag||'')+' '+ESC(next.point.name)+' · '+ESC(timeLabel(next.start)):'Todas as janelas encerradas')+'</span></div></div>'+
        '<div class="wild-route-actions"><button type="button" class="wild-copy-all" data-wild-copy-all>Copiar todas as '+num+' coordenadas</button>'+
        '<button type="button" class="wild-filter'+(mode==='essential'?' selected':'')+'" data-wild-mode="essential" aria-pressed="'+(mode==='essential')+'">Rota rápida</button>'+
        '<button type="button" class="wild-filter'+(mode==='all'?' selected':'')+'" data-wild-mode="all" aria-pressed="'+(mode==='all')+'">Lista completa ('+num+')</button></div>'+
        '<p class="wild-route-copyhint">A cópia inclui as '+num+' referências, uma por linha, prontas para colar no Data Hub. Horários de Brasília recalculados para a data escolhida.</p>'+
        '<ol class="wild-route-list">'+shown.map(r=>{
          const p=r.point;
          return '<li class="wild-route-item"><span class="wild-route-flag" aria-hidden="true">'+ESC(p.flag||'📍')+'</span>'+
            '<div class="wild-route-city"><strong>'+ESC(p.name)+'</strong><span>Local '+ESC(localDate(day))+' · '+(view==='wildIntoView'?'18h–19h':'10h–18h')+
            ' | Brasília: <b>'+ESC(timeLabel(r.start))+' → '+ESC(timeLabel(r.end))+'</b></span>'+
            '<code>'+ESC(r.coord)+'</code></div>'+
            '<div class="wild-route-item-actions"><small class="wild-window-status" data-status="'+(now>=r.end?'ended':now>=r.start?'active':'future')+'">'+status(r,now)+'</small>'+
            '<button type="button" data-wild-point="'+ESC(String(p.order))+'" aria-label="Copiar coordenada de '+ESC(p.name)+'">Copiar</button></div></li>';
        }).join('')+'</ol>';
    }
    container.innerHTML=markup;
  }
  function dayButtons(view){
    const days=view==='wildIntoView'?WEEK_DAYS:GLOBAL_DAYS;
    return '<div class="wild-day-picker" role="group" aria-label="Escolher dia do evento">'+days.map(d=>
      '<button type="button" data-wild-day="'+d.date+'" aria-pressed="'+(state[view].day===d.date)+'" class="'+(state[view].day===d.date?'selected':'')+'">'+d.short+'</button>').join('')+'</div>';
  }
  function staticWeek(){
    return '<div class="wild-event-hero wild-week-hero">'+
      '<div class="wild-event-copy"><span class="wild-eyebrow">SPIDEY • SEMANA SELVAGEM 2026</span>'+
      '<h1>A aventura <em>começa agora.</em></h1><p>De 9 a 13 de novembro. Reides coroadas, Batalhas Max, pesquisas, Fundo Especial e a preparação para o fim de semana Global.</p>'+
      '<div class="wild-tags"><span>09–13 NOV</span><span>10h de 09/11 → 20h de 13/11 · horário local</span><span>Aço & Dragão</span></div>'+
      '<div class="wild-hero-links"><a href="#wildIntoSchedule">Ver programação</a><a href="#wildIntoRoute">Coordenadas das 18h</a></div></div>'+
      '<figure class="wild-event-art"><img src="'+WEEK_IMAGE+'" alt="Imagem promocional oficial Into the Wild 2026 com Regidrago e Registeel Dinamax" referrerpolicy="no-referrer" loading="eager" decoding="async"><figcaption>Arte oficial Pokémon GO · Semana Selvagem</figcaption></figure></div>'+
      '<div class="wild-feature-grid"><article><strong>Reides 5★</strong><h2>Zacian e Zamazenta coroados</h2><p>Energia Espada Coroada e Escudo Coroado ao derrotá-los. Horas de Reides nas duas primeiras noites.</p></article>'+
      '<article><strong>Batalhas Max 5★</strong><h2>Registeel, Regidrago, Latias e Latios</h2><p>De quarta a sexta, das 18h às 19h locais, cada dia tem seu destaque.</p></article>'+
      '<article><strong>GO Pass • 09–15 NOV</strong><h2>Meltan Dinamax e recompensas</h2><p>GO Pass gratuito e Deluxe; na versão paga, Tampa Prateada. Resgate das recompensas até 17/11 às 23h59 locais.</p></article></div>'+
      '<section id="wildIntoSchedule" class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">AGENDA DA SEMANA</span><h2>O que acontece em cada dia</h2><p>Os horários das horas especiais são sempre <b>18h–19h no fuso local de cada região</b>.</p></div>'+
      '<div class="wild-agenda">'+WEEK_DAYS.map(d=>'<article class="wild-agenda-card"><span>'+d.short+'</span><div><strong>'+ESC(d.pokemon)+'</strong><small>'+ESC(d.activity)+' · '+ESC(d.time)+'</small></div></article>').join('')+'</div></section>'+
      '<section class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">BÔNUS CONFIRMADOS</span><h2>Prepare suas capturas</h2></div>'+
      '<div class="wild-feature-grid compact"><article><h3>30 reides remotas</h3><p>Limite remoto aumentado de 9 a 13/11; sem limite no fim de semana 14–15/11.</p></article>'+
      '<article><h3>Shiny Meltan e Gimmighoul</h3><p>Chance nas Caixas Misteriosa e de Moedas; bônus estendidos até 15/11 às 18h locais.</p></article>'+
      '<article><h3>Fundo Especial</h3><p>Possível em capturas de reides 5★ e Batalhas Max 5★; <b>não é garantido</b>.</p></article></div></section>'+
      '<section id="wildIntoRoute" class="wild-event-section wild-route-shell"><div class="wild-heading"><span class="wild-eyebrow">ROTA MUNDIAL</span>'+
      '<h2>Coordenadas das horas de Reides e Max</h2><p>Selecione um dia. Cada referência indica o início das <b>18h locais</b>, convertido para Brasília, inclusive quando a data no Brasil for diferente.</p></div>'+
      dayButtons('wildIntoView')+'<div data-wild-route></div><p data-wild-feedback class="wild-copy-feedback" role="status" aria-live="polite"></p></section>'+
      '<div class="wild-source"><a href="'+WEEK_SOURCE+'" target="_blank" rel="noopener noreferrer">Programação oficial Pokémon GO</a>'+
      '<button type="button" data-wild-nav="wildGlobalView">Conhecer a Área Selvagem Global</button></div>';
  }
  function staticGlobal(){
    return '<div class="wild-event-hero wild-global-hero">'+
      '<div class="wild-event-copy"><span class="wild-eyebrow">SPIDEY • ÁREA SELVAGEM GLOBAL 2026</span>'+
      '<h1>O mundo inteiro <em>na Área Selvagem.</em></h1><p>14 e 15 de novembro, das 10h às 18h no horário de cada região. Dialga e Palkia Dinamax, Duraludon Gigamax e Pokémon poderosos.</p>'+
      '<div class="wild-tags"><span>14 & 15 NOV</span><span>10h–18h · cada dia · horário local</span><span>Aço & Dragão</span></div>'+
      '<div class="wild-hero-links"><a href="#wildGlobalSchedule">Programação</a><a href="#wildGlobalRoute">Rota das 10h</a></div></div>'+
      '<figure class="wild-event-art"><img src="'+GLOBAL_POSTER+'" alt="Pôster Premium Spidey aprovado para a Área Selvagem Global 2026" loading="eager" decoding="async"><figcaption>Arte Premium Spidey aprovada · preservada no original</figcaption></figure></div>'+
      '<section id="wildGlobalSchedule" class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">DOIS DIAS • DUAS JORNADAS</span><h2>A programação de cada dia</h2></div>'+
      '<div class="wild-global-days"><article><strong>SÁBADO · 14/11</strong><h3>Dialga Dinamax</h3><p>Batalhas Max com Dialga Dinamax e Duraludon Gigamax. Reides com Zekrom e Kyurem Branco.</p>'+
      '<img src="'+STEEL+'" alt="Arte promocional oficial temática do tipo Aço" loading="lazy"></article>'+
      '<article><strong>DOMINGO · 15/11</strong><h3>Palkia Dinamax</h3><p>Batalhas Max com Palkia Dinamax e Duraludon Gigamax. Reides com Reshiram e Kyurem Preto.</p>'+
      '<img src="'+DRAGON+'" alt="Arte promocional oficial temática do tipo Dragão" loading="lazy"></article></div></section>'+
      '<div class="wild-feature-grid"><article><strong>3★ · OS DOIS DIAS</strong><img src="'+MACHAMP+'" alt="Machamp com jaqueta moderna, arte oficial" loading="lazy"><h2>Machamp de jaqueta</h2><p>Disponível nas reides de 3 estrelas de sábado e domingo.</p></article>'+
      '<article><strong>ESTREIA GIGAMAX</strong><h2>Duraludon Gigamax</h2><p>Batalhas Max 6★ durante o evento. Possibilidade de Shiny; pesquisa especial exclusiva para quem tiver ingresso.</p></article>'+
      '<article><strong>CAPTURAS ESPECIAIS</strong><img class="wild-safari-art" src="'+SAFARI+'" alt="Bola Safári GO oficial" loading="lazy"><h2>Bolas Safári GO</h2><p>Ajuda nas capturas dos Pokémon poderosos da natureza. Não confundir com bolas convencionais.</p></article></div>'+
      '<section class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">HORAS TEMÁTICAS</span><h2>Aço e Dragão em rotação</h2><p>As aparições no mapa alternam entre a Hora Aço e a Hora Dragão ao longo de cada dia.</p></div>'+
      '<div class="wild-feature-grid compact"><article><h3>Para todos</h3><p>Pokémon poderosos, reides e Batalhas Max, tarefas e bônus previstos na página oficial.</p></article>'+
      '<article><h3>Com ingresso</h3><p>Pesquisa especial, bônus adicionais e chance aprimorada de encontrar Pokémon Shiny; confira os benefícios do ingresso.</p></article>'+
      '<article><h3>Encontros de Incenso</h3><p>Latias e Latios poderosos no Incenso para portadores de ingresso, exceto Incenso de Aventura Diário.</p></article></div></section>'+
      '<section id="wildGlobalRoute" class="wild-event-section wild-route-shell"><div class="wild-heading"><span class="wild-eyebrow">ROTA MUNDIAL • 10H</span>'+
      '<h2>Do primeiro ao último fuso</h2><p>Escolha 14 ou 15/11 para ver a janela de <b>10h às 18h locais</b> de cada referência e os horários equivalentes em Brasília. A lista respeita a ordem real dos fusos.</p></div>'+
      dayButtons('wildGlobalView')+'<div data-wild-route></div><p data-wild-feedback class="wild-copy-feedback" role="status" aria-live="polite"></p></section>'+
      '<div class="wild-source"><a href="'+GLOBAL_SOURCE+'" target="_blank" rel="noopener noreferrer">Guia oficial do evento Global</a>'+
      '<button type="button" data-wild-nav="wildIntoView">Rever a Semana Selvagem</button>'+
      '<button type="button" data-wild-nav="wildAreaMexicoView">Arquivo: evento presencial do México</button></div>';
  }
  function mount(view){
    const el=document.getElementById(view);
    const root=el?.querySelector(view==='wildIntoView'?'#wildIntoContent':'#wildGlobalContent');
    if(!root)return;
    root.innerHTML=view==='wildIntoView'?staticWeek():staticGlobal();
    displayRows(view,state[view].day);
    root.addEventListener('click',async ev=>{
      const day=ev.target.closest('[data-wild-day]');
      if(day){state[view].day=day.dataset.wildDay;root.querySelectorAll('[data-wild-day]').forEach(b=>{
        const sel=b.dataset.wildDay===state[view].day;
        b.classList.toggle('selected',sel);b.setAttribute('aria-pressed',String(sel));
      });displayRows(view,state[view].day);return;}
      const mode=ev.target.closest('[data-wild-mode]');
      if(mode){state[view].mode=mode.dataset.wildMode;displayRows(view,state[view].day);return;}
      const nav=ev.target.closest('[data-wild-nav]');
      if(nav){document.querySelector('.app-tab[data-view="'+nav.dataset.wildNav+'"]')?.click();return;}
      if(ev.target.closest('[data-wild-retry]')){await loadPoints(true);return;}
      const button=ev.target.closest('[data-wild-copy-all],[data-wild-point]');
      if(!button)return;
      const all=allRows(view,state[view].day);
      const requested=button.dataset.wildPoint;
      const selected=requested?all.find(r=>String(r.point.order)===requested):null;
      if(requested&&!selected)return;
      const payload=selected?selected.coord:all.map(r=>r.coord).join('\n');
      const ok=await copy(payload);
      notify(root,ok?(selected?'Coordenada copiada.':all.length+' coordenadas copiadas para o Data Hub.'):'Não foi possível copiar automaticamente neste navegador.');
    });
  }
  function homeStatus(){
    const now=Date.now();
    if(now>Date.parse('2026-11-15T23:59:59-12:00'))return 'Arquivo dos eventos';
    if(now>=Date.parse('2026-11-14T10:00:00+14:00'))return 'Área Selvagem Global';
    return 'Prepare-se para o Global';
  }
  function mountHome(){
    const home=document.getElementById('playerHome');
    if(!home)return;
    let tile=home.querySelector('#wild2026HomeHub');
    if(tile)return;
    tile=document.createElement('section');
    tile.id='wild2026HomeHub';tile.className='wild-home-hub';
    tile.setAttribute('aria-label','Semana Selvagem e Área Selvagem Global');
    tile.innerHTML='<div class="wild-home-hub-heading"><span>✦ SPIDEY · ESPECIAL NOVEMBRO</span><h2>Da Semana Selvagem ao Global</h2><p>Confira os horários, Pokémon, artes e coordenadas nas duas áreas.</p></div>'+
    '<div class="wild-home-hub-cards"><button type="button" data-wild-nav="wildIntoView"><span>09–13 NOV · AGORA</span><strong>Semana Selvagem</strong><small>Reides e Batalhas Max · Rota das 18h</small></button>'+
    '<button type="button" data-wild-nav="wildGlobalView"><span>14–15 NOV · EM BREVE</span><strong>Área Selvagem Global</strong><small>Dialga, Palkia, Duraludon · Rota das 10h</small></button></div>';
    const anchor=home.querySelector('.spidey-command-cockpit')||home.querySelector('#spideyCalendarPremium')||home.querySelector('.player-home-head');
    if(anchor)anchor.insertAdjacentElement('beforebegin',tile);
    else home.prepend(tile);
    tile.addEventListener('click',ev=>{
      const btn=ev.target.closest('[data-wild-nav]');
      if(btn)document.querySelector('.app-tab[data-view="'+btn.dataset.wildNav+'"]')?.click();
    });
  }
  async function loadPoints(retry=false){
    if(loading)return;
    loading=true;loadError=false;
    for(const view of Object.keys(state))displayRows(view,state[view].day);
    try{
      const data=window.SpideyFlyCore?.loadPoints
        ?await window.SpideyFlyCore.loadPoints()
        :await fetch('data/world-event-points.json',{cache:'no-store'}).then(r=>r.json()).then(x=>x.points.filter(p=>p.current_user_list_20261031===true));
      if(!Array.isArray(data)||data.length!==64)throw Error('Base mundial incompleta');
      points=data;
    }catch(err){
      if(!points.length)loadError=true;
      console.warn('Spidey Wild: referências mundiais indisponíveis',err);
    }finally{
      loading=false;
      for(const view of Object.keys(state))displayRows(view,state[view].day);
    }
  }
  function init(){
    mount('wildIntoView');mount('wildGlobalView');mountHome();
    window.addEventListener('spideyhomeupdated',mountHome);
    loadPoints();
    document.getElementById('wildAreaMexicoView')?.querySelector('.wild-mx-hero-tags')?.insertAdjacentHTML('beforeend','<span>Evento presencial encerrado · 08/11</span>');
  }
  window.SpideyWild2026=Object.freeze({allRows,loadPoints,homeStatus});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
