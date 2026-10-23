/* Navegacao lateral mobile derivada das abas existentes. Sem rotas duplicadas. */
(() => {
  'use strict';
  const toggle = document.getElementById('spideyMenuToggle');
  const panel = document.getElementById('spideyMobileMenuPanel');
  const shade = document.getElementById('spideyMobileMenuShade');
  const closeButton = document.getElementById('spideyMobileMenuClose');
  const links = document.getElementById('spideyMobileMenuLinks');
  const themeSelect = document.getElementById('spideyMobileTheme');
  const tabs = document.querySelector('.app-tabs');
  if (!toggle || !panel || !shade || !closeButton || !links || !themeSelect || !tabs) return;

  const mobile = window.matchMedia('(max-width: 760px)');
  const preferredOrder = ['calendarView','newsView','weeklyView','flyView','rocketGuideView','stampsView','pvpView','anaView','nationalTrustView'];
  const glyphs = {
    calendarView: '⌂', newsView: '✦', weeklyView: '▦',
    flyView: '◈', stampsView: '◉',
    pvpView: '⚔', rocketGuideView: 'R', anaView: '✈', nationalTrustView: '🎫'
  };
  let isOpen = false;
  let startTouchX = null;

  function currentView() {
    return document.querySelector('.app-view:not([hidden])')?.id || 'calendarView';
  }

  function syncActive() {
    const activeView = currentView();
    links.querySelectorAll('[data-menu-view]').forEach(button => {
      const active = button.dataset.menuView === activeView;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
    const privacy = panel.querySelector('[data-menu-privacy]');
    if (privacy) {
      privacy.classList.toggle('active', activeView === 'privacyView');
      if (activeView === 'privacyView') privacy.setAttribute('aria-current','page');
      else privacy.removeAttribute('aria-current');
    }
  }

  function refreshLinks() {
    const unique = new Map();
    tabs.querySelectorAll('button.app-tab[data-view]').forEach(button => {
      const id = button.dataset.view;
      if (id && !unique.has(id)) unique.set(id, button);
    });
    const sorted = [...unique].sort(([a],[b]) => {
      const ai = preferredOrder.indexOf(a), bi = preferredOrder.indexOf(b);
      return (ai < 0 ? 1000 : ai) - (bi < 0 ? 1000 : bi);
    });
    links.replaceChildren(...sorted.map(([view, original]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'spidey-menu-item';
      button.dataset.menuView = view;
      const ico = document.createElement('span');
      ico.className = 'spidey-menu-item-icon';
      ico.setAttribute('aria-hidden','true');
      ico.textContent = glyphs[view] || '•';
      const label = document.createElement('span');
      // The original tab sometimes includes an emoji and a verbose accessibility label;
      // keep the drawer concise and avoid duplicated airplane/ticket icons.
      const conciseLabels = { anaView:'ANA', nationalTrustView:'Trust' };
      label.textContent = conciseLabels[view] || original.textContent.trim();
      button.append(ico, label);
      button.addEventListener('click', () => {
        close({ restoreFocus:false });
        // The original button owns side-effects (FLY, Rocket, Novidades).
        original.click();
        syncActive();
      });
      return button;
    }));
    syncActive();
  }

  function focusables() {
    return [...panel.querySelectorAll('button:not([disabled]), select:not([disabled]), a[href]')]
      .filter(element => !element.hidden && element.getClientRects().length > 0);
  }

  function open() {
    if (!mobile.matches || isOpen) return;
    isOpen = true;
    syncActive();
    shade.hidden = false;
    panel.hidden = false;
    document.body.classList.add('spidey-mobile-menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    closeButton.focus();
  }

  function close({ restoreFocus = true } = {}) {
    if (!isOpen) return;
    isOpen = false;
    shade.hidden = true;
    panel.hidden = true;
    document.body.classList.remove('spidey-mobile-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus && mobile.matches) toggle.focus();
  }

  toggle.addEventListener('click', () => isOpen ? close() : open());
  closeButton.addEventListener('click', () => close());
  shade.addEventListener('click', () => close());

  const privacy = panel.querySelector('[data-menu-privacy]');
  privacy?.addEventListener('click', () => {
    close({ restoreFocus:false });
    document.getElementById('privacyButton')?.click();
    syncActive();
  });

  themeSelect.addEventListener('change', () => {
    const canonical = document.getElementById('themeSelect');
    if (!canonical) return;
    canonical.value = themeSelect.value;
    canonical.dispatchEvent(new Event('change', { bubbles:true }));
  });
  window.addEventListener('spideythemechange', () => {
    themeSelect.value = document.getElementById('themeSelect')?.value || 'system';
  });

  document.addEventListener('keydown', event => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      const available = focusables();
      if (!available.length) return;
      const first = available[0], last = available[available.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  panel.addEventListener('touchstart', event => {
    startTouchX = event.touches.length === 1 ? event.touches[0].clientX : null;
  }, {passive:true});
  panel.addEventListener('touchend', event => {
    if (startTouchX !== null && event.changedTouches.length === 1
        && startTouchX - event.changedTouches[0].clientX > 85) close();
    startTouchX = null;
  }, {passive:true});

  if (typeof mobile.addEventListener === 'function') {
    mobile.addEventListener('change', () => { if (!mobile.matches) close({ restoreFocus:false }); });
  } else if (typeof mobile.addListener === 'function') {
    mobile.addListener(() => { if (!mobile.matches) close({ restoreFocus:false }); });
  }
  window.addEventListener('popstate', () => close({ restoreFocus:false }));
  const observer = new MutationObserver(records => {
    if (records.some(record => record.type === 'childList')) refreshLinks();
    else syncActive();
  });
  observer.observe(tabs, { childList:true, subtree:true, attributes:true, attributeFilter:['class','aria-current'] });

  themeSelect.value = document.getElementById('themeSelect')?.value || 'system';
  refreshLinks();
  document.documentElement.classList.add('spidey-mobile-menu-ready');
  window.SpideyMobileMenu = Object.freeze({open,close,refresh:refreshLinks});
})();
