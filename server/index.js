#!/usr/bin/env node
// NoUploadPDF — Node.js + Express + Next.js/React Server
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { noUploadGuardMiddleware } from "./middleware/noUploadGuard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

export function createNoUploadPdfServer() {
  return http.createServer((req, res) => {
    noUploadGuardMiddleware(req, res, () => {
      const urlObj = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
      const pathname = decodeURIComponent(urlObj.pathname).replace(/\/+$/, "") || "/";

      let candidate = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        candidate = path.join(candidate, "index.html");
      } else if (!path.extname(candidate) && fs.existsSync(candidate + ".html")) {
        candidate = candidate + ".html";
      } else if (!fs.existsSync(candidate)) {
        candidate = path.join(PUBLIC_DIR, "index.html");
      }

      const ext = path.extname(candidate).toLowerCase();
      res.statusCode = 200;
      res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
      if (pathname === "/sw.js") {
        res.setHeader("Cache-Control", "no-cache");
      }
      fs.createReadStream(candidate).pipe(res);
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createNoUploadPdfServer();
  server.listen(PORT, () => {
    console.log(`[NoUploadPDF Next.js/React + Express Server] Listening on http://localhost:${PORT} (HTTP 403 Upload Guard Active)`);
  });
}
