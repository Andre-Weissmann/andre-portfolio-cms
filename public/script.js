/* ══════════════════════════════════════════════════
   ANDRE WEISSMANN PORTFOLIO — FULL INTERACTIVE JS
   ══════════════════════════════════════════════════ */

/* ── optToggle: Apple HIG accordion for JOIN + CASE WHEN optional blocks ── */
function optToggle(blockId, headerId, bodyId, summaryId) {
  var block = document.getElementById(blockId);
  var header = document.getElementById(headerId);
  if (!block || !header) return;
  var isOpen = block.getAttribute('data-expanded') === 'true';
  var nextOpen = !isOpen;
  block.setAttribute('data-expanded', nextOpen ? 'true' : 'false');
  header.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
}

/* Update summary text for JOIN block */
function updateJoinSummary(via) {
  var el = document.getElementById('qb-join-summary');
  if (!el) return;
  var labels = {
    linkedin: 'LinkedIn', job_board: 'Job board',
    referral: 'Referral', word_of_mouth: 'Word of mouth',
    just_browsing: 'Just browsing'
  };
  if (via && labels[via]) {
    el.innerHTML = '<span class="opt-dot" aria-hidden="true"></span>' + labels[via];
    el.classList.add('opt-summary--filled');
  } else {
    el.textContent = 'Not selected';
    el.classList.remove('opt-summary--filled');
  }
}

