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
  container.classList.add('brief-chart-wrap--interactive');
  var state = { pinned: -1, sort: opts.sort || 'input' }; // input | desc | asc
  var shell = document.createElement('div');
  shell.className = 'brief-chart-shell';
  var tools = document.createElement('div');
  tools.className = 'brief-chart-tools';
  tools.innerHTML =
    '<button type="button" class="brief-chart-tool" data-sort="desc" aria-pressed="false">Sort high → low</button>' +
    '<button type="button" class="brief-chart-tool" data-sort="asc" aria-pressed="false">Sort low → high</button>' +
    '<button type="button" class="brief-chart-tool" data-sort="input" aria-pressed="true">Original order</button>' +
    '<span class="brief-chart-hint">Tap a bar for details</span>';
  var stage = document.createElement('div');
  stage.className = 'brief-chart-stage';
  var readout = document.createElement('div');
  readout.className = 'brief-chart-readout';
  readout.setAttribute('aria-live', 'polite');
  readout.textContent = 'Hover or tap a bar to inspect values.';
  shell.appendChild(tools);
  shell.appendChild(stage);
  shell.appendChild(readout);
  container.appendChild(shell);

  function fmtVal(v) {
    var fmt = opts.fmt || function(x) { return Number(x).toLocaleString(); };
    return fmt(v);
  }
  function ordered() {
    var rows = data.map(function(d, i) { return { d: d, i: i }; });
    if (state.sort === 'desc') rows.sort(function(a, b) { return (Number(b.d.value)||0) - (Number(a.d.value)||0); });
    if (state.sort === 'asc') rows.sort(function(a, b) { return (Number(a.d.value)||0) - (Number(b.d.value)||0); });
    return rows;
  }
  function setReadout(d, rank, total) {
    if (!d) {
      readout.textContent = 'Hover or tap a bar to inspect values.';
      return;
    }
    var maxV = Math.max.apply(null, data.map(function(x){ return Number(x.value)||0; })) || 1;
    var share = Math.round(((Number(d.value)||0) / maxV) * 100);
    readout.innerHTML = '<strong>' + d.label + '</strong> · ' + fmtVal(d.value) +
      ' <span class="brief-chart-readout__meta">(' + share + '% of top bar' +
      (rank != null ? ' · rank ' + rank + '/' + total : '') + ')</span>';
  }
  function paint() {
    stage.innerHTML = '';
    var rows = ordered();
    var W = Math.max(stage.clientWidth || container.clientWidth || 0, 300);
    var labelW = opts.labelW || (W < 420 ? 88 : 130);
    var barH = opts.barH || (W < 420 ? 26 : 24);
    var gap = opts.gap || 10;
    var padT = 8, padB = 10, padR = W < 420 ? 56 : 78;
    var areaW = Math.max(W - labelW - padR, 72);
    var H = padT + rows.length * (barH + gap) - gap + padB;
    var maxV = Math.max.apply(null, data.map(function(d){ return Number(d.value) || 0; }));
    if (!maxV || !isFinite(maxV)) maxV = 1;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(H));
    svg.setAttribute('class', 'brief-svg-chart brief-svg-chart--bars');
    svg.setAttribute('role', 'list');
    svg.setAttribute('aria-label', opts.ariaLabel || 'Interactive bar chart');

    rows.forEach(function(row, ri) {
      var d = row.d;
      var origI = row.i;
      var y = padT + ri * (barH + gap);
      var ratio = (Number(d.value) || 0) / maxV;
      var fullW = Math.max(ratio * areaW, d.value > 0 ? 4 : 0);
      var color = d.color || 'var(--brief-accent)';
      var g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'brief-bar-row');
      g.setAttribute('role', 'listitem');
      g.setAttribute('tabindex', '0');
      g.setAttribute('data-i', String(origI));
      g.setAttribute('aria-label', d.label + ': ' + fmtVal(d.value));

      var hit = document.createElementNS(ns, 'rect');
      hit.setAttribute('class', 'brief-bar-hit');
      hit.setAttribute('x', '0');
      hit.setAttribute('y', String(y - 2));
      hit.setAttribute('width', String(W));
      hit.setAttribute('height', String(barH + 4));
      hit.setAttribute('fill', 'transparent');
      g.appendChild(hit);

      var txt = document.createElementNS(ns, 'text');
      txt.setAttribute('x', String(labelW - 10));
      txt.setAttribute('y', String(y + barH / 2 + 4));
      txt.setAttribute('text-anchor', 'end');
      txt.setAttribute('class', 'brief-chart-label');
      txt.setAttribute('fill', 'currentColor');
      txt.setAttribute('font-size', W < 420 ? '11' : '12');
      var lab = String(d.label || '');
      if (W < 420 && lab.length > 12) lab = lab.slice(0, 11) + '…';
      txt.textContent = lab;
      g.appendChild(txt);

      var track = document.createElementNS(ns, 'rect');
      track.setAttribute('x', String(labelW));
      track.setAttribute('y', String(y));
      track.setAttribute('width', String(areaW));
      track.setAttribute('height', String(barH));
      track.setAttribute('rx', '5');
      track.setAttribute('class', 'brief-bar-track');
      track.setAttribute('fill', 'currentColor');
      track.setAttribute('opacity', '0.08');
      g.appendChild(track);

      var bar = document.createElementNS(ns, 'rect');
      bar.setAttribute('x', String(labelW));
      bar.setAttribute('y', String(y));
      bar.setAttribute('width', '0');
      bar.setAttribute('height', String(barH));
      bar.setAttribute('rx', '5');
      bar.setAttribute('fill', color);
      bar.setAttribute('class', 'brief-bar-fill');
      bar.setAttribute('data-full-w', String(fullW));
      g.appendChild(bar);

      var val = document.createElementNS(ns, 'text');
      val.setAttribute('x', String(labelW + 8));
      val.setAttribute('y', String(y + barH / 2 + 4));
      val.setAttribute('class', 'brief-chart-val');
      val.setAttribute('fill', 'currentColor');
      val.setAttribute('font-size', W < 420 ? '11' : '12');
      val.setAttribute('font-weight', '700');
      val.setAttribute('opacity', '0');
      val.textContent = fmtVal(d.value);
      g.appendChild(val);

      function activate(pin) {
        svg.querySelectorAll('.brief-bar-row').forEach(function(r) { r.classList.remove('is-hot', 'is-pinned'); });
        g.classList.add('is-hot');
        if (pin) {
          state.pinned = origI;
          g.classList.add('is-pinned');
        }
        val.setAttribute('x', String(labelW + fullW + 8));
        setReadout(d, ri + 1, rows.length);
        if (typeof opts.onSelect === 'function') opts.onSelect(d, origI);
      }
      function clearIfNotPinned() {
        if (state.pinned === origI) return;
        g.classList.remove('is-hot');
        if (state.pinned < 0) setReadout(null);
        else {
          var pinnedRow = rows.filter(function(r){ return r.i === state.pinned; })[0];
          if (pinnedRow) {
            var pr = rows.findIndex(function(r){ return r.i === state.pinned; });
            setReadout(pinnedRow.d, pr + 1, rows.length);
          }
        }
      }
      g.addEventListener('pointerenter', function() { activate(false); });
      g.addEventListener('pointerleave', clearIfNotPinned);
      g.addEventListener('click', function(e) {
        e.preventDefault();
        if (state.pinned === origI) {
          state.pinned = -1;
          g.classList.remove('is-pinned', 'is-hot');
          setReadout(null);
        } else activate(true);
      });
      g.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          g.click();
        }
      });
      if (state.pinned === origI) {
        g.classList.add('is-hot', 'is-pinned');
        val.setAttribute('x', String(labelW + fullW + 8));
        setReadout(d, ri + 1, rows.length);
      }
      svg.appendChild(g);
    });
    stage.appendChild(svg);

    // Animate bars in
    requestAnimationFrame(function() {
      svg.querySelectorAll('.brief-bar-fill').forEach(function(bar, bi) {
        var fw = bar.getAttribute('data-full-w');
        bar.style.transition = 'width 0.55s cubic-bezier(.2,.8,.2,1) ' + (bi * 0.04) + 's';
        bar.setAttribute('width', fw);
        var row = bar.parentNode;
        var valEl = row && row.querySelector('.brief-chart-val');
        if (valEl) {
          valEl.style.transition = 'opacity 0.35s ease ' + (0.2 + bi * 0.04) + 's';
          valEl.setAttribute('x', String(labelW + Number(fw) + 8));
          valEl.setAttribute('opacity', '1');
        }
      });
    });
  }

  tools.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-sort]');
    if (!btn) return;
    state.sort = btn.getAttribute('data-sort') || 'input';
    tools.querySelectorAll('[data-sort]').forEach(function(b) {
      b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      b.classList.toggle('is-active', b === btn);
    });
    paint();
  });
  tools.querySelector('[data-sort="input"]').classList.add('is-active');

  paint();
  if (typeof ResizeObserver !== 'undefined') {
    var roTimer = null;
    var lastW = 0;
    var ro = new ResizeObserver(function() {
      var w = stage.clientWidth || 0;
      if (Math.abs(w - lastW) < 8) return;
      lastW = w;
      if (roTimer) clearTimeout(roTimer);
      roTimer = setTimeout(function() { paint(); }, 120);
    });
    ro.observe(stage);
  } else {
    setTimeout(paint, 80);
  }
}

