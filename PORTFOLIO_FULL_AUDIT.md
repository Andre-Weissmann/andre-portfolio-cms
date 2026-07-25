# Portfolio Full Audit — Andre Weissmann Data Portfolio

**Live URL audited:** https://andre-weissmann-data-portfolio-live.pplx.app/portfolio.html (canonical) and https://andre-weissmann-data-portfolio-live.pplx.app/ (redirects to portfolio.html via meta refresh)
**Audience assumed:** Healthcare-analytics recruiters and hiring managers, Chicago market
**Method:** Live fetch of both URLs, full read of production source (`portfolio-fix/public/` — the most recent commit, `fec09b1`, "lock canonical portfolio URL to data-portfolio-live," which matches the live domain), CSS breakpoint extraction, JS logic review, file-size/perf audit, and a rendered desktop screenshot.

---

## 0. Overall verdict

This portfolio is **well above the median self-taught-analyst portfolio**. The deep dives contain real business framing (Problem → Approach → Decision → Stakeholder summaries → documented limitations), the SQL sandbox is a genuinely live SQLite-WASM query engine (not a canned animation), and the visual design (serif display type + restrained palette + orb hero) reads as intentional, not templated. The core risk is not "this looks amateur" — it's **information density, jargon leakage into recruiter-facing copy, and technical debt from rapid same-day iteration** (dead files, feature churn across near-duplicate builds).

---

## 1. Homepage / hero / nav / projects grid / resume / contact / interactives

**Hero** (confirmed via live screenshot): Clean two-column layout — headshot + quick facts (Chicago, IL / Open to Remote·Hybrid / BA IT / Healthcare·Analytics) on the left, serif headline "Turning *health data* into clarity," tagline "Raw data in. Real answers out," 3-button CTA row (See My Projects / Get in Touch / View Resume). This is strong — it states role, location, and specialization in under 3 seconds, which is exactly what a recruiter scan needs.

- Nav has 5 items (About, Capabilities, Projects, Experience, Contact) plus a theme toggle and hamburger — reasonable, not overloaded (`portfolio.html` lines 40–56).
- "Capabilities" as a nav label is slightly less recruiter-standard than "Skills," but it's a minor stylistic choice, not a defect.
- The projects grid uses a "Deep Dive →" button pattern repeated identically 7 times across the page (`grep` confirms 7 occurrences of "Deep Dive") — functionally fine, but the repetition is a missed chance to vary CTA copy per project type.
- **SQL sandbox** is real: it loads `sql.js` (SQLite compiled to WebAssembly) from `/vendor/sqljs/sql-wasm.js` and executes actual queries against the 56,477-row Nashville dataset client-side (`script.js` lines 268–332). This is a genuine differentiator — most portfolios fake this with static tables.
- **BMI calculator** is a live, client-computed CDC-formula tool with preset scenarios (Underweight/Healthy/Overweight/Above Obesity) and an optional WHR extension — functionally solid and medically framed correctly (labeled a "screening tool," not a diagnosis).
- **Resume**: `resume.html` exists, loads independently, and is linked correctly from the hero (`href="resume.html"`) — no dead link. A "Back to Resume" floating button appears contextually when a visitor arrives from the resume page, which is a thoughtful, non-generic UX touch.
- **Contact form**: a genuinely novel "SQL Builder" mode (`INSERT INTO contacts (email, message) VALUES (...)`) sits alongside a plain-English quick form. This is a strong, on-brand differentiator for a SQL-focused analyst, and it correctly defaults to the plain form with SQL mode opt-in — so it doesn't gatekeep non-technical recruiters.
- No dead local links found: every `href` pointing to a local file (`resume.html`, `powerbi-dashboard.html`, `tableau-dashboard.html`, `excel-dashboard.html`) resolves to an existing file, and every `images/*` reference in the HTML has a matching file on disk.

---

## 2. Deep Dive review (all 5)

Each deep dive follows the same strong structural template: KPI cards → Insight card → "Analyst's Thinking Trail" (assume → find → pivot → insight → limit) → visualization → "impact-text" section addressed to a named business audience → a `decision` block (what / why / next) → stakeholder Q&A summaries. This is a genuinely above-average structure — most portfolios stop at "here's what I did," and this one consistently adds "here's what a business/hiring stakeholder should do with it" and "here's the limitation I'd flag before you trust this."

