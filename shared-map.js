// shared-map.js — BMMC shared helpers for the Leaflet map pages
// (2Dmap, 2Dmap_stamps, nz_history, trains, maritime). Load after Leaflet.
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

  // 5. Basemap Switcher
  // layers — { key: L.TileLayer }; only these layers are removed when switching.
  // options.initial — key shown first (default: first key)
  // options.autoSwitch — { from, to, aboveZoom }: while `from` is selected, show `to` above that zoom
  function createBasemapSwitcher(map, layers, options) {
    const opts = options || {};
    const auto = opts.autoSwitch || null;
    let selected = layers[opts.initial] ? opts.initial : Object.keys(layers)[0];
    let shown = null;

    function resolve() {
      if (auto && selected === auto.from && map.getZoom() > auto.aboveZoom) return auto.to;
      return selected;
    }

    function show(key) {
      if (shown === key) return;
      Object.values(layers).forEach(layer => {
        if (map.hasLayer(layer)) map.removeLayer(layer);
      });
      layers[key].addTo(map);
      shown = key;
    }

    function set(key) {
      if (!layers[key]) return false;
      selected = key;
      show(resolve());
      return true;
    }

    if (auto) map.on('zoomend', () => show(resolve()));
    show(resolve());

    return {
      set,
      get selected() { return selected; }
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

  window.BMMCMap = {
    escapeHTML,
    parseYearNum,
    parseCoord,
    getCol,
    fetchFirstText,
    createSavedStore,
    TILE_SOURCES,
    tileLayer,
    createBasemapSwitcher,
    bindPillZoomScale
  };
})();
