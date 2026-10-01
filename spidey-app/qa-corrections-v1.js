(() => {
  const LOCAL_TIME_CATEGORIES = new Set([
    'spotlight_hour',
    'raid_hour',
    'community_day',
    'max_monday',
    'max_battle_day',
    'hatch_day',
  ]);
  const WORLD_POINTS_URL = 'data/world-event-points.json';
  const BRAZIL_ZONE = 'America/Sao_Paulo';
  let worldPointsPromise = null;

  const originalFormatRange = typeof formatRange === 'function' ? formatRange : null;
  const originalOpenEvent = typeof openEvent === 'function' ? openEvent : null;
  const originalWeeklyTimeLabel = typeof weeklyTimeLabel === 'function' ? weeklyTimeLabel : null;

  function hasGlobalTag(event) {
    return (event?.tags || []).some((tag) => String(tag).toLowerCase() === 'global');
  }

  function isLocalTimeEvent(event) {
    return !!event && LOCAL_TIME_CATEGORIES.has(event.category) && hasGlobalTag(event);
  }

  function isoDate(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
  }

  function isoClock(value) {
    const match = String(value || '').match(/T(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : '';
  }

  function dateLabelFromIso(value) {
    const raw = isoDate(value);
    if (!raw) return '';
    const [year, month, day] = raw.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
      .format(new Date(year, month - 1, day));
  }

  function localWindow(event) {
    const start = isoClock(event?.schedule?.start_local);
    const end = isoClock(event?.schedule?.end_local);
    return start && end ? `${start}–${end}` : 'Horário a confirmar';
  }

  function scheduleSummary(event) {
    if (!isLocalTimeEvent(event)) return null;
    const date = dateLabelFromIso(event.schedule?.start_local);
    return `${date ? `${date} · ` : ''}${localWindow(event)} · horário local`;
  }

  function formatPartsInZone(date, timeZone) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23',
    });
    const map = {};
    formatter.formatToParts(date).forEach((part) => {
      if (part.type !== 'literal') map[part.type] = Number(part.value);
    });
    return map;
  }

  function zonedLocalToDate(dateValue, timeValue, timeZone) {
    return window.SpideyFlyCore.localToDate(dateValue, timeValue, timeZone);
  }

  function formatBrazil(date) {
    if (!date || Number.isNaN(date.getTime())) return 'A confirmar';
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: BRAZIL_ZONE,
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
      hourCycle: 'h23',
    }).format(date);
  }

  function brazilWindowForPoint(event, point) {
    const startDate = isoDate(event?.schedule?.start_local);
    const endDate = isoDate(event?.schedule?.end_local) || startDate;
    const startClock = isoClock(event?.schedule?.start_local);
    const endClock = isoClock(event?.schedule?.end_local);
    const start = zonedLocalToDate(startDate, startClock, point.timezone);
    const end = zonedLocalToDate(endDate, endClock, point.timezone);
    return start && end ? `${formatBrazil(start)} → ${formatBrazil(end)}` : 'A confirmar';
  }

  async function loadWorldPoints() {
    return window.SpideyFlyCore.loadPoints().catch(() => []);
  }

  function coordinateTypeLabel(location) {
    if (location?.coordinate_type === 'exact_pokestop') return 'PokéStop exata';
    if (location?.coordinate_type === 'venue_reference') return 'Local aproximado';
    if (location?.coordinate_type === 'city_reference') return 'Cidade';
    return 'Local aproximado';
  }

  function eventLocationRows(event) {
    const locations = (event?.locations || []).filter((location) => validCoordinate(location));
    if (!locations.length) return '';
    return `<div class="event-location-list-v4">${locations.map((location, index) => {
      const value = `${Number(location.latitude).toFixed(6)},${Number(location.longitude).toFixed(6)}`;
      return `<div class="event-location-row-v4">
        <div><strong>${location.label || `Local ${index + 1}`}</strong><small>${coordinateTypeLabel(location)}</small><code>${value}</code></div>
        <button class="action-btn copy-event-ref-v4" data-value="${value}">Copiar</button>
      </div>`;
    }).join('')}</div>`;
  }

  function worldReferenceRows(event, points) {
    if (!points.length) return '<p class="microcopy">Não foi possível carregar os horários pelo mundo.</p>';
    const windowText = localWindow(event);
    return `<details class="world-reference-v4">
      <summary>Ver horários em ${points.length} lugares pelo mundo</summary>
      <p class="microcopy">Escolha uma região para ver quando jogar. Estes locais não são PokéStops do evento.</p>
      <div class="world-reference-list-v4">${points.map((point) => {
        const value = `${Number(point.lat).toFixed(6)},${Number(point.lon).toFixed(6)}`;
        return `<div class="world-reference-row-v4">
          <div>
            <strong>${point.flag || ''} ${point.name}</strong>
            <small>${windowText} local · ${brazilWindowForPoint(event, point)} no Brasil</small>
            <code>${value}</code>
          </div>
          <button class="action-btn copy-event-ref-v4" data-value="${value}">Copiar</button>
        </div>`;
      }).join('')}</div>
    </details>`;
  }

  function removeLegacyScheduleAndCoordinates(body) {
    body.querySelector('.info-grid')?.remove();
    const coordinateHeading = [...body.querySelectorAll('h3')]
      .find((heading) => heading.textContent.trim().toLowerCase() === 'coordenadas');
    if (!coordinateHeading) return;
    let node = coordinateHeading;
    while (node && !(node.nodeType === 1 && node.classList.contains('action-row'))) {
      const next = node.nextSibling;
      node.remove();
      node = next;
    }
  }

  async function enhanceEventDetail(event) {
    const body = detail?.querySelector('.detail-body');
    if (!body) return;
    removeLegacyScheduleAndCoordinates(body);
    const actionRow = body.querySelector('.action-row');
    const summary = scheduleSummary(event);
    const actualLocations = eventLocationRows(event);
    const section = document.createElement('section');
    section.className = 'event-wherewhen-v4';
    section.innerHTML = `
      <h3>Horários e locais</h3>
      ${summary ? `<div class="event-local-window-v4"><span>Horário do evento</span><strong>${summary}</strong><small>Esse horário vale no relógio da região onde você vai jogar.</small></div>` : `
        <div class="event-local-window-v4"><span>Horário</span><strong>${typeof originalFormatRange === 'function' ? originalFormatRange(event) : 'A confirmar'}</strong></div>`}
      ${actualLocations || (!hasGlobalTag(event) ? '<p class="microcopy">O local ainda será confirmado.</p>' : '')}
      
    `;
    if (actionRow) actionRow.before(section); else body.appendChild(section);

    // The FLY view owns the world route and its timezone calculations.

    section.querySelectorAll('.copy-event-ref-v4').forEach((button) => {
      button.addEventListener('click', async () => {
        await navigator.clipboard.writeText(button.dataset.value);
        showToast('Coordenada copiada.');
      });
    });
  }

  if (originalFormatRange) {
    formatRange = function spideyFormatRangeV4(event) {
      return scheduleSummary(event) || originalFormatRange(event);
    };
  }

  if (originalWeeklyTimeLabel) {
    weeklyTimeLabel = function spideyWeeklyTimeLabelV4(item) {
      const event = state?.events?.find((candidate) => candidate.id === item?.id);
      if (event && isLocalTimeEvent(event)) return `${localWindow(event)} local`;
      return originalWeeklyTimeLabel(item);
    };
  }

  if (originalOpenEvent) {
    openEvent = function spideyOpenEventV4(event) {
      originalOpenEvent(event);
      enhanceEventDetail(event);
    };
  }

  stampStopHtml = function spideyStampStopHtmlV4(rally, stop, progress) {
    const exact = exactPokestop(stop);
    const checked = progress.has(stop.id);
    const value = validCoordinate(stop) ? `${Number(stop.latitude).toFixed(6)},${Number(stop.longitude).toFixed(6)}` : '';
    return `
      <article class="stamp-stop ${exact ? 'is-exact' : 'needs-coordinate'}">
        <div class="stamp-stop-head">
          <div>
            <span class="eyebrow">SELO ${stop.stamp_number || ''}</span>
            <h3>${stop.city} · ${stop.country}</h3>
          </div>
          <label class="stamp-check"><input type="checkbox" class="stamp-toggle" data-stop-id="${stop.id}" ${checked ? 'checked' : ''}> Carimbado</label>
        </div>
        <p><strong>${stop.venue || 'Local a confirmar'}</strong></p>
        <p class="microcopy">${formatDateOnly(stop.available_from)} → ${formatDateOnly(stop.available_until)}</p>
        <div class="coordinate-state ${exact ? 'confirmed' : 'pending'}">${stampCoordinateLabel(stop)}</div>
        ${value ? `<div class="coordinates"><code>${value}</code><button class="action-btn copy-stamp-coord" data-value="${value}">Copiar</button></div>` : '<p class="microcopy">Sem latitude/longitude confirmada.</p>'}
      </article>`;
  };

  openStampRally = function spideyOpenStampRallyV4(rally) {
    const stops = rally.stops || [];
    const progress = getStampProgress(rally);
    const exactStops = stops.filter(exactPokestop);
    const fullGpx = exactStops.length === stops.length && stops.length > 0;
    const allCoordinates = exactStops
      .map((stop) => `${Number(stop.latitude).toFixed(6)},${Number(stop.longitude).toFixed(6)}`)
      .join('\n');

    detail.innerHTML = `
      <div class="detail-body stamp-detail">
        <span class="eyebrow">GO STAMP RALLY</span>
        <h2>${rally.title}</h2>
        <p>${rally.public_summary ?? rally.summary ?? ''}</p>
        <div class="info-grid">
          <div class="info-box"><span>Progresso</span><strong id="rallyProgressText">${progress.size}/${stops.length} selos</strong></div>
          <div class="info-box"><span>Coordenadas confirmadas</span><strong>${exactStops.length}/${stops.length}</strong></div>
        </div>

        ${exactStops.length ? `<section class="rally-coordinate-bundle-v4">
          <h3>Todas as coordenadas</h3>
          <p class="microcopy">Formato latitude,longitude — uma coordenada por linha. Copie tudo de uma vez para colar em apps compatíveis, como o DataHub.</p>
          <textarea id="rallyAllCoordinates" readonly rows="${Math.min(10, Math.max(4, exactStops.length))}">${allCoordinates}</textarea>
          <div class="action-row">
            <button id="copyRallyCoordinates" class="action-btn gold">Copiar todas as coordenadas</button>
            ${fullGpx ? '<button id="downloadRallyGpx" class="action-btn">Baixar GPX completo</button>' : ''}
            ${rally.source?.url ? `<a class="action-btn" href="${rally.source.url}" target="_blank" rel="noopener">Fonte oficial</a>` : ''}
          </div>
          ${!fullGpx ? `<p class="microcopy">O GPX completo só será liberado quando todas as ${stops.length} PokéStops tiverem coordenadas exatas. O campo acima contém apenas as ${exactStops.length} já confirmadas.</p>` : ''}
        </section>` : `
          <p class="microcopy">Ainda não há coordenadas exatas confirmadas para copiar ou gerar GPX.</p>
          ${rally.source?.url ? `<div class="action-row"><a class="action-btn" href="${rally.source.url}" target="_blank" rel="noopener">Fonte oficial</a></div>` : ''}`}

        <div class="stamp-stops">${stops.map((stop) => stampStopHtml(rally, stop, progress)).join('')}</div>
        ${(rally.rewards || []).length ? `<h3>Recompensas</h3><ul class="bonus-list">${rally.rewards.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
        ${(rally.public_notes ?? rally.notes ?? []).length ? `<h3>Observações</h3><ul class="bonus-list">${(rally.public_notes ?? rally.notes ?? []).map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
      </div>`;

    detail.querySelectorAll('.stamp-toggle').forEach((input) => {
      input.addEventListener('change', () => {
        const current = getStampProgress(rally);
        if (input.checked) current.add(input.dataset.stopId); else current.delete(input.dataset.stopId);
        saveStampProgress(rally, current);
        $('#rallyProgressText').textContent = `${current.size}/${stops.length} selos`;
        renderStamps();
      });
    });

    detail.querySelectorAll('.copy-stamp-coord').forEach((button) => {
      button.addEventListener('click', async () => {
        await navigator.clipboard.writeText(button.dataset.value);
        showToast('Coordenada da Stop copiada.');
      });
    });

    detail.querySelector('#copyRallyCoordinates')?.addEventListener('click', async () => {
      const field = detail.querySelector('#rallyAllCoordinates');
      if (!field?.value) return;
      await navigator.clipboard.writeText(field.value);
      showToast(`${exactStops.length} coordenadas copiadas.`);
    });

    detail.querySelector('#downloadRallyGpx')?.addEventListener('click', () => {
      if (!fullGpx) return;
      downloadText(`${rally.slug}.gpx`, gpxDocument(rally.title, exactStops.map((stop) => ({ ...stop, name: `${stop.city} - ${stop.venue}` }))));
      showToast('GPX completo do rally gerado.');
    });

    dialog.showModal();
  };

  function refreshRenderedViews() {
    try {
      if (state?.events?.length) {
        renderEvents();
        if (typeof renderWeeklyView === 'function') renderWeeklyView();
      }
    } catch (error) {
      console.error('Spidey QA refresh', error);
    }
  }

  setTimeout(refreshRenderedViews, 250);
  setTimeout(refreshRenderedViews, 1200);
})();
