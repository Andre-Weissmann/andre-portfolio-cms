# Projects catalog and resume sync

## What this does

`public/projects-catalog.json` is the **single source of truth** for:

- Which projects are **featured** vs **all projects** on the portfolio
- Resume project titles, tools, order, and bullets
- Canonical portfolio base URL used on the resume

`public/projects-sync.js` loads that catalog on:

- `resume.html` — rebuilds the Data Analytics Projects section and **Copy as text**
- `portfolio.html` — builds the **All projects** card grid and moves full project blocks into Featured vs catalog lists

## When you add a data project

1. Add a published entry to `public/projects-catalog.json`:
   - `id`, `anchor` (`proj-…`), `exploreKey`, `tool`, `badgeClass`, `year`
   - `tier`: `"featured"` or `"catalog"`
   - `featuredOrder` / `resumeOrder`
   - `resumeTitle`, `resumeBullet`, `cardBlurb`, `portfolioTitle`
   - `status`: `"published"` (or `"draft"` to hide from resume + all-projects)
2. Add the interactive HTML block in `portfolio.html` with matching `id="proj-…"`.
3. Wire deep dive (`KEY_MAP` / `PROJECTS`) if needed.
4. Rebuild and publish the portfolio (same `site_id`).

Resume HTML updates automatically from the catalog. No separate resume project edit for bullets/order/links.

## Featured vs all projects (Option A)

- Homepage shows **every published project** as a full interactive block in one clean Selected work list (same on desktop and mobile).
- Hero **See My Projects** and nav **Projects** scroll to `#projects`.
- No jump-strip cards. `projects-catalog.json` still drives the resume; `tier` is for future 8+ project curation only.

## PDF / DOCX

Live recruiter path is `resume.html` (and Copy as text).  
`Andre_Weissmann_Resume.pdf` / `.docx` are static downloads. After major project changes, re-export PDF/DOCX from the HTML resume (print to PDF) or update those files manually so downloads match the live page.

## Canonical URL

Always use:

`https://andre-weissmann-data-portfolio-view.pplx.app`

Do not point resume links at older portfolio subdomains.