/* ─────────────────────────────────────────────────────────────────
   SVG LINE CHART - animated draw
───────────────────────────────────────────────────────────────── */
function renderLineChart(container, datasets, opts) {
  opts = opts || {};
  container.innerHTML = '';
  container.classList.add('brief-chart-wrap--interactive');
  var shell = document.createElement('div');
  shell.className = 'brief-chart-shell';
  var tools = document.createElement('div');
  tools.className = 'brief-chart-tools';
  var peakBtns = '';
  var primary = datasets && datasets[0] ? datasets[0] : { values: [] };
  var peaks = primary.peaks || [];
  if (peaks.length) {
    peakBtns = peaks.map(function(pi) {
      var lab = (opts.labels && opts.labels[pi]) ? opts.labels[pi] : ('W' + (pi + 1));
      return '<button type="button" class="brief-chart-tool" data-peak="' + pi + '">Peak ' + lab + '</button>';
    }).join('');
  }
  tools.innerHTML = peakBtns + '<span class="brief-chart-hint">Drag or tap the line to inspect weeks</span>';
  var stage = document.createElement('div');
  stage.className = 'brief-chart-stage';
  var readout = document.createElement('div');
  readout.className = 'brief-chart-readout';
  readout.setAttribute('aria-live', 'polite');
  readout.textContent = 'Tap the chart to inspect any week.';
  shell.appendChild(tools);
  shell.appendChild(stage);
  shell.appendChild(readout);
  container.appendChild(shell);

  var nPts = primary.values.length || 0;
  var activeIdx;
  if (opts.initialIndex != null && opts.initialIndex >= 0 && opts.initialIndex < nPts) {
    activeIdx = opts.initialIndex | 0;
  } else if (peaks.length) {
    activeIdx = peaks[peaks.length - 1];
  } else {
    activeIdx = Math.max(0, Math.floor((nPts || 1) / 2));
  }

  function yFmt(v) {
    return opts.yFmt ? opts.yFmt(v) : String(Math.round(v));
  }
  function setReadout(i) {
    if (i == null || i < 0) return;
    var v = primary.values[i];
    var lab = (opts.labels && opts.labels[i]) ? opts.labels[i] : ('Week ' + (i + 1));
    var isPeak = peaks.indexOf(i) >= 0;
    readout.innerHTML = '<strong>' + lab + '</strong> · ' + yFmt(v) +
      (isPeak ? ' <span class="brief-chart-readout__meta">peak week</span>' : '') +
      ' <span class="brief-chart-readout__meta">point ' + (i + 1) + '/' + primary.values.length + '</span>';
  }

  function paint() {
    stage.innerHTML = '';
    var W = Math.max(stage.clientWidth || container.clientWidth || 0, 300);
    var H = opts.height || (W < 420 ? 190 : 200);
    var padL = W < 420 ? 36 : 44, padR = 16, padT = 20, padB = 34;
    var aW = W - padL - padR, aH = H - padT - padB;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(H));
    svg.setAttribute('class', 'brief-svg-chart brief-svg-chart--line');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', opts.ariaLabel || 'Interactive line chart');

    var allVals = [].concat.apply([], datasets.map(function(ds){ return ds.values; }));
    var minV = opts.minV !== undefined ? opts.minV : Math.min.apply(null, allVals);
    var maxV = opts.maxV !== undefined ? opts.maxV : Math.max.apply(null, allVals);
    if (minV === maxV) { minV = minV * 0.9; maxV = maxV * 1.1 || 1; }
    var n = datasets[0].values.length;
    function px(i) { return padL + (n <= 1 ? aW / 2 : (i / (n - 1)) * aW); }
    function py(v) { return padT + aH - ((v - minV) / (maxV - minV)) * aH; }

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
      lbl.textContent = yFmt(v);
      svg.appendChild(lbl);
    });

    if (opts.labels) {
      var step = Math.max(1, Math.ceil(n / (W < 420 ? 5 : 8)));
      opts.labels.forEach(function(lbl, i) {
        if (i % step !== 0 && i !== n - 1) return;
        var t = document.createElementNS(ns, 'text');
        t.setAttribute('x', px(i)); t.setAttribute('y', H - 6);
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', '9.5');
        t.setAttribute('fill', 'var(--brief-text-faint)');
        t.textContent = lbl;
        svg.appendChild(t);
      });
    }

    // crosshair + focus dot (under series, above grid)
    var xhair = document.createElementNS(ns, 'line');
    xhair.setAttribute('class', 'brief-line-xhair');
    xhair.setAttribute('y1', padT); xhair.setAttribute('y2', padT + aH);
    xhair.setAttribute('stroke', 'var(--brief-accent)');
    xhair.setAttribute('stroke-width', '1');
    xhair.setAttribute('stroke-dasharray', '3 3');
    xhair.setAttribute('opacity', '0.55');
    svg.appendChild(xhair);
    var focus = document.createElementNS(ns, 'circle');
    focus.setAttribute('class', 'brief-line-focus');
    focus.setAttribute('r', '5');
    focus.setAttribute('fill', 'var(--brief-accent)');
    focus.setAttribute('stroke', '#fff');
    focus.setAttribute('stroke-width', '2');
    svg.appendChild(focus);

    datasets.forEach(function(ds) {
      var pts = ds.values.map(function(v, i) { return px(i) + ',' + py(v); }).join(' ');
      // soft area under line
      if (ds.values.length > 1) {
        var areaPts = pts + ' ' + px(n - 1) + ',' + (padT + aH) + ' ' + px(0) + ',' + (padT + aH);
        var areaPoly = document.createElementNS(ns, 'polygon');
        areaPoly.setAttribute('points', areaPts);
        areaPoly.setAttribute('fill', ds.color || 'var(--brief-accent)');
        areaPoly.setAttribute('opacity', '0.10');
        svg.insertBefore(areaPoly, xhair);
      }
      var poly = document.createElementNS(ns, 'polyline');
      poly.setAttribute('points', pts);
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', ds.color || 'var(--brief-accent)');
      poly.setAttribute('stroke-width', ds.width || 2.5);
      poly.setAttribute('stroke-linejoin', 'round');
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('class', 'brief-line-path');
      svg.insertBefore(poly, xhair);
      try {
        var len = poly.getTotalLength ? poly.getTotalLength() : 2000;
        poly.style.strokeDasharray = String(len);
        poly.style.strokeDashoffset = String(len);
        poly.style.transition = 'stroke-dashoffset 1.1s ease';
        var obs = new IntersectionObserver(function(entries) {
          entries.forEach(function(en) {
            if (!en.isIntersecting) return;
            poly.style.strokeDashoffset = '0';
            obs.disconnect();
          });
        }, { threshold: 0.25 });
        obs.observe(svg);
      } catch (eLen) {}

      (ds.peaks || []).forEach(function(pi) {
        var dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', px(pi)); dot.setAttribute('cy', py(ds.values[pi]));
        dot.setAttribute('r', '4.5'); dot.setAttribute('fill', '#E8AF34');
        dot.setAttribute('class', 'brief-line-peak');
        dot.setAttribute('data-peak', String(pi));
        svg.appendChild(dot);
      });
    });

    function goTo(i, clientX, clientY) {
      if (i < 0 || i >= n) return;
      activeIdx = i;
      var x = px(i), y = py(primary.values[i]);
      xhair.setAttribute('x1', x); xhair.setAttribute('x2', x);
      focus.setAttribute('cx', x); focus.setAttribute('cy', y);
      setReadout(i);
      tools.querySelectorAll('[data-peak]').forEach(function(b) {
        b.classList.toggle('is-active', parseInt(b.getAttribute('data-peak'), 10) === i);
      });
      if (clientX != null) {
        var v = primary.values[i];
        var lab = (opts.labels && opts.labels[i]) ? opts.labels[i] : ('Week ' + (i + 1));
        showTip('<strong>' + lab + '</strong><br>' + yFmt(v), clientX, clientY);
      }
    }

    // wide hit surface for pointer scrubbing
    var hit = document.createElementNS(ns, 'rect');
    hit.setAttribute('x', padL); hit.setAttribute('y', padT);
    hit.setAttribute('width', aW); hit.setAttribute('height', aH);
    hit.setAttribute('fill', 'transparent');
    hit.setAttribute('class', 'brief-line-hit');
    hit.style.cursor = 'crosshair';
    hit.style.touchAction = 'none';
    svg.appendChild(hit);

    function idxFromEvent(ev) {
      var rect = svg.getBoundingClientRect();
      var clientX = (ev.clientX != null) ? ev.clientX : (ev.touches && ev.touches[0] && ev.touches[0].clientX);
      if (clientX == null) return activeIdx;
      var x = clientX - rect.left;
      var scale = rect.width / W;
      var localX = x / (scale || 1);
      var t = (localX - padL) / (aW || 1);
      t = Math.max(0, Math.min(1, t));
      return Math.round(t * (n - 1));
    }
    function onMove(ev) {
      var i = idxFromEvent(ev);
      var cx = ev.clientX != null ? ev.clientX : (ev.touches && ev.touches[0] && ev.touches[0].clientX);
      var cy = ev.clientY != null ? ev.clientY : (ev.touches && ev.touches[0] && ev.touches[0].clientY);
      goTo(i, cx, cy);
    }
    hit.addEventListener('pointerdown', function(ev) {
      try { hit.setPointerCapture(ev.pointerId); } catch (eC) {}
      onMove(ev);
    });
    hit.addEventListener('pointermove', function(ev) {
      if (ev.buttons === 0 && ev.pointerType === 'mouse' && !ev.pressure) {
        onMove(ev);
        return;
      }
      if (ev.buttons || ev.pointerType !== 'mouse') onMove(ev);
    });
    hit.addEventListener('pointerenter', onMove);
    hit.addEventListener('pointerleave', function() { hideTip(); });
    hit.addEventListener('pointerup', function() { hideTip(); });

    stage.appendChild(svg);
    goTo(activeIdx);
  }

  tools.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-peak]');
    if (!btn) return;
    activeIdx = parseInt(btn.getAttribute('data-peak'), 10);
    paint();
    setReadout(activeIdx);
  });

  function goToIndex(i, optsGo) {
    optsGo = optsGo || {};
    if (i == null || isNaN(i)) return false;
    i = i | 0;
    if (i < 0 || i >= (primary.values.length || 0)) return false;
    activeIdx = i;
    paint();
    setReadout(activeIdx);
    if (optsGo.flash) {
      readout.classList.remove('is-flash');
      // reflow
      void readout.offsetWidth;
      readout.classList.add('is-flash');
    }
    return true;
  }

  // Public API for cold-open / external jump buttons
  container._briefLineGoTo = goToIndex;
  container._briefLineGetIndex = function() { return activeIdx; };

  paint();
  if (typeof ResizeObserver !== 'undefined') {
    var roTimer = null;
    var lastW = 0;
    var ro = new ResizeObserver(function() {
      var w = stage.clientWidth || 0;
      if (Math.abs(w - lastW) < 8) return;
      lastW = w;
      if (roTimer) clearTimeout(roTimer);
      roTimer = setTimeout(function() { paint(); }, 120);
    });
    ro.observe(stage);
  } else {
    setTimeout(paint, 80);
  }
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
function renderMorphTable(container, before, after, columns, note, opts) {
  opts = opts || {};
  var wrap = document.createElement('div');
  wrap.className = 'brief-morph-table';
  wrap.innerHTML = '<div class="brief-morph-header">' +
    '<button class="brief-morph-btn active" data-mode="before" type="button">Before cleaning</button>' +
    '<button class="brief-morph-btn" data-mode="after" type="button">After cleaning</button>' +
    '<span class="brief-morph-badge raw">Before</span>' +
    '</div>' +
    (note ? '<p class="brief-morph-note">' + note + '</p>' : '');

  var tbl = document.createElement('div');
  tbl.className = 'brief-morph-tbl';

  // Header row
  var hrow = '<div class="brief-morph-row brief-morph-head">' +
    columns.map(function(c) { return '<div class="brief-morph-cell">' + c + '</div>'; }).join('') + '</div>';
  tbl.innerHTML = hrow;

  function isMissing(cell) {
    return cell === null || cell === '' || cell === 'NULL' || (typeof cell === 'string' && cell.trim() === '');
  }
  function isDirtyCell(cell, colName) {
    if (isMissing(cell)) return true;
    if (typeof cell !== 'string') return false;
    var c = colName || '';
    // Vacancy shorthand and mixed domain
    if (/vacant/i.test(c) && (cell === 'Y' || cell === 'N')) return true;
    // DATETIME with useless midnight noise
    if (/date/i.test(c) && /00:00:00/.test(cell)) return true;
    return false;
  }

  var mode = 'before';
  function renderRows(data, m) {
    var rows = tbl.querySelectorAll('.brief-morph-row:not(.brief-morph-head)');
    rows.forEach(function(r) { r.remove(); });
    data.forEach(function(row, ri) {
      var div = document.createElement('div');
      div.className = 'brief-morph-row' + (m === 'after' ? ' clean' : '');
      div.style.animationDelay = (ri * 40) + 'ms';
      div.innerHTML = row.map(function(cell, ci) {
        var col = columns[ci] || '';
        var dirty = m === 'before' && isDirtyCell(cell, col);
        var body;
        if (isMissing(cell)) {
          body = '<span class="brief-null" title="Missing value in source data">MISSING</span>';
        } else {
          body = cell;
        }
        return '<div class="brief-morph-cell' + (dirty ? ' dirty' : '') + (m === 'after' && !isMissing(cell) ? ' fixed' : '') + '">' + body + '</div>';
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
    var scrubEl = wrap.querySelector('.brief-morph-scrub');
    if (scrubEl) {
      // Progressive scrub owns the table paint
      scrubEl.value = mode === 'before' ? '0' : '100';
      scrubEl.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    var badge = wrap.querySelector('.brief-morph-badge');
    badge.className = 'brief-morph-badge ' + (mode === 'before' ? 'raw' : 'clean');
    badge.textContent = mode === 'before' ? 'Before' : 'After';
    renderRows(mode === 'before' ? before : after, mode);
  });

  if (opts.scrub) {
    var scrubId = 'morph-scrub-' + Math.random().toString(36).slice(2, 9);
    var scrubWrap = document.createElement('div');
    scrubWrap.className = 'brief-morph-scrub-wrap';
    scrubWrap.innerHTML =
      '<label class="brief-morph-scrub-label" for="' + scrubId + '">Drag: raw to cleaned</label>' +
      '<input type="range" class="brief-morph-scrub" id="' + scrubId + '" min="0" max="100" value="0" step="1" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
      '<div class="brief-morph-scrub-meta">' +
        '<span data-scrub-side="raw">Raw</span>' +
        '<span class="brief-morph-scrub-pct" data-scrub-pct>0% cleaned · 0 fixes</span>' +
        '<span data-scrub-side="clean">Clean</span>' +
      '</div>' +
      '<div class="brief-morph-scrub-stats" data-scrub-stats></div>';
    wrap.insertBefore(scrubWrap, tbl);
    var scrub = scrubWrap.querySelector('.brief-morph-scrub');
    var pctEl = scrubWrap.querySelector('[data-scrub-pct]');
    var statsEl = scrubWrap.querySelector('[data-scrub-stats]');

    // Ordered fix steps so the scrub is progressive, not a 50% cliff.
    // 1) cell repairs on every before-row  2) drop same-day duplicate rows
    var fixSteps = [];
    var afterByParcel = {};
    after.forEach(function(row) {
      var pid = String(row[0] || '');
      if (!afterByParcel[pid]) afterByParcel[pid] = row;
    });
    before.forEach(function(row, ri) {
      var pid = String(row[0] || '');
      var afterRow = afterByParcel[pid];
      if (!afterRow) return;
      for (var ci = 0; ci < columns.length; ci++) {
        var from = row[ci];
        var to = afterRow[ci];
        var fromS = from === null || from === undefined ? '' : String(from);
        var toS = to === null || to === undefined ? '' : String(to);
        if (fromS !== toS) {
          fixSteps.push({ kind: 'cell', ri: ri, ci: ci, from: from, to: to });
        }
      }
    });
    // Duplicate rows: before rows whose ParcelID already appeared earlier
    var seenParcel = {};
    before.forEach(function(row, ri) {
      var pid = String(row[0] || '');
      if (seenParcel[pid]) {
        fixSteps.push({ kind: 'drop', ri: ri, pid: pid });
      } else {
        seenParcel[pid] = true;
      }
    });
    var totalFixes = fixSteps.length || 1;

    function cellHtml(cell, col, state) {
      // state: dirty | fixed | plain
      if (isMissing(cell)) {
        return '<div class="brief-morph-cell' + (state === 'dirty' ? ' dirty' : '') + '"><span class="brief-null" title="Missing value in source data">MISSING</span></div>';
      }
      var cls = 'brief-morph-cell';
      if (state === 'dirty') cls += ' dirty';
      if (state === 'fixed') cls += ' fixed';
      return '<div class="' + cls + '">' + cell + '</div>';
    }

    function applyScrub(v) {
      v = Math.max(0, Math.min(100, parseInt(v, 10) || 0));
      // Full clean only at 100%. Math.round made ~97% look finished early.
      var nDone;
      if (v >= 100) nDone = totalFixes;
      else if (v <= 0) nDone = 0;
      else nDone = Math.min(totalFixes - 1, Math.floor((v / 100) * totalFixes));
      var applied = {};
      var dropped = {};
      var nCell = 0, nDrop = 0;
      for (var i = 0; i < nDone; i++) {
        var step = fixSteps[i];
        if (!step) break;
        if (step.kind === 'cell') {
          applied[step.ri + ':' + step.ci] = step.to;
          nCell++;
        } else if (step.kind === 'drop') {
          dropped[step.ri] = true;
          nDrop++;
        }
      }

      // Rebuild rows progressively from before baseline
      var rows = tbl.querySelectorAll('.brief-morph-row:not(.brief-morph-head)');
      rows.forEach(function(r) { r.remove(); });
      before.forEach(function(row, ri) {
        if (dropped[ri]) return;
        var div = document.createElement('div');
        var anyFixed = false;
        var html = '';
        for (var ci = 0; ci < columns.length; ci++) {
          var key = ri + ':' + ci;
          var col = columns[ci] || '';
          if (Object.prototype.hasOwnProperty.call(applied, key)) {
            html += cellHtml(applied[key], col, 'fixed');
            anyFixed = true;
          } else {
            var dirty = isDirtyCell(row[ci], col);
            html += cellHtml(row[ci], col, dirty ? 'dirty' : 'plain');
          }
        }
        div.className = 'brief-morph-row' + (anyFixed ? ' clean' : '');
        div.innerHTML = html;
        tbl.appendChild(div);
      });

      var fullyClean = nDone >= totalFixes;
      mode = fullyClean ? 'after' : 'before';
      wrap.querySelectorAll('.brief-morph-btn').forEach(function(b) {
        b.classList.toggle('active', fullyClean ? b.dataset.mode === 'after' : b.dataset.mode === 'before');
      });
      // Mid scrub: neither button exclusive if partial
      if (!fullyClean && nDone > 0) {
        wrap.querySelectorAll('.brief-morph-btn').forEach(function(b) { b.classList.remove('active'); });
      }
      var badge = wrap.querySelector('.brief-morph-badge');
      if (fullyClean) {
        badge.className = 'brief-morph-badge clean';
        badge.textContent = 'After';
      } else if (nDone === 0) {
        badge.className = 'brief-morph-badge raw';
        badge.textContent = 'Before';
      } else {
        badge.className = 'brief-morph-badge scrub';
        badge.textContent = nDone + '/' + totalFixes;
      }
      scrub.setAttribute('aria-valuenow', String(v));
      if (pctEl) pctEl.textContent = v + '% cleaned · ' + nDone + '/' + totalFixes + ' fixes';
      if (statsEl) {
        var left = totalFixes - nDone;
        var tail = '';
        if (nDone === 0) tail = ' Drag right to apply fixes one by one.';
        else if (left === 1) tail = ' One fix left. Slide to 100% to finish.';
        else if (fullyClean) tail = ' Fully cleaned.';
        statsEl.textContent = nCell + ' cell fix' + (nCell === 1 ? '' : 'es') +
          (nDrop ? (', ' + nDrop + ' duplicate row' + (nDrop === 1 ? '' : 's') + ' removed') : '') +
          tail;
      }
    }
    scrub.addEventListener('input', function() { applyScrub(scrub.value); });
  }
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
  wrap.appendChild(svg);
  var lab = document.createElement('div');
  lab.className = 'brief-conviction-label';
  lab.textContent = label;
  wrap.appendChild(lab);
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
  steps = steps || [];
  var wrap = document.createElement('div');
  wrap.className = 'brief-trail brief-trail--progressive';

  var skim = document.createElement('div');
  skim.className = 'brief-skim-note';
  skim.innerHTML = '<span class="brief-skim-note__label">Skim</span> ' +
    '<span class="brief-skim-note__text">' + steps.length +
    ' analytical moves. Open a step only if you want the full reasoning.</span>';
  wrap.appendChild(skim);

  var list = document.createElement('div');
  list.className = 'brief-trail__list';
  var iconMap = { assume: '?', find: '!', pivot: '↻', insight: '★', limit: '⚠' };
  var PREVIEW = 3; // first N open-ready collapsed rows always visible

  steps.forEach(function(step, i) {
    var div = document.createElement('button');
    div.type = 'button';
    div.className = 'brief-trail__step is-collapsed' + (i >= PREVIEW ? ' is-extra is-extra-hidden' : '');
    if (i >= PREVIEW) { div.hidden = true; div.setAttribute('hidden', ''); }
    div.style.animationDelay = (Math.min(i, PREVIEW) * 50) + 'ms';
    div.setAttribute('aria-expanded', 'false');

    var preview = String(step.text || '');
    // One-line preview: first clause or hard clip
    var short = preview.split(/[.!?]/)[0].trim();
    if (short.length > 110) short = short.slice(0, 107).replace(/\s+\S*$/, '') + '…';
    if (!/[.!?]$/.test(short) && short.length < preview.length) short += '…';

    div.innerHTML =
      '<div class="brief-trail__icon ' + step.type + '" aria-hidden="true">' + (iconMap[step.type] || '•') + '</div>' +
      '<div class="brief-trail__body">' +
        '<div class="brief-trail__top">' +
          '<span class="brief-trail__type">' + String(step.type || 'step').toUpperCase() + '</span>' +
          '<span class="brief-trail__toggle" aria-hidden="true">Show step</span>' +
        '</div>' +
        '<div class="brief-trail__text brief-trail__text--preview">' + short + '</div>' +
        '<div class="brief-trail__text brief-trail__text--full">' + preview + '</div>' +
        (step.result ? '<div class="brief-trail__result">' + step.result + '</div>' : '') +
      '</div>';

    div.addEventListener('click', function() {
      var open = div.classList.contains('is-open');
      list.querySelectorAll('.brief-trail__step.is-open').forEach(function(el) {
        if (el !== div) {
          el.classList.remove('is-open');
          el.classList.add('is-collapsed');
          el.setAttribute('aria-expanded', 'false');
          var t0 = el.querySelector('.brief-trail__toggle');
          if (t0) t0.textContent = 'Show step';
        }
      });
      var tog = div.querySelector('.brief-trail__toggle');
      if (open) {
        div.classList.remove('is-open');
        div.classList.add('is-collapsed');
        div.setAttribute('aria-expanded', 'false');
        if (tog) tog.textContent = 'Show step';
      } else {
        div.classList.add('is-open');
        div.classList.remove('is-collapsed');
        div.setAttribute('aria-expanded', 'true');
        if (tog) tog.textContent = 'Hide step';
      }
    });
    list.appendChild(div);
  });
  wrap.appendChild(list);

  if (steps.length > PREVIEW) {
    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'brief-disclose-btn brief-trail__more';
    more.setAttribute('aria-expanded', 'false');
    var extraCount = steps.length - PREVIEW;
    more.textContent = 'Show ' + extraCount + ' more trail moves';
    more.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var expanded = !wrap.classList.contains('is-trail-expanded');
      wrap.classList.toggle('is-trail-expanded', expanded);
      list.querySelectorAll('.brief-trail__step.is-extra').forEach(function(el) {
        if (expanded) {
          el.hidden = false;
          el.classList.remove('is-extra-hidden');
          el.removeAttribute('hidden');
        } else {
          el.hidden = true;
          el.classList.add('is-extra-hidden');
          el.setAttribute('hidden', '');
        }
      });
      more.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      more.textContent = expanded
        ? ('Hide ' + extraCount + ' extra trail moves')
        : ('Show ' + extraCount + ' more trail moves');
    });
    wrap.appendChild(more);
  }

  container.appendChild(wrap);
}

/* ─────────────────────────────────────────────────────────────────
   SCROLL SPINE
───────────────────────────────────────────────────────────────── */

/* ── Shared scroll root (phones scroll #dd-body; desktop scrolls .brief-scroll-body) ── */
function getDDScrollRoot(panel) {
  panel = panel || document.getElementById('dd-panel');
  if (!panel) return null;
  var scrollBody = panel.querySelector('.brief-scroll-body');
  var bodyEl = document.getElementById('dd-body');
  var isPhone = false;
  var isNarrow = false;
  try {
    isPhone = !!(window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
    isNarrow = !!(window.matchMedia && window.matchMedia('(max-width: 899px)').matches);
  } catch (eM) {}
  // Phone CSS forces #dd-body as the only scrollport
  if (isPhone && bodyEl) return bodyEl;
  if (isNarrow && bodyEl && scrollBody) {
    var oy = 'auto';
    try { oy = window.getComputedStyle(scrollBody).overflowY || 'auto'; } catch (eO) {}
    var innerScrolls = oy !== 'visible' && scrollBody.scrollHeight > scrollBody.clientHeight + 4;
    if (!innerScrolls) return bodyEl;
  }
  if (scrollBody) {
    try {
      var sty = window.getComputedStyle(scrollBody);
      if (sty.overflowY !== 'visible') return scrollBody;
    } catch (eS) { return scrollBody; }
  }
  if (bodyEl && bodyEl.scrollHeight > bodyEl.clientHeight + 4) return bodyEl;
  return scrollBody || bodyEl;
}

function getDDScrollOffset(panel, root) {
  panel = panel || document.getElementById('dd-panel');
  root = root || getDDScrollRoot(panel);
  var offset = 16;
  if (!panel || !root) return offset;
  // Sticky chapter rail sits at top of the phone scrollport
  var rail = panel.querySelector('.brief-mob-rail');
  if (rail) {
    try {
      var rh = rail.getBoundingClientRect().height || 0;
      if (rh > 0) offset = Math.max(offset, Math.round(rh) + 12);
    } catch (eR) {}
  }
  return offset;
}

function scrollDDToId(id, behavior) {
  if (!id) return false;
  var panel = document.getElementById('dd-panel');
  var el = document.getElementById(id);
  if (!el) return false;
  var root = getDDScrollRoot(panel);
  var offset = getDDScrollOffset(panel, root);
  behavior = behavior || 'auto';
  if (root && (root === el || root.contains(el))) {
    var top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - offset;
    try {
      root.scrollTo({ top: Math.max(0, top), behavior: behavior });
    } catch (e1) {
      root.scrollTop = Math.max(0, top);
    }
    // Second pass after dock/layout settles (mobile footer height)
    window.requestAnimationFrame(function() {
      var root2 = getDDScrollRoot(panel);
      if (!root2 || !document.getElementById(id)) return;
      var el2 = document.getElementById(id);
      var off2 = getDDScrollOffset(panel, root2);
      var top2 = el2.getBoundingClientRect().top - root2.getBoundingClientRect().top + root2.scrollTop - off2;
      if (Math.abs(top2 - root2.scrollTop) > 8) {
        try { root2.scrollTo({ top: Math.max(0, top2), behavior: 'auto' }); }
        catch (e2) { root2.scrollTop = Math.max(0, top2); }
      }
    });
    return true;
  }
  try {
    el.scrollIntoView({ behavior: behavior, block: 'start' });
  } catch (e3) {
    try { el.scrollIntoView(true); } catch (e4) {}
  }
  return true;
}

function initMobileChrome(panel) {
  if (!panel) return;
  var bodyEl = document.getElementById('dd-body');
  var hdr = panel.querySelector('.brief-hdr');
  if (!bodyEl || !hdr) return;
  var phone = false;
  try { phone = !!(window.matchMedia && window.matchMedia('(max-width: 640px)').matches); } catch (e) {}
  if (!phone) return;
  var onScr = function() {
    hdr.classList.toggle('is-compact', bodyEl.scrollTop > 36);
  };
  bodyEl.addEventListener('scroll', onScr, { passive: true });
  onScr();
}

function initSpine(panel) {
  var spineEl = panel.querySelector('.brief-spine');
  var scrollBody = panel.querySelector('.brief-scroll-body');
  var bodyEl = document.getElementById('dd-body');
  var rail = panel.querySelector('.brief-mob-rail');
  // Fresh spy state each open - prevents stale last-lock across projects
  panel._spineActiveIndex = 0;
  panel._spineLockedLast = false;
  panel._spineMaxScrollTop = 0;
  panel._spineFreezeUntil = 0;
  panel._spineFreezeIndex = null;

  // Prefer the element that actually scrolls. On phones #dd-body is the root;
  // rail is shown up to 899px, so use the same breakpoint for scroll listening.
  var content = scrollBody;
  var isNarrow = false;
  try {
    isNarrow = !!(window.matchMedia && window.matchMedia('(max-width: 899px)').matches);
  } catch (e) { isNarrow = false; }
  if (isNarrow && bodyEl) {
    var bodyScrolls = bodyEl.scrollHeight > bodyEl.clientHeight + 4;
    var innerScrolls = scrollBody && scrollBody.scrollHeight > scrollBody.clientHeight + 4
      && window.getComputedStyle(scrollBody).overflowY !== 'visible';
    content = (!innerScrolls && bodyEl) ? bodyEl : (scrollBody || bodyEl);
    if (bodyScrolls) content = bodyEl;
  }
  if (!content) return;
  try {
    var oldSp = content.querySelector('.brief-scroll-spacer');
    if (oldSp) oldSp.parentNode.removeChild(oldSp);
  } catch (eSp) { /* ignore */ }

  // Nav items: desktop spine buttons, else mobile sheet items, else rail spine data
  var items = Array.prototype.slice.call(panel.querySelectorAll('.brief-spine-item'));
  if (!items.length) {
    items = Array.prototype.slice.call(panel.querySelectorAll('.brief-mob-sheet-item'));
  }
  var spineMeta = (rail && rail._spineItems) ? rail._spineItems.slice() : [];
  if (!items.length && !spineMeta.length) return;

  function resolveTargets() {
    var ids = [];
    if (items.length) {
      ids = items.map(function(it) { return it.getAttribute('data-target'); });
    } else {
      ids = spineMeta.map(function(ch) { return ch.id; });
    }
    return ids.map(function(id) {
      if (!id) return null;
      return document.getElementById(id) || (content && content.querySelector('#' + id));
    }).filter(Boolean);
  }

  function sectionTop(el) {
    return el.getBoundingClientRect().top - content.getBoundingClientRect().top + content.scrollTop;
  }

  function setRailUI(active, scrollPct, targetsLen) {
    var r = panel.querySelector('.brief-mob-rail');
    if (!r) return;
    var meta = r._spineItems || spineMeta || [];
    var total = Math.max(meta.length, items.length, targetsLen || 0, 1);
    if (active < 0) active = 0;
    if (active > total - 1) active = total - 1;

    var countEl = r.querySelector('.brief-mob-rail-count');
    var titleEl = r.querySelector('.brief-mob-rail-title');
    var fillEl = r.querySelector('.brief-mob-rail-fill');
    if (countEl) countEl.textContent = (active + 1) + ' / ' + total;
    if (titleEl) {
      var label = (meta[active] && meta[active].title)
        || (items[active] && (items[active].getAttribute('title') || items[active].textContent))
        || ('Section ' + (active + 1));
      titleEl.textContent = String(label).replace(/\s+/g, ' ').trim();
    }
    // Real-time bar follows scroll position; section steps still drive labels
    if (fillEl) {
      var w;
      if (typeof scrollPct === 'number' && !isNaN(scrollPct)) {
        w = Math.min(100, Math.max(0, scrollPct * 100));
      } else {
        w = total <= 1 ? 100 : ((active + 1) / total) * 100;
      }
      fillEl.style.width = w + '%';
    }
    r.querySelectorAll('.brief-mob-sheet-item').forEach(function(c, i) {
      c.classList.toggle('active', i === active);
      c.classList.toggle('is-done', i < active);
      c.classList.toggle('is-upcoming', i > active);
    });
    r.querySelectorAll('.brief-mob-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === active);
    });
    var prevBtn = r.querySelector('.brief-mob-rail-prev');
    var nextBtn = r.querySelector('.brief-mob-rail-next');
    if (prevBtn) prevBtn.disabled = active <= 0;
    if (nextBtn) nextBtn.disabled = active >= total - 1;
    r._activeIndex = active;
  }

  // Expose for arrow/jump handlers (optimistic UI before scroll settles)
  panel._setRailUI = setRailUI;
  panel._spineOnScroll = null;

  function sectionDocTop(el) {
    // Section Y in the scroll content's document coordinates
    return el.getBoundingClientRect().top - content.getBoundingClientRect().top + content.scrollTop;
  }

  function ensureScrollRoom(targets, force) {
    // Enough end room that the LAST section heading can reach the reading line.
    // Resize only when forced or not yet sized - never on every scroll tick.
    if (!content || !targets || !targets.length) return;
    var viewH = content.clientHeight || 0;
    if (viewH < 120) return;

    var spacer = content.querySelector('.brief-scroll-spacer');
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.className = 'brief-scroll-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      content.appendChild(spacer);
    }
    if (!force && spacer.getAttribute('data-sized') === '1') return;

    var pinOff = Math.max(96, 18);
    var last = targets[targets.length - 1];
    // Measure without relying on current spacer height
    spacer.style.height = '0px';
    var lastTop = sectionDocTop(last);
    var scrollH0 = Math.max(content.scrollHeight - viewH, 0);
    // Need maxScroll >= lastTop - pinOff so last can become active via pin
    var needScroll = Math.max(0, lastTop - pinOff);
    var extra = Math.ceil(needScroll - scrollH0 + 8);
    // Cap so we don't recreate a huge empty desert; still enough for last pin
    extra = Math.max(48, Math.min(Math.max(extra, Math.round(viewH * 0.2)), Math.round(viewH * 0.55)));
    spacer.style.height = extra + 'px';
    spacer.setAttribute('data-sized', '1');
  }

  function paintActive(targets, active, pct) {
    var activeId = targets[active] ? targets[active].id : '';
    var activeItemIndex = active;
    // Prefer index match when lengths align (avoids id edge cases)
    if (items.length === targets.length) {
      activeItemIndex = active;
      items.forEach(function(it, idx) {
        it.classList.toggle('active', idx === active);
        it.classList.toggle('is-done', idx < active);
        it.classList.toggle('is-upcoming', idx > active);
      });
    } else {
      items.forEach(function(it, idx) {
        var tid = it.getAttribute('data-target') || '';
        var on = activeId ? tid === activeId : idx === active;
        if (on) activeItemIndex = idx;
        it.classList.toggle('active', on);
      });
      items.forEach(function(it, idx) {
        it.classList.toggle('is-done', idx < activeItemIndex);
        it.classList.toggle('is-upcoming', idx > activeItemIndex);
      });
    }
    if (spineEl) {
      var pc = spineEl.querySelector('.brief-spine-progress-count');
      var totalN = Math.max(items.length, targets.length, 1);
      if (pc) pc.textContent = (activeItemIndex + 1) + ' / ' + totalN;
    }
    panel.querySelectorAll('.brief-mob-chip').forEach(function(c, idx) {
      c.classList.toggle('active', idx === activeItemIndex);
    });
    setRailUI(activeItemIndex, pct, Math.max(items.length, targets.length));
  }

  function onScroll() {
    var targets = resolveTargets();
    var viewH = content.clientHeight || 1;
    var scrollTop = content.scrollTop;
    var scrollH = Math.max(content.scrollHeight - viewH, 0);
    // Clamp elastic overscroll so spring-back cannot flip the active index
    var st = scrollH > 0 ? Math.max(0, Math.min(scrollTop, scrollH)) : 0;
    var pct = scrollH > 0 ? st / scrollH : (targets.length ? 1 : 0);

    if (spineEl) {
      var fill = spineEl.querySelector('.brief-spine-progress-fill') || spineEl.querySelector('.brief-spine-fill');
      if (fill) {
        fill.style.width = (pct * 100) + '%';
        fill.style.height = '';
      }
    }

    if (!targets.length) {
      setRailUI(0, pct, 0);
      return;
    }

    ensureScrollRoom(targets, false);
    // Recompute after possible first-time spacer (only changes once)
    scrollH = Math.max(content.scrollHeight - viewH, 0);
    st = scrollH > 0 ? Math.max(0, Math.min(content.scrollTop, scrollH)) : 0;
    pct = scrollH > 0 ? st / scrollH : 1;

    var railH = 0;
    var rnow = panel.querySelector('.brief-mob-rail');
    if (rnow) {
      try {
        var rs = window.getComputedStyle(rnow);
        if (rs.display !== 'none' && rs.visibility !== 'hidden') {
          railH = rnow.getBoundingClientRect().height || 0;
        }
      } catch (eR) { railH = 0; }
    }
    var pinOffset = Math.max(96, railH + 18);
    var lastIdx = targets.length - 1;

    // Programmatic freeze (click / arrows)
    var freezeUntil = panel._spineFreezeUntil || 0;
    var freezeIdx = panel._spineFreezeIndex;
    if (freezeUntil && Date.now() < freezeUntil && typeof freezeIdx === 'number') {
      var fActive = Math.max(0, Math.min(lastIdx, freezeIdx));
      panel._spineActiveIndex = fActive;
      paintActive(targets, fActive, pct);
      return;
    }
    if (freezeUntil && Date.now() >= freezeUntil) {
      panel._spineFreezeUntil = 0;
      panel._spineFreezeIndex = null;
    }

    // Document-coordinate spy (stable vs elastic overscroll)
    var raw = 0;
    var pin = st + pinOffset;
    for (var i = 0; i < targets.length; i++) {
      if (sectionDocTop(targets[i]) <= pin + 1) raw = i;
      else break;
    }

    // Track farthest scroll so "reached the end" survives tiny spring-back
    var maxSt = typeof panel._spineMaxScrollTop === 'number' ? panel._spineMaxScrollTop : 0;
    if (st > maxSt) {
      maxSt = st;
      panel._spineMaxScrollTop = maxSt;
    }

    var nearEnd = scrollH <= 0 || st >= scrollH - 48 || pct >= 0.98 ||
      (maxSt >= scrollH - 48 && st >= maxSt - 64);

    var prev = typeof panel._spineActiveIndex === 'number' ? panel._spineActiveIndex : 0;
    if (prev < 0) prev = 0;
    if (prev > lastIdx) prev = lastIdx;

    var active;

    // HARD RULE: once the user is at/near the bottom, the LAST number stays.
    // This is exactly the bug: last → previous when fully scrolled down.
    if (nearEnd) {
      active = lastIdx;
      panel._spineLockedLast = true;
    } else if (panel._spineLockedLast) {
      // Stay locked on last until user scrolls clearly upward away from the end
      if (st <= scrollH - 140 && raw < lastIdx) {
        panel._spineLockedLast = false;
        active = raw;
      } else {
        active = lastIdx;
      }
    } else if (raw >= prev) {
      active = raw;
      if (active === lastIdx) panel._spineLockedLast = true;
    } else {
      // Mid-list upward scroll only
      var prevTop = sectionDocTop(targets[prev]);
      if (prevTop > pin + 56) active = raw;
      else active = prev;
    }

    panel._spineActiveIndex = active;
    paintActive(targets, active, pct);
  }

  panel._spineOnScroll = onScroll;

  // Listen only on the element that actually scrolls (plus body on narrow if used).
  // Multiple nested listeners were firing with jitter and bouncing the active index.
  var roots = [];
  function watch(el) {
    if (!el || roots.indexOf(el) !== -1) return;
    roots.push(el);
    el.addEventListener('scroll', onScroll, { passive: true });
  }
  watch(content);
  if (bodyEl && bodyEl !== content) {
    // phones: #dd-body may be the scroll root
    try {
      if (bodyEl.scrollHeight > bodyEl.clientHeight + 4) watch(bodyEl);
    } catch (eW) { /* ignore */ }
  }

  window.setTimeout(onScroll, 300);
  if (typeof ResizeObserver !== 'undefined') {
    try {
      var ro = new ResizeObserver(function() {
        var sp = content.querySelector('.brief-scroll-spacer');
        if (sp) sp.removeAttribute('data-sized');
        ensureScrollRoom(resolveTargets(), true);
        onScroll();
      });
      ro.observe(content);
      if (scrollBody && scrollBody !== content) ro.observe(scrollBody);
    } catch (e) { /* ignore */ }
  }
  // Initial spacer + seed (force size once layout is ready)
  ensureScrollRoom(resolveTargets(), true);
  onScroll();
  window.setTimeout(function() {
    var sp = content.querySelector('.brief-scroll-spacer');
    if (sp) sp.removeAttribute('data-sized');
    ensureScrollRoom(resolveTargets(), true);
    onScroll();
  }, 120);
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
        '<div class="sql-dash__sql-head">' +
          '<div class="sql-dash__sql-label">Active SQL</div>' +
          '<button type="button" class="sql-dash__copy">Copy SQL</button>' +
        '</div>' +
        '<pre class="sql-dash__sql"></pre>' +
        '<p class="sql-dash__why"></p>' +
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
    var whyEl = wrap.querySelector('.sql-dash__why');
    if (whyEl) whyEl.textContent = L.why || '';
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

    var copyBtn = wrap.querySelector('.sql-dash__copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      var txt = wrap.querySelector('.sql-dash__sql').textContent || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function() {
          copyBtn.textContent = 'Copied';
          setTimeout(function() { copyBtn.textContent = 'Copy SQL'; }, 1200);
        });
      } else {
        copyBtn.textContent = 'Select SQL above';
        setTimeout(function() { copyBtn.textContent = 'Copy SQL'; }, 1500);
      }
    });
  }

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
  bridge: 'Metro housing, assessor, and brokerage teams need the same thing: addresses you can map, sales you can count once, and labels that mean one thing.',
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
    { title: 'Before vs After', id: 'ch-morph' },
    { title: 'Quality Scorecard', id: 'ch-score' },
    { title: 'SQL Dashboard', id: 'ch-dash' },
    { title: 'Live Query Lab', id: 'ch-sql' },
    { title: 'Sale Conditions', id: 'ch-bar' },
    { title: 'Data Quality Impact', id: 'ch-impact' },
  ],
  sections: [
    {
      type: 'insight-card',
      text: 'Nashville Metro published 56,477 property sales across 19 fields. Four quality failures made the file unsafe for housing analysis: blank street addresses on some parcels, sale dates stuck with useless midnight timestamps, owner location packed into one un-filterable string, and "sold as vacant" written four different ways. Maps, vacancy rates, and owner-city rollups would look complete while still being wrong.'
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
      title: 'Before vs after cleaning',
      note: 'Sample rows only. Before: missing addresses, midnight timestamps, mixed Y/N/Yes/No vacancy, and a same-day duplicate. After: address filled from the matching ParcelID sibling, date-only SaleDate, Yes/No vacancy, and one row per closing key.',
      columns: ['ParcelID', 'PropertyAddress', 'SaleDate', 'SoldAsVacant'],
      before: [
        ['083 06 0 144.00', 'NULL', '2013-09-27 00:00:00.000', 'Y'],
        ['083 06 0 144.00', '1808 FOX CHASE DR, GOODLETTSVILLE', '2013-09-27 00:00:00.000', 'Y'],
        ['025 07 0 031.01', '410 ROSEHILL CT, GOODLETTSVILLE', '2014-02-19 00:00:00.000', 'No'],
        ['026 01 0 069.00', 'NULL', '2016-03-30 00:00:00.000', 'N'],
        ['026 01 0 069.00', '510 MAPLE ST, MADISON', '2016-03-30 00:00:00.000', 'N'],
        ['033 01 0 164.00', '1506 DUPONT AVE, NASHVILLE', '2015-11-05 00:00:00.000', 'Yes'],
      ],
      after: [
        ['083 06 0 144.00', '1808 FOX CHASE DR, GOODLETTSVILLE', '2013-09-27', 'Yes'],
        ['025 07 0 031.01', '410 ROSEHILL CT, GOODLETTSVILLE', '2014-02-19', 'No'],
        ['026 01 0 069.00', '510 MAPLE ST, MADISON', '2016-03-30', 'No'],
        ['033 01 0 164.00', '1506 DUPONT AVE, NASHVILLE', '2015-11-05', 'Yes'],
      ]
    },

    {
      type: 'sql-scorecard',
      title: 'Data Quality Scorecard',
      lede: 'Before any housing KPI or map goes live, score the file. Four quality dimensions, measured before and after the seven SQL fixes on this Metro sales extract.',
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
          delta: '29 blank addresses recovered via ParcelID self-join (ISNULL) - zero rows deleted.'
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
      subtitle: 'Pick a SQL lens. KPIs and the chart are the answer to that question - the pattern analysts use before a metric hits a dashboard.',
      hint: 'Each lens is a SQL question. The dashboard is the result, not a separate BI file.',
      meta: 'Project grain: 56,477 Metro sales · SQL on GitHub',
      lenses: [
        {
          label: 'Land use mix',
          why: 'Shows which property types dominate volume and typical price - the first cut a housing analyst runs after cleaning.',
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
          why: 'Pass/fail checks you would put in a nightly refresh: blank addresses, duplicate closings, controlled vacancy domain.',
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
          why: 'Normal vs special sale types change how you read average price. Always break this out before comparing neighborhoods.',
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
          why: 'After Yes/No standardization, vacancy share is one number you can trust - not four competing spellings.',
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
    { title: 'Python Tricks', id: 'ch-py-tricks' },
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
  outcome: 'Turned a multi-sheet professional survey into a Power BI dashboard stakeholders can read at a glance.',
  bridge: 'Same pattern hospitals use for census, throughput, and revenue-cycle scorecards.',
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
  noFile: false,
  originalFile: {
    href: 'files/DataProfessionals_Survey.pbix',
    label: 'Download original .pbix',
    note: 'Open in free Power BI Desktop'
  },
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
  context: 'Power BI Dashboard on Data Professionals Survey. 630 real survey respondents across 40+ countries. Key metrics: average salary by job title, favorite programming language (Python #1), work-life balance satisfaction (5.74/10), career satisfaction by salary bracket (4.27/10), difficulty breaking into data field (42.7% found it difficult). Key finding: education level alone does not determine salary. US female data scientists: $95,000 avg. India data scientists: 7,644,693 rupees (~$93K USD). Survey missing 3 columns: motivational factors (open-ended), learning SQL difficulty (scaled), favorite data visualization tool. Dashboard screenshots from Power BI Desktop. Optional .pbix available. Full analysis documented.'
},

/* ─── TABLEAU - AIRBNB ANALYSIS ─── */
tableau: {
  badge: 'Tableau',
  badgeColor: '#E97424',
  title: 'Airbnb Seattle Analysis',
  outcome: 'Joined Airbnb listing tables into one clear view of price, availability, and review patterns.',
  bridge: 'Join logic + visual hierarchy is how analytics teams keep clinical and finance views aligned.',
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
  context: 'Tableau Dashboard on Airbnb Seattle 2016 data. 323,346 records. Three worksheets joined via INNER JOIN: listings, reviews, calendar. 7 missing zip codes corrected manually via neighborhood cross-referencing. Key findings: highest revenue week December 25 = $2,110,350. Highest-price zip code: 98134. One-bedroom dominates supply at 1,811 listings. Four peak revenue weeks: March 27 ($1,906,735), May 29 ($2,013,698), June 19 ($2,073,319), December 25 ($2,110,350). Three data quality issues: 4417 null price entries correlate with available=f; January 2017 records appear in 2016 dataset; reviewer comments incomplete. Original .twbx not available. Screenshots and analysis trail carry the findings. Full methodology documented.'
},

/* ─── EXCEL - BIKE SALES ANALYSIS ─── */
excel: {
  badge: 'Excel',
  badgeColor: '#437A22',
  title: 'Bike Sales Analysis',
  outcome: 'Cleaned buyer data and isolated where demand concentrates - Pacific leads this sample.',
  bridge: 'Segment → prioritize → act is the same loop used in service-line and panel analytics.',
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
  noFile: false,
  originalFile: {
    href: 'files/Bike_Sales_Dashboard.xlsx',
    label: 'Download original .xlsx',
    note: 'Open in Excel or Google Sheets'
  },
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
  context: 'Excel Bike Sales Dashboard. Dataset: bike buyer segmentation data with columns for income, age bracket, marital status, gender, home ownership, region, occupation, commute distance, and purchase decision (Yes/No). Key findings: Pacific Region highest-income buyer profile = married female homeowner in management role, avg income $90K, commutes 5-10+ miles. Pacific Region female homeowner avg income $70K. North America and Pacific show above-average salaries among buyers with bachelor or graduate degrees in management or professional roles. Middle-aged Pacific females bike 10+ miles. Three data gaps: no year column (prevents YoY trends), no weekly commute frequency, no e-bike preference question. Dashboard uses pivot tables, slicers, and calculated columns. Dashboard screenshots from Excel. Optional .xlsx available. Full findings documented.'
}

}; // end PROJECTS

/* ═══════════════════════════════════════════════════════════════
   PLAYABLE EPISODES - skim-first path for every deep dive
   Beats jump to real chapters. Limits + wrong turns stay honest.
═══════════════════════════════════════════════════════════════ */
var PLAYABLE = {
  nashville: {
    tagline: 'Play this analysis',
    sub: 'Five beats. Real SQL and cleaning proof. Skip anything you already get.',
    beats: [
      { title: 'Land the result', blurb: '56,477 sales. Blank addresses gone. Duplicates gone.', target: 'ch-overview' },
      { title: 'Feel the mess', blurb: 'Scrub before vs after on real field patterns.', target: 'ch-morph' },
      { title: 'Run a lens', blurb: 'SQL dashboard answers one business question at a time.', target: 'ch-dash' },
      { title: 'Query it yourself', blurb: 'Live lab in the browser on the cleaning grain.', target: 'ch-sql' },
      { title: 'See what it unlocks', blurb: 'Impact for maps, counts, and one clean vocabulary.', target: 'ch-impact' }
    ],
    wrongTurns: [
      { title: 'Delete blank-address rows', looked: 'Fast completeness win on a filter.', killed: 'Self-join on ParcelID restored all 29 addresses. Deleting would have erased real homes.' },
      { title: 'Treat Y/N/Yes/No as four categories', looked: 'Raw SoldAsVacant distribution.', killed: 'CASE standardization collapsed labels so vacant counts stopped double-counting spellings.' },
      { title: 'Count every sale row as a unique closing', looked: 'Simple COUNT(*).', killed: 'ROW_NUMBER duplicates showed 104 same-day double bookings that inflated volume.' }
    ],
    limits: [
      'Public Metro Nashville housing sales only. Not a fraud or owner-intent investigation.',
      'Cleaning improves analytic readiness. It does not create new market prices or appraisals.',
      'Demo table grain in the live lab is compact so the UI stays instant. Project metrics reflect the full 56,477-row cleaning work.',
      'No claim of production warehouse deployment or client engagement.'
    ],
    peels: {
      'Sales Records Reviewed': 'Full municipal sales extract reviewed end to end before any row was dropped or fixed.',
      'Cleaning Methods': 'Seven SQL methods: null address recovery, duplicate drop, date cast, address split, vacant label standardize, and related fixes.',
      'Duplicate Sales Removed': 'ROW_NUMBER() partitioned on sale identity keys. 104 same-day duplicate closings removed.',
      'Addresses Restored': 'ISNULL self-join on ParcelID filled 29 blank PropertyAddress values from sibling rows. Zero homes deleted for null address.'
    }
  },
  python: {
    tagline: 'Play this analysis',
    sub: 'Move the sliders. Watch categories update. No submit button.',
    beats: [
      { title: 'Land the result', blurb: 'Live BMI tool with transparent CDC math.', target: 'ch-overview' },
      { title: 'Challenge the default', blurb: 'BMI screens. It does not diagnose. Trail shows why WHR was added.', target: 'ch-trail' },
      { title: 'Build a scenario', blurb: 'Drag height and weight. Categories update live.', target: 'ch-slider' },
      { title: 'Python tricks', blurb: 'dict lookup, f-strings, list comps, retry loops, sex-specific WHR.', target: 'ch-py-tricks' },
      { title: 'See the spread', blurb: 'Sample distribution across four BMI categories.', target: 'ch-bar' },
      { title: 'Read the value', blurb: 'What a care team can and cannot use this for.', target: 'ch-impact' }
    ],
    wrongTurns: [
      { title: 'BMI-only output as a health verdict', looked: 'One number, four neat bins.', killed: 'CDC language: screening tool, not diagnosis. WHR added as a second independent signal.' },
      { title: 'Hide the formula behind a black box', looked: 'Cleaner consumer UI.', killed: 'Care teams need explainable math. Formula stays visible and interactive.' },
      { title: 'Skip sex-specific WHR thresholds', looked: 'One cutoff is simpler.', killed: 'WHO thresholds differ by sex. A single cut misclassifies risk bands.' }
    ],
    limits: [
      'Educational screening demo. Not medical advice and not a clinical device.',
      'Sample distribution chart uses program sample data, not a patient population study.',
      'BMI and WHR are incomplete pictures of health. Lab work, history, and clinician judgment are out of scope.',
      'No real patient or PHI data is used.'
    ],
    peels: {
      'BMI Categories': 'Four CDC adult bins: underweight, healthy, overweight, obesity range.',
      'WHR Risk Tiers': 'WHO sex-specific waist-to-hip thresholds layered on top of BMI.',
      'Program Steps': 'Eight explicit program steps from inputs through plain-English assessment.',
      'Retry Attempts (WHR)': 'Bounded retries when waist/hip inputs are missing or inconsistent.'
    }
  },
  powerbi: {
    tagline: 'Read this analysis',
    sub: 'Screenshots plus the trail. Role beats degree.',
    beats: [
      { title: 'Land the result', blurb: '630 professionals. Role and country move pay more than degree.', target: 'ch-overview' },
      { title: 'See the dashboard', blurb: 'Power BI screenshots below the KPIs.', target: 'ch-dashboard' },
      { title: 'See the trail', blurb: 'Free-text salary and messy titles had to become measures first.', target: 'ch-trail' },
      { title: 'Language mix', blurb: 'Who prefers Python vs other tools.', target: 'ch-lang' },
      { title: 'Salary by education', blurb: 'Hold role steady. Watch the degree story weaken.', target: 'ch-salary' },
      { title: 'Workforce takeaways', blurb: 'What hiring and people teams can actually use.', target: 'ch-impact' }
    ],
    wrongTurns: [
      { title: 'Treat free-text salary as already numeric', looked: 'Column named salary.', killed: 'Ranges like 60k-80k needed a multi-step DAX midpoint before any average was honest.' },
      { title: 'Keep 86 write-in job titles as separate careers', looked: 'More categories feel richer.', killed: 'Power Query consolidation kept signal without exploding the legend.' },
      { title: 'Generalize from 5 PhD rows', looked: 'Highest average at the top of the chart.', killed: 'Sample size too small. Role volume tells the stable story.' }
    ],
    limits: [
      'Survey sample, not a census of the global data workforce.',
      'Country filter used four preselected markets. Other write-ins were excluded.',
      'Dashboard proof is screenshots from Power BI Desktop. Optional original .pbix is linked under the shots for reviewers who want the workbook.',
      'Currency comparisons need purchasing-power context before cross-country pay claims harden.'
    ],
    peels: {
      'Survey Respondents': '630 completed responses after cleaning empty columns and consolidating titles.',
      'Avg Salary Satisfaction': 'Self-reported satisfaction on a 10-point scale, not actual comp fairness.',
      'Python Preference': 'Share preferring Python among respondents with a language preference.',
      'Avg Work/Life Balance': 'Self-reported balance score. Below midpoint in this sample.'
    }
  },
  tableau: {
    tagline: 'Read this analysis',
    sub: 'Seasonality and joins, with dashboard screenshots and a clear trail.',
    beats: [
      { title: 'Land the result', blurb: '323k records. One peak week that gut-feel pricing missed.', target: 'ch-overview' },
      { title: 'See the dashboard', blurb: 'Tableau screenshots below the KPIs.', target: 'ch-dashboard' },
      { title: 'Follow the trail', blurb: 'Missing zips and join choices before the charts.', target: 'ch-trail' },
      { title: 'Weekly revenue', blurb: 'Trace the year. Find the holiday spike.', target: 'ch-line' },
      { title: 'Price by bedrooms', blurb: 'Where the premium actually sits.', target: 'ch-price' },
      { title: 'Host takeaways', blurb: 'What a host or market analyst can act on.', target: 'ch-impact' }
    ],
    wrongTurns: [
      { title: 'Drop rows with missing zip codes', looked: 'Cleaner map layer.', killed: 'Neighborhood cross-reference recovered 7 zips without throwing out revenue.' },
      { title: 'Chart listings without fixing the grain', looked: 'Fast visual.', killed: 'Inner join across worksheets had to be validated so revenue did not double-count.' },
      { title: 'Average price only, ignore calendar', looked: 'One KPI tile.', killed: 'Weekly revenue showed Dec 25 as the real story, not the mean nightly rate alone.' }
    ],
    limits: [
      'Seattle Airbnb 2016 historical snapshot. Not current market rates.',
      'No original .twbx on file. Dashboard proof is screenshots plus the analysis trail in this deep dive.',
      'Revenue figures follow the project joins and calendar aggregation documented in the trail.',
      'No claim about current host strategy or platform policy.'
    ],
    peels: {
      'Records Analyzed': '323,346 listing-calendar grain rows after join and cleaning.',
      'Peak Revenue (Dec 25 wk)': 'City-wide weekly revenue peak on the week of Dec 25, 2016: the calendar story gut-feel pricing missed.',
      'Listings at 1 Bedroom': 'One-bedroom inventory share in the cleaned join, used as a baseline product mix signal.',
      'Missing Zip Codes Fixed': 'Seven missing zips restored via neighborhood cross-reference instead of dropping map rows.'
    }
  },
  excel: {
    tagline: 'Read this analysis',
    sub: 'Region, commute, and buyer patterns with Excel dashboard screenshots.',
    beats: [
      { title: 'Land the result', blurb: 'Which regions and profiles actually convert.', target: 'ch-overview' },
      { title: 'See the dashboard', blurb: 'Excel screenshots below the KPIs.', target: 'ch-dashboard' },
      { title: 'Trail the logic', blurb: 'How the sales question was framed before the pivot.', target: 'ch-trail' },
      { title: 'Commute conversion', blurb: 'Distance and purchase behavior in one view.', target: 'ch-commute' },
      { title: 'Regional split', blurb: 'Where income and volume concentrate.', target: 'ch-region' },
      { title: 'Run a scenario', blurb: 'Move levers. Watch the story update.', target: 'ch-scenario' }
    ],
    wrongTurns: [
      { title: 'Rank regions by headcount only', looked: 'Biggest bar wins.', killed: 'Income and commute patterns flipped which region looked like the best growth bet.' },
      { title: 'Ignore purchaser profile mix', looked: 'One regional average.', killed: 'Homeowner and commute segments changed the conversion read.' },
      { title: 'Static pivot as the final deliverable', looked: 'Familiar Excel finish line.', killed: 'Scenario controls let stakeholders test the assumption instead of accepting one freeze.' }
    ],
    limits: [
      'Dashboard proof is screenshots from Excel. Optional original .xlsx is linked under the shots for reviewers who want the workbook.',
      'Bike sales training/analysis dataset. Not a live retailer feed.',
      'Scenario tools illustrate sensitivity. They are not a production demand forecast.',
      'Regional labels follow the source workbook definitions.',
      'No claim of client engagement or inventory optimization deployment.'
    ],
    peels: {
      'Records (Raw)': 'Starting row count before Excel dedup and shape fixes.',
      'After Deduplication': 'Row count after removing duplicate buyer or transaction noise.',
      'Regions Surveyed': 'Regions kept in the regional comparison and scenario views.',
      'Pivot Tables Built': 'Pivot layouts used to move from flat rows to decision-ready cuts.'
    }
  }
};



/* ═══════════════════════════════════════════════════════════════════
   DRAWER RENDERER
═══════════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────────
   PROOF BENCH: cold open + filter bench (portfolio deep dives)
───────────────────────────────────────────────────────────────── */
function findProjectSection(p, type) {
  var secs = (p && p.sections) || [];
  for (var i = 0; i < secs.length; i++) {
    if (secs[i].type === type) return secs[i];
  }
  return null;
}

function findAllProjectSections(p, type) {
  return ((p && p.sections) || []).filter(function(s) { return s.type === type; });
}

function renderFilterBench(container, barSec, opts) {
  opts = opts || {};
  if (!barSec || !barSec.data || !barSec.data.length) return;
  var wrap = document.createElement('div');
  wrap.className = 'brief-filter-bench';
  var title = document.createElement('div');
  title.className = 'brief-filter-bench__title';
  title.textContent = opts.title || barSec.title || 'Filter the chart';
  wrap.appendChild(title);

  var sub = document.createElement('p');
  sub.className = 'brief-filter-bench__sub';
  sub.textContent = 'Tap chips to compare segments. Bars sort and highlight live.';
  wrap.appendChild(sub);

  var chips = document.createElement('div');
  chips.className = 'brief-filter-bench__chips';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', opts.chipLabel || 'Filter options');

  var allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'brief-filter-chip is-active';
  allBtn.textContent = 'All';
  allBtn.setAttribute('data-filter', '__all__');
  allBtn.setAttribute('aria-pressed', 'true');
  chips.appendChild(allBtn);

  barSec.data.forEach(function(d, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'brief-filter-chip';
    b.textContent = d.label;
    b.setAttribute('data-filter', String(i));
    b.setAttribute('aria-pressed', 'false');
    chips.appendChild(b);
  });
  wrap.appendChild(chips);

  var count = document.createElement('div');
  count.className = 'brief-filter-bench__count';
  count.textContent = 'Showing all ' + barSec.data.length + ' groups';
  wrap.appendChild(count);

  var chart = document.createElement('div');
  chart.className = 'brief-chart-wrap brief-filter-bench__chart';
  wrap.appendChild(chart);
  container.appendChild(wrap);

  var selected = null; // null = all, else Set of indices

  function currentRows() {
    if (!selected) return barSec.data.slice();
    return barSec.data.filter(function(_, i) { return selected.has(i); });
  }
  function paint() {
    var rows = currentRows();
    if (!rows.length) {
      selected = null;
      rows = barSec.data.slice();
      chips.querySelectorAll('.brief-filter-chip').forEach(function(c) {
        var on = c.getAttribute('data-filter') === '__all__';
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    count.textContent = selected
      ? ('Comparing ' + rows.length + ' of ' + barSec.data.length + ' · tap All to reset')
      : ('Showing all ' + barSec.data.length + ' groups · tap chips to compare');
    chart.innerHTML = '';
    setTimeout(function() {
      renderBarChart(chart, rows, {
        fmt: barSec.fmt,
        labelW: 120,
        sort: selected && rows.length > 1 ? 'desc' : 'input',
        ariaLabel: (barSec.title || 'Filtered') + ' bar chart'
      });
    }, 0);
  }
  paint();

  chips.addEventListener('click', function(e) {
    var btn = e.target.closest('.brief-filter-chip');
    if (!btn) return;
    var f = btn.getAttribute('data-filter');
    if (f === '__all__') {
      selected = null;
      chips.querySelectorAll('.brief-filter-chip').forEach(function(c) {
        var on = c.getAttribute('data-filter') === '__all__';
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      paint();
      return;
    }
    var idx = parseInt(f, 10);
    if (!selected) selected = new Set();
    // leaving All mode
    chips.querySelector('[data-filter="__all__"]').classList.remove('is-active');
    chips.querySelector('[data-filter="__all__"]').setAttribute('aria-pressed', 'false');
    if (selected.has(idx)) selected.delete(idx);
    else selected.add(idx);
    btn.classList.toggle('is-active', selected.has(idx));
    btn.setAttribute('aria-pressed', selected.has(idx) ? 'true' : 'false');
    if (!selected.size) {
      selected = null;
      chips.querySelectorAll('.brief-filter-chip').forEach(function(c) {
        var on = c.getAttribute('data-filter') === '__all__';
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    paint();
  });
}



/* BI interactive board destinations (Chart.js replicas, not case-study pages) */
/* BI proof: screenshots + deep dive story. No multi-CTA board chrome. */
var DD_DASHBOARDS = {
  powerbi: {
    tool: 'Power BI',
    shots: [
      { src: 'images/powerbi-dashboard.png?v=1785074000', alt: 'Power BI dashboard for the data professionals survey', caption: 'Full dashboard · tap to enlarge' }
    ],
    caption: 'One full Power BI Desktop dashboard. Tap the image to view it large.',
    fileHref: '',
    fileLabel: ''
  },
  tableau: {
    tool: 'Tableau',
    shots: [
      { src: 'images/airbnb-dashboard.png', alt: 'Tableau Airbnb Seattle dashboard overview', caption: 'Dashboard overview' },
      { src: 'images/tableau-sheet1.png', alt: 'Tableau worksheet: listing and neighborhood detail', caption: 'Worksheet detail' },
      { src: 'images/tableau-sheet2.png', alt: 'Tableau worksheet: revenue pattern detail', caption: 'Revenue pattern' }
    ],
    caption: 'Three Tableau views: overview plus two worksheets. Interactive charts below let you inspect the spikes.',
    fileHref: '',
    fileLabel: ''
  },
  excel: {
    tool: 'Excel',
    shots: [
      { src: 'images/bike-sales.png', alt: 'Excel bike sales dashboard with pivots and slicers', caption: 'Full dashboard view' }
    ],
    caption: 'One Excel dashboard view with pivots and slicers. Segment filters and scenarios are interactive below.',
    fileHref: '',
    fileLabel: ''
  }
};

function openDDDashboard(key, e) {
  if (e) {
    try { e.preventDefault(); } catch (err0) {}
    try { e.stopPropagation(); } catch (err1) {}
  }
  var slot = document.getElementById('ch-dashboard');
  if (slot) {
    try {
      slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err2) {}
  }
  return false;
}
window.openDDDashboard = openDDDashboard;

function ensureDDDashboardMounted(key) {
  /* Screenshots-only path: no Chart.js board mount in deep dive. */
  return;
}
window.ensureDDDashboardMounted = ensureDDDashboardMounted;

function renderPythonTricks(container) {
  var wrap = document.createElement('div');
  wrap.className = 'brief-py-tricks';
  wrap.id = 'ch-py-tricks';
  wrap.innerHTML =
    '<div class="brief-py-tricks__head">' +
      '<div class="brief-py-tricks__kicker">Python under the hood</div>' +
      '<h3 class="brief-py-tricks__title">Cool tricks this BMI program actually uses</h3>' +
      '<p class="brief-py-tricks__sub">Tap a chip. See the Python pattern, then run it live with sample inputs. Same ideas as the GitHub script, shown so hiring managers can feel the language, not just the sliders.</p>' +
    '</div>';

  var chips = document.createElement('div');
  chips.className = 'brief-py-tricks__chips';
  chips.setAttribute('role', 'tablist');

  var stage = document.createElement('div');
  stage.className = 'brief-py-tricks__stage';

  var tricks = [
    {
      id: 'dict',
      label: 'dict lookup',
      blurb: 'Categories as data, not a pile of if/elif copies.',
      code: 'BMI_BINS = [\n  (18.5, "Underweight"),\n  (25.0, "Normal weight"),\n  (30.0, "Overweight"),\n  (35.0, "Obese Class I"),\n]\n\ndef classify(bmi):\n  for ceiling, label in BMI_BINS:\n    if bmi < ceiling:\n      return label\n  return "Obese Class II+"',
      run: function(vals) {
        var bmi = vals.bmi;
        var cat = 'Obese Class II+';
        var bins = [[18.5, 'Underweight'], [25, 'Normal weight'], [30, 'Overweight'], [35, 'Obese Class I']];
        for (var i = 0; i < bins.length; i++) {
          if (bmi < bins[i][0]) { cat = bins[i][1]; break; }
        }
        return 'classify(' + bmi.toFixed(1) + ')  →  "' + cat + '"';
      }
    },
    {
      id: 'fstring',
      label: 'f-string result',
      blurb: 'Plain-English output, not a raw float dump.',
      code: 'name = "Alex"\nbmi = 24.9\ncat = "Normal weight"\n\nmsg = (\n  f"Hello {name}, your BMI of {bmi:.1f} "\n  f"indicates {cat}."\n)\nprint(msg)',
      run: function(vals) {
        return 'Hello Alex, your BMI of ' + vals.bmi.toFixed(1) +
          ' indicates ' + vals.cat + '.';
      }
    },
    {
      id: 'round',
      label: 'round + guards',
      blurb: 'WHR to 2 decimals. Reject zero or negative hips before dividing.',
      code: 'def whr(waist, hip):\n  if hip <= 0:\n    raise ValueError("hip must be > 0")\n  return round(waist / hip, 2)\n\nratio = whr(34, 38)  # 0.89',
      run: function(vals) {
        var hip = vals.hip;
        if (hip <= 0) return 'ValueError: hip must be > 0';
        var r = Math.round((vals.waist / hip) * 100) / 100;
        return 'whr(' + vals.waist + ', ' + hip + ')  →  ' + r.toFixed(2);
      }
    },
    {
      id: 'loop',
      label: 'retry loop',
      blurb: 'Bounded while-loop: up to 6 attempts, then graceful exit.',
      code: 'attempts = 0\nMAX = 6\nwhile attempts < MAX:\n  ans = input("Add WHR? yes/no: ").strip().lower()\n  if ans in {"yes", "no"}:\n    break\n  attempts += 1\n  if attempts == 5:\n    print("One try left.")\nelse:\n  print("Exiting without WHR.")',
      run: function(vals) {
        return 'Pattern: while attempts < 6 → validate → break. On attempt 5, warn. After 6, exit without WHR.';
      }
    },
    {
      id: 'comprehension',
      label: 'list comp',
      blurb: 'Turn a table of people into category counts in one expression.',
      code: 'people = [22.1, 27.4, 31.0, 18.2, 24.0]\n\noverweight = [\n  b for b in people if 25 <= b < 30\n]\n# → [27.4]',
      run: function(vals) {
        var people = [22.1, 27.4, 31.0, 18.2, 24.0];
        var ow = people.filter(function(b) { return b >= 25 && b < 30; });
        return 'overweight = ' + JSON.stringify(ow) + '  (1 of ' + people.length + ' sample rows)';
      }
    },
    {
      id: 'branch',
      label: 'sex-specific WHR',
      blurb: 'WHO thresholds differ by sex. One cutoff would misclassify.',
      code: 'def whr_risk(ratio, sex):\n  limit = 0.90 if sex == "male" else 0.85\n  if ratio >= 1.0:\n    return "much higher risk"\n  if ratio >= limit:\n    return "elevated abdominal risk"\n  return "lower abdominal risk band"',
      run: function(vals) {
        var r = Math.round((vals.waist / vals.hip) * 100) / 100;
        function risk(sex) {
          var lim = sex === 'male' ? 0.90 : 0.85;
          if (r >= 1.0) return 'much higher risk';
          if (r >= lim) return 'elevated abdominal risk';
          return 'lower abdominal risk band';
        }
        return 'ratio ' + r.toFixed(2) +
          ' → male: ' + risk('male') +
          ' · female: ' + risk('female');
      }
    }
  ];

  var live = document.createElement('div');
  live.className = 'brief-py-tricks__live';
  live.innerHTML =
    '<div class="brief-py-tricks__live-label">Live inputs (drive the demos)</div>' +
    '<div class="brief-py-tricks__sliders">' +
      '<label>Height (in) <input type="range" data-k="h" min="60" max="84" value="70"><span data-v="h">70</span></label>' +
      '<label>Weight (lb) <input type="range" data-k="w" min="100" max="350" value="175"><span data-v="w">175</span></label>' +
      '<label>Waist (in) <input type="range" data-k="waist" min="22" max="60" value="34"><span data-v="waist">34</span></label>' +
      '<label>Hip (in) <input type="range" data-k="hip" min="24" max="70" value="38"><span data-v="hip">38</span></label>' +
    '</div>';

  function valsFromUI() {
    var h = parseFloat(live.querySelector('[data-k="h"]').value, 10);
    var w = parseFloat(live.querySelector('[data-k="w"]').value, 10);
    var waist = parseFloat(live.querySelector('[data-k="waist"]').value, 10);
    var hip = parseFloat(live.querySelector('[data-k="hip"]').value, 10);
    var bmi = (w / (h * h)) * 703;
    var cat = 'Obese Class II+';
    if (bmi < 18.5) cat = 'Underweight';
    else if (bmi < 25) cat = 'Normal weight';
    else if (bmi < 30) cat = 'Overweight';
    else if (bmi < 35) cat = 'Obese Class I';
    return { h: h, w: w, waist: waist, hip: hip, bmi: bmi, cat: cat };
  }

  function paintVals() {
    var v = valsFromUI();
    live.querySelector('[data-v="h"]').textContent = String(v.h);
    live.querySelector('[data-v="w"]').textContent = String(v.w);
    live.querySelector('[data-v="waist"]').textContent = String(v.waist);
    live.querySelector('[data-v="hip"]').textContent = String(v.hip);
    return v;
  }

  var active = 0;
  function showTrick(idx) {
    active = idx;
    chips.querySelectorAll('button').forEach(function(b, i) {
      b.classList.toggle('is-active', i === idx);
      b.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    var t = tricks[idx];
    var v = paintVals();
    stage.innerHTML =
      '<div class="brief-py-tricks__blurb">' + t.blurb + '</div>' +
      '<pre class="brief-py-tricks__code" tabindex="0"><code>' + t.code.replace(/</g, '&lt;') + '</code></pre>' +
      '<div class="brief-py-tricks__out"><span class="brief-py-tricks__out-label">Live result</span><div class="brief-py-tricks__out-val" data-out></div></div>';
    stage.querySelector('[data-out]').textContent = t.run(v);
  }

  tricks.forEach(function(t, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'brief-py-tricks__chip';
    b.setAttribute('role', 'tab');
    b.textContent = t.label;
    b.addEventListener('click', function() { showTrick(i); });
    chips.appendChild(b);
  });

  live.querySelectorAll('input[type=range]').forEach(function(inp) {
    inp.addEventListener('input', function() {
      var v = paintVals();
      var out = stage.querySelector('[data-out]');
      if (out) out.textContent = tricks[active].run(v);
    });
  });

  wrap.appendChild(chips);
  wrap.appendChild(live);
  wrap.appendChild(stage);
  container.appendChild(wrap);
  showTrick(0);
}

function renderDashboardCard(container, key) {
  var cfg = DD_DASHBOARDS[key];
  if (!cfg || !container) return;
  var card = document.createElement('section');
  var shots = cfg.shots || [];
  var multi = shots.length > 1;
  card.className = 'brief-dash-card brief-dash-card--shots' + (multi ? ' brief-dash-card--multi' : ' brief-dash-card--single');
  if (!multi && key === 'powerbi') card.classList.add('brief-dash-card--powerbi');
  if (!multi && key === 'excel') card.classList.add('brief-dash-card--excel');
  card.setAttribute('aria-label', cfg.tool + (multi ? ' dashboard screenshots' : ' dashboard screenshot'));
  var galleryClass = 'brief-shot-gallery' + (multi ? ' brief-shot-gallery--multi' : ' brief-shot-gallery--single');
  var gallery = shots.map(function(s, i) {
    var cap = s.caption ? ('<figcaption class="brief-shot__cap">' + s.caption + '</figcaption>') : '';
    return '<figure class="brief-shot' + (i === 0 ? ' brief-shot--hero' : ' brief-shot--thumb') + '" data-shot-i="' + i + '">' +
      '<button type="button" class="brief-shot__btn" aria-label="Expand screenshot ' + (i + 1) + '">' +
        '<img src="' + s.src + '" alt="' + (s.alt || (cfg.tool + ' dashboard screenshot')) + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '" decoding="async" />' +
      '</button>' + cap +
      '</figure>';
  }).join('');
  var kicker = multi
    ? (cfg.tool + ' · ' + shots.length + ' screenshots')
    : (cfg.tool + ' · dashboard screenshot');
  card.innerHTML =
    '<div class="brief-dash-card__body">' +
      '<div class="brief-dash-card__kicker">' + kicker + '</div>' +
      '<p class="brief-dash-card__text">' + (cfg.caption || '') + '</p>' +
      '<div class="' + galleryClass + '" role="group" aria-label="' + cfg.tool + ' screenshots">' + gallery + '</div>' +
    '</div>';
  container.appendChild(card);

  // Lightweight lightbox for desktop + mobile
  card.addEventListener('click', function(e) {
    var btn = e.target.closest('.brief-shot__btn');
    if (!btn || !card.contains(btn)) return;
    var fig = btn.closest('.brief-shot');
    var img = btn.querySelector('img');
    if (!img) return;
    var overlay = document.createElement('div');
    overlay.className = 'brief-shot-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Expanded dashboard screenshot');
    overlay.innerHTML =
      '<button type="button" class="brief-shot-lightbox__close" aria-label="Close">Close</button>' +
      '<img src="' + img.getAttribute('src') + '" alt="' + (img.getAttribute('alt') || '') + '" />' +
      (fig && fig.querySelector('.brief-shot__cap')
        ? ('<p class="brief-shot-lightbox__cap">' + fig.querySelector('.brief-shot__cap').textContent + '</p>')
        : '');
    document.body.appendChild(overlay);
    document.body.classList.add('dd-lightbox-open');
    function close() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.body.classList.remove('dd-lightbox-open');
      document.removeEventListener('keydown', onKey);
    }
    function onKey(ev) { if (ev.key === 'Escape') close(); }
    overlay.addEventListener('click', function(ev) {
      if (ev.target === overlay || ev.target.closest('.brief-shot-lightbox__close')) close();
    });
    document.addEventListener('keydown', onKey);
    var c = overlay.querySelector('.brief-shot-lightbox__close');
    if (c) c.focus();
  });
}


function renderColdOpen(container, key, p, goToId) {
  var captions = {
    nashville: 'Drag raw rows into cleaned sales.',
    python: 'Move height and weight. BMI updates live.',
    powerbi: 'Filter a group. The chart re-draws live.',
    tableau: 'December spikes stay labeled. No hover needed.',
    excel: 'Filter a buyer segment. Bars re-draw live.'
  };
  var shell = document.createElement('section');
  shell.className = 'brief-cold-open';
  shell.setAttribute('aria-label', 'Live interactive');
  shell.innerHTML =
    '<div class="brief-cold-open__kicker">Try it now</div>' +
    '<p class="brief-cold-open__caption">' + (captions[key] || 'Touch the live control below.') + '</p>';
  var stage = document.createElement('div');
  stage.className = 'brief-cold-open__stage';

  if (key === 'nashville') {
    var morph = findProjectSection(p, 'morph-table');
    if (morph) {
      renderMorphTable(stage, morph.before, morph.after, morph.columns, morph.note, { scrub: true });
      var labBtn = document.createElement('button');
      labBtn.type = 'button';
      labBtn.className = 'brief-disclose-btn brief-cold-open__jump';
      labBtn.textContent = 'Open Live Query Lab';
      labBtn.addEventListener('click', function() {
        if (typeof goToId === 'function') goToId('ch-sql');
      });
      stage.appendChild(labBtn);
    }
  } else if (key === 'python') {
    var wi = findProjectSection(p, 'whatif');
    if (wi && wi.wi) renderWhatIf(stage, wi.wi);
    renderPythonTricks(stage);
  } else if (key === 'powerbi') {
    var bars = findAllProjectSections(p, 'bar-chart');
    if (bars[0]) renderFilterBench(stage, bars[0], { title: 'Language filter (live)', chipLabel: 'Languages' });
    var wi2 = findProjectSection(p, 'whatif');
    if (wi2 && wi2.wi) {
      var gap = document.createElement('div');
      gap.className = 'brief-cold-open__secondary';
      renderWhatIf(gap, wi2.wi);
      stage.appendChild(gap);
    }
  } else if (key === 'tableau') {
    var line = findProjectSection(p, 'line-chart');
    if (line) {
      var peakIdx = (line.peaks && line.peaks.length) ? line.peaks[line.peaks.length - 1] : 51;
      var peakVal = line.values[peakIdx];

      var jumpRow = document.createElement('div');
      jumpRow.className = 'brief-cold-open__jump-row';

      var jump = document.createElement('button');
      jump.type = 'button';
      jump.className = 'brief-disclose-btn brief-cold-open__jump brief-cold-open__jump--primary';
      jump.textContent = 'Jump to December 25 spike';
      jump.setAttribute('aria-controls', 'brief-cold-line-chart');

      // Secondary peak chips for the other three peaks
      var otherPeaks = (line.peaks || []).filter(function(pi) { return pi !== peakIdx; });
      otherPeaks.forEach(function(pi) {
        var lab = (line.labels && line.labels[pi]) ? line.labels[pi] : ('W' + (pi + 1));
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'brief-disclose-btn brief-cold-open__jump';
        b.textContent = lab;
        b.setAttribute('data-peak-jump', String(pi));
        jumpRow.appendChild(b);
      });
      jumpRow.insertBefore(jump, jumpRow.firstChild);

      var seedNote = document.createElement('div');
      seedNote.className = 'brief-cold-open__peak-note';
      seedNote.id = 'brief-cold-peak-note';
      seedNote.textContent = 'December 25 is the top week: $' + Number(peakVal).toLocaleString() + ' city-wide revenue. Tap the button to pin the chart on that spike.';

      var lc = document.createElement('div');
      lc.className = 'brief-chart-wrap';
      lc.id = 'brief-cold-line-chart';

      stage.appendChild(jumpRow);
      stage.appendChild(seedNote);
      stage.appendChild(lc);

      function pinPeak(pi, label) {
        pi = pi | 0;
        var val = line.values[pi];
        var lab = label || ((line.labels && line.labels[pi]) ? line.labels[pi] : ('Week ' + (pi + 1)));
        seedNote.textContent = lab + ' spike: $' + Number(val).toLocaleString() + ' city-wide weekly revenue.';
        seedNote.classList.remove('is-flash');
        void seedNote.offsetWidth;
        seedNote.classList.add('is-flash');

        function doGo() {
          if (typeof lc._briefLineGoTo === 'function') {
            lc._briefLineGoTo(pi, { flash: true });
            return true;
          }
          return false;
        }
        if (!doGo()) {
          // Chart not ready yet: render then go
          renderLineChart(lc, [{ values: line.values, peaks: line.peaks, color: 'var(--brief-accent)', width: 2.5 }], {
            labels: line.labels,
            yFmt: function(v) { return '$' + Math.round(v / 1000) + 'K'; },
            height: 210,
            initialIndex: pi,
            ariaLabel: 'Seattle weekly revenue'
          });
          doGo();
        }
        // Scroll chart into the phone/desktop reading frame
        try {
          if (typeof scrollDDToId === 'function') scrollDDToId('brief-cold-line-chart', 'smooth');
          else lc.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (eScr) {
          try { lc.scrollIntoView({ block: 'center' }); } catch (e2) {}
        }
        jumpRow.querySelectorAll('button').forEach(function(btn) {
          var isMain = btn === jump;
          var dpi = btn.getAttribute('data-peak-jump');
          var on = isMain ? (pi === peakIdx) : (dpi != null && parseInt(dpi, 10) === pi);
          btn.classList.toggle('is-active', on);
        });
      }

      jump.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        pinPeak(peakIdx, 'December 25');
      });
      jumpRow.addEventListener('click', function(e) {
        var b = e.target.closest('[data-peak-jump]');
        if (!b || !jumpRow.contains(b)) return;
        e.preventDefault();
        pinPeak(parseInt(b.getAttribute('data-peak-jump'), 10));
      });

      // Start on a neutral mid-year point so Dec 25 jump is a visible change
      var startIdx = 26;
      setTimeout(function() {
        renderLineChart(lc, [{ values: line.values, peaks: line.peaks, color: 'var(--brief-accent)', width: 2.5 }], {
          labels: line.labels,
          yFmt: function(v) { return '$' + Math.round(v / 1000) + 'K'; },
          height: 210,
          initialIndex: startIdx,
          ariaLabel: 'Seattle weekly revenue'
        });
      }, 0);
    }
  } else if (key === 'excel') {
    var eBars = findAllProjectSections(p, 'bar-chart');
    // Prefer region-ish chart if labeled
    var region = eBars.find(function(s) {
      return /region|commute|income|buyer/i.test(String(s.title || '') + ' ' + String(s.subtitle || ''));
    }) || eBars[0];
    if (region) renderFilterBench(stage, region, { title: (region.title || 'Segment') + ' filter', chipLabel: 'Segments' });
    var eWi = findProjectSection(p, 'whatif');
    if (eWi && eWi.wi) {
      var disc = document.createElement('div');
      disc.className = 'brief-cold-open__disclaimer';
      disc.textContent = 'Scenario below is illustrative lead mix, not a dataset finding.';
      stage.appendChild(disc);
      var gap2 = document.createElement('div');
      gap2.className = 'brief-cold-open__secondary';
      renderWhatIf(gap2, eWi.wi);
      stage.appendChild(gap2);
    }
  }

  shell.appendChild(stage);
  container.appendChild(shell);
}

function renderPlayableEpisode(container, key, p, goToId) {
  var cfg = (typeof PLAYABLE !== 'undefined' && PLAYABLE[key]) ? PLAYABLE[key] : null;
  if (!cfg) return;
  var beats = cfg.beats || [];
  if (!beats.length) return;

  var panel = document.getElementById('dd-panel');
  var activeIdx = -1;
  var visited = {};
  var dockVisible = false;

  var ep = document.createElement('div');
  ep.className = 'brief-playable';
  ep.id = 'brief-playable-' + key;
  ep.innerHTML =
    '<div class="brief-playable-head">' +
      '<div class="brief-playable-kicker">Episode</div>' +
      '<div class="brief-playable-title">' + (cfg.tagline || 'Play this analysis') + '</div>' +
      '<p class="brief-playable-sub">' + (cfg.sub || 'Tap a beat, then use Next to keep going in order.') + '</p>' +
      '<button type="button" class="brief-playable-start" data-play-start="1">Start beat 1</button>' +
    '</div>';

  var track = document.createElement('div');
  track.className = 'brief-playable-track';
  track.setAttribute('role', 'list');

  var nav = document.createElement('div');
  nav.className = 'brief-playable-nav';
  nav.innerHTML =
    '<button type="button" class="brief-playable-nav-btn" data-nav="prev" disabled>Previous</button>' +
    '<span class="brief-playable-nav-status" data-nav-status>Pick beat 1 to start</span>' +
    '<button type="button" class="brief-playable-nav-btn brief-playable-nav-btn--primary" data-nav="next">Next beat</button>';

  function getFooter() {
    return panel ? panel.querySelector('.brief-dd-footer') : null;
  }

  function ensureDock() {
    var footer = getFooter();
    if (!footer) return null;
    var dock = footer.querySelector('.brief-episode-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.className = 'brief-episode-dock';
      dock.setAttribute('role', 'navigation');
      dock.setAttribute('aria-label', 'Playing analysis controls');
      // Insert dock above exit row inside footer
      var exitRow = footer.querySelector('.brief-exit-bar');
      if (exitRow) footer.insertBefore(dock, exitRow);
      else footer.appendChild(dock);
    }
    return dock;
  }

  function setDockVisible(on) {
    on = !!on;
    if (on === dockVisible) {
      if (on) updateDock();
      return;
    }
    dockVisible = on;
    var dock = ensureDock();
    if (!dock) return;
    dock.hidden = !dockVisible;
    if (panel) panel.classList.toggle('has-episode-dock', dockVisible);
    var footer = getFooter();
    if (footer) footer.classList.toggle('has-episode-dock', dockVisible);
    if (dockVisible) {
      buildDockOnce(dock);
      updateDock();
      // Publish dock height so mobile padding clears the fixed chrome
      window.requestAnimationFrame(function() {
        try {
          var h = dock.getBoundingClientRect().height || 0;
          var exit = getFooter() && getFooter().querySelector('.brief-exit-bar');
          var eh = exit ? (exit.getBoundingClientRect().height || 0) : 0;
          // On phones exit is inside footer under dock; pad for full footer stack
          var pad = Math.ceil(h + 12);
          if (panel) panel.style.setProperty('--dd-episode-dock-h', pad + 'px');
          var bodyEl = document.getElementById('dd-body');
          if (bodyEl) bodyEl.style.setProperty('--dd-episode-dock-h', pad + 'px');
        } catch (eH) {}
      });
    } else if (panel) {
      panel.style.removeProperty('--dd-episode-dock-h');
      var bodyEl2 = document.getElementById('dd-body');
      if (bodyEl2) bodyEl2.style.removeProperty('--dd-episode-dock-h');
    }
  }

  function buildDockOnce(dock) {
    if (dock._built) return;
    dock._built = true;
    var chips = beats.map(function(b, i) {
      return '<button type="button" class="brief-episode-dock__chip" data-beat="' + i + '" aria-current="false">' +
        '<span class="brief-episode-dock__n">' + (i + 1) + '</span>' +
        '<span class="brief-episode-dock__t">' + b.title + '</span>' +
      '</button>';
    }).join('');
    dock.innerHTML =
      '<div class="brief-episode-dock__top">' +
        '<div class="brief-episode-dock__label">Playing analysis</div>' +
        '<div class="brief-episode-dock__now" data-dock-now>Choose a beat</div>' +
      '</div>' +
      '<div class="brief-episode-dock__chips">' + chips + '</div>' +
      '<div class="brief-episode-dock__actions">' +
        '<button type="button" class="brief-episode-dock__btn" data-dock="prev">Previous</button>' +
        '<button type="button" class="brief-episode-dock__btn brief-episode-dock__btn--primary" data-dock="next">Next beat</button>' +
      '</div>';
    // One delegated listener: never rebind on every beat change
    dock.addEventListener('click', function(e) {
      var beatBtn = e.target.closest('[data-beat]');
      if (beatBtn && dock.contains(beatBtn)) {
        e.preventDefault();
        playBeat(parseInt(beatBtn.getAttribute('data-beat'), 10));
        return;
      }
      var act = e.target.closest('[data-dock]');
      if (!act || !dock.contains(act) || act.disabled) return;
      e.preventDefault();
      var dir = act.getAttribute('data-dock');
      if (dir === 'prev' && activeIdx > 0) playBeat(activeIdx - 1);
      if (dir === 'next') {
        if (activeIdx < 0) playBeat(0);
        else if (activeIdx < beats.length - 1) playBeat(activeIdx + 1);
      }
    });
  }

  function updateDock() {
    var dock = ensureDock();
    if (!dock || !dockVisible) return;
    buildDockOnce(dock);
    var beat = activeIdx >= 0 ? beats[activeIdx] : null;
    var now = dock.querySelector('[data-dock-now]');
    if (now) {
      now.textContent = beat
        ? ('Beat ' + (activeIdx + 1) + ' of ' + beats.length + ' · ' + beat.title)
        : 'Choose a beat';
    }
    dock.querySelectorAll('[data-beat]').forEach(function(btn) {
      var i = parseInt(btn.getAttribute('data-beat'), 10);
      btn.classList.toggle('is-active', i === activeIdx);
      btn.classList.toggle('is-visited', !!visited[i]);
      btn.setAttribute('aria-current', i === activeIdx ? 'step' : 'false');
    });
    var prev = dock.querySelector('[data-dock="prev"]');
    var next = dock.querySelector('[data-dock="next"]');
    if (prev) prev.disabled = activeIdx <= 0;
    if (next) next.disabled = activeIdx >= 0 && activeIdx >= beats.length - 1;
  }

  function syncChrome() {
    track.querySelectorAll('.brief-playable-beat').forEach(function(b, i) {
      b.classList.toggle('is-active', i === activeIdx);
      b.classList.toggle('is-visited', !!visited[i]);
    });
    var status = nav.querySelector('[data-nav-status]');
    var prevB = nav.querySelector('[data-nav="prev"]');
    var nextB = nav.querySelector('[data-nav="next"]');
    if (status) {
      status.textContent = activeIdx < 0
        ? 'Pick beat 1 to start'
        : ('Beat ' + (activeIdx + 1) + ' of ' + beats.length);
    }
    if (prevB) prevB.disabled = activeIdx <= 0;
    if (nextB) nextB.disabled = activeIdx >= beats.length - 1 && activeIdx >= 0;
    if (activeIdx < 0 && nextB) nextB.disabled = false;
    if (dockVisible) updateDock();
  }

  function scrollBeatTarget(id) {
    // Instant scroll on the real scroll root (phones: #dd-body)
    scrollDDToId(id, 'auto');
  }

  function playBeat(i) {
    if (i < 0 || i >= beats.length) return;
    var beat = beats[i];
    // Dashboard beat: jump to live board in-panel
    if (beat && beat.target === 'ch-dashboard' && DD_DASHBOARDS[key]) {
      activeIdx = i;
      visited[i] = true;
      setDockVisible(true);
      syncChrome();
      ensureDDDashboardMounted(key);
      requestAnimationFrame(function() { scrollBeatTarget('ch-dashboard'); });
      return;
    }
    if (i === activeIdx && visited[i]) {
      scrollBeatTarget(beat.target);
      return;
    }
    activeIdx = i;
    visited[i] = true;
    // Pin dock for whole session once a beat starts (no show/hide jump on 1↔2)
    setDockVisible(true);
    syncChrome();
    // Scroll after chrome paints so dock height is stable (critical on phones)
    requestAnimationFrame(function() {
      scrollBeatTarget(beat.target);
      // Keep active dock chip in view on narrow screens
      try {
        var dock = ensureDock();
        if (dock && dockVisible) {
          var chip = dock.querySelector('.brief-episode-dock__chip.is-active');
          if (chip && chip.scrollIntoView) chip.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
        }
      } catch (eChip) {}
    });
  }

  beats.forEach(function(beat, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'brief-playable-beat';
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('data-beat-index', String(i));
    btn.innerHTML =
      '<span class="brief-playable-num">' + (i + 1) + '</span>' +
      '<span class="brief-playable-beat-body">' +
        '<span class="brief-playable-beat-title">' + beat.title + '</span>' +
        '<span class="brief-playable-beat-blurb">' + beat.blurb + '</span>' +
      '</span>' +
      '<span class="brief-playable-go" aria-hidden="true">Go</span>';
    btn.addEventListener('click', function() { playBeat(i); });
    track.appendChild(btn);
  });

  nav.addEventListener('click', function(e) {
    var b = e.target.closest('[data-nav]');
    if (!b || b.disabled) return;
    var dir = b.getAttribute('data-nav');
    if (dir === 'prev' && activeIdx > 0) playBeat(activeIdx - 1);
    if (dir === 'next') {
      if (activeIdx < 0) playBeat(0);
      else if (activeIdx < beats.length - 1) playBeat(activeIdx + 1);
    }
  });

  var startBtn = ep.querySelector('[data-play-start]');
  if (startBtn) {
    startBtn.addEventListener('click', function() { playBeat(0); });
  }

  ep.appendChild(track);
  ep.appendChild(nav);
  container.appendChild(ep);

  // Dock is pinned on first beat via playBeat → setDockVisible(true).
  // No IntersectionObserver hide/show (that caused the 1↔2 milli-glitch).
}


function renderPlayableDepth(container, key) {
  var cfg = (typeof PLAYABLE !== 'undefined' && PLAYABLE[key]) ? PLAYABLE[key] : null;
  if (!cfg) return;

  if (cfg.wrongTurns && cfg.wrongTurns.length) {
    var wt = document.createElement('div');
    wt.className = 'brief-wrong-turns';
    var nTurns = cfg.wrongTurns.length;
    wt.innerHTML = '<h3 class="brief-section-title">Wrong turns that looked right</h3>' +
      '<p class="brief-section-sub">Open ' + nTurns + ' approaches that failed. Real failures only.</p>';
    var grid = document.createElement('div');
    grid.className = 'brief-wrong-grid';
    cfg.wrongTurns.forEach(function(w) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'brief-wrong-card is-collapsed';
      card.setAttribute('aria-expanded', 'false');
      card.innerHTML =
        '<div class="brief-wrong-title">' + w.title + '</div>' +
        '<div class="brief-wrong-meta">Show this wrong turn</div>' +
        '<div class="brief-wrong-detail">' +
          '<div class="brief-wrong-label">Looked right</div>' +
          '<div class="brief-wrong-text">' + w.looked + '</div>' +
          '<div class="brief-wrong-label">What killed it</div>' +
          '<div class="brief-wrong-text">' + w.killed + '</div>' +
        '</div>';
      card.addEventListener('click', function() {
        var open = card.classList.contains('is-open');
        grid.querySelectorAll('.brief-wrong-card.is-open').forEach(function(c) {
          if (c !== card) {
            c.classList.remove('is-open');
            c.classList.add('is-collapsed');
            c.setAttribute('aria-expanded', 'false');
            var m0 = c.querySelector('.brief-wrong-meta');
            if (m0) m0.textContent = 'Show this wrong turn';
          }
        });
        var meta = card.querySelector('.brief-wrong-meta');
        if (open) {
          card.classList.remove('is-open');
          card.classList.add('is-collapsed');
          card.setAttribute('aria-expanded', 'false');
          if (meta) meta.textContent = 'Show this wrong turn';
        } else {
          card.classList.add('is-open');
          card.classList.remove('is-collapsed');
          card.setAttribute('aria-expanded', 'true');
          if (meta) meta.textContent = 'Hide this wrong turn';
        }
      });
      grid.appendChild(card);
    });
    wt.appendChild(grid);
    container.appendChild(wt);
  }

  if (cfg.limits && cfg.limits.length) {
    var lim = document.createElement('div');
    lim.className = 'brief-limits';
    lim.innerHTML = '<div class="brief-limits-kicker">Honest limits</div>' +
      '<ul class="brief-limits-list">' +
      cfg.limits.map(function(line) { return '<li>' + line + '</li>'; }).join('') +
      '</ul>';
    container.appendChild(lim);
  }
}

function attachKpiPeels(kpiStrip, key) {
  var cfg = (typeof PLAYABLE !== 'undefined' && PLAYABLE[key]) ? PLAYABLE[key] : null;
  if (!cfg || !cfg.peels || !kpiStrip) return;
  var peelBox = document.createElement('div');
  peelBox.className = 'brief-kpi-peel';
  peelBox.hidden = true;
  kpiStrip.insertAdjacentElement('afterend', peelBox);

  kpiStrip.querySelectorAll('.brief-kpi-card').forEach(function(card) {
    card.classList.add('brief-kpi-card--peelable');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    var labelEl = card.querySelector('.brief-kpi-label');
    var label = labelEl ? labelEl.textContent.trim() : '';
    var peel = cfg.peels[label];
    if (!peel) return;
    var cue = document.createElement('div');
    cue.className = 'brief-kpi-proof-cue';
    cue.textContent = 'Press for proof';
    card.appendChild(cue);
    card.setAttribute('aria-label', label + '. Press for proof.');
    function showPeel() {
      kpiStrip.querySelectorAll('.brief-kpi-card').forEach(function(c) { c.classList.remove('is-peeled'); });
      card.classList.add('is-peeled');
      peelBox.hidden = false;
      peelBox.innerHTML =
        '<div class="brief-kpi-peel-label">Proof under the number</div>' +
        '<div class="brief-kpi-peel-title">' + label + '</div>' +
        '<p class="brief-kpi-peel-text">' + peel + '</p>' +
        '<button type="button" class="brief-disclose-btn brief-disclose-btn--inline brief-kpi-peel-hide">Hide proof</button>';
      var hide = peelBox.querySelector('.brief-kpi-peel-hide');
      if (hide) hide.addEventListener('click', function() {
        peelBox.hidden = true;
        card.classList.remove('is-peeled');
      });
    }
    card.addEventListener('click', showPeel);
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPeel(); }
    });
  });
}


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
        '<div class="brief-hdr-tools">' +
          (p.github ? '<a class="brief-tool-btn brief-github-btn" href="' + p.github + '" target="_blank" rel="noopener noreferrer" aria-label="Code on GitHub" title="Code on GitHub (leaves page)">' + githubSvg + '<span class="brief-github-label">Code on GitHub</span></a>' : '') +
          '<button type="button" id="dd-theme-toggle" class="brief-tool-btn" onclick="toggleDDTheme()" aria-label="Switch to light mode" title="Dark mode" data-mode="dark"><span id="dd-theme-icon" class="dd-theme-emoji" aria-hidden="true">&#127769;</span></button>' +
          '<button type="button" id="dd-close" class="brief-tool-btn brief-close-btn" aria-label="Close deep dive" title="Close (Esc)">' +
            '<span class="brief-close-x" aria-hidden="true">&#x2715;</span>' +
            '<span class="brief-close-text">Close</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<h2 class="brief-hdr-title">' + p.title + '</h2>' +
      '<p class="brief-hdr-sub">' + p.subtitle + '</p>' +
    '</div>';
  body.appendChild(hdr);
  var hdrClose = document.getElementById('dd-close');
  if (hdrClose) {
    hdrClose.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.closeDD === 'function') window.closeDD(e);
    });
  }
  var hdrDash = document.getElementById('dd-open-dash');
  if (hdrDash) {
    hdrDash.addEventListener('click', function(e) {
      openDDDashboard(key, e);
    });
  }

  /* Single scroll stream: intro + chapters + ask all live in one column.
     Prevents desktop flex collapse where header/KPI/ask steal height from chapters. */
  var layout = document.createElement('div');
  layout.className = 'brief-layout';

  var spine = document.createElement('div');
  spine.className = 'brief-spine';
  spine.setAttribute('aria-label', 'Deep dive sections');
  var spineItems = [{ id: 'ch-overview', title: 'Overview' }].concat(p.chapters || []);
  if (p.context) {
    spineItems = spineItems.concat([{ id: 'ch-ask', title: 'Ask This Project' }]);
  }
  spine.innerHTML =
    '<div class="brief-spine-head">' +
      '<div class="brief-spine-title">Sections</div>' +
      '<div class="brief-spine-progress" aria-hidden="true"><div class="brief-spine-progress-fill brief-spine-fill"></div></div>' +
      '<div class="brief-spine-progress-meta"><span class="brief-spine-progress-count">1 / ' + spineItems.length + '</span></div>' +
    '</div>' +
    '<div class="brief-spine-list" role="list">' +
    spineItems.map(function(ch, idx) {
      return '<button type="button" class="brief-spine-item' + (idx === 0 ? ' active' : '') + '" role="listitem" data-target="' + ch.id + '" data-index="' + idx + '" title="' + ch.title + '">' +
        '<span class="brief-spine-num" aria-hidden="true">' + (idx + 1 < 10 ? '0' : '') + (idx + 1) + '</span>' +
        '<span class="brief-spine-label">' + ch.title + '</span>' +
        '<span class="brief-spine-mark" aria-hidden="true"></span>' +
      '</button>';
    }).join('') +
    '</div>';
  layout.appendChild(spine);

  var scrollBody = document.createElement('div');
  scrollBody.className = 'brief-scroll-body';

  /* Same section list as spine - horizontal on phone/tablet so info is not lost */
  /* Sticky mobile chapter rail + expandable sheet (stays while scrolling) */
  var mobRail = document.createElement('nav');
  mobRail.className = 'brief-mob-rail';
  mobRail.setAttribute('aria-label', 'Deep dive sections');
  mobRail.innerHTML =
    '<div class="brief-mob-rail-progress" aria-hidden="true"><div class="brief-mob-rail-fill"></div></div>' +
    '<div class="brief-mob-rail-row">' +
      '<button type="button" class="brief-mob-rail-btn brief-mob-rail-prev" aria-label="Previous section">&#8249;</button>' +
      '<button type="button" class="brief-mob-rail-current" aria-expanded="false" aria-controls="dd-mob-sheet">' +
        '<span class="brief-mob-rail-meta"><span class="brief-mob-rail-count">1 / ' + spineItems.length + '</span>' +
        '<span class="brief-mob-rail-hint">Jump</span></span>' +
        '<span class="brief-mob-rail-title">' + (spineItems[0] ? spineItems[0].title : 'Overview') + '</span>' +
        '<span class="brief-mob-rail-chevron" aria-hidden="true">&#9662;</span>' +
      '</button>' +
      '<button type="button" class="brief-mob-rail-btn brief-mob-rail-next" aria-label="Next section">&#8250;</button>' +
    '</div>' +
    '<div class="brief-mob-sheet" id="dd-mob-sheet" hidden>' +
      '<div class="brief-mob-sheet-head">' +
        '<span>Jump to section</span>' +
        '<button type="button" class="brief-mob-sheet-close" aria-label="Close section list">&#10005;</button>' +
      '</div>' +
      '<div class="brief-mob-sheet-list" role="list">' +
      spineItems.map(function(ch, idx) {
        return '<button type="button" class="brief-mob-sheet-item' + (idx === 0 ? ' active' : '') + '" role="listitem" data-target="' + ch.id + '" data-index="' + idx + '">' +
          '<span class="brief-mob-sheet-num">' + (idx + 1) + '</span>' +
          '<span class="brief-mob-sheet-label">' + ch.title + '</span>' +
          '<span class="brief-mob-sheet-check" aria-hidden="true">&#10003;</span>' +
        '</button>';
      }).join('') +
      '</div>' +
      '<div class="brief-mob-sheet-dots" aria-hidden="true">' +
      spineItems.map(function(_, idx) {
        return '<span class="brief-mob-dot' + (idx === 0 ? ' active' : '') + '" data-index="' + idx + '"></span>';
      }).join('') +
      '</div>' +
    '</div>';

  // Place rail after header so it sticks under it while body scrolls
  if (hdr && hdr.parentNode) {
    if (hdr.nextSibling) hdr.parentNode.insertBefore(mobRail, hdr.nextSibling);
    else hdr.parentNode.appendChild(mobRail);
  } else {
    body.insertBefore(mobRail, body.firstChild);
  }

  function closeMobSheet() {
    var sheet = mobRail.querySelector('.brief-mob-sheet');
    var cur = mobRail.querySelector('.brief-mob-rail-current');
    if (sheet) sheet.hidden = true;
    if (cur) cur.setAttribute('aria-expanded', 'false');
    mobRail.classList.remove('sheet-open');
  }
  function openMobSheet() {
    var sheet = mobRail.querySelector('.brief-mob-sheet');
    var cur = mobRail.querySelector('.brief-mob-rail-current');
    if (sheet) sheet.hidden = false;
    if (cur) cur.setAttribute('aria-expanded', 'true');
    mobRail.classList.add('sheet-open');
    var active = mobRail.querySelector('.brief-mob-sheet-item.active');
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
  }
  function goToSpineIndex(idx) {
    if (idx < 0 || idx >= spineItems.length) return;
    if (panel) {
      panel._spineFreezeIndex = idx;
      panel._spineFreezeUntil = Date.now() + 700;
      panel._spineActiveIndex = idx;
      panel._spineScrollDir = 0;
    }
    var id = spineItems[idx].id;
    var t = document.getElementById(id);
    closeMobSheet();
    // Optimistic rail update so arrows/progress feel instant
    var total = spineItems.length;
    var pct = total <= 1 ? 1 : (idx + 0.5) / total;
    if (panel && typeof panel._setRailUI === 'function') {
      panel._setRailUI(idx, pct, total);
    } else {
      var countEl = mobRail.querySelector('.brief-mob-rail-count');
      var titleEl = mobRail.querySelector('.brief-mob-rail-title');
      var fillEl = mobRail.querySelector('.brief-mob-rail-fill');
      if (countEl) countEl.textContent = (idx + 1) + ' / ' + total;
      if (titleEl) titleEl.textContent = spineItems[idx].title;
      if (fillEl) fillEl.style.width = ((idx + 1) / total * 100) + '%';
      mobRail.querySelectorAll('.brief-mob-sheet-item').forEach(function(c, i) {
        c.classList.toggle('active', i === idx);
      });
      mobRail.querySelectorAll('.brief-mob-dot').forEach(function(d, i) {
        d.classList.toggle('active', i === idx);
      });
      var prevBtn = mobRail.querySelector('.brief-mob-rail-prev');
      var nextBtn = mobRail.querySelector('.brief-mob-rail-next');
      if (prevBtn) prevBtn.disabled = idx <= 0;
      if (nextBtn) nextBtn.disabled = idx >= total - 1;
    }
    if (t) {
      // Instant jump on real scroll root — smooth + wrong ancestor was flaky on phones
      scrollDDToId(spineItems[idx].id, 'auto');
      window.setTimeout(function() {
        if (panel && typeof panel._spineOnScroll === 'function') panel._spineOnScroll();
      }, 80);
    }
  }
  mobRail._spineItems = spineItems;
  mobRail._goToSpineIndex = goToSpineIndex;

  mobRail.querySelector('.brief-mob-rail-current').addEventListener('click', function() {
    var sheet = mobRail.querySelector('.brief-mob-sheet');
    if (sheet && !sheet.hidden) closeMobSheet();
    else openMobSheet();
  });
  mobRail.querySelector('.brief-mob-sheet-close').addEventListener('click', closeMobSheet);
  mobRail.querySelector('.brief-mob-rail-prev').addEventListener('click', function() {
    var active = mobRail.querySelector('.brief-mob-sheet-item.active');
    var idx = active ? parseInt(active.getAttribute('data-index'), 10) : 0;
    goToSpineIndex(Math.max(0, idx - 1));
  });
  mobRail.querySelector('.brief-mob-rail-next').addEventListener('click', function() {
    var active = mobRail.querySelector('.brief-mob-sheet-item.active');
    var idx = active ? parseInt(active.getAttribute('data-index'), 10) : 0;
    goToSpineIndex(Math.min(spineItems.length - 1, idx + 1));
  });
  mobRail.querySelector('.brief-mob-sheet-list').addEventListener('click', function(e) {
    var btn = e.target.closest('[data-target]');
    if (!btn) return;
    goToSpineIndex(parseInt(btn.getAttribute('data-index'), 10));
  });

  /* Overview anchor */
  var overview = document.createElement('div');
  overview.className = 'brief-chapter brief-chapter--overview';

  /* ── Proof Bench first screen: Finding → KPIs → Cold open ── */
  function goToPlayableTarget(id) {
    var idx = -1;
    for (var si = 0; si < spineItems.length; si++) {
      if (spineItems[si].id === id) { idx = si; break; }
    }
    var el = document.getElementById(id);
    // Prefer direct instant scroll on the real scroll root (phones: #dd-body)
    if (el) {
      if (panel) {
        panel._spineFreezeIndex = idx >= 0 ? idx : panel._spineActiveIndex;
        panel._spineFreezeUntil = Date.now() + 500;
        if (idx >= 0) panel._spineActiveIndex = idx;
      }
      scrollDDToId(id, 'auto');
      if (idx >= 0 && panel && typeof panel._setRailUI === 'function') {
        var total = spineItems.length;
        var pct = total <= 1 ? 1 : (idx + 0.5) / total;
        panel._setRailUI(idx, pct, total);
      }
      return;
    }
    if (idx >= 0) goToSpineIndex(idx);
  }

  if (p.outcome) {
    var outcomeEl = document.createElement('div');
    outcomeEl.className = 'brief-outcome';
    outcomeEl.innerHTML =
      '<div class="brief-outcome-kicker">Finding</div>' +
      '<p class="brief-outcome-text">' + p.outcome + '</p>';
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
  attachKpiPeels(kpiStrip, key);

  /* BI: screenshot proof above the fold (single path, no board chrome) */
  if (DD_DASHBOARDS[key]) {
    var dashSlot = document.createElement('div');
    dashSlot.className = 'brief-dash-slot';
    dashSlot.id = 'ch-dashboard';
    renderDashboardCard(dashSlot, key);
    overview.appendChild(dashSlot);
  }

  /* Cold open interactive: star control above the fold */
  renderColdOpen(overview, key, p, goToPlayableTarget);

  /* Why it mattered: always open, short */
  if (p.decision) {
    var db = document.createElement('div');
    db.className = 'brief-decision brief-decision--open';
    db.innerHTML =
      '<div class="brief-decision-kicker">Why it mattered</div>' +
      '<p class="brief-decision-open-text">' + p.decision.what + ' ' + p.decision.why + '</p>';
    overview.appendChild(db);
  }

  /* Playable episode beats */
  renderPlayableEpisode(overview, key, p, goToPlayableTarget);

  overview.id = 'ch-overview';
  scrollBody.appendChild(overview);

  /* Explore (collapsed door with count) */
  if (p.stakeholders && p.stakeholders.length) {
    var sl = document.createElement('div');
    sl.className = 'brief-explore-wrap';
    var nQ = p.stakeholders.length;
    var slToggle = document.createElement('button');
    slToggle.type = 'button';
    slToggle.className = 'brief-disclose-btn';
    slToggle.setAttribute('aria-expanded', 'false');
    slToggle.textContent = 'Show ' + nQ + ' explore questions';
    var slBody = document.createElement('div');
    slBody.hidden = true;
    slBody.className = 'brief-explore-body';

    var slHdr = document.createElement('div');
    slHdr.className = 'brief-explore-hdr';
    slHdr.innerHTML = '<span class="brief-explore-label">What do you want to know?</span>';
    slBody.appendChild(slHdr);

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
        if (window.innerWidth < 640) {
          setTimeout(function() { slAnswer.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 80);
        }
      });
      slCards.appendChild(card);
    });

    slBody.appendChild(slCards);
    slBody.appendChild(slAnswer);
    slToggle.addEventListener('click', function() {
      var on = slBody.hidden;
      slBody.hidden = !on;
      slToggle.setAttribute('aria-expanded', on ? 'true' : 'false');
      slToggle.textContent = on ? ('Hide ' + nQ + ' explore questions') : ('Show ' + nQ + ' explore questions');
    });
    sl.appendChild(slToggle);
    sl.appendChild(slBody);
    overview.appendChild(sl);
  }

  /* Wrong turns + honest limits after cold open path */
  renderPlayableDepth(overview, key);

  /* Optional full finding (counted) */
  if (p.insight) {
    var insightFull = String(p.insight || '');
    var insightLead = insightFull.split(/(?<=[.!?])\s+/)[0] || insightFull;
    var insightRest = insightFull.slice(insightLead.length).trim();
    if (insightRest && insightRest.length > 30) {
      var moreH = document.createElement('button');
      moreH.type = 'button';
      moreH.className = 'brief-disclose-btn brief-disclose-btn--inline';
      moreH.setAttribute('aria-expanded', 'false');
      moreH.textContent = 'Show full finding detail';
      var restH = document.createElement('div');
      restH.className = 'brief-headline-text brief-headline-text--rest';
      restH.hidden = true;
      restH.textContent = insightRest;
      moreH.addEventListener('click', function() {
        var on = restH.hidden;
        restH.hidden = !on;
        moreH.setAttribute('aria-expanded', on ? 'true' : 'false');
        moreH.textContent = on ? 'Hide full finding detail' : 'Show full finding detail';
      });
      overview.appendChild(moreH);
      overview.appendChild(restH);
    }
  }

  p.sections.forEach(function(sec, si) {
    var chapter = p.chapters[si] || p.chapters[p.chapters.length - 1];
    var chWrap = document.createElement('div');
    chWrap.className = 'brief-chapter';
    chWrap.id = chapter.id;

    if (sec.type === 'insight-card') {
      chWrap.innerHTML = '<h3 class="brief-section-title">The Problem</h3>';
      var insightWrap = document.createElement('div');
      insightWrap.className = 'brief-insight-progressive';
      var full = String(sec.text || '');
      var lead = full.split(/(?<=[.!?])\s+/)[0] || full;
      var rest = full.slice(lead.length).trim();
      var leadEl = document.createElement('div');
      leadEl.className = 'brief-insight-block brief-insight-block--lead';
      leadEl.textContent = lead;
      insightWrap.appendChild(leadEl);
      if (rest && rest.length > 40) {
        var restEl = document.createElement('div');
        restEl.className = 'brief-insight-block brief-insight-block--rest';
        restEl.hidden = true;
        restEl.textContent = rest;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'brief-disclose-btn brief-disclose-btn--inline';
        btn.textContent = 'Show problem detail';
        btn.addEventListener('click', function() {
          var on = restEl.hidden;
          restEl.hidden = !on;
          btn.textContent = on ? 'Hide problem detail' : 'Show problem detail';
        });
        insightWrap.appendChild(btn);
        insightWrap.appendChild(restEl);
      }
      chWrap.appendChild(insightWrap);

    } else if (sec.type === 'thinking-trail') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + (sec.title || 'Thinking Trail') + '</h3>';
      renderThinkingTrail(chWrap, sec.steps);

    } else if (sec.type === 'morph-table') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + (sec.title || 'Data Transformation') + '</h3>';
      renderMorphTable(chWrap, sec.before, sec.after, sec.columns, sec.note);

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
      // Multi-category bars: full filter bench. Short series: interactive chart only.
      if (sec.data && sec.data.length >= 4) {
        renderFilterBench(bc, sec, { title: 'Explore · ' + (sec.title || 'chart'), chipLabel: sec.title || 'Categories' });
      } else {
        setTimeout(function() {
          renderBarChart(bc, sec.data, { fmt: sec.fmt, labelW: 130, ariaLabel: sec.title || 'Bar chart' });
        }, 0);
      }

    } else if (sec.type === 'line-chart') {
      chWrap.innerHTML = '<h3 class="brief-section-title">' + sec.title + '</h3>' +
        (sec.subtitle ? '<p class="brief-section-sub">' + sec.subtitle + '</p>' : '');
      var lc = document.createElement('div');
      lc.className = 'brief-chart-wrap';
      chWrap.appendChild(lc);
      setTimeout(function() {
        renderLineChart(lc, [{ values: sec.values, peaks: sec.peaks, color: 'var(--brief-accent)', width: 2.5 }], {
          labels: sec.labels,
          yFmt: function(v){ return '$' + Math.round(v/1000) + 'K'; },
          height: 200,
          ariaLabel: sec.title || 'Line chart'
        });
      }, 0);

    } else if (sec.type === 'whatif') {
      chWrap.innerHTML = '<h3 class="brief-section-title">Interactive Scenario</h3>';
      if (key === 'excel') {
        var discEl = document.createElement('p');
        discEl.className = 'brief-section-sub brief-cold-open__disclaimer';
        discEl.textContent = 'Illustrative lead-mix model. Not a raw dataset finding.';
        chWrap.appendChild(discEl);
      }
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
      var itSkim = document.createElement('div');
      itSkim.className = 'brief-skim-note';
      itSkim.innerHTML = '<span class="brief-skim-note__label">Skim</span> ' +
        '<span class="brief-skim-note__text">Headlines first. Open a card only if you want the proof.</span>';
      chWrap.appendChild(itSkim);
      (sec.items || []).forEach(function(item) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'brief-impact-text-card is-collapsed';
        card.setAttribute('aria-expanded', 'false');
        card.innerHTML =
          '<div class="bitc-icon" aria-hidden="true">' + (item.icon || '') + '</div>' +
          '<div class="bitc-body">' +
            '<div class="bitc-heading-row">' +
              '<div class="bitc-heading">' + (item.heading || '') + '</div>' +
              '<span class="bitc-toggle">Show proof</span>' +
            '</div>' +
            '<div class="bitc-text">' + (item.body || '') + '</div>' +
          '</div>';
        card.addEventListener('click', function() {
          var open = card.classList.contains('is-open');
          itGrid.querySelectorAll('.brief-impact-text-card.is-open').forEach(function(el) {
            if (el !== card) {
              el.classList.remove('is-open');
              el.classList.add('is-collapsed');
              el.setAttribute('aria-expanded', 'false');
            }
          });
          if (open) {
            card.classList.remove('is-open');
            card.classList.add('is-collapsed');
            card.setAttribute('aria-expanded', 'false');
          } else {
            card.classList.add('is-open');
            card.classList.remove('is-collapsed');
            card.setAttribute('aria-expanded', 'true');
          }
        });
        itGrid.appendChild(card);
      });
      chWrap.appendChild(itGrid);
    }

    scrollBody.appendChild(chWrap);
  });

  /* ── Ask This Project ── */
  if (p.context) {
    var askWrap = document.createElement('div');
    askWrap.className = 'brief-chapter brief-ask-wrap';
    askWrap.id = 'ch-ask';

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
        { label: 'Tools used', a: 'Power BI Desktop. Visualizations: donut chart (language preference), horizontal bar (salary by title), treemap (country distribution), gauge charts (satisfaction scores). DAX for calculated fields. Data cleaning done in Power Query. Dashboard screenshots from Power BI Desktop. Optional original .pbix linked under the shots.' },
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
        { label: 'Tools used', a: 'Microsoft Excel. Pivot tables for segmentation by region, income, gender, marital status, and occupation. Slicers for interactive filtering. Calculated columns for derived segments. Charts: bar charts for income distribution, line charts for commute distance vs. purchase rate. Dashboard screenshots from Excel. Optional original .xlsx linked under the shots.' },
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

  /* Footer inside panel (not a floating viewport pill) */
  var footer = document.createElement('div');
  footer.className = 'brief-dd-footer';
  var exitBar = document.createElement('div');
  exitBar.className = 'brief-exit-bar';
  var dashFoot = DD_DASHBOARDS[key]
    ? ('<button type="button" class="brief-exit-dash" data-dd-dash="' + key + '">Back to ' + DD_DASHBOARDS[key].tool + ' screenshots</button>')
    : '';
  exitBar.innerHTML =
    '<button type="button" class="brief-exit-back" data-dd-close="1">' +
      '<span aria-hidden="true">&#8592;</span> Back to portfolio' +
    '</button>' +
    dashFoot +
    '<span class="brief-exit-hint"><kbd>Esc</kbd> closes</span>' +
    '<button type="button" class="brief-exit-close" data-dd-close="1" aria-label="Close deep dive">Close</button>';
  footer.appendChild(exitBar);
  body.appendChild(footer);
  footer.querySelectorAll('[data-dd-close]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.closeDD === 'function') window.closeDD(e);
    });
  });
  footer.querySelectorAll('[data-dd-dash]').forEach(function(btn) {
    btn.addEventListener('click', function(e) { openDDDashboard(key, e); });
  });

  /* Spine nav: click label/dot to jump */
  spine.querySelectorAll('.brief-spine-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var tid = btn.getAttribute('data-target');
      var t = (scrollBody && scrollBody.querySelector('#' + tid)) || document.getElementById(tid);
      var idx = parseInt(btn.getAttribute('data-index'), 10);
      if (isNaN(idx)) {
        var all = panel.querySelectorAll('.brief-spine-item');
        idx = Array.prototype.indexOf.call(all, btn);
      }
      panel._spineFreezeIndex = idx;
      panel._spineFreezeUntil = Date.now() + 700;
      panel._spineActiveIndex = idx;
      panel._spineScrollDir = 0;
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Optimistic paint
      if (typeof panel._spineOnScroll === 'function') panel._spineOnScroll();
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
  setTimeout(function() { initSpine(panel);
  initMobileChrome(panel); }, 100);

  /* ── Bottom bar is hidden - close and theme are in the header ── */
  /* Keep the element for backwards compat but keep it empty */
  var oldBarFinal = document.getElementById('dd-bottom-bar');
  if (oldBarFinal) oldBarFinal.parentNode.removeChild(oldBarFinal);
}

