/* FLY Premium: atalhos de navegação de longa lista, sem recalcular/alterar rotas.
   Usa a instância de FLY já montada em fly-v1.js. */
(() => {
  'use strict';
  function init(){
    const root=document.getElementById('flyView');
    const hero=root?.querySelector('.hero.hero-compact');
    if(!root||!hero||root.querySelector('.fly-premium-quick-nav'))return false;
    const nav=document.createElement('nav');
    nav.className='fly-premium-quick-nav';
    nav.setAttribute('aria-label','Atalhos da rota mundial');
    const defs=[
      {to:'flyRouteList',label:'Ver coordenadas',icon:'◎'},
      {to:'flyNow',label:'Ver horários',icon:'◷'}
    ];
    defs.forEach(({to,label,icon})=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.dataset.flyJump=to;
      const ornament=document.createElement('span');
      ornament.setAttribute('aria-hidden','true');
      ornament.textContent=icon;
      const title=document.createElement('span');title.textContent=label;
      btn.append(ornament,title);
      nav.appendChild(btn);
    });
    nav.addEventListener('click',e=>{
      const btn=e.target.closest?.('[data-fly-jump]');
      if(!btn||!nav.contains(btn))return;
      const target=root.querySelector('#'+btn.dataset.flyJump);
      if(!target)return;
      const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView?.({behavior:reduce?'auto':'smooth',block:'start'});
      // Mantém leitura acessível ao navegar pelo botão na lista longa.
      if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
      target.focus?.({preventScroll:true});
    });
    hero.insertAdjacentElement('afterend',nav);
    return true;
  }
  window.SpideyFlyPremium=Object.freeze({init});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.addEventListener('spideycontentready',init);
  window.addEventListener('spideyviewchange',init);
})();