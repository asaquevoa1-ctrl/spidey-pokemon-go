(() => {
  'use strict';
  // Read-only feed. A collector is NOT active until the operator authorizes a source.
  // Never scrape social networks or show fixtures as real spawns.
  const FEED_PATH='data/hunter-feed.json';
  const REFRESH_MS=60000;
  const MAX_AGE_MS=30*60000;
  const el=id=>document.getElementById(id);
  const core=()=>window.SpideyHunterCore;
  let snapshot=null, lastError='', fetching=false;
  const validDate=value=>{
    if(typeof value!=='string'||!/\d{4}-\d{2}-\d{2}T/.test(value))return null;
    const ts=Date.parse(value);
    return Number.isFinite(ts)?ts:null;
  };
  function sanitizeFeed(data,now=Date.now()){
    if(!data||data.schema!=='spidey-hunter-feed-v1'||!Array.isArray(data.items))
      throw Error('invalid_hunter_feed');
    if(data.source_status!=='connected'||data.items.length===0)
      return {connected:false,generated_at:null,items:[]};
    const generated=validDate(data.generated_at);
    if(generated===null||generated>now+60000||now-generated>MAX_AGE_MS)
      return {connected:false,stale:true,generated_at:generated,items:[]};
    const items=[],keys=new Set();
    for(const raw of data.items.slice(0,300)){
      if(!raw||typeof raw!=='object')continue;
      const coords=core()?.parseCoords(raw.coordinates);
      const expiry=validDate(raw.expires_at);
      if(!coords||expiry===null||expiry<=now||expiry-now>30*60000)continue;
      const seen=validDate(raw.reported_at);
      if(seen===null||seen>now+60000||now-seen>30*60000)continue;
      if(typeof raw.pokemon!=='string'||raw.pokemon.length>48||!raw.pokemon.trim())continue;
      const iv=[0,100].includes(raw.iv_percent)?raw.iv_percent:null;
      const pvp=Number.isInteger(raw.pvp_rank)&&raw.pvp_rank>=1&&raw.pvp_rank<=4096?raw.pvp_rank:null;
      const shinyEligible=raw.shiny_eligible===true;
      if(iv===null&&pvp===null&&!shinyEligible)continue;
      const source=typeof raw.source==='string'?raw.source.slice(0,64):'Fonte autorizada';
      const id=coords+'|'+raw.pokemon.trim().toLowerCase()+'|'+String(iv)+'|'+String(pvp);
      if(keys.has(id))continue;keys.add(id);
      const cp=Number.isInteger(raw.cp)&&raw.cp>=1&&raw.cp<=10000?raw.cp:null;
      const level=Number.isInteger(raw.level)&&raw.level>=1&&raw.level<=50?raw.level:null;
      const gender=['Macho','Fêmea'].includes(raw.gender)?raw.gender:null;
      items.push({
        pokemon:raw.pokemon.trim(),coordinates:coords,iv_percent:iv,cp,level,gender,
        pvp_rank:pvp,shiny_eligible:shinyEligible,source,expires_at:expiry,reported_at:seen
      });
    }
    return {connected:true,generated_at:generated,items:items.sort((a,b)=>a.expires_at-b.expires_at)};
  }
  function category(){return document.querySelector('[data-hunter-category][aria-pressed="true"]')?.dataset.hunterCategory||'hundo';}
  function relevant(item,kind){
    switch(kind){
      case 'hundo':return item.iv_percent===100;
      case 'nundo':return item.iv_percent===0;
      case 'pvp':return item.pvp_rank!==null;
      case 'shiny':return item.shiny_eligible;
      case 'shundo':return item.shiny_eligible&&item.iv_percent===100;
      case 'shnundo':return item.shiny_eligible&&item.iv_percent===0;
      default:return false;
    }
  }
  const make=(tag,className,text)=>{
    const n=document.createElement(tag);
    if(className)n.className=className;
    if(text!==undefined)n.textContent=String(text);
    return n;
  };
  function countdown(expires,now){
    const seconds=Math.max(0,Math.floor((expires-now)/1000));
    return seconds<=0?'Expirado':Math.ceil(seconds/60)+' min restantes';
  }
  function render(now=Date.now()){
    const region=el('hunterLiveList'),status=el('hunterLiveStatus');
    if(!region||!status)return;
    region.replaceChildren();
    if(lastError){status.textContent='Não foi possível atualizar as aparições. Tente novamente.';return;}
    if(!snapshot||!snapshot.connected){
      status.textContent=snapshot?.stale?'Fonte sem atualização recente. Nenhuma coordenada antiga será exibida.':'Aguardando uma fonte de coordenadas autorizada. Nenhuma aparição ao vivo disponível.';
      return;
    }
    const items=snapshot.items.filter(x=>x.expires_at>now&&relevant(x,category())).slice(0,70);
    status.textContent=items.length===0?'Nenhuma aparição atual neste filtro.':'Aparições reportadas por fonte externa • Confira no jogo.';
    for(const item of items){
      const card=make('article','hunter-live-card');
      const head=make('div','hunter-live-head');
      const title=make('strong','hunter-live-name',item.pokemon);
      const iv=make('span','hunter-live-iv',item.iv_percent===100?'💯 100% informado':item.iv_percent===0?'0% informado':item.pvp_rank!==null?'PvP #'+item.pvp_rank:'Elegível a Shiny');
      head.append(title,iv);
      const extras=make('div','hunter-live-stats');
      for(const x of [item.cp!==null?'PC '+item.cp:null,item.level!==null?'Nível '+item.level:null,item.gender,item.shiny_eligible?'✨ Elegível ≠ garantido':null]){
        if(x)extras.append(make('span','hunter-live-stat',x));
      }
      const coords=make('code','hunter-live-coords',item.coordinates);
      const foot=make('div','hunter-live-foot');
      const source=make('span','hunter-live-source',item.source+' • '+countdown(item.expires_at,now));
      const copy=make('button','action-btn hunter-live-copy','Copiar coordenadas');
      copy.type='button';copy.dataset.hunterCopy=item.coordinates;
      foot.append(source,copy);
      card.append(head,extras,coords,foot);
      region.append(card);
    }
  }
  async function refresh(){
    if(fetching)return;
    fetching=true;
    try{
      const response=await fetch(FEED_PATH,{cache:'no-store',credentials:'omit'});
      if(!response.ok)throw Error('feed_http_'+response.status);
      snapshot=sanitizeFeed(await response.json());
      lastError='';
    }catch(e){snapshot=null;lastError=String(e);}
    finally{fetching=false;render();}
  }
  function mount(){
    const panel=el('hunterPanel'),holder=panel?.querySelector('.hunter-category-grid');
    if(!panel||!holder||el('hunterLiveFeed'))return;
    const feed=make('section','hunter-live-feed');
    feed.id='hunterLiveFeed';
    feed.setAttribute('aria-labelledby','hunterLiveTitle');
    const head=make('div','hunter-live-top');
    const title=make('h2',null,'Aparições');
    title.id='hunterLiveTitle';
    const reload=make('button','action-btn hunter-live-reload','Atualizar');
    reload.type='button';reload.id='hunterLiveReload';
    head.append(title,reload);
    const status=make('p','hunter-live-status','Carregando aparições...');
    status.id='hunterLiveStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    const list=make('div','hunter-live-list');
    list.id='hunterLiveList';
    feed.append(head,status,list);
    const tip=el('hunterTip');
    if(tip)tip.insertAdjacentElement('afterend',feed);
    else holder.insertAdjacentElement('afterend',feed);
    reload.addEventListener('click',refresh);
    feed.addEventListener('click',async event=>{
      const button=event.target.closest('[data-hunter-copy]');
      if(!button)return;
      const value=core()?.parseCoords(button.dataset.hunterCopy);
      if(!value)return;
      try{
        await navigator.clipboard.writeText(value);
        if(typeof window.showToast==='function')window.showToast('Coordenadas copiadas.');
        else{button.textContent='Copiado!';button.setAttribute('aria-label','Coordenadas copiadas');}
      }catch{
        window.prompt('Copie as coordenadas:',value);
      }
    });
    panel.addEventListener('click',event=>{
      if(event.target.closest('[data-hunter-category]'))queueMicrotask(()=>render());
    });
    // Existing external search and troubleshooting tools remain optional, not the primary flow.
    const alt=make('details','hunter-feed-alternatives');
    const summary=make('summary',null,'Outras opções de busca');
    alt.append(summary);
    for(const id of ['hunterExternal','hunterHundoFeeds']){
      const node=el(id);if(node)alt.append(node);
    }
    const old=panel.querySelector('.hunter-message-card');
    if(old)old.remove();
    const checker=el('hunterChecker');
    if(checker)alt.append(checker);
    panel.append(alt);
    refresh();
    setInterval(()=>{if(!document.hidden&&el('hunterView')&&!el('hunterView').hidden)refresh();},REFRESH_MS);
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden&&el('hunterView')&&!el('hunterView').hidden)refresh();
    });
  }
  window.SpideyLiveFeedCore=Object.freeze({sanitizeFeed,relevant,countdown});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();