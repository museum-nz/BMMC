(function () {
  "use strict";

  const DATA = window.GEN_DATA;
  if (!DATA) {
    document.body.innerHTML =
      "<p style='padding:2rem'>Missing js/data.js. Run <code>python build/build_site.py</code>.</p>";
    return;
  }

  const peopleById = Object.fromEntries((DATA.people || []).map((p) => [p.id, p]));
  const wars = (DATA.wars || []).slice();

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
    if (!p) return "";
    const livingCls = p.living === "1" ? " living-name" : "";
    const title = p.living === "1" ? ` title="Living — name only"` : "";
    return `<a class="person-link${livingCls}" href="person.html?id=${encodeURIComponent(p.id)}"${title}>${esc(displayName(p))}</a>`;
  }

  function lineLabel(code) {
    const line = (DATA.meta.lines || []).find((l) => l.code === code);
    return line ? line.name : code || "";
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
          <nav class="line-nav">${nav}<a href="immigration.html">Immigration</a><a class="active" href="wars.html">Wars</a><a href="portraits.html">Portraits</a><a href="ancestry.html">Ethnic Makeup</a></nav>
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
          <p>Drawn from the Family in Wars appendix. Living relatives appear as names only.</p>
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

  function profileSrc(person, item) {
    if (person && person.fg_thumb) return person.fg_thumb;
    if (item && item.thumb) return item.thumb;
    return "";
  }

  function warCard(item) {
    const person = item.person_id ? peopleById[item.person_id] : null;
    const nameHtml = person
      ? personLink(item.person_id)
      : `<strong>${esc(item.name || "Family member")}</strong>`;
    const meta = [item.year, item.war, lineLabel(item.line), item.outcome]
      .filter(Boolean)
      .map((x) => esc(String(x)))
      .join(" · ");
    const src = profileSrc(person, item);
    const media = src
      ? `<div class="war-card-media"><img class="war-card-mug" src="${esc(src)}" alt="" loading="lazy" /></div>`
      : `<div class="war-card-media war-card-media-empty" aria-hidden="true"></div>`;
    const doc = item.doc
      ? `<p class="war-doc"><a href="${esc(item.doc)}" target="_blank" rel="noopener">Source document</a></p>`
      : `<p class="war-doc muted small">Full file kept in Appendices (too large to publish here).</p>`;
    return `
      <article class="war-card panel" id="${esc(item.id || "")}">
        ${media}
        <div class="war-card-body">
          <div class="war-card-meta">${meta}</div>
          <h2>${nameHtml}</h2>
          ${item.summary ? `<p>${esc(item.summary)}</p>` : ""}
          ${doc}
        </div>
      </article>`;
  }

  function render() {
    const root = document.getElementById("app");
    const byWar = {};
    for (const w of wars) {
      const key = w.war || "Other";
      (byWar[key] || (byWar[key] = [])).push(w);
    }
    const warOrder = Object.keys(byWar).sort((a, b) => {
      const ya = Math.min(...byWar[a].map((x) => x.year || 9999));
      const yb = Math.min(...byWar[b].map((x) => x.year || 9999));
      return ya - yb || a.localeCompare(b);
    });

    const sections = warOrder
      .map((war) => {
        const cards = byWar[war].map(warCard).join("");
        return `
          <section class="war-section">
            <h2 class="war-section-title">${esc(war)}</h2>
            <div class="war-grid">${cards}</div>
          </section>`;
      })
      .join("");

    root.innerHTML = `
      ${header()}
      <main class="wrap wars-page">
        <header class="wars-intro panel">
          <h1>Family in Wars</h1>
          <p>Service, loss, and remembrance across the four lines — drawn from the Family in Wars appendix (records, diaries, and contemporaneous notes).</p>
          <p class="muted small">${wars.length} entries · Mendocino · Boer War · World War I · World War II</p>
        </header>
        ${sections || `<p class="muted">No war entries yet. Run <code>python build/build_wars.py</code> then <code>build_site.py</code>.</p>`}
      </main>
      ${footer()}`;
    wireSearch();
  }

  render();
})();
