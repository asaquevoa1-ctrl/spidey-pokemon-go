(() => {
  'use strict';
  // Links go to the source directly. No third-party scraping or fabricated results.
  const categories=[
    {id:'hundo',label:'💯 100%',url:'https://pogocoordinates.com/feeds/high-cp-100iv',tip:'Veja aparições 15/15/15 na fonte externa. Nem todas as regiões são monitoradas.'},
    {id:'nundo',label:'0️⃣ 0%',url:'https://pogocoordinates.com/feeds/zero-iv',tip:'Veja aparições 0/0/0 na fonte externa, quando existirem.'},
    {id:'shiny',label:'✨ Brilhante',url:'https://pogocoordinates.com/search',tip:'A previsão personalizada de Shiny é uma alegação da fonte, ainda não validada pelo Spidey.'},
    {id:'pvp',label:'⚔️ PvP',url:'https://pogocoordinates.com/search',tip:'No site, selecione PvP. A melhor combinação de IV depende da espécie e da liga.'},
    {id:'shundo',label:'💯✨ Shundo',url:'https://pogocoordinates.com/search',tip:'Combine IV 100% com Shiny Only, se disponível. Não há garantia de brilhante.'},
    {id:'shnundo',label:'0️⃣✨ Shnundo',url:'https://pogocoordinates.com/search',tip:'Combine IV 0% com Shiny Only, se disponível. Não há garantia de brilhante.'}
  ];
  let selected='hundo';
  const el=id=>document.getElementById(id);
  function classifyIV(v){
    if(!Array.isArray(v)||v.length!==3||v.some(n=>!Number.isInteger(n)||n<0||n>15))return null;
    const total=v.reduce((a,b)=>a+b,0);
    return {percent:Math.round(total*100/45),hundo:total===45,nundo:total===0};
  }
  function parseCoords(v){
    const m=/^\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*$/.exec(String(v||''));
    if(!m)return null;
    const a=Number(m[1]),b=Number(m[2]);
    return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a)<=90&&Math.abs(b)<=180?m[1]+','+m[2]:null;
  }
  function renderCategory(){
    const item=categories.find(x=>x.id===selected);
    if(!item)return;
    document.querySelectorAll('[data-hunter-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hunterCategory===selected)));
    el('hunterTip').textContent=item.tip;
    el('hunterExternal').href=item.url;
    el('hunterHundoFeeds').hidden=selected!=='hundo';
  }
  function renderIV(){
    const values=['hunterAttack','hunterDefense','hunterStamina'].map(id=>el(id).value.trim());
    const status=el('hunterIvStatus');
    if(values.every(v=>v==='')){status.textContent='Preencha os três valores para conferir o IV.';return;}
    if(values.some(v=>!/^(?:[0-9]|1[0-5])$/.test(v))){status.textContent='Informe três números inteiros entre 0 e 15.';return;}
    const result=classifyIV(values.map(Number));
    status.textContent=result.hundo?'💯 IV 100% (15/15/15)':result.nundo?'0️⃣ IV 0% (0/0/0)':'IV '+result.percent+'%. Isso não confirma Shiny ou posição no ranking PvP.';
  }
  function renderCoords(){
    const coord=parseCoords(el('hunterCoords').value);
    el('hunterCopy').disabled=!coord;
    el('hunterMap').hidden=!coord;
    if(coord)el('hunterMap').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(coord);
    el('hunterCoordStatus').textContent=coord?'Coordenadas válidas. Confira se o Pokémon ainda aparece no jogo.':'Cole latitude e longitude, separadas por vírgula.';
  }
  function mount(){
    const fly=el('flyView');
    if(!fly||el('hunterPanel'))return;
    const s=document.createElement('section');
    s.id='hunterPanel';s.className='section hunter-panel';s.setAttribute('aria-labelledby','hunterTitle');
    s.innerHTML=[
      '<div class="hunter-heading"><div><span class="eyebrow">FLY • CAÇADOR GLOBAL</span><h2 id="hunterTitle">Encontre Pokémon pelo mundo</h2><p>Busque por IV, brilhante ou PvP, sem resultados inventados.</p></div><span class="hunter-source">Fonte externa</span></div>',
      '<div class="hunter-category-grid" role="group" aria-label="Escolha o tipo de Pokémon">',
      categories.map(c=>'<button class="hunter-category" type="button" data-hunter-category="'+c.id+'" aria-pressed="false">'+c.label+'</button>').join(''),
      '</div><p id="hunterTip" class="hunter-tip" role="status" aria-live="polite"></p>',
      '<a id="hunterExternal" class="action-btn hunter-outbound" href="https://pogocoordinates.com/search" target="_blank" rel="noopener noreferrer">Buscar no PoGo Coordinates ↗</a>',
      '<div id="hunterHundoFeeds" class="hunter-feed-shortcuts" hidden><span>Outros 100%:</span><a href="https://pogocoordinates.com/feeds/rare-100iv" target="_blank" rel="noopener noreferrer">Raros ↗</a><a href="https://pogocoordinates.com/feeds/regional-100iv" target="_blank" rel="noopener noreferrer">Regionais ↗</a><a href="https://pogocoordinates.com/feeds/level-35-100iv" target="_blank" rel="noopener noreferrer">Nível 35+ ↗</a></div>',
      '<p class="microcopy">A pesquisa abre no site original. O Spidey não importa aparições nem recebe seus dados de login.</p>',
      '<details class="hunter-checker"><summary>Conferir uma coordenada ou IV</summary><div class="hunter-checker-body"><p class="microcopy">Use dados de uma aparição encontrada para verificar os valores e a localização.</p>',
      '<div class="hunter-iv-row"><label>Ataque <input id="hunterAttack" type="number" inputmode="numeric" min="0" max="15" placeholder="0–15"></label><label>Defesa <input id="hunterDefense" type="number" inputmode="numeric" min="0" max="15" placeholder="0–15"></label><label>PS <input id="hunterStamina" type="number" inputmode="numeric" min="0" max="15" placeholder="0–15"></label></div>',
      '<p id="hunterIvStatus" role="status" aria-live="polite"></p><label class="hunter-coord-label" for="hunterCoords">Coordenadas (latitude, longitude)</label>',
      '<input id="hunterCoords" type="text" autocomplete="off" spellcheck="false" placeholder="Ex.: -25.4221,-49.2717"><p id="hunterCoordStatus" class="microcopy" role="status" aria-live="polite"></p>',
      '<div class="hunter-actions"><button id="hunterPaste" type="button" class="action-btn">Colar coordenadas</button><button id="hunterCopy" type="button" class="action-btn" disabled>Copiar coordenadas</button><a id="hunterMap" class="action-btn" href="#" target="_blank" rel="noopener noreferrer" hidden>Abrir no mapa ↗</a></div></div></details>',
      '<p class="microcopy">O Shiny é individual por conta. Encontrar 100% não garante Shundo. Confira as regras do jogo.</p>'
    ].join('');
    const hero=fly.querySelector('.hero');
    if(hero)hero.insertAdjacentElement('afterend',s);else fly.prepend(s);
    s.addEventListener('click',async event=>{
      const category=event.target.closest('[data-hunter-category]');
      if(category){selected=category.dataset.hunterCategory;renderCategory();return;}
      if(event.target.id==='hunterPaste'){
        try{
          if(!navigator.clipboard?.readText)throw Error('Sem acesso');
          const pasted=(await navigator.clipboard.readText()).trim();
          if(!parseCoords(pasted)){el('hunterCoordStatus').textContent='O texto copiado não contém uma coordenada válida. Cole latitude,longitude manualmente.';return;}
          el('hunterCoords').value=pasted;renderCoords();
        }catch{el('hunterCoords').focus();el('hunterCoordStatus').textContent='Seu navegador não permitiu a colagem automática. Toque no campo e escolha Colar.';}
        return;
      }
      if(event.target.id!=='hunterCopy')return;
      const coords=parseCoords(el('hunterCoords').value);
      if(!coords)return;
      try{await navigator.clipboard.writeText(coords);if(typeof showToast==='function')showToast('Coordenadas copiadas.');}
      catch{window.prompt('Copie as coordenadas:',coords);}
    });
    ['hunterAttack','hunterDefense','hunterStamina'].forEach(id=>el(id).addEventListener('input',renderIV));
    el('hunterCoords').addEventListener('input',renderCoords);
    renderCategory();renderIV();renderCoords();
  }
  window.SpideyHunterCore=Object.freeze({classifyIV,parseCoords});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();