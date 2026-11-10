# Privacy Guarantee — 0 Bytes Uploaded

**NoUploadPDF** is architected on Ruby on Rails 8.0 (`--skip-active-record --skip-active-storage`) so that user documents are **structurally impossible** to store on the server:

1. **Zero Database & Zero Disk Storage**: `ActiveRecord` and `ActiveStorage` are completely omitted from `config/application.rb`.
2. **Middleware Upload Blocker**: `NoUploadPdf::NoUploadGuardMiddleware` intercepts and rejects any `multipart/form-data` or `application/pdf` POST body with HTTP `403 Forbidden` before it can even touch Rack tempfile parsing.
3. **100% Client-Side Execution**: All 28 PDF tools run inside your browser or local Mac app memory via Stimulus controllers (`pdf-lib`, `PDF.js`, and HTML5 Canvas).
4. **Local LAN iPhone-to-Mac Continuity Bridge**: When scanning with your iPhone camera into your MacBook workspace, frames travel over local encrypted peer-to-peer / LAN sockets and are never saved on any cloud server.
