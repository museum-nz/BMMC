# BMMC Showcase — Full site guide

> Digital museum and New Zealand heritage hub: artifact catalog, photo / currency / stamp archives, NZ history maps, and interactive MTB trail tools. This file is the detailed agent-readable companion referenced by `llms.txt`.

Prefer this document for collection overview, page purpose, data sources, and workflows. Open HTML only when UI behaviour or live DOM details are required.

**Stack:** Static HTML/JS website. Navigation source of truth: `shared-nav.js`. Map helpers: `shared-map.js` (`window.BMMCMap`).

**Paths:** Site pages live under `main/`. Data and vendor assets are typically siblings (`../data`, `../vendor`) relative to pages.

---

## Shared infrastructure

### Navigation (`shared-nav.js`)

Menu / hub groups (exact labels):

1. **Primary Museum Wings** — Museum Showcase & Catalog, with children: Insights (`museum.html#stats`), Artifact Origin Map, Artifact Care & Restoration  
2. **Specialist Databases & Archives** — Historical Photo Archives; NZ Currency & Minting; NZ Stamp Archive (+ Philatelic Photo Map); Trimble NZ History Wall  
3. **NZ MTB & Cycle Trails** — MTB map; Friction-Drive Wedge-Lock Blueprint  
4. **NZ Historical Info Maps** — History; Railway; Maritime  
5. **On this day** (`menuOnly`) → `index.html#on-this-day`  
6. **Hub tools** (`menuOnly`) — Surprise Me (and related hub utilities)

Globals: `BMMC_BRANCHES`, `BMMC_PAGE_BRANCHES` (excludes `menuOnly`), drawer open/close, toast helper. Theme: `localStorage` keys `theme` / `bMMC_theme`.

### Data sources (Google Sheets)

Live catalog pages typically load published Google Sheets (PapaParse). Sheet gids used across the site:

| gid | wing / content |
|---|---|
| `1146027655` | Exhibits |
| `606568772` | Gramophone |
| `1741478537` | Gallery photos |
| `1362859267` | Stamps |
| `158483759` | Currency |
| `1659493611` | NZ History |
| `1351464718` | Trains |
| `596651309` | Maritime |

Master sheet id (exhibits / gramophone / gallery): `1U3V1JIatKpTOyAHEMnscs0mdZ4vDNf4C7eX_fuUbj_s`.  
Published 2PACX id (stamps / currency / history / trains / maritime): `2PACX-1vRa2_IODuuz5_h6b15Vc-8zHDbAR-pIBO08bE-c3SZliZhm6h_CSU9LLuStjjlfN6CYm3qksR4klwgy`.

### Shared map (`shared-map.js`)

Basemap switcher sources include Esri NatGeo / Topo / Imagery / Ocean, OSM street, Google / Hybrid, CARTO Voyager. Helpers for search-index related items, popups, saved-store, pill zoom scaling, reset-view, fit-popups.

---

## Hub — `index.html`

**Purpose:** Central spider hub; cross-wing search; On this day; Surprise Me.

**UI:** Menu drawer, brand “BMMC Hub”, hub search (“Search all wings…”), nexus “BMMC / Surprise / Core”, radial spoke clusters from `BMMC_PAGE_BRANCHES`, On this day panel under Primary, SVG conduit lines to section hubs (desktop width).

**Search:** Fuse.js when available; ≥2 characters; ~120 ms debounce; up to ~40 hits / ~8 per wing. Wing groupings include Museum, Stamps, Gallery, Oral history, NZ History, Railways, Maritime, Heritage. Index files: `../data/search_index.json` then `.js` (`window.SEARCH_INDEX`). Entries shaped like `{id,t,s,w,u,y,d}` (`d` = MM-DD for On this day).

**On this day:** Prefer dated history / trains / maritime / exhibit entries for today (or `?date=MM-DD`); else nearest within ~7 days. Deep link `#on-this-day`.

**Params / shortcuts:** `?surprise=1`, `?date=MM-DD`, Spacebar roulette when not typing in an input.

**Related HTML:** [index.html](index.html)

---

## Primary Museum Wings

### Museum Showcase & Catalog — `museum.html` (+ `app.js`)

**Purpose:** Main artifact + gramophone archive (title: “BMMC Showcase — Museum & Gramophone Archive”).

**UI highlights:** Wings / Browse / 3D / Hot / Surprise / Saved; Grid / Table / Photos; Collection Hubs (War, Photography, Survey, General, Documentation, Household, Collections, Gramophones “1916–1953”); detail modal (Save, Compare, Map, Listen, Google, Origin Map, Print Placard, 3D/AR, Docs); compare + Curator Pocket Passport; **Insights** at `#stats` (KPIs, charts, embedded origin map).

