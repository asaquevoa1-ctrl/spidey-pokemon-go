(() => {
  'use strict';
  const STATUS = {
    official: ['OFICIAL', 'Informação confirmada em fonte primária'],
    datamine: ['DATAMINE', 'Descoberta técnica ainda não confirmada oficialmente'],
    awaiting: ['AGUARDANDO CONFIRMAÇÃO', 'Aguardando confirmação em fonte primária'],
    local: ['EVENTO LOCAL', 'Disponível somente no local indicado'],
  };
  window.SPIDEY_EVENT_TRUST = { version: '2026-09-30.2', statuses: STATUS, failClosed: true };

  const worldEvents = [
    { id:'2026-10-comic-con-malaga', title:'Pokémon GO × Comic-Con Málaga 2026', place:'Málaga, Espanha', dates:'1–4 out 2026', status:'awaiting', locality:'local', note:'Evento local em verificação de fonte primária. Arte Premium ainda não aprovada.', artApproved:false },
    { id:'2026-toyohashi-observatory', title:'Observatório Astronômico de Pokémon — Toyohashi', place:'Toyohashi, Japão', dates:'Evento local', status:'awaiting', locality:'local', note:'Dados preservados para verificação. Arte anterior rejeitada e bloqueada.', artApproved:false },
  ];
  window.SPIDEY_WORLD_EVENTS = worldEvents;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function badge(key){const [label]=STATUS[key]||STATUS.awaiting;return `<span class="trust-badge trust-${esc(key)}">${esc(label)}</span>`;}
  function renderWorldEvents(){const root=document.getElementById('worldEvents');if(!root)return;root.innerHTML=worldEvents.map(event=>`<article class="world-event-card" data-world-event="${esc(event.id)}"><div class="world-event-meta">${badge(event.locality)} ${badge(event.status)}</div><h3>${esc(event.title)}</h3><p><strong>${esc(event.place)}</strong> · ${esc(event.dates)}</p><p class="microcopy">${esc(event.note)}</p><div class="art-state art-pending">SEM ARTE PREMIUM APROVADA</div></article>`).join('');}

  // IMPORTANT: esta camada cuida somente de confiança editorial e eventos locais.
  // Ela NÃO esconde, troca ou revalida artes dos cards globais. O catálogo Premium é a única autoridade visual.
  function exposeApprovedPremium(root=document){
    const catalog=window.SPIDEY_PREMIUM_EVENT_ART||{};
    root.querySelectorAll?.('[data-v22-event], [data-event-id]').forEach(owner=>{
      const eventId=owner.dataset.v22Event||owner.dataset.eventId;
      const entry=catalog[eventId];
      if(!(entry?.visualApproved===true&&entry?.premium_visual_approved===true))return;
      owner.classList.remove('spidey-art-unapproved');
      owner.querySelectorAll('img').forEach(img=>{
        if(img.classList.contains('v23-hidden-art'))return;
        img.hidden=false;
      });
    });
  }
  function apply(){renderWorldEvents();exposeApprovedPremium();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.addEventListener('load',()=>setTimeout(()=>exposeApprovedPremium(),180),{once:true});
})();