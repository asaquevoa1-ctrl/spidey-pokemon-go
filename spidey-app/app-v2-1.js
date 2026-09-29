(() => {
  'use strict';

  const VERSION = 'spidey-app-v2.1-20260929.1';
  let scheduled = false;

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function sameIdea(a, b) {
    const left = normalize(a);
    const right = normalize(b);
    if (!left || !right) return false;
    return left === right || left.replace(/s$/, '') === right.replace(/s$/, '');
  }

  function removeRepeatedSectionLabels(root = document) {
    root.querySelectorAll?.('.section-head > div, .experience-section .section-head > div').forEach((wrap) => {
      const eyebrow = wrap.querySelector('.eyebrow');
      const heading = wrap.querySelector('h1, h2, h3');
      if (!eyebrow || !heading) return;
      eyebrow.classList.toggle('v21-redundant-label', sameIdea(eyebrow.textContent, heading.textContent));
    });
  }

  function humanizePublicCopy(root = document) {
    const replacements = new Map([
      ['Agenda rápida', 'Dia a dia'],
      ['Sua semana no Pokémon GO', 'Sua semana'],
      ['Os eventos que importam, organizados por dia.', 'Eventos por dia, sem enrolação.'],
      ['Com arte', ''],
      ['DATAHUB / ROTA', 'COORDENADAS'],
      ['Coordenadas em lote', 'Coordenadas da rota'],
      ['Galeria do set', 'Seus selos'],
      ['imagem pendente', ''],
      ['Visual automático', ''],
      ['Arte Premium ainda não disponível', ''],
      ['Conteúdo factual', ''],
      ['Curadoria automática', ''],
      ['Fonte preservada', ''],
      ['Sistema visual', ''],
    ]);

    root.querySelectorAll?.('span, p, small, strong, h1, h2, h3, button, label').forEach((el) => {
      if (el.children.length) return;
      const current = el.textContent.trim();
      if (!replacements.has(current)) return;
      const next = replacements.get(current);
      if (!next) {
        el.hidden = true;
        return;
      }
      el.textContent = next;
    });

    const artStat = document.querySelector('#weeklyArtCount')?.parentElement;
    if (artStat) artStat.hidden = true;

    const focusNote = document.querySelector('#calendarFocusNote');
    if (focusNote && /pr[oó]ximo m[eê]s relevante|hist[oó]rico/i.test(focusNote.textContent)) focusNote.hidden = true;

    root.querySelectorAll?.('.microcopy').forEach((el) => {
      if (/GPX completo bloqueado at[eé] todas/i.test(el.textContent)) {
        el.textContent = 'O GPX completo aparece quando todas as PokéStops estiverem confirmadas.';
      }
    });
  }

  function validateHero(img) {
    if (!img || img.dataset.v21CheckedSrc === img.src) return;
    img.dataset.v21CheckedSrc = img.src;
    const expected = img.src;
    const detail = img.closest('#eventDetail');

    const show = () => {
      if (img.src !== expected || !img.naturalWidth) return;
      img.hidden = false;
      img.classList.remove('v21-broken-art');
      detail?.classList.remove('v21-no-hero');
    };

    const hide = () => {
      if (img.src !== expected) return;
      img.hidden = true;
      img.classList.add('v21-broken-art');
      detail?.classList.add('v21-no-hero');
    };

    img.addEventListener('load', show, { once: true });
    img.addEventListener('error', hide, { once: true });

    if (img.complete) {
      if (img.naturalWidth > 0) show();
      else hide();
      return;
    }

    if (typeof img.decode === 'function') {
      img.decode().then(show).catch(hide);
    }
  }

  function guardBrokenArt(root = document) {
    root.querySelectorAll?.('#eventDetail .detail-hero').forEach(validateHero);
  }

  function compactStamps(root = document) {
    root.querySelectorAll?.('.stamp-art-placeholder-v2 small').forEach((el) => { el.hidden = true; });
    root.querySelectorAll?.('.stamp-art-placeholder-v2 > span').forEach((el) => { el.hidden = true; });
  }

  function apply() {
    scheduled = false;
    document.body?.classList.add('spidey-app-v2');
    document.documentElement.dataset.spideyApp = 'v2.1';
    removeRepeatedSectionLabels();
    humanizePublicCopy();
    compactStamps();
    guardBrokenArt();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  function init() {
    apply();

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length || mutation.type === 'characterData' || mutation.type === 'attributes')) schedule();
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['src'],
    });

    window.addEventListener('spideythemechange', schedule);
    window.SpideyAppV21 = { version: VERSION, refresh: apply };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
