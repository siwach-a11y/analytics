#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rewriteStaticPaths } from "./rewrite-static-paths.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiPath = path.join(root, "app", "api");
const backupPath = path.join(root, ".build-api-backup");

function restoreApi() {
  if (!existsSync(backupPath)) return;
  if (existsSync(apiPath)) {
    rmSync(apiPath, { recursive: true, force: true });
  }
  renameSync(backupPath, apiPath);
}

function hideApi() {
  if (!existsSync(apiPath)) return;
  if (existsSync(backupPath)) {
    rmSync(backupPath, { recursive: true, force: true });
  }
  renameSync(apiPath, backupPath);
}

const isGithubPages = process.env.GITHUB_PAGES === "1";

console.log(
  isGithubPages
    ? "Building AgentHub for GitHub Pages...\n"
    : "Building AgentHub static HTML export...\n"
);

hideApi();

try {
  const nextDir = path.join(root, ".next");
  if (existsSync(nextDir)) {
    rmSync(nextDir, { recursive: true, force: true });
  }

  execSync("npm run build", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      BUILD_HTML: "1",
      GITHUB_PAGES: isGithubPages ? "1" : "",
      NEXT_PUBLIC_STATIC_DEMO: "true",
    },
  });

  if (!isGithubPages) {
    rewriteStaticPaths(path.join(root, "out"));
  }

  console.log("\n✓ Static site exported to out/");

  if (isGithubPages) {
    console.log("  GitHub Pages: https://siwach-a11y.github.io/agent-hub/");
  } else {
    const demoDir = path.join(root, "agenthub-demo");
    if (existsSync(demoDir)) {
      rmSync(demoDir, { recursive: true, force: true });
    }
    cpSync(path.join(root, "out"), demoDir, { recursive: true });

    const zipPath = path.join(root, "agenthub-demo.zip");
    if (existsSync(zipPath)) rmSync(zipPath);
    execSync(`cd "${demoDir}" && zip -r "${zipPath}" .`, { stdio: "inherit" });

    console.log("  Demo folder: agenthub-demo/");
    console.log("  Zip archive: agenthub-demo.zip");
    console.log("  Open: agenthub-demo/index.html (double-click works, or use OPEN-DEMO.command)");
    console.log("  Serve: npx serve agenthub-demo");
  }
} catch (error) {
  console.error("\n✗ Static HTML build failed.");
  process.exitCode = 1;
} finally {
  restoreApi();
}
