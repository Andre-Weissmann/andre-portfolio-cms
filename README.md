# andre-portfolio-cms

Application code for my public data analytics portfolio.

**Live site:** [andre-weissmann-my-data-portfolio.pplx.app](https://andre-weissmann-my-data-portfolio.pplx.app)

**Content (JSON + dashboard files) lives separately:**
[andre-portfolio-content](https://github.com/Andre-Weissmann/andre-portfolio-content)

## What this repo is

The website + API that:

- Serves the public portfolio pages (`public/portfolio.html` and related assets)
- Loads project/about content from the content repo (GitHub raw / API)
- Exposes owner-only admin routes for content updates when credentials are configured
- Includes an Express backend and a Vite/React client for admin/app surfaces

## What's inside

| Path | Role |
|---|---|
| `public/` | Public portfolio site (HTML/CSS/JS), the main visitor-facing experience |
| `server/` | Express API (projects, about, contact, optional chat, admin auth) |
| `client/` | Vite/React frontend surfaces |
| `shared/` | Shared schema/types (Drizzle) |
| `script/build.ts` | Production build that bundles server + static assets into `dist/` |

## What this repo is not

- Not where project narratives or dashboard source files are stored (see `andre-portfolio-content`)
- Not DataGlow (that is a separate product: [dataglow](https://github.com/Andre-Weissmann/dataglow))

## Local run (high level)

```bash
npm ci
npm run dev     # development
npm run build   # production bundle -> dist/
NODE_ENV=production node dist/index.cjs
```

Admin login only works when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in the environment. Contact email notify needs `RESEND_API_KEY`. Optional AI chat needs `PERPLEXITY_API_KEY`.

## Related

- Content layer: [andre-portfolio-content](https://github.com/Andre-Weissmann/andre-portfolio-content)
- SQL scripts: [sql-data-projects](https://github.com/Andre-Weissmann/sql-data-projects)
- Python scripts: [python-data-projects](https://github.com/Andre-Weissmann/python-data-projects)
- Flagship product: [dataglow](https://github.com/Andre-Weissmann/dataglow)

## Author

**Andre Weissmann** · Chicago · Data analyst
