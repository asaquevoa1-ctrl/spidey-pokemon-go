(() => {
  'use strict';
  const EVENT_ID = '2026-10-world-space-week';
  const DATA_URL = 'data/space-museums.json';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let dataPromise;
  let collaboration;

  function load() {
    return dataPromise ||= fetch(DATA_URL, {cache:'no-store'}).then(response => {
      if (!response.ok) throw new Error('Museus indisponíveis');
      return response.json();
    }).then(data => collaboration = data).catch(error => {
      dataPromise = null;
      throw error;
    });
  }

  function clock(zone, reference = new Date()) {
    return new Intl.DateTimeFormat('pt-BR', {timeZone:zone,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(reference);
  }

  function mapUrl(venue) {
    const coordinate = venue.coordinate;
    const query = coordinate ? `${coordinate.latitude},${coordinate.longitude}` : `${venue.name}, ${venue.address}, ${venue.city}, ${venue.country}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function backgroundFigure(venue) {
    const media = venue.location_background;
    if (!media) return '';
    return `<figure class="space-location-background"><img src="${esc(media.file)}?v=${esc(media.sha256.slice(0,12))}" width="${media.width}" height="${media.height}" alt="${esc(media.alt)}" loading="lazy" decoding="async"><figcaption>Fundo de Localização · ${esc(venue.city)}</figcaption></figure>`;
  }

  function researchSection(venue, data) {
    const research = venue.research;
    if (!research || !data.research) return '';
    const tasks = research.field_tasks || [];
    const report = research.report;
    return `<details class="space-research" ${tasks.length ? 'open' : ''}>
      <summary>Missões e recompensas <span>${tasks.length ? `${tasks.length} relatadas` : 'A confirmar'}</span></summary>
      ${tasks.length ? `<p class="space-report-label">Relato de jogadores · ${esc(venue.city)} · 04/10/2026</p><table><thead><tr><th scope="col">Tarefa</th><th scope="col">Recompensa relatada</th></tr></thead><tbody>${tasks.map(task => `<tr><td>${esc(task.title)}</td><td>${esc(task.reward.description)}</td></tr>`).join('')}</tbody></table><p>${esc(research.note)}</p><a class="space-venue-source" href="${esc(report.url)}" target="_blank" rel="noopener">Ver relato de ${esc(venue.city)} ↗</a>` : `<p>${esc(research.note)}</p>`}
      <p><strong>Pesquisa temporária:</strong> ${esc(data.research.timed_instruction)}</p>
      <p><strong>Pesquisa de Campo · 4 a 10/10:</strong> ${esc(data.research.field_instruction)}</p>
      <p class="microcopy">${esc(data.research.official_reward_rule)}</p>
    </details>`;
  }

  function museumRows(data, reference = new Date()) {
    return data.museums.map(venue => {
      const coordinate = venue.coordinate;
      const value = coordinate ? `${coordinate.latitude},${coordinate.longitude}` : venue.address;
      return `<article class="space-museum" data-space-museum="${esc(venue.id)}">
        <span class="eyebrow">${esc(venue.city)} · ${esc(venue.country)}</span>
        <h3>${esc(venue.name)}</h3>
        ${backgroundFigure(venue)}
        ${researchSection(venue, data)}
        ${venue.gpx ? `<p class="space-gpx-status"><strong>GPX da área:</strong> ${esc(venue.gpx.note)}</p>` : ''}
        <p>${esc(venue.address)}</p>
        <p class="space-clock">Agora no local: <strong>${esc(clock(venue.timezone, reference))}</strong><br>Brasília: ${esc(clock('America/Sao_Paulo', reference))}</p>
        ${coordinate ? `<code>${esc(value)}</code><p class="microcopy">Referência do museu; confira o ponto no mapa.</p>` : ''}
        <div class="space-actions"><button class="action-btn" data-space-copy="${esc(value)}" data-space-copy-kind="${coordinate ? 'coordinate' : 'address'}">${coordinate ? 'Copiar coordenadas' : 'Copiar endereço'}</button><a class="action-btn" href="${esc(mapUrl(venue))}" target="_blank" rel="noopener">Abrir mapa</a><a class="space-venue-source" href="${esc(venue.source.url)}" target="_blank" rel="noopener">Informações do local ↗</a></div>
      </article>`;
    }).join('');
  }

  function officialFigure(media) {
    return `<figure class="space-official-figure"><img src="${esc(media.file)}?v=${esc(media.sha256.slice(0,12))}" width="${media.width}" height="${media.height}" alt="${esc(media.alt)}"><figcaption>Imagem do anúncio oficial · Pokémon GO${media.partner ? ' / ESA' : ''}</figcaption></figure>`;
  }

  async function openMuseums() {
    try {
      const data = await load();
      if (dialog.open) dialog.close();
      detail.classList.remove('spidey-detail-v3', 'player-art-unavailable', 'v23-no-hero');
      delete detail.dataset.visualCategory;
      delete detail.dataset.visualCharacter;
      detail.innerHTML = `<div class="detail-body space-detail space-museum-detail">
        <span class="eyebrow">PRESENCIAL · EUROPA</span><h2>Pikachu Astronauta · Museus e fundos</h2>
        ${officialFigure(data.official_media)}
        <p><strong>04/10/2026 a 30/04/2027</strong> · ${data.museums.length} museus participantes</p>
        <section class="space-background-info"><h3>Como conseguir o Fundo de Localização</h3><ul class="bonus-list">${data.background_rules.map(text => `<li>${esc(text)}</li>`).join('')}</ul></section>
        <details class="space-extra"><summary>Mais encontros entre 4 e 10 de outubro</summary><p>${esc(data.weekly_gameplay)}</p><p>${esc(data.esa_note)}</p></details>
        <p class="microcopy">Confira os horários de visita de cada museu. Os relógios mostram a hora atual, sem prometer reides durante todo o dia.</p>
        <p class="space-gpx-note">${esc(data.gpx.public_note)}</p>
        <div class="space-museum-list">${museumRows(data)}</div>
        <p class="space-background-credit">Fundos do jogo: <a href="${esc(data.background_assets_source.url)}" target="_blank" rel="noopener">acervo comunitário PokeMiners ↗</a>. Cidades conferidas no <a href="${esc(data.background_assets_source.city_mapping_url)}" target="_blank" rel="noopener">Serebii ↗</a>.</p>
        <a class="action-btn" href="${esc(data.source.url)}" target="_blank" rel="noopener">Anúncio oficial ↗</a>
      </div>`;
      dialog.showModal();
      dialog.scrollTop = 0;
      detail.scrollTop = 0;
      document.getElementById('closeDialog')?.focus({preventScroll:true});
    } catch {
      showToast('Não foi possível carregar os museus. Tente novamente.');
    }
  }

  function entryCard(data) {
    return `<article class="space-entry"><span class="eyebrow">PIKACHU ASTRONAUTA · EUROPA</span><h3>Museus e fundos de localização</h3><p>Seis museus, reides presenciais e pesquisas. Saiba onde procurar o fundo da sua coleção.</p><p class="microcopy">04/10/2026 a 30/04/2027</p><button class="action-btn gold" data-open-space-museums>Ver museus e fundos</button></article>`;
  }

  function mountEntries(data) {
    const world = document.getElementById('worldEvents');
    if (world && !world.querySelector('.space-entry')) world.insertAdjacentHTML('afterbegin',entryCard(data));
    const fly = document.getElementById('flyView');
    if (fly && !fly.querySelector('.space-entry')) fly.querySelector('.hero')?.insertAdjacentHTML('afterend',entryCard(data));
  }

  const originalOpenEvent = typeof openEvent === 'function' ? openEvent : null;
  if (originalOpenEvent) openEvent = function spaceEventDetail(event) {
    originalOpenEvent(event);
    if (event?.id !== EVENT_ID) return;
    const body = detail.querySelector('.detail-body');
    if (!body) return;
    body.classList.add('space-detail');
    if (!window.SPIDEY_APPROVED_ART_MASTER?.[EVENT_ID] && event.official_media) {
      detail.querySelector('.detail-hero')?.remove();
      body.querySelector('h2')?.insertAdjacentHTML('afterend',officialFigure(event.official_media));
    }
    body.insertAdjacentHTML('beforeend',`<section class="space-global-related"><h3>Quer procurar os fundos nos museus?</h3><p>A parceria europeia tem locais e prazos próprios.</p><button class="action-btn gold" data-open-space-museums>Ver museus e fundos</button></section>`);
  };

  function init() {
    document.addEventListener('click', async event => {
      if (event.target.closest('[data-open-space-museums]')) {
        openMuseums();
        return;
      }
      const button = event.target.closest('[data-space-copy]');
      if (!button) return;
      try {
        await navigator.clipboard.writeText(button.dataset.spaceCopy);
        showToast(button.dataset.spaceCopyKind === 'coordinate' ? 'Coordenadas copiadas.' : 'Endereço copiado.');
      } catch {
        showToast('Não foi possível copiar. Use o mapa do local.');
      }
    });
    load().then(mountEntries).catch(() => {});
    window.addEventListener('spideycontentready',()=> {if (collaboration) mountEntries(collaboration);});
    setInterval(() => {
      if (!dialog.open) return;
      const list = detail.querySelector('.space-museum-list');
      if (!list || !collaboration) return;
      list.querySelectorAll('.space-clock').forEach((element,index) => {
        const reference = new Date();
        element.innerHTML = `Agora no local: <strong>${esc(clock(collaboration.museums[index].timezone,reference))}</strong><br>Brasília: ${esc(clock('America/Sao_Paulo',reference))}`;
      });
    },60000);
  }
  window.SpideySpace = Object.freeze({openMuseums,clock,mapUrl,museumRows,researchSection});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