**Nashville Housing (SQL):** Clear, well-quantified (56,477 records, 29 recovered addresses, 104 duplicates removed, 7 methods). The "thinking trail" correctly frames the self-join address recovery as a judgment call, not a rote step. Good.

**BMI / WHR (Python):** Correctly cites CDC/WHO sources, frames BMI's clinical limitation honestly, and adds a "Self-reported Input Accuracy: 62%" conviction meter — an unusually honest touch that most portfolios omit.

**Power BI Survey:** The clearest business framing of the five. Explicitly separates "what hiring teams can use" from "what analysts can use," names a specific missing-columns critique, and gives country-adjusted compensation context (India $93K USD-equivalent vs. raw currency conversion). This is genuinely recruiter-legible reasoning.

**Airbnb / Tableau:** Strong revenue-week storytelling ($2,110,350 peak week) and correctly flags three unresolved data-quality issues to "raise with the client" rather than silently patching them — a good signal of professional judgment.

**Bike Sales / Excel:** Good regional segmentation narrative (Pacific region), but this is the weakest of the five on rigor: it flags the small Pacific sample (n=192) as a caveat in the "thinking trail," but the homepage card and headline ("Pacific Region Is the Bet, and the Data Proves It") oversell the certainty that the deep dive itself hedges. That's the one instance across all five projects where the summary copy is more confident than the underlying analysis — worth a fix (see rewrites below).

### Deep-dive specific content rewrites

- **Nashville (SQL):**
  - Replace homepage card language "four inconsistent values where two should exist" with a plain-English lead: *"A property dataset with missing addresses and duplicate records is unusable for any downstream decision — I made it queryable in one weekend."* Keep the SQL jargon for the deep-dive body, not the card.
  - Swap "PARSENAME to split owner and property address columns" (homepage card) for outcome language: *"Split owner records into separate address, city, and state fields, so any analyst can now filter or map by owner location."*

- **BMI / WHR (Python):**
  - The card headline "Clinical Risk Screening in Plain Language" is good. Tighten the card body from 100 words to ~40: lead with the plain-English output example that's already in the deep dive ("Hello John, your BMI of 23.7 indicates a healthy weight") — that sentence does more recruiter-legible work than the current CDC-formula explanation.
  - Consider explicitly naming the target audience in one line: *"Built for care coordinators or patients who need a screening answer in seconds, not a spreadsheet."*

- **Power BI Survey:**
  - This is the best deep dive; use it as the template voice for the other four. Card copy is already close to this quality — no major rewrite needed, just trim to ~60 words.
  - Consider adding one line that a healthcare-analytics recruiter will resonate with directly: *"The same DAX and Power Query techniques used here — free-text range parsing, category consolidation — are the exact techniques needed to clean self-reported patient intake or claims data."* This explicitly bridges a non-healthcare dataset to healthcare relevance, which the portfolio otherwise never does for the three non-SQL/non-Python projects.

- **Airbnb / Tableau:**
  - Card headline "The Three Variables That Explain Every Pricing Decision" is strong marketing but slightly overclaims ("every"). Soften to *"The Three Variables That Explain Seattle's Airbnb Pricing"* — same punch, no overclaim a technical interviewer might probe.
  - Card body currently spends its first sentence on data-cleaning mechanics (zip codes, joins) before the business insight. Flip the order: lead with the $2.1M peak-week finding, then mention the cleaning as supporting evidence.

- **Bike Sales / Excel:**
  - Highest-priority rewrite of the five. Current headline: "The Pacific Region Is the Bet, and the Data Proves It" — but the deep dive's own thinking-trail explicitly flags Pacific as the smallest sample (n=192 vs. 508 in North America) and says "the pattern held" rather than "proves." Rewrite headline to: *"Pacific Region Shows the Strongest Margins — On a Smaller Sample Worth Watching."* This is more defensible in an interview and signals statistical maturity rather than salesmanship.
  - Add one sentence to the card acknowledging the sample-size caveat that's already honestly stated in the deep dive — right now the card and the deep dive tell two different confidence levels of the same story, which is the one true "spin vs. substance" gap in the whole site.

---

## 3. Mobile vs. desktop feel

Breakpoints extracted directly from `style.css`, `portfolio_os.css`, `data_rail.css`, and `deep_dive_v2.css`:

