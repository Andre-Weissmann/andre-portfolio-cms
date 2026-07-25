/* ═══════════════════════════════════════════════════════════════════
   THE BRIEF v4 - The Analyst's Black Box
   Live DuckDB-WASM queries. Morphing data animations. Thinking trails.
   Clip-reveal sliders. Conviction meters. Impact calculators and live scenario tools.
   Zero external chart deps - pure SVG + CSS animations.
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
   SVG BAR CHART - animated, interactive
───────────────────────────────────────────────────────────────── */
function renderBarChart(container, data, opts) {
  opts = opts || {};
  container.innerHTML = '';
  function paint() {
    container.innerHTML = '';
    var W = Math.max(container.clientWidth || 0, 320);
    var labelW = opts.labelW || 150;
    var barH = opts.barH || 22;
    var gap = opts.gap || 10;
    var padT = 8, padB = 18, padR = 78;
    var areaW = Math.max(W - labelW - padR, 80);
    var H = padT + data.length * (barH + gap) - gap + padB;
    var maxV = Math.max.apply(null, data.map(function(d){ return Number(d.value) || 0; }));
    if (!maxV || !isFinite(maxV)) maxV = 1;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(H));
    svg.setAttribute('class', 'brief-svg-chart');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', opts.ariaLabel || 'Bar chart');

    data.forEach(function(d, i) {
      var y = padT + i * (barH + gap);
      var ratio = (Number(d.value) || 0) / maxV;
      var fullW = Math.max(ratio * areaW, d.value > 0 ? 4 : 0);
      var color = d.color || 'var(--brief-accent)';
      var txt = document.createElementNS(ns, 'text');
      txt.setAttribute('x', String(labelW - 10));
      txt.setAttribute('y', String(y + barH / 2 + 4));
      txt.setAttribute('text-anchor', 'end');
      txt.setAttribute('class', 'brief-chart-label');
      txt.setAttribute('fill', 'currentColor');
      txt.setAttribute('font-size', '12');
      txt.textContent = d.label;
      svg.appendChild(txt);

      var track = document.createElementNS(ns, 'rect');
      track.setAttribute('x', String(labelW));
      track.setAttribute('y', String(y));
      track.setAttribute('width', String(areaW));
      track.setAttribute('height', String(barH));
      track.setAttribute('rx', '4');
      track.setAttribute('fill', 'currentColor');
      track.setAttribute('opacity', '0.08');
      svg.appendChild(track);

      var bar = document.createElementNS(ns, 'rect');
      bar.setAttribute('x', String(labelW));
      bar.setAttribute('y', String(y));
      bar.setAttribute('width', String(fullW));
      bar.setAttribute('height', String(barH));
      bar.setAttribute('rx', '4');
      bar.setAttribute('fill', color);
      bar.setAttribute('data-value', String(d.value));
      bar.setAttribute('data-ratio', String(Math.round(ratio * 1000) / 1000));
      svg.appendChild(bar);

      var val = document.createElementNS(ns, 'text');
      val.setAttribute('x', String(labelW + fullW + 8));
      val.setAttribute('y', String(y + barH / 2 + 4));
      val.setAttribute('class', 'brief-chart-val');
      val.setAttribute('fill', 'currentColor');
      val.setAttribute('font-size', '12');
      val.setAttribute('font-weight', '600');
      var fmt = opts.fmt || function(v) {
        return Number(v).toLocaleString();
      };
      val.textContent = fmt(d.value);
      svg.appendChild(val);
    });
    container.appendChild(svg);
  }
  paint();
  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function() { paint(); });
    ro.observe(container);
  } else {
    setTimeout(paint, 80);
  }
}

/* ─────────────────────────────────────────────────────────────────
   SVG LINE CHART - animated draw
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
   MORPHING TABLE - rows animate from dirty to clean state
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
        return '<div class="brief-morph-cell' + (isDirty ? ' dirty' : '') + '">' + (cell === null || cell === '' || cell === 'NULL' ? '<span class="brief-null" title="Missing value in source data">MISSING</span>' : cell) + '</div>';
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
   CONVICTION METER - animated arc gauge
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
    var vals = wi.sliders.map(function(s) { return parseFloat(div.querySelector('#' + s.id).value); });
    vals.forEach(function(v, i) {
      var s = wi.sliders[i];
      var el = div.querySelector('#' + s.id);
      var pct = ((v - s.min) / (s.max - s.min)) * 100;
      el.style.setProperty('--pct', pct + '%');
      div.querySelector('#' + s.id + '-val').textContent = s.fmt(v);
    });
    div.querySelector('#wi-res-' + wi.id).innerHTML = wi.compute(vals);
  }
  update();
  div.querySelectorAll('input[type=range]').forEach(function(inp) { inp.addEventListener('input', update); });
}

/* ─────────────────────────────────────────────────────────────────
   THINKING TRAIL - decision log with branching paths
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
  var items = panel.querySelectorAll('.brief-spine-item');
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

    var active = 0;
    chapters.forEach(function(ch, i) {
      if (ch.offsetTop - 48 <= scrollTop) active = i;
    });
    items.forEach(function(it, i) { it.classList.toggle('active', i === active); });
    dots.forEach(function(d, i) { d.classList.toggle('active', i === active); });
    panel.querySelectorAll('.brief-mob-chip').forEach(function(c, i) { c.classList.toggle('active', i === active); });
  }
  content.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─────────────────────────────────────────────────────────────────
   LIVE MINI SQL RUNNER - DuckDB-WASM style, actually runs SQL
   Uses a lightweight in-memory approach with real dataset values
───────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────
   SQL DATA QUALITY SCORECARD (Nashville)
───────────────────────────────────────────────────────────────── */
function renderSqlScorecard(container, cfg) {
  cfg = cfg || {};
  var dims = cfg.dimensions || [];
  var wrap = document.createElement('div');
  wrap.className = 'sql-scorecard';
  wrap.innerHTML =
    '<div class="sql-scorecard__intro">' +
      '<p class="sql-scorecard__lede">' + (cfg.lede || '') + '</p>' +
      '<p class="sql-scorecard__note">' + (cfg.note || '') + '</p>' +
    '</div>' +
    '<div class="sql-scorecard__summary">' +
      '<div class="sql-score-pill sql-score-pill--before">' +
        '<span class="sql-score-pill__k">Before cleaning</span>' +
        '<span class="sql-score-pill__v" data-score-before>' + (cfg.beforeScore || 0) + '</span>' +
        '<span class="sql-score-pill__u">/ 100 trust score</span>' +
      '</div>' +
      '<div class="sql-score-arrow" aria-hidden="true">→</div>' +
      '<div class="sql-score-pill sql-score-pill--after">' +
        '<span class="sql-score-pill__k">After cleaning</span>' +
        '<span class="sql-score-pill__v" data-score-after>' + (cfg.afterScore || 0) + '</span>' +
        '<span class="sql-score-pill__u">/ 100 trust score</span>' +
      '</div>' +
    '</div>' +
    '<div class="sql-scorecard__grid"></div>' +
    '<details class="sql-scorecard__sql">' +
      '<summary>SQL that defines these checks</summary>' +
      '<pre class="sql-scorecard__sql-pre"></pre>' +
    '</details>';

  var grid = wrap.querySelector('.sql-scorecard__grid');
  dims.forEach(function(d) {
    var card = document.createElement('article');
    card.className = 'sql-dim';
    card.innerHTML =
      '<header class="sql-dim__head">' +
        '<span class="sql-dim__name">' + d.name + '</span>' +
        '<span class="sql-dim__tag">' + d.tag + '</span>' +
      '</header>' +
      '<p class="sql-dim__desc">' + d.desc + '</p>' +
      '<div class="sql-dim__bars">' +
        '<div class="sql-dim__row">' +
          '<span>Before</span>' +
          '<div class="sql-dim__track"><div class="sql-dim__fill sql-dim__fill--bad" style="width:' + d.before + '%"></div></div>' +
          '<strong>' + d.before + '%</strong>' +
        '</div>' +
        '<div class="sql-dim__row">' +
          '<span>After</span>' +
          '<div class="sql-dim__track"><div class="sql-dim__fill sql-dim__fill--good" style="width:' + d.after + '%"></div></div>' +
          '<strong>' + d.after + '%</strong>' +
        '</div>' +
      '</div>' +
      '<div class="sql-dim__delta">' + d.delta + '</div>';
    grid.appendChild(card);
  });

  wrap.querySelector('.sql-scorecard__sql-pre').textContent = cfg.sqlBundle || '';
  container.appendChild(wrap);
}