**Filters:** Eras, Types, Categories, Subcategories. Gramophone: Artist, Label, Format, Year. Sort: Default, Title A–Z/Z–A, Age oldest/newest.

**Eras:** Prehistory–1699; Victorian 1700–1913; WWI 1914–18; Interwar 1919–38; WWII 1939–45; Post & Cold War 1946–99; Millennium 2000–.

**Data:** Exhibits gid `1146027655`; Gramophone gid `606568772`. Optional links to Archive.org 78s, Discogs, YouTube.

**Deep links:** `?search|q|query|item=`, `?tab=gramophone|exhibits`, `#stats`, `#exhibit-N`, `#gramophone-N`. Map embed messaging: `MAP_READY`, `FOCUS_EXHIBIT`, `BMMC_OPEN_ITEM`.

**Related:** [museum.html](museum.html)

### Museum Artifact Origin Map — `2Dmap.html`

**Purpose:** World map of artifact manufacturing / origin locations with dual year timeline; embeddable in museum Insights.

**UI:** Search; basemap layers (Google, Satellite, Esri, Topo, NatGeo, Voyager); timeline play + dual year sliders; marker clusters; heat below ~zoom 6; photo markers.

**Controls:** Years roughly clamped 1600–2030; play advances years; keyboard Space / arrows. Default centre about `[-10, 135]` zoom 3.

**Data:** Same exhibits Sheet/CSV. Key fields include title, image, made, year, lat, lng. Drive thumbs via `lh3.googleusercontent.com`; Dropbox images often use `raw=1`.

**Related:** [2Dmap.html](2Dmap.html)

### Artifact Care & Restoration — `restoration-guide.html`

**Purpose:** Static conservation / field manual nested under Museum Showcase.

**Sections:** Safety & Patina; Metals (Silver / Brass / Iron); Hardwood & Finishes; Leather / Pewter / Cookware. Jump links; no CSV.

**Notable recipes (summary):** Silver washing-soda + foil basin; brass salt+vinegar; iron citric acid bath; beeswax/turps/carnauba wax mix; borer freeze or kerosene inject.

**Related:** [restoration-guide.html](restoration-guide.html)

---

## Specialist Databases & Archives

### Historical Photo Archives — `gallery.html`

**Purpose:** Historic photography plus Alan Starling WWII oral history.

**Hubs:** All; Alan War 1939–45; Dun & Bonniefields 1920s; Maitland East Chatton.

**UI:** Surprise, favorites, sort, category/era filters, photo modal (Share, Save, Listen TTS, Google, Search Museum). Alan audio ~53:11 with speeds 1.0 / 1.25 / 1.5 / 0.8× and chapter markers; cross-links to related museum objects.

**Data:** gid `1741478537`. Oral-history MP3 hosted externally (e.g. Dropbox raw URL).

**Related:** [gallery.html](gallery.html)

### NZ Currency & Minting — `currency.html`

**Purpose:** NZ coins ~1933–2026, banknote series 1–7, RBNZ Table F3 circulation context.

**Views:** Specimen / Gallery / Analytics. Collector inventory + wishlist + CSV export (`currency_collection_YYYY-MM-DD.csv`).

**Filters:** All; Pre-decimal; Decimal 1967–2006; Current; Series 1–7; Commemorative. Mintage explorer; F3 charts; £sd converter (£1=$2, 1s=10c, 1d≈5/6c); basket CPI (embedded series + optional `data/cpi_nz.csv`).

**Data:** gid `158483759` — unified sheet/CSV with sections for catalogue metadata, predecimal/decimal mintages, banknote print runs, F3 LSD/decimal. Collection store e.g. `bMMC_user_currency_collection_v1`.

**Related:** [currency.html](currency.html)

### NZ Stamp Archive (StampsNZ) — `stamps.html`

**Purpose:** NZ philatelic catalogue with valuations and identifier tools.

**UI:** Identifier wizard; All Stamps; Stamp Map link; Analytics; Random; Valuation; Grid / Ledger / Gallery; infinite scroll (~36/batch).

**Filters:** Eras 1855–1901 … 2000–; year slider 1855–2026; FU price ladder; location; format; ~19 categories. Sort by relevance / year / subject / MUH / FU. Identifier: Shape → Inscription → Denom/colour → Apply.

