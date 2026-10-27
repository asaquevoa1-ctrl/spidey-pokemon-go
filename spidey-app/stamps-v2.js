(() => {
  const IMAGE_FIELDS = ['stamp_image_url', 'stamp_image', 'image_url', 'image'];

  // Índice visual dos selos Pokémon Center documentados pelo Serebii (2026).
  // Não confundir imagens dos selos com banners do evento. Yokohama não possui
  // imagem individual confirmada na referência consultada: nunca inventar.
  const POKEMON_CENTER_STAMP_ART = Object.freeze({
    'pokemon-centre-fukuoka':145,
    'pokemon-go-lab-japan':146,
    'pokemon-centre-hiroshima':147,
    'pokemon-store-takamatsu':148,
    'pokemon-centre-kanazawa':149,
    'pokemon-centre-kyoto':150,
    'pokemon-centre-mega-tokyo':151,
    'pokemon-centre-nagoya':152,
    'pokemon-centre-okinawa':153,
    'pokemon-centre-osaka':154,
    'pokemon-centre-osaka-dx':155,
    'pokemon-centre-sapporo':156,
    'pokemon-centre-shibuya':157,
    'pokemon-centre-skytree':158,
    'pokemon-centre-tohoku':159,
    'pokemon-centre-tokyo-bay':160,
    'pokemon-centre-tokyo-dx':161
  });
  const STAMP_ART_SOURCE = 'https://www.serebii.net/pokemongo/stamprally/pokemoncenterstamprally.shtml';
  // Nagasaki 2025/2026: há uma única arte de Ampharos para a campanha.
  // Não inventar oito desenhos distintos para oito paradas.
  const NAGASAKI_STAMP_DESIGN = 'https://www.serebii.net/pokemongo/stamps/61.png';


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
    const number = POKEMON_CENTER_STAMP_ART[stop?.id];
    if (number) return `https://www.serebii.net/pokemongo/stamps/${number}.png`;
    if (String(stop?.id || '').startsWith('nagasaki-city-')) return NAGASAKI_STAMP_DESIGN;
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

  // A PokéLid has a verified physical lid position, but this does NOT establish
  // the exact Pokémon GO PokéStop. Never feed these coordinates to GPX export.
  function pokelidVenueCoord(stop) {
    if (stop?.image_kind !== 'lid_artwork' || stop.coordinate_type !== 'venue_reference' || !validCoordinate(stop)) return '';
    return `${Number(stop.latitude).toFixed(6)},${Number(stop.longitude).toFixed(6)}`;
  }

  function landmarkVenueCoord(stop) {
    // Never treat geographic centers as exact GO PokéStops, and NEVER export these into GPX.
    if (stop?.reference_only_copyable !== true ||
        stop.coordinate_type !== 'venue_reference' ||
        stop.gpx_enabled !== false ||
        !validCoordinate(stop) || exactPokestop(stop)) return '';
    return `${Number(stop.latitude).toFixed(6)},${Number(stop.longitude).toFixed(6)}`;
  }

  // The official host sometimes fails to display on a mobile device; avoid the
  // broken-image icon and keep the official-page link available for the player.
  function installImageFallback(root) {
    root.addEventListener('error', event => {
      const img = event.target;
      if (!img || img.tagName !== 'IMG' || !img.closest('.stamp-tile-art-v2, .stamp-active-art-v2')) return;
      const placeholder = document.createElement('div');
      placeholder.className = 'stamp-art-placeholder-v2 stamp-art-load-failed';
      placeholder.setAttribute('role', 'status');
      placeholder.textContent = 'Imagem indisponível. Veja na fonte oficial.';
      img.replaceWith(placeholder);
    }, true);
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
          ${image ? `<img src="${escapeHtml(image)}" alt="${stop.image_kind === 'lid_artwork' ? 'PokéLid' : 'Selo'} ${number} · ${escapeHtml(stop.venue || stop.city || '')}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : `
            <div class="stamp-art-placeholder-v2 stamp-art-unavailable-v2" aria-label="Selo ${number} sem desenho individual confirmado">
              <span>SELO</span><strong>${number}</strong>
            </div>`}
          <span class="stamp-tile-status-v2">${done ? '✓' : number}</span>
        </div>
        <div class="stamp-tile-copy-v2">
          <strong>${escapeHtml(stop.venue || stop.city || `Selo ${number}`)}</strong>
          <small>${escapeHtml(stop.city || '')}${stop.prefecture ? ` · ${escapeHtml(stop.prefecture)}` : ''}</small>
          <span>${stop.image_kind === 'lid_artwork' ? 'Arte original da PokéLid' : exact ? 'PokéStop confirmada' : landmarkVenueCoord(stop) ? 'Referência do local' : 'Coordenada pendente'}</span>
        </div>
      </button>`;
  }

  function setClipboard(text, success, textarea) {
    if (!text) {
      showToast('Ainda não há coordenadas nesta lista.');
      return;
    }
    const fallback = () => {
      if (textarea) {
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        try {
          if (document.execCommand && document.execCommand('copy')) {
            showToast(success);
            return;
          }
        } catch (_) {}
      }
      showToast('Selecione as coordenadas acima para copiar.');
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast(success)).catch(fallback);
    } else fallback();
  }

  openStampRally = function spideyOpenStampRallyV2(rally) {
    beginAppDialog();
    if (rally.collection_type === 'event_guide') {
      // Official event without published stamp count/stop list: an editorial guide, not an empty live tracker.
      const steps = rally.public_notes ?? rally.notes ?? [];
      const rewards = rally.rewards ?? [];
      detail.innerHTML = `
        <div class="detail-body stamp-detail stamp-detail-v2">
          <span class="eyebrow">DÍA DE MUERTOS · GUIA DE SELOS</span>
          <h2>${escapeHtml(rally.title)}</h2>
          <p>${escapeHtml(rally.public_summary ?? rally.summary ?? '')}</p>
          <p class="microcopy"><strong>31/10 a 05/11 • Cidade do México</strong> · Passeio de la Reforma · 10h–20h locais (13h–23h de Brasília)</p>
          <p class="microcopy">A quantidade de selos e as Poképaradas específicas não foram publicadas. Encontre o símbolo dos selos no mapa do próprio Pokémon GO.</p>
          <h3>Como aproveitar a aventura</h3>
          <ol class="bonus-list">${steps.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol>
          <h3>O que você pode ganhar</h3>
          <ul class="bonus-list">${rewards.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>
          ${rally.source?.url ? `<div class="action-row"><a class="action-btn" href="${escapeHtml(rally.source.url)}" target="_blank" rel="noopener noreferrer">Conferir anúncio oficial</a></div>` : ''}
        </div>`;
      showAppDialog();
      return;
    }
    const stops = orderedStops(rally);
    const isPokelid = rally.collection_type === 'pokelids';
    const isLandmarkGuide = rally.coordinate_policy === 'venue_references_no_gpx';
    const publicNotes=rally.public_notes ?? rally.notes ?? [];
    let progress = getStampProgress(rally);
    const exactStops = stops.filter(exactPokestop);
    const lidPlaces = isPokelid ? stops.filter(pokelidVenueCoord) : [];
    const landmarkPlaces = isLandmarkGuide ? stops.filter(landmarkVenueCoord) : [];
    const fullGpx = !isLandmarkGuide && exactStops.length === stops.length && stops.length > 0;
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
      return list.map(stop => isPokelid ? pokelidVenueCoord(stop) : isLandmarkGuide ? landmarkVenueCoord(stop) : coord(stop)).filter(Boolean).join('\n');
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
        ${isPokelid ? '<p class="microcopy">Conheça os desenhos das tampas Pokémon pelo Japão. Nem toda PokéLid já virou uma PokéStop no jogo.</p>' : ''}
        ${isLandmarkGuide ? '<p class="microcopy">Temos os sete lugares no mapa! As coordenadas são dos locais, não das Poképaradas. Procure o símbolo do selo dentro do Pokémon GO.</p>' : ''}
        ${rally.id === 'nagasaki-city-stamp-rally' ? '<p class="microcopy">O selo de Nagasaki tem o desenho de Ampharos. Ele aparece nas oito paradas desta coleção.</p>' : ''}

        <div class="stamp-dashboard-v2">
          <div><strong id="stampV2Progress">${progress.size}/${stops.length}</strong><span>concluídos</span></div>
          <div><strong>${isPokelid ? lidPlaces.length : isLandmarkGuide ? landmarkPlaces.length : exactStops.length}/${stops.length}</strong><span>${isPokelid ? 'locais das tampas' : isLandmarkGuide ? 'lugares no mapa' : 'pontos confirmados'}</span></div>
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

        <section class="stamp-datahub-v2 stamp-copy-list-v3" aria-label="Listas de coordenadas para copiar">
          <div class="stamp-section-head-v2">
            <div><span class="eyebrow">PRONTO PARA COPIAR</span><h3>${isLandmarkGuide ? 'Referências dos 7 lugares' : 'Coordenadas ' + (isPokelid ? 'por prefeitura' : 'da coleção')}</h3></div>
          </div>
          ${isPokelid ? `
            <p class="microcopy">Escolha uma prefeitura e copie os locais de uma só vez.</p>
            <label class="stamp-copy-label-v3" for="stampCoordPrefecture">Prefeitura do Japão</label>
            <select id="stampCoordPrefecture" aria-label="Prefeitura para copiar coordenadas">
              <option value="all">Todas as prefeituras · ${lidPlaces.length} locais</option>
              ${regions.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)} · ${stops.filter(stop => regionLabel(stop) === name).length} locais</option>`).join('')}
            </select>
          ` : ''}
          <p id="stampCoordListCount" class="microcopy" aria-live="polite"></p>
          <textarea id="rallyAllCoordinates" readonly spellcheck="false" rows="9" aria-label="Coordenadas prontas para copiar">${copySet(stops)}</textarea>
          <div class="action-row stamp-bulk-actions-v2">
            <button id="copyAllStampCoords" class="action-btn gold" type="button">${isLandmarkGuide ? 'Copiar os 7 lugares' : 'Copiar toda a lista'}</button>
            ${fullGpx ? '<a id="downloadRallyGpxV2" class="action-btn">Baixar GPX</a>' : ''}
          </div>
          <p class="microcopy">${isLandmarkGuide ? 'Os sete números mostram a localização dos lugares, não a Poképarada com o selo. No jogo, confira qual Poképarada está participando; não existe GPX verificado.' : isPokelid
            ? 'Estes pontos indicam onde ficam as tampas Pokémon. A PokéStop dentro do jogo pode estar em outro lugar.'
            : exactStops.length
              ? 'Um local por linha. Estes pontos foram conferidos pela comunidade; confirme a PokéStop no jogo.'
              : 'Ainda não temos coordenadas confirmadas para esta coleção.'}</p>
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
    installImageFallback(detail);
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
      const lidValue = isPokelid ? pokelidVenueCoord(stop) : '';
      const landmarkValue = isLandmarkGuide ? landmarkVenueCoord(stop) : '';
      const value = lidValue || landmarkValue || coord(stop);
      const image = stampImage(stop);
      position.textContent = `${visible.indexOf(stop) + 1} de ${visible.length}`;
      toggleDone.textContent = done ? 'Marcar como faltante' : 'Marcar como feito';
      toggleDone.classList.toggle('is-done', done);
      activeBox.innerHTML = `
        <div class="stamp-active-art-v2 ${image ? '' : 'stamp-active-art-v2--without-image'}">
          ${image ? `<img src="${escapeHtml(image)}" alt="${isPokelid ? 'Desenho da PokéLid' : 'Desenho do selo'} ${escapeHtml(stop.stamp_number || index + 1)}" loading="eager" referrerpolicy="no-referrer">` : `<div class="stamp-art-placeholder-v2 stamp-art-unavailable-v2"><span>SELO</span><strong>${escapeHtml(stop.stamp_number || index + 1)}</strong></div>`}
        </div>
        <div class="stamp-active-copy-v2">
          <span class="coordinate-state ${exactPokestop(stop) ? 'confirmed' : 'pending'}">${escapeHtml(stampCoordinateLabel(stop))}</span>
          <h3>${escapeHtml(stop.venue || stop.city || `Selo ${index + 1}`)}</h3>
          <p>${escapeHtml(stop.city || '')}${stop.prefecture ? ` · ${escapeHtml(stop.prefecture)}` : ''}${stop.country ? ` · ${escapeHtml(stop.country)}` : ''}</p>
          ${stop.venue_detail ? `<small>${escapeHtml(stop.venue_detail)}</small>` : ''}
          ${lidValue ? `<div class="pokelid-place-copy"><small>LOCAL DA TAMPA • NÃO É POKÉSTOP VERIFICADA</small><code>${lidValue}</code><button id="copyActiveStampCoord" class="action-btn" type="button">Copiar local da tampa</button></div>` : ''}
          ${isPokelid ? `<div class="action-row"><a class="action-btn" href="https://www.google.com/maps?q=${Number(stop.latitude)},${Number(stop.longitude)}" target="_blank" rel="noopener noreferrer">Mapa da PokéLid</a><a class="action-btn" href="${escapeHtml(stop.official_url)}" target="_blank" rel="noopener noreferrer">Ver tampa oficial</a></div><small>Este ponto é da tampa física. A PokéStop no jogo pode ter outra posição.</small>` : isLandmarkGuide && stop.map_url ? `<a class="action-btn" href="${escapeHtml(stop.map_url)}" target="_blank" rel="noopener noreferrer">Ver lugar no mapa</a><p class="microcopy">Essa coordenada leva ao lugar, não necessariamente à Poképarada. Encontre o selo no mapa do jogo.</p>` : stop.map_url ? `<a class="action-btn" href="${escapeHtml(stop.map_url)}" target="_blank" rel="noopener">Ver local no mapa</a><p class="microcopy">Poképarada confirmada a conferir.</p>` : value ? '' : '<p class="microcopy">Coordenada exata ainda não confirmada.</p>'}
        </div>
        ${value && !isPokelid ? `<div class="coordinates stamp-active-coordinates-v2">${landmarkValue ? '<small>REFERÊNCIA DO LUGAR • NÃO É POKÉPARADA CONFIRMADA</small>' : ''}<div class="stamp-coordinate-values-v2"><div><small>Latitude</small><code>${value.split(',')[0]}</code></div><div><small>Longitude</small><code>${value.split(',')[1]}</code></div></div><button id="copyActiveStampCoord" class="action-btn" type="button">${landmarkValue ? 'Copiar local de referência' : 'Copiar coordenadas'}</button></div>` : ''}`;
      activeBox.querySelector('#copyActiveStampCoord')?.addEventListener('click', () => setClipboard(value, lidValue ? 'Local da tampa copiado (não é PokéStop verificada).' : landmarkValue ? 'Referência do lugar copiada. Confira o selo na Poképarada dentro do jogo.' : 'Coordenada copiada.'));
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

    // Uma lista por coleção ou prefeitura. Somente copiar; nenhum TXT é criado.
    const listTextarea = detail.querySelector('#rallyAllCoordinates');
    const listCount = detail.querySelector('#stampCoordListCount');
    const listCopy = detail.querySelector('#copyAllStampCoords');
    const copyPrefecture = detail.querySelector('#stampCoordPrefecture');
    function selectedCoordinates() {
      const selected = isPokelid && copyPrefecture?.value !== 'all'
        ? stops.filter(stop => regionLabel(stop) === copyPrefecture.value)
        : stops;
      return copySet(selected);
    }
    function refreshCoordinateList() {
      const value = selectedCoordinates();
      const count = value ? value.split('\n').length : 0;
      if (listTextarea) listTextarea.value = value;
      if (listCount) listCount.textContent = count
        ? count + (isLandmarkGuide ? ' locais de referência prontos para copiar.' : isPokelid ? ' locais prontos para copiar.' : ' coordenadas prontas para copiar.')
        : 'Nenhuma coordenada disponível nesta coleção.';
      if (listCopy) {
        listCopy.disabled = count === 0;
        listCopy.textContent = isPokelid && copyPrefecture?.value !== 'all'
          ? 'Copiar lista desta prefeitura' : isLandmarkGuide ? 'Copiar os 7 lugares' : 'Copiar toda a lista';
      }
    }
    copyPrefecture?.addEventListener('change', refreshCoordinateList);
    listCopy?.addEventListener('click', () => {
      const value = selectedCoordinates();
      const count = value ? value.split('\n').length : 0;
      setClipboard(value, count + (isLandmarkGuide ? ' locais de referência copiados. Procure as Poképaradas participantes no jogo.' : ' coordenadas copiadas. É só colar no DataHub.'), listTextarea);
    });
    refreshCoordinateList();

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