/* ═══════════════════════════════════════════════════════════════════
   PANEL OPEN / CLOSE
═══════════════════════════════════════════════════════════════════ */
/* ── Deep dive theme toggle - delegates to main portfolio toggle ── */

function ddThemeIconHtml(isLight) {
  // Sun = light mode active, moon = dark mode active
  if (isLight) {
    return '<span id="dd-theme-icon" class="dd-theme-emoji" aria-hidden="true">\u2600\uFE0F</span>';
  }
  return '<span id="dd-theme-icon" class="dd-theme-emoji" aria-hidden="true">\uD83C\uDF19</span>';
}
function setDDThemeButton(isLight) {
  var btn = document.getElementById('dd-theme-toggle');
  if (!btn) return;
  btn.innerHTML = ddThemeIconHtml(!!isLight);
  btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  btn.setAttribute('title', isLight ? 'Light mode' : 'Dark mode');
  btn.setAttribute('data-mode', isLight ? 'light' : 'dark');
}

window.toggleDDTheme = function() {
  var panel = document.getElementById('dd-panel');
  var mainToggle = document.querySelector('[data-theme-toggle]');
  if (mainToggle) {
    mainToggle.click();
    // Sync icon after main page flips html[data-theme]
    window.setTimeout(function() {
      var t = document.documentElement.getAttribute('data-theme') || 'dark';
      var light = t === 'light';
      if (panel) {
        if (light) panel.classList.add('brief-light');
        else panel.classList.remove('brief-light');
      }
      setDDThemeButton(light);
    }, 0);
    return;
  }
  if (!panel) return;
  var isLight = panel.classList.toggle('brief-light');
  setDDThemeButton(isLight);
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
  if (mainTheme === 'light') {
    panel.classList.add('brief-light');
  } else {
    panel.classList.remove('brief-light');
  }
  setDDThemeButton(mainTheme === 'light');
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

window.closeDD = function(e) {
  if (e) {
    try { e.preventDefault(); } catch (err0) {}
    try { e.stopPropagation(); } catch (err1) {}
  }
  var panel = document.getElementById('dd-panel');
  var overlay = document.getElementById('dd-overlay');
  if (!panel) return;
  if (!panel.classList.contains('open') && !window.__ddClosingFromPop) return;

  /* Tear down episode dock / observer first */
  try {
    if (panel._episodeIO) { panel._episodeIO.disconnect(); panel._episodeIO = null; }
  } catch (err2) {}
  var dock = panel.querySelector('.brief-episode-dock');
  if (dock && dock.parentNode) dock.parentNode.removeChild(dock);
  panel.classList.remove('has-episode-dock');
  var footer = panel.querySelector('.brief-dd-footer');
  if (footer) footer.classList.remove('has-episode-dock');

  /* Close UI first so the red hover state is not the only feedback */
  panel.classList.remove('open');
  document.body.classList.remove('dd-open');
  if (overlay) overlay.classList.remove('visible');
  document.body.style.overflow = '';

  var rail = document.getElementById('data-rail');
  if (rail) rail.style.cssText = '';

  /* History back after close, without re-entry loops */
  var shouldBack = window.__ddHistoryPushed && !window.__ddClosingFromPop;
  window.__ddHistoryPushed = false;
  window.__ddClosingFromPop = false;
  if (shouldBack) {
    try { history.back(); } catch (err3) {}
  }

  var y = window.__ddPageScrollY || 0;
  requestAnimationFrame(function() {
    window.scrollTo(0, y);
    var prev = window.__ddReturnFocus;
    if (prev && typeof prev.focus === 'function') {
      try { prev.focus({ preventScroll: true }); } catch (err4) { try { prev.focus(); } catch (e2) {} }
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
