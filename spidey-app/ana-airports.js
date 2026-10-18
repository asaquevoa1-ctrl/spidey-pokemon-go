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
  let events=[],originalPosters=[],phase=IDS[0],search='';
  const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function matchesAirport(point,term){
    const query=clean(term).trim();
    if(!query)return true;
    return clean([point.label,point.airport,point.airport_code,point.region].join(' ')).includes(query);
  }
  function render(){
    const root=document.getElementById('anaAirportPanel');if(!root)return;
    const event=events.find(e=>e.id===phase);
    if(!event){root.querySelector('#anaAirportList').textContent='Pontos não disponíveis no momento.';return;}
    const refs=(event.locations||[]).filter(p=>
      p.coordinate_type==='airport_terminal_reference'&&
      p.exact_raid_gym_verified===false&&parse(p.coordinate_text));
    // A imagem exibida precisa ser o PNG ORIGINAL fornecido pelo usuário.
    // Não reutilizar SVG sintético, gerador automático nem registro delegado de aprovação.
    const original=originalPosters.find(item=>item.phase===phase);
    const poster=root.querySelector('#anaEventPoster');
    const link=root.querySelector('#anaPosterEnlarge');
    const stage=root.querySelector('#anaPosterStage');
    if(poster&&link&&stage){
      stage.hidden=true;
      if(original&&/^assets\\/events\\/premium\\/[a-z0-9-]+\\.png$/.test(original.file)&&/^[a-f0-9]{64}$/.test(original.sha256)){
        const target=original.file+'?v='+original.sha256.slice(0,12);
        poster.dataset.activeFile=original.file;
        poster.alt=original.slot+' — pôster original aprovado pelo usuário';
        poster.onload=()=>{if(poster.dataset.activeFile===original.file)stage.hidden=false;};
        poster.onerror=()=>{if(poster.dataset.activeFile===original.file)stage.hidden=true;};
        link.href=target;
        if(poster.getAttribute('src')!==target)poster.src=target;
        else if(poster.complete&&poster.naturalWidth>0)stage.hidden=false;
      }else{
        poster.removeAttribute('src');
        link.removeAttribute('href');
      }
    }
    const hero=root.querySelector('#anaEventSummary');
    if(hero){
      const who=phase.endsWith('-red')?'Charmander':'Bulbasaur';
      const since=phase.endsWith('-red')?'28/07/2026 às 16h':'18/09/2026 às 14h';
      const origin=phase.endsWith('-red')?'Vermelho':'Verde';
      hero.innerHTML='<strong>Pokémon Jet '+origin+' • '+who+'</strong>'+
        '<span>'+since+' até 31/08/2027 às 20h • horário do Japão</span>'+
        '<span>Reides especiais, fundo de localização ANA e Pesquisa Temporária de 3 dias.</span>';
    }
    const filtered=refs.filter(p=>matchesAirport(p,search));
    root.querySelector('#anaAirportStatus').textContent=(search?filtered.length+' de ':'')+refs.length+
      ' pontos de aeroportos • nenhum Ginásio especial confirmado';
    root.querySelector('#anaAirportList').innerHTML=filtered.length?filtered.map(p=>{
      const value=parse(p.coordinate_text);
      return '<article class="ana-airport-row"><div><strong>'+esc(p.label)+'</strong>'+
        '<small>Referência de aeroporto/terminal • Ginásio NÃO verificado</small>'+
        '<code>'+esc(value)+'</code></div>'+
        '<button class="action-btn" type="button" data-ana-coord="'+esc(value)+'">Copiar coordenadas</button>'+
        '<a class="action-btn" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&amp;query='+encodeURIComponent(value)+'">Mapa</a></article>';
    }).join(''):'<p class="empty">Nenhum aeroporto encontrado. Tente o nome, cidade ou código IATA.</p>';
    root.querySelectorAll('[data-ana-phase]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.anaPhase===phase)));
  }
  function mount(){
    const main=document.querySelector('main');
    if(!main||document.getElementById('anaAirportPanel'))return;
    const view=document.createElement('section');
    view.id='anaView';view.className='app-view ana-standalone';view.hidden=true;
    view.innerHTML='<section class="hero hero-compact"><span class="eyebrow">ANA × POKÉMON GO • JAPÃO</span><h1>Pokémon Jet</h1><p>Reides especiais, aeroportos e coordenadas de referência para copiar.</p></section>';
    const section=document.createElement('section');
    section.id='anaAirportPanel';section.className='section ana-airport-panel';
    section.innerHTML='<span class="eyebrow">JAPÃO • ANA × POKÉMON GO</span>'+
      '<h2>Pokémon Jet • eventos ANA</h2><p>Charmander e Bulbasaur com fundos exclusivos em Reides no Japão. Copie as referências dos aeroportos; estes pontos <strong>não são coordenadas verificadas dos Ginásios das Reides</strong>.</p>'+
      '<div class="ana-phase-tabs" role="group" aria-label="Fase do evento">'+
      '<button class="action-btn" data-ana-phase="2026-ana-pokemon-jet-red" aria-pressed="true" type="button">🔴 Charmander • 6 aeroportos</button>'+
      '<button class="action-btn" data-ana-phase="2026-ana-pokemon-jet-green" aria-pressed="false" type="button">🟢 Bulbasaur • 14 aeroportos</button></div>'+
      '<div id="anaPosterStage" class="ana-poster-stage" hidden><a id="anaPosterEnlarge" target="_blank" rel="noopener noreferrer" aria-label="Abrir a arte ANA original em tamanho inteiro"><img id="anaEventPoster" alt="Pôster original do evento ANA" loading="lazy"></a><p class="ana-poster-caption">Arte original • toque para ampliar. As coordenadas impressas nas artes são referências comunitárias, não Ginásios de reide verificados.</p></div>'+
      '<div id="anaEventSummary" class="ana-event-summary" aria-live="polite"></div>'+
      '<label class="ana-search-label" for="anaAirportSearch">Buscar aeroporto</label>'+
      '<input id="anaAirportSearch" class="ana-search" type="search" autocomplete="off" placeholder="Ex.: Haneda, Narita, HND, FUK" aria-controls="anaAirportList">'+
      '<p id="anaAirportStatus" role="status" class="microcopy">Carregando pontos…</p>'+
      '<div id="anaAirportList" class="ana-airport-list"></div>'+
      '<p class="microcopy">A localização exata do Ginásio ANA precisa ser conferida no mapa do Pokémon GO. GPX de Ginásios não será gerado a partir destes pontos.</p>';
    view.appendChild(section);main.appendChild(view);
    section.addEventListener('click',async event=>{
      const chosen=event.target.closest('[data-ana-phase]');
      if(chosen){phase=chosen.dataset.anaPhase;search='';section.querySelector('#anaAirportSearch').value='';render();return;}
      const btn=event.target.closest('[data-ana-coord]');if(!btn)return;
      const value=parse(btn.dataset.anaCoord);if(!value)return;
      try{await navigator.clipboard.writeText(value);if(typeof window.showToast==='function')window.showToast('Coordenadas do aeroporto copiadas.');else btn.textContent='Copiado!';}
      catch{window.prompt('Copie a coordenada do aeroporto:',value);}
    });
    section.querySelector('#anaAirportSearch').addEventListener('input',e=>{search=e.target.value;render();});
    fetch('data/events.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('dados indisponíveis');return r.json();}).then(json=>{
      events=(json.events||[]).filter(e=>IDS.includes(e.id));render();
    }).catch(()=>{const status=document.getElementById('anaAirportStatus');if(status)status.textContent='Não foi possível carregar os pontos ANA.';});
    // Lista versionada que exige os hashes EXATOS das artes originais do usuário.
    fetch('data/ana-pokemon-jet-approved-originals.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('original assets manifest unavailable');return r.json();}).then(data=>{
      originalPosters=Array.isArray(data.user_assets)?data.user_assets:[];
      render();
    }).catch(()=>{originalPosters=[];render();});
  }
  window.SpideyAnaAirportCore=Object.freeze({parse,matchesAirport});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();