/* Public visit totals only; no app state, custom events or visitor identifiers. */
(() => {
  'use strict';
  const token = document.currentScript?.dataset.siteToken;
  const privateBrowsingPreference = navigator.globalPrivacyControl === true
    || [navigator.doNotTrack, window.doNotTrack].some(value => value === '1' || value === 'yes');
  if (privateBrowsingPreference || !/^[a-f0-9]{32}$/.test(token || '')) return;
  if (location.hostname !== 'asaquevoa1-ctrl.github.io'
    || !location.pathname.startsWith('/spidey-pokemon-go/spidey-app/')) return;
  if (document.querySelector('script[data-spidey-web-analytics-beacon]')) return;

  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.dataset.cfBeacon = JSON.stringify({ token, spa: false });
  beacon.dataset.spideyWebAnalyticsBeacon = '';
  document.head.appendChild(beacon);
})();
