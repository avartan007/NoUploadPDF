// Canonical 28 Local-First PDF Tools Catalog & Security Headers (Next.js + React + Express)
export const CATEGORIES = ["All", "Organize", "Convert", "Edit", "Optimize"];

export const TOOLS = [
  { id: "merge", num: "01", name: "Merge PDF", cat: "Organize", slug: "merge-pdf", desc: "Combine multiple PDFs and images in any order." },
  { id: "split", num: "02", name: "Split PDF", cat: "Organize", slug: "split-pdf", desc: "Split a PDF by page ranges or burst into single pages." },
  { id: "extract", num: "03", name: "Extract Pages", cat: "Organize", slug: "extract-pdf-pages", desc: "Pull specific pages into a clean new PDF." },
  { id: "rotate", num: "04", name: "Rotate PDF", cat: "Organize", slug: "rotate-pdf", desc: "Rotate all or selected pages by 90°, 180°, or 270°." },
  { id: "organize", num: "05", name: "Reorder & Delete", cat: "Organize", slug: "reorder-delete-pdf-pages", desc: "Drag, reorder, duplicate, or delete individual pages." },
  { id: "alternate", num: "06", name: "Alternate & Mix", cat: "Organize", slug: "alternate-mix-duplex-pdf", desc: "Interleave odd and even scans from single-sided scanners." },
  { id: "splitText", num: "07", name: "Split by Text", cat: "Organize", slug: "split-pdf-by-text", desc: "Automatically split whenever a keyword or heading appears." },
  { id: "splitBookmarks", num: "08", name: "Split by Bookmarks", cat: "Organize", slug: "split-pdf-by-bookmarks", desc: "Break chapters into separate files using outline bookmarks." },
  { id: "splitHalf", num: "09", name: "Split Pages in Half", cat: "Organize", slug: "split-pdf-pages-in-half", desc: "Slice 2-up book spreads down the middle into single pages." },
  { id: "splitSize", num: "10", name: "Split by Size", cat: "Organize", slug: "split-pdf-by-size", desc: "Chunk large PDFs so no part exceeds email or portal limits." },
  { id: "nup", num: "11", name: "N-Up Pages per Sheet", cat: "Organize", slug: "n-up-pages-per-sheet-pdf", desc: "Print 2, 4, or 9 pages per sheet with clean margins." },
  { id: "scan", num: "12", name: "Phone Camera Scanner", cat: "Convert", slug: "phone-camera-pdf-scanner", desc: "Pair via QR code and beam photos peer-to-peer over WebRTC." },
  { id: "imagesToPdf", num: "13", name: "Images to PDF", cat: "Convert", slug: "images-to-pdf", desc: "Convert PNG, JPG, and WebP photos into a crisp A4/Letter PDF." },
  { id: "pdfToImages", num: "14", name: "PDF to PNG Images", cat: "Convert", slug: "pdf-to-png-images", desc: "Render every PDF page as a high-DPI PNG inside a ZIP archive." },
  { id: "pdfToDocx", num: "15", name: "PDF to Word (.docx)", cat: "Convert", slug: "pdf-to-word-docx", desc: "Extract structured text into an editable Word document." },
  { id: "pdfToMarkdown", num: "16", name: "PDF to Markdown (.md)", cat: "Convert", slug: "pdf-to-markdown", desc: "Convert PDF pages into clean Markdown for notes or LLMs." },
  { id: "zip", num: "17", name: "Bundle to ZIP", cat: "Convert", slug: "pdf-to-zip-bundle", desc: "Package working PDFs into a single local ZIP archive." },
  { id: "fillSign", num: "18", name: "Sign & Fill PDF", cat: "Edit", slug: "sign-pdf", desc: "Draw, type, or stamp your signature and date onto any page." },
  { id: "redact", num: "19", name: "Redact & Black Out", cat: "Edit", slug: "redact-pdf", desc: "Burn 216-DPI black boxes into pixels and strip underlying text." },
  { id: "watermark", num: "20", name: "Add Watermark", cat: "Edit", slug: "watermark-pdf", desc: "Stamp diagonal or header watermarks across all pages." },
  { id: "pageNumbers", num: "21", name: "Page & Bates Numbers", cat: "Edit", slug: "bates-page-numbers-pdf", desc: "Add Page X of Y or legal Bates numbering (EXH-0001)." },
  { id: "crop", num: "22", name: "Crop Margins", cat: "Edit", slug: "crop-pdf-margins", desc: "Trim whitespace margins or standardize page dimensions." },
  { id: "flip", num: "23", name: "Flip & Mirror", cat: "Edit", slug: "flip-mirror-pdf", desc: "Horizontally or vertically mirror pages for transfer printing." },
  { id: "compress", num: "24", name: "Compress PDF (200 KB)", cat: "Optimize", slug: "compress-pdf", desc: "Shrink PDFs to strict 100 KB / 200 KB portal limits locally." },
  { id: "ocr", num: "25", name: "OCR Searchable PDF", cat: "Optimize", slug: "ocr-pdf", desc: "Recognize printed text in scans right inside your browser." },
  { id: "password", num: "26", name: "Protect (AES-256-GCM)", cat: "Optimize", slug: "protect-unlock-pdf-aes256", desc: "Encrypt documents with WebCrypto PBKDF2 + AES-256-GCM." },
  { id: "metadata", num: "27", name: "Scrub Metadata", cat: "Optimize", slug: "scrub-pdf-metadata", desc: "Wipe Author, Creator, Producer, XMP, and hidden timestamps." },
  { id: "workflow", num: "28", name: "Multi-Step Workflow", cat: "Optimize", slug: "pdf-workflow-pipeline-compare", desc: "Chain multiple tools (Redact -> Watermark -> Compress) in 1 click." }
];

export const SLUG_TO_TOOL_MAP = TOOLS.reduce((acc, t) => {
  acc[t.slug] = t.id;
  acc[t.id] = t.id;
  return acc;
}, {
  "compress-pdf-to-200kb": "compress",
  "merge-pdf-for-visa": "merge",
  "redact-private-pdf": "redact"
});

export const SECURITY_HEADERS = {
  "X-NoUploadPDF-Privacy": "processed-in-browser-0-bytes-uploaded",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=(), payment=(), usb=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob:; worker-src 'self' blob: https://cdnjs.cloudflare.com; connect-src 'self' wss://*.peerjs.com https://*.peerjs.com ws: wss:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';"
};
