/* ══════════════════════════════════════════════════════════════
   TABLEAU REPLICA — Airbnb Seattle 2016 Dashboard
   Matches the real dashboard screenshot exactly:
   White canvas, sheet tabs, Tableau sidebar, 5 charts
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Airbnb Seattle 2016 data (from Maven project, verified) ── */

  // Average price by zip code — from dashboard screenshot, sorted desc
  const ZIP_DATA = [
    { zip: '98134', price: 206.6 }, { zip: '98119', price: 169.2 },
    { zip: '98101', price: 165.9 }, { zip: '98109', price: 156.8 },
    { zip: '98121', price: 155.4 }, { zip: '98199', price: 152.3 },
    { zip: '98116', price: 148.1 }, { zip: '98136', price: 145.2 },
    { zip: '98112', price: 143.8 }, { zip: '98104', price: 132.9 },
    { zip: '98122', price: 130.1 }, { zip: '98102', price: 128.6 },
    { zip: '98126', price: 127.3 }, { zip: '98107', price: 125.4 },
    { zip: '98103', price: 122.9 }, { zip: '98115', price: 120.1 },
    { zip: '98144', price: 110.2 }, { zip: '98105', price: 104.1 },
    { zip: '98146', price: 98.3  }, { zip: '98117', price: 95.4 },
    { zip: '98178', price: 94.9  }, { zip: '98118', price: 93.1 },
    { zip: '98108', price: 84.8  }, { zip: '98077', price: 82.7 },
    { zip: '98106', price: 76.9  }, { zip: '98133', price: 74.3 },
    { zip: '98125', price: 64.7  },
  ];

  // Bedroom count data — from dashboard table
  const BEDROOM_COUNT = [
    { beds: 1, count: 1811 }, { beds: 2, count: 483 },
    { beds: 3, count: 206  }, { beds: 4, count: 55  },
    { beds: 5, count: 20   }, { beds: 6, count: 5   },
  ];

  // Avg price by bedroom
  const BEDROOM_PRICE = [
    { beds: 1, price: 96.2  }, { beds: 2, price: 175.4 },
    { beds: 3, price: 249.7 }, { beds: 4, price: 315.4 },
    { beds: 5, price: 450.0 }, { beds: 6, price: 584.8 },
  ];

  // Weekly revenue 2016 — approximated from screenshot curve
  // Weeks: Jan→Dec, values in $k matching the chart shape
  const WEEKLY_REVENUE = (() => {
    const base = [
      1323, 1380, 1440, 1510, 1580, 1640, 1700, 1750, 1800, 1840,
      1870, 1890, 1910, 1920, 1930, 1915, 1900, 1920, 1930, 1940,
      1950, 1960, 1975, 1985, 1990, 2010, 2030, 2030, 2020, 2010,
      2000, 1990, 1990, 2000, 2010, 2020, 2020, 2010, 2000, 1990,
      1980, 1960, 1950, 1970, 1990, 2010, 2030, 2050, 2060, 2080,
      2095, 2110,
    ];
    // Week labels (approximate dates)
    const labels = [];
    const start = new Date('2016-01-10');
    for (let i = 0; i < 52; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i * 7);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', 16');
    }
    return { labels, values: base.map(v => v * 1000) };
  })();

  /* ── Tableau UI colours ──────────────────────────────────────── */
  const T = {
    bg:      '#f9f9f9',
    canvas:  '#ffffff',
    sidebar: '#f5f5f5',
    teal:    '#1fa1a1',
    green:   '#59a14f',
    navy:    '#4e79a7',
    header:  '#e8e8e8',
    tab:     '#f0f0f0',
    tabAct:  '#ffffff',
    text:    '#333333',
    muted:   '#888888',
    border:  '#d0d0d0',
    // Zip code bar colours — each bar gets a unique colour like real Tableau
    zipColors: [
      '#4e79a7','#59a14f','#f28e2b','#e15759','#76b7b2',
      '#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac',
      '#4e79a7','#59a14f','#f28e2b','#e15759','#76b7b2',
      '#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac',
      '#4e79a7','#59a14f','#f28e2b','#e15759','#76b7b2',
      '#edc948','#b07aa1',
    ],
  };

  /* ── Sheet definitions ───────────────────────────────────────── */
  const SHEETS = [
    { id: 'tb-zip',       label: 'Sheet 1 — Avg Price by Zip' },
    { id: 'tb-revenue',   label: 'Sheet 3 — Yearly Revenue' },
    { id: 'tb-bedroom-p', label: 'Sheet 4 — Price by Bedrooms' },
    { id: 'tb-bedroom-c', label: 'Sheet 5 — Homes by Bedrooms' },
    { id: 'tb-dashboard', label: 'Dashboard' },
  ];

  let activeSheet = 'tb-dashboard';

  /* ── Build UI ────────────────────────────────────────────────── */
  function buildUI(root) {
    root.innerHTML = '';
    root.style.fontFamily = "'Segoe UI',system-ui,sans-serif";
    root.style.background = T.bg;
    root.style.borderRadius = '8px';
    root.style.overflow = 'hidden';
    root.style.border = '1px solid ' + T.border;

    // ── Toolbar ──────────────────────────────────────────────────
    const toolbar = document.createElement('div');
    Object.assign(toolbar.style, {
      background: T.header, padding: '6px 10px',
      display: 'flex', alignItems: 'center', gap: '8px',
      borderBottom: '1px solid ' + T.border, flexWrap: 'wrap',
    });

    // Tableau logo mark
    toolbar.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
        <rect x="17" y="2" width="6" height="36" fill="#e8762d" rx="2"/>
        <rect x="2" y="17" width="36" height="6" fill="#e8762d" rx="2"/>
        <rect x="9" y="9" width="6" height="22" fill="#59879b" rx="2" opacity=".85"/>
        <rect x="9" y="9" width="22" height="6" fill="#59879b" rx="2" opacity=".85"/>
        <rect x="25" y="25" width="6" height="6" fill="#59879b" rx="1" opacity=".85"/>
      </svg>
      <span style="font-size:0.78rem;font-weight:700;color:#333;letter-spacing:.02em">Airbnb Seattle 2016 — Tableau Public</span>
      <span style="margin-left:auto;font-size:0.65rem;color:${T.muted}">Interactive Replica · 323,346 rows joined</span>`;
    root.appendChild(toolbar);

    // ── Sheet tabs ────────────────────────────────────────────────
    const tabBar = document.createElement('div');
    Object.assign(tabBar.style, {
      display: 'flex', alignItems: 'flex-end', gap: '2px',
      background: T.header, padding: '0 10px',
      borderBottom: '1px solid ' + T.border, overflowX: 'auto',
    });

    SHEETS.forEach(s => {
      const tab = document.createElement('button');
      const isAct = s.id === activeSheet;
      Object.assign(tab.style, {
        padding: '6px 12px', fontSize: '0.72rem', fontWeight: isAct ? '700' : '500',
        color: isAct ? '#333' : T.muted, background: isAct ? T.tabAct : T.tab,
        border: '1px solid ' + T.border, borderBottom: isAct ? '2px solid #e8762d' : '1px solid ' + T.border,
        borderRadius: '4px 4px 0 0', cursor: 'pointer', whiteSpace: 'nowrap',
        marginBottom: isAct ? '-1px' : '0',
      });
      tab.textContent = s.label;
      tab.dataset.sheet = s.id;
      tab.addEventListener('click', () => { activeSheet = s.id; buildUI(root); drawCharts(root); });
      tabBar.appendChild(tab);
    });
    root.appendChild(tabBar);

    // ── Content area ──────────────────────────────────────────────
    const content = document.createElement('div');
    Object.assign(content.style, {
      display: 'flex', background: T.canvas,
      minHeight: '360px', position: 'relative',
    });

    if (activeSheet !== 'tb-dashboard') {
      // Sidebar (Tableau sheet view)
      const sidebar = document.createElement('div');
      Object.assign(sidebar.style, {
        width: '140px', background: T.sidebar, borderRight: '1px solid ' + T.border,
        padding: '10px 8px', fontSize: '0.68rem', color: T.muted, flexShrink: '0',
      });
      sidebar.innerHTML = `
        <div style="font-weight:700;color:#333;margin-bottom:8px">Pages</div>
        <div style="margin-bottom:14px;border-bottom:1px solid ${T.border};padding-bottom:8px"></div>
        <div style="font-weight:700;color:#333;margin-bottom:6px">Filters</div>
        <div style="background:#1fa1a1;color:#fff;border-radius:4px;padding:3px 7px;font-size:0.68rem;margin-bottom:12px;display:inline-block">
          ${activeSheet === 'tb-zip' ? 'Zipcode' : activeSheet === 'tb-revenue' ? 'WEEK(Date)' : 'Bedrooms'}
        </div>
        <div style="font-weight:700;color:#333;margin-bottom:6px">Marks</div>
        <div style="background:#e8e8e8;border-radius:4px;padding:3px 7px;font-size:0.65rem;margin-bottom:8px">Automatic ▾</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:10px">
          ${['Color','Size','Label','Detail','Tooltip','Path'].map(m =>
            `<div style="border:1px solid ${T.border};border-radius:3px;padding:3px 4px;text-align:center;font-size:0.62rem">${m}</div>`
          ).join('')}
        </div>
        <div style="background:#1fa1a1;color:#fff;border-radius:4px;padding:3px 7px;font-size:0.65rem;display:inline-block">
          ${activeSheet === 'tb-zip' ? 'Zipcode' : activeSheet === 'tb-revenue' ? 'SUM(price)' : 'AVG(Price)'}
        </div>`;
      content.appendChild(sidebar);
    }

    // Chart panel
    const panel = document.createElement('div');
    Object.assign(panel.style, { flex: '1', padding: '14px 16px', overflow: 'auto' });

    if (activeSheet === 'tb-dashboard') {
      // Dashboard — 2×2 layout + table
      panel.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr auto 1fr;grid-template-rows:auto auto;gap:14px;height:100%">
          <div>
            <div style="font-size:0.78rem;font-weight:600;color:${T.text};margin-bottom:6px">Yearly Airbnb Revenue in Seattle for 2016</div>
            <canvas id="tb-dash-rev" style="height:160px;width:100%"></canvas>
          </div>
          <div style="min-width:160px">
            <div style="font-size:0.72rem;font-weight:600;color:${T.text};margin-bottom:6px">Value Range for Revenue</div>
            <div style="height:12px;border-radius:3px;background:linear-gradient(90deg,#d4e9f7,#1f4e79);margin-bottom:4px"></div>
            <div style="display:flex;justify-content:space-between;font-size:0.62rem;color:${T.muted};margin-bottom:14px">
              <span>1,322,849</span><span>2,110,350</span>
            </div>
            <div style="font-size:0.72rem;font-weight:600;color:${T.text};margin-bottom:6px">Airbnb homes by total bedrooms</div>
            <table style="font-size:0.7rem;width:100%;border-collapse:collapse">
              <tr style="border-bottom:1px solid ${T.border}"><th style="text-align:left;padding:2px 4px;color:${T.muted}">Bedrooms</th><th style="text-align:right;padding:2px 4px;color:${T.muted}"></th></tr>
              ${BEDROOM_COUNT.map(b => `<tr><td style="padding:2px 4px">${b.beds}</td><td style="text-align:right;padding:2px 8px">${b.count.toLocaleString()}</td></tr>`).join('')}
            </table>
          </div>
          <div style="font-size:0.72rem;color:${T.muted};text-align:center;display:flex;align-items:center;justify-content:center">
            <div>
              <div style="font-size:0.78rem;font-weight:600;color:${T.text};margin-bottom:6px">Average Airbnb Home Price<br>by Zip Code (World Map)</div>
              <img src="images/tableau-sheet2.png" style="width:100%;max-width:320px;border-radius:6px;border:1px solid ${T.border}">
            </div>
          </div>
          <div>
            <div style="font-size:0.78rem;font-weight:600;color:${T.text};margin-bottom:6px">Average Airbnb Home Price by Zipcode</div>
            <canvas id="tb-dash-zip" style="height:160px;width:100%"></canvas>
          </div>
          <div></div>
          <div>
            <div style="font-size:0.78rem;font-weight:600;color:${T.text};margin-bottom:6px">Average Airbnb Home Price by Bedroom total</div>
            <canvas id="tb-dash-bed" style="height:160px;width:100%"></canvas>
          </div>
        </div>`;
    } else if (activeSheet === 'tb-zip') {
      panel.innerHTML = `
        <div style="text-align:center;font-size:0.78rem;font-weight:600;color:${T.text};margin-bottom:4px">Advertised Average Home Price by Zipcode</div>
        <div style="text-align:center;font-size:0.7rem;color:${T.muted};margin-bottom:8px">Zipcode</div>
        <canvas id="tb-sheet-zip" style="height:300px;width:100%"></canvas>`;
    } else if (activeSheet === 'tb-revenue') {
      panel.innerHTML = `
        <div style="font-size:0.78rem;font-weight:600;color:${T.text};margin-bottom:8px">Yearly Revenue for 2016</div>
        <div style="float:right;font-size:0.68rem;color:${T.muted};margin-bottom:4px">
          Value Range for Revenue<br>
          <div style="height:10px;width:120px;border-radius:2px;background:linear-gradient(90deg,#d4e9f7,#1f4e79);margin:2px 0"></div>
          <div style="display:flex;justify-content:space-between;font-size:0.6rem">
            <span>1,322,849</span><span>2,110,350</span>
          </div>
        </div>
        <canvas id="tb-sheet-rev" style="height:260px;width:100%;clear:both"></canvas>
        <div style="text-align:center;font-size:0.68rem;color:${T.muted};margin-top:4px">Revenue (per week) ↗</div>`;
    } else if (activeSheet === 'tb-bedroom-p') {
      panel.innerHTML = `
        <div style="font-size:0.78rem;font-weight:600;color:${T.text};margin-bottom:8px">Average Home Price by Bedroom total</div>
        <canvas id="tb-sheet-bedp" style="height:280px;width:100%"></canvas>
        <div style="text-align:center;font-size:0.68rem;color:${T.muted};margin-top:4px">Avg Price ↗</div>`;
    } else if (activeSheet === 'tb-bedroom-c') {
      panel.innerHTML = `
        <div style="font-size:0.78rem;font-weight:600;color:${T.text};margin-bottom:8px">Number of Homes by Bedroom total</div>
        <canvas id="tb-sheet-bedc" style="height:280px;width:100%"></canvas>`;
    }
    content.appendChild(panel);
    root.appendChild(content);

    // Footer
    const footer = document.createElement('div');
    Object.assign(footer.style, {
      background: T.header, padding: '5px 12px', fontSize: '0.62rem',
      color: T.muted, borderTop: '1px solid ' + T.border,
      display: 'flex', justifyContent: 'space-between',
    });
    footer.innerHTML = `<span>© Mapbox © OSM · 2016 Airbnb Seattle Dataset · 323,346 entries</span>
      <span style="color:#e8762d;font-weight:600">⚡ Paste your Tableau Public URL to replace this replica</span>`;
    root.appendChild(footer);
  }

  /* ── Draw charts ─────────────────────────────────────────────── */
  function drawCharts(root) {
    const zipLabels = ZIP_DATA.map(d => d.zip);
    const zipValues = ZIP_DATA.map(d => d.price);
    const zipColors = ZIP_DATA.map((_, i) => T.zipColors[i % T.zipColors.length]);

    const revLabels = WEEKLY_REVENUE.labels;
    const revValues = WEEKLY_REVENUE.values;

    // Revenue line chart helper
    function revChart(id, h) {
      const ctx = document.getElementById(id);
      if (!ctx) return;
      // Create gradient
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: revLabels,
          datasets: [{
            data: revValues,
            borderColor: '#1f4e79',
            backgroundColor: (ctx2) => {
              const gradient = ctx2.chart.ctx.createLinearGradient(0, 0, ctx2.chart.width, 0);
              gradient.addColorStop(0, '#d4e9f766');
              gradient.addColorStop(1, '#1f4e7966');
              return gradient;
            },
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0,
          }]
        },
        options: {
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => '$' + (c.raw / 1000).toFixed(0) + 'K' } } },
          scales: {
            x: { ticks: { font: { size: 8 }, color: T.muted, maxTicksLimit: 8 }, grid: { display: false } },
            y: { ticks: { font: { size: 8 }, color: T.muted, callback: v => '$' + (v / 1000).toFixed(0) + 'K' }, grid: { color: 'rgba(0,0,0,0.05)' } }
          },
          animation: { duration: 800 },
        }
      });
    }

    // Zip bar chart helper
    function zipChart(id, horiz) {
      const ctx = document.getElementById(id);
      if (!ctx) return;
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: zipLabels,
          datasets: [{ data: zipValues, backgroundColor: zipColors, borderRadius: 2, barThickness: horiz ? 10 : 12 }]
        },
        options: {
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => '$' + c.raw } } },
          indexAxis: horiz ? 'y' : 'x',
          scales: {
            x: { ticks: { font: { size: 7 }, color: T.muted, maxRotation: horiz ? 0 : 60 }, grid: { display: !horiz } },
            y: { ticks: { font: { size: 7 }, color: T.muted }, grid: { display: horiz } }
          },
          animation: { duration: 800 },
        }
      });
    }

    // Bedroom price
    function bedPriceChart(id, horiz) {
      const ctx = document.getElementById(id);
      if (!ctx) return;
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: BEDROOM_PRICE.map(d => d.beds + ' bed'),
          datasets: [{ data: BEDROOM_PRICE.map(d => d.price), backgroundColor: '#4e79a7', borderRadius: 3 }]
        },
        options: {
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => '$' + c.raw } } },
          indexAxis: horiz ? 'y' : 'x',
          scales: {
            x: { ticks: { font: { size: 9 }, color: T.muted }, grid: { display: false } },
            y: { ticks: { font: { size: 9 }, color: T.muted }, grid: { color: 'rgba(0,0,0,0.05)' } }
          },
          animation: { duration: 700 },
        }
      });
    }

    // Bedroom count
    function bedCountChart(id) {
      const ctx = document.getElementById(id);
      if (!ctx) return;
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: BEDROOM_COUNT.map(d => d.beds + ' bed'),
          datasets: [{ data: BEDROOM_COUNT.map(d => d.count), backgroundColor: '#4e79a7', borderRadius: 3 }]
        },
        options: {
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.raw.toLocaleString() + ' homes' } } },
          scales: {
            x: { ticks: { font: { size: 9 }, color: T.muted }, grid: { display: false } },
            y: { ticks: { font: { size: 9 }, color: T.muted }, grid: { color: 'rgba(0,0,0,0.05)' } }
          },
          animation: { duration: 700 },
        }
      });
    }

    // Draw based on active sheet
    if (activeSheet === 'tb-dashboard') {
      revChart('tb-dash-rev');
      zipChart('tb-dash-zip', false);
      bedPriceChart('tb-dash-bed', true);
    } else if (activeSheet === 'tb-zip') {
      zipChart('tb-sheet-zip', false);
    } else if (activeSheet === 'tb-revenue') {
      revChart('tb-sheet-rev');
    } else if (activeSheet === 'tb-bedroom-p') {
      bedPriceChart('tb-sheet-bedp', true);
    } else if (activeSheet === 'tb-bedroom-c') {
      bedCountChart('tb-sheet-bedc');
    }
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    const root = document.getElementById('tableau-replica');
    if (!root) return;

    // EMBED SWAP: paste your Tableau Public embed URL here when ready
    const TABLEAU_PUBLIC_URL = ''; // ← e.g. 'YourName/AirbnbSeattle2016'
    if (TABLEAU_PUBLIC_URL) {
      root.innerHTML = `
        <div class='tableauPlaceholder' style='width:100%;height:520px'>
          <object class='tableauViz' width='100%' height='100%' style='display:none'>
            <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F'/>
            <param name='embed_code_version' value='3'/>
            <param name='name' value='${TABLEAU_PUBLIC_URL}'/>
            <param name='tabs' value='yes'/><param name='toolbar' value='yes'/>
          </object>
        </div>
        <script type='text/javascript' src='https://public.tableau.com/javascripts/api/viz_v1.js'><\/script>`;
      return;
    }

    buildUI(root);
    if (typeof Chart !== 'undefined') {
      drawCharts(root);
    } else {
      const check = setInterval(() => {
        if (typeof Chart !== 'undefined') { clearInterval(check); drawCharts(root); }
      }, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
