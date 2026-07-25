# Honest Competitive Assessment: Andre Weissmann's Data Portfolio

**Subject:** [andre-weissmann-data-portfolio-show.pplx.app/portfolio.html](https://andre-weissmann-data-portfolio-show.pplx.app/portfolio.html)
**Date of review:** July 25, 2026
**Comparison set:** Strong Maven Analytics public portfolios, typical Wix/Squarespace/Carrd analyst sites, generic PDF/GitHub-only portfolios

This assessment is intentionally unflattering where warranted. The goal is accuracy, not encouragement.

---

## 1. What Andre's site actually is

Visiting the live URL renders a single-page, custom-coded portfolio (not a Wix/Squarespace/Maven template) with a hero section ("Turning health data into clarity"), a skill-chip row (SQL, Python, Power BI, Tableau, Excel), status badges (Chicago IL, Open to Remote/Hybrid, "Open to Work"), and top nav for About / Capabilities / Projects / Experience / Contact, plus a dark-mode toggle ([live site](https://andre-weissmann-data-portfolio-show.pplx.app/portfolio.html)). The flagship project examined in depth is a Nashville housing data-cleaning case study (56,477 records) built around a **live, queryable SQL sandbox** embedded directly in the page — visitors can run preset or custom SQL queries (`SELECT ParcelID, LandUse, SaleDate, SalePrice, LegalReference FROM housing LIMIT 10;`) and see results update instantly ([live site](https://andre-weissmann-data-portfolio-show.pplx.app/portfolio.html)). The task brief also references a Python health calculator and other BI dashboards elsewhere on the page.

This is a genuinely uncommon technical build for an individual analyst's site: an in-browser SQL engine with real data is closer to what a data-tooling startup would ship than what a job-seeking analyst typically builds.

---

## 2. The comparison set, concretely

### 2a. Strong Maven Analytics portfolios
Maven's public Showcase is a searchable gallery of thousands of analyst portfolios, each following a rigid, proven card format: featured image (usually a dashboard screenshot), title, 1–3 sentence description, tool tags, and an embedded **live, interactive Power BI/Tableau/Excel Online dashboard** the visitor can filter and click through directly in the browser ([Maven Analytics Showcase](https://mavenanalytics.io/project/13780)). Pulling live examples from the current gallery shows the bar analysts are competing against, including several in Andre's own healthcare niche:

| Example project | Author | Scale / hook |
|---|---|---|
| RHS Clinical Quality Dashboard — 60 CQI Tracking Across 4 Sites | Amjid Hussain | Daily API refresh, used by real CEOs/COOs for governance decisions |
| Hospital Emergency Room Analytics (Power BI) | Niel Angelo Simon | 9,216 patient records, staffing recommendations |
| Healthcare Dashboard | Amos Kipngetich | Readmission risk, DAX measures across departments |
| Supplier & Customer Sales Dashboard | Tehreem Siraj | $853.1M in sales, 362 suppliers |
| Airbnb Listings Dashboard | Helga Szabo | 250,000+ listings across 10 cities |

(All sourced from [mavenanalytics.io/project/13780](https://mavenanalytics.io/project/13780), live showcase gallery.)

Maven's own instructor guidance for what separates winning portfolios (drawn from judging its "Portfolio Showdown" contest as real recruiters) explicitly weighs: does it grab attention in the first seconds, are bios/project cards clear and concise, do projects span varied tools/topics, and is there quantified business impact ([Maven Portfolio Showdown criteria, YouTube](https://www.youtube.com/watch?v=QsdJJQ9OBCQ); [Maven's own portfolio-building blog](https://mavenanalytics.io/blog/how-to-build-a-standout-analytics-portfolio-project)). Maven explicitly instructs users to lead dashboards with a plain-English business-impact summary line (e.g., "identifies top-performing regions... for a projected 15% increase in revenue") — a habit reinforced across thousands of profiles.

### 2b. Typical Wix/Squarespace/Carrd analyst portfolios
Wix's own guidance for data-analyst portfolios recommends a templated structure: About, Data Projects, Project Breakdowns (problem → data → approach → impact), Skills Summary, Contact — built from a pre-made "Data Analytics" template with built-in SEO and a blog module ([Wix blog](https://www.wix.com/blog/how-to-make-a-data-analyst-portfolio)). In practice, most Carrd/Wix analyst sites are static single-pagers: a headshot, a paragraph bio, embedded dashboard screenshots or Tableau Public links, and a contact form — exemplified by simple Carrd portfolios like [Data Works by J](https://dataworksbyj.carrd.co/), which lists a handful of case-study projects with narrative write-ups and static or lightly interactive Python dashboards. These sites are fast to build, look clean, but rarely include any truly live, run-it-yourself computation.

### 2c. Generic PDF / GitHub-only portfolios
The baseline here is much lower. Guidance aimed at this segment stresses that ~95% of analyst GitHub profiles generate zero opportunities because they show code, not value, and that reviewers give a README about 10 seconds to answer "what problem, what data, what result" ([Mes Formations Data guide](https://www.mes-formations-data.fr/blog/2026/24-portfolio-data-analyst-github)). A PDF resume-as-portfolio has no interactivity, no visual hierarchy beyond print formatting, and requires the recruiter to imagine the work rather than see it.

---

## 3. Where Maven portfolios look more polished or credible

Ranked by how much this actually matters to a recruiter:

1. **Volume and social proof.** Maven profiles typically show 4+ projects with like counts, comments, and view activity from a real community — third-party validation Andre's standalone site cannot replicate ([Maven Showcase](https://mavenanalytics.io/project/13780)).
2. **Live BI tool embeds, not custom code.** A Maven analyst's embedded Power BI/Tableau dashboard is something the hiring manager already knows how to read at a glance — same filters, same interaction model they use at work every day. Andre's custom SQL sandbox, however impressive as engineering, asks the visitor to learn a bespoke UI first.
3. **Consistent, proven card format.** Every Maven project follows the same "image → title → 1-liner → tags → embed" pattern that thousands of recruiters have seen and calibrated against ([Maven "what makes a great portfolio project"](http://help.mavenanalytics.io/en/articles/6792558-what-makes-a-great-portfolio-project)). Predictability is a credibility signal in this context — recruiters pattern-match fast.
4. **Explicit business-impact framing baked into the format.** Maven trains users to open every dashboard with a quantified takeaway line. Multiple showcase examples lead with dollar or record-count scale ($853.1M in sales, 250K+ listings, 9,216 patients) — this is now the norm to beat, not a differentiator.
5. **Platform-level trust signals** — verified account, tool-proficiency badges from assessments, and a built-in network/messaging layer that lets recruiters DM analysts directly through the platform.

---

## 4. Where Andre actually wins

Being honest, these are real but narrower advantages:

1. **A genuinely rare interactive artifact.** A working, in-browser, query-your-own-SQL sandbox against a real 56K-row dataset is something almost no Maven, Wix, or GitHub portfolio has. It signals he can (or directed someone to) build actual data tooling, not just consume BI software — a different, arguably more senior signal than "I made a dashboard."
2. **Full ownership of the domain and design.** Nothing on the page reads as a template. The typography (serif display headline + sans body), the dark-mode toggle, and layout choices are custom, whereas the vast majority of Wix/Carrd sites and 100% of Maven-hosted profiles are visually constrained to a platform's design system. This is a real differentiator for anyone evaluating design/product sense alongside analytics skill.
3. **Narrative specificity in the write-up.** The Nashville Housing description names exact techniques (self-join imputation, `PARSENAME`, CTE + `ROW_NUMBER` dedup, `CASE WHEN` standardization) rather than the vaguer "cleaned and analyzed the data" language common on templated sites. This reads as more technically credible than a large share of Maven one-liners.
4. **No reliance on a third-party platform's continued existence or branding.** Maven-hosted portfolios live at a `mavenanalytics.io/project/xxxx` URL and disappear if Maven changes its platform (as literally happened with the old `/showcase` URL, which now redirects — see [mavenanalytics.io/showcase](https://mavenanalytics.io/showcase)). Andre's custom domain/app is independent.
5. **Healthcare specialization is explicit and consistent** in his positioning ("Turning health data into clarity," healthcare operations focus), which is sharper personal branding than the generic "Data Analyst" framing most Wix/Carrd/GitHub portfolios default to.

---

## 5. Where Andre is average or behind

1. **Single project depth shown vs. breadth expected.** What's verifiable from the live page centers heavily on one flagship (Nashville Housing/SQL). Recruiters scanning 20 portfolios in 90 seconds each expect 3–5 varied projects (per Maven's own guidance and general hiring-manager research) covering different tools and problem types ([CCS Learning Academy portfolio guidance](https://bootcamp.ccslearningacademy.com/strategies-for-creating-a-compelling-data-analytics-portfolio/); [Maven blog](https://mavenanalytics.io/blog/how-to-build-a-standout-analytics-portfolio-project)). If the Python calculator and BI dashboards referenced in the brief are thin or under-described relative to the SQL centerpiece, the portfolio will read as one strong idea padded out, which is a known Maven judging red flag ("do projects cover a variety of tools and topics").
2. **No visible business-impact framing or quantified outcome on the flagship project.** The Nashville write-up explains the *technique* thoroughly but doesn't answer "so what did this unlock for a business/decision" the way Maven trains its users to lead with ("...helping prioritize marketing efforts for a projected 15% increase in revenue"). Technique-first, impact-second is a data-cleaning-exercise framing, not a business-analyst framing — this is the single biggest gap versus Maven's format.
3. **No visible social proof or third-party validation.** No likes, comments, view counts, or community engagement — because it's a standalone site. A recruiter can't tell if anyone besides the candidate has ever looked at this.
4. **Novelty carries execution risk.** A live SQL sandbox is more fragile than a static image or an embedded Power BI iframe: it depends on the app staying up (the task brief itself supplies a fallback URL because the primary one goes down), can be slow to load, and if a recruiter's first query errors out or times out, the impression is worse than a static screenshot would have been. Complexity cuts both ways.
5. **Familiarity gap.** Recruiters instantly recognize a Power BI/Tableau embed and know how to judge it. A custom SQL sandbox forces them to first figure out the interface — extra cognitive load in a 90-second scan window, which the standard literature identifies as the actual budget hiring managers give a portfolio ([CCS Learning Academy](https://bootcamp.ccslearningacademy.com/strategies-for-creating-a-compelling-data-analytics-portfolio/)).
6. **No visible resume/LinkedIn/GitHub cross-linking confirmed beyond a "View Resume" button and social icons** — this is table stakes, not a differentiator, and typical Wix/Carrd/Maven sites all do this too.

---

## 6. Are live SQL/interactive Q&A demos a real 2026 hiring differentiator, or just nice-to-have?

**Honest answer: nice-to-have with upside, not a guaranteed differentiator — and it can backfire.**

- The dominant hiring signal literature (Maven's own criteria, general portfolio-building guides) still centers on **clarity, business framing, and speed-to-comprehension** — not technical novelty. Hiring managers spend roughly 90 seconds per portfolio and are scanning for messy-data handling, business relevance, and plain-language communication, not engineering cleverness ([CCS Learning Academy](https://bootcamp.ccslearningacademy.com/strategies-for-creating-a-compelling-data-analytics-portfolio/)).
- Maven's dominance in this space means recruiters who see "20 Maven portfolios" have been trained on the embedded-BI-dashboard mental model. A live SQL sandbox is a genuine novelty and will stand out on **memorability** — it is very likely the thing a recruiter mentions to a colleague afterward ("this one guy actually had a working SQL box on his site"). That is real value; distinctiveness matters when someone is comparing dozens of similar-looking Power BI screenshots.
- But novelty is only a differentiator if it **works flawlessly and quickly** and if it's paired with the same business-impact clarity Maven portfolios lead with. An interactive feature that is slow, confusing, or unaccompanied by a clear "why this matters" framing reads as a demo of coding ability, not analytical/business judgment — and analyst hiring (as opposed to data-engineering hiring) is judged more on the latter.
- Net: in 2026, a working interactive artifact is a **plus-signal for technical range and initiative**, especially for healthcare-analytics roles that increasingly want SQL fluency, but it does **not substitute** for the fundamentals Maven-trained recruiters check first: quantified impact, varied project types, and a fast, clear narrative. Treat it as a bonus layer on top of the fundamentals, not a replacement for them.

---

## 7. What a recruiter who has just seen 20 Maven portfolios notices first about Andre's

In rough order of first impression:

1. **It's not a Maven/Wix template** — the layout, typography, and interaction pattern are unfamiliar, which triggers a half-second "wait, what is this" pause. That pause can be positive (curiosity) or negative (friction), depending entirely on how fast the SQL sandbox loads and how obvious "click here" is.
2. **The absence of a dashboard screenshot up top.** Every Maven portfolio leads with a dashboard image; Andre's hero leads with a headline and skill chips instead. A recruiter primed by 19 dashboard-first profiles may briefly wonder where the visual proof is before finding the SQL sandbox further down.
3. **"Open to Work" badge and location/work-preference metadata** — this is a direct, practical signal Maven profiles don't always surface as prominently, and recruiters scanning for immediately-placeable candidates will register it fast.
4. **The healthcare specialization framing** ("Turning health data into clarity") — sharper and more memorable than the generic "Data Analyst | [City]" headline pattern common to both Maven and Wix sites.
5. **Once they reach the SQL sandbox: genuine surprise/interest**, followed immediately by the test of whether it actually runs well. If it does, it's the strongest single moment of differentiation in the whole comparison set. If it lags or errors, it undermines the "clarity" and "trust" positioning the copy promises.

---

## 8. Ranked strengths and weaknesses

**Strengths (highest to lowest impact):**
1. Live, working SQL sandbox against real data — genuinely rare, high memorability.
2. Fully custom design/domain — signals initiative and design sense beyond templated peers.
3. Specific, technically credible write-up language (named SQL techniques, exact row counts).
4. Clear healthcare-analytics niche positioning.
5. Practical placement metadata (location, remote/hybrid, open-to-work) visible immediately.

**Weaknesses (highest to lowest impact):**
1. No visible quantified business impact/outcome statement on the flagship project — the single biggest gap vs. Maven norm.
2. Unclear project breadth/variety — one deep example is confirmed; if the referenced Python/dashboard projects are thin, this reads as a one-trick portfolio.
3. Zero third-party social proof (no likes/comments/views/community signal) that Maven-hosted profiles carry by default.
4. Custom interactive tooling carries uptime/performance/UX risk that static or platform-embedded dashboards don't (the task brief itself needed a fallback URL).
5. Unfamiliar interaction pattern adds cognitive load in a 90-second scan versus the instantly-recognizable Power BI/Tableau embed pattern recruiters already know.

---

## 9. Five concrete upgrades (no full rewrite required)

1. **Add a one-line, bolded business-impact statement at the top of every project card**, Maven-style — e.g., "Result: eliminated ~X duplicate/incorrect records, making the dataset safe for downstream valuation analysis." This directly closes the biggest gap versus Maven's format and costs almost nothing to add.
2. **Add a static "hero" screenshot/GIF of the SQL sandbox in action above the live embed**, so the value is visible even if the interactive tool loads slowly or a recruiter is skimming on mobile. This hedges the uptime/performance risk without removing the live feature.
3. **Ensure 3–5 distinct, fully fleshed-out projects are visible on first scroll** (not just deeply linked), each tagged with different tools (SQL, Python, Power BI, Tableau) so the portfolio reads as broad, not narrow — matching the explicit Maven/hiring-manager guidance on project variety.
4. **Add lightweight social proof**: a short testimonial quote, a "featured on / built for" note, or simply cross-posting the SQL sandbox project to Maven Showcase or LinkedIn as a case-study post to generate visible engagement (likes/comments) that can be referenced or embedded back on the site.
5. **Tighten the "so what" framing for a non-technical reader** on every project — add a two-sentence plain-English summary above the technical detail (what question was being answered, what a healthcare/business stakeholder gets out of it) so the portfolio serves both the 90-second skimmer and the technical deep-diver, per Maven's own "make detail available to those who want it, without overwhelming those who don't" principle ([Maven Analytics portfolio blog](https://mavenanalytics.io/blog/how-to-build-a-standout-analytics-portfolio-project)).

---

## Sources

- Andre Weissmann live portfolio: https://andre-weissmann-data-portfolio-show.pplx.app/portfolio.html
- Andre Weissmann portfolio backup URL: https://andre-weissmann-data-portfolio-ready.pplx.app/portfolio.html
- Maven Analytics Showcase (live gallery): https://mavenanalytics.io/project/13780
- Maven Analytics — "How to Build a Standout Analytics Portfolio Project": https://mavenanalytics.io/blog/how-to-build-a-standout-analytics-portfolio-project
- Maven Analytics — "What makes a great portfolio project?": http://help.mavenanalytics.io/en/articles/6792558-what-makes-a-great-portfolio-project
- Maven Analytics — Showcase moved notice: https://mavenanalytics.io/showcase
- Maven Portfolio Showdown Challenge: Winner Selection (judging criteria discussion): https://www.youtube.com/watch?v=QsdJJQ9OBCQ
- Maven Analytics — "Introducing the Maven Portfolio Showdown": https://mavenanalytics.io/blog/introducing-the-maven-portfolio-showdown
- Chris Dutton on a favorite Maven Showcase project (LA County Crime Mapping Tool): https://www.linkedin.com/posts/csdutton_one-of-my-favorite-maven-showcase-projects-activity-7186724149870960641-nZEB
- Wix — "How to make a data analyst portfolio": https://www.wix.com/blog/how-to-make-a-data-analyst-portfolio
- Example Carrd data analyst portfolio: https://dataworksbyj.carrd.co/
- GitHub portfolio guidance ("Portfolio data analyst GitHub: guide complet 2026"): https://www.mes-formations-data.fr/blog/2026/24-portfolio-data-analyst-github
- CCS Learning Academy — "Strategies for Creating a Compelling Data Analytics Portfolio" (90-second hiring manager attention span): https://bootcamp.ccslearningacademy.com/strategies-for-creating-a-compelling-data-analytics-portfolio/
