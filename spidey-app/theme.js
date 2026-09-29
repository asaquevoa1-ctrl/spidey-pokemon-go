(() => {
  const STORAGE_KEY = 'spidey-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const APP_V2_VERSION = '20260929-appv2-1';

  function loadAppV2Assets() {
    if (!document.querySelector('link[data-spidey-app-v2]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `app-v2.css?v=${APP_V2_VERSION}`;
      link.dataset.spideyAppV2 = '1';
      document.head.appendChild(link);
    }

    if (!document.querySelector('script[data-spidey-app-v2]')) {
      const script = document.createElement('script');
      script.src = `app-v2.js?v=${APP_V2_VERSION}`;
      script.dataset.spideyAppV2 = '1';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  function normalizeMode(value) {
    return ['light', 'dark', 'system'].includes(value) ? value : 'system';
  }

  function effectiveTheme(mode) {
    if (mode === 'system') return media.matches ? 'dark' : 'light';
    return mode;
  }

  function applyTheme(mode, persist = true) {
    const normalized = normalizeMode(mode);
    const effective = effectiveTheme(normalized);
    document.documentElement.dataset.themeMode = normalized;
    document.documentElement.dataset.theme = effective;
    document.documentElement.style.colorScheme = effective;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', effective === 'dark' ? '#07162d' : '#f6f8fb');

    const select = document.querySelector('#themeSelect');
    if (select && select.value !== normalized) select.value = normalized;

    if (persist) localStorage.setItem(STORAGE_KEY, normalized);
    window.dispatchEvent(new CustomEvent('spideythemechange', { detail: { mode: normalized, effective } }));
  }

  function currentMode() {
    return normalizeMode(localStorage.getItem(STORAGE_KEY) || document.documentElement.dataset.themeMode || 'system');
  }

  function initThemeControl() {
    const select = document.querySelector('#themeSelect');
    if (select) {
      select.value = currentMode();
      select.addEventListener('change', () => applyTheme(select.value));
    }

    const mediaListener = () => {
      if (currentMode() === 'system') applyTheme('system', false);
    };
    if (typeof media.addEventListener === 'function') media.addEventListener('change', mediaListener);
    else if (typeof media.addListener === 'function') media.addListener(mediaListener);

    applyTheme(currentMode(), false);
  }

  loadAppV2Assets();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initThemeControl, { once: true });
  else initThemeControl();

  window.SpideyTheme = { apply: applyTheme, currentMode, effectiveTheme };
})();
