(() => {
  'use strict';
  const IDS=['2026-ana-pokemon-jet-red','2026-ana-pokemon-jet-green'];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parse=v=>{
    const match=/^(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)$/.exec(String(v||''));
    if(!match)return null;
    const lat=Number(match[1]),lon=Number(match[2]);
    return Math.abs(lat)<=90&&Math.abs(lon)<=180?v:null;
  };
  let events=[],phase=IDS[0];
  function render(){
    const root=document.getElementById('anaAirportPanel');if(!root)return;
    const event=events.find(e=>e.id===phase);
    if(!event){root.querySelector('#anaAirportList').textContent='Pontos não disponíveis no momento.';return;}
    const refs=(event.locations||[]).filter(p=>
      p.coordinate_type==='airport_terminal_reference'&&
      p.exact_raid_gym_verified===false&&parse(p.coordinate_text));
    const hero=root.querySelector('#anaEventSummary');
    if(hero){
      const who=phase.endsWith('-red')?'Charmander':'Bulbasaur';
      const since=phase.endsWith('-red')?'28/07/2026 às 16h':'18/09/2026 às 14h';
      const origin=phase.endsWith('-red')?'Vermelho':'Verde';
      hero.innerHTML='<strong>Pokémon Jet '+origin+' • '+who+'</strong>'+
        '<span>'+since+' até 31/08/2027 às 20h • horário do Japão</span>'+
        '<span>Reides especiais, fundo de localização ANA e Pesquisa Temporária de 3 dias.</span>';
    }
    root.querySelector('#anaAirportStatus').textContent=refs.length+
      ' pontos de aeroportos • nenhum Ginásio especial confirmado';
    root.querySelector('#anaAirportList').innerHTML=refs.map(p=>{
      const value=parse(p.coordinate_text);
      return '<article class="ana-airport-row"><div><strong>'+esc(p.label)+'</strong>'+
        '<small>Referência de aeroporto/terminal • Ginásio NÃO verificado</small>'+
        '<code>'+esc(value)+'</code></div>'+
        '<button class="action-btn" type="button" data-ana-coord="'+esc(value)+'">Copiar coordenadas</button>'+
        '<a class="action-btn" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&amp;query='+encodeURIComponent(value)+'">Mapa</a></article>';
    }).join('');
    root.querySelectorAll('[data-ana-phase]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.anaPhase===phase)));
  }
  function mount(){
    const fly=document.getElementById('flyView');
    if(!fly||document.getElementById('anaAirportPanel'))return;
    const section=document.createElement('section');
    section.id='anaAirportPanel';section.className='section ana-airport-panel';
    section.innerHTML='<span class="eyebrow">JAPÃO • ANA × POKÉMON GO</span>'+
      '<h2>Pokémon Jet • eventos ANA</h2><p>Charmander e Bulbasaur com fundos exclusivos em Reides no Japão. Copie as referências dos aeroportos; estes pontos <strong>não são coordenadas verificadas dos Ginásios das Reides</strong>.</p>'+
      '<div class="ana-phase-tabs" role="group" aria-label="Fase do evento">'+
      '<button class="action-btn" data-ana-phase="2026-ana-pokemon-jet-red" aria-pressed="true" type="button">🔴 Charmander • 6 aeroportos</button>'+
      '<button class="action-btn" data-ana-phase="2026-ana-pokemon-jet-green" aria-pressed="false" type="button">🟢 Bulbasaur • 14 aeroportos</button></div>'+
      '<div id="anaEventSummary" class="ana-event-summary" aria-live="polite"></div>'+      '<p id="anaAirportStatus" role="status" class="microcopy">Carregando pontos…</p>'+
      '<div id="anaAirportList" class="ana-airport-list"></div>'+
      '<p class="microcopy">A localização exata do Ginásio ANA precisa ser conferida no mapa do Pokémon GO. GPX de Ginásios não será gerado a partir destes pontos.</p>';
    fly.appendChild(section);
    const jump=document.createElement('button');
    jump.type='button';jump.className='action-btn ana-fly-jump';
    jump.textContent='✈️ ANA • Aeroportos e coordenadas';
    jump.setAttribute('aria-label','Ir diretamente às coordenadas dos aeroportos ANA');
    jump.addEventListener('click',()=>section.scrollIntoView({behavior:'smooth',block:'start'}));
    const hero=fly.querySelector('.hero');
    if(hero)hero.insertAdjacentElement('afterend',jump);
    else fly.prepend(jump);
    section.addEventListener('click',async event=>{
      const chosen=event.target.closest('[data-ana-phase]');
      if(chosen){phase=chosen.dataset.anaPhase;render();return;}
      const btn=event.target.closest('[data-ana-coord]');if(!btn)return;
      const value=parse(btn.dataset.anaCoord);if(!value)return;
      try{await navigator.clipboard.writeText(value);if(typeof window.showToast==='function')window.showToast('Coordenadas do aeroporto copiadas.');else btn.textContent='Copiado!';}
      catch{window.prompt('Copie a coordenada do aeroporto:',value);}
    });
    fetch('data/events.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('dados indisponíveis');return r.json();}).then(json=>{
      events=(json.events||[]).filter(e=>IDS.includes(e.id));render();
    }).catch(()=>{const status=document.getElementById('anaAirportStatus');if(status)status.textContent='Não foi possível carregar os pontos ANA.';});
  }
  window.SpideyAnaAirportCore=Object.freeze({parse});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();