# Portfolio URLs — what they are and which one to use

## Canonical (use this everywhere)

**https://andre-weissmann-data-portfolio-show.pplx.app**

- `site_id`: `a9fc07d7-78d5-4317-80e2-f5521df22cc7`
- asset: `f4e9ff78-2d76-43ea-8fa4-5148552a9bd4`
- Visibility should stay **Public**
- Share / visibility UI: open the app asset → Publish → Visibility

All GitHub repo `homepage` fields and profile links should point here only.

## Older subdomains (do not share)

These are leftover publishes from earlier sessions. They may still load HTML but can be **stale** (old CSS/JS cache versions) or flip **Private** after an update.

| URL | Notes |
|-----|--------|
| https://andre-weissmann-portfolio.pplx.app | Oldest build |
| https://andre-weissmann-data-portfolio.pplx.app | Intermediate |
| https://andre-weissmann-my-data-portfolio.pplx.app | Intermediate |
| https://andre-weissmann-data-portfolio-updated.pplx.app | Intermediate |
| https://andre-weissmann-data-portfolio-full.pplx.app | Prior canonical; may go private after updates |
| https://andre-weissmann-data-portfolio-live.pplx.app | Prior canonical; may go private after updates |

You cannot delete old `*.pplx.app` subdomains from the agent. Ignore them. Prefer unpublish in the preview UI if Perplexity shows an Unpublish control.

## Why new subdomains kept appearing

Perplexity Computer hosts each publish on a `*.pplx.app` subdomain tied to a **site_id** and an **app asset**.

1. **Fresh publish** (no `site_id`) mints a **new** subdomain. That is what created `…-updated`, `…-full`, etc.
2. **Update publish** (same `site_id`) is supposed to keep the same URL. In practice, visibility can fall back to **Private** after some updates because the published URL follows the app asset **Share** settings.
3. When a URL went private, the workflow minting a **new** public subdomain fixed access quickly but left a trail of old names.

This is **not** a bug in your GitHub repo. It is how pplx.app publish + Share settings behave today.

## Stable workflow going forward

1. Edit code in `andre-portfolio-cms` → PR → merge to `main`.
2. Build: `npm ci && npm run build`
3. `deploy_website` on `dist/public`
4. `publish_website` with the **same** `site_id` (`e61ac94e-…`) — do **not** omit `site_id` unless the site was unpublished.
5. After publish, `curl` the canonical URL. If it is not public, open the asset **Visibility** settings and set **Public** (do not invent another subdomain).
6. Update GitHub `homepage` only if the canonical URL truly changes.

## What you can do as the owner

- Bookmark **one** Public URL and share only that.
- After any publish, check Publish → Visibility is Public.
- Leave old subdomains alone; do not put them on LinkedIn or GitHub.
- Optional: custom domain later (outside pplx.app) when you want a permanent brand URL independent of publish churn.