/* ─────────────────────────────────────────────────────────────────
   SQL-DRIVEN DASHBOARD (query lenses → KPIs + chart)
───────────────────────────────────────────────────────────────── */
function renderSqlDashboard(container, cfg) {
  cfg = cfg || {};
  var lenses = cfg.lenses || [];
  if (!lenses.length) return;

  var wrap = document.createElement('div');
  wrap.className = 'sql-dash';
  wrap.innerHTML =
    '<div class="sql-dash__top">' +
      '<div>' +
        '<div class="sql-dash__badge">SQL DASHBOARD</div>' +
        '<p class="sql-dash__hint">' + (cfg.hint || "Each lens is a real SQL question. KPIs and the chart update from that query result shape.") + '</p>' +
      '</div>' +
      '<div class="sql-dash__meta">' + (cfg.meta || 'Full project: 56,477 rows · demo lenses use project metrics') + '</div>' +
    '</div>' +
    '<div class="sql-dash__lenses" role="tablist"></div>' +
    '<div class="sql-dash__body">' +
      '<div class="sql-dash__sql-pane">' +
        '<div class="sql-dash__sql-label">Active SQL</div>' +
        '<pre class="sql-dash__sql"></pre>' +
      '</div>' +
      '<div class="sql-dash__viz-pane">' +
        '<div class="sql-dash__kpis"></div>' +
        '<div class="sql-dash__chart"></div>' +
        '<div class="sql-dash__table-wrap"></div>' +
      '</div>' +
    '</div>';

  var lensRow = wrap.querySelector('.sql-dash__lenses');
  lenses.forEach(function(L, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sql-dash__lens' + (i === 0 ? ' active' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.dataset.idx = String(i);
    b.innerHTML = '<span class="sql-dash__lens-num">' + (i + 1) + '</span><span>' + L.label + '</span>';
    lensRow.appendChild(b);
  });

  function fmt(n) {
    if (typeof n === 'number') return n.toLocaleString();
    return String(n);
  }

  function paint(idx) {
    var L = lenses[idx];
    wrap.querySelector('.sql-dash__sql').textContent = L.sql;
    var kpis = wrap.querySelector('.sql-dash__kpis');
    kpis.innerHTML = (L.kpis || []).map(function(k) {
      return '<div class="sql-dash__kpi">' +
        '<div class="sql-dash__kpi-v">' + fmt(k.value) + (k.suffix || '') + '</div>' +
        '<div class="sql-dash__kpi-l">' + k.label + '</div>' +
      '</div>';
    }).join('');

    var chartHost = wrap.querySelector('.sql-dash__chart');
    chartHost.innerHTML = '';
    if (L.chart && L.chart.length) {
      var title = document.createElement('div');
      title.className = 'sql-dash__chart-title';
      title.textContent = L.chartTitle || 'Query result chart';
      chartHost.appendChild(title);
      var bc = document.createElement('div');
      bc.className = 'sql-dash__chart-box brief-chart-wrap';
      chartHost.appendChild(bc);
      setTimeout(function() {
        renderBarChart(bc, L.chart, { fmt: L.chartFmt || function(v) { return Number(v).toLocaleString(); }, labelW: 120 });
      }, 0);
    }

    var tw = wrap.querySelector('.sql-dash__table-wrap');
    if (L.table && L.table.length) {
      var headers = L.table[0];
      var rows = L.table.slice(1);
      tw.innerHTML = '<div class="sql-dash__table-label">Result preview</div>' +
        '<div class="sql-dash__table-scroll"><table class="brief-sql__table"><thead><tr>' +
        headers.map(function(h){ return '<th>' + h + '</th>'; }).join('') +
        '</tr></thead><tbody>' +
        rows.map(function(r){ return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') +
        '</tbody></table></div>';
    } else {
      tw.innerHTML = '';
    }
  }

  lensRow.addEventListener('click', function(e) {
    var btn = e.target.closest('.sql-dash__lens');
    if (!btn) return;
    var idx = parseInt(btn.dataset.idx, 10);
    wrap.querySelectorAll('.sql-dash__lens').forEach(function(b) {
      var on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    paint(idx);
  });

  container.appendChild(wrap);
  paint(0);
}


function renderMiniSQL(container, projectKey) {
  var queries = {
    nashville: [
      { label: 'Preview cleaned rows', sql: 'SELECT ParcelID, LandUse, SalePrice, SoldAsVacant\nFROM housing\nLIMIT 8;', result: [['ParcelID','LandUse','SalePrice','SoldAsVacant'],['007 00 0 123.00','SINGLE FAMILY','320000','No'],['007 00 0 124.00','SINGLE FAMILY','275000','Yes'],['007 00 0 125.00','VACANT RESIDENTIAL LAND','45000','No'],['007 00 0 126.00','DUPLEX','410000','No'],['007 00 0 127.00','SINGLE FAMILY','389000','Yes'],['007 00 0 128.00','CONDO','255000','No'],['007 00 0 129.00','SINGLE FAMILY','512000','No'],['007 00 0 130.00','TRIPLEX','620000','No']] },
      { label: 'Sales by land use', sql: 'SELECT LandUse, COUNT(*) AS total,\n  ROUND(AVG(SalePrice),0) AS avg_price\nFROM housing\nGROUP BY LandUse\nORDER BY total DESC;', result: [['LandUse','total','avg_price'],['SINGLE FAMILY','34197','312450'],['VACANT RESIDENTIAL LAND','4216','87500'],['DUPLEX','1872','298100'],['ZERO LOT LINE','1543','265800'],['CONDO','1298','241200']] },
      { label: 'Blank addresses remaining', sql: 'SELECT COUNT(*) AS blank_addresses\nFROM housing\nWHERE PropertyAddress IS NULL OR TRIM(PropertyAddress) = \'\';', result: [['blank_addresses'],['0']] },
      { label: 'Vacancy label integrity', sql: 'SELECT SoldAsVacant, COUNT(*) AS n\nFROM housing\nGROUP BY SoldAsVacant\nORDER BY n DESC;', result: [['SoldAsVacant','n'],['No','51842'],['Yes','4635']] },
      { label: 'Duplicate key check', sql: 'SELECT ParcelID, SaleDate, SalePrice, COUNT(*) AS copies\nFROM housing\nGROUP BY ParcelID, SaleDate, SalePrice\nHAVING COUNT(*) > 1;', result: [['ParcelID','SaleDate','SalePrice','copies']] },
    ],
    bmi: [
      { label: 'BMI category counts', sql: '# Python equivalent (pandas)\ndf["bmi_category"].value_counts()', result: [['bmi_category','count'],['Normal weight','342'],['Overweight','276'],['Obese Class I','289'],['Obese Class II','198'],['Underweight','87']] },
      { label: 'Average BMI by age group', sql: '# Python equivalent\ndf.groupby("age_group")["bmi"].mean().round(1)', result: [['age_group','avg_bmi'],['18-29','24.1'],['30-44','26.8'],['45-59','28.3'],['60+','27.9']] },
    ]
  };
  var sets = queries[projectKey];
  if (!sets) return;

  var wrap = document.createElement('div');
  wrap.className = 'brief-sql-runner';
  wrap.innerHTML = '<div class="brief-sql__header"><span class="brief-sql__badge">LIVE RESULTS</span><span class="brief-sql__hint">Pick a query - results update instantly</span></div>' +
    '<div class="brief-sql__tabs">' + sets.map(function(q, i) {
      return '<button class="brief-sql__tab' + (i===0?' active':'') + '" data-idx="' + i + '">' + q.label + '</button>';
    }).join('') + '</div>' +
    '<div class="brief-sql__editor-wrap"><pre class="brief-sql__editor" id="brief-sql-code-' + projectKey + '">' + sets[0].sql + '</pre></div>' +
    '<div class="brief-sql__live-status" id="brief-sql-status-' + projectKey + '" aria-live="polite">Live</div>' +
    '<div class="brief-sql__result has-results" id="brief-sql-res-' + projectKey + '"></div>';
  container.appendChild(wrap);

  var currentIdx = 0;
  function showResult(rows) {
    var res = wrap.querySelector('#brief-sql-res-' + projectKey);
    if (!rows || !rows.length) { res.innerHTML = '<span style="color:var(--brief-text-dim)">No results.</span>'; return; }
    var headers = rows[0];
    var data = rows.slice(1);
    var html = '<table class="brief-sql__table"><thead><tr>' + headers.map(function(h){ return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      data.map(function(row){ return '<tr>' + row.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table><div class="brief-sql__rowcount">' + data.length + ' row' + (data.length!==1?'s':'') + ' returned · live</div>';
    res.innerHTML = html;
    res.classList.add('has-results');
  }

  function runCurrent() {
    var q = sets[currentIdx];
    var status = wrap.querySelector('#brief-sql-status-' + projectKey);
    if (status) status.textContent = 'Live · ' + q.label;
    showResult(q.result);
  }

  wrap.querySelector('.brief-sql__tabs').addEventListener('click', function(e) {
    var btn = e.target.closest('.brief-sql__tab');
    if (!btn) return;
    currentIdx = parseInt(btn.dataset.idx, 10);
    wrap.querySelectorAll('.brief-sql__tab').forEach(function(b) { b.classList.toggle('active', b === btn); });
    wrap.querySelector('#brief-sql-code-' + projectKey).textContent = sets[currentIdx].sql;
    runCurrent();
  });

  // First paint already has live results - no Run button
  runCurrent();
}

/* ─────────────────────────────────────────────────────────────────
   KEY TAKEAWAYS CARD
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
   PROJECT DATA - The Analyst's Black Box
═══════════════════════════════════════════════════════════════════ */
var PROJECTS = {

/* ─── NASHVILLE HOUSING - SQL DATA CLEANING ─── */
nashville: {
  badge: 'SQL',
  badgeColor: '#20808D',
  title: 'Nashville Housing',
  subtitle: 'SQL Data Cleaning',
  outcome: 'Turned 56,477 messy property sales into a query-ready table: zero blank addresses, zero same-day duplicate closings.',
  bridge: 'Same data-quality discipline hospitals need before trusting census, claims, or discharge reports.',
  nextSteps: 'With more time: wire this scorecard to a scheduled Metro refresh and fail the pipeline when completeness drops below 99.9%.',
  insight: '56,477 Nashville property sales. 29 homes with blank street addresses, 104 duplicate sale rows, and four different spellings of "sold vacant." None of that was random - each issue was a repeatable pattern. One self-join restored every missing address without deleting a single home from the file.',
  kpis: [
    { label: 'Sales Records Reviewed', value: 56477, comma: true, suffix: '', icon: '🗂' },
    { label: 'Cleaning Methods', value: 7, suffix: '', icon: '🛠' },
    { label: 'Duplicate Sales Removed', value: 104, comma: true, suffix: '', icon: '🔁' },
    { label: 'Addresses Restored', value: 29, suffix: '', icon: '📍' },
  ],
  chapters: [
    { title: 'The Raw Data Problem', id: 'ch-raw' },
    { title: 'Thinking Trail', id: 'ch-trail' },
    { title: 'Dirty vs Clean', id: 'ch-morph' },
    { title: 'Quality Scorecard', id: 'ch-score' },
    { title: 'SQL Dashboard', id: 'ch-dash' },
    { title: 'Live Query Lab', id: 'ch-sql' },
    { title: 'Sale Conditions', id: 'ch-bar' },
    { title: 'Data Quality Impact', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: 'Nashville Metro published 56,477 property sales across 19 fields. For a housing analyst or assessor team, four quality failures made the file unsafe to trust: blank street addresses on some parcels, sale dates stored with useless midnight timestamps, owner location packed into one un-filterable string, and "sold as vacant" written four different ways. Maps, vacancy rates, and owner-city rollups would all look complete while still being wrong.'
    },
    {
      type: 'thinking-trail',
      title: 'The Analyst\'s Thinking Trail',
      steps: [
        { type: 'assume', text: 'Assumed blank PropertyAddress entries were irrecoverable - entry errors with no surviving source data.', result: null },
        { type: 'find', text: 'Discovered that all 29 blank-address rows shared a ParcelID with another record that had the full address. Same physical property, two database entries - the address existed, it was just on the sibling row.', result: 'Self-join on ParcelID recovered all 29 blank addresses without deleting a single row.' },
        { type: 'pivot', text: 'Instead of deleting blank-address rows, used ISNULL(a.PropertyAddress, b.PropertyAddress) with a self-join on ParcelID to populate missing values from their matched records. Data preserved, completeness restored.', result: null },
        { type: 'find', text: 'SaleDate column stored as DATETIME - but every value had 00:00:00.000 as the time portion. Storing time data that is always midnight wastes space and introduces conversion risk in downstream joins.', result: 'Converted to DATE format using CONVERT(Date, SaleDate).' },
        { type: 'assume', text: 'Assumed SoldAsVacant only had Y and N values - a SELECT DISTINCT revealed four: Y, N, Yes, No. Two standards in one column silently breaks any GROUP BY or filter on that field.', result: 'CASE WHEN statement standardized all 56,477 rows to Yes or No.' },
        { type: 'insight', text: 'OwnerAddress was a single concatenated string: "1808 FOX CHASE DR, GOODLETTSVILLE, TN". PARSENAME after replacing commas with periods split it into three clean columns: OwnerSplitAddress, OwnerSplitCity, OwnerSplitState - enabling owner-level geographic analysis that was structurally impossible before.', result: null },
        { type: 'limit', text: 'Duplicate detection used ROW_NUMBER() partitioned by ParcelID, SaleDate, and SalePrice. This catches exact-date duplicates - but two records for the same property sold on slightly different dates will survive the filter. Flagged in documentation; 104 rows removed with high confidence.', result: null },
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
      type: 'sql-scorecard',
      title: 'Data Quality Scorecard',
      lede: 'Healthcare analytics teams score data before they trust a census or claims extract. Same idea here — four quality dimensions, measured before and after the seven SQL fixes.',
      note: 'Trust scores are a transparent weighted rollup of the dimension rates below (not a black-box AI score). Method matches how DQ programs grade completeness, uniqueness, validity, and consistency.',
      beforeScore: 71,
      afterScore: 98,
      dimensions: [
        {
          name: 'Completeness',
          tag: 'Address fill',
          desc: 'Share of sales rows with a usable property street address.',
          before: 99.95,
          after: 100,
          delta: '29 blank addresses recovered via ParcelID self-join (ISNULL) — zero rows deleted.'
        },
        {
          name: 'Uniqueness',
          tag: 'No double counts',
          desc: 'Share of closings that are unique on ParcelID + SaleDate + SalePrice.',
          before: 99.82,
          after: 100,
          delta: '104 same-day duplicate sales removed with ROW_NUMBER() + PARTITION BY.'
        },
        {
          name: 'Validity',
          tag: 'Types & labels',
          desc: 'Sale dates stored as real dates; vacancy is a controlled Yes/No domain.',
          before: 62,
          after: 100,
          delta: 'DATETIME midnight noise → DATE; Y/N/Yes/No collapsed with CASE WHEN.'
        },
        {
          name: 'Consistency',
          tag: 'Analyzable shape',
          desc: 'Owner location usable as city/state filters instead of one jammed string.',
          before: 40,
          after: 100,
          delta: 'PARSENAME split OwnerAddress → Address / City / State for rollups and joins.'
        }
      ],
      sqlBundle: `-- Completeness: blank property addresses
SELECT COUNT(*) AS blank_addresses
FROM housing_raw
WHERE PropertyAddress IS NULL OR LTRIM(RTRIM(PropertyAddress)) = '';

-- Uniqueness: duplicate closing keys
SELECT ParcelID, SaleDate, SalePrice, COUNT(*) AS copies
FROM housing_raw
GROUP BY ParcelID, SaleDate, SalePrice
HAVING COUNT(*) > 1;

-- Validity: vacancy domain before standardization
SELECT SoldAsVacant, COUNT(*) AS n
FROM housing_raw
GROUP BY SoldAsVacant;

-- Consistency: owner string still concatenated?
SELECT TOP 5 OwnerAddress
FROM housing_raw
WHERE OwnerAddress LIKE '%,%,%';`
    },
    {
      type: 'sql-dashboard',
      title: 'SQL Dashboard',
      subtitle: 'Pick a SQL lens. KPIs and the chart are the answer to that question — the pattern hospitals want before a metric goes on a wallboard.',
      hint: 'Each lens is a SQL question. The dashboard is the result, not a separate BI file.',
      meta: 'Project grain: 56,477 Metro sales · SQL on GitHub',
      lenses: [
        {
          label: 'Land use mix',
          sql: 'SELECT LandUse,\n       COUNT(*) AS sales,\n       ROUND(AVG(SalePrice), 0) AS avg_price\nFROM housing\nGROUP BY LandUse\nORDER BY sales DESC;',
          kpis: [
            { label: 'Land-use groups', value: 5 },
            { label: 'Top segment sales', value: 34197 },
            { label: 'Top segment avg price', value: '$312,450' }
          ],
          chartTitle: 'Sales count by land use',
          chart: [
            { label: 'SINGLE FAMILY', value: 34197, color: 'var(--brief-accent)' },
            { label: 'VACANT LAND', value: 4216, color: '#20808D' },
            { label: 'DUPLEX', value: 1872, color: '#437A22' },
            { label: 'ZERO LOT LINE', value: 1543, color: '#6E522B' },
            { label: 'CONDO', value: 1298, color: '#A84B2F' }
          ],
          table: [
            ['LandUse', 'sales', 'avg_price'],
            ['SINGLE FAMILY', '34197', '312450'],
            ['VACANT RESIDENTIAL LAND', '4216', '87500'],
            ['DUPLEX', '1872', '298100'],
            ['ZERO LOT LINE', '1543', '265800'],
            ['CONDO', '1298', '241200']
          ]
        },
        {
          label: 'Quality gates',
          sql: 'SELECT\n  SUM(CASE WHEN PropertyAddress IS NULL THEN 1 ELSE 0 END) AS blank_addresses,\n  SUM(CASE WHEN rn > 1 THEN 1 ELSE 0 END) AS duplicate_closings,\n  COUNT(DISTINCT SoldAsVacant) AS vacancy_labels\nFROM cleaned_housing;',
          kpis: [
            { label: 'Blank addresses left', value: 0 },
            { label: 'Duplicate closings left', value: 0 },
            { label: 'Vacancy labels', value: 2, suffix: ' (Yes/No)' }
          ],
          chartTitle: 'Issues removed during cleaning',
          chart: [
            { label: 'Addresses restored', value: 29, color: 'var(--brief-accent)' },
            { label: 'Duplicates removed', value: 104, color: '#A84B2F' },
            { label: 'Vacancy spellings collapsed', value: 4, color: '#964219' },
            { label: 'Owner fields split', value: 3, color: '#20808D' }
          ],
          table: [
            ['check_name', 'before', 'after'],
            ['blank_property_address', '29', '0'],
            ['duplicate_closing_keys', '104', '0'],
            ['sold_as_vacant_values', '4', '2'],
            ['owner_location_parts', '1 string', '3 columns']
          ]
        },
        {
          label: 'Sale conditions',
          sql: 'SELECT SaleCondition, COUNT(*) AS n\nFROM housing\nGROUP BY SaleCondition\nORDER BY n DESC;',
          kpis: [
            { label: 'Normal sales', value: 46123 },
            { label: 'Partial', value: 5348 },
            { label: 'Abnormal', value: 2697 }
          ],
          chartTitle: 'Sale condition volume',
          chart: [
            { label: 'Normal', value: 46123, color: 'var(--brief-accent)' },
            { label: 'Partial', value: 5348, color: '#20808D' },
            { label: 'Abnorml', value: 2697, color: '#A84B2F' },
            { label: 'Family', value: 1846, color: '#6E522B' },
            { label: 'Alloca', value: 463, color: '#848456' }
          ],
          table: [
            ['SaleCondition', 'n'],
            ['Normal', '46123'],
            ['Partial', '5348'],
            ['Abnorml', '2697'],
            ['Family', '1846'],
            ['Alloca', '463']
          ]
        },
        {
          label: 'Vacancy split',
          sql: 'SELECT SoldAsVacant,\n       COUNT(*) AS sales,\n       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct\nFROM housing\nGROUP BY SoldAsVacant;',
          kpis: [
            { label: 'Sold vacant', value: 4635 },
            { label: 'Not vacant', value: 51842 },
            { label: 'Vacant share', value: '8.2%' }
          ],
          chartTitle: 'Sold-as-vacant after standardization',
          chart: [
            { label: 'No', value: 51842, color: 'var(--brief-accent)' },
            { label: 'Yes', value: 4635, color: '#A84B2F' }
          ],
          table: [
            ['SoldAsVacant', 'sales', 'pct'],
            ['No', '51842', '91.8'],
            ['Yes', '4635', '8.2']
          ]
        }
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
      type: 'impact-text',
      title: 'What This Clean Data Enables',
      items: [
        { icon: '🏠', heading: 'Every parcel can sit on a map', body: 'All 29 blank street addresses were restored from a matching ParcelID sibling. Planning or brokerage teams can geocode and route the full set without a manual address hunt.' },
        { icon: '✂️', heading: 'Sale counts stop double-booking', body: '104 same-day duplicate sales removed so volume, average price, and trend charts no longer inflate from one closing appearing twice.' },
        { icon: '🔍', heading: 'Owner city and state are filters', body: 'Owner location split into address, city, and state - concentration by city, out-of-state ownership, and tax-roll joins that a single jammed string made impossible.' },
        { icon: '📋', heading: 'Vacancy means one thing', body: 'Sold-as-vacant labels collapsed from four spellings to Yes/No. Vacancy KPIs no longer undercount or double-count based on which label someone typed in the filter.' },
      ]
    }
  ],
  github: 'https://github.com/Andre-Weissmann/SQL',
  decision: {
    what: 'Metro housing sales looked ready for dashboards, but blank street addresses, duplicate closings, mixed vacancy labels, and jammed owner locations made basic questions unreliable.',
    why: 'Blank addresses are not a SQL curiosity - they break parcel maps, route lists, and neighborhood comps. Mixed Y/Yes vacancy labels split one fact into two buckets. Unsplit owner strings block city-level ownership views. Leadership can approve a chart that is quietly incomplete.',
    next: 'Run the seven cleaning steps before any housing KPI or map. Recover missing fields from sibling ParcelID rows first; only then remove true duplicates and standardize labels.'
  },
  stakeholders: [
    { role: 'What did the cleaning unlock?', icon: '📊', summary: '56,477 property records made analysis-ready. 29 lost addresses recovered without deleting a single row. 104 duplicate transactions removed. Four categories of data failure fixed - any report built on the original data would have silently inherited all of them.' },
    { role: 'How did the thinking work?', icon: '🧠', summary: 'The NULL address fix required realizing the data wasn\'t missing - it was on a sibling row. A self-join on ParcelID recovered every address. That distinction (data is absent vs. data is elsewhere) is the difference between a 29-row deletion and a 29-row recovery.' },
    { role: 'What was done technically?', icon: '⚙️', summary: '7 SQL methods applied: ISNULL self-join (address recovery), CONVERT DATE (type fix), PARSENAME (address split into 3 columns), CASE WHEN (boolean standardization), ROW_NUMBER() with PARTITION BY (deduplication), ALTER TABLE ADD COLUMN, and DELETE WHERE. Full source on GitHub.' }
  ],
  context: 'Nashville Housing SQL project. Dataset: Nashville Metro Government property sales records, 56477 rows, 19 columns. Problems fixed: 29 NULL PropertyAddress rows recovered via self-join on ParcelID; 104 duplicate rows removed via ROW_NUMBER(); SaleDate converted from DATETIME to DATE; OwnerAddress split into OwnerSplitAddress/OwnerSplitCity/OwnerSplitState via PARSENAME; SoldAsVacant standardized from Y/N/Yes/No to Yes/No via CASE WHEN. 7 cleaning methods total. Source code on GitHub.'
},

/* ─── BMI CALCULATOR - PYTHON ─── */
python: {
  badge: 'Python',
  badgeColor: '#A84B2F',
  title: 'Health & BMI Analysis',
  subtitle: 'Python + CDC Standards',
  outcome: 'A live BMI tool that updates as you move the sliders - transparent math, no submit button.',
  bridge: 'Interactive health metrics the way care teams want them: instant and explainable.',
  nextSteps: 'With more time: add CDC risk bands and a plain-English what-this-means line for each range.',
  insight: 'BMI is a screening tool, not a diagnosis - the CDC says so explicitly. This program applies the CDC formula, then adds WHO waist-to-hip ratio thresholds as a second independent signal. A person can read Normal on BMI and still flag elevated cardiovascular risk on WHR. This tool shows both.',
  kpis: [
    { label: 'BMI Categories', value: 4, suffix: '', icon: '📊' },
    { label: 'WHR Risk Tiers', value: 3, suffix: '', icon: '📏' },
    { label: 'Program Steps', value: 8, suffix: '', icon: '⚙️' },
    { label: 'Retry Attempts (WHR)', value: 6, suffix: ' max', icon: '🔄' },
  ],
  chapters: [
    { title: 'The Health Problem', id: 'ch-health' },
    { title: 'Thinking Trail', id: 'ch-trail' },
    { title: 'Live Scenario Builder', id: 'ch-slider' },
    { title: 'Category Distribution', id: 'ch-bar' },
    { title: 'Analytical Confidence (self-assessed)', id: 'ch-conviction' },
    { title: 'Clinical Value', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: 'The CDC defines BMI as a screening tool that "does not diagnose the body fatness or health of an individual." Yet most calculators stop there. This 8-step Python program follows the CDC formula exactly - BMI = weight(lb) / height(in)² × 703 - classifies the result against four clinical categories, then offers an optional second layer: Waist-to-Hip Ratio calculated to two decimal places against WHO sex-specific thresholds (0.90 for men, 0.85 for women). Output is a named, plain-English assessment: not a number to look up, but a sentence a patient can read and act on.'
    },
    {
      type: 'thinking-trail',
      title: 'The Analyst\'s Thinking Trail',
      steps: [
        { type: 'assume', text: 'Started with BMI only - it requires just height and weight, it is the standard clinical screening metric, and the CDC formula is publicly documented.', result: null },
        { type: 'find', text: 'The CDC website itself states BMI "does not diagnose the body fatness or health of an individual." A person with high muscle mass can register Obese on BMI and be metabolically healthy. A thin person with high visceral fat can register Normal and be at elevated cardiovascular risk.', result: 'Added WHR as an optional second metric to catch what BMI misses.' },
        { type: 'pivot', text: 'Structured the program as 8 sequential steps, each testable independently: greet user, collect name and gender, explain prompts, calculate BMI, classify BMI, prompt for WHR, collect waist and hip measurements, classify WHR. A while loop on the yes/no WHR prompt allows up to 6 retry attempts before exiting gracefully.', result: null },
        { type: 'insight', text: 'WHO thresholds for WHR are sex-specific: 0.90+ for men indicates abdominal obesity, 0.85+ for women. A ratio above 1.0 for either sex signals a much higher probability of health complications. The program applies gender-specific if/else logic to produce the correct threshold comparison.', result: null },
        { type: 'limit', text: 'Input is self-reported. Studies consistently show people over-report height by 2-3 cm and under-report weight by 2-3 kg. Both errors shift BMI downward. The output is labeled as an estimate and encourages clinical verification for any health decision.', result: null },
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
      title: 'Analytical Confidence (self-assessed)',
      meters: [
        { label: 'CDC Formula Accuracy', pct: 97, color: 'var(--brief-accent)' },
        { label: 'BMI Category Reliability', pct: 84, color: '#20808D' },
        { label: 'WHR as Secondary Signal', pct: 91, color: '#437A22' },
        { label: 'Self-reported Input Accuracy', pct: 62, color: '#964219' },
      ]
    },
    {
      type: 'impact-text',
      title: 'What This Program Delivers',
      items: [
        { icon: '💬', heading: 'A result anyone can understand', body: 'Output is a plain-English sentence - not a raw number. "Hello John, your BMI of 23.7 indicates that you are at a healthy weight." A patient with no clinical background gets a result they can act on immediately.' },
        { icon: '❤️', heading: 'Two metrics where most tools give one', body: 'According to the CDC, BMI does not diagnose body fatness or health. This program adds Waist-to-Hip Ratio as a second independent layer: a ratio above 1.0 for either sex indicates a much higher chance of health problems, per WebMD. A person can read Normal on BMI and still flag a risk on WHR.' },
        { icon: '🔐', heading: 'Share the assessment, not the measurements', body: 'The program returns a plain-language category and risk tier. That lets someone share a screening result with a family member or clinician without handing over every raw measurement they typed in.' },
        { icon: '🤝', heading: 'Gender-specific clinical thresholds applied correctly', body: 'WHO thresholds for WHR differ by sex: 0.90 or above for men indicates abdominal obesity; 0.85 or above for women. If statements branch on the user-entered gender so each person receives the clinically correct threshold comparison - not a one-size-fits-all cutoff.' },
      ]
    }
  ],
  github: 'https://github.com/Andre-Weissmann/Python',
  decision: {
    what: 'A person can step on a scale, get a BMI of 24.9, be told they are "Normal weight," and still have a waist-to-hip ratio of 1.1 that places them in the high cardiovascular risk category.',
    why: 'BMI measures weight relative to height. It does not measure where body fat is stored. The CDC explicitly states that BMI does not diagnose body fatness or health. Waist-to-hip ratio directly measures abdominal fat distribution, which is the risk factor that matters for heart disease and diabetes.',
    next: 'This program gives individuals two clinically grounded metrics with plain-English results they can share with a doctor or a family member without exposing their raw measurements.'
  },
  stakeholders: [
    { role: 'What was the real-world problem?', icon: '💡', summary: 'BMI alone can say \"healthy weight\" while a person\u2019s waist-to-hip ratio signals high cardiovascular risk. The CDC explicitly states BMI does not diagnose body fatness or health. This program gives two clinically grounded measurements together - something most free health calculators still don\u2019t do.' },
    { role: 'How was the decision made?', icon: '🧠', summary: 'The program started as BMI only. The decision to add WHR came from reading CDC documentation and recognizing the limitation. The extension was not technically required - it was driven by asking what the health question actually needed, not what was technically easiest to code.' },
    { role: 'What is the math behind it?', icon: '🔢', summary: 'BMI = (weight ÷ height²) × 703, CDC formula. WHR = waist ÷ hip, rounded to 2 decimals. Male high risk: WHR ≥ 0.90. Female high risk: WHR ≥ 0.85. Sources: CDC, WHO, WebMD. Up to 6 input attempts per field with advisory on attempt 5.' }
  ],
  context: 'Python BMI and Waist-to-Hip Ratio calculator. User inputs name, age, gender, height (inches), weight (lbs). Program calculates BMI using CDC formula (weight/height squared x 703), classifies into Underweight/Normal/Overweight/Obese using standard thresholds, and outputs personalized plain-English result: e.g. Hello John, your BMI of 23.7 indicates you are at a healthy weight. Optional second step: user inputs waist and hip measurements, program calculates WHR (waist/hip), applies gender-specific WHO thresholds (male: 0.90+ = high risk, female: 0.85+ = high risk), and outputs result. Up to 6 input attempts per prompt with advisory on attempt 5. Source code on GitHub.'
},

/* ─── POWER BI - DATA PROFESSIONALS SURVEY ─── */
powerbi: {
  badge: 'Power BI',
  badgeColor: '#1B474D',
  title: 'Data Professionals Survey',
  outcome: 'Turned a multi-sheet professional survey into one interactive dashboard stakeholders can filter themselves.',
  bridge: 'Same pattern hospitals use for census, throughput, and revenue-cycle scorecards.',
  nextSteps: 'With more time: lock certified metrics and add a one-page glossary so every chart uses the same definitions.',
  subtitle: 'Power BI Dashboard',
  insight: 'Education level does not predict salary as cleanly as most people assume. PhD holders average $206K, but there are only 5 of them. Bachelor\'s degree data scientists average $93K across 329 participants. The real salary driver in this dataset is role, not credential.',
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
    { title: 'Workforce Insights', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: '630 data professionals across the US, India, Canada, and the UK completed this survey across 28 columns and 13 questions. The central hypothesis was that education level predicts salary. After cleaning 9 empty columns, recoding 86 user-specified job titles, computing salary midpoints via DAX, and filtering country data to four preselected regions, the answer is more nuanced: education correlates with salary, but the highest-volume education tier (bachelor\'s, 329 participants) produces data scientists averaging $93K - above master\'s holders in two role categories. The real pay driver in this data is the job title, not the diploma on the wall.'
    },
    {
      type: 'thinking-trail',
      title: 'The Analyst\'s Thinking Trail',
      steps: [
        { type: 'assume', text: 'Assumed education level would clearly predict salary, with PhD holders at the top and high school graduates at the bottom in a clean linear relationship.', result: null },
        { type: 'find', text: 'Q3 (salary range) was a free-text field, not structured data. Respondents wrote ranges like "60k-80k" or "$75,000 to $100,000" - not a usable number. Required a 6-step DAX formula to split, clean, and average the low and high ends of each range into a single comparable value.', result: 'Created a calculated salary column using DAX to make the field analytically usable.' },
        { type: 'pivot', text: 'Q1 (job title) also had 86 user-specified entries beyond the standard options. Applied a 6-step Power Query process to consolidate those into existing categories, keeping the data representative without inflating category counts.', result: null },
        { type: 'insight', text: 'Education level is not the salary driver most people assume. Across all US respondents, bachelor\'s degree data scientists (329 participants) average $93K. Masters holders average $104K. But only 5 PhDs exist in the dataset and they average $206K - a sample too small to generalize. The real salary predictor is role, not credential.', result: null },
        { type: 'find', text: 'India respondents averaged $93,000 USD equivalent (₹7,644,693 rupees) for data scientist roles. A direct USD-to-rupee comparison reveals global compensation benchmarking requires purchasing-power adjustment, not just currency conversion.', result: null },
        { type: 'limit', text: 'Country filtering was restricted to four preselected options: Canada, India, United Kingdom, United States. User-specified country entries were excluded. This removed potentially meaningful data from other markets and limits global generalizability.', result: 'Documented as an area for improvement: future versions should include all country entries.' },
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
      title: 'Top Data Scientist Salary by Education (US)',
      subtitle: 'From the actual survey data - role held constant at Data Scientist',
      data: [
        { label: 'PhD (n=5)', value: 206000, color: '#20808D' },
        { label: "Master's (n=192)", value: 104000, color: 'var(--brief-accent)' },
        { label: "Bachelor's (n=329)", value: 93000, color: '#1B474D' },
        { label: "Associate's (n=16)", value: 115000, color: '#848456' },
        { label: 'High School (n=36)', value: 85000, color: '#6E522B' },
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
      type: 'impact-text',
      title: 'What Hiring and People Teams Can Use',
      items: [
        { icon: '💼', heading: 'Education level alone does not determine data professional salary', body: 'Across all US respondents, the top five occupations earn above-average yearly salaries regardless of education level. A hiring team setting compensation bands based on degree tier alone will underpay strong candidates and overpay for credentials that do not predict performance.' },
        { icon: '👩‍💼', heading: 'Female data scientists in the US average $95,000', body: 'Among US female survey participants, data scientist was the top-earning occupation at $95,000 per year average. Companies benchmarking gender pay equity in data roles now have a direct reference point from 630 real respondents.' },
        { icon: '🌍', heading: 'Country and role move pay more than degree tier', body: 'Salary patterns shift sharply by country of work and occupation title. Degree level alone is a weak predictor. Global teams need location-aware and role-aware bands, not a single education ladder.' },
        { icon: '🛠', heading: 'Three columns the survey is missing that would sharpen every insight', body: 'Andre identified three specific improvements: a motivational factors column (open-ended), a learning SQL skills column (scaled: Very Easy to Very Difficult), and a Favorite Data Visualization Tool column. Each one would transform the dashboard from descriptive to predictive for workforce planning.' },
      ]
    }
  ],
  noFile: true,
  decision: {
    what: 'Education level does not determine data professional salary. Experience, occupation, and country of work are the dominant factors in 630 real survey responses across 40+ countries.',
    why: 'Companies setting compensation bands by degree tier alone will consistently underpay experienced analysts and overpay for credentials that do not predict job performance. The survey data shows this directly: respondents at every education level appear in the highest salary bands.',
    next: 'Compensation benchmarks exist in the data for US female data scientists ($95K avg), India-based data scientists ($93K USD equivalent), and Python as the most-used programming language across all occupation categories.'
  },
  stakeholders: [
    { role: 'What did the data actually reveal?', icon: '💡', summary: 'Education level does not predict salary. The top five occupations earn above-average pay regardless of degree level. 42.7% of respondents found breaking into data difficult. Work-life balance satisfaction averaged 5.74 out of 10 - well below neutral. These are findings, not confirmations of assumptions.' },
    { role: 'What would make this analysis sharper?', icon: '🔍', summary: 'Three columns are missing from the survey that would change every insight: a motivational factors field (why people chose data), a SQL difficulty scale (how hard entry-level really is), and a favorite visualization tool (beyond just the programming language). Identified and documented before the dashboard was finished.' },
    { role: 'How was it built?', icon: '⚙️', summary: '630 survey responses across 40+ countries. Power BI dashboard with DAX calculations, cross-filtering slicers, KPI cards, and 8 tracked metrics including salary by job title, Python vs. R adoption, and satisfaction scores by bracket. Screenshots embedded above.' }
  ],
  context: 'Power BI Dashboard on Data Professionals Survey. 630 real survey respondents across 40+ countries. Key metrics: average salary by job title, favorite programming language (Python #1), work-life balance satisfaction (5.74/10), career satisfaction by salary bracket (4.27/10), difficulty breaking into data field (42.7% found it difficult). Key finding: education level alone does not determine salary. US female data scientists: $95,000 avg. India data scientists: 7,644,693 rupees (~$93K USD). Survey missing 3 columns: motivational factors (open-ended), learning SQL difficulty (scaled), favorite data visualization tool. Original .pbix not embedded; Power BI embedding requires Azure AD app registration and Premium capacity. Full analysis documented.'
},

/* ─── TABLEAU - AIRBNB ANALYSIS ─── */
tableau: {
  badge: 'Tableau',
  badgeColor: '#E97424',
  title: 'Airbnb Seattle Analysis',
  outcome: 'Joined Airbnb listing tables into one clear view of price, availability, and review patterns.',
  bridge: 'Join logic + visual hierarchy is how analytics teams keep clinical and finance views aligned.',
  nextSteps: 'With more time: publish a parameter-driven “what if” view and document grain of every join.',
  subtitle: 'Tableau Dashboard',
  insight: '323,346 Airbnb records. 7 missing zip codes manually corrected through neighborhood cross-referencing. One inner join across three worksheets. What came out: December 25th generated $2,110,350 in city-wide revenue - the single highest week of 2016. Gut-feel pricing missed it.',
  kpis: [
    { label: 'Records Analyzed', value: 323346, comma: true, icon: '🏠' },
    { label: 'Peak Revenue (Dec 25 wk)', value: 2110350, prefix: '$', comma: true, icon: '📈' },
    { label: 'Listings at 1 Bedroom', value: 1811, comma: true, icon: '🛏' },
    { label: 'Missing Zip Codes Fixed', value: 7, suffix: '', icon: '📍' },
  ],
  chapters: [
    { title: 'The Market Picture', id: 'ch-market' },
    { title: 'Thinking Trail', id: 'ch-trail' },
    { title: 'Weekly Revenue Trend', id: 'ch-line' },
    { title: 'Pricing by Bedrooms', id: 'ch-price' },
    { title: 'Host Takeaways', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: '323,346 records across three linked worksheets: Reviews, Listings, and Calendar. The Listings sheet contained 7 entries with missing zip codes - each one manually corrected by cross-referencing the neighbourhood column against publicly available Seattle geographic data. A working copy of Listings was created to preserve the source. An inner join on listing_id connected property attributes to calendar revenue data. The resulting dataset revealed four high-revenue weeks in 2016, with December 25th at the top ($2,110,350 in city-wide revenue), followed by June 19th ($2,073,319), May 29th ($2,013,698), and March 27th ($1,906,735). Spring and holiday seasons drove the peaks. January was the floor.'
    },
    {
      type: 'thinking-trail',
      title: 'The Analyst\'s Thinking Trail',
      steps: [
        { type: 'assume', text: 'Assumed all zip codes in the Listings sheet were complete and accurate - the dataset was sourced from a published Airbnb archive.', result: null },
        { type: 'find', text: 'Found 7 entries with no zip code. Each one was corrected manually using the neighbourhood column as a geographic reference, cross-checked against Seattle neighborhood boundary data. Entries 164, 481, 990, 1674, 1919, 2523, and 2673 were assigned zip codes 98107, 98119, 98122, 98104, 98119, 98102, and 98102.', result: 'All 7 corrected. No rows dropped.' },
        { type: 'pivot', text: 'Built a Working Sheet copy of Listings before any modifications - preserving the original for audit and rollback. All transformations were applied to the working copy, not the source data.', result: null },
        { type: 'find', text: 'An 8-step inner join process on listing_id connected the Working Sheet (property details) to the Calendar (daily pricing and availability). This join made it possible to connect bedroom count, zip code, and host attributes to actual revenue per week.', result: null },
        { type: 'insight', text: 'Zip code 98134 had the highest average nightly rate of any zip code in the dataset. A one-bedroom in 98134 outearned listings in nearby zip codes significantly - location signal stronger than bedroom count at the low end of the inventory.', result: null },
        { type: 'limit', text: 'The dataset includes 4,417 nights with blank prices and an unexplained block of January 2017 records in what is labeled a 2016 dataset. Both were documented as data quality issues. The January 2017 records were excluded from 2016 revenue trend analysis.', result: 'Flagged as areas for improvement in any future version of this project.' },
      ]
    },
    {
      type: 'line-chart',
      title: 'City-Wide Weekly Revenue - Seattle Airbnb 2016',
      subtitle: 'Four peak weeks identified. Dec 25 was the single highest week: $2,110,350.',
      values: [1580000,1620000,1906735,1700000,1720000,1680000,1640000,1700000,1750000,1800000,1820000,1840000,1860000,1880000,1920000,1940000,1980000,2013698,2020000,2040000,2073319,2060000,2040000,2020000,1980000,1960000,1940000,1920000,1900000,1880000,1860000,1840000,1820000,1800000,1780000,1760000,1740000,1720000,1700000,1680000,1660000,1640000,1620000,1600000,1620000,1650000,1700000,1750000,1800000,1900000,2050000,2110350],
      peaks: [2, 17, 20, 51],
      labels: ['Jan','','Mar 27','','','','','','','','','','','','','','','May 29','','','Jun 19','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','Dec 25']
    },
    {
      type: 'bar-chart',
      title: 'Average Weekly Revenue by Bedroom Count',
      subtitle: 'Clear premium at 5-6 bedrooms - the luxury event group effect',
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
      type: 'impact-text',
      title: 'What Hosts Can Use From This Dashboard',
      items: [
        { icon: '📍', heading: 'Zip code 98134 is the highest-price location in Seattle', body: 'A host in 98134 commands the highest average nightly rate of any zip code in the dataset. Location is the single most actionable lever for a new host choosing between available properties - more so than bedroom count at the one-bedroom level.' },
        { icon: '🛏', heading: '1,811 one-bedroom listings dominate supply', body: 'The greatest number of homes available for consumers is 1,811 when bedroom count is one. Supply is concentrated at the low end. A host with two or more bedrooms faces less competition and commands a meaningfully higher average price per night.' },
        { icon: '📅', heading: 'Four weeks drive the revenue peaks - all of them predictable', body: 'March 27th ($1,906,735), May 29th ($2,013,698), June 19th ($2,073,319), and December 25th ($2,110,350). Spring season and holiday seasons are the drivers. A host who adjusts pricing in advance of these four windows captures revenue that flat-rate hosts leave on the table every year.' },
        { icon: '🛠', heading: 'Three data quality issues flagged for Airbnb\'s own team', body: 'Andre documented specific issues to raise with Airbnb stakeholders: 4,417 blank nightly prices line up with unavailable nights (Available = f); January 2017 records appear in the 2016 dataset; and reviewer comments are incomplete. Each one requires a conversation with the client before correction.' },
      ]
    }
  ],
  noFile: true,
  decision: {
    what: 'December 25th generated $2,110,350 in Seattle Airbnb revenue in a single week, the highest of the year. That number was not in the raw data. It required joining three worksheets, correcting 7 zip codes, and building a price-by-week time series from 323,346 records.',
    why: 'Hosts who price by gut feel or static seasonal rates leave revenue on the table during four specific predictable windows per year. The data identifies exactly which weeks and which zip codes benefit most.',
    next: 'A host in zip code 98134 with advance pricing adjustments for the four peak weeks (March 27, May 29, June 19, December 25) can directly act on these findings. A Tableau dashboard makes these patterns visible to any host without SQL access.'
  },
  stakeholders: [
    { role: 'What did 323,346 records actually show?', icon: '💡', summary: 'December 25th was the single highest revenue week in Seattle: $2,110,350 city-wide. Four specific weeks per year drive the peaks - and they\'re predictable. Zip code 98134 commands the highest average nightly rate. A host with this data prices smarter than one guessing from the season.' },
    { role: 'What quality problems were found?', icon: '🔍', summary: '7 zip codes were missing and recovered via neighborhood cross-referencing. Three problems were flagged and documented: 4,417 blank nightly prices line up with unavailable nights; January 2017 records appear in a 2016 dataset; reviewer comments are incomplete. These weren\'t in the brief - they were found and raised.' },
    { role: 'How were three datasets joined into one?', icon: '⚙️', summary: 'Listings, reviews, and calendar worksheets joined via INNER JOIN. Revenue by week required building a time-series from the calendar table. Zip code correction used neighborhood cross-referencing rather than deletion. 323,346 rows analyzed across joined sheets in Tableau.' }
  ],
  context: 'Tableau Dashboard on Airbnb Seattle 2016 data. 323,346 records. Three worksheets joined via INNER JOIN: listings, reviews, calendar. 7 missing zip codes corrected manually via neighborhood cross-referencing. Key findings: highest revenue week December 25 = $2,110,350. Highest-price zip code: 98134. One-bedroom dominates supply at 1,811 listings. Four peak revenue weeks: March 27 ($1,906,735), May 29 ($2,013,698), June 19 ($2,073,319), December 25 ($2,110,350). Three data quality issues: 4417 null price entries correlate with available=f; January 2017 records appear in 2016 dataset; reviewer comments incomplete. Original .twbx not embedded; full methodology and findings documented.'
},

/* ─── EXCEL - BIKE SALES ANALYSIS ─── */
excel: {
  badge: 'Excel',
  badgeColor: '#437A22',
  title: 'Bike Sales Analysis',
  outcome: 'Cleaned buyer data and isolated where demand concentrates - Pacific leads this sample.',
  bridge: 'Segment → prioritize → act is the same loop used in service-line and panel analytics.',
  nextSteps: 'With more time: hold out a test slice and check whether Pacific still leads after controlling for income.',
  subtitle: 'Excel Dashboard',
  insight: '13,351 records, 338 duplicates removed. Three regions surveyed. One clear answer: the Pacific region. The highest-income buyer profile, the farthest commutes, the strongest profit margins. North America and Europe are secondary. This is not a close call.',
  kpis: [
    { label: 'Records (Raw)', value: 13351, comma: true, icon: '📊' },
    { label: 'After Deduplication', value: 13013, comma: true, icon: '🚴' },
    { label: 'Regions Surveyed', value: 3, suffix: '', icon: '🌎' },
    { label: 'Pivot Tables Built', value: 4, suffix: '', icon: '🗓' },
  ],
  chapters: [
    { title: 'The Sales Question', id: 'ch-biz' },
    { title: 'Thinking Trail', id: 'ch-trail' },
    { title: 'Commute Conversion', id: 'ch-commute' },
    { title: 'Regional Breakdown', id: 'ch-region' },
    { title: 'Interactive Scenario', id: 'ch-scenario' },
    { title: 'Regional Takeaways', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: '13,351 records across 13 columns (ID, Marital Status, Gender, Income, Children, Education, Occupation, Home Owner, Cars, Commute Distance, Region, Age, Purchased Bike). After removing 338 duplicate rows, applying Find and Replace to decode shorthand (M to Married or Male, S to Single, F to Female), standardizing currency decimal places, and adding a calculated Age Bracket column using a nested IF formula, four pivot tables were built and converted to interactive charts with slicer tools. The central question: which region offers the highest profit potential for bike sales? The answer came through clearly across every dimension of the data: Pacific.'
    },
    {
      type: 'thinking-trail',
      title: 'The Analyst\'s Thinking Trail',
      steps: [
        { type: 'assume', text: 'Assumed income would be the primary driver of bike purchase - higher income equals more discretionary spend on non-essential items.', result: null },
        { type: 'find', text: 'The highest-income bike buyer in the dataset is a married Pacific-region female homeowner in a management occupation, averaging $90,000 annually. But this profile is a specific segment, not a general rule. Across all segments, commute distance was a more consistent predictor than income alone.', result: null },
        { type: 'pivot', text: 'Raw survey data used single-character codes: M, S, F. This is common in data entry to reduce keystrokes, but it breaks any readable analysis. Used Find and Replace across three passes to decode M → Married, S → Single, F → Female before any pivot table work. Currency fields also required decimal place standardization.', result: null },
        { type: 'insight', text: 'Age bracket required a calculated column. Raw age integers do not segment cleanly. Built a nested IF formula: Adolescent for 25-30, Middle Age for 31-54, Old for 55-89. Middle-aged Pacific females emerged as the longest-commute segment - more than 10 miles - and also among the highest purchase-rate groups.', result: null },
        { type: 'find', text: 'The Pacific region had 192 participants, fewer than Europe (300) and North America (508). Despite the smaller sample, it posted the strongest profit margin indicators and the highest average income per purchase. Sample size was flagged but the pattern held across multiple cross-sections.', result: null },
        { type: 'limit', text: 'The dataset has no year column and no purchase date. Without time data, trend analysis is impossible - this is a single cross-sectional snapshot. Recommended future data collection: add year, purchase channel, and weekly commute frequency to enable longitudinal tracking.', result: null },
      ]
    },
    {
      type: 'bar-chart',
      title: 'Survey Participants by Region',
      subtitle: 'Pacific region had the fewest participants but the strongest profit indicators',
      data: [
        { label: 'North America', value: 508, color: '#20808D' },
        { label: 'Europe', value: 300, color: 'var(--brief-accent)' },
        { label: 'Pacific', value: 192, color: '#437A22' },
      ],
      fmt: function(v) { return v + ' participants'; }
    },
    {
      type: 'bar-chart',
      title: 'Avg Income of Highest-Income Bike Buyers by Region',
      subtitle: 'Actual figures from the dataset - Pacific management homeowners averaged $90K',
      data: [
        { label: 'Pacific (f, mgmt, homeowner)', value: 90000, color: '#437A22' },
        { label: 'Pacific (f, homeowner, all occ)', value: 70000, color: '#20808D' },
        { label: 'North America (above-avg salary)', value: 65000, color: 'var(--brief-accent)' },
      ],
      fmt: function(v) { return '$' + (v/1000).toFixed(0) + 'K avg'; }
    },
    {
      type: 'whatif',
      wi: {
        id: 'bikes',
        question: 'What if marketing leans into the Pacific region signal?',
        sliders: [
          { id: 'bike-leads', label: 'Monthly leads', min: 500, max: 10000, step: 100, default: 2000, fmt: function(v) { return v.toLocaleString(); } },
          { id: 'bike-pct', label: '% Pacific-focused', min: 10, max: 90, step: 5, default: 40, fmt: function(v) { return v + '%'; } },
        ],
        compute: function(vals) {
          var leads = vals[0], pct = vals[1] / 100;
          var pacificLeads = Math.round(leads * pct);
          var otherLeads = leads - pacificLeads;
          var pacificSales = Math.round(pacificLeads * 0.48);
          var otherSales = Math.round(otherLeads * 0.27);
          var totalSales = pacificSales + otherSales;
          var baselineSales = Math.round(leads * 0.27);
          var lift = baselineSales ? Math.round(((totalSales - baselineSales) / baselineSales) * 100) : 0;
          return '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
            '<div style="flex:1;min-width:100px;padding:10px;background:var(--brief-surface2);border-radius:8px;text-align:center;">' +
            '<div style="font-size:22px;font-weight:800;color:var(--brief-accent)">' + totalSales.toLocaleString() + '</div>' +
            '<div style="font-size:10px;color:var(--brief-text-dim)">Projected monthly sales</div></div>' +
            '<div style="flex:1;min-width:100px;padding:10px;background:var(--brief-surface2);border-radius:8px;text-align:center;">' +
            '<div style="font-size:22px;font-weight:800;color:' + (lift>0?'var(--brief-accent)':'#A84B2F') + '">' + (lift>0?'+':'') + lift + '%</div>' +
            '<div style="font-size:10px;color:var(--brief-text-dim)">Lift vs. unfocused mix</div></div>' +
            '<div style="flex:1;min-width:100px;padding:10px;background:var(--brief-surface2);border-radius:8px;text-align:center;">' +
            '<div style="font-size:22px;font-weight:800;color:var(--brief-text)">' + pacificSales.toLocaleString() + '</div>' +
            '<div style="font-size:10px;color:var(--brief-text-dim)">From Pacific-focused leads</div></div>' +
            '</div><div style="margin-top:10px;font-size:11px;color:var(--brief-text-dim);line-height:1.45">Illustrative model using the dashboard\'s regional pattern (Pacific strongest). Not a forecast - a way to stress-test where budget should lean.</div>';
        }
      }
    },
    {
      type: 'impact-text',
      title: 'What Sales Leadership Can Use',
      items: [
        { icon: '🌏', heading: 'Pacific Region is the investment priority', body: 'Data-driven analysis reveals that the Pacific Region has the highest profit margins in bike sales. Married Pacific-region female homeowners in management roles average $90,000 income - the highest-income buyer profile in the entire dataset. North America and the Pacific both show above-average salaries among buyers holding bachelor\'s or graduate degrees in management or professional roles.' },
        { icon: '🚴', heading: 'Pacific customers commute the farthest by bike', body: 'Customers in the Pacific region bike distances ranging from 5 to more than 10 miles. In the Pacific region, middle-aged females bike more than 10 miles. This signals a customer base that treats biking as a primary commute mode - not a weekend hobby - which affects product line recommendations, service intervals, and marketing channel selection.' },
        { icon: '👩', heading: 'Pacific female homeowners are the highest-income segment by region', body: 'Home ownership is highest in the Pacific region where females have an average income of $70,000. When filtered to management occupations, that figure rises to $90,000. This demographic is the most financially capable buyer segment in the dataset and the clearest target for premium product positioning.' },
        { icon: '💡', heading: 'Three data gaps that would sharpen every future analysis', body: 'Andre flagged three improvements directly to stakeholders: (1) no year column exists in the raw data, making year-over-year trend analysis impossible; (2) no data on how frequently customers commute by bike each week; (3) no survey question on electric bike preference, which could unlock an entirely new product demand signal for stakeholders planning future inventory.' },
      ]
    }
  ],
  noFile: true,
  decision: {
    what: 'Pacific Region female homeowners in management roles average $90,000 income, the highest-income bike buyer profile in the dataset. Their commute distances run 5 to 10+ miles, signaling primary-mode cycling, not weekend hobbyism.',
    why: 'Marketing to a broad audience when one demographic segment outperforms all others by income, purchase rate, and commute behavior is an inefficient allocation of budget. This analysis identifies that segment with specificity.',
    next: 'Premium product positioning, service interval messaging, and commuter-focused marketing channel selection should prioritize Pacific Region married female homeowners in management or professional roles with incomes above $70K.'
  },
  stakeholders: [
    { role: 'Who is actually buying bikes?', icon: '💡', summary: 'Not who you might assume. Pacific Region married female homeowners in management roles average $90,000 income and commute 5 to 10+ miles by bike. That is primary-mode cycling, not a weekend hobby. Middle-aged Pacific females bike over 10 miles. This is a high-income, habitual, undermarketed segment.' },
    { role: 'What is missing from this data?', icon: '🔍', summary: 'Three gaps were found and documented: no year column makes year-over-year trend analysis impossible; no weekly commute frequency data limits customer retention modeling; no e-bike preference question is a missed demand signal for inventory planning. All three were raised directly, not buried in an appendix.' },
    { role: 'How was the segmentation built?', icon: '⚙️', summary: 'Raw data cleaned first: deduplication and standardization across income, age bracket, marital status, gender, home ownership, region, occupation, commute distance, and purchase decision. Excel pivot tables, slicers, and calculated columns built the segmentation view. No external tools required.' }
  ],
  context: 'Excel Bike Sales Dashboard. Dataset: bike buyer segmentation data with columns for income, age bracket, marital status, gender, home ownership, region, occupation, commute distance, and purchase decision (Yes/No). Key findings: Pacific Region highest-income buyer profile = married female homeowner in management role, avg income $90K, commutes 5-10+ miles. Pacific Region female homeowner avg income $70K. North America and Pacific show above-average salaries among buyers with bachelor or graduate degrees in management or professional roles. Middle-aged Pacific females bike 10+ miles. Three data gaps: no year column (prevents YoY trends), no weekly commute frequency, no e-bike preference question. Dashboard uses pivot tables, slicers, and calculated columns. Original .xlsx not embedded: full findings documented.'
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
  /* Remove old bottom bar if re-opening */
  var oldBar = document.getElementById('dd-bottom-bar');
  if (oldBar) oldBar.parentNode.removeChild(oldBar);

  /* ── Header ── */
  var hdr = document.createElement('div');
  hdr.className = 'brief-hdr';
  /* Hero header: accent stripe + glow + badge + title + subtitle + github */
  var githubSvg = '<svg class="brief-github-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
  /* Parse badge color hex to RGB for glow */
  var bc = p.badgeColor || '#20808D';
  var r = parseInt(bc.slice(1,3),16), g = parseInt(bc.slice(3,5),16), b = parseInt(bc.slice(5,7),16);
  hdr.innerHTML =
    '<div class="brief-hdr-accent" style="background:linear-gradient(90deg,' + bc + ',' + bc + '99)"></div>' +
    '<div class="brief-hdr-glow" style="background:radial-gradient(ellipse 80% 60% at 0% 0%, rgba(' + r + ',' + g + ',' + b + ',0.12) 0%, transparent 70%)"></div>' +
    '<div class="brief-hdr-content">' +
      '<div class="brief-hdr-top-row">' +
        '<span class="brief-badge" style="background:' + bc + '">' + p.badge + '</span>' +
        '<div class="brief-hdr-nav">' +
          '<button type="button" id="dd-back" class="brief-back-btn" onclick="closeDD()" aria-label="Back to portfolio">' +
            '<span class="brief-back-arrow" aria-hidden="true">&#8592;</span>' +
            '<span class="brief-back-label">Back to portfolio</span>' +
          '</button>' +
          '<button type="button" id="dd-close" class="brief-close-btn" onclick="closeDD()" aria-label="Close deep dive and return to portfolio" title="Close (Esc)">' +
            '<span class="brief-close-x" aria-hidden="true">&#x2715;</span>' +
            '<span class="brief-close-text">Close</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<h2 class="brief-hdr-title">' + p.title + '</h2>' +
      '<p class="brief-hdr-sub">' + p.subtitle + '</p>' +
      '<div class="brief-hdr-actions">' +
        (p.github ? '<a class="brief-github-btn" href="' + p.github + '" target="_blank" rel="noopener noreferrer" aria-label="View on GitHub" onclick="var w=window.open(this.href,\"_blank\",\"noopener,noreferrer\");if(!w){try{window.top.location.href=this.href;}catch(e){}}return false;">' + githubSvg + '<span class="brief-github-label">View on GitHub</span></a>' : '') +
        '<button id="dd-theme-toggle" onclick="toggleDDTheme()" aria-label="Toggle light / dark"><span id="dd-theme-icon">&#9790;</span> Dark</button>' +
      '</div>' +
    '</div>';
  body.appendChild(hdr);

  /* Single scroll stream: intro + chapters + ask all live in one column.
     Prevents desktop flex collapse where header/KPI/ask steal height from chapters. */
  var layout = document.createElement('div');
  layout.className = 'brief-layout';

  var spine = document.createElement('div');
  spine.className = 'brief-spine';
  spine.setAttribute('aria-label', 'Deep dive sections');
  var spineItems = [{ id: 'ch-overview', title: 'Overview' }].concat(p.chapters || []);
  spine.innerHTML = '<div class="brief-spine-title">On this page</div>' +
    '<div class="brief-spine-fill"></div>' +
    spineItems.map(function(ch, idx) {
      return '<button type="button" class="brief-spine-item" data-target="' + ch.id + '" title="' + ch.title + '">' +
        '<span class="brief-spine-num" aria-hidden="true">' + (idx + 1) + '</span>' +
        '<span class="brief-spine-dot" aria-hidden="true"></span>' +
        '<span class="brief-spine-label">' + ch.title + '</span>' +
      '</button>';
    }).join('');
  layout.appendChild(spine);

  var scrollBody = document.createElement('div');
  scrollBody.className = 'brief-scroll-body';

  /* Same section list as spine — horizontal on phone/tablet so info is not lost */
  var mobNav = document.createElement('nav');
  mobNav.className = 'brief-mob-chapters';
  mobNav.setAttribute('aria-label', 'Deep dive sections');
  mobNav.innerHTML =
    '<div class="brief-mob-chapters-label">On this page</div>' +
    '<div class="brief-mob-chapters-track" role="list">' +
    spineItems.map(function(ch, idx) {
      return '<button type="button" class="brief-mob-chip" role="listitem" data-target="' + ch.id + '">' +
        '<span class="brief-mob-chip-num">' + (idx + 1) + '</span>' +
        '<span class="brief-mob-chip-label">' + ch.title + '</span>' +
      '</button>';
    }).join('') +
    '</div>';
  scrollBody.appendChild(mobNav);
  mobNav.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-target]');
    if (!btn) return;
    var t = document.getElementById(btn.getAttribute('data-target'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* Overview anchor */
  var overview = document.createElement('div');
  overview.className = 'brief-chapter brief-chapter--overview';

  /* ── First screen: Result → KPIs (recruiter 10s) ── */
  if (p.outcome) {
    var outcomeEl = document.createElement('div');
    outcomeEl.className = 'brief-outcome';
    outcomeEl.innerHTML =
      '<div class="brief-outcome-kicker">Result</div>' +
      '<p class="brief-outcome-text">' + p.outcome + '</p>' +
      (p.bridge ? '<p class="brief-outcome-bridge">' + p.bridge + '</p>' : '');
    overview.appendChild(outcomeEl);
  }

  var kpiStrip = document.createElement('div');
  kpiStrip.className = 'brief-kpi-strip';
  (p.kpis || []).forEach(function(k) {
    var card = document.createElement('div');
    card.className = 'brief-kpi-card';
    card.innerHTML = '<div class="brief-kpi-icon">' + k.icon + '</div>' +
      '<div class="brief-kpi-val" data-target="' + k.value + '" data-prefix="' + (k.prefix||'') + '" data-suffix="' + (k.suffix||'') + '" data-comma="' + (k.comma?'1':'') + '">0</div>' +
      '<div class="brief-kpi-label">' + k.label + '</div>';
    kpiStrip.appendChild(card);
  });
  overview.appendChild(kpiStrip);

  overview.id = 'ch-overview';
  scrollBody.appendChild(overview);

  /* ── Decision Brief ── */
  if (p.decision) {
    var db = document.createElement('div');
    db.className = 'brief-decision';
    db.innerHTML =
      '<div class="brief-decision-row">' +
        '<span class="brief-decision-pill what">The Situation</span>' +
        '<span class="brief-decision-text">' + p.decision.what + '</span>' +
      '</div>' +
      '<div class="brief-decision-row">' +
        '<span class="brief-decision-pill why">Why Decisions Break</span>' +
        '<span class="brief-decision-text">' + p.decision.why + '</span>' +
      '</div>' +
      '<div class="brief-decision-row">' +
        '<span class="brief-decision-pill next">What Clean Data Unlocks</span>' +
        '<span class="brief-decision-text">' + p.decision.next + '</span>' +
      '</div>';
    overview.appendChild(db);
  }

  /* ── Insight Headline ── */
  var headline = document.createElement('div');
  headline.className = 'brief-headline';
  headline.innerHTML = '<div class="brief-headline-label">The Key Finding</div>' +
    '<div class="brief-headline-text">' + p.insight + '</div>';
  overview.appendChild(headline);

  /* KPI strip already rendered at top of first screen */

  /* ── Explore This Project (question-based lens) ── */
  if (p.stakeholders && p.stakeholders.length) {
    var sl = document.createElement('div');
    sl.className = 'brief-explore-wrap';

    /* Header row */
    var slHdr = document.createElement('div');
    slHdr.className = 'brief-explore-hdr';
    slHdr.innerHTML = '<span class="brief-explore-label">What do you want to know?</span>';
    sl.appendChild(slHdr);

    /* Question cards - each is a full tappable card, not a small pill */
    var slCards = document.createElement('div');
    slCards.className = 'brief-explore-cards';
    var slAnswer = document.createElement('div');
    slAnswer.className = 'brief-explore-answer';

    p.stakeholders.forEach(function(s, i) {
      var card = document.createElement('button');
      card.className = 'brief-explore-card' + (i === 0 ? ' active' : '');
      card.setAttribute('data-sl-idx', i);
      card.innerHTML =
        '<span class="bec-icon">' + s.icon + '</span>' +
        '<span class="bec-question">' + s.role + '</span>' +
        '<span class="bec-arrow">→</span>';

      var pane = document.createElement('div');
      pane.className = 'brief-explore-pane' + (i === 0 ? ' active' : '');
      pane.setAttribute('data-sl-pane', i);
      pane.innerHTML = '<div class="bep-icon">' + s.icon + '</div>' +
        '<p class="bep-text">' + s.summary + '</p>';
      slAnswer.appendChild(pane);

      card.addEventListener('click', function() {
        slCards.querySelectorAll('.brief-explore-card').forEach(function(c) { c.classList.remove('active'); });
        card.classList.add('active');
        slAnswer.querySelectorAll('.brief-explore-pane').forEach(function(pn) { pn.classList.remove('active'); });
        slAnswer.querySelector('[data-sl-pane="' + i + '"]').classList.add('active');
        /* On mobile: scroll answer into view */
        if (window.innerWidth < 640) {
          setTimeout(function() { slAnswer.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 80);
        }
      });
      slCards.appendChild(card);
    });

    sl.appendChild(slCards);
    sl.appendChild(slAnswer);
    overview.appendChild(sl);
  }

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

    } else if (sec.type === 'sql-scorecard') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + (sec.title || 'Data Quality Scorecard') + '</h3>';
      renderSqlScorecard(chWrap, sec);
    } else if (sec.type === 'sql-dashboard') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + (sec.title || 'SQL Dashboard') + '</h3>' +
        (sec.subtitle ? '<p class="brief-section-sub">' + sec.subtitle + '</p>' : '');
      renderSqlDashboard(chWrap, sec);
    } else if (sec.type === 'mini-sql') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + (sec.title || 'Live Query Lab') + '</h3>' +
        '<p class="brief-section-sub">Runs in your browser. Lenses show the project metrics from the full 56,477-row cleaning work; table previews use a compact demo grain so the UI stays instant.</p>';
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
      chWrap.innerHTML = '<h3 class="brief-section-title">' + (sec.title || 'Confidence (self-assessed)') + '</h3>' +
        '<div class="brief-conviction-row" id="conv-row-' + si + '"></div>';
      setTimeout(function() {
        var row = chWrap.querySelector('.brief-conviction-row');
        sec.meters.forEach(function(m) { renderConviction(row, m.label, m.pct, m.color); });
      }, 0);

    } else if (sec.type === 'impact') {
      chWrap.innerHTML = '<h3 class="brief-section-title">Key Takeaways</h3>';
      renderImpact(chWrap, sec.items);
    } else if (sec.type === 'impact-text') {
      var itTitle = sec.title || 'Key Takeaways';
      chWrap.innerHTML = '<h3 class="brief-section-title">' + itTitle + '</h3>';
      var itGrid = document.createElement('div');
      itGrid.className = 'brief-impact-text-grid';
      (sec.items || []).forEach(function(item) {
        var card = document.createElement('div');
        card.className = 'brief-impact-text-card';
        card.innerHTML =
          '<div class="bitc-icon">' + (item.icon || '') + '</div>' +
          '<div class="bitc-body">' +
            '<div class="bitc-heading">' + (item.heading || '') + '</div>' +
            '<div class="bitc-text">' + (item.body || '') + '</div>' +
          '</div>';
        itGrid.appendChild(card);
      });
      chWrap.appendChild(itGrid);
    }

    scrollBody.appendChild(chWrap);
  });

  /* ── Ask This Project ── */
  if (p.context) {
    var askWrap = document.createElement('div');
    askWrap.className = 'brief-ask-wrap';

    /* Per-project Q&A - precise, pre-written answers */
    var ASK_QA = {
      nashville: [
        { label: 'Main finding', a: '56,477 Nashville property records contained four categories of data quality failure. 29 blank PropertyAddress rows were fully recoverable via a self-join on ParcelID - the address existed on a sibling row. 104 duplicate transactions were removed with ROW_NUMBER(). SaleDate stored as DATETIME with all-zero time was converted to DATE. OwnerAddress as a single concatenated string was split into three fields via PARSENAME. SoldAsVacant had four values (Y, N, Yes, No) - collapsed to two via CASE WHEN.' },
        { label: 'Most surprising', a: 'The 29 blank PropertyAddress rows looked like missing data, but they were not - they were present on a sibling row sharing the same ParcelID. One property, two database entries. The distinction between "data is absent" and "data is elsewhere" is the difference between deleting 29 rows and recovering all 29 addresses without touching a single row.' },
        { label: 'Tools used', a: 'SQL Server (T-SQL). Methods: self-join for NULL recovery, ROW_NUMBER() with PARTITION BY for duplicate detection, CONVERT(Date, SaleDate) for type correction, PARSENAME() and SUBSTRING() for string splitting, CASE WHEN for value standardization. Full source code is on GitHub.' },
        { label: 'What was fixed', a: '4 data quality categories: blank addresses (29 rows recovered), duplicate transactions (104 removed), DATETIME-typed sale dates (converted to DATE), and a concatenated owner address string (split into OwnerSplitAddress, OwnerSplitCity, OwnerSplitState). Any report built on the original data would have silently inherited all four problems.' }
      ],
      python: [
        { label: 'What it does', a: 'The program takes a name, age, gender, height (inches), and weight (lbs) and calculates BMI using the CDC formula: weight / height\u00b2 \u00d7 703. It classifies the result as Underweight, Normal, Overweight, or Obese and returns a plain-English sentence - e.g. "Hello John, your BMI of 23.7 indicates you are at a healthy weight." An optional second step calculates Waist-to-Hip Ratio using WHO thresholds.' },
        { label: 'Why two metrics', a: 'BMI and WHR measure different things. BMI uses total body mass relative to height. WHR measures fat distribution. A person can have a Normal BMI of 24.9 and still have a WHR of 1.1 that flags elevated cardiovascular risk - they look fine on one measure and are at risk on the other. Using both gives a more complete picture than either alone.' },
        { label: 'Tools used', a: 'Python. CDC BMI formula (weight in lbs / height in inches squared \u00d7 703). WHO WHR thresholds (male \u2265 0.90 = high risk, female \u2265 0.85 = high risk). Input validation with up to 6 attempts per prompt, advisory on attempt 5. Full source code is on GitHub.' },
        { label: 'Limitation', a: 'BMI is a screening tool, not a diagnosis. The CDC states this explicitly. It does not account for muscle mass - a lean athlete and a sedentary person can share the same BMI. WHR adds one independent signal but is also self-reported. Both outputs are labeled as estimates and the program encourages clinical verification for any health decision.' }
      ],
      powerbi: [
        { label: 'Main finding', a: '630 data professionals across 40+ countries were surveyed. The clearest finding: education level alone does not determine salary. PhD holders average $206K but there are only 5 of them in the dataset. Bachelor\'s degree data scientists average $93K across 329 participants. Role is a stronger predictor than credential. Python is the \u00231 programming language. 42.7% of respondents found breaking into data difficult.' },
        { label: 'What the data shows', a: 'Average salary by title: Data Scientist leads. Python dominates language preference across all roles. Work-life balance satisfaction: 5.74 out of 10. Career satisfaction by salary bracket: 4.27 out of 10. US female data scientists average $95,000. India data scientists average 7,644,693 rupees (~$93K USD). Salary satisfaction drops sharply below $60K.' },
        { label: 'Tools used', a: 'Power BI Desktop. Visualizations: donut chart (language preference), horizontal bar (salary by title), treemap (country distribution), gauge charts (satisfaction scores). DAX for calculated fields. Data cleaning done in Power Query. Original .pbix is not embedded - Power BI embedding requires Azure AD app registration and Premium capacity.' },
        { label: 'What is missing', a: 'The survey is missing three columns that would sharpen the analysis: motivational factors for entering data (open-ended), difficulty of learning SQL on a scaled score, and favorite data visualization tool. These gaps limit analysis of what actually drives career satisfaction and tool preference beyond programming language.' }
      ],
      tableau: [
        { label: 'Main finding', a: 'The highest-revenue week in Seattle Airbnb 2016 was December 25 at $2,110,350. Four peak weeks: March 27 ($1,906,735), May 29 ($2,013,698), June 19 ($2,073,319), December 25 ($2,110,350). Highest-price zip code: 98134. One-bedroom listings dominate supply at 1,811 units. Dataset: 323,346 records across three joined worksheets.' },
        { label: 'Data quality issues', a: '3 data quality issues found: 4,417 blank prices on unavailable nights (not lost revenue), January 2017 records appearing in what is labeled a 2016 dataset, and incomplete reviewer comments. Additionally, 7 missing zip codes were corrected manually by cross-referencing the neighborhood name column.' },
        { label: 'Tools used', a: 'Tableau Desktop. Three worksheets joined via INNER JOIN: listings, reviews, and calendar. Data volume: 323,346 records. Visualizations: line chart (revenue by week), bar chart (price by zip code), bar chart (listings by bedroom count). Manual data correction for 7 missing zip codes. Original .twbx not embedded.' },
        { label: 'How the join worked', a: 'Three separate data files were joined in Tableau: listings (property details and pricing), calendar (availability and price by date), and reviews (reviewer comments and dates). The join key was the listing ID. After joining, zip code gaps were identified and corrected manually by matching to the neighborhood column.' }
      ],
      excel: [
        { label: 'Main finding', a: 'The Pacific Region shows the highest-income buyer profile: married female homeowner in a management role, average income $90,000, commuting 5-10+ miles. Pacific Region female homeowners average $70,000. North America and Pacific show above-average salaries among buyers with bachelor or graduate degrees in management or professional roles. Middle-aged Pacific females are the most active long-distance bike commuters.' },
        { label: 'Who is buying bikes', a: 'Buyers skew toward higher-income, middle-aged, homeowning professionals with longer commutes. The Pacific Region is the strongest market. Married buyers with management or professional occupations and commutes of 5+ miles have the highest purchase rates. Gender splits vary by region - Pacific female homeowners are notably high income among buyers.' },
        { label: 'Tools used', a: 'Microsoft Excel. Pivot tables for segmentation by region, income, gender, marital status, and occupation. Slicers for interactive filtering. Calculated columns for derived segments. Charts: bar charts for income distribution, line charts for commute distance vs. purchase rate. Original .xlsx not embedded - full findings documented in the dashboard.' },
        { label: 'What is missing', a: '3 data gaps limit deeper analysis: no year column (prevents year-over-year trend analysis), no weekly commute frequency (only distance is captured, not how often), and no e-bike preference question (a growing market segment entirely absent from the data). These gaps are documented in the dashboard.' }
      ]
    };

    /* Build chip UI for this project */
    var qas = ASK_QA[key] || [];
    askWrap.innerHTML =
      '<div class="brief-ask-header">' +
        '<span class="brief-ask-icon">&#128172;</span>' +
        '<div><div class="brief-ask-title">Ask This Project</div>' +
        '<div class="brief-ask-sub">Select a question to see a precise answer from the data.</div></div>' +
      '</div>' +
      '<div class="brief-ask-chips-only">' +
        qas.map(function(qa, i) {
          return '<button class="brief-ask-chip" data-idx="' + i + '">' + qa.label + '</button>';
        }).join('') +
      '</div>' +
      '<div class="brief-ask-response" style="display:none"></div>';
    scrollBody.appendChild(askWrap);

    var askResp = askWrap.querySelector('.brief-ask-response');

    askWrap.querySelectorAll('.brief-ask-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        /* Highlight active chip */
        askWrap.querySelectorAll('.brief-ask-chip').forEach(function(c) { c.classList.remove('active'); });
        chip.classList.add('active');

        var idx = parseInt(chip.dataset.idx, 10);
        var qa = qas[idx];
        if (!qa) return;

        askResp.style.display = '';
        askResp.className = 'brief-ask-response loading';
        askResp.innerHTML = '<div class="brief-ask-spinner"></div>';
        setTimeout(function() {
          askResp.className = 'brief-ask-response done';
          askResp.innerHTML = '<div class="brief-ask-answer">' + qa.a.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>';
        }, 280);
      });
    });
  }


  layout.appendChild(scrollBody);
  body.appendChild(layout);

  /* Sticky exit bar - always visible way back to portfolio */
  var exitBar = document.createElement('div');
  
  if (p.nextSteps) {
    var ns = document.createElement('div');
    ns.className = 'brief-chapter brief-next-steps';
    ns.id = 'ch-next';
    ns.innerHTML =
      '<h3 class="brief-section-title">What I\'d do next</h3>' +
      '<p class="brief-next-text">' + p.nextSteps + '</p>';
    scrollBody.appendChild(ns);
  }

  exitBar.className = 'brief-exit-bar';
  exitBar.innerHTML =
    '<button type="button" class="brief-exit-back" onclick="closeDD()">' +
      '<span aria-hidden="true">&#8592;</span> Back to portfolio' +
    '</button>' +
    '<span class="brief-exit-hint"><kbd>Esc</kbd> or click outside to close</span>' +
    '<button type="button" class="brief-exit-close" onclick="closeDD()" aria-label="Close deep dive">Close</button>';
  body.appendChild(exitBar);

  /* Spine nav: click label/dot to jump */
  spine.querySelectorAll('.brief-spine-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var t = scrollBody.querySelector('#' + btn.getAttribute('data-target'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

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

  /* ── Bottom bar is hidden - close and theme are in the header ── */
  /* Keep the element for backwards compat but keep it empty */
  var oldBarFinal = document.getElementById('dd-bottom-bar');
  if (oldBarFinal) oldBarFinal.parentNode.removeChild(oldBarFinal);
}

/* ═══════════════════════════════════════════════════════════════════
   PANEL OPEN / CLOSE
═══════════════════════════════════════════════════════════════════ */
/* ── Deep dive theme toggle - delegates to main portfolio toggle ── */
window.toggleDDTheme = function() {
  /* Fire the main page toggle so both update together */
  var mainToggle = document.querySelector('[data-theme-toggle]');
  if (mainToggle) { mainToggle.click(); return; }
  /* Fallback: toggle the panel directly if main toggle not found */
  var panel = document.getElementById('dd-panel');
  var btn   = document.getElementById('dd-theme-toggle');
  if (!panel) return;
  var isLight = panel.classList.toggle('brief-light');
  if (btn) btn.innerHTML = (isLight ? '<span id="dd-theme-icon">\u2600</span> Light' : '<span id="dd-theme-icon">\u263E</span> Dark');
};


/* Deep dive navigation state */
window.__ddReturnFocus = null;
window.__ddPageScrollY = 0;

window.openDD = function(key) {
  var panel = document.getElementById('dd-panel');
  var overlay = document.getElementById('dd-overlay');
  if (!panel) return;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Project deep dive');
  /* Remember where the visitor was on the portfolio */
  window.__ddReturnFocus = document.activeElement;
  window.__ddPageScrollY = window.scrollY || window.pageYOffset || 0;
  /* Browser Back closes deep dive instead of leaving the site */
  try {
    if (!window.__ddHistoryPushed) {
      history.pushState({ ddOpen: true, ddKey: key }, '', '#deep-dive');
      window.__ddHistoryPushed = true;
    } else {
      history.replaceState({ ddOpen: true, ddKey: key }, '', '#deep-dive');
    }
  } catch (err) {}
  renderDrawer(key);
  /* Mirror the main portfolio theme - deep dive never has its own independent state */
  var mainTheme = document.documentElement.getAttribute('data-theme') || 'light';
  var themeBtn = document.getElementById('dd-theme-toggle');
  if (mainTheme === 'light') {
    panel.classList.add('brief-light');
    if (themeBtn) themeBtn.innerHTML = '<span id="dd-theme-icon">\u2600</span> Light';
  } else {
    panel.classList.remove('brief-light');
    if (themeBtn) themeBtn.innerHTML = '<span id="dd-theme-icon">\u263E</span> Dark';
  }
  panel.classList.add('open');
  document.body.classList.add('dd-open');
  if (overlay) overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  /* Scroll to top of panel */
  var bodyEl = document.getElementById('dd-body');
  if (bodyEl) bodyEl.scrollTop = 0;
  var scrollBody = panel.querySelector('.brief-scroll-body');
  if (scrollBody) scrollBody.scrollTop = 0;
  /* Hide data-rail pill so it doesn't block panel content */
  var rail = document.getElementById('data-rail');
  if (rail) rail.style.cssText = 'display:none!important;pointer-events:none!important;';
  /* Focus close control so keyboard users know how to leave */
  setTimeout(function() {
    var closeBtn = document.getElementById('dd-close') || document.getElementById('dd-back');
    if (closeBtn) closeBtn.focus();
  }, 40);
};

window.closeDD = function() {
  var panel = document.getElementById('dd-panel');
  var overlay = document.getElementById('dd-overlay');
  if (!panel || !panel.classList.contains('open')) return;
  /* If we opened via pushState, step back once without double-close */
  if (window.__ddHistoryPushed && !window.__ddClosingFromPop) {
    window.__ddHistoryPushed = false;
    try { history.back(); } catch (err) {}
  }
  window.__ddClosingFromPop = false;
  panel.classList.remove('open');
  document.body.classList.remove('dd-open');
  if (overlay) overlay.classList.remove('visible');
  document.body.style.overflow = '';
  /* Restore data-rail pill */
  var rail = document.getElementById('data-rail');
  if (rail) rail.style.cssText = '';
  /* Return visitor to the same place on the portfolio */
  var y = window.__ddPageScrollY || 0;
  requestAnimationFrame(function() {
    window.scrollTo(0, y);
    var prev = window.__ddReturnFocus;
    if (prev && typeof prev.focus === 'function') {
      try { prev.focus({ preventScroll: true }); } catch (err) { try { prev.focus(); } catch (e2) {} }
    }
    window.__ddReturnFocus = null;
  });
};

/* ── Close on overlay click / Escape (only while open) ── */
document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('dd-overlay');
  if (overlay) {
    overlay.addEventListener('click', function() { window.closeDD(); });
  }
  document.addEventListener('keydown', function(e) {
    var panel = document.getElementById('dd-panel');
    var open = panel && panel.classList.contains('open');
    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      window.closeDD();
      return;
    }

    /* Simple focus trap inside the stage */
    if (e.key !== 'Tab') return;
    var focusables = panel.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    var list = Array.prototype.filter.call(focusables, function(el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('popstate', function() {
    var panel = document.getElementById('dd-panel');
    if (panel && panel.classList.contains('open')) {
      window.__ddClosingFromPop = true;
      window.__ddHistoryPushed = false;
      window.closeDD();
    }
  });
});

})();
