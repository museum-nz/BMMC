// shared-map.js — BMMC shared helpers for the Leaflet map pages
// (2Dmap, 2Dmap_stamps, nz_history, trains, maritime, mtb). Load after Leaflet.
(function() {
  'use strict';

  // 1. Text & Number Parsing
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }

  function parseYearNum(val) {
    if (!val) return NaN;
    const m = String(val).match(/-?\d{3,4}/);
    return m ? parseInt(m[0], 10) : NaN;
  }

  // Zero is treated as "no coordinate" because blank sheet cells export as 0.
  function parseCoord(val) {
    if (val === null || val === undefined || val === '') return NaN;
    const m = String(val).trim().replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    if (!m) return NaN;
    const num = parseFloat(m[0]);
    return (isNaN(num) || num === 0) ? NaN : num;
  }

  // 2. CSV Rows
  function normalizeHeader(key) {
    return String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Returns the first non-empty value whose header matches an alias, in alias order.
  // Headers and aliases are compared lowercase with punctuation and spaces removed.
  function getCol(row, aliases) {
    if (!row) return '';
    const keys = Object.keys(row);
    const normKeys = keys.map(normalizeHeader);
    for (const alias of aliases) {
      const target = normalizeHeader(alias);
      for (let i = 0; i < keys.length; i++) {
        if (normKeys[i] !== target) continue;
        const val = row[keys[i]] === null || row[keys[i]] === undefined ? '' : String(row[keys[i]]).trim();
        if (val) return val;
      }
    }
    return '';
  }

  function looksLikeHtml(text) {
    const head = text.trim().slice(0, 15).toLowerCase();
    return head.startsWith('<!doctype') || head.startsWith('<html');
  }

  // Tries each URL in order and resolves with the first usable text, or null.
  // options.minLength — shortest acceptable response (default 50 characters)
  // options.timeoutMs — number, or function(url) returning a number; 0 means no timeout
  // options.fetchOptions — extra options passed to fetch()
  // options.accept — function(text) returning true if the text is usable
  async function fetchFirstText(candidates, options) {
    const opts = options || {};
    const minLength = opts.minLength === undefined ? 50 : opts.minLength;
    for (const url of candidates) {
      if (!url) continue;
      const timeoutMs = typeof opts.timeoutMs === 'function' ? opts.timeoutMs(url) : (opts.timeoutMs || 0);
      const controller = timeoutMs ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
      try {
        const res = await fetch(url, Object.assign({}, opts.fetchOptions, controller ? { signal: controller.signal } : {}));
        if (!res.ok) continue;
        const text = await res.text();
        if (!text || text.trim().length < minLength || looksLikeHtml(text)) continue;
        if (opts.accept && !opts.accept(text)) continue;
        return text;
      } catch (e) {
      } finally {
        if (timer) clearTimeout(timer);
      }
    }
    return null;
  }

  // 3. Saved Items (localStorage set of ids)
  function createSavedStore(storageKey) {
    function get() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) return new Set(JSON.parse(raw));
      } catch (e) {}
      return new Set();
    }

    function save(set) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(set)));
      } catch (e) {}
    }

    // Returns true if the id is saved after toggling.
    function toggle(id) {
      const set = get();
      const isNowSaved = !set.has(id);
      if (isNowSaved) set.add(id); else set.delete(id);
      save(set);
      return isNowSaved;
    }

    return { get, save, toggle };
  }

  // 4. Basemap Tile Sources
  const TILE_SOURCES = {
    natgeo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: 'Tiles &copy; Esri &mdash; National Geographic', maxZoom: 16 }
    },
    topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: 'Tiles &copy; Esri &mdash; Topographic', maxZoom: 19 }
    },
    imagery: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: 'Tiles &copy; Esri &mdash; Maxar, Earthstar Geographics', maxZoom: 18 }
    },
    ocean: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      options: { attribution: 'Tiles &copy; Esri &mdash; Garmin, GEBCO, NOAA', maxZoom: 13 }
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }
    },
    google: {
      url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      options: { attribution: '&copy; Google Maps', maxZoom: 20, subdomains: ['0', '1', '2', '3'] }
    },
    hybrid: {
      url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      options: { attribution: '&copy; Google Maps', maxZoom: 20, subdomains: ['0', '1', '2', '3'] }
    },
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      options: { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', maxZoom: 19, subdomains: 'abcd' }
    }
  };

  // overrides are merged over the source's options; overrides.url replaces the tile URL.
  function tileLayer(sourceKey, overrides) {
    const source = TILE_SOURCES[sourceKey];
    if (!source) throw new Error('Unknown tile source: ' + sourceKey);
    const options = Object.assign({}, source.options, overrides);
    const url = options.url || source.url;
    delete options.url;
    return L.tileLayer(url, options);
  }

  // Offline NZ vector basemap (PMTiles via protomaps-leaflet v5 + tileset v4).
  // Requires matching library: older protomaps-leaflet@4 + v4 tiles looks blank/washed-out.
  // options.url — path to nz.pmtiles (default '../data/tiles/nz.pmtiles')
  // options.flavor — 'light' | 'dark' | 'white' | 'grayscale' | 'black' | 'atlas' (default 'atlas')
  //   'atlas' = stronger land/water/road contrast (Carto Voyager–ish) for a readable offline map.
  // options.lang — label language (default 'en')
  function offlineAtlasFlavor() {
    // Based on Protomaps "light", with clearer water, greener parks/woods, warmer earth, yellow highways.
    return {
      background: '#c8d7e3',
      earth: '#f0e9dc',
      park_a: '#b7d9b0',
      park_b: '#8fcf8a',
      hospital: '#f0d9d6',
      industrial: '#d5dce0',
      school: '#efe6d4',
      wood_a: '#b5d4a8',
      wood_b: '#7fbf72',
      pedestrian: '#ebe4d4',
      scrub_a: '#c9d9b8',
      scrub_b: '#a8c98f',
      glacier: '#eef4f7',
      sand: '#efe4c8',
      beach: '#f2e6b8',
      aerodrome: '#d8dce2',
      runway: '#c5cad3',
      water: '#6eb6e0',
      zoo: '#b8d4b0',
      military: '#ddd8d0',
      tunnel_other_casing: '#d0d0d0',
      tunnel_minor_casing: '#d0d0d0',
      tunnel_link_casing: '#d0d0d0',
      tunnel_major_casing: '#d0d0d0',
      tunnel_highway_casing: '#d0d0d0',
      tunnel_other: '#c8c8c8',
      tunnel_minor: '#c8c8c8',
      tunnel_link: '#c8c8c8',
      tunnel_major: '#c8c8c8',
      tunnel_highway: '#e6c86e',
      pier: '#e0e0e0',
      buildings: '#d4cfc6',
      minor_service_casing: '#d0ccc4',
      minor_casing: '#d0ccc4',
      link_casing: '#c9b48a',
      major_casing_late: '#c9b48a',
      highway_casing_late: '#c9a24a',
      other: '#f5f2eb',
      minor_service: '#f5f2eb',
      minor_a: '#ffffff',
      minor_b: '#ffffff',
      link: '#f7e8b0',
      major_casing_early: '#c9b48a',
      major: '#f7e8b0',
      highway_casing_early: '#c9a24a',
      highway: '#f0c14a',
      railway: '#9aa3a8',
      boundaries: '#8a7a6a',
      bridges_other_casing: '#d0ccc4',
      bridges_minor_casing: '#d0ccc4',
      bridges_link_casing: '#c9b48a',
      bridges_major_casing: '#c9b48a',
      bridges_highway_casing: '#c9a24a',
      bridges_other: '#f5f2eb',
      bridges_minor: '#ffffff',
      bridges_link: '#f7e8b0',
      bridges_major: '#f7e8b0',
      bridges_highway: '#f0c14a',
      roads_label_minor: '#6a6560',
      roads_label_minor_halo: '#ffffff',
      roads_label_major: '#5a5048',
      roads_label_major_halo: '#ffffff',
      ocean_label: '#3d6fa8',
      subplace_label: '#5a5a5a',
      subplace_label_halo: '#f0e9dc',
      city_label: '#2c2c2c',
      city_label_halo: '#f0e9dc',
      state_label: '#6a5a4a',
      state_label_halo: '#f0e9dc',
      country_label: '#4a3a2a',
      address_label: '#6a6560',
      address_label_halo: '#ffffff',
      pois: {
        blue: '#1A8CBD', green: '#20834D', lapis: '#315BCF', pink: '#EF56BA',
        red: '#F2567A', slategray: '#6A5B8F', tangerine: '#CB6704', turquoise: '#00C3D4'
      },
      landcover: {
        grassland: 'rgba(190, 220, 160, 1)',
        barren: 'rgba(235, 220, 180, 1)',
        urban_area: 'rgba(220, 215, 205, 1)',
        farmland: 'rgba(210, 225, 165, 1)',
        glacier: 'rgba(235, 245, 250, 1)',
        scrub: 'rgba(210, 215, 165, 1)',
        forest: 'rgba(140, 185, 130, 1)'
      }
    };
  }

  function defaultOfflinePmtilesUrl() {
    try {
      // Phone app LocalServer: prefer the draw-a-box region extract.
      if (String(location.port) === '18766' ||
          location.hostname === '127.0.0.1' ||
          location.hostname === 'localhost') {
        return 'data/tiles/region.pmtiles';
      }
    } catch (_) {}
    return '../data/tiles/nz.pmtiles';
  }

  function offlineLayer(overrides) {
    const opts = overrides || {};
    if (typeof protomapsL === 'undefined' || typeof protomapsL.leafletLayer !== 'function') return null;
    const url = opts.url || defaultOfflinePmtilesUrl();
    const flavorName = opts.flavor || opts.theme || 'atlas';
    const lang = opts.lang || 'en';
    const attribution = opts.attribution ||
      '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://protomaps.com">Protomaps</a>';
    try {
      const layerOpts = {
        url: url,
        attribution: attribution,
        maxZoom: opts.maxZoom || 19,
        lang: lang
      };
      // Custom atlas palette (v5 paintRules / labelRules). Named flavors use `flavor`.
      if (flavorName === 'atlas' && typeof protomapsL.paintRules === 'function' && typeof protomapsL.labelRules === 'function') {
        const atlas = offlineAtlasFlavor();
        layerOpts.paintRules = protomapsL.paintRules(atlas);
        layerOpts.labelRules = protomapsL.labelRules(atlas, lang);
        layerOpts.backgroundColor = atlas.background;
      } else if (flavorName) {
        // protomaps-leaflet v5+
        layerOpts.flavor = flavorName === 'atlas' ? 'light' : flavorName;
      }
      return protomapsL.leafletLayer(layerOpts);
    } catch (e) {
      return null;
    }
  }

  // 5. Basemap Switcher
  // layers — { key: L.TileLayer }; only these layers are removed when switching.
  // options.initial — key shown first (default: first key)
  // options.autoSwitch — { from, to, aboveZoom }: while `from` is selected, show `to` above that zoom
  // options.offlineKey — key of the offline layer in `layers` (default 'offline' if present)
  // options.onChange — function(key) called after a visible basemap change (including auto-fallback)
  // When online tiles fail (3+ tileerror with no tileload in ~4s) or navigator.onLine is false,
  // the switcher falls back to the offline layer. Picking an online layer clears the fallback.
  function createBasemapSwitcher(map, layers, options) {
    const opts = options || {};
    const auto = opts.autoSwitch || null;
    const offlineKey = opts.offlineKey || (layers.offline ? 'offline' : null);
    let selected = layers[opts.initial] ? opts.initial : Object.keys(layers)[0];
    let shown = null;
    let fallbackActive = false;
    let watchTimer = null;
    let errorCount = 0;
    let loadCount = 0;
    let watchedLayer = null;

    function resolve() {
      if (fallbackActive && offlineKey && layers[offlineKey]) return offlineKey;
      if (auto && selected === auto.from && map.getZoom() > auto.aboveZoom) return auto.to;
      return selected;
    }

    function clearWatch() {
      if (watchTimer) { clearTimeout(watchTimer); watchTimer = null; }
      if (watchedLayer) {
        watchedLayer.off('tileerror', onTileError);
        watchedLayer.off('tileload', onTileLoad);
        watchedLayer = null;
      }
      errorCount = 0;
      loadCount = 0;
    }

    function onTileError() {
      errorCount += 1;
      maybeFallback();
    }

    function onTileLoad() {
      loadCount += 1;
    }

    function maybeFallback() {
      if (!offlineKey || !layers[offlineKey] || fallbackActive) return;
      if (selected === offlineKey) return;
      if (errorCount >= 3 && loadCount === 0) {
        fallbackActive = true;
        show(resolve());
      }
    }

    function watchLayer(layer) {
      clearWatch();
      if (!layer || !offlineKey || selected === offlineKey) return;
      // Only raster TileLayers emit tileerror/tileload; skip PMTiles GridLayers.
      if (!(layer instanceof L.TileLayer)) return;
      watchedLayer = layer;
      errorCount = 0;
      loadCount = 0;
      layer.on('tileerror', onTileError);
      layer.on('tileload', onTileLoad);
      watchTimer = setTimeout(() => {
        if (errorCount >= 3 && loadCount === 0) maybeFallback();
      }, 4000);
    }

    function show(key) {
      if (!layers[key]) return;
      if (shown === key) return;
      Object.values(layers).forEach(layer => {
        if (layer && map.hasLayer(layer)) map.removeLayer(layer);
      });
      layers[key].addTo(map);
      shown = key;
      if (typeof opts.onChange === 'function') opts.onChange(key);
      if (key !== offlineKey) watchLayer(layers[key]);
      else clearWatch();
    }

    function set(key) {
      if (!layers[key]) return false;
      selected = key;
      if (key !== offlineKey) fallbackActive = false;
      show(resolve());
      return true;
    }

    function checkOnline() {
      if (typeof navigator !== 'undefined' && navigator.onLine === false && offlineKey && layers[offlineKey]) {
        fallbackActive = true;
        show(resolve());
      }
    }

    if (auto) map.on('zoomend', () => show(resolve()));
    if (typeof window !== 'undefined') {
      window.addEventListener('offline', checkOnline);
      window.addEventListener('online', () => {
        // Stay on offline until the user picks an online basemap.
      });
    }
    checkOnline();
    show(resolve());

    return {
      set,
      get selected() { return selected; },
      get shown() { return shown; },
      get fallbackActive() { return fallbackActive; }
    };
  }

  // 6. Marker Label Scaling (5% per zoom step from baseZoom, clamped to -2..+10 steps)
  function bindPillZoomScale(map, baseZoom, cssVar) {
    const prop = cssVar || '--pill-zoom-factor';
    function update() {
      const delta = map.getZoom() - baseZoom;
      const factor = Math.pow(1.05, Math.max(-2, Math.min(10, delta)));
      document.documentElement.style.setProperty(prop, factor.toFixed(3));
    }
    map.on('zoom', update);
    map.on('zoomend', update);
    update();
  }

  // 7. Fit All / Reset View Button (appended under the +/- zoom buttons)
  const RESET_VIEW_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';

  function addResetViewButton(zoomControl, onReset, title) {
    const container = zoomControl && zoomControl.getContainer();
    if (!container) return null;
    const btn = L.DomUtil.create('a', 'leaflet-control-zoom-all', container);
    btn.href = '#';
    btn.title = title || 'Fit All / Reset View (New Zealand)';
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', btn.title);
    btn.innerHTML = RESET_VIEW_ICON;
    // Tailwind's preflight makes SVGs display:block, which defeats Leaflet's text centring.
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    L.DomEvent.disableClickPropagation(btn);
    L.DomEvent.on(btn, 'click', (e) => {
      L.DomEvent.preventDefault(e);
      onReset();
    });
    return btn;
  }

  // 8. Fit Popups to Screen
  // Shrinks each popup to the map viewport and auto-pans clear of floating controls matched by
  // options.obstacles. Tall popups scroll inside instead of running off screen.
  // options.breakpoint (default Infinity) can limit fitting to narrow widths if needed.
  const POPUP_TIP_ALLOWANCE = 30;

  function boxSize(el, sides) {
    if (!el) return 0;
    const cs = getComputedStyle(el);
    return sides.reduce((sum, s) => sum + (parseFloat(cs['margin' + s]) || 0) + (parseFloat(cs['padding' + s]) || 0) + (parseFloat(cs['border' + s + 'Width']) || 0), 0);
  }

  function topObstacleBottom(map, selector) {
    const mapRect = map.getContainer().getBoundingClientRect();
    let bottom = 0;
    document.querySelectorAll(selector).forEach(el => {
      if (!el.offsetParent) return;
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.bottom <= mapRect.top || r.top - mapRect.top > mapRect.height / 2) return;
      bottom = Math.max(bottom, r.bottom - mapRect.top);
    });
    return Math.round(bottom);
  }

  function fitPopupToScreen(popup) {
    const map = popup._map;
    const cfg = map && map._bmmcPopupFit;
    if (!cfg) return;
    const o = popup.options;
    if (!popup._bmmcOriginal) {
      popup._bmmcOriginal = {
        maxWidth: o.maxWidth, minWidth: o.minWidth, maxHeight: o.maxHeight,
        autoPanPaddingTopLeft: o.autoPanPaddingTopLeft, autoPanPaddingBottomRight: o.autoPanPaddingBottomRight
      };
    }
    const orig = popup._bmmcOriginal;
    Object.assign(o, orig);

    const size = map.getSize();
    if (size.x > cfg.breakpoint) return;

    const m = cfg.margin;
    const top = Math.max(m, topObstacleBottom(map, cfg.obstacles) + m);
    const content = popup._contentNode;
    const wrapper = content && content.parentNode;
    const chromeX = boxSize(content, ['Left', 'Right']) + boxSize(wrapper, ['Left', 'Right']);
    const chromeY = boxSize(content, ['Top', 'Bottom']) + boxSize(wrapper, ['Top', 'Bottom']);

    // Keep room for the tip and map edge; content scrolls when taller than fitHeight.
    o.maxWidth = Math.max(140, Math.min(orig.maxWidth || 420, size.x - 2 * m - chromeX));
    o.minWidth = Math.min(orig.minWidth || 0, o.maxWidth);
    const fitHeight = Math.max(100, size.y - top - m - chromeY - POPUP_TIP_ALLOWANCE);
    o.maxHeight = orig.maxHeight ? Math.min(orig.maxHeight, fitHeight) : fitHeight;
    o.autoPan = true;
    o.keepInView = true;
    o.autoPanPaddingTopLeft = L.point(m, top);
    o.autoPanPaddingBottomRight = L.point(m, m);
  }

  // Styles applied after opening (e.g. Tailwind's CDN generating classes) can resize a popup
  // after Leaflet has already laid it out and panned, so lay out and pan again when that happens.
  function watchPopupResize(popup) {
    if (typeof ResizeObserver === 'undefined' || !popup._map || !popup._map._bmmcPopupFit || !popup._contentNode) return;
    let lastHeight = popup._container.offsetHeight;
    let frame = 0;
    popup._bmmcResizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!popup._map || !popup._container) return;
        const height = popup._container.offsetHeight;
        if (Math.abs(height - lastHeight) < 2) return;
        lastHeight = height;
        fitPopupToScreen(popup);
        popup._updateLayout();
        popup._updatePosition();
        popup._adjustPan();
        lastHeight = popup._container.offsetHeight;
      });
    });
    popup._bmmcResizeObserver.observe(popup._contentNode);
  }

  L.Popup.addInitHook(function() {
    this.on('contentupdate', () => fitPopupToScreen(this));
    this.on('add', () => watchPopupResize(this));
    this.on('remove', () => {
      if (this._bmmcResizeObserver) this._bmmcResizeObserver.disconnect();
      this._bmmcResizeObserver = null;
    });
  });

  function fitPopupsToScreen(map, options) {
    const opts = options || {};
    map._bmmcPopupFit = {
      // Fit on all widths by default (was 640 — wide phones / landscape still overflowed).
      breakpoint: opts.breakpoint === undefined ? Infinity : opts.breakpoint,
      margin: opts.margin === undefined ? 10 : opts.margin,
      obstacles: opts.obstacles || '.top-controls-wrapper, .leaflet-top .leaflet-control, .mtb-nav-hud'
    };
  }

  // ---- Cross-wing search index (nearby / same era) ----
  let _searchIndexPromise = null;

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function loadSearchIndex() {
    if (window.SEARCH_INDEX && Array.isArray(window.SEARCH_INDEX.entries)) {
      return Promise.resolve(window.SEARCH_INDEX);
    }
    if (_searchIndexPromise) return _searchIndexPromise;

    const jsonCandidates = ['../data/search_index.json', 'data/search_index.json', './data/search_index.json'];
    const jsCandidates = ['../data/search_index.js', 'data/search_index.js', './data/search_index.js'];

    async function fetchJsonFirst(urls) {
      for (const url of urls) {
        try {
          const r = await fetch(url);
          if (r.ok) {
            const data = await r.json();
            if (data && Array.isArray(data.entries)) return data;
          }
        } catch (e) { /* try next */ }
      }
      return null;
    }

    function loadScriptFirst(urls) {
      return new Promise((resolve) => {
        let i = 0;
        const tryNext = () => {
          if (i >= urls.length) {
            resolve(window.SEARCH_INDEX || { entries: [] });
            return;
          }
          const s = document.createElement('script');
          s.src = urls[i++];
          s.onload = () => resolve(window.SEARCH_INDEX || { entries: [] });
          s.onerror = tryNext;
          document.head.appendChild(s);
        };
        tryNext();
      });
    }

    _searchIndexPromise = fetchJsonFirst(jsonCandidates).then(data => {
      if (data) {
        window.SEARCH_INDEX = data;
        return data;
      }
      return loadScriptFirst(jsCandidates);
    });
    return _searchIndexPromise;
  }

  async function findRelated(point, options) {
    const opts = Object.assign({ km: 5, years: 10, limit: 6 }, options || {});
    const lat = point && point.lat;
    const lng = point && (point.lng !== undefined ? point.lng : point.lon);
    const year = point && point.year;
    const excludeId = opts.excludeId || (point && point.id) || null;
    const index = await loadSearchIndex();
    const entries = (index && index.entries) || [];

    const nearby = [];
    const sameEra = [];

    for (const e of entries) {
      if (excludeId && e.id === excludeId) continue;
      if (lat != null && lng != null && e.la != null && e.lo != null) {
        const dist = haversineKm(lat, lng, e.la, e.lo);
        if (dist <= opts.km) nearby.push(Object.assign({ _dist: dist }, e));
      }
      if (year != null && e.y != null && Math.abs(e.y - year) <= opts.years) {
        sameEra.push(Object.assign({ _yearDelta: Math.abs(e.y - year) }, e));
      }
    }

    nearby.sort((a, b) => a._dist - b._dist);
    sameEra.sort((a, b) => a._yearDelta - b._yearDelta || String(a.t).localeCompare(String(b.t)));

    // Prefer variety: drop duplicate titles, keep first N
    const pick = (arr, n) => {
      const out = [];
      const seen = new Set();
      for (const e of arr) {
        const key = (e.w || '') + '|' + (e.t || '');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(e);
        if (out.length >= n) break;
      }
      return out;
    };

    return {
      nearby: pick(nearby, opts.limit),
      sameEra: pick(sameEra, opts.limit)
    };
  }

  const WING_ICONS = {
    exhibit: '🏛️', stamp: '📮', gallery: '📷', transcript: '🎙️',
    history: '📜', trains: '🚂', maritime: '⚓', heritage: '🗿'
  };

  function relatedLinksHTML(related) {
    const blocks = [];
    const renderList = (label, items) => {
      if (!items || !items.length) return '';
      const lis = items.map(e => {
        const icon = WING_ICONS[e.w] || '📍';
        const yr = e.y != null ? ` (${e.y})` : '';
        const href = e.u || '#';
        return `<li><a href="${escapeHTML(href)}" class="bmmc-related-link">${icon} ${escapeHTML(e.t || e.id)}${escapeHTML(yr)}</a></li>`;
      }).join('');
      return `<div class="bmmc-related-group"><div class="bmmc-related-label">${label}</div><ul>${lis}</ul></div>`;
    };
    const near = renderList('Nearby', related.nearby);
    const era = renderList('Same era', related.sameEra);
    if (!near && !era) return '';
    return (
      `<details class="bmmc-related">` +
      `<summary>Nearby &amp; same era</summary>` +
      `<div class="bmmc-related-body">${near}${era}</div>` +
      `</details>`
    );
  }

  function ensureRelatedStyles() {
    if (document.getElementById('bmmc-related-styles')) return;
    const style = document.createElement('style');
    style.id = 'bmmc-related-styles';
    style.textContent = `
      .bmmc-related { margin-top: 10px; border-top: 1px solid rgba(148,163,184,0.35); padding-top: 8px; font-size: 11px; }
      .bmmc-related > summary { cursor: pointer; font-weight: 800; color: #0369a1; list-style: none; }
      .dark .bmmc-related > summary { color: #38bdf8; }
      .bmmc-related > summary::-webkit-details-marker { display: none; }
      .bmmc-related-body { margin-top: 6px; display: grid; gap: 8px; }
      .bmmc-related-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 2px; }
      .bmmc-related ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 3px; }
      .bmmc-related-link { color: inherit; text-decoration: none; font-weight: 600; display: block; line-height: 1.35; }
      .bmmc-related-link:hover { text-decoration: underline; color: #0284c7; }
    `;
    document.head.appendChild(style);
  }

  function mountRelatedOnPopup(marker, point) {
    if (!marker || !marker.on) return;
    ensureRelatedStyles();
    marker.on('popupopen', async () => {
      try {
        const popup = marker.getPopup && marker.getPopup();
        const root = popup && (popup.getElement ? popup.getElement() : null);
        const content = root && (root.querySelector('.leaflet-popup-content') || root);
        if (!content || content.querySelector('.bmmc-related')) return;
        const related = await findRelated(point, { km: 5, years: 10, limit: 6, excludeId: point && point.id });
        const html = relatedLinksHTML(related);
        if (!html) return;
        const wrap = document.createElement('div');
        wrap.innerHTML = html;
        content.appendChild(wrap.firstChild);
        if (popup && popup._updateLayout) {
          popup._updateLayout();
          popup._updatePosition();
        }
      } catch (err) {
        console.warn('BMMCMap related panel:', err);
      }
    });
  }

  function focusMarkerInCluster(map, clusterGroup, marker, zoom) {
    if (!map || !marker) return;
    const z = zoom || 12;
    const open = () => {
      try {
        map.setView(marker.getLatLng(), Math.max(map.getZoom(), z), { animate: true });
      } catch (e) {}
      marker.openPopup();
    };
    if (clusterGroup && typeof clusterGroup.zoomToShowLayer === 'function') {
      clusterGroup.zoomToShowLayer(marker, open);
    } else {
      open();
    }
  }

  window.BMMCMap = {
    escapeHTML,
    parseYearNum,
    parseCoord,
    getCol,
    fetchFirstText,
    createSavedStore,
    TILE_SOURCES,
    tileLayer,
    offlineLayer,
    createBasemapSwitcher,
    bindPillZoomScale,
    addResetViewButton,
    fitPopupsToScreen,
    loadSearchIndex,
    findRelated,
    mountRelatedOnPopup,
    focusMarkerInCluster,
    WING_ICONS
  };
})();
