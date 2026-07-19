/* ══════════════════════════════════════════════════════════════
   POWER BI REPLICA — Data Professional Survey Dashboard
   Matches the real dashboard screenshot exactly:
   Light-blue header, dark navy bars, KPI cards, 5 charts
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Survey data (from Maven project, verified) ─────────────── */
  const DATA = {
    totalParticipants: 630,
    avgAge: 29.87,
    // Top 5 occupations by preselection — avg yearly salary ($k)
    occ_preselect: [
      { label: 'Data Scientist',      sal: 94 },
      { label: 'Data Engineer',       sal: 65 },
      { label: 'Data Architect',      sal: 64 },
      { label: 'Did not select',      sal: 44 },
      { label: 'Database Developer',  sal: 33 },
    ],
    // Top 5 occupations by participant input
    occ_input: [
      { label: 'Systems configuration', sal: 75 },
      { label: 'Tableau administrator', sal: 68 },
      { label: 'Teacher',               sal: 55 },
      { label: 'Technical consultant',  sal: 38 },
      { label: 'Web Developer',         sal: 30 },
    ],
    // Gender count
    gender: [
      { label: 'Male',   count: 468 },
      { label: 'Female', count: 150 },
      { label: 'Other',  count: 12  },
    ],
    // Country funnel
    countries: [
      { label: 'United States',  count: 261 },
      { label: 'Other',          count: 224 },
      { label: 'India',          count: 73  },
      { label: 'United Kingdom', count: 40  },
      { label: 'Canada',         count: 32  },
    ],
    // Education level
    education: [
      { label: "Bachelor's", count: 329 },
      { label: "Master's",   count: 192 },
      { label: 'Did not select', count: 52 },
      { label: 'High School',    count: 36 },
      { label: "Associate's",    count: 16 },
      { label: 'PhD',            count: 5  },
    ],
  };

  /* ── Colour palette matching real Power BI screenshot ────────── */
  const PBI = {
    bg:        '#f3f2f1',
    canvas:    '#ffffff',
    header:    '#b0c4d8',
    navy:      '#1f3864',
    teal:      '#2e75b6',
    green:     '#548235',
    text:      '#252423',
    muted:     '#605e5c',
    border:    '#d2d0ce',
    barColors: ['#1f3864','#2e75b6','#548235','#7030a0','#c55a11'],
  };

  /* ── Helpers ─────────────────────────────────────────────────── */
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function canvas(id, h) {
    const c = document.createElement('canvas');
    c.id = id; c.style.height = h + 'px'; c.style.width = '100%';
    return c;
  }

  /* ── Build dashboard DOM ─────────────────────────────────────── */
  function build(container) {
    container.innerHTML = '';
    container.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
    container.style.background = PBI.bg;
    container.style.borderRadius = '8px';
    container.style.overflow = 'hidden';
    container.style.border = '1px solid ' + PBI.border;

    // Header
    const header = el('div', '', `<span style="font-size:1.3rem;font-weight:700;color:${PBI.navy}">Data Professional Survey Dashboard</span>`);
    Object.assign(header.style, { background: PBI.header, padding: '14px 20px', textAlign: 'center', borderBottom: '1px solid ' + PBI.border });
    container.appendChild(header);

    // Body grid
    const body = el('div');
    Object.assign(body.style, { display: 'grid', gridTemplateColumns: '160px 1fr 1fr', gridTemplateRows: 'auto auto', gap: '12px', padding: '14px 16px', background: PBI.canvas });
    container.appendChild(body);

    // ── KPI cards (left column, spans 2 rows) ──────────────────
    const kpiCol = el('div');
    Object.assign(kpiCol.style, { gridRow: '1 / 3', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' });

    [['630', 'Total number of Survey Participants'], ['29.87', 'Average age of Survey Participant']].forEach(([n, l]) => {
      const card = el('div');
      Object.assign(card.style, { padding: '12px 8px' });
      card.innerHTML = `<div style="font-size:2.4rem;font-weight:300;color:${PBI.navy};line-height:1">${n}</div>
        <div style="font-size:0.72rem;color:${PBI.muted};margin-top:4px;line-height:1.4">${l}</div>`;
      kpiCol.appendChild(card);
    });
    body.appendChild(kpiCol);

    // ── Top 5 by preselection (top-middle) ─────────────────────
    const c1 = el('div');
    Object.assign(c1.style, { padding: '0 8px' });
    c1.innerHTML = `<div style="font-size:0.78rem;font-weight:600;color:${PBI.navy};margin-bottom:8px;text-align:center">Top 5 Occupations (based on preselection)</div>`;
    c1.appendChild(canvas('pbi-occ-pre', 150));
    body.appendChild(c1);

    // ── Top 5 by input (top-right) ─────────────────────────────
    const c2 = el('div');
    Object.assign(c2.style, { padding: '0 8px' });
    c2.innerHTML = `<div style="font-size:0.78rem;font-weight:600;color:${PBI.navy};margin-bottom:8px;text-align:center">Top 5 Occupations (based on Participant input)</div>`;
    c2.appendChild(canvas('pbi-occ-inp', 150));
    body.appendChild(c2);

    // ── Gender (bottom-left of right section) ──────────────────
    const c3 = el('div');
    Object.assign(c3.style, { padding: '0 8px' });
    c3.innerHTML = `<div style="font-size:0.75rem;font-weight:600;color:${PBI.navy};margin-bottom:6px">Number of participants by Gender</div>`;
    c3.appendChild(canvas('pbi-gender', 130));
    body.appendChild(c3);

    // ── Country funnel (bottom-middle) ─────────────────────────
    const c4 = el('div');
    Object.assign(c4.style, { padding: '0 8px' });
    c4.innerHTML = `<div style="font-size:0.75rem;font-weight:600;color:${PBI.navy};margin-bottom:6px;text-align:center">Survey Participants by Country</div>`;
    c4.appendChild(canvas('pbi-country', 130));
    body.appendChild(c4);

    // ── Education (bottom-right) ────────────────────────────────
    const c5 = el('div');
    c5.style.padding = '0 8px';
    c5.innerHTML = `<div style="font-size:0.75rem;font-weight:600;color:${PBI.navy};margin-bottom:6px">Number of participants by Education level</div>`;
    c5.appendChild(canvas('pbi-edu', 130));
    body.appendChild(c5);

    // Footer note
    const note = el('div');
    Object.assign(note.style, { background: PBI.bg, padding: '6px 16px', fontSize: '0.65rem', color: PBI.muted, borderTop: '1px solid ' + PBI.border, display: 'flex', justifyContent: 'space-between' });
    note.innerHTML = `<span>Data Professional Survey · 2022 · Alex Freberg</span>
      <span style="color:#2e75b6;font-weight:600">⚡ Embed your live Power BI link to replace this replica</span>`;
    container.appendChild(note);
  }

  /* ── Draw charts ─────────────────────────────────────────────── */
  function drawCharts() {
    const pbiColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary').trim() || '#2e75b6';

    const chartDefaults = {
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      animation: { duration: 800 },
    };

    // Bar chart helper
    function hBar(id, labels, data, colors) {
      const ctx = document.getElementById(id);
      if (!ctx) return;
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ data, backgroundColor: colors || PBI.navy, borderRadius: 2, barThickness: 14 }]
        },
        options: {
          ...chartDefaults,
          indexAxis: 'y',
          scales: {
            x: { ticks: { font: { size: 9 }, color: PBI.muted }, grid: { color: 'rgba(0,0,0,0.06)' } },
            y: { ticks: { font: { size: 9 }, color: PBI.text } }
          }
        }
      });
    }

    // Top 5 preselect — navy + teal alternating
    hBar('pbi-occ-pre',
      DATA.occ_preselect.map(d => d.label),
      DATA.occ_preselect.map(d => d.sal),
      [PBI.navy, PBI.teal, PBI.teal, PBI.green, PBI.navy]
    );

    // Top 5 input
    hBar('pbi-occ-inp',
      DATA.occ_input.map(d => d.label),
      DATA.occ_input.map(d => d.sal),
      [PBI.navy, PBI.teal, PBI.teal, PBI.green, PBI.navy]
    );

    // Gender — stacked column
    const gCtx = document.getElementById('pbi-gender');
    if (gCtx) {
      new Chart(gCtx, {
        type: 'bar',
        data: {
          labels: DATA.gender.map(d => d.label),
          datasets: [{ data: DATA.gender.map(d => d.count), backgroundColor: [PBI.navy, PBI.teal, PBI.green], borderRadius: 3 }]
        },
        options: {
          ...chartDefaults,
          scales: {
            x: { ticks: { font: { size: 9 }, color: PBI.text }, grid: { display: false } },
            y: { ticks: { font: { size: 9 }, color: PBI.muted }, grid: { color: 'rgba(0,0,0,0.06)' } }
          }
        }
      });
    }

    // Country — horizontal funnel-style bar
    hBar('pbi-country',
      DATA.countries.map(d => d.label),
      DATA.countries.map(d => d.count),
      DATA.countries.map((_, i) => i === 0 ? PBI.navy : i === 1 ? '#1f5496' : PBI.teal)
    );

    // Education — column
    const eCtx = document.getElementById('pbi-edu');
    if (eCtx) {
      new Chart(eCtx, {
        type: 'bar',
        data: {
          labels: DATA.education.map(d => d.label),
          datasets: [{ data: DATA.education.map(d => d.count), backgroundColor: PBI.navy, borderRadius: 3, barThickness: 18 }]
        },
        options: {
          ...chartDefaults,
          scales: {
            x: { ticks: { font: { size: 8 }, color: PBI.text, maxRotation: 30 }, grid: { display: false } },
            y: { ticks: { font: { size: 9 }, color: PBI.muted }, grid: { color: 'rgba(0,0,0,0.06)' } }
          }
        }
      });
    }
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    const container = document.getElementById('powerbi-replica');
    if (!container) return;

    // EMBED SWAP: if a real Power BI publish-to-web URL is set, use it instead
    const POWERBI_EMBED_URL = ''; // ← paste your Power BI publish-to-web URL here
    if (POWERBI_EMBED_URL) {
      container.innerHTML = `<iframe title="Power BI Dashboard"
        src="${POWERBI_EMBED_URL}"
        frameborder="0" allowFullScreen="true"
        style="width:100%;height:100%;min-height:500px;border-radius:8px;border:none;">
      </iframe>`;
      return;
    }

    build(container);

    if (typeof Chart !== 'undefined') {
      drawCharts();
    } else {
      // Chart.js not yet loaded — wait for it
      const check = setInterval(() => {
        if (typeof Chart !== 'undefined') { clearInterval(check); drawCharts(); }
      }, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