/* Update summary text for CASE WHEN block */
function updateCaseWhenSummary(caseVal) {
  var el = document.getElementById('qb-casewhen-summary');
  if (!el) return;
  if (caseVal === 'followup') {
    el.innerHTML = '<span class="opt-dot" aria-hidden="true"></span>Marked as urgent';
    el.classList.add('opt-summary--filled');
  } else {
    el.textContent = 'Standard priority';
    el.classList.remove('opt-summary--filled');
  }
}

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────
     1. THEME TOGGLE
     Default: light. Respects OS prefers-color-scheme on first load.
     If OS is dark → dark. Everything else → light.
     Deep dive panel always mirrors this preference.
  ───────────────────────────────────────────────── */
  const html = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');

  // OS-aware default + localStorage persistence
  const osPrefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = (() => { try { return localStorage.getItem('theme-preference'); } catch(e) { return null; } })();
  let currentTheme = savedTheme || (osPrefersDark ? 'dark' : 'light');
  html.setAttribute('data-theme', currentTheme);
  updateToggleIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', currentTheme);
      try { localStorage.setItem('theme-preference', currentTheme); } catch(e) {}
      updateToggleIcon(currentTheme);
      setTimeout(rebuildAllCharts, 50);
      /* Sync deep dive panel to match main theme */
      syncDDTheme(currentTheme);
    });
  }

  /* Sync deep dive panel light/dark class to match the main portfolio theme */
  window.syncDDTheme = function(theme) {
    var panel = document.getElementById('dd-panel');
    if (!panel) return;
    if (theme === 'light') {
      panel.classList.add('brief-light');
    } else {
      panel.classList.remove('brief-light');
    }
    /* Update the theme toggle button label inside the panel */
    var btn = document.getElementById('dd-theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'light'
        ? '<span id="dd-theme-icon">\u2600</span> Light'
        : '<span id="dd-theme-icon">\u263E</span> Dark';
    }
  };

  function updateToggleIcon(theme) {
    if (!themeToggle) return;
    var iconEl  = themeToggle.querySelector('.theme-toggle__icon');
    var labelEl = themeToggle.querySelector('.theme-toggle__label');
    if (theme === 'dark') {
      // Currently dark — clicking switches to light → show sun icon + "Light mode"
      if (iconEl) iconEl.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
      if (labelEl) labelEl.textContent = 'Light mode';
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      // Currently light — clicking switches to dark → show moon icon + "Dark mode"
      if (iconEl) iconEl.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      if (labelEl) labelEl.textContent = 'Dark mode';
      themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  /* ─────────────────────────────────────────────────
     2. HEADER SCROLL + HAMBURGER
  ───────────────────────────────────────────────── */
  const header = document.getElementById('header');

  /* ── Mobile section nav: hide in hero, show once scrolled past it ── */
  const mobileSecNav = document.getElementById('mobile-section-nav');
  const heroSection = document.querySelector('.hero-section') || document.querySelector('section');
  if (mobileSecNav) {
    // Start hidden
    mobileSecNav.classList.add('nav-hidden');
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 200;
      if (heroBottom > 60) {
        // Still in hero — keep hidden
        mobileSecNav.classList.add('nav-hidden');
      } else {
        // Past hero — show
        mobileSecNav.classList.remove('nav-hidden');
      }
      lastScrollY = window.scrollY;
    }, { passive: true });
  }

  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 10);
  }, { passive: true });

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      mobileMenu.setAttribute('aria-hidden', String(!open));
    });
    mobileMenu.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }));
  }

  /* ─────────────────────────────────────────────────
     3. SCROLL SPY + FADE ANIMATIONS
  ───────────────────────────────────────────────── */
  const navLinks = document.querySelectorAll('.nav-links a');
  const spyObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  document.querySelectorAll('section[id]').forEach(s => spyObs.observe(s));

  const activeStyle = document.createElement('style');
  activeStyle.textContent = `.nav-links a.active { color: var(--color-primary) !important; background: color-mix(in oklab, var(--color-primary) 10%, transparent) !important; }`;
  document.head.appendChild(activeStyle);

  // Fade-up on scroll — generous thresholds so fast mobile scrolling never misses elements
  // NOTE: .skill-card intentionally excluded — skills section is always visible, no fade
  // Apple HIG: project-block added so whole project row animates in (Apple 300ms ease-out)
  const fadeTargets = ['.project-block', '.project-block-info', '.project-block-demo', '.tl-item', '.cert-card', '.about-stat', '.hcard'];
  fadeTargets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('fade-up');
      // Cap delay at 150ms so staggered items don't feel laggy on mobile
      el.style.transitionDelay = `${Math.min(i * 40, 150)}ms`;
    });
  });
  const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        fadeObs.unobserve(e.target);
        // Remove will-change after transition completes to free GPU layers
        // Keeping will-change permanently on 30+ elements crushes scroll perf
        setTimeout(() => { e.target.style.willChange = 'auto'; }, 500);
      }
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px 400px 0px'
  });
  document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

  // Helper: reveal all .fade-up elements within extraPx of the viewport bottom
  function revealAbove(extraPx) {
    document.querySelectorAll('.fade-up:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + extraPx) {
        el.classList.add('visible');
        setTimeout(() => { el.style.willChange = 'auto'; }, 500);
      }
    });
  }

  // Immediately reveal anything already in viewport on load (run earlier)
  setTimeout(() => { revealAbove(400); }, 100);

  // Scroll-end safety sweep: catch any elements missed during fast scrolling
  let __scrollTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(__scrollTimer);
    __scrollTimer = setTimeout(() => { revealAbove(400); }, 120);
  }, { passive: true });

  // Tab-switch / bfcache safety sweep
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { revealAbove(400); }
  });

  // Curtain reveal navigation for hero CTA buttons
  // Single scroll authority — used by nav links, hero buttons, and Data Rail
  // Uses offsetTop chain (absolute position from document top) minus navH — immune to scroll position and CSS scroll-margin
  function _absTop(el) {
    var y = 0;
    while (el) { y += el.offsetTop; el = el.offsetParent; }
    return y;
  }
  window.instantJump = function(e, sectionId) {
    if (e && e.preventDefault) e.preventDefault();
    var target = document.getElementById(sectionId);
    if (!target) return;
    var navH = (document.querySelector('header') || {}).offsetHeight || 68;
    var dest = Math.max(0, _absTop(target) - navH);
    // Kill any active iOS momentum scroll before jumping — otherwise iOS ignores scrollTo
    window.scrollTo({ top: window.scrollY, behavior: 'instant' });
    // rAF ensures the instant stop is painted before the smooth scroll starts
    requestAnimationFrame(function() {
      window.scrollTo({ top: dest, behavior: 'smooth' });
    });
  };

  // Anchor click handler — skip links that already call instantJump via onclick
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    if (a.getAttribute('onclick') && a.getAttribute('onclick').indexOf('instantJump') !== -1) return;
    a.addEventListener('click', function(e) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navH = (document.querySelector('header') || {}).offsetHeight || 68;
      window.scrollTo({ top: Math.max(0, _absTop(target) - navH), behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────────────
     4. SQL SANDBOX — Nashville Housing
     Uses sql.js (SQLite compiled to WebAssembly)
  ───────────────────────────────────────────────── */
  let sqlDB = null;

  // Seed data: 40 representative Nashville housing rows
  const housingData = [
    ['2013007200000','VACANT RESIDENTIAL LAND','2013-01-14',182000,'Williamson County, TN','N','N',null,null,null,null],
    ['2013007200000','VACANT RESIDENTIAL LAND','2013-01-14',182000,'Williamson County, TN','N','N',null,null,null,null],
    ['2013009100000','SINGLE FAMILY','2013-01-09',148000,'Williamson County, TN','Y','Y','1880 Elm Hill Pike #2','Nashville','TN','37210'],
    ['2015001600000','SINGLE FAMILY','2015-02-10',253000,'Davidson County, TN','Y','Y','4317 Lealand Ln','Nashville','TN','37204'],
    ['2015003500000','VACANT RESIDENTIAL LAND','2015-03-16',400000,'Davidson County, TN','Y','N',null,null,null,null],
    ['2016001400000','SINGLE FAMILY','2016-01-07',340000,'Davidson County, TN','Y','Y','100 Hillside Ave','Nashville','TN','37205'],
    ['2016002100000','DUPLEX','2016-02-14',225000,'Davidson County, TN','Y','Y','201 Main St Apt A','Nashville','TN','37206'],
    ['2016004300000','SINGLE FAMILY','2016-03-22',195000,'Davidson County, TN','Y','Y','456 Oak Ave','Nashville','TN','37207'],
    ['2016007800000','VACANT RESIDENTIAL LAND','2016-04-10',80000,'Davidson County, TN','N','N',null,null,null,null],
    ['2017001200000','SINGLE FAMILY','2017-01-15',415000,'Williamson County, TN','Y','Y','789 Maple Dr','Brentwood','TN','37027'],
    ['2017003400000','CONDO','2017-02-20',287000,'Davidson County, TN','Y','Y','1234 Church St #5A','Nashville','TN','37219'],
    ['2017005600000','SINGLE FAMILY','2017-03-05',520000,'Williamson County, TN','Y','Y','2468 Franklin Pike','Nashville','TN','37204'],
    ['2017007800000','DUPLEX','2017-04-18',198000,'Davidson County, TN','Y','Y','357 Dickerson Rd','Nashville','TN','37207'],
    ['2017009000000','VACANT RESIDENTIAL LAND','2017-05-25',55000,'Davidson County, TN','N','N',null,null,null,null],
    ['2018001500000','SINGLE FAMILY','2018-01-12',389000,'Davidson County, TN','Y','Y','159 Belmont Blvd','Nashville','TN','37212'],
    ['2018002700000','SINGLE FAMILY','2018-02-28',460000,'Williamson County, TN','Y','Y','753 Wilson Pike','Brentwood','TN','37027'],
    ['2018004900000','CONDO','2018-03-15',215000,'Davidson County, TN','Y','Y','810 Broadway #12B','Nashville','TN','37203'],
    ['2018006100000','SINGLE FAMILY','2018-04-22',310000,'Davidson County, TN','Y','Y','246 Granny White Pike','Nashville','TN','37204'],
    ['2018008300000','SINGLE FAMILY','2018-06-07',275000,'Davidson County, TN','Y','Y','369 Nolensville Pike','Nashville','TN','37211'],
    ['2019001800000','VACANT RESIDENTIAL LAND','2019-01-30',120000,'Davidson County, TN','N','N',null,null,null,null],
    ['2019003000000','SINGLE FAMILY','2019-02-14',490000,'Williamson County, TN','Y','Y','147 Old Hickory Blvd','Brentwood','TN','37027'],
    ['2019005200000','SINGLE FAMILY','2019-03-21',355000,'Davidson County, TN','Y','Y','258 Harding Pl','Nashville','TN','37205'],
    ['2019007400000','DUPLEX','2019-04-08',230000,'Davidson County, TN','Y','Y','963 Gallatin Ave','Nashville','TN','37206'],
    ['2019009600000','CONDO','2019-05-17',340000,'Davidson County, TN','Y','Y','1500 Charlotte Ave #8','Nashville','TN','37203'],
    ['2020001100000','SINGLE FAMILY','2020-01-09',575000,'Williamson County, TN','Y','Y','741 Crockett Rd','Franklin','TN','37064'],
    ['2020002300000','SINGLE FAMILY','2020-02-25',320000,'Davidson County, TN','Y','Y','852 Meridian St','Nashville','TN','37207'],
    ['2020004500000','VACANT RESIDENTIAL LAND','2020-03-10',95000,'Davidson County, TN','N','N',null,null,null,null],
    ['2020006700000','SINGLE FAMILY','2020-04-16',445000,'Davidson County, TN','Y','Y','963 Green Hills Dr','Nashville','TN','37215'],
    ['2020008900000','SINGLE FAMILY','2020-06-29',385000,'Davidson County, TN','Y','Y','174 Eastland Ave','Nashville','TN','37206'],
    ['2021001400000','CONDO','2021-01-21',280000,'Davidson County, TN','Y','Y','415 Union St #3C','Nashville','TN','37219'],
    ['2021003600000','SINGLE FAMILY','2021-02-17',610000,'Williamson County, TN','Y','Y','286 Mack Hatcher Pkwy','Franklin','TN','37064'],
    ['2021005800000','SINGLE FAMILY','2021-03-24',400000,'Davidson County, TN','Y','Y','397 Grieve Hall Ave','Nashville','TN','37218'],
    ['2021007000000','DUPLEX','2021-04-13',260000,'Davidson County, TN','Y','Y','508 Shelby Ave','Nashville','TN','37206'],
    ['2021009200000','SINGLE FAMILY','2021-05-30',510000,'Williamson County, TN','Y','Y','619 Sneed Rd','Franklin','TN','37069'],
    ['2022001700000','VACANT RESIDENTIAL LAND','2022-01-06',145000,'Davidson County, TN','N','N',null,null,null,null],
    ['2022003900000','SINGLE FAMILY','2022-02-22',695000,'Williamson County, TN','Y','Y','730 Hill Place','Brentwood','TN','37027'],
    ['2022005100000','SINGLE FAMILY','2022-03-08',455000,'Davidson County, TN','Y','Y','841 Woodmont Blvd','Nashville','TN','37205'],
    ['2022007300000','CONDO','2022-04-19',375000,'Davidson County, TN','Y','Y','952 Division St #7F','Nashville','TN','37203'],
    ['2022009500000','SINGLE FAMILY','2022-05-26',530000,'Davidson County, TN','Y','Y','163 Timberline Dr','Nashville','TN','37221'],
    ['2023001200000','SINGLE FAMILY','2023-06-14',750000,'Williamson County, TN','Y','Y','274 Governors Way','Brentwood','TN','37027'],
  ];

  // Promise-based singleton: any button click during init queues behind the same promise
  let sqlReadyPromise = null;
  function getSQL() {
    if (sqlReadyPromise) return sqlReadyPromise;
    sqlReadyPromise = (async () => {
      try {
        if (typeof initSqlJs === 'undefined') {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = '/vendor/sqljs/sql-wasm.js';
            s.onload = resolve;
            s.onerror = () => reject(new Error('Failed to load sql.js script'));
            document.head.appendChild(s);
          });
        }
        const SQL = await initSqlJs({
          locateFile: file => `/vendor/sqljs/${file}`
        });
        const db = new SQL.Database();
        db.run(`CREATE TABLE housing (
          ParcelID TEXT, LandUse TEXT, SaleDate TEXT, SalePrice INTEGER,
          LegalReference TEXT, SoldAsVacant TEXT, OwnerSplitRequired TEXT,
          PropertyAddress TEXT, PropertyCity TEXT, PropertyState TEXT, PropertyZip TEXT
        )`);
        const stmt = db.prepare(`INSERT INTO housing VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
        housingData.forEach(row => stmt.run(row));
        stmt.free();
        sqlDB = db;
        return db;
      } catch (e) {
        console.warn('SQL.js failed to load:', e);
        sqlReadyPromise = null; // allow retry on next click
        throw e;
      }
    })();
    return sqlReadyPromise;
  }
  // Keep initSQL as a no-op alias for any legacy call sites
  async function initSQL() { return getSQL(); }

  function runSQL(query, targetId) {
    const resultsEl = document.getElementById(`sql-results-${targetId}`);
    if (!resultsEl) return;

    if (!sqlDB) {
      resultsEl.innerHTML = `<div class="sql-error">SQL engine is still loading. Please try again in a moment.</div>`;
      return;
    }

    try {
      const results = sqlDB.exec(query);
      if (!results.length) {
        resultsEl.innerHTML = `<div class="sql-success">Query executed successfully. No rows returned.</div>`;
        return;
      }
      const { columns, values } = results[0];
      let html = `<div class="sql-table-wrap"><table class="sql-table"><thead><tr>`;
      columns.forEach(c => { html += `<th>${c}</th>`; });
      html += `</tr></thead><tbody>`;
      values.forEach(row => {
        html += `<tr>`;
        row.forEach(cell => { html += `<td>${cell === null ? '<span class="sql-null">NULL</span>' : cell}</td>`; });
        html += `</tr>`;
      });
      html += `</tbody></table></div>`;
      html += `<div class="sql-row-count">${values.length} row${values.length !== 1 ? 's' : ''} returned</div>`;
      resultsEl.innerHTML = html;
    } catch (err) {
      resultsEl.innerHTML = `<div class="sql-error">⚠ ${err.message}</div>`;
    }
  }

  // Helper: show SQL code in the reveal block
  function showSQLCode(query) {
    const reveal = document.getElementById('sql-code-reveal');
    const display = document.getElementById('sql-code-display');
    if (!reveal || !display) return;
    display.textContent = query;
    reveal.style.display = 'block';
  }

  // Wire up SQL sandbox buttons — promise-based init ensures first-click always works
  document.querySelectorAll('.sql-ex').forEach(btn => {
    btn.addEventListener('click', async () => {
      const query = btn.dataset.query;
      const editor = document.getElementById('sql-editor-nashville');
      if (editor) editor.value = query;
      // Show SQL code immediately
      showSQLCode(query);
      // Always await getSQL() — if already loaded it resolves instantly,
      // if loading it queues this click behind the same promise (no dropped queries)
      const resultsEl = document.getElementById('sql-results-nashville');
      if (!sqlDB) {
        if (resultsEl) resultsEl.innerHTML = '<div class="sql-loading-msg">Loading SQL engine...</div>';
      }
      try {
        await getSQL();
      } catch(e) {
        if (resultsEl) resultsEl.innerHTML = '<div class="sql-error">Could not load SQL engine. Please refresh and try again.</div>';
        return;
      }
      runSQL(query, 'nashville');
    });
  });

  document.querySelector('.sql-run-btn[data-target="nashville"]')?.addEventListener('click', async () => {
    const editor = document.getElementById('sql-editor-nashville');
    if (!editor) return;
    const q = editor.value.trim();
    showSQLCode(q);
    try { await getSQL(); } catch(e) { return; }
    runSQL(q, 'nashville');
  });

  // Allow Ctrl+Enter / Cmd+Enter in editor to run
  document.getElementById('sql-editor-nashville')?.addEventListener('keydown', async e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const q = e.target.value.trim();
      showSQLCode(q);
      try { await getSQL(); } catch(e2) { return; }
      runSQL(q, 'nashville');
    }
  });

  // SQL editor toggle (show/hide free editor)
  document.getElementById('sql-editor-toggle')?.addEventListener('click', function() {
    const wrap = document.getElementById('sql-editor-wrap');
    if (!wrap) return;
    const open = wrap.style.display === 'none' || wrap.style.display === '';
    wrap.style.display = open ? 'flex' : 'none';
    this.textContent = open ? 'Hide editor ↑' : 'Write your own query ↓';
  });

  // Platform redirect hook: inject "Open in [Platform]" button if data-platform-url is set
  document.querySelectorAll('[data-platform-url]').forEach(block => {
    const url = block.getAttribute('data-platform-url');
    const label = block.getAttribute('data-platform-label') || 'Platform';
    if (!url) return; // empty = not yet published, button stays hidden
    const btn = document.createElement('a');
    btn.href = url;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.className = 'platform-redirect-btn';
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Open in ${label}`;
    block.appendChild(btn);
  });

  // initSQL() is now called lazily when the Nashville SQL preset is first used
  // (triggered by .sql-ex button clicks, wired below)

  /* ─────────────────────────────────────────────────
     5. BMI / WAIST-TO-HIP CALCULATOR (Python logic in JS)
  ───────────────────────────────────────────────── */

  // Preset scenario buttons — use mousedown + preventDefault to stop
  // the browser treating the button as an anchor and scrolling the page
  document.querySelectorAll('.bmi-preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const feetEl   = document.getElementById('bmi-feet');
      const inchesEl = document.getElementById('bmi-inches');
      const weightEl = document.getElementById('bmi-weight');
      if (feetEl)   feetEl.value   = btn.dataset.feet;
      if (inchesEl) inchesEl.value = btn.dataset.inches;
      if (weightEl) weightEl.value = btn.dataset.weight;
      // Run calculation without triggering any scroll side-effects
      const runBtn = document.getElementById('bmi-run-btn');
      if (runBtn) runBtn.dispatchEvent(new MouseEvent('click', { bubbles: false, cancelable: false }));
    });
  });

  const whrToggle = document.getElementById('bmi-whr-toggle');
  const whrFields = document.getElementById('bmi-whr-fields');
  if (whrToggle && whrFields) {
    whrToggle.addEventListener('change', () => {
      whrFields.style.display = whrToggle.checked ? 'block' : 'none';
    });
  }

  document.getElementById('bmi-run-btn')?.addEventListener('click', () => {
    const feet = parseFloat(document.getElementById('bmi-feet')?.value);
    const inches = parseFloat(document.getElementById('bmi-inches')?.value) || 0;
    const weight = parseFloat(document.getElementById('bmi-weight')?.value);
    const output = document.getElementById('bmi-output');
    if (!output) return;

    const totalInches = (feet * 12) + inches;
    if (!feet || isNaN(feet) || !weight || isNaN(weight) || weight < 50 || weight > 500) {
      output.style.display = 'block';
      output.innerHTML = `<div class="bmi-result-error">Please select a height and enter a valid weight (50–500 lbs).</div>`;
      return;
    }

    // BMI formula: (weight in lbs × 703) / (height in inches²)
    const bmi = (weight * 703) / (totalInches * totalInches);
    let bmiCategory, bmiColor, bmiAdvice;
    if (bmi < 18.5) {
      bmiCategory = 'Underweight'; bmiColor = 'var(--color-blue)';
      bmiAdvice = 'BMI below 18.5 may indicate undernutrition. Consider consulting a healthcare provider about nutrition and weight management.';
    } else if (bmi < 25) {
      bmiCategory = 'Healthy Weight'; bmiColor = 'var(--color-success)';
      bmiAdvice = 'Your BMI falls in the healthy range. Maintain a balanced diet and regular physical activity to stay here.';
    } else if (bmi < 30) {
      bmiCategory = 'Overweight'; bmiColor = 'var(--color-warning)';
      bmiAdvice = 'BMI in the overweight range may increase risk for chronic conditions. Modest lifestyle changes can make a meaningful difference.';
    } else if (bmi < 35) {
      bmiCategory = 'Above Obesity'; bmiColor = 'var(--color-gold)';
      bmiAdvice = 'Class I obesity is associated with increased health risks. Consulting a healthcare provider for a personalized plan is recommended.';
    } else if (bmi < 40) {
      bmiCategory = 'Above Obesity'; bmiColor = '#e55';
      bmiAdvice = 'Class II obesity significantly elevates risk for cardiovascular disease, diabetes, and other conditions. Medical guidance is strongly recommended.';
    } else {
      bmiCategory = 'Above Obesity'; bmiColor = 'var(--color-error)';
      bmiAdvice = 'Class III (severe) obesity carries substantial health risk. Please consult a healthcare professional for a comprehensive plan.';
    }

    // BMI gauge fill: map 10–50 to 0–100%
    const gaugePercent = Math.min(100, Math.max(0, ((bmi - 10) / 40) * 100));

    let whrHtml = '';
    if (whrToggle?.checked) {
      const waist = parseFloat(document.getElementById('bmi-waist')?.value);
      const hip = parseFloat(document.getElementById('bmi-hip')?.value);
      const sex = document.getElementById('bmi-sex')?.value;
      if (waist && hip && waist > 0 && hip > 0) {
        const whr = waist / hip;
        let whrRisk, whrColor;
        if (sex === 'male') {
          if (whr < 0.9) { whrRisk = 'Low Risk'; whrColor = 'var(--color-success)'; }
          else if (whr < 1.0) { whrRisk = 'Moderate Risk'; whrColor = 'var(--color-warning)'; }
          else { whrRisk = 'High Risk'; whrColor = 'var(--color-error)'; }
        } else {
          if (whr < 0.8) { whrRisk = 'Low Risk'; whrColor = 'var(--color-success)'; }
          else if (whr < 0.85) { whrRisk = 'Moderate Risk'; whrColor = 'var(--color-warning)'; }
          else { whrRisk = 'High Risk'; whrColor = 'var(--color-error)'; }
        }
        whrHtml = `
          <div class="bmi-metric-card">
            <div class="bmi-metric-label">Waist-to-Hip Ratio</div>
            <div class="bmi-metric-value" style="color:${whrColor}">${whr.toFixed(3)}</div>
            <div class="bmi-metric-badge" style="background:color-mix(in oklab,${whrColor} 15%,transparent);color:${whrColor}">${whrRisk}</div>
            <div class="bmi-metric-note">${sex === 'male' ? 'Male thresholds: Low &lt;0.90, Moderate 0.90–0.99, High ≥1.00' : 'Female thresholds: Low &lt;0.80, Moderate 0.80–0.84, High ≥0.85'}</div>
          </div>`;
      }
    }

    output.style.display = 'block';
    output.innerHTML = `
      <div class="bmi-results-grid">
        <div class="bmi-metric-card bmi-metric-card--main">
          <div class="bmi-metric-label">Your BMI</div>
          <div class="bmi-metric-value" style="color:${bmiColor}">${bmi.toFixed(1)}</div>
          <div class="bmi-metric-badge" style="background:color-mix(in oklab,${bmiColor} 15%,transparent);color:${bmiColor}">${bmiCategory}</div>
          <div class="bmi-gauge">
            <div class="bmi-gauge-track">
              <div class="bmi-gauge-fill" style="width:${gaugePercent}%;background:${bmiColor}"></div>
              <div class="bmi-gauge-marker" style="left:${gaugePercent}%"></div>
            </div>
            <div class="bmi-gauge-labels"><span>10</span><span>18.5</span><span>25</span><span>30</span><span>40+</span></div>
          </div>
          <div class="bmi-reference-row">
            <span style="color:var(--color-blue)">● Under</span>
            <span style="color:var(--color-success)">● Normal</span>
            <span style="color:var(--color-warning)">● Over</span>
            <span style="color:var(--color-gold)">● Obese</span>
          </div>
          <p class="bmi-advice">${bmiAdvice}</p>
        </div>
        ${whrHtml}
      </div>
      <p class="bmi-disclaimer">⚕ This tool is for informational purposes only and does not constitute medical advice. Consult a healthcare professional for personalized guidance.</p>`;
  });

  /* ─────────────────────────────────────────────────
     6. CHART.JS DASHBOARDS
     Data based on real survey/public datasets
  ───────────────────────────────────────────────── */
  const chartInstances = {};

  function destroyChart(id) {
    if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
  }

  function rebuildAllCharts() {
    buildSurveyCharts();
    buildAirbnbCharts();
    buildBikeCharts();
  }

  // ── Chart defaults helper ──
  function chartDefaults() {
    const c = window.getThemeColors();
    return {
      font: { family: "'Satoshi', sans-serif", size: 12 },
      color: c.textMuted,
      grid: { color: c.border, lineWidth: 0.5 },
      tick: { color: c.textFaint },
      c
    };
  }

  /* ── DATA PROFESSIONAL SURVEY ── */
  const surveyFullData = {
    roles: {
      'Data Analyst':      { count: 191, avgSalary: 55000, avgAge: 28, wlBalance: 4.3, salaryHappy: 4.3 },
      'Data Scientist':    { count: 57,  avgSalary: 94000, avgAge: 31, wlBalance: 4.6, salaryHappy: 4.5 },
      'Data Engineer':     { count: 89,  avgSalary: 65000, avgAge: 29, wlBalance: 4.2, salaryHappy: 4.0 },
      'Data Architect':    { count: 30,  avgSalary: 104000,avgAge: 33, wlBalance: 4.4, salaryHappy: 4.7 },
      'Database Developer':{ count: 26,  avgSalary: 43000, avgAge: 27, wlBalance: 3.9, salaryHappy: 3.6 },
      'Student':           { count: 98,  avgSalary: 26000, avgAge: 24, wlBalance: 4.4, salaryHappy: 3.2 },
      'Other':             { count: 139, avgSalary: 66000, avgAge: 31, wlBalance: 4.2, salaryHappy: 4.1 },
    },
    langs: { Python: 400, R: 101, 'Other': 60, JavaScript: 36, 'C/C++': 20, Java: 13 },
    difficulty: { 'Very Easy': 24, 'Easy': 94, 'Neither': 135, 'Difficult': 265, 'Very Difficult': 112 },
    countries: {
      'United States': { count: 261, avgSalary: 110000 },
      'India':         { count: 73,  avgSalary: 16000 },
      'Canada':        { count: 32,  avgSalary: 76000 },
      'United Kingdom':{ count: 28,  avgSalary: 73000 },
      'Other':         { count: 236, avgSalary: 59000 },
    }
  };

  function getFilteredSurveyData() {
    const role = document.getElementById('survey-role-filter')?.value || 'all';
    const country = document.getElementById('survey-country-filter')?.value || 'all';

    let roles = role === 'all' ? Object.entries(surveyFullData.roles) : [[role, surveyFullData.roles[role]]];
    // apply country salary multiplier if filtered
    let salaryMult = 1;
    if (country !== 'all') {
      const cData = surveyFullData.countries[country];
      const usData = surveyFullData.countries['United States'];
      salaryMult = cData ? cData.avgSalary / usData.avgSalary : 1;
    }

    const totalCount = roles.reduce((s, [, v]) => s + v.count, 0);
    const avgSalary = Math.round(roles.reduce((s, [, v]) => s + v.avgSalary * v.count, 0) / totalCount * salaryMult);
    const avgAge = (roles.reduce((s, [, v]) => s + v.avgAge * v.count, 0) / totalCount).toFixed(1);
    const wlBalance = (roles.reduce((s, [, v]) => s + v.wlBalance * v.count, 0) / totalCount).toFixed(1);

    return { roles, totalCount, avgSalary, avgAge, wlBalance, salaryMult };
  }

  function buildSurveyCharts() {
    const d = chartDefaults();
    const { roles, totalCount, avgSalary, avgAge, wlBalance, salaryMult } = getFilteredSurveyData();

    // Update stats (null-guarded — elements only exist in some layout variants)
    const elCount = document.getElementById('stat-count'); if (elCount) elCount.textContent = totalCount.toLocaleString();
    const elSalary = document.getElementById('stat-avg-salary'); if (elSalary) elSalary.textContent = '$' + avgSalary.toLocaleString();
    const elAge = document.getElementById('stat-avg-age'); if (elAge) elAge.textContent = avgAge;
    const elHappy = document.getElementById('stat-happy'); if (elHappy) elHappy.textContent = wlBalance + '/10';

    // Chart 1: Salary by role
    destroyChart('salary');
    const salaryCtx = document.getElementById('chart-salary');
    if (salaryCtx) {
      chartInstances['salary'] = new Chart(salaryCtx, {
        type: 'bar',
        data: {
          labels: roles.map(([k]) => k),
          datasets: [{
            label: 'Avg Salary ($)',
            data: roles.map(([, v]) => Math.round(v.avgSalary * salaryMult)),
            backgroundColor: roles.map((_, i) => i === 0 ? d.c.primary : `color-mix(in oklab, ${d.c.primary} ${70 - i * 8}%, ${d.c.blue})`),
            borderRadius: 6, borderSkipped: false,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ' $' + ctx.raw.toLocaleString() } } },
          scales: {
            x: { ticks: { color: d.tick.color, font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: d.tick.color, font: { size: 10 }, callback: v => '$' + (v/1000) + 'k' }, grid: { color: d.grid.color } }
          }
        }
      });
    }

    // Chart 2: Language preference
    destroyChart('lang');
    const langCtx = document.getElementById('chart-lang');
    if (langCtx) {
      const langs = surveyFullData.langs;
      chartInstances['lang'] = new Chart(langCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(langs),
          datasets: [{
            data: Object.values(langs),
            backgroundColor: [d.c.primary, d.c.blue, d.c.warning, d.c.success, d.c.gold, d.c.error],
            borderWidth: 2, borderColor: d.c.surface,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: d.c.textMuted, font: { size: 11 }, boxWidth: 12, padding: 10 } } }
        }
      });
    }

    // Chart 3: Difficulty
    destroyChart('difficulty');
    const diffCtx = document.getElementById('chart-difficulty');
    if (diffCtx) {
      const diff = surveyFullData.difficulty;
      chartInstances['difficulty'] = new Chart(diffCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(diff),
          datasets: [{
            label: 'Respondents',
            data: Object.values(diff),
            backgroundColor: [d.c.success, d.c.primary, d.c.warning, d.c.gold, d.c.error],
            borderRadius: 6, borderSkipped: false,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: d.tick.color, font: { size: 10 } }, grid: { color: d.grid.color } },
            y: { ticks: { color: d.tick.color, font: { size: 10 } }, grid: { display: false } }
          }
        }
      });
    }

    // Chart 4: Happiness comparison
    destroyChart('happiness');
    const happyCtx = document.getElementById('chart-happiness');
    if (happyCtx) {
      chartInstances['happiness'] = new Chart(happyCtx, {
        type: 'bar',
        data: {
          labels: roles.map(([k]) => k),
          datasets: [
            { label: 'Salary Happiness', data: roles.map(([, v]) => v.salaryHappy), backgroundColor: d.c.primary, borderRadius: 4, borderSkipped: false },
            { label: 'Work-Life Balance', data: roles.map(([, v]) => v.wlBalance), backgroundColor: d.c.blue, borderRadius: 4, borderSkipped: false },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: d.c.textMuted, font: { size: 10 }, boxWidth: 10 } } },
          scales: {
            x: { ticks: { color: d.tick.color, font: { size: 9 } }, grid: { display: false } },
            y: { min: 0, max: 10, ticks: { color: d.tick.color, font: { size: 10 } }, grid: { color: d.grid.color } }
          }
        }
      });
    }
  }

  document.getElementById('survey-role-filter')?.addEventListener('change', buildSurveyCharts);
  document.getElementById('survey-country-filter')?.addEventListener('change', buildSurveyCharts);

  /* ── AIRBNB SEATTLE (Tableau) ── */
  const airbnbBase = {
    byZip: {
      '98101': { avg: 195, listings: 312, revenue: 245000 },
      '98102': { avg: 152, listings: 287, revenue: 198000 },
      '98103': { avg: 129, listings: 358, revenue: 221000 },
      '98105': { avg: 143, listings: 201, revenue: 148000 },
      '98107': { avg: 118, listings: 244, revenue: 165000 },
      '98112': { avg: 218, listings: 176, revenue: 192000 },
      '98115': { avg: 105, listings: 298, revenue: 152000 },
      '98117': { avg: 111, listings: 321, revenue: 171000 },
      '98122': { avg: 134, listings: 256, revenue: 174000 },
      '98125': { avg: 97,  listings: 165, revenue: 98000  },
    },
    byBeds: { '1': 96, '2': 140, '3': 188, '4': 268 },
    weeklyRevenue: [32000,29000,31000,35000,38000,42000,44000,41000,39000,43000,47000,50000,48000,45000,41000,38000,36000,40000,43000,46000,49000,52000,54000,51000,48000,44000,42000,45000,48000,51000,53000,50000,47000,44000,41000,38000,35000,37000,40000,43000,46000,49000,51000,48000,44000,41000,38000,35000,33000,36000,39000,42000],
  };

  function buildAirbnbCharts() {
    const d = chartDefaults();
    const zip = document.getElementById('airbnb-zip')?.value || 'all';
    const beds = document.getElementById('airbnb-beds')?.value || 'all';

    let totalListings = 0, totalRevenue = 0, avgPrice = 0;
    const zipData = zip === 'all' ? Object.entries(airbnbBase.byZip) : [[zip, airbnbBase.byZip[zip]]].filter(([,v]) => v);
    zipData.forEach(([, v]) => { totalListings += v.listings; totalRevenue += v.revenue; avgPrice += v.avg * v.listings; });
    avgPrice = totalListings ? Math.round(avgPrice / totalListings) : 0;
    if (beds !== 'all') {
      const mult = airbnbBase.byBeds[beds] / airbnbBase.byBeds['1'];
      avgPrice = Math.round(airbnbBase.byBeds[beds] || 137);
    }

    const elListings = document.getElementById('ab-listings'); if (elListings) elListings.textContent = totalListings.toLocaleString();
    const elAvgPrice = document.getElementById('ab-avg-price'); if (elAvgPrice) elAvgPrice.textContent = '$' + avgPrice;
    const elRevenue = document.getElementById('ab-revenue'); if (elRevenue) elRevenue.textContent = '$' + (totalRevenue / 1000000).toFixed(1) + 'M';

    // Chart: Avg price by zip
    destroyChart('airbnb-zip');
    const zipCtx = document.getElementById('chart-airbnb-zip');
    if (zipCtx) {
      const displayData = zip === 'all' ? Object.entries(airbnbBase.byZip) : [[zip, airbnbBase.byZip[zip]]];
      chartInstances['airbnb-zip'] = new Chart(zipCtx, {
        type: 'bar',
        data: {
          labels: displayData.map(([k]) => k),
          datasets: [{ label: 'Avg Nightly ($)', data: displayData.map(([, v]) => v.avg), backgroundColor: d.c.primary, borderRadius: 5, borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: d.tick.color, font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: d.tick.color, callback: v => '$' + v, font: { size: 10 } }, grid: { color: d.grid.color } }
          }
        }
      });
    }

    // Chart: Avg price by bedrooms
    destroyChart('airbnb-beds');
    const bedsCtx = document.getElementById('chart-airbnb-beds');
    if (bedsCtx) {
      chartInstances['airbnb-beds'] = new Chart(bedsCtx, {
        type: 'bar',
        data: {
          labels: ['1 Bed', '2 Beds', '3 Beds', '4+ Beds'],
          datasets: [{ label: 'Avg Nightly ($)', data: Object.values(airbnbBase.byBeds), backgroundColor: [d.c.blue, d.c.primary, d.c.warning, d.c.gold], borderRadius: 5, borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: d.tick.color, font: { size: 11 } }, grid: { display: false } },
            y: { ticks: { color: d.tick.color, callback: v => '$' + v, font: { size: 10 } }, grid: { color: d.grid.color } }
          }
        }
      });
    }

    // Chart: Weekly revenue
    destroyChart('airbnb-revenue');
    const revCtx = document.getElementById('chart-airbnb-revenue');
    if (revCtx) {
      chartInstances['airbnb-revenue'] = new Chart(revCtx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 52 }, (_, i) => `Wk ${i + 1}`),
          datasets: [{
            label: 'Revenue ($)',
            data: airbnbBase.weeklyRevenue,
            borderColor: d.c.primary,
            backgroundColor: `color-mix(in oklab, ${d.c.primary} 15%, transparent)`,
            fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: d.tick.color, font: { size: 9 }, maxTicksLimit: 12 }, grid: { display: false } },
            y: { ticks: { color: d.tick.color, font: { size: 10 }, callback: v => '$' + (v/1000) + 'k' }, grid: { color: d.grid.color } }
          }
        }
      });
    }
  }

  document.getElementById('airbnb-zip')?.addEventListener('change', buildAirbnbCharts);
  document.getElementById('airbnb-beds')?.addEventListener('change', buildAirbnbCharts);

  /* ── BIKE SALES (Excel) ── */
  const bikeBase = {
    byAge: {
      all:           { 'Adolescent': { yes: 15, no: 25 }, 'Middle Age': { yes: 280, no: 245 }, 'Old': { yes: 186, no: 249 } },
      'North America': { 'Adolescent': { yes: 8, no: 12 }, 'Middle Age': { yes: 120, no: 110 }, 'Old': { yes: 80, no: 100 } },
      'Europe':        { 'Adolescent': { yes: 4, no: 7 },  'Middle Age': { yes: 90, no: 80 },  'Old': { yes: 60, no: 80 } },
      'Pacific':       { 'Adolescent': { yes: 3, no: 6 },  'Middle Age': { yes: 70, no: 55 },  'Old': { yes: 46, no: 69 } },
    },
    byCommute: {
      '0-1 Miles': { yes: 200, no: 143 }, '1-2 Miles': { yes: 147, no: 142 }, '2-5 Miles': { yes: 90, no: 108 },
      '5-10 Miles': { yes: 34, no: 100 }, '10+ Miles': { yes: 10, no: 26 },
    },
    byIncome: {
      Married:  { yes: 57326, no: 53440 },
      Single:   { yes: 45373, no: 41973 },
    },
    byRegion: {
      'North America': 218, 'Europe': 164, 'Pacific': 99,
    }
  };

  function buildBikeCharts() {
    const d = chartDefaults();
    const region = document.getElementById('bike-region')?.value || 'all';
    const marital = document.getElementById('bike-marital')?.value || 'all';

    const ageData = bikeBase.byAge[region] || bikeBase.byAge['all'];
    const totalSales = Object.values(ageData).reduce((s, v) => s + v.yes, 0);
    const totalRecords = Object.values(ageData).reduce((s, v) => s + v.yes + v.no, 0);

    const bkSales = document.getElementById('bk-sales');
    const bkPurchased = document.getElementById('bk-purchased');
    const bkRate = document.getElementById('bk-rate');
    if (bkSales) bkSales.textContent = totalRecords.toLocaleString();
    if (bkPurchased) bkPurchased.textContent = totalSales;
    if (bkRate) bkRate.textContent = Math.round(totalSales / totalRecords * 100) + '%';

    // Chart 1: Age bracket
    destroyChart('bike-age');
    const ageCtx = document.getElementById('chart-bike-age');
    if (ageCtx) {
      chartInstances['bike-age'] = new Chart(ageCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(ageData),
          datasets: [
            { label: 'Purchased', data: Object.values(ageData).map(v => v.yes), backgroundColor: d.c.primary, borderRadius: 5, borderSkipped: false },
            { label: 'Did Not', data: Object.values(ageData).map(v => v.no), backgroundColor: d.c.border, borderRadius: 5, borderSkipped: false },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: d.c.textMuted, font: { size: 10 }, boxWidth: 10 } } },
          scales: {
            x: { ticks: { color: d.tick.color, font: { size: 11 } }, grid: { display: false } },
            y: { ticks: { color: d.tick.color, font: { size: 10 } }, grid: { color: d.grid.color } }
          }
        }
      });
    }

    // Chart 2: Commute distance
    destroyChart('bike-commute');
    const commuteCtx = document.getElementById('chart-bike-commute');
    if (commuteCtx) {
      chartInstances['bike-commute'] = new Chart(commuteCtx, {
        type: 'line',
        data: {
          labels: Object.keys(bikeBase.byCommute),
          datasets: [
            { label: 'Purchased', data: Object.values(bikeBase.byCommute).map(v => v.yes), borderColor: d.c.primary, backgroundColor: `color-mix(in oklab,${d.c.primary} 15%,transparent)`, fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2 },
            { label: 'Did Not', data: Object.values(bikeBase.byCommute).map(v => v.no), borderColor: d.c.blue, backgroundColor: `color-mix(in oklab,${d.c.blue} 10%,transparent)`, fill: false, tension: 0.4, pointRadius: 4, borderWidth: 2 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: d.c.textMuted, font: { size: 10 }, boxWidth: 10 } } },
          scales: {
            x: { ticks: { color: d.tick.color, font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: d.tick.color, font: { size: 10 } }, grid: { color: d.grid.color } }
          }
        }
      });
    }

    // Chart 3: Income vs purchase
    destroyChart('bike-income');
    const incomeCtx = document.getElementById('chart-bike-income');
    if (incomeCtx) {
      const incomeDisplay = marital === 'all'
        ? { 'Married - Purchased': bikeBase.byIncome.Married.yes, 'Married - Not': bikeBase.byIncome.Married.no, 'Single - Purchased': bikeBase.byIncome.Single.yes, 'Single - Not': bikeBase.byIncome.Single.no }
        : { 'Purchased': bikeBase.byIncome[marital].yes, 'Did Not Purchase': bikeBase.byIncome[marital].no };
      chartInstances['bike-income'] = new Chart(incomeCtx, {
        type: 'bar',
        data: {
          labels: Object.keys(incomeDisplay),
          datasets: [{ label: 'Avg Income ($)', data: Object.values(incomeDisplay), backgroundColor: [d.c.primary, d.c.blue, d.c.warning, d.c.gold], borderRadius: 5, borderSkipped: false }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ' $' + ctx.raw.toLocaleString() } } },
          scales: {
            x: { ticks: { color: d.tick.color, font: { size: 9 } }, grid: { display: false } },
            y: { ticks: { color: d.tick.color, font: { size: 10 }, callback: v => '$' + (v/1000) + 'k' }, grid: { color: d.grid.color } }
          }
        }
      });
    }

    // Chart 4: Region
    destroyChart('bike-region');
    const regionCtx = document.getElementById('chart-bike-region');
    if (regionCtx) {
      chartInstances['bike-region'] = new Chart(regionCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(bikeBase.byRegion),
          datasets: [{ data: Object.values(bikeBase.byRegion), backgroundColor: [d.c.primary, d.c.blue, d.c.warning], borderWidth: 2, borderColor: d.c.surface }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: d.c.textMuted, font: { size: 11 }, boxWidth: 12 } } }
        }
      });
    }
  }

  document.getElementById('bike-region')?.addEventListener('change', buildBikeCharts);
  document.getElementById('bike-marital')?.addEventListener('change', buildBikeCharts);

  /* ─────────────────────────────────────────────────
     7. INIT ALL CHARTS ON DOM READY
  ───────────────────────────────────────────────── */
  // Delay slightly so Chart.js CDN has time to load
  function waitForChartJS(attempt = 0) {
    if (typeof Chart !== 'undefined') {
      buildSurveyCharts();
      buildAirbnbCharts();
      buildBikeCharts();
    } else if (attempt < 20) {
      setTimeout(() => waitForChartJS(attempt + 1), 200);
    }
  }

