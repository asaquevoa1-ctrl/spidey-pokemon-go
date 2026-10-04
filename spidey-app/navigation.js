(() => {
  const modal = document.getElementById('eventDialog');
  const content = document.getElementById('eventDetail');
  const backButton = document.getElementById('appBackButton');
  const snapshots = new Map();
  let replaying = false;
  let nextId = 0;
  const owner = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const currentView = () => document.querySelector('.app-view:not([hidden])')?.id || 'calendarView';
  const entry = () => history.state?.spideyNavigation?.owner === owner ? history.state.spideyNavigation : null;
  function saveScroll() {
    const current = entry();
    if (current) history.replaceState({ ...history.state, spideyNavigation: { ...current, scroll: window.scrollY } }, '');
  }
  function updateBack() { if (backButton) backButton.hidden = currentView() === 'calendarView' && !(entry()?.depth > 0); }
  function trackView(view) {
    if (replaying) return;
    const previous = entry();
    if (previous?.view === view && !previous.modal) return;
    saveScroll();
    const next = { owner, view, depth: (previous?.depth || 0) + (previous?.modal ? 0 : 1), scroll: 0 };
    if (previous?.modal) history.replaceState({ ...history.state, spideyNavigation: next }, '');
    else history.pushState({ spideyNavigation: next }, '');
    requestAnimationFrame(updateBack);
  }
  function beginDialog() {
    const previous = entry();
    if (modal.open && previous?.modal) {
      snapshots.set(previous.modal, { nodes: [...content.childNodes], className: content.className, data: { ...content.dataset }, scroll: modal.scrollTop });
    } else saveScroll();
  }
  function openDialog() {
    const previous = entry();
    const id = ++nextId;
    snapshots.set(id, { nodes: [...content.childNodes], className: content.className, data: { ...content.dataset }, scroll: 0 });
    history.pushState({ spideyNavigation: { owner, view: currentView(), modal: id, depth: (previous?.depth || 0) + 1, scroll: window.scrollY } }, '');
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
  }
  function back() {
    const current = entry();
    if (current?.depth > 0) history.back();
    else if (modal.open) modal.close();
    else setView('calendarView');
  }
  function restore(event) {
    const target = event.state?.spideyNavigation;
    if (target?.owner !== owner) return;
    replaying = true;
    try {
      setView(target.view || 'calendarView');
      if (target.modal && snapshots.has(target.modal)) {
        const saved = snapshots.get(target.modal);
        content.replaceChildren(...saved.nodes);
        content.className = saved.className;
        Object.keys(content.dataset).forEach(key => delete content.dataset[key]);
        Object.assign(content.dataset, saved.data);
        if (!modal.open) modal.showModal();
        modal.scrollTop = saved.scroll;
      } else if (modal.open) modal.close();
      requestAnimationFrame(() => window.scrollTo({ top: target.scroll || 0, behavior: 'instant' }));
    } finally { replaying = false; updateBack(); }
  }
  history.replaceState({ ...history.state, spideyNavigation: { owner, view: currentView(), depth: 0, scroll: window.scrollY } }, '');
  backButton?.addEventListener('click', back);
  document.getElementById('dialogBackButton')?.addEventListener('click', back);
  modal.addEventListener('cancel', event => { event.preventDefault(); back(); });
  // Legacy close calls still remove their own history entry; replacing one
  // dialog with another in the same task does not close the new dialog.
  modal.addEventListener('close', () => { if (!replaying && !modal.open && entry()?.modal) back(); });
  window.addEventListener('popstate', restore);
  window.SpideyNavigation = Object.freeze({ trackView, beginDialog, openDialog, back });
  updateBack();
})();
