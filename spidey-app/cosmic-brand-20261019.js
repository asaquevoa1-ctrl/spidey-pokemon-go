(() => {
  'use strict';
  // Deployment guard: images are NEVER represented as published until their
  // actual optimized binary files have been committed and checked on GitHub.
  if (window.SPIDEY_COSMIC_ASSETS_VERIFIED !== true) return;
  const shell = document.getElementById('spideySplash');
  if (!shell || shell.hidden) return;
  const root = 'assets/branding/20261019/';
  const files = Object.freeze({
    opening: root + 'spidey-opening-cosmic-20261019.webp',
    loading: root + 'spidey-loading-cosmic-20261019.webp',
    clean: root + 'spidey-clean-cosmic-20261019.webp',
    wallpaper: root + 'spidey-wallpaper-cosmic-20261019.webp'
  });
  const started = Date.now();
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

  function preload(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => image.naturalWidth > 0 ? resolve(src) : reject(new Error('Empty image'));
      image.onerror = () => reject(new Error('Missing Spidey image: ' + src));
      image.src = src;
    });
  }

  function frame(className, src) {
    const el = document.createElement('div');
    el.className = 'cosmic-brand-frame ' + className;
    el.style.backgroundImage = 'url("' + src + '")';
    el.setAttribute('aria-hidden','true'); // The artwork already contains title text.
    shell.appendChild(el);
    return el;
  }

  const main = Promise.all([preload(files.opening),preload(files.loading)]);
  main.then(() => {
    // Never resurrect the intro after the loader has dismissed or faded.
    if (shell.hidden || shell.classList.contains('is-leaving')) return;
    if (Date.now() - started > 900) return; // Slow connection: old loader is better.
    const intro = frame('cosmic-intro',files.opening);
    const loading = frame('cosmic-loading',files.loading);
    shell.classList.add('cosmic-brand-ready');
    intro.classList.add('is-visible');
    window.setTimeout(() => {
      if (shell.hidden || shell.classList.contains('is-leaving')) return;
      intro.classList.remove('is-visible');
      loading.classList.add('is-visible');
    }, reduced ? 40 : 350);
  }).catch(() => { // Never block app opening if an image fails.
    shell.classList.remove('cosmic-brand-ready');
  });

  // Only use the optional cleaner background when an image actually loads.
  preload(files.clean).then(src => {
    document.body.style.setProperty('--cosmic-brand-clean-image','url("' + src + '")');
    document.body.classList.add('cosmic-inapp-art');
  }).catch(() => {});
})();
