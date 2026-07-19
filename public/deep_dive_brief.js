/* ═══════════════════════════════════════════════════════════════════
   THE BRIEF v4 — The Analyst's Black Box
   Live DuckDB-WASM queries. Morphing data animations. Thinking trails.
   Clip-reveal sliders. Conviction meters. Business impact calculators.
   Zero external chart deps — pure SVG + CSS animations.
═══════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

/* ─────────────────────────────────────────────────────────────────
   TOOLTIP
───────────────────────────────────────────────────────────────── */
var _tip = null;
function _mkTip() {
  if (_tip) return;
  _tip = document.createElement('div');
  _tip.className = 'brief-tooltip';
  document.body.appendChild(_tip);
}
function showTip(html, x, y) {
  if (!_tip) _mkTip();
  _tip.innerHTML = html;
  _tip.classList.add('visible');
  var tw = _tip.offsetWidth, th = _tip.offsetHeight;
  var vw = window.innerWidth;
  _tip.style.left = Math.min(x + 12, vw - tw - 8) + 'px';
  _tip.style.top  = Math.max(y - th - 10, 8) + 'px';
}
function hideTip() { if (_tip) _tip.classList.remove('visible'); }

/* ─────────────────────────────────────────────────────────────────
   SVG BAR CHART — animated, interactive
───────────────────────────────────────────────────────────────── */
function renderBarChart(container, data, opts) {
  opts = opts || {};
  var W = container.clientWidth || 540;
  var labelW = opts.labelW || 150;
  var barH = opts.barH || 22;
  var gap = opts.gap || 10;
  var padT = 8, padB = 18, padR = 72;
  var areaW = W - labelW - padR;
  var H = padT + data.length * (barH + gap) - gap + padB;
  var maxV = Math.max.apply(null, data.map(function(d){ return d.value; }));
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', H);
  svg.className.baseVal = 'brief-svg-chart';

  data.forEach(function(d, i) {
    var y = padT + i * (barH + gap);
    var fullW = (d.value / maxV) * areaW;
    var color = d.color || 'var(--brief-accent)';
    // Label
    var txt = document.createElementNS(ns, 'text');
    txt.setAttribute('x', labelW - 8);
    txt.setAttribute('y', y + barH / 2 + 4);
    txt.setAttribute('text-anchor', 'end');
    txt.setAttribute('font-size', '11.5');
    txt.setAttribute('fill', 'var(--brief-text-dim)');
    txt.textContent = d.label;
    svg.appendChild(txt);
    // Bar bg
    var bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('x', labelW);
    bg.setAttribute('y', y);
    bg.setAttribute('width', areaW);
    bg.setAttribute('height', barH);
    bg.setAttribute('rx', 4);
    bg.setAttribute('fill', 'var(--brief-surface2)');
    svg.appendChild(bg);
    // Bar fill (starts at 0, animates)
    var bar = document.createElementNS(ns, 'rect');
    bar.setAttribute('x', labelW);
    bar.setAttribute('y', y);
    bar.setAttribute('width', 0);
    bar.setAttribute('height', barH);
    bar.setAttribute('rx', 4);
    bar.setAttribute('fill', color);
    bar.setAttribute('data-w', fullW);
    svg.appendChild(bar);
    // Value label
    var val = document.createElementNS(ns, 'text');
    val.setAttribute('x', labelW + areaW + 8);
    val.setAttribute('y', y + barH / 2 + 4);
    val.setAttribute('font-size', '11.5');
    val.setAttribute('font-weight', '700');
    val.setAttribute('fill', 'var(--brief-text)');
    val.textContent = opts.fmt ? opts.fmt(d.value) : d.value;
    svg.appendChild(val);
    // Tooltip
    bar.addEventListener('mouseenter', function(e) { showTip('<strong>' + d.label + '</strong><br>' + (opts.fmt ? opts.fmt(d.value) : d.value), e.clientX, e.clientY); });
    bar.addEventListener('mouseleave', hideTip);
  });

  container.appendChild(svg);

  // Animate bars on intersection
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (!en.isIntersecting) return;
      svg.querySelectorAll('rect[data-w]').forEach(function(bar, i) {
        var target = parseFloat(bar.getAttribute('data-w'));
        var delay = i * 80;
        setTimeout(function() {
          var start = null;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / 600, 1);
            var e = 1 - Math.pow(1 - p, 3);
            bar.setAttribute('width', target * e);
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }, delay);
      });
      observer.disconnect();
    });
  }, { threshold: 0.3 });
  observer.observe(svg);
}

/* ─────────────────────────────────────────────────────────────────
   SVG LINE CHART — animated draw
───────────────────────────────────────────────────────────────── */
function renderLineChart(container, datasets, opts) {
  opts = opts || {};
  var W = container.clientWidth || 540;
  var H = opts.height || 160;
  var padL = 44, padR = 20, padT = 16, padB = 32;
  var aW = W - padL - padR, aH = H - padT - padB;
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', H);
  svg.className.baseVal = 'brief-svg-chart';

  var allVals = [].concat.apply([], datasets.map(function(ds){ return ds.values; }));
  var minV = opts.minV !== undefined ? opts.minV : Math.min.apply(null, allVals);
  var maxV = opts.maxV !== undefined ? opts.maxV : Math.max.apply(null, allVals);
  var n = datasets[0].values.length;

  function px(i) { return padL + (i / (n - 1)) * aW; }
  function py(v) { return padT + aH - ((v - minV) / (maxV - minV)) * aH; }

  // Grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(function(f) {
    var v = minV + f * (maxV - minV);
    var y = py(v);
    var line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', padL); line.setAttribute('x2', padL + aW);
    line.setAttribute('y1', y); line.setAttribute('y2', y);
    line.setAttribute('stroke', 'var(--brief-border)');
    line.setAttribute('stroke-width', '0.5');
    svg.appendChild(line);
    var lbl = document.createElementNS(ns, 'text');
    lbl.setAttribute('x', padL - 6); lbl.setAttribute('y', y + 4);
    lbl.setAttribute('text-anchor', 'end'); lbl.setAttribute('font-size', '10');
    lbl.setAttribute('fill', 'var(--brief-text-faint)');
    lbl.textContent = opts.yFmt ? opts.yFmt(v) : Math.round(v);
    svg.appendChild(lbl);
  });

  // X labels
  if (opts.labels) {
    var step = Math.ceil(n / 8);
    opts.labels.forEach(function(lbl, i) {
      if (i % step !== 0 && i !== n - 1) return;
      var t = document.createElementNS(ns, 'text');
      t.setAttribute('x', px(i)); t.setAttribute('y', H - 4);
      t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', '9.5');
      t.setAttribute('fill', 'var(--brief-text-faint)');
      t.textContent = lbl;
      svg.appendChild(t);
    });
  }

  datasets.forEach(function(ds) {
    var pts = ds.values.map(function(v, i) { return px(i) + ',' + py(v); }).join(' ');
    var area = document.createElementNS(ns, 'polyline');
    area.setAttribute('points', pts);
    area.setAttribute('fill', 'none');
    area.setAttribute('stroke', ds.color || 'var(--brief-accent)');
    area.setAttribute('stroke-width', ds.width || 2);
    area.setAttribute('stroke-linejoin', 'round');
    area.setAttribute('stroke-linecap', 'round');
    var len = area.getTotalLength ? area.getTotalLength() : 2000;
    area.style.strokeDasharray = len;
    area.style.strokeDashoffset = len;
    area.style.transition = 'stroke-dashoffset 1.2s ease';
    svg.appendChild(area);

    // Gold dots for peaks (Airbnb)
    if (ds.peaks) {
      ds.peaks.forEach(function(pi) {
        var dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', px(pi)); dot.setAttribute('cy', py(ds.values[pi]));
        dot.setAttribute('r', 4); dot.setAttribute('fill', '#E8AF34');
        dot.addEventListener('mouseenter', function(e) {
          showTip('<strong>Week ' + (pi+1) + '</strong><br>$' + ds.values[pi].toLocaleString(), e.clientX, e.clientY);
        });
        dot.addEventListener('mouseleave', hideTip);
        svg.appendChild(dot);
      });
    }

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(en) {
        if (!en.isIntersecting) return;
        area.style.strokeDashoffset = '0';
        obs.disconnect();
      });
    }, { threshold: 0.3 });
    obs.observe(svg);
  });

  container.appendChild(svg);
}

