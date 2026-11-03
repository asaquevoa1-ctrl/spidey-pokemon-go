/* Spidey Novidades Premium — usa o catálogo editorial EXISTENTE, não cria notícias.
 * O padrão de arte aprovado continua imutável. Nenhuma fonte externa de imagens.
 */
(() => {
  'use strict';
  const VIEW='newsView';
  const WILD_ID='2026-11-go-wild-area-mexico-city';
  const WILD_END=Date.parse('2026-11-08T21:00:00-03:00');
  const WILD_IMAGE='assets/events/wild-area/official-local-20261102/machamp-jacket.webp';
  const PROFILE_ID='2026-11-02-trainer-profile-buddy-backgrounds-2026';
  // Imagem original aprovada e guardada no próprio repositório; sem links externos.
  const PROFILE_ART='assets/events/premium/trainer-profile-backgrounds-20261102-premium-v1.png';
  const isProfileStory=event=>event?.id===PROFILE_ID
    || (event?.source?.confidence==='official'
      && /get-ready-for-gowildarea-2026/.test(event?.source?.url||''));

  const MAX_NEWS_AGE=45*86400000;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl=s=>{
    try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:null;}
    catch{return null;}
  };
  const isOfficial=e=>e.source?.confidence==='official' || 
    /^(?:pokemongo|pokemon)\.com$/.test((()=>{try{return new URL(e.source?.url).hostname.replace(/^www\./,'')}catch{return ''}})());
  const dateStr=n=>Number.isFinite(n)&&n>0?new Intl.DateTimeFormat('pt-BR',{
    day:'2-digit',month:'short',year:'numeric',timeZone:'America/Sao_Paulo'
  }).format(new Date(n)):'Data não informada';
  const articleDate=e=>Date.parse(e.news?.published_on||e.published_at||e.updated_at||'')||0;
  function range(e){
    if(window.SpideyDateOnly?.valid(e)){
      return window.SpideyDateOnly.bounds(e);
    }
    const s=e.schedule||{};
    const start=Date.parse(s.start_brazil||s.start_local||s.start_date||'');
    const end=Date.parse(s.end_brazil||s.end_local||s.end_date||'');
    return {start:Number.isFinite(start)?new Date(start):null,end:Number.isFinite(end)?new Date(end):null};
  }
  function chooseGroups(events,now){
    const groups=window.SpideyNews?.build(events,range,now)||[];
    // Novidades puramente editoriais têm prazo de relevância; eventos vigentes
    // permanecem até encerrar, mas não anunciamos eventos antigos como "novos".
    const officialTopics=new Set(events.filter(e=>e.status==='published'&&isOfficial(e))
      .filter(e=>e.id!==WILD_ID && e.news?.title)
      .map(e=>/eternat/i.test(e.title+' '+e.news.title)?'eternatus':null).filter(Boolean));
    return groups.filter(g=>{
      const e=g.event;
      if(e.content_type==='news'){
        const age=now.getTime()-articleDate(e);
        if(age>MAX_NEWS_AGE||age < -86400000)return false;
        // O anúncio oficial confirmado não pode ser encoberto por teaser antigo.
        if(!isOfficial(e)&&/rumor|teaser|a confirmar/i.test(e.news?.label||'')
            &&/eternat/i.test(e.title+' '+(e.news?.title||''))&&officialTopics.has('eternatus'))return false;
      }
      return true;
    }).slice(0,22);
  }
  function profileArtwork(){
    return '<div class="spidey-news-media spidey-profile-media">'
      +'<img class="spidey-profile-cover" src="'+PROFILE_ART+'" alt="Arte Premium: fundos de localização no perfil do Treinador, com três exemplos de perfil do Pokémon GO e Wild Area 2026" width="1672" height="941" loading="lazy" decoding="async">'
      +'</div>';
  }
  function poster(event){
    // Versões em avaliação (preview) não são pôsteres aprovados para Novidades.
    if(isProfileStory(event))return profileArtwork();
    if(!event||!window.SPIDEY_APPROVED_ART_MASTER?.[event.id]||!window.SpideyPlayer?.image)return '';
    const img=window.SpideyPlayer.image(event,true);
    return img?'<div class="spidey-news-media">'+img+'</div>':'';
  }
  function openTab(view){
    const tab=document.querySelector('.app-tab[data-view="'+view+'"]');
    if(!tab)return false;
    tab.click();
    return true;
  }
  function feature(now,events){
    if(now.getTime()>WILD_END||!events.some(e=>e.id===WILD_ID&&e.status==='published'))return '';
    return '<section class="spidey-news-feature" aria-label="Especial Wild Area Cidade do México">'
      +'<div class="spidey-news-feature-visual"><img src="'+WILD_IMAGE+'" alt="Machamp com jaqueta e capa na arte oficial de GO Wild Area 2026" width="920" height="518" loading="lazy" decoding="async"></div>'
      +'<div class="spidey-news-feature-copy"><span class="spidey-news-kicker">✦ ESPECIAL DA SEMANA · 6 A 8 DE NOVEMBRO</span>'
      +'<h2>Wild Area <em>Cidade do México</em></h2><p>Pesquisas, Bola Safári GO original, Pokémon poderosos, habitats e ingressos. Tudo num guia.</p>'
      +'<button type="button" data-news-open-wild="1">Explorar o especial</button></div></section>';
  }
  function article(group){
    const e=group.event;
    const official=isOfficial(e);
    const source=safeUrl(e.source?.url);
    const displayTitle=group.title||e.title||'Notícia sem título';
    const summary=group.summary||e.summary||'Veja os detalhes na fonte.';
    const date=articleDate(e);
    // Só usar mídia real presente no master Premium. Não usar sprites ou poster gerado.
    const media=poster(e);
    const count=group.events.length;
    return '<article class="spidey-news-article'+(isProfileStory(e)?' is-profile-story':'')+'">'
      +media
      +'<div class="spidey-news-article-copy">'
      +'<div class="spidey-news-meta"><span class="'+(official?'is-official':'is-community')+'">'
      +(official?'Fonte oficial':'Fonte comunitária')+'</span><time>'+esc(dateStr(date))+'</time></div>'
      +'<h3>'+esc(displayTitle)+'</h3><p>'+esc(summary)+'</p>'
      +(count>1?'<small>'+count+' eventos relacionados ao mesmo anúncio</small>':'')
      +'<div class="spidey-news-actions"><button type="button" data-news-detail="'+esc(e.id)+'">Ver detalhes</button>'
      +(source?'<a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">Conferir fonte</a>':'')
      +'</div></div></article>';
  }
  let allEvents=[],groups=[],mode='all',pending=null,lastRefresh=0;
  function draw(){
    const target=document.getElementById('spideyNewsCards');
    const hero=document.getElementById('spideyNewsFeatured');
    const count=document.getElementById('spideyNewsCount');
    if(!target||!hero)return;
    const now=new Date();
    hero.innerHTML=feature(now,allEvents);
    const filtered=mode==='official'?groups.filter(g=>isOfficial(g.event)):
      mode==='community'?groups.filter(g=>!isOfficial(g.event)):groups;
    target.innerHTML=filtered.length?filtered.map(article).join(''):
      '<div class="spidey-news-empty"><strong>Nenhuma novidade nesta seleção.</strong><p>Confira as outras fontes ou volte mais tarde.</p></div>';
    if(count)count.textContent=filtered.length+' '+(filtered.length===1?'publicação':'publicações')+' para consultar';
    document.querySelectorAll('#newsView [data-news-filter]').forEach(button=>{
      const active=button.dataset.newsFilter===mode;
      button.setAttribute('aria-pressed',String(active));
      button.classList.toggle('active',active);
    });
  }
  async function refresh(force=false){
    const view=document.getElementById(VIEW);
    if(!view||view.hidden)return false;
    if(pending)return pending;
    const now=Date.now();
    if(!force&&allEvents.length&&now-lastRefresh<60000){draw();return true;}
    const status=document.getElementById('spideyNewsStatus');
    if(status&&!allEvents.length)status.textContent='Consultando os anúncios já cadastrados...';
    pending=(async()=>{
      try{
        const data=await window.SpideyCatalog.load('events');
        if(!Array.isArray(data.events))throw Error('Catálogo inválido');
        allEvents=data.events.filter(e=>e.status==='published');
        groups=chooseGroups(allEvents,new Date());
        lastRefresh=Date.now();
        if(status)status.textContent='Atualizado com o catálogo do Spidey. As fontes estão identificadas em cada publicação.';
        draw();
        return true;
      }catch{
        if(status)status.textContent=allEvents.length?
          'Sem conexão para atualizar. Exibindo as últimas notícias carregadas.':
          'Não foi possível carregar as novidades. Confira sua conexão.';
        if(allEvents.length)draw();
        else if(document.getElementById('spideyNewsCards')){
          document.getElementById('spideyNewsCards').innerHTML=
            '<div class="spidey-news-empty"><strong>Não foi possível abrir as novidades.</strong><p>Confira a conexão e tente novamente.</p><button type="button" data-news-retry="1">Tentar de novo</button></div>';
        }
        return false;
      }finally{pending=null;}
    })();
    return pending;
  }
  function init(){
    const view=document.getElementById(VIEW);
    if(!view)return;
    view.addEventListener('click',e=>{
      const filter=e.target.closest('[data-news-filter]');
      if(filter){mode=filter.dataset.newsFilter;draw();return;}
      if(e.target.closest('[data-news-open-wild]')){openTab('wildAreaMexicoView');return;}
      if(e.target.closest('[data-news-retry]')){refresh(true);return;}
      const detail=e.target.closest('[data-news-detail]');
      if(detail){
        const event=allEvents.find(x=>x.id===detail.dataset.newsDetail);
        if(!event)return;
        const opened=window.SpideyOpenSharedEvent?.(event.id)===true;
        if(opened && isProfileStory(event)){
          // O detalhe de notícias não tem pôster padrão: inserir a mesma arte sem trocar o master.
          const detail=document.getElementById('eventDetail');
          if(detail && !detail.querySelector('.spidey-profile-media')){
            detail.insertAdjacentHTML('afterbegin',profileArtwork());
          }
        }
        if(!opened){
          const url=safeUrl(event.source?.url);if(url)window.open(url,'_blank','noopener,noreferrer');
        }
      }
    });
    window.addEventListener('spideyviewchange',e=>{if(e.detail?.to===VIEW)refresh();});
    window.addEventListener('spideycontentready',()=>{if(!view.hidden)refresh(true);});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!view.hidden)refresh();});
    if(!view.hidden)refresh();
  }
  window.SpideyNewsPremium=Object.freeze({chooseGroups,refresh,range});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();