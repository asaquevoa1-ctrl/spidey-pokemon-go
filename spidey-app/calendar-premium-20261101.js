/* Spidey · Agenda Premium de 7 dias — Home REAL (#playerHome).
   Nunca substitui o calendário completo ou a galeria Explorar 3D.
   Pôsteres: somente artes já aprovadas; horários: calendário de Brasília.
*/
(() => {
  'use strict';
  const TZ='America/Sao_Paulo';
  const clock=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'});
  const weekday=new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC',weekday:'short'});
  const month=new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC',month:'short'});
  const startLabel=new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false});
  const modes=Object.freeze([
    {id:'all',label:'Todos'},
    {id:'local',label:'Regionais'},
    {id:'raids',label:'Reides'}
  ]);
  const view={selected:'',mode:'all',expanded:false,seenDate:''};
  const node=(tag,cls,txt)=>{
    const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;
  };
  function brazilKey(date){
    if(!(date instanceof Date)||!Number.isFinite(date.getTime()))return '';
    const p=Object.fromEntries(clock.formatToParts(date).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    return p.year+'-'+p.month+'-'+p.day;
  }
  function dayAt(key){
    if(!/^\d{4}-\d\d-\d\d$/.test(key))return null;
    const d=new Date(key+'T12:00:00Z');
    return Number.isFinite(d.getTime())?d:null;
  }
  function weekDays(now=new Date()){
    const key=brazilKey(now),base=dayAt(key);
    if(!base)return[];
    return Array.from({length:7},(_,i)=>{
      const d=new Date(base.getTime()+i*86400000);
      const day=d.toISOString().slice(0,10);
      return {key:day,day:String(d.getUTCDate()).padStart(2,'0'),
        weekday:weekday.format(d).replace('.',''),month:month.format(d).replace('.',''),today:i===0};
    });
  }
  function range(event){
    const s=event?.schedule||{};
    // Datas sem horário só prevalecem quando a precisão é realmente "date".
    // Eventos com sessões (ex.: Singapura) devem respeitar cada horário em Brasília.
    if(s.precision==='date'){
      return {dates:true,first:s.start_date,last:s.end_date};
    }
    if(Array.isArray(s.sessions)&&s.sessions.length){
      const sessions=s.sessions.map(x=>({start:new Date(x.start),end:new Date(x.end)}))
        .filter(x=>Number.isFinite(+x.start)&&Number.isFinite(+x.end));
      if(sessions.length)return {sessions};
    }
    const start=new Date(s.start_brazil||s.start_local||'');
    const end=new Date(s.end_brazil||s.end_local||'');
    if(Number.isFinite(+start)&&Number.isFinite(+end))return {start,end};
    if(s.start_date&&s.end_date)return {dates:true,first:s.start_date,last:s.end_date};
    return {start,end};
  }
  function covers(event,key){
    if(!event||event.status!=='published'||event.content_type==='news'||!key)return false;
    const r=range(event);
    if(r.dates)return Boolean(r.first&&r.last&&r.first<=key&&key<=r.last);
    const periods=r.sessions||[r];
    return periods.some(({start,end})=>{
      if(!(start instanceof Date)||!(end instanceof Date)||!Number.isFinite(+start)||!Number.isFinite(+end)||end<=start)return false;
      return brazilKey(start)<=key&&key<=brazilKey(new Date(end.getTime()-1));
    });
  }
  function isRegional(event){
    return ['regional_event','local_event','city_safari'].includes(event.category) ||
      Boolean(event.regional_exclusive===true);
  }
  function isRaid(event){
    return ['raid_hour','raid_day','raid_rotation','mega_raid_rotation','shadow_raids'].includes(event.category);
  }
  function choose(events,key,mode='all'){
    const items=(Array.isArray(events)?events:[]).filter(e=>covers(e,key)&&
      (mode==='local'?isRegional(e):mode==='raids'?isRaid(e):true));
    // Primeiro os eventos que começam no dia; depois os que já estavam em andamento.
    // Para sessões recorrentes vale o início da sessão do dia escolhido.
    const byEvent=new Map(items.map(event=>{
      const r=range(event);
      const session=r.sessions?.find(s=>
        brazilKey(s.start)<=key&&key<=brazilKey(new Date(s.end.getTime()-1)));
      const start=r.dates?dayAt(r.first):(session?.start||r.sessions?.[0]?.start||r.start);
      return [event,{
        startsToday:(r.dates?r.first:brazilKey(start))===key,
        moment:Number.isFinite(+start)?+start:0
      }];
    }));
    return items.sort((a,b)=>{
      const x=byEvent.get(a),y=byEvent.get(b);
      if(x.startsToday!==y.startsToday)return x.startsToday?-1:1;
      const timing=x.startsToday?x.moment-y.moment:y.moment-x.moment;
      return timing||
        Number(Boolean(window.SPIDEY_APPROVED_ART_MASTER?.[b.id]))-
        Number(Boolean(window.SPIDEY_APPROVED_ART_MASTER?.[a.id]))||
        String(a.title).localeCompare(String(b.title),'pt-BR');
    });
  }
  function eventTime(e,key){
    const r=range(e);
    if(r.dates)return 'Datas anunciadas · confira os horários no evento';
    if(r.sessions?.length){
      const session=r.sessions.find(x=>brazilKey(x.start)<=key&&key<=brazilKey(new Date(x.end-1)))||r.sessions[0];
      return 'Sessão: '+startLabel.format(session.start)+' (Brasília)';
    }
    if(!Number.isFinite(+r.start))return 'Horário a confirmar';
    if(brazilKey(r.start)<key&&Number.isFinite(+r.end)){
      return 'Em andamento · até '+startLabel.format(r.end)+' (Brasília)';
    }
    return 'Início: '+startLabel.format(r.start)+' (Brasília)';
  }
  function approvedArt(e){
    if(!window.SPIDEY_APPROVED_ART_MASTER?.[e?.id]||
       e?.presentation?.hide_poster_until_corrected===true)return null;
    return window.SpideyPlayer?.art?.(e)||null;
  }
  function eventCard(e,key){
    const btn=node('button','spidey-agenda-event');
    btn.type='button';btn.dataset.playDetail=e.id;
    btn.setAttribute('aria-label','Abrir evento: '+(e.public_title||e.title));
    const poster=node('div','spidey-agenda-poster');
    const img=approvedArt(e);
    if(img){
      const image=document.createElement('img');image.src=img;
      image.alt='Arte aprovada de '+(e.public_title||e.title);
      image.loading='lazy';image.decoding='async';
      image.addEventListener('error',()=>{image.remove();poster.classList.add('spidey-agenda-no-art');});
      poster.append(image);
    }else{
      poster.classList.add('spidey-agenda-no-art');
      poster.append(node('span','spidey-agenda-day',key.slice(-2)));
      poster.append(node('small','',key.slice(5,7)));
    }
    const details=node('span','spidey-agenda-event-info');
    const category=isRegional(e)?'REGIONAL':isRaid(e)?'REIDES':'EVENTO';
    details.append(node('small','spidey-agenda-kind',category));
    details.append(node('strong','spidey-agenda-event-title',e.public_title||window.SpideyPlayer?.title?.(e)||e.title));
    details.append(node('span','spidey-agenda-hour',eventTime(e,key)));
    const arrow=node('span','spidey-agenda-arrow','›');arrow.setAttribute('aria-hidden','true');
    btn.append(poster,details,arrow);
    return btn;
  }
  function installedEvents(){
    try{return typeof state!=='undefined'&&Array.isArray(state.events)?state.events:[]}
    catch(_){return []}
  }
  function mount(){
    const home=document.getElementById('playerHome');
    // A agenda nunca pode desaparecer se o palco 3D/painel Premium falhar.
    const anchor=home?.querySelector('.spidey-command-cockpit')
      ||home?.querySelector('.spidey-cockpit-home-head')
      ||home?.querySelector('.player-home-head');
    if(!home||!anchor)return null;
    let root=home.querySelector('#spideyCalendarPremium');
    if(root)return root;
    root=node('section','spidey-agenda-premium');
    root.id='spideyCalendarPremium';
    root.setAttribute('aria-label','Agenda Premium dos próximos sete dias');
    const heading=node('header','spidey-agenda-heading');
    const top=node('div','spidey-agenda-heading-title');
    top.append(node('span','spidey-agenda-eyebrow','SPIDEY · AGENDA'));
    top.append(node('h2','','Os próximos 7 dias'));
    top.append(node('p','','Escolha um dia, veja os eventos e abra os detalhes.'));
    const weekBtn=node('button','spidey-agenda-week-link','Ver semana completa');
    weekBtn.type='button';weekBtn.dataset.premiumView='weeklyView';
    heading.append(top,weekBtn);
    const days=node('div','spidey-agenda-days');
    days.setAttribute('role','group');days.setAttribute('aria-label','Escolher dia');
    const filters=node('div','spidey-agenda-filters');
    filters.setAttribute('role','group');filters.setAttribute('aria-label','Filtrar eventos');
    const status=node('p','spidey-agenda-status');status.setAttribute('role','status');
    const cards=node('div','spidey-agenda-cards');cards.id='spideyAgendaResults';
    const footer=node('div','spidey-agenda-footer');
    root.append(heading,days,filters,status,cards,footer);
    anchor.insertAdjacentElement('afterend',root);
    root.addEventListener('click',evt=>{
      const day=evt.target.closest('button[data-agenda-day]');
      if(day){
        view.selected=day.dataset.agendaDay;view.expanded=false;render();
        return;
      }
      const mode=evt.target.closest('button[data-agenda-mode]');
      if(mode){
        view.mode=mode.dataset.agendaMode;view.expanded=false;render();
        return;
      }
      if(evt.target.closest('button[data-agenda-more]')){
        view.expanded=true;render();
      }
      // Eventos e semana completa ficam a cargo da navegação nativa do Player UI.
    });
    return root;
  }
  function render(now=new Date()){
    const root=mount();if(!root)return false;
    const days=weekDays(now);
    if(!days.length)return false;
    if(view.seenDate!==days[0].key){
      view.seenDate=days[0].key;view.selected=days[0].key;view.expanded=false;
    }
    if(!days.some(d=>d.key===view.selected))view.selected=days[0].key;
    const events=installedEvents();
    const strip=root.querySelector('.spidey-agenda-days');
    const dayNodes=days.map(d=>{
      const count=choose(events,d.key,'all').length;
      const btn=node('button','spidey-agenda-date');
      btn.type='button';btn.dataset.agendaDay=d.key;
      if(d.key===view.selected)btn.classList.add('selected');
      btn.setAttribute('aria-pressed',String(d.key===view.selected));
      btn.setAttribute('aria-label',(d.today?'Hoje, ':'')+d.day+'/'+d.key.slice(5,7)+', '+count+' evento'+(count===1?'':'s'));
      btn.append(node('span','',d.today?'HOJE':d.weekday.toUpperCase()));
      btn.append(node('strong','',d.day));
      btn.append(node('small','spidey-agenda-count',count?'● '+count:'—'));
      return btn;
    });
    strip.replaceChildren(...dayNodes);
    const filters=root.querySelector('.spidey-agenda-filters');
    filters.replaceChildren(...modes.map(m=>{
      const btn=node('button','spidey-agenda-filter',m.label);
      btn.type='button';btn.dataset.agendaMode=m.id;
      btn.setAttribute('aria-pressed',String(view.mode===m.id));
      if(view.mode===m.id)btn.classList.add('selected');
      return btn;
    }));
    const found=choose(events,view.selected,view.mode);
    const status=root.querySelector('.spidey-agenda-status');
    const d=days.find(x=>x.key===view.selected);
    status.textContent=events.length===0?'Carregando a programação…':
      found.length+' evento'+(found.length===1?'':'s')+' para '+d.day+'/'+view.selected.slice(5,7)+
      (view.mode==='local'?' · regionais':view.mode==='raids'?' · reides':'');
    const cards=root.querySelector('.spidey-agenda-cards');
    if(!found.length){
      cards.replaceChildren(node('p','spidey-agenda-empty',events.length?'Nenhum evento dessa categoria neste dia. Tente outro filtro.':'A agenda aparece aqui assim que os eventos carregarem.'));
    }else{
      cards.replaceChildren(...found.slice(0,view.expanded?found.length:4).map(e=>eventCard(e,view.selected)));
    }
    const footer=root.querySelector('.spidey-agenda-footer');
    footer.replaceChildren();
    if(found.length>4&&!view.expanded){
      const more=node('button','spidey-agenda-more','Mostrar mais '+(found.length-4)+' eventos');
      more.type='button';more.dataset.agendaMore='1';footer.append(more);
    }
    return true;
  }
  window.SpideyCalendarPremium=Object.freeze({brazilKey,weekDays,covers,choose,isRegional,isRaid,render});
  const start=()=>{
    render();
    window.addEventListener('spideyhomeupdated',()=>render());
    window.addEventListener('spideycontentready',()=>render());
    window.addEventListener('spideyviewchange',e=>{if(e.detail?.to==='calendarView')render();});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();