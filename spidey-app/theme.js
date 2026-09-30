(() => {
  const STORAGE_KEY='spidey-theme';
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const APP_UI_VERSION='20260929-art-coverage-v1';
  function hasAsset(selector,name){return[...document.querySelectorAll(selector)].some((el)=>String(el.href||el.src||'').includes(name))}
  function loadStyle(name,marker){if(hasAsset('link[rel="stylesheet"]',name))return;const link=document.createElement('link');link.rel='stylesheet';link.href=`${name}?v=${APP_UI_VERSION}`;link.dataset[marker]='1';document.head.appendChild(link)}
  function loadScript(name,marker){if(hasAsset('script[src]',name))return;const script=document.createElement('script');script.src=`${name}?v=${APP_UI_VERSION}`;script.dataset[marker]='1';script.async=false;document.head.appendChild(script)}
  function loadAppUi(){
    loadStyle('app-v2.css','spideyAppV2');
    loadStyle('app-v2-1.css','spideyAppV21');
    loadStyle('app-v2-2.css','spideyAppV22');
    loadStyle('app-v2-3.css','spideyAppV23');
    loadStyle('app-v2-4.css','spideyAppV24');
    loadStyle('art-coverage-v1.css','spideyArtCoverage');
    loadScript('app-v2.js','spideyAppV2');
    loadScript('app-v2-1.js','spideyAppV21');
    loadScript('app-v2-2.js','spideyAppV22');
    loadScript('app-v2-3.js','spideyAppV23');
    loadScript('app-v2-4.js','spideyAppV24');
    loadScript('art-coverage-v1.js','spideyArtCoverage');
  }
  function normalizeMode(value){return['light','dark','system'].includes(value)?value:'system'}
  function effectiveTheme(mode){if(mode==='system')return media.matches?'dark':'light';return mode}
  function applyTheme(mode,persist=true){const normalized=normalizeMode(mode);const effective=effectiveTheme(normalized);document.documentElement.dataset.themeMode=normalized;document.documentElement.dataset.theme=effective;document.documentElement.style.colorScheme=effective;const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',effective==='dark'?'#07162d':'#f6f8fb');const select=document.querySelector('#themeSelect');if(select&&select.value!==normalized)select.value=normalized;if(persist)localStorage.setItem(STORAGE_KEY,normalized);window.dispatchEvent(new CustomEvent('spideythemechange',{detail:{mode:normalized,effective}}))}
  function currentMode(){return normalizeMode(localStorage.getItem(STORAGE_KEY)||document.documentElement.dataset.themeMode||'system')}
  function initThemeControl(){const select=document.querySelector('#themeSelect');if(select){select.value=currentMode();select.addEventListener('change',()=>applyTheme(select.value))}const mediaListener=()=>{if(currentMode()==='system')applyTheme('system',false)};if(typeof media.addEventListener==='function')media.addEventListener('change',mediaListener);else if(typeof media.addListener==='function')media.addListener(mediaListener);applyTheme(currentMode(),false)}
  loadAppUi();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initThemeControl,{once:true});else initThemeControl();window.SpideyTheme={apply:applyTheme,currentMode,effectiveTheme};
})();
