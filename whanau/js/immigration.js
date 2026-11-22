(function () {
  "use strict";

  const DATA = window.GEN_DATA;
  if (!DATA) {
    document.body.innerHTML =
      "<p style='padding:2rem'>Missing js/data.js. Run <code>python build/build_site.py</code>.</p>";
    return;
  }

  const peopleById = Object.fromEntries((DATA.people || []).map((p) => [p.id, p]));
  const voyages = (DATA.immigration || []).slice();

  const SIDE_COLOR = {
    B: "#6b3f24",
    S: "#3f4f6b",
  };

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function displayName(p) {
    if (!p) return "(unknown)";
    return [p.given, p.surname].filter(Boolean).join(" ").trim() || "(unnamed)";
  }

  function personLink(pid) {
    const p = peopleById[pid];
    if (!p) return `<span class="muted">${esc(pid)}</span>`;
    const livingCls = p.living === "1" ? " living-name" : "";
    const title = p.living === "1" ? ` title="Living — name only"` : "";
    return `<a class="person-link${livingCls}" href="person.html?id=${encodeURIComponent(p.id)}"${title}>${esc(displayName(p))}</a>`;
  }

  function sideLabel(side) {
    return side === "S" ? "Spicer side" : "Baird side";
  }

  function header() {
    const nav = (DATA.meta.lines || [])
      .map(
        (line) =>
          `<a data-line="${esc(line.code)}" href="line.html?line=${encodeURIComponent(line.code)}">${esc(line.name)}</a>`
      )
      .join("");
    return `
      <header class="site-header">
        <div class="site-header-inner">
          <a class="brand" href="index.html">Family Lines<span>${esc(DATA.meta.tagline || "")}</span></a>
          <nav class="line-nav">${nav}<a class="active" href="immigration.html">Immigration</a><a href="wars.html">Wars</a><a href="portraits.html">Portraits</a><a href="ancestry.html">Ethnic Makeup</a></nav>
          <div class="header-search search-wrap">
            <input id="global-search" type="search" placeholder="Search names…" autocomplete="off" />
            <div id="global-search-results" class="search-drop" hidden></div>
          </div>
        </div>
      </header>`;
  }

  function footer() {
    const vc = DATA.meta.virtualCemetery
      ? `<p><a href="${esc(DATA.meta.virtualCemetery)}" target="_blank" rel="noopener">Family virtual cemetery</a></p>`
      : "";
    return `
      <footer class="site-footer">
        <div class="wrap">
          <p>Living relatives appear as names only.</p>
          ${vc}
        </div>
      </footer>`;
  }

  function wireSearch() {
    const input = document.getElementById("global-search");
    const box = document.getElementById("global-search-results");
    if (!input || !box) return;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) {
        box.hidden = true;
        box.innerHTML = "";
        return;
      }
      const hits = (DATA.people || [])
        .filter((p) => displayName(p).toLowerCase().includes(q))
        .slice(0, 20);
      box.hidden = false;
      if (!hits.length) {
        box.innerHTML = `<div class="item muted">No matches</div>`;
        return;
      }
      box.innerHTML = hits
        .map((p) => {
          if (p.living === "1") {
            return `<div class="item">${esc(displayName(p))} <span class="muted small">living</span></div>`;
          }
          return `<a href="person.html?id=${encodeURIComponent(p.id)}">${esc(displayName(p))}</a>`;
        })
        .join("");
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrap")) box.hidden = true;
    });
  }

  /** Intermediate points for a gentle great-circle-ish arc on the map. */
  function arcLatLngs(aLat, aLon, bLat, bLon, steps = 32) {
    const toRad = Math.PI / 180;
    const toDeg = 180 / Math.PI;
    const φ1 = aLat * toRad;
    const λ1 = aLon * toRad;
    const φ2 = bLat * toRad;
    const λ2 = bLon * toRad;
    const Δ = 2 * Math.asin(
      Math.sqrt(
        Math.sin((φ2 - φ1) / 2) ** 2 +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
      )
    );
    if (!Δ || Number.isNaN(Δ)) return [[aLat, aLon], [bLat, bLon]];
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const A = Math.sin((1 - f) * Δ) / Math.sin(Δ);
      const B = Math.sin(f * Δ) / Math.sin(Δ);
      const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
      const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
      const z = A * Math.sin(φ1) + B * Math.sin(φ2);
      const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
      const λ = Math.atan2(y, x);
      pts.push([φ * toDeg, λ * toDeg]);
    }
    return pts;
  }

  function voyageIdFromHash() {
    const h = (location.hash || "").replace(/^#/, "").trim();
    if (h && voyages.some((v) => v.id === h)) return h;
    return null;
  }

  const state = {
    filter: "all",
    selectedId: voyageIdFromHash() || (voyages[0] ? voyages[0].id : null),
    zoomAll: false,
  };

  function filteredVoyages() {
    return voyages.filter((v) => {
      if (state.filter === "B") return v.side === "B";
      if (state.filter === "S") return v.side === "S";
      if (state.filter === "nz") return !v.via_australia;
      if (state.filter === "via") return v.via_australia;
      return true;
    });
  }

  function selectedVoyage() {
    return voyages.find((v) => v.id === state.selectedId) || filteredVoyages()[0] || null;
  }

  function voyageFacts(v) {
    const bits = [];
    if (v.ship_type) bits.push(["Ship", v.ship_type]);
    if (v.built) bits.push(["Built", v.built]);
    if (v.tonnage) bits.push(["Tonnage", String(v.tonnage)]);
    if (v.captain) bits.push(["Captain", v.captain]);
    if (v.passenger_count) bits.push(["Passengers", String(v.passenger_count)]);
    if (v.depart_date || v.depart_place) {
      bits.push([
        "Departed",
        [v.depart_date, v.depart_place].filter(Boolean).join(" · "),
      ]);
    }
    if (v.arrive_date || v.arrive_place) {
      bits.push([
        "Arrived",
        [v.arrive_date, v.arrive_place].filter(Boolean).join(" · "),
      ]);
    }
    if (v.route_note) bits.push(["Route", v.route_note]);
    if (!bits.length) return "";
    return `<dl class="imm-facts">${bits
      .map(([k, val]) => `<div class="fact"><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`)
      .join("")}</dl>`;
  }

  function voyageImageSrc(v) {
    return v.ship_thumb || v.image_url || "";
  }

  function voyageMedia(v) {
    const src = voyageImageSrc(v);
    if (!src) return "";
    const credit = v.image_credit
      ? `<figcaption class="small muted">${esc(v.image_credit)}</figcaption>`
      : "";
    return `<figure class="imm-ship-photo"><img src="${esc(src)}" alt="${esc(v.ship)}" loading="lazy" />${credit}</figure>`;
  }

  function linkButton(url, label, kicker) {
    if (!url) return "";
    return `
      <a class="imm-more-btn" href="${esc(url)}" target="_blank" rel="noopener">
        <span class="imm-more-kicker">${esc(kicker)}</span>
        <span class="imm-more-label">${esc(label)}</span>
      </a>`;
  }

  function voyageLinks(v) {
    const buttons = [];
    if (v.wiki_url) {
      buttons.push(linkButton(v.wiki_url, v.wiki_label || "Wikipedia", "Wikipedia"));
    }
    if (v.info_url && v.info_url !== v.wiki_url) {
      buttons.push(linkButton(v.info_url, v.info_label || "More about this voyage", "More info"));
    }
    if (!buttons.length) return "";
    return `<div class="imm-more">${buttons.join("")}</div>`;
  }

  function shipAboutHtml(v) {
    const note = (v.ship_note || "").trim();
    const bits = [];
    if (v.ship_type) bits.push(v.ship_type);
    if (v.tonnage) bits.push(`${v.tonnage} tons`);
    if (v.built) bits.push(`built ${v.built}`);
    if (v.captain) bits.push(`Capt. ${v.captain}`);
    if (v.passenger_count) bits.push(`${v.passenger_count} passengers recorded`);
    const facts = bits.join(" · ");
    if (!note && !facts) return "";
    const body = note || facts;
    return `
      <div class="imm-ship-about">
        <h4>About the ship</h4>
        <p>${esc(body)}</p>
      </div>`;
  }

  function normName(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function familyMatchesForVoyage(v) {
    const ids = v.passenger_ids || [];
    return ids
      .map((id) => {
        const p = peopleById[id];
        if (!p) return null;
        return {
          id,
          surname: normName(p.surname),
          given: normName(p.given),
          full: normName(displayName(p)),
        };
      })
      .filter(Boolean);
  }

  function matchFamilyPerson(entry, family) {
    const hay = normName(
      [entry.name, entry.surname, entry.given, entry.detail, (entry.members || []).join(" ")].join(" ")
    );
    if (!hay) return null;
    for (const f of family) {
      if (!f.surname) continue;
      if (!hay.includes(f.surname)) continue;
      if (f.given) {
        const first = f.given.split(/\s+/)[0];
        if (first && hay.includes(first)) return f.id;
      } else {
        return f.id;
      }
    }
    return null;
  }

  function passengerEntryHtml(entry, family) {
    const pid = matchFamilyPerson(entry, family);
    const nameHtml = pid
      ? `<a class="person-link" href="person.html?id=${encodeURIComponent(pid)}">${esc(entry.name || "")}</a>`
      : esc(entry.name || "");
    const age = entry.age ? `<span class="imm-plist-age">${esc(String(entry.age))}</span>` : "";
    const detail = entry.detail ? `<span class="imm-plist-detail">${esc(entry.detail)}</span>` : "";
    const members = (entry.members || []).length
      ? `<div class="imm-plist-members">${(entry.members || []).map((m) => esc(m)).join(" · ")}</div>`
      : "";
    const familyCls = pid ? " family-match" : "";
    return `<li class="imm-plist-entry${familyCls}"><div class="imm-plist-name">${nameHtml}${age}</div>${detail}${members}</li>`;
  }

  function familyPassengerDetailHtml(v) {
    const ids = v.passenger_ids || [];
    if (!ids.length) {
      return `<p class="muted small">No full passenger list transcribed for this voyage yet.</p>`;
    }
    const items = ids
      .map((id) => {
        const p = peopleById[id];
        if (!p) return "";
        const life = [p.birth_date, p.death_date].filter(Boolean).join(" – ");
        const note = String(p.research_notes || p.notes || "")
          .replace(/«\/?[a-z]+»/gi, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 280);
        return `<li class="imm-plist-entry family-match">
          <div class="imm-plist-name">${personLink(id)}</div>
          ${life ? `<span class="imm-plist-detail">${esc(life)}</span>` : ""}
          ${note ? `<div class="imm-plist-members">${esc(note)}${note.length >= 280 ? "…" : ""}</div>` : ""}
        </li>`;
      })
      .join("");
    return `
      <p class="muted small">Full sailing list not transcribed here yet. Details for passengers in these family lines:</p>
      <section class="imm-plist-group"><ul>${items}</ul></section>`;
  }

  function passengerDocsHtml(pl) {
    const docs = pl.documents || [];
    if (!docs.length) return "";
    const figs = docs
      .map((d) => {
        const cap = d.label
          ? `<figcaption class="small muted">${esc(d.label)}</figcaption>`
          : "";
        return `<figure class="imm-plist-doc"><a href="${esc(d.src)}" target="_blank" rel="noopener"><img src="${esc(d.src)}" alt="${esc(d.label || "Passenger manifest")}" loading="lazy" /></a>${cap}</figure>`;
      })
      .join("");
    return `<div class="imm-plist-docs">${figs}</div>`;
  }

  function passengerListHtml(v) {
    const pl = v.passenger_list;
    if (!pl || !(pl.groups || []).length) {
      return `
        <details class="imm-plist">
          <summary>Passenger list &amp; details</summary>
          <div class="imm-plist-body">${familyPassengerDetailHtml(v)}</div>
        </details>`;
    }
    const family = familyMatchesForVoyage(v);
    const count = pl.entry_count || pl.groups.reduce((n, g) => n + (g.entries || []).length, 0);
    const source = pl.source_url
      ? `<p class="imm-plist-source small muted">Source: <a href="${esc(pl.source_url)}" target="_blank" rel="noopener">${esc(pl.source_label || "original list")}</a></p>`
      : pl.source_label
        ? `<p class="imm-plist-source small muted">Source: ${esc(pl.source_label)}</p>`
        : "";
    const groups = (pl.groups || [])
      .map((g) => {
        const items = (g.entries || [])
          .map((e) => passengerEntryHtml(e, family))
          .join("");
        if (!items) return "";
        return `<section class="imm-plist-group"><h5>${esc(g.title || "Passengers")}</h5><ul>${items}</ul></section>`;
      })
      .join("");
    return `
      <details class="imm-plist">
        <summary>Full passenger list <span class="imm-plist-count">${esc(String(count))}</span></summary>
        ${source}
        ${passengerDocsHtml(pl)}
        <div class="imm-plist-body">${groups}</div>
      </details>`;
  }

  function detailHtml(v) {
    if (!v) {
      return `<div class="imm-detail panel"><p class="muted">Select a voyage on the map or timeline.</p></div>`;
    }
    const passengers = (v.passenger_ids || [])
      .map((id) => `<li>${personLink(id)}</li>`)
      .join("");
    const days = v.days ? `${v.days} days at sea` : "Days at sea unknown";
    return `
      <div class="imm-detail panel">
        <div class="badge-row" style="justify-content:flex-start;margin-bottom:0.5rem">
          <span class="badge" style="border-color:${SIDE_COLOR[v.side]};color:${SIDE_COLOR[v.side]}">${esc(sideLabel(v.side))}</span>
          ${v.via_australia ? `<span class="badge">Via Australia</span>` : `<span class="badge">Direct to NZ</span>`}
        </div>
        <h2>${esc(v.ship)}</h2>
        <p class="meta-line">${esc(String(v.year))} · ${esc(days)}</p>
        ${voyageMedia(v)}
        ${voyageFacts(v)}
        ${voyageLinks(v)}
        <p class="imm-summary">${esc(v.summary)}</p>
        <div class="prose">${esc(v.story)}</div>
        ${passengers ? `<h3>Passengers in these lines</h3><ul class="related-list">${passengers}</ul>` : ""}
        ${shipAboutHtml(v)}
        ${passengerListHtml(v)}
      </div>`;
  }

  function routeLatLngs(v) {
    const nodes = [];
    if (v.depart_lat != null && v.depart_lon != null) {
      nodes.push([v.depart_lat, v.depart_lon]);
    }
    for (const wp of v.waypoints || []) {
      if (Array.isArray(wp) && wp.length >= 2) nodes.push([wp[0], wp[1]]);
    }
    if (v.arrive_lat != null && v.arrive_lon != null) {
      nodes.push([v.arrive_lat, v.arrive_lon]);
    }
    if (nodes.length < 2) return [];
    const pts = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const seg = arcLatLngs(nodes[i][0], nodes[i][1], nodes[i + 1][0], nodes[i + 1][1], 18);
      if (i > 0) seg.shift();
      pts.push(...seg);
    }
    return pts;
  }

  function timelineHtml() {
    const list = filteredVoyages();
    if (!list.length) {
      return `<p class="muted">No voyages match this filter.</p>`;
    }
    return list
      .map((v) => {
        const active = v.id === state.selectedId ? "active" : "";
        const src = voyageImageSrc(v);
        const thumb = src
          ? `<img class="voyage-thumb" src="${esc(src)}" alt="" loading="lazy" />`
          : `<span class="voyage-thumb voyage-thumb-empty" aria-hidden="true"></span>`;
        return `
          <button type="button" class="voyage-card ${active}" data-id="${esc(v.id)}" style="border-left-color:${SIDE_COLOR[v.side]}">
            ${thumb}
            <div class="voyage-card-body">
              <div class="voyage-year">${esc(String(v.year))}</div>
              <div class="voyage-ship">${esc(v.ship)}</div>
              <div class="voyage-meta muted small">${esc(v.depart_place.split(",")[0])} → ${esc(v.arrive_place.split(",")[0])}${v.days ? ` · ${v.days}d` : ""}</div>
            </div>
          </button>`;
      })
      .join("");
  }

  let map;
  let arcLayer;
  let markerLayer;

  function ensureMap() {
    if (map || typeof L === "undefined") return;
    map = L.map("imm-map", {
      scrollWheelZoom: true,
      worldCopyJump: true,
    }).setView([-20, 60], 2);
    // German OSM tile mirror — open tiles, no API key (osm.org/Carto often 403 / keywalled).
    L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
      maxZoom: 8,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    arcLayer = L.layerGroup().addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 50);
  }

  function drawVoyage(v, { selected = false } = {}) {
    const pts = routeLatLngs(v);
    if (pts.length < 2) return [];
    const line = L.polyline(pts, {
      color: SIDE_COLOR[v.side] || "#6b3f24",
      weight: selected ? 4 : 2.5,
      opacity: selected ? 0.95 : 0.45,
      className: "voyage-arc",
    });
    line.bindTooltip(`${v.year} · ${v.ship}`, { sticky: true });
    line.on("click", () => {
      selectVoyage(v.id);
      history.replaceState(null, "", `#${v.id}`);
    });
    arcLayer.addLayer(line);

    const start = L.circleMarker([v.depart_lat, v.depart_lon], {
      radius: selected ? 7 : 5,
      color: SIDE_COLOR[v.side],
      fillColor: SIDE_COLOR[v.side],
      fillOpacity: selected ? 0.9 : 0.55,
      weight: 2,
    });
    start.bindTooltip(`Depart: ${v.depart_place}`, { direction: "top" });
    start.on("click", () => {
      selectVoyage(v.id);
      history.replaceState(null, "", `#${v.id}`);
    });
    markerLayer.addLayer(start);

    const end = L.circleMarker([v.arrive_lat, v.arrive_lon], {
      radius: selected ? 8 : 5,
      color: SIDE_COLOR[v.side],
      fillColor: "#fffaf3",
      fillOpacity: 1,
      weight: 2,
    });
    end.bindTooltip(`Arrive: ${v.arrive_place}`, { direction: "top" });
    end.on("click", () => {
      selectVoyage(v.id);
      history.replaceState(null, "", `#${v.id}`);
    });
    markerLayer.addLayer(end);

    if (selected) {
      for (const wp of v.waypoints || []) {
        const mid = L.circleMarker([wp[0], wp[1]], {
          radius: 3,
          color: SIDE_COLOR[v.side],
          fillColor: SIDE_COLOR[v.side],
          fillOpacity: 0.7,
          weight: 1,
        });
        markerLayer.addLayer(mid);
      }
    }
    return pts;
  }

  function paintMap() {
    if (!map) return;
    arcLayer.clearLayers();
    markerLayer.clearLayers();
    const list = filteredVoyages();
    const selected = selectedVoyage();
    const bounds = [];

    if (state.zoomAll) {
      for (const v of list) {
        const pts = drawVoyage(v, { selected: selected && v.id === selected.id });
        pts.forEach((p) => bounds.push(p));
      }
    } else if (selected) {
      const pts = drawVoyage(selected, { selected: true });
      pts.forEach((p) => bounds.push(p));
    }

    const note = document.querySelector(".imm-map-note");
    if (note) {
      note.textContent = state.zoomAll
        ? "Showing all filtered voyages (approximate Cape / Tasman paths). Scroll to zoom. Click a route to select it."
        : "Showing the selected voyage only (approximate Cape / Tasman path). Tick Zoom all to see every filtered route. Scroll to zoom.";
    }

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: state.zoomAll ? 4 : 5 });
    }
  }

  function selectVoyage(id) {
    state.selectedId = id;
    paint();
  }

  function paint() {
    const detail = document.getElementById("imm-detail");
    const timeline = document.getElementById("imm-timeline");
    if (detail) detail.innerHTML = detailHtml(selectedVoyage());
    if (timeline) timeline.innerHTML = timelineHtml();
    document.querySelectorAll(".imm-filters .chip").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === state.filter);
    });
    paintMap();
  }

  function render() {
    document.getElementById("app").innerHTML = `
      ${header()}
      <main class="wrap imm-page">
        <section class="imm-hero">
          <h1>Coming to New Zealand</h1>
          <p>
            Voyages that brought Baird-side and Spicer-side ancestors across the world —
            from Free Church settlers on the <em>John Wickliffe</em> to twentieth-century steamships.
          </p>
        </section>

        <div class="imm-filters chip-row">
          <button type="button" class="chip active" data-filter="all">All voyages</button>
          <button type="button" class="chip" data-filter="B">Baird side</button>
          <button type="button" class="chip" data-filter="S">Spicer side</button>
          <button type="button" class="chip" data-filter="nz">Direct to NZ</button>
          <button type="button" class="chip" data-filter="via">Via Australia</button>
        </div>

        <section class="imm-stage">
          <div class="imm-map-col">
            <div class="imm-map-wrap panel">
              <div class="map-toolbar">
                <label class="map-zoom-all"><input type="checkbox" id="imm-zoom-all" /> Zoom all</label>
              </div>
              <div id="imm-map" class="imm-map" role="img" aria-label="Map of immigration voyages"></div>
              <p class="small muted imm-map-note">Showing the selected voyage only (approximate Cape / Tasman path). Tick Zoom all to see every filtered route. Scroll to zoom.</p>
            </div>
            <section class="imm-timeline-section">
              <h2>Voyage timeline</h2>
              <div id="imm-timeline" class="imm-timeline"></div>
            </section>
          </div>
          <div id="imm-detail"></div>
        </section>
      </main>
      ${footer()}`;

    wireSearch();
    ensureMap();
    paint();

    document.querySelector(".imm-filters").addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      state.filter = btn.dataset.filter;
      const stillVisible = filteredVoyages().some((v) => v.id === state.selectedId);
      if (!stillVisible) {
        state.selectedId = filteredVoyages()[0] ? filteredVoyages()[0].id : null;
      }
      paint();
    });
    const zoomAll = document.getElementById("imm-zoom-all");
    if (zoomAll) {
      zoomAll.addEventListener("change", () => {
        state.zoomAll = zoomAll.checked;
        paintMap();
      });
    }
    document.getElementById("imm-timeline").addEventListener("click", (e) => {
      const card = e.target.closest(".voyage-card");
      if (!card) return;
      selectVoyage(card.dataset.id);
      history.replaceState(null, "", `#${card.dataset.id}`);
    });
    window.addEventListener("hashchange", () => {
      const id = voyageIdFromHash();
      if (id) selectVoyage(id);
    });
  }

  render();
})();
