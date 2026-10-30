(() => {
  'use strict';
  const DATA_URL='data/national-trust-2026.json';
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
  let doc=null,places=[],search='',group='all';
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
    view.innerHTML='<section class="hero hero-compact"><span class="eyebrow">REINO UNIDO • NATIONAL TRUST</span><h1>27 localidades</h1><p>Pesquisas Temporárias e referências geográficas para copiar.</p></section>';
    const details=document.createElement('details');details.id='nationalTrustGuide';details.className='section nt-guide';
    details.innerHTML='<summary><span class="eyebrow">REINO UNIDO • NATIONAL TRUST</span><strong>27 locais • pesquisas com Passe Premium</strong><span class="nt-more">Abrir lista de coordenadas</span></summary>'+
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
    // O guia de 27 localidades mantém seu próprio pôster, sem inventar Ginásios.
    const approved=window.SPIDEY_APPROVED_ART_MASTER?.['2026-national-trust-27-sites'];
    if(approved){
      const intro=details.querySelector('.nt-intro');
      const stage=document.createElement('div');stage.className='nt-poster-stage';
      const poster=document.createElement('img');
      poster.alt='Pokémon GO × National Trust — 27 locais com pesquisas presenciais';
      poster.loading='lazy';poster.src=approved.file+'?v='+approved.sha256.slice(0,12);
      poster.addEventListener('error',()=>{stage.hidden=true;});
      stage.append(poster);intro.prepend(stage);
    }
    details.open=true;view.append(details);main.appendChild(view);
    details.querySelector('#ntSearch').addEventListener('input',e=>{search=e.target.value;draw()});
    details.querySelector('#ntGroup').addEventListener('change',e=>{group=e.target.value;draw()});
    details.addEventListener('click',async e=>{
      const btn=e.target.closest('button[data-coord]');if(!btn)return;
      const v=parseCoord(btn.dataset.coord);if(!v)return;
      try{await navigator.clipboard.writeText(v);if(typeof window.showToast==='function')window.showToast('Referência do local copiada.');else btn.textContent='Copiado!';}
      catch{window.prompt('Copie a coordenada de referência:',v);}
    });
    fetch(DATA_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Falha na fonte');return r.json();}).then(json=>{doc=json;places=validPlaces(json);placesRevision++;draw();}).catch(()=>{
      const status=details.querySelector('#nationalTrustCount');if(status)status.textContent='Não foi possível carregar as localidades. Atualize a página.';
    });
  }
  window.SpideyNationalTrustCore=Object.freeze({validPlaces,parseCoord});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();