#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log("Building Analytics Dashboard for GitHub Pages...\n");
execSync("npm run analytics:demo:pages", {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, GITHUB_PAGES: "1", NEXT_PUBLIC_STATIC_DEMO: "true" },
});

const outDir = path.join(root, "analytics-dashboard", "out");
if (!existsSync(outDir)) {
  console.error("✗ Build output not found at analytics-dashboard/out");
  process.exit(1);
}

const workDir = mkdtempSync(path.join(tmpdir(), "agenthub-pages-"));

try {
  cpSync(outDir, workDir, { recursive: true });
  writeFileSync(path.join(workDir, ".nojekyll"), "");

  execSync("git init", { cwd: workDir, stdio: "inherit" });
  execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', {
    cwd: workDir,
    stdio: "inherit",
  });
  execSync('git config user.name "github-actions[bot]"', { cwd: workDir, stdio: "inherit" });
  execSync("git add -A", { cwd: workDir, stdio: "inherit" });
  execSync('git commit -m "Deploy Analytics Dashboard to GitHub Pages"', {
    cwd: workDir,
    stdio: "inherit",
  });
  execSync("git branch -M gh-pages", { cwd: workDir, stdio: "inherit" });
  execSync("git push -f https://github.com/siwach-a11y/analytics.git gh-pages", {
    cwd: workDir,
    stdio: "inherit",
  });

  console.log("\n✓ Published to gh-pages branch");
  console.log("  https://siwach-a11y.github.io/analytics/");
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
