# Privacy & Local-First Architecture Policy

## Overview

**NoUploadPDF** runs all 28 PDF tools locally inside the browser using WebAssembly (`pdf-lib`, `PDF.js`, `Tesseract.js`) and HTML5 Canvas.

- **Zero Cloud Storage**: Files are processed in local RAM (`ArrayBuffer` and `Blob` objects) and never uploaded to external servers.
- **Offline PWA Support**: Once loaded, the application and its 28 tools work offline via `manifest.json` and `sw.js`.
- **Verifiable Audit Trail**: Users can export a session summary (`nouploadpdf-privacy-audit-report.json`) confirming zero external file transfers.

## Supported Releases

| Version | Status |
| ------- | ------ |
| 2.0.x (Rails 8 + Static PWA) | Active |
| 1.x | Legacy |

## Contact & Maintainer

Maintained by [@avartan007](https://github.com/avartan007/NoUploadPDF). Please open an issue on GitHub for questions or architecture improvements.
