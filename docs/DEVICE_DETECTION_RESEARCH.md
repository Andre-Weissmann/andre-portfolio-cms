# Should Andre's Portfolio Use ML/JS Device Detection for Layout? — Research Findings

*Prepared: July 25, 2026*

---

## 1. Executive Answer

**No — use viewport- and capability-based responsive design; do not use ML or User-Agent–based device-class detection to drive layout.** The industry consensus for 2024–2026 is unambiguous: "device type" (phone/tablet/laptop/desktop) is a weak, unreliable proxy for what actually matters — available space (viewport/container width) and input capability (touch vs. mouse, hover vs. no-hover) — and CSS media/container queries already solve both natively, with no JavaScript, no privacy cost, and no maintenance burden ([web.dev responsive design basics](https://web.dev/articles/responsive-web-design-basics)). A large and growing share of real devices break the phone/tablet/desktop mental model outright — foldables, 13" touchscreen laptops, desktop monitors run at phone-sized browser widths, split-screen tablets — so any device-classifier will misclassify a meaningful fraction of sessions and degrade their experience. The only legitimate use of JS-based detection (`hover`/`pointer` media features, not ML) is a *progressive enhancement layer* on top of a CSS-first responsive baseline, e.g., enlarging tap targets for coarse pointers — never as the primary layout engine. Andre's site already implements this correctly (breakpoints at 640/900/1200/1440px plus `prefers-reduced-motion`), and the one piece of legacy `navigator.userAgent`/`navigator.platform` sniffing in `portfolio_os.js` (`isMac()`) should be scoped down to its narrow keyboard-shortcut-label purpose and never expanded into general layout logic. **Verdict: hybrid in principle (CSS baseline + optional capability queries), but functionally "no" on ML/UA device-type detection for layout.**

---

## 2. Comparison Table: CSS-only vs. UA/Client Hints vs. ML

| Dimension | CSS Media/Container Queries | User-Agent / Client Hints | ML-based Device Detection |
|---|---|---|---|
| **What it actually measures** | Real viewport/container size, orientation, `hover`, `pointer`, `prefers-*` — the true rendering constraints ([MDN pointer](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer), [web.dev](https://web.dev/articles/responsive-web-design-basics)) | Browser/OS/brand strings or structured hints (`mobile`, `platform`, `brands`) — a proxy, not a capability ([MDN userAgentData](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData)) | Statistical classification from UA strings + HTTP headers against a device database (WURFL, 51Degrees, DeviceAtlas) — still fundamentally UA-string-derived, not behavioral ML ([51Degrees comparison](https://51degrees.com/device-detection-comparison), [WURFL OnSite](https://scientiamobile.com/wurfl-onsite/)) |
| **Browser support (2025–26)** | Container queries: **Baseline Widely Available since Aug 2025**, ~98% global support ([web-features explorer](https://web-platform-dx.github.io/web-features-explorer/features/container-queries/), [dev.to](https://dev.to/mikulg/container-queries-the-css-feature-that-changed-everything-28oj)); media queries: universal, decades old | **Fragmented and shrinking.** `navigator.userAgentData` works only in Chromium (Chrome/Edge/Samsung Internet); **Safari and Firefox do not implement it at all**, including on iOS where even "Chrome" is WebKit under the hood ([caniuse](https://caniuse.com/mdn-api_navigator_useragentdata), [GitHub mdn/browser-compat-data#21308](https://github.com/mdn/browser-compat-data/issues/21308), [Corbado](https://www.corbado.com/blog/client-hints-user-agent-chrome-safari-firefox)). Chrome has actively "frozen"/reduced the classic UA string since Chrome 101 ([Privacy Sandbox](https://privacysandbox.google.com/blog/user-agent-reduction-deprecation-trial)) | Depends on vendor's UA/header database; degrades for spoofed, novel, or long-tail devices; requires a paid/maintained backend service for high accuracy |
| **Accuracy for "what layout should I use"** | **High and direct** — it measures the actual constraint, so there is nothing to be "inaccurate" about | **Low** — knowing "iPhone" or "mobile: true" doesn't tell you window/split-view width, zoom level, or whether a mouse is attached | **Low-to-medium** — vendors claim 99%+ *device model* identification accuracy, but device model is still the wrong signal for layout (a correctly identified iPad in a 400px Split View is still misclassified for layout purposes) |
| **Privacy / fingerprinting risk** | None — CSS queries expose zero identifying data to scripts or servers | Client Hints add entropy (brand, model, platform version) that contributes to browser fingerprinting; EFF's Panopticlick research established that UA + configuration data materially narrows unique identification of users ([EFF/Reuters coverage](https://www.reuters.com/article/world/eff-browsers-can-leave-a-unique-trail-on-the-web-idUS1129008613/)); GDPR/ePrivacy exposure if used for tracking rather than rendering | Highest — commercial device-ID databases are often bundled into ad-tech/analytics pipelines; server-side header collection plus a persistent device DB is the same fingerprinting surface as Client Hints, amplified |
| **Performance cost** | Zero — native browser feature, no JS execution, no network round-trip | Small JS/header parsing cost; `getHighEntropyValues()` is async and adds a promise round-trip | Non-trivial — typically an external API call, SDK payload, or WASM/ML model download; adds latency and a third-party dependency to page load |
| **Maintenance burden** | Low — breakpoints tied to content, rarely need revisiting | Medium-high — UA parsing rules break with every new browser/OS release and need constant regex/library updates | High — device databases require paid subscriptions and continuous updates (new phone/tablet SKUs ship monthly) |
| **Handles converged form factors** (touchscreen laptops, foldables, external monitors, split-view tablets, desktop windows resized small) | **Yes, natively** — `pointer`/`hover`/`any-pointer`/`any-hover` can report *multiple* input mechanisms simultaneously ("a laptop with a touchscreen and trackpad should match coarse **and** fine pointers, plus hover" — [web.dev](https://web.dev/articles/responsive-web-design-basics)) | **No** — collapses everything into a single device/OS label; cannot represent "touchscreen laptop" or "iPad in 400px multitasking mode" | **No** — same collapse problem, just with a fancier database behind it |
| **Best practical use case** | Primary layout mechanism for essentially all responsive design | Legitimate for analytics/telemetry, ad targeting, or server-side content negotiation (e.g., serving a different image format) — **not for client-side layout decisions** | Legitimate for fraud detection, bot mitigation, ad verification — **not for client-side layout decisions** |

---

## 3. Recommended Approach for Andre's Portfolio Specifically

Andre's portfolio (`portfolio-stage/`) already gets the fundamentals right, so the recommendation is refinement, not a rewrite:

**What's already good:**
- `style.css` and `portfolio-style.css` use a conventional, content-driven breakpoint ladder (`480px`, `500px`, `520px`, `540px`, `640px`, `700px`, `900px`, `1199px`/`1200px`) plus a `1440px` tier in `portfolio_os.css` — this is a mature, incrementally-tuned system, exactly what web.dev recommends ("pick breakpoints based on content, not device classes").
- `style.css` already has a `prefers-reduced-motion: reduce` rule (line 4467) — good accessibility practice, already in place.
- No CSS is currently gated behind JS device-sniffing; layout is CSS-driven.

**What needs attention:**
- `portfolio_os.js` contains `isMac()`, which sniffs `navigator.platform || navigator.userAgent` for `Mac|iPhone|iPad`. This is **legacy UA sniffing** and should be:
  1. **Scoped strictly** to its actual job (almost certainly choosing `⌘` vs `Ctrl` in keyboard-shortcut labels) — this is a defensible, narrow use of UA detection because there is no CSS equivalent for "which modifier key does this OS use," and the failure mode (wrong label) is cosmetic, not structural.
  2. **Never extended** to branch page layout, navigation structure, or content visibility. If Andre wants touch-friendly tap targets, that decision belongs in a `(pointer: coarse)` media query, not in `isMac()`.
  3. Optionally hardened by feature-checking `navigator.userAgentData?.platform` first (Chromium) and falling back to the regex only when Client Hints are unavailable — but given the narrow blast radius, this is a nice-to-have, not urgent.
- No use of `pointer`/`hover`/`any-pointer`/`any-hover` media features anywhere in the codebase yet. This is the one **genuine gap**. Concrete opportunities:
  - Interactive data-viz elements (Tableau/Power BI/Excel embeds referenced in `tableau.js`, `powerbi.js`, `excel.js`) likely rely on hover states (tooltips on chart hover) that silently fail or become undiscoverable on touch devices. Wrapping hover-dependent UI in `@media (hover: hover)` and providing a tap/click-triggered equivalent inside `@media (any-pointer: coarse)` closes this gap.
  - Any small click targets (nav pills, modal close buttons, sidebar toggles referenced in `modals.js`, `data_rail.js`) should get a minimum 44×44px hit area under `(pointer: coarse)`, per WCAG 2.5.5 / Apple & Google touch-target guidance.
- **Do not add** a device-detection library (WURFL, 51Degrees, DeviceAtlas) or any ML-driven layout system. For a personal portfolio site with a handful of layout states (nav, hero, project grid, deep-dive modals, data embeds), the complexity, cost, and privacy exposure of a device-ID service is entirely disproportionate to the problem it would solve — and CSS already solves it better.
- **Container queries** (Baseline since Aug 2025) are a good next investment if any component (e.g., the data-rail sidebar or deep-dive modal cards in `data_rail.css` / `deep_dive_v2.css`) needs to adapt based on *its own* box size rather than the full viewport — e.g., a project card that's sometimes in a 3-column grid and sometimes full-width inside a modal. This is additive, low-risk, and doesn't require any device detection at all.

**Bottom line for Andre:** keep the CSS-first breakpoint system, retire/contain the one UA-sniffing function to its narrow cosmetic use, add `pointer`/`hover` capability queries for the interactive chart embeds and touch targets, and consider container queries for reusable components. No ML, no device-database service, no `navigator.userAgentData` expansion.

---

## 4. Concrete Implementation Sketch (CSS Breakpoints + Optional Capability Queries Only)

```css
/* ── 1. CONTENT-DRIVEN LAYOUT BREAKPOINTS ──────────────────────────
   Consistent with existing ladder in style.css / portfolio-style.css.
   Base styles = mobile-first defaults (no query needed).            */

/* Small phones / narrow viewports */
@media (max-width: 480px) {
  .project-grid { grid-template-columns: 1fr; }
  .hero-title   { font-size: 1.75rem; }
}

/* Large phones / small tablets (portrait) */
@media (max-width: 640px) {
  .nav-pills    { flex-wrap: wrap; }
  .data-rail    { display: none; } /* collapse secondary rail, not core content */
}

/* Tablets / small laptops */
@media (min-width: 641px) and (max-width: 900px) {
  .project-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Standard laptop/desktop */
@media (min-width: 901px) and (max-width: 1199px) {
  .project-grid { grid-template-columns: repeat(3, 1fr); }
}

/* Large desktop monitors */
@media (min-width: 1440px) {
  .page-shell   { max-width: 1320px; margin-inline: auto; }
}

/* ── 2. CAPABILITY QUERIES — input mechanism, NOT device class ─────
   A touchscreen laptop matches BOTH blocks below simultaneously;
   that's correct and intentional (web.dev guidance).                */

/* Fine pointer (mouse/trackpad) AND hover available: show hover-driven UI */
@media (hover: hover) and (pointer: fine) {
  .chart-tooltip-trigger:hover .chart-tooltip { opacity: 1; }
}

/* Coarse pointer present anywhere (touchscreen, even alongside a mouse):
   enlarge tap targets, add explicit tap-to-reveal affordance          */
@media (any-pointer: coarse) {
  .nav-pill, .modal-close, .rail-toggle {
    min-width: 44px;
    min-height: 44px;
  }
  .chart-tooltip-trigger .chart-tooltip {
    /* fall back to tap-triggered via JS class toggle, not :hover */
    opacity: var(--tooltip-tap-opacity, 0);
  }
}

/* No hover capability at all (pure touch device): never hide critical
   content behind a hover-only affordance                              */
@media (hover: none) {
  .hover-only-caption { display: none; }
  .always-visible-caption { display: block; }
}

/* ── 3. OPTIONAL: CONTAINER QUERIES FOR REUSABLE COMPONENTS ─────────
   Use where a component (project card, deep-dive tile) needs to
   respond to ITS OWN box, independent of the viewport.                */

.project-card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 360px) {
  .project-card { grid-template-columns: 120px 1fr; }
}

@container card (max-width: 359px) {
  .project-card { grid-template-columns: 1fr; }
}

/* ── 4. ACCESSIBILITY BASELINE (already present in style.css) ─────── */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

```js
/* ── JS: keep UA sniffing narrowly scoped, never let it drive layout ── */
function isMac() {
  // Legitimate narrow use: choosing ⌘ vs Ctrl in a shortcut label.
  // Prefer Client Hints where available; regex fallback for Safari/Firefox.
  if (navigator.userAgentData?.platform) {
    return navigator.userAgentData.platform === 'macOS';
  }
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}
// Do NOT use isMac() (or any UA check) to toggle CSS classes for layout.
// Layout branching belongs in media queries above, not in JS device checks.
```

---

## 5. Sources

- web.dev — [Responsive web design basics](https://web.dev/articles/responsive-web-design-basics) (breakpoint philosophy, viewport meta tag, `hover`/`pointer`/`any-hover`/`any-pointer` guidance)
- MDN Web Docs — [`@media/pointer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer)
- MDN Web Docs — [`Navigator.userAgentData`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData) (experimental status, secure-context requirement)
- Can I Use — [`navigator.userAgentData` support table](https://caniuse.com/mdn-api_navigator_useragentdata)
- GitHub `mdn/browser-compat-data` Issue #21308 — [userAgentData not available on macOS/iOS](https://github.com/mdn/browser-compat-data/issues/21308)
- Corbado — [Client Hints & User-Agents in Chrome, Safari & Firefox](https://www.corbado.com/blog/client-hints-user-agent-chrome-safari-firefox) (fragmentation across browsers, UA freeze timeline through iOS 26)
- Google Privacy Sandbox — [User-Agent Reduction deprecation trial](https://privacysandbox.google.com/blog/user-agent-reduction-deprecation-trial)
- Web Platform DX / web-features explorer — [Container queries: Baseline Widely Available since 2025-08-14](https://web-platform-dx.github.io/web-features-explorer/features/container-queries/)
- DEV Community — [Container Queries: The CSS Feature That Changed Everything](https://dev.to/mikulg/container-queries-the-css-feature-that-changed-everything-28oj) (2025 browser support overview)
- Josh W. Comeau — [A Framework for Evaluating Browser Support](https://www.joshwcomeau.com/css/browser-support/) (practical decision framework for adopting new CSS features)
- Ethan Marcotte — [Responsive web design turns ten](https://ethanmarcotte.com/wrote/responsive-design-at-10/) (origin and intent of device-agnostic responsive design)
- 51Degrees — [Device Detection comparison](https://51degrees.com/device-detection-comparison) (accuracy claims, methodology of commercial "ML" device databases)
- ScientiaMobile — [WURFL OnSite](https://scientiamobile.com/wurfl-onsite/) (device description repository approach)
- Reuters/EFF coverage — [Browsers can leave a unique trail on the Web](https://www.reuters.com/article/world/eff-browsers-can-leave-a-unique-trail-on-the-web-idUS1129008613/) (Panopticlick, fingerprinting risk of UA/configuration data)

---

*Prepared for Andre Weissmann's portfolio project. Codebase references verified against `/home/user/workspace/portfolio-stage/public/` (`style.css`, `portfolio-style.css`, `portfolio_os.css`, `portfolio_os.js`) as of July 25, 2026.*
