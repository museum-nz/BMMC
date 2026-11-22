(function () {
  "use strict";

  const DATA = window.GEN_DATA;
  if (!DATA) {
    document.body.innerHTML =
      "<p style='padding:2rem'>Missing js/data.js. Run <code>python build/build_site.py</code>.</p>";
    return;
  }

  const peopleById = Object.fromEntries(DATA.people.map((p) => [p.id, p]));
  const marriagesById = Object.fromEntries(DATA.marriages.map((m) => [m.id, m]));
  const eventsByPerson = groupBy(DATA.events, "person_id");
  const mediaByPerson = groupBy(DATA.media, "person_id");
  const eventMediaByPerson = groupBy(DATA.eventMedia || [], "person_id");
  const voyagesByPerson = (() => {
    const out = {};
    for (const v of DATA.immigration || []) {
      for (const pid of v.passenger_ids || []) {
        (out[pid] || (out[pid] = [])).push(v);
      }
    }
    for (const pid of Object.keys(out)) {
      out[pid].sort((a, b) => Number(a.year || 0) - Number(b.year || 0));
    }
    return out;
  })();

  const GEN_LABELS = [
    "Line head",
    "Parents",
    "Grandparents",
    "Great-grandparents",
    "2nd great-grandparents",
    "3rd great-grandparents",
    "4th great-grandparents",
    "5th great-grandparents",
    "6th great-grandparents",
    "7th great-grandparents",
    "8th great-grandparents",
    "9th great-grandparents",
    "10th great-grandparents",
  ];

  const GENEOLOGY_WEB_MUGS = {
    13: "../Genelogy Web/Baird_Ian.jpg",
    14: "../Genelogy Web/Dun_Kathi-11.jpg",
    249: "../Genelogy Web/Spicer_John.jpg",
    268: "../Genelogy Web/Starling_Moira.jpg",
  };

  function groupBy(rows, key) {
    const out = {};
    for (const row of rows) {
      const k = row[key];
      if (!k) continue;
      (out[k] || (out[k] = [])).push(row);
    }
    return out;
  }

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

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

  function shortDate(text) {
    if (!text) return "";
    // Drop parenthetical cause-of-death / notes for compact lifespan lines
    return String(text).split(" (")[0].trim();
  }

  function lifeSpan(p) {
    if (!p) return "";
    if (p.living === "1") return "living";
    const b = shortDate(p.birth);
    const d = shortDate(p.death);
    if (b && d) return `${b} – ${d}`;
    if (b) return `b. ${b}`;
    if (d) return `d. ${d}`;
    return "";
  }

  function lineCodes(p) {
    return (p.line || "").split("/").filter(Boolean);
  }

  function lineMeta(code) {
    return DATA.meta.lines.find((l) => l.code === code);
  }

  function personHref(p) {
    if (!p || !p.id) return null;
    return `person.html?id=${encodeURIComponent(p.id)}`;
  }

  function personLink(p) {
    if (!p) return esc("(unknown)");
    const name = displayName(p);
    const href = personHref(p);
    if (!href) return esc(name);
    const livingCls = p.living === "1" ? " living-name" : "";
    const title = p.living === "1" ? ` title="Living — name only"` : "";
    return `<a class="person-link${livingCls}" href="${href}"${title}>${esc(name)}</a>`;
  }

  function isDirectLine(p) {
    return !!(p && p.is_ancestor === "1");
  }

  function directLineMark(p) {
    if (!isDirectLine(p)) return "";
    return `<span class="badge direct-line" title="On the direct ancestral line">Direct line</span>`;
  }

  function nameVariants(p) {
    if (!p) return [];
    const given = (p.given || "").trim();
    const surname = (p.surname || "").trim();
    const full = displayName(p);
    const out = new Set();
    if (full) out.add(full);
    if (given && surname) {
      out.add(`${given} ${surname}`);
      out.add(`${surname}, ${given}`);
    }
    const bareGiven = given.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    if (bareGiven && surname) out.add(`${bareGiven} ${surname}`);
    const nick = given.match(/\(([^)]+)\)/);
    if (nick && surname) {
      const n = nick[1].replace(/^née\s+/i, "").trim();
      if (n) out.add(`${n} ${surname}`);
    }
    return [...out].filter((v) => v.length >= 5);
  }

  function relatedPeople(p) {
    const map = new Map();
    const add = (x) => {
      if (x && x.id) map.set(x.id, x);
    };
    add(p);
    parentsOf(p).forEach(add);
    siblingsOf(p).forEach(add);
    for (const m of marriagesForPerson(p.id)) {
      add(spouseOfMarriage(m, p.id));
      childrenOfMarriage(m.id).forEach(add);
    }
    return [...map.values()];
  }

  /** Strip Legacy Family Tree markers («b», «tab», «sup», …). */
  function scrubLegacyMarkup(text) {
    if (!text) return "";
    return String(text)
      .replace(/«tab»/gi, " ")
      .replace(/«\/?[A-Za-z][A-Za-z0-9]*»/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  function extractBurialPlot(rest) {
    const text = scrubLegacyMarkup(rest || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    const bits = [];
    const ok = (v) => {
      const s = String(v || "").trim();
      return s && !/^(n\/?a|none|unknown|-+)$/i.test(s);
    };
    const add = (label, val) => {
      let v = String(val || "").replace(/\s+/g, " ").trim().replace(/[.,;]+$/, "");
      if (!ok(v)) return;
      const low = v.toLowerCase();
      if (bits.some((b) => b.toLowerCase().includes(low) || low.includes(b.toLowerCase()))) return;
      bits.push(label ? `${label} ${v}` : v);
    };
    const labeled = [
      [/(?:burial\s+)?plot\s*[:=#]?\s*([A-Za-z0-9][\w./-]{0,20})/i, "Plot"],
      [/(?:cemetery\s+)?section(?:\s+and\s+lot)?\s*[:=]?\s*([A-Za-z0-9][\w ./&-]{0,30})/i, "Sec"],
      [/(?:burial\s+)?area\s*[:=]?\s*([A-Za-z0-9][\w ./&-]{0,30})/i, "Area"],
      [/\bblock\s*[:=#-]?\s*([A-Za-z0-9][\w ./&-]{0,30})/i, "Block"],
      [/\brow\s*[:=#-]?\s*([A-Za-z0-9][\w./-]{0,12})/i, "Row"],
      [/\blair\s*(?:number)?\s*[:=#-]?\s*([A-Za-z0-9][\w./-]{0,12})/i, "Lair"],
      [/location\s*[:=-]?\s*((?:block\s*)?[A-Za-z0-9][\w ./&-]{0,40}?plot\s*[A-Za-z0-9][\w./-]{0,12})/i, ""],
      [/interment\s*type\s*[:=]?\s*([A-Za-z][\w-]{2,20})/i, ""],
    ];
    for (const [re, label] of labeled) {
      const m = text.match(re);
      if (m) {
        const val = String(m[1]).split(
          /\s+(?:age|gender|occupation|date|funeral|cemetery|plot|block|section|area|warrant|denomination)\b/i
        )[0];
        add(label, val);
      }
    }
    if (!bits.length) {
      const free = [
        [/\bsection\s+([A-Za-z0-9][\w.-]*)[,.]?\s*plot\s*(?:no\.?\s*)?(\d+[\w.-]*)/i, (a, b) => `Section ${a}, plot ${b}`],
        [/\bblock\s+([A-Za-z0-9][\w.-]*)\s+plot\s+(\d+[\w.-]*)/i, (a, b) => `Block ${a}, plot ${b}`],
        [/\brow\s+(\d+)\s+plot\s+(\d+[\w.-]*)/i, (a, b) => `Row ${a}, plot ${b}`],
        [/\blocated in plot\s+(\d+[\w.-]*)(?:\s+of\s+block\s+(\d+[\w.-]*))?/i, (a, b) => (b ? `Plot ${a}, block ${b}` : `Plot ${a}`)],
        [/\bplot\s+(\d+[\w.-]*)\s*,\s*block\s*[-–]?\s*([^.,;]+)/i, (a, b) => `Plot ${a}, ${String(b).trim()}`],
        [/\bplot\s+(\d+[\w.-]*)/i, (a) => `Plot ${a}`],
      ];
      for (const [re, fmt] of free) {
        const m = text.match(re);
        if (!m) continue;
        add("", fmt(m[1], m[2]));
        break;
      }
    }
    if (!bits.length && text.length <= 80 && /\b(plot|section|block|row|lair)\b/i.test(text)) {
      return text.replace(/\.+$/, "");
    }
    if (!bits.length) {
      const ash = text.match(/\b(ashes\s+placed[^.]*|ashes\s+scattered|cremation)\b/i);
      if (ash) return ash[1].replace(/\.+$/, "");
    }
    return bits.join(", ");
  }

  /** Burial for display: date / place / short plot line. */
  function formatBurial(burial) {
    const cleaned = scrubLegacyMarkup(burial);
    if (!cleaned) return "";
    // Split on " / " only — plot values may contain slashes (N/A, Block 5B / Plot 0044)
    const parts = cleaned
      .split(/\s+\/+\s+/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (parts.length < 3) return cleaned;
    // Already condensed by build_site (third part is short plot line)
    if (parts[2].length <= 80 && !/\b(funeral director|gender\s*:|occupation\s*:|record number)\b/i.test(parts[2])) {
      return `${parts[0]} / ${parts[1]} / ${parts[2]}`;
    }
    const plot = extractBurialPlot(parts.slice(2).join(" / "));
    return plot ? `${parts[0]} / ${parts[1]} / ${plot}` : `${parts[0]} / ${parts[1]}`;
  }

  function linkifyFindagrave(text) {
    return esc(scrubLegacyMarkup(text)).replace(
      /https?:\/\/(?:www\.)?findagrave\.com\/[^\s<]+/gi,
      (url) =>
        `<a class="findagrave-inline" href="${url}" target="_blank" rel="noopener">Find a Grave</a>`
    );
  }

  /** Escape text, link Find a Grave URLs, then link names of related people (spouses, etc.). */
  function linkifyProse(text, people) {
    if (!text) return "";
    let html = linkifyFindagrave(text);
    const pool = people || [];
    if (!pool.length) return html;

    const entries = [];
    for (const p of pool) {
      for (const variant of nameVariants(p)) {
        entries.push({ variant, p });
      }
    }
    entries.sort((a, b) => b.variant.length - a.variant.length);

    for (const { variant, p } of entries) {
      const needle = esc(variant);
      if (needle.length < 5) continue;
      const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      html = html.replace(re, (match, offset, full) => {
        const openLt = full.lastIndexOf("<", offset);
        const openGt = full.lastIndexOf(">", offset);
        if (openLt > openGt) return match;
        const livingCls = p.living === "1" ? " living-name" : "";
        const title = p.living === "1" ? ` title="Living — name only"` : "";
        return `<a class="person-link${livingCls}" href="person.html?id=${encodeURIComponent(p.id)}"${title}>${match}</a>`;
      });
    }
    return html;
  }

  function findagraveBadge(p) {
    if (!p || p.living === "1" || !p.fg_url) return "";
    const label = p.fg_id ? `Find a Grave #${esc(p.fg_id)}` : "Find a Grave";
    const title = p.burial ? `Burial: ${esc(formatBurial(p.burial))}` : "Open Find a Grave memorial";
    return `<a class="badge findagrave" href="${esc(p.fg_url)}" target="_blank" rel="noopener" title="${title}">${label}</a>`;
  }

  function dmsToDecimal(deg, minu, sec, hemi) {
    let val = Number(deg) + Number(minu || 0) / 60 + Number(sec || 0) / 3600;
    const h = String(hemi || "").toUpperCase();
    if (h === "S" || h === "W") val = -val;
    return val;
  }

  /** Parse legacy web_url values that are coordinates (decimal or DMS). */
  function parseLatLon(raw) {
    const s = String(raw || "").trim();
    if (!s) return null;
    const dec = s.match(
      /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/
    );
    if (dec) {
      const lat = Number(dec[1]);
      const lon = Number(dec[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon };
    }
    const dms = s.match(
      /(\d+)\s*°\s*(\d+)\s*['′]\s*(\d+(?:\.\d+)?)\s*["″]?\s*([NS])\s*,\s*(\d+)\s*°\s*(\d+)\s*['′]\s*(\d+(?:\.\d+)?)\s*["″]?\s*([EW])/i
    );
    if (dms) {
      return {
        lat: dmsToDecimal(dms[1], dms[2], dms[3], dms[4]),
        lon: dmsToDecimal(dms[5], dms[6], dms[7], dms[8]),
      };
    }
    return null;
  }

  function mapsUrlFromLatLon(lat, lon) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lon}`)}`;
  }

  /**
   * Clean Legacy/spreadsheet web_url into a usable external link, or null to hide.
   * Empty Google Maps stubs and junk text are dropped; bare coords become Maps links.
   */
  function externalLinkBadge(p) {
    const raw = (p.web_url || "").trim();
    if (!raw) return "";

    const junk = /^(extra data|n\/?a|none|null|undefined)$/i;
    if (junk.test(raw)) return "";

    const coords = parseLatLon(raw);
    if (coords) {
      const href = mapsUrlFromLatLon(coords.lat, coords.lon);
      return `<a class="badge map" href="${esc(href)}" target="_blank" rel="noopener" title="Open in Google Maps">Map</a>`;
    }

    let url = raw;
    if (!/^https?:\/\//i.test(url) && /^www\./i.test(url)) {
      url = `https://${url}`;
    }
    if (!/^https?:\/\//i.test(url)) return "";

    // Bare / incomplete Maps place URLs from the spreadsheet.
    if (/google\.[^/]+\/maps\/place\/?\s*$/i.test(url)) return "";
    if (/google\.[^/]+\/maps\/?\s*$/i.test(url)) return "";

    const isMaps = /google\.[^/]+\/maps/i.test(url);
    const label = isMaps ? "Map" : "Web";
    const cls = isMaps ? "badge map" : "badge";
    return `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`;
  }

  function burialPlaceOf(p) {
    const parts = String(p.burial || "")
      .split(/\s+\/+\s+/)
      .map((x) => x.trim())
      .filter(Boolean);
    return parts.length >= 2 ? parts[1] : "";
  }

  function lookupPlace(place) {
    if (!place) return null;
    const table = DATA.placeCoords || {};
    const cleaned = place
      .replace(/^(Cremated|Buried|Arrived In|On The)\s*,?\s*/i, "")
      .trim();
    if (table[place]) return table[place];
    if (cleaned !== place && table[cleaned]) return table[cleaned];
    // Soft fallback: try shorter trailing locality ("Town, Region, Country")
    const parts = cleaned.split(",").map((x) => x.trim()).filter(Boolean);
    for (let i = 1; i < parts.length; i++) {
      const key = parts.slice(i).join(", ");
      if (table[key]) return table[key];
    }
    // Any geocoded key that is a suffix of this place string
    const lower = cleaned.toLowerCase();
    let best = null;
    let bestLen = 0;
    for (const key of Object.keys(table)) {
      if (key.length > bestLen && lower.endsWith(key.toLowerCase())) {
        best = table[key];
        bestLen = key.length;
      }
    }
    return best;
  }

  function personPlacePoints(p) {
    const points = [];
    const seen = new Set();
    const add = (kind, label, place, lat, lon) => {
      if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) return;
      const key = `${lat.toFixed(4)},${lon.toFixed(4)},${kind}`;
      if (seen.has(key)) return;
      seen.add(key);
      points.push({ kind, label, place: place || "", lat, lon });
    };

    const burialPlace = burialPlaceOf(p);
    const burialHit = lookupPlace(burialPlace);
    if (burialHit) add("burial", "Burial", burialPlace, burialHit.lat, burialHit.lon);

    for (const m of marriagesForPerson(p.id)) {
      const place = (m.place || "").trim();
      const hit = lookupPlace(place);
      if (hit) {
        const when = [m.date, place].filter(Boolean).join(" · ");
        add("marriage", "Marriage", when || place, hit.lat, hit.lon);
      }
    }

    for (const e of eventsByPerson[p.id] || []) {
      const place = (e.place || "").trim();
      const hit = lookupPlace(place);
      if (hit) {
        const label = e.type || "Event";
        const detail = [e.date, place].filter(Boolean).join(" · ");
        add("event", label, detail || place, hit.lat, hit.lon);
      }
    }

    const coords = parseLatLon(p.web_url);
    if (coords) add("map", "Sheet map pin", "", coords.lat, coords.lon);

    return points;
  }

  function placeMapHtml(points) {
    if (!points.length) return "";
    const legend = points
      .map(
        (pt) =>
          `<li><span class="place-dot place-dot-${esc(pt.kind)}"></span><strong>${esc(pt.label)}</strong>${
            pt.place ? ` — ${esc(pt.place)}` : ""
          }</li>`
      )
      .join("");
    return `
      <div class="person-place-map-wrap">
        <div class="map-toolbar">
          <h3>Places</h3>
          <label class="map-zoom-all"><input type="checkbox" id="person-zoom-all" checked /> Zoom all</label>
        </div>
        <div id="person-place-map" class="person-place-map" role="img" aria-label="Map of places for this person"></div>
        <ul class="place-legend">${legend}</ul>
        <p class="small muted">Approximate locations from place names (OpenStreetMap / Nominatim). Scroll to zoom. Map tiles need an internet connection.</p>
      </div>`;
  }

  function paintPersonPlaceMap(points) {
    const el = document.getElementById("person-place-map");
    if (!el || typeof L === "undefined" || !points.length) return;
    if (el._leaflet_id) {
      el._leaflet_id = null;
      el.innerHTML = "";
    }
    const map = L.map(el, { scrollWheelZoom: true }).setView([points[0].lat, points[0].lon], 4);
    L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const colors = {
      burial: "#1f5c3f",
      marriage: "#6b3f24",
      event: "#3f4f6b",
      map: "#8a5a2b",
    };
    const bounds = [];
    for (const pt of points) {
      const marker = L.circleMarker([pt.lat, pt.lon], {
        radius: 7,
        color: colors[pt.kind] || "#6b3f24",
        fillColor: "#fffaf3",
        fillOpacity: 1,
        weight: 2,
      });
      marker.bindPopup(`<strong>${esc(pt.label)}</strong>${pt.place ? `<br/>${esc(pt.place)}` : ""}`);
      marker.addTo(map);
      bounds.push([pt.lat, pt.lon]);
    }

    function fitView(zoomAll) {
      if (!bounds.length) return;
      if (zoomAll || bounds.length === 1) {
        if (bounds.length === 1) map.setView(bounds[0], 6);
        else map.fitBounds(bounds, { padding: [28, 28], maxZoom: 8 });
      } else {
        map.setView(bounds[0], 6);
      }
    }

    const zoomAllBox = document.getElementById("person-zoom-all");
    fitView(zoomAllBox ? zoomAllBox.checked : true);
    if (zoomAllBox) {
      zoomAllBox.addEventListener("change", () => fitView(zoomAllBox.checked));
    }
    setTimeout(() => map.invalidateSize(), 50);
  }

  function isLocalPath(path) {
    if (!path) return false;
    return /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith("\\\\") || path.startsWith("/Users/") || path.startsWith("/home/");
  }

  function mediaDisplayName(m) {
    const label = (m.label || "").trim();
    if (label) return label;
    const path = (m.path_or_url || "").trim();
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    // Local paths: show filename only, never the drive path
    const parts = path.replace(/\\/g, "/").split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    if (last && /\.[a-z0-9]{2,5}$/i.test(last)) return last;
    return "Media item";
  }

  function mugSrc(p) {
    if (!p || p.living === "1") return "";
    if (p.fg_thumb) return p.fg_thumb;
    if (GENEOLOGY_WEB_MUGS[p.id]) return GENEOLOGY_WEB_MUGS[p.id];
    const media = (mediaByPerson[p.id] || []).find((m) => {
      const path = (m.path_or_url || "").toLowerCase();
      return path.includes("mugshot") || /\.(jpe?g|png|webp)$/i.test(m.label || "");
    });
    if (media && media.path_or_url && /^https?:\/\//i.test(media.path_or_url)) {
      return media.path_or_url;
    }
    return "";
  }

  function mugFor(p, { compact = false } = {}) {
    if (!p || p.living === "1") {
      if (!compact) return "";
      return `<div class="mug mug-sm placeholder living" aria-hidden="true"></div>`;
    }
    const cls = compact ? "mug mug-sm" : "mug";
    const src = mugSrc(p);
    if (src) {
      return `<img class="${cls}" src="${esc(src)}" alt="" loading="lazy" />`;
    }
    if (compact) {
      const initials = displayName(p)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
      return `<div class="${cls} placeholder" aria-hidden="true">${esc(initials || "?")}</div>`;
    }
    return `<div class="mug placeholder">No<br/>photo</div>`;
  }

  function parentsOf(p) {
    const mr = marriagesById[p.parents_marriage_id];
    if (!mr) return [];
    return [peopleById[mr.husband_id], peopleById[mr.wife_id]].filter(Boolean);
  }

  function siblingsOf(p) {
    if (!p.parents_marriage_id || p.parents_marriage_id === "0") return [];
    return DATA.people.filter(
      (x) => x.parents_marriage_id === p.parents_marriage_id && x.id !== p.id
    );
  }

  function childrenOfMarriage(mrId) {
    return DATA.people.filter((p) => p.parents_marriage_id === mrId);
  }

  function marriagesForPerson(pid) {
    return DATA.marriages.filter((m) => m.husband_id === pid || m.wife_id === pid);
  }

  function spouseOfMarriage(m, pid) {
    const spouseId = m.husband_id === pid ? m.wife_id : m.husband_id;
    return peopleById[spouseId] || null;
  }

  function marriageWhen(m) {
    return [m.date, m.place].filter(Boolean).join(", ");
  }

  /** Compact spouse links for hero / line-card summaries. */
  function marriageSummaryHtml(p, { withWhen = true } = {}) {
    const list = marriagesForPerson(p.id);
    if (!list.length) return "";
    const bits = list.map((m) => {
      const spouse = spouseOfMarriage(m, p.id);
      const when = withWhen ? marriageWhen(m) : "";
      return `${personLink(spouse)}${when ? ` <span class="muted small">(${esc(when)})</span>` : ""}`;
    });
    const label = list.length === 1 ? "Spouse" : "Spouses";
    return `<p class="marriage-summary"><span class="muted">${label}:</span> ${bits.join(" · ")}</p>`;
  }

  function peopleForLine(code) {
    return DATA.people.filter((p) => lineCodes(p).includes(code));
  }

  function computeGenerations(headId) {
    const map = {};
    const queue = [[String(headId), 0]];
    const seen = new Set([String(headId)]);
    map[String(headId)] = 0;
    while (queue.length) {
      const [pid, gen] = queue.shift();
      const person = peopleById[pid];
      if (!person) continue;
      const mrId = person.parents_marriage_id;
      if (!mrId || mrId === "0") continue;
      const mr = marriagesById[mrId];
      if (!mr) continue;
      for (const key of ["husband_id", "wife_id"]) {
        const parentId = mr[key];
        if (!parentId || parentId === "0" || seen.has(parentId)) continue;
        seen.add(parentId);
        map[parentId] = gen + 1;
        queue.push([parentId, gen + 1]);
      }
      for (const child of DATA.people) {
        if (child.parents_marriage_id === mrId && map[child.id] == null) {
          map[child.id] = gen;
        }
      }
    }
    return map;
  }

  function renderHeader(activeLine, opts = {}) {
    const nav = DATA.meta.lines
      .map((line) => {
        const cls = activeLine === line.code ? "active" : "";
        return `<a class="${cls}" data-line="${esc(line.code)}" href="line.html?line=${encodeURIComponent(line.code)}">${esc(line.name)}</a>`;
      })
      .join("");
    const immCls = opts.activeNav === "immigration" ? "active" : "";
    const warsCls = opts.activeNav === "wars" ? "active" : "";
    const portCls = opts.activeNav === "portraits" ? "active" : "";
    const ancCls = opts.activeNav === "ancestry" ? "active" : "";
    const search = opts.hideSearch
      ? ""
      : `<div class="header-search search-wrap">
           <input id="global-search" type="search" placeholder="Search names…" autocomplete="off" />
           <div id="global-search-results" class="search-drop" hidden></div>
         </div>`;
    return `
      <header class="site-header">
        <div class="site-header-inner">
          <a class="brand" href="index.html">Family Lines<span>${esc(DATA.meta.tagline || "")}</span></a>
          <nav class="line-nav">${nav}<a class="${immCls}" href="immigration.html">Immigration</a><a class="${warsCls}" href="wars.html">Wars</a><a class="${portCls}" href="portraits.html">Portraits</a><a class="${ancCls}" href="ancestry.html">Ethnic Makeup</a></nav>
          ${search}
        </div>
      </header>`;
  }

  function renderFooter() {
    const vc = DATA.meta.virtualCemetery
      ? `<p><a href="${esc(DATA.meta.virtualCemetery)}" target="_blank" rel="noopener">Family virtual cemetery</a></p>`
      : "";
    return `
      <footer class="site-footer">
        <div class="wrap">
          <p>Living relatives are shown as names only. Find-a-Grave links are highlighted in green with memorial numbers.</p>
          ${vc}
        </div>
      </footer>`;
  }

  function wireGlobalSearch() {
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
      const hits = DATA.people
        .filter((p) => displayName(p).toLowerCase().includes(q))
        .slice(0, 20);
      if (!hits.length) {
        box.hidden = false;
        box.innerHTML = `<div class="item muted">No matches</div>`;
        return;
      }
      box.hidden = false;
      box.innerHTML = hits
        .map((p) => {
          const living = p.living === "1" ? ` <span class="muted small">living</span>` : ` <span class="muted small">${esc(lifeSpan(p))}</span>`;
          return `<a class="person-link" href="person.html?id=${encodeURIComponent(p.id)}">${esc(displayName(p))}</a>${living}`;
        })
        .join("");
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrap")) box.hidden = true;
    });
  }

  function crumbs(items) {
    return `<nav class="crumbs wrap">${items
      .map((it, i) => {
        const bit = it.href
          ? `<a href="${esc(it.href)}">${esc(it.label)}</a>`
          : `<span>${esc(it.label)}</span>`;
        return i ? `<span class="sep">›</span>${bit}` : bit;
      })
      .join("")}</nav>`;
  }

  function renderIndex() {
    const root = document.getElementById("app");
    const voyageCount = (DATA.immigration || []).length;
    const warsCount = (DATA.wars || []).length;
    const portraitCount = ((DATA.portraits || {}).items || []).length;
    function givenTokensMatch(a, b) {
      if (!a || !b) return false;
      if (a === b || a.startsWith(b) || b.startsWith(a)) return true;
      const n = Math.min(a.length, b.length);
      return n >= 4 && a.slice(0, 4) === b.slice(0, 4);
    }
    const headAhn = new Set([4, 5, 6, 7]);
    const ancestryPeople = ((DATA.ancestry || {}).sets || []).reduce((n, s) => {
      const count = (s.people || []).filter((pe) => {
        const relation = (pe.relation || "").toLowerCase();
        if (relation === "person" || relation === "father" || relation === "mother") {
          return false;
        }
        if (headAhn.has(Number(pe.ahnentafel))) return true;
        const surname = (pe.surname || "").trim().toLowerCase();
        const given = (pe.given || "").trim().toLowerCase();
        if (!surname || !given) return true;
        const g0 = given.split(/\s+/)[0];
        for (const p of DATA.people || []) {
          if (p.living !== "1") continue;
          if ((p.surname || "").trim().toLowerCase() !== surname) continue;
          const lg = (p.given || "").trim().toLowerCase();
          if (!lg) continue;
          const lg0 = lg.split(/\s+/)[0];
          if (givenTokensMatch(g0, lg0) || givenTokensMatch(given, lg)) return false;
        }
        return true;
      }).length;
      // +2 theoretical children (Ian & Kathi, John & Moira)
      return Math.max(n, count + 2);
    }, 0);
    const ancestryThumb =
      ((DATA.ancestry || {}).refs || {}).dna_chart ||
      ((DATA.ancestry || {}).refs || {}).a3_chart ||
      "media/ancestry/ethnic-makeup-mib-ehb.png";

    const couplePhoto = {
      "baird-dun": "media/portraits/thumbs/baird-ian-and-kathi.jpg",
      "spicer-starling": "media/portraits/thumbs/spicer-j-m-wedding-enhanced.jpg",
    };

    const couples = (DATA.meta.gateways || [])
      .map((g) => {
        const lines = (g.lines || [])
          .map((code) => {
            const line = lineMeta(code);
            if (!line) return "";
            const people = peopleForLine(code);
            const detailed = people.filter((p) => p.living !== "1").length;
            const ancestors = people.filter((p) => p.is_ancestor === "1").length;
            const head = peopleById[line.head_id];
            const headLife = lifeSpan(head);
            return `
              <div class="home-line-card">
                <a class="home-line" data-line="${esc(code)}" href="line.html?line=${encodeURIComponent(code)}">
                  <span class="home-line-name">${esc(line.name)}</span>
                  <span class="home-line-head">${esc(displayName(head))}${headLife ? ` · ${esc(headLife)}` : ""}</span>
                  <span class="home-line-meta">${detailed} detailed · ${ancestors} ancestors · ${people.length} in line</span>
                </a>
                <span class="home-line-charts">
                  <a class="home-line-chart" href="line.html?line=${encodeURIComponent(code)}&view=chart">Ancestral chart</a>
                  <a class="home-line-chart" href="line.html?line=${encodeURIComponent(code)}&view=fan">Fan chart</a>
                </span>
              </div>`;
          })
          .join("");
        const photo = couplePhoto[g.id] || g.image;
        return `
          <section class="home-couple">
            <div class="home-couple-photo">
              <img src="${esc(photo)}" alt="${esc(g.title)}" loading="lazy" />
            </div>
            <div class="home-couple-body">
              <h2>${esc(g.title)}</h2>
              <p>${esc(g.blurb)}</p>
              <div class="home-lines">${lines}</div>
            </div>
          </section>`;
      })
      .join("");

    root.innerHTML = `
      ${renderHeader()}
      <main class="wrap home-page">
        <section class="home-intro">
          <div>
            <h1>${esc(DATA.meta.title)}</h1>
            <p class="home-tag">${esc(DATA.meta.tagline || "")}</p>
          </div>
          <p class="home-blurb">${esc(DATA.meta.intro || "")}</p>
        </section>
        <div class="home-couples">${couples}</div>
        <nav class="home-explore">
          <a class="home-explore-card" href="immigration.html">
            <img class="home-explore-nz" src="media/nz-map.jpg" alt="" loading="lazy" />
            <div>
              <strong>Immigration</strong>
              <span>${voyageCount} voyages · map &amp; timeline</span>
            </div>
          </a>
          <a class="home-explore-card" href="wars.html">
            <img src="media/wars/wars-card.jpg" alt="" loading="lazy" />
            <div>
              <strong>Family in Wars</strong>
              <span>${warsCount} stories · service &amp; remembrance</span>
            </div>
          </a>
          <a class="home-explore-card" href="portraits.html">
            <img src="media/portraits/baird-collage.jpg" alt="" loading="lazy" />
            <div>
              <strong>Portraits</strong>
              <span>${portraitCount} portraits · marriage charts</span>
            </div>
          </a>
          <a class="home-explore-card" href="ancestry.html">
            <img src="${esc(ancestryThumb)}" alt="" loading="lazy" />
            <div>
              <strong>Ethnic Makeup</strong>
              <span>${ancestryPeople || "—"} people · DNA &amp; genealogical pies</span>
            </div>
          </a>
        </nav>
      </main>`;
    wireGlobalSearch();
  }

  function parentPair(p) {
    if (!p) return [null, null];
    const mr = marriagesById[p.parents_marriage_id];
    if (!mr) return [null, null];
    return [peopleById[mr.husband_id] || null, peopleById[mr.wife_id] || null];
  }

  function buildPedigreeSlots(head, maxGen) {
    const depth = Math.min(Math.max(Number(maxGen) || 3, 1), 6);
    const slots = new Array(2 ** (depth + 1)).fill(null);
    slots[1] = head || null;
    for (let i = 1; i < 2 ** depth; i++) {
      const person = slots[i];
      if (!person) continue;
      const [father, mother] = parentPair(person);
      slots[i * 2] = father;
      slots[i * 2 + 1] = mother;
    }
    return { depth, slots };
  }

  function ancestralChartHtml(head, maxGen) {
    const { depth, slots } = buildPedigreeSlots(head, maxGen);

    function box(p, ahn) {
      if (!p) {
        return `<div class="anc-box empty" aria-hidden="true"><span class="anc-unknown">Unknown</span></div>`;
      }
      const livingCls = p.living === "1" ? " living" : "";
      const sex = String(p.sex || "").trim().toUpperCase();
      const sexCls = sex === "F" || sex === "FEMALE" ? " female" : sex === "M" || sex === "MALE" ? " male" : "";
      const life = p.living === "1" ? "Living" : lifeSpan(p);
      return `
        <a class="anc-box person-link${livingCls}${sexCls}" href="person.html?id=${encodeURIComponent(p.id)}" title="${esc(displayName(p))}">
          ${mugFor(p, { compact: true })}
          <span class="anc-meta">
            <span class="anc-ahn">${esc(String(ahn))}</span>
            <span class="anc-name">${esc(displayName(p))}</span>
            <span class="anc-life">${esc(life)}</span>
          </span>
        </a>`;
    }

    const cols = [];
    for (let g = 0; g <= depth; g++) {
      const start = 2 ** g;
      const count = 2 ** g;
      const cells = [];
      for (let i = 0; i < count; i++) {
        const ahn = start + i;
        cells.push(`<div class="anc-slot">${box(slots[ahn], ahn)}</div>`);
      }
      cols.push(`
        <div class="anc-col" data-gen="${g}">
          <div class="anc-col-label">${esc(GEN_LABELS[g] || `Generation ${g}`)}</div>
          <div class="anc-col-stack">${cells.join("")}</div>
        </div>`);
    }

    return `
      <section class="anc-chart-wrap panel">
        <div class="anc-chart-head">
          <h2>Ancestral chart</h2>
          <p class="muted small">Pedigree of ${esc(displayName(head))} — click a name for their page.</p>
        </div>
        <div class="anc-chart" style="--anc-depth:${depth}">${cols.join("")}</div>
      </section>`;
  }

  function fanFirstLast(p) {
    if (!p) return "Unknown";
    const first = String(p.given || "")
      .trim()
      .split(/\s+/)[0];
    const last = String(p.surname || "").trim();
    return [first, last].filter(Boolean).join(" ") || displayName(p);
  }

  function fanMarriageDate(p) {
    if (!p) return "";
    const list = marriagesForPerson(p.id);
    if (!list.length) return "";
    const preferred =
      (p.preferred_marriage_id && list.find((m) => m.id === p.preferred_marriage_id)) || list[0];
    return shortDate(preferred.date || "");
  }

  function fanSex(p) {
    const s = String((p && p.sex) || "").trim().toUpperCase();
    if (s === "M" || s === "MALE") return "M";
    if (s === "F" || s === "FEMALE") return "F";
    return "";
  }

  function fanDetailLines(p) {
    if (!p) return [];
    if (p.living === "1") return [];
    const lines = [];
    const birth = shortDate(p.birth);
    const death = shortDate(p.death);
    if (birth) lines.push(`b. ${birth}`);
    if (death) lines.push(`d. ${death}`);
    if (fanSex(p) === "M") {
      const married = fanMarriageDate(p);
      if (married) lines.push(`m. ${married}`);
    }
    return lines;
  }

  function fanFill(p, gen) {
    if (!p) return "#ebe4d8";
    const sex = fanSex(p);
    // Softer male/female fills
    const male = ["#d5e4f2", "#c9dced", "#bdd3e7", "#b1cbe2", "#a5c2dc", "#99bad6"];
    const female = ["#f2dce5", "#edd2dd", "#e7c8d5", "#e2becd", "#dcb4c5", "#d7aabd"];
    const unknown = ["#e8dfd2", "#e2d7c8", "#dccfbe", "#d6c7b4", "#d0bfaa", "#cab7a0"];
    const palette = sex === "M" ? male : sex === "F" ? female : unknown;
    return palette[Math.min(Math.max(gen - 1, 0), palette.length - 1)];
  }

  function fanChartHtml(head, maxGen) {
    const { depth, slots } = buildPedigreeSlots(head, maxGen);
    // True half-circle disk: flat diameter base, circular outer rim
    const pad = 40;
    const outerR = 520;
    const W = outerR * 2 + pad * 2;
    const H = outerR + pad + 18;
    const cx = W / 2;
    const cy = H - 18;
    const hubR = Math.max(86, outerR * 0.18);
    const ringW = (outerR - hubR) / Math.max(depth, 1);

    function polar(r, a) {
      return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    }

    function arcPoly(r, aFrom, aTo) {
      // Trace the circle by angle so we never get SVG reverse-arc sails
      const span = Math.abs(aTo - aFrom);
      const steps = Math.max(8, Math.ceil((span / Math.PI) * 48));
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const a = aFrom + ((aTo - aFrom) * i) / steps;
        pts.push(polar(r, a));
      }
      return pts;
    }

    function pathFromPoints(pts, close) {
      let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
      }
      if (close) d += " Z";
      return d;
    }

    function sectorPath(rInner, rOuter, aLeft, aRight) {
      // True pizza-slice ring: outer arc → radial → inner arc back → radial
      const outer = arcPoly(rOuter, aLeft, aRight);
      const inner = arcPoly(rInner, aRight, aLeft);
      return pathFromPoints(outer.concat(inner), true);
    }

    // Upper half-disk + hub (circular rim; Z closes along the flat diameter)
    const halfDisk = pathFromPoints(arcPoly(outerR, Math.PI, 0), true);
    const hubDisk = pathFromPoints(arcPoly(hubR, Math.PI, 0), true);

    function labelFontSize(gen, spaceW) {
      // Scale type to available width; fewer/wider slices → larger
      const count = 2 ** gen;
      let fs;
      if (count <= 2) fs = 14;
      else if (count <= 4) fs = 12;
      else if (count <= 8) fs = 10;
      else if (count <= 16) fs = 8.5;
      else if (count <= 32) fs = 7.5;
      else fs = 6.5;
      if (spaceW > 0) fs = Math.min(fs, Math.max(6, spaceW * 0.14));
      return fs;
    }

    function contentBlock(p, gen, rInner, rOuter, aLeft, aRight) {
      const livingCls = p && p.living === "1" ? " fan-living" : "";
      const emptyCls = p ? "" : " fan-empty";
      const name = fanFirstLast(p);
      const details = fanDetailLines(p);
      const midR = (rInner + rOuter) / 2;
      const span = Math.abs(aLeft - aRight);
      // Usable box inside the ring sector
      const spaceH = Math.max(12, (rOuter - rInner) * 0.78);
      const spaceW = Math.max(12, 2 * midR * Math.sin(span / 2) * 0.72);
      const fs = labelFontSize(gen, spaceW);
      const dateFs = Math.max(5.5, fs - 1.5);
      const lineCount = 1 + details.length;
      const textH = fs * (0.85 + Math.max(0, lineCount - 1) * 1.05);
      const pad = 3;
      const gap = 4;

      // Photo only in leftover room after text; grows with free space, shrinks when tight
      let mugH = 0;
      let mugW = 0;
      let mugHtml = "";
      const src = p && p.living !== "1" ? mugSrc(p) : "";
      if (src) {
        const leftover = spaceH - textH - gap - pad * 2;
        const side = Math.min(spaceW * 0.92 / 0.78, leftover, spaceH * 0.58);
        if (side >= 12) {
          mugH = side;
          mugW = side * 0.78;
        }
      }

      const blockH = (mugH ? mugH + gap : 0) + textH;
      const y0 = -blockH / 2;
      if (mugH && src) {
        mugHtml = `<image class="fan-mug" href="${esc(src)}" xlink:href="${esc(src)}" x="${(-mugW / 2).toFixed(1)}" y="${y0.toFixed(1)}" width="${mugW.toFixed(1)}" height="${mugH.toFixed(1)}" preserveAspectRatio="xMidYMid slice" />`;
      }
      const textTop = y0 + (mugH ? mugH + gap : 0) + fs * 0.8;
      const tspans = details
        .map(
          (line) =>
            `<tspan class="fan-mdate" x="0" dy="1.05em" font-size="${dateFs}">${esc(line)}</tspan>`
        )
        .join("");
      return `
        ${mugHtml}
        <text class="fan-label${livingCls}${emptyCls}" font-size="${fs}" text-anchor="middle" y="${textTop.toFixed(1)}">
          <tspan x="0" dy="0">${esc(name)}</tspan>
          ${tspans}
        </text>`;
    }

    const wedges = [];
    for (let g = depth; g >= 1; g--) {
      const start = 2 ** g;
      const count = 2 ** g;
      const r0 = hubR + (g - 1) * ringW;
      const r1 = hubR + g * ringW;
      for (let i = 0; i < count; i++) {
        const ahn = start + i;
        const p = slots[ahn];
        const a0 = Math.PI - (i / count) * Math.PI;
        const a1 = Math.PI - ((i + 1) / count) * Math.PI;
        const fill = fanFill(p, g);
        const mid = (a0 + a1) / 2;
        const labelR = (r0 + r1) / 2;
        const [lx, ly] = polar(labelR, mid);
        const details = fanDetailLines(p);
        const title = p
          ? `${fanFirstLast(p)}${details.length ? ` · ${details.join(" · ")}` : ""} (#${ahn})`
          : `Unknown (#${ahn})`;
        const sexCls = p ? (fanSex(p) === "M" ? " fan-male" : fanSex(p) === "F" ? " fan-female" : "") : "";
        const emptyCls = p ? "" : " fan-empty";
        const href = p ? `person.html?id=${encodeURIComponent(p.id)}` : "";
        const body = `
          <path class="fan-wedge${emptyCls}${sexCls}" d="${sectorPath(r0, r1, a0, a1)}" fill="${fill}" fill-opacity="1" stroke="#6b5340" stroke-width="1" />
          <g transform="translate(${lx.toFixed(1)} ${ly.toFixed(1)})">
            ${contentBlock(p, g, r0, r1, a0, a1)}
          </g>`;
        wedges.push(
          href
            ? `<a class="fan-cell person-link" href="${href}" title="${esc(title)}">${body}</a>`
            : `<g class="fan-cell" aria-hidden="true">${body}</g>`
        );
      }
    }

    const root = slots[1];
    const rootLiving = root && root.living === "1";
    const rootName = root ? fanFirstLast(root) : "Unknown";
    const rootDetails = fanDetailLines(root);
    const rootHref = root ? `person.html?id=${encodeURIComponent(root.id)}` : "";
    const rootFill = fanFill(root, 0);
    const rootTitle = root
      ? `${rootName}${rootDetails.length ? ` · ${rootDetails.join(" · ")}` : ""}`
      : "Unknown";
    const rootMugSrc = root && !rootLiving ? mugSrc(root) : "";
    const rootTextH = 16 + rootDetails.length * 11;
    const rootLeftover = hubR * 0.72 - rootTextH - 8;
    const rootMugH = rootMugSrc ? Math.max(0, Math.min(rootLeftover, hubR * 0.42, 52)) : 0;
    const rootMugW = rootMugH * 0.78;
    const rootBlockH = (rootMugH ? rootMugH + 6 : 0) + rootTextH;
    const rootTop = cy - hubR * 0.82;
    const rootMugY = rootTop + Math.max(0, (hubR * 0.82 - rootBlockH) / 2);
    const rootNameY = rootMugY + (rootMugH ? rootMugH + 6 : 0) + 14;
    const rootMugHtml =
      rootMugH >= 14 && rootMugSrc
        ? `<image class="fan-mug" href="${esc(rootMugSrc)}" xlink:href="${esc(rootMugSrc)}" x="${(cx - rootMugW / 2).toFixed(1)}" y="${rootMugY.toFixed(1)}" width="${rootMugW.toFixed(1)}" height="${rootMugH.toFixed(1)}" preserveAspectRatio="xMidYMid slice" />`
        : "";
    const rootDetailHtml = rootDetails
      .map(
        (line, i) =>
          `<text class="fan-root-life" x="${cx}" y="${(rootNameY + 14 + i * 11).toFixed(1)}" text-anchor="middle">${esc(line)}</text>`
      )
      .join("");
    const rootBody = `
      <path class="fan-root-disk" d="${hubDisk}" fill="${rootFill}" stroke="rgba(90,70,45,0.4)" stroke-width="1.5" />
      ${rootMugHtml}
      <text class="fan-root-name${rootLiving ? " fan-living" : ""}" x="${cx}" y="${rootNameY.toFixed(1)}" text-anchor="middle">${esc(rootName)}</text>
      ${rootDetailHtml}`;

    return `
      <section class="anc-chart-wrap panel fan-chart-wrap">
        <div class="anc-chart-head">
          <h2>Fan chart</h2>
          <p class="muted small">Half-circle ancestor fan for ${esc(displayName(head))} — circular rim, upright centred labels. Paternal left, maternal right. b./d. dates; m. on males. Blue = male, rose = female.</p>
        </div>
        <div class="fan-legend" aria-hidden="true">
          <span class="fan-legend-swatch fan-legend-male"></span> Male
          <span class="fan-legend-swatch fan-legend-female"></span> Female
        </div>
        <div class="fan-chart-scroll">
          <svg class="fan-chart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="Fan chart pedigree of ${esc(displayName(head))}">
            <path class="fan-half-outline" d="${halfDisk}" fill="#f7efe3" stroke="#6b5340" stroke-width="1.75" />
            ${wedges.join("")}
            ${
              rootHref
                ? `<a class="fan-root person-link" href="${rootHref}" title="${esc(rootTitle)}">${rootBody}</a>`
                : `<g class="fan-root">${rootBody}</g>`
            }
            <line class="fan-diameter" x1="${(cx - outerR).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + outerR).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="#6b5340" stroke-width="1.75" />
            <text class="fan-side-label" x="${(cx - outerR + 8).toFixed(1)}" y="${(cy - outerR * 0.42).toFixed(1)}">Paternal</text>
            <text class="fan-side-label" x="${(cx + outerR - 8).toFixed(1)}" y="${(cy - outerR * 0.42).toFixed(1)}" text-anchor="end">Maternal</text>
          </svg>
        </div>
      </section>`;
  }

  function renderLine() {
    const code = qs("line") || "B";
    const line = lineMeta(code) || DATA.meta.lines[0];
    const people = peopleForLine(line.code);
    const genMap = computeGenerations(line.head_id);
    const head = peopleById[line.head_id];
    const viewParam = qs("view");
    const initialView = viewParam === "chart" || viewParam === "fan" ? viewParam : "list";

    const ancestors = people.filter((p) => p.is_ancestor === "1");
    const byGen = {};
    for (const p of ancestors) {
      const g = genMap[p.id] != null ? genMap[p.id] : Number(p.generation || 99);
      (byGen[g] || (byGen[g] = [])).push(p);
    }
    const genKeys = Object.keys(byGen)
      .map(Number)
      .sort((a, b) => a - b);

    const root = document.getElementById("app");
    root.innerHTML = `
      ${renderHeader(line.code)}
      ${crumbs([
        { label: "Family Lines", href: "index.html" },
        { label: line.name },
      ])}
      <main class="wrap">
        <section class="line-hero">
          <h1>${esc(line.title)}</h1>
          <p>${esc(line.subtitle)}. Living people appear as names only.</p>
        </section>
        <div class="line-tools">
          <div class="chip-row" id="line-views" role="tablist" aria-label="Line view">
            <button type="button" class="chip${initialView === "list" ? " active" : ""}" data-view="list">By generation</button>
            <button type="button" class="chip${initialView === "chart" ? " active" : ""}" data-view="chart">Ancestral chart</button>
            <button type="button" class="chip${initialView === "fan" ? " active" : ""}" data-view="fan">Fan chart</button>
          </div>
          <label>Depth
            <select id="depth">
              <option value="2">To grandparents</option>
              <option value="3" selected>To great-grandparents</option>
              <option value="4">4 generations</option>
              <option value="5">5 generations</option>
              <option value="6">6 generations</option>
              <option value="99">All generations</option>
            </select>
          </label>
          <div class="line-list-tools" id="line-list-tools">
            <input id="line-search" type="search" placeholder="Filter this line…" />
            <div class="chip-row" id="filters">
              <button type="button" class="chip active" data-filter="siblings">Include siblings</button>
              <button type="button" class="chip" data-filter="fg">Has Find a Grave</button>
            </div>
          </div>
        </div>
        <div id="anc-chart-panel" class="anc-chart-panel" ${initialView === "chart" || initialView === "fan" ? "" : "hidden"}></div>
        <div id="line-list-panel" class="line-layout" ${initialView === "list" ? "" : "hidden"}>
          <aside class="gen-rail" id="gen-rail"></aside>
          <div id="gen-sections"></div>
        </div>
      </main>
      ${renderFooter()}`;

    wireGlobalSearch();

    const state = {
      view: initialView,
      depth: 3,
      q: "",
      filters: new Set(["siblings"]),
    };

    function siblingChips(ancestor) {
      const sibs = siblingsOf(ancestor).filter((s) => lineCodes(s).includes(line.code));
      if (!sibs.length || !state.filters.has("siblings")) return "";
      // Ancestor card is the direct line; chips are collateral siblings
      const chips = sibs
        .map((s) => {
          const cls = isDirectLine(s) ? " sib-direct" : "";
          return `<span class="sib-chip${cls}">${personLink(s)}${isDirectLine(s) ? " · direct" : ""}</span>`;
        })
        .join("");
      return `<div class="siblings"><div class="siblings-label">Siblings</div><div class="sib-chips">${chips}</div></div>`;
    }

    function card(p) {
      if (p.living === "1") {
        return `
          <article class="ancestor-block">
            <div class="ancestor-main">
              <div class="mug placeholder">Living</div>
              <div>
                <h3>${personLink(p)}</h3>
                <div class="meta-line">Living — details withheld</div>
              </div>
              <div class="badge-row"><span class="badge living">Living</span></div>
            </div>
            ${siblingChips(p)}
          </article>`;
      }
      const note = (p.notes || "").trim();
      const short = note.length > 160 ? note.slice(0, 160) + "…" : note;
      const related = relatedPeople(p);
      return `
        <article class="ancestor-block" data-name="${esc(displayName(p).toLowerCase())}" data-fg="${p.fg_url ? "1" : "0"}" data-notes="${note ? "1" : "0"}">
          <div class="ancestor-main">
            ${mugFor(p)}
            <div>
              <h3>${personLink(p)}</h3>
              <div class="meta-line">${esc(lifeSpan(p))}</div>
              ${marriageSummaryHtml(p, { withWhen: false })}
              ${short ? `<div class="snippet">${linkifyProse(short, related)}</div>` : ""}
            </div>
            <div class="badge-row">
              ${p.is_sibling === "1" ? `<span class="badge sibling">Also sibling line</span>` : ""}
              ${findagraveBadge(p)}
            </div>
          </div>
          ${siblingChips(p)}
        </article>`;
    }

    function setView(view) {
      state.view = view === "chart" || view === "fan" ? view : "list";
      document.querySelectorAll("#line-views .chip").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.view === state.view);
      });
      const chartish = state.view === "chart" || state.view === "fan";
      document.getElementById("anc-chart-panel").hidden = !chartish;
      document.getElementById("line-list-panel").hidden = state.view !== "list";
      document.getElementById("line-list-tools").hidden = state.view !== "list";
      const url = new URL(window.location.href);
      if (state.view === "chart" || state.view === "fan") url.searchParams.set("view", state.view);
      else url.searchParams.delete("view");
      history.replaceState(null, "", url);
      paint();
    }

    function paint() {
      const chartDepth = state.depth >= 99 ? 6 : Math.min(state.depth, 6);
      const chartPanel = document.getElementById("anc-chart-panel");
      if (state.view === "fan") chartPanel.innerHTML = fanChartHtml(head, chartDepth);
      else if (state.view === "chart") chartPanel.innerHTML = ancestralChartHtml(head, chartDepth);
      else chartPanel.innerHTML = "";

      const visibleGens = genKeys.filter((g) => g <= state.depth);
      document.getElementById("gen-rail").innerHTML = visibleGens
        .map((g) => {
          const label = GEN_LABELS[g] || `Generation ${g}`;
          return `<a href="#gen-${g}">${esc(label)}</a>`;
        })
        .join("");

      const sections = visibleGens
        .map((g) => {
          let list = (byGen[g] || []).slice();
          list.sort((a, b) => displayName(a).localeCompare(displayName(b)));
          list = list.filter((p) => {
            if (state.q && !displayName(p).toLowerCase().includes(state.q)) return false;
            if (state.filters.has("fg") && !p.fg_url) return false;
            return true;
          });
          if (!list.length) return "";
          return `
            <section class="gen-block" id="gen-${g}">
              <h2>${esc(GEN_LABELS[g] || `Generation ${g}`)}</h2>
              ${list.map(card).join("")}
            </section>`;
        })
        .join("");
      document.getElementById("gen-sections").innerHTML =
        sections || `<div class="panel muted">No people match these filters.</div>`;
    }

    document.getElementById("line-views").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-view]");
      if (!btn) return;
      setView(btn.dataset.view);
    });
    document.getElementById("depth").addEventListener("change", (e) => {
      state.depth = Number(e.target.value);
      paint();
    });
    document.getElementById("line-search").addEventListener("input", (e) => {
      state.q = e.target.value.trim().toLowerCase();
      paint();
    });
    document.getElementById("filters").addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      const key = btn.dataset.filter;
      btn.classList.toggle("active");
      if (btn.classList.contains("active")) state.filters.add(key);
      else state.filters.delete(key);
      paint();
    });
    setView(state.view);
  }

  function birthYearSort(text) {
    const m = String(text || "").match(/(1[5-9]\d{2}|20\d{2})/);
    return m ? Number(m[1]) : 9999;
  }

  function renderPerson() {
    const id = qs("id");
    const p = peopleById[id];
    const root = document.getElementById("app");
    if (!p) {
      root.innerHTML = `${renderHeader()}<main class="wrap"><div class="panel">Person not found.</div></main>`;
      return;
    }
    const primaryLine = lineCodes(p)[0];
    const line = lineMeta(primaryLine);

    if (p.living === "1") {
      root.innerHTML = `
        ${renderHeader(primaryLine)}
        ${crumbs([
          { label: "Family Lines", href: "index.html" },
          { label: line ? line.name : "Line", href: line ? `line.html?line=${line.code}` : "index.html" },
          { label: displayName(p) },
        ])}
        <main class="wrap">
          <section class="person-hero panel">
            <h1>${esc(displayName(p))}</h1>
            <p class="living-name">Living — details are withheld on this site.</p>
          </section>
        </main>
        ${renderFooter()}`;
      wireGlobalSearch();
      return;
    }

    const lineBadges = lineCodes(p)
      .map((c) => {
        const L = lineMeta(c);
        return L
          ? `<a class="badge" href="line.html?line=${c}">${esc(L.name)}</a>`
          : "";
      })
      .join("");

    const personVoyages = voyagesByPerson[p.id] || [];
    const immigrationHtml = personVoyages.length
      ? personVoyages
          .map((v) => {
            const route = `${v.depart_place || "?"} → ${v.arrive_place || "?"}`;
            const days = v.days ? ` · ${v.days} days` : "";
            const buttons = [];
            if (v.wiki_url) {
              buttons.push(`<a class="imm-more-btn" href="${esc(v.wiki_url)}" target="_blank" rel="noopener">
                    <span class="imm-more-kicker">Wikipedia</span>
                    <span class="imm-more-label">${esc(v.wiki_label || "Wikipedia")}</span>
                  </a>`);
            }
            if (v.info_url && v.info_url !== v.wiki_url) {
              buttons.push(`<a class="imm-more-btn" href="${esc(v.info_url)}" target="_blank" rel="noopener">
                    <span class="imm-more-kicker">More info</span>
                    <span class="imm-more-label">${esc(v.info_label || "More about this voyage")}</span>
                  </a>`);
            }
            const more = buttons.length ? `<div class="imm-more">${buttons.join("")}</div>` : "";
            return `<li>
              <a href="immigration.html#${encodeURIComponent(v.id)}"><em>${esc(v.ship)}</em> (${esc(String(v.year))})</a>
              <span class="muted small"> — ${esc(route)}${esc(days)}</span>
              ${v.summary ? `<div class="snippet">${esc(v.summary)}</div>` : ""}
              ${more}
            </li>`;
          })
          .join("")
      : "";

    const personMarriages = marriagesForPerson(p.id);
    const related = relatedPeople(p);
    const factRows = [
      ["Born", p.birth ? esc(p.birth) : ""],
      ["Died", p.death ? esc(p.death) : ""],
      ["Burial", p.burial ? esc(formatBurial(p.burial)) : ""],
      ["Occupation", p.occupation ? esc(p.occupation) : ""],
      ["Sex", p.sex ? esc(p.sex) : ""],
    ];
    for (const m of personMarriages) {
      const spouse = spouseOfMarriage(m, p.id);
      const when = marriageWhen(m);
      const dd = `${personLink(spouse)}${when ? ` <span class="muted">— ${esc(when)}</span>` : ""}`;
      factRows.push([personMarriages.length === 1 ? "Married" : "Marriage", dd]);
    }
    const facts = factRows
      .filter(([, v]) => v)
      .map(([k, v]) => `<div class="fact"><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
      .join("");

    const parents = parentsOf(p)
      .map((x) => {
        const cls = isDirectLine(x) ? " class=\"direct-line-row\"" : "";
        return `<li${cls}>${personLink(x)} ${directLineMark(x)}</li>`;
      })
      .join("");
    const sibs = siblingsOf(p)
      .map((x) => {
        const cls = isDirectLine(x) ? " class=\"direct-line-row\"" : "";
        return `<li${cls}>${personLink(x)} <span class="muted small">${esc(lifeSpan(x))}</span> ${directLineMark(x)}</li>`;
      })
      .join("");
    const marriageHtml = personMarriages
      .map((m) => {
        const spouse = spouseOfMarriage(m, p.id);
        const kids = childrenOfMarriage(m.id)
          .map((c) => {
            const cls = isDirectLine(c) ? " class=\"direct-line-row\"" : "";
            return `<li${cls}>${personLink(c)} <span class="muted small">${esc(lifeSpan(c))}</span> ${directLineMark(c)}</li>`;
          })
          .join("");
        const notes = m.notes
          ? `<div class="note-callout prose">${linkifyProse(m.notes, related)}</div>`
          : "";
        const when = marriageWhen(m);
        return `
          <li>
            <div><strong>Married</strong> ${personLink(spouse)}
              ${when ? `<span class="muted"> — ${esc(when)}</span>` : ""}
            </div>
            ${notes}
            ${kids ? `<div class="small muted" style="margin-top:0.35rem">Children</div><ul class="related-list">${kids}</ul>` : ""}
          </li>`;
      })
      .join("");

    const personEventMedia = (eventMediaByPerson[p.id] || [])
      .slice()
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));

    function eventThumbHtml(items) {
      if (!items || !items.length) return "";
      const seen = new Set();
      return `<div class="event-thumbs">${items
        .filter((m) => {
          const key = m.thumb || "";
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((m) => {
          const title = m.caption || m.label || "";
          return `<figure class="event-thumb">
            <a href="${esc(m.thumb)}" target="_blank" rel="noopener">
              <img src="${esc(m.thumb)}" alt="${esc(m.label || "")}" loading="lazy" />
            </a>
            ${title ? `<figcaption>${esc(title)}</figcaption>` : ""}
          </figure>`;
        })
        .join("")}</div>`;
    }

    function yearsInText(text) {
      return new Set(String(text || "").match(/\b(1[6-9]\d{2}|20[0-2]\d)\b/g) || []);
    }

    function captionLabel(m) {
      const cap = String(m.caption || m.label || "").trim();
      const colon = cap.match(/^([A-Za-z][A-Za-z /-]{1,40})\s*:/);
      if (colon) return colon[1].trim().toLowerCase();
      const word = cap.match(/^(young|younger|older|family|children|portrait|photo)\b/i);
      return word ? word[1].toLowerCase() : "";
    }

    function mediaMatchesEvent(m, e) {
      if (m.event_id && String(m.event_id) === String(e.id)) return 100;
      const cap = String(m.caption || m.label || "").toLowerCase();
      if (!cap) return 0;
      const etype = String(e.type || "").toLowerCase();
      const desc = String(e.description || "").toLowerCase();
      const label = captionLabel(m);
      let score = 0;
      const aliases = {
        young: ["young", "younger"],
        younger: ["young", "younger"],
        older: ["older"],
        family: ["family"],
        children: ["children"],
        portrait: ["portrait", "photo"],
        photo: ["portrait", "photo"],
      };
      if (label && (aliases[label] || [label]).includes(etype)) score += 8;
      const myYears = yearsInText(cap);
      const evYears = yearsInText([e.date, e.description, e.place, e.notes].filter(Boolean).join(" "));
      let shared = false;
      myYears.forEach((y) => {
        if (evYears.has(y)) shared = true;
      });
      if (shared) score += 10;
      if (desc && desc.length >= 4 && cap.includes(desc)) score += 6;
      return score;
    }

    function takeMediaForKinds(pool, kinds) {
      const hit = [];
      const rest = [];
      for (const m of pool) {
        if (kinds.has(m.kind)) hit.push(m);
        else rest.push(m);
      }
      return { hit, rest };
    }

    function takeBestEventMedia(pool, e) {
      let best = null;
      let bestScore = 0;
      for (const m of pool) {
        const s = mediaMatchesEvent(m, e);
        if (s > bestScore) {
          bestScore = s;
          best = m;
        }
      }
      if (!best || bestScore < 8) return { hit: [], rest: pool };
      // Take all that match this event_id, or same label+year as best
      const hit = [];
      const rest = [];
      const bestLabel = captionLabel(best);
      const bestYears = yearsInText(best.caption || best.label || "");
      for (const m of pool) {
        if (m.event_id && String(m.event_id) === String(e.id)) {
          hit.push(m);
          continue;
        }
        const s = mediaMatchesEvent(m, e);
        if (s >= 8 && captionLabel(m) === bestLabel) {
          const myY = yearsInText(m.caption || m.label || "");
          let ok = !bestYears.size || !myY.size;
          if (!ok) myY.forEach((y) => { if (bestYears.has(y)) ok = true; });
          if (!bestYears.size && !myY.size) ok = true;
          if (ok || s >= 14) {
            hit.push(m);
            continue;
          }
        }
        rest.push(m);
      }
      return { hit, rest };
    }

    function marriageMediaMatch(m, marriage, spouse) {
      if ((m.kind || "") !== "marriage") return 0;
      const cap = String(m.caption || m.label || m.source_file || "").toLowerCase();
      let score = 1;
      const mYears = yearsInText(marriage.date || "");
      const cYears = yearsInText(cap);
      let yearHit = false;
      mYears.forEach((y) => {
        if (cYears.has(y)) yearHit = true;
      });
      if (yearHit) score += 10;
      if (spouse) {
        const sur = String(spouse.surname || "").toLowerCase();
        const given = String(spouse.given || "").toLowerCase();
        if (sur && sur.length > 2 && cap.includes(sur)) score += 6;
        if (given && given.length > 2 && cap.includes(given)) score += 3;
      }
      const place = String(marriage.place || "").toLowerCase();
      if (place) {
        const token = place.split(",")[0].trim();
        if (token.length > 3 && cap.includes(token)) score += 3;
      }
      return score;
    }

    let mediaPool = personEventMedia.slice();
    const timelineItems = [];
    if (p.birth) {
      const { hit, rest } = takeMediaForKinds(mediaPool, new Set(["birth"]));
      mediaPool = rest;
      timelineItems.push({ when: p.birth, what: "Birth", sort: birthYearSort(p.birth), thumbs: hit });
    }

    // Assign marriage thumbs per marriage (year/spouse name); include partner copies
    const marriageKindLeft = [];
    const nonMarriage = [];
    for (const m of mediaPool) {
      if (m.kind === "marriage") marriageKindLeft.push(m);
      else nonMarriage.push(m);
    }
    mediaPool = nonMarriage;
    const usedMarriageThumbs = new Set();
    for (const mr of personMarriages) {
      const spouse = spouseOfMarriage(mr, p.id);
      const scored = marriageKindLeft
        .filter((m) => !usedMarriageThumbs.has(m.thumb))
        .map((m) => ({ m, s: marriageMediaMatch(m, mr, spouse) }))
        .sort((a, b) => b.s - a.s);
      const hit = [];
      if (scored.length) {
        const top = scored[0].s;
        const take =
          personMarriages.length === 1
            ? scored
            : scored.filter((x) => x.s >= Math.max(7, top - 2) || (top <= 1 && x.s >= 1));
        for (const x of personMarriages.length === 1 ? scored : take) {
          if (personMarriages.length > 1 && x.s < 7 && top >= 7) continue;
          if (personMarriages.length > 1 && top <= 1 && hit.length) continue;
          hit.push(x.m);
          usedMarriageThumbs.add(x.m.thumb);
        }
        // If multiple marriages and nothing scored well, leave for later single dump avoided
        if (personMarriages.length > 1 && top < 7 && hit.length === 0 && scored[0]) {
          // only attach if unique best year/name signal absent — skip ambiguous
        }
      }
      timelineItems.push({
        when: marriageWhen(mr) || mr.date || "",
        whatHtml: `Married ${personLink(spouse)}`,
        sort: birthYearSort(mr.date) || birthYearSort(p.birth) + 20,
        thumbs: hit,
      });
    }
    // Unassigned marriage thumbs: if only one marriage row, already taken; else add under first marriage
    const leftoverMarriage = marriageKindLeft.filter((m) => !usedMarriageThumbs.has(m.thumb));
    if (leftoverMarriage.length && personMarriages.length === 1) {
      const item = timelineItems.find((t) => t.whatHtml && t.whatHtml.includes("Married"));
      if (item) item.thumbs = (item.thumbs || []).concat(leftoverMarriage);
    } else if (leftoverMarriage.length && personMarriages.length === 0) {
      for (const m of leftoverMarriage) {
        timelineItems.push({
          when: "",
          what: m.label || "Marriage",
          sort: birthYearSort(p.birth) + 20,
          thumbs: [m],
        });
      }
    } else {
      // Ambiguous extras stay available for media tab only
    }

    for (const e of eventsByPerson[p.id] || []) {
      const what = [e.type, e.description].filter(Boolean).join(": ") || "Event";
      const { hit, rest } = takeBestEventMedia(mediaPool, e);
      mediaPool = rest;
      timelineItems.push({
        when: [e.date, e.place].filter(Boolean).join(" · "),
        what,
        detail: e.notes || "",
        sort: birthYearSort(e.date) || birthYearSort(p.birth) + 1,
        thumbs: hit,
      });
    }
    {
      const { hit, rest } = takeMediaForKinds(mediaPool, new Set(["immigration"]));
      mediaPool = rest;
      if (hit.length || (voyagesByPerson[p.id] || []).length) {
        const v = (voyagesByPerson[p.id] || [])[0];
        timelineItems.push({
          when: v ? [v.year, v.ship].filter(Boolean).join(" · ") : "",
          what: v ? `Immigration — ${v.ship || "voyage"}` : "Immigration",
          sort: (v && Number(v.year)) || birthYearSort(p.birth) + 15,
          thumbs: hit,
        });
      }
    }
    if (p.death) {
      const { hit, rest } = takeMediaForKinds(mediaPool, new Set(["death"]));
      mediaPool = rest;
      timelineItems.push({ when: p.death, what: "Death", sort: birthYearSort(p.death) + 50, thumbs: hit });
    }
    if (p.burial) {
      const { hit, rest } = takeMediaForKinds(mediaPool, new Set(["burial"]));
      mediaPool = rest;
      timelineItems.push({
        when: formatBurial(p.burial),
        what: "Burial",
        sort: birthYearSort(p.death) + 51,
        thumbs: hit,
      });
    }
    // Place / military leftovers get their own timeline rows; other photos stay in Media
    for (const m of mediaPool) {
      if (m.kind !== "place" && m.kind !== "military") continue;
      timelineItems.push({
        when: "",
        what: m.label || (m.kind === "place" ? "Place" : "Military"),
        detail: m.caption && m.caption !== m.label ? m.caption : "",
        sort: birthYearSort(p.birth) + 25 + Number(m.sort || 0) * 0.01,
        thumbs: [m],
      });
    }
    timelineItems.sort((a, b) => a.sort - b.sort);
    const timeline = timelineItems
      .map(
        (t) => `
        <li>
          <div class="when">${esc(t.when || "")}</div>
          <div class="what">${t.whatHtml || esc(t.what || "")}</div>
          ${t.detail ? `<div class="prose">${linkifyProse(t.detail, related)}</div>` : ""}
          ${eventThumbHtml(t.thumbs)}
        </li>`
      )
      .join("");

    const mediaGallery = personEventMedia.length
      ? `<div class="media-gallery">${personEventMedia
          .map((m) => {
            const title = m.caption || m.label || "";
            return `<figure class="media-card">
              <a href="${esc(m.thumb)}" target="_blank" rel="noopener">
                <img src="${esc(m.thumb)}" alt="${esc(m.label || "")}" loading="lazy" />
              </a>
              ${title ? `<figcaption>${esc(title)}</figcaption>` : ""}
            </figure>`;
          })
          .join("")}</div>`
      : "";

    // Only keep real outbound links — hide filename-only Legacy placeholders
    const media = (mediaByPerson[p.id] || [])
      .slice()
      .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
      .map((m) => {
        const label = mediaDisplayName(m);
        if (!label) return "";
        if (m.path_or_url && /^https?:\/\//i.test(m.path_or_url)) {
          return `<li><a href="${esc(m.path_or_url)}" target="_blank" rel="noopener">${esc(label)}</a></li>`;
        }
        return "";
      })
      .filter(Boolean)
      .join("");

    root.innerHTML = `
      ${renderHeader(primaryLine)}
      ${crumbs([
        { label: "Family Lines", href: "index.html" },
        { label: line ? line.name : "Line", href: line ? `line.html?line=${line.code}` : "index.html" },
        { label: displayName(p) },
      ])}
      <main class="wrap">
        <section class="person-hero panel">
          <div class="badge-row" style="justify-content:flex-start">
            ${lineBadges}
            ${findagraveBadge(p)}
            ${
              personVoyages.length
                ? `<a class="badge immigration" href="immigration.html#${encodeURIComponent(personVoyages[0].id)}">Immigration</a>`
                : ""
            }
            ${externalLinkBadge(p)}
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:1rem;align-items:start;margin-top:0.6rem">
            ${mugFor(p)}
            <div>
              <h1>${esc(displayName(p))}</h1>
              <p class="muted">${esc(lifeSpan(p))}</p>
              ${marriageSummaryHtml(p)}
              ${p.burial && p.fg_url ? `<p class="small muted">Burial recorded as: ${esc(formatBurial(p.burial))}</p>` : ""}
            </div>
          </div>
          <div class="tabs" role="tablist">
            <button type="button" class="active" data-tab="facts">Facts</button>
            <button type="button" data-tab="family">Family</button>
            <button type="button" data-tab="timeline">Timeline</button>
            <button type="button" data-tab="notes">Notes</button>
            <button type="button" data-tab="media">Media</button>
          </div>
          <div class="tab-panel active" id="tab-facts">
            <div class="facts">${facts || '<p class="muted">No vital facts recorded.</p>'}</div>
            ${
              immigrationHtml
                ? `<h3>Immigration</h3><ul class="related-list imm-person-list">${immigrationHtml}</ul>`
                : ""
            }
            ${placeMapHtml(personPlacePoints(p))}
          </div>
          <div class="tab-panel" id="tab-family" hidden>
            ${parents ? `<h3>Parents</h3><ul class="related-list">${parents}</ul>` : ""}
            ${sibs ? `<h3>Siblings</h3><ul class="related-list">${sibs}</ul>` : ""}
            ${marriageHtml ? `<h3>Marriages</h3><ul class="marriage-list">${marriageHtml}</ul>` : ""}
            ${!parents && !sibs && !marriageHtml ? `<p class="muted">No family links in scope.</p>` : ""}
          </div>
          <div class="tab-panel" id="tab-timeline" hidden>
            ${timeline ? `<ul class="timeline">${timeline}</ul>` : `<p class="muted">No timeline events.</p>`}
          </div>
          <div class="tab-panel" id="tab-notes" hidden>
            ${p.notes ? `<h3>Notes</h3><div class="prose">${linkifyProse(p.notes, related)}</div>` : ""}
            ${p.research_notes ? `<h3>Research notes</h3><div class="prose">${linkifyProse(p.research_notes, related)}</div>` : ""}
            ${!p.notes && !p.research_notes ? `<p class="muted">No notes.</p>` : ""}
          </div>
          <div class="tab-panel" id="tab-media" hidden>
            ${mediaGallery || ""}
            ${media ? `<ul class="related-list">${media}</ul>` : ""}
            ${!mediaGallery && !media ? `<p class="muted">No media linked.</p>` : ""}
          </div>
        </section>
      </main>
      ${renderFooter()}`;

    wireGlobalSearch();
    const placePoints = personPlacePoints(p);
    paintPersonPlaceMap(placePoints);
    root.querySelector(".tabs").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-tab]");
      if (!btn) return;
      root.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("active", b === btn));
      root.querySelectorAll(".tab-panel").forEach((panel) => {
        const on = panel.id === `tab-${btn.dataset.tab}`;
        panel.classList.toggle("active", on);
        panel.hidden = !on;
      });
    });
  }

  const page = document.body.dataset.page;
  if (page === "index") renderIndex();
  else if (page === "line") renderLine();
  else if (page === "person") renderPerson();
})();
