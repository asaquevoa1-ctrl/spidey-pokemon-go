/* Wild Area MX — navegação nativa; sem redesenhar arte aprovada. */
(() => {
  'use strict';
  const EVENT_ID='2026-11-go-wild-area-mexico-city';
  const POSTER='assets/events/premium/wild-area-mexico-city-2026-approved-v1.png';
  const END=Date.parse('2026-11-08T21:00:00-03:00');
  const prefersReduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function openView(id) {
    const tab=document.querySelector('.app-tab[data-view="'+id+'"]');
    if(tab) {
      tab.click();
      window.scrollTo?.({top:0,behavior:'instant'});
      return true;
    }
    return false;
  }
  function featureActive(now=Date.now()){return now<END;}
  function mountHome(){
    const home=document.getElementById('playerHome');
    if(!home)return false;
    let block=home.querySelector('#wildMxHomeFeature');
    if(!featureActive()){block?.remove();return false;}
    if(block)return true;
    block=document.createElement('section');
    block.id='wildMxHomeFeature';block.className='wild-mx-home-feature';
    block.setAttribute('aria-label','GO Wild Area: Cidade do México — especial da semana');
    // Imagem já aprovada no acervo. Sem SVG, sprite ou poster novo.
    block.innerHTML='<div class="wild-mx-home-image"><img src="'+POSTER+'" loading="lazy" decoding="async" alt="Pôster Premium GO Wild Area Cidade do México"></div>'+
      '<div class="wild-mx-home-copy"><span>✦ ESPECIAL DA SEMANA · 6 A 8 NOV</span>'+
      '<h2>GO Wild Area <em>Cidade do México</em></h2>'+
      '<p>Guia de pesquisas, Safari Balls, Pokémon, ingressos e os 7 Selos. Tudo num só lugar.</p>'+
      '<div class="wild-mx-home-times"><strong>13h–21h</strong> Brasília · Rally até 23h</div>'+
      '<button type="button" data-wild-open="1">Explorar o evento</button></div>';
    const anchor=home.querySelector('.spidey-command-cockpit')||home.querySelector('#spideyCalendarPremium');
    if(anchor)anchor.insertAdjacentElement('beforebegin',block);
    else home.prepend(block);
    block.querySelector('[data-wild-open]')?.addEventListener('click',()=>openView('wildAreaMexicoView'));
    return true;
  }
  function init(){
    const content=document.getElementById('wildAreaMexicoContent');
    if(content){
      content.addEventListener('click',ev=>{
        const section=ev.target.closest('[data-wild-section]');
        if(section){
          document.getElementById(section.dataset.wildSection)?.scrollIntoView({
            behavior:prefersReduced()?'instant':'smooth',block:'start'
          });return;
        }
        if(ev.target.closest('[data-wild-detail]')){
          window.SpideyOpenSharedEvent?.(EVENT_ID);return;
        }
        if(ev.target.closest('[data-wild-stamps]'))openView('stampsView');
      });
    }
    mountHome();
    window.addEventListener('spideyhomeupdated',mountHome);
    window.addEventListener('spideycontentready',mountHome);
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden)mountHome();
    });
  }
  window.SpideyWildMexico=Object.freeze({mountHome,featureActive,openView});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();