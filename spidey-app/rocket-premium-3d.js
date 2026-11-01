/* Explorar Rockets 3D — Spidey Premium
 * Fonte única dos Pokémon: data/rocket-lineups.json já validado pelo guia.
 * Coverflow interativo no mesmo princípio da Home: touch, setas, teclado e fallback.
 * Não substitui cards nem filtro de recrutas; não promete captura/shiny.
 */
(() => {
  'use strict';
  const ORDER = ['giovanni','cliff','arlo','sierra'];
  const ART = Object.freeze({
    Persian:53,Kangaskhan:115,Rhyperior:464,Machamp:68,Zekrom:644,
    Cubone:104,Snorlax:143,Golurk:623,'Galarian Weezing':10167,Tyranitar:248,Camerupt:323,Gallade:475,
    'Alolan Grimer':10112,Steelix:208,Slowbro:80,Alakazam:65,Charizard:6,Scizor:212,
    Pancham:674,Blastoise:9,Flygon:330,Ferrothorn:598,Milotic:350,Houndoom:229
  });
  // IDs de formas regionais específicos: nunca usar imagem da forma comum no lugar.
  const LABELS = {giovanni:'CHEFE',cliff:'LÍDER',arlo:'LÍDER',sierra:'LÍDER'};
  const COLORS = {giovanni:'ruby',cliff:'blue',arlo:'ember',sierra:'violet'};
  let current = 0;
  let lastSignature = '';
  const elt = (tag, cls, label) => {
    const el = document.createElement(tag);
    if(cls) el.className = cls;
    if(label !== undefined) el.textContent = label;
    return el;
  };
  function makePortrait(name) {
    const wrap = elt('span','rocket-3d-mon-art');
    const id = ART[name];
    if(id) {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = name;
      img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png';
      img.addEventListener('error', () => img.remove(), {once:true});
      wrap.append(img);
    }
    return wrap;
  }
  function buildCard(member,index) {
    const card = elt('button','rocket-3d-card');
    card.type = 'button';
    card.dataset.rocketSlide = String(index);
    card.dataset.rocketTone = COLORS[member.id] || 'ruby';
    card.setAttribute('aria-label','Selecionar ' + member.label + ' na galeria 3D');
    const artwork = elt('span','rocket-3d-art-panel');
    artwork.append(elt('span','rocket-3d-watermark','R'));
    const main = member.slots[0].pokemon[0].name;
    artwork.append(makePortrait(main));
    const nameplate = elt('span','rocket-3d-nameplate');
    nameplate.append(elt('small','rocket-3d-rank',LABELS[member.id]));
    nameplate.append(elt('strong','rocket-3d-name',member.label));
    artwork.append(nameplate);
    card.append(artwork);
    const lineup = elt('span','rocket-3d-lineup');
    member.slots.forEach((slot,i) => {
      const row = elt('span','rocket-3d-slot');
      row.append(elt('b','rocket-3d-slot-number',String(i+1) + 'º'));
      const pkm = elt('span','rocket-3d-slot-names');
      slot.pokemon.forEach((p,j) => {
        const badge = elt('span','rocket-3d-pokemon');
        if(ART[p.name]) {
          const thumb = document.createElement('img');
          thumb.className = 'rocket-3d-mini';
          thumb.alt = '';
          thumb.loading = 'lazy';
          thumb.decoding = 'async';
          thumb.dataset.rocketMiniUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + ART[p.name] + '.png';
          thumb.addEventListener('error',()=>thumb.remove(),{once:true});
          badge.append(thumb);
        }
        badge.append(elt('span','rocket-3d-pokemon-label',p.name));
        if(p.shiny_possible) badge.append(elt('sup','rocket-3d-shiny',' ✦'));
        pkm.append(badge);
      });
      row.append(pkm);
      lineup.append(row);
    });
    card.append(lineup);
    return card;
  }
  function openDetails(member) {
    // Mantém os filtros originais como fonte única e o histórico de expansão.
    const input = document.getElementById('rocketSearch');
    if(input && input.value) {
      input.value = '';
      input.dispatchEvent(new Event('input',{bubbles:true}));
    }
    const filter = document.querySelector('#rocketFilter [data-rocket-group="leaders"]');
    if(filter && filter.getAttribute('aria-pressed') !== 'true') filter.click();
    window.setTimeout(() => {
      const details = document.querySelector('#rocketRoster [data-rocket-member="' + member.id + '"]');
      if(!details) return;
      details.open = true;
      details.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      details.querySelector('summary')?.focus({preventScroll:true});
    },150);
  }
  function mount(data) {
    const view = document.getElementById('rocketGuideView');
    const controls = view?.querySelector('.rocket-controls');
    if(!view || !controls || !Array.isArray(data?.members)) return;
    const members = ORDER.map(id => data.members.find(m=>m.id===id)).filter(Boolean);
    if(members.length !== 4 || members.some(m=>m.slots?.length!==3)) return;
    const signature = JSON.stringify(members) + '|' + String(data.source?.source_updated_on);
    if(signature === lastSignature && document.getElementById('rocketExplore3d')) return;
    lastSignature = signature;
    current = Math.min(current, members.length-1);
    document.getElementById('rocketExplore3d')?.remove();
    const section = elt('section','rocket-3d');
    section.id = 'rocketExplore3d';
    section.setAttribute('aria-label','Explorar Giovanni e líderes em três dimensões');
    const heading = elt('div','rocket-3d-heading');
    const copy = elt('div','rocket-3d-heading-copy');
    copy.append(elt('span','rocket-3d-eyebrow','SPIDEY PREMIUM · EQUIPE GO ROCKET'));
    copy.append(elt('h2','', 'Explorar 3D'));
    copy.append(elt('p','', 'Deslize os cards ou use as setas. Toque para selecionar um líder.'));
    const brand = document.createElement('img');
    brand.src = 'assets/branding/20261019/spidey-icon-cosmic-192.png';
    brand.alt = 'Emblema oficial Spidey';
    brand.className = 'rocket-3d-brand';
    brand.loading = 'lazy';
    heading.append(copy,brand);
    const viewport = elt('div','rocket-3d-viewport');
    viewport.tabIndex = 0;
    viewport.setAttribute('role','group');
    viewport.setAttribute('aria-label','Carrossel 3D de chefes Rocket, quatro cards');
    const stage = elt('div','rocket-3d-stage');
    const cards = members.map((m,i)=>buildCard(m,i));
    stage.append(...cards);
    viewport.append(stage);
    const footer = elt('div','rocket-3d-footer');
    const previous = elt('button','rocket-3d-arrow','‹');
    previous.type = 'button'; previous.setAttribute('aria-label','Líder anterior');
    const position = elt('span','rocket-3d-position');
    position.setAttribute('aria-live','polite');
    const next = elt('button','rocket-3d-arrow','›');
    next.type = 'button'; next.setAttribute('aria-label','Próximo líder');
    const details = elt('button','rocket-3d-open','Ver escalação completa');
    details.type = 'button';
    footer.append(previous, position, next, details);
    const caveat = elt('p','rocket-3d-caveat',
      'Escalações alternativas, não um time fixo. Fonte comunitária: Leek Duck · ' +
      (data.source?.source_updated_on || 'sem data') + '. Imagens ilustrativas: PokéAPI.');
    section.append(heading,viewport,footer,caveat);
    controls.parentNode.insertBefore(section,controls);
    function draw() {
      cards.forEach((card,i) => {
        let delta = i-current;
        if(delta > members.length/2) delta-=members.length;
        if(delta < -members.length/2) delta+=members.length;
        card.dataset.position = delta === 0 ? 'center' : delta === -1 ? 'left' : delta === 1 ? 'right' : 'hidden';
        card.tabIndex = delta === 0 ? 0 : -1;
        card.setAttribute('aria-hidden',String(delta !== 0));
        // Só carrega miniaturas do card em foco ou dos cards vizinhos.
        if(Math.abs(delta)<=1) card.querySelectorAll('img[data-rocket-mini-url]').forEach(img=>{
          if(!img.src) img.src = img.dataset.rocketMiniUrl;
        });
      });
      position.textContent = (current+1) + ' / ' + members.length + ' · ' + members[current].label;
      details.setAttribute('aria-label','Ver escalação completa de ' + members[current].label);
    }
    function move(n) {current=(current+n+members.length)%members.length; draw();}
    previous.addEventListener('click',()=>move(-1));
    next.addEventListener('click',()=>move(1));
    details.addEventListener('click',()=>openDetails(members[current]));
    stage.addEventListener('click',event=>{
      const card=event.target.closest('[data-rocket-slide]');
      if(!card)return;
      const idx=Number(card.dataset.rocketSlide);
      if(idx===current)openDetails(members[current]);
      else {current=idx;draw();}
    });
    viewport.addEventListener('keydown',event=>{
      if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
        event.preventDefault();move(event.key==='ArrowRight'?1:-1);
      }else if(event.key==='Enter' && event.target===viewport){
        event.preventDefault();openDetails(members[current]);
      }
    });
    let finger=null;
    viewport.addEventListener('pointerdown',event=>{
      if(event.pointerType==='touch'||event.pointerType==='pen')finger={x:event.clientX,y:event.clientY,id:event.pointerId};
    },{passive:true});
    viewport.addEventListener('pointerup',event=>{
      if(!finger||finger.id!==event.pointerId)return;
      const dx=event.clientX-finger.x,dy=event.clientY-finger.y;
      finger=null;
      if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2){
        move(dx<0?1:-1);
        viewport.dataset.swiped='true';
        window.setTimeout(()=>{delete viewport.dataset.swiped;},120);
      }
    },{passive:true});
    viewport.addEventListener('click',event=>{
      if(viewport.dataset.swiped){event.preventDefault();event.stopPropagation();}
    },true);
    draw();
  }
  window.SpideyRocketPremium3D = Object.freeze({mount});
})();