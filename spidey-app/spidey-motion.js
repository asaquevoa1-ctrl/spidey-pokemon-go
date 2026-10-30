/* Spidey Motion • voluntary animations, zero new navigation or data sources. */
(() => {
  'use strict';
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const saving = () => navigator.connection?.saveData === true;
  const motionOK = () => !reduce?.matches && !saving() && !document.hidden;
  const root = document.documentElement;
  let lastView = document.querySelector('.app-view:not([hidden])')?.id || 'calendarView';
  function enterView(event) {
    const to=event.detail?.to;
    if (!to || to === lastView) return;
    lastView=to;
    const view=document.getElementById(to);
    if (!view || view.hidden || !motionOK()) return;
    view.classList.remove('spidey-scene-enter');
    // Force a new short animation only on an actual navigation.
    void view.offsetWidth;
    view.classList.add('spidey-scene-enter');
    view.addEventListener('animationend',()=>{
      view.classList.remove('spidey-scene-enter');
    },{once:true});
  }
  function revealTheme(apply, control) {
    if (typeof apply !== 'function') return;
    if (!motionOK() || typeof document.startViewTransition !== 'function') {
      apply(); return;
    }
    const rect=control?.getBoundingClientRect?.();
    const x=rect ? rect.left+rect.width/2 : innerWidth/2;
    const y=rect ? rect.top+rect.height/2 : 65;
    const radius=Math.ceil(Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+12);
    root.style.setProperty('--spidey-reveal-x',Math.round(x)+'px');
    root.style.setProperty('--spidey-reveal-y',Math.round(y)+'px');
    root.style.setProperty('--spidey-reveal-radius',radius+'px');
    root.classList.add('spidey-theme-revealing');
    let transition;
    try { transition=document.startViewTransition(apply); }
    catch (_) { root.classList.remove('spidey-theme-revealing'); apply(); return; }
    transition.finished.catch(()=>{}).finally(()=>{
      root.classList.remove('spidey-theme-revealing');
      root.style.removeProperty('--spidey-reveal-x');
      root.style.removeProperty('--spidey-reveal-y');
      root.style.removeProperty('--spidey-reveal-radius');
    });
  }
  function revealHome() {
    // Never prevent reading the app while any effect runs.
    document.body.classList.add('spidey-arrived');
  }
  window.addEventListener('spideyviewchange',enterView);
  window.addEventListener('spideylaunchcomplete',revealHome,{once:true});
  window.SpideyMotion=Object.freeze({revealTheme,revealHome});
})();
