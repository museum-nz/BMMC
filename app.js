// app.js — BMMC Showcase Application Logic (Modular Dual-Mode with WebAR, Curator Passport & Multi-Wing Engine)

// ==========================================================================
// 1. Configuration & Global State
// ==========================================================================
const IS_LOCAL_ENV = window.location.protocol === 'file:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

const REMOTE_EXHIBITS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1U3V1JIatKpTOyAHEMnscs0mdZ4vDNf4C7eX_fuUbj_s/export?format=csv&gid=1146027655';
const REMOTE_GRAMOPHONE_CSV_URL = 'https://docs.google.com/spreadsheets/d/1U3V1JIatKpTOyAHEMnscs0mdZ4vDNf4C7eX_fuUbj_s/export?format=csv&gid=606568772';
const REMOTE_GALLERY_CSV_URL = 'https://docs.google.com/spreadsheets/d/1U3V1JIatKpTOyAHEMnscs0mdZ4vDNf4C7eX_fuUbj_s/export?format=csv&gid=1741478537';

const LOCAL_EXHIBITS_CSV_URL = './data/exhibits.csv';
const LOCAL_GRAMOPHONE_CSV_URL = './data/gramophone.csv';
const LOCAL_GALLERY_CSV_URL = './data/gallery.csv';

const NO_IMAGE_SVG = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23f1f5f9%22%20width%3D%22400%22%20height%3D%22300%22%20%2F%3E%3Ctext%20fill%3D%22%2394a3b8%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E';

const MAIN_HUB_CATEGORIES = ["War", "Photography", "Survey", "General", "Documentation", "Household", "Collections"];

const HUB_CUSTOM_IMAGES = {
  "War": "https://lh3.googleusercontent.com/d/1MPsC_RvHj1FoYs9qY1uszeKAD8nJjnCl=s200",
  "Photography": "https://lh3.googleusercontent.com/d/1wG9HuJovMcF0FV_rucdU2D9Bo0-XBBdm=s200",
  "Survey": "https://lh3.googleusercontent.com/d/1ynhpt7nlIWCEaE-VGQ0xqvT8LPR4YEU2=s200",
  "General": "https://lh3.googleusercontent.com/d/1yYyeT3Gdf0CFJCdAUBHhr0oYNxmKlxv5=s200",
  "Documentation": "https://lh3.googleusercontent.com/d/1VHPNsMSdCsWTL3bjOJ1haOSwV0_1hOgx=s200",
  "Household": "https://lh3.googleusercontent.com/d/1YpCxkPq6yCiVK-lNBDHC4qbI-ypmuGJ-=s200",
  "Collections": "https://lh3.googleusercontent.com/d/1cJOXAc-8l8J9R1NXt9P-wKbtxHcAjlvC=s200"
};

const TIMELINE_CUSTOM_IMAGES = {
  "Prehistory": "https://lh3.googleusercontent.com/d/1P2FMOTE6v8UeOowUc6OTq-B6OpmqnXMm=s200",
  "Victorian": "https://lh3.googleusercontent.com/d/1yzhHrM_yEJFpFrQgCSpWTNo1PIrfX65C=s200",
  "WWI": "https://lh3.googleusercontent.com/d/1MPsC_RvHj1FoYs9qY1uszeKAD8nJjnCl=s200",
  "Interwar": "https://lh3.googleusercontent.com/d/1cswXC3Ia74sbjpUpGTRuPr6yGIAk1Ec2=s200",
  "WWII": "https://lh3.googleusercontent.com/d/1EoNqpgXzJoT6g8xsl2hPp9CBloibQEB0=s200",
  "Post War": "https://lh3.googleusercontent.com/d/1BLA99VbyIAhyBgcAjOl-VLUHv9Tpy1bE=s200",
  "Modern": "https://lh3.googleusercontent.com/d/1Eez4R63VdHFSWnVNBqaWiBH_2SrhNrnF=s200",
  "Items of interest": "https://lh3.googleusercontent.com/d/1mNQ9DZlCobUg1C25JwRlJj_hUxCrWDXf=s200"
};

const CATEGORY_PALETTE = {
  war: { hex: '#C85A32', text: '#FFFFFF', name: 'War' },
  photography: { hex: '#3B7A57', text: '#FFFFFF', name: 'Photography' },
  survey: { hex: '#B57C1E', text: '#FFFFFF', name: 'Survey' },
  general: { hex: '#3182CE', text: '#FFFFFF', name: 'General' },
  documentation: { hex: '#708259', text: '#FFFFFF', name: 'Documentation' },
  household: { hex: '#20807E', text: '#FFFFFF', name: 'Household' },
  collections: { hex: '#4A5568', text: '#FFFFFF', name: 'Collections' },
  gramophones: { hex: '#D99B43', text: '#0F172A', name: 'Gramophones' }
};

const SUBCAT_PALETTE = ['#0284c7', '#059669', '#d97706', '#7c3aed', '#db2777', '#2563eb', '#0891b2', '#ca8a04', '#e11d48', '#4f46e5'];

const TIMELINE_ERAS = [
  { key: 'Prehistory', short: 'Prehistory', full: 'Prehistory / BC (Up to 1699)', min: -9999, max: 1699 },
  { key: 'Victorian', short: 'Victorian', full: 'Victorian & Industrial (1700–1913)', min: 1700, max: 1913 },
  { key: 'WWI', short: 'WWI', full: 'World War I (1914–1918)', min: 1914, max: 1918 },
  { key: 'Interwar', short: 'Interwar', full: 'Interwar / 1920s–1930s (1919–1938)', min: 1919, max: 1938 },
  { key: 'WWII', short: 'WWII', full: 'World War II (1939–1945)', min: 1939, max: 1945 },
  { key: 'Post War', short: 'Post War', full: 'Post & Cold War (1946–1999)', min: 1946, max: 1999 },
  { key: 'Modern', short: 'Modern', full: 'Millennium & Modern (2000–Present)', min: 2000, max: 9999 }
];

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
let currentTab = 'exhibits';
let catalogViewMode = localStorage.getItem('bMMC_view_mode') || 'grid';
let tableSortCol = null;
let tableSortDir = 'asc';
let compareItemIndices = new Set();
let restoredSessionFilters = {};

let isMapIframeReady = false;
let pendingMapExhibitIndex = null;

let rawExhibitsRows = [];
let rawGramophoneRows = [];
let catalog3DMap = new Map();
let hotItemSet = new Set();
let currentFilteredRows = [];
let currentModalIndex = -1;
let currentlySpeakingIndex = null;
let only3DActive = false;
let hotOnlyActive = false;
let showingFavoritesOnly = false;
let isGridActive = false;
let is3DSkyboxLight = false;
let isPoppyMotionActive = false;
let currentSpeechUtterance = null;
let availableVoices = [];

let colIdx = { id: 0, ref: 1, title: 2, notes: 4, itemNoM: 12, age: 13, type: 14, category: 15, subcategory: 16, d3d: 17, doc: 18, web: 19, img1: 20, img2: 21, qty: 22, made: 23, year: 24, hot: 25, lat: 26, lng: 27 };
let chartStackedInstance = null;
let chartLocationsInstance = null;
let chartSubcatCategoryInstance = null;
let fuseExhibits = null;
let fuseGramophone = null;

const CHART_PALETTE = ['#C85A32', '#3B7A57', '#B57C1E', '#3182CE', '#708259', '#20807E', '#4A5568', '#D99B43', '#7c3aed', '#db2777'];

// ==========================================================================
// 2. Audio Speech Narration & Utilities
// ==========================================================================
function stopAudioGuide() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentlySpeakingIndex = null;
  currentSpeechUtterance = null;
  updateAudioUI();
}

function speakAudioGuide(rowIndex, event) {
  if (event) event.stopPropagation();

  if (currentlySpeakingIndex === rowIndex && window.speechSynthesis && window.speechSynthesis.speaking) {
    stopAudioGuide();
    return;
  }

  const row = rawExhibitsRows[rowIndex];
  if (!row) return;

  const notes = getVal(row, colIdx.notes);
  const rawContent = getVal(row, colIdx.title) || getVal(row, colIdx.id);
  const { title, details } = parseTitleAndDetails(rawContent);
  const textToSpeak = notes ? notes.replace(/^#\s*/, '') : (details || title);

  if (!textToSpeak) {
    showToast('No museum notes available to read', 'ℹ️');
    return;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentlySpeakingIndex = rowIndex;
    currentSpeechUtterance = new SpeechSynthesisUtterance(unescapeHTML(textToSpeak));
    const chosenVoice = getSelectedVoice();
    if (chosenVoice) currentSpeechUtterance.voice = chosenVoice;
    currentSpeechUtterance.rate = 0.94;
    currentSpeechUtterance.pitch = 1.0;

    currentSpeechUtterance.onend = () => {
      currentlySpeakingIndex = null;
      updateAudioUI();
    };
    currentSpeechUtterance.onerror = () => {
      currentlySpeakingIndex = null;
      updateAudioUI();
    };

    window.speechSynthesis.speak(currentSpeechUtterance);
    updateAudioUI();
  }
}

function updateAudioUI() {
  const isSpeaking = window.speechSynthesis && window.speechSynthesis.speaking;

  document.querySelectorAll('[data-grid-audio-idx]').forEach(btn => {
    const idx = parseInt(btn.getAttribute('data-grid-audio-idx'), 10);
    if (currentlySpeakingIndex === idx && isSpeaking) {
      btn.classList.add('bg-blue-600', 'text-white', 'animate-pulse');
      btn.classList.remove('bg-white/90', 'dark:bg-slate-800/90', 'text-blue-600', 'dark:text-blue-400');
      btn.innerHTML = '<span class="flex items-center gap-0.5 text-[10px]">🔊 <span class="eq-bar"></span><span class="eq-bar"></span></span>';
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'animate-pulse');
      btn.classList.add('bg-white/90', 'dark:bg-slate-800/90', 'text-blue-600', 'dark:text-blue-400');
      btn.innerHTML = '🔊';
    }
  });

  const modalBtn = document.getElementById('btnAudioGuide');
  if (modalBtn) {
    const origIdx = parseInt(modalBtn.getAttribute('data-row'), 10);
    if (currentlySpeakingIndex === origIdx && isSpeaking) {
      modalBtn.innerHTML = '<span class="flex items-center gap-1"><span class="eq-bar"></span><span class="eq-bar"></span> Stop</span>';
      modalBtn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
      modalBtn.classList.add('bg-rose-600', 'hover:bg-rose-500');
    } else {
      modalBtn.innerHTML = '🔊 Listen';
      modalBtn.classList.remove('bg-rose-600', 'hover:bg-rose-500');
      modalBtn.classList.add('bg-blue-600', 'hover:bg-blue-500');
    }
  }
}

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  availableVoices = voices.filter(v => v.lang.startsWith('en'));
  const keywords = ['natural', 'neural', 'enhanced', 'premium', 'google', 'online', 'siri', 'edge'];
  availableVoices.sort((a, b) => {
    const aScore = keywords.some(k => a.name.toLowerCase().includes(k)) ? 1 : 0;
    const bScore = keywords.some(k => b.name.toLowerCase().includes(k)) ? 1 : 0;
    return bScore - aScore;
  });
  populateVoiceDropdown();
}

function getSelectedVoice() {
  if (availableVoices.length === 0) return null;
  const savedName = localStorage.getItem('bMMC_selectedVoiceName');
  if (savedName) {
    const found = availableVoices.find(v => v.name === savedName);
    if (found) return found;
  }
  return availableVoices[0];
}

function populateVoiceDropdown() {
  const select = document.getElementById('voiceSelect');
  if (!select) return;
  select.innerHTML = '';
  const currentVoice = getSelectedVoice();

  availableVoices.forEach(voice => {
    const opt = document.createElement('option');
    opt.value = voice.name;
    const isNatural = ['natural', 'neural', 'enhanced', 'premium', 'google', 'online', 'siri', 'edge'].some(k => voice.name.toLowerCase().includes(k));
    opt.textContent = `${voice.name} ${isNatural ? '✨' : ''}`;
    if (currentVoice && currentVoice.name === voice.name) opt.selected = true;
    select.appendChild(opt);
  });

  select.onchange = function() {
    localStorage.setItem('bMMC_selectedVoiceName', this.value);
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      const btnModal = document.getElementById('btnAudioGuide');
      if (btnModal && btnModal.getAttribute('data-row')) speakAudioGuide(parseInt(btnModal.getAttribute('data-row'), 10));
    }
  };
}

if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

// ==========================================================================
// 3. Theme Initialization & Cross-Tab Broadcast
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || localStorage.getItem('bMMC_theme');
  const isDark = (savedTheme === 'dark');
  if (isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  updateThemeUI(isDark);
}

function updateThemeUI(isDark) {
  const icon = document.getElementById('themeToggleIcon');
  const text = document.getElementById('themeToggleText');
  if (icon && text) { icon.textContent = isDark ? '☀️' : '🌙'; text.textContent = 'Mode'; }
  if (currentTab === 'stats' && rawExhibitsRows.length > 0) renderMuseumStatistics();
  else if (isGridActive) filterCatalog(true);
}

window.addEventListener('storage', (e) => {
  if (e.key === 'theme' || e.key === 'bMMC_theme') {
    const isDark = (e.newValue === 'dark');
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    updateThemeUI(isDark);
  }
});

// ==========================================================================
// 4. Multi-Page Curator Passport Booklet & Placard Print Engine
// ==========================================================================
function printCuratorPocketPassport() {
  const placard = document.getElementById('printablePlacard');
  if (!placard) return;

  if (compareItemIndices.size === 0) {
    showToast('Select artifacts to include in the Passport first', 'ℹ️');
    return;
  }

  const items = Array.from(compareItemIndices).map(idx => ({
    originalIndex: idx,
    row: rawExhibitsRows[idx]
  })).filter(i => i.row);

  const originalDocTitle = document.title;
  document.title = `BMMC-Curator-Passport-Booklet-${new Date().toISOString().slice(0, 10)}`;

  let pagesHTML = `
    <div class="passport-cover">
      <div style="font-size: 36px; margin-bottom: 8px;">🏛️ 📘</div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #1e40af; font-weight: 900;">Bonniefields Museum Collection</div>
      <h1 style="margin: 6px 0 10px 0; font-size: 24px; font-weight: 900; color: #0f172a;">Curator Field Passport & Comparison Dossier</h1>
      <p style="margin: 0 0 14px 0; font-size: 11px; color: #475569;">Official field dossier and provenance verification booklet containing ${items.length} cataloged artifacts.</p>
      
      <div style="display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; font-size: 10px; font-weight: 700; color: #334155; margin-bottom: 14px;">
        Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; BMMC Conservation Archive
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 9.5px; color: #64748b; text-align: left;">
        <p style="margin: 0 0 6px 0; font-weight: 800; color: #1e293b;">Catalog Index Manifest:</p>
        <ul style="margin: 0; padding-left: 18px; line-height: 1.6;">
          ${items.map(item => {
            const rTitle = parseTitleAndDetails(getVal(item.row, colIdx.title) || getVal(item.row, colIdx.id)).title;
            const rItemNo = getVal(item.row, colIdx.itemNoM) || getVal(item.row, colIdx.id) || `#${item.originalIndex + 1}`;
            return `<li><strong>REF ${escapeHTML(rItemNo)}</strong>: ${escapeHTML(rTitle)}</li>`;
          }).join('')}
        </ul>
      </div>
    </div>
  `;

  items.forEach(({ originalIndex, row }, pageIdx) => {
    const rawContent = getVal(row, colIdx.title) || getVal(row, colIdx.id);
    const { title, details } = parseTitleAndDetails(rawContent);
    const cleanTitle = title || `Artifact #${originalIndex + 1}`;
    const notes = getVal(row, colIdx.notes);
    const age = getVal(row, colIdx.age);
    const era = getEraByRow(row);
    const eraDisplay = era ? era.short : age;
    const category = getVal(row, colIdx.category);
    const subcategory = getVal(row, colIdx.subcategory);
    const type = getVal(row, colIdx.type);
    const made = getVal(row, colIdx.made);
    const year = getVal(row, colIdx.year);
    const itemNo = getVal(row, colIdx.itemNoM) || getVal(row, colIdx.id) || `#${originalIndex + 1}`;
    const ddoc = getVal(row, colIdx.doc);
    const dweb = getVal(row, colIdx.web);
    const d3d = get3DUrlForItem(row);
    const { img1, img2 } = getImagesForItem(row);
    const fullImg1 = formatGoogleLh3Url(img1, 's800');
    const fullImg2 = formatGoogleLh3Url(img2, 's600');
    const directUrl = `${window.location.origin}${window.location.pathname}#exhibit-${originalIndex}`;

    pagesHTML += `
      <div class="passport-leaf">
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">
              BMMC Passport Leaf &bull; Leaf ${pageIdx + 1} of ${items.length}
            </div>
            <h2 style="margin: 2px 0 0 0; font-size: 15px; font-weight: 900; color: #0f172a; line-height: 1.2;">
              ${escapeHTML(cleanTitle)}
            </h2>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 10.5px; font-family: monospace; font-weight: 900; background: #0f172a; color: #ffffff; padding: 2px 7px; border-radius: 4px;">
              REF ${escapeHTML(itemNo)}
            </span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
          ${fullImg1 ? `
            <div class="passport-img-box" style="flex: 1; position: relative;">
              <img src="${fullImg1}" alt="Primary View" />
              <span style="position: absolute; bottom: 3px; left: 3px; background: rgba(15,23,42,0.8); color: #fff; font-size: 7.5px; padding: 1px 4px; border-radius: 3px; font-weight: 700;">Image 1</span>
            </div>` : ''}
          ${fullImg2 ? `
            <div class="passport-img-box" style="flex: 1; position: relative;">
              <img src="${fullImg2}" alt="Secondary View" />
              <span style="position: absolute; bottom: 3px; left: 3px; background: rgba(15,23,42,0.8); color: #fff; font-size: 7.5px; padding: 1px 4px; border-radius: 3px; font-weight: 700;">Image 2 (Alt Angle)</span>
            </div>` : ''}
        </div>

        <div class="passport-specs-grid">
          <div><strong>Historical Era:</strong><br>${escapeHTML(eraDisplay || '—')}</div>
          <div><strong>Date / Period:</strong><br>${escapeHTML(year || '—')}</div>
          <div><strong>Origin / Made:</strong><br>${escapeHTML(made || '—')}</div>
          <div><strong>Category:</strong><br>${escapeHTML(category || '—')}</div>
          <div><strong>Type:</strong><br>${escapeHTML(type || '—')}</div>
          <div><strong>Subcategory:</strong><br>${escapeHTML(subcategory || '—')}</div>
        </div>

        ${notes ? `
          <div class="passport-notes-box">
            <div style="font-weight: 900; text-transform: uppercase; font-size: 8px; color: #b45309; margin-bottom: 2px;">Curator Provenance Notes:</div>
            <p style="margin: 0; line-height: 1.4; white-space: pre-line;">${escapeHTML(notes.replace(/^#\s*/, ''))}</p>
          </div>
        ` : ''}

        ${details ? `
          <div style="margin-bottom: 8px; font-size: 9.5px; color: #334155; line-height: 1.4;">
            <div style="font-weight: 800; text-transform: uppercase; font-size: 8px; color: #64748b; margin-bottom: 2px;">Physical Description & Specs:</div>
            <p style="margin: 0; white-space: pre-line;">${escapeHTML(cleanDetailsForModal(details))}</p>
          </div>
        ` : ''}

        <div style="border-top: 1px dashed #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #475569;">
          <div>
            ${ddoc ? `<span>📄 Doc: ${escapeHTML(ddoc)}</span> &bull; ` : ''}
            ${dweb ? `<span>🌐 Web: ${escapeHTML(dweb)}</span> &bull; ` : ''}
            ${d3d ? `<span>📱 3D Model: Available</span> &bull; ` : ''}
            <span>Index Ref #${originalIndex + 1}</span>
          </div>
          <div style="font-family: monospace; font-weight: 700; color: #0284c7;">
            ${directUrl}
          </div>
        </div>
      </div>
    `;
  });

  placard.innerHTML = pagesHTML;

  const cleanupAfterPrint = () => {
    document.title = originalDocTitle;
    window.removeEventListener('afterprint', cleanupAfterPrint);
  };
  window.addEventListener('afterprint', cleanupAfterPrint);

  setTimeout(() => {
    window.print();
    setTimeout(cleanupAfterPrint, 2500);
  }, 120);
}

