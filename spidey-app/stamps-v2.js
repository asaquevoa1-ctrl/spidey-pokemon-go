(() => {
  const IMAGE_FIELDS = ['stamp_image_url', 'stamp_image', 'image_url', 'image'];

  function orderedStops(rally) {
    return (rally.stops || []).map((stop, index) => ({ stop, index })).sort((a, b) => {
      const ao = Number(a.stop.route_order ?? a.stop.stamp_number ?? a.index + 1);
      const bo = Number(b.stop.route_order ?? b.stop.stamp_number ?? b.index + 1);
      return ao - bo || a.index - b.index;
    }).map(({ stop }) => stop);
  }

  function stampImage(stop) {
    for (const field of IMAGE_FIELDS) {
      const value = String(stop?.[field] || '').trim();
      if (value) return value;
    }
    return '';
  }

  function rallyCover(rally) {
    return String(rally?.art?.url || rally?.cover_image_url || rally?.image_url || '').trim();
  }

  function regionLabel(stop) {
    return stop.prefecture || stop.region || stop.city || stop.country || 'Sem região';
  }

  function searchable(stop) {
    return [
      stop.stamp_number,
      stop.city,
      stop.country,
      stop.prefecture,
      stop.region,
      stop.venue,
      stop.venue_detail,
      stop.id,
    ].filter(Boolean).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function coord(stop) {
    if (!exactPokestop(stop)) return '';
    return `${Number(stop.latitude).toFixed(6)},${Number(stop.longitude).toFixed(6)}`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function stopTile(stop, progress, position) {
    const done = progress.has(stop.id);
    const image = stampImage(stop);
    const exact = exactPokestop(stop);
    const number = stop.stamp_number || position + 1;
    return `
      <button class="stamp-tile-v2 ${done ? 'is-done' : ''}" type="button" data-stamp-stop-id="${escapeHtml(stop.id)}" aria-label="Abrir selo ${number}: ${escapeHtml(stop.venue || stop.city || '')}">
        <div class="stamp-tile-art-v2">
          ${image ? `<img src="${escapeHtml(image)}" alt="Selo ${number} · ${escapeHtml(stop.venue || stop.city || '')}" loading="lazy" decoding="async">` : `
            <div class="stamp-art-placeholder-v2" aria-label="Imagem do selo ainda não cadastrada">
              <span>SELO</span><strong>${number}</strong><small>imagem pendente</small>
            </div>`}
          <span class="stamp-tile-status-v2">${done ? '✓' : number}</span>
        </div>
        <div class="stamp-tile-copy-v2">
          <strong>${escapeHtml(stop.venue || stop.city || `Selo ${number}`)}</strong>
          <small>${escapeHtml(stop.city || '')}${stop.prefecture ? ` · ${escapeHtml(stop.prefecture)}` : ''}</small>
          <span>${exact ? 'Coordenada confirmada' : 'Coordenada pendente'}</span>
        </div>
      </button>`;
  }

  function setClipboard(text, success) {
    if (!text) {
      showToast('Nenhuma coordenada disponível neste filtro.');
      return;
    }
    navigator.clipboard.writeText(text).then(() => showToast(success)).catch(() => showToast('Não foi possível copiar.'));
  }

  openStampRally = function spideyOpenStampRallyV2(rally) {
    const stops = orderedStops(rally);
    let progress = getStampProgress(rally);
    const exactStops = stops.filter(exactPokestop);
    const fullGpx = exactStops.length === stops.length && stops.length > 0;
    const regions = [...new Set(stops.map(regionLabel).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    let search = '';
    let filter = 'all';
    let region = 'all';
    let activeId = (stops.find((stop) => !progress.has(stop.id)) || stops[0])?.id || '';

    function filteredStops() {
      const needle = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      return stops.filter((stop) => {
        if (region !== 'all' && regionLabel(stop) !== region) return false;
        if (filter === 'remaining' && progress.has(stop.id)) return false;
        if (filter === 'done' && !progress.has(stop.id)) return false;
        if (filter === 'exact' && !exactPokestop(stop)) return false;
        if (needle && !searchable(stop).includes(needle)) return false;
        return true;
      });
    }

    function copySet(list) {
      return list.filter(exactPokestop).map(coord).filter(Boolean).join('\n');
    }

    function activeIndex() {
      const index = stops.findIndex((stop) => stop.id === activeId);
      return index >= 0 ? index : 0;
    }

    const cover = rallyCover(rally);
    detail.innerHTML = `
      <div class="detail-body stamp-detail stamp-detail-v2">
        ${cover ? `<img class="stamp-rally-cover-v2" src="${escapeHtml(cover)}" alt="${escapeHtml(rally.title)}" loading="eager">` : ''}
        <span class="eyebrow">GO STAMP RALLY · ROTA SPIDEY</span>
        <h2>${escapeHtml(rally.title)}</h2>
        <p>${escapeHtml(rally.summary || '')}</p>

        <div class="stamp-dashboard-v2">
          <div><strong id="stampV2Progress">${progress.size}/${stops.length}</strong><span>concluídos</span></div>
          <div><strong>${exactStops.length}/${stops.length}</strong><span>coordenadas exatas</span></div>
          <div><strong>${stops.length - progress.size}</strong><span>restantes</span></div>
        </div>

        <section class="stamp-route-panel-v2" aria-label="Navegação da rota">
          <div class="stamp-route-title-v2">
            <div><span class="eyebrow">ROTA</span><h3>Próximo selo</h3></div>
            <strong id="stampRoutePosition"></strong>
          </div>
          <div id="stampActiveStop" class="stamp-active-stop-v2"></div>
          <div class="stamp-route-actions-v2">
            <button id="stampPrev" class="action-btn" type="button">← Anterior</button>
            <button id="stampToggleDone" class="action-btn gold" type="button">Marcar como feito</button>
            <button id="stampNext" class="action-btn" type="button">Próximo →</button>
          </div>
        </section>

        <section class="rally-coordinate-bundle-v4 stamp-datahub-v2">
          <div class="stamp-section-head-v2">
            <div><span class="eyebrow">DATAHUB / ROTA</span><h3>Coordenadas em lote</h3></div>
          </div>
          <p class="microcopy">Formato <strong>latitude,longitude</strong>, uma coordenada por linha e na mesma ordem dos selos.</p>
          <textarea id="rallyAllCoordinates" readonly rows="8">${copySet(exactStops)}</textarea>
          <div class="action-row stamp-bulk-actions-v2">
            <button id="copyAllStampCoords" class="action-btn gold" type="button">Copiar todas</button>
            <button id="copyRemainingStampCoords" class="action-btn" type="button">Copiar só faltantes</button>
            <button id="copyVisibleStampCoords" class="action-btn" type="button">Copiar filtradas</button>
            ${fullGpx ? '<button id="downloadRallyGpxV2" class="action-btn" type="button">Baixar GPX completo</button>' : ''}
          </div>
          ${!fullGpx ? `<p class="microcopy">GPX completo bloqueado até todas as ${stops.length} Stops terem coordenadas exatas. As funções de copiar usam somente pontos confirmados.</p>` : ''}
        </section>

        <section class="stamp-gallery-section-v2">
          <div class="stamp-section-head-v2">
            <div><span class="eyebrow">SELO POR SELO</span><h3>Galeria do set</h3></div>
            <span id="stampVisibleCount" class="stamp-visible-count-v2"></span>
          </div>
          <div class="stamp-filterbar-v2">
            <input id="stampSearchV2" type="search" placeholder="Buscar Stop, cidade ou selo…" autocomplete="off">
            <select id="stampRegionV2" aria-label="Filtrar por região">
              <option value="all">Todas as regiões</option>
              ${regions.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('')}
            </select>
            <div class="stamp-filterchips-v2" role="group" aria-label="Filtrar selos">
              <button class="active" type="button" data-stamp-filter="all">Todos</button>
              <button type="button" data-stamp-filter="remaining">Faltam</button>
              <button type="button" data-stamp-filter="done">Feitos</button>
              <button type="button" data-stamp-filter="exact">Com coordenada</button>
            </div>
          </div>
          <div id="stampGalleryV2" class="stamp-gallery-v2"></div>
        </section>

        ${(rally.rewards || []).length ? `<h3>Recompensas</h3><ul class="bonus-list">${rally.rewards.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
        ${(rally.notes || []).length ? `<h3>Observações</h3><ul class="bonus-list">${rally.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
        ${rally.source?.url ? `<div class="action-row"><a class="action-btn" href="${escapeHtml(rally.source.url)}" target="_blank" rel="noopener">Fonte oficial</a></div>` : ''}
      </div>`;

    const gallery = detail.querySelector('#stampGalleryV2');
    const activeBox = detail.querySelector('#stampActiveStop');
    const position = detail.querySelector('#stampRoutePosition');
    const toggleDone = detail.querySelector('#stampToggleDone');

    function renderGallery() {
      const visible = filteredStops();
      detail.querySelector('#stampVisibleCount').textContent = `${visible.length}/${stops.length}`;
      gallery.innerHTML = visible.length
        ? visible.map((stop) => stopTile(stop, progress, stops.indexOf(stop))).join('')
        : '<p class="empty">Nenhum selo corresponde a este filtro.</p>';
      gallery.querySelectorAll('[data-stamp-stop-id]').forEach((button) => {
        button.addEventListener('click', () => {
          activeId = button.dataset.stampStopId;
          renderActive();
          detail.querySelector('.stamp-route-panel-v2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }

    function renderActive() {
      if (!stops.length) return;
      const index = activeIndex();
      const stop = stops[index];
      activeId = stop.id;
      const done = progress.has(stop.id);
      const value = coord(stop);
      const image = stampImage(stop);
      position.textContent = `${index + 1} de ${stops.length}`;
      toggleDone.textContent = done ? 'Marcar como faltante' : 'Marcar como feito';
      toggleDone.classList.toggle('is-done', done);
      activeBox.innerHTML = `
        <div class="stamp-active-art-v2">
          ${image ? `<img src="${escapeHtml(image)}" alt="Selo ${escapeHtml(stop.stamp_number || index + 1)}" loading="eager">` : `<div class="stamp-art-placeholder-v2"><span>SELO</span><strong>${escapeHtml(stop.stamp_number || index + 1)}</strong><small>imagem pendente</small></div>`}
        </div>
        <div class="stamp-active-copy-v2">
          <span class="coordinate-state ${exactPokestop(stop) ? 'confirmed' : 'pending'}">${escapeHtml(stampCoordinateLabel(stop))}</span>
          <h3>${escapeHtml(stop.venue || stop.city || `Selo ${index + 1}`)}</h3>
          <p>${escapeHtml(stop.city || '')}${stop.prefecture ? ` · ${escapeHtml(stop.prefecture)}` : ''}${stop.country ? ` · ${escapeHtml(stop.country)}` : ''}</p>
          ${stop.venue_detail ? `<small>${escapeHtml(stop.venue_detail)}</small>` : ''}
          ${value ? `<div class="coordinates"><code>${value}</code><button id="copyActiveStampCoord" class="action-btn" type="button">Copiar</button></div>` : '<p class="microcopy">Coordenada exata ainda não confirmada.</p>'}
        </div>`;
      activeBox.querySelector('#copyActiveStampCoord')?.addEventListener('click', () => setClipboard(value, 'Coordenada copiada.'));
      gallery.querySelectorAll('.stamp-tile-v2').forEach((tile) => tile.classList.toggle('is-active', tile.dataset.stampStopId === stop.id));
    }

    function setActiveByOffset(offset) {
      if (!stops.length) return;
      const next = Math.max(0, Math.min(stops.length - 1, activeIndex() + offset));
      activeId = stops[next].id;
      renderActive();
      gallery.querySelector(`[data-stamp-stop-id="${CSS.escape(activeId)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    detail.querySelector('#stampPrev')?.addEventListener('click', () => setActiveByOffset(-1));
    detail.querySelector('#stampNext')?.addEventListener('click', () => setActiveByOffset(1));
    toggleDone?.addEventListener('click', () => {
      const stop = stops[activeIndex()];
      if (!stop) return;
      if (progress.has(stop.id)) progress.delete(stop.id); else progress.add(stop.id);
      saveStampProgress(rally, progress);
      detail.querySelector('#stampV2Progress').textContent = `${progress.size}/${stops.length}`;
      const dashboard = detail.querySelector('.stamp-dashboard-v2 > div:nth-child(3) strong');
      if (dashboard) dashboard.textContent = String(stops.length - progress.size);
      renderGallery();
      renderActive();
      renderStamps();
    });

    detail.querySelector('#copyAllStampCoords')?.addEventListener('click', () => setClipboard(copySet(stops), `${exactStops.length} coordenadas copiadas.`));
    detail.querySelector('#copyRemainingStampCoords')?.addEventListener('click', () => {
      const remaining = stops.filter((stop) => !progress.has(stop.id));
      setClipboard(copySet(remaining), `${remaining.filter(exactPokestop).length} coordenadas restantes copiadas.`);
    });
    detail.querySelector('#copyVisibleStampCoords')?.addEventListener('click', () => {
      const visible = filteredStops();
      setClipboard(copySet(visible), `${visible.filter(exactPokestop).length} coordenadas filtradas copiadas.`);
    });
    detail.querySelector('#downloadRallyGpxV2')?.addEventListener('click', () => {
      if (!fullGpx) return;
      downloadText(`${rally.slug}.gpx`, gpxDocument(rally.title, stops.map((stop) => ({ ...stop, name: `${stop.stamp_number || ''} ${stop.city || ''} - ${stop.venue || ''}`.trim() }))));
      showToast('GPX completo gerado na ordem dos selos.');
    });

    detail.querySelector('#stampSearchV2')?.addEventListener('input', (event) => {
      search = event.target.value || '';
      renderGallery();
      renderActive();
    });
    detail.querySelector('#stampRegionV2')?.addEventListener('change', (event) => {
      region = event.target.value || 'all';
      renderGallery();
      renderActive();
    });
    detail.querySelectorAll('[data-stamp-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        filter = button.dataset.stampFilter || 'all';
        detail.querySelectorAll('[data-stamp-filter]').forEach((item) => item.classList.toggle('active', item === button));
        renderGallery();
        renderActive();
      });
    });

    renderGallery();
    renderActive();
    dialog.showModal();
  };
})();
