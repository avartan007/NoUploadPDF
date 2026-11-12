# Contributing to NoUploadPDF (`CONTRIBUTING.md`)

Thank you for helping build the most trusted local-first PDF studio on the web!

## Architecture Overview (Next.js + React + Node.js/Express)
NoUploadPDF is built with **Next.js, React, Node.js/Express, Three.js, GSAP, and WebGL2**, with **zero database** and **zero server-side file processing**:
- **Reusable React Components (`src/components/*.jsx`)**: Modular UI components (`Navbar.jsx`, `HeroThreeTornado.jsx`, `StudioWorkspace.jsx`, `PhoneScanner.jsx`, `ToolsCatalog.jsx`, `ComparisonSection.jsx`, `Footer.jsx`, etc.).
- **Next.js Routes (`src/pages/*.jsx`)**: Clean routing for `/`, `/studio`, `/tools`, `/tools/[slug]`, `/scanner`, `/compare`, and `/about`.
- **Client Engine (`src/engine/clientEngine.js`)**: Executes all 28 PDF tools (`pdf-lib`, `PDF.js`, `JSZip`, WebCrypto AES-256-GCM), the WebGL2 `InkBleedEngine` theme transition shader, the Three.js + GSAP 3D tornado & laptop hero, and the WebRTC P2P Phone Scanner 100% in browser memory.
- **Node.js + Express Server (`server/index.js` & `server/middleware/noUploadGuard.js`)**: Serves the app locally or in Docker while enforcing strict security headers (`CSP`, `COOP`, `Referrer-Policy`, `X-Content-Type-Options`) and rejecting any `POST`/`PUT`/`PATCH` file upload with `HTTP 403 Forbidden`.
- **Legacy Ruby on Rails Backup**: Archived in `ror-backup-nouploadpdf.zip` in the project root.

## Quick Start (Local Development)
1. **Node.js / Express + React Development Server**:
   ```bash
   npm run dev
   # Syncs React components and starts http://localhost:3000
   ```
2. **Sync Static Production Bundle (`public/`)**:
   ```bash
   npm run sync
   ```
3. **One-Click Docker Self-Host (Node 20 Alpine)**:
   ```bash
   docker compose up --build
   # Opens http://localhost:3000
   ```

## Running Automated Tests
- **Node.js Automated Test Suite (28 Tools + HTTP 403 Upload Guard + React Components)**:
  ```bash
  npm test
  ```
- **In-Browser Self-Test Suite**: Open the app and click **Run Quick Self-Test (10/10)** in the Smart Document Helpers bar.
- **Playwright E2E Suite**:
  ```bash
  npx playwright test
  ```

## Curated `good first issue` Starter Tasks
Looking for your first contribution? Grab any of these well-scoped issues:
1. **`[good first issue]` Add custom font selector (`Courier` / `Times Roman` / `Helvetica`) to Tool #20 (Watermark PDF)** in `src/engine/clientEngine.js`.
2. **`[good first issue]` Add custom regex rule builder to the Auto-Redact Assistant**: Let users define and save custom regex patterns in `localStorage` alongside the built-in detectors.
3. **`[good first issue]` Add custom page-size presets (`Legal`, `Tabloid`, `A3`, `Receipt`) to Tool #13 (Images to PDF)**.
4. **`[good first issue]` Add keyboard shortcuts (`⌘S` to download output, `⌘Backspace` to clear session)**.
5. **`[good first issue]` Add UI localization strings (i18n JSON dictionary) for Spanish, German, French, Hindi, and Japanese**.
