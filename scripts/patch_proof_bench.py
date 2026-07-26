#!/usr/bin/env python3
"""Proof Bench shell: cold open first, unified disclosure, KPI proof cues."""
from pathlib import Path

JS = Path("/home/user/workspace/portfolio-parity/public/deep_dive_v2.js")
CSS = Path("/home/user/workspace/portfolio-parity/public/deep_dive_v2.css")
js = JS.read_text()
css = CSS.read_text()

# ── 1. Morph table: optional scrub slider ──────────────────────────
old_morph_sig = "function renderMorphTable(container, before, after, columns, note) {"
new_morph_sig = "function renderMorphTable(container, before, after, columns, note, opts) {\n  opts = opts || {};"
if old_morph_sig not in js:
    raise SystemExit("morph sig missing")
js = js.replace(old_morph_sig, new_morph_sig, 1)

old_morph_end = """  wrap.querySelector('.brief-morph-header').addEventListener('click', function(e) {
    var btn = e.target.closest('.brief-morph-btn');
    if (!btn) return;
    mode = btn.dataset.mode;
    wrap.querySelectorAll('.brief-morph-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
    var badge = wrap.querySelector('.brief-morph-badge');
    badge.className = 'brief-morph-badge ' + (mode === 'before' ? 'raw' : 'clean');
    badge.textContent = mode === 'before' ? 'Before' : 'After';
    renderRows(mode === 'before' ? before : after, mode);
  });
}"""

new_morph_end = """  wrap.querySelector('.brief-morph-header').addEventListener('click', function(e) {
    var btn = e.target.closest('.brief-morph-btn');
    if (!btn) return;
    mode = btn.dataset.mode;
    wrap.querySelectorAll('.brief-morph-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
    var badge = wrap.querySelector('.brief-morph-badge');
    badge.className = 'brief-morph-badge ' + (mode === 'before' ? 'raw' : 'clean');
    badge.textContent = mode === 'before' ? 'Before' : 'After';
    renderRows(mode === 'before' ? before : after, mode);
    var scrub = wrap.querySelector('.brief-morph-scrub');
    if (scrub) scrub.value = mode === 'before' ? '0' : '100';
  });

  if (opts.scrub) {
    var scrubWrap = document.createElement('div');
    scrubWrap.className = 'brief-morph-scrub-wrap';
    scrubWrap.innerHTML =
      '<label class="brief-morph-scrub-label" for="morph-scrub-range">Drag: raw to cleaned</label>' +
      '<input type="range" class="brief-morph-scrub" id="morph-scrub-range" min="0" max="100" value="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
      '<div class="brief-morph-scrub-meta">' +
        '<span data-scrub-side="raw">Raw</span>' +
        '<span class="brief-morph-scrub-pct" data-scrub-pct>0% cleaned</span>' +
        '<span data-scrub-side="clean">Clean</span>' +
      '</div>';
    wrap.insertBefore(scrubWrap, tbl);
    var scrub = scrubWrap.querySelector('.brief-morph-scrub');
    var pctEl = scrubWrap.querySelector('[data-scrub-pct]');
    function applyScrub(v) {
      var cleaned = parseInt(v, 10) >= 50;
      mode = cleaned ? 'after' : 'before';
      wrap.querySelectorAll('.brief-morph-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.mode === mode);
      });
      var badge = wrap.querySelector('.brief-morph-badge');
      badge.className = 'brief-morph-badge ' + (cleaned ? 'clean' : 'raw');
      badge.textContent = cleaned ? 'After' : 'Before';
      renderRows(cleaned ? after : before, mode);
      scrub.setAttribute('aria-valuenow', String(v));
      if (pctEl) pctEl.textContent = v + '% cleaned';
    }
    scrub.addEventListener('input', function() { applyScrub(scrub.value); });
  }
}"""

if old_morph_end not in js:
    raise SystemExit("morph end missing")
js = js.replace(old_morph_end, new_morph_end, 1)

# ── 2. Line chart: persistent peak labels ──────────────────────────
old_peaks = """    if (ds.peaks) {
      ds.peaks.forEach(function(pi) {
        var dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', px(pi)); dot.setAttribute('cy', py(ds.values[pi]));
        dot.setAttribute('r', 4); dot.setAttribute('fill', '#E8AF34');
        dot.addEventListener('mouseenter', function(e) {
          showTip('<strong>Week ' + (pi+1) + '</strong><br>$' + ds.values[pi].toLocaleString(), e.clientX, e.clientY);
        });
        dot.addEventListener('mouseleave', hideTip);
        svg.appendChild(dot);
      });"""

