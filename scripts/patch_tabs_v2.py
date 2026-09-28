from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def patch_index():
    path = ROOT / 'spidey-app' / 'index.html'
    text = path.read_text(encoding='utf-8')
    if 'tabs-v2.css' not in text:
        text = text.replace(
            '  <link rel="stylesheet" href="art-system.css">',
            '  <link rel="stylesheet" href="art-system.css">\n  <link rel="stylesheet" href="tabs-v2.css">',
            1,
        )

    if 'id="weeklyView"' not in text:
        weekly = '''
    <section id="weeklyView" class="app-view" hidden>
      <section class="hero hero-compact">
        <span class="eyebrow">SPIDEY WEEKLY</span>
        <h1>Esta semana</h1>
        <p>Os eventos mais importantes da semana, organizados por dia e por categoria.</p>
        <span id="weeklyPeriod" class="weekly-period"></span>
        <p id="weeklyLoadStatus" class="microcopy"></p>
      </section>

      <section class="status-strip" aria-label="Resumo semanal">
        <div><strong id="weeklyEventCount">0</strong><span>Eventos</span></div>
        <div><strong id="weeklyArtCount">0</strong><span>Com visual</span></div>
        <div><strong id="weeklyStampCount">0</strong><span>Stamps</span></div>
      </section>

      <section class="section weekly-shell">
        <div class="weekly-hero-card">
          <span class="eyebrow">7 DIAS</span>
          <h2>Agenda rápida</h2>
          <div id="weeklyDays" class="weekly-days"></div>
        </div>
        <div id="weeklySections"></div>
        <section id="weeklyStampStrip" class="weekly-block" hidden></section>
      </section>
    </section>

'''
        marker = '    <section id="stampsView" class="app-view" hidden>'
        if marker not in text:
            raise RuntimeError('stampsView marker not found')
        text = text.replace(marker, weekly + marker, 1)

    old_map = '''    <section id="mapView" class="app-view" hidden>
      <section class="hero hero-compact">
        <span class="eyebrow">MAPA</span>
        <h1>Stops confirmadas</h1>
        <p>O mapa só recebe pontos com coordenada confiável. Referências de cidade ou venue não viram PokéStop por aproximação.</p>
      </section>
      <section class="section">
        <div id="mapSummary" class="map-placeholder"></div>
      </section>
    </section>'''
    new_map = '''    <section id="mapView" class="app-view" hidden>
      <section class="hero hero-compact">
        <span class="eyebrow">MAPA</span>
        <h1>Coordenadas confirmadas</h1>
        <p>Somente pontos exatos entram no mapa. Referências de país, cidade ou venue ficam fora até confirmação.</p>
      </section>

      <section class="status-strip" aria-label="Resumo do mapa">
        <div><strong id="mapExactCount">0</strong><span>Exatos</span></div>
        <div><strong id="mapStampCount">0</strong><span>Stamps</span></div>
        <div><strong id="mapEventCount">0</strong><span>Eventos</span></div>
      </section>

      <section class="section map-shell">
        <div class="map-toolbar" aria-label="Filtros do mapa">
          <button class="map-filter active" data-map-filter="all">Todos</button>
          <button class="map-filter" data-map-filter="stamp">Stamps</button>
          <button class="map-filter" data-map-filter="event">Eventos</button>
          <span class="microcopy"><strong id="mapVisibleCount">0</strong> visíveis</span>
        </div>
        <p id="mapEngineStatus" class="map-engine-status"></p>
        <div id="worldMap" class="world-map" hidden></div>

        <div>
          <div class="section-head"><div><span class="eyebrow">EXATOS</span><h2>Coordenadas disponíveis</h2></div></div>
          <div id="mapPointList" class="map-location-list"></div>
        </div>

        <div>
          <div class="section-head"><div><span class="eyebrow">EM VERIFICAÇÃO</span><h2>Venues aguardando Stop exata</h2></div></div>
          <div id="mapPendingList" class="map-pending-list"></div>
        </div>
        <div id="mapSummary" class="map-placeholder" hidden></div>
      </section>
    </section>'''
    if old_map in text:
        text = text.replace(old_map, new_map, 1)
    elif 'id="worldMap"' not in text:
        raise RuntimeError('mapView block not found')

    old_nav = '''    <button class="app-tab active" data-view="calendarView" aria-current="page">Calendário</button>
    <button class="app-tab" data-view="stampsView">Stamps</button>
    <button class="app-tab" data-view="mapView">Mapa</button>'''
    new_nav = '''    <button class="app-tab active" data-view="calendarView" aria-current="page">Calendário</button>
    <button class="app-tab" data-view="weeklyView">Semana</button>
    <button class="app-tab" data-view="stampsView">Stamps</button>
    <button class="app-tab" data-view="mapView">Mapa</button>'''
    if old_nav in text:
        text = text.replace(old_nav, new_nav, 1)
    elif 'data-view="weeklyView"' not in text:
        raise RuntimeError('tabs marker not found')

    if 'weekly.js' not in text:
        text = text.replace(
            '  <script src="art-system.js" defer></script>',
            '  <script src="art-system.js" defer></script>\n  <script src="weekly.js" defer></script>\n  <script src="map.js" defer></script>',
            1,
        )
    path.write_text(text, encoding='utf-8')


