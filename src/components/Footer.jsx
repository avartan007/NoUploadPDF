import React from "react";

export const Footer_HTML = `<footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand-col">
          <div style="display:flex; align-items:center; gap:10px;">
            <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true" style="flex-shrink:0;">
              <rect x="0" y="0" width="48" height="48" rx="12" fill="var(--logo-tile)"/>
              <path d="M12 9h14l7 7v23H12z" fill="var(--logo-paper)"/>
              <path d="M26 9v7h7z" fill="var(--logo-green)"/>
              <rect x="24" y="24" width="18" height="18" rx="4.5" fill="var(--logo-tile)"/>
              <path d="M29.5 31v-2.5a3.5 3.5 0 0 1 7 0V31" stroke="var(--logo-green)" stroke-width="2.6" stroke-linecap="round" fill="none"/>
              <rect x="26.5" y="30.5" width="13" height="9" rx="2.2" fill="var(--logo-green)"/>
              <circle cx="33" cy="35" r="1.5" fill="var(--logo-tile)"/>
            </svg>
            <span style="font-size:16px; font-weight:700; color:var(--ink);">NoUpload<span style="color:var(--brand);">PDF</span></span>
          </div>
          <p class="footer-tagline">Private PDF tools and a peer-to-peer phone scanner that run locally in your browser. No sign-ups, no uploads.</p>
        </div>

        <div class="footer-col">
          <h4>Popular Tools</h4>
          <ul class="footer-links">
            <li><button type="button" onclick="openToolWorkspace('merge')">Merge PDF</button></li>
            <li><button type="button" onclick="openToolWorkspace('split')">Split PDF</button></li>
            <li><button type="button" onclick="openToolWorkspace('fillSign')">Sign PDF</button></li>
            <li><button type="button" onclick="openToolWorkspace('redact')">Redact &amp; Black Out</button></li>
            <li><button type="button" onclick="openToolWorkspace('compress')">Compress PDF</button></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Convert &amp; Scan</h4>
          <ul class="footer-links">
            <li><a href="/scanner" onclick="return openScanner(event)">Phone Camera Scanner</a></li>
            <li><button type="button" onclick="openToolWorkspace('imagesToPdf')">Photos to PDF</button></li>
            <li><button type="button" onclick="openToolWorkspace('pdfToImages')">PDF to PNG Images</button></li>
            <li><button type="button" onclick="openToolWorkspace('pdfToDocx')">PDF to Word (.docx)</button></li>
            <li><button type="button" onclick="openToolWorkspace('pdfToMarkdown')">PDF to Markdown (.md)</button></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Resources</h4>
          <ul class="footer-links">
            <li><button type="button" onclick="scrollToToolsCatalog()">All 28 Tools</button></li>
            <li><button type="button" onclick="openToolWorkspace('merge')">Studio Workspace</button></li>
            <li><button type="button" onclick="scrollToSection('privacyProofSection')">How Local Privacy Works</button></li>
            <li><button type="button" onclick="scrollToSection('faqSection')">Common Questions</button></li>
            <li><a href="https://github.com/avartan007/NoUploadPDF" target="_blank" rel="noopener">GitHub Repository ↗</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div>© 2026 NoUploadPDF · Built by <a href="https://github.com/avartan007" target="_blank" rel="noopener" style="color:var(--ink); font-weight:600; text-decoration:none;">@avartan007</a> · MIT License</div>
        <a href="https://github.com/avartan007/NoUploadPDF" target="_blank" rel="noopener" style="color:var(--muted); text-decoration:none;">View source on GitHub ↗</a>
      </div>
    </div>
    <div class="footer-giant-wordmark" aria-hidden="true">NOUPLOAD<span class="wordmark-accent">PDF</span></div>
  </footer>`;

export default function Footer() {
  return (
    <div
      className="react-section-footer"
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: Footer_HTML }}
    />
  );
}
