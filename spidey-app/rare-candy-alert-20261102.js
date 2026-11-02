/* Spidey · alerta editorial temporário (02/11/2026).
   Não interfere nos destaques Premium nem nas recompensas/eventos. */
(() => {
  'use strict';
  const ID = '2026-11-02-alerta-doces-raros-banimentos';
  const EXPIRES = Date.parse('2026-11-10T00:00:00-03:00');
  const OFFICIAL = 'https://scopelyexplore.helpshift.com/hc/pt-br/5-pokemon-go/faq/2648-rare-candy-removed-from-tappable-halloween-surprises/';

  function showNews() {
    const tab = document.querySelector('.app-tab[data-view="newsView"]');
    if (tab) { tab.click(); window.scrollTo({top:0,behavior:'auto'}); return; }
    const link = document.getElementById('spideyCandyHomeStatus');
    if (link) link.textContent = 'Abra Novidades pelo menu do Spidey.';
  }
  function mount() {
    if (Date.now() > EXPIRES) return; // O aviso não vira um destaque desatualizado.
    const news = document.getElementById('spideyNewsFeatured');
    if (news && !document.getElementById('spideyCandyNewsAlert')) {
      const note = document.createElement('section');
      note.id = 'spideyCandyNewsAlert';
      note.className = 'spidey-candy-alert spidey-candy-alert-news';
      note.setAttribute('aria-label','Acompanhamento: Doces Raros e banimentos');
      note.innerHTML = '<div class="spidey-candy-signal"><span aria-hidden="true">!</span><span>ALERTA À COMUNIDADE · 02 NOV 2026</span></div>'
        +'<h2>Doces Raros: a falha foi corrigida. <em>E os banimentos?</em></h2>'
        +'<p>A Scopely confirmou o problema no Halloween. Há relatos de contas banidas, mas ainda não existe um balanço oficial dos casos.</p>'
        +'<div class="spidey-candy-actions"><button type="button" data-news-detail="'+ID+'">Entenda o que aconteceu</button>'
        +'<a href="'+OFFICIAL+'" target="_blank" rel="noopener noreferrer">Comunicado oficial</a></div>';
      news.insertAdjacentElement('beforebegin',note);
    }
    const quick = document.getElementById('spideyHomeQuick');
    const home = document.getElementById('calendarView');
    if (home && quick && !document.getElementById('spideyCandyHomeAlert')) {
      const note = document.createElement('section');
      note.id = 'spideyCandyHomeAlert';
      note.className = 'spidey-candy-alert spidey-candy-alert-home';
      note.setAttribute('aria-label','Aviso da comunidade Pokémon GO');
      note.innerHTML = '<div class="spidey-candy-signal"><span aria-hidden="true">!</span><span>ACOMPANHAMENTO · HALLOWEEN 2026</span></div>'
        +'<h2>Doces Raros e banimentos: veja os fatos.</h2>'
        +'<p>A falha foi reconhecida e corrigida. Os relatos de banimentos ainda não têm balanço oficial.</p>'
        +'<button type="button" class="spidey-candy-home-action">Ver nas Novidades</button>'
        +'<span id="spideyCandyHomeStatus" role="status" class="spidey-candy-status"></span>';
      quick.insertAdjacentElement('beforebegin',note);
      note.querySelector('button').addEventListener('click',showNews);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();