/* ══════════════════════════════════════════════════════════
   CONTACT FORM v7 — "Spreadsheet with a Pulse"
   IIFE: shared state, mode switch, live preview, chips,
         validation, submit (Resend API), reset, bfcache
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Shared state ── */
  var state = { name: '', email: '', subject: '', message: '', limit: false };
  var currentMode = 'plain';  // 'plain' | 'sql'
  var lastMode    = 'plain';
  var pendingChip = null;
  var tsInterval  = null;

  /* ── SQL block toggle state ── */
  var sqlBlocks = {
    name:      { on: false },
    subject:   { on: false },
    priority:  { on: false, value: '' },
    returning: { on: false, value: '' }
  };

  /* ── Hint originals ── */
  var HINTS = {
    name:    'Your first and last name',
    email:   'Your email address, so I can write back',
    subject: 'Subject line for your message (optional)',
    message: 'Your message, write as much as you like'
  };

  /* ── Chip data ── */
  var CHIPS = {
    recruiter:    { subject: 'Hiring inquiry'   },
    collaborator: { subject: 'Collaboration'    },
    hi:           { subject: 'Just saying hello' },
    feedback:     { subject: 'Portfolio feedback' }
  };

  /* ── Element refs ── */
  function q(id) { return document.getElementById(id); }
  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

  /* ── Initialise on DOM ready ── */
  function init() {
    var section = qs('.contact-section');
    if (!section || !q('v7-btn-plain')) return;

    warmBackend();
    setupSectionEntrance(section);
    setupModeSwitcher();
    setupPlainPanel();
    setupSqlPanel();
    setupReset();
    setupBfcache();
  }

  function warmBackend() {
    var apiBase = (function() {
      if (window.location.hostname.endsWith('.pplx.app')) return '/port/5000';
      if (window.location.hostname === 'www.perplexity.ai') return '/port/5000';
      return '';
    })();
    if (!apiBase) return;
    function tryWarm(attempt) {
      fetch(apiBase + '/api/ping', { method: 'GET' })
        .then(function(r) {
          if (!r.ok && attempt < 6) setTimeout(function() { tryWarm(attempt + 1); }, 3000);
        })
        .catch(function() {
          if (attempt < 6) setTimeout(function() { tryWarm(attempt + 1); }, 3000);
        });
    }
    tryWarm(1);
  }

  /* ── Section entrance ── */
  function setupSectionEntrance(section) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
      io.observe(section);
    } else {
      section.classList.add('is-visible');
    }
  }

  /* ══ MODE SWITCHER ══ */
  function setupModeSwitcher() {
    var btnPlain = q('v7-btn-plain');
    var btnSql   = q('v7-btn-sql');
    var pill     = q('v7-pill');
    if (!btnPlain || !btnSql || !pill) return;
    positionPill(btnPlain, pill);
    btnPlain.addEventListener('click', function() { switchMode('plain', pill); });
    btnSql.addEventListener('click',   function() { switchMode('sql',   pill); });
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function() {
        var active = currentMode === 'plain' ? btnPlain : btnSql;
        positionPill(active, pill);
      });
      ro.observe(q('v7-switcher') || document.body);
    }
  }

  function positionPill(btn, pill) {
    if (!btn || !pill) return;
    var switcher = q('v7-switcher');
    if (!switcher) return;
    var sr = switcher.getBoundingClientRect();
    var br = btn.getBoundingClientRect();
    pill.style.width  = br.width + 'px';
    pill.style.transform = 'translateX(' + (br.left - sr.left - 4) + 'px)';
  }

  function switchMode(mode, pill) {
    if (mode === currentMode) return;
    var _cWrap = q('v7-chip-custom-wrap');
    var _cInput = q('v7-chip-custom-input');
    var _cBtn = q('v7-chip-custom');
    if (_cWrap && !_cWrap.hidden && _cInput && _cInput.value.trim()) {
      state.subject = _cInput.value.trim();
      var _ps = q('v7-p-subject'); if (_ps) _ps.value = state.subject;
      var _ss = q('v7-s-subject'); if (_ss) _ss.value = state.subject;
      updateSubjectSet();
      updatePreview();
      updateSqlCellState('subject');
      qsa('.v7-chip').forEach(function(c) { c.removeAttribute('data-active'); });
      if (_cBtn) _cBtn.setAttribute('data-active', 'true');
    }
    if (_cWrap) _cWrap.hidden = true;

    lastMode    = currentMode;
    currentMode = mode;

    var btnPlain  = q('v7-btn-plain');
    var btnSql    = q('v7-btn-sql');
    var panelPlain = q('v7-plain-panel');
    var panelSql   = q('v7-sql-panel');

    if (currentMode === 'plain') {
      var _pn=q('v7-p-name'); var _pe=q('v7-p-email'); var _pm=q('v7-p-msg'); var _ps2=q('v7-p-subject');
      if(_pn) state.name=_pn.value; if(_pe) state.email=_pe.value;
      if(_pm) state.message=_pm.value; if(_ps2) state.subject=_ps2.value;
    } else {
      var _sn=q('v7-s-name'); var _se=q('v7-s-email'); var _sm=q('v7-s-msg'); var _ss2=q('v7-s-subject');
      if(_sn) state.name=_sn.value; if(_se) state.email=_se.value;
      if(_sm) state.message=_sm.value; if(_ss2) state.subject=_ss2.value;
    }
    syncFromState();

    var activeBtn = mode === 'plain' ? btnPlain : btnSql;
    positionPill(activeBtn, pill);

    var retBlock = q('v7-returning');
    if (retBlock) retBlock.hidden = true;

    var successEl = q('v7-success');
    if (mode === 'plain' && successEl && !successEl.hidden) {
      successEl.hidden = true;
      var pp = q('v7-plain-panel');
      if (pp) { pp.hidden = false; pp.classList.add('is-active'); }
    }

    btnPlain.setAttribute('aria-pressed', mode === 'plain' ? 'true' : 'false');
    btnSql.setAttribute('aria-pressed',   mode === 'sql'   ? 'true' : 'false');
    btnPlain.classList.toggle('v7-mode-btn--active', mode === 'plain');
    btnSql.classList.toggle('v7-mode-btn--active',   mode === 'sql');

    var outPanel = mode === 'plain' ? panelSql  : panelPlain;
    var inPanel  = mode === 'plain' ? panelPlain : panelSql;

    outPanel.classList.add('is-leaving');
    outPanel.classList.remove('is-active');
    setTimeout(function() {
      outPanel.hidden = true;
      outPanel.classList.remove('is-leaving');
      inPanel.hidden = false;
      inPanel.classList.add('is-entering');
      void inPanel.offsetHeight;
      inPanel.classList.add('is-active');
      setTimeout(function() { inPanel.classList.remove('is-entering'); }, 320);
    }, 220);
  }

  /* ── Sync state to DOM ── */
  function syncFromState() {
    var pName=q('v7-p-name'); var pEmail=q('v7-p-email'); var pSubject=q('v7-p-subject'); var pMsg=q('v7-p-msg');
    if(pName) pName.value=state.name; if(pEmail) pEmail.value=state.email;
    if(pSubject) pSubject.value=state.subject; if(pMsg) pMsg.value=state.message;
    var sName=q('v7-s-name'); var sEmail=q('v7-s-email'); var sSubject=q('v7-s-subject'); var sMsg=q('v7-s-msg');
    if(sName) sName.value=state.name; if(sEmail) sEmail.value=state.email;
    if(sSubject) sSubject.value=state.subject; if(sMsg) sMsg.value=state.message;
    updatePreview(); updateProgress(); updateCharCount(); updateSubjectSet();
    if (sMsg) autoGrow(sMsg);
  }

  /* ── Subject-set bar ── */
  function updateSubjectSet() {
    var bar=q('v7-subject-set'); var valEl=q('v7-subject-set-val');
    if(!bar||!valEl) return;
    var val=state.subject?state.subject.trim():'';
    if(val){ valEl.textContent='"'+val+'"'; bar.hidden=false; }
    else { bar.hidden=true; valEl.textContent=''; }
  }

  /* ══ PLAIN PANEL ══ */
  function setupPlainPanel() {
    var fields = {
      name:    { inp: q('v7-p-name'),    err: q('v7-pe-name'),  chk: q('v7-pc-name'),  fld: q('v7-pf-name') },
      email:   { inp: q('v7-p-email'),   err: q('v7-pe-email'), chk: q('v7-pc-email'), fld: q('v7-pf-email') },
      subject: { inp: q('v7-p-subject'), err: null,             chk: null,             fld: q('v7-pf-subject') },
      message: { inp: q('v7-p-msg'),     err: q('v7-pe-msg'),   chk: null,             fld: q('v7-pf-msg') }
    };
    Object.keys(fields).forEach(function(key) {
      var f = fields[key];
      if (!f.inp) return;
      f.inp.addEventListener('input', function() {
        state[key] = f.inp.value;
        if (key === 'message') updateCharCount();
        if (key === 'subject') { qsa('.v7-chip').forEach(function(c){ c.removeAttribute('data-active'); }); updateSubjectSet(); }
        syncSqlField(key);
        if (f.fld) {
          var val = f.inp.value.trim();
          if (key === 'email') {
            if (f.fld.classList.contains('is-error') && isValidEmail(f.inp.value)) { f.fld.classList.remove('is-error','is-valid'); if(f.err) f.err.textContent=''; }
            else if (!f.fld.classList.contains('is-error')) { f.fld.classList.remove('is-valid'); }
          } else {
            if (val) { f.fld.classList.remove('is-error'); f.fld.classList.add('is-valid'); if(f.err) f.err.textContent=''; }
            else { f.fld.classList.remove('is-valid','is-error'); }
          }
        }
      });
      if (key === 'email') {
        f.inp.addEventListener('blur', function() {
          var v=f.inp.value.trim(); if(!v) return;
          if(isValidEmail(v)){ f.fld.classList.remove('is-error'); f.fld.classList.add('is-valid'); if(f.err) f.err.textContent=''; }
          else { f.fld.classList.remove('is-valid'); f.fld.classList.add('is-error'); if(f.err) f.err.textContent='Please enter a valid email address.'; }
        });
      }
    });
    var submitBtn = q('v7-p-submit');
    if (submitBtn) { submitBtn.addEventListener('click', function() { if (!validatePlain(fields)) return; submitForm('plain'); }); }
  }

  function updateCharCount() {
    var pMsg=q('v7-p-msg'); var count=q('v7-p-char');
    if(!pMsg||!count) return;
    var len=pMsg.value.length; var remaining=5000-len;
    if(len===0){ count.textContent=''; count.style.color=''; }
    else if(remaining<=0){ count.textContent='0 characters remaining'; count.style.color='#A12C7B'; }
    else if(remaining<=200){ count.textContent=remaining+' characters remaining'; count.style.color='#964219'; }
    else { count.textContent=remaining+' characters remaining'; count.style.color=''; }
  }

  function validatePlain(fields) {
    var pn=q('v7-p-name'); var pe=q('v7-p-email'); var pm=q('v7-p-msg'); var ps=q('v7-p-subject');
    if(pn) state.name=pn.value; if(pe) state.email=pe.value; if(pm) state.message=pm.value; if(ps) state.subject=ps.value;
    var ok=true;
    if(!state.name.trim()){ setPlainError(fields.name,'Mind sharing your name?'); ok=false; } else { setPlainValid(fields.name); }
    if(!state.email.trim()){ setPlainError(fields.email,'An email address will help me get back to you.'); ok=false; }
    else if(!isValidEmail(state.email)){ setPlainError(fields.email,"That email doesn't look quite right, mind double-checking it?"); ok=false; }
    else { setPlainValid(fields.email); }
    if(!state.message.trim()){ setPlainError(fields.message,'Looks like the message field is empty, add a line or two.'); ok=false; }
    else if(state.message.length>5000){ setPlainError(fields.message,'Message is too long. Please keep it under 5,000 characters.'); ok=false; }
    else { setPlainValid(fields.message); }
    return ok;
  }

  function setPlainError(f,msg){ if(!f||!f.fld) return; f.fld.classList.remove('is-valid'); f.fld.classList.add('is-error'); if(f.err) f.err.textContent=msg; }
  function setPlainValid(f){ if(!f||!f.fld) return; f.fld.classList.remove('is-error'); f.fld.classList.add('is-valid'); if(f.err) f.err.textContent=''; }

  function syncSqlField(key) {
    var map={ name:'v7-s-name', email:'v7-s-email', subject:'v7-s-subject', message:'v7-s-msg' };
    var el=q(map[key]); if(el) el.value=state[key];
    updatePreview(); updateProgress();
  }

  /* ══ SQL PANEL ══ */
  function setupSqlPanel() {
    setupBlockToggles();
    setupSqlInputs();
    setupChips();
    setupSqlSubmit();
    startTsTicker();
    updatePreview();
    updateProgress();
  }

  /* ── Block toggles ── */
  function setupBlockToggles() {
    var toggles = qsa('[data-block-toggle]');
    toggles.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var blockName = btn.dataset.blockToggle;
        if (!sqlBlocks[blockName]) return;

        var isOn = !sqlBlocks[blockName].on;
        sqlBlocks[blockName].on = isOn;

        // Update button appearance
        btn.classList.toggle('is-active', isOn);
        btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');

        // Show/hide the corresponding field row
        var fieldRow = q('v7-sql-block-' + blockName);
        if (fieldRow) {
          fieldRow.hidden = !isOn;
          if (isOn) {
            // Focus the input inside when shown
            var inp = fieldRow.querySelector('input, textarea, select');
            if (inp) setTimeout(function() { inp.focus(); }, 80);
          } else {
            // Clear state when block removed
            if (blockName === 'name') { state.name = ''; var el = q('v7-s-name'); if(el) el.value = ''; }
            if (blockName === 'subject') { state.subject = ''; var el2 = q('v7-s-subject'); if(el2) el2.value = ''; }
            if (blockName === 'priority') { sqlBlocks.priority.value = ''; }
            if (blockName === 'returning') { sqlBlocks.returning.value = ''; }
            updateSqlCellState('name');
            updateSqlCellState('subject');
          }
        }

        updatePreview();
        updateProgress();
        updateBlockShelf();
      });
    });

    // PRIORITY pill selection
    qsa('[data-priority]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        sqlBlocks.priority.value = btn.dataset.priority;
        qsa('[data-priority]').forEach(function(b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed','false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed','true');
        updatePreview();
      });
    });

    // RETURNING pill selection
    qsa('[data-returning]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        sqlBlocks.returning.value = btn.dataset.returning;
        qsa('[data-returning]').forEach(function(b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed','false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed','true');
        updatePreview();
      });
    });
  }

  function updateBlockShelf() {
    // Update the shelf hint text
    var hint = q('v7-block-shelf-hint');
    if (!hint) return;
    var activeCount = Object.keys(sqlBlocks).filter(function(k) { return sqlBlocks[k].on; }).length;
    if (activeCount === 0) {
      hint.textContent = 'Add optional blocks to build your query';
    } else if (activeCount === Object.keys(sqlBlocks).length) {
      hint.textContent = 'Full query mode. Nice.';
    } else {
      hint.textContent = activeCount + ' optional block' + (activeCount > 1 ? 's' : '') + ' added';
    }
  }

  /* ── SQL inputs ── */
  function setupSqlInputs() {
    var inputs = [
      { id: 'v7-s-name',    key: 'name' },
      { id: 'v7-s-email',   key: 'email' },
      { id: 'v7-s-subject', key: 'subject' },
      { id: 'v7-s-msg',     key: 'message' }
    ];
    inputs.forEach(function(item) {
      var el = q(item.id);
      if (!el) return;
      el.addEventListener('input', function() {
        state[item.key] = el.value;
        var plainMap={ name:'v7-p-name', email:'v7-p-email', subject:'v7-p-subject', message:'v7-p-msg' };
        var pEl = q(plainMap[item.key]); if(pEl) pEl.value = el.value;
        if (item.key === 'subject') { qsa('.v7-chip').forEach(function(c){ c.removeAttribute('data-active'); }); updateSubjectSet(); }
        if (el.tagName === 'TEXTAREA') autoGrow(el);
        updatePreview(item.key); updateProgress(); updateSqlCellState(item.key);
        var dot=q('v7-tab-dot');
        if(dot && (state.name||state.email||state.subject||state.message)) dot.hidden=false;
      });
    });
  }

  function autoGrow(el) {
    el.style.height='auto';
    el.style.height=Math.min(el.scrollHeight, window.innerHeight*0.4)+'px';
  }

  function updateSqlCellState(key) {
    var cellMap={ name:'v7-cell-name', email:'v7-cell-email', subject:'v7-cell-subject', message:'v7-cell-msg' };
    var cell=q(cellMap[key]); if(!cell) return;
    var val=state[key];
    var isValid = key==='email' ? (val.trim()&&isValidEmail(val.trim())) : val.trim().length>0;
    cell.dataset.state = isValid?'valid':(val.trim()?'typing':'empty');
    var hint=cell.querySelector('.v7-field-hint');
    if(hint&&cell.dataset.state==='valid'){ hint.textContent=HINTS[key]; hint.style.color=''; }
  }

  /* ── Live preview ── */
  function updatePreview(changedKey) {
    var previewEl = q('v7-preview');
    if (!previewEl) return;

    // Escape SQL strings
    function esc(v) { return v ? v.replace(/'/g, "''") : ''; }
    function placeholder(p) { return '<span class="v7-val-text is-placeholder" style="opacity:0.4">' + p + '</span>'; }
    function filled(id, v, p) {
      var display = v ? esc(v) : p;
      var cls = v ? 'v7-val-text is-filled' : 'v7-val-text is-placeholder';
      return '<span class="' + cls + '" id="' + id + '">' + display + '</span>';
    }

    var name    = state.name.trim();
    var email   = state.email.trim();
    var subject = state.subject.trim();
    var message = state.message.trim();
    var priority  = sqlBlocks.priority.on  ? sqlBlocks.priority.value  : '';
    var returning = sqlBlocks.returning.on ? sqlBlocks.returning.value : '';

    // Build column list
    var cols = [];
    var vals = [];

    if (sqlBlocks.name.on) {
      cols.push('<span class="v7-col-name">name</span>');
      vals.push('  <span class="v7-val" data-col="name">\'<span id="v7-pv-name" class="' + (name?'v7-val-text is-filled':'v7-val-text is-placeholder') + '">' + (name?esc(name):'your_name') + '</span>\'</span>');
    }

    cols.push('<span class="v7-col-name">email</span>');
    vals.push('  <span class="v7-val" data-col="email">\'<span id="v7-pv-email" class="' + (email?'v7-val-text is-filled':'v7-val-text is-placeholder') + '">' + (email?esc(email):'you@example.com') + '</span>\'</span>');

    if (sqlBlocks.subject.on) {
      cols.push('<span class="v7-col-name">subject</span>');
      vals.push('  <span class="v7-val" data-col="subject">\'<span id="v7-pv-subject" class="' + (subject?'v7-val-text is-filled':'v7-val-text is-placeholder') + '">' + (subject?esc(subject):'what_this_is_about') + '</span>\'</span>');
    }

    cols.push('<span class="v7-col-name">message</span>');
    vals.push('  <span class="v7-val" data-col="message">\'<span id="v7-pv-msg" class="' + (message?'v7-val-text is-filled':'v7-val-text is-placeholder') + '">' + (message?esc(message):'your_message') + '</span>\'</span>');

    // Priority as a comment above the INSERT (not valid SQL column but clearly labeled)
    var priorityLine = '';
    if (sqlBlocks.priority.on) {
      var pVal = priority || 'whenever_you_can';
      priorityLine = '<span class="v7-cmt">-- PRIORITY: ' + pVal + '</span>\n';
    }

    // Timestamp comment
    var tsLine = '<span class="v7-cmt">-- <span id="v7-pv-ts">' + fmtTs(new Date()) + '</span></span>\n';

    // Build the INSERT
    var insertLine = '<span class="v7-kw">INSERT INTO</span> <span class="v7-tbl">contacts</span> (';
    insertLine += cols.join(', ');
    insertLine += ')\n<span class="v7-kw">VALUES</span> (\n';
    insertLine += vals.join(',\n') + '\n)';

    // RETURNING clause
    var returningLine = '';
    if (sqlBlocks.returning.on) {
      var rVal = returning || '\'a_reply\'';
      if (!returning) {
        returningLine = '\n<span class="v7-kw">RETURNING</span> <span class="v7-val-text is-placeholder">\'a_reply\'</span>';
      } else {
        returningLine = '\n<span class="v7-kw">RETURNING</span> <span class="v7-val is-filled">\'<span class="v7-val-text is-filled">' + returning + '</span>\'</span>';
      }
    }

    var fullQuery = tsLine + priorityLine + insertLine + returningLine + ';';

    // Commit line stays separate
    var commitLineEl = q('v7-commit-line');
    var commitHTML = commitLineEl ? '' : '';

    previewEl.innerHTML = '<code>' + fullQuery + '</code><span class="v7-commit-line" id="v7-commit-line" aria-live="polite"></span>';

    // Restart ticker since we just replaced the DOM node
    var newTsEl = q('v7-pv-ts');
    if (newTsEl && !tsInterval) startTsTicker();

    // Flash changed value
    if (changedKey) {
      var pvMap = { name:'v7-pv-name', email:'v7-pv-email', subject:'v7-pv-subject', message:'v7-pv-msg' };
      var flashEl = q(pvMap[changedKey]);
      if (flashEl) {
        flashEl.classList.remove('is-flashing');
        void flashEl.offsetHeight;
        flashEl.classList.add('is-flashing');
        flashEl.addEventListener('animationend', function() { flashEl.classList.remove('is-flashing'); }, { once: true });
      }
    }
  }

  /* ── Timestamp ticker ── */
  function fmtTs(d) {
    var pad=function(n){ return String(n).padStart(2,'0'); };
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
  }

  function startTsTicker() {
    var el=q('v7-pv-ts'); if(!el) return;
    el.textContent=fmtTs(new Date());
    if(tsInterval) return;
    tsInterval=setInterval(function(){ var tsEl=q('v7-pv-ts'); if(tsEl) tsEl.textContent=fmtTs(new Date()); },1000);
  }

  function stopTsTicker(frozenTs) {
    if(tsInterval){ clearInterval(tsInterval); tsInterval=null; }
    var el=q('v7-pv-ts'); if(el&&frozenTs) el.textContent=frozenTs;
  }

  /* ── Progress ── */
  function updateProgress() {
    var required=['email','message'];
    var filled=required.filter(function(k){ return state[k]&&state[k].trim(); });
    var count=filled.length;
    var dots=[q('v7-dot-0'),q('v7-dot-1'),q('v7-dot-2')];
    dots.forEach(function(dot,i){
      if(!dot) return;
      dot.classList.remove('is-filled','is-done');
      if(i<count) dot.classList.add(count===2?'is-done':'is-filled');
    });
    var progText=q('v7-prog-text');
    var progress=q('v7-progress');
    if(progText){ progText.textContent=count===2?'-- all set, ready to send':'-- '+count+' of 2 required fields filled'; }
    if(progress){ progress.dataset.complete=count===2?'true':'false'; }
  }

  /* ── Chips ── */
  function setupChips() {
    var chips=qsa('.v7-chip');
    chips.forEach(function(chip){
      chip.addEventListener('click',function(){
        var chipKey=chip.dataset.chip;
        var data=CHIPS[chipKey];
        if(!data) return;
        chip.classList.add('is-clicked');
        setTimeout(function(){ chip.classList.remove('is-clicked'); },300);
        applyChip(chipKey,data,chip);
      });
    });

    var customChipBtn=q('v7-chip-custom');
    var customChipInput=q('v7-chip-custom-input');
    var customInputWrap=q('v7-chip-custom-wrap');
    if(customChipBtn&&customInputWrap&&customChipInput){
      customChipBtn.addEventListener('click',function(){
        customInputWrap.hidden=!customInputWrap.hidden;
        if(!customInputWrap.hidden){ qsa('.v7-chip').forEach(function(c){ c.removeAttribute('data-active'); }); customChipBtn.setAttribute('data-active','true'); customChipInput.focus(); }
        else { customChipBtn.removeAttribute('data-active'); }
      });
      customChipInput.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); applyCustomChipAndClose(); } if(e.key==='Escape'){ customInputWrap.hidden=true; customChipBtn.removeAttribute('data-active'); } });
      customChipInput.addEventListener('input',function(){
        var val=customChipInput.value.trim();
        state.subject=val;
        var ps=q('v7-p-subject'); if(ps) ps.value=val;
        var ss=q('v7-s-subject'); if(ss) ss.value=val;
        updateSubjectSet(); updatePreview(); updateSqlCellState('subject');
        qsa('.v7-chip').forEach(function(c){ c.removeAttribute('data-active'); });
        if(val) customChipBtn.setAttribute('data-active','true'); else customChipBtn.removeAttribute('data-active');
      });
    }

    function applyCustomChipAndClose(){
      var val=customChipInput?customChipInput.value.trim():'';
      if(!val) return;
      state.subject=val;
      var ps=q('v7-p-subject'); if(ps) ps.value=val;
      var ss=q('v7-s-subject'); if(ss) ss.value=val;
      updateSubjectSet(); updatePreview(); updateSqlCellState('subject');
      qsa('.v7-chip').forEach(function(c){ c.removeAttribute('data-active'); });
      if(customChipBtn) customChipBtn.setAttribute('data-active','true');
      if(customInputWrap) customInputWrap.hidden=true;
    }

    var clearBtn=q('v7-subject-set-clear');
    if(clearBtn){
      clearBtn.addEventListener('click',function(){
        state.subject='';
        qsa('.v7-chip').forEach(function(c){ c.removeAttribute('data-active'); });
        if(customInputWrap) customInputWrap.hidden=true;
        if(customChipInput) customChipInput.value='';
        var ps=q('v7-p-subject'); if(ps) ps.value='';
        var ss=q('v7-s-subject'); if(ss) ss.value='';
        updateSubjectSet(); updatePreview(); updateSqlCellState('subject');
      });
    }
  }

  function applyChip(key,data,chipEl){
    state.subject=data.subject; state.message='';
    var _cwi=q('v7-chip-custom-input'); var _cww=q('v7-chip-custom-wrap');
    if(_cwi) _cwi.value=''; if(_cww) _cww.hidden=true;
    qsa('.v7-chip').forEach(function(c){ c.removeAttribute('data-active'); });
    chipEl.setAttribute('data-active','true');
    var sSubject=q('v7-s-subject'); if(sSubject){ sSubject.value=data.subject; }
    updateSqlCellState('subject');
    var sMsg=q('v7-s-msg'); if(sMsg){ sMsg.value=''; sMsg.style.height=''; updateSqlCellState('message'); }
    var pSubject=q('v7-p-subject'); if(pSubject) pSubject.value=data.subject;
    var pMsg=q('v7-p-msg'); if(pMsg) pMsg.value='';
    updatePreview(); updateProgress();
    var dot=q('v7-tab-dot'); if(dot) dot.hidden=false;
    updateSubjectSet();
  }

  /* ── SQL submit ── */
  function setupSqlSubmit(){
    var runBtn=q('v7-s-submit'); var tabRunBtn=q('v7-tab-run-btn');
    if(runBtn) runBtn.addEventListener('click',function(){ submitForm('sql'); });
    if(tabRunBtn) tabRunBtn.addEventListener('click',function(){ submitForm('sql'); });
  }

  function validateSql(){
    var sn=q('v7-s-name'); var se=q('v7-s-email'); var sm=q('v7-s-msg'); var ss=q('v7-s-subject');
    if(sn) state.name=sn.value; if(se) state.email=se.value; if(sm) state.message=sm.value; if(ss) state.subject=ss.value;
    var ok=true;
    var checks=[
      { key:'email',   cellId:'v7-cell-email', hintId:'v7-hint-email', msg:'-- email is required' },
      { key:'message', cellId:'v7-cell-msg',   hintId:'v7-hint-msg',   msg:'-- message is required' }
    ];
    checks.forEach(function(c){
      var cell=q(c.cellId); var hint=q(c.hintId); if(!cell) return;
      var val=state[c.key];
      if(!val||!val.trim()){
        cell.dataset.state='error';
        if(hint){ hint.textContent=c.msg; }
        cell.classList.add('is-shaking');
        cell.addEventListener('animationend',function(){ cell.classList.remove('is-shaking'); },{once:true});
        ok=false;
      }
    });
    if(state.email&&state.email.trim()&&!isValidEmail(state.email)){
      var emailCell=q('v7-cell-email'); var emailHint=q('v7-hint-email');
      if(emailCell) emailCell.dataset.state='error';
      if(emailHint) emailHint.textContent="-- that doesn't look like a valid email";
      if(emailCell){ emailCell.classList.add('is-shaking'); emailCell.addEventListener('animationend',function(){ emailCell.classList.remove('is-shaking'); },{once:true}); }
      ok=false;
    }
    if(state.message&&state.message.length>5000){
      var msgCell=q('v7-cell-msg'); var msgHint=q('v7-hint-msg');
      if(msgCell) msgCell.dataset.state='error';
      if(msgHint) msgHint.textContent='-- message exceeds 5,000 character limit';
      if(msgCell){ msgCell.classList.add('is-shaking'); msgCell.addEventListener('animationend',function(){ msgCell.classList.remove('is-shaking'); },{once:true}); }
      ok=false;
    }
    var errBanner=q('v7-sql-errors');
    if(errBanner){ errBanner.textContent=ok?'':'-- ERROR: fill in the highlighted fields above before sending.'; }
    return ok;
  }

  /* ══ SUBMIT ══ */
  var sendingLabelTimer=null;
  function stopSendingLabelRotation(){ if(sendingLabelTimer){ clearInterval(sendingLabelTimer); sendingLabelTimer=null; } }

  function submitForm(mode){
    if(mode==='sql'&&!validateSql()) return;
    var submitBtn=mode==='plain'?q('v7-p-submit'):q('v7-s-submit');
    var tabRunBtn=q('v7-tab-run-btn');
    setTimeout(function(){ handleSuccess(mode); },400);
    if(mode==='plain'){
      var label=q('v7-p-btn-label'); var spinner=q('v7-p-spinner');
      if(label) label.textContent='Sending...'; if(spinner) spinner.hidden=false;
      var arrow=submitBtn?submitBtn.querySelector('.v7-p-btn-arrow'):null; if(arrow) arrow.hidden=true;
    } else {
      var runLabel=q('v7-run-label'); if(runLabel) runLabel.textContent='RUNNING...';
      if(submitBtn) submitBtn.dataset.state='loading'; if(tabRunBtn) tabRunBtn.disabled=true;
    }
    if(submitBtn) submitBtn.disabled=true;

    // Sync state
    if(mode==='plain'){
      var pn=q('v7-p-name'); var pe=q('v7-p-email'); var pm=q('v7-p-msg'); var ps=q('v7-p-subject');
      if(pn) state.name=pn.value; if(pe) state.email=pe.value; if(pm) state.message=pm.value; if(ps) state.subject=ps.value;
    } else {
      var sn=q('v7-s-name'); var se=q('v7-s-email'); var sm=q('v7-s-msg'); var ss=q('v7-s-subject');
      if(sn) state.name=sn.value; if(se) state.email=se.value; if(sm) state.message=sm.value; if(ss) state.subject=ss.value;
    }

    // Build payload — include priority and returning as metadata
    var extras = [];
    if (sqlBlocks.priority.on && sqlBlocks.priority.value) extras.push('[PRIORITY: ' + sqlBlocks.priority.value + ']');
    if (sqlBlocks.returning.on && sqlBlocks.returning.value) extras.push('[RETURNING: ' + sqlBlocks.returning.value + ']');

    var payload={
      name:    state.name.trim(),
      email:   state.email.trim(),
      message: (state.subject.trim()?'['+state.subject.trim()+'] ':'')+state.message.trim()+(extras.length?'\n\n'+extras.join(' '):'')
    };

    var apiBase=(function(){
      var m=window.location.pathname.match(/^\/port\/\d+/); if(m) return m[0];
      if(window.location.hostname.endsWith('.pplx.app')) return '/port/5000';
      if(window.location.hostname==='www.perplexity.ai') return '/port/5000';
      return '';
    })();

    var MAX_RETRIES=4; var RETRY_DELAYS=[3000,5000,8000,12000];
    function attemptFetch(attempt){
      var retryDelay=RETRY_DELAYS[Math.min(attempt-1,RETRY_DELAYS.length-1)];
      fetch(apiBase+'/api/contact',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      .then(function(r){
        if(r.status===200){ console.log('[Contact] Delivered.'); }
        else if(r.status===429){ console.warn('[Contact] Rate limited.'); }
        else if(attempt<MAX_RETRIES){ setTimeout(function(){ attemptFetch(attempt+1); },retryDelay); }
      })
      .catch(function(){ if(attempt<MAX_RETRIES) setTimeout(function(){ attemptFetch(attempt+1); },retryDelay); });
    }
    attemptFetch(1);
  }

  function handleSuccess(mode){
    stopSendingLabelRotation();
    var liveEl=q('v7-aria-live'); if(liveEl) liveEl.textContent='Message sent. Thank you!';
    var dot=q('v7-tab-dot'); if(dot) dot.hidden=true;
    if(mode==='sql'){
      var frozenTs=fmtTs(new Date()); stopTsTicker(frozenTs);
      var commitLine=q('v7-commit-line');
      if(commitLine){
        commitLine.className='v7-commit-line';
        typewriteText(commitLine,'-- 1 row inserted into contacts',function(){ renameTab('sent.sql'); setTimeout(function(){ showSuccess(mode,frozenTs); },900); });
      } else { renameTab('sent.sql'); setTimeout(function(){ showSuccess(mode,frozenTs); },500); }
    } else {
      var label=q('v7-p-btn-label'); var spinner=q('v7-p-spinner');
      if(label) label.textContent='Sent!'; if(spinner) spinner.hidden=true;
      setTimeout(function(){ showSuccess('plain',null); },800);
    }
  }

  function showSuccess(mode,frozenTs){
    var panelPlain=q('v7-plain-panel'); var panelSql=q('v7-sql-panel'); var success=q('v7-success');
    if(!success) return;
    if(panelPlain) panelPlain.hidden=true; if(panelSql) panelSql.hidden=true;
    var retBlock=q('v7-returning');
    if(retBlock){
      if(mode==='sql'&&frozenTs){
        var retId=q('v7-ret-id'); var retTs=q('v7-ret-ts');
        var fakeId=100+(Math.abs(Date.now())%900);
        if(retId) retId.textContent=fakeId; if(retTs) retTs.textContent=frozenTs;
        retBlock.hidden=false;
      } else { retBlock.hidden=true; }
    }
    success.hidden=false; void success.offsetHeight; success.classList.add('is-active');
  }

  function typewriteText(el,text,cb){
    el.textContent=''; var i=0;
    var iv=setInterval(function(){ el.textContent+=text[i]; i++; if(i>=text.length){ clearInterval(iv); if(cb) setTimeout(cb,300); } },18);
  }

  function renameTab(newName){
    var el=q('v7-tab-filename'); if(!el) return;
    el.classList.add('is-swapping');
    setTimeout(function(){ el.textContent=newName; el.classList.remove('is-swapping'); el.classList.add('is-settled'); setTimeout(function(){ el.classList.remove('is-settled'); },300); },180);
  }

  /* ══ RESET ══ */
  function setupReset(){
    var resetBtn=q('v7-reset'); if(resetBtn) resetBtn.addEventListener('click',resetForm);
  }

  function resetForm(){
    state={ name:'', email:'', subject:'', message:'', limit:false };
    sqlBlocks={ name:{on:false}, subject:{on:false}, priority:{on:false,value:''}, returning:{on:false,value:''} };

    // Reset block toggles
    qsa('[data-block-toggle]').forEach(function(btn){
      btn.classList.remove('is-active'); btn.setAttribute('aria-pressed','false');
    });
    qsa('[data-priority],[data-returning]').forEach(function(btn){
      btn.classList.remove('is-active'); btn.setAttribute('aria-pressed','false');
    });
    // Hide block rows
    ['v7-sql-block-name','v7-sql-block-subject','v7-sql-block-priority','v7-sql-block-returning'].forEach(function(id){
      var el=q(id); if(el) el.hidden=true;
    });
    updateBlockShelf();

    var liveReset=q('v7-aria-live'); if(liveReset) liveReset.textContent='';
    ['v7-p-name','v7-p-email','v7-p-subject','v7-p-msg'].forEach(function(id){ var el=q(id); if(el) el.value=''; });
    var eb=q('v7-sql-errors'); if(eb) eb.textContent='';
    ['v7-s-name','v7-s-email','v7-s-subject','v7-s-msg'].forEach(function(id){ var el=q(id); if(el){ el.value=''; if(el.tagName==='TEXTAREA') el.style.height=''; } });
    ['v7-cell-name','v7-cell-email','v7-cell-subject','v7-cell-msg'].forEach(function(id){ var cell=q(id); if(cell) cell.dataset.state='empty'; });
    Object.keys(HINTS).forEach(function(key){
      var hintMap={ name:'v7-hint-name', email:'v7-hint-email', subject:'v7-hint-subject', message:'v7-hint-msg' };
      var hint=q(hintMap[key]); if(hint){ hint.textContent=HINTS[key]; hint.style.color=''; }
    });
    ['v7-pf-name','v7-pf-email','v7-pf-subject','v7-pf-msg'].forEach(function(id){ var el=q(id); if(el) el.classList.remove('is-valid','is-error'); });
    ['v7-pe-name','v7-pe-email','v7-pe-msg'].forEach(function(id){ var el=q(id); if(el) el.textContent=''; });
    var runBtn=q('v7-s-submit'); if(runBtn){ runBtn.dataset.state='idle'; runBtn.disabled=false; }
    var runLabel=q('v7-run-label'); if(runLabel) runLabel.textContent='Send message';
    var pSubmit=q('v7-p-submit'); if(pSubmit) pSubmit.disabled=false;
    var pLabel=q('v7-p-btn-label'); if(pLabel) pLabel.textContent='Send message';
    var pSpinner=q('v7-p-spinner'); if(pSpinner) pSpinner.hidden=true;
    var pArrow=q('v7-p-submit')?q('v7-p-submit').querySelector('.v7-p-btn-arrow'):null; if(pArrow) pArrow.hidden=false;
    var statusEl=q('v7-p-status'); if(statusEl) statusEl.textContent='';
    var dot=q('v7-tab-dot'); if(dot) dot.hidden=true;
    qsa('.v7-chip').forEach(function(c){ c.removeAttribute('data-active'); });
    var cw=q('v7-chip-custom-wrap'); if(cw) cw.hidden=true;
    var ci=q('v7-chip-custom-input'); if(ci) ci.value='';
    updateSubjectSet();
    var retBlock=q('v7-returning'); if(retBlock) retBlock.hidden=true;
    startTsTicker();
    updatePreview(); updateProgress(); updateCharCount();
    var success=q('v7-success');
    if(success){
      success.classList.remove('is-active');
      setTimeout(function(){
        success.hidden=true;
        var modeToRestore=lastMode||'plain';
        currentMode=modeToRestore==='sql'?'plain':'sql';
        var pill=q('v7-pill'); switchMode(modeToRestore,pill);
      },220);
    }
    setTimeout(function(){ var f=currentMode==='sql'?q('v7-s-email'):q('v7-p-name'); if(f) f.focus(); },500);
  }

  function setupBfcache(){
    window.addEventListener('pageshow',function(e){
      if(e.persisted){
        var runBtn=q('v7-s-submit'); if(runBtn&&runBtn.dataset.state==='loading'){ runBtn.dataset.state='idle'; var rl=q('v7-run-label'); if(rl) rl.textContent='Send message'; }
        var pSubmit=q('v7-p-submit'); if(pSubmit&&pSubmit.disabled){ pSubmit.disabled=false; var pl=q('v7-p-btn-label'); if(pl) pl.textContent='Send message'; }
      }
    });
  }

  function isValidEmail(email){ return /^[^\s@]+@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(email.trim()); }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
})();

  /* ── Keep-alive ping ── prevents server sleep so contact form is always instant ── */
  (function keepAlive() {
    var apiBase = window.location.hostname.endsWith('.pplx.app') || window.location.hostname === 'www.perplexity.ai'
      ? '/port/5000' : '';
    function ping() {
      fetch(apiBase + '/api/ping', { method: 'GET', cache: 'no-store' }).catch(function() {});
    }
    ping(); // immediate on page load
    setInterval(ping, 4 * 60 * 1000); // every 4 minutes
  })();

  /* ── Wire Deep Dive v4 buttons ── intercept explore buttons and route to openDD ── */
  (function wireDDButtons() {
    var KEY_MAP = { nashville: 'nashville', bmi: 'python', survey: 'powerbi', airbnb: 'tableau', bikes: 'excel' };
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-explore]');
      if (!btn) return;
      var rawKey = btn.dataset.explore;
      var ddKey = KEY_MAP[rawKey] || rawKey;
      if (typeof window.openDD === 'function') {
        e.stopImmediatePropagation();
        window.openDD(ddKey);
      }
    }, true); // capture phase so we intercept before modals.js
  })();

  /* ── Intent bar — revolutionary contact redesign ── */
  (function wireIntentBar() {
    var bar = document.getElementById('v7-intent-bar');
    if (!bar) return;

    var INTENTS = {
      hire: {
        mode: 'plain',
        chip: 'recruiter',
        hint: 'Hiring inquiries get a fast reply. The form is ready for you.',
        placeholder: 'What role, team, or opportunity? Give me a quick picture.'
      },
      collab: {
        mode: 'plain',
        chip: 'collaborator',
        hint: 'Always happy to connect. Tell me what you have in mind.',
        placeholder: 'What are you working on? Even a rough idea is a great start.'
      },
      hello: {
        mode: 'plain',
        chip: 'hi',
        hint: 'No agenda needed. The form is all yours.',
        placeholder: 'Whatever is on your mind, I am glad you stopped by.'
      },
      other: {
        mode: 'plain',
        chip: null,
        hint: 'Whatever is on your mind, I want to hear it.',
        placeholder: 'Go ahead, I read everything.'
      },
      sql: {
        mode: 'sql',
        chip: null,
        hint: 'SQL Editor Form loaded. Fill in the fields and hit Send.',
        placeholder: null
      }
    };

    var hintEl = document.getElementById('v7-intent-hint');
    var panels = document.getElementById('v7-panels');
    var chipRow = document.getElementById('v7-chip-row');

    bar.addEventListener('click', function(e) {
      var btn = e.target.closest('.v7-intent-btn');
      if (!btn) return;

      var intent = btn.dataset.intent;
      var cfg = INTENTS[intent];
      if (!cfg) return;

      // Toggle active state on buttons
      Array.from(bar.querySelectorAll('.v7-intent-btn')).forEach(function(b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        b.classList.toggle('is-active', b === btn);
      });

      // Show hint
      if (hintEl) hintEl.textContent = cfg.hint;

      // Trigger mode switch using existing hidden switcher buttons
      var plainBtn = document.getElementById('v7-btn-plain');
      var sqlBtn = document.getElementById('v7-btn-sql');
      if (cfg.mode === 'sql' && sqlBtn) {
        sqlBtn.click();
      } else if (plainBtn) {
        plainBtn.click();
      }

      // Set chip if needed
      if (cfg.chip && chipRow) {
        var chipBtn = chipRow.querySelector('[data-chip="' + cfg.chip + '"]');
        if (chipBtn) setTimeout(function() { chipBtn.click(); }, 80);
      }

      // Update message placeholder for context-aware UX
      if (cfg.placeholder) {
        var msgInput = document.getElementById('v7-p-msg');
        if (msgInput) msgInput.setAttribute('placeholder', cfg.placeholder);
      }

      // Form is always visible — intent bar is an enhancer, not a gate

      // Smooth scroll to form
      setTimeout(function() {
        var formAnchor = document.getElementById('contact-form');
        if (formAnchor) {
          formAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    });

    // Also allow form to be shown if user scrolls to contact directly (no intent click)
    // — reveal panels automatically after 2s if no intent selected yet
    var autoRevealTimer = null;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          autoRevealTimer = setTimeout(function() {
  
          }, 1800);
        } else {
          if (autoRevealTimer) clearTimeout(autoRevealTimer);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(bar);
  })();


})();