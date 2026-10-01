(() => {
  'use strict';
  const categories=new Set(['spotlight_hour','raid_hour','community_day','community_day_classic','max_monday','max_battle_day','raid_day','research_day','hatch_day','incense_day']);
  let pointsPromise;
  function eligible(e){return e?.status==='published'&&categories.has(e.category)&&(e.tags||[]).some(t=>String(t).toLowerCase()==='global')&&!!e.schedule?.start_local&&!!e.schedule?.end_local}
  function parts(date,zone){const p={};new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).forEach(x=>{if(x.type!=='literal')p[x.type]=Number(x.value)});return p}
  function localToDate(day,clock,zone){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day||'')||!/^\d{2}:\d{2}$/.test(clock||''))return null;
    const [y,m,d]=day.split('-').map(Number),[h,min]=clock.split(':').map(Number);if(h>23||min>59)return null;
    const target=Date.UTC(y,m-1,d,h,min);let guess=target;
    try{for(let i=0;i<4;i++){const p=parts(new Date(guess),zone),delta=target-Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);guess+=delta;if(!delta)break}
      const matches=p=>p.year===y&&p.month===m&&p.day===d&&p.hour===h&&p.minute===min;
      if(!matches(parts(new Date(guess),zone)))return null;
      if([-3600000,3600000].some(n=>matches(parts(new Date(guess+n),zone))))return null;
      return new Date(guess);
    }catch{return null}
  }
  function route(e,points,now=new Date()){
    if(!eligible(e))return [];
    const s=e.schedule,rows=points.map(p=>({...p,start:localToDate(s.start_local.slice(0,10),s.start_local.slice(11,16),p.timezone),end:localToDate(s.end_local.slice(0,10),s.end_local.slice(11,16),p.timezone)})).filter(p=>p.start&&p.end&&p.end>p.start).sort((a,b)=>a.start-b.start||a.order-b.order);
    const next=rows.find(p=>p.start>now),last=Math.max(...rows.map(p=>+p.end));
    return rows.map(p=>({...p,status:now>=p.end?'ENCERRADO':now>=p.start?(+p.end===last?'ÚLTIMA CHANCE':'ATIVO AGORA'):+p.start===+next?.start?'PRÓXIMO':'FUTURO'}));
  }
  function loadPoints(){return pointsPromise||=fetch('data/world-event-points.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Referências indisponíveis');return r.json()}).then(d=>d.points)}
  window.SpideyFlyCore=Object.freeze({eligible,localToDate,route,loadPoints});
})();
