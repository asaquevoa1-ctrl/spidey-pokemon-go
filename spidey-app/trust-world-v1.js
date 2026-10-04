(() => {
  'use strict';
  const STATUS = {official:['OFICIAL','Informação do anúncio oficial'],datamine:['PRÉVIA DA COMUNIDADE','Informação da comunidade que ainda aguarda anúncio oficial'],awaiting:['AGUARDANDO CONFIRMAÇÃO','Aguardando anúncio oficial'],local:['EVENTO LOCAL','Disponível somente no local indicado']};
  window.SPIDEY_EVENT_TRUST={version:'2026-10-04-malaga-v1',statuses:STATUS,failClosed:true};
  const worldEvents=[{id:'2026-toyohashi-observatory',title:'Observatório Astronômico de Pokémon — Toyohashi',place:'Toyohashi, Japão',dates:'Evento local',status:'awaiting',locality:'local',note:'Mais informações serão exibidas após confirmação.',artApproved:false}];window.SPIDEY_WORLD_EVENTS=worldEvents;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function badge(k){const [l]=STATUS[k]||STATUS.awaiting;return `<span class="trust-badge trust-${esc(k)}">${esc(l)}</span>`}
  const clock=(date,zone)=>new Intl.DateTimeFormat('pt-BR',{timeZone:zone,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date);
  function eventWindow(event,now=new Date()) {
    const s=event.schedule,core=window.SpideyFlyCore;
    const start=s&&core?.localToDate(s.start_date,s.start_time,s.timezone);
    const end=s&&core?.localToDate(s.end_date,s.end_time,s.timezone);
    if(!start||!end||end<=start)return {status:'HORÁRIO A CONFIRMAR'};
    return {start,end,status:now>=end?'ENCERRADO':now>=start?'ACONTECENDO AGORA':'EM BREVE'};
  }
  function scheduleText(event,now=new Date()) {
    const period=eventWindow(event,now),s=event.schedule;
    if(!period.start)return `<span data-local-event-status="${esc(event.id)}">${esc(period.status)}</span>`;
    return `<strong data-local-event-status="${esc(event.id)}">${esc(period.status)}</strong><p>Local: ${esc(clock(period.start,s.timezone))} → ${esc(clock(period.end,s.timezone))}</p><p><strong>Brasília: ${esc(clock(period.start,'America/Sao_Paulo'))} → ${esc(clock(period.end,'America/Sao_Paulo'))}</strong></p>`;
  }
  function backgroundFigure(event) {
    const media=event.location_background;
    return media?`<figure class="world-location-background"><img src="${esc(media.file)}?v=${esc(media.sha256.slice(0,12))}" width="${media.width}" height="${media.height}" alt="${esc(media.alt)}" loading="lazy" decoding="async"><figcaption>Fundo de Localização · Málaga</figcaption></figure>`:'';
  }
  function eventCard(event) {
    return `<article class="world-event-card" data-world-event="${esc(event.id)}"><div class="world-event-meta">${badge(event.locality)} ${badge(event.status)}</div><h3>${esc(event.title)}</h3><p><strong>${esc(event.place)}</strong> · ${esc(event.dates)}</p>${backgroundFigure(event)}<p>${esc(event.note)}</p>${event.schedule?`<div class="world-event-window">${scheduleText(event)}</div><button class="action-btn gold" data-open-local-event="${esc(event.id)}">Ver fundo e locais</button>`:''}</article>`;
  }
  function renderWorldEvents() {
    const r=document.getElementById('worldEvents');if(!r)return;
    r.querySelectorAll('.world-event-card').forEach(card=>card.remove());
    r.insertAdjacentHTML('beforeend',worldEvents.map(eventCard).join(''));
  }
  function mountLocalFly() {
    const fly=document.getElementById('flyView');if(!fly)return;
    worldEvents.filter(e=>e.schedule).forEach(event=>{
      if(!fly.querySelector(`[data-world-event="${event.id}"]`))fly.querySelector('.hero')?.insertAdjacentHTML('afterend',eventCard(event));
    });
  }
  function mapUrl(location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.name}, ${location.address}`)}`;
  }
  function locationRows(event) {
    return event.locations.map(location=>`<article class="world-location" data-local-venue="${esc(location.id)}"><h3>${esc(location.name)}</h3><p>${esc(location.address)}</p><p class="microcopy">${esc(location.access_note)}</p><div class="world-location-actions"><button class="action-btn" data-local-copy="${esc(location.address)}">Copiar endereço</button><a class="action-btn" href="${esc(mapUrl(location))}" target="_blank" rel="noopener">Abrir mapa</a></div></article>`).join('');
  }
  function openLocalEvent(id) {
    const event=worldEvents.find(e=>e.id===id);if(!event?.schedule)return;
    beginAppDialog();
    if(dialog.open)dialog.close();
    detail.classList.remove('spidey-detail-v3','player-art-unavailable','v23-no-hero');
    delete detail.dataset.visualCategory;delete detail.dataset.visualCharacter;
    detail.innerHTML=`<div class="detail-body world-local-detail" data-local-detail="${esc(id)}"><span class="eyebrow">PRESENCIAL · MÁLAGA, ESPANHA</span><h2>Pikachu · Fundo de Málaga</h2>${backgroundFigure(event)}<p>${esc(event.note)}</p><div class="world-event-window">${scheduleText(event)}</div><p class="world-local-clock">${liveClock(event)}</p><h3>Onde jogar</h3><div class="world-location-list">${locationRows(event)}</div><h3>Também acontece no evento</h3><ul class="bonus-list">${event.bonuses.map(text=>`<li>${esc(text)}</li>`).join('')}</ul><a class="action-btn" href="${esc(event.source.url)}" target="_blank" rel="noopener">Anúncio oficial ↗</a><p class="world-background-credit">Fundo do jogo: <a href="${esc(event.location_background.source_url)}" target="_blank" rel="noopener">PokeMiners ↗</a>. Cidade conferida no <a href="${esc(event.location_background.city_mapping_url)}" target="_blank" rel="noopener">Serebii ↗</a>.</p></div>`;
    showAppDialog();dialog.scrollTop=0;detail.scrollTop=0;
    document.getElementById('closeDialog')?.focus({preventScroll:true});
  }
  function liveClock(event,now=new Date()) {
    return `Agora em Málaga: <strong>${esc(clock(now,event.schedule.timezone))}</strong><br>Brasília: ${esc(clock(now,'America/Sao_Paulo'))}`;
  }
  function updateClocks() {
    worldEvents.filter(e=>e.schedule).forEach(event=>{
      const status=eventWindow(event).status;
      document.querySelectorAll(`[data-local-event-status="${event.id}"]`).forEach(element=>element.textContent=status);
      const open=detail.querySelector(`[data-local-detail="${event.id}"] .world-local-clock`);
      if(dialog.open&&open)open.innerHTML=liveClock(event);
    });
  }
  function exposeApprovedPremium(root=document){const c=window.SPIDEY_PREMIUM_EVENT_ART||{};root.querySelectorAll?.('[data-v22-event], [data-event-id]').forEach(o=>{const id=o.dataset.v22Event||o.dataset.eventId,e=c[id];if(!(e?.visualApproved===true&&e?.premium_visual_approved===true))return;o.classList.remove('spidey-art-unapproved');o.querySelectorAll('img').forEach(i=>{if(!i.classList.contains('v23-hidden-art'))i.hidden=false})})}
  function loadFly(){if(document.querySelector('script[data-spidey-fly]'))return;const s=document.createElement('script');s.src='fly-v1.js?v=20260930-fly3';s.defer=true;s.dataset.spideyFly='1';document.head.append(s)}
  function apply(){
    renderWorldEvents();exposeApprovedPremium();
    window.SpideyCatalog.load('local-events').then(data=>{worldEvents.splice(0,worldEvents.length,...data.events,{id:'2026-toyohashi-observatory',title:'Observatório Astronômico de Pokémon — Toyohashi',place:'Toyohashi, Japão',dates:'Evento local',status:'awaiting',locality:'local',note:'Mais informações serão exibidas após confirmação.'});renderWorldEvents();mountLocalFly()}).catch(()=>{
      document.getElementById('worldEvents')?.insertAdjacentHTML('beforeend','<p class="empty">Não foi possível carregar os eventos locais. Recarregue para tentar novamente.</p>');
    });
    document.addEventListener('click',async event=>{
      const open=event.target.closest('[data-open-local-event]');if(open){openLocalEvent(open.dataset.openLocalEvent);return}
      const copy=event.target.closest('[data-local-copy]');if(!copy)return;
      try{await navigator.clipboard.writeText(copy.dataset.localCopy);showToast('Endereço copiado.')}catch{showToast('Não foi possível copiar. Use o mapa do local.')}
    });
    window.addEventListener('spideycontentready',mountLocalFly);
    setInterval(updateClocks,60000);
  }
  window.SpideyWorld=Object.freeze({eventWindow,mapUrl,locationRows,openLocalEvent});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();window.addEventListener('load',()=>setTimeout(()=>exposeApprovedPremium(),180),{once:true});
})();
