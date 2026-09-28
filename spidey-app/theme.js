(() => {
  const STORAGE_KEY = 'spidey-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');

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
    if (meta) meta.setAttribute('content', effective === 'dark' ? '#07162d' : '#f4f7fb');

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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initThemeControl, { once: true });
  else initThemeControl();

  window.SpideyTheme = { apply: applyTheme, currentMode, effectiveTheme };
})();
