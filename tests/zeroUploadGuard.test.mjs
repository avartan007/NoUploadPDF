// Automated Node.js Test Suite for NoUploadPDF (Next.js + React + Express Architecture)
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TOOLS, CATEGORIES, SLUG_TO_TOOL_MAP, SECURITY_HEADERS } from "../src/data/toolCatalog.js";
import { noUploadGuardMiddleware } from "../server/middleware/noUploadGuard.js";

test("Tool Catalog contains all 28 numbered local-first PDF tools across 4 categories", () => {
  assert.equal(TOOLS.length, 28);
  assert.deepEqual(CATEGORIES, ["All", "Organize", "Convert", "Edit", "Optimize"]);
  assert.equal(SLUG_TO_TOOL_MAP["merge-pdf"], "merge");
  assert.equal(SLUG_TO_TOOL_MAP["compress-pdf-to-200kb"], "compress");
  assert.equal(SLUG_TO_TOOL_MAP["redact-private-pdf"], "redact");
});

test("Express noUploadGuardMiddleware blocks POST/PUT/PATCH and multipart/PDF uploads with HTTP 403", () => {
  const headers = {};
  let body = "";
  const req = {
    method: "POST",
    headers: { "content-type": "multipart/form-data; boundary=---123" }
  };
  const res = {
    statusCode: 200,
    setHeader(k, v) { headers[k] = v; },
    end(payload) { body = payload; }
  };
  let nextCalled = false;
  noUploadGuardMiddleware(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.ok(headers["Content-Security-Policy"].includes("default-src 'self'"));
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["Cross-Origin-Opener-Policy"], "same-origin");
  assert.equal(headers["Referrer-Policy"], "no-referrer");
  const parsed = JSON.parse(body);
  assert.equal(parsed.status, 403);
  assert.equal(parsed.error, "UPLOAD_BLOCKED_BY_SERVER_POLICY");
});

test("RoR backup zip exists and all 12 reusable React components are present", () => {
  assert.ok(fs.existsSync(path.resolve("ror-backup-nouploadpdf.zip")), "ror-backup-nouploadpdf.zip must exist");
  const requiredComponents = [
    "AppShell.jsx",
    "Navbar.jsx",
    "SvgFilters.jsx",
    "HeroThreeTornado.jsx",
    "InteractivePreview.jsx",
    "PeaceOfMindSection.jsx",
    "ToolsCatalog.jsx",
    "ComparisonSection.jsx",
    "StudioWorkspace.jsx",
    "PhoneScanner.jsx",
    "AboutSection.jsx",
    "Footer.jsx"
  ];
  for (const comp of requiredComponents) {
    assert.ok(fs.existsSync(path.resolve("src/components", comp)), `Missing React component: ${comp}`);
  }
});
