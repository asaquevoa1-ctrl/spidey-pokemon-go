(() => {
  'use strict';

  const VERSION = 'spidey-app-v2.3-20260929.1-mobile-cleanup';
  const TECHNICAL_ART = /\/assets\/events\/generated\//i;
  let scheduled = false;

  function contextText(img) {
    const owner = img.closest('[data-v22-event], .event-card, .experience-mini, .experience-feature, #eventDetail');
    return `${img.alt || ''} ${owner?.textContent || ''}`;
  }

  function isKnownBrokenPublicArt(img) {
    return /xerneas/i.test(contextText(img));
  }

  function collapseArt(img, reason = 'unavailable') {
    if (!img) return;
    img.hidden = true;
    img.classList.add('v23-hidden-art');
    img.dataset.v23ArtReason = reason;

    img.closest('#eventDetail')?.classList.add('v23-no-hero');
    img.closest('.experience-mini')?.classList.add('v23-no-art');
    img.closest('.experience-feature')?.classList.add('v23-no-art');
    img.closest('.event-card')?.classList.add('v23-no-art');
    img.closest('[data-v22-event]')?.classList.add('v23-no-art');
  }

  function restoreArt(img) {
    if (!img || TECHNICAL_ART.test(String(img.currentSrc || img.src || '')) || isKnownBrokenPublicArt(img)) return;
    img.hidden = false;
    img.classList.remove('v23-hidden-art');
    delete img.dataset.v23ArtReason;

    const detail = img.closest('#eventDetail');
    if (detail && !detail.querySelector('.detail-hero.v23-hidden-art')) detail.classList.remove('v23-no-hero');
    img.closest('.experience-mini')?.classList.remove('v23-no-art');
    img.closest('.experience-feature')?.classList.remove('v23-no-art');
    img.closest('.event-card')?.classList.remove('v23-no-art');
    img.closest('[data-v22-event]')?.classList.remove('v23-no-art');
  }

  function guardImage(img) {
    if (!img) return;
    const src = String(img.currentSrc || img.src || '');

    if (!src || TECHNICAL_ART.test(src)) {
      collapseArt(img, 'technical-fallback');
      return;
    }

    // Xerneas ainda tem integração visual instável. Até a arte válida carregar de
    // forma verificável, o app mostra conteúdo textual em vez de um bloco vazio.
    if (isKnownBrokenPublicArt(img)) {
      collapseArt(img, 'xerneas-integration');
      return;
    }

    if (img.dataset.v23Guarded !== '1') {
      img.dataset.v23Guarded = '1';
      img.addEventListener('error', () => collapseArt(img, 'load-error'));
      img.addEventListener('load', () => {
        const loadedSrc = String(img.currentSrc || img.src || '');
        if (TECHNICAL_ART.test(loadedSrc) || !img.naturalWidth) collapseArt(img, 'invalid-load');
        else restoreArt(img);
      });
    }

    if (img.complete) {
      if (!img.naturalWidth) collapseArt(img, 'empty-image');
      else restoreArt(img);
    }
  }

  function guardPublicArt(root = document) {
    root.querySelectorAll?.('.detail-hero, .experience-feature-art, .experience-mini img, .event-thumb, .v22-event-art')
      .forEach(guardImage);
  }

  function hideLegacyFeedWhenMonthBoardExists() {
    const board = document.querySelector('#monthBoardV22');
    const feedSection = document.querySelector('#eventList')?.closest('.section');
    if (!feedSection) return;
    feedSection.classList.toggle('v23-legacy-feed', Boolean(board));
  }

  function humanizeRemainingCopy(root = document) {
    root.querySelectorAll?.('.microcopy, p, small, span').forEach((el) => {
      if (el.children.length) return;
      const text = el.textContent.trim();
      if (!text) return;

      if (/visual autom[aá]tico|arte premium ainda n[aã]o dispon[ií]vel|conte[uú]do factual|curadoria autom[aá]tica/i.test(text)) {
        el.hidden = true;
        return;
      }

      if (/^GPX indispon[ií]vel:/i.test(text)) {
        el.textContent = 'Sem rota GPX para este evento.';
      }
    });
  }

  function apply() {
    scheduled = false;
    document.body?.classList.add('spidey-app-v2');
    document.documentElement.dataset.spideyApp = 'v2.3';
    hideLegacyFeedWhenMonthBoardExists();
    humanizeRemainingCopy();
    guardPublicArt();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  function init() {
    apply();
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length || (m.type === 'attributes' && m.attributeName === 'src'))) schedule();
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
    window.addEventListener('spideythemechange', schedule);
    window.SpideyAppV23 = { version: VERSION, refresh: apply };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
