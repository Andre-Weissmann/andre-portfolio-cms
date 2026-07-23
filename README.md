# andre-portfolio-cms

The admin CMS and live server for [andre-weissmann-portfolio.pplx.app](https://andre-weissmann-portfolio.pplx.app).

This repo is the **application layer** -- it reads content from [`andre-portfolio-content`](https://github.com/Andre-Weissmann/andre-portfolio-content) and serves the public portfolio site.

## What this repo contains

- `client/` -- React frontend (portfolio viewer, public-facing)
- `server/` -- Express backend with owner-only admin routes
- `shared/` -- Drizzle ORM schema shared between client and server

## Content lives separately

Project data, case studies, and datasets are version-controlled in [`andre-portfolio-content`](https://github.com/Andre-Weissmann/andre-portfolio-content). If you are looking for the actual portfolio projects (Nashville Housing, BMI/Risk Screening, Power BI Survey, etc.) that is where to go.

## Live site

[andre-weissmann-portfolio.pplx.app](https://andre-weissmann-portfolio.pplx.app)
