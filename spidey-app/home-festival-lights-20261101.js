/* Home Premium — Festival das Luzes 2026 (exclusivo da Índia).
 * Mantém o pôster aprovado e abre o evento já existente no aplicativo.
 * Fonte factual: pokemongo.com/en/news/festival-of-lights-2026
 */
(() => {
  'use strict';
  const ID='festival-of-lights-2026-pokeminers-e2';
  const RESEARCH_START=Date.parse('2026-11-01T06:00:00+05:30');
  const EVENT_START=Date.parse('2026-11-06T10:00:00+05:30');
  const EVENT_END=Date.parse('2026-11-08T20:00:00+05:30');
  const OFFICIAL='https://pokemongo.com/en/news/festival-of-lights-2026';
  // Fallback factual da versão publicada do evento: a Home não depende
  // do catálogo dinâmico, que pode estar atrasado no Pages/PWA.
  // Não cria evento adicional no calendário, só mantém o destaque e detalhes.
  const APPROVED_EVENT=Object.freeze({
    id:ID,slug:'festival-das-luzes-2026-india',status:'published',
    title:'Festival das Luzes 2026 • Pikachu com saree e Pikachu com kurta',
    summary:'Evento exclusivo da Índia com Pikachu usando sari ou kurta e chance de Fundo Especial.',
    category:'evento_especial',
    source:{name:'Pokémon GO',url:OFFICIAL,confidence:'official'},
    art:{url:'assets/festival-das-luzes-approved.png',alt:'Arte Spidey do Festival das Luzes 2026',
      standard:'spidey-premium-v1'},
    schedule:{
      local_timezone:'Asia/Kolkata',
      start_local:'2026-11-06T10:00:00+05:30',
      end_local:'2026-11-08T20:00:00+05:30',
      brazil_timezone:'America/Sao_Paulo',
      start_brazil:'2026-11-06T01:30:00-03:00',
      end_brazil:'2026-11-08T11:30:00-03:00'
    },
    locations:[{label:'Índia • referência geográfica',latitude:20.5937,longitude:78.9629,
      coordinate_type:'country_reference',copyable:true}],
    pokemon:[
      {name:'Pikachu com saree',note:'Pode ser Brilhante; possível fundo especial'},
      {name:'Pikachu com kurta',note:'Pode ser Brilhante; possível fundo especial'}
    ],
    bonuses:['Duração triplicada dos Módulos Atrair',
      'Adesivos de evento em Poképaradas na Índia'],
    notes:['Evento exclusivo da Índia, 6 a 8 de novembro.',
      'Pesquisa temporária ramificada desde 01/11 às 06h, horário da Índia.',
      'A coordenada da Índia é apenas referência geográfica, não rota GPX.'],
    gpx:{enabled:false,reason:'Nenhum local específico de Poképarada confirmado.'}
  });


  function phase(now=new Date()) {
    const time=+now;
    if(!Number.isFinite(time) || time<RESEARCH_START || time>=EVENT_END) return 'hidden';
    return time<EVENT_START?'research':'festival';
  }
  const element=(tag,cls,text)=>{
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(text!==undefined)el.textContent=text;
    return el;
  };
  let card=null, selectedPhase='';
  function lookup() {
    try {
      if(typeof state!=='undefined' && Array.isArray(state.events)) {
        const event=state.events.find(item=>item.id===ID);
        // Não anunciar evento revogado se uma atualização oficial o cancelou.
        if(event && event.status!=='published')return null;
        if(event)return event;
      }
    }catch(_){} // Sem catálago inicial, usa o evento aprovado embarcado.
    return APPROVED_EVENT;
  }
  function place() {
    const home=document.getElementById('calendarView');
    const feature=home?.querySelector('#nowExperience')?.closest('.experience-section');
    if(!home)return false;
    const placement=feature||home.querySelector('.experience-intro');
    if(!placement)return false;
    if(card?.isConnected)return true;
    const section=element('section','festival-lights-home');
    section.id='festivalLightsHome';
    section.setAttribute('aria-label','Festival das Luzes 2026 na Índia');
    section.hidden=true;
    const banner=element('div','festival-lights-head');
    const kicker=element('span','festival-lights-eyebrow','SPIDEY PREMIUM · EVENTO REGIONAL');
    const region=element('span','festival-lights-region','🇮🇳 EXCLUSIVO DA ÍNDIA');
    banner.append(kicker,region);
    const body=element('div','festival-lights-body');
    const poster=element('div','festival-lights-poster');
    const img=document.createElement('img');
    img.src='assets/festival-das-luzes-approved.png';
    img.alt='Arte Premium aprovada do Festival das Luzes 2026';
    img.loading='lazy';img.decoding='async';
    img.addEventListener('error',()=>{poster.classList.add('festival-lights-no-poster');img.remove();},{once:true});
    poster.append(img);
    const copy=element('div','festival-lights-copy');
    const title=element('h2','','Festival das Luzes');
    const subtitle=element('p','festival-lights-subtitle','Pikachu de saree e Pikachu de kurta ✨');
    const status=element('span','festival-lights-status','');
    status.id='festivalLightsStatus';
    status.setAttribute('role','status');
    const stateCopy=element('p','festival-lights-state-copy','');
    stateCopy.id='festivalLightsStateCopy';
    copy.append(title,subtitle,status,stateCopy);
    body.append(poster,copy);
    const dates=element('div','festival-lights-dates');
    const local=element('div','festival-lights-time');
    local.append(element('span','','HORÁRIO NA ÍNDIA'),element('strong','','06/11, 10h → 08/11, 20h'));
    const brazil=element('div','festival-lights-time');
    brazil.append(element('span','','HORÁRIO DE BRASÍLIA'),element('strong','','06/11, 01h30 → 08/11, 11h30'));
    dates.append(local,brazil);
    const research=element('p','festival-lights-research',
      'Pesquisa ramificada liberada em 01/11 às 6h (Índia) · 31/10 às 21h30 (Brasília). Prazo final: consulte no jogo.');
    const actionRow=element('div','festival-lights-actions');
    const open=element('button','festival-lights-open','Explorar evento');
    open.type='button';
    open.addEventListener('click',()=>{
      const event=lookup();
      if(event&&typeof openEvent==='function')openEvent(event);
      else {
        // Não redirecionar o botão principal para fora do Spidey.
        card.querySelector('#festivalLightsStatus').textContent='Confira os detalhes no Calendário.';
      }
    });
    const official=element('a','festival-lights-source','Fonte oficial');
    official.href=OFFICIAL;official.target='_blank';official.rel='noopener noreferrer';
    actionRow.append(open,official);
    section.append(banner,body,dates,research,actionRow);
    placement.insertAdjacentElement('afterend',section);
    card=section;
    return true;
  }
  function render(now=new Date()) {
    if(!place())return;
    const event=lookup(),current=phase(now);
    // Se o catálogo estiver ausente ou defasado, não esconda o destaque.
    // A janela de visibilidade é definida pelas datas aprovadas acima.
    const show=Boolean(event)&&current!=='hidden';
    card.hidden=!show;
    if(!show)return;
    if(selectedPhase!==current){
      selectedPhase=current;
      card.dataset.phase=current;
      card.querySelector('#festivalLightsStatus').textContent=current==='research'
        ?'PESQUISA DISPONÍVEL DESDE 01/11':'FESTIVAL EM ANDAMENTO';
      card.querySelector('#festivalLightsStateCopy').textContent=current==='research'
        ?'Pesquisa temporária com escolha entre dois Pikachu. Evento principal de 6 a 8 de novembro.'
        :'Reides com os dois Pikachu e Sparkle O’Clock às 18h, 18h30, 19h e 19h30 (horário da Índia).';
    }
  }
  const mount=()=>{
    render();
    window.addEventListener('spideycontentready',()=>render());
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
    // Revalida a fase sem atualizar layouts a cada segundo.
    window.setInterval(()=>{if(!document.hidden)render();},60000);
  };
  window.SpideyFestivalLights=Object.freeze({phase,render,RESEARCH_START,EVENT_START,EVENT_END});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();