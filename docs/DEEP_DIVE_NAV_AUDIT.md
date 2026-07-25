# Deep Dive Navigation UX Audit
**Site audited:** [andre-weissmann-data-portfolio-live.pplx.app/portfolio.html](https://andre-weissmann-data-portfolio-live.pplx.app/portfolio.html)
**Component:** "Deep Dive" project panel (`#dd-panel` / `#dd-overlay`, powered by [`deep_dive_v2.js`](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.js) + [`deep_dive_v2.css`](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.css), wired from [`script.js`](https://andre-weissmann-data-portfolio-live.pplx.app/script.js))
**Method:** Static source review of the live HTML/CSS/JS bundle, plus live interactive testing with a headless Chromium (Playwright) session driving the actual production page — real clicks, real Tab/Escape key presses, real scroll positions, at both a 1440×900 desktop viewport and a 390×844 mobile viewport. Screenshots captured at each step.
**Persona:** First-time visitor, specifically a non-technical recruiter skimming the site, not a developer.

Screenshots saved in this folder (`/home/user/workspace/portfolio-nav/`):
- `shot_01_landing_scrolled.png` — landing page, scrolled to a project card
- `shot_02_panel_open_desktop.png` — Deep Dive panel open, desktop
- `shot_03_after_escape_close.png` — page state right after pressing Escape
- `shot_04_header_closeup.png` — cropped close-up of the header row (close / Esc hint / GitHub / theme toggle)
- `shot_05_panel_open_mobile.png` — Deep Dive panel open, mobile (390px)
- `shot_06_mobile_scrolled_close_visibility.png` — mobile panel after scrolling down (close button gone)

---

## 1. Pass/Fail Summary

| # | Question | Verdict | Evidence |
|---|---|---|---|
| 1 | Visible close button, discoverable at a glance? | **PARTIAL PASS** | A 32–44px circular "×" sits top-right of the panel header ([`deep_dive_v2.css` L196-219](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.css)). It's in the conventional location, but it's rendered in low-contrast "ghost" styling (`color: var(--dd-text-dim)` on `var(--dd-surface2)`) — visually the same weight as the theme toggle and less prominent than the blue "View on GitHub" button beneath it. `aria-label="Close panel"` is present ([`deep_dive_v2.js` L1105](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.js)). See `shot_04_header_closeup.png`. |
| 2 | Close returns to portfolio at same scroll position? | **PASS** | `closeDD()` only toggles classes and resets `body.style.overflow`; it never touches `window.scrollY` ([`deep_dive_v2.js` L1467-1477](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.js)). Live test: scrolled to `window.scrollY = 3015` before opening/closing via Escape — position was unchanged after close (confirmed via automated test, `shot_03_after_escape_close.png`). |
| 3 | Does Escape close the panel? | **PASS** | Global `keydown` listener calls `closeDD()` on `Escape` ([`deep_dive_v2.js` L1483-1485](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.js)). Live test confirmed: panel `.open` class removed after pressing Escape. A visible **"Esc" hint badge** is shown next to the close button — but **only at ≥900px viewport width** ([`deep_dive_v2.css` L1745-1793](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.css)). Below 900px (most laptops in a non-maximized window, all tablets/phones) this hint disappears with no replacement. |
| 4 | Does clicking the dark overlay close it? | **PASS** | `#dd-overlay` has a direct `click → closeDD` listener ([`deep_dive_v2.js` L1481-1482](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.js)). Live test: clicking at the far corner of the viewport (outside the panel) closed it. |
| 5 | Back affordance, or only X? | **FAIL** | Only the X (plus Escape/overlay-click, which are equivalent "dismiss" actions, not "back" navigation). There is no in-panel back/breadcrumb control, and critically **no browser Back-button support**: opening/closing never calls `history.pushState`/manipulates the URL hash, and there's no `popstate` listener anywhere in the bundle. A user who instinctively taps the browser/phone Back button will leave `portfolio.html` entirely (or go to whatever was in tab history before this site), not close the panel. |
| 6 | Can users navigate chapters clearly (spine, scroll, jump)? | **PASS on desktop / FAIL on mobile** | Desktop (≥900px): a left-hand "spine" shows dot + text label per chapter, a click handler calls `scrollIntoView({behavior:'smooth', block:'start'})` ([`deep_dive_v2.js` L1392-1398](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.js)), and a scroll-linked fill bar + active-dot highlighting confirms position ([`deep_dive_v2.js` L418-442](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.js)). Verified live: all 7 chapter buttons correctly scrolled the content. **Below 900px, and specifically at phone width (≤640px), the entire spine is hidden (`.brief-spine { display:none !important; }`, [`deep_dive_v2.css` L1228](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.css))** with no fallback chapter menu — mobile users get zero jump navigation and must scroll linearly through the full brief. |
| 7 | Keyboard trap / focus management when open? | **FAIL** | No focus trap exists anywhere in the bundle (no `tabindex` management, no `focus()` call on the panel or close button on open, no keydown-based Tab interception). Live test: after opening the panel, `document.activeElement` remained the trigger `.proj-explore-btn` in the background — focus is never moved into the dialog. Pressing Tab repeatedly (60×) escaped the panel to background-page elements within a handful of presses (e.g., landed on a hidden "Preview rows" control from the background contact/SQL form). Shift+Tab from the close button jumped straight to a background `#resume-back-btn` ("Back to Resume") link that is visually hidden behind the modal overlay. This is a real trap risk in reverse: keyboard users lose track of where focus is while the panel visually blocks the page underneath. `role="dialog" aria-modal="true"` is declared in markup ([`portfolio.html` L1375](https://andre-weissmann-data-portfolio-live.pplx.app/portfolio.html)) but not backed by actual focus containment, so assistive tech users get a false promise of a modal. |
| 8 | Mobile close affordance? | **FAIL (after scroll)** | On initial open, the close X is present top-right at a 44×44 CSS px touch target (`width/height: 36–44px` depending on breakpoint, [`deep_dive_v2.css` L1265-1270](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.css)) — good target size. But the header (and thus the close button) is a normal in-flow element inside the scrolling body on mobile, **not `position: sticky`**. Live test confirmed: after scrolling the mobile panel body down ~600px, the close button scrolled completely off-screen (`mobileCloseVisibleAfterScroll: false`), leaving no visible way to exit without scrolling back to the very top. There is also no swipe-down-to-dismiss gesture (`grep` for touch/pointer handlers returned zero matches). |
| 9 | Confusion: theme toggle vs close, GitHub vs close? | **LOW RISK — mostly PASS** | Visually, the three controls are differentiated: the close X is a small circular ghost icon isolated at the top-right corner of row 1; "View on GitHub" (dark pill, GitHub mark + label) and the theme toggle ("☾ Dark" / "☀ Light" text pill) sit together in row 2, left-aligned, below the title. Distinct shapes/positions reduce mix-ups. Minor issue: the theme toggle's moon/sun glyph is a single monochrome character similar in visual weight to the close "×" glyph, and both are circular/pill "chrome" buttons in muted tones — a first-time, non-technical user glancing quickly could plausibly hesitate between them for a split second, especially on mobile where they stack vertically in the same visual column ([`deep_dive_v2.css` L1249-1264](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.css)). The GitHub button opens a **new tab** (`target="_blank" rel="noopener noreferrer"`, [`deep_dive_v2.js` L1110](https://andre-weissmann-data-portfolio-live.pplx.app/deep_dive_v2.js)), so it cannot be mistaken for navigating away from the panel itself — low real risk there. |
| 10 | What would make navigation crystal clear in 10 seconds? | See recommendations below | — |

---

## 2. Ranked UX Issues (most severe first)

### P0 — Critical
1. **Mobile: close button disappears on scroll, no swipe-to-dismiss, no sticky header.** A recruiter on a phone who scrolls even one screen down has no visible way to leave the deep dive except scrolling all the way back up. This is the single worst issue in the audit because mobile traffic to a portfolio site (recruiters checking a link from LinkedIn/email on their phone) is common, and this creates a genuine "stuck" feeling.
2. **No focus containment (focus trap) while the dialog is open.** `role="dialog" aria-modal="true"` is declared but not enforced. Keyboard-only users (a subset of recruiters/hiring managers using accessibility tools, or simply power users navigating by Tab) will Tab out of the visible panel into hidden background controls within 4-6 presses, becoming lost with no visual indication of where focus went.
3. **Mobile: chapter/spine navigation is entirely absent.** `.brief-spine { display: none !important; }` below 640px with zero fallback (no hamburger, no jump-to-section select, no sticky mini-nav). Long deep dives (7 chapters) become a single uninterrupted scroll with no way to jump to "the interesting part."

### P1 — High
4. **No back-button / history support.** The browser/device Back gesture does not close the panel — it navigates away from the site (or to whatever was previously in history), a jarring and unrecoverable exit for a recruiter who was mid-read. This is the most "invisible" bug because it never surfaces during normal mouse use, only on real-world back-gesture habits (especially mobile swipe-back).
5. **Low visual prominence of the close button ("discoverable at a glance" fails the 10-second bar).** The "×" is a muted, low-contrast ghost icon that blends into the header chrome, competing visually with the theme toggle right next to/below it. A first-time, non-technical visitor scanning quickly may not register a clear "this is how I leave" affordance in under a couple of seconds — they're more likely to notice the bright blue "View on GitHub" button first, since it's the only saturated-color element in the header.

### P2 — Medium
6. **"Esc" keyboard hint only shows at ≥900px.** Useful affordance, but disappears exactly where it might help most — non-maximized browser windows and small laptops — undermining the "crystal clear in 10 seconds" goal for a meaningful slice of desktop users.
7. **Theme toggle and close button share similar visual language** (circular/pill, muted gray, single glyph) and sit close together, especially in the stacked mobile layout — minor but real chance of a rushed first click landing on the wrong control.
8. **No breadcrumb / "you are here" outside the spine dots.** On desktop the spine communicates chapter position well, but there's no textual indicator (e.g., "Chapter 3 of 7") for users who prefer text over dot-progress metaphors, and this information vanishes completely on mobile along with the spine.

---

## 3. Exact Recommended Fixes

### Fix 1 — Make the close button sticky and always visible on mobile
```css
/* deep_dive_v2.css — inside the existing @media (max-width: 640px) block */
@media (max-width: 640px) {
  .brief-hdr {
    position: sticky;
    top: 0;
    z-index: 20;              /* stays above scrolling chapter content */
  }
}
```
The header (`.brief-hdr`) already sits as the first flex child of `#dd-body`; making it `position: sticky; top: 0;` keeps the close button permanently visible while `#dd-body` scrolls, with zero JS changes required.

### Fix 2 — Add a persistent floating close button as a safety net (belt-and-suspenders)
Even with Fix 1, add a small fixed-position close affordance that's always present regardless of scroll/breakpoint edge cases:
```css
#dd-close-floating {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  right: 12px;
  z-index: 8200; /* above #dd-panel's 8100 */
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  color: #fff;
  display: none;
  align-items: center;
  justify-content: center;
}
#dd-panel.open ~ #dd-close-floating,
body.dd-open #dd-close-floating { display: flex; }
```
```js
// deep_dive_v2.js — near openDD/closeDD
// one-time creation on load
if (!document.getElementById('dd-close-floating')) {
  var floatBtn = document.createElement('button');
  floatBtn.id = 'dd-close-floating';
  floatBtn.setAttribute('aria-label', 'Close panel');
  floatBtn.innerHTML = '&#x2715;';
  floatBtn.onclick = function(){ window.closeDD(); };
  document.body.appendChild(floatBtn);
}
```

### Fix 3 — Add a focus trap and return focus to the trigger on close
```js
// deep_dive_v2.js — augment openDD / closeDD
var _lastTrigger = null;

window.openDD = function(key, triggerEl) {
  _lastTrigger = triggerEl || document.activeElement;
  var panel = document.getElementById('dd-panel');
  /* ...existing code... */
  panel.classList.add('open');
  document.body.classList.add('dd-open');
  /* Move focus into the dialog */
  setTimeout(function () {
    var closeBtn = document.getElementById('dd-close');
    if (closeBtn) closeBtn.focus();
  }, 60);
  document.addEventListener('keydown', trapFocus, true);
};

window.closeDD = function() {
  var panel = document.getElementById('dd-panel');
  /* ...existing code... */
  document.removeEventListener('keydown', trapFocus, true);
  if (_lastTrigger && typeof _lastTrigger.focus === 'function') _lastTrigger.focus();
};

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  var panel = document.getElementById('dd-panel');
  if (!panel.classList.contains('open')) return;
  var focusables = panel.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusables.length) return;
  var first = focusables[0], last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}
```
Also update the click-wiring in `script.js` (`wireDDButtons`) to pass the clicked button through so focus can return to it:
```js
// script.js, inside wireDDButtons()
window.openDD(ddKey, btn);
```

### Fix 4 — Give mobile a lightweight chapter jump control
Since the full spine can't fit on a phone, replace it with a compact horizontal chip-scroller pinned under the sticky header instead of hiding navigation entirely:
```css
@media (max-width: 640px) {
  .brief-spine { display: none !important; }
  .brief-mobile-jump {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 8px 12px;
    border-bottom: 1px solid var(--dd-border);
    position: sticky;
    top: 0; /* sits right under .brief-hdr once that is also sticky */
    background: var(--dd-bg);
    z-index: 19;
    -webkit-overflow-scrolling: touch;
  }
  .brief-mobile-jump button {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid var(--dd-border2);
    background: var(--dd-surface2);
    color: var(--dd-text-dim);
    white-space: nowrap;
  }
  .brief-mobile-jump button.active {
    background: var(--dd-accent);
    color: #fff;
    border-color: var(--dd-accent);
  }
}
```
```js
// deep_dive_v2.js — build alongside the existing spine, reusing the same data-target/click logic
var mobileJump = document.createElement('div');
mobileJump.className = 'brief-mobile-jump';
mobileJump.innerHTML = spineItems.map(function(ch) {
  return '<button type="button" data-target="' + ch.id + '">' + ch.title + '</button>';
}).join('');
hdr.appendChild(mobileJump); // placed inside sticky header so it scrolls with it
mobileJump.querySelectorAll('button').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var t = scrollBody.querySelector('#' + btn.getAttribute('data-target'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
```

### Fix 5 — Support the browser/device Back gesture
```js
// deep_dive_v2.js — inside openDD / closeDD
window.openDD = function(key, triggerEl) {
  /* ...existing code... */
  history.pushState({ ddOpen: true, ddKey: key }, '', '#deep-dive-' + key);
};

window.closeDD = function(fromPopState) {
  /* ...existing code... */
  if (!fromPopState && history.state && history.state.ddOpen) {
    history.back(); // keeps history stack consistent
  }
};

window.addEventListener('popstate', function(e) {
  if (!e.state || !e.state.ddOpen) {
    window.closeDD(true);
  }
});
```
This makes the mobile swipe-back gesture and the desktop Alt+Left / Back button close the panel instead of leaving the page — matching what every recruiter already expects from "back."

### Fix 6 — Increase close-button visual prominence
```css
/* deep_dive_v2.css — replace the existing #dd-close rule block */
#dd-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--dd-border2);
  background: var(--dd-surface3);
  color: var(--dd-text);        /* was --dd-text-dim: bump to full-contrast text color */
  font-size: 16px;
  font-weight: 700;
}
#dd-close:hover,
#dd-close:focus-visible {
  background: var(--dd-red, #c0614a);
  color: #fff;
  border-color: var(--dd-red, #c0614a);
  outline: 2px solid var(--dd-red, #c0614a);
  outline-offset: 2px;
}
```
Using the existing `--dd-red` token on hover/focus (already defined for both themes) gives the close control a universally recognized "exit" color cue without introducing a new palette value.

### Fix 7 — Lower the "Esc" hint breakpoint and add a text label as fallback
```css
/* deep_dive_v2.css — change from @media (min-width: 900px) gating to a lower one, e.g. 700px */
@media (min-width: 700px) {
  .brief-hdr-top-row::after {
    content: 'Esc';
    /* ...existing rule... */
  }
}
```
For viewports below 700px (where there's no reliable physical keyboard anyway), no change is needed — Fix 1/2/4 cover mobile discoverability instead.

### Fix 8 — Differentiate the theme toggle from the close button
```css
/* deep_dive_v2.css */
#dd-theme-toggle {
  border-radius: 8px;      /* was 10px pill — make visually "flatter"/different from the circular close X */
}
```
And in `deep_dive_v2.js`, keep the theme toggle strictly in the second header row (already true) — do not add any future control between the badge and the close X in `.brief-hdr-top-row` to preserve the current spatial separation, which is the main thing keeping confusion low today.

### Fix 9 — Add a text-based chapter counter for accessibility and clarity
```js
// deep_dive_v2.js, inside the onScroll() function in initSpine()
var counter = panel.querySelector('.brief-chapter-counter');
if (counter) counter.textContent = 'Chapter ' + (active + 1) + ' of ' + items.length;
```
```html
<!-- add once, near the spine or header subtitle -->
<div class="brief-chapter-counter" aria-live="polite" style="font-size:11px;color:var(--dd-text-faint);"></div>
```
This gives screen-reader users and quick-scanning humans alike a plain-language position indicator that survives regardless of viewport width.

---

## 4. What Would Make Navigation Crystal Clear in 10 Seconds

For a non-technical recruiter who has never seen this site:

1. **Make the close button red-on-hover/focus and slightly larger** (Fix 6) — right now it visually competes with the theme toggle for attention; a color cue instantly says "this exits."
2. **Keep it sticky/on-screen at all times, especially on mobile** (Fixes 1–2) — never let a recruiter scroll into a state with no visible way out.
3. **Show a persistent, plain-language "Chapter 2 of 7" label**, not just dots (Fix 9) — dots require interpretation; numbers don't.
4. **Make the browser/phone Back button work as "close"** (Fix 5) — this is the single most automatic exit gesture for any web user and currently does the wrong thing.
5. **Add the mobile chip-jump bar** (Fix 4) — parity with desktop's spine means mobile recruiters (a large share of real-world traffic) aren't second-class users.

Collectively, these five changes turn "I think that X closes this, and Escape maybe works, but I'm not sure how to jump around and I got a little lost when I hit Back" into "there's an obvious red X that follows me everywhere, a page counter tells me where I am, and Back does what I expect" — which is the actual bar for a 10-second, zero-thought first impression.