new_peaks = """    if (ds.peaks) {
      ds.peaks.forEach(function(pi) {
        var dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', px(pi)); dot.setAttribute('cy', py(ds.values[pi]));
        dot.setAttribute('r', 4); dot.setAttribute('fill', '#E8AF34');
        var peakLabel = document.createElementNS(ns, 'text');
        peakLabel.setAttribute('x', px(pi));
        peakLabel.setAttribute('y', Math.max(12, py(ds.values[pi]) - 10));
        peakLabel.setAttribute('text-anchor', 'middle');
        peakLabel.setAttribute('font-size', '9');
        peakLabel.setAttribute('font-weight', '700');
        peakLabel.setAttribute('fill', 'var(--brief-text)');
        var weekLbl = (opts.labels && opts.labels[pi]) ? opts.labels[pi] : ('W' + (pi + 1));
        peakLabel.textContent = weekLbl + ' $' + Math.round(ds.values[pi] / 1000) + 'K';
        svg.appendChild(peakLabel);
        dot.addEventListener('mouseenter', function(e) {
          showTip('<strong>Week ' + (pi+1) + '</strong><br>$' + ds.values[pi].toLocaleString(), e.clientX, e.clientY);
        });
        dot.addEventListener('mouseleave', hideTip);
        svg.appendChild(dot);
      });"""

if old_peaks not in js:
    raise SystemExit("peaks block missing")
js = js.replace(old_peaks, new_peaks, 1)

# ── 3. Trail toggle labels: Show step / Hide step ──────────────────
js = js.replace(
    "'<span class=\"brief-trail__toggle\" aria-hidden=\"true\">Details</span>'",
    "'<span class=\"brief-trail__toggle\" aria-hidden=\"true\">Show step</span>'",
)
js = js.replace("if (t0) t0.textContent = 'Details';", "if (t0) t0.textContent = 'Show step';")
js = js.replace("if (tog) tog.textContent = 'Details';", "if (tog) tog.textContent = 'Show step';")
js = js.replace("if (tog) tog.textContent = 'Hide';", "if (tog) tog.textContent = 'Hide step';")
js = js.replace(
    "more.textContent = 'Show all ' + steps.length + ' moves';",
    "more.textContent = 'Show all ' + steps.length + ' trail moves';",
)
js = js.replace(
    "more.textContent = expanded ? 'Show fewer moves' : ('Show all ' + steps.length + ' moves');",
    "more.textContent = expanded ? ('Hide extra trail moves') : ('Show all ' + steps.length + ' trail moves');",
)

# ── 4. Impact card toggle: Show proof / Hide proof ─────────────────
js = js.replace(
    "'<span class=\"bitc-toggle\">Why</span>'",
    "'<span class=\"bitc-toggle\">Show proof</span>'",
)

# ── 5. Wrong turns: counted header + card labels ───────────────────
old_wt = """  if (cfg.wrongTurns && cfg.wrongTurns.length) {
    var wt = document.createElement('div');
    wt.className = 'brief-wrong-turns';
    wt.innerHTML = '<h3 class="brief-section-title">Wrong turns that looked right</h3>' +
      '<p class="brief-section-sub">Senior signal: what was tried and what killed it.</p>';
    var grid = document.createElement('div');
    grid.className = 'brief-wrong-grid';
    cfg.wrongTurns.forEach(function(w) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'brief-wrong-card is-collapsed';
      card.setAttribute('aria-expanded', 'false');
      card.innerHTML =
        '<div class="brief-wrong-title">' + w.title + '</div>' +
        '<div class="brief-wrong-meta">Tap for what looked good vs what killed it</div>' +
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
      grid.appendChild(card);
    });
    wt.appendChild(grid);
    container.appendChild(wt);
  }"""

new_wt = """  if (cfg.wrongTurns && cfg.wrongTurns.length) {
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
  }"""

if old_wt not in js:
    raise SystemExit("wrong turns block missing")
js = js.replace(old_wt, new_wt, 1)

# ── 6. KPI peels: visible Press for proof cue ──────────────────────
old_peel = """  kpiStrip.querySelectorAll('.brief-kpi-card').forEach(function(card) {
    card.classList.add('brief-kpi-card--peelable');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    var labelEl = card.querySelector('.brief-kpi-label');
    var label = labelEl ? labelEl.textContent.trim() : '';
    var peel = cfg.peels[label];
    if (!peel) return;
    card.setAttribute('aria-label', label + '. Show proof.');"""

