// shared-nav.js — Unified BMMC Universal Navigation Drawer & Engine
// Provides consistent navigation, cross-tab theme syncing, and unified notifications across all wings.

(function() {
  'use strict';

  // Identify current page
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  // Master Branch Manifest
  const BMMC_BRANCHES = [
    {
      group: "Primary Museum Wings",
      items: [
        { href: 'index.html', icon: '🏛️', label: 'Museum Showcase & Catalog', desc: 'Main artifact exhibition, 3D models & gramophones' },
        { href: 'index.html#stats', icon: '📊', label: 'Museum Insights & Analytics', desc: 'Chronological charts & artifact distribution' },
        { href: 'gallery.html', icon: '📷', label: 'Historical Photo Archives', desc: 'Historic photography & Alan Starling WWII oral history' },
        { href: 'restoration-guide.html', icon: '🛠️', label: 'Artifact Care & Restoration', desc: 'Workshop guide for metals, timber, leather & finishes' }
      ]
    },
    {
      group: "Specialist Databases & Archives",
      items: [
        { href: 'currency.html', icon: '🪙', label: 'NZ Currency & Minting', desc: '1933–2026 coins, banknotes & RBNZ Table F3 metrics' },
        { href: 'stamps.html', icon: '📮', label: 'NZ Stamp Archive (StampsNZ)', desc: 'Comprehensive philatelic catalog & valuations' }
      ]
    },
    {
      group: "Spatial & Historical Maps",
      items: [
        { href: 'nz_history.html', icon: '📜', label: 'Aotearoa NZ History Map', desc: 'Interactive colonial timeline, ships & battles' },
        { href: '2Dmap_stamps.html', icon: '🗺️', label: 'Philatelic Photo Map', desc: 'Geographic 2D map of NZ stamps by issue location' },
        { href: '2Dmap.html', icon: '🌍', label: 'Museum Artifact Origin Map', desc: 'Global manufacturing locations & timeline' }
      ]
    }
  ];

  // Helper to determine active state
  function isLinkActive(href) {
    const cleanHref = href.split('#')[0];
    const cleanCurrent = currentPath.split('#')[0] || 'index.html';
    if (href.includes('#')) {
      return (cleanCurrent === cleanHref || (cleanCurrent === '' && cleanHref === 'index.html')) && window.location.hash === '#' + href.split('#')[1];
    }
    return (cleanCurrent === cleanHref || (cleanCurrent === '' && cleanHref === 'index.html')) && !window.location.hash;
  }

  // Universal Toast Notification
  function showToast(msg, icon = '✨') {
    let toast = document.getElementById('bmmcUniversalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bmmcUniversalToast';
      toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] bg-slate-900/95 text-white dark:bg-slate-100 dark:text-slate-900 px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-slate-700/50 dark:border-slate-300/50 text-xs font-semibold flex items-center gap-2.5 opacity-0 pointer-events-none transition-all duration-300 translate-y-3';
      toast.innerHTML = '<span id="bmmcToastIcon">✨</span><span id="bmmcToastMsg">Notification</span>';
      document.body.appendChild(toast);
    }
    const msgEl = document.getElementById('bmmcToastMsg');
    const iconEl = document.getElementById('bmmcToastIcon');
    if (msgEl) msgEl.textContent = msg;
    if (iconEl) iconEl.textContent = icon;
    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
    setTimeout(() => {
      toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
    }, 2400);
  }
  window.showBMMCToast = showToast;

  // Build Off-Canvas Drawer HTML
  function buildDrawerDOM() {
    const portal = document.createElement('div');
    portal.id = 'bmmc-nav-portal';
    portal.innerHTML = `
      <div id="bmmcBackdrop" class="bmmc-drawer-backdrop" aria-hidden="true"></div>
      <aside id="bmmcDrawer" class="bmmc-drawer" aria-label="Museum Wings Navigation Menu" role="dialog" aria-modal="true">
        
        <!-- Header -->
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <a href="index.html" class="flex items-center gap-2.5 text-inherit no-underline group">
            <span class="text-2xl transition-transform group-hover:scale-110">🏛️</span>
            <div>
              <h2 class="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">BMMC Showcase</h2>
              <p class="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mt-1">Archive Wings Directory</p>
            </div>
          </a>
          <button id="btnCloseDrawer" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer text-sm font-bold" aria-label="Close menu">✕</button>
        </div>

        <!-- Links Container -->
        <div class="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          ${BMMC_BRANCHES.map(section => `
            <div class="space-y-1">
              <div class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">${section.group}</div>
              ${section.items.map(item => {
                const active = isLinkActive(item.href);
                return `
                  <a href="${item.href}" class="bmmc-drawer-link ${active ? 'active' : ''}">
                    <span class="text-xl shrink-0 leading-none">${item.icon}</span>
                    <div class="leading-tight min-w-0 flex-1">
                      <div class="font-extrabold text-xs truncate ${active ? 'text-blue-600 dark:text-sky-400' : 'text-slate-800 dark:text-slate-200'}">${item.label}</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">${item.desc}</div>
                    </div>
                  </a>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>

        <!-- Footer -->
        <div class="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-2 shrink-0">
          <button id="btnDrawerThemeToggle" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer">
            <span id="drawerThemeIcon">☀️</span> <span id="drawerThemeLabel">Theme</span>
          </button>
          <a href="index.html" class="text-xs font-black text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1">
            <span>Museum Home</span> <span>→</span>
          </a>
        </div>
      </aside>
    `;
    document.body.appendChild(portal);
  }

  // Sync Theme State
  function syncTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('bMMC_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('bMMC_theme', 'light');
    }

    const drawerIcon = document.getElementById('drawerThemeIcon');
    const drawerLabel = document.getElementById('drawerThemeLabel');
    if (drawerIcon) drawerIcon.textContent = isDark ? '🌙' : '☀️';
    if (drawerLabel) drawerLabel.textContent = isDark ? 'Night' : 'Day';

    // Sync any page-local theme toggle buttons
    const localIcon = document.getElementById('themeToggleIcon');
    if (localIcon) localIcon.textContent = isDark ? '☀️' : '🌙';
  }

  function init() {
    buildDrawerDOM();

    const drawer = document.getElementById('bmmcDrawer');
    const backdrop = document.getElementById('bmmcBackdrop');
    const closeBtn = document.getElementById('btnCloseDrawer');
    const themeBtn = document.getElementById('btnDrawerThemeToggle');

    function openDrawer() {
      if (!drawer || !backdrop) return;
      drawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.classList.add('overflow-hidden');
    }

    function closeDrawer() {
      if (!drawer || !backdrop) return;
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.classList.remove('overflow-hidden');
    }

    window.openBMMCDrawer = openDrawer;
    window.closeBMMCDrawer = closeDrawer;

    backdrop?.addEventListener('click', closeDrawer);
    closeBtn?.addEventListener('click', closeDrawer);

    // Bind triggers on this page
    document.querySelectorAll('.btn-bmmc-menu-trigger, [data-bmmc-menu], #btnExploreDropdown, #btnMenuToggle').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        // If it was the dropdown button on index, prevent dropdown and open drawer instead
        e.preventDefault();
        e.stopPropagation();
        openDrawer();
      });
    });

    // Theme toggle in drawer
    themeBtn?.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      syncTheme(!isCurrentlyDark);
      showToast(!isCurrentlyDark ? 'Night Mode Activated' : 'Day Mode Activated', !isCurrentlyDark ? '🌙' : '☀️');
    });

    // Cross-tab storage listener
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme' || e.key === 'bMMC_theme') {
        syncTheme(e.newValue === 'dark');
      }
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer?.classList.contains('active')) {
        closeDrawer();
      }
    });

    // Initialize drawer theme button icon
    const isDark = document.documentElement.classList.contains('dark');
    syncTheme(isDark);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();