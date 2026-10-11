(() => {
  'use strict';
  function articleKey(event){
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
  function build(events,range,now=new Date()){
    const groups=new Map();
    for(const event of events){
      const newsOnly=event.content_type==='news';
      const key=articleKey(event),dates=newsOnly?null:range(event);
      if(event.status!=='published'||!key||(!newsOnly&&(!dates?.start||!dates?.end||dates.end<now)))continue;
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
