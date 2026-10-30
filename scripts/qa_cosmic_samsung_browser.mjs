import { spawn } from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = '1';
const output = 'test-results/cosmic-samsung';
// Explicit real-device regression: the Samsung recording spent >14s behind the splash.
fs.mkdirSync(output,{recursive:true});
const manifest = JSON.parse(fs.readFileSync('spidey-app/manifest.webmanifest','utf8'));
const expectedIcon = 'assets/branding/20261019/spidey-icon-cosmic-';
assert.equal(manifest.icons[0].src,expectedIcon+'192.png');
assert.equal(manifest.icons[1].src,expectedIcon+'512.png');

const server=spawn('python3',['-m','http.server','4187','--directory','.'],{stdio:'ignore'});
const base='http://127.0.0.1:4187/spidey-app/';
let browser;
const checks=[];
try {
  let ready=false;
  for(let i=0;i<50;i++){
    try{if((await fetch(base)).ok){ready=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,200));
  }
  if(!ready)throw Error('Spidey local HTTP server did not start');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome'});
  for(const theme of ['dark','light']){
    const context=await browser.newContext({
      viewport:{width:390,height:844},
      deviceScaleFactor:2.75,
      isMobile:true,hasTouch:true,
      userAgent:'Mozilla/5.0 (Linux; Android 14; SM-A725M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
      serviceWorkers:'block',
      colorScheme:theme
    });
    try {
      const page=await context.newPage();
      await page.addInitScript(t=>{
        localStorage.setItem('spidey-theme',t);
        window.__spideyNativePayload=null;
        Object.defineProperty(navigator,'share',{configurable:true,value:async value=>{window.__spideyNativePayload=value;}});
      },theme);
      const start=Date.now();
      const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:25000});
      const domReadyAt=Date.now();
      assert.equal(response.status(),200);
      assert.equal(await page.evaluate(()=>window.SPIDEY_COSMIC_ASSETS_VERIFIED),true);
      await page.waitForFunction(()=>{
        const s=document.getElementById('spideySplash');
        if(!s || s.hidden) return true;
        const st=getComputedStyle(s);
        // A CSS fail-safe may have made the overlay non-blocking before JS sets hidden.
        return st.visibility==='hidden' || (st.opacity==='0' && st.pointerEvents==='none');
      },null,{timeout:11000});
      const elapsed=Date.now()-start;
      assert.ok(Date.now()-domReadyAt<3500,'Splash lingered after document ready: '+(Date.now()-domReadyAt));
      assert.ok(elapsed<6500,'Total launch took too long in CI: '+elapsed);
      await page.waitForFunction(()=>document.body.classList.contains('cosmic-inapp-art'),null,{timeout:12000});
      const css=await page.evaluate(()=>getComputedStyle(document.body).backgroundImage);
      assert.ok(css.includes('spidey-clean-cosmic-20261019.webp'),'Approved clean background not applied; computed='+css.slice(0,600));
      const loaded=await page.evaluate(async()=>{
        const paths=[
          'assets/branding/20261019/spidey-opening-cosmic-20261019.webp',
          'assets/branding/20261019/spidey-loading-cosmic-20261019.webp',
          'assets/branding/20261019/spidey-icon-cosmic-20261019.webp',
          'assets/branding/20261019/spidey-wallpaper-cosmic-20261019.webp',
          'assets/branding/20261019/spidey-clean-cosmic-20261019.webp',
          'assets/branding/20261019/spidey-icon-cosmic-192.png',
          'assets/branding/20261019/spidey-icon-cosmic-512.png'
        ];
        return Promise.all(paths.map(async path=>({path,ok:(await fetch(path)).ok})));
      });
      assert.ok(loaded.every(x=>x.ok),'Missing new image: '+JSON.stringify(loaded.filter(x=>!x.ok)));
      await page.locator('#shareSpideyButton').waitFor({state:'visible',timeout:11000});
      await page.locator('#shareSpideyButton').click();
      await page.waitForFunction(()=>window.__spideyNativePayload !== null,null,{timeout:4000});
      const shared=await page.evaluate(()=>window.__spideyNativePayload);
      assert.ok(shared?.text?.includes(base),'Android share payload missing working link');
      assert.ok(!shared.text.includes('spidey-nexus'),'Prohibited branding in share text');
      await page.screenshot({path:`${output}/galaxy-390-${theme}.png`,animations:'disabled',timeout:16000});

      // Universe3D: verificar a Home real, e nao os blocos legacy ocultos.
      // The Premium cockpit is actual playerHome content, not hidden legacy blocks.
      const cockpit=page.locator('#playerHome .spidey-command-cockpit');
      await cockpit.waitFor({state:'visible',timeout:12000});
      assert.equal(await cockpit.locator(':scope > #spideyUniverse3D').count(),1,
        '3D hero not inside the cockpit');
      assert.equal(await cockpit.locator('.spidey-command-aside .spidey-premium-nav').count(),1,
        'Quick navigation was not assembled beside the 3D stage');
      assert.equal(await cockpit.locator('.spidey-command-aside .spidey-premium-kpis').count(),1,
        'Real event metrics missing from command panel');
      const header=page.locator('#playerHome .spidey-cockpit-home-head');
      await header.waitFor({state:'visible'});
      const emblem=header.locator('.spidey-cockpit-emblem');
      assert.ok(await emblem.evaluate(el=>el.complete&&el.naturalWidth>0),'Official S cosmic emblem failed');
      assert.ok((await header.innerText()).includes('Seu universo.'),'Premium opening not updated');
      const heroLink=header.locator('.spidey-cockpit-explore');
      assert.equal(await heroLink.getAttribute('href'),'#spideyUniverse3D');
      const layout=await cockpit.evaluate(el=>{
        const stage=el.querySelector('#spideyUniverse3D')?.getBoundingClientRect();
        const aside=el.querySelector('.spidey-command-aside')?.getBoundingClientRect();
        return {stage:stage&&{x:stage.x,y:stage.y,right:stage.right,bottom:stage.bottom},
          aside:aside&&{x:aside.x,y:aside.y,right:aside.right,bottom:aside.bottom},
          overflow:document.documentElement.scrollWidth>window.innerWidth+3};
      });
      assert.ok(layout.stage&&layout.aside,'Cockpit missing a major region');
      assert.ok(layout.aside.y>=layout.stage.bottom-3,'Samsung should stack navigation BELOW 3D stage');
      assert.equal(layout.overflow,false,'Cockpit introduced horizontal overflow on Samsung');
      await page.screenshot({path:`${output}/galaxy-390-${theme}-premium-cockpit.png`,
        animations:'disabled',timeout:16000});
      checks.push({profile:'Premium cockpit Samsung',theme,emblem:'official',
        quickNavigation:'visible',stageFirst:true,horizontalOverflow:false});

      const galaxy=page.locator('#playerHome #spideyUniverse3D');
      await galaxy.waitFor({state:'visible',timeout:12000});
      const heroY=(await galaxy.boundingBox())?.y;
      const kpiY=(await page.locator('#playerHome .spidey-premium-kpis').boundingBox())?.y;
      assert.ok(Number.isFinite(heroY)&&Number.isFinite(kpiY)&&heroY<kpiY,
        'Universe 3D deve aparecer antes dos indicadores na Home');
      const duplicate=page.locator('#spideyUniverseHighlightDetails');
      await duplicate.waitFor({state:'visible'});
      assert.equal(await duplicate.evaluate(node=>node.open),false,
        'Poster grande repetido deve iniciar recolhido no Samsung');
      await duplicate.locator(':scope > summary').click();
      assert.ok(await duplicate.evaluate(node=>node.open),
        'Roteiro completo deve expandir ao toque');
      await duplicate.locator(':scope > summary').click();
      assert.equal(await duplicate.evaluate(node=>node.open),false);

      const cards=galaxy.locator('.spidey-universe-card');
      assert.ok(await cards.count()>=2,'Galeria 3D precisa de eventos Premium reais');
      await galaxy.scrollIntoViewIfNeeded();
      const first=galaxy.locator('.spidey-universe-card[data-position="center"]');
      await first.waitFor({state:'visible'});
      const sceneStyle=await first.evaluate(card=>{
        const css=getComputedStyle(card);
        return {transform:css.transform,image:card.querySelector('img')?.getAttribute('src')};
      });
      assert.match(sceneStyle.transform,/matrix3d\(/,'Cartaz nao recebeu transform 3D');
      assert.ok(sceneStyle.image?.includes('assets/events/'),'Arte Premium nao vinculada a arquivo real');
      await first.locator('img').evaluate(img=>img.decode()).catch(()=>{});
      assert.ok(await first.locator('img').evaluate(img=>img.naturalWidth>0),'Arte Premium nao carregou');
      const before=await galaxy.locator('.spidey-universe-counter').innerText();
      await galaxy.locator('button[aria-label="Próximo evento"]').click();
      const after=await galaxy.locator('.spidey-universe-counter').innerText();
      assert.notEqual(after,before,'Controle de rotacao nao mudou o evento');
      assert.ok(await galaxy.locator('.spidey-universe-card[data-position="left"]').count()>0,'Plano 3D lateral ausente');
      await page.screenshot({path:output+'/galaxy-390-'+theme+'-universe-3d.png',animations:'disabled',timeout:16000});
      await galaxy.locator('.spidey-universe-open').click();
      await page.locator('#eventDialog[open]').waitFor({state:'visible',timeout:5000});
      await page.locator('#closeDialog').click();
      checks.push({profile:'Universe3D Samsung',theme,cards:await cards.count(),geometry:'css-3d+webgl-optional',rotation:'ok',detail:'ok'});


      // Vídeo físico de 29/10: cartaz Twitch/LA de 24/10 aparecia em
      // Londres (10/11) tanto na grade local como dentro do modal.
      await page.waitForFunction(()=>
        window.SPIDEY_WORLD_EVENTS?.some(e=>e.id==='2026-pokemon-night-out-london'),
        null,{timeout:11000});
      const londonId='2026-pokemon-night-out-london';
      const badPoster='pokemon-night-out-20261024-approved-v1.png';
      assert.equal(await page.evaluate(id=>window.SPIDEY_APPROVED_ART_MASTER?.[id],londonId),
        undefined,'Cadastro de artes ainda reutiliza cartaz Twitch 24/10 para Londres');
      const londonCards=page.locator('[data-world-event="'+londonId+'"]');
      await londonCards.first().waitFor({state:'attached',timeout:9000});
      assert.equal(await londonCards.locator('figure.world-premium-poster img').count(),0,
        'Cartaz vencido reapareceu nos cartões locais');
      assert.equal(await londonCards.locator('img[src*="'+badPoster+'"]').count(),0,
        'Cartaz de 24/10 associado a Londres nos cartões locais');
      await page.evaluate(id=>window.SpideyWorld.openLocalEvent(id),londonId);
      const londonModal=page.locator('[data-local-detail="'+londonId+'"]');
      await londonModal.waitFor({state:'visible',timeout:6000});
      assert.equal(await londonModal.locator('img[src*="'+badPoster+'"]').count(),0,
        'Cartaz de Twitch 24/10 apareceu no modal de Londres 10/11');
      assert.equal(await londonModal.locator('figure.world-premium-poster').count(),0,
        'O modal de Londres ainda expõe a arte antiga');
      assert.ok((await londonModal.innerText()).includes('10 nov'),
        'O evento de Londres deve continuar visível com a data correta');
      assert.ok(!(await londonModal.innerText()).includes('A arte Premium existente permanece preservada'),
        'Nota interna não pode aparecer ao jogador');
      await page.screenshot({path:output+'/galaxy-390-'+theme+'-london-no-expired-art.png',
        animations:'disabled',timeout:16000});
      await page.locator('#closeDialog').click();
      checks.push({profile:'London Night Out no Samsung',theme,
        localCards:await londonCards.count(),expiredPoster:false,detailsPreserved:true});
      
      // O vídeo real atravessa as telas internas no modo Claro. Validar
      // essas telas, nao somente o topo da Home, nos dois temas.
      for(const [view,card] of [
        ['pvpView','.pvp-card'],
        ['rocketGuideView','.rocket-card'],
        ['weeklyView','.weekly-item']
      ]){
        const tab=page.locator('.app-tab[data-view="'+view+'"]').first();
        assert.ok(await tab.count(),'Tab ausente: '+view);
        await tab.evaluate(button=>button.click());
        await page.waitForFunction(id=>{
          const el=document.getElementById(id);
          return el && !el.hidden;
        },view,{timeout:9000});
        await page.locator('#'+view+' '+card).first().waitFor({state:'visible',timeout:9000});
        const style=await page.locator('#'+view+' '+card).first().evaluate(el=>{
          const css=getComputedStyle(el);
          return {background:css.backgroundImage,border:css.borderTopWidth,shadow:css.boxShadow};
        });
        assert.match(style.background,/linear-gradient/i,view+' cartao sem acabamento');
        assert.ok(style.shadow!=='none',view+' cartao sem profundidade');
        if(theme==='light' && view==='rocketGuideView'){
          const highlight=page.locator('#rocketGuideView .rocket-hero strong').first();
          if(await highlight.count()){
            const color=await highlight.evaluate(el=>getComputedStyle(el).color);
            const rgb=color.match(/\d+/g)?.slice(0,3).map(Number)||[];
            assert.ok(rgb.length===3 && rgb[0]>=180 && rgb[1]>=130 && rgb[2]>=75,
              'Rocket hero precisa ter negrito dourado legivel no Claro: '+color);
          }
        }
        await page.screenshot({path:`${output}/galaxy-390-${theme}-${view}.png`,animations:'disabled',timeout:16000});
        checks.push({profile:'Samsung interno',theme,view,depth:style.shadow!=='none'});
      }

      // Full editorial walkthrough: not just the Home. These are the six
      // visible routes from the real app, tested in both Samsung themes.
      for(const id of ['newsView','weeklyView','flyView','pvpView','rocketGuideView','stampsView']){
        const button=page.locator('.app-tab[data-view="'+id+'"]').first();
        assert.ok(await button.count(),'Navegação inexistente: '+id);
        await button.evaluate(el=>el.click());
        const hero=page.locator('#'+id+' > .hero.hero-compact');
        await hero.waitFor({state:'visible',timeout:11000});
        await hero.scrollIntoViewIfNeeded();
        const style=await hero.evaluate(el=>{
          const css=getComputedStyle(el);
          const bounds=el.getBoundingClientRect();
          return {
            image:css.backgroundImage,border:css.borderTopWidth,
            heading:getComputedStyle(el.querySelector('h1')).color,
            width:bounds.width,x:bounds.x,
            overflow:document.documentElement.scrollWidth>window.innerWidth+4
          };
        });
        assert.ok(style.image.includes('spidey-icon-cosmic-192.png'),id+' sem emblema S original');
        assert.ok(style.image.includes('linear-gradient'),id+' sem palco Premium');
        assert.ok(parseFloat(style.border)>=2,id+' sem acabamento superior');
        assert.equal(style.overflow,false,id+' possui rolagem horizontal');
        assert.ok(style.width>=290,id+' cabeçalho estreito demais');
        await page.screenshot({path:output+'/galaxy-390-'+theme+'-premium-interior-'+id+'.png',
          animations:'disabled',timeout:16000});
        checks.push({profile:'Interior Premium Samsung',theme,id,hero:'cinematic',logo:'S original',
          horizontalOverflow:false});
      }
      // Return to Home through its existing tab; do not create another nav.
      await page.locator('.app-tab[data-view="calendarView"]').first()
        .evaluate(el=>el.click());
      // Visual-motion contract: actual route change, not artificial loading.
      assert.equal(await page.evaluate(()=>typeof window.SpideyMotion?.revealTheme),'function');
      await page.locator('.app-tab[data-view="pvpView"]').first().evaluate(el=>el.click());
      const motion=await page.locator('#pvpView').evaluate(el=>({
        name:getComputedStyle(el).animationName,hidden:el.hidden
      }));
      assert.equal(motion.hidden,false,'Premium route became hidden');
      assert.ok(motion.name.includes('spidey-scene-arrive'),
        'Premium route should animate only on real navigation: '+motion.name);
      await page.locator('.app-tab[data-view="calendarView"]').first().evaluate(el=>el.click());
      const alternate=theme==='dark'?'light':'dark';
      await page.locator('#themeSelect').evaluate((el,value)=>{
        el.value=value;
        el.dispatchEvent(new Event('change',{bubbles:true}));
      },alternate);
      await page.waitForFunction(t=>document.documentElement.dataset.theme===t,alternate,{timeout:3500});
      await page.waitForTimeout(530);
      assert.equal(await page.evaluate(()=>localStorage.getItem('spidey-theme')),alternate,
        'Manual theme selection failed to persist');
      await page.locator('#themeSelect').evaluate((el,value)=>{
        el.value=value;
        el.dispatchEvent(new Event('change',{bubbles:true}));
      },theme);
      await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme,{timeout:3500});
      await page.waitForTimeout(530);
      checks.push({profile:'Premium motion Samsung',theme,sceneTransition:'real view',
        themeReveal:'manual and reversible',splashBound:elapsed<6500});

      checks.push({profile:'Samsung Galaxy Android 14 simulated',width:390,theme,images:loaded.length,splashMs:elapsed,share:'ok',background:'ok'});
    }finally{await context.close();}
  }

  // Desktop version of the same cinematic experience: 3D LEFT, console RIGHT.
  const desktopContext=await browser.newContext({
    viewport:{width:1440,height:900},deviceScaleFactor:1,
    serviceWorkers:'block',colorScheme:'dark'
  });
  try {
    const desk=await desktopContext.newPage();
    await desk.addInitScript(()=>localStorage.setItem('spidey-theme','dark'));
    await desk.goto(base,{waitUntil:'domcontentloaded',timeout:25000});
    const board=desk.locator('#playerHome .spidey-command-cockpit');
    await board.waitFor({state:'visible',timeout:14000});
    const layout=await board.evaluate(node=>{
      const box=selector=>{
        const r=node.querySelector(selector)?.getBoundingClientRect();
        return r&&{x:r.x,right:r.right,y:r.y,bottom:r.bottom,width:r.width};
      };
      return {stage:box('#spideyUniverse3D'),aside:box('.spidey-command-aside'),
        columns:getComputedStyle(node).gridTemplateColumns,
        horizontalOverflow:document.documentElement.scrollWidth>innerWidth+3};
    });
    assert.ok(layout.stage&&layout.aside,'Desktop cockpit incomplete');
    assert.ok(layout.aside.x>=layout.stage.right-3,'Desktop console must be to the RIGHT of the stage');
    assert.equal(layout.horizontalOverflow,false,'Desktop horizontal overflow');
    const cosmic=desk.locator('#playerHome .spidey-cockpit-emblem');
    assert.ok(await cosmic.evaluate(e=>e.naturalWidth>0),'Desktop logo failed to render');
    await desk.screenshot({path:output+'/desktop-1440-premium-cockpit.png',
      animations:'disabled',timeout:16000});
    await desk.locator('#playerHome .spidey-cockpit-week').click();
    await desk.waitForFunction(()=>document.getElementById('weeklyView')&&!document.getElementById('weeklyView').hidden,
      null,{timeout:8000});
    checks.push({profile:'Premium cockpit desktop',width:1440,stageLeft:true,consoleRight:true,
      navigation:'week ok',horizontalOverflow:false});
  } finally { await desktopContext.close(); }

  // A deliberately slow catalog must not keep a full-screen loading image on screen.
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await context.newPage();
  await page.route('**/data/events.json',async route=>{
    await new Promise(resolve=>setTimeout(resolve,7000));
    try {await route.continue();}catch {}
  });
  const slowStart=Date.now();
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000});
  const domReadySlow=Date.now();
  await page.waitForFunction(()=>{
        const s=document.getElementById('spideySplash');
        if(!s || s.hidden) return true;
        const st=getComputedStyle(s);
        // A CSS fail-safe may have made the overlay non-blocking before JS sets hidden.
        return st.visibility==='hidden' || (st.opacity==='0' && st.pointerEvents==='none');
      },null,{timeout:5500});
  const slowSplashMs=Date.now()-slowStart;
  assert.ok(Date.now()-domReadySlow<3500,'Slow catalog must not trap the Samsung behind splash '+(Date.now()-domReadySlow)+'ms after DOM ready');
  assert.ok(slowSplashMs<6500,'Unexpected end-to-end delay with slow catalog '+slowSplashMs+'ms');
  assert.ok(await page.locator('.topbar').isVisible(),'App must be visible before the slow catalog completes');
  checks.push({profile:'Samsung delayed catalog',splashMs:slowSplashMs,mainAppVisible:true});
  await context.close();
  console.log(JSON.stringify({passed:checks.length,checks}));
}finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
}
