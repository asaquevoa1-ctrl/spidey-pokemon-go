(() => {
  'use strict';

  const VERSION = 'spidey-app-v2-20260929.1';
  let scheduled = false;

  const copy = [
    ['.experience-intro .eyebrow', 'AGORA'],
    ['.experience-intro h1', 'O que está rolando agora?'],
    ['.experience-intro > p:not(.microcopy)', 'Eventos, horários e o que vem por aí — direto ao ponto.'],
    ['#nowCount + span', 'Agora'],
    ['#monthCount + span', 'Este mês'],
    ['#nextCount + span', 'Em breve'],
    ['#todayExperience', null],
    ['#weeklyView .hero-compact .eyebrow', 'SEMANA'],
    ['#weeklyView .hero-compact h1', 'Sua semana no Pokémon GO'],
    ['#weeklyView .hero-compact > p:not(.microcopy)', 'Os eventos que importam, organizados por dia.'],
    ['#weeklyArtCount + span', 'Com arte'],
    ['#stampsView .hero-compact > p', 'Acompanhe os selos e use coordenadas ou GPX quando a PokéStop estiver confirmada.'],
    ['#mapView .hero-compact h1', 'Locais confirmados'],
    ['#mapView .hero-compact > p', 'Só mostramos pontos confirmados. O que ainda estiver em dúvida fica marcado como pendente.'],
    ['#mapExactCount + span', 'Confirmados'],
  ];

  const exactText = new Map([
    ['SEU PRÓXIMO PASSO', 'AGORA'],
    ['O que vale fazer agora?', 'O que está rolando agora?'],
    ['Abra o Spidey e veja primeiro o que está acontecendo, o que ainda tem hoje e os principais eventos dos próximos dias.', 'Eventos, horários e o que vem por aí — direto ao ponto.'],
    ['Acontecendo', 'Agora'],
    ['No mês', 'Este mês'],
    ['Próximos', 'Em breve'],
    ['Ainda dá tempo', 'Hoje'],
    ['PRÓXIMOS 7 DIAS', 'PRÓXIMOS DIAS'],
    ['Esta semana', 'Próximos dias'],
    ['DEPOIS', 'EM BREVE'],
    ['Próximos eventos', 'O que vem por aí'],
    ['SEMANA SPIDEY', 'SEMANA'],
    ['Os eventos mais importantes da semana, organizados por dia e por categoria.', 'Os eventos que importam, organizados por dia.'],
    ['Com visual', 'Com arte'],
    ['Somente pontos exatos entram no mapa. Referências de país, cidade ou local ficam fora até confirmação.', 'Só mostramos pontos confirmados. O que ainda estiver em dúvida fica marcado como pendente.'],
    ['Exatos', 'Confirmados'],
    ['EXATOS', 'CONFIRMADOS'],
    ['Fonte verificada', 'Fonte'],
    ['Evento verificado', 'Confirmado'],
  ]);

  const hiddenExact = new Set([
    'Visual automático',
    'Arte Premium ainda não disponível',
    'Conteúdo factual',
    'Curadoria automática',
    'Leitura gerencial automática',
  ]);

  function setText(selector, value) {
    if (value == null) return;
    const el = document.querySelector(selector);
    if (el && el.textContent.trim() !== value) el.textContent = value;
  }

  function humanizeFrameworkCopy(root = document) {
    for (const [selector, value] of copy) setText(selector, value);

    root.querySelectorAll?.('span, p, small, strong, button, h1, h2, h3, label').forEach((el) => {
      if (el.children.length) return;
      const current = el.textContent.trim();
      if (!current) return;
      if (hiddenExact.has(current)) {
        el.hidden = true;
        return;
      }
      const replacement = exactText.get(current);
      if (replacement && replacement !== current) el.textContent = replacement;
    });
  }

  function markDynamicPieces(root = document) {
    root.querySelectorAll?.('.section, .status-strip, .experience-intro, .weekly-shell').forEach((el) => {
      if (!el.classList.contains('v2-reveal')) el.classList.add('v2-reveal');
    });

    root.querySelectorAll?.('.event-card').forEach((card) => card.classList.add('v2-event-card'));
  }

  function installRevealObserver() {
    const targets = [...document.querySelectorAll('.v2-reveal')];
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('v2-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('v2-visible');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -7% 0px', threshold: .05 });
    targets.forEach((el) => {
      if (!el.classList.contains('v2-visible')) observer.observe(el);
    });
  }

  function cleanTechnicalLabels(root = document) {
    root.querySelectorAll?.('[alt*="Premium"], [title*="Premium"]').forEach((el) => {
      if (el.getAttribute('title')) el.removeAttribute('title');
    });
  }

  function apply() {
    scheduled = false;
    document.body?.classList.add('spidey-app-v2');
    document.documentElement.dataset.spideyApp = 'v2';
    humanizeFrameworkCopy();
    markDynamicPieces();
    cleanTechnicalLabels();
    installRevealObserver();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  function init() {
    apply();

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length || mutation.type === 'characterData')) schedule();
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });

    const dialog = document.querySelector('#eventDialog');
    dialog?.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    window.addEventListener('spideythemechange', schedule);
    window.SpideyAppV2 = { version: VERSION, refresh: apply };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