def patch_app():
    path = ROOT / 'spidey-app' / 'app.js'
    text = path.read_text(encoding='utf-8')
    old = """  if (viewId === 'stampsView') renderStamps();
  if (viewId === 'mapView') renderMapSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });"""
    new = """  if (viewId === 'weeklyView' && typeof renderWeeklyView === 'function') renderWeeklyView();
  if (viewId === 'stampsView') renderStamps();
  if (viewId === 'mapView') {
    if (typeof renderMapV2 === 'function') renderMapV2();
    else renderMapSummary();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });"""
    if old in text:
        text = text.replace(old, new, 1)
    elif "viewId === 'weeklyView'" not in text:
        raise RuntimeError('setView block not found')

    old_load = """    renderCalendar();
    renderEvents();
    renderStamps();
    renderMapSummary();"""
    new_load = """    renderCalendar();
    renderEvents();
    renderStamps();
    if (typeof renderWeeklyView === 'function') renderWeeklyView();
    if (typeof renderMapV2 === 'function') renderMapV2();
    else renderMapSummary();"""
    if old_load in text:
        text = text.replace(old_load, new_load, 1)
    elif 'typeof renderMapV2' not in text:
        raise RuntimeError('loadContent block not found')
    path.write_text(text, encoding='utf-8')


def patch_weekly():
    path = ROOT / 'scripts' / 'build_spidey_weekly.py'
    text = path.read_text(encoding='utf-8')
    if 'APP_WEEKLY_FILE' not in text:
        text = text.replace(
            'CURRENT_FILE = WEEKLY_DIR / "current.json"',
            'CURRENT_FILE = WEEKLY_DIR / "current.json"\nAPP_WEEKLY_FILE = ROOT / "spidey-app" / "data" / "weekly.json"',
            1,
        )
        needle = '    save(CURRENT_FILE, payload)\n    save(ARCHIVE_DIR / f"{payload[\'week_start\']}.json", payload)'
        replacement = '    save(CURRENT_FILE, payload)\n    save(APP_WEEKLY_FILE, payload)\n    save(ARCHIVE_DIR / f"{payload[\'week_start\']}.json", payload)'
        if needle not in text:
            raise RuntimeError('weekly save block not found')
        text = text.replace(needle, replacement, 1)
    path.write_text(text, encoding='utf-8')

    workflow = ROOT / '.github' / 'workflows' / 'spidey-weekly.yml'
    w = workflow.read_text(encoding='utf-8')
    if 'spidey-app/data/weekly.json' not in w:
        w = w.replace(
            '          python -m json.tool weekly/current.json >/dev/null',
            '          python -m json.tool weekly/current.json >/dev/null\n          python -m json.tool spidey-app/data/weekly.json >/dev/null',
            1,
        )
        w = w.replace(
            '          git add weekly/current.json weekly/archive',
            '          git add weekly/current.json weekly/archive spidey-app/data/weekly.json',
            1,
        )
    workflow.write_text(w, encoding='utf-8')


def patch_sw():
    path = ROOT / 'spidey-app' / 'sw.js'
    text = path.read_text(encoding='utf-8')
    text = re.sub(r"const CACHE = '[^']+';", "const CACHE = 'spidey-app-v1-20260928-tabs2';", text, count=1)
    if "'./tabs-v2.css'" not in text:
        text = text.replace("  './art-system.css',", "  './art-system.css',\n  './tabs-v2.css',", 1)
    if "'./weekly.js'" not in text:
        text = text.replace("  './art-system.js',", "  './art-system.js',\n  './weekly.js',\n  './map.js',", 1)
    if "'./data/weekly.json'" not in text:
        text = text.replace("  './data/stamps.json',", "  './data/stamps.json',\n  './data/weekly.json',", 1)
    text = text.replace(
        "const isData = request.url.includes('/data/events.json') || request.url.includes('/data/stamps.json');",
        "const isData = request.url.includes('/data/events.json') || request.url.includes('/data/stamps.json') || request.url.includes('/data/weekly.json');",
    )
    text = text.replace(
        r"/(?:index\.html|app\.js|art-system\.js|styles\.css|art-system\.css|stamps\.css)$/.test(url.pathname)",
        r"/(?:index\.html|app\.js|art-system\.js|weekly\.js|map\.js|styles\.css|art-system\.css|stamps\.css|tabs-v2\.css)$/.test(url.pathname)",
    )
    path.write_text(text, encoding='utf-8')


def main():
    patch_index()
    patch_app()
    patch_weekly()
    patch_sw()
    print('Spidey Tabs v2 patch OK')


if __name__ == '__main__':
    main()
