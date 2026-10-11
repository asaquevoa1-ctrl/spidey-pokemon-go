(() => {
  const config = window.SPIDEY_BACKEND;
  const enabled = config?.enabled === true && typeof config.url === 'string';
  const url = path => enabled ? new URL(path.replace(/^\//, ''), config.url + '/').href : path;
  window.SpideyBackend = Object.freeze({ enabled, url });
  const tab = document.querySelector('[data-view="friendsView"]');
  if (tab) tab.hidden = !enabled;
  document.querySelector('.app-tabs')?.classList.toggle('has-friends', enabled);
})();
