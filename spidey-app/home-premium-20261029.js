/* Spidey Home Premium — atalhos para funcoes reais, sem criar feed ou metricas ficticias. */
(() => {
  'use strict';
  function mount() {
    const home = document.getElementById('calendarView');
    const feature = document.getElementById('nowExperience');
    if (!home || !feature || document.getElementById('spideyHomeQuick')) return;
    document.body.classList.add('spidey-home-premium');
    const quick = document.createElement('section');
    quick.className = 'spidey-home-quick';
    quick.id = 'spideyHomeQuick';
    quick.setAttribute('aria-label', 'Acesso rapido do Spidey');
    const heading = document.createElement('div');
    heading.className = 'spidey-home-quick-head';
    heading.innerHTML = '<div><span class="eyebrow">SEU SPIDEY</span><h2>Acesso rápido</h2></div><p>Abra a área que você precisa</p>';
    const grid = document.createElement('div');
    grid.className = 'spidey-home-quick-grid';
    const actions = [
      { label: 'Semana', detail: 'Eventos por dia', icon: '▦', view: 'weeklyView' },
      { label: 'FLY', detail: 'Locais e horários', icon: '◈', view: 'flyView' },
      { label: 'Novidades', detail: 'Anúncios do jogo', icon: '✦', view: 'newsView' },
      { label: 'Selos', detail: 'Coleções e locais', icon: '◉', view: 'stampsView' },
      { label: 'PvP', detail: 'Times e rankings', icon: '⚔', view: 'pvpView' },
      { label: 'Rocket', detail: 'Líderes e recrutas', icon: 'R', view: 'rocketGuideView' },
      { label: 'Calendário', detail: 'Datas e eventos', icon: '▤', action: 'calendar' },
      { label: 'Alertas', detail: 'Configurar avisos', icon: '◌', action: 'alerts' }
    ];
    actions.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'spidey-home-quick-button';
      if (item.view) button.dataset.spideyQuickView = item.view;
      else button.dataset.spideyQuickAction = item.action;
      const glyph = document.createElement('span');
      glyph.className = 'spidey-home-quick-icon';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = item.icon;
      const copy = document.createElement('span');
      copy.className = 'spidey-home-quick-copy';
      const name = document.createElement('strong');
      name.textContent = item.label;
      const detail = document.createElement('small');
      detail.textContent = item.detail;
      copy.append(name, detail);
      button.append(glyph, copy);
      grid.append(button);
    });
    const status = document.createElement('p');
    status.className = 'spidey-home-quick-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    quick.append(heading, grid, status);

    // O destaque com arte Premium deve aparecer antes do bloco de atalhos e
    // do resumo numerico; os nos existentes continuam com todos os listeners.
    const intro = home.querySelector('.experience-intro');
    const featureSection = feature.closest('.experience-section');
    const stats = home.querySelector('.status-strip');
    if (intro && featureSection) {
      const kicker = intro.querySelector('.eyebrow');
      const title = intro.querySelector('h1');
      if (kicker) kicker.textContent = 'HOJE NO SPIDEY';
      if (title) title.textContent = 'Veja o que vale jogar hoje.';
      intro.insertAdjacentElement('afterend', featureSection);
      featureSection.insertAdjacentElement('afterend', quick);
      if (stats) quick.insertAdjacentElement('afterend', stats);
    } else {
      feature.closest('.experience-section')?.insertAdjacentElement('afterend', quick);
    }

    // A mensagem tecnica e os controles de alertas continuam acessiveis,
    // mas deixam de ocupar a abertura inteira do celular.
    const notificationControls = document.querySelector('.notification-controls');
    if (notificationControls && !document.getElementById('spideyAppUtilities')) {
      const utilities = document.createElement('details');
      utilities.id = 'spideyAppUtilities';
      utilities.className = 'spidey-app-utilities';
      const summary = document.createElement('summary');
      summary.textContent = 'Alertas e compartilhamento';
      const utilityRow = document.createElement('div');
      utilityRow.className = 'spidey-utility-row';
      notificationControls.insertAdjacentElement('beforebegin', utilityRow);
      utilityRow.append(utilities);
      utilities.append(summary, notificationControls);
      // Compartilhar permanece visivel no topo, inclusive no Chrome/Samsung.
      // Os ouvintes ja registrados no botao original continuam funcionando.
      const exposeShare = () => {
        const share = notificationControls.querySelector('#shareSpideyButton');
        if (!share) return false;
        utilityRow.append(share);
        return true;
      };
      if (!exposeShare()) {
        const observer = new MutationObserver(() => {
          if (exposeShare()) observer.disconnect();
        });
        observer.observe(notificationControls, { childList: true });
      }
    }

    grid.addEventListener('click', event => {
      const button = event.target.closest('.spidey-home-quick-button');
      if (!button) return;
      status.textContent = '';
      const target = button.dataset.spideyQuickView;
      if (target) {
        // Os botoes originais carregam efeitos especificos de FLY, Rocket, Novidades e PvP.
        const original = [...document.querySelectorAll('.app-tab[data-view]')]
          .find(tab => tab.dataset.view === target);
        if (original && document.getElementById(target)) {
          original.click();
          window.scrollTo({ top: 0, behavior: 'auto' });
        } else {
          status.textContent = 'Não consegui abrir esta área. Tente pelo menu.';
        }
        return;
      }
      if (button.dataset.spideyQuickAction === 'calendar') {
        const calendar = document.getElementById('calendar');
        if (calendar) calendar.closest('.section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (button.dataset.spideyQuickAction === 'alerts') {
        const controls = document.querySelector('.notification-controls');
        if (controls) {
          const utilities = document.getElementById('spideyAppUtilities');
          if (utilities) utilities.open = true;
          controls.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const active = [...controls.querySelectorAll('button')].find(item => !item.hidden);
          active?.focus({ preventScroll: true });
        } else status.textContent = 'Não foi possível abrir os alertas agora.';
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