**Data:** gid `1362859267`. Saved varieties map; export CSV/JSON valuations.

**Related:** [stamps.html](stamps.html)

### Philatelic Photo Map — `2Dmap_stamps.html`

**Purpose:** Stamp issue locations on a NZ-centred map (keyword geocode via `nz_places.js` + regional nodes + jitter).

**UI:** Basemaps similar to artifact origin map; timeline default 1855–2026; play step 1–2 years; centre Wellington `[-41.2865, 174.7762]` zoom ~6. Popup can deep-link `stamps.html?q=`. Params: `?search|q`, `?year=` (±5), `?title|id`.

**Related:** [2Dmap_stamps.html](2Dmap_stamps.html)

### Trimble NZ History Wall — `trimble.html`

**Purpose:** Interactive Trimble New Zealand #HISTORYWALL archive (~1978–2018).

**Tabs:** The History Wall; 40 Years & Milestones; What Was Made in NZ; NZ Acquisitions; 2011 Quake & Rebuild; Leadership; Heritage Quiz (~6 questions).

**Controls:** Era pills All / 1978–87 / 88–97 / 98–07 / 08–18; search; canvas pan/zoom; Fly Camera to Wall.

**Data:** Mostly hardcoded (wall bands / products / people / quiz). Wall image from Drive or local asset filenames such as `trimble40historywall.jpg` / `wallchart.jpg`.

**Related:** [trimble.html](trimble.html)

---

## NZ MTB & Cycle Trails

### NZ MTB & Cycle Trails — `mtb.html` (+ `mtb-nav.js`)

**Purpose:** Aotearoa NZ mountain bike & cycle trail Leaflet map with recording, import, elevation, and navigation aids.

**UI:** Search; Layers; Saved; Import Track; Find Me; Navigate; Record; Wings. Basemaps Hist / Topo / Sat; Windy wind panel; Ride density heat; grade filter; dataset toggles; Trail Key; Advisory; elevation drawer (PNG / CSV / 3D GPX export).

**Grades:** All; 1; 2; 3; 4; 5/6.

**Import formats:** `.gpx`, `.kml`, `.kmz` (unzip via `fflate`), `.geojson`, `.json` (multi-file). Imported / recorded tracks styled pink (`#ff2d87`).

**Navigation (`mtb-nav.js`):** Long-press ~550 ms → Navigate here / Follow nearest trail / Open in Google Maps / Cancel. Arrive radius ~25 m; look-ahead ~60 m; default ETA speed ~15 km/h.

**Map defaults:** Centre `[-41.5, 172.8]`, zoom ~5–6, NZ-ish max bounds.

#### Trail `DATASETS` keys

| key | UI label | colour | typical GeoJSON |
|---|---|---|---|
| `great_rides` | NZ Great Rides | `#9333ea` | `nz_great_rides.geojson` |
| `chch_cycle` | CCC Major Cycleways | `#38bdf8` | `chch_cycleway.geojson` |
| `heartland` | Heartland Touring | `#0ea5e9` | `heartland_touring.geojson` |
| `chch_council` | CCC MTB & Hills | `#059669` | `chch_council_tracks.geojson` |
| `nz_osm` | NZ OSM MTB | `#1d4ed8` | `nz_osm.geojson` |
| `cap_plus` | CAP & Adventure Park+ | `#4ade80` | `CAP_plus.geojson` |
| `doc_tracks` | DOC Tracks | `#15803d` | `doc_tracks.geojson` |

Online fallbacks include Dropbox and ArcGIS Feature Services for several layers (Great Rides / Heartland via TIO, CCC open data, DOC tracks). Elevation sampling may use Open-Meteo.

**Related:** [mtb.html](mtb.html)

### Friction-Drive Wedge-Lock Blueprint — `Interactive_Friction-Drive_Wedge-Lock_Blueprint.html`

**Purpose:** Interactive kinematic SVG simulator for a **Method B** self-wedging friction-drive U-bracket (roller on ~706 mm bicycle wheel; ~83 mm roller; ~75 mm arm). Listed under the MTB section in the hub/menu.

**Kinematic cycle (simulator order):**

1. **Magnetic Park (~58°)** — roller lifts ~37.5 mm clear; rear-catch against twin Ø15×1.5 mm neodymium magnets  
2. **Rest Tangent (~18.7°)** — exact tangency (~394.5 mm centres); light spring holds contact  
3. **Self-Wedging (~16.2° / &lt; rest)** — forward drive → rearward traction reaction increases normal grip  
4. **M5 Wedge-Lock (~13.7°)** — ~2 mm bite limit; stop pad meets M5 bolt in ±3 mm fore-aft slot  

