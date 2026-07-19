/* ══════════════════════════════════════════════════════════════
   EXCEL BIKE SALES DASHBOARD REPLICA
   One unified dashboard matching the real screenshot exactly.
   Layout: Green header | Left slicer panel | 2x2 chart grid
   Slicers cross-filter all 4 charts simultaneously.
   Fixed-height containment on all chart cards.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Raw data (exact figures from real Excel dashboard) ─────── */
  const RAW = {
    /* Average Income by Gender x Purchased (No/Yes) */
    income: {
      Female: { No: 53440, Yes: 55267 },
      Male:   { No: 56208, Yes: 60124 },
    },

    /* Customer Age Brackets — count of No/Yes bike purchases */
    age: {
      Adolescent:   { No:  71, Yes:  41 },
      'Middle Age': { No: 326, Yes: 393 },
      Old:          { No: 134, Yes:  61 },
    },

    /* Customer Commute — count No/Yes by distance band */
    commute: {
      '0-1 Miles':  { No: 171, Yes: 207 },
      '1-2 Miles':  { No:  93, Yes:  83 },
      '2-5 Miles':  { No:  67, Yes:  95 },
      '5-10 Miles': { No: 120, Yes:  77 },
      '10+ Miles':  { No:  80, Yes:  33 },
    },

    /* Bikes by Occupation + Car count (stacked bars) */
    occupation: {
      Clerical:      { 0:{No:80,Yes:63},  1:{No:50,Yes:66},  2:{No:46,Yes:25}, 3:{No:1,Yes:1}  },
      Management:    { 0:{No:15,Yes:34},  1:{No:31,Yes:47},  2:{No:37,Yes:25}, 3:{No:1,Yes:1}  },
      Manual:        { 0:{No:65,Yes:38},  1:{No:50,Yes:47},  2:{No:46,Yes:79}, 3:{No:33,Yes:36}},
      Professional:  { 0:{No:73,Yes:55},  1:{No:79,Yes:73},  2:{No:50,Yes:31}, 3:{No:46,Yes:65}, 4:{No:1,Yes:1} },
      'Skilled Manual':{ 0:{No:63,Yes:66},1:{No:114,Yes:79}, 2:{No:11,Yes:36}, 3:{No:1,Yes:33} },
    },

    /* Filter multipliers for cross-filtering */
    regionMult:  { Europe:0.31, 'North America':0.50, Pacific:0.20 },
    maritalMult: { Married:0.54, Single:0.46 },
    homeMult:    { Yes:0.60, No:0.40 },
    genderFactor:{ Female:0.38, Male:0.62 },
    eduMult:     { Bachelors:0.30,'Graduate Degree':0.18,'High School':0.17,'Partial College':0.20,'Partial High School':0.15 },
  };

  /* ── Colors ─────────────────────────────────────────────────── */
  const C = {
    headerBg:   '#4CAF50',
    headerText: '#ffffff',
    slicerBg:   '#f5f5f5',
    slicerSel:  '#bdd7ee',
    slicerHdr:  '#dce6f1',
    no:         '#4472c4',   /* blue  = did not purchase */
    yes:        '#e8762d',   /* orange = purchased */
    cars:       ['#4472c4','#ed7d31','#a9d18e','#ffc000','#7030a0'],
    border:     '#cccccc',
    text:       '#333333',
    muted:      '#666666',
    white:      '#ffffff',
    grid:       'rgba(0,0,0,0.07)',
  };

  /* ── Active filter state ──────────────────────────────────── */
  let active = {
    gender:    new Set(),
    marital:   new Set(),
    homeowner: new Set(),
    education: new Set(),
    region:    new Set(),
  };

  let charts = {};

  function destroyAll() {
    Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
    charts = {};
  }

  /* ── Multiplier from active filters ────────────────────────── */
  function getMult(category) {
    let m = 1;
    if (active.region.size)
      m *= [...active.region].reduce((a, r) => a + (RAW.regionMult[r] || 0), 0);
    if (active.marital.size)
      m *= [...active.marital].reduce((a, r) => a + (RAW.maritalMult[r] || 0), 0);
    if (active.homeowner.size)
      m *= [...active.homeowner].reduce((a, r) => a + (RAW.homeMult[r] || 0), 0);
    if (active.education.size)
      m *= [...active.education].reduce((a, r) => a + (RAW.eduMult[r] || 0), 0);
    /* Gender filter only affects non-income charts to avoid paradox */
    if (category !== 'income' && active.gender.size)
      m *= [...active.gender].reduce((a, g) => a + (RAW.genderFactor[g] || 0), 0);
    return Math.max(m, 0.05);
  }

  /* ── Fixed-height canvas ───────────────────────────────────── */
  function mkCanvas(id, h) {
    const c = document.createElement('canvas');
    c.id = id;
    c.setAttribute('height', h);
    c.style.cssText = 'width:100%;display:block;max-height:' + h + 'px;flex:1;';
    return c;
  }

  /* ── Fixed-height card ─────────────────────────────────────── */
  function mkCard(h, extra) {
    const d = document.createElement('div');
    Object.assign(d.style, {
      background:    C.white,
      border:        '1px solid ' + C.border,
      borderRadius:  '2px',
      padding:       '6px 10px 4px',
      overflow:      'hidden',
      height:        h + 'px',
      boxSizing:     'border-box',
      display:       'flex',
      flexDirection: 'column',
      ...(extra || {}),
    });
    return d;
  }

  function chartTitle(text) {
    const d = document.createElement('div');
    Object.assign(d.style, {
      fontSize:     '0.72rem',
      fontWeight:   '700',
      color:        C.text,
      marginBottom: '3px',
      flexShrink:   '0',
      lineHeight:   '1.3',
      whiteSpace:   'pre-line',
    });
    d.textContent = text;
    return d;
  }

  /* ── Build everything ──────────────────────────────────────── */
  function build(root) {
    destroyAll();
    root.innerHTML = '';

    const W = root.offsetWidth || 800;
    const isMobile = W < 520;

    /* Outer wrapper */
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      fontFamily: 'Calibri, Arial, sans-serif',
      width:      '100%',
      boxSizing:  'border-box',
      display:    'flex',
      flexDirection: 'column',
      background: C.white,
    });
    root.appendChild(wrap);

    /* ── Green header */
    const hdr = document.createElement('div');
    Object.assign(hdr.style, {
      background: C.headerBg,
      padding:    '10px 16px',
      textAlign:  'center',
    });
    hdr.innerHTML = '<span style="font-size:1.3rem;font-weight:700;color:' + C.headerText + ';">Bike Sales Dashboard</span>';
    wrap.appendChild(hdr);

    /* ── Body: slicer panel + chart grid */
    const body = document.createElement('div');
    Object.assign(body.style, {
      display:    'flex',
      flex:       '1',
      gap:        '0',
      minHeight:  '0',
    });
    wrap.appendChild(body);

    /* ── Left slicer panel ─────────────────────────────────── */
    const slicerPanel = document.createElement('div');
    const SLICER_W = isMobile ? 90 : 120;
    Object.assign(slicerPanel.style, {
      width:         SLICER_W + 'px',
      minWidth:      SLICER_W + 'px',
      background:    C.slicerBg,
      borderRight:   '1px solid ' + C.border,
      padding:       '6px 4px',
      overflowY:     'auto',
      boxSizing:     'border-box',
      display:       'flex',
      flexDirection: 'column',
      gap:           '6px',
    });
    body.appendChild(slicerPanel);

    const SLICERS = [
      { key:'gender',    label:'Gender',        opts:['Female','Male'] },
      { key:'marital',   label:'Marital Status', opts:['Married','Single'] },
      { key:'homeowner', label:'Home Owner',     opts:['No','Yes'] },
      { key:'education', label:'Education',      opts:['Bachelors','Graduate Degree','High School','Partial College','Partial High School'] },
      { key:'region',    label:'Region',         opts:['Europe','North America','Pacific'] },
    ];

    SLICERS.forEach(slicer => {
      const group = document.createElement('div');

      /* Header */
      const shdr = document.createElement('div');
      Object.assign(shdr.style, {
        background:   C.slicerHdr,
        padding:      '3px 5px',
        fontSize:     '0.65rem',
        fontWeight:   '700',
        color:        C.text,
        borderRadius: '2px 2px 0 0',
        display:      'flex',
        alignItems:   'center',
        gap:          '4px',
      });
      shdr.innerHTML = slicer.label + ' <span style="font-size:0.55rem;color:' + C.muted + ';">&#9745; &#9663;</span>';
      group.appendChild(shdr);

      /* Options */
      slicer.opts.forEach(opt => {
        const btn = document.createElement('div');
        const isActive = active[slicer.key].has(opt);
        Object.assign(btn.style, {
          padding:      '3px 6px',
          fontSize:     '0.65rem',
          cursor:       'pointer',
          background:   isActive ? C.slicerSel : C.white,
          borderLeft:   '1px solid ' + C.border,
          borderRight:  '1px solid ' + C.border,
          borderBottom: '1px solid ' + C.border,
          color:        C.text,
          userSelect:   'none',
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
        });
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          if (active[slicer.key].has(opt)) {
            active[slicer.key].delete(opt);
          } else {
            active[slicer.key].add(opt);
          }
          build(root);
        });
        group.appendChild(btn);
      });

      slicerPanel.appendChild(group);
    });

    /* ── Chart area ───────────────────────────────────────── */
    const chartArea = document.createElement('div');
    Object.assign(chartArea.style, {
      flex:    '1',
      padding: '6px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gridTemplateRows:    isMobile ? 'auto' : '1fr 1fr',
      gap:     '6px',
      boxSizing:'border-box',
      minWidth: '0',
    });
    body.appendChild(chartArea);

    const CHART_H = isMobile ? 150 : 185;
    const CV_H    = CHART_H - 36;
    const mult    = getMult('general');

    /* ── Chart 1: Avg Income Per Purchase (grouped bar) ─────── */
    {
      const card = mkCard(CHART_H);
      card.appendChild(chartTitle('Average Income Per Purchase'));
      const cv = mkCanvas('xls-income', CV_H);
      card.appendChild(cv);
      chartArea.appendChild(card);

      /* Filter income by gender if gender slicer active */
      const genders = active.gender.size ? [...active.gender] : ['Female', 'Male'];
      const labels  = genders;
      const noData  = genders.map(g => Math.round(RAW.income[g].No * getMult('income')));
      const yesData = genders.map(g => Math.round(RAW.income[g].Yes * getMult('income')));

      charts['income'] = new Chart(cv.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label:'No',  data: noData,  backgroundColor: C.no,  borderWidth:0, barPercentage:0.8 },
            { label:'Yes', data: yesData, backgroundColor: C.yes, borderWidth:0, barPercentage:0.8 },
          ],
        },
        options: {
          responsive: false,
          animation:  false,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display:  true,
              position: 'right',
              labels:   { font:{size:9}, boxWidth:12, padding:4 },
            },
            tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': $' + ctx.raw.toLocaleString() } },
          },
          scales: {
            x: {
              grid:   { display:false },
              ticks:  { font:{size:9}, color:C.text },
              title:  { display:true, text:'Gender', font:{size:9}, color:C.muted },
              border: { display:false },
            },
            y: {
              min:    48000,
              ticks:  { font:{size:9}, color:C.muted, callback: v => '$' + v.toLocaleString(), maxTicksLimit:5 },
              grid:   { color: C.grid },
              border: { color:'rgba(0,0,0,0.15)' },
              title:  { display:true, text:'Income', font:{size:9}, color:C.muted },
            },
          },
        },
        plugins: [{
          afterDatasetsDraw(chart) {
            const ctx2 = chart.ctx;
            chart.data.datasets.forEach((ds, di) => {
              const meta = chart.getDatasetMeta(di);
              meta.data.forEach((bar, i) => {
                const val = ds.data[i];
                ctx2.save();
                ctx2.font = '8px Calibri';
                ctx2.fillStyle = C.text;
                ctx2.textAlign = 'center';
                ctx2.fillText('$' + val.toLocaleString(), bar.x, bar.y - 3);
                ctx2.restore();
              });
            });
          },
        }],
      });
    }

    /* ── Chart 2: Customer Age Brackets (line chart) ─────────── */
    {
      const card = mkCard(CHART_H);
      card.appendChild(chartTitle('Customer Age Brackets'));
      const cv = mkCanvas('xls-age', CV_H);
      card.appendChild(cv);
      chartArea.appendChild(card);

      const ages    = Object.keys(RAW.age);
      const noData  = ages.map(a => Math.round(RAW.age[a].No  * mult));
      const yesData = ages.map(a => Math.round(RAW.age[a].Yes * mult));

      charts['age'] = new Chart(cv.getContext('2d'), {
        type: 'line',
        data: {
          labels: ages,
          datasets: [
            { label:'No',  data:noData,  borderColor:C.no,  backgroundColor:'transparent', pointRadius:5, pointBackgroundColor:C.no,  tension:0, borderWidth:2 },
            { label:'Yes', data:yesData, borderColor:C.yes, backgroundColor:'transparent', pointRadius:5, pointBackgroundColor:C.yes, tension:0, borderWidth:2 },
          ],
        },
        options: {
          responsive: false,
          animation:  false,
          maintainAspectRatio: false,
          plugins: {
            legend: { display:true, position:'right', labels:{ font:{size:9}, boxWidth:12, padding:4 } },
          },
          scales: {
            x: {
              grid:   { display:false },
              ticks:  { font:{size:9}, color:C.text },
              title:  { display:true, text:'Age Bracket', font:{size:9}, color:C.muted },
              border: { display:false },
            },
            y: {
              min: 0,
              grid:   { color: C.grid },
              ticks:  { font:{size:9}, color:C.muted, maxTicksLimit:5 },
              border: { color:'rgba(0,0,0,0.15)' },
            },
          },
        },
      });
    }

    /* ── Chart 3: Customer Commute (line chart) ────────────── */
    {
      const card = mkCard(CHART_H);
      card.appendChild(chartTitle('Customer Commute'));
      const cv = mkCanvas('xls-commute', CV_H);
      card.appendChild(cv);
      chartArea.appendChild(card);

      const bands   = Object.keys(RAW.commute);
      const noData  = bands.map(b => Math.round(RAW.commute[b].No  * mult));
      const yesData = bands.map(b => Math.round(RAW.commute[b].Yes * mult));

      charts['commute'] = new Chart(cv.getContext('2d'), {
        type: 'line',
        data: {
          labels: bands,
          datasets: [
            { label:'No',  data:noData,  borderColor:C.no,  backgroundColor:'transparent', pointRadius:4, pointBackgroundColor:C.no,  tension:0.1, borderWidth:2 },
            { label:'Yes', data:yesData, borderColor:C.yes, backgroundColor:'transparent', pointRadius:4, pointBackgroundColor:C.yes, tension:0.1, borderWidth:2 },
          ],
        },
        options: {
          responsive: false,
          animation:  false,
          maintainAspectRatio: false,
          plugins: {
            legend: { display:true, position:'right', labels:{ font:{size:9}, boxWidth:12, padding:4 } },
          },
          scales: {
            x: {
              grid:   { display:false },
              ticks:  { font:{size:9}, color:C.text },
              title:  { display:true, text:'Commute Distance', font:{size:9}, color:C.muted },
              border: { display:false },
            },
            y: {
              min: 0,
              grid:   { color: C.grid },
              ticks:  { font:{size:9}, color:C.muted, maxTicksLimit:5 },
              border: { color:'rgba(0,0,0,0.15)' },
            },
          },
        },
      });
    }

    /* ── Chart 4: Bikes by Occupation + Car Ownership (stacked) */
    {
      const card = mkCard(CHART_H);
      card.appendChild(chartTitle('Bikes sold by Customer Occupation\n(with Car Ownership data)'));
      const cv = mkCanvas('xls-occ', CV_H - 8);
      card.appendChild(cv);
      chartArea.appendChild(card);

      const occs = Object.keys(RAW.occupation);

      /* Build stacked datasets per car count (0..4) */
      const maxCars = 4;
      const datasets = [];
      for (let car = 0; car <= maxCars; car++) {
        const data = occs.map(occ => {
          const carData = RAW.occupation[occ][car];
          if (!carData) return 0;
          return Math.round((carData.No + carData.Yes) * mult);
        });
        datasets.push({
          label:           '' + car,
          data,
          backgroundColor: C.cars[car] || '#999',
          borderWidth:     0,
          stack:           'stack',
        });
      }

      charts['occ'] = new Chart(cv.getContext('2d'), {
        type: 'bar',
        data: { labels: occs, datasets },
        options: {
          responsive: false,
          animation:  false,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display:  true,
              position: 'right',
              title:    { display:true, text:'Cars', font:{size:9} },
              labels:   { font:{size:9}, boxWidth:12, padding:4 },
            },
            tooltip: {
              callbacks: {
                label: ctx => 'Cars ' + ctx.dataset.label + ': ' + ctx.raw,
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              grid:    { display:false },
              ticks:   { font:{size:9}, color:C.text },
              title:   { display:true, text:'Occupation', font:{size:9}, color:C.muted },
              border:  { display:false },
            },
            y: {
              stacked: true,
              min:     0,
              grid:    { color: C.grid },
              ticks:   { font:{size:9}, color:C.muted, maxTicksLimit:5 },
              border:  { color:'rgba(0,0,0,0.15)' },
            },
          },
        },
      });
    }
  }

  /* ── Mount + ResizeObserver (width-only) ───────────────────── */
  function init(root) {
    build(root);
    let lastW = root.offsetWidth;
    const ro = new ResizeObserver(entries => {
      const newW = Math.round(entries[0].contentRect.width);
      if (Math.abs(newW - lastW) > 20) {
        lastW = newW;
        build(root);
      }
    });
    ro.observe(root);
  }

  function waitForChartJS(cb, tries) {
    tries = tries || 0;
    if (window.Chart) return cb();
    if (tries > 40) return;
    setTimeout(() => waitForChartJS(cb, tries + 1), 150);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('excel-bike-dashboard');
    if (root) waitForChartJS(() => init(root));
  });
  if (document.readyState !== 'loading') {
    const root = document.getElementById('excel-bike-dashboard');
    if (root) waitForChartJS(() => init(root));
  }
})();