function printMuseumPlacard(row, originalIndex) {
  const placard = document.getElementById('printablePlacard');
  if (!placard || !row) return;

  const rawContent = getVal(row, colIdx.title) || getVal(row, colIdx.id);
  const { title, details } = parseTitleAndDetails(rawContent);
  const cleanTitle = title || `Exhibit Item ${originalIndex + 1}`;
  const notes = getVal(row, colIdx.notes);
  const age = getVal(row, colIdx.age);
  const era = getEraByRow(row);
  const eraDisplay = era ? era.short : age;
  const category = getVal(row, colIdx.category);
  const subcategory = getVal(row, colIdx.subcategory);
  const type = getVal(row, colIdx.type);
  const made = getVal(row, colIdx.made);
  const year = getVal(row, colIdx.year);
  const itemNo = getVal(row, colIdx.itemNoM) || getVal(row, colIdx.id) || `#${originalIndex + 1}`;
  const { img1, img2 } = getImagesForItem(row);
  const fullImg1 = formatGoogleLh3Url(img1, 's800');
  const fullImg2 = formatGoogleLh3Url(img2, 's600');

  const currentUrl = `${window.location.origin}${window.location.pathname}#exhibit-${originalIndex}`;
  const originalDocTitle = document.title;
  const cleanItemRef = String(itemNo).replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanFileNameTitle = cleanTitle.replace(/[^a-zA-Z0-9\s_-]/g, '').trim().substring(0, 40);
  document.title = `BMMC Placard - ${cleanItemRef || 'Item'} - ${cleanFileNameTitle}`;

  placard.innerHTML = `
    <div class="placard-card">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h4 style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #475569; font-weight: 800;">Bonniefields Museum Collection</h4>
          <h1 style="margin: 3px 0 0 0; font-size: 18px; font-weight: 900; color: #0f172a; line-height: 1.2;">${cleanTitle}</h1>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; font-weight: 800; background: #0f172a; color: #ffffff; padding: 2px 7px; border-radius: 4px;">Ref ${itemNo}</span>
        </div>
      </div>

      <div style="display: flex; gap: 14px; margin-bottom: 12px;">
        ${fullImg1 ? `<div style="width: 170px; height: 130px; flex-shrink: 0; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 6px; overflow: hidden;"><img src="${fullImg1}" style="max-width: 100%; max-height: 100%; object-fit: contain;" /></div>` : ''}
        ${fullImg2 ? `<div style="width: 110px; height: 130px; flex-shrink: 0; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 6px; overflow: hidden;"><img src="${fullImg2}" style="max-width: 100%; max-height: 100%; object-fit: contain;" /></div>` : ''}
        <div style="flex: 1; font-size: 10.5px; line-height: 1.5; color: #334155;">
          ${eraDisplay ? `<p style="margin: 0 0 3px 0;"><strong>Historical Era:</strong> ${eraDisplay}</p>` : ''}
          ${year ? `<p style="margin: 0 0 3px 0;"><strong>Date / Period:</strong> ${year}</p>` : ''}
          ${made ? `<p style="margin: 0 0 3px 0;"><strong>Origin / Location:</strong> ${made}</p>` : ''}
          ${category ? `<p style="margin: 0 0 3px 0;"><strong>Category:</strong> ${category} ${subcategory ? `&bull; ${subcategory}` : ''}</p>` : ''}
          ${type ? `<p style="margin: 0 0 3px 0;"><strong>Type:</strong> ${type}</p>` : ''}
        </div>
      </div>

      ${notes ? `
        <div style="background: #f8fafc; border-left: 3px solid #0284c7; padding: 8px 12px; margin-bottom: 10px;">
          <h5 style="margin: 0 0 3px 0; font-size: 9.5px; text-transform: uppercase; letter-spacing: 1px; color: #0284c7; font-weight: 800;">Curator's Notes</h5>
          <p style="margin: 0; font-size: 10.5px; color: #1e293b; line-height: 1.45; white-space: pre-line;">${notes.replace(/^#\s*/, '')}</p>
        </div>
      ` : ''}

      ${details ? `
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; font-size: 10.5px; color: #475569; line-height: 1.45; white-space: pre-line;">${cleanDetailsForModal(details)}</p>
        </div>
      ` : ''}

      <div style="border-top: 1px dashed #94a3b8; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #64748b;">
        <span>BMMC Catalog &bull; Archive Reference System</span>
        <span>${currentUrl}</span>
      </div>
    </div>
  `;

  const cleanupAfterPrint = () => {
    document.title = originalDocTitle;
    window.removeEventListener('afterprint', cleanupAfterPrint);
  };
  window.addEventListener('afterprint', cleanupAfterPrint);

  setTimeout(() => {
    window.print();
    setTimeout(cleanupAfterPrint, 2000);
  }, 100);
}

// ==========================================================================
// 5. Data Helpers, Cleaners & Resolvers
// ==========================================================================
function safeReplaceState(urlStr) {
  try { window.history.replaceState(null, '', urlStr); } catch (e) {}
}

function parseCoord(val) {
  if (!val) return NaN;
  const clean = String(val).trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(clean)) return NaN;
  const num = parseFloat(clean);
  return (isNaN(num) || num === 0) ? NaN : num;
}

function getEraByYear(yearNum) {
  if (yearNum === null || yearNum === undefined || isNaN(yearNum)) return null;
  return TIMELINE_ERAS.find(e => yearNum >= e.min && yearNum <= e.max) || null;
}

function getEraByRow(row) {
  if (!row) return null;
  const yearStr = getVal(row, colIdx.year);
  if (!yearStr) return null;
  const match = yearStr.match(/-?\d+/);
  if (match) {
    const year = parseInt(match[0], 10);
    return getEraByYear(year);
  }
  return null;
}

function getCategoryTheme(str) {
  if (!str) return CATEGORY_PALETTE.general;
  const s = String(str).toLowerCase().trim();
  if (s.includes('war')) return CATEGORY_PALETTE.war;
  if (s.includes('photo') || s.includes('camera')) return CATEGORY_PALETTE.photography;
  if (s.includes('survey')) return CATEGORY_PALETTE.survey;
  if (s.includes('doc')) return CATEGORY_PALETTE.documentation;
  if (s.includes('house')) return CATEGORY_PALETTE.household;
  if (s.includes('collection')) return CATEGORY_PALETTE.collections;
  if (s.includes('gramophone') || s.includes('record') || s.includes('audio')) return CATEGORY_PALETTE.gramophones;
  return CATEGORY_PALETTE.general;
}

function createCategoryBadge(label, kind = 'category') {
  if (!label) return '';
  const theme = getCategoryTheme(label);
  if (kind === 'category') {
    return `<span class="px-2 py-0.5 rounded-full font-black text-[10px] shadow-sm inline-block tracking-wide" style="background-color: ${theme.hex}; color: ${theme.text};">${label}</span>`;
  } else if (kind === 'type' || kind === 'Type') {
    return `<span class="px-2 py-0.5 rounded-full font-extrabold text-[10px] shadow-sm inline-block tracking-wide border" style="background-color: ${theme.hex}18; color: ${theme.hex}; border-color: ${theme.hex}80;">${kind === 'Type' ? 'Type: ' : ''}${label}</span>`;
  } else {
    return `<span class="px-2 py-0.5 rounded-full font-extrabold text-[10px] shadow-sm inline-block tracking-wide border" style="background-color: ${theme.hex}25; color: ${theme.hex}; border-color: ${theme.hex}aa;">${kind === 'Subcategory' ? 'Subcategory: ' : ''}${label}</span>`;
  }
}

function getSolidTint(hex, isDark) {
  let c = hex.replace('#', '');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  if (isDark) {
    return `rgb(${Math.round(15 * 0.94 + r * 0.06)}, ${Math.round(23 * 0.94 + g * 0.06)}, ${Math.round(42 * 0.94 + b * 0.06)})`;
  } else {
    return `rgb(${Math.round(255 * 0.94 + r * 0.06)}, ${Math.round(255 * 0.94 + g * 0.06)}, ${Math.round(255 * 0.94 + b * 0.06)})`;
  }
}

function escapeHTML(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function unescapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
}

function hideLoadingSpinner() {
  const loadingElem = document.getElementById('loading');
  if (loadingElem && !loadingElem.innerHTML.includes('Error loading')) {
    loadingElem.classList.add('hidden');
  }
}

function getVal(row, colIndex) {
  if (!row || !Array.isArray(row)) return '';
  const raw = colIndex < row.length && row[colIndex] != null ? String(row[colIndex]).trim() : '';
  return escapeHTML(raw);
}

function getItemNumberForSort(row, originalIndex) {
  const raw = getVal(row, colIdx.itemNoM) || getVal(row, colIdx.id) || getVal(row, colIdx.ref);
  const clean = unescapeHTML(raw).replace(/^#\s*/, '').trim();
  const num = parseInt(clean.replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? (originalIndex + 1) : num;
}

function cleanDetailsForModal(rawDetails) {
  if (!rawDetails) return '';
  let lines = String(rawDetails).split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';
  if (lines.length > 1) {
    const firstLine = lines[0];
    if (firstLine.includes('/') || /^category\s*:/i.test(firstLine) || /^type\s*:/i.test(firstLine) || !firstLine.includes(':')) {
      if (lines[1].includes(':') || /^material\s*:/i.test(lines[1])) lines.shift();
    }
  }
  return lines.join('\n');
}

function normalizeCountry(rawLoc) {
  if (!rawLoc) return '';
  let loc = unescapeHTML(rawLoc).replace(/[\.\?]/g, '').trim();
  let lower = loc.toLowerCase();
  if (lower.includes('england') || lower.includes('london') || lower.includes('sheffield') || lower.includes('uk') || lower.includes('united kingdom') || lower.includes('scotland') || lower.includes('wales') || lower.includes('great britain')) return 'England / UK';
  if (lower.includes('usa') || lower.includes('united states') || lower.includes('america') || lower.includes('new york') || lower.includes('n.y.')) return 'USA';
  if (lower.includes('germany') || lower.includes('deutschland')) return 'Germany';
  if (lower.includes('france') || lower.includes('paris')) return 'France';
  if (lower.includes('australia')) return 'Australia';
  if (lower.includes('new zealand') || lower.includes('nz')) return 'New Zealand';
  if (lower.includes('japan')) return 'Japan';
  if (lower.includes('canada')) return 'Canada';
  if (lower.includes('switzerland') || lower.includes('swiss')) return 'Switzerland';
  if (lower.includes('austria')) return 'Austria';
  if (lower.includes('sweden')) return 'Sweden';
  return loc.split(' ')[0].split(',')[0].split('/')[0].trim();
}

function buildArchiveSearchUrl(rawTitle, catalogNum) {
  const cleanTitle = unescapeHTML(rawTitle || '');
  const cleanCat = unescapeHTML(catalogNum || '');
  const combinedStr = `${cleanTitle} ${cleanCat}`.trim();
  return `https://archive.org/details/78rpm?tab=collection&query=${encodeURIComponent(combinedStr).replace(/'/g, '%27').replace(/%20/g, '+')}`;
}

function toggleCollapsibleControls(show) {
  const collapsibleControls = document.getElementById('collapsibleControls');
  const toggleChevron = document.getElementById('toggleChevron');
  const toggleControlsBtn = document.getElementById('toggleControlsBtn');
  if (!collapsibleControls) return;
  const shouldShow = show !== undefined ? show : collapsibleControls.classList.contains('hidden');
  
  if (shouldShow) {
    collapsibleControls.classList.remove('hidden');
    if (toggleChevron) toggleChevron.style.transform = 'rotate(0deg)';
    if (toggleControlsBtn) toggleControlsBtn.classList.add('bg-blue-50', 'dark:bg-blue-950/60', 'text-blue-700', 'dark:text-blue-300', 'border-blue-300');
  } else {
    collapsibleControls.classList.add('hidden');
    if (toggleChevron) toggleChevron.style.transform = 'rotate(180deg)';
    if (toggleControlsBtn) toggleControlsBtn.classList.remove('bg-blue-50', 'dark:bg-blue-950/60', 'text-blue-700', 'dark:text-blue-300', 'border-blue-300');
  }
}

async function fetchDualModeCSV(remoteUrl, localUrl, cacheKey) {
  try {
    const cached = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(`${cacheKey}_time`);
    if (cached && cacheTime && (Date.now() - Number(cacheTime) < CACHE_TTL_MS)) {
      const parsedData = JSON.parse(cached);
      if (Array.isArray(parsedData) && parsedData.length > 1 && Array.isArray(parsedData[0])) {
        return parsedData;
      }
    }
  } catch (e) {
    try { localStorage.removeItem(cacheKey); } catch(err) {}
  }

  if (IS_LOCAL_ENV) {
    try {
      const localRes = await fetch(localUrl);
      if (localRes.ok) {
        const text = await localRes.text();
        if (typeof Papa !== 'undefined') {
          const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
          if (parsed.data && parsed.data.length > 1 && Array.isArray(parsed.data[0])) {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(parsed.data));
              localStorage.setItem(`${cacheKey}_raw`, text);
              localStorage.setItem(`${cacheKey}_time`, Date.now());
            } catch (e) {}
            return parsed.data;
          }
        }
      }
    } catch (e) {}
  }

  try {
    const res = await fetch(remoteUrl);
    if (res.ok) {
      const text = await res.text();
      if (typeof Papa !== 'undefined') {
        const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
        if (parsed.data && parsed.data.length > 1 && Array.isArray(parsed.data[0])) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(parsed.data));
            localStorage.setItem(`${cacheKey}_raw`, text);
            localStorage.setItem(`${cacheKey}_time`, Date.now());
          } catch (e) {}
          return parsed.data;
        }
      }
    }
  } catch (e) {}

  try {
    const fallbackRes = await fetch(localUrl);
    if (fallbackRes.ok) {
      const text = await fallbackRes.text();
      if (typeof Papa !== 'undefined') {
        const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
        if (parsed.data && parsed.data.length > 1 && Array.isArray(parsed.data[0])) {
          return parsed.data;
        }
      }
    }
  } catch (e) {}

  return [];
}

function parseDiscogsVal(raw) {
  if (!raw) return '';
  let str = String(raw).trim();
  if (!str) return '';
  if (str.startsWith('http://') || str.startsWith('https://')) return str;
  if (str.toLowerCase().includes('discogs.com')) return `https://${str.replace(/^https?:\/\//i, '')}`;
  const cleanId = str.replace(/[^0-9]/g, '');
  if (cleanId.length >= 4) return `https://www.discogs.com/release/${cleanId}`;
  return '';
}

function getDiscogsUrl(row) {
  if (!row || !Array.isArray(row)) return '';
  for (let idx of [9, 7, 12, 8]) {
    const val = getVal(row, idx);
    if (val) {
      const url = parseDiscogsVal(val);
      if (url) return url;
    }
  }
  for (let i = 0; i < row.length; i++) {
    const val = getVal(row, i);
    if (val && (val.includes('discogs') || val.startsWith('http'))) {
      const url = parseDiscogsVal(val);
      if (url) return url;
    }
  }
  return '';
}

function checkIfHasRecording(row) { return /recording/i.test(getVal(row, 12)); }

function getGramophoneRawTitle(row) {
  const t2 = getVal(row, 2);
  const t9 = getVal(row, 9);
  if (t9 && (t9.includes('discogs') || t9.startsWith('http') || /^[0-9]+$/.test(t9))) return t2 || 'Untitled Record';
  if (t2 && t9 && t2 !== t9) return `${t2} / ${t9}`;
  return t2 || t9 || 'Untitled Record';
}

function formatGramophoneTitle(rawTitle) {
  if (!rawTitle) return '';
  const parts = rawTitle.split('/').map(p => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    let p1 = parts[0], p2 = parts[1];
    if (!/^A[\s\.:-]/i.test(p1)) p1 = `A: ${p1}`;
    if (!/^B[\s\.:-]/i.test(p2)) p2 = `B: ${p2}`;
    return `<span class="block">${p1}</span><span class="block mt-0.5 text-slate-600 dark:text-slate-400 font-medium">${p2}</span>`;
  } else {
    let p1 = parts[0] || rawTitle;
    if (!/^A[\s\.:-]/i.test(p1)) p1 = `A: ${p1}`;
    return `<span class="block">${p1}</span>`;
  }
}

function formatTitleWithSlashes(title) {
  if (!title) return '';
  const parts = String(title).split('/').map(p => p.trim()).filter(Boolean);
  if (parts.length <= 1) return title;
  return parts.map(p => `<span class="block">${p}</span>`).join('');
}

function parseYearForSort(val) {
  if (!val) return 99999;
  const num = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) || num === 0 ? 99999 : num;
}

function showToast(msg, icon = '✨') {
  if (typeof window.showBMMCToast === 'function') {
    window.showBMMCToast(msg, icon);
    return;
  }
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastIcon').textContent = icon;
  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
  setTimeout(() => { toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3'); }, 2500);
}

function getAgeBadgeStyle(ageStr) {
  if (!ageStr) return 'bg-slate-900/80 text-white font-extrabold';
  const lower = ageStr.toLowerCase().trim();
  if (lower.includes('prehistory')) return 'bg-purple-600/90 text-white border border-purple-400/40 shadow-sm font-extrabold';
  if (lower.includes('victorian')) return 'bg-amber-600/90 text-white border border-amber-400/40 shadow-sm font-extrabold';
  if (lower.includes('wwi')) return 'bg-red-600/90 text-white border border-red-400/40 shadow-sm font-extrabold';
  if (lower.includes('interwar')) return 'bg-emerald-600/90 text-white border border-emerald-400/40 shadow-sm font-extrabold';
  if (lower.includes('wwii')) return 'bg-rose-700/90 text-white border border-rose-400/40 shadow-sm font-extrabold';
  if (lower.includes('post war') || lower.includes('post')) return 'bg-sky-600/90 text-white border border-sky-400/40 shadow-sm font-extrabold';
  if (lower.includes('modern')) return 'bg-indigo-600/90 text-white border border-indigo-400/40 shadow-sm font-extrabold';
  return 'bg-slate-900/90 text-white border border-slate-700 font-extrabold';
}

function formatGoogleLh3Url(url, size = 's200') {
  if (!url) return '';
  url = String(url).trim();
  if (!url) return '';

  if (window.resolveOfflineMedia) {
    const local = window.resolveOfflineMedia(url);
    if (local && (local.startsWith('./media/') || local.startsWith('media/'))) return local;
  }

  if (url.startsWith('data:image/') || url.startsWith('./media/') || url.startsWith('media/')) return url;

  if (url.includes('dropbox.com')) {
    let cleanUrl = url.replace('dl=0', 'raw=1').replace('dl=1', 'raw=1');
    if (!cleanUrl.includes('raw=1')) cleanUrl += (cleanUrl.includes('?') ? '&raw=1' : '?raw=1');
    return cleanUrl;
  }

  const isDrive = url.includes('drive.google.com') || url.includes('lh3.googleusercontent.com') || url.includes('docs.google.com');
  if (isDrive) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                  url.match(/id=([a-zA-Z0-9_-]+)/) || 
                  url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      const sz = String(size).startsWith('s') ? size : `s${size}`;
      return `https://lh3.googleusercontent.com/d/${fileId}=${sz}`;
    }
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) return '';
  return url;
}

function extractDirect3DUrl(rawUrl) {
  if (!rawUrl) return '';
  let str = unescapeHTML(rawUrl).trim();
  if (!str) return '';

  if (window.resolveOfflineMedia) {
    const local = window.resolveOfflineMedia(str);
    if (local && (local.startsWith('./media/models/') || local.startsWith('media/models/') || /\.glb|\.gltf/i.test(local))) {
      return local;
    }
  }

  if (str.includes('#model=')) str = str.split('#model=').pop();
  else if (str.includes('model=')) str = str.split('model=').pop();
  else if (str.includes('url=')) str = str.split('url=').pop();
  else {
    const lastHttp = Math.max(str.lastIndexOf('https://'), str.lastIndexOf('http://'));
    if (lastHttp > 0) str = str.substring(lastHttp);
  }
  str = str.trim();

  if (str.startsWith('./media/models/') || str.startsWith('media/models/')) return str;
  if (!str.startsWith('http://') && !str.startsWith('https://')) return '';

  const lower = str.toLowerCase();
  const isGLB = lower.includes('.glb') || lower.includes('.gltf');
  const isDropbox3D = (lower.includes('dropbox.com') || lower.includes('dropboxusercontent.com')) && (lower.includes('.glb') || lower.includes('.gltf'));
  
  if (!isGLB && !isDropbox3D) return '';

  if (isDropbox3D) {
    str = str.replace('dl=0', 'raw=1').replace('dl=1', 'raw=1');
    if (!str.includes('raw=1')) str += (str.includes('?') ? '&raw=1' : '?raw=1');
  }
  return str;
}

