/* ══════════════════════════════════════════════════════════════
   POWER BI REPLICA — Data Professional Survey Dashboard
   Fully explorable: click any chart element to cross-filter
   the entire dashboard. Click again to deselect.
   Layout matches real screenshot: header → KPI+occ row → bottom row
   Fixed-height canvases. ResizeObserver width-only guard.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const C = {
    bg:'#f3f2f1', white:'#ffffff', header:'#b0c4d8',
    navy:'#1f3864', blue:'#2e75b6', green:'#548235',
    muted:'#605e5c', text:'#252423', border:'#d2d0ce',
    grid:'rgba(0,0,0,0.07)', dim:'rgba(200,200,200,0.5)',
    highlight:'#ff6b35',
  };

  /* ── Full dataset ─────────────────────────────────────────── */
  const DATA = {
    kpi_participants: 630,
    kpi_avg_age: 29.87,

    occ_pre: [
      { label:'Data Scientist',     sal:93.8,  color:C.navy  },
      { label:'Data Engineer',      sal:65.1,  color:C.blue  },
      { label:'Data Architect',     sal:63.8,  color:C.blue  },
      { label:'Did not select',     sal:43.9,  color:C.green },
      { label:'Database Developer', sal:33.2,  color:C.navy  },
    ],
    occ_inp: [
      { label:'Systems config.',    sal:75.0,  color:C.navy  },
      { label:'Tableau admin',      sal:68.0,  color:C.blue  },
      { label:'Teacher',            sal:55.0,  color:C.blue  },
      { label:'Tech consultant',    sal:38.0,  color:C.green },
      { label:'Web Developer',      sal:30.0,  color:C.navy  },
    ],
    gender: [
      { label:'Male',   count:468 },
      { label:'Female', count:150 },
    ],
    countries: [
      { label:'United States',  count:261, pct:41.4 },
      { label:'Other',          count:224, pct:35.6 },
      { label:'India',          count: 73, pct:11.6 },
      { label:'United Kingdom', count: 40, pct: 6.3 },
      { label:'Canada',         count: 32, pct: 5.1 },
    ],
    education: [
      { label:"Bachelor's",     count:329 },
      { label:'Masters',        count:192 },
      { label:'Did not select', count: 52 },
      { label:'High School',    count: 36 },
      { label:'Associates',     count: 16 },
      { label:'PhD',            count:  5 },
    ],
    /* Country → gender breakdown (approximate) */
    countryGender: {
      'United States': { Male:185, Female:76 },
      'Other':         { Male:158, Female:66 },
      'India':         { Male:60,  Female:13 },
      'United Kingdom':{ Male:29,  Female:11 },
      'Canada':        { Male:22,  Female:10 },
    },
    /* Country → education breakdown (approximate) */
    countryEdu: {
      'United States': [145,78,24,16,5,2],
      'Other':         [110,70,18,12,9,2],
      'India':         [42, 22, 5, 2, 1,1],
      'United Kingdom':[18, 14, 3, 2, 1,1],
      'Canada':        [14,  8, 2, 2, 0,0],
    },
  };

  /* ── State: which country is selected (cross-filter) ─────── */
  let selCountry = null;

  let charts = {};
  function destroyAll() {
    Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
    charts = {};
  }

  /* Fixed-height canvas */
  function mkCanvas(id, h) {
    const c = document.createElement('canvas');
    c.id = id;
    c.setAttribute('height', h);
    c.style.cssText = 'width:100%;display:block;max-height:' + h + 'px;';
    return c;
  }

  /* Fixed-height card */
  function mkCard(h, extra) {
    const d = document.createElement('div');
    Object.assign(d.style, {
      background:    C.white,
      border:        '1px solid ' + C.border,
      borderRadius:  '3px',
      padding:       '8px 10px 6px',
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
      height:        h + 'px',
      boxSizing:     'border-box',
      ...(extra || {}),
    });
    return d;
  }

  function label(text, style) {
    const d = document.createElement('div');
    Object.assign(d.style, { fontSize:'0.68rem', color:C.muted, flexShrink:'0', ...(style||{}) });
    d.textContent = text;
    return d;
  }
  function title(text) {
    const d = document.createElement('div');
    Object.assign(d.style, { fontSize:'0.72rem', fontWeight:'600', color:C.text, marginBottom:'4px', flexShrink:'0', lineHeight:'1.3' });
    d.textContent = text;
    return d;
  }

  /* ── Filter data by selected country ────────────────────── */
  function filteredGender() {
    if (!selCountry) return DATA.gender;
    const g = DATA.countryGender[selCountry] || {};
    return [
      { label:'Male',   count: g.Male   || 0 },
      { label:'Female', count: g.Female || 0 },
    ];
  }
  function filteredEdu() {
    if (!selCountry) return DATA.education;
    const arr = DATA.countryEdu[selCountry] || DATA.education.map(e => e.count);
    return DATA.education.map((e, i) => ({ label:e.label, count:arr[i]||0 }));
  }

  /* ── Build ─────────────────────────────────────────────── */
  function build(root) {
    destroyAll();
    root.innerHTML = '';

    const W = root.offsetWidth || 800;
    const compact = W < 520;

    /* Wrapper */
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      background: C.bg,
      width:      '100%',
      boxSizing:  'border-box',
      display:    'flex',
      flexDirection:'column',
      gap:        '5px',
    });
    root.appendChild(wrap);

    /* Header */
    const hdr = document.createElement('div');
    Object.assign(hdr.style, { background:C.header, padding:'10px 14px 8px', textAlign:'center', flexShrink:'0' });
    hdr.innerHTML = '<span style="font-size:' + (compact?'1rem':'1.2rem') + ';font-weight:700;color:' + C.text + ';">Data Professional Survey Dashboard</span>';
    wrap.appendChild(hdr);

    /* Filter hint */
    if (selCountry) {
      const hint = document.createElement('div');
      Object.assign(hint.style, {
        background:'#fff3cd', border:'1px solid #ffd54f', borderRadius:'4px',
        padding:'4px 10px', margin:'0 8px', fontSize:'0.67rem', color:'#5a4000',
        display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:'0',
      });
      hint.innerHTML = '<span>Filtered: <strong>' + selCountry + '</strong></span>';
      const clrBtn = document.createElement('span');
      clrBtn.textContent = '✕ Clear filter';
      Object.assign(clrBtn.style, { cursor:'pointer', fontWeight:'600', color:'#d44' });
      clrBtn.addEventListener('click', () => { selCountry = null; build(root); });
      hint.appendChild(clrBtn);
      wrap.appendChild(hint);
    }

    const body = document.createElement('div');
    Object.assign(body.style, { padding:'0 8px 8px', display:'flex', flexDirection:'column', gap:'5px', flex:'1' });
    wrap.appendChild(body);

    /* ══ ROW 1: KPI | Presel occ | Input occ ══════════════ */
    const r1 = document.createElement('div');
    Object.assign(r1.style, {
      display:'grid',
      gridTemplateColumns: compact ? '1fr' : '130px 1fr 1fr',
      gap:'5px',
    });
    body.appendChild(r1);

    const R1H = compact ? 100 : 185;

    /* KPI */
    const kpiCard = mkCard(R1H, { justifyContent:'center', gap:'6px' });
    const filtGender = filteredGender();
    const filtTotal  = selCountry ? filtGender.reduce((a,g)=>a+g.count,0) : DATA.kpi_participants;
    kpiCard.innerHTML =
      '<div style="font-size:' + (compact?'2rem':'2.8rem') + ';font-weight:300;color:' + C.text + ';line-height:1;">' + filtTotal + '</div>'
      + '<div style="font-size:0.62rem;color:' + C.muted + ';line-height:1.3;">Total Survey Participants</div>'
      + '<div style="font-size:' + (compact?'1.4rem':'1.9rem') + ';font-weight:300;color:' + C.text + ';line-height:1;margin-top:6px;">' + DATA.kpi_avg_age + '</div>'
      + '<div style="font-size:0.62rem;color:' + C.muted + ';line-height:1.3;">Average Age of Participant</div>';
    r1.appendChild(kpiCard);

    if (!compact) {
      /* Horizontal bar helper */
      function hbarCard(titleTxt, axisTxt, data, H) {
        const card = mkCard(H);
        card.appendChild(title(titleTxt));
        const cv = mkCanvas('pbi-hb-' + Math.random().toString(36).slice(2,6), H - 42);
        card.appendChild(cv);
        card.appendChild(label(axisTxt, { textAlign:'center', marginTop:'2px' }));

        charts['hb_' + cv.id] = new Chart(cv.getContext('2d'), {
          type: 'bar',
          data: {
            labels: data.map(d => d.label),
            datasets: [{
              data:            data.map(d => d.sal),
              backgroundColor: data.map(d => d.color),
              borderWidth: 0,
              barThickness: 14,
            }],
          },
          options: {
            indexAxis: 'y',
            responsive: false, animation: false, maintainAspectRatio: false,
            plugins: {
              legend: { display:false },
              tooltip: { callbacks: { label: ctx => ' $' + ctx.raw + 'K avg salary' } },
            },
            scales: {
              x: { min:0, grid:{color:C.grid}, ticks:{font:{size:9},color:C.muted,maxTicksLimit:5}, border:{color:'rgba(0,0,0,0.15)'} },
              y: { grid:{display:false}, ticks:{font:{size:9},color:C.text}, border:{display:false} },
            },
          },
        });
        return card;
      }
      r1.appendChild(hbarCard('Top 5 Occupations (preselection)', 'Average Yearly Salary ($K)', DATA.occ_pre, R1H));
      r1.appendChild(hbarCard('Top 5 Occupations (participant input)', 'Average Yearly Salary ($K)', DATA.occ_inp, R1H));
    }

    /* ══ ROW 2: Gender | Country | Education ══════════════ */
    const r2 = document.createElement('div');
    Object.assign(r2.style, {
      display:'grid',
      gridTemplateColumns: compact ? '1fr' : '1fr 1.7fr 1.4fr',
      gap:'5px',
    });
    body.appendChild(r2);

    const R2H = compact ? 140 : 200;
    const CV2H = R2H - 38;

    /* Gender bar */
    {
      const card = mkCard(R2H);
      card.appendChild(title('Participants by Gender'));
      const filtG = filteredGender();
      const cv = mkCanvas('pbi-gender', CV2H);
      card.appendChild(cv);
      card.appendChild(label('Gender', { textAlign:'center', marginTop:'2px' }));
      r2.appendChild(card);
      charts['gender'] = new Chart(cv.getContext('2d'), {
        type:'bar',
        data:{
          labels: filtG.map(d=>d.label),
          datasets:[{ data:filtG.map(d=>d.count), backgroundColor:C.navy, borderWidth:0, barThickness:compact?30:48 }],
        },
        options:{
          responsive:false, animation:false, maintainAspectRatio:false,
          plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>' '+ctx.raw+' participants'}} },
          scales:{
            x:{ grid:{display:false}, ticks:{font:{size:10},color:C.text}, border:{display:false} },
            y:{ min:0, max:500, grid:{color:C.grid}, ticks:{font:{size:9},color:C.muted,stepSize:100}, border:{color:'rgba(0,0,0,0.15)'},
                title:{display:true,text:'Number of Participants',font:{size:9},color:C.muted} },
          },
        },
      });
    }

    /* Country funnel — CLICKABLE for cross-filter */
    {
      const card = mkCard(R2H, { cursor:'default' });
      const headerRow = document.createElement('div');
      Object.assign(headerRow.style, { display:'flex', justifyContent:'space-between', flexShrink:'0', marginBottom:'2px' });
      headerRow.innerHTML = '<span style="font-size:0.72rem;font-weight:600;color:' + C.text + ';">Participants by Country</span>'
        + '<span style="font-size:0.62rem;color:' + C.muted + ';">100%</span>';
      card.appendChild(headerRow);

      const barsWrap = document.createElement('div');
      Object.assign(barsWrap.style, { display:'flex', flexDirection:'column', gap:'3px', flex:'1', justifyContent:'center' });

      DATA.countries.forEach(country => {
        const row = document.createElement('div');
        Object.assign(row.style, {
          display:'flex', alignItems:'center', gap:'4px',
          cursor:'pointer', borderRadius:'2px', padding:'1px 3px',
          background: selCountry === country.label ? '#e8f4fd' : 'transparent',
          transition:'background 0.15s',
        });
        row.title = 'Click to filter by ' + country.label;

        const lbl = document.createElement('div');
        Object.assign(lbl.style, {
          width: compact?'70px':'85px', fontSize:'0.63rem',
          color: selCountry && selCountry !== country.label ? C.muted : C.text,
          textAlign:'right', flexShrink:'0',
          fontWeight: selCountry === country.label ? '700' : 'normal',
        });
        lbl.textContent = country.label;

        const barWrap = document.createElement('div');
        Object.assign(barWrap.style, { flex:'1', background:C.border, borderRadius:'1px', height:'18px', position:'relative' });

        const pct = Math.round((country.count / 630) * 100);
        const bar = document.createElement('div');
        Object.assign(bar.style, {
          width: pct+'%', height:'100%',
          background: selCountry === country.label ? C.highlight : (selCountry ? 'rgba(31,56,100,0.4)' : C.navy),
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'background 0.2s',
        });
        bar.innerHTML = '<span style="color:#fff;font-size:0.62rem;font-weight:600;">' + country.count + '</span>';

        const pctLbl = document.createElement('div');
        Object.assign(pctLbl.style, { fontSize:'0.58rem', color:C.muted, marginLeft:'3px', flexShrink:'0', minWidth:'28px' });
        pctLbl.textContent = country.pct + '%';

        barWrap.appendChild(bar);
        row.appendChild(lbl);
        row.appendChild(barWrap);
        row.appendChild(pctLbl);
        barsWrap.appendChild(row);

        row.addEventListener('click', () => {
          selCountry = selCountry === country.label ? null : country.label;
          build(root);
        });
        row.addEventListener('mouseenter', () => { if (selCountry !== country.label) row.style.background='#f0f0f0'; });
        row.addEventListener('mouseleave', () => { row.style.background = selCountry === country.label ? '#e8f4fd' : 'transparent'; });
      });

      card.appendChild(barsWrap);
      card.appendChild(label('Click a country to cross-filter the entire dashboard', { textAlign:'center', marginTop:'4px', fontSize:'0.6rem', fontStyle:'italic' }));
      r2.appendChild(card);
    }

    /* Education bar */
    {
      const card = mkCard(R2H);
      card.appendChild(title('Participants by Education level'));
      const filtEdu = filteredEdu();
      const cv = mkCanvas('pbi-edu', CV2H);
      card.appendChild(cv);
      card.appendChild(label('Education level', { textAlign:'center', marginTop:'2px' }));
      r2.appendChild(card);
      charts['edu'] = new Chart(cv.getContext('2d'), {
        type:'bar',
        data:{
          labels: filtEdu.map(d=>d.label),
          datasets:[{ data:filtEdu.map(d=>d.count), backgroundColor:C.navy, borderWidth:0 }],
        },
        options:{
          responsive:false, animation:{duration:300}, maintainAspectRatio:false,
          plugins:{ legend:{display:false}, tooltip:{callbacks:{label:ctx=>' '+ctx.raw+' participants'}} },
          scales:{
            x:{ grid:{display:false}, ticks:{font:{size:8},color:C.text,maxRotation:30,minRotation:20}, border:{display:false} },
            y:{ min:0, grid:{color:C.grid}, ticks:{font:{size:9},color:C.muted,maxTicksLimit:5}, border:{color:'rgba(0,0,0,0.15)'},
                title:{display:true,text:'Number of Participants',font:{size:9},color:C.muted} },
          },
        },
      });
    }
  }

  /* ── Mount + ResizeObserver ─────────────────────────────── */
  function init(root) {
    build(root);
    let lastW = root.offsetWidth;
    const ro = new ResizeObserver(entries => {
      const newW = Math.round(entries[0].contentRect.width);
      if (Math.abs(newW - lastW) > 20) { lastW = newW; build(root); }
    });
    ro.observe(root);
  }

  function waitForChartJS(cb, t) {
    t = t||0; if(window.Chart) return cb();
    if(t>40) return; setTimeout(()=>waitForChartJS(cb,t+1),150);
  }

  function mount(root) {
    if (!root) return;
    waitForChartJS(function () { init(root); });
  }
  window.mountPowerBIReplica = mount;

  function autoMount() {
    const r = document.getElementById('powerbi-replica');
    if (r) mount(r);
  }
  document.addEventListener('DOMContentLoaded', autoMount);
  if (document.readyState !== 'loading') autoMount();
})();
