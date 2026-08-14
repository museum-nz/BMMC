const EXHIBITS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1U3V1JIatKpTOyAHEMnscs0mdZ4vDNf4C7eX_fuUbj_s/gviz/tq?tqx=out:csv&gid=1146027655';
const GRAMOPHONE_CSV_URL = 'https://docs.google.com/spreadsheets/d/1U3V1JIatKpTOyAHEMnscs0mdZ4vDNf4C7eX_fuUbj_s/gviz/tq?tqx=out:csv&gid=606568772';
const NO_IMAGE_SVG = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23f1f5f9%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%2394a3b8%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E';

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
  "Itmes of Interest": "https://lh3.googleusercontent.com/d/1mNQ9DZlCobUg1C25JwRlJj_hUxCrWDXf=s200"
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
  { key: 'Interwar', short: 'Interwar', full: 'Interwar / Depression (1919–1938)', min: 1919, max: 1938 },
  { key: 'WWII', short: 'WWII', full: 'World War II (1939–1945)', min: 1939, max: 1945 },
  { key: 'Post War', short: 'Post War', full: 'Post & Cold War (1946–1999)', min: 1946, max: 1999 },
  { key: 'Modern', short: 'Modern', full: 'Millennium & Modern (2000–Present)', min: 2000, max: 9999 }
];

function getEraByYear(yearNum) {
  if (yearNum === null || yearNum === undefined || isNaN(yearNum)) return null;
  return TIMELINE_ERAS.find(e => yearNum >= e.min && yearNum <= e.max) || null;
}

// Strictly extracts year ONLY from Column Y ("Year")
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
    return `rgb(${Math.round(15 * 0.96 + r * 0.04)}, ${Math.round(23 * 0.96 + g * 0.04)}, ${Math.round(42 * 0.96 + b * 0.04)})`;
  } else {
    return `rgb(${Math.round(255 * 0.96 + r * 0.04)}, ${Math.round(255 * 0.96 + g * 0.04)}, ${Math.round(255 * 0.96 + b * 0.04)})`;
  }
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
let currentTab = 'exhibits';
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

let colIdx = { id: 0, ref: 1, title: 2, notes: 4, itemNoM: 12, age: 13, type: 14, category: 15, subcategory: 16, d3d: 17, doc: 18, web: 19, img1: 20, img2: 21, qty: 22, made: 23, year: 24, hot: 25 };
let chartStackedInstance = null;
let chartLocationsInstance = null;
let chartSubcatCategoryInstance = null;
let fuseExhibits = null;
let fuseGramophone = null;

const CHART_PALETTE = ['#C85A32', '#3B7A57', '#B57C1E', '#3182CE', '#708259', '#20807E', '#4A5568', '#D99B43', '#7c3aed', '#db2777'];

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

async function fetchCSVWithCache(url, cacheKey) {
  try {
    const cached = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(`${cacheKey}_time`);
    if (cached && cacheTime && (Date.now() - Number(cacheTime) < CACHE_TTL_MS)) {
      const parsedData = JSON.parse(cached);
      if (Array.isArray(parsedData) && parsedData.length > 1) {
        return parsedData;
      }
    }
  } catch (e) {
    console.warn('localStorage read error:', e);
  }

  const res = await fetch(url);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });

  if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 1) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(parsed.data));
      localStorage.setItem(`${cacheKey}_time`, Date.now());
    } catch (e) {
      console.warn('localStorage write error:', e);
    }
  }

  return parsed.data;
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
  const toast = document.getElementById('toast');
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

