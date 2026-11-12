/* Spidey · Semana Selvagem e GO Wild Area Global 2026.
 * Os 64 pontos são referências urbanas da Rota Mundial, nunca ginásios ou spawns verificados.
 * Horários são calculados por timezone IANA para a data de cada sessão.
 */
(() => {
  'use strict';
  const BR='America/Sao_Paulo';
  const WEEK_SOURCE='https://pokemongo.com/news/into-the-wild-2026';
  const GLOBAL_SOURCE='https://pokemongo.com/gowildarea/global';
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
        '<p class="wild-route-copyhint">A cópia inclui as '+num+' referências, uma por linha, prontas para colar no Data Hub. Horários de Brasília recalculados para a data escolhida. Créditos: LendáriosBrasil, FlyGPS, PokemonTrail e revisão de horários por Fantasma (lista-base de 2023; fusos recalculados para 2026).</p>'+
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
      '<figure class="wild-event-art wild-week-mosaic" aria-label="Imagens oficiais da temática Aço e Dragão do GO Wild Area">'+
      '<div class="wild-week-mosaic-grid">'+
      '<div class="wild-week-mosaic-panel wild-week-mosaic-panel--steel"><img src="'+STEEL+'" alt="Pokémon do tipo Aço reunidos em cenário do GO Wild Area, imagem promocional oficial" loading="eager" decoding="async"></div>'+
      '<div class="wild-week-mosaic-panel wild-week-mosaic-panel--dragon"><img src="'+DRAGON+'" alt="Pokémon do tipo Dragão em arte promocional oficial do GO Wild Area" loading="eager" decoding="async"></div>'+
      '</div><div class="wild-week-mosaic-mark" aria-hidden="true"><span>9 A 13 DE NOVEMBRO</span><strong>AÇO <i>×</i> DRAGÃO</strong></div>'+
      '<figcaption>Artes oficiais Pokémon GO · temas Aço e Dragão</figcaption></figure></div>'+
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
      '<figure class="wild-event-art"><img src="'+GLOBAL_POSTER+'" alt="Pôster Premium Spidey aprovado para a Área Selvagem Global 2026" loading="eager" decoding="async"><figcaption>Destaque Spidey · GO Wild Area Global</figcaption></figure></div>'+
      '<section id="wildGlobalSchedule" class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">DOIS DIAS • DUAS JORNADAS</span><h2>A programação de cada dia</h2></div>'+
      '<div class="wild-global-days"><article><strong>SÁBADO · 14/11</strong><h3>Dialga Dinamax</h3><p>Batalhas Max com Dialga Dinamax e Duraludon Gigamax. Reides 5★ com Zekrom e Kyurem Branco; reides 3★ com Machamp de jaqueta. Kyurem de reide conhece Glaciar e concede Energia de Fusão.</p>'+
      '<img src="'+GLOBAL_POSTER+'" alt="Pôster aprovado da Área Selvagem Global 2026; programação de sábado com Dialga Dinamax" loading="lazy"></article>'+
      '<article><strong>DOMINGO · 15/11</strong><h3>Palkia Dinamax</h3><p>Batalhas Max com Palkia Dinamax e Duraludon Gigamax. Reides 5★ com Reshiram e Kyurem Preto; reides 3★ com Machamp de jaqueta. Kyurem de reide conhece Glaciar e concede Energia de Fusão.</p>'+
      '<img src="'+GLOBAL_POSTER+'" alt="Pôster aprovado da Área Selvagem Global 2026; programação de domingo com Palkia Dinamax" loading="lazy"></article></div>'+
      '<p class="wild-note">Machamp de jaqueta, Dialga, Palkia, Reshiram, Zekrom, Kyurem e Duraludon Gigamax podem vir com Fundo Especial ao serem capturados em reides ou Batalhas Max; não é garantido.</p></section>'+
      '<div class="wild-feature-grid"><article><strong>3★ · OS DOIS DIAS</strong><img src="'+MACHAMP+'" alt="Machamp com jaqueta moderna, arte oficial" loading="lazy"><h2>Machamp de jaqueta</h2><p>Disponível nas reides de 3 estrelas de sábado e domingo. Ataque em destaque: Golpe de Caratê.</p></article>'+
      '<article><strong>ESTREIA GIGAMAX</strong><h2>Duraludon Gigamax</h2><p>Batalhas Max 6★ durante os dois dias. Possibilidade de Brilhante; a pesquisa especial do ingresso pode conceder um encontro com Fundo Especial.</p></article>'+
      '<article><strong>CAPTURAS ESPECIAIS</strong><img class="wild-safari-art" src="'+SAFARI+'" alt="Bola Safári GO oficial" loading="lazy"><h2>Bolas Safári GO</h2><p>Disponíveis das 10h às 18h locais; desaparecem do inventário ao fim do evento. Capturas podem ser transferidas ao Pokémon HOME e aparecem como Strange Ball.</p></article></div>'+
      '<section class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">HORAS TEMÁTICAS</span><h2>Aço e Dragão em rotação</h2><p>A Hora Sólido como Aço acontece primeiro; depois vem a Hora de Determinação de Dragão. A página oficial confirma a ordem, mas não publica os horários exatos. Leek Duck (fonte comunitária) informa: Aço 10h–11h, 12h–13h, 14h–15h e 16h–17h; Dragão 11h–12h, 13h–14h, 15h–16h e 17h–18h, sempre no horário local.</p></div>'+
      '<div class="wild-feature-grid compact"><article><h3>Hora Sólido como Aço</h3><p>Sandshrew de Alola, Diglett de Alola, Magnemite, Shellder, Onix, Porygon, Shuckle, Skarmory, Nosepass, Aron, Beldum, Piplup, Shieldon, Bronzor, Lucario, Drilbur, Ferroseed, Klink, Stunfisk de Galar, Durant, Rookidee e Tinkatink.</p></article>'+
      '<article><h3>Hora de Determinação de Dragão</h3><p>Charmander, Magikarp, Dratini, Gligar, Trapinch, Swablu, Barboach, Bagon, Gible, Tynamo, Axew, Heatmor, Deino, Skrelp, Tyrunt, Amaura, Goomy, Noibat, Turtonator, Jangmo-o, Sizzlipede e Frigibax.</p></article></div></section>'+
      '<section class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">POKÉMON INCRÍVEIS</span><h2>Encontros diferentes por dia</h2><p>São raros, mais difíceis de capturar e tendem a ter IVs altos e tamanho XL ou XXL. Todos os listados podem ser Brilhantes.</p></div>'+
      '<div class="wild-feature-grid compact"><article><h3>Sábado · 14/11</h3><p>Exeggutor de Alola, Scizor, Flygon, Walrein, Metagross, Empoleon, Magnezone, Conkeldurr e Haxorus.</p></article>'+
      '<article><h3>Domingo · 15/11</h3><p>Azumarill, Kingdra, Aggron, Ferrothorn, Hydreigon, Goodra, Noivern, Tinkaton e Clodsire.</p></article></div></section>'+
      '<section class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">OVOS E INCENSO</span><h2>Encontros adicionais</h2></div>'+
      '<div class="wild-feature-grid compact"><article><h3>Ovos de 10 km</h3><p>Honedge, Klefki, Drampa e Duraludon. A página oficial indica possibilidade de Brilhante.</p></article>'+
      '<article><h3>Incenso · todos</h3><p>Exeggutor de Alola, Azumarill, Scizor, Kingdra, Aggron, Flygon, Empoleon, Magnezone, Conkeldurr e Hydreigon. Exceto Incenso de Aventura Diário.</p></article>'+
      '<article><h3>Incenso · ingresso</h3><p>Além dos encontros gerais: Unown D, I, L e W; Latias e Latios poderosos, que podem ser Brilhantes e fogem rapidamente. Exceto Incenso de Aventura Diário.</p></article></div></section>'+
      '<section class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">ATAQUES EM DESTAQUE</span><h2>Pokémon e golpes</h2><p>Alguns Pokémon encontrados ou evoluídos durante o evento poderão conhecer estes ataques.</p></div>'+
      '<div class="wild-feature-grid compact"><article><p><b>Machamp</b> — Golpe de Caratê<br><b>Flygon</b> — Poder da Terra<br><b>Metagross</b> — Meteoro Esmagador<br><b>Magnezone</b> — Bomba Ímã</p></article>'+
      '<article><p><b>Haxorus</b> — Golpe Deslizante<br><b>Hydreigon</b> — Balanço Violento<br><b>Tinkaton</b> — Martelo Gigatônico</p></article></div></section>'+
      '<section class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">BÔNUS E RECURSOS</span><h2>O que muda com e sem ingresso</h2></div>'+
      '<div class="wild-feature-grid compact"><article><h3>Para todos</h3><p>Até 3 Passes de Reide gratuitos por dia; limite de 1.600 Partículas Max; 3 encontros surpresa de Retrato GO por dia; Jogo em Grupo por 8 horas; chance de Pokémon incríveis nas Rotas; Pesquisa de Campo temática com chance aumentada.</p></article>'+
      '<article><h3>Com ingresso</h3><p>Maior chance de Brilhantes; até 6 Passes de Reide por dia; limite de 3.200 Partículas Max e mais partículas por Pontos de Energia e exploração após coletar as disponíveis; 2× Doces; Incenso 2× mais longo; mais Ovos de 10 km; 6 encontros de Retrato GO por dia; Módulos Atrair por 2 horas.</p></article>'+
      '<article><h3>Trocas com ingresso</h3><p>Das 00h às 23h59 locais nos dois dias: até 6 trocas especiais por dia e metade do custo de Poeira Estelar.</p></article></div></section>'+
      '<section class="wild-event-section"><div class="wild-heading"><span class="wild-eyebrow">PESQUISA E NOVOS RECURSOS</span><h2>Detalhes importantes</h2></div>'+
      '<div class="wild-feature-grid compact"><article><h3>Pesquisa especial</h3><p>O ingresso permite escolher a medalha Aço ou Dragão. Cada caminho concede +1 Doce GG para Treinadores de nível 31+ e +1.000 Poeira Estelar ao capturar Pokémon incríveis do tipo escolhido, do resgate da medalha até 15/11 às 18h locais. Concluir a história concede Duraludon Gigamax com Fundo Especial e uma pose de avatar exclusiva.</p></article>'+
      '<article><h3>Batalhas Dinamax privadas</h3><p>O lobby oferece Grupo privado com código. Efeitos de Aventura de Zacian Coroado (Behemoth Blade) e Zamazenta Coroado (Behemoth Bash) podem ser ativados antes da batalha.</p></article>'+
      '<article><h3>Bolas Safári GO e HOME</h3><p>Todos podem obter Bolas Safári GO em fotodiscos de Ginásios e Poképaradas. Titulares de ingresso recebem Balões de Suprimentos a cada hora. Capturas com essas bolas agora podem ser enviadas ao Pokémon HOME; lá a bola aparece como Strange Ball.</p></article></div></section>'+
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
    // As duas imagens da Semana são arquivos oficiais locais já incluídos na PWA.
    // Evita banner externo quebrado, fallback enganoso e releitura desnecessária.
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
    '<div class="wild-home-hub-cards"><button type="button" data-wild-nav="wildIntoView"><span>09–13 NOV · SEMANA</span><strong>Semana Selvagem</strong><small>Reides e Batalhas Max · Rota das 18h</small></button>'+
    '<button type="button" data-wild-nav="wildGlobalView"><span>14–15 NOV · GLOBAL</span><strong>Área Selvagem Global</strong><small>Dialga, Palkia, Duraludon · Rota das 10h</small></button></div>';
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
    const mexico=document.getElementById('wildAreaMexicoView');
    if(mexico){
      mexico.querySelector('.wild-mx-hero-tags')?.insertAdjacentHTML('beforeend','<span>Evento presencial encerrado · 08/11</span>');
      const intro=mexico.querySelector('.wild-mx-hero-copy > p');
      if(intro)intro.textContent='Evento presencial encerrado em 8 de novembro. Relembre as atividades, confira os selos e consulte o histórico de coordenadas.';
      const previousDetail=mexico.querySelector('[data-wild-detail]');
      if(previousDetail){
        // O evento expirado saiu da agenda ao vivo: não manter um botão morto.
        previousDetail.removeAttribute('data-wild-detail');
        previousDetail.setAttribute('data-wild-stamps','1');
        previousDetail.textContent='Consultar selos';
      }
    }
  }
  window.SpideyWild2026=Object.freeze({allRows,loadPoints,homeStatus});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
