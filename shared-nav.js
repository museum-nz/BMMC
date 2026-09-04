// shared-nav.js — BMMC Universal Navigation Drawer (Safe, Resilient & Hierarchical)
(function() {
  'use strict';

  // 1. Navigation Directory Definition
  const BMMC_BRANCHES = [
    {
      group: "Primary Museum Wings",
      items: [
        { 
          href: 'index.html', 
          icon: '🏛️', 
          label: 'Museum Showcase & Catalog', 
          desc: 'Main artifact exhibition, 3D models & gramophones' 
        },
        { 
          href: 'index.html#stats', 
          icon: '📊', 
          label: 'Museum Insights & Analytics', 
          desc: 'Chronological charts & artifact distribution' 
        },
        { 
          href: '2Dmap.html', 
          icon: '🌍', 
          label: 'Museum Artifact Origin Map', 
          desc: 'Global manufacturing locations & timeline' 
        },
        { 
          href: 'restoration-guide.html', 
          icon: '🛠️', 
          label: 'Artifact Care & Restoration', 
          desc: 'Workshop guide for metals, timber, leather & finishes' 
        }
      ]
    },
    {
      group: "Specialist Databases & Archives",
      items: [
        { 
          href: 'currency.html', 
          icon: '🪙', 
          label: 'NZ Currency & Minting', 
          desc: '1933–2026 coins, banknotes & RBNZ Table F3 metrics' 
        },
        { 
          href: 'stamps.html', 
          icon: '📮', 
          label: 'NZ Stamp Archive (StampsNZ)', 
          desc: 'Comprehensive philatelic catalog & valuations',
          // Nested child section (indented under stamps)
          children: [
            { 
              href: '2Dmap_stamps.html', 
              icon: '🗺️', 
              label: 'Philatelic Photo Map', 
              desc: 'Geographic 2D map of NZ stamps by issue location' 
            }
          ]
        },
        { 
          href: 'nz_history.html', 
          icon: '📜', 
          label: 'Aotearoa NZ History Map', 
          desc: 'Interactive colonial timeline, ships & battles' 
        },
        { 
          href: 'gallery.html', 
          icon: '📷', 
          label: 'Historical Photo Archives', 
          desc: 'Historic photography & Alan Starling WWII oral history' 
        }
      ]
    }
  ];

  // 2. Active Link Matching
  function getCleanCurrentPath() {
    return (window.location.pathname.split('/').pop() || 'index.html').split('#')[0];
  }

  function isLinkActive(href) {
    if (!href) return false;
    const currentPath = getCleanCurrentPath();
    const cleanHref = href.split('#')[0];
    if (href.includes('#')) {
      return (currentPath === cleanHref || (!currentPath && cleanHref === 'index.html')) &&
             window.location.hash === '#' + href.split('#')[1];
    }
    return (currentPath === cleanHref || (!currentPath && cleanHref === 'index.html')) && !window.location.hash;
  }

  // 3. Universal Notification Toast
  function showToast(msg, icon) {
    icon = icon || '✨';
    try {
      let toast = document.getElementById('bmmcUniversalToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'bmmcUniversalToast';
        toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;background:rgba(15,23,42,0.95);color:#fff;padding:10px 20px;border-radius:9999px;box-shadow:0 12px 30px rgba(0,0,0,0.4);font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;transition:opacity 0.3s ease;pointer-events:none;opacity:0;';
        toast.innerHTML = '<span id="bmmcToastIcon">✨</span><span id="bmmcToastMsg">Notification</span>';
        document.body.appendChild(toast);
      }
      document.getElementById('bmmcToastMsg').textContent = msg;
      document.getElementById('bmmcToastIcon').textContent = icon;
      toast.style.opacity = '1';
      setTimeout(function() { toast.style.opacity = '0'; }, 2400);
    } catch (e) {}
  }
  window.showBMMCToast = showToast;

  // 4. Recursive Item Renderer (Supports infinite nesting and indentation)
  function renderMenuItem(item, depth) {
    depth = depth || 0;
    const isChild = depth > 0;
    const href = item.href || '#';
    const active = isLinkActive(href);

    // Dynamic tree-indentation styling
    const indentStyles = isChild
      ? `margin-left:${16 * depth}px; padding-left:10px; border-left:2px solid #e2e8f0;`
      : '';

    let html = `
      <a href="${href}" class="bmmc-drawer-link ${active ? 'active' : ''}" style="display:flex;align-items:center;gap:10px;padding:${isChild ? '7px 10px' : '9px 12px'};border-radius:8px;text-decoration:none;margin-bottom:2px;${indentStyles}${active ? 'background:rgba(2,132,199,0.12);border-left:3px solid #0284c7;' : ''}">
        <span style="font-size:${isChild ? '16px' : '20px'};line-height:1;flex-shrink:0;">${item.icon || '📁'}</span>
        <div style="min-width:0;flex:1;">
          <div style="font-size:${isChild ? '11.5px' : '12px'};font-weight:800;color:${active ? '#0284c7' : '#1e293b'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" class="dark:text-white">
            ${item.label || 'Link'}
          </div>
          ${item.desc ? `<div style="font-size:9.5px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;">${item.desc}</div>` : ''}
        </div>
      </a>
    `;

    // Process nested children recursively
    if (Array.isArray(item.children) && item.children.length > 0) {
      html += `<div class="bmmc-drawer-subgroup" style="margin-top:2px;margin-bottom:4px;">`;
      html += item.children.map(child => renderMenuItem(child, depth + 1)).join('');
      html += `</div>`;
    }

    return html;
  }

  // 5. Menu HTML Generator with Safety Guard
  function generateMenuItemsHTML() {
    try {
      if (!Array.isArray(BMMC_BRANCHES)) throw new Error('BMMC_BRANCHES is not an array');
      return BMMC_BRANCHES.map(section => {
        const groupTitle = section.group || 'Menu';
        const items = Array.isArray(section.items) ? section.items : [];
        return `
          <div style="margin-bottom:16px;">
            <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;padding:4px 8px 6px;">${groupTitle}</div>
            ${items.map(item => renderMenuItem(item, 0)).join('')}
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error('BMMC Nav render error:', err);
      return `<div style="padding:16px;color:#ef4444;font-size:12px;">Failed to load navigation items. <a href="index.html" style="text-decoration:underline;">Return Home</a></div>`;
    }
  }

  // 6. Build Drawer Shell in DOM
  function buildDrawerDOM() {
    if (document.getElementById('bmmc-nav-portal')) return;
    if (!document.body) return; // Prevent failure if script runs before <body> is parsed

    const portal = document.createElement('div');
    portal.id = 'bmmc-nav-portal';
    portal.innerHTML = `
      <div id="bmmcBackdrop" class="bmmc-drawer-backdrop" style="position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);z-index:9998;opacity:0;pointer-events:none;transition:opacity 0.25s ease;" aria-hidden="true"></div>
      <aside id="bmmcDrawer" class="bmmc-drawer" style="position:fixed;top:0;bottom:0;left:0;width:310px;max-width:86vw;background:#ffffff;z-index:9999;box-shadow:0 20px 40px rgba(0,0,0,0.4);transform:translateX(-100%);transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;overflow:hidden;" aria-label="Museum Wings Navigation Menu" role="dialog" aria-modal="true">
        <div style="padding:16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;background:#f8fafc;" class="dark:border-slate-800 dark:bg-slate-900">
          <a href="index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;">
            <span style="font-size:24px;">🏛️</span>
            <div>
              <div style="font-size:14px;font-weight:900;line-height:1;color:#0f172a;" class="dark:text-white">BMMC Showcase</div>
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700;margin-top:3px;">Archive Directory</div>
            </div>
          </a>
          <button id="btnCloseDrawer" style="width:32px;height:32px;border-radius:50%;border:none;background:none;font-size:16px;font-weight:bold;cursor:pointer;color:#64748b;" aria-label="Close menu">✕</button>
        </div>

        <div style="flex:1;overflow-y:auto;padding:12px;" class="custom-scrollbar dark:bg-slate-900">
          ${generateMenuItemsHTML()}
        </div>

        <div style="padding:14px;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;background:#f8fafc;" class="dark:border-slate-800 dark:bg-slate-900">
          <button id="btnDrawerThemeToggle" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:10px;border:1px solid #cbd5e1;background:#fff;font-size:12px;font-weight:700;cursor:pointer;" class="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
            <span id="drawerThemeIcon">☀️</span> <span id="drawerThemeLabel">Theme</span>
          </button>
          <a href="index.html" style="font-size:12px;font-weight:800;color:#0284c7;text-decoration:none;">Museum Home →</a>
        </div>
      </aside>
    `;
    document.body.appendChild(portal);
  }

  // 7. Fail-safe Drawer Controls
  function openDrawer() {
    let drawer = document.getElementById('bmmcDrawer');
    let backdrop = document.getElementById('bmmcBackdrop');

    // On-demand DOM assembly if not yet initialized
    if (!drawer || !backdrop) {
      buildDrawerDOM();
      drawer = document.getElementById('bmmcDrawer');
      backdrop = document.getElementById('bmmcBackdrop');
    }

    if (drawer && backdrop) {
      drawer.style.transform = 'translateX(0)';
      backdrop.style.opacity = '1';
      backdrop.style.pointerEvents = 'auto';
    }
  }

  function closeDrawer() {
    const drawer = document.getElementById('bmmcDrawer');
    const backdrop = document.getElementById('bmmcBackdrop');
    if (drawer && backdrop) {
      drawer.style.transform = 'translateX(-100%)';
      backdrop.style.opacity = '0';
      backdrop.style.pointerEvents = 'none';
    }
  }

  window.openBMMCDrawer = openDrawer;
  window.closeBMMCDrawer = closeDrawer;

  // 8. Event Delegation (Works for all triggers, even dynamically rendered ones)
  document.addEventListener('click', function(e) {
    const openBtn = e.target.closest('.btn-bmmc-menu-trigger, [data-bmmc-menu], #btnMenuToggle');
    if (openBtn) {
      e.preventDefault();
      e.stopPropagation();
      openDrawer();
      return;
    }

    if (e.target.closest('#btnCloseDrawer') || e.target.id === 'bmmcBackdrop') {
      e.preventDefault();
      closeDrawer();
      return;
    }

    if (e.target.closest('#btnDrawerThemeToggle')) {
      try {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        localStorage.setItem('bMMC_theme', isDark ? 'dark' : 'light');
        const icon = document.getElementById('drawerThemeIcon');
        if (icon) icon.textContent = isDark ? '🌙' : '☀️';
        showToast(isDark ? 'Night Mode Activated' : 'Day Mode Activated', isDark ? '🌙' : '☀️');
      } catch (err) {}
    }
  });

  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDrawer();
  });

  // 9. Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildDrawerDOM);
  } else {
    buildDrawerDOM();
  }
})();