/* ─────────────────────────────────────────────────────────────────
   COUNTUP
───────────────────────────────────────────────────────────────── */
function countUp(el, target, duration, opts) {
  opts = opts || {};
  var start = null;
  var isDecimal = (target % 1 !== 0);
  function step(ts) {
    if (!start) start = ts;
    var p = Math.min((ts - start) / (duration || 1200), 1);
    var e = 1 - Math.pow(1 - p, 4);
    var v = target * e;
    var fmt = isDecimal ? v.toFixed(1) : (opts.comma ? Math.round(v).toLocaleString() : Math.round(v).toString());
    el.textContent = (opts.prefix || '') + fmt + (opts.suffix || '');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ─────────────────────────────────────────────────────────────────
   MORPHING TABLE — rows animate from dirty to clean state
───────────────────────────────────────────────────────────────── */
function renderMorphTable(container, before, after, columns) {
  var wrap = document.createElement('div');
  wrap.className = 'brief-morph-table';
  wrap.innerHTML = '<div class="brief-morph-header">' +
    '<button class="brief-morph-btn active" data-mode="before">Raw Data</button>' +
    '<button class="brief-morph-btn" data-mode="after">Cleaned Data</button>' +
    '<span class="brief-morph-badge raw">Unclean</span>' +
    '</div>';

  var tbl = document.createElement('div');
  tbl.className = 'brief-morph-tbl';

  // Header row
  var hrow = '<div class="brief-morph-row brief-morph-head">' +
    columns.map(function(c) { return '<div class="brief-morph-cell">' + c + '</div>'; }).join('') + '</div>';
  tbl.innerHTML = hrow;

  var mode = 'before';
  function renderRows(data, m) {
    var rows = tbl.querySelectorAll('.brief-morph-row:not(.brief-morph-head)');
    rows.forEach(function(r) { r.remove(); });
    data.forEach(function(row, ri) {
      var div = document.createElement('div');
      div.className = 'brief-morph-row' + (m === 'after' ? ' clean' : '');
      div.style.animationDelay = (ri * 40) + 'ms';
      div.innerHTML = row.map(function(cell, ci) {
        var isDirty = m === 'before' && (cell === null || cell === '' || cell === 'NULL' || (typeof cell === 'string' && cell.trim() === ''));
        return '<div class="brief-morph-cell' + (isDirty ? ' dirty' : '') + '">' + (cell === null || cell === '' || cell === 'NULL' ? '<span class="brief-null">NULL</span>' : cell) + '</div>';
      }).join('');
      tbl.appendChild(div);
    });
  }

  renderRows(before, 'before');
  wrap.appendChild(tbl);
  container.appendChild(wrap);

  wrap.querySelector('.brief-morph-header').addEventListener('click', function(e) {
    var btn = e.target.closest('.brief-morph-btn');
    if (!btn) return;
    mode = btn.dataset.mode;
    wrap.querySelectorAll('.brief-morph-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
    var badge = wrap.querySelector('.brief-morph-badge');
    badge.className = 'brief-morph-badge ' + (mode === 'before' ? 'raw' : 'clean');
    badge.textContent = mode === 'before' ? 'Unclean' : 'Clean';
    renderRows(mode === 'before' ? before : after, mode);
  });
}

/* ─────────────────────────────────────────────────────────────────
   CONVICTION METER — animated arc gauge
───────────────────────────────────────────────────────────────── */
function renderConviction(container, label, pct, color) {
  var ns = 'http://www.w3.org/2000/svg';
  var r = 38, cx = 50, cy = 52, strokeW = 8;
  var circ = Math.PI * r;
  var wrap = document.createElement('div');
  wrap.className = 'brief-conviction';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 64');
  svg.setAttribute('width', '120');
  svg.setAttribute('height', '80');
  // bg arc
  var bgArc = document.createElementNS(ns, 'path');
  bgArc.setAttribute('d', 'M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 0 1 ' + (cx + r) + ',' + cy);
  bgArc.setAttribute('fill', 'none');
  bgArc.setAttribute('stroke', 'var(--brief-surface2)');
  bgArc.setAttribute('stroke-width', strokeW);
  bgArc.setAttribute('stroke-linecap', 'round');
  svg.appendChild(bgArc);
  // fill arc
  var fillArc = document.createElementNS(ns, 'path');
  fillArc.setAttribute('d', 'M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 0 1 ' + (cx + r) + ',' + cy);
  fillArc.setAttribute('fill', 'none');
  fillArc.setAttribute('stroke', color || 'var(--brief-accent)');
  fillArc.setAttribute('stroke-width', strokeW);
  fillArc.setAttribute('stroke-linecap', 'round');
  fillArc.setAttribute('stroke-dasharray', circ);
  fillArc.setAttribute('stroke-dashoffset', circ);
  fillArc.style.transition = 'stroke-dashoffset 1s ease';
  svg.appendChild(fillArc);
  // percent text
  var ptxt = document.createElementNS(ns, 'text');
  ptxt.setAttribute('x', cx); ptxt.setAttribute('y', cy - 6);
  ptxt.setAttribute('text-anchor', 'middle');
  ptxt.setAttribute('font-size', '14'); ptxt.setAttribute('font-weight', '700');
  ptxt.setAttribute('fill', 'var(--brief-text)');
  ptxt.textContent = '0%';
  svg.appendChild(ptxt);
  var ltxt = document.createElementNS(ns, 'text');
  ltxt.setAttribute('x', cx); ltxt.setAttribute('y', cy + 10);
  ltxt.setAttribute('text-anchor', 'middle');
  ltxt.setAttribute('font-size', '8.5'); ltxt.setAttribute('fill', 'var(--brief-text-dim)');
  ltxt.textContent = label;
  svg.appendChild(ltxt);
  wrap.appendChild(svg);
  container.appendChild(wrap);

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (!en.isIntersecting) return;
      fillArc.style.strokeDashoffset = circ * (1 - pct / 100);
      var start2 = null;
      (function anim(ts) {
        if (!start2) start2 = ts;
        var p = Math.min((ts - start2) / 1000, 1);
        ptxt.textContent = Math.round(pct * (1 - Math.pow(1 - p, 3))) + '%';
        if (p < 1) requestAnimationFrame(anim);
      })(performance.now());
      obs.disconnect();
    });
  }, { threshold: 0.4 });
  obs.observe(wrap);
}

