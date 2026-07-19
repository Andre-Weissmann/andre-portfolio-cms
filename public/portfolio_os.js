/* ══════════════════════════════════════════════════════════════
   PORTFOLIO OS  —  Navigation Layer
   Status bar · Command palette · Schema tree · Minimap
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Data catalogue ─────────────────────────────────────────── */
  const SECTIONS = [
    { id: 'home',       label: 'Home',       icon: '⌂', rows: null },
    { id: 'about',      label: 'About',      icon: '◉', rows: null },
    { id: 'skills',     label: 'Skills',     icon: '▤',  rows: 6   },
    { id: 'projects',   label: 'Projects',   icon: '◈',  rows: 5   },
    { id: 'experience', label: 'Experience', icon: '◷',  rows: 3   },
    { id: 'contact',    label: 'Contact',    icon: '▷',  rows: null },
  ];

  // Command palette items — no shortcut hints shown, just labels that make sense to anyone
  const CMD_ITEMS = [
    { group: 'Go to',    label: 'Home',             icon: '⌂', action: () => scrollTo('home')       },
    { group: 'Go to',    label: 'About',            icon: '◉', action: () => scrollTo('about')      },
    { group: 'Go to',    label: 'Skills',           icon: '▤', action: () => scrollTo('skills')     },
    { group: 'Go to',    label: 'Projects',         icon: '◈', action: () => scrollTo('projects')   },
    { group: 'Go to',    label: 'Experience',       icon: '◷', action: () => scrollTo('experience') },
    { group: 'Go to',    label: 'Contact',          icon: '▷', action: () => scrollTo('contact-form')    },
    { group: 'Projects', label: 'Nashville SQL',    icon: '⬡', action: () => openProject('nashville') },
    { group: 'Projects', label: 'Power BI Survey',  icon: '⬡', action: () => openProject('survey')    },
    { group: 'Projects', label: 'Airbnb Tableau',   icon: '⬡', action: () => openProject('airbnb')    },
    { group: 'Projects', label: 'BMI Python',       icon: '⬡', action: () => openProject('bmi')       },
    { group: 'Projects', label: 'Bike Sales Excel', icon: '⬡', action: () => openProject('bikes')     },
    { group: 'Actions',  label: 'View Resume',      icon: '▤', action: () => { if (window.self !== window.top) { try { window.top.open('resume.html', '_blank', 'noopener,noreferrer'); } catch(e) { window.open('resume.html', '_blank', 'noopener,noreferrer'); } } else { window.open('resume.html', '_blank', 'noopener,noreferrer'); } } },
    { group: 'Actions',  label: 'Download Resume',  icon: '↓', action: () => window.open('Andre_Weissmann_Resume.pdf', '_blank') },
    { group: 'Actions',  label: 'Open GitHub',      icon: '⌥', action: () => window.open('https://github.com/Andre-Weissmann', '_blank') },
    { group: 'Actions',  label: 'Toggle Theme',     icon: '◑', action: () => document.querySelector('[data-theme-toggle]')?.click() },
  ];

  /* ─── Utilities ──────────────────────────────────────────────── */
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  function openProject(id) {
    scrollTo('projects');
    setTimeout(() => {
      const btn = document.querySelector(`[data-explore="${id}"]`);
      if (btn) btn.click();
    }, 600);
  }

  function currentSectionId() {
    const sections = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
    let active = sections[0];
    for (const s of sections) {
      const rect = s.getBoundingClientRect();
      if (rect.top <= 120) active = s;
    }
    return active ? active.id : 'home';
  }

  function isMac() {
    return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  }

  /* ─── 1. NAV ROW COUNTS — removed ──────────────────────────── */
  function initNavCounts() { /* badges removed */ }

  /* ─── 2. SCHEMA TREE SIDEBAR ─────────────────────────────────── */
  function buildSchemaTree() {
    const oldToc = document.getElementById('toc-sidebar');
    if (oldToc) oldToc.remove();

    const tree = document.createElement('nav');
    tree.id = 'pos-schema-tree';
    tree.setAttribute('aria-label', 'Schema navigator');

    const sections = SECTIONS.filter(s => s.id !== 'home');

    tree.innerHTML = `
      <div class="pos-tree-root">
        <button class="pos-tree-db" id="pos-tree-db-btn" aria-expanded="true">
          <span class="pos-tree-db-icon">🗄</span>
          <span class="pos-tree-db-name">andre_weissmann_db</span>
          <span class="pos-tree-chevron" id="pos-tree-chevron">▾</span>
        </button>
        <div class="pos-tree-children" id="pos-tree-children">
          ${sections.map(s => `
            <a class="pos-tree-item" data-section="${s.id}" href="#${s.id}">
              <span class="pos-tree-icon">▤</span>
              <span class="pos-tree-table">${s.id}</span>

            </a>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(tree);

    document.getElementById('pos-tree-db-btn').addEventListener('click', () => {
      const children = document.getElementById('pos-tree-children');
      const chevron = document.getElementById('pos-tree-chevron');
      const btn = document.getElementById('pos-tree-db-btn');
      const collapsed = children.classList.toggle('collapsed');
      chevron.textContent = collapsed ? '▸' : '▾';
      btn.setAttribute('aria-expanded', !collapsed);
    });

    tree.querySelectorAll('.pos-tree-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        scrollTo(item.dataset.section);
      });
    });

    window.addEventListener('pos-section-change', e => {
      tree.querySelectorAll('.pos-tree-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === e.detail.id);
      });
    });
  }

  /* ─── 3. COMMAND PALETTE ─────────────────────────────────────── */
  let paletteOpen = false;
  let paletteItems = [];
  let paletteIndex = 0;

  function buildPalette() {
    const overlay = document.createElement('div');
    overlay.id = 'pos-palette-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Search');
    overlay.hidden = true;

    overlay.innerHTML = `
      <div class="pos-palette-box" id="pos-palette-box">
        <div class="pos-palette-search-row">
          <span class="pos-palette-search-icon">⌕</span>
          <input class="pos-palette-input" id="pos-palette-input"
            type="text" placeholder="Jump to a section or project..." autocomplete="off" spellcheck="false" />
        </div>
        <div class="pos-palette-results" id="pos-palette-results" role="listbox"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => {
      if (e.target === overlay) closePalette();
    });

    const input = document.getElementById('pos-palette-input');
    input.addEventListener('input', () => renderResults(input.value));
    input.addEventListener('keydown', handlePaletteKey);

    renderResults('');
  }

  function renderResults(query) {
    const q = query.toLowerCase().trim();
    const filtered = q
      ? CMD_ITEMS.filter(item =>
          item.label.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q)
        )
      : CMD_ITEMS;

    paletteItems = filtered;
    paletteIndex = 0;

    const container = document.getElementById('pos-palette-results');
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = '<div class="pos-palette-empty">No results</div>';
      return;
    }

    const groups = {};
    filtered.forEach(item => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });

    let html = '';
    let globalIdx = 0;
    Object.entries(groups).forEach(([group, items]) => {
      html += `<div class="pos-palette-group-label">${group}</div>`;
      items.forEach(item => {
        const idx = globalIdx++;
        html += `
          <button class="pos-palette-result${idx === 0 ? ' selected' : ''}" data-idx="${idx}" role="option">
            <span class="pos-palette-result-icon">${item.icon}</span>
            <span class="pos-palette-result-label">${item.label}</span>
          </button>
        `;
      });
    });

    container.innerHTML = html;
    container.querySelectorAll('.pos-palette-result').forEach((btn, i) => {
      btn.addEventListener('mouseenter', () => { paletteIndex = i; updateSelected(); });
      btn.addEventListener('click', () => { paletteItems[i].action(); closePalette(); });
    });
  }

  function handlePaletteKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); paletteIndex = Math.min(paletteIndex + 1, paletteItems.length - 1); updateSelected(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); paletteIndex = Math.max(paletteIndex - 1, 0); updateSelected(); }
    if (e.key === 'Enter')     { e.preventDefault(); if (paletteItems[paletteIndex]) { paletteItems[paletteIndex].action(); closePalette(); } }
    if (e.key === 'Escape')    { closePalette(); }
  }

  function updateSelected() {
    document.querySelectorAll('.pos-palette-result').forEach((btn, i) => {
      btn.classList.toggle('selected', i === paletteIndex);
      if (i === paletteIndex) btn.scrollIntoView({ block: 'nearest' });
    });
  }

  function openPalette() {
    const overlay = document.getElementById('pos-palette-overlay');
    if (!overlay) return;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('open'));
    const input = document.getElementById('pos-palette-input');
    if (input) { input.value = ''; input.focus(); }
    renderResults('');
    paletteOpen = true;
    document.body.style.overflow = 'hidden';
  }

  function closePalette() {
    const overlay = document.getElementById('pos-palette-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    setTimeout(() => { overlay.hidden = true; }, 200);
    paletteOpen = false;
    document.body.style.overflow = '';
  }

  /* ─── 4. MINIMAP ─────────────────────────────────────────────── */
  function buildMinimap() {
    const map = document.createElement('div');
    map.id = 'pos-minimap';
    map.setAttribute('aria-hidden', 'true');

    const sections = SECTIONS.filter(s => s.id !== 'home');
    const colors = {
      about: 'var(--color-primary)',
      skills: '#e9a530',
      projects: '#4f98a3',
      experience: '#7a39bb',
      contact: 'var(--color-primary)',
    };

    map.innerHTML = `
      <div class="pos-mm-track" id="pos-mm-track">
        ${sections.map(s => `
          <div class="pos-mm-section" data-section="${s.id}" title="${s.label}"
               style="background: ${colors[s.id] || 'var(--color-border)'}">
          </div>
        `).join('')}
        <div class="pos-mm-thumb" id="pos-mm-thumb"></div>
      </div>
    `;

    document.body.appendChild(map);

    map.querySelectorAll('.pos-mm-section').forEach(s => {
      s.addEventListener('click', () => scrollTo(s.dataset.section));
    });

    let raf = false;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docH > 0 ? scrollTop / docH : 0;
        const track = document.getElementById('pos-mm-track');
        const thumb = document.getElementById('pos-mm-thumb');
        if (track && thumb) {
          const trackH = track.clientHeight;
          const thumbH = 40;
          thumb.style.top = Math.max(0, Math.min(trackH - thumbH, pct * (trackH - thumbH))) + 'px';
        }
        raf = false;
      });
    }, { passive: true });
  }

  /* ─── 5. KEYBOARD ROUTING — removed ───────────────────────────── */
  function initKeyboard() { /* all hotkeys removed */ }

  /* ─── 6. SECTION BROADCAST ───────────────────────────────────── */
  function initSectionBroadcast() {
    const tocObs = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const el = m.target;
          if (el.classList.contains('active') && el.dataset?.section) {
            window.dispatchEvent(new CustomEvent('pos-section-change', {
              detail: { id: el.dataset.section }
            }));
          }
        }
      });
    });

    document.querySelectorAll('.msn-pill[data-msn]').forEach(pill => {
      tocObs.observe(pill, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ─── 7. BREADCRUMBS IN MODALS ───────────────────────────────── */
  function initModalBreadcrumbs() {
    const projectNames = {
      nashville: 'Nashville SQL',
      survey:    'Power BI Survey',
      airbnb:    'Airbnb Tableau',
      bmi:       'BMI Python',
      bikes:     'Bike Sales Excel',
    };

    const patchModal = (id) => {
      const header = document.querySelector(`#pdm-${id} .pdm-header`);
      if (!header || header.querySelector('.pos-breadcrumb')) return;
      const bc = document.createElement('div');
      bc.className = 'pos-breadcrumb';
      bc.innerHTML = `
        <a class="pos-bc-link" href="#projects" onclick="event.preventDefault(); document.getElementById('projects').scrollIntoView({behavior:'smooth'})">Projects</a>
        <span class="pos-bc-sep">›</span>
        <span class="pos-bc-current">${projectNames[id] || id}</span>
      `;
      header.insertBefore(bc, header.firstChild);
    };

    const observer = new MutationObserver(() => {
      Object.keys(projectNames).forEach(id => patchModal(id));
    });
    const container = document.getElementById('pdm-container');
    if (container) observer.observe(container, { childList: true, subtree: true, attributes: true });
    Object.keys(projectNames).forEach(id => patchModal(id));
  }

  /* ─── INIT ───────────────────────────────────────────────────── */
  function init() {
    initNavCounts();
    buildSchemaTree();
    buildPalette();
    buildMinimap();
    initKeyboard();
    initSectionBroadcast();
    // No nav Ctrl+K badge — single entry point is the status bar Search button
    setTimeout(initModalBreadcrumbs, 500);
    setTimeout(() => {
      const id = currentSectionId();
      window.dispatchEvent(new CustomEvent('pos-section-change', { detail: { id } }));
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
