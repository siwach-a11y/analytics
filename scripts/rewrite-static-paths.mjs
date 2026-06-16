#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

function walkHtml(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walkHtml(full, files);
    else if (name.endsWith(".html")) files.push(full);
  }
  return files;
}

function pageBase(outDir, htmlFile) {
  const rel = path.relative(outDir, path.dirname(htmlFile));
  const depth = rel ? rel.split(path.sep).length : 0;
  return depth === 0 ? "./" : "../".repeat(depth);
}

function assetPrefixRoot(base) {
  return base === "./" ? "." : base.replace(/\/$/, "");
}

function toRelative(outDir, htmlFile, urlPath) {
  if (!urlPath.startsWith("/")) return urlPath;

  let target = urlPath.slice(1);
  if (target === "") {
    target = "index.html";
  } else if (target.endsWith("/")) {
    if (target.startsWith("_next/")) {
      target = target.slice(0, -1);
    } else {
      target = `${target}index.html`;
    }
  }

  const from = path.dirname(htmlFile);
  const to = path.join(outDir, target);
  let rel = path.relative(from, to).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function rewriteQuotedAbsolutePaths(outDir, htmlFile, html) {
  return html.replace(/"\/([^"]+)"/g, (match, p) => {
    if (p.startsWith("http")) return match;
    return `"${toRelative(outDir, htmlFile, `/${p}`)}"`;
  });
}

function rewriteHtml(outDir, htmlFile) {
  const base = pageBase(outDir, htmlFile);
  const prefixRoot = assetPrefixRoot(base);
  let html = readFileSync(htmlFile, "utf8");

  const inject = `<script>self.__webpack_public_path__=${JSON.stringify(`${base}_next/`)};</script>`;
  if (!html.includes("__webpack_public_path__")) {
    html = html.replace("<head>", `<head>${inject}`);
  }

  const escapedPrefix = prefixRoot.replace(/\\/g, "\\\\");
  html = html.replace(/\\"assetPrefix\\":\\"\\"/g, `\\"assetPrefix\\":\\"${escapedPrefix}\\"`);

  html = html.replace(/(href|src)="\/([^"]*)"/g, (_, attr, p) => {
    const url = `/${p}`;
    return `${attr}="${toRelative(outDir, htmlFile, url)}"`;
  });

  html = rewriteQuotedAbsolutePaths(outDir, htmlFile, html);
  html = html.replace(/\\"\/([^\\"]+)\\"/g, (match, p) => {
    if (p.startsWith("http")) return match;
    return `\\"${toRelative(outDir, htmlFile, `/${p}`)}\\"`;
  });

  writeFileSync(htmlFile, html);
}

function rewriteCss(outDir) {
  const cssDir = path.join(outDir, "_next/static/css");
  if (!existsSync(cssDir)) return;

  for (const file of readdirSync(cssDir).filter((f) => f.endsWith(".css"))) {
    const cssPath = path.join(cssDir, file);
    const css = readFileSync(cssPath, "utf8").replace(
      /url\(\/_next\/static\//g,
      "url(../"
    );
    writeFileSync(cssPath, css);
  }
}

function rewriteWebpack(outDir) {
  const chunksDir = path.join(outDir, "_next/static/chunks");
  if (!existsSync(chunksDir)) return;

  for (const file of readdirSync(chunksDir)) {
    if (!file.startsWith("webpack-") || !file.endsWith(".js")) continue;
    const chunkPath = path.join(chunksDir, file);
    const js = readFileSync(chunkPath, "utf8");
    if (!js.includes('.p="/_next/"')) continue;
    writeFileSync(chunkPath, js.replace('.p="/_next/"', '.p=""'));
  }
}

export function rewriteStaticPaths(outDir) {
  console.log("Rewriting static paths for offline / file:// viewing...");
  rewriteCss(outDir);
  rewriteWebpack(outDir);

  const skip = new Set([path.join(outDir, "summary.html")]);
  for (const htmlFile of walkHtml(outDir)) {
    if (skip.has(htmlFile)) continue;
    rewriteHtml(outDir, htmlFile);
  }
}
