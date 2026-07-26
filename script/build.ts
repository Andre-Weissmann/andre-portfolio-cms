import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "@octokit/rest",
  "axios",
  "bcryptjs",
  "cors",
  "date-fns",
  "dotenv",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-github2",
  "passport-local",
  "resend",
  "@supabase/supabase-js",
  "@supabase/auth-js",
  "@supabase/functions-js",
  "@supabase/phoenix",
  "@supabase/postgrest-js",
  "@supabase/realtime-js",
  "@supabase/storage-js",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

// Static files/dirs from public/ that must be copied into dist/public/
// These are served as static assets and are NOT processed by Vite
const STATIC_ASSETS = [
  "vendor",
  "excel.js",
  "deep_dive_v2.js",
  "deep_dive_v2.css",
  "deep_dive_brief.js",
  "deep_dive_brief.css",
  "data_rail.js",
  "data_rail.css",
  "portfolio-style.css",
  "portfolio_os.js",
  "portfolio_os.css",
  "portfolio.html",
  "resume.html",
  "resume",
  "admin-login.html",
  "admin.html",
  "admin",
  "bike-dashboard.html",
  "bike-data.json",
  "excel-dashboard.html",
  "excel-board.html",
  "powerbi-dashboard.html",
  "powerbi-board.html",
  "tableau-dashboard.html",
  "tableau-board.html",
  "modals.js",
  "script.js",
  "projects-catalog.json",
  "projects-sync.js",
  "style.css",
  "style-tokens.js",
  "powerbi.js",
  "tableau.js",
  "images",
  "files",
  "Andre_Weissmann_Resume.docx",
  "Andre_Weissmann_Resume.pdf",
  "index.html",
];

async function copyPublicAssets() {
  console.log("copying static public assets...");
  const src = path.resolve("public");
  const dest = path.resolve("dist/public");
  await mkdir(dest, { recursive: true });

  for (const asset of STATIC_ASSETS) {
    const srcPath = path.join(src, asset);
    const destPath = path.join(dest, asset);
    if (existsSync(srcPath)) {
      await cp(srcPath, destPath, { recursive: true, force: true });
      console.log(`  copied: ${asset}`);
    } else {
      console.warn(`  skipped (not found): ${asset}`);
    }
  }
}

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  // Copy static public assets AFTER vite build (so vite doesn't touch them)
  await copyPublicAssets();
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
