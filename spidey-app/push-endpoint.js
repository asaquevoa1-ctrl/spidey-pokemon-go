(() => {
  'use strict';
  const config = window.SPIDEY_PUSH_CONFIG;
  const enabled = config?.enabled === true && typeof config.url === 'string' && /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.workers\.dev$/.test(config.url);
  const endpoint = path => enabled ? new URL(path.replace(/^\/+/, ''), config.url + '/').href : path;
  window.SpideyPushBackend = Object.freeze({enabled,endpoint});
})();