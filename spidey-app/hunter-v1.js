(() => {
  'use strict';
  // Links go to the source directly. No third-party scraping or fabricated results.
  const categories=[
    {id:'hundo',label:'💯 100%',url:'https://pogocoordinates.com/feeds/high-cp-100iv',tip:'Aparições 100% disponíveis nas fontes conectadas, quando houver. Cada coordenada pode expirar.'},
    {id:'nundo',label:'0️⃣ 0%',url:'https://pogocoordinates.com/feeds/zero-iv',tip:'Aparições 0% reportadas nas fontes conectadas, quando houver.'},
    {id:'shiny',label:'✨ Brilhante',url:'https://pogocoordinates.com/search',tip:'Shiny é individual por conta. Elegibilidade não garante brilhante.'},
    {id:'pvp',label:'⚔️ PvP',url:'https://pogocoordinates.com/search',tip:'Aparições com classificação PvP informada pela fonte, quando disponíveis.'},
    {id:'shundo',label:'💯✨ Shundo',url:'https://pogocoordinates.com/search',tip:'100% IV e possível Shiny, sem garantia de brilho para sua conta.'},
    {id:'shnundo',label:'0️⃣✨ Shnundo',url:'https://pogocoordinates.com/search',tip:'0% IV e possível Shiny, sem garantia de brilho para sua conta.'}
  ];
  let selected='hundo';
  // Chat messages are handled locally in the browser; never transmitted or saved.
  function parseMessageCoords(message){
    const raw=String(message || '').slice(0,3000);
    const pair=/(?:^|[^\d.-])([+-]?\d{1,2}(?:\.\d{1,12})?)\s*,\s*([+-]?\d{1,3}(?:\.\d{1,12})?)(?![\d.,])/.exec(raw);
    if(pair && (pair[1].includes('.')||pair[2].includes('.'))) {
      const candidate=parseCoords(pair[1]+','+pair[2]);
      if(candidate)return candidate;
    }
    const labeled=/\blat(?:itude)?\s*[:=]\s*([+-]?\d+(?:\.\d+)?)\s*[,;\s\r\n]+(?:lon(?:gitude)?|lng)\s*[:=]\s*([+-]?\d+(?:\.\d+)?)/i.exec(raw);
    return labeled?parseCoords(labeled[1]+','+labeled[2]):null;
  }
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
  // Interpret community posts on-device: do not fetch posts or invent expiration times.
  function parseSpawnMessage(message){
    const raw=String(message||'').slice(0,3000);
    const coords=parseMessageCoords(raw);
    if(!coords)return null;
    const tag=/(?:^|\s)#([A-Za-z][A-Za-z0-9.'’-]{1,32})(?=\s|$|[^\w])/u.exec(raw);
    const pokemon=tag?tag[1]:null;
    const statLine=raw.split(/\r?\n/).find(line=>/^\s*\d{1,5}\s+[♂♀]\s+\d{1,2}(?:\s|$|[^\d])/.test(line));
    const stats=statLine?/^\s*(\d{1,5})\s+([♂♀])\s+(\d{1,2})(?=\s|$|[^\d])/.exec(statLine):null;
    const cp=stats&&Number(stats[1])>=1&&Number(stats[1])<=10000?Number(stats[1]):null;
    const level=stats&&Number(stats[3])>=1&&Number(stats[3])<=50?Number(stats[3]):null;
    const gender=stats?(stats[2]==='♂'?'Macho':'Fêmea'):null;
    const claimedIV=/💯|(?:^|[^\w])100\s*%/u.test(raw)?100:null;
    const source=/(?:^|\s)iv100\.cc(?=\s|∙|$)/i.test(raw)?'iv100.cc':null;
    return {pokemon,cp,level,gender,claimedIV,source,coords,despawn:null};
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
    const main=document.querySelector('main'),nav=document.querySelector('.app-tabs');
    if(!main||!nav||el('hunterView'))return;
    const s=document.createElement('section');
    s.id='hunterView';s.className='app-view hunter-screen';s.hidden=true;
    s.setAttribute('aria-labelledby','hunterTitle');
    const hero=document.createElement('section');
    hero.className='hunter-intro';
    hero.innerHTML='<span class="hunter-kicker">SPIDEY • FILTRO GLOBAL</span><div class="hunter-intro-body"><div><h1 id="hunterTitle">Encontre sua próxima captura.</h1><p>IV perfeito, 0%, PvP e coordenadas de todo o mundo.</p></div><div class="hunter-orbit" aria-hidden="true"><span>◎</span></div></div><div class="hunter-service-note"><span class="hunter-status-dot"></span> Fontes externas • Sem busca automática</div>';
    const panel=document.createElement('section');
    panel.id='hunterPanel';panel.className='section hunter-panel';panel.setAttribute('aria-label','Filtros de busca de Pokémon');
    panel.innerHTML=[
      '<div class="hunter-heading"><div><span class="eyebrow">ESCOLHA SEU FILTRO</span><h2>Que Pokémon você procura?</h2><p>Selecione um filtro e abra os resultados na fonte original.</p></div><span class="hunter-source">Pesquisa externa</span></div>',
      '<div class="hunter-category-grid" role="group" aria-label="Escolha o tipo de Pokémon">',
      categories.map(c=>'<button class="hunter-category" type="button" data-hunter-category="'+c.id+'" aria-pressed="false">'+c.label+'</button>').join(''),
      '</div><p id="hunterTip" class="hunter-tip" role="status" aria-live="polite"></p>',
      '<a id="hunterExternal" class="action-btn hunter-outbound" href="https://pogocoordinates.com/search" target="_blank" rel="noopener noreferrer">Buscar no PoGo Coordinates ↗</a>',
      '<div id="hunterHundoFeeds" class="hunter-feed-shortcuts" hidden><span>Outros 100%:</span><a href="https://pogocoordinates.com/feeds/rare-100iv" target="_blank" rel="noopener noreferrer">Raros ↗</a><a href="https://pogocoordinates.com/feeds/regional-100iv" target="_blank" rel="noopener noreferrer">Regionais ↗</a><a href="https://pogocoordinates.com/feeds/level-35-100iv" target="_blank" rel="noopener noreferrer">Nível 35+ ↗</a></div>',
      '<p class="microcopy">As buscas abrem no site original. O Spidey não recebe seu login, código de treinador ou mensagens.</p>',
      '<section class="hunter-message-card" aria-labelledby="hunterMessageTitle"><span class="eyebrow">DISCORD E TELEGRAM</span><h2 id="hunterMessageTitle">Recebeu uma coordenada?</h2><p>Cole a mensagem de um canal para identificar latitude e longitude. Tudo é analisado neste aparelho, sem enviar mensagens para o Spidey.</p><div class="hunter-community-links"><a href="https://discord.gg/pokedex100" target="_blank" rel="noopener noreferrer">Pokedex100 • Discord ↗</a><a href="https://t.me/pokemon_pogo_iv100_100iv_100_pvp" target="_blank" rel="noopener noreferrer">Canal IV100 • Telegram ↗</a></div><p class="hunter-community-sources">Canais enviados pela comunidade. Ainda não importamos mensagens automaticamente nem verificamos aparições em tempo real.</p><label for="hunterMessage">Mensagem com coordenadas</label><textarea id="hunterMessage" rows="3" maxlength="3000" placeholder="Ex.: Pokémon 100% • -25.4221,-49.2717"></textarea><div class="hunter-message-actions"><button type="button" id="hunterExtract" class="action-btn">Ler mensagem</button><span class="hunter-message-caption">Ainda não há canais conectados automaticamente.</span></div><p id="hunterExtractStatus" role="status" aria-live="polite" class="microcopy"></p><div id="hunterParsed" class="hunter-parsed" hidden><span class="eyebrow">CAPTURA IDENTIFICADA</span><strong id="hunterParsedPokemon"></strong><span id="hunterParsedIV" class="hunter-parsed-iv"></span><div class="hunter-parsed-fields"><span id="hunterParsedCP" hidden></span><span id="hunterParsedGender" hidden></span><span id="hunterParsedLevel" hidden></span></div><code id="hunterParsedCoords"></code><small id="hunterParsedSource"></small><small>Sem horário de desaparecimento informado. Confira a aparição na origem.</small></div></section>',
      '<details id="hunterChecker" class="hunter-checker"><summary>Conferir uma coordenada ou IV</summary><div class="hunter-checker-body"><p class="microcopy">Use dados de uma aparição encontrada para verificar os valores e a localização.</p>',
      '<div class="hunter-iv-row"><label>Ataque <input id="hunterAttack" type="number" inputmode="numeric" min="0" max="15" placeholder="0–15"></label><label>Defesa <input id="hunterDefense" type="number" inputmode="numeric" min="0" max="15" placeholder="0–15"></label><label>PS <input id="hunterStamina" type="number" inputmode="numeric" min="0" max="15" placeholder="0–15"></label></div>',
      '<p id="hunterIvStatus" role="status" aria-live="polite"></p><label class="hunter-coord-label" for="hunterCoords">Coordenadas (latitude, longitude)</label>',
      '<input id="hunterCoords" type="text" autocomplete="off" spellcheck="false" placeholder="Ex.: -25.4221,-49.2717"><p id="hunterCoordStatus" class="microcopy" role="status" aria-live="polite"></p>',
      '<div class="hunter-actions"><button id="hunterPaste" type="button" class="action-btn">Colar coordenadas</button><button id="hunterCopy" type="button" class="action-btn" disabled>Copiar coordenadas</button><a id="hunterMap" class="action-btn" href="#" target="_blank" rel="noopener noreferrer" hidden>Abrir no mapa ↗</a></div></div></details>',
      '<p class="microcopy">O Shiny é individual por conta. Encontrar 100% não garante Shundo. Confira as regras do jogo.</p>'
    ].join('');
    s.append(hero,panel);
    main.append(s);
    const tab=document.createElement('button');
    tab.type='button';tab.className='app-tab hunter-tab';tab.dataset.view='hunterView';
    tab.textContent='Filtro';tab.setAttribute('aria-label','Filtro: Caçador Global');
    const flyTab=nav.querySelector('[data-view="flyView"]');
    if(flyTab)flyTab.insertAdjacentElement('afterend',tab);
    else nav.insertBefore(tab,nav.querySelector('[data-view="stampsView"]'));
    tab.addEventListener('click',()=>setView('hunterView'));
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
      if(event.target.id==='hunterExtract'){
        const report=parseSpawnMessage(el('hunterMessage').value);
        const preview=el('hunterParsed');
        if(!report){
          preview.hidden=true;
          el('hunterExtractStatus').textContent='Não encontrei latitude e longitude válidas. Confira a mensagem ou cole as coordenadas manualmente.';
          return;
        }
        el('hunterParsedPokemon').textContent=report.pokemon||'Pokémon não identificado';
        el('hunterParsedIV').textContent=report.claimedIV===100?'💯 100% informado pelo canal — não verificado':'IV não especificado na mensagem';
        const details=[
          ['hunterParsedCP',report.cp===null?'':'PC '+report.cp],
          ['hunterParsedGender',report.gender||''],
          ['hunterParsedLevel',report.level===null?'':'Nível '+report.level]
        ];
        details.forEach(([id,value])=>{el(id).textContent=value;el(id).hidden=!value;});
        el('hunterParsedCoords').textContent=report.coords;
        el('hunterParsedSource').textContent=report.source?'Fonte indicada: '+report.source:'Fonte não identificada na mensagem';
        preview.hidden=false;
        el('hunterChecker').open=true;
        el('hunterCoords').value=report.coords;
        renderCoords();
        el('hunterExtractStatus').textContent='Dados identificados no texto. Você pode copiar as coordenadas abaixo.';
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
  window.SpideyHunterCore=Object.freeze({classifyIV,parseCoords,parseMessageCoords,parseSpawnMessage});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();