(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=e=>String(e.title||'').replace(/^Spotlight Hour:/,'Hora do Holofote:').replace(/^Raid Hour:/,'Hora de Reides:').replace(/^Max Monday:/,'Segunda Max:');
  function art(e){
    const approved=window.SPIDEY_APPROVED_ART_MASTER?.[e.id];
    const review=window.SPIDEY_PREVIEW_ART?.[e.id];
    const a=approved||review;
    return a?`${a.file}?v=${a.sha256.slice(0,12)}`:null;
  }
  function image(e,thumb=false){
    const url=art(e);if(!url)return '';
    const draft=window.SPIDEY_PREVIEW_ART?.[e.id];
    if(draft&&!window.SPIDEY_APPROVED_ART_MASTER?.[e.id])return `<span class="player-art-window ${thumb?'player-thumbnail':''}"><img src="${esc(url)}" alt="Ilustração de ${esc(title(e))}"></span>`;
    return `<img class="${thumb?'player-thumbnail':'player-poster'}" src="${esc(url)}" alt="Arte de ${esc(title(e))}" ${thumb?'loading="lazy"':''}>`;
  }
  function source(e){try{return /(^|\.)(pokemongo\.com|pokemongolive\.com)$/.test(new URL(e.source.url).hostname)?'Anúncio oficial':/pokeminers|datamine/i.test(e.source.name||'')?'Prévia • ainda não confirmada':'Informação da comunidade'}catch{return 'Informação em confirmação'}}
  function facts(e){
    const bonuses=Array.isArray(e.bonuses)?e.bonuses.filter(x=>typeof x==='string'):[];
    return [...new Set([e.summary,...bonuses].filter(Boolean))];
  }
  function time(e){const s=e.schedule||{};if(!s.start_local||!s.end_local)return 'Horário a confirmar';const date=s.start_local.slice(8,10)+'/'+s.start_local.slice(5,7);return `${date} · ${s.start_local.slice(11,16)}–${s.end_local.slice(11,16)}${window.SpideyFlyCore?.eligible(e)?' no horário de cada região':' (Brasília)'}`}
  function panel(e,{fly=false}={}){
    if(!e)return '<p>Escolha um evento para ver os detalhes.</p>';
    const image=art(e),pokemon=(e.pokemon||[]).map(p=>typeof p==='string'?p:`${p.name}${p.note?' — '+p.note:''}`),notes=(e.notes||[]).filter(n=>typeof n==='string');
    return `<article class="player-event ${image?'has-poster':'without-poster'}">${image?window.SpideyPlayer.image(e):''}<div class="player-event-copy"><span class="player-kicker">${esc(spideyCategoryLabel(e))}</span><h2>${esc(title(e))}</h2><p class="player-time">${esc(time(e))}</p><div class="player-facts">${facts(e).map(f=>`<p>${esc(f)}</p>`).join('')||'<p>Os detalhes deste evento ainda serão anunciados.</p>'}</div>${pokemon.length?`<h3>Pokémon em destaque</h3><ul>${pokemon.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`:''}${notes.length?`<details><summary>O que mais você precisa saber</summary><ul>${notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></details>`:''}<div class="player-actions"><button class="action-btn" data-play-detail="${esc(e.id)}">Todos os detalhes</button>${!fly&&window.SpideyFlyCore?.eligible(e)?`<button class="action-btn gold" data-play-fly="${esc(e.id)}">Jogar pelo mundo →</button>`:''}</div>${e.source?.url?`<a class="player-source" href="${esc(e.source.url)}" target="_blank" rel="noopener">${esc(source(e))} ↗</a>`:''}</div></article>`;
  }
  function row(e){const image=art(e);return `<button class="player-row" data-play-detail="${esc(e.id)}">${image?window.SpideyPlayer.image(e,true):`<span class="player-date" aria-hidden="true">${esc(e.schedule?.start_local?.slice(8,10)||'—')}<small>${esc(e.schedule?.start_local?.slice(5,7)||'')}</small></span>`}<span><small>${esc(spideyCategoryLabel(e))}</small><strong>${esc(title(e))}</strong><span>${esc(time(e))}</span>${facts(e)[0]?`<span class="player-row-bonus">${esc(facts(e)[0])}</span>`:''}</span><span aria-hidden="true">›</span></button>`}
  function renderHome(){
    const root=document.getElementById('playerHome');if(!root||!state.events.length)return;
    const now=new Date(),today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
    const live=state.events.filter(e=>getBrazilRange(e).end>=now).sort((a,b)=>getBrazilRange(a).start-getBrazilRange(b).start);
    const focus=live.find(e=>e.schedule?.start_local?.slice(0,10)===today&&window.SpideyFlyCore?.eligible(e))||live.find(e=>art(e))||live[0];
    const active=live.filter(e=>getBrazilRange(e).start<=now&&e.id!==focus?.id);
    const upcoming=live.filter(e=>getBrazilRange(e).start>now&&e.id!==focus?.id).slice(0,6);
    root.innerHTML=`<header class="player-home-head"><span>${esc(new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'long',day:'numeric',month:'long'}).format(now))}</span><h1>Seu próximo encontro.</h1><p>Escolha o evento. Aproveite o bônus. Jogue pelo mundo.</p></header><section aria-label="Destaque do dia">${panel(focus)}</section><div class="player-feed">${active.length?`<section><h2>Acontecendo agora <span>${active.length}</span></h2>${active.map(row).join('')}</section>`:''}<section><h2>Vem por aí</h2>${upcoming.map(row).join('')||'<p>Novos eventos serão anunciados em breve.</p>'}</section></div>`;
  }
  function mount(){
    const home=document.getElementById('calendarView');if(!home)return;
    const root=document.createElement('section');root.id='playerHome';home.prepend(root);document.body.classList.add('spidey-player-ui');
    document.addEventListener('click',ev=>{const f=ev.target.closest('[data-play-fly]'),d=ev.target.closest('[data-play-detail]');if(f){window.SpideyFly?.open(f.dataset.playFly);return}if(d){const e=state.events.find(e=>e.id===d.dataset.playDetail);if(e)openEvent(e)}});
    window.addEventListener('spideycontentready',renderHome);renderHome();
    setInterval(()=>{if(!home.hidden)renderHome()},60000);
  }
  window.SpideyPlayer=Object.freeze({panel,row,art,image,facts,time,title,renderHome});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
