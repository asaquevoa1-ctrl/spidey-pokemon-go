(() => {
  'use strict';
  const DATA_URL='data/national-trust-2026.json';
  // Cópia offline validada dos 27 locais aprovados: disponível mesmo se a
  // solicitação de JSON falhar, sem novo download ou catálogo dinâmico.
  // Sincronize e valide com data/national-trust-2026.json em QA.
  const EMBEDDED_PLACES=Object.freeze([{"id":"nt-2026-01","name":"Chirk Castle and Garden","group":"Sudoeste e País de Gales","region":"Wrexham","coordinates":"52.93539,-3.08941","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-02","name":"Killerton","group":"Sudoeste e País de Gales","region":"Devon","coordinates":"50.79128,-3.45763","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-03","name":"Kingston Lacy","group":"Sudoeste e País de Gales","region":"Dorset","coordinates":"50.81096,-2.03171","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-04","name":"Lacock","group":"Sudoeste e País de Gales","region":"Wiltshire","coordinates":"51.41496,-2.11760","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-05","name":"Stourhead","group":"Sudoeste e País de Gales","region":"Wiltshire","coordinates":"51.10507,-2.31787","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-06","name":"Tredegar House","group":"Sudoeste e País de Gales","region":"Newport","coordinates":"51.56176,-3.02789","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-07","name":"Trelissick","group":"Sudoeste e País de Gales","region":"Cornwall","coordinates":"50.21718,-5.03393","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-08","name":"Tyntesfield","group":"Sudoeste e País de Gales","region":"North Somerset","coordinates":"51.44079,-2.71242","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-09","name":"Dunham Massey","group":"Norte e Irlanda do Norte","region":"Grande Manchester","coordinates":"53.38284,-2.40014","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-10","name":"Fountains Abbey","group":"Norte e Irlanda do Norte","region":"North Yorkshire","coordinates":"54.10948,-1.58184","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-11","name":"Gibside","group":"Norte e Irlanda do Norte","region":"Tyne & Wear","coordinates":"54.92050,-1.73195","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-12","name":"Lyme","group":"Norte e Irlanda do Norte","region":"Cheshire","coordinates":"53.33804,-2.05470","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-13","name":"Mount Stewart","group":"Norte e Irlanda do Norte","region":"County Down · Irlanda do Norte","coordinates":"54.55165,-5.60212","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-14","name":"Anglesey Abbey","group":"Midlands e Leste","region":"Cambridgeshire","coordinates":"52.23649,0.24398","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-15","name":"Attingham Park","group":"Midlands e Leste","region":"Shropshire","coordinates":"52.68634,-2.66441","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-16","name":"Belton Estate","group":"Midlands e Leste","region":"Lincolnshire","coordinates":"52.94307,-0.617821","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-17","name":"Calke Abbey","group":"Midlands e Leste","region":"Derbyshire","coordinates":"52.79976,-1.45609","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-18","name":"Clumber Park","group":"Midlands e Leste","region":"Nottinghamshire","coordinates":"53.27095,-1.051910","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-19","name":"Hanbury Hall","group":"Midlands e Leste","region":"Worcestershire","coordinates":"52.27179,-2.08332","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-20","name":"Hardwick","group":"Midlands e Leste","region":"Derbyshire","coordinates":"53.16877,-1.30873","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-21","name":"Wimpole Estate","group":"Midlands e Leste","region":"Cambridgeshire","coordinates":"52.14105,-0.04978","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-22","name":"Cliveden","group":"Londres e Sudeste","region":"Buckinghamshire","coordinates":"51.55685,-0.68172","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-23","name":"Mottisfont","group":"Londres e Sudeste","region":"Hampshire","coordinates":"51.04112,-1.535211","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-24","name":"Nymans","group":"Londres e Sudeste","region":"West Sussex","coordinates":"51.04923,-0.19526","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-25","name":"Polesden Lacey","group":"Londres e Sudeste","region":"Surrey","coordinates":"51.25884,-0.37418","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-26","name":"Scotney Castle","group":"Londres e Sudeste","region":"Kent","coordinates":"51.09283,0.40826","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false},{"id":"nt-2026-27","name":"Stowe Gardens","group":"Londres e Sudeste","region":"Buckinghamshire","coordinates":"52.02206,-1.00813","coordinate_type":"community_site_reference","exact_research_trigger_verified":false,"exact_pokestop_verified":false}]);

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const parseCoord=s=>{
    if(!/^-?\d{1,2}\.\d+,-?\d{1,3}\.\d+$/.test(String(s||'')))return null;
    const [lat,lon]=s.split(',').map(Number);
    return Math.abs(lat)<=90&&Math.abs(lon)<=180?s:null;
  };
  function validPlaces(data){
    if(data?.schema!=='spidey-national-trust-sites-v1'||!Array.isArray(data.places))throw Error('dados inválidos');
    return data.places.filter(p=>p&&p.coordinate_type==='community_site_reference'&&
      p.exact_research_trigger_verified===false&&p.exact_pokestop_verified===false&&
      parseCoord(p.coordinates)&&typeof p.name==='string'&&p.name.length<100&&
      typeof p.group==='string'&&p.group.length<80&&typeof p.region==='string'&&p.region.length<80);
  }
  let doc=null,places=validPlaces({schema:'spidey-national-trust-sites-v1',places:EMBEDDED_PLACES}),search='',group='all';
  let lastDisplayedPlaces=null;
  let placesRevision=0;
  const root=()=>document.getElementById('nationalTrustGuide');
  function draw(){
    const el=root();if(!el)return;
    const list=el.querySelector('#nationalTrustPlaces');
    const count=el.querySelector('#nationalTrustCount');
    const query=clean(search.trim());
    const filtered=places.filter(p=>(group==='all'||p.group===group)&&
      clean(p.name+' '+p.region+' '+p.group).includes(query));
    count.textContent=filtered.length+' de '+places.length+' locais • pontos comunitários';
    const identity=placesRevision+'|'+filtered.map(p=>p.id||p.name+'@'+p.coordinates).join('|');
    // Preserve DOM and keyboard focus when changing search text keeps the same matches.
    if(identity===lastDisplayedPlaces)return;
    lastDisplayedPlaces=identity;
    list.replaceChildren();
    const fragment=document.createDocumentFragment();
    for(const p of filtered){
      const item=document.createElement('article');item.className='nt-place';
      const details=document.createElement('div');details.className='nt-place-text';
      const heading=document.createElement('strong');heading.textContent=p.name;
      const desc=document.createElement('small');desc.textContent=p.region+' • '+p.group;
      const caution=document.createElement('small');caution.textContent='Referência geográfica • ativação da pesquisa não verificada';
      const code=document.createElement('code');code.textContent=p.coordinates;
      details.append(heading,desc,caution,code);
      const copy=document.createElement('button');copy.type='button';copy.className='action-btn nt-copy';copy.dataset.coord=p.coordinates;copy.textContent='Copiar coordenadas';
      const map=document.createElement('a');map.className='action-btn';map.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.coordinates);map.target='_blank';map.rel='noopener noreferrer';map.textContent='Mapa';
      item.append(details,copy,map);fragment.append(item);
    }
    list.append(fragment);
    if(!filtered.length){
      const p=document.createElement('p');p.className='microcopy';p.textContent='Nenhum local encontrado com esse filtro.';list.append(p);
    }
  }
  function mount(){
    const main=document.querySelector('main');
    if(!main||root())return;
    const view=document.createElement('section');
    view.id='nationalTrustView';view.className='app-view national-trust-standalone';view.hidden=true;
    view.innerHTML='<section class="hero hero-compact"><span class="eyebrow">REINO UNIDO · NATIONAL TRUST</span><h1>27 coordenadas para copiar</h1><p>Lista completa logo abaixo. Referências comunitárias, não locais exatos de pesquisa confirmados.</p></section>';
    const details=document.createElement('details');details.id='nationalTrustGuide';details.className='section nt-guide';
    details.innerHTML='<summary><span class="eyebrow">REINO UNIDO · NATIONAL TRUST</span><strong>27 coordenadas disponíveis</strong><span class="nt-more">Toque para mostrar ou ocultar a lista</span></summary>'+
      '<div class="nt-intro"><p><strong>Até 27 Passes Premium potenciais.</strong> São 27 Pesquisas Temporárias locais, de 3 etapas. Na terceira etapa, a tarefa de <strong>30 lançamentos bons de bola curva</strong> recompensa 1 Passe de Batalha Premium por pesquisa.</p>'+
      '<p><strong>Parceria prorrogada até 31/12/2026.</strong> As pesquisas também exigem caminhar, chocar Ovo, girar PokéParadas e participar de reides. Recebimento e acúmulo de todas as pesquisas não são garantidos.</p>'+
      '<p class="nt-caution">As coordenadas foram compartilhadas pela comunidade e <strong>não são pontos exatos verificados de ativação, Ginásios ou PokéParadas</strong>. O Spidey não altera GPS, não confirma ausência de cooldown e não garante recompensas. Utilize as regras oficiais do jogo.</p>'+
      '<div class="nt-actions"><a href="https://pokemongo.com/news/nationaltrust-2026" target="_blank" rel="noopener noreferrer" class="action-btn">Anúncio oficial ↗</a>'+
      '<a href="https://pokemongohub.net/post/event/national-trust-x-pokemon-go-events/" target="_blank" rel="noopener noreferrer" class="action-btn">Etapas da pesquisa ↗</a></div>'+
      '<div class="nt-toolbar"><label for="ntSearch">Encontrar local</label><input id="ntSearch" placeholder="Ex.: Chirk, Londres, Wimpole..." type="search" autocomplete="off" maxlength="90"/>'+
      '<label for="ntGroup">Região</label><select id="ntGroup"><option value="all">Todas as regiões</option>'+
      '<option value="Sudoeste e País de Gales">Sudoeste e País de Gales (8)</option>'+
      '<option value="Norte e Irlanda do Norte">Norte e Irlanda do Norte (5)</option>'+
      '<option value="Midlands e Leste">Midlands e Leste (8)</option>'+
      '<option value="Londres e Sudeste">Londres e Sudeste (6)</option></select></div>'+
      '<p id="nationalTrustCount" role="status" class="microcopy">Carregando 27 locais…</p>'+
      '<div id="nationalTrustPlaces" class="nt-place-list"></div></div>';
    // Coordenadas primeiro, sem rolagem pelo pôster ou pela explicação longa.
    const intro=details.querySelector('.nt-intro');
    const toolbar=details.querySelector('.nt-toolbar');
    const count=details.querySelector('#nationalTrustCount');
    const list=details.querySelector('#nationalTrustPlaces');
    const heading=document.createElement('h2');
    heading.className='nt-coordinates-heading';
    heading.textContent='27 coordenadas de referência';
    intro.prepend(heading,toolbar,count,list);
    // O guia de 27 localidades mantém seu próprio pôster, APÓS a lista.

    const approved=window.SPIDEY_APPROVED_ART_MASTER?.['2026-national-trust-27-sites'];
    if(approved){
      const stage=document.createElement('div');stage.className='nt-poster-stage';
      const poster=document.createElement('img');
      poster.alt='Pokémon GO × National Trust — 27 locais com pesquisas presenciais';
      poster.loading='lazy';poster.src=approved.file+'?v='+approved.sha256.slice(0,12);
      poster.addEventListener('error',()=>{stage.hidden=true;});
      stage.append(poster);intro.append(stage);
    }
    details.open=true;view.append(details);main.appendChild(view);
    // A primeira pintura já contém os 27 locais (sem rede).
    placesRevision++;draw();
    details.querySelector('#ntSearch').addEventListener('input',e=>{search=e.target.value;draw()});
    details.querySelector('#ntGroup').addEventListener('change',e=>{group=e.target.value;draw()});
    details.addEventListener('click',async e=>{
      const btn=e.target.closest('button[data-coord]');if(!btn)return;
      const v=parseCoord(btn.dataset.coord);if(!v)return;
      try{await navigator.clipboard.writeText(v);if(typeof window.showToast==='function')window.showToast('Referência do local copiada.');else btn.textContent='Copiado!';}
      catch{window.prompt('Copie a coordenada de referência:',v);}
    });
    // Atualização opcional da fonte; um erro de rede NUNCA esconde a lista.
    fetch(DATA_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Falha na fonte');return r.json();}).then(json=>{
      const latest=validPlaces(json);
      if(latest.length!==27)throw Error('Fonte Trust incompleta');
      doc=json;places=latest;placesRevision++;draw();
    }).catch(()=>{ /* As 27 referências embarcadas permanecem disponíveis. */ });
  }
  // O mesmo conjunto de 27 referências deve acompanhar o próprio evento.
  // Antes, a janela de detalhes só encaminhava à aba Trust e parecia vazia.
  let eventPlacesPromise=null;
  const loadEventPlaces=()=>{
    if(places.length===27)return Promise.resolve(places);
    return eventPlacesPromise ||= fetch(DATA_URL,{cache:'no-store'})
      .then(res=>{if(!res.ok)throw Error('Base Trust indisponível');return res.json();})
      .then(json=>{
        const verifiedStructure=validPlaces(json);
        if(verifiedStructure.length!==27)throw Error('Lista Trust incompleta');
        return verifiedStructure;
      })
      .catch(err=>{eventPlacesPromise=null;throw err;});
  };
  function renderEventCoordinates(target,isCurrent=()=>true){
    if(!target)return;
    const status=target.querySelector('[data-nt-event-status]');
    const content=target.querySelector('[data-nt-event-list]');
    if(!status||!content)return;
    const current=()=>target.isConnected&&isCurrent();
    status.textContent='Carregando as 27 coordenadas de referência…';
    content.replaceChildren();
    loadEventPlaces().then(items=>{
      if(!current())return;
      status.textContent=items.length+' locais com coordenadas disponíveis para copiar. Referências comunitárias, não pontos exatos verificados de ativação.';
      const groups=new Map();
      for(const p of items){
        if(!groups.has(p.group))groups.set(p.group,[]);
        groups.get(p.group).push(p);
      }
      const fragment=document.createDocumentFragment();
      for(const [name,values] of groups){
        const section=document.createElement('details');
        section.className='nt-event-group';section.open=true;
        const heading=document.createElement('summary');
        heading.textContent=name+' ('+values.length+')';
        section.append(heading);
        const grid=document.createElement('div');
        grid.className='nt-event-grid';
        for(const p of values){
          const item=document.createElement('article');
          item.className='nt-event-place';
          const title=document.createElement('strong');title.textContent=p.name;
          const region=document.createElement('small');
          region.textContent=p.region+' · referência comunitária';
          const coord=document.createElement('code');
          coord.textContent=p.coordinates;
          const copy=document.createElement('button');copy.type='button';
          copy.className='action-btn nt-event-copy';
          copy.textContent='Copiar coordenadas';
          copy.dataset.coord=p.coordinates;
          item.append(title,region,coord,copy);grid.append(item);
        }
        section.append(grid);fragment.append(section);
      }
      content.replaceChildren(fragment);
    }).catch(()=>{
      if(!current())return;
      status.textContent='Não foi possível carregar as coordenadas. A lista continua disponível na aba Trust.';
      const retry=document.createElement('button');
      retry.type='button';retry.className='action-btn';
      retry.textContent='Tentar carregar novamente';
      retry.addEventListener('click',()=>renderEventCoordinates(target,isCurrent),{once:true});
      content.replaceChildren(retry);
    });
    if(target.dataset.ntCopyBound==='true')return;
    target.dataset.ntCopyBound='true';
    target.addEventListener('click',async e=>{
      const btn=e.target.closest('button.nt-event-copy[data-coord]');
      if(!btn||!target.contains(btn))return;
      const coordinate=parseCoord(btn.dataset.coord);
      if(!coordinate)return;
      try{
        await navigator.clipboard.writeText(coordinate);
        if(typeof window.showToast==='function')window.showToast('Referência copiada.');
        else btn.textContent='Copiado!';
      }catch{
        window.prompt('Copie a coordenada:',coordinate);
      }
    });
  }
  window.SpideyNationalTrustCore=Object.freeze({validPlaces,parseCoord,renderEventCoordinates});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();