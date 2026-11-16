/* Spidey · GO Tour Alola 2027 — página especial dentro da Home real.
 * Datas da Niantic: https://pokemongo.com/pt-BR/news/save-the-date-go-tour-2027
 * Sem horários, Pokémon, locais exatos, ingressos ou coordenadas inferidos.
 * Os detalhes completos vêm do catálogo; esta vitrine não cria eventos duplicados.
 */
(() => {
  'use strict';
  const OFFICIAL='https://pokemongo.com/pt-BR/news/save-the-date-go-tour-2027';
  const ITEMS=Object.freeze([
    {key:'kaohsiung',id:'2027-go-tour-alola-kaohsiung',flag:'🇹🇼',city:'Kaohsiung',region:'Taiwan',date:'19–21 FEV',kind:'Presencial',note:'Evento presencial confirmado na cidade de Kaohsiung.',zone:'Asia/Taipei'},
    {key:'losangeles',id:'2027-go-tour-alola-los-angeles',flag:'🇺🇸',city:'Los Angeles',region:'Califórnia, EUA',date:'19–21 FEV',kind:'Presencial',note:'Evento presencial confirmado em Los Angeles, Califórnia.',zone:'America/Los_Angeles'},
    {key:'global',id:'2027-go-tour-alola-global',flag:'🌎',city:'Global',region:'Mundo todo',date:'27–28 FEV',kind:'No jogo',note:'Celebração global confirmada para jogadores do mundo todo.',zone:'America/Sao_Paulo'}
  ]);
  let selected='kaohsiung';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dayKey=()=>{
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
    return parts.year+'-'+parts.month+'-'+parts.day;
  };
  const countdown=()=>{
    const d=dayKey();
    const today=Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10));
    const first=Date.UTC(2027,1,19);
    const days=Math.round((first-today)/86400000);
    if(days>1)return 'Faltam '+days+' dias para os eventos presenciais';
    if(days===1)return 'Começa amanhã em Taiwan e Los Angeles';
    if(days===0)return 'Início dos eventos presenciais: 19 de fevereiro';
    if(d<='2027-02-21')return 'Eventos presenciais · 19 a 21 de fevereiro';
    if(d<'2027-02-27')return 'Próximo: evento global em 27 e 28 de fevereiro';
    if(d<='2027-02-28')return 'Fim de semana do GO Tour Global';
    return 'GO Tour Alola 2027 · edição encerrada';
  };
  function detailMarkup(item){
    const city=item.key==='global'?'O evento é mundial; não foi anunciada rota global exclusiva.':'A cidade está confirmada, mas o local exato do evento e as coordenadas ainda não foram anunciados.';
    return '<div class="alola-tour-detail" id="alolaTourSelectedDetail" aria-live="polite">'+
      '<span class="alola-tour-overline">'+esc(item.flag)+' '+esc(item.kind.toUpperCase())+' · '+esc(item.region)+'</span>'+
      '<h3>'+esc(item.city)+'</h3>'+
      '<p class="alola-tour-period">'+esc(item.date)+' <span>2027</span></p>'+
      '<p>'+esc(item.note)+'</p>'+
      '<div class="alola-tour-detail-facts"><div><small>Horários</small><strong>A confirmar</strong></div>'+
      '<div><small>Ingressos e bônus</small><strong>Próxima Temporada</strong></div></div>'+
      '<p class="alola-tour-coordinates">'+esc(city)+'</p>'+
      '<p class="alola-tour-fact-note">A Niantic divulgará mais informações e detalhes de ingressos na próxima Temporada. Pokémon especiais, fundos e bônus ainda não foram anunciados.</p>'+
      '<div class="alola-tour-detail-actions"><button type="button" data-alola-open="'+esc(item.id)+'">Abrir ficha no Spidey</button>'+
      '<a href="'+OFFICIAL+'" target="_blank" rel="noopener noreferrer">Anúncio oficial</a></div>'+
      '<p class="alola-tour-action-status" role="status" aria-live="polite"></p></div>';
  }
  function renderSelection(root){
    root.querySelectorAll('[data-alola-select]').forEach(button=>{
      const active=button.dataset.alolaSelect===selected;
      button.classList.toggle('is-selected',active);
      button.setAttribute('aria-pressed',String(active));
    });
    const mount=root.querySelector('#alolaTourDetailMount');
    const item=ITEMS.find(i=>i.key===selected)||ITEMS[0];
    if(mount)mount.innerHTML=detailMarkup(item);
  }
  function mount(){
    const home=document.getElementById('playerHome');
    if(!home||home.querySelector('#spideyGoTourAlola2027'))return;
    const section=document.createElement('section');
    section.id='spideyGoTourAlola2027';
    section.className='alola-tour-2027';
    section.setAttribute('aria-labelledby','alolaTour2027Title');
    section.innerHTML='<div class="alola-tour-hero">'+
      '<img src="assets/events/go-tour-alola-2027.svg" alt="Praia tropical de Alola ao pôr do sol, com mar azul, ilhas e palmeiras" loading="lazy" decoding="async" class="alola-tour-art">'+
      '<div class="alola-tour-hero-copy">'+
      '<span class="alola-tour-eyebrow">✦ SPIDEY · ESPECIAL 2027</span>'+
      '<span class="alola-tour-state">DATAS OFICIAIS CONFIRMADAS</span>'+
      '<h2 id="alolaTour2027Title">GO Tour <em>Alola</em></h2>'+
      '<p>Três grandes celebrações. Duas cidades presenciais e um evento global.</p>'+
      '<span class="alola-tour-countdown" id="alolaTourCountdown">'+esc(countdown())+'</span>'+
      '</div></div>'+
      '<div class="alola-tour-content"><div class="alola-tour-intro"><div><span class="alola-tour-overline">ESCOLHA SEU EVENTO</span><h3>Onde será sua próxima aventura?</h3></div><p>Selecione uma região para conferir o que já foi confirmado. Nada de horários ou coordenadas inventados.</p></div>'+
      '<div class="alola-tour-cards" role="group" aria-label="Escolher evento GO Tour Alola">'+ITEMS.map(i=>
        '<button type="button" class="alola-tour-card alola-tour-'+esc(i.key)+'" data-alola-select="'+esc(i.key)+'" aria-pressed="false">'+
        '<span class="alola-tour-card-kind">'+esc(i.flag)+' '+esc(i.kind)+'</span>'+
        '<strong>'+esc(i.city)+'</strong><span class="alola-tour-card-region">'+esc(i.region)+'</span>'+
        '<span class="alola-tour-card-date">'+esc(i.date)+' <small>2027</small></span></button>'
      ).join('')+'</div><div id="alolaTourDetailMount"></div>'+
      '<p class="alola-tour-source">Fonte: comunicado oficial do Pokémon GO. As informações poderão ser atualizadas conforme novos anúncios.</p></div>';
    const anchor=home.querySelector('#spideyCalendarPremium')||home.querySelector('.spidey-command-cockpit')||home.querySelector('.player-home-head');
    if(anchor)anchor.insertAdjacentElement('afterend',section);
    else home.append(section);
    renderSelection(section);
  }
  document.addEventListener('click',event=>{
    const choose=event.target.closest('#spideyGoTourAlola2027 [data-alola-select]');
    if(choose){selected=choose.dataset.alolaSelect;renderSelection(choose.closest('#spideyGoTourAlola2027'));return;}
    const open=event.target.closest('#spideyGoTourAlola2027 [data-alola-open]');
    if(open){
      const success=window.SpideyOpenSharedEvent?.(open.dataset.alolaOpen)===true;
      if(!success){
        const status=open.closest('.alola-tour-detail')?.querySelector('.alola-tour-action-status');
        if(status)status.textContent='Ficha ainda não carregada. Aguarde a sincronização da agenda ou consulte o anúncio oficial.';
      }
    }
  });
  window.addEventListener('spideyhomeupdated',mount);
  window.addEventListener('spideycontentready',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();