new_peel = """  kpiStrip.querySelectorAll('.brief-kpi-card').forEach(function(card) {
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
    card.setAttribute('aria-label', label + '. Press for proof.');"""

if old_peel not in js:
    raise SystemExit("kpi peel block missing")
js = js.replace(old_peel, new_peel, 1)

# ── 7. Insert cold open + filter bench helpers before renderPlayableEpisode ──
HELPERS = r'''
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

  var chips = document.createElement('div');
  chips.className = 'brief-filter-bench__chips';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', opts.chipLabel || 'Filter options');

  var allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'brief-filter-chip is-active';
  allBtn.textContent = 'All (' + barSec.data.length + ')';
  allBtn.setAttribute('data-filter', '__all__');
  chips.appendChild(allBtn);

  barSec.data.forEach(function(d, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'brief-filter-chip';
    b.textContent = d.label;
    b.setAttribute('data-filter', String(i));
    chips.appendChild(b);
  });
  wrap.appendChild(chips);

  var count = document.createElement('div');
  count.className = 'brief-filter-bench__count';
  count.textContent = 'Showing ' + barSec.data.length + ' of ' + barSec.data.length + ' groups';
  wrap.appendChild(count);

  var chart = document.createElement('div');
  chart.className = 'brief-chart-wrap brief-filter-bench__chart';
  wrap.appendChild(chart);
  container.appendChild(wrap);

  function paint(rows) {
    chart.innerHTML = '';
    count.textContent = 'Showing ' + rows.length + ' of ' + barSec.data.length + ' groups';
    setTimeout(function() {
      renderBarChart(chart, rows, { fmt: barSec.fmt, labelW: 120 });
    }, 0);
  }
  paint(barSec.data);

  chips.addEventListener('click', function(e) {
    var btn = e.target.closest('.brief-filter-chip');
    if (!btn) return;
    chips.querySelectorAll('.brief-filter-chip').forEach(function(c) { c.classList.remove('is-active'); });
    btn.classList.add('is-active');
    var f = btn.getAttribute('data-filter');
    if (f === '__all__') paint(barSec.data);
    else {
      var idx = parseInt(f, 10);
      paint([barSec.data[idx]]);
    }
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
      var jump = document.createElement('button');
      jump.type = 'button';
      jump.className = 'brief-disclose-btn brief-cold-open__jump';
      jump.textContent = 'Jump to December 25 spike';
      var lc = document.createElement('div');
      lc.className = 'brief-chart-wrap';
      stage.appendChild(jump);
      stage.appendChild(lc);
      var peakIdx = (line.peaks && line.peaks.length) ? line.peaks[line.peaks.length - 1] : 51;
      jump.addEventListener('click', function() {
        var note = stage.querySelector('.brief-cold-open__peak-note');
        if (!note) {
          note = document.createElement('div');
          note.className = 'brief-cold-open__peak-note';
          stage.insertBefore(note, lc);
        }
        var val = line.values[peakIdx];
        note.textContent = 'Week ' + (peakIdx + 1) + ': $' + Number(val).toLocaleString() + ' weekly revenue peak (holiday demand).';
        note.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      setTimeout(function() {
        renderLineChart(lc, [{ values: line.values, peaks: line.peaks, color: 'var(--brief-accent)', width: 2 }], {
          labels: line.labels,
          yFmt: function(v) { return '$' + Math.round(v / 1000) + 'K'; },
          height: 170
        });
      }, 0);
      // Auto-highlight last peak note
      jump.click();
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

'''

marker = "function renderPlayableEpisode(container, key, p, goToId) {"
if marker not in js:
    raise SystemExit("renderPlayableEpisode marker missing")
js = js.replace(marker, HELPERS + marker, 1)

