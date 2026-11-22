(function () {
  "use strict";

  const DATA = window.GEN_DATA;
  if (!DATA) {
    document.body.innerHTML =
      "<p style='padding:2rem'>Missing js/data.js. Run <code>python build/build_site.py</code>.</p>";
    return;
  }

  const ancestry = DATA.ancestry || {};
  const sets = ancestry.sets || [];
  const livingPeople = (DATA.people || []).filter((p) => p.living === "1");

  const COLORS = {
    England: "#3f6fad",
    Scotland: "#c04a3a",
    Ireland: "#3f8f5a",
    Scandinavian: "#7a4f9a",
    "West & Central Europe": "#2f9e9a",
    "Southern Europe": "#d9783a",
    "Eastern Europe": "#8ea0d0",
    "Finland and Northern Siberia": "#c86a8a",
    "Asia Minor": "#c9c05a",
    "Eastern Middle East": "#9a7ab8",
    "New Zealand": "#6b5a3a",
    Unknown: "#9a9084",
    US: "#5a7a9a",
    Netherlands: "#c09050",
  };
  const FALLBACK = [
    "#6b3f24",
    "#3d5a4c",
    "#3f4f6b",
    "#6b4f3f",
    "#8a6a4a",
    "#4a6a5a",
    "#5a4a6b",
    "#7a5a3a",
  ];

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

  function colorFor(label, index) {
    return COLORS[label] || FALLBACK[index % FALLBACK.length];
  }

  function givenTokensMatch(a, b) {
    if (!a || !b) return false;
    if (a === b || a.startsWith(b) || b.startsWith(a)) return true;
    const n = Math.min(a.length, b.length);
    return n >= 4 && a.slice(0, 4) === b.slice(0, 4);
  }

  // Line heads (Ian, Kathi, John, Moira) stay visible on pies
  const HEAD_AHN = new Set([4, 5, 6, 7]);

  function isAllowedLivingAncestry(pe) {
    return HEAD_AHN.has(Number(pe.ahnentafel));
  }

  function isLivingAncestryPerson(pe) {
    if (isAllowedLivingAncestry(pe)) return false;
    const relation = (pe.relation || "").toLowerCase();
    // Old target generation (Matthew & Elizabeth / their parents) stay private
    if (relation === "person" || relation === "father" || relation === "mother") {
      return true;
    }
    const surname = (pe.surname || "").trim().toLowerCase();
    const given = (pe.given || "").trim().toLowerCase();
    if (!surname || !given) return false;
    const g0 = given.split(/\s+/)[0];
    for (const p of livingPeople) {
      if ((p.surname || "").trim().toLowerCase() !== surname) continue;
      const lg = (p.given || "").trim().toLowerCase();
      if (!lg) continue;
      const lg0 = lg.split(/\s+/)[0];
      if (givenTokensMatch(g0, lg0) || givenTokensMatch(given, lg)) return true;
    }
    return false;
  }

  function averageShares(a, b) {
    const keys = new Set([
      ...Object.keys((a && a.shares) || {}),
      ...Object.keys((b && b.shares) || {}),
    ]);
    const out = {};
    for (const k of keys) {
      const v = (Number((a && a.shares && a.shares[k]) || 0) + Number((b && b.shares && b.shares[k]) || 0)) / 2;
      if (v > 0) out[k] = Math.round(v * 1e8) / 1e8;
    }
    return out;
  }

  function byAhn(people, ahn) {
    return people.find((p) => Number(p.ahnentafel) === ahn);
  }

  function theoreticalChildren(rawPeople, setId) {
    // Prefer pre-built entries from build_ancestry.py when present
    const existing = rawPeople.filter((p) => p.theoretical || (p.relation || "").toLowerCase() === "theoretical child");
    if (existing.length) return existing.map((p) => ({ ...p, theoretical: true }));

    const ian = byAhn(rawPeople, 4);
    const kathi = byAhn(rawPeople, 5);
    const john = byAhn(rawPeople, 6);
    const moira = byAhn(rawPeople, 7);
    const prefix = setId === "dna" ? "d" : setId === "genealogical" ? "g" : setId;
    const kids = [];
    if (ian && kathi) {
      kids.push({
        id: `${prefix}-child-ian-kathi`,
        ahnentafel: null,
        side: "Baird & Dun",
        relation: "Theoretical child",
        surname: "Baird",
        given: "Child of Ian & Kathi",
        name: "Theoretical child of Ian & Kathi",
        shares: averageShares(ian, kathi),
        theoretical: true,
      });
    }
    if (john && moira) {
      kids.push({
        id: `${prefix}-child-john-moira`,
        ahnentafel: null,
        side: "Spicer & Starling",
        relation: "Theoretical child",
        surname: "Spicer",
        given: "Child of John & Moira",
        name: "Theoretical child of John & Moira",
        shares: averageShares(john, moira),
        theoretical: true,
      });
    }
    return kids;
  }

  function peopleForSet(set) {
    const raw = set.people || [];
    const kids = theoreticalChildren(raw, set.id || "set");
    const kidIds = new Set(kids.map((p) => p.id));
    const base = raw.filter((p) => !kidIds.has(p.id) && !isLivingAncestryPerson(p));
    return kids.concat(base).sort((a, b) => {
      const rank = (p) => {
        if (p.theoretical) return String(p.id).includes("ian-kathi") ? 0 : 1;
        if (HEAD_AHN.has(Number(p.ahnentafel))) return 2;
        return 3 + (Number(p.ahnentafel) || 999);
      };
      return rank(a) - rank(b) || (a.name || "").localeCompare(b.name || "");
    });
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
          <nav class="line-nav">${nav}<a href="immigration.html">Immigration</a><a href="wars.html">Wars</a><a href="portraits.html">Portraits</a><a class="active" href="ancestry.html">Ethnic Makeup</a></nav>
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
          <p>Pie charts drawn from the family ethnic-makeup workbook.</p>
          ${vc}
        </div>
      </footer>`;
  }

  function wireSearch() {
    const input = document.getElementById("global-search");
    const box = document.getElementById("global-search-results");
    if (!input || !box) return;
    const people = DATA.people || [];
    function run() {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) {
        box.hidden = true;
        box.innerHTML = "";
        return;
      }
      const hits = people
        .filter((p) => displayName(p).toLowerCase().includes(q))
        .slice(0, 12);
      box.innerHTML = hits
        .map(
          (p) =>
            `<a href="person.html?id=${encodeURIComponent(p.id)}">${esc(displayName(p))}</a>`
        )
        .join("");
      box.hidden = !hits.length;
    }
    input.addEventListener("input", run);
    input.addEventListener("focus", run);
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrap")) box.hidden = true;
    });
  }

  function slicesFromShares(shares) {
    const entries = Object.entries(shares || {})
      .map(([label, value]) => ({ label, value: Number(value) || 0 }))
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
    const total = entries.reduce((sum, s) => sum + s.value, 0) || 1;
    return entries.map((s, i) => ({
      ...s,
      pct: (s.value / total) * 100,
      color: colorFor(s.label, i),
    }));
  }

  function drawPie(canvas, slices) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssSize = Math.min(canvas.clientWidth || 360, 420);
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssSize, cssSize);

    const cx = cssSize / 2;
    const cy = cssSize / 2;
    const radius = cssSize * 0.42;
    let start = -Math.PI / 2;

    if (!slices.length) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#d8cbb8";
      ctx.fill();
      ctx.fillStyle = "#5e564c";
      ctx.font = "600 14px Source Sans 3, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No shares", cx, cy + 4);
      return;
    }

    for (const slice of slices) {
      const angle = (slice.value / slices.reduce((s, x) => s + x.value, 0)) * Math.PI * 2;
      const end = start + angle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,250,243,0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();
      start = end;
    }

    // soft inner hole for a cleaner read
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,250,243,0.92)";
    ctx.fill();
  }

  function fmtPct(pct) {
    if (pct >= 10) return pct.toFixed(1);
    if (pct >= 1) return pct.toFixed(1);
    return pct.toFixed(2);
  }

  function personOptionLabel(p) {
    const bits = [p.name];
    if (p.relation) bits.push(p.relation);
    if (p.side && p.side !== "Target") bits.push(p.side);
    return bits.join(" · ");
  }

  function currentSetId() {
    const params = new URLSearchParams(location.search);
    return params.get("set") || (sets[0] && sets[0].id) || "";
  }

  function currentPersonId(set, people) {
    const params = new URLSearchParams(location.search);
    const wanted = params.get("person") || set.default_id || "";
    if (wanted && people.some((p) => p.id === wanted)) return wanted;
    return (people[0] && people[0].id) || "";
  }

  function setQuery(setId, personId) {
    const url = new URL(location.href);
    url.searchParams.set("set", setId);
    url.searchParams.set("person", personId);
    history.replaceState(null, "", url);
  }

  function renderChartPanel(set, person) {
    const slices = slicesFromShares(person.shares);
    const legend = slices
      .map(
        (s) => `
        <li>
          <span class="pie-swatch" style="background:${esc(s.color)}"></span>
          <span class="pie-label">${esc(s.label)}</span>
          <span class="pie-pct">${fmtPct(s.pct)}%</span>
        </li>`
      )
      .join("");

    return `
      <div class="pie-chart-panel">
        <div class="pie-canvas-wrap">
          <canvas id="ancestry-pie" width="360" height="360" aria-label="Pie chart for ${esc(person.name)}"></canvas>
        </div>
        <div class="pie-side">
          <h2 class="pie-person-name">${esc(person.name)}</h2>
          <p class="muted small">${esc([person.relation, person.side].filter(Boolean).join(" · "))}</p>
          <ul class="pie-legend">${legend || `<li class="muted">No percentage data</li>`}</ul>
        </div>
      </div>`;
  }

  function render() {
    const root = document.getElementById("app");
    if (!sets.length) {
      root.innerHTML = `
        ${header()}
        <main class="wrap ancestry-page">
          <header class="ancestry-intro panel">
            <h1>Ethnic Makeup</h1>
            <p class="muted">No ancestry pie data yet. Run <code>python build/build_ancestry.py</code> then <code>build_site.py</code>.</p>
          </header>
        </main>
        ${footer()}`;
      wireSearch();
      return;
    }

    let setId = currentSetId();
    let set = sets.find((s) => s.id === setId) || sets[0];
    setId = set.id;
    const people = peopleForSet(set);
    let personId = currentPersonId(set, people);
    let person = people.find((p) => p.id === personId) || people[0];
    personId = person ? person.id : "";
    setQuery(setId, personId);

    const setTabs = sets
      .map(
        (s) =>
          `<button type="button" class="pie-set-tab${s.id === setId ? " active" : ""}" data-set="${esc(s.id)}">${esc(s.label)}</button>`
      )
      .join("");

    const options = people
      .map(
        (p) =>
          `<option value="${esc(p.id)}"${p.id === personId ? " selected" : ""}>${esc(personOptionLabel(p))}</option>`
      )
      .join("");

    root.innerHTML = `
      ${header()}
      <main class="wrap ancestry-page">
        <header class="ancestry-intro panel">
          <h1>${esc(ancestry.title || "Ethnic Makeup")}</h1>
          <p>Create a pie chart for family heads, their ancestors, or a theoretical child of Ian &amp; Kathi or John &amp; Moira.</p>
          <p class="muted small">${esc(set.blurb || "")}</p>
        </header>

        <section class="panel pie-builder">
          <div class="pie-controls">
            <div class="pie-set-tabs" role="tablist" aria-label="Ancestry source">${setTabs}</div>
            <label class="pie-person-pick">
              <span>Create pie chart for</span>
              <select id="pie-person">${options}</select>
            </label>
          </div>
          ${person ? renderChartPanel(set, person) : `<p class="muted">No people in this set.</p>`}
        </section>
      </main>
      ${footer()}`;

    wireSearch();

    const canvas = document.getElementById("ancestry-pie");
    if (canvas && person) drawPie(canvas, slicesFromShares(person.shares));

    root.querySelectorAll(".pie-set-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = sets.find((s) => s.id === btn.getAttribute("data-set"));
        if (!next) return;
        const nextPeople = peopleForSet(next);
        setQuery(next.id, (nextPeople[0] && nextPeople[0].id) || "");
        render();
      });
    });

    const select = document.getElementById("pie-person");
    if (select) {
      select.addEventListener("change", () => {
        setQuery(setId, select.value);
        render();
      });
    }

    window.addEventListener(
      "resize",
      () => {
        const c = document.getElementById("ancestry-pie");
        if (c && person) drawPie(c, slicesFromShares(person.shares));
      },
      { once: true }
    );
  }

  render();
})();