| Breakpoint | Purpose (inferred from context) |
|---|---|
| `max-width: 480px` / `390px` | Small-phone fine-tuning (badge font sizes, hero photo) |
| `max-width: 500px` / `520px` / `540px` | Form field stacking, single-column grids |
| `max-width: 599px` / `600px` | Deep-dive explore-pane switches to stacked block layout |
| `max-width: 640px` | **Primary mobile breakpoint** — used 20+ times; hero, nav, cards, forms all collapse here |
| `max-width: 700px` / `767px` | Secondary mobile/small-tablet adjustments |
| `min-width: 641px` and `max-width: 900px` | Tablet-specific band |
| `max-width: 900px` | **Primary tablet breakpoint** — nav becomes hamburger, layouts go single-column |
| `max-width: 1199px` / `min-width: 1200px` | **Primary desktop breakpoint** — multi-column grids, docked nav rail |
| `min-width: 1280px` / `1440px` / `1600px` | Wide-desktop deep-dive panel widening |

This is a genuinely thoughtful 4-tier system (phone / tablet / desktop / wide-desktop), not a single lazy `max-width: 768px` catch-all. Per the project memory notes, there was recent, deliberate work to (a) treat iPad landscape as desktop rather than mobile, (b) remove a cluttered mobile stat-strip in favor of a minimal hero, and (c) replace fragile scroll-based mobile nav with a frosted bottom pill nav with progress dots — all sound mobile-UX decisions.

**Risk:** the commit history shows near-simultaneous branches this same day fixing "iPad landscape as desktop," "desktop layout optimization," "remove sidebar," and "single scroll stream" — four different repos (`portfolio-deep`, `portfolio-desktop`, `portfolio-ipad`, `portfolio-fix`) touched overlapping layout logic within about an hour of each other. That pattern signals **layout instability from rapid parallel iteration**, not a fundamentally broken design. Recommend a single stabilization pass and a real-device check (not just DevTools emulation) on an actual iPad and a small Android phone before calling mobile "done."

---

## 4. Content quality

**Strengths:**
- The deep-dive narrative voice avoids em dashes (confirmed a deliberate style rule in project memory) and reads like a person, not an AI template.
- Numbers are specific and sourced (56,477 records; $2,110,350; 630 respondents) rather than vague ("large dataset," "significant improvement").
- Each deep dive documents at least one limitation or data-quality gap it did *not* fix — a real signal of analytical maturity that most portfolios lack entirely.

**Weaknesses (evidence-based):**

1. **"NULL" as raw technical jargon leaks into recruiter-facing homepage copy**, not just the deep dive. Confirmed in `portfolio.html` line 348: *"A real estate dataset with **NULL** addresses, duplicated parcels, and four inconsistent values..."* A non-technical hiring manager scanning the projects grid (the primary use case for that section) will not parse "NULL" as "missing data." This is a business-framing miss precisely where the task brief flagged it. Fix: use "missing addresses" on the card; keep "NULL" in the deep dive where the audience is more technical.

2. **Project card descriptions are dense — 76 to 105 words each** (measured directly). Five stacked cards at that density is a lot of reading before a recruiter reaches "Experience." Recommend cutting each card to 40–50 words and pushing the rest into the Deep Dive, which already exists as the "expand for more" mechanism.

3. **Generic/redundant CTA labeling**: "Deep Dive →" appears identically 7 times. Low cost to vary at least the surrounding copy so the page doesn't feel templated on a second read.

4. Skills section pill-lists (Data Analysis, Programming, Visualization, Healthcare Domain, Workflow & Tools, AI and Automation, Certifications) are comprehensive but list-heavy — 7 cards of tag clouds is closer to a keyword-stuffing pattern than a narrative skills story. A healthcare-analytics recruiter will skim tags, not read them; the "Healthcare Domain" card (Medical Billing, Revenue Cycle, ICD-10-CM, CPT Codes, Prior Authorization, Claims Data, HIPAA) is genuinely the most job-relevant one on the page and should be visually promoted above generic tool lists like "AI Agents" and "Jupyter," which do very little to distinguish a healthcare-analytics candidate.

5. **Recruiter clarity is good on the hero, inconsistent below it.** The hero nails "who, where, what" in one screen. But the Bike Sales headline ("...the Data Proves It") is the one place where confident marketing language outruns the actual documented certainty in the same project's own deep dive — see Section 2.

---

## 5. Visual consistency, density, clutter vs. clarity

