/* SPIDEY FLY · Globo 3D em movimento
 * Anima janelas de eventos reais do SpideyFlyCore; não simula voos físicos,
 * PokéStops ou trajetos GPX. Funciona offline, sem CDN ou biblioteca externa.
 */
(() => {
  'use strict';
  const BRT='America/Sao_Paulo';
  const STEP_MS=2350;
  const RADIANS=Math.PI/180;
  const landPolygons=[
    [[-168,71],[-140,72],[-125,62],[-127,53],[-123,49],[-118,34],[-110,30],[-105,24],[-96,19],[-88,15],[-83,9],[-78,10],[-82,19],[-91,30],[-98,36],[-95,50],[-112,59],[-133,67],[-151,60],[-168,64]],
    [[-81,12],[-74,10],[-69,11],[-61,9],[-53,4],[-50,-1],[-43,-4],[-35,-8],[-38,-19],[-42,-23],[-48,-28],[-53,-35],[-69,-56],[-74,-48],[-71,-33],[-75,-15],[-80,-5]],
    [[-74,60],[-59,60],[-40,65],[-41,82],[-55,84],[-67,78]],
    [[-10,36],[-17,28],[-16,14],[-17,5],[-10,-5],[12,-17],[18,-32],[20,-35],[31,-29],[35,-18],[41,-11],[47,8],[43,13],[32,31],[12,36],[-2,36]],
    [[-12,36],[-9,43],[-3,44],[4,51],[12,56],[20,59],[29,65],[37,70],[54,72],[70,71],[91,74],[112,73],[143,60],[158,60],[171,54],[164,45],[150,45],[145,34],[131,34],[126,39],[117,35],[121,24],[113,18],[109,9],[102,3],[99,1],[101,-4],[109,-7],[116,-7],[120,-2],[126,-8],[135,-6],[142,-3],[150,-8],[145,-17],[132,-11],[116,-8],[108,1],[100,12],[93,17],[85,21],[74,10],[68,22],[59,26],[51,17],[43,13],[41,29],[33,32],[24,39],[16,39],[10,47],[0,44],[-9,36]],
    [[113,-11],[123,-11],[130,-13],[136,-12],[153,-27],[151,-37],[138,-39],[130,-33],[114,-32]],
    [[43,-12],[51,-13],[50,-25],[45,-26]],
    [[-10,58],[-5,59],[-2,55],[-5,51],[-10,52]],
    [[130,31],[141,35],[145,45],[141,43],[136,35]],
    [[-177,-17],[-170,-14],[-165,-22],[-172,-26]]
  ];
  const layer = [];
  function inside(lon,lat,poly) {
    let hit=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const a=poly[i],b=poly[j];
      if((a[1]>lat)!==(b[1]>lat) && lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0]) hit=!hit;
    }
    return hit;
  }
  for(let lat=-76;lat<=80;lat+=4.1){
    for(let lon=-178;lon<=180;lon+=4.1){
      if(landPolygons.some(poly=>inside(lon,lat,poly)))layer.push([lat,lon]);
    }
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
    const heading=node('header','fly-globe-head');
    const info=node('div','fly-globe-title');
    info.append(node('span','fly-globe-kicker','SPIDEY PREMIUM · FLY'));
    info.append(node('h2','', 'Globo das janelas'));
    info.append(node('p','', 'Uma viagem visual pelos fusos — não representa deslocamento real.'));
    const brand=document.createElement('img');
    brand.src='assets/branding/20261019/spidey-icon-cosmic-192.png';
    brand.alt='Emblema S cósmico do Spidey';
    brand.className='fly-globe-brand';
    brand.loading='lazy';
    heading.append(info,brand);
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
    const tag=node('span','fly-globe-counter','');
    tag.id='flyGlobeCounter';
    overlay.append(location,tag);
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
    const note=node('p','fly-globe-note',
      'Sequência ilustrativa das janelas confirmadas. Datas e horários são calculados por fuso IANA. Coordenadas são referências geográficas, não PokéStops ou uma rota GPX.');
    root.append(heading,screen,times,coords,controls,track,note);
    anchor.insertAdjacentElement('afterend',root);
    el={location,tag,localClock,brClock,coords,prev,next,play,count,fill};
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
    el.tag.textContent='ETAPA '+String(selected+1).padStart(2,'0')+' / '+String(rows.length).padStart(2,'0');
    el.localClock.textContent=fmt(p.start,p.timezone)+' → '+clock(p.end,p.timezone);
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
    viewLon=rows[0].lon;viewLat=Math.max(-45,Math.min(45,rows[0].lat*.5));
    describe();paint();request();
  }
  function project(lat,lon,cx,cy,r){
    const a=lat*RADIANS,b=(lon-viewLon)*RADIANS,t=viewLat*RADIANS;
    const x=Math.cos(a)*Math.sin(b);
    const y=Math.cos(t)*Math.sin(a)-Math.sin(t)*Math.cos(a)*Math.cos(b);
    const z=Math.sin(t)*Math.sin(a)+Math.cos(t)*Math.cos(a)*Math.cos(b);
    return {x:cx+r*x,y:cy-r*y,z};
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
      if(o.z<=-.16){drawing=false;continue;}
      if(!drawing){ctx.moveTo(o.x,o.y);drawing=true;}else ctx.lineTo(o.x,o.y);
    }
    ctx.strokeStyle='rgba(240,111,193,.27)';ctx.lineWidth=9;ctx.shadowColor='#ed6ec9';ctx.shadowBlur=18;ctx.stroke();
    ctx.strokeStyle='#e79ace';ctx.lineWidth=2.5;ctx.shadowBlur=9;ctx.stroke();ctx.shadowBlur=0;
    const point=greatCircle(a,b,Math.min(fraction,1));
    const pp=project(point.lat,point.lon,cx,cy,r*(1+.16*Math.sin(Math.PI*Math.min(fraction,1))));
    if(pp.z>-.16){ctx.fillStyle='#fff9dd';ctx.shadowColor='#ef8ed4';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(pp.x,pp.y,4.3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  }
  function marker(p,cx,cy,r,isCurrent){
    const q=project(p.lat,p.lon,cx,cy,r);
    if(q.z<-.09)return;
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
    ctx.fillText('JANELAS MUNDIAIS · DADOS DO EVENTO',w/2,h-13);
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
      viewLat+=(Math.max(-55,Math.min(55,p.lat*.72))-viewLat)*.065;
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
    if(running || Math.abs((((rows[selected].lon-viewLon+540)%360)-180))>.5 || Math.abs(rows[selected].lat*.72-viewLat)>.5)request();
  }
  window.SpideyFlyGlobe=Object.freeze({update});
})();
