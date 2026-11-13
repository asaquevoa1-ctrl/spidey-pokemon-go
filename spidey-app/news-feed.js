(() => {
  'use strict';
  function articleKey(event){
    // A curated day guide brings together multiple announcements and must remain
    // separate even when its primary link points to one official Pokémon GO post.
    if (event.category === 'day_guide' && event.source?.confidence === 'editorial_verified') return `event:${event.id}`;
    // One announcement covers two distinct local Night Out events. Keep London
    // and Los Angeles as separate news cards rather than collapsing by URL.
    if (event.id === '2026-pokemon-night-out-la' || event.id === '2026-pokemon-night-out-london') return `event:${event.id}`;
    try{
      const url=new URL(event.source?.url);
      if(!['https:','http:'].includes(url.protocol))return null;
      if(!/(^|\.)(pokemongo\.com|pokemongolive\.com)$/.test(url.hostname))return `event:${event.id}`;
      const path=url.pathname.replace(/^\/(?:en|pt[-_]BR)\/news\//,'/news/').replace(/\/$/,'');
      return `official:${path}`;
    }catch{return null}
  }
  // News is a view of the event catalog. One official announcement may have
  // several calendar windows; community calendar links do not merge events.
  // A temporary news-only announcement may expire with its related event windows.
  // Evergreen notices and permanent route announcements remain visible unless
  // explicitly opted in. Missing, unpublished or invalid references fail open.
  // Valid date-only references use the first instant after the last local day
  // in the event IANA timezone; their end is exclusive just like timed windows.
  function relatedNewsHasLiveWindow(event,byId,range,now){
    if(event.news?.expire_when_related_windows_end!==true)return true;
    const ids=Array.isArray(event.related_event_ids)?event.related_event_ids:
      Array.isArray(event.related)?event.related:[];
    if(!ids.length)return true;
    const related=ids.map(id=>byId.get(id));
    if(related.some(item=>!item||item.status!=='published'))return true;
    const windows=related.map(item=>range(item));
    if(windows.some(dates=>!dates?.start||!dates?.end))return true;
    return windows.some(dates=>dates.end>now);
  }
  function build(events,range,now=new Date()){
    const groups=new Map(),byId=new Map(events.map(event=>[event.id,event]));
    for(const event of events){
      const newsOnly=event.content_type==='news';
      const key=articleKey(event),dates=newsOnly?null:range(event);
      if(event.status!=='published'||!key)continue;
      if(newsOnly){
        if(!relatedNewsHasLiveWindow(event,byId,range,now))continue;
      }else if(!dates?.start||!dates?.end||dates.end<=now)continue;
      if(!groups.has(key))groups.set(key,{key,events:[]});
      groups.get(key).events.push(event);
    }
    return [...groups.values()].map(group=>{
      const dated=e=>e.content_type==='news'?null:range(e);
      group.events.sort((a,b)=>(dated(a)?.start?.getTime?.()||Number.MAX_SAFE_INTEGER)-(dated(b)?.start?.getTime?.()||Number.MAX_SAFE_INTEGER)||a.id.localeCompare(b.id));
      const event=group.events.find(e=>e.news?.title)||group.events[0];
      const updated=Math.max(0,...group.events.map(e=>Date.parse(e.updated_at||e.published_at||e.news?.published_on||'')||0));
      return {...group,event,title:event.news?.title||event.title,summary:event.news?.summary||event.summary,updated};
    }).sort((a,b)=>b.updated-a.updated||a.key.localeCompare(b.key));
  }
  window.SpideyNews=Object.freeze({build});
})();
