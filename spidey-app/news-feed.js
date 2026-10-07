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
  // Scheduled events retain their own catalog. Announcements may exist before
  // a confirmed event window and never create calendar entries or push targets.
  function build(events,range,now=new Date(),announcements=[]){
    const groups=new Map();
    for(const event of events){
      const key=articleKey(event),dates=range(event);
      if(event.status!=='published'||!key||!dates?.start||!dates?.end||dates.end<now)continue;
      if(!groups.has(key))groups.set(key,{key,events:[]});
      groups.get(key).events.push(event);
    }
    let stories=[...groups.values()].map(group=>{
      group.events.sort((a,b)=>range(a).start-range(b).start||a.id.localeCompare(b.id));
      const event=group.events.find(e=>e.news?.title)||group.events[0];
      const updated=Math.max(0,...group.events.map(e=>Date.parse(e.updated_at||e.published_at||e.news?.published_on||'')||0));
      return {...group,event,title:event.news?.title||event.title,summary:event.news?.summary||event.summary,updated};
    });
    for(const article of announcements){
      const key=articleKey(article),published=Date.parse(article.published_at||'');
      if(article.status!=='published'||!key||!Number.isFinite(published)||published>now.getTime())continue;
      if(article.expires_at&&Date.parse(article.expires_at)<=now.getTime())continue;
      const ids=new Set(article.event_ids||[]),linked=new Map();
      stories=stories.filter(story=>{
        if(story.key!==key&&!story.events.some(event=>ids.has(event.id)))return true;
        for(const event of story.events)linked.set(event.id,event);
        return false;
      });
      stories.push({key,event:article,events:[...linked.values()],title:article.title,summary:article.summary,
        media:article.media,details:article.details||[],localEventIds:article.local_event_ids||[],
        relatedSources:(article.related_sources||[]).filter(source=>articleKey({source})),
        updated:Date.parse(article.updated_at||'')||published});
    }
    return stories.sort((a,b)=>b.updated-a.updated||a.key.localeCompare(b.key));
  }
  window.SpideyNews=Object.freeze({build});
})();
