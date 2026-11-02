/* Spidey Premium — calendário mensal editorial na Home real.
   Camada progressiva: o calendário anterior permanece como fallback.
   Mantém o catálogo, a navegação de detalhe e as artes aprovadas intactos. */
(() => {
  'use strict';
  const TZ = 'America/Sao_Paulo';
  const labelMonth = new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC',month:'long',year:'numeric'});
  const labelDate = new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long'});
  const labelClock = new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hour12:false});
  const categories = [
    {id:'all',label:'Todos'},
    {id:'local',label:'Regionais'},
    {id:'raids',label:'Reides'}
  ];
  const ui={month:'',selected:'',filter:'all',expanded:false};
  function make(tag,cls,content) {
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    if(content!==undefined)el.textContent=content;
    return el;
  }
  function dateKey(date) {
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'})
      .formatToParts(date).filter(p=>p.type!=='literal');
    const x=Object.fromEntries(parts.map(p=>[p.type,p.value]));
    return x.year+'-'+x.month+'-'+x.day;
  }
  function utcDate(key) {return new Date(key+'T12:00:00Z');}
  function monthStart(key) {return key.slice(0,7);}
  function monthDays(month) {
    if(!/^\d{4}-\d{2}$/.test(month))return [];
    const [y,m]=month.split('-').map(Number);
    if(m<1||m>12)return [];
    const first=new Date(Date.UTC(y,m-1,1,12));
    const offset=first.getUTCDay();
    return Array.from({length:42},(_,i)=>{
      const d=new Date(Date.UTC(y,m-1,1-offset+i,12));
      const key=d.toISOString().slice(0,10);
      return {key,day:d.getUTCDate(),inside:monthStart(key)===month};
    });
  }
  function events(){try{return Array.isArray(state.events)?state.events:[]}catch(_){return []}}
  function choose(key,mode=ui.filter){
    return window.SpideyCalendarPremium?.choose?.(events(),key,mode)||[];
  }
  function eventTime(event,key){
    const s=event.schedule||{};
    if(s.precision==='date')return 'Data confirmada · horário a confirmar';
    if(Array.isArray(s.sessions)&&s.sessions.length){
      const actual=s.sessions.map(x=>({start:new Date(x.start),end:new Date(x.end)}))
        .find(x=>Number.isFinite(+x.start)&&Number.isFinite(+x.end)&&
          dateKey(x.start)<=key&&key<=dateKey(new Date(x.end.getTime()-1)));
      if(actual)return 'Sessão às '+labelClock.format(actual.start)+' (Brasília)';
    }
    const start=new Date(s.start_brazil||s.start_local||'');
    const end=new Date(s.end_brazil||s.end_local||'');
    if(!Number.isFinite(+start))return 'Horário a confirmar';
    if(dateKey(start)<key&&Number.isFinite(+end))return 'Em andamento';
    return 'Começa às '+labelClock.format(start)+' (Brasília)';
  }
  function approvedPoster(event){
    const master=window.SPIDEY_APPROVED_ART_MASTER?.[event?.id];
    if(!master?.file||event?.presentation?.hide_poster_until_corrected===true||
      window.SPIDEY_UNAVAILABLE_ART?.[master.file])return '';
    return window.SpideyPlayer?.art?.(event)||'';
  }
  function card(event,key){
    const btn=make('button','spidey-month-event');
    btn.type='button';
    btn.dataset.playDetail=event.id;
    btn.setAttribute('aria-label','Ver detalhes de '+(event.public_title||event.title));
    const poster=make('span','spidey-month-event-poster');
    const src=approvedPoster(event);
    if(src){
      const img=document.createElement('img');
      img.src=src;img.loading='lazy';img.decoding='async';
      img.alt='Arte Premium de '+(event.public_title||event.title);
      img.addEventListener('error',()=>{img.remove();poster.classList.add('without-art');});
      poster.append(img);
    }else{
      poster.classList.add('without-art');
      poster.append(make('strong','',key.slice(-2)),make('small','',key.slice(5,7)));
    }
    const label=window.SpideyCalendarPremium?.isRegional?.(event)?'REGIONAL':
      window.SpideyCalendarPremium?.isRaid?.(event)?'REIDES':'EVENTO';
    const info=make('span','spidey-month-event-copy');
    info.append(make('small','spidey-month-event-type',label),
      make('strong','spidey-month-event-name',event.public_title||event.title),
      make('span','spidey-month-event-time',eventTime(event,key)));
    const arrow=make('span','spidey-month-event-arrow','›');
    arrow.setAttribute('aria-hidden','true');
    btn.append(poster,info,arrow);
    return btn;
  }
  function mount(){
    const home=document.getElementById('playerHome');
    if(!home)return null;
    let root=home.querySelector('#spideyMonthPremium');
    if(root)return root;
    root=make('section','spidey-month-premium');
    root.id='spideyMonthPremium';
    root.setAttribute('aria-label','Calendário mensal Premium');
    const heading=make('div','spidey-month-heading');
    const title=make('div','spidey-month-heading-copy');
    title.append(make('span','spidey-month-eyebrow','SPIDEY · CALENDÁRIO'),
      make('h2','','O mês em jogo'),
      make('p','','Explore as datas e descubra o que vem por aí.'));
    const today=make('button','spidey-month-today','Ir para hoje');
    today.type='button';today.dataset.monthToday='1';
    heading.append(title,today);
    const nav=make('div','spidey-month-nav');
    const prev=make('button','spidey-month-arrow','‹');
    prev.type='button';prev.dataset.monthShift='-1';prev.setAttribute('aria-label','Mês anterior');
    const text=make('strong','spidey-month-title');
    text.setAttribute('aria-live','polite');
    const next=make('button','spidey-month-arrow','›');
    next.type='button';next.dataset.monthShift='1';next.setAttribute('aria-label','Próximo mês');
    nav.append(prev,text,next);
    const weekdays=make('div','spidey-month-weekdays');
    weekdays.setAttribute('aria-hidden','true');
    for(const name of ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'])weekdays.append(make('span','',name));
    const grid=make('div','spidey-month-grid');
    grid.setAttribute('role','group');
    grid.setAttribute('aria-label','Escolher uma data');
    const info=make('div','spidey-month-summary');
    const filters=make('div','spidey-month-filters');
    filters.setAttribute('role','group');filters.setAttribute('aria-label','Filtrar eventos no dia');
    const dateTitle=make('div','spidey-month-date-heading');
    const status=make('p','spidey-month-status');
    status.setAttribute('role','status');
    const cards=make('div','spidey-month-cards');
    const footer=make('div','spidey-month-footer');
    root.append(heading,nav,weekdays,grid,info,filters,dateTitle,status,cards,footer);
    const after=home.querySelector('#spideyCalendarPremium')||
      home.querySelector('.spidey-command-cockpit');
    if(after)after.insertAdjacentElement('afterend',root);else home.append(root);
    root.addEventListener('click',e=>{
      const day=e.target.closest('[data-month-day]');
      if(day){ui.selected=day.dataset.monthDay;ui.expanded=false;render();return;}
      const shift=e.target.closest('[data-month-shift]');
      if(shift){
        const delta=Number(shift.dataset.monthShift);
        const [y,m]=ui.month.split('-').map(Number);
        const d=new Date(Date.UTC(y,m-1+delta,1,12));
        const nextMonth=d.toISOString().slice(0,7);
        if(nextMonth<monthStart(dateKey(new Date())))return;
        ui.month=nextMonth;
        const first=monthDays(ui.month).find(x=>x.inside&&choose(x.key,'all').length);
        ui.selected=first?.key||ui.month+'-01';
        ui.expanded=false;render();return;
      }
      if(e.target.closest('[data-month-today]')){
        ui.selected=dateKey(new Date());ui.month=monthStart(ui.selected);
        ui.expanded=false;render();return;
      }
      const filter=e.target.closest('[data-month-filter]');
      if(filter){ui.filter=filter.dataset.monthFilter;ui.expanded=false;render();return;}
      if(e.target.closest('[data-month-more]')){ui.expanded=true;render();}
      // Botões [data-play-detail] usam a abertura nativa do Spidey.
    });
    const legacy=document.getElementById('calendar')?.closest('.section');
    if(legacy&&legacy.parentElement?.id==='calendarView'){
      legacy.classList.add('spidey-premium-legacy-month');
      document.body.classList.add('spidey-month-premium-ready');
    }
    return root;
  }
  function render(now=new Date()){
    const root=mount();
    if(!root)return false;
    const today=dateKey(now);
    if(!ui.month){ui.month=monthStart(today);ui.selected=today;}
    if(!ui.selected.startsWith(ui.month))ui.selected=ui.month+'-01';
    const all=monthDays(ui.month),current=monthStart(today);
    root.querySelector('.spidey-month-title').textContent=labelMonth.format(utcDate(ui.month+'-01'));
    const prev=root.querySelector('[data-month-shift="-1"]');
    prev.disabled=ui.month<=current;
    const grid=root.querySelector('.spidey-month-grid');
    grid.replaceChildren(...all.map(day=>{
      if(!day.inside){
        const blank=make('span','spidey-month-day outside',String(day.day));
        blank.setAttribute('aria-hidden','true');return blank;
      }
      const items=choose(day.key);
      const btn=make('button','spidey-month-day');
      btn.type='button';btn.dataset.monthDay=day.key;
      if(day.key===today)btn.classList.add('today');
      if(day.key===ui.selected)btn.classList.add('selected');
      if(items.length)btn.classList.add('has-events');
      btn.setAttribute('aria-pressed',String(day.key===ui.selected));
      btn.setAttribute('aria-label',day.day+'/'+day.key.slice(5,7)+
        (day.key===today?' hoje':'')+', '+items.length+' evento'+(items.length===1?'':'s'));
      const number=make('strong','',String(day.day));
      const count=make('small','',items.length?String(items.length):'');
      btn.append(number,count);return btn;
    }));
    const monthKeys=all.filter(day=>day.inside).map(day=>day.key);
    const unique=new Set(monthKeys.flatMap(key=>choose(key,'all').map(e=>e.id)));
    const daysWith=monthKeys.filter(key=>choose(key,'all').length).length;
    const summary=root.querySelector('.spidey-month-summary');
    summary.replaceChildren(make('span','','✦ '+unique.size+' eventos no mês'),
      make('span','','◷ '+daysWith+' dias com programação'));
    const filters=root.querySelector('.spidey-month-filters');
    filters.replaceChildren(...categories.map(mode=>{
      const btn=make('button','spidey-month-filter',mode.label);
      btn.type='button';btn.dataset.monthFilter=mode.id;
      btn.setAttribute('aria-pressed',String(mode.id===ui.filter));
      if(mode.id===ui.filter)btn.classList.add('selected');
      return btn;
    }));
    root.querySelector('.spidey-month-date-heading').textContent=
      labelDate.format(utcDate(ui.selected));
    const list=choose(ui.selected);
    const noun=ui.filter==='local'?'regionais':ui.filter==='raids'?'de reides':'';
    root.querySelector('.spidey-month-status').textContent=events().length?
      list.length+' evento'+(list.length===1?'':'s')+' '+noun+' nesta data':
      'Carregando a programação…';
    const cards=root.querySelector('.spidey-month-cards');
    if(list.length){
      cards.replaceChildren(...list.slice(0,ui.expanded?list.length:4).map(e=>card(e,ui.selected)));
    }else{
      cards.replaceChildren(make('p','spidey-month-empty',
        events().length?'Nenhum evento deste filtro nesta data. Escolha outro dia.':
          'Os eventos aparecem aqui quando a agenda carregar.'));
    }
    const footer=root.querySelector('.spidey-month-footer');
    footer.replaceChildren();
    if(list.length>4&&!ui.expanded){
      const more=make('button','spidey-month-more','Ver mais '+(list.length-4)+' eventos');
      more.type='button';more.dataset.monthMore='1';footer.append(more);
    }
    return true;
  }
  window.SpideyMonthPremium=Object.freeze({dateKey,monthDays,eventTime,render});
  function start(){
    render();
    window.addEventListener('spideycontentready',()=>render());
    window.addEventListener('spideyhomeupdated',()=>render());
    window.addEventListener('spideyviewchange',e=>{if(e.detail?.to==='calendarView')render();});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();