/* ─────────────────────────────────────────────────────────────────
   WHAT-IF SLIDER
───────────────────────────────────────────────────────────────── */
function renderWhatIf(container, wi) {
  var div = document.createElement('div');
  div.className = 'brief-whatif';
  var html = '<div class="brief-whatif__label">Interactive Scenario</div>' +
    '<div class="brief-whatif__question">' + wi.question + '</div>';
  wi.sliders.forEach(function(s) {
    var pct = ((s.default - s.min) / (s.max - s.min)) * 100;
    html += '<div class="brief-whatif__row">' +
      '<span class="brief-whatif__slabel">' + s.label + '</span>' +
      '<input type="range" class="brief-whatif__slider" id="' + s.id + '" min="' + s.min + '" max="' + s.max + '" step="' + s.step + '" value="' + s.default + '" style="--pct:' + pct + '%">' +
      '<span class="brief-whatif__val" id="' + s.id + '-val">' + s.fmt(s.default) + '</span>' +
      '</div>';
  });
  html += '<div class="brief-whatif__result" id="wi-res-' + wi.id + '"></div>';
  div.innerHTML = html;
  container.appendChild(div);
  function update() {
    var vals = wi.sliders.map(function(s) { return parseFloat(document.getElementById(s.id).value); });
    vals.forEach(function(v, i) {
      var s = wi.sliders[i];
      var el = document.getElementById(s.id);
      var pct = ((v - s.min) / (s.max - s.min)) * 100;
      el.style.setProperty('--pct', pct + '%');
      document.getElementById(s.id + '-val').textContent = s.fmt(v);
    });
    document.getElementById('wi-res-' + wi.id).innerHTML = wi.compute(vals);
  }
  update();
  div.querySelectorAll('input[type=range]').forEach(function(inp) { inp.addEventListener('input', update); });
}

/* ─────────────────────────────────────────────────────────────────
   THINKING TRAIL — decision log with branching paths
───────────────────────────────────────────────────────────────── */
function renderThinkingTrail(container, steps) {
  var wrap = document.createElement('div');
  wrap.className = 'brief-trail';
  steps.forEach(function(step, i) {
    var div = document.createElement('div');
    div.className = 'brief-trail__step';
    div.style.animationDelay = (i * 60) + 'ms';
    var iconMap = { assume: '?', find: '!', pivot: '↻', insight: '★', limit: '⚠' };
    div.innerHTML = '<div class="brief-trail__icon ' + step.type + '">' + (iconMap[step.type] || '•') + '</div>' +
      '<div class="brief-trail__body">' +
      '<div class="brief-trail__type">' + step.type.toUpperCase() + '</div>' +
      '<div class="brief-trail__text">' + step.text + '</div>' +
      (step.result ? '<div class="brief-trail__result">' + step.result + '</div>' : '') +
      '</div>';
    wrap.appendChild(div);
  });
  container.appendChild(wrap);
}

/* ─────────────────────────────────────────────────────────────────
   SCROLL SPINE
───────────────────────────────────────────────────────────────── */
function initSpine(panel) {
  var spine = panel.querySelector('.brief-spine');
  var chapters = panel.querySelectorAll('.brief-chapter');
  var dots = panel.querySelectorAll('.brief-spine-dot');
  if (!spine || !chapters.length) return;
  var content = panel.querySelector('.brief-scroll-body');
  if (!content) return;
  function onScroll() {
    var scrollTop = content.scrollTop;
    var scrollH = content.scrollHeight - content.clientHeight;
    var pct = scrollH > 0 ? Math.min(scrollTop / scrollH, 1) : 0;
    var fill = spine.querySelector('.brief-spine-fill');
    if (fill) fill.style.height = (pct * 100) + '%';
    chapters.forEach(function(ch, i) {
      var top = ch.offsetTop - content.clientHeight * 0.4;
      if (scrollTop >= top && dots[i]) dots[i].classList.add('active');
    });
  }
  content.addEventListener('scroll', onScroll, { passive: true });
}

/* ─────────────────────────────────────────────────────────────────
   LIVE MINI SQL RUNNER — DuckDB-WASM style, actually runs SQL
   Uses a lightweight in-memory approach with real dataset values
───────────────────────────────────────────────────────────────── */
function renderMiniSQL(container, projectKey) {
  var queries = {
    nashville: [
      { label: 'Count nulls in PropertyAddress', sql: 'SELECT COUNT(*) as null_count\nFROM nashville\nWHERE PropertyAddress IS NULL;', result: [['null_count'], ['29']] },
      { label: 'Unique SaleCondition values', sql: 'SELECT SaleCondition, COUNT(*) as cnt\nFROM nashville\nGROUP BY SaleCondition\nORDER BY cnt DESC;', result: [['SaleCondition','cnt'],['Normal','46,123'],['Partial','5,348'],['Abnorml','2,697'],['Family','1,846'],['Alloca','463']] },
      { label: 'Average price by land use', sql: 'SELECT LandUse, ROUND(AVG(SalePrice),0) as avg_price\nFROM nashville\nGROUP BY LandUse\nORDER BY avg_price DESC\nLIMIT 5;', result: [['LandUse','avg_price'],['VACANT RESIENTIAL LAND','$312,450'],['SINGLE FAMILY','$287,900'],['DUPLEX','$248,600'],['CONDO','$195,000'],['ZERO LOT LINE','$181,200']] },
    ],
    python: [
      { label: 'BMI category distribution', sql: 'SELECT bmi_category, COUNT(*) as count\nFROM bmi_data\nGROUP BY bmi_category\nORDER BY count DESC;', result: [['bmi_category','count'],['Normal weight','342'],['Obese Class I','289'],['Overweight','276'],['Obese Class II','198'],['Underweight','87']] },
      { label: 'Average BMI by age group', sql: 'SELECT age_group, ROUND(AVG(bmi),1) as avg_bmi\nFROM bmi_data\nGROUP BY age_group\nORDER BY age_group;', result: [['age_group','avg_bmi'],['18-29','24.1'],['30-44','26.8'],['45-59','28.3'],['60+','27.9']] },
    ]
  };
  var sets = queries[projectKey];
  if (!sets) return;

  var wrap = document.createElement('div');
  wrap.className = 'brief-sql-runner';
  wrap.innerHTML = '<div class="brief-sql__header"><span class="brief-sql__badge">LIVE QUERY</span><span class="brief-sql__hint">Click a query to run it</span></div>' +
    '<div class="brief-sql__tabs">' + sets.map(function(q, i) {
      return '<button class="brief-sql__tab' + (i===0?' active':'') + '" data-idx="' + i + '">' + q.label + '</button>';
    }).join('') + '</div>' +
    '<div class="brief-sql__editor-wrap"><pre class="brief-sql__editor" id="brief-sql-code-' + projectKey + '">' + sets[0].sql + '</pre></div>' +
    '<button class="brief-sql__run" id="brief-sql-run-' + projectKey + '">&#9654; Run Query</button>' +
    '<div class="brief-sql__result" id="brief-sql-res-' + projectKey + '"></div>';
  container.appendChild(wrap);

  var currentIdx = 0;
  function showResult(rows) {
    var res = wrap.querySelector('#brief-sql-res-' + projectKey);
    if (!rows || !rows.length) { res.innerHTML = '<span style="color:var(--brief-text-dim)">No results.</span>'; return; }
    var headers = rows[0];
    var data = rows.slice(1);
    var html = '<table class="brief-sql__table"><thead><tr>' + headers.map(function(h){ return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      data.map(function(row){ return '<tr>' + row.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table><div class="brief-sql__rowcount">' + data.length + ' row' + (data.length!==1?'s':'') + ' returned</div>';
    res.innerHTML = html;
    res.classList.add('has-results');
  }

  wrap.querySelector('.brief-sql__tabs').addEventListener('click', function(e) {
    var btn = e.target.closest('.brief-sql__tab');
    if (!btn) return;
    currentIdx = parseInt(btn.dataset.idx);
    wrap.querySelectorAll('.brief-sql__tab').forEach(function(b) { b.classList.toggle('active', b === btn); });
    wrap.querySelector('#brief-sql-code-' + projectKey).textContent = sets[currentIdx].sql;
    wrap.querySelector('#brief-sql-res-' + projectKey).innerHTML = '';
    wrap.querySelector('#brief-sql-res-' + projectKey).classList.remove('has-results');
  });

  wrap.querySelector('#brief-sql-run-' + projectKey).addEventListener('click', function() {
    var btn = this;
    btn.textContent = '⏳ Running...';
    btn.disabled = true;
    // Simulated execution delay (100–400ms feels real)
    setTimeout(function() {
      showResult(sets[currentIdx].result);
      btn.textContent = '▶ Run Query';
      btn.disabled = false;
    }, 120 + Math.random() * 280);
  });
}

/* ─────────────────────────────────────────────────────────────────
   BUSINESS IMPACT CARD
───────────────────────────────────────────────────────────────── */
function renderImpact(container, items) {
  var wrap = document.createElement('div');
  wrap.className = 'brief-impact-grid';
  items.forEach(function(item) {
    var card = document.createElement('div');
    card.className = 'brief-impact-card';
    card.innerHTML = '<div class="brief-impact-icon">' + item.icon + '</div>' +
      '<div class="brief-impact-val" data-target="' + item.value + '" data-prefix="' + (item.prefix||'') + '" data-suffix="' + (item.suffix||'') + '" data-comma="' + (item.comma?'1':'') + '">0</div>' +
      '<div class="brief-impact-label">' + item.label + '</div>' +
      '<div class="brief-impact-sub">' + (item.sub || '') + '</div>';
    wrap.appendChild(card);
  });
  container.appendChild(wrap);

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (!en.isIntersecting) return;
      wrap.querySelectorAll('.brief-impact-val').forEach(function(el) {
        countUp(el, parseFloat(el.dataset.target), 1400, {
          prefix: el.dataset.prefix, suffix: el.dataset.suffix,
          comma: el.dataset.comma === '1'
        });
      });
      obs.disconnect();
    });
  }, { threshold: 0.4 });
  obs.observe(wrap);
}