# ── 8. Rewrite overview stack order ────────────────────────────────
old_overview = """  /* ── First screen: Result → KPIs (recruiter 10s) ── */
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
  attachKpiPeels(kpiStrip, key);

  /* Playable episode: beats jump into real chapters */
  function goToPlayableTarget(id) {
    var idx = -1;
    for (var si = 0; si < spineItems.length; si++) {
      if (spineItems[si].id === id) { idx = si; break; }
    }
    if (idx >= 0) goToSpineIndex(idx);
    else {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  renderPlayableEpisode(overview, key, p, goToPlayableTarget);

  overview.id = 'ch-overview';
  scrollBody.appendChild(overview);

  /* ── Decision Brief (collapsed by default) ── */
  if (p.decision) {
    var dbWrap = document.createElement('div');
    dbWrap.className = 'brief-decision-wrap';
    var dbToggle = document.createElement('button');
    dbToggle.type = 'button';
    dbToggle.className = 'brief-disclose-btn';
    dbToggle.textContent = 'Why this mattered';
    var db = document.createElement('div');
    db.className = 'brief-decision';
    db.hidden = true;
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
    dbToggle.addEventListener('click', function() {
      var on = db.hidden;
      db.hidden = !on;
      dbToggle.textContent = on ? 'Hide context' : 'Why this mattered';
    });
    dbWrap.appendChild(dbToggle);
    dbWrap.appendChild(db);
    overview.appendChild(dbWrap);
  }

  /* ── Insight Headline (lead only if long) ── */
  var headline = document.createElement('div');
  headline.className = 'brief-headline';
  var insightFull = String(p.insight || '');
  var insightLead = insightFull.split(/(?<=[.!?])\\s+/)[0] || insightFull;
  var insightRest = insightFull.slice(insightLead.length).trim();
  headline.innerHTML = '<div class="brief-headline-label">The Key Finding</div>' +
    '<div class="brief-headline-text">' + insightLead + '</div>';
  overview.appendChild(headline);
  if (insightRest && insightRest.length > 30) {
    var moreH = document.createElement('button');
    moreH.type = 'button';
    moreH.className = 'brief-disclose-btn brief-disclose-btn--inline';
    moreH.textContent = 'Full finding';
    var restH = document.createElement('div');
    restH.className = 'brief-headline-text brief-headline-text--rest';
    restH.hidden = true;
    restH.textContent = insightRest;
    moreH.addEventListener('click', function() {
      var on = restH.hidden;
      restH.hidden = !on;
      moreH.textContent = on ? 'Less' : 'Full finding';
    });
    overview.appendChild(moreH);
    overview.appendChild(restH);
  }

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

  renderPlayableDepth(overview, key);"""

new_overview = """  /* ── Proof Bench first screen: Finding → KPIs → Cold open ── */
  function goToPlayableTarget(id) {
    var idx = -1;
    for (var si = 0; si < spineItems.length; si++) {
      if (spineItems[si].id === id) { idx = si; break; }
    }
    if (idx >= 0) goToSpineIndex(idx);
    else {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    var insightLead = insightFull.split(/(?<=[.!?])\\s+/)[0] || insightFull;
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
  }"""

if old_overview not in js:
    raise SystemExit("overview block missing")
js = js.replace(old_overview, new_overview, 1)

# ── 9. Insight card More context → counted ─────────────────────────
js = js.replace(
    "btn.textContent = 'More context';",
    "btn.textContent = 'Show problem detail';",
)
js = js.replace(
    "btn.textContent = on ? 'Less context' : 'More context';",
    "btn.textContent = on ? 'Hide problem detail' : 'Show problem detail';",
)

# ── 10. Excel scenario disclaimer in chapter whatif ────────────────
old_whatif_ch = """    } else if (sec.type === 'whatif') {
      chWrap.innerHTML = '<h3 class="brief-section-title">Interactive Scenario</h3>';
      renderWhatIf(chWrap, sec.wi);"""

new_whatif_ch = """    } else if (sec.type === 'whatif') {
      chWrap.innerHTML = '<h3 class="brief-section-title">Interactive Scenario</h3>';
      if (key === 'excel') {
        var discEl = document.createElement('p');
        discEl.className = 'brief-section-sub brief-cold-open__disclaimer';
        discEl.textContent = 'Illustrative lead-mix model. Not a raw dataset finding.';
        chWrap.appendChild(discEl);
      }
      renderWhatIf(chWrap, sec.wi);"""

if old_whatif_ch not in js:
    raise SystemExit("whatif chapter missing")
js = js.replace(old_whatif_ch, new_whatif_ch, 1)

# ── 11. Header: always show GitHub + Close text ────────────────────
js = js.replace(
    '(p.github ? \'<a class="brief-tool-btn brief-github-btn" href="\' + p.github + \'" target="_blank" rel="noopener noreferrer" aria-label="View on GitHub" title="View on GitHub">\' + githubSvg + \'<span class="brief-github-label">GitHub</span></a>\' : \'\') +',
    '(p.github ? \'<a class="brief-tool-btn brief-github-btn" href="\' + p.github + \'" target="_blank" rel="noopener noreferrer" aria-label="Code on GitHub" title="Code on GitHub (leaves page)">\' + githubSvg + \'<span class="brief-github-label">Code on GitHub</span></a>\' : \'\') +',
)