**Controls:** Arm angle ~13.66–58°; M5 slot ±3 mm; motor torque 0–6 N·m; RPM 0–4000; wheel 0–50 km/h; parametric OD / roller / arm / platform / pivot offsets; views Drive Zone / Full Wheel / Lock Zoom; bracket variants (e.g. 6061-T6 vs CF-PETG); callouts 1–7; force-balance curve; pivot stack-up (~64 mm internal). Export e.g. `method-b-u-bracket-spec.json`.

**Data:** Inline geometry / theory only.

**Related:** [Interactive_Friction-Drive_Wedge-Lock_Blueprint.html](Interactive_Friction-Drive_Wedge-Lock_Blueprint.html)

---

## NZ Historical Info Maps

### Aotearoa NZ History Map — `nz_history.html`

**Purpose:** Dated NZ history events on a Leaflet map with optional OSM heritage layer.

**Eras:** All ~1280–2026; Early Contact &lt;1840; Pioneer Ships 1840–55; Wars & Gold 1855–90; Troops to Wars 1890–1945; Modern 1945–. Timeline play (~+4 years / tick).

**Data:** gid `1659493611` (id, year, date, headline, category, location, lat, lng, details, image_url, source_url — on the order of ~270 rows). Optional heritage GeoJSON / `osm_heritage.js`. Feeds Hub **On this day**.

**Related:** [nz_history.html](nz_history.html)

### Aotearoa NZ Railway Map — `trains.html`

**Purpose:** Railway milestones + network GeoJSON + optional OpenRailwayMap tiles.

**Eras:** All ~1862–2026; Pioneers & Vogel 1862–1908; Main Trunk 1908–45; Diesel & Ferry 1945–82; Deregulation 1982–2004; KiwiRail 2004–2026. Play ~+3 years / tick.

**Layers:** Historic Networks; Bush & Mining Tramways; Viaducts & Tunnels; Active Rails (ORM); Stations Regional / Active / Heritage.

**Data:** gid `1351464718`. Historic rail networks + main trunk/stations GeoJSON; additional bush/infrastructure layers; embedded stations list. ORM tiles from OpenRailwayMap when online.

**Related:** [trains.html](trains.html)

### Aotearoa NZ Maritime & Coastal Map — `maritime.html`

**Purpose:** Editorial + map archive: Mosquito Fleet, shipwrecks, lighthouses, whaling, colonization.

**Filters:** All / Disasters / Salvages / Lighthouses / Whaling / Ports / Colonization / Saved. Basemaps Topo / Sat / Ocean; OpenSeaMap; illustrative ocean paths; harbour jumps (e.g. Wellington / Auckland / Bluff). No year timeline scrubber like history/trains.

**Data:** gid `596651309` (~150 rows, years spanning ~1809–2011). Stamp cross-link example: `stamps.html?cats=Life%20Insurance%20(Lighthouse)`.

**Related:** [maritime.html](maritime.html)

---

## Cross-cutting notes for agents

- **Vendor fallbacks:** Leaflet, PapaParse, Fuse, etc. often load from `../vendor/` with CDN `onerror` fallbacks.  
- **Deep-link hygiene:** Some older map/gallery “open exhibit” links may still point at `index.html#exhibit-N`; handlers primarily live on `museum.html`.  
- **Surprise Me:** Hub nexus / menu action / `index.html?surprise=1` opens a random spoke card destination.  
- **Theme:** Light default; dark via `html.dark` and shared `localStorage` theme keys.

## Quick HTML index

| Page | File |
|---|---|
| Hub | [index.html](index.html) |
| Museum | [museum.html](museum.html) |
| Origin map | [2Dmap.html](2Dmap.html) |
| Restoration | [restoration-guide.html](restoration-guide.html) |
| Gallery | [gallery.html](gallery.html) |
| Currency | [currency.html](currency.html) |
| Stamps | [stamps.html](stamps.html) |
| Stamp map | [2Dmap_stamps.html](2Dmap_stamps.html) |
| Trimble | [trimble.html](trimble.html) |
| MTB | [mtb.html](mtb.html) |
| Friction-drive blueprint | [Interactive_Friction-Drive_Wedge-Lock_Blueprint.html](Interactive_Friction-Drive_Wedge-Lock_Blueprint.html) |
| NZ History | [nz_history.html](nz_history.html) |
| Trains | [trains.html](trains.html) |
| Maritime | [maritime.html](maritime.html) |