function initTheme() {
  const savedTheme = localStorage.getItem('bMMC_theme');
  const isDark = savedTheme === 'dark';
  if (isDark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  updateThemeUI(isDark);
}

function updateThemeUI(isDark) {
  const icon = document.getElementById('themeToggleIcon');
  const text = document.getElementById('themeToggleText');
  if (icon && text) { icon.textContent = isDark ? '☀️' : '🌙'; text.textContent = 'Mode'; }
  if (currentTab === 'stats') renderMuseumStatistics();
  else if (isGridActive) filterCatalog(true);
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

function scrollToGrid() {
  const header = document.getElementById('mainHeader');
  const headerHeight = header ? header.offsetHeight : 100;
  const gridElem = document.getElementById('gridSection');
  if (!gridElem) return;
  const targetPos = gridElem.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
  window.scrollTo({ top: Math.max(0, targetPos), behavior: 'smooth' });
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

function formatGoogleLh3Url(url, size = 's200') {
  if (!url) return '';
  url = String(url).trim();
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;

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
  if (str.includes('#model=')) str = str.split('#model=').pop();
  else if (str.includes('model=')) str = str.split('model=').pop();
  else if (str.includes('url=')) str = str.split('url=').pop();
  else {
    const lastHttp = Math.max(str.lastIndexOf('https://'), str.lastIndexOf('http://'));
    if (lastHttp > 0) str = str.substring(lastHttp);
  }
  str = str.trim();
  if (!str.startsWith('http://') && !str.startsWith('https://')) return '';
  const lower = str.toLowerCase();
  const isGLB = lower.includes('.glb') || lower.includes('.gltf');
  const isDropbox3D = lower.includes('dropbox.com') || lower.includes('dropboxusercontent.com');
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
  const colVVal = extractDirect3DUrl(getVal(row, colIdx.img2));
  if (colVVal) return colVVal;
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
      if (val && val.startsWith('http') && (val.includes('drive.google') || val.includes('lh3.google') || val.includes('dropbox') || /\.(jpg|jpeg|png|webp|gif)/i.test(val))) {
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
    if (isPoppyMotionActive) {
      skyBg.classList.add('poppies-animated');
    } else {
      skyBg.classList.remove('poppies-animated');
    }
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

function browseAllExhibits() {
  hideLoadingSpinner();
  if (currentTab !== 'exhibits') setTab('exhibits');
  ['searchInput', 'filterAge', 'filterType', 'filterCategory', 'filterSubcategory', 'filterArtist', 'filterLabel', 'filterFormat', 'filterYear'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  only3DActive = false; hotOnlyActive = false; showingFavoritesOnly = false;
  const btn3D = document.getElementById('btn3DOnly'); if (btn3D) btn3D.classList.remove('ring-2', 'ring-purple-300', 'from-purple-700', 'to-indigo-700');
  const btnHot = document.getElementById('btnHotOnly'); if (btnHot) btnHot.classList.remove('ring-2', 'ring-amber-300', 'from-amber-600', 'to-rose-700');
  updateFavoritesBadge(); updateDynamicDropdowns(); filterCatalog(true); scrollToGrid();
}

function setTab(tabName) {
  currentTab = tabName;
  stopAudioGuide();
  hideLoadingSpinner();
  if (tabName !== 'stats' && tabName !== 'analytics' && window.location.hash === '#stats') window.history.replaceState(null, '', window.location.pathname);

  const exhibitsFilterGrid = document.getElementById('exhibitsFilterGrid');
  const gramophoneFilterGrid = document.getElementById('gramophoneFilterGrid');
  const searchSortBar = document.getElementById('searchSortBar');
  const gridPrompt = document.getElementById('gridPrompt');
  const gridSection = document.getElementById('gridSection');
  const statsSection = document.getElementById('statsSection');
  const adminAnalyticsSection = document.getElementById('adminAnalyticsSection');
  const headerTitle = document.getElementById('headerTitleText');
  const headerIcon = document.getElementById('headerLogoIcon');
  const subhead = document.getElementById('subheadingText');

  if (adminAnalyticsSection) adminAnalyticsSection.classList.add('hidden');

  if (tabName === 'exhibits') {
    statsSection.classList.add('hidden'); gridSection.classList.remove('hidden');
    exhibitsFilterGrid.classList.remove('hidden'); gramophoneFilterGrid.classList.add('hidden'); searchSortBar.classList.remove('hidden');
    headerTitle.textContent = 'BMMC Showcase'; headerIcon.textContent = '🏛️';
    subhead.textContent = 'Discover historical artifacts, equipment, and memorabilia at the Bonniefields Museum.';
    document.getElementById('promptIcon').textContent = '🔍';
    document.getElementById('promptTitle').textContent = 'Ready to Explore Exhibits';
    document.getElementById('promptDesc').textContent = 'Select a Collection Hub above, search by keyword, or view all items in the BMMC archive.';
  } else if (tabName === 'gramophone') {
    statsSection.classList.add('hidden'); gridSection.classList.remove('hidden');
    gramophoneFilterGrid.classList.remove('hidden'); exhibitsFilterGrid.classList.add('hidden'); searchSortBar.classList.remove('hidden');
    headerTitle.textContent = 'BMMC Gramophones'; headerIcon.textContent = '🎵';
    subhead.textContent = 'Gramophone Catalog (1916 – 1953): Shellac, vinyl, and early 20th-century audio recordings preserved in the BMMC music collection.';
    document.getElementById('promptIcon').textContent = '🎵';
    document.getElementById('promptTitle').textContent = 'Explore Vintage Audio Records';
    document.getElementById('promptDesc').textContent = 'Search vintage gramophone recordings by artist, title, record label, or release year (1916 - 1953).';
  } else if (tabName === 'stats') {
    gridPrompt.classList.add('hidden'); gridSection.classList.add('hidden');
    exhibitsFilterGrid.classList.add('hidden'); gramophoneFilterGrid.classList.add('hidden'); searchSortBar.classList.add('hidden'); statsSection.classList.remove('hidden');
    headerTitle.textContent = 'Museum Insights Live'; headerIcon.textContent = 'ℹ️';
    subhead.textContent = 'Explore live analytics, origin distribution, and chronological evolution from the Bonniefields Museum catalog.';
    renderMuseumStatistics();
  } else if (tabName === 'analytics') {
    gridPrompt.classList.add('hidden'); gridSection.classList.add('hidden'); statsSection.classList.add('hidden');
    exhibitsFilterGrid.classList.add('hidden'); gramophoneFilterGrid.classList.add('hidden'); searchSortBar.classList.add('hidden');
    if (adminAnalyticsSection) adminAnalyticsSection.classList.remove('hidden');
    headerTitle.textContent = 'Site Traffic Dashboard'; headerIcon.textContent = '📊';
    subhead.textContent = 'Live visitor statistics, pageviews, and visitor interactions tracked by Umami.';
  }
  updateFavoritesBadge();
  if (tabName !== 'stats' && tabName !== 'analytics') { updateDynamicDropdowns(); filterCatalog(true); }
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

async function loadCatalogData() {
  initTheme();
  try {
    const exhibitsPromise = fetchCSVWithCache(EXHIBITS_CSV_URL, 'bMMC_cached_exhibits');
    const gramophonePromise = fetchCSVWithCache(GRAMOPHONE_CSV_URL, 'bMMC_cached_gramophone');

    const exhibitsData = await exhibitsPromise;
    if (exhibitsData && exhibitsData.length > 0) {
      exhibitsData[0].forEach((cell, idx) => {
        const c = String(cell).toLowerCase().trim();
        if (c === 'no' || c === 'id') colIdx.id = idx;
        if (c === 'ref') colIdx.ref = idx;
        if (c === 'title' || c === 'content' || c === 'item') colIdx.title = idx;
        if (c === 'notes' || c.includes('note')) colIdx.notes = idx;
        if (c === '#' || c === 'item no') colIdx.itemNoM = idx;
        if (c === 'age') colIdx.age = idx;
        if (c === 'type') colIdx.type = idx;
        if (c === 'category') colIdx.category = idx;
        if (c === 'subcategory' || c.includes('sub category')) colIdx.subcategory = idx;
        if (c === '3d model' || c.includes('3d')) colIdx.d3d = idx;
        if (c === 'ddoc' || (c.includes('doc') && !c.includes('banner'))) colIdx.doc = idx;
        if (c === 'dweb' || (c.includes('web') && !c.includes('banner'))) colIdx.web = idx;
        if (c === 'image 1' || c === 'img1' || (c.includes('image') && !c.includes('2'))) colIdx.img1 = idx;
        if (c === 'image 2' || c === 'img2') colIdx.img2 = idx;
        if (c === 'qty' || c === 'quantity' || c.includes('count')) colIdx.qty = idx;
        if (c === 'made' || c === 'origin' || c.includes('location')) colIdx.made = idx;
        if (c === 'year' || c === 'date') colIdx.year = idx;
        if (c === 'hot') colIdx.hot = idx;
      });
      rawExhibitsRows = exhibitsData.slice(1);
      populateInitialDropdowns();
    }

    renderCollectionHubs(rawExhibitsRows);
    updateDynamicDropdowns();
    document.getElementById('gridPrompt')?.classList.remove('hidden');
    updateFavoritesBadge();
    checkUrlHashForExhibit();
    hideLoadingSpinner(); 

    const gramophoneData = await gramophonePromise;
    if (gramophoneData && gramophoneData.length > 0) {
      rawGramophoneRows = gramophoneData.filter(r => {
        const c0 = getVal(r, 0).toLowerCase();
        const c1 = getVal(r, 1).toLowerCase();
        return r.length >= 2 && !c0.includes('gramophone catalog') && !c0.includes('catalog#') && !c1.includes('artist');
      });
    }

    initFuseSearch();
    renderCollectionHubs(rawExhibitsRows);

  } catch (err) {
    console.error("Failed to load catalog data:", err);
    document.getElementById('loading').innerHTML = `
      <div class="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900">
        <p class="text-rose-600 dark:text-rose-400 font-bold text-base mb-1">Error loading Google Sheet data</p>
        <p class="text-xs text-slate-500 mb-4">Please check your connection or retry fetching the catalog archive.</p>
        <button onclick="localStorage.clear(); location.reload();" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow">🔄 Retry Fetching</button>
      </div>
    `;
  } finally { hideLoadingSpinner(); }
}

function checkUrlHashForExhibit() {
  const hash = window.location.hash;
  if (hash === '#analytics' || hash === '#admin-stats') setTab('analytics');
  else if (hash === '#stats') setTab('stats');
  else if (hash && hash.startsWith('#exhibit-')) {
    const index = parseInt(hash.replace('#exhibit-', ''), 10);
    if (!isNaN(index) && rawExhibitsRows[index]) { filterCatalog(true); openModalByOriginalIndex(index); }
  } else if (hash && hash.startsWith('#gramophone-')) {
    const index = parseInt(hash.replace('#gramophone-', ''), 10);
    if (!isNaN(index) && rawGramophoneRows[index]) { setTab('gramophone'); openModalByOriginalIndex(index); }
  }
}

function renderCollectionHubs(rows) {
  const hubsGrid = document.getElementById('hubsGrid');
  if (!hubsGrid) return;
  hubsGrid.innerHTML = '';

  const totalExhibitsCount = rows.length;

  MAIN_HUB_CATEGORIES.forEach(catName => {
    const baseName = catName.toLowerCase().replace(/s$/, '');
    const matchingRows = rows.filter(r => getVal(r, colIdx.category).toLowerCase().includes(baseName) || getVal(r, colIdx.type).toLowerCase().includes(baseName));
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
        <img src="${previewImg}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" onError="this.src='${NO_IMAGE_SVG}'" alt="${catName}" />
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

    hubCard.addEventListener('click', () => {
      setTab('exhibits');
      const catSelect = document.getElementById('filterCategory');
      const typeSelect = document.getElementById('filterType');
      if (catSelect) catSelect.value = '';
      if (typeSelect) typeSelect.value = '';
      let matched = false;
      if (typeSelect) {
        for (let opt of typeSelect.options) {
          if (opt.value.toLowerCase().includes(baseName)) { typeSelect.value = opt.value; matched = true; break; }
        }
      }
      if (!matched && catSelect) {
        for (let opt of catSelect.options) {
          if (opt.value.toLowerCase().includes(baseName)) { catSelect.value = opt.value; matched = true; break; }
        }
      }
      updateDynamicDropdowns(); filterCatalog(true); scrollToGrid();
    });
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
  gramophoneHubCard.addEventListener('click', () => { setTab('gramophone'); scrollToGrid(); });
  hubsGrid.appendChild(gramophoneHubCard);
  document.getElementById('collectionHubsSection').classList.remove('hidden');
}

function populateInitialDropdowns() {
  document.getElementById('sortBy').addEventListener('change', () => filterCatalog(true));
  document.getElementById('btnClearAllFilters').addEventListener('click', browseAllExhibits);
  ['filterAge', 'filterType', 'filterCategory', 'filterSubcategory', 'filterArtist', 'filterLabel', 'filterFormat', 'filterYear'].forEach(id => {
    const elem = document.getElementById(id);
    if (elem) elem.addEventListener('change', () => { updateDynamicDropdowns(); filterCatalog(true); scrollToGrid(); });
  });
}

function updateDynamicDropdowns() {
  const searchVal = (document.getElementById('searchInput')?.value || '').trim();
  const favs = getFavorites();

  if (currentTab === 'exhibits') {
    const ageVal = document.getElementById('filterAge')?.value || '';
    const typeVal = document.getElementById('filterType')?.value || '';
    const catVal = document.getElementById('filterCategory')?.value || '';
    const subCatVal = document.getElementById('filterSubcategory')?.value || '';

    let matchedOriginalIndices = null;
    if (searchVal && fuseExhibits) {
      matchedOriginalIndices = new Set(fuseExhibits.search(searchVal).map(res => res.item.originalIndex));
    }

    function getExhibitRowsExcluding(excludeField) {
      return rawExhibitsRows.filter((row, originalIndex) => {
        const searchMatch = !searchVal || (matchedOriginalIndices ? matchedOriginalIndices.has(originalIndex) : row.join(' ').toLowerCase().includes(searchVal.toLowerCase()));
        const rowEra = getEraByRow(row);
        const ageMatch = excludeField === 'age' || !ageVal || (rowEra && (rowEra.short === ageVal || rowEra.full === ageVal)) || getVal(row, colIdx.year) === ageVal;
        const typeMatch = excludeField === 'type' || !typeVal || getVal(row, colIdx.type).toLowerCase().includes(typeVal.toLowerCase());
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
      const currAge = ageSelect.value;
      ageSelect.innerHTML = '<option value="">All Eras / Ages</option>';
      TIMELINE_ERAS.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.short;
        opt.textContent = `${e.full} - (${eraCounts[e.short] || 0})`;
        if (e.short === currAge || e.full === currAge) opt.selected = true;
        ageSelect.appendChild(opt);
      });
    }

    updateSelectOptions('filterType', getExhibitRowsExcluding('type').map(r => getVal(r, colIdx.type)));
    updateSelectOptions('filterCategory', getExhibitRowsExcluding('category').map(r => getVal(r, colIdx.category)));
    updateSelectOptions('filterSubcategory', getExhibitRowsExcluding('subcategory').map(r => getVal(r, colIdx.subcategory)));

  } else if (currentTab === 'gramophone') {
    const artistVal = document.getElementById('filterArtist')?.value || '';
    const labelVal = document.getElementById('filterLabel')?.value || '';
    const formatVal = document.getElementById('filterFormat')?.value || '';
    const yearVal = document.getElementById('filterYear')?.value || '';

    let matchedOriginalIndices = null;
    if (searchVal && fuseGramophone) {
      matchedOriginalIndices = new Set(fuseGramophone.search(searchVal).map(res => res.item.originalIndex));
    }

    function getGramophoneRowsExcluding(excludeField) {
      return rawGramophoneRows.filter((row, originalIndex) => {
        const searchMatch = !searchVal || (matchedOriginalIndices ? matchedOriginalIndices.has(originalIndex) : row.join(' ').toLowerCase().includes(searchVal.toLowerCase()));
        const artistMatch = excludeField === 'artist' || !artistVal || getVal(row, 1) === artistVal;
        const labelMatch = excludeField === 'label' || !labelVal || getVal(row, 3) === labelMatch;
        const formatMatch = excludeField === 'format' || !formatVal || getVal(row, 4) === formatMatch;
        const yearMatch = excludeField === 'year' || !yearVal || getVal(row, 6) === yearMatch;
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
  const currentSelection = select.value;
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
    if (val === currentSelection) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderActiveFilterPills() {
  const container = document.getElementById('activeFiltersContainer');
  const bar = document.getElementById('activeFiltersBar');
  if (!container || !bar) return;

  container.innerHTML = '';
  const filters = [];
  const searchVal = document.getElementById('searchInput').value;

  if (currentTab === 'exhibits') {
    const ageVal = document.getElementById('filterAge').value;
    const typeVal = document.getElementById('filterType').value;
    const catVal = document.getElementById('filterCategory').value;
    const subCatVal = document.getElementById('filterSubcategory').value;
    if (searchVal) filters.push({ label: `Search: "${searchVal}"`, clear: () => { document.getElementById('searchInput').value = ''; } });
    if (ageVal) filters.push({ label: `Era / Age: ${unescapeHTML(ageVal)}`, clear: () => { document.getElementById('filterAge').value = ''; } });
    if (typeVal) filters.push({ label: `Type: ${unescapeHTML(typeVal)}`, clear: () => { document.getElementById('filterType').value = ''; } });
    if (catVal) filters.push({ label: `Category: ${unescapeHTML(catVal)}`, clear: () => { document.getElementById('filterCategory').value = ''; } });
    if (subCatVal) filters.push({ label: `Subcategory: ${unescapeHTML(subCatVal)}`, clear: () => { document.getElementById('filterSubcategory').value = ''; } });
    if (only3DActive) filters.push({ label: `3D Only`, clear: () => { document.getElementById('btn3DOnly').click(); } });
    if (hotOnlyActive) filters.push({ label: `🔥 Hot Items Only`, clear: () => { document.getElementById('btnHotOnly').click(); } });
  } else if (currentTab === 'gramophone') {
    filters.push({ label: `Archive Mode: Gramophone`, clear: () => browseAllExhibits() });
    const artistVal = document.getElementById('filterArtist').value;
    const labelVal = document.getElementById('filterLabel').value;
    const formatVal = document.getElementById('filterFormat').value;
    const yearVal = document.getElementById('filterYear').value;
    if (searchVal) filters.push({ label: `Search: "${searchVal}"`, clear: () => { document.getElementById('searchInput').value = ''; } });
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
      pill.innerHTML = `${f.label} <button class="hover:text-red-500 font-bold ml-0.5">✕</button>`;
      pill.querySelector('button').addEventListener('click', () => { f.clear(); updateDynamicDropdowns(); filterCatalog(true); });
      container.appendChild(pill);
    });
  } else {
    bar.classList.add('hidden'); bar.classList.remove('flex');
  }
}

function filterCatalog(forceShowGrid = false) {
  hideLoadingSpinner();
  const searchVal = (document.getElementById('searchInput').value || '').trim();
  const sortBy = document.getElementById('sortBy').value;
  const favs = getFavorites();

  document.getElementById('clearSearch').classList.toggle('hidden', !searchVal);
  renderActiveFilterPills();

  if (currentTab === 'exhibits') {
    const ageVal = document.getElementById('filterAge').value;
    const typeVal = document.getElementById('filterType').value;
    const catVal = document.getElementById('filterCategory').value;
    const subCatVal = document.getElementById('filterSubcategory').value;
    const isFiltering = searchVal || ageVal || typeVal || catVal || subCatVal || only3DActive || hotOnlyActive || showingFavoritesOnly;

    if (isFiltering || forceShowGrid) {
      isGridActive = true;
      document.getElementById('gridPrompt').classList.add('hidden');
      document.getElementById('grid').classList.remove('hidden');
      document.getElementById('floatingJumpBtn').classList.remove('hidden');
    } else if (!isGridActive) {
      document.getElementById('gridPrompt').classList.remove('hidden');
      document.getElementById('grid').classList.add('hidden');
      document.getElementById('floatingJumpBtn').classList.add('hidden');
      document.getElementById('itemCount').textContent = '';
      return;
    }

    let matchedOriginalIndices = null;
    if (searchVal && fuseExhibits) matchedOriginalIndices = new Set(fuseExhibits.search(searchVal).map(res => res.item.originalIndex));

    currentFilteredRows = rawExhibitsRows.map((row, index) => ({ row, originalIndex: index })).filter(({ row, originalIndex }) => {
      const searchMatch = !searchVal || (matchedOriginalIndices ? matchedOriginalIndices.has(originalIndex) : row.join(' ').toLowerCase().includes(searchVal.toLowerCase()));
      const rowEra = getEraByRow(row);
      const ageMatch = !ageVal || (rowEra && (rowEra.short === ageVal || rowEra.full === ageVal)) || getVal(row, colIdx.year) === ageVal;
      const typeMatch = !typeVal || getVal(row, colIdx.type).toLowerCase().includes(typeVal.toLowerCase());
      const catMatch = !catVal || getVal(row, colIdx.category).toLowerCase().includes(catVal.toLowerCase());
      const subCatMatch = !subCatVal || getVal(row, colIdx.subcategory) === subCatVal;
      const match3D = !only3DActive || Boolean(get3DUrlForItem(row));
      const matchHot = !hotOnlyActive || isItemHot(row);
      const matchFav = !showingFavoritesOnly || favs.includes(originalIndex);
      return searchMatch && ageMatch && typeMatch && catMatch && subCatMatch && match3D && matchHot && matchFav;
    });

    if (sortBy === 'title-asc') {
      currentFilteredRows.sort((a, b) => parseTitleAndDetails(getVal(a.row, colIdx.title) || getVal(a.row, colIdx.id)).title.localeCompare(parseTitleAndDetails(getVal(b.row, colIdx.title) || getVal(b.row, colIdx.id)).title));
    } else if (sortBy === 'title-desc') {
      currentFilteredRows.sort((a, b) => parseTitleAndDetails(getVal(b.row, colIdx.title) || getVal(b.row, colIdx.id)).title.localeCompare(parseTitleAndDetails(getVal(a.row, colIdx.title) || getVal(a.row, colIdx.id)).title));
    } else if (sortBy === 'age-oldest') {
      currentFilteredRows.sort((a, b) => getVal(a.row, colIdx.year).localeCompare(getVal(b.row, colIdx.year)));
    } else if (sortBy === 'age-newest') {
      currentFilteredRows.sort((a, b) => getVal(b.row, colIdx.year).localeCompare(getVal(a.row, colIdx.year)));
    }

    renderExhibitsGrid();

  } else if (currentTab === 'gramophone') {
    const artistVal = document.getElementById('filterArtist').value;
    const labelVal = document.getElementById('filterLabel').value;
    const formatVal = document.getElementById('filterFormat').value;
    const yearVal = document.getElementById('filterYear').value;
    const isFiltering = searchVal || artistVal || labelVal || formatVal || yearVal || showingFavoritesOnly;

    if (isFiltering || forceShowGrid) {
      isGridActive = true;
      document.getElementById('gridPrompt').classList.add('hidden');
      document.getElementById('grid').classList.remove('hidden');
      document.getElementById('floatingJumpBtn').classList.remove('hidden');
    } else if (!isGridActive) {
      document.getElementById('gridPrompt').classList.remove('hidden');
      document.getElementById('grid').classList.add('hidden');
      document.getElementById('floatingJumpBtn').classList.add('hidden');
      document.getElementById('itemCount').textContent = '';
      return;
    }

    let matchedOriginalIndices = null;
    if (searchVal && fuseGramophone) matchedOriginalIndices = new Set(fuseGramophone.search(searchVal).map(res => res.item.originalIndex));

    currentFilteredRows = rawGramophoneRows.map((row, index) => ({ row, originalIndex: index })).filter(({ row, originalIndex }) => {
      const searchMatch = !searchVal || (matchedOriginalIndices ? matchedOriginalIndices.has(originalIndex) : row.join(' ').toLowerCase().includes(searchVal.toLowerCase()));
      const artistMatch = !artistVal || getVal(row, 1) === artistVal;
      const labelMatch = !labelVal || getVal(row, 3) === labelMatch;
      const formatMatch = !formatVal || getVal(row, 4) === formatMatch;
      const yearMatch = !yearVal || getVal(row, 6) === yearMatch;
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

function speakAudioGuide(originalIndex, event) {
  if (event) event.stopPropagation();
  if (currentlySpeakingIndex === originalIndex && window.speechSynthesis && window.speechSynthesis.speaking) {
    stopAudioGuide(); return;
  }
  const row = rawExhibitsRows[originalIndex];
  if (!row) return;
  const notes = getVal(row, colIdx.notes);
  if (!notes || notes.trim() === '') { showToast('No Museum Notes available for audio narration', 'ℹ️'); return; }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentlySpeakingIndex = originalIndex;
    currentSpeechUtterance = new SpeechSynthesisUtterance(`Museum Note: ${notes.replace(/^#\s*/, '')}`);
    const chosenVoice = getSelectedVoice();
    if (chosenVoice) currentSpeechUtterance.voice = chosenVoice;
    currentSpeechUtterance.rate = 0.92; currentSpeechUtterance.pitch = 1.0;
    currentSpeechUtterance.onend = () => { currentlySpeakingIndex = null; updateAudioUI(); };
    currentSpeechUtterance.onerror = () => { currentlySpeakingIndex = null; updateAudioUI(); };
    window.speechSynthesis.speak(currentSpeechUtterance);
    updateAudioUI();
  }
}

function stopAudioGuide() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  currentlySpeakingIndex = null; updateAudioUI();
}

function updateAudioUI() {
  const isSpeaking = window.speechSynthesis && window.speechSynthesis.speaking;
  document.querySelectorAll('[data-grid-audio-idx]').forEach(btn => {
    const idx = parseInt(btn.getAttribute('data-grid-audio-idx'), 10);
    if (currentlySpeakingIndex === idx && isSpeaking) {
      btn.classList.add('animate-pulse', 'bg-blue-600', 'text-white', 'ring-2', 'ring-blue-400');
      btn.classList.remove('bg-white/90', 'dark:bg-slate-800/90', 'text-blue-600', 'dark:text-blue-400');
      btn.innerHTML = `<span class="flex items-center gap-1 text-[11px] px-1 font-bold">🔊 <span class="eq-bar"></span><span class="eq-bar"></span></span>`;
    } else {
      btn.classList.remove('animate-pulse', 'bg-blue-600', 'text-white', 'ring-2', 'ring-blue-400');
      btn.classList.add('bg-white/90', 'dark:bg-slate-800/90', 'text-blue-600', 'dark:text-blue-400');
      btn.innerHTML = '🔊';
    }
  });

  const btnModal = document.getElementById('btnAudioGuide');
  if (btnModal) {
    const modalRowIdx = parseInt(btnModal.getAttribute('data-row'), 10);
    if (currentlySpeakingIndex === modalRowIdx && isSpeaking) {
      btnModal.innerHTML = `<span class="flex items-center gap-1 text-xs font-bold"><span class="inline-flex items-center gap-0.5 text-blue-200"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></span><span>Stop</span></span>`;
      btnModal.onclick = stopAudioGuide;
    } else {
      btnModal.innerHTML = '🔊 Listen';
      btnModal.onclick = () => speakAudioGuide(modalRowIdx);
    }
  }
}

function switchCardImage(originalIndex, dir, event) {
  if (event) event.stopPropagation();
  const cardThumb = document.getElementById(`card-media-box-${originalIndex}`);
  const badgeElem = document.getElementById(`card-badge-${originalIndex}`);
  if (!cardThumb) return;

  const totalSlots = parseInt(cardThumb.getAttribute('data-total-slots') || '1', 10);
  let currentSlot = parseInt(cardThumb.getAttribute('data-current-slot') || '1', 10) + dir;
  if (currentSlot > totalSlots) currentSlot = 1;
  if (currentSlot < 1) currentSlot = totalSlots;

  cardThumb.setAttribute('data-current-slot', String(currentSlot));
  cardThumb.querySelectorAll('.card-media-item').forEach(item => {
    const slotIdx = parseInt(item.getAttribute('data-slot-idx'), 10);
    item.classList.toggle('hidden', slotIdx !== currentSlot);
    item.classList.toggle('flex', slotIdx === currentSlot);
  });
  if (badgeElem) badgeElem.textContent = `${currentSlot} / ${totalSlots}`;
}

function renderExhibitsGrid() {
  const grid = document.getElementById('grid');
  const itemCount = document.getElementById('itemCount');
  const favs = getFavorites();
  const isDark = document.documentElement.classList.contains('dark');

  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';
  grid.innerHTML = '';
  if (itemCount) itemCount.textContent = `Showing ${currentFilteredRows.length} exhibit${currentFilteredRows.length === 1 ? '' : 's'}`;

  if (currentFilteredRows.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 backdrop-blur-sm">
        <span class="text-3xl mb-2 block">🔍</span>
        <p class="text-slate-600 dark:text-slate-300 font-bold text-sm">No exhibit results match your selected filters.</p>
        <button onclick="browseAllExhibits()" class="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">Reset search and filters</button>
      </div>`;
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
            <span class="absolute bottom-2.5 left-2.5 bg-purple-600/90 text-white backdrop-blur-md text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-purple-400/40 z-10">3D Interactive</span>
          </div>`;
      } else {
        mediaItemsHTML += `
          <div class="card-media-item ${isHidden} w-full h-full items-center justify-center relative group/img" data-slot-idx="${slotNum}">
            <a href="${s.fullUrl}" target="_blank" onclick="event.stopPropagation()" title="Open full image in new tab" class="w-full h-full flex items-center justify-center">
              <img src="${s.thumbUrl}" class="max-w-full max-h-full object-contain group-hover/img:scale-105 transition-transform duration-300 drop-shadow-md" alt="${displayTitle}" loading="lazy" onError="this.src='${NO_IMAGE_SVG}'" />
            </a>
          </div>`;
      }
    });

    card.innerHTML = `
      <div id="card-media-box-${originalIndex}" data-total-slots="${totalSlots}" data-current-slot="1" class="h-56 relative overflow-hidden flex items-center justify-center p-2 group/cardimg" style="background-color: ${theme.hex}18;">
        ${mediaItemsHTML}
        <div class="absolute top-3 right-3 flex items-center gap-1.5 z-10" onclick="event.stopPropagation()">
          ${isHot ? `<span title="Hot Item" class="w-8 h-8 rounded-full bg-amber-500/90 text-white backdrop-blur-md transition shadow-md flex items-center justify-center text-xs font-bold pointer-events-none">🔥</span>` : ''}
          <button onclick="toggleFavorite(${originalIndex}, event)" aria-label="Favorite item" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}" class="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md transition shadow-md hover:scale-110 flex items-center justify-center text-xs">${isFav ? '❤️' : '🤍'}</button>
          ${notes ? `<button data-grid-audio-idx="${originalIndex}" onclick="speakAudioGuide(${originalIndex}, event)" aria-label="Listen to notes" title="Listen to Museum Notes" class="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 text-blue-600 dark:text-blue-400 backdrop-blur-md transition shadow-md hover:scale-110 flex items-center justify-center text-xs font-bold">🔊</button>` : ''}
        </div>
        ${totalSlots > 1 ? `
          <button onclick="switchCardImage(${originalIndex}, -1, event)" title="Previous Media" aria-label="Previous Media" class="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/75 hover:bg-slate-900 text-white text-xs font-black rounded-full w-7 h-7 flex items-center justify-center backdrop-blur-md shadow-md transition hover:scale-110 z-10">❮</button>
          <button onclick="switchCardImage(${originalIndex}, 1, event)" title="Next Media" aria-label="Next Media" class="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/75 hover:bg-slate-900 text-white text-xs font-black rounded-full w-7 h-7 flex items-center justify-center backdrop-blur-md shadow-md transition hover:scale-110 z-10">❯</button>
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
            Details <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </span>
          <div class="flex gap-1.5" onclick="event.stopPropagation()">
            ${d3d ? `<button onclick="open3DLightbox('${encodeURIComponent(d3d)}', '${encodeURIComponent(displayTitle)}')" title="Open 3D Lightbox" class="bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold border border-purple-200 dark:border-purple-800 transition shadow-sm">👓 3D View</button>` : ''}
            ${ddoc ? `<a href="${ddoc}" target="_blank" title="Documentation" class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-800 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-sm">Doc</a>` : ''}
            ${dweb ? `<a href="${dweb}" target="_blank" title="Website" class="bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-800 transition shadow-sm">Web</a>` : ''}
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openModalByFilteredIndex(arrayIndex));
    grid.appendChild(card);
  }
  updateAudioUI();
}

function renderGramophoneGrid() {
  const grid = document.getElementById('grid');
  const itemCount = document.getElementById('itemCount');
  const favs = getFavorites();
  const isDark = document.documentElement.classList.contains('dark');

  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5';
  grid.innerHTML = '';
  if (itemCount) itemCount.textContent = `Showing ${currentFilteredRows.length} gramophone record${currentFilteredRows.length === 1 ? '' : 's'}`;

  if (currentFilteredRows.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-16 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 backdrop-blur-sm">
        <span class="text-3xl mb-2 block">🎵</span>
        <p class="text-slate-600 dark:text-slate-300 font-bold text-sm">No gramophone records match your selected filters.</p>
        <button onclick="browseAllExhibits()" class="mt-3 text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline">Return to Main Museum Exhibits</button>
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
    const hasArchiveRecording = getVal(row, 11).toLowerCase().includes('yes');
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
          <button onclick="toggleFavorite(${originalIndex}, event)" aria-label="Favorite item" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}" class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition">${isFav ? '❤️' : '🤍'}</button>
        </div>
        <p class="text-xs font-black text-amber-700 dark:text-amber-400 mb-1 tracking-wide uppercase">${artist}</p>
        <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">${formattedTitleHTML}</h3>
      </div>

      <div class="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-2" onclick="event.stopPropagation()">
        <span class="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Details <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </span>
        <div class="flex items-center gap-1.5 flex-wrap justify-end">
          ${hasDiscogsRecording ? `<a href="${discogsUrl || '#'}" target="_blank" class="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm transition hover:bg-emerald-600 flex items-center gap-1">🎙️ Discogs Recording</a>` : ''}
          ${hasArchiveRecording ? `<a href="${archiveUrl}" target="_blank" class="bg-sky-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm transition hover:bg-sky-700 flex items-center gap-1">📻 Archives 78s Recording</a>` : ''}
          ${discogsUrl && !hasDiscogsRecording ? `<a href="${discogsUrl}" target="_blank" class="bg-slate-800 hover:bg-black text-white px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm">📀 Discogs ↗</a>` : ''}
        </div>
      </div>
    `;
    card.addEventListener('click', () => openModalByFilteredIndex(arrayIndex));
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
  document.body.classList.remove('overflow-hidden');
}

function renderMuseumStatistics() {
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

    if (docUrl && (docUrl.startsWith('http') || docUrl.length > 5)) { docElem.href = docUrl.startsWith('http') ? docUrl : `https://${docUrl}`; docElem.classList.remove('hidden'); }
    if (webUrl && (webUrl.startsWith('http') || webUrl.length > 5)) { webElem.href = webUrl.startsWith('http') ? webUrl : `https://${webUrl}`; webElem.classList.remove('hidden'); }
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
          <img src="${previewImg}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" onError="this.src='${NO_IMAGE_SVG}'" alt="${e.short}" />
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
        <img src="${interestPreviewImg}" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" onError="this.src='${NO_IMAGE_SVG}'" alt="Items of interest" />
        <div class="absolute top-1.5 right-1.5 flex flex-col items-end gap-0.5 z-10">
          <span class="text-[9px] font-black px-2 py-0.5 rounded-full shadow-md" style="background-color: ${interestColor}; color: #ffffff;">${interestCount}</span>
          <span class="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full shadow-md bg-slate-900/80 text-white backdrop-blur-sm">${interestPctDisplay}%</span>
        </div>
      </div>
      <div class="p-2.5 flex-1 flex flex-col justify-between">
        <h3 class="font-black text-xs line-clamp-1" style="color: ${interestColor};">Items of interest</h3>
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

  document.getElementById('statTotalItems').textContent = itemsSumQty > 0 ? itemsSumQty.toLocaleString() : '1,193';
  if (validYears.length > 0) document.getElementById('statDateRange').textContent = `${Math.min(...validYears)} – ${Math.max(...validYears)}`;
  else document.getElementById('statDateRange').textContent = 'N/A';

  const totalAgeItems = colPreCount + colPostCount;
  const preElem = document.getElementById('statPre1950');
  const postElem = document.getElementById('statPost1950');
  if (totalAgeItems > 0) {
    const prePct = Math.round((colPreCount / totalAgeItems) * 100);
    const postPct = 100 - prePct;
    if (preElem) preElem.innerHTML = `Pre 1950: <span class="text-purple-600 dark:text-purple-400 font-black">${prePct}% (${colPreCount})</span>`;
    if (postElem) postElem.innerHTML = `Post 1950: <span class="text-pink-600 dark:text-pink-400 font-black">${postPct}% (${colPostCount})</span>`;
  } else {
    if (preElem) preElem.innerHTML = 'Pre 1950: <span class="text-purple-600 dark:text-purple-400 font-black">62%</span>';
    if (postElem) postElem.innerHTML = 'Post 1950: <span class="text-pink-600 dark:text-pink-400 font-black">38%</span>';
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
          plugins: { legend: { labels: { color: textColor, font: { family: 'Inter', size: 11, weight: '600' } } }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { stacked: true, grace: '10%', grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter', size: 10 } } },
            y: { stacked: true, grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', size: 10, weight: '600' } } }
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
            x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Inter', size: 10, weight: '600' } } },
            y: { grace: '12%', grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter', size: 10 } } }
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
            legend: { labels: { color: textColor, font: { family: 'Inter', size: 11, weight: '600' } } },
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
            x: { stacked: true, grace: '10%', grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Inter', size: 10 } } },
            y: { stacked: true, grid: { display: false }, ticks: { autoSkip: false, color: textColor, font: { family: 'Inter', size: 10, weight: '600' } } }
          }
        }
      });
    }
  }, 50);
}

function open3DLightbox(rawUrl, rawTitle) {
  const modal = document.getElementById('lightbox3DModal');
  const titleElem = document.getElementById('lightboxTitle');
  const viewer = document.getElementById('lightboxViewer');
  const spinner = document.getElementById('lightboxSpinner');
  const scaleText = document.getElementById('lightboxScaleText');

  if (!modal || !viewer || !rawUrl) return;

  let url = rawUrl;
  let title = rawTitle || 'Interactive 3D Model';
  try { url = decodeURIComponent(rawUrl); } catch(e) {}
  try { title = decodeURIComponent(rawTitle); } catch(e) {}

  titleElem.textContent = title;
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
}

function openModalByOriginalIndex(origIdx) {
  const filteredIndex = currentFilteredRows.findIndex(item => item.originalIndex === origIdx);
  if (filteredIndex !== -1) openModalByFilteredIndex(filteredIndex);
  else {
    const rows = currentTab === 'exhibits' ? rawExhibitsRows : rawGramophoneRows;
    if (rows[origIdx]) openModal(rows[origIdx], origIdx);
  }
}

function openModalByFilteredIndex(filteredIndex) {
  if (filteredIndex < 0 || filteredIndex >= currentFilteredRows.length) return;
  currentModalIndex = filteredIndex;
  const { row, originalIndex } = currentFilteredRows[filteredIndex];
  openModal(row, originalIndex);
}

function openModal(row, originalIndex) {
  stopAudioGuide();
  const modalContainer = document.getElementById('modalContainer');
  const modalContent = document.getElementById('modalContent');
  const counterElem = document.getElementById('modalCounter');
  const prevBtn = document.getElementById('modalPrevBtn');
  const nextBtn = document.getElementById('modalNextBtn');
  const favs = getFavorites();
  const isFav = favs.includes(originalIndex);
  const isDark = document.documentElement.classList.contains('dark');

  if (currentTab === 'exhibits') {
    window.history.replaceState(null, '', `#exhibit-${originalIndex}`);
    const rawContent = getVal(row, colIdx.title) || getVal(row, colIdx.id);
    const { title, details } = parseTitleAndDetails(rawContent);
    const displayTitle = title || `Exhibit Item Details`;

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
    const ageBadgeClass = getAgeBadgeStyle(eraDisplay);
    const cleanedDetails = cleanDetailsForModal(details);
    const theme = getCategoryTheme(category || type || subcategory);

    const modalImg1 = formatGoogleLh3Url(img1, 's600');
    const modalImg2 = formatGoogleLh3Url(img2, 's600');
    const fullImg1 = formatGoogleLh3Url(img1, 's1000');
    const fullImg2 = formatGoogleLh3Url(img2, 's1000');

    modalContainer.style.borderColor = theme.hex; modalContainer.style.borderWidth = '3px';
    modalContainer.style.backgroundColor = getSolidTint(theme.hex, isDark);

    if (currentModalIndex !== -1 && currentFilteredRows.length > 0) {
      counterElem.textContent = `${currentModalIndex + 1} of ${currentFilteredRows.length}`;
      prevBtn.disabled = currentModalIndex === 0; nextBtn.disabled = currentModalIndex === currentFilteredRows.length - 1;
      prevBtn.classList.toggle('opacity-40', currentModalIndex === 0); nextBtn.classList.toggle('opacity-40', currentModalIndex === currentFilteredRows.length - 1);
    } else { counterElem.textContent = ''; }

    document.getElementById('btnShareExhibit').onclick = () => {
      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#exhibit-${originalIndex}`).then(() => showToast('Link copied to clipboard!', '🔗'));
    };

    modalContent.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div class="flex flex-col space-y-4 order-2 lg:order-1">
          <div class="flex items-start justify-between gap-3">
            <h2 id="modalTitle" class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">${displayTitle}</h2>
            <div class="flex items-center gap-2 shrink-0">
              ${isHot ? `<span title="Hot Item" class="text-base sm:text-lg px-2 py-0.5 bg-amber-500/20 rounded-full border border-amber-400/40 leading-none flex items-center justify-center">🔥</span>` : ''}
              <button onclick="toggleFavorite(${originalIndex}, event)" class="px-3.5 py-1.5 rounded-full text-xs font-black border transition flex items-center gap-1 ${isFav ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'}">${isFav ? '❤️ Saved' : '🤍 Save'}</button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 text-xs items-center">
            ${eraDisplay ? `<span class="${ageBadgeClass} px-2.5 py-0.5 rounded-full shadow-sm"><strong>Era:</strong> ${eraDisplay}</span>` : ''}
            ${category ? createCategoryBadge(category, 'category') : ''}
            ${type ? createCategoryBadge(type, 'type') : ''}
            ${subcategory ? createCategoryBadge(subcategory, 'subcategory') : ''}
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
                  <button id="btnAudioGuide" data-row="${originalIndex}" onclick="speakAudioGuide(${originalIndex})" class="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black transition shadow">🔊 Listen</button>
                  <select id="voiceSelect" class="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5 font-medium max-w-[100px] truncate outline-none"></select>
                </div>
              </div>
              <div class="text-sm text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-line bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 p-4 sm:p-5 rounded-2xl shadow-inner">${notes}</div>
            </div>` : ''}

          <div class="flex flex-wrap items-center gap-2.5 pt-2">
            <button id="btnGoogleSearchMain" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">🔍 Google Item</button>
          </div>

          <div class="flex flex-wrap gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            ${d3d ? `<button onclick="open3DLightbox('${encodeURIComponent(d3d)}', '${encodeURIComponent(displayTitle)}')" class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-purple-500/25 transition">👓 Fullscreen 3D View ↗</button>` : ''}
            ${ddoc ? `<a href="${ddoc}" target="_blank" class="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow transition">Documentation ↗</a>` : ''}
            ${dweb ? `<a href="${dweb}" target="_blank" class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-500/25 transition">Web Link ↗</a>` : ''}
          </div>
        </div>

        <div class="flex flex-col space-y-4 w-full order-1 lg:order-2">
          ${d3d ? `
            <div class="relative group/model w-full">
              <div class="flex items-center justify-between mb-2">
                <p class="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Interactive 3D Model</p>
                <div class="flex items-center gap-2">
                  <button id="btnToggleModalSkybox" onclick="toggleModal3DSkybox(event)" class="text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md transition border border-slate-300 dark:border-slate-700">${is3DSkyboxLight ? '🌙 Dark Sky' : '☀️ Light Sky'}</button>
                  <button onclick="open3DLightbox('${encodeURIComponent(d3d)}', '${encodeURIComponent(displayTitle)}')" class="text-[10px] font-bold text-purple-600 dark:text-purple-300 hover:underline">Expand Fullscreen ⤢</button>
                </div>
              </div>
              <div id="modal3DContainer" class="w-full h-64 sm:h-72 ${is3DSkyboxLight ? 'bg-slate-100' : 'bg-slate-900'} rounded-2xl overflow-hidden shadow-inner border border-indigo-500/30 relative cursor-pointer transition-colors duration-300" onclick="open3DLightbox('${encodeURIComponent(d3d)}', '${encodeURIComponent(displayTitle)}')">
                <model-viewer id="modal3DViewer" src="${d3d}" camera-controls auto-rotate shadow-intensity="1.2" exposure="1.1" style="width: 100%; height: 100%; display: block; --poster-color: transparent;" class="w-full h-full"></model-viewer>
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
                <a href="${fullImg1 || modalImg1}" target="_blank" title="Click to view full image" class="block group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 shadow-md w-full" style="border-color: ${theme.hex}80;">
                  <img src="${modalImg1}" class="w-full ${!img2 ? 'max-h-[520px] min-h-[220px]' : 'h-52 sm:h-56'} object-contain rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-lg" onError="this.src='${NO_IMAGE_SVG}'" alt="${displayTitle}" />
                  <span class="absolute bottom-2.5 right-2.5 bg-blue-600/90 text-white backdrop-blur-md text-[9px] font-black px-2.5 py-1 rounded-lg shadow pointer-events-none">Full Image ↗</span>
                </a>
              </div>` : ''}

            ${img2 ? `
              <div class="w-full">
                <p class="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">${d3d ? 'Third Media (Image 2)' : 'Secondary Image'}</p>
                <a href="${fullImg2 || modalImg2}" target="_blank" title="Click to view image" class="block group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 shadow-md w-full" style="border-color: ${theme.hex}80;">
                  <img src="${modalImg2}" class="w-full h-52 sm:h-56 object-contain rounded-xl group-hover:scale-105 transition-transform duration-300 drop-shadow-lg" onError="this.src='${NO_IMAGE_SVG}'" alt="${displayTitle}" />
                  <span class="absolute bottom-2.5 right-2.5 bg-blue-600/90 text-white backdrop-blur-md text-[9px] font-black px-2.5 py-1 rounded-lg shadow pointer-events-none">Full Image ↗</span>
                </a>
              </div>` : ''}
          </div>
        </div>
      </div>`;

    const btnMain = document.getElementById('btnGoogleSearchMain');
    if (btnMain) btnMain.onclick = () => googleItemSearch(displayTitle, category, details);
    populateVoiceDropdown();

    const modalViewer = document.getElementById('modal3DViewer');
    const modalScaleText = document.getElementById('modal3DScaleText');
    if (modalViewer) {
      const updateModalDims = () => {
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

      if (modalViewer.loaded) {
        updateModalDims();
      } else {
        modalViewer.addEventListener('load', updateModalDims, { once: true });
      }
    }

  } else {
    window.history.replaceState(null, '', `#gramophone-${originalIndex}`);
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
    const hasArchiveRecording = getVal(row, 11).toLowerCase().includes('yes');
    const hasAnyRecording = hasDiscogsRecording || hasArchiveRecording;
    const archiveUrl = buildArchiveSearchUrl(rawTitle, catalogNum);
    const ytQuery = encodeURIComponent(`${unescapeHTML(artist)} ${unescapeHTML(rawTitle)}`.replace(/^[AB][\s\.:-]+/gi, '').trim()).replace(/%20/g, '+');
    const gramTheme = CATEGORY_PALETTE.gramophones;

    modalContainer.style.borderColor = gramTheme.hex; modalContainer.style.borderWidth = '3px';
    modalContainer.style.backgroundColor = getSolidTint(gramTheme.hex, isDark);

    if (currentModalIndex !== -1 && currentFilteredRows.length > 0) {
      counterElem.textContent = `${currentModalIndex + 1} of ${currentFilteredRows.length}`;
      prevBtn.disabled = currentModalIndex === 0; nextBtn.disabled = currentModalIndex === currentFilteredRows.length - 1;
      prevBtn.classList.toggle('opacity-40', currentModalIndex === 0); nextBtn.classList.toggle('opacity-40', currentModalIndex === currentFilteredRows.length - 1);
    } else { counterElem.textContent = ''; }

    document.getElementById('btnShareExhibit').onclick = () => {
      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#gramophone-${originalIndex}`).then(() => showToast('Record link copied to clipboard!', '🔗'));
    };

    modalContent.innerHTML = `
      <div class="flex items-start justify-between gap-4 mb-2">
        <div><h2 id="modalTitle" class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">${formattedTitleHTML}</h2></div>
        <button onclick="toggleFavorite(${originalIndex}, event)" class="px-3.5 py-1.5 rounded-full text-xs font-black border transition flex items-center gap-1 shrink-0 ${isFav ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'}">${isFav ? '❤️ Saved' : '🤍 Save'}</button>
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
          <a href="${discogsUrl}" target="_blank" class="bg-slate-800 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black shadow transition flex items-center gap-2">
            <span>${hasDiscogsRecording ? '📀 Discogs Recording ↗' : '📀 Discogs ↗'}</span>
            ${hasDiscogsRecording ? `<span class="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">🎙️ Recording</span>` : ''}
          </a>` : ''}

        ${hasArchiveRecording ? `<a href="${archiveUrl}" target="_blank" class="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow transition flex items-center gap-2"><span>📻 Archives 78s Recording ↗</span></a>` : ''}

        ${!hasAnyRecording ? `
          <a href="https://www.youtube.com/results?search_query=${ytQuery}" target="_blank" class="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5"><span>🎵 Search YouTube ↗</span></a>
          <a href="${archiveUrl}" target="_blank" class="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5" title="Search the 78 RPM Collection on Internet Archive"><span>📻 Search Archive 78s ↗</span></a>` : ''}
      </div>`;
  }

  document.body.classList.add('overflow-hidden');
  document.getElementById('detailModal').classList.remove('hidden');
  document.getElementById('closeModal').focus();
}

function closeModal() {
  stopAudioGuide();
  document.body.classList.remove('overflow-hidden');
  document.getElementById('detailModal').classList.add('hidden');
  window.history.replaceState(null, '', ' ');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('brandLogoLink').addEventListener('click', (e) => { e.preventDefault(); browseAllExhibits(); });
  document.getElementById('btnBrowseAllHeader').addEventListener('click', browseAllExhibits);
  document.getElementById('btnBrowseAllPrompt').addEventListener('click', browseAllExhibits);
  document.getElementById('btnStatsHeader').addEventListener('click', () => { setTab('stats'); window.location.hash = '#stats'; });
  document.getElementById('btnSurprise').addEventListener('click', () => {
    const rows = (currentTab === 'gramophone') ? rawGramophoneRows : rawExhibitsRows;
    if (!rows || rows.length === 0) return;
    if (currentTab === 'stats' || currentTab === 'analytics') setTab('exhibits');
    if (!isGridActive) filterCatalog(true);
    openModalByOriginalIndex(Math.floor(Math.random() * rows.length));
  });

  document.getElementById('btnThemeToggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('bMMC_theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
  });

  const toggleControlsBtn = document.getElementById('toggleControlsBtn');
  if (toggleControlsBtn) toggleControlsBtn.addEventListener('click', () => toggleCollapsibleControls());

  document.getElementById('btn3DOnly').addEventListener('click', () => {
    if (currentTab !== 'exhibits') setTab('exhibits');
    only3DActive = !only3DActive;
    document.getElementById('btn3DOnly').classList.toggle('ring-2', only3DActive);
    if (only3DActive) showToast('Showing 3D Models Only', '👓');
    filterCatalog(true);
  });

  document.getElementById('btnHotOnly').addEventListener('click', () => {
    if (currentTab !== 'exhibits') setTab('exhibits');
    hotOnlyActive = !hotOnlyActive;
    document.getElementById('btnHotOnly').classList.toggle('ring-2', hotOnlyActive);
    if (hotOnlyActive) showToast('Showing Hot Items Only', '🔥');
    filterCatalog(true);
  });

  document.getElementById('btnFavorites').addEventListener('click', () => {
    showingFavoritesOnly = !showingFavoritesOnly;
    updateFavoritesBadge();
    filterCatalog(true);
  });

  document.getElementById('floatingJumpBtn').addEventListener('click', () => {
    toggleCollapsibleControls(false); scrollToGrid();
  });

  document.getElementById('searchInput').addEventListener('input', () => filterCatalog(true));
  document.getElementById('clearSearch').addEventListener('click', () => { document.getElementById('searchInput').value = ''; filterCatalog(true); });
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('detailModal').addEventListener('click', (e) => { if (e.target === document.getElementById('detailModal')) closeModal(); });
  document.getElementById('close3DLightbox').addEventListener('click', close3DLightbox);
  document.getElementById('lightbox3DModal').addEventListener('click', (e) => { if (e.target === document.getElementById('lightbox3DModal')) close3DLightbox(); });
  document.getElementById('enlargeModal').addEventListener('click', (e) => { if (e.target === document.getElementById('enlargeModal')) closeEnlargeModal(); });
  document.getElementById('modalPrevBtn').addEventListener('click', () => { if (currentModalIndex > 0) openModalByFilteredIndex(currentModalIndex - 1); });
  document.getElementById('modalNextBtn').addEventListener('click', () => { if (currentModalIndex < currentFilteredRows.length - 1) openModalByFilteredIndex(currentModalIndex + 1); });

  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('detailModal');
    const lightbox = document.getElementById('lightbox3DModal');
    const enlargeModal = document.getElementById('enlargeModal');
    if (e.key === 'Escape') {
      if (!enlargeModal.classList.contains('hidden')) { closeEnlargeModal(); return; }
      if (!lightbox.classList.contains('hidden')) { close3DLightbox(); return; }
      if (!modal.classList.contains('hidden')) { closeModal(); return; }
    }
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft' && currentModalIndex > 0) openModalByFilteredIndex(currentModalIndex - 1);
    if (e.key === 'ArrowRight' && currentModalIndex < currentFilteredRows.length - 1) openModalByFilteredIndex(currentModalIndex + 1);
  });

  loadCatalogData();
});