(function () {
  "use strict";

  const DATA = window.GEN_DATA;
  if (!DATA) {
    document.body.innerHTML =
      "<p style='padding:2rem'>Missing js/data.js. Run <code>python build/build_site.py</code>.</p>";
    return;
  }

  const peopleById = Object.fromEntries((DATA.people || []).map((p) => [p.id, p]));
  const portraits = DATA.portraits || { collages: {}, items: [] };

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
          <nav class="line-nav">${nav}<a href="immigration.html">Immigration</a><a href="wars.html">Wars</a><a class="active" href="portraits.html">Portraits</a><a href="ancestry.html">Ethnic Makeup</a></nav>
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
      if (!hits.length) {
        box.hidden = true;
        box.innerHTML = "";
        return;
      }
      box.innerHTML = hits
        .map(
          (p) =>
            `<a href="person.html?id=${encodeURIComponent(p.id)}">${esc(displayName(p))}</a>`
        )
        .join("");
      box.hidden = false;
    }
    input.addEventListener("input", run);
    input.addEventListener("focus", run);
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrap")) box.hidden = true;
    });
  }

  function livingTargetId(item) {
    for (const id of [item.person_id, item.spouse_id, item.link_id]) {
      if (!id) continue;
      const p = peopleById[id];
      if (p && p.living === "1") return id;
    }
    return item.link_id || null;
  }

  function yearLink(item) {
    if (item.marriage_year == null || item.marriage_year === "") return "";
    const text = `[m. ${esc(String(item.marriage_year))}]`;
    const livingId = livingTargetId(item);
    if (livingId && peopleById[livingId]) {
      return ` <a class="portrait-m-year" href="person.html?id=${encodeURIComponent(livingId)}" title="Living — name only">${text}</a>`;
    }
    return ` <span class="portrait-m-year">${text}</span>`;
  }

  function cardCaption(item) {
    const links = [];
    if (item.person_id) links.push(personLink(item.person_id));
    if (item.spouse_id && item.spouse_id !== item.person_id) {
      links.push(personLink(item.spouse_id));
    }
    let names = links.filter(Boolean).join(" · ");
    if (!names) {
      const plain = [item.name1, item.name2].filter(Boolean).map((n) => {
        const livingId = livingTargetId(item);
        if (livingId && peopleById[livingId]) {
          return `<span class="living-name" title="Living — name only">${esc(n)}</span>`;
        }
        return esc(n);
      });
      names = plain.join(" · ");
    }
    const year = yearLink(item);
    if (names) return `${names}${year}`;
    return year.trim();
  }

  function cardAlt(item) {
    const parts = [];
    if (item.person_id && peopleById[item.person_id]) {
      parts.push(displayName(peopleById[item.person_id]));
    }
    if (item.spouse_id && peopleById[item.spouse_id] && item.spouse_id !== item.person_id) {
      parts.push(displayName(peopleById[item.spouse_id]));
    }
    if (!parts.length) {
      if (item.name1) parts.push(item.name1);
      if (item.name2) parts.push(item.name2);
    }
    let alt = parts.join(" and ") || "Portrait";
    if (item.marriage_year != null && item.marriage_year !== "") {
      alt += ` [m. ${item.marriage_year}]`;
    }
    return alt;
  }

  function primaryHref(item) {
    if (item.person_id && peopleById[item.person_id]) {
      return `person.html?id=${encodeURIComponent(item.person_id)}`;
    }
    if (item.spouse_id && peopleById[item.spouse_id]) {
      return `person.html?id=${encodeURIComponent(item.spouse_id)}`;
    }
    const livingId = livingTargetId(item);
    if (livingId && peopleById[livingId]) {
      return `person.html?id=${encodeURIComponent(livingId)}`;
    }
    if (item.link_id && peopleById[item.link_id]) {
      return `person.html?id=${encodeURIComponent(item.link_id)}`;
    }
    return null;
  }

  function renderCard(item) {
    const href = primaryHref(item);
    const alt = cardAlt(item);
    const img = item.thumb
      ? `<img src="${esc(item.thumb)}" alt="${esc(alt)}" loading="lazy" />`
      : "";
    const media = href
      ? `<a class="portrait-thumb-link" href="${href}">${img}</a>`
      : `<div class="portrait-thumb-link">${img}</div>`;
    return `
      <article class="portrait-card">
        ${media}
        <div class="portrait-card-body">
          <p class="portrait-card-people">${cardCaption(item)}</p>
        </div>
      </article>`;
  }

  function renderFamily(family, title, blurb) {
    const collage = (portraits.collages || {})[family];
    const items = (portraits.items || [])
      .filter((i) => i.family === family)
      .slice()
      .sort((a, b) => {
        const ay = a.marriage_year == null ? 9999 : a.marriage_year;
        const by = b.marriage_year == null ? 9999 : b.marriage_year;
        if (ay !== by) return ay - by;
        return String(a.marriage_date || "").localeCompare(String(b.marriage_date || ""));
      });
    const collageHtml = collage
      ? `<figure class="portrait-collage">
           <img src="${esc(collage)}" alt="${esc(title)} — Portraits of Our Past" loading="lazy" />
           <figcaption>Portraits of Our Past</figcaption>
         </figure>`
      : "";
    const grid = items.map(renderCard).join("") || `<p class="muted">No portraits yet.</p>`;
    return `
      <section class="portrait-family" id="${esc(family)}">
        <div class="portrait-family-head">
          <h2>${esc(title)}</h2>
          <p>${esc(blurb)}</p>
        </div>
        ${collageHtml}
        <div class="portrait-grid">${grid}</div>
      </section>`;
  }

  function render() {
    const root = document.getElementById("app");
    root.innerHTML = `
      ${header()}
      <main class="wrap portraits-page">
        <div class="portraits-hero">
          <h1>Portraits</h1>
          <p>Marriage-chart portraits from the 2023 Marriages set. Click a photo or name to open that person.</p>
        </div>
        <nav class="portrait-jump">
          <a href="#baird">Baird &amp; Dun</a>
          <a href="#spicer">Spicer &amp; Starling</a>
        </nav>
        ${renderFamily("baird", "Baird & Dun", "Portraits tied to the Baird–Dun marriage chart.")}
        ${renderFamily("spicer", "Spicer & Starling", "Portraits tied to the Spicer–Starling marriage chart.")}
      </main>
      ${footer()}`;
    wireSearch();
  }

  render();
})();