- Palette and typography are consistent: Instrument Serif for display headings + Satoshi for body, a single primary blue (`#3358d4` light / `#7b9bf7` dark), and consistent card/pill radius tokens across sections. This is real design-system discipline, not ad hoc styling.
- Dark/light mode both exist with real WCAG-motivated tuning — the CSS comment `/* was #4a4a62 — boosted for WCAG AA on small text */` (style.css line 69) shows contrast was actually tested and adjusted, not just eyeballed.
- **Density risk is concentrated in three places**: (1) the projects grid, due to long card copy, discussed above; (2) the "Skills" grid, seven pill-heavy cards; (3) the SQL contact-form builder, which is a delightful novelty but is objectively the most complex UI element on the page (tab bar, block shelf, live preview pane, priority pills, returning pills) — it should stay opt-in (it already is, correctly defaulting to the plain form) but is a clutter risk if a visitor clicks into it expecting a normal form.
- Nothing found that reads as visually inconsistent theme-to-theme or section-to-section — the "clutter vs. clarity" issue here is **word density, not visual design**.

---

## 6. Technical polish: a11y, performance, dead links

**Accessibility — generally good:**
- 25 `aria-label` attributes found across `portfolio.html`; interactive icon-only buttons (theme toggle, hamburger, close buttons) are labeled.
- Live regions (`aria-live="polite"` / `"assertive"`) are used correctly on the BMI status, contact form status, and SQL preview — appropriate for dynamic content announcements.
- `prefers-reduced-motion` is respected in at least 4 separate CSS blocks (`style.css`, `deep_dive_v2.css`) — most portfolios skip this entirely.
- Heading hierarchy is mostly clean: one `<h1>` (hero), then `<h2>` per major section, `<h3>` for project titles and sub-lists. No skipped levels found.
- **Gap:** the "Deep Dive" buttons are `<button>` elements with visible text (good), but the KPI/stat cards throughout the deep dives (emoji icons like 🗂 🛠 🔁 📍) rely on emoji as the icon system with no `aria-hidden` confirmed on all instances — screen readers may announce emoji names ("filing cabinet," "hammer and wrench") as noise before each stat. Worth a targeted `aria-hidden="true"` pass on decorative emoji.

**Performance smells (confirmed by direct file inspection):**
- `style.css` is **296 KB** — very large for a single stylesheet; combined with `deep_dive_v2.css` (52 KB), `data_rail.css` (16 KB), and `portfolio_os.css` (8 KB), the CSS payload is ~372 KB before compression. This should be a first-class perf fix, not a nice-to-have.
- `deep_dive_v2.js` is **104 KB**, `script.js` is **96 KB** — both large but plausible given the amount of genuinely interactive functionality (SVG chart rendering, live SQL, contact form logic all hand-rolled, zero chart-library dependency for the deep dives). This is a reasonable tradeoff, not a smell by itself.
- **Real smell: 59 stale, timestamped, unreferenced backup files** sit in `public/` — e.g., `deep_dive_v2_1784173932.js`, `deep_dive_v2_1784200833.css`, plus `deep_dive_v2.js.bak` and `deep_dive_v2.css.bak`. Confirmed via `grep` that **zero** of these are referenced by `portfolio.html`. Combined they total **4.6 MB** of dead weight sitting in the publicly served directory. If the deploy pipeline serves the whole `public/` folder, these are needlessly crawlable/downloadable and increase attack surface and deploy size for no benefit. **Delete them.**
- Images are reasonably sized (39–329 KB, dimensions in the 640–1366px range) — not egregiously oversized, though none appear to use modern formats (WebP/AVIF) or `srcset` for responsive loading; all use `loading="lazy"` correctly on the project cards.
- No `robots.txt` or `sitemap.xml` found in `public/` — minor SEO gap for a job-search-critical site that wants to be discoverable/indexable.

**Dead links / broken paths:** None found. Every internal `href` and every `images/*` reference resolves to an existing file. `resume.html`, `powerbi-dashboard.html`, `tableau-dashboard.html`, and `excel-dashboard.html` all exist and are correctly linked.

**Security/exposure note:** `admin.html`, `admin-login.html`, and an `/admin` and `/admin-login` directory exist as static files in the same public folder as the portfolio. They are not linked from any public-facing page (confirmed via grep), so a visitor won't stumble into them by clicking around — but they are guessable, static, and publicly fetchable URLs (`/admin.html`, `/admin-login.html`). Per project memory, admin login is gated by environment credentials, and no secrets are hardcoded post-PR#2 — so the practical risk is low, but a determined visitor can still load the admin UI shell (just can't authenticate). Recommend moving admin surfaces off the same publicly-routed static path entirely, or at minimum returning a 404/blocking them at the server/CDN layer for unauthenticated requests.

