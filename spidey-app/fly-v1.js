(() => {
  'use strict';
  const core=window.SpideyFlyCore;if(!core)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const brazil=d=>new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(d);
  let points=[],selected='',mode='essential';
  function events(){return state.events.filter(core.eligible).sort((a,b)=>a.schedule.start_local.localeCompare(b.schedule.start_local))}
  function render(){
    const s=document.getElementById('flyView');if(!s)return;
    const list=events(),select=s.querySelector('#flyEventSelect'),now=new Date();
    if(!selected||!list.some(e=>e.id===selected))selected=list.find(e=>core.route(e,points,now).some(p=>p.end>now))?.id||list.at(-1)?.id||'';
    const signature=list.map(e=>e.id).join('|');if(select.dataset.signature!==signature){select.innerHTML=list.map(e=>`<option value="${esc(e.id)}">${esc(e.title)}</option>`).join('');select.dataset.signature=signature}select.value=selected;
    const e=list.find(e=>e.id===selected),all=e?core.route(e,points,now):[],rows=mode==='essential'?all.filter(p=>p.essential):all;
    const active=all.filter(p=>['ATIVO AGORA','ÚLTIMA CHANCE'].includes(p.status)),next=all.find(p=>p.status==='PRÓXIMO');
    s.querySelector('#flyNow').textContent=active.length?active.slice(0,2).map(p=>p.name).join(' • '):'Nenhuma janela ativa';
    s.querySelector('#flyNext').textContent=next?`${next.name} · ${brazil(next.start)}`:'Sem próxima janela';
    const minutes=next?Math.ceil((next.start-now)/60000):0;
    s.querySelector('#flyCountdown').textContent=next?`Começa em ${Math.floor(minutes/60)}h ${minutes%60}min (Brasília)`:'Janelas encerradas ou horário indisponível';
    s.querySelector('#flyCount').textContent=String(rows.length);
    const last=all.reduce((r,p)=>!r||p.end>r.end?p:r,null);
    s.querySelector('#flyLast').textContent=last?`Última janela: ${last.name} · até ${brazil(last.end)} (Brasília)`:'Horário não informado';
    s.querySelector('#flyRouteList').innerHTML=rows.length?rows.map((p,i)=>{
      const q=`${p.lat},${p.lon}`,date=e.schedule.start_local.slice(8,10)+'/'+e.schedule.start_local.slice(5,7);
      return `<article class="fly-point ${['ATIVO AGORA','ÚLTIMA CHANCE'].includes(p.status)?'fly-active':''}"><span class="fly-order">${String(i+1).padStart(2,'0')}</span><div class="fly-place"><span class="fly-state">${esc(p.status)}</span><h3>${esc(p.flag)} ${esc(p.name)}</h3><p>Local: ${esc(date)} · ${esc(e.schedule.start_local.slice(11,16))} → ${esc(e.schedule.end_local.slice(11,16))}</p><p><strong>Brasília: ${brazil(p.start)} → ${brazil(p.end)}</strong></p>${brazil(p.start).slice(0,5)!==date?'<small>O início cai em outro dia em Brasília.</small>':''}<small>Referência geográfica · ${esc(p.timezone)}</small><code>${q}</code></div><div class="fly-point-actions"><button class="action-btn" data-coord="${q}">Copiar coordenadas</button><a class="action-btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}" target="_blank" rel="noopener">Abrir mapa</a></div></article>`;
    }).join(''):'<p class="empty">Nenhuma janela local completa disponível. Horários ausentes não são estimados.</p>';
    s.querySelectorAll('[data-fly-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.flyMode===mode)));
  }
  function open(id){selected=id;render();setView('flyView');if(dialog.open)dialog.close()}
  function mount(){
    if(document.getElementById('flyView'))return;
    const main=document.querySelector('main'),nav=document.querySelector('.app-tabs');if(!main||!nav)return;
    const s=document.createElement('section');s.id='flyView';s.className='app-view';s.hidden=true;
    s.innerHTML=`<section class="hero hero-compact"><span class="eyebrow">FLY • JOGAR PELO MUNDO</span><h1>Rota Mundial</h1><p>Do primeiro fuso à última chance. Horário local, Brasília e coordenadas na mesma rota.</p></section><section class="section"><label class="fly-event-label" for="flyEventSelect">Escolha o evento</label><select id="flyEventSelect" class="fly-event-select"></select><div class="fly-live-grid"><article><span class="eyebrow">ONDE JOGAR AGORA</span><h2 id="flyNow">Carregando…</h2></article><article><span class="eyebrow">PRÓXIMO</span><h2 id="flyNext">Carregando…</h2><p id="flyCountdown" role="status"></p></article></div><p id="flyLast" class="fly-last"></p><div class="fly-toolbar"><button class="action-btn" data-fly-mode="essential" aria-pressed="true">Essenciais</button><button class="action-btn" data-fly-mode="all" aria-pressed="false">Todos os hotspots</button><span><strong id="flyCount">0</strong> locais</span></div><p class="microcopy">Coordenadas são referências geográficas, não PokéStops exatas. GPX somente com rota validada.</p><div id="flyRouteList" class="fly-route-list"></div></section>`;main.append(s);
    const b=document.createElement('button');b.className='app-tab';b.dataset.view='flyView';b.textContent='FLY';nav.insertBefore(b,nav.querySelector('[data-view="stampsView"]'));b.addEventListener('click',()=>{render();setView('flyView')});
    s.querySelector('#flyEventSelect').addEventListener('change',e=>{selected=e.target.value;render()});
    s.addEventListener('click',async e=>{const f=e.target.closest('[data-fly-mode]');if(f){mode=f.dataset.flyMode;render();return}const c=e.target.closest('[data-coord]');if(!c)return;try{await navigator.clipboard.writeText(c.dataset.coord);showToast('Coordenadas copiadas.')}catch{prompt('Copie as coordenadas:',c.dataset.coord)}});
    core.loadPoints().then(p=>{points=p;window.SPIDEY_FLY_POINTS=p;render()}).catch(()=>{s.querySelector('#flyRouteList').innerHTML='<p class="empty">Não foi possível carregar a rota. Recarregue para tentar novamente.</p>'});
    window.addEventListener('spideycontentready',render);setInterval(()=>{if(!s.hidden)render()},30000);
  }
  window.SpideyFly=Object.freeze({open,render});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
