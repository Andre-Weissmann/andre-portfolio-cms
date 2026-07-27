**Current canonical (2026-07-27):** https://andre-weissmann-data-portfolio.pplx.app
- site_id: `3c5a557f-f631-44fd-a744-fb22ac0a8309`

# Subdomains, version history, and how to revert

## Can you always revert?

**Yes.**

| Layer | How to undo |
|---|---|
| GitHub code | `git revert` the merge commit, or restore files from an older commit / PR |
| This feature specifically | PR that added SQL scorecard/dashboard; revert that PR on `main` |
| Live site | Rebuild + `publish_website` with the **same** `site_id` after revert |
| Preview only | Ignore preview; live URL stays until you publish again |

Nothing is permanent. You never lose the ability to go back if `main` history is kept (it is).

## Canonical live URL (share only this)

**https://andre-weissmann-data-portfolio-view.pplx.app**

- `site_id`: `ab0b1635-2827-479f-99fb-b7dc0ad40324` (confirm in latest publish output)
- Strategy: **always update this site_id** — do not mint a new subdomain

## Known pplx.app portfolio subdomains (session history)

Agents **cannot delete** `*.pplx.app` subdomains. You unpublish from the app preview **Unpublish** control. Old names can linger as stale/private shells.

Approximate creation order from this Computer session (newest last among churn). Exact wall-clock create timestamps are not exposed as a public API to the agent; dates below are **session-known publish moments**, not a full Perplexity billing ledger.

| # | Subdomain | site_id (if known) | Role | Notes |
|---|---|---|---|---|
| 1 | `andre-weissmann-portfolio.pplx.app` | `d1cb996a-8426-4c11-b108-e49a4c0f9818` | Oldest | Do not share |
| 2 | `andre-weissmann-data-portfolio.pplx.app` | `939fe94c-5f61-4e36-8338-fed5d6f32b55` | Early | Do not share |
| 3 | `andre-weissmann-my-data-portfolio.pplx.app` | `3c169884-8016-4935-9cd1-77f96eeac84f` | Intermediate | Do not share |
| 4 | `andre-weissmann-data-portfolio-updated.pplx.app` | `1a5b13c4-6972-4dd2-807c-69fa18c1f60b` | Intermediate | Do not share |
| 5 | `andre-weissmann-data-portfolio-full.pplx.app` | `e61ac94e-94be-4abd-bc19-a7351ced2704` | Prior canonical | May go private |
| 6 | `andre-weissmann-data-portfolio-live.pplx.app` | `780c103c-bc01-4dae-952a-74571a427dd8` | Prior canonical | May go private |
| 7 | `andre-weissmann-data-portfolio-ready.pplx.app` | `40286310-f235-4d6f-a3b4-178a7a250648` | Prior public | Superseded |
| 8 | `andre-weissmann-data-portfolio-show.pplx.app` | `a9fc07d7-78d5-4317-80e2-f5521df22cc7` | Prior public | Superseded |
| 9 | `andre-weissmann-data-portfolio-view.pplx.app` | `ab0b1635-2827-479f-99fb-b7dc0ad40324` | **Current canonical** | Share this |

### How you can clean up (owner actions)

1. Open each old app card in Perplexity Computer (from past threads / assets).
2. Use **Unpublish** if shown — that is the supported take-down.
3. Set **Visibility** on the canonical asset to **Public**.
4. Do **not** ask the agent to “replace with blank page” as fake delete.
5. Update GitHub `homepage` only on the canonical URL.

Agents cannot list a full multi-year create-date ledger for every subdomain beyond what session publishes recorded.

## GitHub: six repositories — leave or restructure?

| Repo | Purpose |
|---|---|
| `dataglow` | Product (separate) |
| `andre-portfolio-cms` | Website code |
| `andre-portfolio-content` | Content + xlsx/pbix |
| `sql-data-projects` | SQL scripts |
| `python-data-projects` | Python scripts |
| `Andre-Weissmann` | Profile README |

### Recommendation: **leave the six alone for now**

**Why this split is already smart**
- DataGlow stays isolated → portfolio edits won’t break the product CI/app.
- `cms` vs `content` lets content update without redeploying all server code (when wired that way).
- SQL/Python script repos are clean portfolio evidence for recruiters who open GitHub.
- Profile README is the map.

**When restructuring would hurt**
- Moving/renaming while DataGlow or portfolio CI still pins old paths/URLs.
- Monorepo merges without updating homepage links, clone URLs on the live site, and any Actions.
- Force-pushing `main` history on public portfolio repos (breaks clone links people already have).

**Light cleanup (safe, no monorepo)**
1. Pin **one** portfolio URL in every repo homepage + profile README.
2. Add a short “Portfolio system” section in `Andre-Weissmann` README linking the five others.
3. Archive only if a repo is truly dead (none of these six are).
4. Optional later: `portfolio` GitHub org or topic tags — cosmetic.

**Who can handle it:** you + Computer + agents can maintain this layout indefinitely. A big monorepo is optional polish, not required for hiring or DataGlow safety.
