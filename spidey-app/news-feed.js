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
      const key=articleKey(event),dates=range(event);
      if(event.status!=='published'||!key||!dates?.start||!dates?.end||dates.end<now)continue;
      if(!groups.has(key))groups.set(key,{key,events:[]});
      groups.get(key).events.push(event);
    }
    return [...groups.values()].map(group=>{
      group.events.sort((a,b)=>range(a).start-range(b).start||a.id.localeCompare(b.id));
      const event=group.events.find(e=>e.news?.title)||group.events[0];
      const updated=Math.max(0,...group.events.map(e=>Date.parse(e.updated_at||e.published_at||e.news?.published_on||'')||0));
      return {...group,event,title:event.news?.title||event.title,summary:event.news?.summary||event.summary,updated};
    }).sort((a,b)=>b.updated-a.updated||range(a.events[0]).start-range(b.events[0]).start||a.key.localeCompare(b.key));
  }
  window.SpideyNews=Object.freeze({build});
})();