# ── 12. Cache bust if present ──────────────────────────────────────
# leave to HTML separately

# Em-dash check
if "\u2014" in js or "\u2013" in js:
    js = js.replace("\u2014", "-").replace("\u2013", "-")

JS.write_text(js)
print("JS patched", JS.stat().st_size)

# ── CSS additions ──────────────────────────────────────────────────
CSS_ADD = """
/* ═══ Proof Bench: cold open + disclosure + KPI proof ═══ */
.brief-cold-open {
  margin: 1rem 0 1.25rem;
  padding: 1rem 1rem 1.1rem;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--brief-accent) 35%, var(--brief-border));
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--brief-accent) 10%, var(--brief-surface)) 0%, var(--brief-surface) 55%);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--brief-accent) 12%, transparent);
}
.brief-cold-open__kicker {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brief-accent);
  margin-bottom: 0.25rem;
}
.brief-cold-open__caption {
  margin: 0 0 0.85rem;
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--brief-text);
  font-weight: 600;
}
.brief-cold-open__stage { display: flex; flex-direction: column; gap: 0.75rem; }
.brief-cold-open__jump { align-self: flex-start; margin-top: 0.25rem; }
.brief-cold-open__secondary {
  margin-top: 0.35rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--brief-border);
}
.brief-cold-open__disclaimer,
.brief-section-sub.brief-cold-open__disclaimer {
  font-size: 0.82rem;
  color: var(--brief-text-faint);
  font-style: italic;
  margin: 0.25rem 0 0.5rem;
}
.brief-cold-open__peak-note {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  background: color-mix(in srgb, #E8AF34 18%, var(--brief-surface2));
  border: 1px solid color-mix(in srgb, #E8AF34 40%, var(--brief-border));
  color: var(--brief-text);
}

.brief-morph-scrub-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0.65rem 0 0.85rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  background: var(--brief-surface2);
  border: 1px solid var(--brief-border);
}
.brief-morph-scrub-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--brief-text);
}
.brief-morph-scrub {
  width: 100%;
  accent-color: var(--brief-accent);
  height: 1.5rem;
  cursor: pointer;
}
.brief-morph-scrub-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--brief-text-faint);
  font-weight: 600;
}
.brief-morph-scrub-pct { color: var(--brief-accent); }

.brief-filter-bench {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.brief-filter-bench__title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--brief-text);
}
.brief-filter-bench__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.brief-filter-chip {
  appearance: none;
  border: 1px solid var(--brief-border);
  background: var(--brief-surface2);
  color: var(--brief-text);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  cursor: pointer;
  min-height: 36px;
}
.brief-filter-chip.is-active {
  background: color-mix(in srgb, var(--brief-accent) 18%, var(--brief-surface));
  border-color: var(--brief-accent);
  color: var(--brief-text);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--brief-accent) 35%, transparent);
}
.brief-filter-bench__count {
  font-size: 0.78rem;
  color: var(--brief-text-faint);
  font-weight: 600;
}

.brief-kpi-proof-cue {
  margin-top: 0.35rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--brief-accent);
  opacity: 0.9;
}
.brief-kpi-card--peelable {
  cursor: pointer;
  position: relative;
}
.brief-kpi-card--peelable:hover,
.brief-kpi-card--peelable:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--brief-accent) 55%, transparent);
  outline-offset: 2px;
}
.brief-kpi-card--peelable.is-peeled {
  box-shadow: inset 0 0 0 2px var(--brief-accent);
}

.brief-decision--open {
  margin: 0.85rem 0 1rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: var(--brief-surface2);
  border: 1px solid var(--brief-border);
}
.brief-decision-kicker {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--brief-text-faint);
  margin-bottom: 0.35rem;
}
.brief-decision-open-text {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.45;
  color: var(--brief-text);
}

.brief-github-label,
.brief-close-text {
  display: inline !important;
}
.brief-tool-btn {
  gap: 0.35rem;
  min-height: 40px;
  padding: 0.35rem 0.65rem;
}

@media (max-width: 640px) {
  .brief-cold-open { padding: 0.85rem 0.8rem; }
  .brief-filter-chip { min-height: 40px; }
}
"""

if "Proof Bench: cold open" not in css:
    css = css + "\n" + CSS_ADD
    if "\u2014" in css or "\u2013" in css:
        css = css.replace("\u2014", "-").replace("\u2013", "-")
    CSS.write_text(css)
    print("CSS patched", CSS.stat().st_size)
else:
    print("CSS already had proof bench block")

print("OK")
