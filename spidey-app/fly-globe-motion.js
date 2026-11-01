/* SPIDEY FLY · Globo 3D em movimento
 * Anima janelas de eventos reais do SpideyFlyCore; não simula voos físicos,
 * PokéStops ou trajetos GPX. Funciona offline, sem CDN ou biblioteca externa.
 */
(() => {
  'use strict';
  const BRT='America/Sao_Paulo';
  const STEP_MS=2350;
  const RADIANS=Math.PI/180;
  // Natural Earth 110m (public domain), sampled before publishing.
  // Land and city pins use *the exact same* orthographic projection.
  // Never fall back to fictitious polygons if the offline data fails to load.
  let layer=[];
  let landLoaded=false;
  let landLoadPromise=null;
  function loadLand(){
    return landLoadPromise ||= fetch('data/fly-earth-land-110m.json',{cache:'force-cache'})
      .then(response=>{if(!response.ok)throw Error('Mapa Natural Earth indisponível');return response.json();})
      .then(data=>{
        if(data?.schema!=='spidey-fly-naturalearth-110m-v1' ||
           data.coordinate_order!=='lat_lon' || !Array.isArray(data.points) ||
           data.points.length<3000 || !data.points.every(p=>Array.isArray(p)&&p.length===2 &&
             Number.isFinite(p[0])&&Math.abs(p[0])<=90&&Number.isFinite(p[1])&&Math.abs(p[1])<=180)){
          throw Error('Base cartográfica inválida');
        }
        layer=data.points;landLoaded=true;paint();request();
      }).catch(error=>{
        landLoaded=false;
        console.warn('Spidey FLY: mapa Natural Earth não carregado',error);
      });
  }
  const globeGrid=[];
  for(let lat=-75;lat<=75;lat+=15) for(let lon=-180;lon<180;lon+=15) globeGrid.push([lat,lon]);
  const fmt=(date,zone)=>new Intl.DateTimeFormat('pt-BR',{
    timeZone:zone,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
  }).format(date);
  const clock=(date,zone)=>new Intl.DateTimeFormat('pt-BR',{
    timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'
  }).format(date);
  const shorten=s=>String(s||'').split(',')[0];
  const validRows=rows=>Array.isArray(rows)&&rows.every(p=>p &&
    Number.isFinite(p.lat)&&Math.abs(p.lat)<=90&&Number.isFinite(p.lon)&&Math.abs(p.lon)<=180&&
    p.start instanceof Date&&Number.isFinite(+p.start)&&p.end instanceof Date&&p.end>p.start&&
    typeof p.timezone==='string');
  let root, canvas, ctx, el, rows=[], key='', selected=0, stageStart=0, visible=false,
      running=false, stopped=false, raf=0, lastFrame=0, w=0, h=0, dpr=1, viewLat=12, viewLon=-45,
      progress=0;
  const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const saveData = !!navigator.connection?.saveData;
  const canAuto = !(reduced || saveData);
  const node=(tag,className,content)=>{
    const n=document.createElement(tag);
    if(className)n.className=className;
    if(content!==undefined)n.textContent=content;
    return n;
  };
  function mount(){
    if(root?.isConnected)return true;
    const view=document.getElementById('flyView');
    const anchor=view?.querySelector('#flyUpcomingRoutes');
    if(!view||!anchor)return false;
    root=node('section','fly-globe-motion');
    root.id='flyGlobeMotion';
    root.setAttribute('aria-label','Rota mundial animada do evento');
    // Preservar apenas o emblema S cósmico, sem cabeçalho ou texto promocional.
    const brand=document.createElement('img');
    brand.src='assets/branding/20261019/spidey-icon-cosmic-192.png';
    brand.alt='';
    brand.setAttribute('aria-hidden','true');
    brand.className='fly-globe-brand';
    brand.loading='lazy';
    const screen=node('div','fly-globe-screen');
    canvas=document.createElement('canvas');
    canvas.className='fly-globe-canvas';
    canvas.setAttribute('role','img');
    canvas.setAttribute('aria-label','Globo pontilhado animado e arcos entre localidades do roteiro mundial');
    screen.append(canvas);
    const overlay=node('div','fly-globe-overlay');
    const location=node('strong','fly-globe-location','');
    location.id='flyGlobeLocation';
    location.setAttribute('aria-live','polite');
    overlay.append(location,brand);
    screen.append(overlay);
    const times=node('div','fly-globe-times');
    const local=node('div','fly-globe-time');
    local.append(node('span','', 'HORÁRIO LOCAL'));
    const localClock=node('strong','','');
    localClock.id='flyGlobeLocal';
    local.append(localClock);
    const br=node('div','fly-globe-time');
    br.append(node('span','','HORÁRIO DE BRASÍLIA'));
    const brClock=node('strong','','');
    brClock.id='flyGlobeBrazil';
    br.append(brClock);
    times.append(local,br);
    const coords=node('p','fly-globe-coords','');
    coords.id='flyGlobeCoords';
    const controls=node('div','fly-globe-controls');
    const prev=node('button','fly-globe-step','‹');
    prev.type='button';prev.setAttribute('aria-label','Local anterior');
    const play=node('button','fly-globe-play','Pausar');
    play.type='button';
    play.setAttribute('aria-label','Pausar animação');
    const next=node('button','fly-globe-step','›');
    next.type='button';next.setAttribute('aria-label','Próximo local');
    const count=node('span','fly-globe-count','');count.id='flyGlobeIndex';
    controls.append(prev,play,next,count);
    const track=node('div','fly-globe-track');
    const fill=node('div','fly-globe-track-fill');
    track.append(fill);
    root.append(screen,times,coords,controls,track);
    anchor.insertAdjacentElement('afterend',root);
    loadLand();
    el={location,localClock,brClock,coords,prev,next,play,count,fill};
    ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx){
      screen.hidden=true;
      root.classList.add('fly-globe-no-canvas');
    }else{
      const resize=()=>{
        const rect=screen.getBoundingClientRect();
        w=Math.max(240,Math.round(rect.width));
        h=Math.max(240,Math.round(rect.height));
        dpr=Math.min(1.6,window.devicePixelRatio||1);
        canvas.width=Math.round(w*dpr);
        canvas.height=Math.round(h*dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0);
        paint();
      };
      if('ResizeObserver' in window)new ResizeObserver(resize).observe(screen);
      else window.addEventListener('resize',resize,{passive:true});
      resize();
    }
    prev.addEventListener('click',()=>step(-1));
    next.addEventListener('click',()=>step(1));
    play.addEventListener('click',()=>{
      if(stopped){selected=0;stopped=false;}
      running=!running;
      stageStart=performance.now();
      updateButtons();
      if(running)request();
    });
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries=>{
        visible=entries.some(e=>e.isIntersecting);
        if(visible)request();
        else if(raf){cancelAnimationFrame(raf);raf=0;}
      },{rootMargin:'90px',threshold:0.05}).observe(root);
    }else visible=true;
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)request();});
    return true;
  }
  function updateButtons(){
    if(!el)return;
    el.play.textContent=running?'Pausar':stopped?'Repetir':'Reproduzir';
    el.play.setAttribute('aria-label',running?'Pausar animação':stopped?'Repetir animação':'Reproduzir animação');
    el.count.textContent=rows.length?'Janela '+(selected+1)+' de '+rows.length:'';
  }
  function describe(){
    if(!el || !rows.length)return;
    const p=rows[selected];
    el.location.textContent=(p.flag||'')+' '+shorten(p.name);
    el.localClock.textContent=fmt(p.start,p.timezone)+' → '+fmt(p.end,p.timezone);
    el.brClock.textContent=fmt(p.start,BRT)+' → '+fmt(p.end,BRT);
    el.coords.textContent='Referência: '+p.lat+', '+p.lon+' · '+p.timezone;
    el.fill.style.width=(((selected+1)/rows.length)*100).toFixed(2)+'%';
    updateButtons();
  }
  function step(delta){
    if(!rows.length)return;
    selected=(selected+delta+rows.length)%rows.length;
    stopped=false;
    stageStart=performance.now();progress=0;
    describe();paint();request();
  }
  function update(event,confirmedRows,mode){
    if(!mount())return;
    if(!event||!Array.isArray(confirmedRows)||!confirmedRows.length||!validRows(confirmedRows)){
      root.hidden=true;running=false;rows=[];return;
    }
    const signature=[event.id,event.updated_at||'',event.schedule?.start_local||'',
      event.schedule?.end_local||'',mode,confirmedRows.length,
      confirmedRows[0].name,confirmedRows.at(-1).name].join('|');
    root.hidden=false;
    if(signature===key)return;
    key=signature;
    rows=confirmedRows.slice();
    selected=0;
    stopped=false;running=canAuto;progress=0;
    stageStart=performance.now();
    viewLon=rows[0].lon;viewLat=rows[0].lat;
    describe();paint();request();
  }
  function projectCoordinates(lat,lon,centerLat,centerLon,cx=0,cy=0,r=1){
    // Spherical orthographic projection (WGS84 geographic lat/lon).
    // Longitude +E; screen x grows east/right, screen y grows south/down.
    const a=lat*RADIANS,b=(lon-centerLon)*RADIANS,t=centerLat*RADIANS;
    const x=Math.cos(a)*Math.sin(b);
    const y=Math.cos(t)*Math.sin(a)-Math.sin(t)*Math.cos(a)*Math.cos(b);
    const z=Math.sin(t)*Math.sin(a)+Math.cos(t)*Math.cos(a)*Math.cos(b);
    return {x:cx+r*x,y:cy-r*y,z};
  }
  function project(lat,lon,cx,cy,r){
    return projectCoordinates(lat,lon,viewLat,viewLon,cx,cy,r);
  }
  function greatCircle(a,b,t){
    const v=p=>{const lat=p.lat*RADIANS,lon=p.lon*RADIANS;return [Math.cos(lat)*Math.cos(lon),Math.cos(lat)*Math.sin(lon),Math.sin(lat)]};
    const p=v(a),q=v(b),dot=Math.max(-1,Math.min(1,p[0]*q[0]+p[1]*q[1]+p[2]*q[2]));
    const omega=Math.acos(dot);let u=1-t,vv=t;
    if(omega>.0001){const s=Math.sin(omega);u=Math.sin((1-t)*omega)/s;vv=Math.sin(t*omega)/s;}
    const x=u*p[0]+vv*q[0],y=u*p[1]+vv*q[1],z=u*p[2]+vv*q[2];
    return {lat:Math.atan2(z,Math.hypot(x,y))/RADIANS,lon:Math.atan2(y,x)/RADIANS};
  }
  function arc(a,b,fraction,cx,cy,r){
    if(fraction<=0)return;
    const steps=48;let drawing=false;
    ctx.beginPath();
    for(let k=0;k<=steps*fraction;k++){
      const t=k/steps,p=greatCircle(a,b,t),o=project(p.lat,p.lon,cx,cy,r*(1+.16*Math.sin(Math.PI*t)));
      if(o.z<=0){drawing=false;continue;}
      if(!drawing){ctx.moveTo(o.x,o.y);drawing=true;}else ctx.lineTo(o.x,o.y);
    }
    ctx.strokeStyle='rgba(240,111,193,.27)';ctx.lineWidth=9;ctx.shadowColor='#ed6ec9';ctx.shadowBlur=18;ctx.stroke();
    ctx.strokeStyle='#e79ace';ctx.lineWidth=2.5;ctx.shadowBlur=9;ctx.stroke();ctx.shadowBlur=0;
    const point=greatCircle(a,b,Math.min(fraction,1));
    const pp=project(point.lat,point.lon,cx,cy,r*(1+.16*Math.sin(Math.PI*Math.min(fraction,1))));
    if(pp.z>0){ctx.fillStyle='#fff9dd';ctx.shadowColor='#ef8ed4';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(pp.x,pp.y,4.3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  }
  function marker(p,cx,cy,r,isCurrent){
    const q=project(p.lat,p.lon,cx,cy,r);
    if(q.z<0)return;
    ctx.beginPath();ctx.arc(q.x,q.y,isCurrent?15:7,0,Math.PI*2);
    ctx.fillStyle=isCurrent?'rgba(236,171,103,.14)':'rgba(239,162,187,.08)';ctx.fill();
    ctx.beginPath();ctx.arc(q.x,q.y,isCurrent?5.8:3.1,0,Math.PI*2);
    ctx.fillStyle=isCurrent?'#ffdb96':'#f09fcb';
    ctx.shadowColor=isCurrent?'#ffcc77':'#e27bcd';ctx.shadowBlur=isCurrent?18:8;ctx.fill();ctx.shadowBlur=0;
  }
  function paint(){
    if(!ctx||!w||!h)return;
    ctx.clearRect(0,0,w,h);
    const back=ctx.createLinearGradient(0,0,w,h);
    back.addColorStop(0,'#121f34');back.addColorStop(1,'#0a1220');
    ctx.fillStyle=back;ctx.fillRect(0,0,w,h);
    const cx=w*.5,cy=h*.49,r=Math.min(w*.38,h*.44,205);
    const halo=ctx.createRadialGradient(cx,cy,r*.5,cx,cy,r*1.7);
    halo.addColorStop(0,'rgba(74,112,185,.2)');halo.addColorStop(.7,'rgba(73,48,109,.07)');halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,2*Math.PI);ctx.clip();
    const grad=ctx.createRadialGradient(cx-r*.35,cy-r*.4,0,cx,cy,r*1.5);
    grad.addColorStop(0,'#254168');grad.addColorStop(.57,'#102845');grad.addColorStop(1,'#040b18');
    ctx.fillStyle=grad;ctx.fillRect(cx-r,cy-r,r*2,r*2);
    for(const p of globeGrid){
      const o=project(p[0],p[1],cx,cy,r);
      if(o.z<=0)continue;
      ctx.fillStyle='rgba(120,164,221,.11)';
      ctx.fillRect(o.x,o.y,1.2,1.2);
    }
    for(const p of layer){
      const o=project(p[0],p[1],cx,cy,r);
      if(o.z<=0)continue;
      const alpha=(.15+.48*o.z).toFixed(3);
      ctx.fillStyle='rgba(222,187,150,'+alpha+')';
      ctx.beginPath();ctx.arc(o.x,o.y,Math.max(.65,1.5*o.z),0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle='rgba(200,169,204,.5)';ctx.lineWidth=1.5;ctx.shadowColor='#bc8ac6';ctx.shadowBlur=18;ctx.stroke();ctx.shadowBlur=0;
    if(rows.length){
      const lo=Math.max(0,selected-2);
      for(let i=lo+1;i<=selected;i++)arc(rows[i-1],rows[i],i===selected?progress:1,cx,cy,r);
      if(selected>0)marker(rows[selected-1],cx,cy,r,false);
      marker(rows[selected],cx,cy,r,true);
    }
    ctx.fillStyle='rgba(222,187,130,.65)';
    ctx.font='600 10px system-ui,sans-serif';
    ctx.textAlign='center';
    ctx.fillText(landLoaded?'JANELAS MUNDIAIS · MAPA NATURAL EARTH':'MAPA INDISPONÍVEL · COORDENADAS PRESERVADAS',w/2,h-13);
  }
  function request(){
    if(raf||!root?.isConnected||root.hidden||!rows.length||!ctx||document.hidden||!visible)return;
    raf=requestAnimationFrame(tick);
  }
  function tick(ts){
    raf=0;
    if(!rows.length||document.hidden||!visible||root.hidden)return;
    if(!lastFrame||ts-lastFrame>=33){
      lastFrame=ts;
      const p=rows[selected];
      const diff=((p.lon-viewLon+540)%360)-180;
      viewLon+=diff*.07;
      viewLat+=(p.lat-viewLat)*.065;
      if(running){
        const elapsed=ts-stageStart;
        progress=Math.max(0,Math.min(1,elapsed/(STEP_MS*.83)));
        if(elapsed>=STEP_MS){
          if(selected===rows.length-1){
            running=false;stopped=true;progress=1;updateButtons();
          }else{
            selected+=1;stageStart=ts;progress=0;describe();
          }
        }
      }else progress=1;
      paint();
    }
    if(running || Math.abs((((rows[selected].lon-viewLon+540)%360)-180))>.5 || Math.abs(rows[selected].lat-viewLat)>.5)request();
  }
  window.SpideyFlyGlobe=Object.freeze({update,projectCoordinates});
})();
