# Contributing to NoUploadPDF (`CONTRIBUTING.md`)

Thank you for helping build the most trusted local-first PDF studio on the web!

## Quick Start (Local Development)
1. **Ruby on Rails 8 Server** (includes live `/scanner` Wi-Fi QR bridge):
   - Run `./bin/dev` and open `http://localhost:3000`.
2. **One-Click Docker Self-Host**:
   - Run `docker compose up --build` and open `http://localhost:3000`.
3. **Zero-Dependency Standalone Mode**:
   - Open `index.html` directly in any modern browser.

## Running Automated Tests
- **Ruby Minitest Suite**: `ruby -Ilib:test test/models/tool_catalog_test.rb`
- **In-Browser Unit Test Suite**: Open the app and click **Run Unit Tests (12/12)** in the Security & QA bar or run `window.runUnitTestSuite()` in the console.
- **Playwright E2E Suite**: `npx playwright test`

## Curated `good first issue` Starter Tasks
Looking for your first contribution? Grab any of these well-scoped issues:
1. **`[good first issue]` Add custom font selector (`Courier` / `Times Roman` / `Helvetica`) to Tool #20 (Watermark PDF)**: Allow selecting between `PDFLib.StandardFonts` in the Studio options panel.
2. **`[good first issue]` Add custom regex rule builder to the Auto-Redact Assistant**: Let users define and save custom regex patterns in `localStorage` alongside the built-in detectors.
3. **`[good first issue]` Add custom page-size presets (`Legal`, `Tabloid`, `A3`, `Receipt`) to Tool #13 (Images to PDF)**.
4. **`[good first issue]` Add keyboard shortcuts (`⌘S` to download output, `⌘Backspace` to shred session)**.
5. **`[good first issue]` Add UI localization strings (i18n JSON dictionary) for Spanish, Hindi, German, and French**.
