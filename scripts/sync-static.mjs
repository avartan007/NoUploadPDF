#!/usr/bin/env node
// Node.js Static Bundle Generator for Next.js + React Components
// Compiles src/styles/globals.css, src/components/*.jsx, and src/engine/clientEngine.js
// into public/index.html, index.html, public/styles.css, and all 67 route & tool subpages.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CSS_SRC = path.join(ROOT, "src/styles/globals.css");
const ENGINE_SRC = path.join(ROOT, "src/engine/clientEngine.js");
const PUBLIC_HTML = path.join(ROOT, "public/index.html");
const ROOT_HTML = path.join(ROOT, "index.html");
const PUBLIC_CSS = path.join(ROOT, "public/styles.css");

function extractComponentHtml(componentFile) {
  const src = fs.readFileSync(path.join(ROOT, "src/components", componentFile), "utf8");
  const match = src.match(/export const \w+_HTML = ("[\s\S]*?");\n/);
  if (!match) throw new Error(`Could not extract HTML constant from ${componentFile}`);
  return JSON.parse(match[1]);
}

function extractRawEngineScript() {
  const src = fs.readFileSync(ENGINE_SRC, "utf8");
  const startMarker = "window.__NOUPLOADPDF_ENGINE_BOOTED__ = true;\n\n";
  const endMarker = "\n\n  // Trigger DOMContentLoaded handlers immediately";
  const s = src.indexOf(startMarker);
  const e = src.lastIndexOf(endMarker);
  if (s === -1 || e === -1) throw new Error("Could not extract raw engine script from src/engine/clientEngine.js");
  return src.slice(s + startMarker.length, e);
}

// 1. Sync CSS
const cssContent = fs.readFileSync(CSS_SRC, "utf8");
fs.writeFileSync(PUBLIC_CSS, cssContent, "utf8");
console.log(`wrote public/styles.css (${Buffer.byteLength(cssContent)} bytes)`);

// 2. Assemble HTML body from modular React components + client engine
const assembledBodyAndScript = [
  "<!-- Ink-Bleed Theme Changer WebGL2 Canvas Overlay -->",
  extractComponentHtml("Navbar.jsx"),
  extractComponentHtml("SvgFilters.jsx"),
  "<!-- VIEW 1: LAPTOP SCREEN FIRST -> TORNADO FORMS -> LAPTOP ZOOMS OUT BEHIND TEXT -> INK-BLEED TEXT REVEAL -->",
  '<main id="view-home" style="flex:1;">',
  extractComponentHtml("HeroThreeTornado.jsx"),
  extractComponentHtml("InteractivePreview.jsx"),
  extractComponentHtml("PeaceOfMindSection.jsx"),
  extractComponentHtml("ToolsCatalog.jsx"),
  extractComponentHtml("ComparisonSection.jsx"),
  "</main>",
  extractComponentHtml("StudioWorkspace.jsx"),
  extractComponentHtml("PhoneScanner.jsx"),
  extractComponentHtml("AboutSection.jsx"),
  extractComponentHtml("Footer.jsx"),
  `<script>${extractRawEngineScript()}</script>`
].join("\n\n");

let html = fs.readFileSync(PUBLIC_HTML, "utf8");
const HEADER_MARKER = "<!-- Ink-Bleed Theme Changer WebGL2 Canvas Overlay -->";
const oldStart = html.indexOf(HEADER_MARKER);
const oldFinish = html.lastIndexOf("</script>") + "</script>".length;
if (oldStart === -1 || oldFinish < oldStart) {
  throw new Error("Could not locate body markers in public/index.html");
}

html = html.slice(0, oldStart) + assembledBodyAndScript + html.slice(oldFinish);

fs.writeFileSync(PUBLIC_HTML, html, "utf8");
fs.writeFileSync(ROOT_HTML, html, "utf8");
console.log(`wrote public/index.html and index.html (${Buffer.byteLength(html)} bytes)`);

// 3. Sync top-level route directories and all tool subpages
const routeDirs = [
  "public/tools",
  "public/compare",
  "public/studio",
  "public/scanner",
  "public/about",
  "public/compress-pdf-to-200kb",
  "public/merge-pdf-for-visa",
  "public/redact-private-pdf"
];

for (const rel of routeDirs) {
  const dirPath = path.join(ROOT, rel);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, "index.html"), html, "utf8");
}

const toolsRoot = path.join(ROOT, "public/tools");
let subpageCount = 0;
if (fs.existsSync(toolsRoot)) {
  for (const entry of fs.readdirSync(toolsRoot, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const subHtmlPath = path.join(toolsRoot, entry.name, "index.html");
      fs.writeFileSync(subHtmlPath, html, "utf8");
      subpageCount++;
    }
  }
}

console.log(`synced ${routeDirs.length} route directories and ${subpageCount} tool subpages from React components`);
