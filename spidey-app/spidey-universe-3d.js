/* Spidey Universe 3D 2026-10-29
 * Coverflow CSS-3D of REAL approved Premium events, with optional native WebGL
 * orbital scene. No CDN, no 3rd-party assets, no replacement of originals.
 */
(() => {
  'use strict';
  let selectedId = null;
  let expandedHighlight = false;
  const MOD = 5;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function make(tag, className, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content != null) el.textContent = content;
    return el;
  }
  function approvedEvents(events, focus, now, art, title, time, range) {
    const master = window.SPIDEY_APPROVED_ART_MASTER || {};
    const valid = e => {
      if (!e || !master[e.id]) return false;
      try {
        const dateStatus = window.SpideyDateOnly?.valid(e)
          ? window.SpideyDateOnly.status(e, now) : null;
        if (dateStatus === 'Data encerrada') return false;
        const r = range(e);
        return dateStatus ? true : !!(r?.end && r.end.getTime() > now.getTime());
      } catch (_) { return false; }
    };
    const ordered = [focus, ...(events || []).slice().filter(valid).sort((a, b) => {
      try { return range(a).start - range(b).start; } catch (_) { return 0; }
    })];
    const seen = new Set();
    const selected = [];
    for (const e of ordered) {
      if (!valid(e) || seen.has(e.id)) continue;
      seen.add(e.id);
      let file = null;
      try { file = art(e); } catch (_) {}
      if (!file || !/^(assets\/|\.\/assets\/)/.test(file)) continue;
      selected.push({ id: e.id, art: file, title: title(e), time: time(e) });
      if (selected.length === MOD) break;
    }
    return selected;
  }

  function createOrbitalRenderer(canvas, host) {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData === true;
    if (reduced || saveData) {
      canvas.hidden = true;
      return () => {};
    }
    let gl;
    try { gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, preserveDrawingBuffer: false, powerPreference: 'low-power' }); }
    catch (_) {}
    if (!gl) { canvas.hidden = true; return () => {}; }
    const vertex = 'attribute vec3 aP; attribute float aT; uniform float uR; uniform float uA; varying float vT; void main(){float c=cos(uR),s=sin(uR);vec3 p=vec3(aP.x*c+aP.z*s,aP.y,-aP.x*s+aP.z*c);float a=0.47;float ca=cos(a),sa=sin(a);p=vec3(p.x,p.y*ca-p.z*sa,p.y*sa+p.z*ca);float q=1.78/(4.4-p.z);gl_Position=vec4(p.x*q/uA,p.y*q,0.,1.);gl_PointSize=2.0;vT=aT;}';
    const fragment = 'precision mediump float; varying float vT; void main(){vec3 gold=vec3(.90,.70,.40);vec3 ruby=vec3(.79,.28,.34);gl_FragColor=vec4(mix(gold,ruby,vT),.46);}';
    function shader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    }
    const vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) { canvas.hidden = true; return () => {}; }
    const program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { canvas.hidden = true; return () => {}; }
    const coords = [];
    const segments = 100;
    function point(theta, axis, r) {
      if (axis === 0) return [r * Math.cos(theta), r * Math.sin(theta), 0];
      if (axis === 1) return [r * Math.cos(theta), 0, r * Math.sin(theta)];
      return [0, r * Math.cos(theta), r * Math.sin(theta)];
    }
    for (let axis = 0; axis < 3; axis++) {
      for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        const b = ((i + 1) / segments) * Math.PI * 2;
        coords.push(...point(a, axis, 1.52 + axis * .14), axis / 2);
        coords.push(...point(b, axis, 1.52 + axis * .14), axis / 2);
      }
    }
    const ringsCount = coords.length / 4;
    let seed = 54321;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 75; i++) {
      coords.push((rnd() - .5) * 6.7, (rnd() - .5) * 3.6, (rnd() - .5) * 3.4, rnd());
    }
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
    gl.useProgram(program);
    const p = gl.getAttribLocation(program, 'aP'), t = gl.getAttribLocation(program, 'aT');
    gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(t); gl.vertexAttribPointer(t, 1, gl.FLOAT, false, stride, 12);
    const rotation = gl.getUniformLocation(program, 'uR'), aspect = gl.getUniformLocation(program, 'uA');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    let visible = false, running = false, disposed = false, frame = 0, last = 0, rot = .1, renderTime = 0;
    function paint(ts) {
      if (disposed || !visible || document.hidden || !host.isConnected) { running = false; return; }
      frame = window.requestAnimationFrame(paint);
      if (ts - last < 46) return; // ~20fps max, with low-power GPU hint
      const delta = Math.min(70, ts - (last || ts)); last = ts;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      rot += delta * .00015; renderTime += delta;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(rotation, rot);
      gl.uniform1f(aspect, w / h);
      gl.drawArrays(gl.LINES, 0, ringsCount);
      gl.drawArrays(gl.POINTS, ringsCount, 75);
    }
    function start() { if (!running && !disposed && visible && !document.hidden) { running = true; frame = requestAnimationFrame(paint); } }
    const intersection = new IntersectionObserver(entries => {
      visible = !!entries[0]?.isIntersecting;
      if (visible) start();
      else { cancelAnimationFrame(frame); running = false; }
    }, { threshold: .05 });
    const onVisibility = () => { if (!document.hidden) start(); };
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); disposed = true; canvas.hidden = true; }, { once: true });
    document.addEventListener('visibilitychange', onVisibility);
    intersection.observe(host);
    return () => {
      disposed = true; cancelAnimationFrame(frame); intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      try { gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); } catch (_) {}
    };
  }

  function mount(root, events, focus, now, art, title, time, range) {
    if (!root) return;
    const selection = approvedEvents(events, focus, now, art, title, time, range);
    if (!selection.length) return;
    const stage = root.querySelector('.spidey-premium-feature-stage');
    if (!stage) return;
    const section = make('section', 'spidey-universe-3d');
    section.id = 'spideyUniverse3D';
    section.setAttribute('aria-label', 'Galeria 3D de eventos com artes Premium aprovadas');

    const heading = make('header', 'spidey-universe-heading');
    const headingCopy = make('div', 'spidey-universe-heading-copy');
    headingCopy.append(make('span', 'spidey-universe-eyebrow', 'UNIVERSO SPIDEY'), make('h2', '', 'Explore em 3D'));
    const hint = make('p', 'spidey-universe-instruction', 'Arraste para girar os eventos');
    heading.append(headingCopy, hint);
    const viewport = make('div', 'spidey-universe-viewport');
    viewport.setAttribute('aria-roledescription', 'carrossel tridimensional');
    viewport.tabIndex = 0;
    const canvas = make('canvas', 'spidey-universe-orbits');
    canvas.setAttribute('aria-hidden', 'true');
    const world = make('div', 'spidey-universe-world');
    const cards = selection.map((event, i) => {
      const btn = make('button', 'spidey-universe-card');
      btn.type = 'button';
      btn.dataset.spideyUniverseIndex = String(i);
      btn.setAttribute('aria-label', event.title + '. ' + event.time);
      const media = make('span', 'spidey-universe-card-media');
      const img = make('img', '', null);
      img.src = event.art; img.alt = 'Arte Premium: ' + event.title;
      img.loading = i <= 1 ? 'eager' : 'lazy'; img.decoding = 'async';
      img.addEventListener('error', () => { media.classList.add('spidey-art-unavailable'); });
      media.append(img);
      const text = make('span', 'spidey-universe-card-copy');
      text.append(make('small', '', event.time), make('strong', '', event.title));
      btn.append(media, text);
      world.append(btn);
      return btn;
    });
    viewport.append(canvas, world);
    const footer = make('div', 'spidey-universe-footer');
    const prev = make('button', 'spidey-universe-control', '‹');
    const next = make('button', 'spidey-universe-control', '›');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', 'Evento anterior');
    next.setAttribute('aria-label', 'Próximo evento');
    const counter = make('span', 'spidey-universe-counter');
    counter.setAttribute('aria-live', 'polite');
    const open = make('button', 'spidey-universe-open', 'Ver evento');
    open.type = 'button';
    footer.append(prev, counter, next, open);
    section.append(heading, viewport, footer);
    // Destaque visual em primeiro plano, antes dos números resumidos.
    const intro = root.querySelector('.spidey-premium-home-head');
    if (intro) intro.insertAdjacentElement('afterend', section);
    else stage.insertAdjacentElement('beforebegin', section);
    // Não mostrar o mesmo pôster duas vezes em sequência. O painel legado
    // continua completo e acessível, mas recolhido por padrão no Samsung.
    const disclosure = make('details', 'spidey-universe-highlight-details');
    disclosure.id = 'spideyUniverseHighlightDetails';
    const discloseTitle = make('summary', '', 'Programação e roteiro completo do destaque');
    discloseTitle.setAttribute('aria-label', 'Expandir programação e detalhes completos do destaque');
    stage.parentElement.insertBefore(disclosure, stage);
    disclosure.append(discloseTitle, stage);
    disclosure.open = expandedHighlight;
    disclosure.addEventListener('toggle', () => { expandedHighlight = disclosure.open; });

    let active = Math.max(0, selection.findIndex(item => item.id === selectedId));
    if (active < 0) active = 0;
    function draw() {
      cards.forEach((card, i) => {
        let delta = i - active;
        if (delta > selection.length / 2) delta -= selection.length;
        else if (delta < -selection.length / 2) delta += selection.length;
        const position = delta === 0 ? 'center' : delta === -1 ? 'left' : delta === 1 ? 'right' : 'outside';
        card.dataset.position = position;
        card.style.setProperty('--depth-index', String(10 - Math.abs(delta)));
        card.tabIndex = position === 'center' ? 0 : -1;
        card.setAttribute('aria-current', position === 'center' ? 'true' : 'false');
        if (position === 'center') card.dataset.playDetail = selection[i].id;
        else delete card.dataset.playDetail;
      });
      selectedId = selection[active].id;
      counter.textContent = (active + 1) + ' / ' + selection.length + ' · ' + selection[active].title;
      open.dataset.playDetail = selection[active].id;
      prev.disabled = next.disabled = selection.length < 2;
    }
    function move(delta) { active = (active + delta + selection.length) % selection.length; draw(); }
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    world.addEventListener('click', e => {
      const card = e.target.closest('[data-spidey-universe-index]');
      if (!card) return;
      const i = Number(card.dataset.spideyUniverseIndex);
      if (i !== active) { e.stopPropagation(); active = i; draw(); }
    });
    viewport.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); }
    });
    let touch = null, ignoreClick = false;
    viewport.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') touch = { x: e.clientX, y: e.clientY, id: e.pointerId };
    }, { passive: true });
    viewport.addEventListener('pointerup', e => {
      if (!touch || touch.id !== e.pointerId) return;
      const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
      touch = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        move(dx < 0 ? 1 : -1);
        ignoreClick = true;
        requestAnimationFrame(() => { ignoreClick = false; });
      }
    }, { passive: true });
    viewport.addEventListener('click', e => {
      if (ignoreClick) { e.stopPropagation(); e.preventDefault(); }
    }, true);
    draw();
    const dispose = createOrbitalRenderer(canvas, viewport);
    // The Home is rebuilt when new event data arrives or once per minute.
    // Old WebGL contexts must be disposed before a new deck is created.
    section.spideyDispose = dispose;
    return section;
  }
  window.SpideyUniverse3D = Object.freeze({ mount });
})();
