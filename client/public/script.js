/* ══════════════════════════════════════════════════
   ANDRE WEISSMANN PORTFOLIO — FULL INTERACTIVE JS
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────
     1. THEME TOGGLE
  ───────────────────────────────────────────────── */
  const html = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  let currentTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  html.setAttribute('data-theme', currentTheme);
  updateToggleIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', currentTheme);
      updateToggleIcon(currentTheme);
      // Re-render all charts with new theme colors
      setTimeout(rebuildAllCharts, 50);
    });
  }

  function updateToggleIcon(theme) {
    if (!themeToggle) return;
    if (theme === 'dark') {
      themeToggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      themeToggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  /* ─────────────────────────────────────────────────
     2. HEADER SCROLL + HAMBURGER
  ───────────────────────────────────────────────── */
  const header = document.getElementById('header');
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
  const fadeTargets = ['.project-block-info', '.project-block-demo', '.skill-card', '.tl-item', '.cert-card', '.about-stat', '.hcard'];
  fadeTargets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('fade-up');
      // Cap delay at 150ms so staggered items don't feel laggy on mobile
      el.style.transitionDelay = `${Math.min(i * 40, 150)}ms`;
    });
  });
  const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); } });
  }, {
    // threshold:0 means trigger as soon as ANY pixel enters viewport
    threshold: 0,
    // rootMargin positive bottom means elements reveal earlier, before fully on-screen
    rootMargin: '0px 0px 60px 0px'
  });
  document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

  // Also immediately reveal anything already in viewport on load
  setTimeout(() => {
    document.querySelectorAll('.fade-up:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 60) {
        el.classList.add('visible');
      }
    });
  }, 300);

  // Smooth anchors — offset for sticky header
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = document.getElementById('header')?.offsetHeight || 64;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
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

  async function initSQL() {
    try {
      const SQL = await initSqlJs({
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.2/dist/${file}`
      });
      sqlDB = new SQL.Database();
      sqlDB.run(`CREATE TABLE housing (
        ParcelID TEXT, LandUse TEXT, SaleDate TEXT, SalePrice INTEGER,
        LegalReference TEXT, SoldAsVacant TEXT, OwnerSplitRequired TEXT,
        PropertyAddress TEXT, PropertyCity TEXT, PropertyState TEXT, PropertyZip TEXT
      )`);
      const stmt = sqlDB.prepare(`INSERT INTO housing VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
      housingData.forEach(row => stmt.run(row));
      stmt.free();
    } catch (e) {
      console.warn('SQL.js failed to load:', e);
    }
  }

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

  // Wire up SQL sandbox buttons
  document.querySelectorAll('.sql-ex').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.dataset.query;
      const editor = document.getElementById('sql-editor-nashville');
      if (editor) editor.value = query;
      runSQL(query, 'nashville');
    });
  });

  document.querySelector('.sql-run-btn[data-target="nashville"]')?.addEventListener('click', () => {
    const editor = document.getElementById('sql-editor-nashville');
    if (editor) runSQL(editor.value.trim(), 'nashville');
  });

  // Allow Ctrl+Enter / Cmd+Enter in editor to run
  document.getElementById('sql-editor-nashville')?.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runSQL(e.target.value.trim(), 'nashville');
    }
  });

  initSQL();

  /* ─────────────────────────────────────────────────
     5. BMI / WAIST-TO-HIP CALCULATOR (Python logic in JS)
  ───────────────────────────────────────────────── */
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

    // Update stats
    document.getElementById('stat-count').textContent = totalCount.toLocaleString();
    document.getElementById('stat-avg-salary').textContent = '$' + avgSalary.toLocaleString();
    document.getElementById('stat-avg-age').textContent = avgAge;
    document.getElementById('stat-happy').textContent = wlBalance + '/10';

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

    document.getElementById('ab-listings').textContent = totalListings.toLocaleString();
    document.getElementById('ab-avg-price').textContent = '$' + avgPrice;
    document.getElementById('ab-revenue').textContent = '$' + (totalRevenue / 1000000).toFixed(1) + 'M';

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

    document.getElementById('bk-sales').textContent = totalRecords.toLocaleString();
    document.getElementById('bk-purchased').textContent = totalSales;
    document.getElementById('bk-rate').textContent = Math.round(totalSales / totalRecords * 100) + '%';

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
  waitForChartJS();

})();
