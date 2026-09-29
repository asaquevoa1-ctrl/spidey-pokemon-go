(() => {
  'use strict';

  const VERSION = '20260929-v21-mobile';

  function hasStyle(name) {
    return [...document.styleSheets].some((sheet) => String(sheet.href || '').includes(name));
  }

  function hasScript(name) {
    return [...document.scripts].some((script) => String(script.src || '').includes(name));
  }

  function loadStyle(name) {
    if (hasStyle(name)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${name}?v=${VERSION}`;
    document.head.appendChild(link);
  }

  function loadScript(name) {
    if (hasScript(name)) return;
    const script = document.createElement('script');
    script.src = `${name}?v=${VERSION}`;
    script.async = false;
    document.head.appendChild(script);
  }

  loadStyle('app-v2.css');
  loadStyle('app-v2-1.css');
  loadScript('app-v2.js');
  loadScript('app-v2-1.js');

  window.SPIDEY_APP_UI = {
    version: 'v2.1',
    source: 'mobile-validation',
  };
})();
