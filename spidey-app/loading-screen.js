(() => {
  'use strict';
  // The loader represents the first catalog render, not a fabricated progress percentage.
  // Only runs on full page startup; tab changes and catalog refreshes never reshow it.
  const splash = document.getElementById('spideySplash');
  if (!splash) return;

  const MIN_MS = 380;
  const MAX_MS = 6500;
  const start = Date.now();
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  let closing = false;
  let hardLimit;

  function closeSplash() {
    if (closing) return;
    closing = true;
    window.clearTimeout(hardLimit);
    // A very fast cached load may still need one frame to be perceived.
    const elapsed = Date.now() - start;
    window.setTimeout(() => {
      splash.classList.add('is-leaving');
      window.setTimeout(() => {
        splash.hidden = true;
        splash.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('spidey-loading');
      }, reducedMotion ? 0 : 290);
    }, reducedMotion ? 0 : Math.max(0, MIN_MS - elapsed));
  }

  // app.js emits the first signal only after the home/calendar and stamps are rendered.
  window.addEventListener('spideycontentready', closeSplash, { once: true });
  // The settled signal also closes the loader if offline load fails.
  window.addEventListener('spideycontentsettled', closeSplash, { once: true });

  document.body.classList.add('spidey-loading');
  hardLimit = window.setTimeout(closeSplash, MAX_MS);
})();