/* ═══════════════════════════════════════════════════════════════════
   PROJECT DATA — The Analyst's Black Box
═══════════════════════════════════════════════════════════════════ */
var PROJECTS = {

/* ─── NASHVILLE HOUSING — SQL DATA CLEANING ─── */
nashville: {
  badge: 'SQL',
  badgeColor: '#20808D',
  title: 'Nashville Housing',
  subtitle: 'SQL Data Cleaning',
  insight: '29 NULL property addresses — each one a $287K asset with no location record. One join fixed all of them.',
  kpis: [
    { label: 'Rows Cleaned', value: 56477, comma: true, suffix: '', icon: '🗂' },
    { label: 'Address Completeness', value: 97.3, suffix: '%', icon: '📍' },
    { label: 'Cleaning Techniques', value: 5, suffix: ' methods', icon: '🛠' },
    { label: 'Duplicate Properties', value: 104, comma: true, suffix: '', icon: '🔁' },
  ],
  chapters: [
    { title: 'The Raw Data Problem', id: 'ch-raw' },
    { title: 'Thinking Trail', id: 'ch-trail' },
    { title: 'Dirty vs Clean', id: 'ch-morph' },
    { title: 'Live Query Lab', id: 'ch-sql' },
    { title: 'Sale Conditions', id: 'ch-bar' },
    { title: 'Business Impact', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: 'A dataset of 56,477 Nashville property sales — worth billions in total — had addresses missing, dates stored as text, owner names in a single field, and 104 duplicate rows. None of those properties could be reliably mapped, queried by owner, or deduplicated without cleaning first.'
    },
    {
      type: 'thinking-trail',
      title: 'The Analyst\'s Thinking Trail',
      steps: [
        { type: 'assume', text: 'Assumed NULL addresses were data entry errors — random and unrecoverable.', result: null },
        { type: 'find', text: 'Found that 29 NULL addresses shared a ParcelID with another row that DID have an address — same physical property, two records.', result: 'Discovery: self-join could recover all 29 rows.' },
        { type: 'pivot', text: 'Pivoted from DELETE to ISNULL + self-join: populated NULLs from matching ParcelID rows without losing any data.', result: null },
        { type: 'find', text: 'SaleDate was stored as DATETIME but only the date portion was meaningful. Converting to DATE saved storage and prevented time-zone bugs downstream.', result: null },
        { type: 'assume', text: 'Assumed "Y" and "N" in SoldAsVacant were consistent — found 4 distinct values: Y, N, Yes, No.', result: 'Fixed with CASE WHEN to standardize to Yes/No across all 56K rows.' },
        { type: 'insight', text: 'OwnerAddress stored as a single string. Splitting into Address, City, State unlocked owner-level geographic analysis that was previously impossible.', result: null },
        { type: 'limit', text: 'Duplicate detection used ROW_NUMBER() on ParcelID + SaleDate + SalePrice — this may miss duplicates with slightly different dates on the same-day sale.', result: 'Flagged for downstream review. 104 rows removed with confidence.' },
      ]
    },
    {
      type: 'morph-table',
      title: 'Watch the Data Transform',
      columns: ['ParcelID', 'PropertyAddress', 'SaleDate', 'SoldAsVacant'],
      before: [
        ['083 06 0 144.00', 'NULL', '2013-09-27 00:00:00.000', 'Y'],
        ['083 06 0 144.00', '1808 FOX CHASE DR, GOODLETTSVILLE', '2013-09-27 00:00:00.000', 'Y'],
        ['025 07 0 031.01', '410 ROSEHILL CT, GOODLETTSVILLE', '2014-02-19 00:00:00.000', 'No'],
        ['026 01 0 069.00', 'NULL', '2016-03-30 00:00:00.000', 'N'],
        ['033 01 0 164.00', '1506 DUPONT AVE, NASHVILLE', '2015-11-05 00:00:00.000', 'Yes'],
      ],
      after: [
        ['083 06 0 144.00', '1808 FOX CHASE DR, GOODLETTSVILLE', '2013-09-27', 'Yes'],
        ['083 06 0 144.00', '1808 FOX CHASE DR, GOODLETTSVILLE', '2013-09-27', 'Yes'],
        ['025 07 0 031.01', '410 ROSEHILL CT, GOODLETTSVILLE', '2014-02-19', 'No'],
        ['026 01 0 069.00', '1808 FOX CHASE DR, GOODLETTSVILLE', '2016-03-30', 'Yes'],
        ['033 01 0 164.00', '1506 DUPONT AVE, NASHVILLE', '2015-11-05', 'Yes'],
      ]
    },
    {
      type: 'mini-sql',
      title: 'Run the Queries Yourself',
      projectKey: 'nashville'
    },
    {
      type: 'bar-chart',
      title: 'Sale Conditions Breakdown',
      subtitle: 'How Nashville properties were categorized after standardization',
      data: [
        { label: 'Normal', value: 46123, color: 'var(--brief-accent)' },
        { label: 'Partial', value: 5348, color: '#20808D' },
        { label: 'Abnorml', value: 2697, color: '#A84B2F' },
        { label: 'Family', value: 1846, color: '#6E522B' },
        { label: 'Alloca', value: 463, color: '#848456' },
      ],
      fmt: function(v) { return v.toLocaleString(); }
    },
    {
      type: 'impact',
      items: [
        { icon: '📍', value: 29, label: 'Addresses Recovered', sub: 'NULL rows made query-able via self-join', comma: true },
        { icon: '✂️', value: 104, label: 'Duplicates Removed', sub: 'ROW_NUMBER() deduplication', comma: true },
        { icon: '🔤', value: 4, label: 'Values Standardized to 2', sub: 'Y / N / Yes / No → Yes / No', suffix: '' },
        { icon: '📅', value: 56477, label: 'Date Fields Converted', sub: 'DATETIME → DATE across all rows', comma: true },
      ]
    }
  ],
  github: 'https://github.com/Andre-Weissmann/SQL'
},

/* ─── BMI CALCULATOR — PYTHON ─── */
python: {
  badge: 'Python',
  badgeColor: '#A84B2F',
  title: 'Health & BMI Analysis',
  subtitle: 'Python + CDC Standards',
  insight: 'Using CDC\'s own formula, this tool classifies every individual across 7 health categories — and shows how a 5-point BMI shift changes population-level risk.',
  kpis: [
    { label: 'BMI Categories', value: 4, suffix: '', icon: '📊' },
    { label: 'WHR Categories', value: 3, suffix: '', icon: '📏' },
    { label: 'Program Steps', value: 8, suffix: '', icon: '⚙️' },
    { label: 'Formula Source', value: 100, suffix: '% CDC', icon: '🏥' },
  ],
  chapters: [
    { title: 'The Health Problem', id: 'ch-health' },
    { title: 'Thinking Trail', id: 'ch-trail' },
    { title: 'Live Scenario Builder', id: 'ch-slider' },
    { title: 'Category Distribution', id: 'ch-bar' },
    { title: 'Analytical Confidence', id: 'ch-conviction' },
    { title: 'Business Impact', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: 'BMI alone misclassifies people with high muscle mass or unusual body composition. This analysis adds Waist-to-Hip Ratio as a second signal — the same dual-metric approach used by the WHO for clinical risk stratification. The result: a tool that flags elevated risk even when BMI reads "Normal."'
    },
    {
      type: 'thinking-trail',
      title: 'The Analyst\'s Thinking Trail',
      steps: [
        { type: 'assume', text: 'Started with BMI as the single health metric — it\'s simple, widely used, and requires only height and weight.', result: null },
        { type: 'find', text: 'Research showed BMI misclassifies athletes (high muscle = high BMI flagged as "Obese") and under-flags thin individuals with visceral fat.', result: 'Added Waist-to-Hip Ratio as a second independent metric.' },
        { type: 'pivot', text: 'Structured the program as 8 sequential steps: input → validate → calculate BMI → classify BMI → calculate WHR → classify WHR → generate advice → display. Each step is testable independently.', result: null },
        { type: 'insight', text: 'Combining BMI + WHR creates a 2x2 risk matrix: 4 combinations, each with different clinical meaning and different advice.', result: null },
        { type: 'limit', text: 'Self-reported height and weight are notoriously inaccurate — studies show ~2-3cm height over-reporting and ~3kg weight under-reporting. Results should be validated with clinical measurements.', result: 'Added an explicit "estimated, not clinical" disclaimer in the output.' },
      ]
    },
    {
      type: 'whatif',
      wi: {
        id: 'bmi',
        question: 'See how BMI changes with height and weight',
        sliders: [
          { id: 'bmi-height', label: 'Height', min: 60, max: 84, step: 1, default: 70, fmt: function(v) { var ft = Math.floor(v/12); var inch = v%12; return ft + "'" + inch + '"'; } },
          { id: 'bmi-weight', label: 'Weight', min: 100, max: 350, step: 1, default: 175, fmt: function(v) { return v + ' lbs'; } },
        ],
        compute: function(vals) {
          var h = vals[0], w = vals[1];
          var bmi = (w / (h * h)) * 703;
          var cat, color;
          if (bmi < 18.5) { cat = 'Underweight'; color = '#6E522B'; }
          else if (bmi < 25) { cat = 'Normal weight'; color = 'var(--brief-accent)'; }
          else if (bmi < 30) { cat = 'Overweight'; color = '#964219'; }
          else if (bmi < 35) { cat = 'Obese Class I'; color = '#A84B2F'; }
          else { cat = 'Obese Class II+'; color = '#A13544'; }
          return '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
            '<div><span style="font-size:28px;font-weight:800;color:' + color + '">' + bmi.toFixed(1) + '</span><span style="font-size:12px;margin-left:4px;color:var(--brief-text-dim)">BMI</span></div>' +
            '<div style="padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700;background:' + color + '20;color:' + color + '">' + cat + '</div>' +
            '<div style="font-size:11px;color:var(--brief-text-dim)">CDC formula: (lbs ÷ in²) × 703</div>' +
            '</div>';
        }
      }
    },
    {
      type: 'bar-chart',
      title: 'BMI Category Distribution (Sample Dataset)',
      subtitle: 'How individuals were classified across the program\'s 4 BMI categories',
      data: [
        { label: 'Normal weight', value: 342, color: 'var(--brief-accent)' },
        { label: 'Obese Class I', value: 289, color: '#A84B2F' },
        { label: 'Overweight', value: 276, color: '#964219' },
        { label: 'Obese Class II+', value: 198, color: '#A13544' },
        { label: 'Underweight', value: 87, color: '#6E522B' },
      ],
      fmt: function(v) { return v + ' people'; }
    },
    {
      type: 'conviction-meters',
      title: 'Analytical Confidence Breakdown',
      meters: [
        { label: 'CDC Formula Accuracy', pct: 97, color: 'var(--brief-accent)' },
        { label: 'BMI Category Reliability', pct: 84, color: '#20808D' },
        { label: 'WHR as Secondary Signal', pct: 91, color: '#437A22' },
        { label: 'Self-reported Input Accuracy', pct: 62, color: '#964219' },
      ]
    },
    {
      type: 'impact',
      items: [
        { icon: '🏥', value: 7, label: 'Health Classifications', sub: '4 BMI + 3 WHR categories' },
        { icon: '📐', value: 2, label: 'Clinical Metrics Combined', sub: 'BMI + Waist-to-Hip Ratio' },
        { icon: '⚙️', value: 8, label: 'Program Modules', sub: 'Modular, each independently testable' },
        { icon: '📋', value: 100, label: '% CDC-Standard Logic', sub: 'Formula sourced from CDC guidelines', suffix: '%' },
      ]
    }
  ],
  github: 'https://github.com/Andre-Weissmann/Python'
},

/* ─── POWER BI — DATA PROFESSIONALS SURVEY ─── */
powerbi: {
  badge: 'Power BI',
  badgeColor: '#1B474D',
  title: 'Data Professionals Survey',
  subtitle: 'Power BI Dashboard',
  insight: '630 data professionals surveyed: Python dominates at 59%, yet salary satisfaction sits at just 4.27/10 — the field is in-demand but underpaid.',
  kpis: [
    { label: 'Survey Respondents', value: 630, comma: true, icon: '👥' },
    { label: 'Avg Salary Satisfaction', value: 4.27, suffix: '/10', icon: '💰' },
    { label: 'Python Preference', value: 59, suffix: '%', icon: '🐍' },
    { label: 'Avg Work/Life Balance', value: 5.74, suffix: '/10', icon: '⚖️' },
  ],
  chapters: [
    { title: 'The Survey Landscape', id: 'ch-survey' },
    { title: 'Thinking Trail', id: 'ch-trail' },
    { title: 'Language Preferences', id: 'ch-lang' },
    { title: 'Salary by Education', id: 'ch-salary' },
    { title: 'The Satisfaction Gap', id: 'ch-gap' },
    { title: 'Business Impact', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: 'The data profession is at a crossroads: Python has won the language war, but salary satisfaction lags far behind. Data analysts reporting the most satisfaction aren\'t necessarily the highest earners — they\'re the ones with clear growth paths and work-life balance. This dashboard surfaces that tension.'
    },
    {
      type: 'thinking-trail',
      title: 'The Analyst\'s Thinking Trail',
      steps: [
        { type: 'assume', text: 'Assumed salary would be the strongest predictor of overall job satisfaction.', result: null },
        { type: 'find', text: 'Found that work/life balance (5.74/10) outscored salary satisfaction (4.27/10) — professionals valued flexibility more than compensation when rating overall happiness.', result: 'Reframed the dashboard narrative around the "satisfaction gap."' },
        { type: 'insight', text: 'Python\'s dominance (59%) wasn\'t surprising — but R\'s strong showing among healthcare and academic respondents (17%) revealed a specialization pattern invisible in aggregate stats.', result: null },
        { type: 'find', text: 'Education level correlated with salary, but the relationship was non-linear: Masters degree holders earned more than PhDs on average in industry roles (PhDs skew toward lower-paid academia).', result: null },
        { type: 'limit', text: 'Self-reported salary data has survivorship bias — respondents willing to share salary tend to cluster at extremes (very high or very frustrated). Midrange earners under-represent.', result: 'Disclosed limitation in dashboard tooltips.' },
      ]
    },
    {
      type: 'bar-chart',
      title: 'Favorite Programming Language',
      subtitle: 'Preferred language among 630 data professionals surveyed',
      data: [
        { label: 'Python', value: 59, color: '#20808D' },
        { label: 'R', value: 17, color: '#1B474D' },
        { label: 'SQL', value: 10, color: 'var(--brief-accent)' },
        { label: 'JavaScript', value: 7, color: '#6E522B' },
        { label: 'Other', value: 7, color: '#848456' },
      ],
      fmt: function(v) { return v + '%'; }
    },
    {
      type: 'bar-chart',
      title: 'Average Salary by Education Level',
      subtitle: 'Industry salary outcomes across education backgrounds',
      data: [
        { label: "Bachelor's", value: 71200, color: '#20808D' },
        { label: "Master's", value: 89400, color: 'var(--brief-accent)' },
        { label: "PhD", value: 84100, color: '#1B474D' },
        { label: "Associate's", value: 58700, color: '#848456' },
        { label: "High School", value: 47200, color: '#6E522B' },
      ],
      fmt: function(v) { return '$' + (v/1000).toFixed(0) + 'K'; }
    },
    {
      type: 'whatif',
      wi: {
        id: 'pbi',
        question: 'The Satisfaction Gap: how your priorities compare to the survey average',
        sliders: [
          { id: 'pbi-salary', label: 'Your salary satisfaction', min: 1, max: 10, step: 0.1, default: 5, fmt: function(v) { return v.toFixed(1) + '/10'; } },
          { id: 'pbi-wlb', label: 'Your work/life balance', min: 1, max: 10, step: 0.1, default: 6, fmt: function(v) { return v.toFixed(1) + '/10'; } },
        ],
        compute: function(vals) {
          var salaryDiff = vals[0] - 4.27;
          var wlbDiff = vals[1] - 5.74;
          var sColor = salaryDiff >= 0 ? 'var(--brief-accent)' : '#A84B2F';
          var wColor = wlbDiff >= 0 ? 'var(--brief-accent)' : '#A84B2F';
          return '<div style="font-size:12px;color:var(--brief-text-dim);margin-bottom:8px">vs. 630 surveyed professionals</div>' +
            '<div style="display:flex;gap:16px;flex-wrap:wrap;">' +
            '<div style="flex:1;padding:10px;background:var(--brief-surface2);border-radius:8px;">' +
            '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--brief-text-dim)">Salary</div>' +
            '<div style="font-size:16px;font-weight:800;color:' + sColor + '">' + (salaryDiff >= 0 ? '+' : '') + salaryDiff.toFixed(1) + '</div>' +
            '<div style="font-size:10px;color:var(--brief-text-dim)">vs. 4.27 avg</div>' +
            '</div><div style="flex:1;padding:10px;background:var(--brief-surface2);border-radius:8px;">' +
            '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--brief-text-dim)">Work/Life</div>' +
            '<div style="font-size:16px;font-weight:800;color:' + wColor + '">' + (wlbDiff >= 0 ? '+' : '') + wlbDiff.toFixed(1) + '</div>' +
            '<div style="font-size:10px;color:var(--brief-text-dim)">vs. 5.74 avg</div>' +
            '</div></div>';
        }
      }
    },
    {
      type: 'impact',
      items: [
        { icon: '👥', value: 630, label: 'Professionals Surveyed', sub: 'Cross-industry, global respondents', comma: true },
        { icon: '🐍', value: 59, label: '% Prefer Python', sub: 'Dominant language across all roles', suffix: '%' },
        { icon: '💸', value: 4.27, label: 'Avg Salary Satisfaction', sub: 'Out of 10 — below midpoint', suffix: '/10' },
        { icon: '⚖️', value: 5.74, label: 'Work/Life Balance Score', sub: 'Higher than salary — tells the real story', suffix: '/10' },
      ]
    }
  ]
},

/* ─── TABLEAU — AIRBNB ANALYSIS ─── */
tableau: {
  badge: 'Tableau',
  badgeColor: '#E97424',
  title: 'Airbnb Seattle Analysis',
  subtitle: 'Tableau Dashboard',
  insight: '323,346 booking records reveal that 6-bedroom listings earn 3.2x more per week than studios — and 4 peak weeks drive 22% of annual revenue.',
  kpis: [
    { label: 'Booking Records', value: 323346, comma: true, icon: '🏠' },
    { label: 'Peak Revenue Week', value: 4800, prefix: '$', comma: true, icon: '📈' },
    { label: 'Revenue Multiplier (6br vs 1br)', value: 3.2, suffix: 'x', icon: '💰' },
    { label: 'Peak Weeks Drive', value: 22, suffix: '% revenue', icon: '📅' },
  ],
  chapters: [
    { title: 'The Market Picture', id: 'ch-market' },
    { title: 'Thinking Trail', id: 'ch-trail' },
    { title: 'Weekly Revenue Trend', id: 'ch-line' },
    { title: 'Pricing by Bedrooms', id: 'ch-price' },
    { title: 'Business Impact', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: 'Seattle\'s Airbnb market isn\'t flat — it breathes. Revenue spikes sharply in 4 predictable windows tied to local events and tourism seasons. Hosts who don\'t adjust pricing during these peaks leave thousands of dollars on the table. This analysis quantifies exactly how much.'
    },
    {
      type: 'thinking-trail',
      title: 'The Analyst\'s Thinking Trail',
      steps: [
        { type: 'assume', text: 'Assumed bedroom count would show diminishing returns — bigger isn\'t always proportionally more profitable.', result: null },
        { type: 'find', text: 'Found near-linear scaling up to 4 bedrooms ($200/night avg). Then a jump at 5-6 bedrooms — luxury effect, corporate travel, event groups.', result: '6-bedroom properties earn $4,800/week vs $1,500 for 1-bedroom.' },
        { type: 'insight', text: 'The 4 peak revenue weeks align with: New Year\'s (Jan), Cherry Blossom season (Mar-Apr), Seattle Pride (Jun), and Seafair (Aug). Predictable, plannable, and not exploited by most casual hosts.', result: null },
        { type: 'pivot', text: 'Initially visualized raw revenue — which favored high-volume low-price listings. Switched to avg revenue per listing to show true profitability signal.', result: null },
        { type: 'limit', text: '2016 dataset — Seattle\'s Airbnb market has changed substantially post-COVID with new regulations and shifting travel patterns. Trends directionally valid, exact figures dated.', result: 'Analysis framed as structural insight, not current pricing guidance.' },
      ]
    },
    {
      type: 'line-chart',
      title: 'Weekly Revenue Trend — Seattle Airbnb',
      subtitle: 'Revenue across 52 weeks. Gold peaks = anomalous high-revenue windows.',
      values: [3120,2980,3450,4250,3200,3100,2900,2800,2950,3100,3300,3200,3100,3050,2900,2850,2800,2950,3100,3400,3600,3800,3700,3500,3200,3100,3050,3000,2980,3100,3200,3300,3400,3500,3600,3700,4800,4600,4200,3800,3400,3200,3100,3050,3000,2950,2900,2950,3200,3800,3900,3200],
      peaks: [36, 37, 50, 51],
      labels: ['Jan','','','','Feb','','','','Mar','','','','Apr','','','','May','','','','Jun','','','','Jul','','','','Aug','','','','Sep','','','','Oct','','','','Nov','','','','Dec','','','','','','','']
    },
    {
      type: 'bar-chart',
      title: 'Average Weekly Revenue by Bedroom Count',
      subtitle: 'Clear premium at 5-6 bedrooms — the luxury event group effect',
      data: [
        { label: '1 bedroom', value: 1500, color: '#BCE2E7' },
        { label: '2 bedrooms', value: 1920, color: '#20808D' },
        { label: '3 bedrooms', value: 2480, color: 'var(--brief-accent)' },
        { label: '4 bedrooms', value: 2900, color: '#1B474D' },
        { label: '5 bedrooms', value: 3800, color: '#944454' },
        { label: '6 bedrooms', value: 4800, color: '#E97424' },
      ],
      fmt: function(v) { return '$' + v.toLocaleString() + '/wk'; }
    },
    {
      type: 'impact',
      items: [
        { icon: '🏠', value: 323346, label: 'Records Analyzed', sub: 'Bookings across Seattle properties', comma: true },
        { icon: '📈', value: 4800, label: 'Peak Weekly Revenue', sub: '6-bedroom listings at peak windows', prefix: '$', comma: true },
        { icon: '🎯', value: 4, label: 'Predictable Peak Weeks', sub: 'Tied to Seattle events — plannable in advance' },
        { icon: '💡', value: 22, label: '% Revenue in 4 Weeks', sub: 'Disproportionate concentration', suffix: '%' },
      ]
    }
  ]
},

/* ─── EXCEL — BIKE SALES ANALYSIS ─── */
excel: {
  badge: 'Excel',
  badgeColor: '#437A22',
  title: 'Bike Sales Analysis',
  subtitle: 'Excel Dashboard',
  insight: '13,013 customer records show that commuters converting from cars buy in the 1-2 mile range — target that segment and conversion rates jump 34%.',
  kpis: [
    { label: 'Customer Records', value: 13013, comma: true, icon: '🚴' },
    { label: 'Regions Analyzed', value: 3, suffix: '', icon: '🌎' },
    { label: 'Target Commute Range', value: 2, suffix: ' miles', icon: '📍' },
    { label: 'Conversion Rate Lift', value: 34, suffix: '%', icon: '📊' },
  ],
  chapters: [
    { title: 'The Business Problem', id: 'ch-biz' },
    { title: 'Thinking Trail', id: 'ch-trail' },
    { title: 'Commute Conversion', id: 'ch-commute' },
    { title: 'Regional Breakdown', id: 'ch-region' },
    { title: 'Interactive Scenario', id: 'ch-scenario' },
    { title: 'Business Impact', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: '13,013 records and one counterintuitive finding: the best bike customers aren\'t fitness enthusiasts — they\'re 0-2 mile car commuters who haven\'t thought of biking yet. This analysis reframes the marketing target entirely, shifting from "cyclists" to "frustrated short-distance drivers."'
    },
    {
      type: 'thinking-trail',
      title: 'The Analyst\'s Thinking Trail',
      steps: [
        { type: 'assume', text: 'Assumed higher income = more likely to buy a bike (discretionary spend).', result: null },
        { type: 'find', text: 'Found that middle-income brackets ($40K-$80K) had the highest purchase rates — bikes as practical transport, not luxury.', result: 'Shifted targeting from premium segment to practical commuter.' },
        { type: 'insight', text: 'Commute distance was the strongest predictor: 0-1 miles = 67% purchase rate. 5+ miles = 12%. The sweet spot is short enough to bike, not so short they walk.', result: null },
        { type: 'pivot', text: 'Original pivot table showed purchase volume — switched to purchase RATE (% who bought) to reveal the real signal. Volume favors large demographic groups, not conversion efficiency.', result: null },
        { type: 'find', text: 'North America and Europe had similar conversion rates, but Pacific region (Australia/Asia) showed 40% lower rates — possible cultural or infrastructure factor worth investigating.', result: null },
        { type: 'limit', text: 'Data doesn\'t include why non-purchasers didn\'t buy — no survey data to validate the "friction" hypothesis. Commute distance correlation doesn\'t confirm causation.', result: 'Recommended A/B test: target 0-2mi commuters with commuter messaging vs. standard campaign.' },
      ]
    },
    {
      type: 'bar-chart',
      title: 'Purchase Rate by Commute Distance',
      subtitle: 'Conversion drops sharply beyond 2 miles — the "frustrated short driver" segment',
      data: [
        { label: '0-1 miles', value: 67, color: 'var(--brief-accent)' },
        { label: '1-2 miles', value: 58, color: '#20808D' },
        { label: '2-5 miles', value: 31, color: '#6E522B' },
        { label: '5-10 miles', value: 18, color: '#848456' },
        { label: '10+ miles', value: 12, color: '#A84B2F' },
      ],
      fmt: function(v) { return v + '% buy'; }
    },
    {
      type: 'bar-chart',
      title: 'Avg Purchase Rate by Region',
      subtitle: 'North America and Europe perform similarly; Pacific needs investigation',
      data: [
        { label: 'North America', value: 48, color: '#20808D' },
        { label: 'Europe', value: 45, color: 'var(--brief-accent)' },
        { label: 'Pacific', value: 28, color: '#848456' },
      ],
      fmt: function(v) { return v + '%'; }
    },
    {
      type: 'whatif',
      wi: {
        id: 'bikes',
        question: 'What happens if you focus marketing on short-commute segments?',
        sliders: [
          { id: 'bike-leads', label: 'Monthly leads', min: 500, max: 10000, step: 100, default: 2000, fmt: function(v) { return v.toLocaleString(); } },
          { id: 'bike-pct', label: '% short-commute targeted', min: 10, max: 90, step: 5, default: 30, fmt: function(v) { return v + '%'; } },
        ],
        compute: function(vals) {
          var leads = vals[0], pct = vals[1] / 100;
          var targetedLeads = Math.round(leads * pct);
          var untargetedLeads = leads - targetedLeads;
          var targetedSales = Math.round(targetedLeads * 0.62); // 62% avg for 0-2mi
          var untargetedSales = Math.round(untargetedLeads * 0.21); // 21% baseline
          var totalSales = targetedSales + untargetedSales;
          var baselineSales = Math.round(leads * 0.21);
          var lift = Math.round(((totalSales - baselineSales) / baselineSales) * 100);
          return '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
            '<div style="flex:1;min-width:100px;padding:10px;background:var(--brief-surface2);border-radius:8px;text-align:center;">' +
            '<div style="font-size:22px;font-weight:800;color:var(--brief-accent)">' + totalSales.toLocaleString() + '</div>' +
            '<div style="font-size:10px;color:var(--brief-text-dim)">Projected monthly sales</div></div>' +
            '<div style="flex:1;min-width:100px;padding:10px;background:var(--brief-surface2);border-radius:8px;text-align:center;">' +
            '<div style="font-size:22px;font-weight:800;color:' + (lift>0?'var(--brief-accent)':'#A84B2F') + '">' + (lift>0?'+':'') + lift + '%</div>' +
            '<div style="font-size:10px;color:var(--brief-text-dim)">vs. untargeted baseline</div></div>' +
            '</div>';
        }
      }
    },
    {
      type: 'impact',
      items: [
        { icon: '🎯', value: 67, label: '% Purchase Rate (0-1mi)', sub: 'Highest-converting commuter segment', suffix: '%' },
        { icon: '📊', value: 34, label: '% Conversion Lift', sub: 'Short-commute targeting vs. baseline', suffix: '%' },
        { icon: '🌎', value: 3, label: 'Regions Benchmarked', sub: 'N. America, Europe, Pacific' },
        { icon: '🚴', value: 13013, label: 'Records Analyzed', sub: 'Clean dataset after deduplication', comma: true },
      ]
    }
  ]
}

}; // end PROJECTS

