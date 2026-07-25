# Responsive Content Parity Audit — Andre Weissmann Portfolio

**Live site audited:** [andre-weissmann-data-portfolio-show.pplx.app/portfolio.html](https://andre-weissmann-data-portfolio-show.pplx.app/portfolio.html)
**Local source checked:** `/home/user/workspace/portfolio-parity/public/` (`portfolio.html`, `style.css`, `deep_dive_v2.css`, `deep_dive_v2.js`)
**Widths tested:** 375px (phone), 768px (tablet), 1024px (laptop), 1440px (desktop) — real browser rendering via headless Chromium (Playwright), not just CSS reading. Screenshots saved in `/home/user/workspace/portfolio-parity/screens/`.
**Scope:** Homepage (hero, nav, project card) + Nashville Housing deep dive (spine/TOC, KPIs, Result banner, chapters, SQL lab, close controls).
**User's stated goal:** *same information on every device; smart layouts per device — not a separate "mobile site," not less content on phone.*

---

## 1. Executive Summary

| Area | Verdict |
|---|---|
| Homepage hero / nav / project card | **PASS** — good reflow, no content loss, minor discoverability nit on the horizontally-scrolling SQL preview table |
| Deep dive spine/TOC (live site) | **FAIL (P0)** — chapter navigation is completely removed below 900px width, with no replacement on the *currently deployed* site |
| Deep dive spine/TOC (local source) | A working mobile replacement (`.brief-mob-chapters` chip nav) **already exists in the local codebase** but is **not deployed** — this is a shippable fix, not a from-scratch build |
| Deep dive KPIs / Result banner / chapters / SQL lab | **PASS** — identical content, values, and copy at every width; layout reflows correctly (4-across → 2×2 grid, side-by-side → stacked) |
| Deep dive "Dirty vs Clean" table | **FAIL (P1)** — 2 of 4 columns (`SaleDate`, `SoldAsVacant`) are `display:none` on phone with no way to see them; this is data loss, not reflow |
| Deep dive close/exit controls | **FAIL (P0)** — on phone, the close button and exit bar scroll off-screen and stay off-screen while reading; on tablet/laptop/desktop they are visible (desktop: because the inner column has its own scroll region; the page-level scroll bug is phone-only) |
| Deep dive chapter numbers without labels | **FAIL (P2)** — at exactly 768px (tablet portrait) the spine shows numbered dots with no chapter names, an in-between state worse than either phone or laptop |

**Bottom line:** the desktop deep dive is well-built (numbered spine, KPI strip, chapter content, live SQL lab, sticky exit bar). The mobile deep dive is missing real navigational and tabular content that exists on desktop — this is exactly the "less content on phone" problem the user wants eliminated. The homepage is in much better shape and mostly just reflows correctly.

---

## 2. Method

1. Read local source at `/home/user/workspace/portfolio-parity/public/` for every `display:none` / `display:none !important` rule in `style.css` and `deep_dive_v2.css`, and traced each to its DOM element and JS wiring.
2. Rendered the **live** URL in headless Chromium at the four required widths, opened the Nashville deep dive programmatically, scrolled it, and read `getComputedStyle()` + `getBoundingClientRect()` for every control in scope (spine, KPIs, exit bar, close button, SQL run button, morph-table cells).
3. Took full-page and cropped screenshots at each width for visual confirmation (see `screens/` folder — files named `home_<device>_<width>_*.png` and `dd_<device>_<width>_*.png`).
4. Fetched the live `deep_dive_v2.js`/`deep_dive_v2.css` directly (`curl`) and diffed them against the local workspace copies to check whether the local source reflects what's actually deployed.

---

## 3. Homepage Findings

### 3.1 What reflows correctly (no action needed)
- **Nav → hamburger.** `.nav-links` (`style.css` line 2073, inside `@media (max-width: 900px)`) is hidden and `.hamburger` shown at the same breakpoint; the mobile slide-out menu contains the same 5 links (About, Capabilities, Projects, Experience, Contact). Confirmed identical link set on phone and desktop screenshots.
- **Hero.** Photo, "Open to Work" badge, location/remote/degree/field facts, LinkedIn/GitHub buttons, heading, tagline, body copy, skill pills, and all three CTA buttons (See My Projects / Get in Touch / View Resume) are present and in the same order at 375px and 1440px — just stacked instead of two-column. Confirmed via `home_phone_375_top.png` vs `home_desktop_1440_top.png`.
- **`.hero-scroll-hint { display:none }`** (`style.css` line 2104, `@media max-width:640px`) — this hides a decorative "scroll down" arrow only. No information lost; not actionable.
- **Nashville project card SQL preview table.** All 5 columns (`ParcelID, LandUse, SaleDate, SalePrice, LegalReference`) exist in the DOM at 375px; the wrapping `.sql-table-wrap` has `overflow-x:auto` (`style.css` line 1330), confirmed by live measurement: `scrollWidth: 628px` vs `clientWidth: 291px` → horizontally scrollable, not truncated. This is a **good** reflow pattern.

### 3.2 Minor issue (P2)
- **No visible affordance that the SQL preview table scrolls sideways on mobile.** A first-time visitor on a phone sees only `ParcelID` and part of `LandUse` and has no visual cue (fade edge, arrow, "swipe" hint) that `SaleDate`, `SalePrice`, `LegalReference` exist off-screen to the right. Content is technically present (passes parity), but effectively hidden without discovery.
  - **Fix file/selector:** `public/style.css`, rule `.sql-table-wrap` (~line 1330). Add a right-edge fade mask and/or a one-time "← swipe for more →" hint below the table on widths ≤640px.

### 3.3 Dead/legacy CSS — not a live parity bug, but should be cleaned up
- `style.css` line 2049: `.hero-right { display: none; }` inside `@media (max-width:900px)`, and the base `.hero-right` rule at line 473, target a two-column hero layout (`.hero-left` + `.hero-right` floating stat cards) that **does not exist in the current `portfolio.html` markup** — only `.hero-left` is present (verified: `grep` for `hero-right` in `portfolio.html` returns zero matches). This rule is orphaned from an earlier hero design and hides nothing today. No user-facing bug, but it's misleading dead weight in the stylesheet and should be deleted to avoid confusing future edits.
- `style.css` lines 3022–3031: `#toc-sidebar { display: none !important; }` (with a `sidebar-removed` comment) permanently disables an old desktop-only left-rail TOC component (`#toc-sidebar-DISABLED`). It has been fully replaced by `#mobile-section-nav` (a pill nav shown below 1200px, hidden above it — `style.css` lines 3011–3014). This is intentional and working as designed, not a parity bug — flagging only so it isn't mistaken for a bug during cleanup.

---

## 4. Nashville Deep Dive Findings

### 4.1 Spine / Table of Contents — **P0**

**Live site behavior (confirmed by headless-browser measurement, not just CSS reading):**

| Width | `.brief-spine` (numbered chapter rail) | Chapter names visible anywhere? |
|---|---|---|
| 375 (phone) | `display: none` | **No — zero chapter navigation of any kind** |
| 768 (tablet) | `display: flex`, but `.brief-spine-label` = `display:none` | **Numbers only** ("1, 2, 3…"), no text |
| 1024 (laptop) | `display: flex`, labels visible | Yes — full "On This Page" list |
| 1440 (desktop) | `display: flex`, labels visible | Yes — full "On This Page" list |

- Root cause, live CSS: `deep_dive_v2.css` line 1228 — `@media (max-width: 640px) { .brief-spine { display: none !important; } }` — removes the entire 7-item chapter list (Overview, The Raw Data Problem, Thinking Trail, Dirty vs Clean, Live Query Lab, Sale Conditions, Data Quality Impact — see `deep_dive_v2.js` chapter array around line 554) on phone with **no replacement**, confirmed live via Playwright: `.brief-mob-chapters` element `not found` in the DOM on the deployed site.
- At 768px specifically, `.brief-spine-label { display: block; }` only activates at `min-width: 900px` (`deep_dive_v2.css` line 1542) while `.brief-spine-num`/`.brief-spine-title` activate earlier at `min-width: 700px` (`deep_dive_v2.css` line 1962-ish block). This produces a **worse-than-either-extreme** in-between state: a tablet user sees a column of bare numbered dots (1–7) with no way to know what any chapter is about without clicking through them one at a time.
- Screenshots: `screens/dd_phone_375_top.png` (no spine at all), `screens/dd_tablet_768_top.png` (numbers, no labels), `screens/dd_laptop_1024_top.png` and `dd_desktop_1440_top.png` (full labeled spine).

**Important: this is already half-fixed in the local codebase, just not deployed.**
Diffing the live `deep_dive_v2.js`/`deep_dive_v2.css` (fetched directly from the production URL) against the local workspace copies at `/home/user/workspace/portfolio-parity/public/` shows the **only** functional difference between them is a not-yet-shipped mobile chapter nav:
- `deep_dive_v2.js` (local, not live) builds a `.brief-mob-chapters` element — a horizontally-scrolling row of numbered chips using the *same* `spineItems` array as the desktop spine ("Same section list as spine — horizontal on phone/tablet so info is not lost", comment at local `deep_dive_v2.js` ~line 1157), wired to scroll to the matching chapter on tap.
- `deep_dive_v2.css` (local, not live) has the matching rules: base `.brief-mob-chapters { display:none; position:sticky; top:0; }` (~line 2052), shown via `@media (max-width: 899px) { .brief-mob-chapters { display:block; } .brief-spine { display:none !important; } }` (~line 2114), and correctly hidden above 900px (~line 2122) in favor of the full spine.
- This local version **still has the 768px numbers-without-labels gap** described above unless also patched (see fix below) — but it completely solves the 375px "zero navigation" problem once deployed.

**P0 Fix — ship the existing local `.brief-mob-chapters` code to production.**
- Files: `public/deep_dive_v2.js` and `public/deep_dive_v2.css` (local workspace copies already contain this — confirm they are the versions actually deployed; live site is currently serving an older `?v=1784992000` bundle while local is at `?v=1784995000`+).
- No new engineering needed — deploy the current local build.

**P2 Fix — close the 700–899px label gap** (affects both the live spine and the not-yet-deployed `.brief-mob-chapters`, since the chip version also only shows numbers by default):
- Selector: `.brief-mob-chip-label` / `.brief-spine-label` — change the reveal breakpoint so text labels appear at the same width the numbered element appears (`min-width: 700px` instead of `900px`/`1024px`), or keep chips numbers-only but add a `title`/tooltip *and* make the current chip's label always visible (e.g., `.brief-mob-chip.active .brief-mob-chip-label { display:inline; }`) so at minimum the current position is legible without guessing.

### 4.2 KPIs, Result Banner, Chapter Content — **PASS**

- **Result banner** ("Turned 56,477 messy property sales into a query-ready table…") — identical text at all 4 widths. Confirmed via `dd_phone_375_top.png` and `dd_desktop_1440_top.png`.
- **KPI strip** — same 4 KPIs (`56,477 Sales Records Reviewed`, `7 Cleaning Methods`, `104 Duplicate Sales Removed`, `29 Addresses Restored`), same icons, same values at all widths. Layout reflows from 4-across (`grid-template-columns: repeat(4, minmax(0,1fr))`, `deep_dive_v2.css` ~line 1574, desktop) to a 2×2 grid (`deep_dive_v2.css` ~line 1287, `@media max-width:640px`) — this is the **good** kind of reflow: same 4 numbers, same labels, just wrapped.
- **"The Situation / Why Decisions Break / What Clean Data Unlocks"** cards — identical copy at every width; 3-column grid on desktop collapses to stacked cards on phone (confirmed screenshots), no truncation.
- **"What do you want to know?" Q&A explorer** (`.brief-explore-wrap`) — same 3 questions ("What did the cleaning unlock?", "How did the thinking work?", "What was done technically?") and same answer content at all widths; desktop shows a 2-column card+answer layout (`grid-template-columns: minmax(220px,.9fr) minmax(0,1.2fr)`, `deep_dive_v2.css` ~line 1590), phone stacks cards above the answer pane (`.brief-explore-wrap { display:flex } @media (min-width:600px)`, line ~565). Good reflow.

### 4.3 "Dirty vs Clean" morph table — **P1, real content loss**

- Chapter defines 4 columns for the Nashville project: `ParcelID`, `PropertyAddress`, `SaleDate`, `SoldAsVacant` (`deep_dive_v2.js` ~line 582, `columns:` array), each shown as a full before/after row (`before`/`after` arrays, same file ~lines 583–597).
- On desktop, all 4 columns render side by side.
- On phone (`@media max-width:640px`, `deep_dive_v2.css` lines 1402–1405):
  ```css
  .brief-morph-row { grid-template-columns: repeat(2, 1fr) !important; }
  .brief-morph-cell:nth-child(n+3),
  .brief-morph-head .brief-morph-cell:nth-child(n+3) { display: none !important; }
  ```
  This forces a 2-column grid **and explicitly hides** the 3rd/4th cell of every row — meaning `SaleDate` and `SoldAsVacant` are removed entirely on phone, not scrolled or collapsed into an expandable row. A recruiter reading the "Watch the Data Transform" section on a phone sees only `ParcelID` and `PropertyAddress` for every before/after row and never sees the date-format fix or the Y/N/Yes/No standardization that the surrounding prose specifically calls out — this is the exact "different, thinner story on mobile" failure mode the user wants avoided.
- Confirmed live: Playwright query `.brief-morph-cell:nth-child(n+3)` returned 12 hidden cells in the rendered phone DOM.
- **Fix — file:** `public/deep_dive_v2.css`, lines 1402–1405.
  **Options (either solves parity):**
  1. Keep 4 columns but let the row scroll horizontally instead of hiding cells: replace the `nth-child(n+3){display:none}` rule with `.brief-morph-table-wrap { overflow-x:auto; } .brief-morph-row { grid-template-columns: repeat(4, minmax(120px,1fr)); min-width: 560px; }` (mirrors the pattern already used successfully for the homepage SQL table, `.sql-table-wrap`).
  2. Or stack each row into a labeled 2×2 mini-card per record (each cell gets a `::before` micro-label showing its column name) so all 4 fields stay visible without forcing horizontal scrolling — more mobile-idiomatic than option 1, but requires a small markup/CSS change rather than reusing the existing scroll pattern.

### 4.4 Live Query Lab (SQL sandbox) — **PASS**

- Same 3 query buttons ("Preview cleaned rows", "Sale by land use", "Check blank addresses remaining" — label text wraps but is unchanged), same SQL statement text, and the same live result table content render at 375px and 1440px. Confirmed via `dd_phone_375_sqllab.png` vs `dd_desktop_1440_sqllab.png`.
- `.brief-sql__run { display: none !important; }` (`deep_dive_v2.css` line 1452, applies at **all** widths, not just mobile) is intentional: the query auto-runs on button selection and is replaced by a "LIVE" pulsing status indicator (`.brief-sql__live-status`, same file ~line 1433). Not a parity issue since it's consistent across all four widths — flagged only to confirm it was checked and ruled out.

### 4.5 Close / Exit Controls — **P0**

Live-measured position of the close button and exit bar after scrolling deep into the chapter content (`getBoundingClientRect()` + `inViewport` check):

| Width | `#dd-close` (header X) | `.brief-exit-bar` (sticky footer: Back / Esc hint / Close) |
|---|---|---|
| 375 (phone) | off-screen, `top:-1385px` — **not visible** | off-screen, `top:4619px` — **not visible** |
| 768 (tablet) | visible, `top:260px` | visible, `top:1105px` |
| 1024 (laptop) | visible, `top:274px` | visible, `top:1095px` |
| 1440 (desktop) | visible, `top:254px` | visible, `top:1115px` |

- Root cause: at ≤640px, `deep_dive_v2.css` (`MOBILE — full redesign` block, ~line 1190) sets `#dd-body { display:block !important; overflow-y:auto !important; }` and `.brief-layout { display:block !important; overflow:visible !important; }` — this turns the **whole page** into the scroll container on phone. At ≥768px, `#dd-body`/`.brief-scroll-body` keep their own internal scroll region while the header and `.brief-exit-bar` stay outside/sticky, so they never move.
- Net effect: on every width except phone, a reader always has Close/Back within reach. On phone, once you scroll past the first screen of content, there is no visible way to exit or go back without manually scrolling all the way back to the top — for a 7-chapter deep dive this can mean scrolling past a full page of chapter content just to leave. This matches and reconfirms the P0 finding from the prior [`DEEP_DIVE_NAV_AUDIT.md`](/home/user/workspace/portfolio-parity/docs/DEEP_DIVE_NAV_AUDIT.md) in this same repo.
- Screenshots: `screens/dd_phone_375_deepscroll.png` (no header, no exit bar in frame) vs `screens/dd_desktop_1440_deepscroll.png` (header + spine + exit bar all still visible — because the inner pane scrolled, not the page).
- **Fix — file:** `public/deep_dive_v2.css`, inside the `@media (max-width: 640px)` block (~line 1190 onward).
  ```css
  @media (max-width: 640px) {
    .brief-hdr { position: sticky; top: 0; z-index: 20; }
    .brief-exit-bar { position: sticky; bottom: 0; z-index: 20; }
  }
  ```
  Both `.brief-hdr` and `.brief-exit-bar` are already flex children of the now-block-scrolling body, so adding `position: sticky` requires no JS changes and no markup changes — same approach already recommended in the prior nav audit's "Fix 1."

---

## 5. Consolidated Fix List

### P0 — Ship before anything else
1. **Deploy the existing local mobile chapter nav.** Local `public/deep_dive_v2.js` (builds `.brief-mob-chapters`) and `public/deep_dive_v2.css` (`.brief-mob-chapters` rules, lines ~2052–2123) already solve the "zero chapter navigation on phone" bug — the live site is simply running an older bundle (`?v=1784992000`) that predates this fix. Confirm the local files are pushed/deployed as the new `portfolio.html` `<link>`/`<script>` version.
2. **Make the mobile close/exit controls sticky.** File: `public/deep_dive_v2.css`, `@media (max-width: 640px)` block. Add `position: sticky; top:0;` to `.brief-hdr` and `position: sticky; bottom:0;` to `.brief-exit-bar` so Close/Back are reachable at any scroll position on phone, matching tablet/laptop/desktop behavior.

### P1 — Fix soon (real content removed, not just reflowed)
3. **Stop hiding morph-table columns on phone.** File: `public/deep_dive_v2.css`, lines 1402–1405 (`.brief-morph-cell:nth-child(n+3){display:none!important}`). Replace with horizontal scroll on the row (mirroring `.sql-table-wrap { overflow-x:auto }` already used on the homepage) or a labeled-cell mobile card layout, so `SaleDate` and `SoldAsVacant` remain visible on phone.

### P2 — Polish
4. **Fix the tablet-portrait (700–899px) spine gap.** File: `public/deep_dive_v2.css`, `.brief-spine-label`/`.brief-mob-chip-label` reveal breakpoint (currently `min-width: 900px` for full spine, or numbers-only from `min-width: 700px`). Show chapter text at the same width the numbered rail appears, or make the active chip's label always visible.
5. **Add a scroll-affordance hint to horizontally-scrolling tables.** File: `public/style.css`, `.sql-table-wrap` rule (~line 1330). Add a fade mask or "swipe for more" hint on widths ≤640px so users discover the additional 3 columns (`SaleDate`, `SalePrice`, `LegalReference`) that already exist off-screen.
6. **Remove dead CSS referencing markup that no longer exists**, to prevent future confusion: `public/style.css` line 473 (`.hero-right`) and line 2049 (`.hero-right { display:none }` inside `@media max-width:900px`) — no corresponding `.hero-right` element exists in current `portfolio.html`.

---

## 6. Screenshots Reference

All saved under `/home/user/workspace/portfolio-parity/screens/`:

- `home_<phone|tablet|laptop|desktop>_<width>_top.png` — homepage hero at each width
- `home_<phone|tablet|laptop|desktop>_<width>_nashville_card.png` — Nashville project card at each width
- `dd_<phone|tablet|laptop|desktop>_<width>_top.png` — Nashville deep dive, first screen
- `dd_<phone|tablet|laptop|desktop>_<width>_scrolled.png` / `_deepscroll.png` — deep dive after scrolling, showing close/exit control visibility
- `dd_<phone|tablet|desktop>_<width>_sqllab.png` — Live Query Lab chapter at each width

Live site reference: [andre-weissmann-data-portfolio-show.pplx.app/portfolio.html](https://andre-weissmann-data-portfolio-show.pplx.app/portfolio.html)
Related prior audit consulted: [`docs/DEEP_DIVE_NAV_AUDIT.md`](../portfolio-parity/docs/DEEP_DIVE_NAV_AUDIT.md) (same repo, covers close-button/focus-trap/back-button issues in more UX depth).