function get3DUrlForItem(row) {
  if (!row) return '';
  const colRVal = extractDirect3DUrl(getVal(row, colIdx.d3d));
  if (colRVal) return colRVal;

  const colVRaw = getVal(row, colIdx.img2);
  if (/\.glb|\.gltf|#model=/i.test(colVRaw)) {
    const colVVal = extractDirect3DUrl(colVRaw);
    if (colVVal) return colVVal;
  }

  const itemNoColM = unescapeHTML(getVal(row, colIdx.itemNoM)).replace(/^#\s*/, '').trim().toLowerCase();
  if (itemNoColM && catalog3DMap.has(itemNoColM)) return catalog3DMap.get(itemNoColM);
  const itemNoColA = unescapeHTML(getVal(row, colIdx.id)).replace(/^#\s*/, '').trim().toLowerCase();
  if (itemNoColA && catalog3DMap.has(itemNoColA)) return catalog3DMap.get(itemNoColA);
  return '';
}

function isItemHot(row) {
  if (!row) return false;
  const colZ = unescapeHTML(getVal(row, colIdx.hot)).trim().toLowerCase();
  if (colZ === 'true' || colZ === '1' || colZ === 'yes') return true;
  const colA = unescapeHTML(getVal(row, colIdx.id)).replace(/^#\s*/, '').trim().toLowerCase();
  if (colA && hotItemSet.has(colA)) return true;
  const colM = unescapeHTML(getVal(row, colIdx.itemNoM)).replace(/^#\s*/, '').trim().toLowerCase();
  if (colM && hotItemSet.has(colM)) return true;
  return false;
}

function getImagesForItem(row) {
  let img1 = getVal(row, colIdx.img1);
  let img2 = getVal(row, colIdx.img2);
  if (!img1 && row) {
    for (let i = 2; i < row.length; i++) {
      const val = getVal(row, i);
      if (val && (val.startsWith('http') || val.startsWith('media/') || val.startsWith('./media/')) && (val.includes('drive.google') || val.includes('lh3.google') || val.includes('dropbox') || /\.(jpg|jpeg|png|webp|gif)/i.test(val))) {
        if (!img1) img1 = val;
        else if (!img2 && val !== img1) { img2 = val; break; }
      }
    }
  }
  return { img1, img2 };
}

function parseTitleAndDetails(rawText) {
  if (!rawText) return { title: '', details: '' };
  const lines = String(rawText).split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return { title: '', details: '' };
  return { title: lines[0].replace(/^#\s*/, ''), details: lines.slice(1).map(line => line.replace(/^#\s*/, '')).join('\n') };
}

function formatDocLink(url) {
  if (!url) return '';
  if (window.formatDocUrl) return window.formatDocUrl(url);
  if (window.resolveOfflineMedia) {
    const local = window.resolveOfflineMedia(url);
    if (local && (local.startsWith('./media/') || local.startsWith('media/'))) return local;
  }
  return url.startsWith('http') ? url : `https://${url}`;
}

function googleItemSearch(title, category, details) {
  const cleanTitle = unescapeHTML(title);
  const cleanCat = unescapeHTML(category);
  const cleanDetails = unescapeHTML(details || '').replace(/^#\s*/, '').replace(/\s+/g, ' ').trim();
  const query = `${cleanTitle} ${cleanCat || ''} Historical Artifact ${cleanDetails.slice(0, 200)}`.trim();
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
}

function toggleModal3DSkybox(event) {
  if (event) event.stopPropagation();
  is3DSkyboxLight = !is3DSkyboxLight;
  update3DSkyboxUI();
}

function togglePoppyMotion() {
  isPoppyMotionActive = !isPoppyMotionActive;
  const skyBg = document.getElementById('timeSkyBackground');
  const btn = document.getElementById('btnTogglePoppyMotion');

  if (skyBg) {
    if (isPoppyMotionActive) skyBg.classList.add('poppies-animated');
    else skyBg.classList.remove('poppies-animated');
  }

  if (btn) {
    if (isPoppyMotionActive) {
      btn.classList.add('ring-2', 'ring-rose-300', 'bg-rose-700');
      btn.innerHTML = '🌺 Dynamic: On';
    } else {
      btn.classList.remove('ring-2', 'ring-rose-300', 'bg-rose-700');
      btn.innerHTML = '🌺 Dynamic';
    }
  }

  showToast(isPoppyMotionActive ? 'Poppy background motion enabled' : 'Poppy background motion paused', '🌺');
}

function update3DSkyboxUI() {
  const modalBox = document.getElementById('modal3DContainer');
  const lightboxBox = document.getElementById('lightbox3DContainer');
  const modalBtn = document.getElementById('btnToggleModalSkybox');
  const lightboxBtn = document.getElementById('btnToggleLightboxSkybox');

  if (modalBox) {
    if (is3DSkyboxLight) { modalBox.classList.remove('bg-slate-900'); modalBox.classList.add('bg-slate-100'); }
    else { modalBox.classList.remove('bg-slate-100'); modalBox.classList.add('bg-slate-900'); }
  }
  if (lightboxBox) {
    if (is3DSkyboxLight) { lightboxBox.classList.remove('bg-slate-950'); lightboxBox.classList.add('bg-slate-100'); }
    else { lightboxBox.classList.remove('bg-slate-100'); lightboxBox.classList.add('bg-slate-950'); }
  }
  const labelText = is3DSkyboxLight ? '🌙 Dark Sky' : '☀️ Light Sky';
  if (modalBtn) modalBtn.textContent = labelText;
  if (lightboxBtn) lightboxBtn.textContent = labelText;
}

// ==========================================================================
// 6. View Switcher & Grid Rendering
// ==========================================================================
function switchCardImage(rowIndex, dir, event) {
  if (event) event.stopPropagation();
  const box = document.getElementById(`card-media-box-${rowIndex}`);
  const badge = document.getElementById(`card-badge-${rowIndex}`);
  if (!box) return;

  const total = parseInt(box.dataset.totalSlots, 10) || 1;
  let curr = parseInt(box.dataset.currentSlot, 10) || 1;

  curr = curr + dir;
  if (curr < 1) curr = total;
  if (curr > total) curr = 1;
  box.dataset.currentSlot = curr;

  const items = box.querySelectorAll('.card-media-item');
  items.forEach(el => {
    const slotIdx = parseInt(el.getAttribute('data-slot-idx'), 10);
    if (slotIdx === curr) {
      el.classList.remove('hidden');
      el.classList.add('flex');
    } else {
      el.classList.add('hidden');
      el.classList.remove('flex');
    }
  });

  if (badge) badge.textContent = `${curr} / ${total}`;
}

function renderEmptyState(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="col-span-full text-center py-16 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 backdrop-blur-sm">
      <span class="text-3xl mb-2 block">🔍</span>
      <p class="text-slate-700 dark:text-slate-300 font-bold text-sm">No exhibits match your current filter selections.</p>
      <button onclick="browseAllExhibits()" class="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer">Reset Filters & Show All Exhibits</button>
    </div>
  `;
}

function saveCatalogSessionState() {
  try {
    const state = {
      currentTab,
      catalogViewMode,
      tableSortCol,
      tableSortDir,
      only3DActive,
      hotOnlyActive,
      showingFavoritesOnly,
      isGridActive,
      compareItems: [...compareItemIndices],
      search: document.getElementById('searchInput')?.value || '',
      age: document.getElementById('filterAge')?.value || restoredSessionFilters.filterAge || '',
      type: document.getElementById('filterType')?.value || restoredSessionFilters.filterType || '',
      category: document.getElementById('filterCategory')?.value || restoredSessionFilters.filterCategory || '',
      subcategory: document.getElementById('filterSubcategory')?.value || restoredSessionFilters.filterSubcategory || '',
      artist: document.getElementById('filterArtist')?.value || restoredSessionFilters.filterArtist || '',
      label: document.getElementById('filterLabel')?.value || restoredSessionFilters.filterLabel || '',
      format: document.getElementById('filterFormat')?.value || restoredSessionFilters.filterFormat || '',
      year: document.getElementById('filterYear')?.value || restoredSessionFilters.filterYear || '',
      sortBy: document.getElementById('sortBy')?.value || 'default'
    };
    sessionStorage.setItem('bMMC_catalog_session', JSON.stringify(state));
  } catch (e) {}
}

function restoreCatalogSessionState() {
  try {
    const raw = sessionStorage.getItem('bMMC_catalog_session');
    if (!raw) return false;
    const state = JSON.parse(raw);

    const hasExplicitHash = window.location.hash && (
      window.location.hash.startsWith('#exhibit-') || 
      window.location.hash.startsWith('#gramophone-') || 
      window.location.hash === '#stats' || 
      window.location.hash === '#info'
    );

    if (state.catalogViewMode) catalogViewMode = state.catalogViewMode;
    if (state.tableSortCol) tableSortCol = state.tableSortCol;
    if (state.tableSortDir) tableSortDir = state.tableSortDir;
    if (Array.isArray(state.compareItems)) compareItemIndices = new Set(state.compareItems);
    if (typeof state.only3DActive === 'boolean') only3DActive = state.only3DActive;
    if (typeof state.hotOnlyActive === 'boolean') hotOnlyActive = state.hotOnlyActive;
    if (typeof state.showingFavoritesOnly === 'boolean') showingFavoritesOnly = state.showingFavoritesOnly;
    if (typeof state.isGridActive === 'boolean') isGridActive = state.isGridActive;

    restoredSessionFilters = {
      filterAge: state.age || '',
      filterType: state.type || '',
      filterCategory: state.category || '',
      filterSubcategory: state.subcategory || '',
      filterArtist: state.artist || '',
      filterLabel: state.label || '',
      filterFormat: state.format || '',
      filterYear: state.year || ''
    };

    const setVal = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined) el.value = v; };
    setVal('searchInput', state.search || '');
    setVal('sortBy', state.sortBy || 'default');

    if (!hasExplicitHash && state.currentTab) {
      currentTab = state.currentTab;
    }
    updateCompareUI();
    return true;
  } catch (e) {
    return false;
  }
}

function getFavorites() {
  try {
    const key = currentTab === 'exhibits' ? 'bMMC_favorites' : 'bMMC_gramophone_favorites';
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch(e) { return []; }
}

function toggleFavorite(rowIndex, event) {
  if (event) event.stopPropagation();
  let favs = getFavorites();
  const key = currentTab === 'exhibits' ? 'bMMC_favorites' : 'bMMC_gramophone_favorites';
  const adding = !favs.includes(rowIndex);
  if (adding) { favs.push(rowIndex); showToast('Saved to your collection', '❤️'); }
  else { favs = favs.filter(i => i !== rowIndex); showToast('Removed from saved items', '🤍'); }
  localStorage.setItem(key, JSON.stringify(favs));
  updateFavoritesBadge();
  saveCatalogSessionState();
  if (isGridActive) filterCatalog(true);
}

function updateFavoritesBadge() {
  const favs = getFavorites();
  const heartIcon = document.getElementById('favHeartIcon');
  const favCountText = document.getElementById('favCountText');
  const btnFav = document.getElementById('btnFavorites');
  if (favCountText) favCountText.textContent = `Saved (${favs.length})`;
  if (heartIcon) heartIcon.textContent = favs.length > 0 ? '❤️' : '🤍';
  if (btnFav) {
    if (showingFavoritesOnly) {
      btnFav.classList.add('bg-rose-600', 'text-white', 'border-rose-600');
      btnFav.classList.remove('bg-white/80', 'text-slate-700', 'border-slate-200', 'dark:bg-slate-800', 'dark:text-slate-200');
    } else {
      btnFav.classList.remove('bg-rose-600', 'text-white', 'border-rose-600');
      btnFav.classList.add('bg-white/80', 'text-slate-700', 'border-slate-200', 'dark:bg-slate-800', 'dark:text-slate-200');
    }
  }
}

function toggleCompareItem(originalIndex, event) {
  if (event) event.stopPropagation();
  if (compareItemIndices.has(originalIndex)) {
    compareItemIndices.delete(originalIndex);
    showToast('Removed from comparison', '⚖️');
  } else {
    if (compareItemIndices.size >= 8) {
      showToast('Maximum 8 items can be compared at once', '⚠️');
      return;
    }
    compareItemIndices.add(originalIndex);
    showToast('Added to comparison tray', '⚖️');
  }
  updateCompareUI();
  saveCatalogSessionState();
  if (isGridActive) filterCatalog(true);
}

function clearCompareItems() {
  compareItemIndices.clear();
  updateCompareUI();
  closeCompareModal();
  saveCatalogSessionState();
  if (isGridActive) filterCatalog(true);
  showToast('Comparison tray cleared', '🗑️');
}

function updateCompareUI() {
  const bar = document.getElementById('floatingCompareBar');
  const countText = document.getElementById('compareCountText');
  const count = compareItemIndices.size;

  if (bar) {
    if (count > 0) {
      bar.classList.remove('hidden', 'translate-y-4');
      bar.classList.add('flex', 'translate-y-0');
      if (countText) countText.textContent = `${count} Item${count > 1 ? 's' : ''} Selected`;
    } else {
      bar.classList.add('hidden', 'translate-y-4');
      bar.classList.remove('flex', 'translate-y-0');
    }
  }
}

function openCompareModal() {
  const modal = document.getElementById('compareModal');
  const body = document.getElementById('compareModalBody');
  if (!modal || !body) return;

  if (compareItemIndices.size === 0) {
    showToast('Select artifacts using ⚖️ Compare first', 'ℹ️');
    return;
  }

  if (typeof window.closeBMMCDrawer === 'function') window.closeBMMCDrawer();

  const items = Array.from(compareItemIndices).map(idx => ({
    originalIndex: idx,
    row: rawExhibitsRows[idx]
  })).filter(i => i.row);

  const colsCount = items.length;
  let gridColsClass = 'grid-cols-1';
  if (colsCount === 2) gridColsClass = 'grid-cols-1 md:grid-cols-2';
  else if (colsCount === 3) gridColsClass = 'grid-cols-1 md:grid-cols-3';
  else if (colsCount >= 4) gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  let html = `
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-2">
        <span class="text-base">📘</span>
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Comparing ${items.length} Artifact${items.length > 1 ? 's' : ''}</span>
      </div>
      <button onclick="window.printCuratorPocketPassport()" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer">
        <span>📘</span>
        <span>Print Curator Pocket Passport (Booklet) ↗</span>
      </button>
    </div>

    <div class="grid ${gridColsClass} gap-4 sm:gap-6 items-stretch">
      ${items.map(({ originalIndex, row }) => {
        const rawContent = getVal(row, colIdx.title) || getVal(row, colIdx.id);
        const { title, details } = parseTitleAndDetails(rawContent);
        const displayTitle = title || `Exhibit #${originalIndex + 1}`;
        const itemNo = getVal(row, colIdx.itemNoM) || getVal(row, colIdx.id) || `#${originalIndex + 1}`;
        const era = getEraByRow(row);
        const eraDisplay = era ? era.short : getVal(row, colIdx.age);
        const category = getVal(row, colIdx.category);
        const type = getVal(row, colIdx.type);
        const made = getVal(row, colIdx.made);
        const year = getVal(row, colIdx.year);
        const notes = getVal(row, colIdx.notes);
        const d3d = get3DUrlForItem(row);
        const ddoc = getVal(row, colIdx.doc);
        const dweb = getVal(row, colIdx.web);
        const { img1, img2 } = getImagesForItem(row);
        const thumbImg1 = formatGoogleLh3Url(img1, 's600') || NO_IMAGE_SVG;
        const thumbImg2 = formatGoogleLh3Url(img2, 's400');
        const theme = getCategoryTheme(category || type);

        return `
          <div class="bg-white/90 dark:bg-slate-900/90 rounded-3xl p-4 sm:p-5 border-2 flex flex-col justify-between shadow-md relative" style="border-color: ${theme.hex}80;">
            <button onclick="window.toggleCompareItem(${originalIndex})" title="Remove from comparison" class="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white text-xs transition z-10 font-bold cursor-pointer">✕</button>
            
            <div class="space-y-3.5">
              <div class="h-48 rounded-2xl overflow-hidden bg-slate-950 p-2 flex items-center justify-center relative">
                <img src="${thumbImg1}" class="max-w-full max-h-full object-contain" alt="${escapeHTML(displayTitle)}" />
                ${thumbImg2 ? `<span class="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-black px-2 py-0.5 rounded-md border border-slate-700 shadow">Dual Angle</span>` : ''}
                ${d3d ? `<button onclick="window.open3DLightbox('${encodeURIComponent(d3d)}', '${encodeURIComponent(displayTitle)}')" class="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 cursor-pointer">📱 3D / AR</button>` : ''}
              </div>

              <div>
                <span class="text-[10px] font-mono font-bold text-slate-400 block">REF ${escapeHTML(itemNo)}</span>
                <h4 class="text-base font-black text-slate-900 dark:text-white leading-tight mt-0.5">${escapeHTML(displayTitle)}</h4>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span class="text-[9px] font-black uppercase text-slate-400 block">Era / Period</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHTML(eraDisplay || '—')}</span>
                </div>
                <div class="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span class="text-[9px] font-black uppercase text-slate-400 block">Date</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHTML(year || '—')}</span>
                </div>
                <div class="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span class="text-[9px] font-black uppercase text-slate-400 block">Category</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHTML(category || '—')}</span>
                </div>
                <div class="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span class="text-[9px] font-black uppercase text-slate-400 block">Origin</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHTML(made || '—')}</span>
                </div>
              </div>

              ${notes ? `
                <div class="text-xs bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl text-amber-900 dark:text-amber-300">
                  <span class="text-[9px] font-black uppercase block text-amber-600 dark:text-amber-400 mb-0.5">Curator Notes</span>
                  <p class="line-clamp-3">${escapeHTML(notes.replace(/^#\s*/, ''))}</p>
                </div>
              ` : ''}

              ${details ? `
                <div class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  ${escapeHTML(cleanDetailsForModal(details))}
                </div>
              ` : ''}

              ${(ddoc || dweb) ? `
                <div class="flex items-center gap-2 pt-1">
                  ${ddoc ? `<a href="${formatDocLink(ddoc)}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 underline">📄 Archival Document ↗</a>` : ''}
                  ${dweb ? `<a href="${dweb}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">🌐 Reference Web ↗</a>` : ''}
                </div>
              ` : ''}
            </div>

            <div class="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
              <button onclick="closeCompareModal(); window.openModalByOriginalIndex(${originalIndex});" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 rounded-xl transition shadow cursor-pointer">
                Full Details ↗
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  body.innerHTML = html;
  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

function closeCompareModal() {
  const modal = document.getElementById('compareModal');
  if (modal) modal.classList.add('hidden');
  const detailModal = document.getElementById('detailModal');
  if (!detailModal || detailModal.classList.contains('hidden')) {
    document.body.classList.remove('overflow-hidden');
  }
}

function setCatalogViewMode(mode) {
  catalogViewMode = mode;
  try { localStorage.setItem('bMMC_view_mode', mode); } catch (e) {}
  saveCatalogSessionState();
  updateViewSwitcherUI();
  if (isGridActive) filterCatalog(true);
}

function updateViewSwitcherUI() {
  const btnGrid = document.getElementById('btnViewGrid');
  const btnTable = document.getElementById('btnViewTable');
  const btnPhotos = document.getElementById('btnViewPhotos');

  [btnGrid, btnTable, btnPhotos].forEach(b => {
    if (b) {
      b.classList.remove('bg-white', 'dark:bg-slate-700', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm');
      b.classList.add('text-slate-600', 'dark:text-slate-400');
    }
  });

  const activeBtn = catalogViewMode === 'table' ? btnTable : (catalogViewMode === 'photos' ? btnPhotos : btnGrid);
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
    activeBtn.classList.add('bg-white', 'dark:bg-slate-700', 'text-blue-600', 'dark:text-blue-400', 'shadow-sm');
  }
}

window.sortTableByColumn = function(colName) {
  if (tableSortCol === colName) {
    tableSortDir = (tableSortDir === 'asc') ? 'desc' : 'asc';
  } else {
    tableSortCol = colName;
    tableSortDir = 'asc';
  }
  saveCatalogSessionState();
  filterCatalog(true);
};

// ==========================================================================
// 7. Auto-Suggest & Navigation
// ==========================================================================
function handleSearchInputSuggestions(val) {
  const box = document.getElementById('searchSuggestionsBox');
  if (!box) return;

  const query = val.trim().toLowerCase();
  if (query.length < 2 || !rawExhibitsRows || rawExhibitsRows.length === 0) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }

  const catMatches = new Set();
  const eraMatches = new Set();
  const locMatches = new Set();
  const itemMatches = [];

  rawExhibitsRows.forEach((row, idx) => {
    const title = parseTitleAndDetails(getVal(row, colIdx.title) || getVal(row, colIdx.id)).title;
    const cat = getVal(row, colIdx.category);
    const subcat = getVal(row, colIdx.subcategory);
    const era = getEraByRow(row);
    const loc = getVal(row, colIdx.made);

    if (cat && cat.toLowerCase().includes(query)) catMatches.add(cat);
    if (subcat && subcat.toLowerCase().includes(query)) catMatches.add(subcat);
    if (era && (era.short.toLowerCase().includes(query) || era.full.toLowerCase().includes(query))) eraMatches.add(era.short);
    if (loc && loc.toLowerCase().includes(query)) locMatches.add(loc);

    if (title && title.toLowerCase().includes(query) && itemMatches.length < 3) {
      itemMatches.push({ title, originalIndex: idx, img: formatGoogleLh3Url(getImagesForItem(row).img1, 's100') });
    }
  });

  if (catMatches.size === 0 && eraMatches.size === 0 && locMatches.size === 0 && itemMatches.length === 0) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return;
  }

  let html = `<div class="p-2 space-y-2">`;

  if (catMatches.size > 0 || eraMatches.size > 0 || locMatches.size > 0) {
    html += `<div class="flex flex-wrap gap-1 items-center">`;
    Array.from(catMatches).slice(0, 3).forEach(c => {
      html += `<button onclick="applyAutoSuggestFilter('category', '${escapeHTML(c)}')" class="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-[10px] hover:bg-blue-100 cursor-pointer">Category: ${escapeHTML(c)}</button>`;
    });
    Array.from(eraMatches).slice(0, 2).forEach(e => {
      html += `<button onclick="applyAutoSuggestFilter('age', '${escapeHTML(e)}')" class="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-[10px] hover:bg-purple-100 cursor-pointer">Era: ${escapeHTML(e)}</button>`;
    });
    Array.from(locMatches).slice(0, 2).forEach(l => {
      html += `<button onclick="applyAutoSuggestSearch('${escapeHTML(l)}')" class="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] hover:bg-emerald-100 cursor-pointer">📍 ${escapeHTML(l)}</button>`;
    });
    html += `</div>`;
  }

  if (itemMatches.length > 0) {
    html += `<div class="border-t border-slate-100 dark:border-slate-800 pt-1.5 space-y-1">`;
    itemMatches.forEach(item => {
      html += `
        <div onclick="window.openModalByOriginalIndex(${item.originalIndex}); hideSearchSuggestions();" class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition">
          <img src="${item.img || NO_IMAGE_SVG}" class="w-8 h-8 rounded-lg object-contain bg-slate-200 dark:bg-slate-950 p-0.5 flex-shrink-0" />
          <span class="font-bold text-slate-800 dark:text-slate-200 truncate">${escapeHTML(item.title)}</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  box.innerHTML = html;
  box.classList.remove('hidden');
}

function hideSearchSuggestions() {
  const box = document.getElementById('searchSuggestionsBox');
  if (box) {
    box.classList.add('hidden');
    box.innerHTML = '';
  }
}

window.applyAutoSuggestFilter = function(filterKey, filterVal) {
  hideSearchSuggestions();
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  if (filterKey === 'category') {
    const sel = document.getElementById('filterCategory');
    if (sel) sel.value = filterVal;
  } else if (filterKey === 'age') {
    const sel = document.getElementById('filterAge');
    if (sel) sel.value = filterVal;
  }
  updateDynamicDropdowns();
  filterCatalog(true);
  scrollToGrid();
};

window.applyAutoSuggestSearch = function(query) {
  hideSearchSuggestions();
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = query;
  updateDynamicDropdowns();
  filterCatalog(true);
  scrollToGrid();
};

window.selectHubCategory = function(catName) {
  clearAllFilters(false);
  setTab('exhibits');

  const isCollectionsHub = catName.toLowerCase().includes('collection');

  if (isCollectionsHub) {
    const typeSelect = document.getElementById('filterType');
    if (typeSelect) {
      let matched = false;
      const target = 'collection';
      for (let opt of typeSelect.options) {
        const optVal = opt.value.toLowerCase().trim();
        if (optVal && (optVal === 'collections' || optVal === 'collection' || optVal.includes(target))) {
          typeSelect.value = opt.value;
          matched = true;
          break;
        }
      }
      if (!matched) {
        const existingMatch = rawExhibitsRows.find(r => {
          const t = getVal(r, colIdx.type).toLowerCase();
          return t.includes('collection');
        });
        if (existingMatch) {
          const bestType = getVal(existingMatch, colIdx.type);
          const opt = document.createElement('option');
          opt.value = bestType;
          opt.textContent = bestType;
          typeSelect.appendChild(opt);
          typeSelect.value = bestType;
        } else {
          typeSelect.value = catName;
        }
      }
    }
  } else {
    const catSelect = document.getElementById('filterCategory');
    if (catSelect) {
      let matched = false;
      const targetStem = catName.toLowerCase().replace(/s$/, '').trim();
      
      for (let opt of catSelect.options) {
        const optVal = opt.value.toLowerCase().trim();
        const optStem = optVal.replace(/s$/, '');
        if (optVal && (optVal === catName.toLowerCase().trim() || optStem === targetStem || optVal.includes(targetStem))) {
          catSelect.value = opt.value;
          matched = true;
          break;
        }
      }

      if (!matched) {
        const existingMatch = rawExhibitsRows.find(r => {
          const c = getVal(r, colIdx.category).toLowerCase();
          return c === catName.toLowerCase() || c.replace(/s$/, '') === targetStem || c.includes(targetStem);
        });
        if (existingMatch) {
          const bestCat = getVal(existingMatch, colIdx.category);
          const opt = document.createElement('option');
          opt.value = bestCat;
          opt.textContent = bestCat;
          catSelect.appendChild(opt);
          catSelect.value = bestCat;
        }
      }
    }
  }

  updateDynamicDropdowns();
  filterCatalog(true);
  scrollToGrid();
};

window.selectGramophoneHub = function() {
  clearAllFilters(false);
  setTab('gramophone');
  updateDynamicDropdowns();
  filterCatalog(true);
  scrollToGrid();
};

window.showExhibitOnMap = function(originalIndex) {
  closeModal();
  closeEnlargeModal();
  close3DLightbox();
  closeCompareModal();
  if (typeof window.closeBMMCDrawer === 'function') window.closeBMMCDrawer();
  document.body.classList.remove('overflow-hidden');

  setTab('stats');

  const mapIframe = document.getElementById('statMapIframe');
  if (mapIframe) {
    const currentSrc = mapIframe.getAttribute('src') || '';

    if (!currentSrc || currentSrc === 'about:blank') {
      pendingMapExhibitIndex = originalIndex;
      mapIframe.src = `2Dmap.html?exhibit=${originalIndex}`;
    } else {
      if (isMapIframeReady) {
        mapIframe.contentWindow?.postMessage({
          type: 'FOCUS_EXHIBIT',
          exhibit: originalIndex
        }, '*');
      } else {
        pendingMapExhibitIndex = originalIndex;
      }
    }
  }

  setTimeout(() => {
    document.getElementById('statMapCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 200);
};

function clearAllFilters(shouldScroll = true) {
  ['searchInput', 'filterAge', 'filterType', 'filterCategory', 'filterSubcategory', 'filterArtist', 'filterLabel', 'filterFormat', 'filterYear'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  only3DActive = false; hotOnlyActive = false; showingFavoritesOnly = false;
  tableSortCol = null;
  restoredSessionFilters = {};
  const btn3D = document.getElementById('btn3DOnly'); if (btn3D) btn3D.classList.remove('ring-2', 'ring-purple-300', 'from-purple-700', 'to-indigo-700');
  const btnHot = document.getElementById('btnHotOnly'); if (btnHot) btnHot.classList.remove('ring-2', 'ring-amber-300', 'from-amber-600', 'to-rose-700');
  
  try {
    const url = new URL(window.location);
    url.searchParams.delete('search');
    url.searchParams.delete('q');
    url.searchParams.delete('query');
    url.searchParams.delete('item');
    url.searchParams.delete('tab');
    safeReplaceState(url.pathname + (url.search ? url.search : '') + (url.hash ? url.hash : ''));
  } catch (e) {}

  updateFavoritesBadge();
}

function browseAllExhibits() {
  hideLoadingSpinner();
  if (typeof window.closeBMMCDrawer === 'function') window.closeBMMCDrawer();
  document.body.classList.remove('overflow-hidden');
  if (currentTab !== 'exhibits') setTab('exhibits');
  clearAllFilters(false);
  updateDynamicDropdowns();
  filterCatalog(true);
  scrollToGrid();
}

function setTab(tabName) {
  currentTab = tabName;
  stopAudioGuide();
  hideLoadingSpinner();
  if (typeof window.closeBMMCDrawer === 'function') window.closeBMMCDrawer();
  document.body.classList.remove('overflow-hidden');
  saveCatalogSessionState();

  const exhibitsFilterGrid = document.getElementById('exhibitsFilterGrid');
  const gramophoneFilterGrid = document.getElementById('gramophoneFilterGrid');
  const searchSortBar = document.getElementById('searchSortBar');
  const collectionHubsSection = document.getElementById('collectionHubsSection');
  const gridPrompt = document.getElementById('gridPrompt');
  const gridSection = document.getElementById('gridSection');
  const statsSection = document.getElementById('statsSection');
  const headerTitle = document.getElementById('headerTitleText');
  const headerIcon = document.getElementById('headerLogoIcon');
  const subhead = document.getElementById('subheadingText');

  if (tabName === 'exhibits') {
    if (statsSection) statsSection.classList.add('hidden');
    if (gridSection) gridSection.classList.remove('hidden');
    if (exhibitsFilterGrid) exhibitsFilterGrid.classList.remove('hidden');
    if (gramophoneFilterGrid) gramophoneFilterGrid.classList.add('hidden');
    if (searchSortBar) searchSortBar.classList.remove('hidden');
    if (collectionHubsSection) collectionHubsSection.classList.remove('hidden');
    if (headerTitle) headerTitle.textContent = 'BMMC Showcase';
    if (headerIcon) headerIcon.textContent = '🏛️';
    if (subhead) subhead.textContent = 'Discover historical artifacts, equipment, and memorabilia at the Bonniefields Museum.';
    safeReplaceState(window.location.pathname);
  } else if (tabName === 'gramophone') {
    if (statsSection) statsSection.classList.add('hidden');
    if (gridSection) gridSection.classList.remove('hidden');
    if (gramophoneFilterGrid) gramophoneFilterGrid.classList.remove('hidden');
    if (exhibitsFilterGrid) exhibitsFilterGrid.classList.add('hidden');
    if (searchSortBar) searchSortBar.classList.remove('hidden');
    if (collectionHubsSection) collectionHubsSection.classList.remove('hidden');
    if (headerTitle) headerTitle.textContent = 'BMMC Gramophones';
    if (headerIcon) headerIcon.textContent = '🎵';
    if (subhead) subhead.textContent = 'Gramophone Catalog (1916 – 1953): Shellac, vinyl, and early 20th-century audio recordings preserved in the BMMC music collection.';
    safeReplaceState(window.location.pathname + '#gramophone');
  } else if (tabName === 'stats') {
    if (gridPrompt) gridPrompt.classList.add('hidden');
    if (gridSection) gridSection.classList.add('hidden');
    if (exhibitsFilterGrid) exhibitsFilterGrid.classList.add('hidden');
    if (gramophoneFilterGrid) gramophoneFilterGrid.classList.add('hidden');
    if (searchSortBar) searchSortBar.classList.add('hidden');
    if (collectionHubsSection) collectionHubsSection.classList.add('hidden');
    if (statsSection) statsSection.classList.remove('hidden');
    if (headerTitle) headerTitle.textContent = 'Museum Insights Live';
    if (headerIcon) headerIcon.textContent = 'ℹ️';
    if (subhead) subhead.textContent = 'Explore live analytics, origin distribution, and chronological evolution from the Bonniefields Museum catalog.';
    safeReplaceState(window.location.pathname + '#stats');
    renderMuseumStatistics();
  }

  updateFavoritesBadge();
  if (tabName !== 'stats') {
    updateDynamicDropdowns();
    filterCatalog(true);
  }
}

function initFuseSearch() {
  if (typeof Fuse === 'undefined') return;
  if (rawExhibitsRows.length > 0) {
    const exhibitsList = rawExhibitsRows.map((row, index) => {
      const { title, details } = parseTitleAndDetails(getVal(row, colIdx.title) || getVal(row, colIdx.id));
      return { originalIndex: index, title, details, notes: getVal(row, colIdx.notes), age: getVal(row, colIdx.age), type: getVal(row, colIdx.type), category: getVal(row, colIdx.category), subcategory: getVal(row, colIdx.subcategory) };
    });
    fuseExhibits = new Fuse(exhibitsList, { keys: ['title', 'details', 'notes', 'type', 'category', 'subcategory', 'age'], threshold: 0.35, ignoreLocation: true });
  }
  if (rawGramophoneRows.length > 0) {
    const gramophoneList = rawGramophoneRows.map((row, index) => ({
      originalIndex: index, catalog: getVal(row, 0), artist: getVal(row, 1), title: getGramophoneRawTitle(row), label: getVal(row, 3), format: getVal(row, 4), year: getVal(row, 6), details: getVal(row, 12)
    }));
    fuseGramophone = new Fuse(gramophoneList, { keys: ['artist', 'title', 'label', 'catalog', 'details', 'year', 'format'], threshold: 0.35, ignoreLocation: true });
  }
}

function checkUrlQueryParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('search') || params.get('q') || params.get('query') || params.get('item');
    const tabParam = params.get('tab');

    if (tabParam === 'gramophone') setTab('gramophone');
    else if (tabParam === 'exhibits') setTab('exhibits');

    if (searchQuery) {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = searchQuery;
        updateDynamicDropdowns();
        filterCatalog(true);
        scrollToGrid();
      }
    }
  } catch (e) {
    console.warn('URL search parameter error:', e);
  }
}

// ==========================================================================
// 8. Catalog Data Loader & Initialization
// ==========================================================================
async function loadCatalogData() {
  const loadingElem = document.getElementById('loading');
  if (loadingElem) loadingElem.classList.remove('hidden');

  initTheme();
  const hadRestoredState = restoreCatalogSessionState();
  updateViewSwitcherUI();

  try {
    const [exhibitsData, gramophoneData] = await Promise.all([
      fetchDualModeCSV(REMOTE_EXHIBITS_CSV_URL, LOCAL_EXHIBITS_CSV_URL, 'bMMC_cached_exhibits'),
      fetchDualModeCSV(REMOTE_GRAMOPHONE_CSV_URL, LOCAL_GRAMOPHONE_CSV_URL, 'bMMC_cached_gramophone')
    ]);

    if (exhibitsData && exhibitsData.length > 0 && Array.isArray(exhibitsData[0])) {
      exhibitsData[0].forEach((cell, idx) => {
        const c = String(cell || '').toLowerCase().trim();
        if (c === 'no' || c === 'id' || c === 'uid' || c === 'item id') colIdx.id = idx;
        if (c === 'ref') colIdx.ref = idx;
        if (c === 'title' || c === 'content' || c === 'name') colIdx.title = idx;
        if (c === 'notes' || c.includes('note')) colIdx.notes = idx;
        if (c === '#' || c === 'item no') colIdx.itemNoM = idx;
        if (c === 'age') colIdx.age = idx;
        if (c === 'type') colIdx.type = idx;
        if (c === 'category') colIdx.category = idx;
        if (c === 'subcategory' || c.includes('sub category')) colIdx.subcategory = idx;
        if (c === '3d model' || c === '3d' || c.includes('3d')) colIdx.d3d = idx;
        if (c === 'ddoc' || (c.includes('doc') && !c.includes('banner'))) colIdx.doc = idx;
        if (c === 'dweb' || (c.includes('web') && !c.includes('banner'))) colIdx.web = idx;
        if (c === 'image 1' || c === 'img1' || (c.includes('image') && !c.includes('2'))) colIdx.img1 = idx;
        if (c === 'image 2' || c === 'img2') colIdx.img2 = idx;
        if (c === 'qty' || c === 'quantity' || c.includes('count')) colIdx.qty = idx;
        if (c === 'made' || c === 'origin' || c.includes('location')) colIdx.made = idx;
        if (c === 'year' || c === 'date' || c === 'era') colIdx.year = idx;
        if (c === 'hot') colIdx.hot = idx;
        if (c === 'lat' || c === 'latitude') colIdx.lat = idx;
        if (c === 'lng' || c === 'lon' || c === 'longitude') colIdx.lng = idx;
      });
      rawExhibitsRows = exhibitsData.slice(1);
      populateInitialDropdowns();
    }

    if (gramophoneData && gramophoneData.length > 0 && Array.isArray(gramophoneData[0])) {
      rawGramophoneRows = gramophoneData.filter(r => {
        const c0 = getVal(r, 0).toLowerCase();
        const c1 = getVal(r, 1).toLowerCase();
        return r.length >= 2 && !c0.includes('gramophone catalog') && !c0.includes('catalog#') && !c1.includes('artist');
      });
    }

    renderCollectionHubs(rawExhibitsRows);
    updateDynamicDropdowns();
    
    const hash = window.location.hash;
    if (hash === '#stats' || hash === '#info') {
      setTab('stats');
    } else if (hash && (hash.startsWith('#exhibit-') || hash.startsWith('#gramophone-'))) {
      checkUrlHashForExhibit();
    } else if (hadRestoredState && isGridActive) {
      filterCatalog(true);
    } else {
      document.getElementById('gridPrompt')?.classList.remove('hidden');
    }

    updateFavoritesBadge();
    checkUrlQueryParams();

    setTimeout(() => initFuseSearch(), 80);

  } catch (err) {
    console.error("Failed to load catalog data:", err);
    if (loadingElem) {
      loadingElem.classList.remove('hidden');
      loadingElem.innerHTML = `
        <div class="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900">
          <p class="text-rose-600 dark:text-rose-400 font-bold text-base mb-1">Catalog Archive Offline or Missing</p>
          <p class="text-xs text-slate-500 mb-4">Please check your network connection or verify local CSV files in ./data/.</p>
          <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow cursor-pointer">🔄 Reload Archive</button>
        </div>
      `;
    }
  } finally { hideLoadingSpinner(); }
}

function checkUrlHashForExhibit() {
  const hash = window.location.hash;
  if (hash === '#stats' || hash === '#info') setTab('stats');
  else if (hash && hash.startsWith('#exhibit-')) {
    const index = parseInt(hash.replace('#exhibit-', ''), 10);
    if (!isNaN(index) && rawExhibitsRows && rawExhibitsRows[index]) {
      if (currentTab !== 'exhibits') setTab('exhibits');
      openModalByOriginalIndex(index);
    }
  } else if (hash && hash.startsWith('#gramophone-')) {
    const index = parseInt(hash.replace('#gramophone-', ''), 10);
    if (!isNaN(index) && rawGramophoneRows && rawGramophoneRows[index]) {
      setTab('gramophone');
      openModalByOriginalIndex(index);
    }
  }
}

function renderCollectionHubs(rows) {
  const hubsGrid = document.getElementById('hubsGrid');
  if (!hubsGrid) return;
  hubsGrid.innerHTML = '';

  const totalExhibitsCount = rows.length;

  MAIN_HUB_CATEGORIES.forEach(catName => {
    const baseName = catName.toLowerCase().replace(/s$/, '');
    const matchingRows = rows.filter(r => {
      const c = getVal(r, colIdx.category).toLowerCase();
      const t = getVal(r, colIdx.type).toLowerCase();
      return c.includes(baseName) || t.includes(baseName);
    });
    const count = matchingRows.length;
    if (count === 0) return;

    const pctNum = totalExhibitsCount > 0 ? (count / totalExhibitsCount * 100) : 0;
    const pctDisplay = pctNum > 0 && pctNum < 1 ? pctNum.toFixed(1) : Math.round(pctNum);

    const customImg = HUB_CUSTOM_IMAGES[catName];
    const firstImgRow = matchingRows.find(r => getVal(r, colIdx.img1) !== '');
    const rawPreviewUrl = customImg || (firstImgRow ? getVal(firstImgRow, colIdx.img1) : '');
    const previewImg = formatGoogleLh3Url(rawPreviewUrl, 's200') || NO_IMAGE_SVG;
    const theme = getCategoryTheme(baseName);

    const hubCard = document.createElement('div');
    hubCard.className = `bg-white dark:bg-slate-900 rounded-2xl border-2 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group relative`;
    hubCard.style.borderColor = theme.hex;
    hubCard.innerHTML = `
      <div class="h-20 bg-slate-200/90 dark:bg-slate-950 border-b border-slate-300/80 dark:border-slate-800 relative overflow-hidden flex items-center justify-center p-1.5" style="background-color: ${theme.hex}25;">
        <img src="${previewImg}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" onError="this.src='${NO_IMAGE_SVG}'" alt="${catName}" loading="lazy" />
        <div class="absolute top-1.5 right-1.5 flex flex-col items-end gap-0.5 z-10">
          <span class="text-[9px] font-black px-2 py-0.5 rounded-full shadow-md" style="background-color: ${theme.hex}; color: ${theme.text};">${count}</span>
          <span class="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full shadow-md bg-slate-900/80 text-white backdrop-blur-sm">${pctDisplay}%</span>
        </div>
      </div>
      <div class="p-2.5 flex-1 flex flex-col justify-between">
        <h3 class="font-black text-xs line-clamp-1" style="color: ${theme.hex};">${catName}</h3>
        <span class="text-[10px] font-extrabold mt-1 flex items-center gap-0.5" style="color: ${theme.hex};">Explore →</span>
      </div>
    `;

    hubCard.addEventListener('click', () => window.selectHubCategory(catName));
    hubsGrid.appendChild(hubCard);
  });

  const gramTheme = CATEGORY_PALETTE.gramophones;
  const totalCatalogItems = totalExhibitsCount + rawGramophoneRows.length;
  const gramPctNum = totalCatalogItems > 0 ? (rawGramophoneRows.length / totalCatalogItems * 100) : 0;
  const gramPctDisplay = gramPctNum > 0 && gramPctNum < 1 ? gramPctNum.toFixed(1) : Math.round(gramPctNum);

  const gramophoneHubCard = document.createElement('div');
  gramophoneHubCard.className = 'bg-white dark:bg-slate-900 rounded-2xl border-2 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group relative';
  gramophoneHubCard.style.borderColor = gramTheme.hex;
  gramophoneHubCard.innerHTML = `
    <div class="h-20 bg-slate-200/90 dark:bg-slate-950 border-b border-slate-300/80 dark:border-slate-800 relative overflow-hidden flex items-center justify-center p-1.5 text-3xl" style="background-color: ${gramTheme.hex}25;">
      🎵
      <div class="absolute top-1.5 right-1.5 flex flex-col items-end gap-0.5 z-10">
        <span class="text-[9px] font-black px-2 py-0.5 rounded-full shadow-md" style="background-color: ${gramTheme.hex}; color: ${gramTheme.text};">${rawGramophoneRows.length}</span>
        <span class="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full shadow-md bg-slate-900/80 text-white backdrop-blur-sm">${gramPctDisplay}%</span>
      </div>
    </div>
    <div class="p-2.5 flex-1 flex flex-col justify-between">
      <h3 class="font-black text-xs line-clamp-1" style="color: ${gramTheme.hex};">Gramophones</h3>
      <span class="text-[10px] font-extrabold mt-1 flex items-center gap-0.5" style="color: ${gramTheme.hex};">1916–1953 →</span>
    </div>
  `;
  gramophoneHubCard.addEventListener('click', () => window.selectGramophoneHub());
  hubsGrid.appendChild(gramophoneHubCard);
  document.getElementById('collectionHubsSection')?.classList.remove('hidden');
}

function populateInitialDropdowns() {
  document.getElementById('sortBy')?.addEventListener('change', () => filterCatalog(true));
  document.getElementById('btnClearAllFilters')?.addEventListener('click', browseAllExhibits);
  ['filterAge', 'filterType', 'filterCategory', 'filterSubcategory', 'filterArtist', 'filterLabel', 'filterFormat', 'filterYear'].forEach(id => {
    const elem = document.getElementById(id);
    if (elem) elem.addEventListener('change', () => { 
      updateDynamicDropdowns(); 
      filterCatalog(true); 
      scrollToGrid(); 
    });
  });
}

function updateDynamicDropdowns() {
  const searchVal = (document.getElementById('searchInput')?.value || '').trim();
  const favs = getFavorites();

  if (currentTab === 'exhibits') {
    const ageVal = document.getElementById('filterAge')?.value || restoredSessionFilters.filterAge || '';
    const typeVal = document.getElementById('filterType')?.value || restoredSessionFilters.filterType || '';
    const catVal = document.getElementById('filterCategory')?.value || restoredSessionFilters.filterCategory || '';
    const subCatVal = document.getElementById('filterSubcategory')?.value || restoredSessionFilters.filterSubcategory || '';

    let matchedOriginalIndices = null;
    if (searchVal && fuseExhibits) {
      matchedOriginalIndices = new Set(fuseExhibits.search(searchVal).map(res => res.item.originalIndex));
    }

    function getExhibitRowsExcluding(excludeField) {
      return rawExhibitsRows.filter((row, originalIndex) => {
        const searchMatch = !searchVal || (matchedOriginalIndices ? matchedOriginalIndices.has(originalIndex) : row.join(' ').toLowerCase().includes(searchVal.toLowerCase()));
        const rowEra = getEraByRow(row);
        const ageMatch = excludeField === 'age' || !ageVal || (rowEra && (rowEra.short === ageVal || rowEra.full === ageVal)) || getVal(row, colIdx.year) === ageVal;
        const typeMatch = excludeField === 'type' || !typeVal || getVal(row, colIdx.type).toLowerCase().includes(typeVal.toLowerCase()) || (typeVal.toLowerCase().includes('collection') && getVal(row, colIdx.type).toLowerCase().includes('collection'));
        const catMatch = excludeField === 'category' || !catVal || getVal(row, colIdx.category).toLowerCase().includes(catVal.toLowerCase());
        const subCatMatch = excludeField === 'subcategory' || !subCatVal || getVal(row, colIdx.subcategory) === subCatVal;
        const match3D = !only3DActive || Boolean(get3DUrlForItem(row));
        const matchHot = !hotOnlyActive || isItemHot(row);
        const matchFav = !showingFavoritesOnly || favs.includes(originalIndex);

        return searchMatch && ageMatch && typeMatch && catMatch && subCatMatch && match3D && matchHot && matchFav;
      });
    }

    const ageSelect = document.getElementById('filterAge');
    if (ageSelect) {
      const rowsForAge = getExhibitRowsExcluding('age');
      const eraCounts = {};
      TIMELINE_ERAS.forEach(e => eraCounts[e.short] = 0);
      rowsForAge.forEach(r => {
        const era = getEraByRow(r);
        if (era) eraCounts[era.short] = (eraCounts[era.short] || 0) + 1;
      });
      const currAge = ageSelect.value || restoredSessionFilters.filterAge || '';
      ageSelect.innerHTML = '<option value="">All Eras / Ages</option>';
      TIMELINE_ERAS.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.short;
        opt.textContent = `${e.full} - (${eraCounts[e.short] || 0})`;
        if (e.short === currAge || e.full === currAge) {
          opt.selected = true;
          delete restoredSessionFilters.filterAge;
        }
        ageSelect.appendChild(opt);
      });
    }

    updateSelectOptions('filterType', getExhibitRowsExcluding('type').map(r => getVal(r, colIdx.type)));
    updateSelectOptions('filterCategory', getExhibitRowsExcluding('category').map(r => getVal(r, colIdx.category)));
    updateSelectOptions('filterSubcategory', getExhibitRowsExcluding('subcategory').map(r => getVal(r, colIdx.subcategory)));

  } else if (currentTab === 'gramophone') {
    const artistVal = document.getElementById('filterArtist')?.value || restoredSessionFilters.filterArtist || '';
    const labelVal = document.getElementById('filterLabel')?.value || restoredSessionFilters.filterLabel || '';
    const formatVal = document.getElementById('filterFormat')?.value || restoredSessionFilters.filterFormat || '';
    const yearVal = document.getElementById('filterYear')?.value || restoredSessionFilters.filterYear || '';

    let matchedOriginalIndices = null;
    if (searchVal && fuseGramophone) {
      matchedOriginalIndices = new Set(fuseGramophone.search(searchVal).map(res => res.item.originalIndex));
    }

    function getGramophoneRowsExcluding(excludeField) {
      return rawGramophoneRows.filter((row, originalIndex) => {
        const searchMatch = !searchVal || (matchedOriginalIndices ? matchedOriginalIndices.has(originalIndex) : row.join(' ').toLowerCase().includes(searchVal.toLowerCase()));
        const artistMatch = excludeField === 'artist' || !artistVal || getVal(row, 1) === artistVal;
        const labelMatch = excludeField === 'label' || !labelVal || getVal(row, 3) === labelVal;
        const formatMatch = excludeField === 'format' || !formatVal || getVal(row, 4) === formatVal;
        const yearMatch = excludeField === 'year' || !yearVal || getVal(row, 6) === yearVal;
        const matchFav = !showingFavoritesOnly || favs.includes(originalIndex);
        return searchMatch && artistMatch && labelMatch && formatMatch && yearMatch && matchFav;
      });
    }

    updateSelectOptions('filterArtist', getGramophoneRowsExcluding('artist').map(r => getVal(r, 1)));
    updateSelectOptions('filterLabel', getGramophoneRowsExcluding('label').map(r => getVal(r, 3)));
    updateSelectOptions('filterFormat', getGramophoneRowsExcluding('format').map(r => getVal(r, 4)));
    updateSelectOptions('filterYear', getGramophoneRowsExcluding('year').map(r => getVal(r, 6)));
  }
}

function updateSelectOptions(elementId, values) {
  const select = document.getElementById(elementId);
  if (!select) return;
  const currentSelection = select.value || restoredSessionFilters[elementId] || '';
  const counts = {};
  values.filter(Boolean).forEach(val => { counts[val] = (counts[val] || 0) + 1; });
  let uniqueValues = Object.keys(counts).sort().filter(val => {
    const lower = val.toLowerCase().trim(); return lower !== 'info' && !lower.startsWith('info:');
  });

  select.innerHTML = `<option value="">All ${elementId.replace('filter', '')}s</option>`;
  uniqueValues.forEach(val => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = `${unescapeHTML(val)} - (${counts[val] || 0})`;
    if (currentSelection && (val === currentSelection || val.toLowerCase().trim() === currentSelection.toLowerCase().trim())) {
      opt.selected = true;
      delete restoredSessionFilters[elementId];
    }
    select.appendChild(opt);
  });
}

function renderActiveFilterPills() {
  const container = document.getElementById('activeFiltersContainer');
  const bar = document.getElementById('activeFiltersBar');
  if (!container || !bar) return;

  container.innerHTML = '';
  const filters = [];
  const searchVal = document.getElementById('searchInput')?.value || '';

  if (currentTab === 'exhibits') {
    const ageVal = document.getElementById('filterAge')?.value || '';
    const typeVal = document.getElementById('filterType')?.value || '';
    const catVal = document.getElementById('filterCategory')?.value || '';
    const subCatVal = document.getElementById('filterSubcategory')?.value || '';
    
    if (searchVal) filters.push({ label: `Search: "${searchVal}"`, clear: () => { document.getElementById('clearSearch').click(); } });
    if (ageVal) filters.push({ label: `Era / Age: ${unescapeHTML(ageVal)}`, clear: () => { document.getElementById('filterAge').value = ''; } });
    if (typeVal) filters.push({ label: `Type: ${unescapeHTML(typeVal)}`, clear: () => { document.getElementById('filterType').value = ''; } });
    if (catVal) filters.push({ label: `Category: ${unescapeHTML(catVal)}`, clear: () => { document.getElementById('filterCategory').value = ''; } });
    if (subCatVal) filters.push({ label: `Subcategory: ${unescapeHTML(subCatVal)}`, clear: () => { document.getElementById('filterSubcategory').value = ''; } });
    if (only3DActive) filters.push({ label: `3D Only`, clear: () => { document.getElementById('btn3DOnly').click(); } });
    if (hotOnlyActive) filters.push({ label: `🔥 Hot Items Only`, clear: () => { document.getElementById('btnHotOnly').click(); } });
  } else if (currentTab === 'gramophone') {
    filters.push({ label: `Archive Mode: Gramophone`, clear: () => browseAllExhibits() });
    const artistVal = document.getElementById('filterArtist')?.value || '';
    const labelVal = document.getElementById('filterLabel')?.value || '';
    const formatVal = document.getElementById('filterFormat')?.value || '';
    const yearVal = document.getElementById('filterYear')?.value || '';
    if (searchVal) filters.push({ label: `Search: "${searchVal}"`, clear: () => { document.getElementById('clearSearch').click(); } });
    if (artistVal) filters.push({ label: `Artist: ${unescapeHTML(artistVal)}`, clear: () => { document.getElementById('filterArtist').value = ''; } });
    if (labelVal) filters.push({ label: `Label: ${unescapeHTML(labelVal)}`, clear: () => { document.getElementById('filterLabel').value = ''; } });
    if (formatVal) filters.push({ label: `Format: ${unescapeHTML(formatVal)}`, clear: () => { document.getElementById('filterFormat').value = ''; } });
    if (yearVal) filters.push({ label: `Year: ${unescapeHTML(yearVal)}`, clear: () => { document.getElementById('filterYear').value = ''; } });
  }
  if (showingFavoritesOnly) filters.push({ label: `Saved Items`, clear: () => { showingFavoritesOnly = false; updateFavoritesBadge(); } });

  if (filters.length > 0) {
    bar.classList.remove('hidden'); bar.classList.add('flex');
    filters.forEach(f => {
      const pill = document.createElement('span');
      pill.className = 'inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 px-2 py-0.5 rounded-full shadow-sm';
      pill.innerHTML = `${f.label} <button class="hover:text-red-500 font-bold ml-0.5 cursor-pointer">✕</button>`;
      pill.querySelector('button').addEventListener('click', () => { f.clear(); updateDynamicDropdowns(); filterCatalog(true); });
      container.appendChild(pill);
    });
  } else {
    bar.classList.add('hidden'); bar.classList.remove('flex');
  }
}

function filterCatalog(forceShowGrid = false) {
  hideLoadingSpinner();
  saveCatalogSessionState();

  const searchVal = (document.getElementById('searchInput')?.value || '').trim();
  const sortBy = document.getElementById('sortBy')?.value || 'default';
  const favs = getFavorites();

  const clearBtn = document.getElementById('clearSearch');
  if (clearBtn) clearBtn.classList.toggle('hidden', !searchVal);
  renderActiveFilterPills();

  if (currentTab === 'exhibits') {
    const ageVal = document.getElementById('filterAge')?.value || '';
    const typeVal = document.getElementById('filterType')?.value || '';
    const catVal = document.getElementById('filterCategory')?.value || '';
    const subCatVal = document.getElementById('filterSubcategory')?.value || '';
    const isFiltering = searchVal || ageVal || typeVal || catVal || subCatVal || only3DActive || hotOnlyActive || showingFavoritesOnly;

    if (isFiltering || forceShowGrid) {
      isGridActive = true;
      document.getElementById('gridPrompt')?.classList.add('hidden');
      document.getElementById('grid')?.classList.remove('hidden');
      document.getElementById('floatingJumpBtn')?.classList.remove('hidden');
    } else if (!isGridActive) {
      document.getElementById('gridPrompt')?.classList.remove('hidden');
      document.getElementById('grid')?.classList.add('hidden');
      document.getElementById('floatingJumpBtn')?.classList.add('hidden');
      const countElem = document.getElementById('itemCount');
      if (countElem) countElem.textContent = '';
      return;
    }

    let matchedOriginalIndices = null;
    if (searchVal && fuseExhibits) matchedOriginalIndices = new Set(fuseExhibits.search(searchVal).map(res => res.item.originalIndex));

    currentFilteredRows = rawExhibitsRows.map((row, index) => ({ row, originalIndex: index })).filter(({ row, originalIndex }) => {
      const searchMatch = !searchVal || (matchedOriginalIndices ? matchedOriginalIndices.has(originalIndex) : row.join(' ').toLowerCase().includes(searchVal.toLowerCase()));
      const rowEra = getEraByRow(row);
      const ageMatch = !ageVal || (rowEra && (rowEra.short === ageVal || rowEra.full === ageVal)) || getVal(row, colIdx.year) === ageVal;
      const typeMatch = !typeVal || getVal(row, colIdx.type).toLowerCase().includes(typeVal.toLowerCase()) || (typeVal.toLowerCase().includes('collection') && getVal(row, colIdx.type).toLowerCase().includes('collection'));
      const catMatch = !catVal || getVal(row, colIdx.category).toLowerCase().includes(catVal.toLowerCase());
      const subCatMatch = !subCatVal || getVal(row, colIdx.subcategory) === subCatVal;
      const match3D = !only3DActive || Boolean(get3DUrlForItem(row));
      const matchHot = !hotOnlyActive || isItemHot(row);
      const matchFav = !showingFavoritesOnly || favs.includes(originalIndex);

      return searchMatch && ageMatch && typeMatch && catMatch && subCatMatch && match3D && matchHot && matchFav;
    });

    if (catalogViewMode === 'table' && tableSortCol) {
      currentFilteredRows.sort((a, b) => {
        let valA = '', valB = '';
        if (tableSortCol === 'ref') {
          valA = getItemNumberForSort(a.row, a.originalIndex);
          valB = getItemNumberForSort(b.row, b.originalIndex);
          return tableSortDir === 'asc' ? valA - valB : valB - valA;
        } else if (tableSortCol === 'title') {
          valA = parseTitleAndDetails(getVal(a.row, colIdx.title) || '').title.toLowerCase();
          valB = parseTitleAndDetails(getVal(b.row, colIdx.title) || '').title.toLowerCase();
        } else if (tableSortCol === 'era') {
          valA = (getEraByRow(a.row)?.short || getVal(a.row, colIdx.age) || '').toLowerCase();
          valB = (getEraByRow(b.row)?.short || getVal(b.row, colIdx.age) || '').toLowerCase();
        } else if (tableSortCol === 'date') {
          valA = parseYearForSort(getVal(a.row, colIdx.year));
          valB = parseYearForSort(getVal(b.row, colIdx.year));
          return tableSortDir === 'asc' ? valA - valB : valB - valA;
        } else if (tableSortCol === 'category') {
          valA = (getVal(a.row, colIdx.category) || '').toLowerCase();
          valB = (getVal(b.row, colIdx.category) || '').toLowerCase();
        } else if (tableSortCol === 'type') {
          valA = (getVal(a.row, colIdx.type) || '').toLowerCase();
          valB = (getVal(b.row, colIdx.type) || '').toLowerCase();
        } else if (tableSortCol === 'origin') {
          valA = (getVal(a.row, colIdx.made) || '').toLowerCase();
          valB = (getVal(b.row, colIdx.made) || '').toLowerCase();
        }
        return tableSortDir === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      });
    } else {
      if (sortBy === 'title-asc') {
        currentFilteredRows.sort((a, b) => parseTitleAndDetails(getVal(a.row, colIdx.title) || getVal(a.row, colIdx.id)).title.localeCompare(parseTitleAndDetails(getVal(b.row, colIdx.title) || getVal(b.row, colIdx.id)).title));
      } else if (sortBy === 'title-desc') {
        currentFilteredRows.sort((a, b) => parseTitleAndDetails(getVal(b.row, colIdx.title) || getVal(b.row, colIdx.id)).title.localeCompare(parseTitleAndDetails(getVal(a.row, colIdx.title) || getVal(a.row, colIdx.id)).title));
      } else if (sortBy === 'age-oldest') {
        currentFilteredRows.sort((a, b) => getVal(a.row, colIdx.year).localeCompare(getVal(b.row, colIdx.year)));
      } else if (sortBy === 'age-newest') {
        currentFilteredRows.sort((a, b) => getVal(b.row, colIdx.year).localeCompare(getVal(a.row, colIdx.year)));
      }
    }

    renderExhibitsMultiView();

  } else if (currentTab === 'gramophone') {
    const artistVal = document.getElementById('filterArtist')?.value || '';
    const labelVal = document.getElementById('filterLabel')?.value || '';
    const formatVal = document.getElementById('filterFormat')?.value || '';
    const yearVal = document.getElementById('filterYear')?.value || '';
    const isFiltering = searchVal || artistVal || labelVal || formatVal || yearVal || showingFavoritesOnly;

    if (isFiltering || forceShowGrid) {
      isGridActive = true;
      document.getElementById('gridPrompt')?.classList.add('hidden');
      document.getElementById('grid')?.classList.remove('hidden');
      document.getElementById('floatingJumpBtn')?.classList.remove('hidden');
    } else if (!isGridActive) {
      document.getElementById('gridPrompt')?.classList.remove('hidden');
      document.getElementById('grid')?.classList.add('hidden');
      document.getElementById('floatingJumpBtn')?.classList.add('hidden');
      const countElem = document.getElementById('itemCount');
      if (countElem) countElem.textContent = '';
      return;
    }

    let matchedOriginalIndices = null;
    if (searchVal && fuseGramophone) matchedOriginalIndices = new Set(fuseGramophone.search(searchVal).map(res => res.item.originalIndex));

    currentFilteredRows = rawGramophoneRows.map((row, index) => ({ row, originalIndex: index })).filter(({ row, originalIndex }) => {
      const searchMatch = !searchVal || (matchedOriginalIndices ? matchedOriginalIndices.has(originalIndex) : row.join(' ').toLowerCase().includes(searchVal.toLowerCase()));
      const artistMatch = !artistVal || getVal(row, 1) === artistVal;
      const labelMatch = !labelVal || getVal(row, 3) === labelVal;
      const formatMatch = !formatVal || getVal(row, 4) === formatVal;
      const yearMatch = !yearVal || getVal(row, 6) === yearVal;
      const matchFav = !showingFavoritesOnly || favs.includes(originalIndex);
      return searchMatch && artistMatch && labelMatch && formatMatch && yearMatch && matchFav;
    });

    if (sortBy === 'default' || sortBy === 'age-oldest') {
      currentFilteredRows.sort((a, b) => parseYearForSort(getVal(a.row, 6)) - parseYearForSort(getVal(b.row, 6)));
    } else if (sortBy === 'age-newest') {
      currentFilteredRows.sort((a, b) => parseYearForSort(getVal(b.row, 6)) - parseYearForSort(getVal(a.row, 6)));
    } else if (sortBy === 'title-asc') {
      currentFilteredRows.sort((a, b) => getGramophoneRawTitle(a.row).localeCompare(getGramophoneRawTitle(b.row)));
    } else if (sortBy === 'title-desc') {
      currentFilteredRows.sort((a, b) => getGramophoneRawTitle(b.row).localeCompare(getGramophoneRawTitle(a.row)));
    }

    renderGramophoneGrid();
  }
}

function renderExhibitsMultiView() {
  if (catalogViewMode === 'table') {
    renderExhibitsTableView();
  } else if (catalogViewMode === 'photos') {
    renderExhibitsPhotoWallView();
  } else {
    renderExhibitsGrid();
  }
}

function renderExhibitsGrid() {
  const grid = document.getElementById('grid');
  const itemCount = document.getElementById('itemCount');
  const favs = getFavorites();
  const isDark = document.documentElement.classList.contains('dark');
  if (!grid) return;

  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';
  grid.innerHTML = '';
  if (itemCount) itemCount.textContent = `Showing ${currentFilteredRows.length} exhibit${currentFilteredRows.length === 1 ? '' : 's'}`;

  if (currentFilteredRows.length === 0) {
    renderEmptyState(grid);
    return;
  }

  for (let arrayIndex = 0; arrayIndex < currentFilteredRows.length; arrayIndex++) {
    const { row, originalIndex } = currentFilteredRows[arrayIndex];
    const rawContent = getVal(row, colIdx.title) || getVal(row, colIdx.id);
    const { title, details } = parseTitleAndDetails(rawContent);
    const displayTitle = title || `Exhibit Item #${originalIndex + 1}`;
    const slashFormattedTitle = formatTitleWithSlashes(displayTitle);

    const notes = getVal(row, colIdx.notes);
    const age = getVal(row, colIdx.age);
    const era = getEraByRow(row);
    const eraDisplay = era ? era.short : age;

    const type = getVal(row, colIdx.type);
    const category = getVal(row, colIdx.category);
    const subcategory = getVal(row, colIdx.subcategory);
    const ddoc = getVal(row, colIdx.doc);
    const dweb = getVal(row, colIdx.web);
    const d3d = get3DUrlForItem(row);
    const { img1, img2 } = getImagesForItem(row);
    const isHot = isItemHot(row);

    const thumbImg1 = formatGoogleLh3Url(img1, 's200');
    const thumbImg2 = formatGoogleLh3Url(img2, 's200');
    const fullImg1 = formatGoogleLh3Url(img1, 's1000');
    const fullImg2 = formatGoogleLh3Url(img2, 's1000');

    let slots = [];
    if (d3d) {
      slots.push({ type: '3d', url: d3d });
      if (img1) slots.push({ type: 'img', thumbUrl: thumbImg1, fullUrl: fullImg1 });
      if (img2) slots.push({ type: 'img', thumbUrl: thumbImg2, fullUrl: fullImg2 });
    } else {
      if (img1) slots.push({ type: 'img', thumbUrl: thumbImg1, fullUrl: fullImg1 });
      if (img2) slots.push({ type: 'img', thumbUrl: thumbImg2, fullUrl: fullImg2 });
      if (slots.length === 0) slots.push({ type: 'img', thumbUrl: NO_IMAGE_SVG, fullUrl: NO_IMAGE_SVG });
    }

    const totalSlots = slots.length;
    const isFav = favs.includes(originalIndex);
    const isCompared = compareItemIndices.has(originalIndex);
    const ageBadgeClass = getAgeBadgeStyle(eraDisplay);
    const theme = getCategoryTheme(category || type || subcategory);

    const card = document.createElement('div');
    card.className = 'rounded-3xl shadow-sm hover:shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group relative backdrop-blur-sm';
    card.style.border = `2px solid ${theme.hex}80`;
    card.style.backgroundColor = getSolidTint(theme.hex, isDark);

    let mediaItemsHTML = '';
    slots.forEach((s, sIdx) => {
      const slotNum = sIdx + 1;
      const isHidden = slotNum > 1 ? 'hidden' : 'flex';
      if (s.type === '3d') {
        mediaItemsHTML += `
          <div class="card-media-item ${isHidden} w-full h-full items-center justify-center relative pointer-events-none" data-slot-idx="${slotNum}">
            <model-viewer src="${s.url}" loading="lazy" auto-rotate rotation-per-second="20deg" interaction-prompt="none" shadow-intensity="0.4" style="width: 100%; height: 100%; display: block; --poster-color: transparent;" class="w-full h-full"></model-viewer>
            <span class="absolute bottom-2.5 left-2.5 bg-purple-600/90 text-white backdrop-blur-md text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-purple-400/40 z-10 flex items-center gap-1"><span>👓</span> 3D / AR</span>
          </div>`;
      } else {
        mediaItemsHTML += `
          <div class="card-media-item ${isHidden} w-full h-full items-center justify-center relative group/img" data-slot-idx="${slotNum}">
            <a href="${s.fullUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" title="Open full image in new tab" class="w-full h-full flex items-center justify-center">
              <img src="${s.thumbUrl}" class="max-w-full max-h-full object-contain group-hover/img:scale-105 transition-transform duration-300 drop-shadow-md" alt="${displayTitle}" loading="lazy" onError="this.src='${NO_IMAGE_SVG}'" />
            </a>
          </div>`;
      }
    });

    card.innerHTML = `
      <div id="card-media-box-${originalIndex}" data-total-slots="${totalSlots}" data-current-slot="1" class="h-56 relative overflow-hidden flex items-center justify-center p-2 group/cardimg" style="background-color: ${theme.hex}18;">
        ${mediaItemsHTML}
        <div class="absolute top-3 right-3 flex items-center gap-1.5 z-10" onclick="event.stopPropagation()">
          ${isHot ? `<span title="Hot Item" class="w-8 h-8 rounded-full bg-amber-500/90 text-white backdrop-blur-md transition shadow-md flex items-center justify-center text-[17px] leading-none font-bold pointer-events-none">🔥</span>` : ''}
          <button onclick="window.toggleCompareItem(${originalIndex}, event)" title="${isCompared ? 'Remove from comparison' : 'Compare artifact'}" class="w-8 h-8 rounded-full ${isCompared ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200'} backdrop-blur-md transition shadow-md hover:scale-110 flex items-center justify-center text-[17px] leading-none font-bold cursor-pointer">⚖️</button>
          <button onclick="toggleFavorite(${originalIndex}, event)" aria-label="Favorite item" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}" class="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md transition shadow-md hover:scale-110 flex items-center justify-center text-[17px] leading-none cursor-pointer">${isFav ? '❤️' : '🤍'}</button>
          ${notes ? `<button data-grid-audio-idx="${originalIndex}" onclick="speakAudioGuide(${originalIndex}, event)" aria-label="Listen to notes" title="Listen to Museum Notes" class="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 text-blue-600 dark:text-blue-400 backdrop-blur-md transition shadow-md hover:scale-110 flex items-center justify-center text-[17px] leading-none font-bold cursor-pointer">🔊</button>` : ''}
        </div>
        ${totalSlots > 1 ? `
          <button onclick="switchCardImage(${originalIndex}, -1, event)" title="Previous Media" aria-label="Previous Media" class="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/75 hover:bg-slate-900 text-white text-xs font-black rounded-full w-7 h-7 flex items-center justify-center backdrop-blur-md shadow-md transition hover:scale-110 z-10 cursor-pointer">❮</button>
          <button onclick="switchCardImage(${originalIndex}, 1, event)" title="Next Media" aria-label="Next Media" class="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/75 hover:bg-slate-900 text-white text-xs font-black rounded-full w-7 h-7 flex items-center justify-center backdrop-blur-md shadow-md transition hover:scale-110 z-10 cursor-pointer">❯</button>
          <span id="card-badge-${originalIndex}" class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none z-10 shadow">1 / ${totalSlots}</span>
        ` : ''}
        ${eraDisplay ? `<span class="absolute top-3 left-3 ${ageBadgeClass} backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs shadow-md pointer-events-none z-10">${eraDisplay}</span>` : ''}
      </div>
      
      <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex gap-1.5 flex-wrap text-[11px] mb-2.5 font-bold items-center">
            ${category ? createCategoryBadge(category, 'category') : ''}
            ${type ? createCategoryBadge(type, 'type') : ''}
            ${subcategory ? createCategoryBadge(subcategory, 'subcategory') : ''}
          </div>
          <h3 class="font-extrabold text-slate-900 dark:text-slate-100 text-sm mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">${slashFormattedTitle}</h3>
          <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed font-normal">${notes ? notes.replace(/^#\s*/, '') : (details || 'Click for full details and museum notes.')}</p>
        </div>
        <div class="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
          <span class="text-xs font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform" style="color: ${theme.hex};">
            View Details <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </span>
          <div class="flex gap-1.5" onclick="event.stopPropagation()">
            ${d3d ? `<button onclick="window.open3DLightbox('${encodeURIComponent(d3d)}', '${encodeURIComponent(displayTitle)}')" title="Open 3D & AR Lightbox" class="bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold border border-purple-200 dark:border-purple-800 transition shadow-sm flex items-center gap-1 cursor-pointer"><span>📱</span> 3D / AR</button>` : ''}
            ${ddoc ? `<a href="${formatDocLink(ddoc)}" target="_blank" rel="noopener noreferrer" title="Documentation" class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-800 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-sm">Doc</a>` : ''}
            ${dweb ? `<a href="${dweb}" target="_blank" rel="noopener noreferrer" title="Website" class="bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-800 transition shadow-sm">Web</a>` : ''}
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => window.openModalByFilteredIndex(arrayIndex));
    grid.appendChild(card);
  }
  updateAudioUI();
}

function renderExhibitsTableView() {
  const grid = document.getElementById('grid');
  const itemCount = document.getElementById('itemCount');
  const favs = getFavorites();
  if (!grid) return;

  grid.className = 'w-full overflow-x-auto';
  grid.innerHTML = '';
  if (itemCount) itemCount.textContent = `Showing ${currentFilteredRows.length} exhibit${currentFilteredRows.length === 1 ? '' : 's'}`;

  if (currentFilteredRows.length === 0) {
    renderEmptyState(grid);
    return;
  }

  const getSortIndicator = (colName) => {
    if (tableSortCol !== colName) return '<span class="text-slate-400 opacity-40 ml-1">▲▼</span>';
    return tableSortDir === 'asc' ? '<span class="text-blue-600 dark:text-blue-400 ml-1">▲</span>' : '<span class="text-blue-600 dark:text-blue-400 ml-1">▼</span>';
  };

  let tableHTML = `
    <div class="bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden backdrop-blur-sm">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-300 select-none">
          <tr>
            <th class="py-1.5 px-2.5 w-12 text-center">Media</th>
            <th onclick="window.sortTableByColumn('ref')" class="py-1.5 px-2.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">REF / #${getSortIndicator('ref')}</th>
            <th onclick="window.sortTableByColumn('title')" class="py-1.5 px-2.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">Title ${getSortIndicator('title')}</th>
            <th onclick="window.sortTableByColumn('era')" class="py-1.5 px-2.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">Era ${getSortIndicator('era')}</th>
            <th onclick="window.sortTableByColumn('date')" class="py-1.5 px-2.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">Date ${getSortIndicator('date')}</th>
            <th onclick="window.sortTableByColumn('category')" class="py-1.5 px-2.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">Category ${getSortIndicator('category')}</th>
            <th onclick="window.sortTableByColumn('type')" class="py-1.5 px-2.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">Type ${getSortIndicator('type')}</th>
            <th onclick="window.sortTableByColumn('origin')" class="py-1.5 px-2.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">Origin ${getSortIndicator('origin')}</th>
            <th class="py-1.5 px-2.5 text-right w-20">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-300 text-xs">
  `;

  currentFilteredRows.forEach(({ row, originalIndex }, arrayIndex) => {
    const rawContent = getVal(row, colIdx.title) || getVal(row, colIdx.id);
    const { title } = parseTitleAndDetails(rawContent);
    const displayTitle = title || `Exhibit Item #${originalIndex + 1}`;
    const itemNo = getVal(row, colIdx.itemNoM) || getVal(row, colIdx.id) || `#${originalIndex + 1}`;
    const era = getEraByRow(row);
    const eraDisplay = era ? era.short : getVal(row, colIdx.age);
    const category = getVal(row, colIdx.category);
    const type = getVal(row, colIdx.type);
    const made = getVal(row, colIdx.made);
    const year = getVal(row, colIdx.year);
    const isFav = favs.includes(originalIndex);
    const isCompared = compareItemIndices.has(originalIndex);
    const d3d = get3DUrlForItem(row);
    const { img1 } = getImagesForItem(row);
    const thumbImg = formatGoogleLh3Url(img1, 's100') || NO_IMAGE_SVG;

    tableHTML += `
      <tr onclick="window.openModalByFilteredIndex(${arrayIndex})" class="hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer transition whitespace-nowrap">
        <td class="py-1.5 px-2.5 text-center">
          <div class="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto">
            <img src="${thumbImg}" class="max-w-full max-h-full object-contain" alt="${escapeHTML(displayTitle)}" loading="lazy" />
          </div>
        </td>
        <td class="py-1.5 px-2.5 font-mono text-[11px] text-slate-500">${escapeHTML(itemNo)}</td>
        <td class="py-1.5 px-2.5 font-extrabold text-slate-900 dark:text-white max-w-xs truncate">${escapeHTML(displayTitle)}</td>
        <td class="py-1.5 px-2.5">${eraDisplay ? `<span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${getAgeBadgeStyle(eraDisplay)}">${escapeHTML(eraDisplay)}</span>` : '—'}</td>
        <td class="py-1.5 px-2.5">${escapeHTML(year || '—')}</td>
        <td class="py-1.5 px-2.5">${escapeHTML(category || 'General')}</td>
        <td class="py-1.5 px-2.5 text-slate-500">${escapeHTML(type || '—')}</td>
        <td class="py-1.5 px-2.5">${escapeHTML(made || '—')}</td>
        <td class="py-1.5 px-2.5 text-right" onclick="event.stopPropagation()">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="window.toggleCompareItem(${originalIndex}, event)" title="${isCompared ? 'Remove from compare' : 'Compare'}" class="p-1 rounded-md text-[16px] leading-none font-bold ${isCompared ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'} cursor-pointer">⚖️</button>
            ${d3d ? `<span class="text-purple-600 dark:text-purple-400 font-bold text-xs" title="3D / AR Available">👓</span>` : ''}
            <button onclick="toggleFavorite(${originalIndex}, event)" class="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-[16px] leading-none cursor-pointer">${isFav ? '❤️' : '🤍'}</button>
          </div>
        </td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table></div>`;
  grid.innerHTML = tableHTML;
}

function renderExhibitsPhotoWallView() {
  const grid = document.getElementById('grid');
  const itemCount = document.getElementById('itemCount');
  const favs = getFavorites();
  const isDark = document.documentElement.classList.contains('dark');
  if (!grid) return;

  grid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';
  grid.innerHTML = '';
  if (itemCount) itemCount.textContent = `Showing ${currentFilteredRows.length} exhibit${currentFilteredRows.length === 1 ? '' : 's'}`;

  if (currentFilteredRows.length === 0) {
    renderEmptyState(grid);
    return;
  }

  currentFilteredRows.forEach(({ row, originalIndex }, arrayIndex) => {
    const rawContent = getVal(row, colIdx.title) || getVal(row, colIdx.id);
    const { title } = parseTitleAndDetails(rawContent);
    const displayTitle = title || `Exhibit Item #${originalIndex + 1}`;
    const category = getVal(row, colIdx.category);
    const type = getVal(row, colIdx.type);
    const subcategory = getVal(row, colIdx.subcategory);
    const { img1 } = getImagesForItem(row);
    const thumbImg = formatGoogleLh3Url(img1, 's500') || NO_IMAGE_SVG;
    const isFav = favs.includes(originalIndex);
    const isCompared = compareItemIndices.has(originalIndex);
    const d3d = get3DUrlForItem(row);
    const theme = getCategoryTheme(category || type || subcategory);

    const card = document.createElement('div');
    card.className = 'relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer group flex items-center justify-center p-2 transition-all duration-300 transform hover:-translate-y-1';
    card.style.border = `2px solid ${theme.hex}80`;
    card.style.backgroundColor = getSolidTint(theme.hex, isDark);
    
    card.innerHTML = `
      ${d3d ? `
        <div class="w-full h-full flex items-center justify-center pointer-events-none">
          <model-viewer src="${d3d}" loading="lazy" auto-rotate rotation-per-second="20deg" interaction-prompt="none" shadow-intensity="0.4" style="width: 100%; height: 100%; display: block; --poster-color: transparent;" class="w-full h-full"></model-viewer>
        </div>
      ` : `
        <img src="${thumbImg}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md" alt="${escapeHTML(displayTitle)}" loading="lazy" />
      `}
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
        <div class="flex justify-between items-center" onclick="event.stopPropagation()">
          ${d3d ? `<span class="bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow flex items-center gap-1"><span>📱</span> 3D / AR</span>` : `<span></span>`}
          <div class="flex items-center gap-1.5">
            <button onclick="window.toggleCompareItem(${originalIndex}, event)" class="w-7 h-7 rounded-full flex items-center justify-center ${isCompared ? 'bg-indigo-600 text-white' : 'bg-slate-900/80 text-white'} text-[15px] leading-none shadow cursor-pointer">⚖️</button>
            <button onclick="toggleFavorite(${originalIndex}, event)" class="w-7 h-7 rounded-full flex items-center justify-center bg-slate-900/80 text-[15px] leading-none shadow cursor-pointer">${isFav ? '❤️' : '🤍'}</button>
          </div>
        </div>
        <p class="text-[11px] font-bold text-white line-clamp-2 leading-tight drop-shadow">${escapeHTML(displayTitle)}</p>
      </div>
    `;

    card.addEventListener('click', () => window.openModalByFilteredIndex(arrayIndex));
    grid.appendChild(card);
  });
}

function renderGramophoneGrid() {
  const grid = document.getElementById('grid');
  const itemCount = document.getElementById('itemCount');
  const favs = getFavorites();
  const isDark = document.documentElement.classList.contains('dark');
  if (!grid) return;

  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5';
  grid.innerHTML = '';
  if (itemCount) itemCount.textContent = `Showing ${currentFilteredRows.length} gramophone record${currentFilteredRows.length === 1 ? '' : 's'}`;

  if (currentFilteredRows.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 backdrop-blur-sm">
        <span class="text-3xl mb-2 block">🎵</span>
        <p class="text-slate-600 dark:text-slate-300 font-bold text-sm">No gramophone records match your selected filters.</p>
        <button onclick="browseAllExhibits()" class="mt-3 text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer">Return to Main Museum Exhibits</button>
      </div>`;
    return;
  }

  const gramTheme = CATEGORY_PALETTE.gramophones;

  currentFilteredRows.forEach(({ row, originalIndex }, arrayIndex) => {
    const artist = getVal(row, 1) || 'Unknown Artist';
    const rawTitle = getGramophoneRawTitle(row);
    const formattedTitleHTML = formatGramophoneTitle(rawTitle);
    const label = getVal(row, 3);
    const format = unescapeHTML(getVal(row, 4)) || '78 RPM';
    const released = getVal(row, 6);
    const discogsUrl = getDiscogsUrl(row);
    const hasDiscogsRecording = checkIfHasRecording(row);
    const hasArchiveRecording = (getVal(row, 11) || '').toLowerCase().includes('yes');
    const isFav = favs.includes(originalIndex);
    const catalogNum = getVal(row, 0);
    const archiveUrl = buildArchiveSearchUrl(rawTitle, catalogNum);

    const card = document.createElement('div');
    card.className = 'rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group relative backdrop-blur-sm';
    card.style.border = `2px solid ${gramTheme.hex}A0`;
    card.style.backgroundColor = getSolidTint(gramTheme.hex, isDark);

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-1.5 flex-wrap">
            ${released ? `<span class="bg-amber-500/90 text-slate-950 font-black px-3 py-1 rounded-xl text-xs shadow-sm">${released}</span>` : '<span class="bg-slate-200 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-xl text-xs font-bold">19??</span>'}
            ${label ? `<span class="text-[10px] font-bold bg-amber-100/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-300/80 dark:border-amber-800/80">${label}</span>` : ''}
            ${format ? `<span class="text-[10px] font-bold bg-slate-200/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg">${format}</span>` : ''}
          </div>
          <button onclick="toggleFavorite(${originalIndex}, event)" aria-label="Favorite item" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-[17px] leading-none transition cursor-pointer">${isFav ? '❤️' : '🤍'}</button>
        </div>
        <p class="text-xs font-black text-amber-700 dark:text-amber-400 mb-1 tracking-wide uppercase">${artist}</p>
        <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">${formattedTitleHTML}</h3>
      </div>

      <div class="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2" onclick="event.stopPropagation()">
        <span class="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          View Details <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </span>
        <div class="flex items-center gap-1.5 flex-wrap justify-end">
          ${hasDiscogsRecording ? `<a href="${discogsUrl || '#'}" target="_blank" rel="noopener noreferrer" class="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm transition hover:bg-emerald-600 flex items-center gap-1">🎙️ Discogs Recording</a>` : ''}
          ${hasArchiveRecording ? `<a href="${archiveUrl}" target="_blank" rel="noopener noreferrer" class="bg-sky-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm transition hover:bg-sky-700 flex items-center gap-1">📻 Archives 78s Recording ↗</a>` : ''}
          ${discogsUrl && !hasDiscogsRecording ? `<a href="${discogsUrl}" target="_blank" rel="noopener noreferrer" class="bg-slate-800 hover:bg-black text-white px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm">📀 Discogs ↗</a>` : ''}
        </div>
      </div>
    `;
    card.addEventListener('click', () => window.openModalByFilteredIndex(arrayIndex));
    grid.appendChild(card);
  });
}

function openEnlargeModal(url, isInteractive) {
  const modal = document.getElementById('enlargeModal');
  const body = document.getElementById('enlargeModalBody');
  if (!modal || !body) return;
  if (isInteractive) body.innerHTML = `<iframe src="${url}" class="w-full h-full border-0 bg-white rounded-2xl shadow-2xl" title="Full Scale View"></iframe>`;
  else body.innerHTML = `<img src="${formatGoogleLh3Url(url, 's1000')}" class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" alt="Full Scale Image" />`;
  modal.classList.remove('hidden'); document.body.classList.add('overflow-hidden');
}

function closeEnlargeModal() {
  const modal = document.getElementById('enlargeModal');
  const body = document.getElementById('enlargeModalBody');
  if (modal) modal.classList.add('hidden');
  if (body) body.innerHTML = '';
  const detailModal = document.getElementById('detailModal');
  if (!detailModal || detailModal.classList.contains('hidden')) {
    document.body.classList.remove('overflow-hidden');
  }
}

// ==========================================================================
// 9. Statistics & Charts Visualizer
// ==========================================================================
function renderMuseumStatistics() {
  const mapIframe = document.getElementById('statMapIframe');
  if (mapIframe) {
    const currentSrc = mapIframe.getAttribute('src') || mapIframe.src || '';
    if ((!currentSrc || currentSrc === 'about:blank') && mapIframe.dataset.src) {
      mapIframe.src = mapIframe.dataset.src;
    }
  }

  if (typeof Chart === 'undefined' || !rawExhibitsRows || rawExhibitsRows.length === 0) return;
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#cbd5e1' : '#334155';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  let itemsSumQty = 0, validYears = [], colPreCount = 0, colPostCount = 0;
  const locationCounts = {}, dateTypeMap = {}, allTypesSet = new Set();
  const subcatCatMap = {}, allSubcatsSet = new Set(), allCategoriesSet = new Set();
  const eraCounts = {};
  TIMELINE_ERAS.forEach(e => eraCounts[e.short] = 0);

  const targetRow2 = rawExhibitsRows[0];

  if (targetRow2) {
    const introText = unescapeHTML(getVal(targetRow2, colIdx.notes) || getVal(targetRow2, colIdx.title));
    const introCard = document.getElementById('statIntroCard');
    const introTextElem = document.getElementById('statIntroText');
    if (introText && introTextElem && introCard) { introTextElem.textContent = introText; introCard.classList.remove('hidden'); }
    else if (introCard) introCard.classList.add('hidden');

    const docUrl = getVal(targetRow2, colIdx.doc);
    const webUrl = getVal(targetRow2, colIdx.web);
    const docElem = document.getElementById('statDocLink');
    const webElem = document.getElementById('statWebLink');

    if (docElem) {
      if (docUrl) { docElem.href = formatDocLink(docUrl); docElem.classList.remove('hidden'); }
      else { docElem.classList.add('hidden'); }
    }
    if (webElem) {
      if (webUrl && (webUrl.startsWith('http') || webUrl.length > 5)) { webElem.href = webUrl.startsWith('http') ? webUrl : `https://${webUrl}`; webElem.classList.remove('hidden'); }
      else { webElem.classList.add('hidden'); }
    }

    const titleDetailsCard = document.getElementById('statTitleDetailsCard');
    const titleDetailsContent = document.getElementById('statTitleDetailsContent');

    if (titleDetailsCard && titleDetailsContent) {
      let rawTitleColC = unescapeHTML(getVal(targetRow2, colIdx.title) || getVal(targetRow2, 2) || '');
      if (rawTitleColC) {
        let postHashText = rawTitleColC;
        if (postHashText.includes('#')) {
          postHashText = postHashText.substring(postHashText.indexOf('#') + 1).trim();
        }

        postHashText = postHashText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
        const firstBreak = postHashText.indexOf('\n');
        let firstLine = '';
        let bodyText = '';

        if (firstBreak !== -1) {
          firstLine = postHashText.substring(0, firstBreak).trim();
          bodyText = postHashText.substring(firstBreak + 1).trim();
        } else {
          firstLine = postHashText;
        }

        if (firstLine) {
          let formattedHTML = `<div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">${escapeHTML(firstLine)}</div>`;
          
          if (bodyText) {
            const paragraphs = bodyText.split(/\n\s*\n/);
            formattedHTML += paragraphs
              .map(p => `<p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal mb-4 last:mb-0 whitespace-pre-line">${escapeHTML(p.trim())}</p>`)
              .join('');
          }
          
          titleDetailsContent.innerHTML = formattedHTML;
          titleDetailsCard.classList.remove('hidden');
        } else {
          titleDetailsCard.classList.add('hidden');
        }
      } else {
        titleDetailsCard.classList.add('hidden');
      }
    }
  }

  rawExhibitsRows.forEach(row => {
    const qtyNum = parseInt(getVal(row, colIdx.qty).replace(/[^0-9]/g, ''), 10);
    const itemQty = (!isNaN(qtyNum) && qtyNum > 0) ? qtyNum : 1;
    itemsSumQty += itemQty;

    const era = getEraByRow(row);
    if (era) eraCounts[era.short] = (eraCounts[era.short] || 0) + itemQty;

    const yearStr = getVal(row, colIdx.year);
    const yearMatch = (yearStr || '').match(/-?\d+/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0], 10);
      if (year < 1950) colPreCount += itemQty;
      else colPostCount += itemQty;
    }

    let yearNum = null;
    if (yearMatch) yearNum = parseInt(yearMatch[0], 10);
    if (yearNum) validYears.push(yearNum);

    if (yearNum && yearNum >= 1800) {
      const rawType = getVal(row, colIdx.type);
      if (rawType && rawType.toLowerCase().trim() !== 'general') {
        allTypesSet.add(rawType);
        const roundedPeriod = `${Math.floor(yearNum / 10) * 10}s`;
        if (!dateTypeMap[roundedPeriod]) dateTypeMap[roundedPeriod] = {};
        dateTypeMap[roundedPeriod][rawType] = (dateTypeMap[roundedPeriod][rawType] || 0) + itemQty;
      }
    }

    const rawCat = getVal(row, colIdx.category);
    const rawSubcat = getVal(row, colIdx.subcategory);
    if (rawCat && rawSubcat) {
      allCategoriesSet.add(rawCat);
      allSubcatsSet.add(rawSubcat);
      if (!subcatCatMap[rawCat]) subcatCatMap[rawCat] = {};
      subcatCatMap[rawCat][rawSubcat] = (subcatCatMap[rawCat][rawSubcat] || 0) + itemQty;
    }

    let rawLoc = getVal(row, colIdx.made);
    if (rawLoc) {
      const country = normalizeCountry(rawLoc);
      if (country) locationCounts[country] = (locationCounts[country] || 0) + itemQty;
    }
  });

  const timelineEraGrid = document.getElementById('timelineEraGrid');
  if (timelineEraGrid) {
    timelineEraGrid.className = "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5";
    timelineEraGrid.innerHTML = '';

    const totalMuseumItems = rawExhibitsRows.length;
    const eraColors = ['#7c3aed', '#d97706', '#dc2626', '#059669', '#e11d48', '#0284c7', '#4f46e5'];

    TIMELINE_ERAS.forEach((e, idx) => {
      const eraRows = rawExhibitsRows.filter(r => {
        const era = getEraByRow(r);
        return era && era.short === e.short;
      });
      const count = eraRows.length;
      const pctNum = totalMuseumItems > 0 ? (count / totalMuseumItems * 100) : 0;
      const pctDisplay = pctNum > 0 && pctNum < 1 ? pctNum.toFixed(1) : Math.round(pctNum);

      const customImg = TIMELINE_CUSTOM_IMAGES[e.key] || TIMELINE_CUSTOM_IMAGES[e.short];
      const firstImgRow = eraRows.find(r => getVal(r, colIdx.img1) !== '');
      const rawPreviewUrl = customImg || (firstImgRow ? getVal(firstImgRow, colIdx.img1) : '');
      const previewImg = formatGoogleLh3Url(rawPreviewUrl, 's200') || NO_IMAGE_SVG;
      const hexColor = eraColors[idx % eraColors.length];

      const card = document.createElement('div');
      card.className = 'bg-white dark:bg-slate-900 rounded-2xl border-2 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group relative';
      card.style.borderColor = hexColor;
      card.innerHTML = `
        <div class="h-20 bg-slate-200/90 dark:bg-slate-950 border-b border-slate-300/80 dark:border-slate-800 relative overflow-hidden flex items-center justify-center p-1.5" style="background-color: ${hexColor}25;">
          <img src="${previewImg}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" onError="this.src='${NO_IMAGE_SVG}'" alt="${e.short}" loading="lazy" />
          <div class="absolute top-1.5 right-1.5 flex flex-col items-end gap-0.5 z-10">
            <span class="text-[9px] font-black px-2 py-0.5 rounded-full shadow-md" style="background-color: ${hexColor}; color: #ffffff;">${count}</span>
            <span class="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full shadow-md bg-slate-900/80 text-white backdrop-blur-sm">${pctDisplay}%</span>
          </div>
        </div>
        <div class="p-2.5 flex-1 flex flex-col justify-between">
          <h3 class="font-black text-xs line-clamp-1" style="color: ${hexColor};">${e.short}</h3>
          <span class="text-[10px] font-extrabold mt-1 flex items-center gap-0.5" style="color: ${hexColor};">Explore →</span>
        </div>
      `;
      card.addEventListener('click', () => {
        setTab('exhibits');
        const ageSel = document.getElementById('filterAge');
        if (ageSel) ageSel.value = e.short;
        updateDynamicDropdowns(); filterCatalog(true); scrollToGrid();
      });
      timelineEraGrid.appendChild(card);
    });

    const interestRows = rawExhibitsRows.filter(r => getVal(r, colIdx.type).toLowerCase().includes('item') && getVal(r, colIdx.type).toLowerCase().includes('interest'));
    const interestCount = interestRows.length;
    const interestPctNum = totalMuseumItems > 0 ? (interestCount / totalMuseumItems * 100) : 0;
    const interestPctDisplay = interestPctNum > 0 && interestPctNum < 1 ? interestPctNum.toFixed(1) : Math.round(interestPctNum);
    const interestCustomImg = TIMELINE_CUSTOM_IMAGES["Items of interest"] || TIMELINE_CUSTOM_IMAGES["Items of Interest"] || TIMELINE_CUSTOM_IMAGES["Itmes of Interest"];
    const firstInterestImgRow = interestRows.find(r => getVal(r, colIdx.img1) !== '');
    const rawInterestUrl = interestCustomImg || (firstInterestImgRow ? getVal(firstInterestImgRow, colIdx.img1) : '');
    const interestPreviewImg = formatGoogleLh3Url(rawInterestUrl, 's200') || NO_IMAGE_SVG;
    const interestColor = '#D97706';

    const interestCard = document.createElement('div');
    interestCard.className = 'bg-white dark:bg-slate-900 rounded-2xl border-2 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group relative';
    interestCard.style.borderColor = interestColor;
    interestCard.innerHTML = `
      <div class="h-20 bg-slate-200/90 dark:bg-slate-950 border-b border-slate-300/80 dark:border-slate-800 relative overflow-hidden flex items-center justify-center p-1.5" style="background-color: ${interestColor}25;">
        <img src="${interestPreviewImg}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" onError="this.src='${NO_IMAGE_SVG}'" alt="Items of interest" loading="lazy" />
        <div class="absolute top-1.5 right-1.5 flex flex-col items-end gap-0.5 z-10">
          <span class="text-[9px] font-black px-2 py-0.5 rounded-full shadow-md" style="background-color: ${interestColor}; color: #ffffff;">${interestCount}</span>
          <span class="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full shadow-md bg-slate-900/80 text-white backdrop-blur-sm">${interestPctDisplay}%</span>
        </div>
      </div>
      <div class="p-2.5 flex-1 flex flex-col justify-between">
        <h3 class="font-black text-xs line-clamp-1" style="color: ${interestColor};">Items of Interest</h3>
        <span class="text-[10px] font-extrabold mt-1 flex items-center gap-0.5" style="color: ${interestColor};">Explore →</span>
      </div>
    `;
    interestCard.addEventListener('click', () => {
      setTab('exhibits');
      const typeSelect = document.getElementById('filterType');
      if (typeSelect) {
        typeSelect.value = '';
        for (let opt of typeSelect.options) {
          if (opt.value.toLowerCase().includes('item') && opt.value.toLowerCase().includes('interest')) {
            typeSelect.value = opt.value; break;
          }
        }
      }
      updateDynamicDropdowns(); filterCatalog(true); scrollToGrid();
    });
    timelineEraGrid.appendChild(interestCard);
  }

  const statTotal = document.getElementById('statTotalItems');
  const statDate = document.getElementById('statDateRange');
  if (statTotal) statTotal.textContent = itemsSumQty > 0 ? itemsSumQty.toLocaleString() : '1,193';
  if (statDate) {
    if (validYears.length > 0) statDate.textContent = `${Math.min(...validYears)} – ${Math.max(...validYears)}`;
    else statDate.textContent = 'N/A';
  }

  const totalAgeItems = colPreCount + colPostCount;
  const preElem = document.getElementById('statPre1950');
  const postElem = document.getElementById('statPost1950');
  if (totalAgeItems > 0) {
    const prePct = Math.round((colPreCount / totalAgeItems) * 100);
    const postPct = 100 - prePct;
    if (preElem) preElem.innerHTML = `Pre 1950: <span class="text-purple-600 dark:text-purple-400 font-black">${prePct}% (${colPreCount})</span>`;
    if (postElem) postElem.innerHTML = `Post 1950: <span class="text-pink-600 dark:text-pink-400 font-black">${postPct}% (${colPostCount})</span>`;
  }

  if (chartStackedInstance) chartStackedInstance.destroy();
  if (chartLocationsInstance) chartLocationsInstance.destroy();
  if (chartSubcatCategoryInstance) chartSubcatCategoryInstance.destroy();

  setTimeout(() => {
    const periodsSorted = Object.keys(dateTypeMap).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const typesArray = Array.from(allTypesSet);
    const stackedDatasets = typesArray.map((type, idx) => ({
      label: unescapeHTML(type),
      data: periodsSorted.map(p => dateTypeMap[p][type] || 0),
      backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length],
      borderWidth: 0, borderRadius: 4
    }));

    const canvasStacked = document.getElementById('chartStackedDateType');
    if (canvasStacked) {
      chartStackedInstance = new Chart(canvasStacked.getContext('2d'), {
        type: 'bar',
        data: { labels: periodsSorted, datasets: stackedDatasets },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: textColor, font: { family: 'Inter, system-ui', size: 11, weight: '600' } } }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { stacked: true, grace: '10%', grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter, system-ui', size: 10 } } },
            y: { stacked: true, grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter, system-ui', size: 10, weight: '600' } } }
          }
        }
      });
    }

    const topLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const canvasLoc = document.getElementById('chartLocations');
    if (canvasLoc) {
      chartLocationsInstance = new Chart(canvasLoc.getContext('2d'), {
        type: 'bar',
        data: { labels: topLocations.map(l => unescapeHTML(l[0])), datasets: [{ label: 'Items Preserved', data: topLocations.map(l => l[1]), backgroundColor: '#3182CE', borderRadius: 8 }] },
        options: {
          responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter, system-ui', size: 10, weight: '600' } } },
            y: { grace: '12%', grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter, system-ui', size: 10 } } }
          }
        }
      });
    }

    const categoriesArray = Array.from(allCategoriesSet);
    const subcatsArray = Array.from(allSubcatsSet);

    const subcatTotals = {};
    subcatsArray.forEach(subcat => {
      let sum = 0;
      categoriesArray.forEach(cat => { sum += (subcatCatMap[cat] && subcatCatMap[cat][subcat]) || 0; });
      subcatTotals[subcat] = sum;
    });

    const sortedSubcats = subcatsArray.sort((a, b) => subcatTotals[b] - subcatTotals[a]);
    const subcatLabelsWithTotals = sortedSubcats.map(subcat => `${unescapeHTML(subcat)} (${subcatTotals[subcat]})`);

    const subcatDatasets = categoriesArray.map((cat, idx) => ({
      label: unescapeHTML(cat),
      data: sortedSubcats.map(subcat => (subcatCatMap[cat] && subcatCatMap[cat][subcat]) || 0),
      backgroundColor: SUBCAT_PALETTE[idx % SUBCAT_PALETTE.length],
      borderWidth: 0, borderRadius: 4
    }));

    const canvasSubcat = document.getElementById('chartSubcatCategory');
    if (canvasSubcat) {
      chartSubcatCategoryInstance = new Chart(canvasSubcat.getContext('2d'), {
        type: 'bar',
        data: { labels: subcatLabelsWithTotals, datasets: subcatDatasets },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: textColor, font: { family: 'Inter, system-ui', size: 11, weight: '600' } } },
            tooltip: {
              mode: 'index', intersect: false,
              callbacks: {
                footer: (tooltipItems) => {
                  let total = 0;
                  tooltipItems.forEach(i => { total += i.parsed.x; });
                  return `Total Subcategory Items: ${total}`;
                }
              }
            }
          },
          scales: {
            x: { stacked: true, grace: '10%', grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter, system-ui', size: 10 } } },
            y: { stacked: true, grid: { display: false }, ticks: { autoSkip: false, color: textColor, font: { family: 'Inter, system-ui', size: 10, weight: '600' } } }
          }
        }
      });
    }
  }, 50);
}

// ==========================================================================
// 10. 3D Model Lightbox & WebAR Modal
// ==========================================================================
function open3DLightbox(rawUrl, rawTitle) {
  const modal = document.getElementById('lightbox3DModal');
  const titleElem = document.getElementById('lightboxTitle');
  const viewer = document.getElementById('lightboxViewer');
  const spinner = document.getElementById('lightboxSpinner');
  const scaleText = document.getElementById('lightboxScaleText');

  if (!modal || !viewer || !rawUrl) return;

  if (typeof window.closeBMMCDrawer === 'function') window.closeBMMCDrawer();

  let url = rawUrl;
  let title = rawTitle || 'Interactive 3D Model';
  try { url = decodeURIComponent(rawUrl); } catch(e) {}
  try { title = decodeURIComponent(rawTitle); } catch(e) {}

  if (titleElem) titleElem.textContent = title;
  if (scaleText) scaleText.textContent = 'Calculating Dimensions...';
  update3DSkyboxUI();

  function hideSpinner() { 
    if (spinner) { 
      spinner.style.opacity = '0'; 
      setTimeout(() => { spinner.style.display = 'none'; }, 200); 
    } 
  }
  
  function showSpinner() { 
    if (spinner) { 
      spinner.style.display = 'flex'; 
      spinner.style.opacity = '1'; 
    } 
  }

  function updateLightboxDimensions() {
    try {
      const dims = viewer.getDimensions();
      if (dims && dims.x != null) {
        const mmX = Math.round(dims.x * 1000);
        const mmY = Math.round(dims.y * 1000);
        const mmZ = Math.round(dims.z * 1000);
        if (scaleText) scaleText.textContent = `${mmX} × ${mmY} × ${mmZ} mm | Interactive Scale Reference`;
      }
    } catch (e) {
      if (scaleText) scaleText.textContent = 'Scale Reference Available';
    }
  }

  modal.classList.remove('hidden');

  if (viewer.src === url || viewer.getAttribute('src') === url) {
    hideSpinner();
    if (viewer.loaded) {
      updateLightboxDimensions();
    } else {
      showSpinner();
      viewer.addEventListener('load', () => { hideSpinner(); updateLightboxDimensions(); }, { once: true });
    }
    return;
  }

  showSpinner();
  const onLoad = () => {
    hideSpinner();
    updateLightboxDimensions();
    viewer.removeEventListener('load', onLoad);
    viewer.removeEventListener('error', onError);
  };

  const onError = () => {
    hideSpinner();
    showToast('Failed to load 3D model file', '⚠️');
    viewer.removeEventListener('load', onLoad);
    viewer.removeEventListener('error', onError);
  };

  viewer.addEventListener('load', onLoad);
  viewer.addEventListener('error', onError);
  viewer.src = url;

  setTimeout(() => {
    if (viewer.loaded) { hideSpinner(); updateLightboxDimensions(); }
  }, 1800);
}

function close3DLightbox() {
  const modal = document.getElementById('lightbox3DModal');
  if (modal) modal.classList.add('hidden');
  const detailModal = document.getElementById('detailModal');
  if (!detailModal || detailModal.classList.contains('hidden')) {
    document.body.classList.remove('overflow-hidden');
  }
}

// ==========================================================================
// 11. Exhibit Detail Modal Manager
// ==========================================================================
function openModalByOriginalIndex(origIdx) {
  if (currentTab !== 'exhibits') setTab('exhibits');
  
  if (rawExhibitsRows[origIdx]) {
    isGridActive = true;
    document.getElementById('gridPrompt')?.classList.add('hidden');
    document.getElementById('grid')?.classList.remove('hidden');
    document.getElementById('gridSection')?.classList.remove('hidden');
    document.getElementById('statsSection')?.classList.add('hidden');

    const filteredIndex = currentFilteredRows.findIndex(item => item.originalIndex === origIdx);
    if (filteredIndex !== -1) {
      currentModalIndex = filteredIndex;
      openModal(currentFilteredRows[filteredIndex].row, origIdx);
    } else {
      currentModalIndex = 0;
      openModal(rawExhibitsRows[origIdx], origIdx);
    }
  }
}

function openModalByFilteredIndex(filteredIndex) {
  if (filteredIndex < 0 || filteredIndex >= currentFilteredRows.length) return;
  currentModalIndex = filteredIndex;
  const { row, originalIndex } = currentFilteredRows[filteredIndex];
  openModal(row, originalIndex);
}

function getRelatedExhibits(currentRow, currentOriginalIndex, limit) {
  limit = limit || 4;
  if (!rawExhibitsRows || rawExhibitsRows.length === 0) return [];
  const currentCat = getVal(currentRow, colIdx.category).toLowerCase();
  const currentEra = getEraByRow(currentRow);
  const currentEraKey = currentEra ? currentEra.short : '';

  const candidates = rawExhibitsRows
    .map(function(r, idx) { return { row: r, originalIndex: idx }; })
    .filter(function(item) { return item.originalIndex !== currentOriginalIndex; });

  candidates.forEach(function(item) {
    let score = 0;
    const cat = getVal(item.row, colIdx.category).toLowerCase();
    const era = getEraByRow(item.row);
    const eraKey = era ? era.short : '';

    if (currentCat && cat && (cat === currentCat || cat.includes(currentCat))) score += 3;
    if (currentEraKey && eraKey && eraKey === currentEraKey) score += 2;
    item.score = score;
  });

  return candidates
    .filter(function(item) { return item.score > 0; })
    .sort(function(a, b) { return b.score - a.score; })
    .slice(0, limit);
}

function openModal(row, originalIndex) {
  stopAudioGuide();
  if (typeof window.closeBMMCDrawer === 'function') window.closeBMMCDrawer();

  const modalContainer = document.getElementById('modalContainer');
  const modalContent = document.getElementById('modalContent');
  const counterElem = document.getElementById('modalCounter');
  const prevBtn = document.getElementById('modalPrevBtn');
  const nextBtn = document.getElementById('modalNextBtn');
  const favs = getFavorites();
  const isFav = favs.includes(originalIndex);
  const isCompared = compareItemIndices.has(originalIndex);
  const isDark = document.documentElement.classList.contains('dark');

  if (currentTab === 'exhibits') {
    safeReplaceState(`${window.location.pathname}#exhibit-${originalIndex}`);
    const rawContent = getVal(row, colIdx.title) || getVal(row, colIdx.id);
    const parsed = parseTitleAndDetails(rawContent);
    const displayTitle = parsed.title || `Exhibit Item Details`;

    const notes = getVal(row, colIdx.notes);
    const age = getVal(row, colIdx.age);
    const era = getEraByRow(row);
    const eraDisplay = era ? era.short : age;

    const type = getVal(row, colIdx.type);
    const category = getVal(row, colIdx.category);
    const subcategory = getVal(row, colIdx.subcategory);
    const ddoc = getVal(row, colIdx.doc);
    const dweb = getVal(row, colIdx.web);
    const d3d = get3DUrlForItem(row);
    const images = getImagesForItem(row);
    const img1 = images.img1;
    const img2 = images.img2;
    const isHot = isItemHot(row);
    const ageBadgeClass = getAgeBadgeStyle(eraDisplay);
    const cleanedDetails = cleanDetailsForModal(parsed.details);
    const theme = getCategoryTheme(category || type || subcategory);

    let latRaw = getVal(row, colIdx.lat);
    let lngRaw = getVal(row, colIdx.lng);
    let latVal = parseCoord(latRaw);
    let lngVal = parseCoord(lngRaw);

    if ((isNaN(latVal) || isNaN(lngVal)) && latRaw.includes(',')) {
      const parts = latRaw.split(',');
      if (parts.length === 2) {
        latVal = parseCoord(parts[0]);
        lngVal = parseCoord(parts[1]);
      }
    }

    const hasCoordinates = !isNaN(latVal) && !isNaN(lngVal) && latVal >= -90 && latVal <= 90 && lngVal >= -180 && lngVal <= 180;

    const modalImg1 = formatGoogleLh3Url(img1, 's600');
    const modalImg2 = formatGoogleLh3Url(img2, 's600');
    const fullImg1 = formatGoogleLh3Url(img1, 's1000');
    const fullImg2 = formatGoogleLh3Url(img2, 's1000');

    const relatedExhibits = getRelatedExhibits(row, originalIndex, 4);
    const relatedHTML = relatedExhibits.length > 0 ? `
      <div class="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>🏛️ Related Artifacts (${category || eraDisplay})</span>
          <span class="text-[10px] font-normal text-slate-400">Click to explore</span>
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          ${relatedExhibits.map(function(rel) {
            const relTitle = parseTitleAndDetails(getVal(rel.row, colIdx.title) || getVal(rel.row, colIdx.id)).title;
            const relImg = formatGoogleLh3Url(getImagesForItem(rel.row).img1, 's200') || NO_IMAGE_SVG;
            return `
              <div onclick="window.openModalByOriginalIndex(${rel.originalIndex})" class="bg-slate-50 dark:bg-slate-900/90 rounded-xl p-2 border border-slate-200 dark:border-slate-800 hover:border-blue-500 cursor-pointer transition flex flex-col shadow-sm">
                <div class="h-20 w-full rounded-lg overflow-hidden bg-slate-200/80 dark:bg-slate-950 flex items-center justify-center mb-1.5">
                  <img src="${relImg}" class="max-w-full max-h-full object-contain" onError="this.src='${NO_IMAGE_SVG}'" alt="${escapeHTML(relTitle)}" />
                </div>
                <p class="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1 leading-tight">${escapeHTML(relTitle)}</p>
                <span class="text-[9px] text-blue-600 dark:text-blue-400 font-extrabold mt-0.5">Explore →</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : '';

    if (modalContainer) {
      modalContainer.style.borderColor = theme.hex;
      modalContainer.style.borderWidth = '3px';
      modalContainer.style.backgroundColor = getSolidTint(theme.hex, isDark);
    }

    if (currentModalIndex !== -1 && currentFilteredRows.length > 0) {
      if (counterElem) counterElem.textContent = `${currentModalIndex + 1} of ${currentFilteredRows.length}`;
      if (prevBtn) {
        prevBtn.disabled = currentModalIndex === 0;
        prevBtn.classList.toggle('opacity-40', currentModalIndex === 0);
      }
      if (nextBtn) {
        nextBtn.disabled = currentModalIndex === currentFilteredRows.length - 1;
        nextBtn.classList.toggle('opacity-40', currentModalIndex === currentFilteredRows.length - 1);
      }
    } else {
      if (counterElem) counterElem.textContent = '';
    }

    const shareBtn = document.getElementById('btnShareExhibit');
    if (shareBtn) {
      shareBtn.onclick = function() {
        navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#exhibit-${originalIndex}`).then(function() {
          showToast('Link copied to clipboard!', '🔗');
        });
      };
    }

    if (modalContent) {
      modalContent.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div class="flex flex-col space-y-4 order-2 lg:order-1">
            <div class="flex items-start justify-between gap-3">
              <h2 id="modalTitle" class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">${displayTitle}</h2>
              <div class="flex items-center gap-2 shrink-0">
                ${isHot ? `<span title="Hot Item" class="text-base sm:text-lg px-2 py-0.5 bg-amber-500/20 rounded-full border border-amber-400/40 leading-none flex items-center justify-center">🔥</span>` : ''}
                <button onclick="window.toggleCompareItem(${originalIndex})" class="px-3 py-1.5 rounded-full text-xs font-black border transition flex items-center gap-1 cursor-pointer ${isCompared ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'}">⚖️ ${isCompared ? 'Comparing' : 'Compare'}</button>
                <button onclick="toggleFavorite(${originalIndex}, event)" class="px-3.5 py-1.5 rounded-full text-xs font-black border transition flex items-center gap-1 cursor-pointer ${isFav ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'}">${isFav ? '❤️ Saved' : '🤍 Save'}</button>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 text-xs items-center">
              ${eraDisplay ? `<span class="${ageBadgeClass} px-2.5 py-0.5 rounded-full shadow-sm"><strong>Era:</strong> ${eraDisplay}</span>` : ''}
              ${category ? createCategoryBadge(category, 'category') : ''}
              ${type ? createCategoryBadge(type, 'type') : ''}
              ${subcategory ? createCategoryBadge(subcategory, 'subcategory') : ''}
              ${hasCoordinates ? `<button onclick="window.showExhibitOnMap(${originalIndex})" title="View origin on 2D map" class="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow transition flex items-center gap-1 cursor-pointer">📍 Show on Map ↗</button>` : ''}
            </div>

            ${cleanedDetails ? `
              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Details</h4>
                <div class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-inner">${cleanedDetails}</div>
              </div>` : ''}

            ${notes ? `
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <h4 class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Museum Notes</h4>
                  <div class="flex items-center gap-1">
                    <button id="btnAudioGuide" data-row="${originalIndex}" onclick="speakAudioGuide(${originalIndex})" class="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black transition shadow cursor-pointer">🔊 Listen</button>
                    <select id="voiceSelect" class="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5 font-medium max-w-[100px] truncate outline-none cursor-pointer"></select>
                  </div>
                </div>
                <div class="text-sm text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-line bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-inner">${notes}</div>
              </div>` : ''}

            <div class="flex flex-wrap items-center gap-2.5 pt-2">
              <button id="btnGoogleSearchMain" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer">🔍 Google Item</button>
              ${hasCoordinates ? `<button onclick="window.showExhibitOnMap(${originalIndex})" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">🗺️ Locate Origin Map</button>` : ''}
              <button onclick="window.printMuseumPlacard(rawExhibitsRows[${originalIndex}], ${originalIndex})" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer">🖨️ Print Display Placard</button>
            </div>

            <div class="flex flex-wrap gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              ${d3d ? `<button onclick="window.open3DLightbox('${encodeURIComponent(d3d)}', '${encodeURIComponent(displayTitle)}')" class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-purple-500/25 transition flex items-center gap-1.5 cursor-pointer"><span>📱 View in 3D / AR ↗</span></button>` : ''}
              ${ddoc ? `<a href="${formatDocLink(ddoc)}" target="_blank" rel="noopener noreferrer" class="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow transition">Documentation ↗</a>` : ''}
              ${dweb ? `<a href="${dweb}" target="_blank" rel="noopener noreferrer" class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-500/25 transition">Web Link ↗</a>` : ''}
            </div>
          </div>

          <div class="flex flex-col space-y-4 w-full order-1 lg:order-2">
            ${d3d ? `
              <div class="relative group/model w-full">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1">
                    <span>👓</span> Interactive 3D Model &amp; AR
                  </p>
                  <div class="flex items-center gap-2">
                    <button id="btnToggleModalSkybox" onclick="toggleModal3DSkybox(event)" class="text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md transition border border-slate-300 dark:border-slate-700 cursor-pointer">${is3DSkyboxLight ? '🌙 Dark Sky' : '☀️ Light Sky'}</button>
                    <button onclick="window.open3DLightbox('${encodeURIComponent(d3d)}', '${encodeURIComponent(displayTitle)}')" class="text-[10px] font-bold text-purple-600 dark:text-purple-300 hover:underline cursor-pointer">Expand Fullscreen ⤢</button>
                  </div>
                </div>
                <div id="modal3DContainer" class="w-full h-64 sm:h-72 ${is3DSkyboxLight ? 'bg-slate-100' : 'bg-slate-900'} rounded-2xl overflow-hidden shadow-inner border border-indigo-500/30 relative cursor-pointer transition-colors duration-300">
                  <model-viewer 
                    id="modal3DViewer" 
                    src="${d3d}" 
                    ar 
                    ar-modes="webxr scene-viewer quick-look" 
                    ar-scale="auto" 
                    camera-controls 
                    auto-rotate 
                    shadow-intensity="1.2" 
                    exposure="1.1" 
                    style="width: 100%; height: 100%; display: block; --poster-color: transparent;" 
                    class="w-full h-full">
                    
                    <button slot="ar-button" class="absolute top-2.5 left-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg border border-purple-300/40 flex items-center gap-1.5 active:scale-95 transition-all z-20 cursor-pointer" onclick="event.stopPropagation()">
                      <span>📱</span>
                      <span>Place in Room (AR)</span>
                    </button>
                  </model-viewer>

                  <span id="modal3DScaleBadge" class="absolute bottom-2.5 right-2.5 bg-slate-900/85 text-white backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 shadow border border-slate-700/60 pointer-events-none flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span id="modal3DScaleText">Calculating...</span>
                  </span>
                </div>
              </div>` : ''}

            <div class="grid grid-cols-1 gap-4 w-full">
              ${img1 ? `
                <div class="w-full">
                  <p class="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">${d3d ? 'Second Media (Image 1)' : 'Primary Image'}</p>
                  <a href="${fullImg1 || modalImg1}" target="_blank" rel="noopener noreferrer" title="Click to view full image" class="block group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 shadow-md w-full" style="border-color: ${theme.hex}80;">
                    <img src="${modalImg1}" class="w-full ${!img2 ? 'max-h-[520px] min-h-[220px]' : 'h-52 sm:h-56'} object-contain rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-lg" onError="this.src='${NO_IMAGE_SVG}'" alt="${displayTitle}" loading="lazy" />
                    <span class="absolute bottom-2.5 right-2.5 bg-blue-600/90 text-white backdrop-blur-md text-[9px] font-black px-2.5 py-1 rounded-lg shadow pointer-events-none">Full Image ↗</span>
                  </a>
                </div>` : ''}

              ${img2 ? `
                <div class="w-full">
                  <p class="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">${d3d ? 'Third Media (Image 2)' : 'Secondary Image (Alternate View)'}</p>
                  <a href="${fullImg2 || modalImg2}" target="_blank" rel="noopener noreferrer" title="Click to view image" class="block group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 shadow-md w-full" style="border-color: ${theme.hex}80;">
                    <img src="${modalImg2}" class="w-full h-52 sm:h-56 object-contain rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-lg" onError="this.src='${NO_IMAGE_SVG}'" alt="${displayTitle}" loading="lazy" />
                    <span class="absolute bottom-2.5 right-2.5 bg-blue-600/90 text-white backdrop-blur-md text-[9px] font-black px-2.5 py-1 rounded-lg shadow pointer-events-none">Full Image ↗</span>
                  </a>
                </div>` : ''}
            </div>
          </div>
        </div>
        ${relatedHTML}
      `;
    }

    const btnMain = document.getElementById('btnGoogleSearchMain');
    if (btnMain) btnMain.onclick = function() { googleItemSearch(displayTitle, category, parsed.details); };
    populateVoiceDropdown();

    const modalViewer = document.getElementById('modal3DViewer');
    const modalScaleText = document.getElementById('modal3DScaleText');
    if (modalViewer) {
      const updateModalDims = function() {
        try {
          const dims = modalViewer.getDimensions();
          if (dims && dims.x != null) {
            const mmX = Math.round(dims.x * 1000);
            const mmY = Math.round(dims.y * 1000);
            const mmZ = Math.round(dims.z * 1000);
            if (modalScaleText) modalScaleText.textContent = `${mmX} × ${mmY} × ${mmZ} mm`;
          }
        } catch (e) {
          if (modalScaleText) modalScaleText.textContent = 'Scale Available';
        }
      };

      if (modalViewer.loaded) updateModalDims();
      else modalViewer.addEventListener('load', updateModalDims, { once: true });
    }

  } else {
    safeReplaceState(`${window.location.pathname}#gramophone-${originalIndex}`);
    const catalogNum = getVal(row, 0);
    const artist = getVal(row, 1) || 'Unknown Artist';
    const rawTitle = getGramophoneRawTitle(row);
    const formattedTitleHTML = formatGramophoneTitle(rawTitle);
    const label = getVal(row, 3) || 'Unspecified Label';
    const format = unescapeHTML(getVal(row, 4)) || '';
    const released = getVal(row, 6) || '';
    const colMDetails = getVal(row, 12);
    const discogsUrl = getDiscogsUrl(row);
    const hasDiscogsRecording = checkIfHasRecording(row);
    const hasArchiveRecording = (getVal(row, 11) || '').toLowerCase().includes('yes');
    const archiveUrl = buildArchiveSearchUrl(rawTitle, catalogNum);
    const ytQuery = encodeURIComponent(`${unescapeHTML(artist)} ${unescapeHTML(rawTitle)}`.replace(/^[AB][\s\.:-]+/gi, '').trim()).replace(/%20/g, '+');
    const gramTheme = CATEGORY_PALETTE.gramophones;

    if (modalContainer) {
      modalContainer.style.borderColor = gramTheme.hex;
      modalContainer.style.borderWidth = '3px';
      modalContainer.style.backgroundColor = getSolidTint(gramTheme.hex, isDark);
    }

    if (currentModalIndex !== -1 && currentFilteredRows.length > 0) {
      if (counterElem) counterElem.textContent = `${currentModalIndex + 1} of ${currentFilteredRows.length}`;
      if (prevBtn) {
        prevBtn.disabled = currentModalIndex === 0;
        prevBtn.classList.toggle('opacity-40', currentModalIndex === 0);
      }
      if (nextBtn) {
        nextBtn.disabled = currentModalIndex === currentFilteredRows.length - 1;
        nextBtn.classList.toggle('opacity-40', currentModalIndex === currentFilteredRows.length - 1);
      }
    } else {
      if (counterElem) counterElem.textContent = '';
    }

    const shareBtn = document.getElementById('btnShareExhibit');
    if (shareBtn) {
      shareBtn.onclick = function() {
        navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#gramophone-${originalIndex}`).then(function() {
          showToast('Record link copied to clipboard!', '🔗');
        });
      };
    }

    if (modalContent) {
      modalContent.innerHTML = `
        <div class="flex items-start justify-between gap-4 mb-2">
          <div><h2 id="modalTitle" class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">${formattedTitleHTML}</h2></div>
          <button onclick="toggleFavorite(${originalIndex}, event)" class="px-3.5 py-1.5 rounded-full text-xs font-black border transition flex items-center gap-1 shrink-0 cursor-pointer ${isFav ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'}">${isFav ? '❤️ Saved' : '🤍 Save'}</button>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs mb-4">
          ${released ? `<span class="bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-400/40 px-3 py-0.5 rounded-full font-black"><strong>Year:</strong> ${released}</span>` : ''}
          ${label ? `<span class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3 py-0.5 rounded-full font-medium"><strong>Label:</strong> ${label}</span>` : ''}
          ${format ? `<span class="bg-blue-500/20 text-blue-900 dark:text-blue-300 border border-blue-400/40 px-3 py-0.5 rounded-full font-medium"><strong>Format:</strong> ${format}</span>` : ''}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 items-stretch">
          <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 rounded-2xl p-6 text-center flex flex-col items-center justify-center relative shadow-inner border border-amber-500/30 h-full min-h-[180px]">
            <div class="w-32 h-32 rounded-full border-4 border-amber-500/30 bg-slate-950 flex items-center justify-center shadow-2xl relative">
              <div class="w-12 h-12 rounded-full bg-amber-600 border-2 border-amber-300 flex items-center justify-center text-[9px] font-black text-amber-100 text-center p-1 leading-tight">${label}</div>
            </div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 flex flex-col justify-center">
            <p><strong>Artist:</strong> <span class="font-bold text-slate-900 dark:text-white">${artist}</span></p>
            <p><strong>Record Label:</strong> ${label}</p>
            ${format ? `<p><strong>Format:</strong> ${format}</p>` : ''}
            <p><strong>Release Year:</strong> ${released || 'Unknown'}</p>
            ${catalogNum ? `<p><strong>Catalog No.:</strong> <span class="font-mono font-bold text-amber-600 dark:text-amber-300">${catalogNum}</span></p>` : ''}
          </div>
        </div>

        ${colMDetails ? `
          <div class="mb-5">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Details</h4>
            <div class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-inner">${colMDetails}</div>
          </div>` : ''}

        <div class="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          ${discogsUrl ? `
            <a href="${discogsUrl}" target="_blank" rel="noopener noreferrer" class="bg-slate-800 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black shadow transition flex items-center gap-2">
              <span>${hasDiscogsRecording ? '📀 Discogs Recording ↗' : '📀 Discogs ↗'}</span>
              ${hasDiscogsRecording ? `<span class="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">🎙️ Recording</span>` : ''}
            </a>` : ''}

          ${hasArchiveRecording ? `<a href="${archiveUrl}" target="_blank" rel="noopener noreferrer" class="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow transition flex items-center gap-2"><span>📻 Archives 78s Recording ↗</span></a>` : ''}

          ${!hasDiscogsRecording && !hasArchiveRecording ? `
            <a href="https://www.youtube.com/results?search_query=${ytQuery}" target="_blank" rel="noopener noreferrer" class="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5"><span>🎵 Search YouTube ↗</span></a>
            <a href="${archiveUrl}" target="_blank" rel="noopener noreferrer" class="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5" title="Search the 78 RPM Collection on Internet Archive"><span>📻 Search Archive 78s ↗</span></a>` : ''}
        </div>`;
    }
  }

  document.body.classList.add('overflow-hidden');
  document.getElementById('detailModal')?.classList.remove('hidden');
  document.getElementById('closeModal')?.focus();
}