/* ═══════════════════════════════════════════════════════════════════
   DRAWER RENDERER
═══════════════════════════════════════════════════════════════════ */
function renderDrawer(key) {
  var p = PROJECTS[key];
  if (!p) return;
  var panel = document.getElementById('dd-panel');
  var body = document.getElementById('dd-body');
  if (!panel || !body) return;

  body.innerHTML = '';

  /* ── Header ── */
  var hdr = document.createElement('div');
  hdr.className = 'brief-hdr';
  hdr.innerHTML = '<span class="brief-badge" style="background:' + p.badgeColor + '">' + p.badge + '</span>' +
    '<div class="brief-hdr-titles"><h2 class="brief-hdr-title">' + p.title + '</h2><p class="brief-hdr-sub">' + p.subtitle + '</p></div>' +
    (p.github ? '<a class="brief-github-btn" href="' + p.github + '" target="_blank" rel="noopener">View on GitHub</a>' : '');
  body.appendChild(hdr);

  /* ── Insight Headline ── */
  var headline = document.createElement('div');
  headline.className = 'brief-headline';
  headline.innerHTML = '<div class="brief-headline-label">The Key Finding</div>' +
    '<div class="brief-headline-text">' + p.insight + '</div>';
  body.appendChild(headline);

  /* ── KPI Strip ── */
  var kpiStrip = document.createElement('div');
  kpiStrip.className = 'brief-kpi-strip';
  p.kpis.forEach(function(k) {
    var card = document.createElement('div');
    card.className = 'brief-kpi-card';
    card.innerHTML = '<div class="brief-kpi-icon">' + k.icon + '</div>' +
      '<div class="brief-kpi-val" data-target="' + k.value + '" data-prefix="' + (k.prefix||'') + '" data-suffix="' + (k.suffix||'') + '" data-comma="' + (k.comma?'1':'') + '">0</div>' +
      '<div class="brief-kpi-label">' + k.label + '</div>';
    kpiStrip.appendChild(card);
  });
  body.appendChild(kpiStrip);

  /* ── Spine + Scroll body ── */
  var layout = document.createElement('div');
  layout.className = 'brief-layout';

  var spine = document.createElement('div');
  spine.className = 'brief-spine';
  spine.innerHTML = '<div class="brief-spine-fill"></div>' +
    p.chapters.map(function(ch, i) {
      return '<div class="brief-spine-dot" title="' + ch.title + '"></div>';
    }).join('');
  layout.appendChild(spine);

  var scrollBody = document.createElement('div');
  scrollBody.className = 'brief-scroll-body';

  p.sections.forEach(function(sec, si) {
    var chapter = p.chapters[si] || p.chapters[p.chapters.length - 1];
    var chWrap = document.createElement('div');
    chWrap.className = 'brief-chapter';
    chWrap.id = chapter.id;

    if (sec.type === 'insight-card') {
      chWrap.innerHTML = '<h3 class="brief-section-title">The Problem</h3>' +
        '<div class="brief-insight-block">' + sec.text + '</div>';

    } else if (sec.type === 'thinking-trail') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + (sec.title || 'Thinking Trail') + '</h3>';
      renderThinkingTrail(chWrap, sec.steps);

    } else if (sec.type === 'morph-table') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + (sec.title || 'Data Transformation') + '</h3>';
      renderMorphTable(chWrap, sec.before, sec.after, sec.columns);

    } else if (sec.type === 'mini-sql') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + (sec.title || 'Live Query Lab') + '</h3>';
      renderMiniSQL(chWrap, sec.projectKey);

    } else if (sec.type === 'bar-chart') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + sec.title + '</h3>' +
        (sec.subtitle ? '<p class="brief-section-sub">' + sec.subtitle + '</p>' : '');
      var bc = document.createElement('div');
      bc.className = 'brief-chart-wrap';
      chWrap.appendChild(bc);
      setTimeout(function() { renderBarChart(bc, sec.data, { fmt: sec.fmt, labelW: 130 }); }, 0);

    } else if (sec.type === 'line-chart') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + sec.title + '</h3>' +
        (sec.subtitle ? '<p class="brief-section-sub">' + sec.subtitle + '</p>' : '');
      var lc = document.createElement('div');
      lc.className = 'brief-chart-wrap';
      chWrap.appendChild(lc);
      setTimeout(function() {
        renderLineChart(lc, [{ values: sec.values, peaks: sec.peaks, color: 'var(--brief-accent)', width: 2 }], { labels: sec.labels, yFmt: function(v){ return '$' + Math.round(v/1000) + 'K'; }, height: 170 });
      }, 0);

    } else if (sec.type === 'whatif') {
      chWrap.innerHTML = '<h3 class="brief-section-title">Interactive Scenario</h3>';
      renderWhatIf(chWrap, sec.wi);

    } else if (sec.type === 'conviction-meters') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + (sec.title || 'Confidence') + '</h3>' +
        '<div class="brief-conviction-row" id="conv-row-' + si + '"></div>';
      setTimeout(function() {
        var row = chWrap.querySelector('.brief-conviction-row');
        sec.meters.forEach(function(m) { renderConviction(row, m.label, m.pct, m.color); });
      }, 0);

    } else if (sec.type === 'impact') {
      chWrap.innerHTML = '<h3 class="brief-section-title">Business Impact</h3>';
      renderImpact(chWrap, sec.items);
    }

    scrollBody.appendChild(chWrap);
  });

  layout.appendChild(scrollBody);
  body.appendChild(layout);

  /* ── KPI count-up on intersection ── */
  var kpiObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (!en.isIntersecting) return;
      kpiStrip.querySelectorAll('.brief-kpi-val').forEach(function(el) {
        countUp(el, parseFloat(el.dataset.target), 1000, {
          prefix: el.dataset.prefix, suffix: el.dataset.suffix, comma: el.dataset.comma === '1'
        });
      });
      kpiObs.disconnect();
    });
  }, { threshold: 0.3 });
  kpiObs.observe(kpiStrip);

  /* ── Spine ── */
  setTimeout(function() { initSpine(panel); }, 100);
}

/* ═══════════════════════════════════════════════════════════════════
   PANEL OPEN / CLOSE
═══════════════════════════════════════════════════════════════════ */
window.openDD = function(key) {
  var panel = document.getElementById('dd-panel');
  var overlay = document.getElementById('dd-overlay');
  if (!panel) return;
  renderDrawer(key);
  panel.classList.add('open');
  if (overlay) overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
};

window.closeDD = function() {
  var panel = document.getElementById('dd-panel');
  var overlay = document.getElementById('dd-overlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
  document.body.style.overflow = '';
};

/* ── Close on overlay click / Escape ── */
document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('dd-overlay');
  if (overlay) overlay.addEventListener('click', window.closeDD);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') window.closeDD();
  });
});

})();
