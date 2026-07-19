import express from 'express';
import type { Express } from 'express';
import fs from "node:fs";
import path from "node:path";

export function serveStatic(app: Express) {
  // In production the server runs as `node dist/index.cjs` from the project root.
  // __dirname in a bundled CJS file is "." (CWD), so we check both the CWD-relative
  // path AND the script-file-relative path to handle local dev and pplx.app alike.
  const candidates = [
    path.resolve(__dirname, "public"),          // local dev: ./public from project root
    path.resolve(process.cwd(), "dist", "public"), // pplx.app: dist/public relative to CWD
    path.resolve(process.cwd(), "public"),       // fallback
  ];
  const distPath = candidates.find(p => fs.existsSync(p)) || candidates[0];
  if (!fs.existsSync(distPath)) {
    console.error(`[static] Could not find build directory. Tried: ${candidates.join(", ")}`);
    // Don't throw — let the server boot; API routes still work.
    return;
  }

  // ETag support is on by default in Express.
  // HTML files: no-cache so browsers always revalidate.
  // Versioned assets (script.js?v=..., style.css?v=...): max-age=1 year.
  app.use((req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    const hasVersion = /[?&]v=/.test(req.url);
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (hasVersion && (ext === '.js' || ext === '.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (ext === '.js' || ext === '.css') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
    next();
  });

  // Root: serve the static portfolio (index.html IS portfolio.html)
  // No special route needed — express.static serves index.html for / automatically

  // Serve static assets (CSS, JS, images, etc.)
  app.use(express.static(distPath, { etag: true, lastModified: true }));

  // Explicit route for /resume — serves resume.html without requiring the .html extension
  app.get("/resume", (_req, res) => {
    res.sendFile(path.resolve(distPath, "resume.html"));
  });

  // Admin routes
  app.get(["/admin-login", "/admin-login/"], (_req, res) => {
    res.sendFile(path.resolve(distPath, "admin-login.html"));
  });

  app.get(["/admin", "/admin/"], (_req, res) => {
    res.sendFile(path.resolve(distPath, "admin.html"));
  });

  // Serve the React SPA (app.html) for all other unmatched paths
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "app.html"));
  });
}
