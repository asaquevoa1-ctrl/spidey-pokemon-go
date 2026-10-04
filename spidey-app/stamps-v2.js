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
      ...(stop.pokemon || []),
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
          ${image ? `<img src="${escapeHtml(image)}" alt="${stop.image_kind === 'lid_artwork' ? 'PokéLid' : 'Selo'} ${number} · ${escapeHtml(stop.venue || stop.city || '')}" loading="lazy" decoding="async">` : `
            <div class="stamp-art-placeholder-v2" aria-label="Imagem do selo ainda não disponível">
              <span>SELO</span><strong>${number}</strong><small>imagem pendente</small>
            </div>`}
          <span class="stamp-tile-status-v2">${done ? '✓' : number}</span>
        </div>
        <div class="stamp-tile-copy-v2">
          <strong>${escapeHtml(stop.venue || stop.city || `Selo ${number}`)}</strong>
          <small>${escapeHtml(stop.city || '')}${stop.prefecture ? ` · ${escapeHtml(stop.prefecture)}` : ''}</small>
          <span>${stop.image_kind === 'lid_artwork' ? 'Arte original da PokéLid' : exact ? 'Coordenada confirmada' : 'Coordenada pendente'}</span>
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
    beginAppDialog();
    const stops = orderedStops(rally);
    const isPokelid = rally.collection_type === 'pokelids';
    const publicNotes=rally.public_notes ?? rally.notes ?? [];
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
      <div class="detail-body stamp-detail stamp-detail-v2 ${isPokelid ? 'stamp-detail-pokelids' : ''}">
        ${cover ? `<img class="stamp-rally-cover-v2" src="${escapeHtml(cover)}" alt="${escapeHtml(rally.title)}" loading="eager">` : ''}
        <span class="eyebrow">${isPokelid ? 'POKÉLIDS · JAPÃO' : 'COLEÇÃO DE SELOS · SPIDEY'}</span>
        <h2>${escapeHtml(rally.title)}</h2>
        <p>${escapeHtml(rally.public_summary ?? rally.summary ?? '')}</p>
        ${isPokelid ? '<p class="microcopy">As imagens são as artes das tampas. Novas PokéLids podem aparecer neste catálogo antes de receber um selo no jogo.</p>' : ''}

        <div class="stamp-dashboard-v2">
          <div><strong id="stampV2Progress">${progress.size}/${stops.length}</strong><span>concluídos</span></div>
          <div><strong>${isPokelid ? stops.filter(validCoordinate).length : exactStops.length}/${stops.length}</strong><span>${isPokelid ? 'locais oficiais' : 'pontos confirmados'}</span></div>
          <div><strong>${stops.length - progress.size}</strong><span>restantes</span></div>
        </div>

        <section class="stamp-route-panel-v2" aria-label="Navegação da rota">
          <div class="stamp-route-title-v2">
            <div><span class="eyebrow">${isPokelid ? 'EXPLORAR' : 'ROTA'}</span><h3>${isPokelid ? 'Próxima PokéLid' : 'Próximo selo'}</h3></div>
            <strong id="stampRoutePosition"></strong>
          </div>
          ${isPokelid ? `<div class="stamp-prefecture-picker"><label for="stampPrefectureRoute">Escolher prefeitura</label><select id="stampPrefectureRoute"><option value="all">Todas as 42 prefeituras</option>${regions.map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('')}</select><p class="microcopy">A cada dois selos presenciais na mesma prefeitura: Pikachu com fundo local.</p></div>` : ''}
          <div id="stampActiveStop" class="stamp-active-stop-v2"></div>
          <div class="stamp-route-actions-v2">
            <button id="stampPrev" class="action-btn" type="button">← Anterior</button>
            <button id="stampToggleDone" class="action-btn gold" type="button">Marcar como feito</button>
            <button id="stampNext" class="action-btn" type="button">Próximo →</button>
          </div>
        </section>

        <section class="rally-coordinate-bundle-v4 stamp-datahub-v2" ${isPokelid ? 'hidden' : ''}>
          <div class="stamp-section-head-v2">
            <div><span class="eyebrow">COPIAR E BAIXAR</span><h3>Coordenadas da coleção</h3></div>
          </div>
          <p class="microcopy">Cada linha mostra a localização de um selo, na ordem da coleção.</p>
          <textarea id="rallyAllCoordinates" readonly rows="8">${copySet(exactStops)}</textarea>
          <div class="action-row stamp-bulk-actions-v2">
            <button id="copyAllStampCoords" class="action-btn gold" type="button">Copiar todas</button>
            <button id="copyRemainingStampCoords" class="action-btn" type="button">Copiar só faltantes</button>
            <button id="copyVisibleStampCoords" class="action-btn" type="button">Copiar filtradas</button>
            ${fullGpx ? '<a id="downloadRallyGpxV2" class="action-btn">Baixar GPX completo</a>' : ''}
          </div>
          ${!fullGpx ? `<p class="microcopy">A rota GPX ficará disponível quando todas as ${stops.length} PokéStops estiverem confirmadas. Você já pode copiar os pontos disponíveis.</p>` : ''}
        </section>

        <section class="stamp-gallery-section-v2">
          <div class="stamp-section-head-v2">
            <div><span class="eyebrow">${isPokelid ? 'TAMPA POR TAMPA' : 'SELO POR SELO'}</span><h3>${isPokelid ? 'Sua coleção' : 'Seus selos'}</h3></div>
            <span id="stampVisibleCount" class="stamp-visible-count-v2"></span>
          </div>
          <div class="stamp-filterbar-v2">
            <input id="stampSearchV2" type="search" placeholder="Buscar PokéStop, cidade ou selo…" autocomplete="off">
            <select id="stampRegionV2" aria-label="Filtrar por região">
              <option value="all">Todas as regiões</option>
              ${regions.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('')}
            </select>
            <div class="stamp-filterchips-v2" role="group" aria-label="Filtrar selos">
              <button class="active" type="button" data-stamp-filter="all">Todos</button>
              <button type="button" data-stamp-filter="remaining">Faltam</button>
              <button type="button" data-stamp-filter="done">Feitos</button>
              ${isPokelid ? '' : '<button type="button" data-stamp-filter="exact">Com coordenada</button>'}
            </div>
          </div>
          <div id="stampGalleryV2" class="stamp-gallery-v2"></div>
        </section>

        ${(rally.rewards || []).length ? `<h3>Recompensas</h3><ul class="bonus-list">${rally.rewards.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
        ${publicNotes.length ? `<h3>O que você precisa saber</h3><ul class="bonus-list">${publicNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
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
      const visible = filteredStops();
      if (!visible.length) {
        activeBox.innerHTML = '<p class="empty">Nenhum selo neste filtro. Escolha outra prefeitura ou busca.</p>';
        position.textContent = '0 de 0';
        toggleDone.disabled = true;
        return;
      }
      toggleDone.disabled = false;
      const stop = visible.find(item => item.id === activeId) || visible.find(item => !progress.has(item.id)) || visible[0];
      const index = stops.indexOf(stop);
      activeId = stop.id;
      const done = progress.has(stop.id);
      const value = coord(stop);
      const image = stampImage(stop);
      position.textContent = `${visible.indexOf(stop) + 1} de ${visible.length}`;
      toggleDone.textContent = done ? 'Marcar como faltante' : 'Marcar como feito';
      toggleDone.classList.toggle('is-done', done);
      activeBox.innerHTML = `
        <div class="stamp-active-art-v2">
          ${image ? `<img src="${escapeHtml(image)}" alt="${isPokelid ? 'PokéLid' : 'Selo'} ${escapeHtml(stop.stamp_number || index + 1)}" loading="eager">` : `<div class="stamp-art-placeholder-v2"><span>SELO</span><strong>${escapeHtml(stop.stamp_number || index + 1)}</strong><small>imagem pendente</small></div>`}
        </div>
        <div class="stamp-active-copy-v2">
          <span class="coordinate-state ${exactPokestop(stop) ? 'confirmed' : 'pending'}">${escapeHtml(stampCoordinateLabel(stop))}</span>
          <h3>${escapeHtml(stop.venue || stop.city || `Selo ${index + 1}`)}</h3>
          <p>${escapeHtml(stop.city || '')}${stop.prefecture ? ` · ${escapeHtml(stop.prefecture)}` : ''}${stop.country ? ` · ${escapeHtml(stop.country)}` : ''}</p>
          ${stop.venue_detail ? `<small>${escapeHtml(stop.venue_detail)}</small>` : ''}
          ${isPokelid ? `<div class="action-row"><a class="action-btn" href="https://www.google.com/maps?q=${Number(stop.latitude)},${Number(stop.longitude)}" target="_blank" rel="noopener">Mapa da PokéLid</a><a class="action-btn" href="${escapeHtml(stop.official_url)}" target="_blank" rel="noopener">Ver tampa oficial</a></div><small>Local da tampa; posição da PokéStop a conferir no jogo.</small>` : stop.map_url ? `<a class="action-btn" href="${escapeHtml(stop.map_url)}" target="_blank" rel="noopener">Ver local no mapa</a><p class="microcopy">Poképarada confirmada a conferir.</p>` : value ? '' : '<p class="microcopy">Coordenada exata ainda não confirmada.</p>'}
        </div>
        ${value ? `<div class="coordinates stamp-active-coordinates-v2"><div class="stamp-coordinate-values-v2"><div><small>Latitude</small><code>${value.split(',')[0]}</code></div><div><small>Longitude</small><code>${value.split(',')[1]}</code></div></div><button id="copyActiveStampCoord" class="action-btn" type="button">Copiar coordenadas</button></div>` : ''}`;
      activeBox.querySelector('#copyActiveStampCoord')?.addEventListener('click', () => setClipboard(value, 'Coordenada copiada.'));
      gallery.querySelectorAll('.stamp-tile-v2').forEach((tile) => tile.classList.toggle('is-active', tile.dataset.stampStopId === stop.id));
    }

    function setActiveByOffset(offset) {
      if (!stops.length) return;
      const visible = filteredStops();
      if (!visible.length) return;
      const index = Math.max(0, visible.findIndex(stop => stop.id === activeId));
      const next = Math.max(0, Math.min(visible.length - 1, index + offset));
      activeId = visible[next].id;
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
    const gpxLink = detail.querySelector('#downloadRallyGpxV2');
    if (fullGpx && gpxLink) {
      const content = gpxDocument(rally.title, stops.map((stop) => ({ ...stop, name: `${stop.stamp_number || ''} ${stop.city || ''} - ${stop.venue || ''}`.trim() })));
      const url = URL.createObjectURL(new Blob([content], { type: 'application/gpx+xml;charset=utf-8' }));
      const updateGpxLink = () => {
        gpxLink.href = navigator.onLine === false ? url : `api/gpx?rally=${encodeURIComponent(rally.id)}`;
      };
      updateGpxLink();
      gpxLink.download = `${rally.slug}.gpx`;
      window.addEventListener('online', updateGpxLink);
      window.addEventListener('offline', updateGpxLink);
      dialog.addEventListener('close', () => {
        URL.revokeObjectURL(url);
        window.removeEventListener('online', updateGpxLink);
        window.removeEventListener('offline', updateGpxLink);
      }, { once: true });
    }

    detail.querySelector('#stampSearchV2')?.addEventListener('input', (event) => {
      search = event.target.value || '';
      renderGallery();
      renderActive();
    });
    detail.querySelector('#stampPrefectureRoute')?.addEventListener('change', event => {
      region = event.target.value || 'all';
      detail.querySelector('#stampRegionV2').value = region;
      activeId = '';
      renderGallery(); renderActive();
    });
    detail.querySelector('#stampRegionV2')?.addEventListener('change', (event) => {
      region = event.target.value || 'all';
      if (isPokelid) detail.querySelector('#stampPrefectureRoute').value = region;
      activeId = '';
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
    showAppDialog();
  };
})();