---

## Top 10 fixes by impact — for a healthcare-analytics job seeker in Chicago

Ranked by (recruiter-visible impact) × (effort to fix):

1. **Kill "NULL" and other raw technical jargon on the homepage project cards** (keep it in the deep dive). This is the single highest-impact, lowest-effort fix — it directly affects the first impression of every non-technical hiring manager who reads the projects grid without clicking "Deep Dive." *(Effort: trivial — one string edit.)*

2. **Cut each project card description from 76–105 words to ~40–50 words**, leading with the business outcome, not the method. Recruiters scan; the deep dive already exists as the "tell me more" mechanism — the card doesn't need to do the deep dive's job. *(Effort: low.)*

3. **Fix the confidence mismatch on the Bike Sales / Excel project.** The headline claims the data "proves" the Pacific region is "the bet," while the deep dive itself flags it as the smallest sample. In an interview, this is exactly the kind of inconsistency that undermines credibility on statistical rigor — which matters enormously for a healthcare-analytics role where overclaiming on small samples has real consequences. *(Effort: low, one headline + one caveat sentence.)*

4. **Delete the 59 stale `deep_dive_v2_*` timestamped backup files and `.bak` files (4.6 MB) from `public/`.** Dead weight, unnecessary attack surface, and a bad signal if any recruiter or engineer ever inspects the site's network tab or file listing. *(Effort: trivial — `rm` and redeploy.)*

5. **Add one explicit healthcare-relevance bridge sentence to each of the three non-healthcare-native projects** (Power BI survey, Airbnb/Tableau, Bike Sales/Excel). Right now only the "About" section and skills tags claim healthcare domain knowledge; the flagship interactive projects are general-business datasets. One sentence per project tying the *technique* (DAX midpoint calculation, geographic join, regional segmentation) to a healthcare-billing or claims-data equivalent would directly reinforce the "healthcare operations and analytics" positioning stated in the hero. *(Effort: low, high narrative payoff.)*