function closeModal() {
  stopAudioGuide();
  document.body.classList.remove('overflow-hidden');
  document.getElementById('detailModal')?.classList.add('hidden');
  safeReplaceState(window.location.pathname);
}

function scrollToGrid() {
  const header = document.getElementById('mainHeader');
  const headerHeight = header ? header.offsetHeight : 100;
  const gridElem = document.getElementById('gridSection');
  if (!gridElem) return;
  const targetPos = gridElem.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
  window.scrollTo({ top: Math.max(0, targetPos), behavior: 'smooth' });
}

// ==========================================================================
// 12. Global Window Exports & Event Listeners
// ==========================================================================
window.setTab = setTab;
window.browseAllExhibits = browseAllExhibits;
window.openModalByOriginalIndex = openModalByOriginalIndex;
window.openModalByFilteredIndex = openModalByFilteredIndex;
window.openExhibitModal = openModalByOriginalIndex;
window.printMuseumPlacard = printMuseumPlacard;
window.printCuratorPocketPassport = printCuratorPocketPassport;
window.toggleCompareItem = toggleCompareItem;
window.clearCompareItems = clearCompareItems;
window.openCompareModal = openCompareModal;
window.closeCompareModal = closeCompareModal;
window.open3DLightbox = open3DLightbox;
window.close3DLightbox = close3DLightbox;
window.closeEnlargeModal = closeEnlargeModal;
window.switchCardImage = switchCardImage;
window.speakAudioGuide = speakAudioGuide;
window.stopAudioGuide = stopAudioGuide;
window.toggleModal3DSkybox = toggleModal3DSkybox;
window.togglePoppyMotion = togglePoppyMotion;

