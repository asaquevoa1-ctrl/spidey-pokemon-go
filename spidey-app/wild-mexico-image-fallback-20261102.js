/* GO Wild Area MX — fallback defensivo para imagens externas (Samsung/PWA).
   Não altera as artes do master; não apresenta imagem de terceiros como arte Premium. */
(() => {
  'use strict';
  const OFFICIAL='https://pokemongo.com/gowildarea/mexico-city/gameplay';
  const BALL='assets/events/wild-area/go-safari-ball-fallback-20261102.svg';
  const LABELS={
    steel:{eyebrow:'HORA DO AÇO',title:'Solid as Steel',name:'Beldum · Lucario · Klink'},
    dragon:{eyebrow:'HORA DOS DRAGÕES',title:'Daring as Dragons',name:'Dratini · Bagon · Gible'},
    mighty:{eyebrow:'ENCONTROS ESPECIAIS',title:'Pokémon poderosos',name:'Machamp de jaqueta · Hawlucha'}
  };
  function label(type){
    const def=LABELS[type];
    const div=document.createElement('div');
    div.className='wild-mx-fallback wild-mx-fallback-'+type;
    div.setAttribute('role','img');
    div.setAttribute('aria-label',def.title+' — '+def.name+'. Foto temporariamente indisponível.');
    const kicker=document.createElement('span');kicker.className='wild-mx-fallback-kicker';kicker.textContent=def.eyebrow;
    const title=document.createElement('strong');title.textContent=def.title;
    const small=document.createElement('span');small.textContent=def.name;
    div.append(kicker,title,small);
    return div;
  }
  function fallbackFor(img){
    if(!img||img.dataset.wildFallback==='done')return;
    const parent=img.parentElement;
    if(!parent)return;
    if(parent.classList.contains('wild-mx-real-safari')){
      // A ilustração local preserva o desenho real da bola e funciona offline.
      if(img.dataset.wildLocalAttempt!=='1'){
        img.dataset.wildLocalAttempt='1';
        img.src=BALL;
        img.removeAttribute('referrerpolicy');
        const fig=parent.querySelector('figcaption');
        if(fig)fig.textContent='Bola Safári GO · ilustração de referência';
        return;
      }
    }
    img.dataset.wildFallback='done';
    img.hidden=true;
    img.removeAttribute('src');
    if(parent.classList.contains('wild-mx-roster-visual')){
      const tile=parent.closest('.wild-mx-roster-tile');
      const type=tile?.classList.contains('wild-mx-roster-steel')?'steel':
        tile?.classList.contains('wild-mx-roster-dragon')?'dragon':'mighty';
      parent.classList.add('wild-mx-photo-unavailable');
      parent.replaceChildren(label(type));
      return;
    }
    if(parent.classList.contains('wild-mx-machamp-spotlight')||
       parent.classList.contains('wild-mx-home-image')){
      parent.classList.add('wild-mx-photo-unavailable');
      const box=document.createElement('div');box.className='wild-mx-fallback wild-mx-fallback-machamp';
      const name=document.createElement('strong');name.textContent='MACHAMP';
      const title=document.createElement('span');title.textContent='Com jaqueta e capa especiais · quatro braços';
      const link=document.createElement('a');link.href=OFFICIAL;link.target='_blank';link.rel='noopener noreferrer';
      link.textContent='Ver a imagem no anúncio oficial';
      box.append(name,title,link);
      parent.insertBefore(box,parent.firstChild);
      return;
    }
    if(parent.classList.contains('wild-mx-real-safari')){
      const fallback=document.createElement('span');fallback.className='wild-mx-ball-fallback-text';
      fallback.textContent='Bola Safári GO';
      parent.insertBefore(fallback,parent.firstChild);
      return;
    }
    parent.classList.add('wild-mx-photo-unavailable');
  }
  function check(img){
    if(img.dataset.wildMonitored==='1')return;
    img.dataset.wildMonitored='1';
    img.addEventListener('error',()=>fallbackFor(img));
    if(img.complete&&!img.naturalWidth){
      fallbackFor(img);
    }else if(!img.complete){
      // Se a CDN deixar a imagem pendurada, não manter cartão vazio para sempre.
      const watchdog=setTimeout(()=>{
        if(!img.complete||!img.naturalWidth)fallbackFor(img);
      },9000);
      img.addEventListener('load',()=>clearTimeout(watchdog),{once:true});
    }
  }
  function scan(){
    const root=document.getElementById('wildAreaMexicoView');
    root?.querySelectorAll('.wild-mx-machamp-spotlight img,.wild-mx-real-safari img,.wild-mx-roster-visual img').forEach(check);
    document.querySelectorAll('#wildMxHomeFeature .wild-mx-home-image img').forEach(check);
  }
  window.SpideyWildMexicoImageFallback=Object.freeze({scan});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan,{once:true});
  else scan();
  window.addEventListener('spideyhomeupdated',scan);
  window.addEventListener('spideycontentready',scan);
})();