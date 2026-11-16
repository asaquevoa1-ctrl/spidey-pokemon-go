/* GO Tour Alola 2027 · peça editorial oficial na Home Premium.
 * Artes: material promocional do anúncio oficial Pokémon GO.
 * Os três eventos reais continuam no catálogo. Nenhuma hora ou coordenada é presumida.
 */
(() => {
  'use strict';
  const SOURCE='https://pokemongo.com/pt-BR/news/save-the-date-go-tour-2027';
  const ART='https://lh3.googleusercontent.com/ZD_ZnJIVRb8a2RWD8L9wF4UR3f0fBAT2ZKk9lLB58yOlXhKOrghIstmijArGABhFlVacGQU56R514Pl0NsA9tTqEpGxbIo4D4oipystojQ=s0-e365';
  const EVENTS=Object.freeze([
    {key:'kaohsiung',id:'2027-go-tour-alola-kaohsiung',flag:'🇹🇼',name:'Kaohsiung',location:'Taiwan',date:'19–21',kind:'Presencial',copy:'Taiwan recebe o GO Tour de 19 a 21 de fevereiro de 2027.'},
    {key:'losangeles',id:'2027-go-tour-alola-los-angeles',flag:'🇺🇸',name:'Los Angeles',location:'Califórnia, EUA',date:'19–21',kind:'Presencial',copy:'Los Angeles recebe o GO Tour de 19 a 21 de fevereiro de 2027.'},
    {key:'global',id:'2027-go-tour-alola-global',flag:'🌎',name:'Global',location:'Mundo todo',date:'27–28',kind:'Mundial',copy:'A grande celebração mundial acontece em 27 e 28 de fevereiro de 2027.'}
  ]);
  let selected=null;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const todayBrazil=()=>{
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
    return parts.year+'-'+parts.month+'-'+parts.day;
  };
  function countdown(){
    const d=todayBrazil(),now=Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10));
    const days=Math.round((Date.UTC(2027,1,19)-now)/86400000);
    if(days>1)return 'Faltam '+days+' dias';
    if(days===1)return 'Começa amanhã';
    if(d<='2027-02-21')return 'Presenciais agora';
    if(d<'2027-02-27')return 'Global em breve';
    if(d<='2027-02-28')return 'Global agora';
    return 'Edição encerrada';
  }
  function detail(item){
    return '<div class="alola-tour-detail" id="alolaTourSelectedDetail" aria-live="polite">'+
      '<div class="alola-tour-detail-heading"><span class="alola-tour-detail-flag" aria-hidden="true">'+escape(item.flag)+'</span>'+
      '<div><small>'+escape(item.kind)+' · '+escape(item.location)+'</small><h3>'+escape(item.name)+'</h3></div>'+
      '<strong>'+escape(item.date)+' <small>FEV</small></strong></div>'+
      '<p>'+escape(item.copy)+'</p><p class="alola-tour-detail-confirm">Horários, ingressos e atividades: mais informações na próxima Temporada.</p>'+
      '<div class="alola-tour-detail-actions"><button type="button" data-alola-open="'+escape(item.id)+'">Ver evento completo <span aria-hidden="true">↗</span></button>'+
      '<a href="'+SOURCE+'" rel="noopener noreferrer" target="_blank">Fonte oficial</a></div>'+
      '<p class="alola-tour-action-status" role="status" aria-live="polite"></p></div>';
  }
  function selection(root){
    root.querySelectorAll('[data-alola-select]').forEach(button=>{
      const yes=button.dataset.alolaSelect===selected;
      button.classList.toggle('is-selected',yes);
      button.setAttribute('aria-expanded',String(yes));
      button.setAttribute('aria-pressed',String(yes));
    });
    const target=root.querySelector('#alolaTourDetailMount');
    if(!target)return;
    target.hidden=!selected;
    target.innerHTML=selected?detail(EVENTS.find(i=>i.key===selected)||EVENTS[0]):'';
  }
  function mount(){
    const home=document.getElementById('playerHome');
    if(!home||home.querySelector('#spideyGoTourAlola2027'))return;
    const root=document.createElement('section');
    root.id='spideyGoTourAlola2027';
    root.className='alola-tour-2027';
    root.setAttribute('aria-labelledby','alolaTour2027Title');
    root.innerHTML='<header class="alola-tour-top">'+
      '<div><span class="alola-tour-eyebrow">✦ PRÓXIMA GRANDE AVENTURA</span>'+
      '<h2 id="alolaTour2027Title">GO Tour <em>Alola 2027</em></h2></div>'+
      '<span class="alola-tour-countdown">'+escape(countdown())+'</span></header>'+
      '<div class="alola-tour-poster">'+
      '<img class="alola-tour-official-art" src="'+ART+'" alt="Arte oficial do Pokémon GO Tour 2027: logotipo Pokémon GO Tour diante de uma praia tropical e placas para Kaohsiung, Los Angeles e Global" loading="lazy" decoding="async" referrerpolicy="no-referrer">'+
      '<div class="alola-tour-art-fallback" hidden><strong>GO TOUR <span>ALOLA</span></strong><small>Fevereiro de 2027 · Kaohsiung · Los Angeles · Global</small></div>'+
      '</div>'+
      '<div class="alola-tour-events-title"><span>ESCOLHA SEU EVENTO</span><small>Datas confirmadas</small></div>'+
      '<div class="alola-tour-cards" role="group" aria-label="Eventos GO Tour Alola 2027">'+EVENTS.map(item=>
        '<button type="button" class="alola-tour-card alola-tour-'+escape(item.key)+'" data-alola-select="'+escape(item.key)+'" aria-controls="alolaTourDetailMount" aria-expanded="false" aria-pressed="false">'+
        '<span class="alola-tour-card-flag" aria-hidden="true">'+escape(item.flag)+'</span>'+
        '<strong>'+escape(item.name)+'</strong>'+
        '<small>'+escape(item.location)+'</small>'+
        '<span class="alola-tour-card-date"><b>'+escape(item.date)+'</b> <span>FEV</span></span>'+
        '</button>').join('')+'</div>'+
      '<div id="alolaTourDetailMount" hidden></div>'+
      '<footer class="alola-tour-bottom"><span>✦ Mais detalhes serão divulgados oficialmente.</span><a href="'+SOURCE+'" target="_blank" rel="noopener noreferrer">Comunicado oficial ↗</a></footer>';
    const img=root.querySelector('.alola-tour-official-art');
    img.addEventListener('error',()=>{
      img.hidden=true;
      root.querySelector('.alola-tour-art-fallback').hidden=false;
      root.querySelector('.alola-tour-poster').classList.add('image-unavailable');
    },{once:true});
    const anchor=home.querySelector('#spideyCalendarPremium')||home.querySelector('.spidey-command-cockpit')||home.querySelector('.player-home-head');
    if(anchor)anchor.insertAdjacentElement('afterend',root);
    else home.prepend(root);
    selection(root);
  }
  document.addEventListener('click',event=>{
    const choose=event.target.closest('#spideyGoTourAlola2027 [data-alola-select]');
    if(choose){
      selected=choose.dataset.alolaSelect===selected?null:choose.dataset.alolaSelect;
      selection(choose.closest('#spideyGoTourAlola2027'));
      return;
    }
    const open=event.target.closest('#spideyGoTourAlola2027 [data-alola-open]');
    if(open&&window.SpideyOpenSharedEvent?.(open.dataset.alolaOpen)!==true){
      const status=open.closest('.alola-tour-detail')?.querySelector('.alola-tour-action-status');
      if(status)status.textContent='Atualizando a agenda. Consulte a fonte oficial enquanto isso.';
    }
  });
  window.addEventListener('spideyhomeupdated',mount);
  window.addEventListener('spideycontentready',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();