6. **Promote the "Healthcare Domain" skill card visually above generic tool tags** (AI Agents, Jupyter, GitHub) in the Capabilities grid. For this specific audience, Medical Billing / Revenue Cycle / ICD-10-CM / CPT / Prior Authorization / Claims Data / HIPAA is the most differentiated, job-relevant content on the entire page and it currently has equal visual weight to a "Workflow & Tools" card listing generic dev tooling. *(Effort: low — reorder, don't redesign.)*

7. **Stabilize the layout after the same-day parallel-branch churn** (iPad landscape, desktop optimization, sidebar removal, single-scroll-stream all touched within about an hour across four different repo copies). Do one clean regression pass on a real iPad, a real small Android phone, and a real desktop browser before calling this done — the CSS breakpoint system itself is sound; the risk is regressions from overlapping edits, not the architecture. *(Effort: medium — needs real-device QA, not more code.)*

8. **Add `robots.txt` and a basic `sitemap.xml`.** For a job-search portfolio, being reliably indexable by search engines (so "Andre Weissmann data analyst Chicago" surfaces this site) is directly tied to job-search outcomes, not just a technical nicety. *(Effort: trivial.)*

9. **Split or defer the 296 KB `style.css`.** Even though the interactive functionality justifies a heavier JS payload, a single 296 KB stylesheet is disproportionate and will show up in any Lighthouse/PageSpeed check a technically-minded hiring manager might run — a bad look for an analytics candidate whose job is partly about efficient data pipelines. *(Effort: medium — requires a CSS audit/purge pass, ideally with PurgeCSS or similar.)*

10. **Block or remove public access to `/admin.html`, `/admin-login.html`, and their directory variants at the serving layer**, even though they're unlinked and credential-gated. A candidate portfolio should not expose any admin surface, however locked-down, to a curious visitor's URL guessing — it's a minor but avoidable red flag for a healthcare-adjacent candidate where data-security instincts matter. *(Effort: low — server/CDN rule, not a content change.)*

---

## Full minimalist redesign vs. iterative polish

**Recommendation: iterative polish, not a full redesign. Do not rebuild this from scratch.**

**Why not a redesign:**
- The underlying design system (typography pairing, color tokens, dark/light mode, 4-tier breakpoint system, motion-reduction support) is already coherent and above the bar for a portfolio at this career stage. A redesign would be paying to rebuild something that already works structurally.
- The hardest, highest-differentiation work — the live SQL-WASM sandbox, the live BMI calculator, the SQL-flavored contact form, the "thinking trail" narrative structure in every deep dive — is genuinely rare among analyst portfolios and is *content and engineering work*, not visual-design work. A redesign risks discarding or destabilizing this in service of a new look, for zero recruiter-visible upside.
- The actual problems identified in this audit (jargon leakage, card density, one confidence-mismatch headline, dead files, missing `robots.txt`, admin exposure) are all **copy, content, and hygiene fixes**, not layout or visual-design failures. None of them require touching the design system.

**When a redesign *would* be worth it:**
- If the goal shifted from "healthcare-analytics job search" to "personal brand / consulting practice," a more minimalist, editorial redesign (fewer interactive gimmicks, more written case-study depth) could better serve a senior-analyst or consultant positioning. That is not the stated goal here.
- If mobile real-device QA (fix #7) turns up structural breakage that CSS patches can't resolve — e.g., if the SQL sandbox or deep-dive drawer is fundamentally unusable on a real phone rather than just needing polish — that specific *component* might warrant a rebuild, not the whole site.

**Tradeoff summary:**

| | Iterative polish (recommended) | Full minimalist redesign |
|---|---|---|
| Time to improve recruiter experience | Days | Weeks |
| Risk to existing differentiators (SQL sandbox, BMI tool, thinking-trail narrative) | Low — untouched | High — likely rebuilt or cut for scope |
| Addresses the actual problems found in this audit | Yes — all 10 top fixes are copy/hygiene, not layout | Only incidentally |
| Job-search opportunity cost | Low | High (weeks of build time is weeks not spent applying/networking) |

---

## What NOT to change

- **The live SQL-WASM sandbox and the live BMI/WHR calculator.** These are the single strongest differentiators on the site relative to any typical analyst portfolio. Do not replace with static screenshots or simplify away the interactivity.
- **The "Analyst's Thinking Trail" narrative structure** (assume → find → pivot → insight → limit) in every deep dive. This is the best storytelling device on the site and the clearest signal of real analytical judgment rather than tutorial-following. Keep it in all five deep dives and extend it to any future project.
- **The honest limitation-flagging** in every project (Bike Sales' missing year column, Airbnb's null price entries, the survey's missing columns, the WHR self-report accuracy caveat). This is rare in portfolios and reads as senior-level maturity — do not sand this down to sound more confident.
- **The dark/light mode system and the WCAG-motivated contrast tuning already present in the CSS.** It's already been tested and adjusted once (per the CSS comments); don't regress it while making other fixes.
- **The SQL-flavored contact form**, as long as it stays opt-in behind the current default plain-English form. It's a genuine memorability/personality signal for a SQL-focused analyst and costs nothing because non-technical visitors never have to see it.
- **The serif/sans-serif type pairing and the overall color palette.** Confirmed visually coherent across the screenshot and CSS token review — there is no visual-consistency problem here to fix.
- **The 4-tier responsive breakpoint system's architecture** (phone / tablet / desktop / wide-desktop). The recent churn is an execution/QA problem, not an architecture problem — don't throw out the breakpoint strategy while fixing the regressions.

---

### Sources
- Live site: [portfolio.html](https://andre-weissmann-data-portfolio-live.pplx.app/portfolio.html), [root URL](https://andre-weissmann-data-portfolio-live.pplx.app/)
- Live Power BI replica page: [powerbi-dashboard.html](https://andre-weissmann-data-portfolio-live.pplx.app/powerbi-dashboard.html)
- Production source reviewed: `/home/user/workspace/portfolio-fix/` (git commit `fec09b1`, "docs: lock canonical portfolio URL to data-portfolio-live #11"), specifically `public/portfolio.html`, `public/style.css`, `public/portfolio_os.css`, `public/data_rail.css`, `public/deep_dive_v2.css`, `public/deep_dive_v2.js`, `public/script.js`, `public/resume.html`, `public/images/`
- Project background: internal knowledge note `/home/user/workspace/memory/knowledge/projects/data-analytics-portfolio.md`
