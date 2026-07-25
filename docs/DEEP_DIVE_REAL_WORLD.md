# How Real-World Deep Dives, Case Studies, and Analyst Reports Actually Work (2023–2026)

**Purpose:** Ground Andre's portfolio deep-dive format in how consulting one-pagers, healthcare QI storyboards, product-analytics case studies, and hiring-manager review behavior actually work in industry — then translate that into a concrete upgrade plan for a portfolio that already has a KPI strip, key finding, thinking trail (assume/find/pivot/limit), dirty→clean morph, live SQL, impact cards, ask-this-project Q&A, and a full-stage modal.

**Bottom line up front:** Andre's current feature set (thinking trail, live SQL, dirty→clean, Q&A) is *already ahead* of what most industry sources describe as best practice — most guidance is still fighting to get candidates to include a decision narrative and a number at all. The real risk for this portfolio is not "not enough depth," it's (1) sequencing depth correctly for a 55-second-then-close reviewer, (2) forcing every deep dive into the same rigor as a healthcare QI storyboard even when the underlying project doesn't warrant it, and (3) making sure the interactive features *serve* the 3 review phases below rather than compete with them for the same 55 seconds.

---

## 1. Structure patterns used by top performers, by genre

### 1.1 Consulting one-pagers — Situation → Complication → Resolution (SCR) / Pyramid Principle
McKinside, BCG, and Bain-style one-pagers are built on the **SCR framework**: state the baseline facts with no opinion (Situation), name the specific, quantified, urgent problem (Complication), then give the specific recommendation with the delta it produces (Resolution) — always answer-first, evidence-second ([Deckary: Problem Solution Slide](https://deckary.com/blog/problem-solution-slide)). The governing meta-rule across consulting decks is Barbara Minto's Pyramid Principle: lead with the "governing thought" (the answer), then support it with grouped, MECE (mutually exclusive, collectively exhaustive) arguments — never build up to the conclusion at the end.

### 1.2 Healthcare QI storyboards — IHI standard structure
The Institute for Healthcare Improvement's official storyboard handbook — the de facto industry template judged at IHI Summits — specifies these required components, in order ([IHI Storyboard Handbook](https://forms.ihi.org/hubfs/2019_IHI_Summit_Storyboard_Handbook-v2.pdf)):

1. **Aim statement** — the expected change in an outcome indicator *and* the time frame for that change (≤15 words)
2. **Project design / strategy for change** — how the aim will be reached
3. **Description of the actual changes made**
4. **Graphical proof of improvement** — explicitly *statistical process control charts (run charts / Shewhart control charts) preferred; bar and pie charts should not be used* for QI storyboards
5. **Evidence that changes were tested/adapted locally before full rollout** (this is the PDSA — Plan/Do/Study/Act — cycle embedded implicitly)
6. **Multiple measures** used together to demonstrate improvement (not one metric)
7. **The multidisciplinary team** involved (names/roles — clinical, patient, leadership)
8. **Sustainability evidence** — did the improvement hold over time, not just at one point
9. **Short lessons-learned / takeaway message**

Length discipline is explicit and severe: description ≤50 words, aim ≤15 words, actions taken ≤50 words, results summary ≤50 words, fitting a physical 4×4-foot board. This is the single clearest real-world evidence that **elite technical work is judged by how ruthlessly it is compressed**, not by how much is shown.

### 1.3 Product-analytics / data-analyst case-study interviews — the 5-part deck
Industry interview-prep material (used to prepare candidates for take-home case studies at tech companies) converges on a specific deck shape, scored against seven evaluator dimensions ([Exponent: Data Analyst Case Study Interview](https://www.tryexponent.com/blog/data-analyst-case-study-interview)):

| Section | Slides | Purpose |
|---|---|---|
| Executive summary | 1 | Give the full picture upfront — answer first |
| Problem definition + assumptions | 1 | Prove correct scoping |
| Methodology | 1 | Brief, not exhaustive |
| Key findings | 3–5 | Most important insights, visual-led |
| Recommendations | 1–2 | Specific, data-backed, tied to the business goal |
| Operational plan | 1 (optional) | How to implement — "impressive if included" |
| Next steps | 1 | What you'd do with more time/data |
| Appendix | as needed | Everything else, for Q&A only |

The seven scored dimensions are: problem understanding, framework/approach, reasoning transparency, analytical rigor, insight quality, visualization/storytelling, and **communication that anticipates stakeholder questions**. Note that "anticipates questions" and "appendix for Q&A" map almost exactly onto an ask-this-project Q&A feature — this is validation that the feature type is correct, not a nice-to-have.

### 1.4 Universal narrative shape across all genres
A convergent "Hero → Challenge → Solution → Impact" shape recurs across interactive-portfolio guidance ([RESUGROW: Interactive Portfolio Design Guide](https://www.resugrow.com/blog/interactive-portfolio-design-guide)) and general case-study guidance ([InfluenceFlow: Guide to Portfolio Case Studies](https://influenceflow.io/resources/guide-to-portfolio-case-studies-showcase-your-work-land-more-opportunities-in-2026/)):

- **The Hook** — 2-sentence summary: what you built, your role, the result
- **The Challenge** — the real, quantified pain point/constraint (budget, timeline, data quality)
- **The Solution/Process** — how you actually got there, made interactive/collapsible so it doesn't block the story
- **The Business Impact** — metrics, before/after, ideally with a testimonial or stakeholder reaction

This is functionally the same shape as SCR (situation=hook/challenge, complication=constraint, resolution=solution+impact) and the same shape as the IHI aim→strategy→result arc. **All four genres — consulting, healthcare QI, tech case-study interviews, and portfolio guides — independently converge on "answer first, one quantified problem, visible method, quantified result, honest limitation."** This convergence is the strongest signal in the research: it is not a stylistic choice, it is the load-bearing structure of every credible deep dive regardless of industry.

---

## 2. What each audience actually looks for, and when they look

Hiring-manager review behavior has been studied directly (portfolio review timing research across design/product/analytics hiring, not healthcare-specific, but the review psychology transfers directly):

> Hiring managers take **55 seconds on average** to decide whether to invite a candidate to interview — that's total time split across clicking the link, scanning the landing page, and possibly opening one case study ([Awesomefolio: What Hiring Managers Look for in Your Portfolio](https://awesomefolio.com/blog/what-hiring-managers-look-for), citing Presentum research).

The 55 seconds breaks into four distinct phases, which map closely onto the task's 30s/2min/10min framing:

| Phase | Duration | What happens | What kills the review here |
|---|---|---|---|
| **Visual pass** | ~5s | Coherence, hierarchy, typographic control — a *professionalism* signal, not an aesthetics judgment | Sloppy visuals → reviewer assumes the analysis is equally sloppy |
| **Relevance check** | ~15–30s | Scans titles/thumbnails/one-line descriptions *without clicking* | First two projects not relevant to the role → tab closes |
| **Case-study deep-read** | 5–15 min | Only for shortlisted candidates; hunts for decision-making, business impact, and *the candidate's specific role* in the outcome — used to prep interview questions | Process shown as a checklist of activities instead of a decision narrative; unclear ownership on team projects |
| **About-page review** | variable | Happens *after* they already like the work; now evaluating the person, not the process | Generic "job description" bio instead of a real voice |

Applying this to Andre's three named audiences:

- **Recruiters (30s):** They are doing the "relevance check," not reading a deep dive at all. They need the KPI strip + one-line key finding + role-fit signal (healthcare-specific keyword) visible with zero clicks. If they must click into a deep dive to find relevance, the format has already failed its highest-traffic audience.
- **Hiring managers (2–10 min):** This is exactly the "case-study deep-read" phase. They want the decision narrative (thinking trail is precisely this), the specific "so what," and material to build interview questions from — this is where thinking-trail, impact cards, and Q&A earn their keep. Per the case-interview evaluation criteria, they are also implicitly scoring "communication and iteration readiness" — did you already answer the objection they were about to raise.
- **Curious visitors / technical peers (10+ min):** Only this group will actually run the live SQL, open the full-stage modal, or ask the Q&A bot follow-ups for its own sake. They reward genuine depth and will penalize anything that *feels* faked (canned "live" demos, decorative-only interactivity).

---

## 3. Common failure patterns in portfolio deep dives

Cross-referencing failure analysis from hiring-manager-side portfolio critique content ([Awesomefolio](https://awesomefolio.com/blog/what-hiring-managers-look-for); [YouTube — Why Your Portfolio Isn't Getting You Interviews](https://www.youtube.com/watch?v=IeFP9zhoZh8)) and case-study writing guides ([InfluenceFlow](https://influenceflow.io/resources/guide-to-portfolio-case-studies-showcase-your-work-land-more-opportunities-in-2026/)):

1. **"It's just a link" syndrome** — a Power BI embed, a GitHub repo, or a Tableau dashboard with zero narrative wrapper. The viewer sees charts/code with no context for what question was being answered or why it mattered ([YouTube — Why Your Portfolio Isn't Getting You Interviews](https://www.youtube.com/watch?v=IeFP9zhoZh8)).
2. **Process shown as a checklist, not a decision narrative.** "We did research, then wireframes, then testing" tells the reviewer you know the steps exist, not that you can think under ambiguity. This is explicitly called out as the single most common mistake in hiring-manager-side portfolio critiques.
3. **No measurable outcome, or an outcome that isn't tied to the method shown.** Charts without a "so what" number attached.
4. **Ambiguous ownership on team/derived work** — reads as inability to claim individual impact, which is disqualifying for individual-contributor analyst roles.
5. **Volume over depth.** Seven mediocre projects rank below two genuinely deep ones; breadth signals a junior candidate who "hasn't learned to curate" yet.
6. **Confidence mismatch between headline and evidence** — a card claims certainty ("the data proves") that the deep dive itself hedges (small sample, limitation noted). This is a credibility landmine in exactly the way a hiring manager is trained to probe.
7. **Broken links / dead demos** — an immediate, full-stop review-ender, and specifically read as "built and then abandoned," which is a disqualifying signal for any analytics role where ongoing data maintenance matters.
8. **Jargon in the wrong layer** — raw technical terms (NULL, PARSENAME, DAX) surfacing in headline/recruiter-facing copy instead of being reserved for the technical/appendix layer.
9. **Fake interactivity** — canned animations presented as "live" (a fake SQL runner, a scripted chatbot with only 3 hardcoded answers). Technical reviewers test these and the credibility cost of getting caught is disproportionate to the cost of just being honest about what's real.
10. **No anticipation of objections.** The strongest candidates, per case-study interview scoring criteria, "connect their metrics to strategic levers and call out areas for future work before the interviewer asks" — most portfolios never state a limitation unprompted.

---

## 4. Best practices for interactive deep dives on the web

- **Progressive disclosure is the load-bearing UX pattern.** Nielsen Norman Group's foundational guidance on information overload: the primary fix is "good interface design and good editorial preparation of the data, resulting in an ability for the user to rapidly skim and pick out exact pieces that interest them" — not less content, but content organized so 90% of it is skippable by design ([NN/g: Coping with Information Overload](https://www.nngroup.com/articles/coping-information-overload/)).
- **Design for F-pattern scanning.** Eye-tracking research shows web readers scan in an F-shape — heavy attention on the first two lines and the left edge, rapidly declining attention below and to the right. This is explicitly a *negative* pattern for both users and the business publishing the content, but *good design can prevent it* by using strong front-loaded subheads, short paragraphs, and left-aligned scannable structure instead of dense prose blocks ([NN/g: F-Shaped Pattern of Reading on the Web](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)).
- **Concise + scannable + objective writing measurably outperforms.** NN/g's controlled study found web usability scored **58% higher when concise, 47% higher when scannable, 27% higher when written objectively** instead of promotionally — and **124% higher when all three were combined** ([NN/g: Concise, Scannable, and Objective](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/)). This is a direct, quantified argument against marketing-voice headlines on data work.
- **Scrollytelling should sync narrative and visual state, not just decorate scroll position.** The "tile narrative" pattern used in data-journalism interactives links each narrative beat to a specific visual state via scroll-triggered transitions — the visual changes *because* the story reached that beat, not on an arbitrary timer ([Nightingale: Tile Narrative Scrollytelling](https://medium.com/nightingale/tile-narrative-scrollytelling-with-grid-maps-ecbf991ed2c0)).
- **Interactive/exploratory visuals earn more genuine engagement than static ones, even when "harder."** Research on visualization-as-narrative found that visualizations inviting reader participation (decoding, exploring) are often *more* appealing to broad audiences than simplified, purely legible ones — active participation is itself part of the payoff ([Gelman & DeWitt, Columbia: Data Visualization as Narrative](https://sites.stat.columbia.edu/gelman/research/published/gelman_frieze_3.pdf)).
- **Micro-interactions should gate depth, not add noise:** collapsible deep-dive sections, before/after sliders, and live embedded tools are explicitly recommended as ways to keep an initial view clean while letting an engaged visitor go deeper on demand ([RESUGROW: Interactive Portfolio Design Guide](https://www.resugrow.com/blog/interactive-portfolio-design-guide)).
- **Conversational Q&A interfaces measurably change engagement shape.** One founder who replaced a static PDF resume with an AI chatbot reported visitors asking **3–4 questions on average**, versus roughly **6 seconds** average dwell time on the PDF version — the same content, radically different engagement when the interface invites a question instead of demanding a read ([Reddit r/SideProject — "I turned my CV into an AI chatbot"](https://www.reddit.com/r/SideProject/comments/1obqdsf/i_turned_my_cv_into_an_ai_chatbot_is_this_the/)). This directly validates the ask-this-project pattern Andre already has — the format is right; the risk is scripted/shallow answers undermining the trust it's designed to build.

---

## 5. How much depth is "enough" vs. overwhelm

The pattern across every source, regardless of genre, is **tiered depth with brutal top-layer compression**, not "more is better" or "less is better" — depth is fine as long as it's opt-in:

- IHI storyboards — the most information-dense, highest-stakes genre studied here — cap the *headline* layer at 15–50 words per field even though the underlying project may represent months of clinical work. Depth lives in the full storyboard/poster, not the aim statement.
- Case-interview decks give **3–5 slides total** to "key findings" — the analytical heart of the work — while reserving unlimited depth for an appendix that's *only opened if asked*.
- Hiring-manager behavior confirms the same tiering empirically: 55 seconds total for 90%+ of reviewers, 5–15 minutes for the shortlisted minority, and unbounded time only for the sub-segment doing final-decision diligence.
- NN/g's information-overload guidance frames the fix as *skim-and-pick* affordance, not content reduction — the volume of underlying information is not the problem; undifferentiated presentation of it is.

**Working rule for calibrating any given deep dive:** every section should have an explicit "read time" tier —
- **Tier 0 (0–10s, no click):** headline + 1 number + relevance keyword
- **Tier 1 (30s–2min):** KPI strip + key finding + one visual — must be fully legible with zero scrolling into detail
- **Tier 2 (2–10min):** thinking trail, impact cards, before/after — the hiring-manager deep-read layer
- **Tier 3 (10min+, opt-in only):** live SQL, full-stage modal, Q&A bot, appendix-grade detail

Overwhelm happens specifically when Tier 3 material leaks into Tier 0/1 — e.g., jargon on a homepage card, or a thinking-trail step that must be read to understand the KPI strip above it. Depth itself was not flagged as a problem anywhere in the research; **un-tiered depth** was, repeatedly.

---

## 6. Recommended "gold path" structure for Andre's deep dives

Ordered sections, each tagged with its depth tier and the audience it primarily serves. This assumes the existing feature inventory (KPI strip, key finding, thinking trail, dirty→clean morph, live SQL, impact cards, ask-this-project Q&A, full-stage modal) and re-sequences/re-scopes rather than adding net-new mechanisms.

1. **Headline + role-fit tag** *(Tier 0, recruiter)* — one sentence, business-outcome language only, plus an explicit healthcare-relevance bridge line even on non-healthcare datasets (the audit already flagged this gap on 4 of 5 existing projects). No jargon, no method detail.
2. **KPI strip** *(Tier 0–1, recruiter → hiring manager)* — 3–4 numbers max, each with a one-word unit label a non-technical reader parses instantly (records, $, %, days) — not raw column counts.
3. **Key finding, one sentence, plain English** *(Tier 1, all audiences)* — this is the SCR "Resolution" stated before any "Situation/Complication" detail — answer-first, exactly matching Pyramid Principle and case-interview "executive summary" conventions.
4. **The Challenge / Complication** *(Tier 1)* — the specific, quantified problem *before* your involvement (what was broken, how much it cost/blocked, what constraint existed) — currently under-emphasized; most of Andre's dives jump from finding to method without stating the "why should anyone care" pain point explicitly.
5. **Thinking trail: assume → find → pivot → limit** *(Tier 2, hiring manager)* — keep as-is; this is structurally identical to what case-interview evaluators score as "framework/approach" + "logical reasoning and assumptions," and it's rare enough in real portfolios to be a genuine differentiator. Keep the "limit" step unskippable — it is the single highest-trust-building element per the research (limitations stated unprompted = top-scored behavior in case-interview rubrics).
6. **Dirty → clean morph** *(Tier 2, hiring manager / technical)* — sequence this *after* the thinking trail, not before, so the visual payoff lands once the viewer already understands *why* the cleaning mattered, not just *that* it happened.
7. **Impact cards** *(Tier 1–2, hiring manager)* — reframe each to explicitly name a stakeholder ("what a care coordinator does differently," "what a claims analyst does differently") — this maps to the "specific role/decision" scoring dimension that hiring managers explicitly hunt for during the deep-read phase.
8. **Live SQL / full-stage modal** *(Tier 3, curious/technical, opt-in)* — correctly gated behind a click already; keep it that way. Do not surface any SQL syntax in Tiers 0–1.
9. **Ask-this-project Q&A** *(Tier 3, opt-in, all audiences but disproportionately valuable to hiring managers prepping interview questions)* — position it as the appendix-equivalent: explicitly invite the objections case-interview rubrics say get asked ("why this method," "what would change your conclusion," "what's the limitation"). Pre-load 2–3 suggested questions so a time-pressed hiring manager doesn't have to invent a prompt.
10. **Next steps / what I'd do with more time or data** *(Tier 2–3)* — currently missing as an explicit section per the audit; this is a scored dimension in every case-interview rubric reviewed and costs almost nothing to add since the thinking trail already generates this material as a byproduct.

---

## 7. Top 10 upgrades ranked by impact for healthcare-analytics hiring

Ranked by (hiring-signal impact) × (alignment with the 55-second review reality), highest first.

1. **Add an explicit healthcare-relevance bridge line to every non-healthcare project's Tier 0 headline.** The audit found this missing on 4 of 5 projects. Per the review-phase research, the "relevance check" (15–30s) is the single highest-leverage moment in the entire funnel — if a healthcare recruiter doesn't see healthcare relevance in that window, the deep dive itself never gets opened, no matter how good it is.
2. **State the Challenge/Complication explicitly and quantified, before the method, in every deep dive.** Right now several dives lead with method (cleaning technique) before pain point. This is the one structural element universal across SCR, IHI aim statements, and case-interview execs summaries that's currently the weakest link in Andre's format.
3. **Add a "Next steps / with more data" closing line to every deep dive.** Directly matches a scored evaluator dimension ("communication and iteration readiness") and is nearly free to produce from existing thinking-trail material.
4. **Fix confidence-mismatch headlines (e.g., Bike Sales "proves") to match the hedged certainty already stated inside the deep dive.** This is exactly the kind of inconsistency a healthcare hiring manager — where overclaiming on small samples has real clinical/compliance consequences — is trained to probe, and it is a one-line fix.
5. **Pre-load 2–3 suggested "ask this project" questions per deep dive, chosen to match known case-interview objection categories** (methodology choice, assumption sensitivity, limitation, alternative interpretation). This converts the Q&A feature from a novelty into a direct simulation of the actual interview-prep behavior hiring managers already do during their 5–15 minute deep-read.
6. **Move all raw technical jargon (NULL, PARSENAME, DAX) out of Tier 0/1 copy and reserve it for Tier 2/3.** Confirmed leak on the homepage cards per the existing audit; directly contradicts the NN/g-validated "concise, scannable, objective" writing pattern that measurably improves usability.
7. **Cut project-card copy to ~40–50 words, business-outcome-first**, consistent with F-pattern scanning research (heavy top-left attention, steep falloff) — currently 76–105 words per card per the existing audit, well past the point where a 15–30s relevance scan will complete a read.
8. **Sequence the dirty→clean morph after the thinking trail, not before**, so the "why" (assumption/pivot) precedes the "what changed" (visual payoff) — small resequencing, meaningfully better narrative logic.
9. **Add one multi-measure or "sustained over time" framing to at least one deep dive**, mirroring the IHI requirement that improvement be shown via multiple measures and evidence of durability, not a single point-in-time statistic — this is a distinctly *healthcare-native* rigor signal most generalist analyst portfolios never include, and would be a genuine differentiator for QI-adjacent roles.
10. **Purge the 59 stale/duplicate backup files (~4.6MB) from the public directory.** Not narrative, but directly relevant: broken/stray artifacts are explicitly named as a "built and abandoned" trust-killer, and any technical reviewer who inspects page source (a realistic behavior for analytics-hiring technical screens) will see this immediately.

---

## 8. What to stop doing

- **Stop letting card headlines claim more certainty than the deep dive itself documents.** ("The data proves" when the deep dive says "the pattern held on a small sample.") This is the single most credibility-damaging pattern found in the research, because it's exactly what a rigorous interviewer is trained to catch.
- **Stop opening with method before pain point.** Cleaning techniques, join logic, and tool names are Tier 2/3 material; leading with them wastes the 15–30s relevance-check window that recruiters actually operate in.
- **Stop presenting process as a checklist of activities.** "I cleaned the data, built a dashboard, found an insight" reads as task completion, not decision-making — the thinking trail already avoids this; don't let any new content regress toward it.
- **Stop treating all 5+ projects as equally deep.** Depth should concentrate on 2–3 flagship dives; per portfolio-review research, breadth-without-depth signals junior-level curation, and hiring managers only deep-read one or two projects anyway.
- **Stop shipping fake or scripted-only interactivity.** If live SQL or the Q&A bot ever can't actually answer a genuine question, that gap is worse for credibility than not having the feature at all — every "real vs. fake" test a technical visitor runs is a trust check, not a curiosity check.
- **Stop leaving raw technical jargon in recruiter-facing copy layers.** NULL, PARSENAME, DAX, and similar terms belong in Tier 2/3 only.
- **Stop letting stale build artifacts (backup files, dead admin routes) sit in the publicly served directory.** They cost nothing to the visible experience but are a real liability the moment anyone looks at page source or the network tab.
- **Stop varying layout/interaction patterns dive-to-dive without a stabilization pass.** The existing audit found four near-simultaneous branches touching overlapping layout logic in the same hour — that instability risk compounds with every new interactive feature added on top of the current set; consolidate before adding more surface area.

---

## Sources

- [IHI Summit Storyboard Handbook (2019)](https://forms.ihi.org/hubfs/2019_IHI_Summit_Storyboard_Handbook-v2.pdf) — official healthcare QI storyboard structure, PDSA-adjacent testing requirement, SPC chart mandate, length limits
- [Deckary — Problem Solution Slide: 4 Formats That Drive Buy-In](https://deckary.com/blog/problem-solution-slide) — McKinsey/BCG Situation-Complication-Resolution framework
- [Exponent — Data Analyst Case Study Interview (2026 Guide)](https://www.tryexponent.com/blog/data-analyst-case-study-interview) — 7-dimension evaluator rubric, presentation deck structure, objection-anticipation guidance
- [Awesomefolio — What Hiring Managers Look for in Your Portfolio (2026 Guide)](https://awesomefolio.com/blog/what-hiring-managers-look-for) — 55-second review research (citing Presentum), 4-phase review timeline, callback vs. silence factors
- [InfluenceFlow — Guide to Portfolio Case Studies](https://influenceflow.io/resources/guide-to-portfolio-case-studies-showcase-your-work-land-more-opportunities-in-2026/) — Problem→Process→Results case-study formula, quantified-constraint guidance
- [RESUGROW — The Step-by-Step Guide to Designing an Interactive Portfolio](https://www.resugrow.com/blog/interactive-portfolio-design-guide) — Hero/Challenge/Solution/Impact structure, curation guidance, micro-interaction patterns
- [YouTube — Why Your Portfolio Isn't Getting You Interviews (And How to Fix It)](https://www.youtube.com/watch?v=IeFP9zhoZh8) — "it's just a link" failure mode, process-as-checklist failure mode
- [YouTube — Build These 5 Projects to Land a Healthcare Data Analyst Job](https://www.youtube.com/watch?v=L5gccAsU7Bc) — question/insight/so-what framing for healthcare-specific portfolio projects
- [Nielsen Norman Group — Coping with Information Overload](https://www.nngroup.com/articles/coping-information-overload/) — skim-and-pick affordance as the primary fix for information density
- [Nielsen Norman Group — F-Shaped Pattern of Reading on the Web](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/) — eye-tracking scanning behavior, negative for both users and business, preventable by design
- [Nielsen Norman Group — Concise, Scannable, and Objective: How to Write for the Web](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/) — quantified 124% usability gain from concise+scannable+objective writing
- [Nightingale (Medium) — Tile Narrative: Scrollytelling with Grid Maps](https://medium.com/nightingale/tile-narrative-scrollytelling-with-grid-maps-ecbf991ed2c0) — scroll-synced narrative/visual state pattern
- [Gelman & DeWitt (Columbia) — Data Visualization as Narrative](https://sites.stat.columbia.edu/gelman/research/published/gelman_frieze_3.pdf) — interactive/participatory visualization engagement research
- [Reddit r/SideProject — "I turned my CV into an AI chatbot"](https://www.reddit.com/r/SideProject/comments/1obqdsf/i_turned_my_cv_into_an_ai_chatbot_is_this_the/) — engagement comparison (3–4 questions asked vs. ~6s PDF dwell time), direct validation of ask-this-project Q&A pattern
- Internal reference: `/home/user/workspace/portfolio-quote/PORTFOLIO_FULL_AUDIT.md` — existing audit of Andre's live portfolio, used to ground upgrade recommendations in the portfolio's actual current state
