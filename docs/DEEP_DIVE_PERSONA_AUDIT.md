# Live Deep Dive Visitor Audit
**Site tested:** [andre-weissmann-data-portfolio-ready.pplx.app/portfolio.html](https://andre-weissmann-data-portfolio-ready.pplx.app/portfolio.html) — **this URL loaded successfully (200, public)**. The fallback `-live.pplx.app` URL was not needed.

**Method:** Automated browser walkthrough (Chromium via Playwright) of the homepage, the Nashville Housing (SQL) project card, and the BMI / Waist-to-Hip Ratio (Python) project card, then the "Deep Dive →" modal for each, at desktop (1400×900) and mobile (390×844) viewports. Screenshots captured at each scroll position; DOM inspected for scroll containers, TOC behavior, and interactive elements (SQL query buttons, BMI sliders, "Ask This Project" chips, dark-mode toggle, Esc/click-outside close). Source repo linked from the Nashville deep dive was verified live: [github.com/Andre-Weissmann/sql-data-projects](https://github.com/Andre-Weissmann/SQL).

All screenshots referenced below are saved in `/home/user/workspace/portfolio-quote/` (e.g. `04_nashville_deepdive_first.png`, `10_bmi_deepdive_first.png`, `mobile_true_scroll_900.png`, `nashville_full_7.png`).

---

## 0. What the deep dive actually is

Both projects use the identical "Brief" template (a modal overlay, not a separate page/URL) with the same seven-section skeleton:

1. **Overview** — 3-card row (The Situation / Why Decisions Break / What Clean Data Unlocks) + "The Key Finding" pull-quote + 4 stat tiles + "Ask This Project" teaser
2. **The Raw/Health Problem** — narrative paragraph
3. **The Analyst's Thinking Trail** — Assume → Find → Pivot → Insight → Limit, a timeline-style reasoning log
4. **Live Query Lab / Live Scenario Builder** — an actually-interactive SQL runner (Nashville) or height/weight slider (BMI)
5. **Sale Conditions / Category Distribution** — an SVG bar chart
6. **Data Quality Impact / Analytical Confidence** — 4-up "what this delivers" cards + confidence-percentage gauges (BMI only) + a second "Ask This Project" block
7. (Nashville only) closes on the same "what clean data enables" cards

This is a strong, opinionated template — reused consistently across projects, which is good for a portfolio (predictable) but means every deep dive tells the *same shape* of story regardless of whether that shape fits the project.

---

## Persona A — Recruiter (30–60 second scan)

**Behavior simulated:** lands on homepage, skims hero, scrolls to Projects, glances at Nashville card, clicks "Deep Dive," sees the first screen only, likely does not scroll.

**What they notice first**
- The homepage hero is clean and immediately answers "who/what/where": name, photo, "Open to Work" badge, location, remote preference, degree, and a one-line pitch ("Turning health data into clarity") — this is exactly what a recruiter scans for in the first five seconds ([homepage screenshot](file:01_homepage.png)).
- Skill pills (SQL, Python, Power BI, Tableau, Excel) are visible without scrolling — good for keyword-matching recruiters.
- On opening a deep dive, the recruiter sees a strong "Key Finding" callout in bold, quotable language ("56,477 Nashville property sales. 29 homes with blank street addresses, 104 duplicate sale rows...") and four big stat tiles (56,477 / 7 / 104 / 29) — this reads well as a scannable outcome statement even without reading prose.

**What confuses them**
- The badge says "SQL" and "2023" but the deep dive header just says "Nashville Housing" — a recruiter skimming in 30 seconds doesn't get an instant one-line "so what" (e.g., "cleaned messy government housing data for public use") until they read a full paragraph.
- The three intro cards (Situation / Why Decisions Break / What Clean Data Unlocks) are text-dense — three paragraphs before any visual, which is too much for a 30-second scan. A recruiter is unlikely to read all three.
- No indication of *when this was used professionally* vs. a self-directed practice project — the GitHub repo's own description says "Portfolio SQL work, not a product" ([GitHub repo](https://github.com/Andre-Weissmann/SQL)), but the deep dive framing ("Metro housing sales looked ready for dashboards...") reads like a real client engagement. A recruiter who digs one click further (GitHub) will find a disconnect in framing.

**What impresses them**
- The live, interactive SQL sandbox embedded directly in the card (before even opening the deep dive) is a genuine differentiator — most portfolios show static screenshots, not queryable data ([Nashville card](file:03_nashville_card.png)).
- The stat tiles are recruiter-friendly at-a-glance proof of scale (56K+ records).

**What would make them leave**
- If the recruiter's very first click lands on a wall of three text cards with no image/chart in view (as it does now — [04_nashville_deepdive_first.png](file:04_nashville_deepdive_first.png)), and they're used to 30-second scans, they may bounce before reaching the stat tiles or the live SQL demo, which are the strongest assets.
- On mobile — where many recruiters do a first-pass skim between meetings — scrolling the deep dive at all causes the header (title, "Close" button, GitHub link) and the "ON THIS PAGE" navigation to scroll away entirely with the content (confirmed via DOM inspection: the header and content share one scroll container, and the TOC has 0px height on mobile). A recruiter who scrolls a little and wants to bail has to scroll all the way back up or use a phone's back gesture — there's no persistent exit. This is the single most likely mobile drop-off cause. See [mobile_true_scroll_900.png](file:mobile_true_scroll_900.png).

---

## Persona B — Hiring manager / analytics lead (3–5 minutes)

**Behavior simulated:** reads homepage, opens both Nashville and BMI deep dives fully, scrolls through every section, tries the live SQL query buttons and BMI sliders, tests "Ask This Project," checks the GitHub link, tries closing via Esc and via click-outside.

**What they notice first**
- The "Analyst's Thinking Trail" (Assume → Find → Pivot → Insight → Limit) is the most differentiated content in the whole site — it's the only place that shows *reasoning*, not just output. On BMI: "Started with BMI only... The CDC website itself states BMI 'does not diagnose the body fatness or health of an individual'... Added WHR as an optional second metric" ([bmi_full_2.png](file:bmi_full_2.png), [bmi_full_3.png](file:bmi_full_3.png)). This is exactly the signal a hiring manager looks for — can this person self-critique and iterate, not just execute a tutorial.
- The explicit "Limit" step (self-reported input bias, ±2–3 lb/cm measurement error) is a genuine trust-builder; few junior portfolios acknowledge limitations at all.

**What confuses them**
- **The bar chart bug**: "Sale Conditions Breakdown" renders all five bars (46,123 / 5,348 / 2,697 / 1,846 / 463) at **identical visual width** — the chart is not proportionally scaled to its own data ([nashville_full_7.png](file:nashville_full_7.png)). For an analytics-lead persona whose entire job is scrutinizing whether charts are trustworthy, this is a credibility problem — it looks like the analyst either didn't proofread the chart or doesn't check chart output, which cuts against the "trusted data asset" narrative of the project itself.
- **The live SQL "By land use" query only returns 40 total rows** (23+8+5+4) against a dataset advertised as "56,477 Nashville housing records" ([nashville_card_landuse_query.png](file:nashville_card_landuse_query.png)). It's unclear whether the sandbox runs against a small demo subset or a broken filter — either way, an analytics lead will immediately notice the mismatch between the headline number and the interactive tool's output, and will wonder if the "live" claim is fully honest.
- Both deep dives use the exact same section template and even similar phrasing patterns ("X is a Y tool, not a Z" — appears for both BMI and by implication data cleaning). After doing two deep dives back to back, the template repetition becomes obvious and starts to feel like a formula being filled in rather than a bespoke case study per project.
- There are **two independent dark-mode toggles** — one in the site header, one inside the deep-dive modal — and they don't appear linked. Minor, but a careful reviewer will notice the inconsistency.

**What impresses them**
- The live, editable BMI calculator with real-time classification and a second "Live Scenario Builder" slider (independent from the calculator on the card) inside the deep dive itself ([bmi_full_3.png](file:bmi_full_3.png)) — genuinely interactive, not a screenshot.
- "Ask This Project" – clickable question chips (Main finding / Most surprising / Tools used / What was fixed) that return a pre-written, specific answer is a nice touch that anticipates interview-style questions and shows the candidate can distill their own work into soundbites ([13_bmi_ask_project.png / bmi_ask_project_section.png](file:bmi_ask_project_section.png)).
- Confidence-percentage gauges (74% CDC Formula Accuracy, 64% BMI Category Reliability, etc. — [bmi_full_6.png](file:bmi_full_6.png)) show an attempt at quantified self-assessment, which is unusual and interesting, though see P1 note below on how these numbers were derived (not explained).
- Esc-to-close and click-outside-to-close both work correctly and return the visitor to the exact scroll position they left on the main page — good state preservation, verified directly ([08_after_escape.png](file:08_after_escape.png), [test_click_outside_result.png](file:test_click_outside_result.png)).
- The GitHub link is real and resolves to actual, matching SQL code — good, this is not vaporware ([github.com/Andre-Weissmann/sql-data-projects](https://github.com/Andre-Weissmann/SQL)).

**What would make them leave**
- Discovering the chart-scaling bug and the SQL row-count mismatch back to back would likely make a rigorous analytics lead downgrade trust in the "data quality" framing — the pitch is literally "turning corrupt records into a trusted data asset," so any visible data-presentation bug undercuts the core value proposition.
- No sense of business impact or stakeholder context anywhere in either deep dive — no "this was used by X team to do Y," no before/after decision outcome, no named client or use case. Everything is stated in the abstract ("any analyst or business team can build on...").

---

## Persona C — Curious visitor / peer (exploring interactively)

**Behavior simulated:** free exploration — clicking every visible interactive element, testing sliders, presets, chart tooltips, TOC navigation, resizing to mobile.

**What they notice first**
- The BMI card's quick-scenario preset buttons (Underweight / Healthy Weight / Overweight / Above Obesity) are a delightful, low-effort way to explore before even opening the deep dive ([09_bmi_card.png](file:09_bmi_card.png)) — this is the most "playable" part of the whole site.
- The TOC sidebar ("ON THIS PAGE") auto-highlights the active section as you scroll — nice, standard, well-implemented wayfinding on desktop ([bmi_full_2.png](file:bmi_full_2.png) → [bmi_full_3.png](file:bmi_full_3.png) show the highlighted item changing from "The Health Problem" to "Thinking Trail").

**What confuses them**
- On mobile, the TOC disappears completely (confirmed 0×0 in DOM), so a mobile peer has no sense of how long the deep dive is or where they are in it — pure infinite-scroll with no progress indicator.
- The two "Ask This Project" chip blocks appear at different points in the same deep dive (once near the top under Overview, once again near the bottom under "What This Program Delivers") with overlapping but not identical questions ("Main finding" vs "What it does," "Most surprising" vs "Why two metrics"). A peer exploring casually may not realize these are two separate interaction points and could miss one entirely.
- The BMI "Interactive Scenario" slider mid-page and the calculator on the main card (before opening the deep dive) are two separate, un-synced tools that do almost the same thing (compute BMI from height/weight) — a curious visitor bouncing between the card and the modal may wonder why their inputs don't carry over.

**What impresses them**
- Genuine live computation everywhere tested — SQL results updating instantly per button, BMI reclassifying instantly per slider drag, confidence gauges rendering as animated arcs. Nothing felt like a static mockup.
- The "Thinking Trail" timeline UI (colored icons per step: ?, !, ↻, ★, ⚠) is visually distinct and fun to read even without deep SQL/health knowledge — it reads like a story, not a spec sheet.

**What would make them leave**
- Hitting the identical three-card intro structure on the second deep dive (BMI) right after finishing Nashville makes the site feel templated rather than curated, which can reduce a peer's motivation to open a third or fourth project — the "next deep dive will just be the same shape" expectation sets in fast.
- No cross-links between deep dives ("see also," "next project") — closing one deep dive dumps you back on the full scrolling homepage rather than offering a natural next step, so exploration requires re-finding the next project card manually.

---

## Concrete UI/Copy Changes

### P0 — Fix before this is shown to anyone
1. **Fix the "Sale Conditions Breakdown" bar chart scaling bug.** All five bars currently render at equal width regardless of the underlying values (46,123 vs. 463) — this actively misrepresents the data on a project whose entire pitch is data trustworthiness. ([nashville_full_7.png](file:nashville_full_7.png))
2. **Fix mobile scroll architecture.** The deep-dive header (title + Close button) and the TOC sidebar must stay visible/sticky while the user scrolls the body content. Currently the entire modal — header included — is inside one scrollable div, so scrolling the content scrolls the exit button off-screen with no way back except scrolling all the way up. This is a real risk of trapping mobile visitors, or at minimum degrading trust. (Confirmed via DOM inspection and [mobile_true_scroll_900.png](file:mobile_true_scroll_900.png))
3. **Reconcile the live SQL sandbox row counts with the headline number.** "56,477 Nashville housing records" is the hero stat, but the "By land use" live query returns only 40 total rows. Either clarify this is a small demo subset (e.g., "sample of the full 56,477-row dataset") or fix the query/data binding so the numbers agree. ([nashville_card_landuse_query.png](file:nashville_card_landuse_query.png))

### P1 — Should fix soon, materially affects credibility
4. **Add one plain-English outcome line at the very top of each deep dive**, above the three-card grid, e.g. "Result: a cleaned, query-ready 56K-row dataset with zero blank addresses and zero duplicate sales." Recruiters scanning in 30 seconds currently have to read three paragraphs before getting a takeaway.
5. **Explain how the "Analytical Confidence" percentages (74%, 64%, 69%, 47%) were derived.** Right now they read as impressively precise but arbitrary — a hiring manager will ask "measured how?" If they're illustrative/self-assessed, label them as such; if they're calculated, show the method.
6. **Differentiate the two projects' templates more.** Keep the reusable skeleton (it's a good system) but vary section titles/order or add at least one project-specific visualization type so two deep dives back-to-back don't feel identical. Right now "The Situation / Why Decisions Break / What Clean Data Unlocks" and "The Analyst's Thinking Trail" appear verbatim-structured on both.
7. **Reconcile the framing gap with the GitHub repo.** The repo description self-identifies as "Portfolio SQL work, not a product," while the deep dive narrative implies a more formal engagement ("Metro housing sales looked ready for dashboards, but..."). Either soften the deep dive's "client-ready" framing or make the practice-project context explicit and confident (there's no shame in a well-executed practice dataset — Nashville housing is a well-known public Kaggle dataset).
8. **Merge or clearly separate the two BMI calculators** (the one on the main card and the "Interactive Scenario" slider inside the deep dive) so a visitor understands whether they're the same tool or two different demos.
9. **Add a persistent progress indicator on mobile** (e.g., a slim top progress bar or "3 of 7" counter) since the TOC sidebar is not available at that breakpoint.

### P2 — Polish, nice-to-have
10. Unify the two separate dark-mode toggles (site-level and deep-dive-level) into one state, or clarify why they're independent.
11. Add "next project →" navigation at the bottom of each deep dive so peer/explorer personas can move forward without returning to the full homepage scroll.
12. Add a one-line dataset provenance/citation directly in the deep dive (e.g., "Public Nashville, TN property assessor dataset, ~56K rows, sourced via [Kaggle]") — currently provenance is implied but never stated, which matters to both hiring managers and curious peers.
13. Consider consolidating the two "Ask This Project" chip blocks into a single set with more questions, rather than splitting nearly-duplicate question sets across two scroll positions.
14. On the homepage, indicate near the "Deep Dive" button that it opens an overlay (not a new page) — e.g., a small expand/modal icon — since some visitors may expect a URL change and be surprised the browser back button doesn't apply.

---

## "First Screen of Deep Dive Should Show X"

Based on all three personas, the ideal first screen (the content visible with zero scrolling, in both the current desktop and mobile viewport) should lead with, in this order:

1. **One-sentence outcome/result statement** in large type — the "so what" a recruiter needs in under 10 seconds (e.g., "Turned a 56,477-row dataset with 4 kinds of corruption into a fully queryable, trustworthy table").
2. **The 4 stat tiles**, pulled up above the three narrative cards, not below them — they are the most scannable, most impressive, and currently require reading three paragraphs to reach.
3. **A single compressed visual** (one correctly-scaled chart, or the live interactive tool itself) directly beside or below the stat tiles, so a visitor never has to scroll to see that this is a live, working artifact — not just prose.
4. **Persistent, always-visible exit affordance** (Close / Back to portfolio) that does not scroll away on any viewport — this should be solved architecturally (sticky header) before anything else on this list, since it affects every persona's ability to leave gracefully.
5. Push the three "Situation / Why Decisions Break / What Clean Data Unlocks" narrative cards to the *second* screen, for the hiring-manager persona who has already decided (via the first screen) that they want the full story — they are good content, just not first-screen content.

In short: **lead with proof (numbers + a working demo), not setup (three paragraphs of context)** — and guarantee the visitor can always see how to leave.
