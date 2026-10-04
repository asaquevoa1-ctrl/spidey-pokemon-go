(() => {
  'use strict';
  function sourceLabel(e){return window.SpideyPlayer.source(e)}
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function flyActions(root=document){
    root.querySelectorAll('[data-event-id],[data-v22-event]').forEach(card=>{
      const id=card.dataset.eventId||card.dataset.v22Event,e=state.events.find(e=>e.id===id);
      if(!window.SpideyFlyCore.eligible(e)||card.querySelector('.cc-fly-action'))return;
      const nested=card.matches('button,a')||card.closest('button,a');
      const b=document.createElement(nested?'span':'button');b.className=nested?'cc-fly-action cc-fly-label':'action-btn cc-fly-action';b.textContent=nested?'FLY • Rota mundial disponível':'FLY — Ver rota mundial';if(!nested)b.addEventListener('click',ev=>{ev.stopPropagation();window.SpideyFly.open(id)});card.append(b);
    });
  }
  function renderNews(){
    const target=document.getElementById('newsList');if(!target)return;
    const items=window.SpideyNews.build(state.events,getBrazilRange);
    target.innerHTML=items.slice(0,24).map(story=>{
      const e=story.event,multiple=story.events.length>1;
      return `<article class="cc-news-card" data-news-story="${esc(story.key)}"><span class="eyebrow">${esc(sourceLabel(e))}</span><p class="microcopy">${esc(e.source.name||'Fonte do evento')}${story.updated?' • Atualizado '+esc(new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit'}).format(new Date(story.updated))):''}</p><h2>${esc(story.title)}</h2><p>${esc(story.summary||'Veja os detalhes e a fonte deste evento.')}</p>${story.events.map(item=>`<p class="microcopy">${multiple?'<strong>'+esc(item.title)+'</strong><br>':''}${esc(window.SpideyPlayer.time(item))}</p>`).join('')}<div class="action-row">${story.events.map(item=>`<button class="action-btn" data-news-event="${esc(item.id)}">${multiple?esc(item.news?.window_label||item.title):'Ver evento'}</button>`).join('')}<a class="action-btn" href="${esc(e.source.url)}" target="_blank" rel="noopener">Consultar fonte</a></div></article>`;
    }).join('')||'<p class="empty">Nenhuma novidade por enquanto.</p>';
  }
  function mount(){
    const nav=document.querySelector('.app-tabs'),main=document.querySelector('main');if(!nav||!main)return;
    document.body.classList.add('spidey-command-center');
    const intro=document.querySelector('.experience-intro');
    intro.querySelector('.eyebrow').textContent='SPIDEY COMMAND CENTER';
    const shortcuts=document.createElement('div');shortcuts.className='cc-shortcuts';shortcuts.innerHTML='<button class="action-btn" data-cc-view="flyView">Jogar pelo mundo</button><button class="action-btn" data-cc-view="stampsView">Explorar selos</button><button class="action-btn" data-cc-view="newsView">Novidades</button>';intro.append(shortcuts);
    const news=document.createElement('section');news.id='newsView';news.hidden=true;news.className='app-view';news.innerHTML='<section class="hero hero-compact"><span class="eyebrow">NOVIDADES</span><h1>Fique por dentro</h1><p>Veja o que vem por aí e acompanhe os anúncios de cada evento.</p></section><section class="section"><div id="newsList" class="cc-news-list"></div></section>';main.append(news);
    const b=document.createElement('button');b.className='app-tab';b.dataset.view='newsView';b.textContent='Novidades';nav.append(b);b.addEventListener('click',()=>{renderNews();setView('newsView')});
    shortcuts.addEventListener('click',e=>{const b=e.target.closest('[data-cc-view]');if(!b)return;if(b.dataset.ccView==='flyView')window.SpideyFly.render();if(b.dataset.ccView==='newsView')renderNews();setView(b.dataset.ccView)});
    news.addEventListener('click',e=>{const b=e.target.closest('[data-news-event]');if(b)openEvent(state.events.find(e=>e.id===b.dataset.newsEvent))});
    // Decorate rendered cards without taking ownership of their data or artwork.
    let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;flyActions()})}).observe(main,{childList:true,subtree:true});
    window.addEventListener('spideycontentready',()=>{renderNews();flyActions()});
    const original=openEvent;openEvent=function(e){original(e);const source=detail.querySelector('.detail-body > .eyebrow');if(source)source.textContent=window.SpideyPlayer.source(e);const approved=window.SPIDEY_APPROVED_ART_MASTER?.[e.id];detail.classList.toggle('player-art-unavailable',Boolean(approved&&window.SPIDEY_UNAVAILABLE_ART?.[approved.file]));if(approved&&window.SPIDEY_UNAVAILABLE_ART?.[approved.file]&&!window.SpideyPlayer.reviewCorrection(e)){detail.querySelector('.detail-hero')?.remove();const note=document.createElement('p');note.className='player-art-notice';note.textContent='A arte deste evento está temporariamente indisponível.';detail.prepend(note)}const review=window.SPIDEY_PREVIEW_ART?.[e.id];if(approved?.display==='full_poster'||review&&(!approved||window.SpideyPlayer.reviewCorrection(e))){const hero=detail.querySelector('.detail-hero');if(hero){const holder=document.createElement('div');holder.innerHTML=window.SpideyPlayer.image(e);hero.replaceWith(holder.firstElementChild)}}if(window.SpideyFlyCore.eligible(e)){const b=document.createElement('button');b.className='action-btn cc-fly-action';b.textContent='Ver rota mundial';b.addEventListener('click',()=>{dialog.close();window.SpideyFly.open(e.id)});detail.querySelector('.detail-body')?.append(b)}dialog.scrollTop=0};
    renderNews();flyActions();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
