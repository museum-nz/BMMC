/**
 * MTB navigation helpers: long-press directions, in-app track/point nav + ETA,
 * Google Maps handoff, Windy wind embed, and ride-density heatmap (Strava alternative).
 *
 * Init: BMMCMtbNav.init({ map, getUserLatLng, collectTrackLatLngs, collectTrackLines, ensureGps })
 */
(function (global) {
  'use strict';

  const DEFAULT_SPEED_KMH = 15; // cycling / MTB estimate when GPS speed unavailable
  const ARRIVE_M = 25;
  const TURN_LOOKAHEAD_M = 60;
  const LONG_PRESS_MS = 550;

  let map = null;
  let hooks = {};
  let waypointMarker = null;
  let routeLine = null;
  let navActive = false;
  let navMode = null; // 'point' | 'track'
  let navPath = []; // [[lat,lng], ...]
  let navIndex = 0;
  let heatLayer = null;
  let heatOn = false;
  let windyOn = false;
  let longPressTimer = null;
  let longPressLatLng = null;

  function haversineM(a, b) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function bearingDeg(a, b) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const dLon = toRad(b[1] - a[1]);
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  function turnLabel(fromBearing, toBearing) {
    let d = ((toBearing - fromBearing + 540) % 360) - 180;
    if (Math.abs(d) < 25) return 'Continue straight';
    if (d > 0 && d < 60) return 'Bear right';
    if (d >= 60) return 'Turn right';
    if (d < 0 && d > -60) return 'Bear left';
    return 'Turn left';
  }

  function pathLengthM(path) {
    let sum = 0;
    for (let i = 1; i < path.length; i++) sum += haversineM(path[i - 1], path[i]);
    return sum;
  }

  function nearestIndex(path, point) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < path.length; i++) {
      const d = haversineM(path[i], point);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return { index: best, dist: bestD };
  }

  function remainingAlong(path, fromIndex, user) {
    if (!path.length) return 0;
    let rem = haversineM(user, path[fromIndex]);
    for (let i = fromIndex + 1; i < path.length; i++) rem += haversineM(path[i - 1], path[i]);
    return rem;
  }

  function fmtDist(m) {
    if (m < 1000) return Math.round(m) + ' m';
    return (m / 1000).toFixed(m >= 10000 ? 0 : 1) + ' km';
  }

  function fmtEta(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '—';
    const m = Math.round(seconds / 60);
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60);
    return h + ' h ' + (m % 60) + ' min';
  }

  function ensureUi() {
    if (document.getElementById('mtbNavSheet')) return;

    const sheet = document.createElement('div');
    sheet.id = 'mtbNavSheet';
    sheet.className = 'mtb-nav-sheet';
    sheet.hidden = true;
    sheet.innerHTML =
      '<div class="mtb-nav-sheet-card">' +
      '<div class="mtb-nav-sheet-title">Navigate</div>' +
      '<div class="mtb-nav-sheet-coords" id="mtbNavCoords"></div>' +
      '<button type="button" class="mtb-nav-action" id="mtbNavInAppPoint">Navigate here (direct)</button>' +
      '<button type="button" class="mtb-nav-action" id="mtbNavInAppTrack">Follow nearest trail</button>' +
      '<button type="button" class="mtb-nav-action secondary" id="mtbNavGoogle">Open in Google Maps</button>' +
      '<button type="button" class="mtb-nav-action ghost" id="mtbNavCancel">Cancel</button>' +
      '</div>';
    document.body.appendChild(sheet);

    const hud = document.createElement('div');
    hud.id = 'mtbNavHud';
    hud.className = 'mtb-nav-hud';
    hud.hidden = true;
    hud.innerHTML =
      '<div class="mtb-nav-hud-main">' +
      '<div class="mtb-nav-turn" id="mtbNavTurn">—</div>' +
      '<div class="mtb-nav-meta">' +
      '<span id="mtbNavRemain">—</span>' +
      '<span id="mtbNavEta">ETA —</span>' +
      '</div></div>' +
      '<button type="button" class="mtb-nav-stop" id="mtbNavStop" title="Stop navigation">✕</button>';
    document.body.appendChild(hud);

    const windy = document.createElement('div');
    windy.id = 'mtbWindyPanel';
    windy.className = 'mtb-windy-panel';
    windy.hidden = true;
    windy.innerHTML =
      '<div class="mtb-windy-bar">' +
      '<span>Windy · wind (full screen)</span>' +
      '<button type="button" id="mtbWindySync" title="Sync to map centre">Sync to map</button>' +
      '<button type="button" id="mtbWindyClose" title="Close Windy">Close</button>' +
      '</div>' +
      '<iframe id="mtbWindyFrame" title="Windy wind map" allowfullscreen loading="lazy"></iframe>';
    document.body.appendChild(windy);

    document.getElementById('mtbNavCancel').onclick = hideSheet;
    document.getElementById('mtbNavInAppPoint').onclick = () => startPointNav(longPressLatLng);
    document.getElementById('mtbNavInAppTrack').onclick = () => startTrackNav(longPressLatLng);
    document.getElementById('mtbNavGoogle').onclick = () => openGoogleMaps(longPressLatLng);
    document.getElementById('mtbNavStop').onclick = stopNav;
    document.getElementById('mtbWindyClose').onclick = () => setWindy(false);
    document.getElementById('mtbWindySync').onclick = syncWindy;
  }

  function hideSheet() {
    const sheet = document.getElementById('mtbNavSheet');
    if (sheet) sheet.hidden = true;
  }

  function showSheet(latlng) {
    ensureUi();
    longPressLatLng = latlng;
    const el = document.getElementById('mtbNavCoords');
    if (el) el.textContent = latlng.lat.toFixed(5) + ', ' + latlng.lng.toFixed(5);
    document.getElementById('mtbNavSheet').hidden = false;
  }

  function setWaypoint(latlng) {
    if (!map) return;
    if (waypointMarker) map.removeLayer(waypointMarker);
    waypointMarker = L.marker([latlng.lat, latlng.lng], {
      title: 'Waypoint',
      zIndexOffset: 900,
    }).addTo(map);
    waypointMarker.bindPopup('Destination').openPopup();
  }

  function clearRouteGraphics() {
    if (routeLine && map) {
      map.removeLayer(routeLine);
      routeLine = null;
    }
  }

  function openGoogleMaps(latlng) {
    if (!latlng) return;
    hideSheet();
    const dest = latlng.lat + ',' + latlng.lng;
    let origin = '';
    const user = hooks.getUserLatLng && hooks.getUserLatLng();
    if (user) origin = '&origin=' + encodeURIComponent(user[0] + ',' + user[1]);
    // Travelmode bicycling; Google shows alternatives in the Maps app / site.
    const url =
      'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent(dest) +
      origin +
      '&travelmode=bicycling';
    window.open(url, '_blank');
  }

  function startPointNav(latlng) {
    if (!latlng) return;
    hideSheet();
    if (hooks.ensureGps) hooks.ensureGps();
    setWaypoint(latlng);
    navMode = 'point';
    navPath = [[latlng.lat, latlng.lng]];
    navIndex = 0;
    navActive = true;
    clearRouteGraphics();
    const user = (hooks.getUserLatLng && hooks.getUserLatLng()) || [latlng.lat, latlng.lng];
    routeLine = L.polyline([user, [latlng.lat, latlng.lng]], {
      color: '#0284c7',
      weight: 4,
      dashArray: '8 8',
      opacity: 0.85,
    }).addTo(map);
    document.getElementById('mtbNavHud').hidden = false;
    document.getElementById('mtbNavTurn').textContent = 'Head to waypoint';
    updateNavFromUser(user);
  }

  function flattenLine(latlngs) {
    const out = [];
    const walk = (arr) => {
      if (!arr || !arr.length) return;
      if (typeof arr[0] === 'number') {
        out.push([arr[0], arr[1]]);
        return;
      }
      if (arr[0] && typeof arr[0].lat === 'number') {
        out.push([arr[0].lat, arr[0].lng]);
        return;
      }
      for (let i = 0; i < arr.length; i++) walk(arr[i]);
    };
    walk(latlngs);
    return out;
  }

  function pickBestTrackPath(dest) {
    const lines = (hooks.collectTrackLines && hooks.collectTrackLines()) || [];
    let best = null;
    let bestScore = Infinity;
    const destPt = [dest.lat, dest.lng];
    for (const line of lines) {
      const path = flattenLine(line);
      if (path.length < 2) continue;
      const nearDest = nearestIndex(path, destPt);
      if (nearDest.dist > 400) continue; // trail must pass near the tap
      const score = nearDest.dist;
      if (score < bestScore) {
        bestScore = score;
        // Prefer destination-ward direction: trim path to end at nearest-to-dest
        best = path.slice(0, nearDest.index + 1);
        if (best.length < 2) best = path;
      }
    }
    return best;
  }

  function startTrackNav(latlng) {
    if (!latlng) return;
    hideSheet();
    if (hooks.ensureGps) hooks.ensureGps();
    const path = pickBestTrackPath(latlng);
    if (!path || path.length < 2) {
      alert('No trail near that point. Try Navigate here (direct), or Open in Google Maps.');
      return;
    }
    setWaypoint(latlng);
    const user = (hooks.getUserLatLng && hooks.getUserLatLng()) || path[0];
    const nearUser = nearestIndex(path, user);
    navPath = path.slice(nearUser.index);
    if (navPath.length < 2) navPath = path;
    navIndex = 0;
    navMode = 'track';
    navActive = true;
    clearRouteGraphics();
    routeLine = L.polyline(navPath, {
      color: '#16a34a',
      weight: 5,
      opacity: 0.9,
    }).addTo(map);
    document.getElementById('mtbNavHud').hidden = false;
    document.getElementById('mtbNavTurn').textContent = 'Follow trail';
    updateNavFromUser(user);
  }

  function stopNav() {
    navActive = false;
    navMode = null;
    navPath = [];
    navIndex = 0;
    clearRouteGraphics();
    if (waypointMarker && map) {
      map.removeLayer(waypointMarker);
      waypointMarker = null;
    }
    const hud = document.getElementById('mtbNavHud');
    if (hud) hud.hidden = true;
  }

  function updateNavFromUser(user) {
    if (!navActive || !user || !navPath.length) return;
    const dest = navPath[navPath.length - 1];
    const near = nearestIndex(navPath, user);
    navIndex = near.index;

    const rem =
      navMode === 'point'
        ? haversineM(user, dest)
        : remainingAlong(navPath, navIndex, user);

    let speedKmh = DEFAULT_SPEED_KMH;
    if (hooks.getUserSpeedKmh) {
      const s = hooks.getUserSpeedKmh();
      if (s != null && s > 1) speedKmh = s;
    }
    const etaSec = (rem / 1000 / speedKmh) * 3600;

    const remainEl = document.getElementById('mtbNavRemain');
    const etaEl = document.getElementById('mtbNavEta');
    const turnEl = document.getElementById('mtbNavTurn');
    if (remainEl) remainEl.textContent = fmtDist(rem);
    if (etaEl) etaEl.textContent = 'ETA ' + fmtEta(etaSec);

    if (rem <= ARRIVE_M) {
      if (turnEl) turnEl.textContent = 'Arrived';
      return;
    }

    if (navMode === 'point') {
      const brg = bearingDeg(user, dest);
      if (turnEl) turnEl.textContent = 'Bearing ' + Math.round(brg) + '° · ' + fmtDist(rem);
      if (routeLine) routeLine.setLatLngs([user, dest]);
      return;
    }

    // Look ahead for a turn
    let ahead = navIndex;
    let travelled = 0;
    while (ahead + 1 < navPath.length && travelled < TURN_LOOKAHEAD_M) {
      travelled += haversineM(navPath[ahead], navPath[ahead + 1]);
      ahead++;
    }
    if (navIndex + 1 < navPath.length && ahead + 1 < navPath.length) {
      const b1 = bearingDeg(navPath[navIndex], navPath[Math.min(navIndex + 1, navPath.length - 1)]);
      const b2 = bearingDeg(navPath[ahead], navPath[Math.min(ahead + 1, navPath.length - 1)]);
      if (turnEl) turnEl.textContent = turnLabel(b1, b2) + ' · ' + fmtDist(Math.max(0, travelled));
    } else if (turnEl) {
      turnEl.textContent = 'Continue on trail · ' + fmtDist(rem);
    }
  }

  function windyEmbedUrl() {
    const c = map.getCenter();
    const z = Math.max(5, Math.min(11, map.getZoom()));
    return (
      'https://embed.windy.com/embed2.html?' +
      'lat=' + c.lat.toFixed(4) +
      '&lon=' + c.lng.toFixed(4) +
      '&detailLat=' + c.lat.toFixed(4) +
      '&detailLon=' + c.lng.toFixed(4) +
      '&zoom=' + z +
      '&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=&calendar=now' +
      '&pressure=&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1'
    );
  }

  function syncWindy() {
    const frame = document.getElementById('mtbWindyFrame');
    if (frame) frame.src = windyEmbedUrl();
  }

  function setWindy(on) {
    ensureUi();
    windyOn = !!on;
    const panel = document.getElementById('mtbWindyPanel');
    if (!panel) return;
    panel.hidden = !windyOn;
    if (windyOn) syncWindy();
    const btn = document.getElementById('btnToggleWindy');
    if (btn) btn.classList.toggle('active', windyOn);
  }

  function rebuildHeat() {
    if (!map || typeof L === 'undefined' || typeof L.heatLayer !== 'function') return;
    const pts = (hooks.collectTrackLatLngs && hooks.collectTrackLatLngs()) || [];
    if (heatLayer) {
      map.removeLayer(heatLayer);
      heatLayer = null;
    }
    if (!heatOn || !pts.length) return;
    // leaflet.heat wants [lat, lng, intensity]
    const heatPts = pts.map((p) => [p[0], p[1], 0.35]);
    heatLayer = L.heatLayer(heatPts, {
      radius: 18,
      blur: 22,
      maxZoom: 14,
      minOpacity: 0.25,
      gradient: { 0.2: '#22d3ee', 0.45: '#22c55e', 0.7: '#eab308', 1.0: '#ef4444' },
    }).addTo(map);
  }

  function setHeat(on) {
    heatOn = !!on;
    const btn = document.getElementById('btnToggleRideHeat');
    if (btn) btn.classList.toggle('active', heatOn);
    rebuildHeat();
  }

  function bindLongPress() {
    if (!map) return;

    map.on('contextmenu', (e) => {
      L.DomEvent.preventDefault(e);
      showSheet(e.latlng);
    });

    map.getContainer().addEventListener(
      'touchstart',
      (ev) => {
        if (!ev.touches || ev.touches.length !== 1) return;
        const t = ev.touches[0];
        const rect = map.getContainer().getBoundingClientRect();
        const pt = L.point(t.clientX - rect.left, t.clientY - rect.top);
        const ll = map.containerPointToLatLng(pt);
        clearTimeout(longPressTimer);
        longPressTimer = setTimeout(() => {
          showSheet(ll);
        }, LONG_PRESS_MS);
      },
      { passive: true },
    );
    const cancel = () => {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    };
    map.getContainer().addEventListener('touchend', cancel, { passive: true });
    map.getContainer().addEventListener('touchmove', cancel, { passive: true });
    map.getContainer().addEventListener('touchcancel', cancel, { passive: true });
  }

  function onGps(userLatLng, speedKmh) {
    if (navActive) updateNavFromUser(userLatLng);
  }

  function init(options) {
    map = options.map;
    hooks = options || {};
    ensureUi();
    bindLongPress();
  }

  global.BMMCMtbNav = {
    init: init,
    onGps: onGps,
    setWindy: setWindy,
    toggleWindy: function () {
      setWindy(!windyOn);
    },
    setHeat: setHeat,
    toggleHeat: function () {
      setHeat(!heatOn);
    },
    rebuildHeat: rebuildHeat,
    stopNav: stopNav,
    isNavActive: function () {
      return navActive;
    },
  };
})(window);
