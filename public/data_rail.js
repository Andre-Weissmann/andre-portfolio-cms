/* ═══════════════════════════════════════════════════════════════════
   THE DATA RAIL — Portfolio Navigation
   A floating glass pill (mobile) / side rail (desktop) that doubles
   as a live scroll-progress data visualization.
   Zero dependencies. Vanilla JS + CSS custom properties.
═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── Section definitions ─────────────────────────────────────── */
  var SECTIONS = [
    { id: 'about',      label: 'About',      readout: 'Summary' },
    { id: 'skills',     label: 'Skills',     readout: 'Tools & technologies' },
    { id: 'projects',   label: 'Projects',   readout: '5 case studies' },
    { id: 'experience', label: 'Experience', readout: 'Work history' },
    { id: 'contact',    label: 'Contact',    readout: 'Send a message' }
  ];

  var DESKTOP_BP = 1024;
  var rail, trigger, sheet, filterInput, listEl, progressBar, dotsWrap;
  var sectionEls = [];
  var activeIdx = -1;
  var isExpanded = false;
  var scrollDir = 'down';
  var lastScrollY = 0;
  var rafPending = false;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Build DOM ───────────────────────────────────────────────── */
  function buildRail() {
    // Remove old mobile-section-nav — Data Rail replaces it
    var oldNav = document.getElementById('mobile-section-nav');
    if (oldNav) oldNav.remove();

    rail = document.createElement('nav');
    rail.id = 'data-rail';
    rail.setAttribute('aria-label', 'Section navigation');
    rail.setAttribute('data-mode', isDesktop() ? 'rail' : 'pill');
    rail.setAttribute('data-expanded', 'false');

    /* Progress track */
    progressBar = document.createElement('div');
    progressBar.className = 'dr-progress';
    progressBar.setAttribute('aria-hidden', 'true');

    var progressFill = document.createElement('div');
    progressFill.className = 'dr-progress__fill';
    progressBar.appendChild(progressFill);

    /* Dots */
    dotsWrap = document.createElement('div');
    dotsWrap.className = 'dr-dots';
    dotsWrap.setAttribute('aria-hidden', 'true');

    SECTIONS.forEach(function(s, i) {
      var dot = document.createElement('span');
      dot.className = 'dr-dot';
      dot.dataset.idx = i;
      dot.title = s.label;
      dotsWrap.appendChild(dot);
    });

    /* Trigger button (pill tap zone) */
    trigger = document.createElement('button');
    trigger.className = 'dr-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'dr-sheet');
    trigger.setAttribute('aria-label', 'Open section navigation');

    var triggerInner = document.createElement('span');
    triggerInner.className = 'dr-trigger__inner';
    triggerInner.appendChild(progressBar);
    triggerInner.appendChild(dotsWrap);
    trigger.appendChild(triggerInner);

    /* Active label shown in pill */
    var activeLabel = document.createElement('span');
    activeLabel.className = 'dr-active-label';
    activeLabel.textContent = 'Navigate';
    trigger.appendChild(activeLabel);

    /* Sheet (expanded state) */
    sheet = document.createElement('div');
    sheet.className = 'dr-sheet';
    sheet.id = 'dr-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'false');
    sheet.setAttribute('aria-label', 'Jump to section');
    sheet.hidden = true;

    /* Section list */
    listEl = document.createElement('ul');
    listEl.className = 'dr-list';
    listEl.setAttribute('role', 'list');

    SECTIONS.forEach(function(s, i) {
      var li = document.createElement('li');
      li.className = 'dr-list__item';
      li.dataset.idx = i;

      var btn = document.createElement('button');
      btn.className = 'dr-list__btn';
      btn.dataset.target = s.id;

      var labelSpan = document.createElement('span');
      labelSpan.className = 'dr-list__label';
      labelSpan.textContent = s.label;

      var readoutSpan = document.createElement('span');
      readoutSpan.className = 'dr-list__readout';
      readoutSpan.textContent = s.readout;

      btn.appendChild(labelSpan);
      btn.appendChild(readoutSpan);
      li.appendChild(btn);
      listEl.appendChild(li);
    });

    /* Close button inside sheet */
    var closeBtn = document.createElement('button');
    closeBtn.className = 'dr-sheet__close';
    closeBtn.setAttribute('aria-label', 'Close navigation');
    closeBtn.style.touchAction = 'manipulation';
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    sheet.appendChild(closeBtn);
    sheet.appendChild(listEl);

    /* Backdrop (tap outside to close) */
    var backdrop = document.createElement('div');
    backdrop.className = 'dr-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    /* Assemble */
    rail.appendChild(trigger);
    rail.appendChild(sheet);
    document.body.appendChild(backdrop);
    document.body.appendChild(rail);

    /* Store backdrop ref */
    rail._backdrop = backdrop;
  }

  /* ── Events ──────────────────────────────────────────────────── */
  function bindEvents() {
    /* Trigger tap → toggle sheet */
    trigger.addEventListener('click', function() {
      isExpanded ? collapse() : expand();
    });
    /* iOS Safari: touchstart registration prevents 300ms tap delay on fixed elements */
    trigger.addEventListener('touchstart', function() {}, { passive: true });

    /* Close button */
    sheet.querySelector('.dr-sheet__close').addEventListener('click', collapse);

    /* Backdrop tap → close */
    rail._backdrop.addEventListener('click', collapse);

    /* iOS Safari: touchstart on list prevents 300ms delay */
    listEl.addEventListener('touchstart', function() {}, { passive: true });
    /* Section row click */
    listEl.addEventListener('click', function(e) {
      var btn = e.target.closest('.dr-list__btn');
      if (!btn) return;
      var targetId = btn.dataset.target;
      collapse();
      jumpTo(targetId);
    });

    /* Filter input */


    /* Keyboard: Escape closes */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isExpanded) collapse();
    });

    /* Scroll → progress + active section + direction */
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Resize → mode switch */
    window.matchMedia('(min-width: ' + DESKTOP_BP + 'px)').addEventListener('change', function(e) {
      rail.setAttribute('data-mode', e.matches ? 'rail' : 'pill');
      if (e.matches && isExpanded) collapse();
    });

    /* Desktop: list item direct nav (rail always open) */
    if (isDesktop()) {
      // Also bind hover readout reveal (CSS handles this)
    }
  }

  /* ── Navigation ──────────────────────────────────────────────── */
  function _absTop(el) {
    var y = 0;
    while (el) { y += el.offsetTop; el = el.offsetParent; }
    return y;
  }
  function jumpTo(sectionId) {
    var el = document.getElementById(sectionId);
    if (!el) return;
    var navH = (document.querySelector('header') || {}).offsetHeight || 68;
    window.scrollTo({ top: Math.max(0, _absTop(el) - navH), behavior: prefersReduced ? 'instant' : 'smooth' });
  }

  /* ── Expand / Collapse ───────────────────────────────────────── */
  function expand() {
    isExpanded = true;
    rail.setAttribute('data-expanded', 'true');
    trigger.setAttribute('aria-expanded', 'true');
    sheet.hidden = false;
    rail._backdrop.classList.add('dr-backdrop--visible');
    // Dim page content
    document.body.classList.add('dr-page-dimmed');
    // Focus filter after animation
    setTimeout(function() {
      Array.from(listEl.querySelectorAll('.dr-list__item')).forEach(function(li) { li.hidden = false; });
    }, prefersReduced ? 0 : 80);
  }

  function collapse() {
    isExpanded = false;
    rail.setAttribute('data-expanded', 'false');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('dr-page-dimmed');
    rail._backdrop.classList.remove('dr-backdrop--visible');
    // Hide sheet after animation
    setTimeout(function() {
      sheet.hidden = true;
    }, prefersReduced ? 0 : 320);
  }

  /* ── Scroll handler ──────────────────────────────────────────── */
  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function() {
      rafPending = false;
      var sy = window.scrollY;

      // Scroll direction
      scrollDir = sy > lastScrollY ? 'down' : 'up';
      lastScrollY = sy;

      // Hide pill while in hero, show once past hero (only in pill mode)
      if (!isDesktop()) {
        var heroEl = document.querySelector('.hero-section') || document.querySelector('section');
        var heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
        if (heroBottom > 0 && !isExpanded) {
          rail.classList.add('dr--scroll-hidden');
        } else if (!isExpanded) {
          rail.classList.remove('dr--scroll-hidden');
        }
      }

      // Progress fill
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? Math.min(100, (sy / docH) * 100) : 0;
      var fill = rail.querySelector('.dr-progress__fill');
      if (fill) fill.style.setProperty('--pct', pct + '%');

      // Active section detection
      updateActiveSection(sy);
    });
  }

  function updateActiveSection(sy) {
    var newActive = -1;
    var navH = 80;
    for (var i = sectionEls.length - 1; i >= 0; i--) {
      var el = sectionEls[i];
      if (!el) continue;
      if (sy + navH >= el.offsetTop - 40) {
        newActive = i;
        break;
      }
    }

    if (newActive === activeIdx) return;
    activeIdx = newActive;

    // Update dots
    Array.from(dotsWrap.querySelectorAll('.dr-dot')).forEach(function(dot, i) {
      dot.classList.toggle('dr-dot--active', i === activeIdx);
      dot.classList.toggle('dr-dot--passed', i < activeIdx);
    });

    // Update list item highlight
    Array.from(listEl.querySelectorAll('.dr-list__item')).forEach(function(li, i) {
      li.classList.toggle('dr-list__item--active', i === activeIdx);
    });

    // Update active label in pill
    var lbl = rail.querySelector('.dr-active-label');
    if (lbl) {
      lbl.textContent = activeIdx >= 0 ? SECTIONS[activeIdx].label : 'Navigate';
    }
  }

  /* ── Helpers ─────────────────────────────────────────────────── */
  function isDesktop() {
    return window.innerWidth >= DESKTOP_BP;
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    sectionEls = SECTIONS.map(function(s) {
      return document.getElementById(s.id);
    });

    buildRail();
    bindEvents();
    onScroll(); // Initial state
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