function initApp() {
  document.getElementById('brandLogoLink')?.addEventListener('click', (e) => { e.preventDefault(); browseAllExhibits(); });
  document.getElementById('btnBrowseAllHeader')?.addEventListener('click', browseAllExhibits);
  document.getElementById('btnBrowseAllPrompt')?.addEventListener('click', browseAllExhibits);
  document.getElementById('btnSurprise')?.addEventListener('click', () => {
    const rows = (currentTab === 'gramophone') ? rawGramophoneRows : rawExhibitsRows;
    if (!rows || rows.length === 0) return;
    if (currentTab === 'stats') setTab('exhibits');
    if (!isGridActive) filterCatalog(true);
    openModalByOriginalIndex(Math.floor(Math.random() * rows.length));
  });

  document.getElementById('btnThemeToggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    localStorage.setItem('bMMC_theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
  });

  const toggleControlsBtn = document.getElementById('toggleControlsBtn');
  if (toggleControlsBtn) toggleControlsBtn.addEventListener('click', () => toggleCollapsibleControls());

  document.getElementById('btnViewGrid')?.addEventListener('click', () => setCatalogViewMode('grid'));
  document.getElementById('btnViewTable')?.addEventListener('click', () => setCatalogViewMode('table'));
  document.getElementById('btnViewPhotos')?.addEventListener('click', () => setCatalogViewMode('photos'));

  document.getElementById('btnOpenCompareModal')?.addEventListener('click', openCompareModal);
  document.getElementById('btnClearCompare')?.addEventListener('click', clearCompareItems);
  document.getElementById('btnClearCompareInModal')?.addEventListener('click', clearCompareItems);
  document.getElementById('btnCloseCompareModal')?.addEventListener('click', closeCompareModal);
  document.getElementById('compareModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('compareModal')) closeCompareModal();
  });

  document.getElementById('btn3DOnly')?.addEventListener('click', () => {
    if (currentTab !== 'exhibits') setTab('exhibits');
    only3DActive = !only3DActive;
    document.getElementById('btn3DOnly')?.classList.toggle('ring-2', only3DActive);
    if (only3DActive) showToast(only3DActive ? 'Showing 3D Models Only' : '3D Filter Cleared', '👓');
    saveCatalogSessionState();
    filterCatalog(true);
  });

  document.getElementById('btnHotOnly')?.addEventListener('click', () => {
    if (currentTab !== 'exhibits') setTab('exhibits');
    hotOnlyActive = !hotOnlyActive;
    document.getElementById('btnHotOnly')?.classList.toggle('ring-2', hotOnlyActive);
    if (hotOnlyActive) showToast(hotOnlyActive ? 'Showing Hot Items Only' : 'Hot Filter Cleared', '🔥');
    saveCatalogSessionState();
    filterCatalog(true);
  });

  document.getElementById('btnFavorites')?.addEventListener('click', () => {
    showingFavoritesOnly = !showingFavoritesOnly;
    updateFavoritesBadge();
    saveCatalogSessionState();
    filterCatalog(true);
  });

  document.getElementById('floatingJumpBtn')?.addEventListener('click', () => {
    toggleCollapsibleControls(false); scrollToGrid();
  });

  const searchInputElem = document.getElementById('searchInput');
  if (searchInputElem) {
    searchInputElem.addEventListener('input', (e) => {
      const val = e.target.value;
      const cleanVal = val.trim();
      try {
        const url = new URL(window.location);
        if (cleanVal) {
          url.searchParams.set('search', cleanVal);
        } else {
          url.searchParams.delete('search');
          url.searchParams.delete('q');
          url.searchParams.delete('query');
        }
        safeReplaceState(url.pathname + (url.search ? url.search : '') + (url.hash ? url.hash : ''));
      } catch (err) {}

      handleSearchInputSuggestions(val);
      filterCatalog(true);
    });

    searchInputElem.addEventListener('focus', (e) => {
      handleSearchInputSuggestions(e.target.value);
    });
  }

  const clearSearchBtn = document.getElementById('clearSearch');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      const searchInp = document.getElementById('searchInput');
      if (searchInp) searchInp.value = '';
      hideSearchSuggestions();
      try {
        const url = new URL(window.location);
        url.searchParams.delete('search');
        url.searchParams.delete('q');
        url.searchParams.delete('query');
        safeReplaceState(url.pathname + (url.search ? url.search : '') + (url.hash ? url.hash : ''));
      } catch (err) {}
      filterCatalog(true);
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchInput') && !e.target.closest('#searchSuggestionsBox')) {
      hideSearchSuggestions();
    }
  });

  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  document.getElementById('detailModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('detailModal')) closeModal(); });
  document.getElementById('close3DLightbox')?.addEventListener('click', close3DLightbox);
  document.getElementById('lightbox3DModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('lightbox3DModal')) close3DLightbox(); });
  document.getElementById('enlargeModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('enlargeModal')) closeEnlargeModal(); });
  document.getElementById('modalPrevBtn')?.addEventListener('click', () => { if (currentModalIndex > 0) openModalByFilteredIndex(currentModalIndex - 1); });
  document.getElementById('modalNextBtn')?.addEventListener('click', () => { if (currentModalIndex < currentFilteredRows.length - 1) openModalByFilteredIndex(currentModalIndex + 1); });

  let touchStartX = 0;
  let touchStartY = 0;
  const modalContainer = document.getElementById('modalContainer');

  modalContainer?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  modalContainer?.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        if (currentModalIndex < currentFilteredRows.length - 1) openModalByFilteredIndex(currentModalIndex + 1);
      } else {
        if (currentModalIndex > 0) openModalByFilteredIndex(currentModalIndex - 1);
      }
    }
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('detailModal');
    const lightbox = document.getElementById('lightbox3DModal');
    const enlargeModal = document.getElementById('enlargeModal');
    const compareModal = document.getElementById('compareModal');

    if (e.key === 'Escape') {
      hideSearchSuggestions();
      if (typeof window.closeBMMCDrawer === 'function') window.closeBMMCDrawer();
      if (compareModal && !compareModal.classList.contains('hidden')) { closeCompareModal(); return; }
      if (enlargeModal && !enlargeModal.classList.contains('hidden')) { closeEnlargeModal(); return; }
      if (lightbox && !lightbox.classList.contains('hidden')) { close3DLightbox(); return; }
      if (modal && !modal.classList.contains('hidden')) { closeModal(); return; }
    }
    if (modal && modal.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft' && currentModalIndex > 0) openModalByFilteredIndex(currentModalIndex - 1);
    if (e.key === 'ArrowRight' && currentModalIndex < currentFilteredRows.length - 1) openModalByFilteredIndex(currentModalIndex + 1);
  });

  window.addEventListener('hashchange', checkUrlHashForExhibit);

  window.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'MAP_READY') {
      isMapIframeReady = true;
      if (pendingMapExhibitIndex !== null) {
        const mapIframe = document.getElementById('statMapIframe');
        mapIframe?.contentWindow?.postMessage({
          type: 'FOCUS_EXHIBIT',
          exhibit: pendingMapExhibitIndex
        }, '*');
        pendingMapExhibitIndex = null;
      }
    }

    if (event.data.type === 'BMMC_OPEN_ITEM' || event.data.action === 'openExhibit') {
      const exhibitNum = event.data.exhibit !== undefined ? event.data.exhibit : event.data.id;
      if (typeof closeEnlargeModal === 'function') closeEnlargeModal();
      if (typeof close3DLightbox === 'function') close3DLightbox();
      if (typeof closeCompareModal === 'function') closeCompareModal();
      if (typeof window.closeBMMCDrawer === 'function') window.closeBMMCDrawer();
      if (exhibitNum !== undefined && exhibitNum !== null) {
        openModalByOriginalIndex(Number(exhibitNum));
      }
    }
  });

  loadCatalogData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}