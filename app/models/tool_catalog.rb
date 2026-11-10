require "json"

class ToolCatalog
  CATEGORIES = %w[All Organize Convert Edit Optimize].freeze

  TOOLS = JSON.parse(<<~'JSON', symbolize_names: true).freeze
[
    {
        "num": "01",
        "id": "merge",
        "slug": "merge-pdf",
        "cat": "Organize",
        "popular": true,
        "name": "Merge PDF",
        "desc": "Combine multiple PDFs and scans into one file.",
        "action": "Merge PDFs",
        "out": "merged.pdf",
        "multi": true,
        "seo_h1": "Merge PDF Files Locally in Browser RAM (0 Bytes Uploaded)",
        "seo_explain": "Combine unlimited PDF contracts, statements, and phone scans into a single ordered document directly in your browser's WebAssembly memory without uploading a single byte to any cloud server."
    },
    {
        "num": "02",
        "id": "split",
        "slug": "split-pdf",
        "cat": "Organize",
        "popular": true,
        "name": "Split PDF",
        "desc": "Separate a PDF into single pages or custom ranges.",
        "action": "Split PDF",
        "out": "split-pages.zip",
        "multi": false,
        "seo_h1": "Split PDF Pages Privately in Your Browser",
        "seo_explain": "Break large PDFs into individual sheets or custom page ranges locally in RAM. Ideal for separating sensitive legal exhibits or multi-invoice batches offline."
    },
    {
        "num": "03",
        "id": "extract",
        "slug": "extract-pdf-pages",
        "cat": "Organize",
        "popular": false,
        "name": "Extract pages",
        "desc": "Pull specific pages into a new standalone PDF.",
        "action": "Extract pages",
        "out": "extracted.pdf",
        "multi": false,
        "seo_h1": "Extract Specific Pages from Any PDF Offline",
        "seo_explain": "Select exact page numbers or ranges (such as 1-3, 7) and save them as a clean, standalone PDF without transmitting your source file over the network."
    },
    {
        "num": "04",
        "id": "rotate",
        "slug": "rotate-pdf",
        "cat": "Organize",
        "popular": false,
        "name": "Rotate PDF",
        "desc": "Rotate all or selected pages by 90\u00b0, 180\u00b0 or 270\u00b0.",
        "action": "Rotate pages",
        "out": "rotated.pdf",
        "multi": false,
        "seo_h1": "Rotate Upside-Down or Sideways PDF Pages Locally",
        "seo_explain": "Fix sideways scans or rotate selected pages by 90\u00b0, 180\u00b0, or 270\u00b0 instantaneously in browser memory."
    },
    {
        "num": "05",
        "id": "organize",
        "slug": "reorder-delete-pdf-pages",
        "cat": "Organize",
        "popular": false,
        "name": "Reorder & delete",
        "desc": "Rearrange page order or remove unwanted sheets.",
        "action": "Save page order",
        "out": "reordered.pdf",
        "multi": false,
        "seo_h1": "Reorder and Delete PDF Pages in Local RAM",
        "seo_explain": "Rearrange page sequences and strip out unwanted blank or cover sheets with zero server round-trips."
    },
    {
        "num": "06",
        "id": "alternate",
        "slug": "alternate-mix-duplex-pdf",
        "cat": "Organize",
        "popular": false,
        "name": "Alternate & mix",
        "desc": "Interleave odd and even scans from duplex stacks.",
        "action": "Mix pages",
        "out": "mixed.pdf",
        "multi": true,
        "seo_h1": "Interleave Odd & Even Duplex Scans into One PDF",
        "seo_explain": "Scanned a double-sided stack on a single-sided feeder? Weave front and reverse-ordered back pages together automatically in local memory."
    },
    {
        "num": "07",
        "id": "splitText",
        "slug": "split-pdf-by-text",
        "cat": "Organize",
        "popular": false,
        "name": "Split by text",
        "desc": "Start a new file whenever a keyword appears.",
        "action": "Split by text",
        "out": "split-by-text.zip",
        "multi": false,
        "seo_h1": "Split PDF Automatically When a Keyword Appears",
        "seo_explain": "Scan page text locally with PDF.js and slice bulk statements or invoices into separate PDFs whenever a trigger phrase like 'Invoice No.' is detected."
    },
    {
        "num": "08",
        "id": "splitBookmarks",
        "slug": "split-pdf-by-bookmarks",
        "cat": "Organize",
        "popular": false,
        "name": "Split by bookmarks",
        "desc": "Slice a document into chapters by outline.",
        "action": "Split chapters",
        "out": "chapters.zip",
        "multi": false,
        "seo_h1": "Split PDF Books and Manuals by Chapter Bookmarks",
        "seo_explain": "Slice long textbooks, reports, and manuals into individual chapter PDFs using outline bookmarks and section headings."
    },
    {
        "num": "09",
        "id": "splitHalf",
        "slug": "split-pdf-pages-in-half",
        "cat": "Organize",
        "popular": false,
        "name": "Split in half",
        "desc": "Slice two-page book spreads down the center spine.",
        "action": "Split spreads",
        "out": "halved.pdf",
        "multi": false,
        "seo_h1": "Split 2-Up Scanned Book Spreads Down the Center Spine",
        "seo_explain": "Divide wide two-page book or magazine scans vertically or horizontally into individual single pages."
    },
    {
        "num": "10",
        "id": "splitSize",
        "slug": "split-pdf-by-size",
        "cat": "Organize",
        "popular": false,
        "name": "Split by size",
        "desc": "Break a large PDF into parts under a MB limit.",
        "action": "Split by size",
        "out": "parts-by-size.zip",
        "multi": false,
        "seo_h1": "Split Large PDFs into Parts Under Portal Size Limits",
        "seo_explain": "Need to upload a huge filing to a portal with a strict 2 MB or 10 MB cap? Partition any PDF into byte-capped chunks locally."
    },
    {
        "num": "11",
        "id": "nup",
        "slug": "n-up-pages-per-sheet-pdf",
        "cat": "Organize",
        "popular": false,
        "name": "Pages per sheet",
        "desc": "Place 2, 4, 6 or 9 pages onto a single A4 sheet.",
        "action": "Impose N-Up",
        "out": "n-up.pdf",
        "multi": false,
        "seo_h1": "Impose 2, 4, 6, or 9 PDF Pages per Sheet (N-Up)",
        "seo_explain": "Create compact lecture handouts, booklet layouts, or contact sheets by imposing multiple PDF pages onto each A4 page."
    },
    {
        "num": "12",
        "id": "scan",
        "slug": "phone-camera-pdf-scanner",
        "cat": "Convert",
        "popular": false,
        "name": "Phone camera scan",
        "desc": "Scan via QR on iPhone or Android straight into Studio.",
        "action": "Open Scanner",
        "out": "scan.pdf",
        "multi": false,
        "seo_h1": "Wireless iPhone & Android Camera-to-Studio PDF Scanner",
        "seo_explain": "Pair your iPhone or Android camera via QR code or 6-digit fallback code. Capture pages with auto-edge detection and glare cleanup straight into your desktop Studio RAM."
    },
    {
        "num": "13",
        "id": "imagesToPdf",
        "slug": "images-to-pdf",
        "cat": "Convert",
        "popular": false,
        "name": "Images to PDF",
        "desc": "Compile scans, PNGs or JPEGs into a clean PDF.",
        "action": "Build PDF",
        "out": "images.pdf",
        "multi": true,
        "seo_h1": "Convert JPG, PNG & WebP Images to PDF Offline",
        "seo_explain": "Compile receipts, photos, and camera scans into a calibrated A4 PDF completely inside browser memory."
    },
    {
        "num": "14",
        "id": "pdfToImages",
        "slug": "pdf-to-png-images",
        "cat": "Convert",
        "popular": false,
        "name": "PDF to images",
        "desc": "Render PDF pages as crisp PNG images in a ZIP.",
        "action": "Render images",
        "out": "pages-images.zip",
        "multi": false,
        "seo_h1": "Render PDF Pages to High-DPI PNG Images Locally",
        "seo_explain": "Rasterize every page of your PDF at 2x resolution into crisp PNG images bundled in a local ZIP download."
    },
    {
        "num": "15",
        "id": "pdfToDocx",
        "slug": "pdf-to-word-docx",
        "cat": "Convert",
        "popular": false,
        "name": "PDF to Word",
        "desc": "Export text and paragraphs to an editable .docx file.",
        "action": "Export .docx",
        "out": "document.docx",
        "multi": false,
        "seo_h1": "Convert PDF to Editable Word (.docx) with Zero Cloud Upload",
        "seo_explain": "Extract paragraphs and headings into a standards-compliant OpenXML Word (.docx) document without sending confidential text to third-party servers."
    },
    {
        "num": "16",
        "id": "pdfToMarkdown",
        "slug": "pdf-to-markdown",
        "cat": "Convert",
        "popular": false,
        "name": "PDF to Markdown",
        "desc": "Convert headings and prose into clean .md text.",
        "action": "Export .md",
        "out": "document.md",
        "multi": false,
        "seo_h1": "Convert PDF to Clean Markdown (.md) for Local LLMs & Notes",
        "seo_explain": "Turn research papers and documentation PDFs into structured Markdown with page headers for Obsidian, Notion, or local AI workflows."
    },
    {
        "num": "17",
        "id": "zip",
        "slug": "pdf-to-zip-bundle",
        "cat": "Convert",
        "popular": false,
        "name": "PDF to ZIP",
        "desc": "Bundle queued PDFs into a single ZIP archive.",
        "action": "Create ZIP",
        "out": "documents.zip",
        "multi": true,
        "seo_h1": "Package Multiple PDFs into a Verified ZIP Archive in RAM",
        "seo_explain": "Combine all queued documents and processed outputs into a clean ZIP archive right in your browser."
    },
    {
        "num": "18",
        "id": "fillSign",
        "slug": "sign-fill-pdf",
        "cat": "Edit",
        "popular": true,
        "name": "Sign PDF",
        "desc": "Draw your signature and stamp it onto any page.",
        "action": "Stamp signature",
        "out": "signed.pdf",
        "multi": false,
        "seo_h1": "Fill & Sign PDF Contracts Privately with Reusable Local Signatures",
        "seo_explain": "Auto-detect form fields, draw or save reusable signatures in local browser storage, and stamp agreements without cloud e-signature tracking."
    },
    {
        "num": "19",
        "id": "redact",
        "slug": "redact-pdf-pii",
        "cat": "Edit",
        "popular": true,
        "name": "Redact PDF",
        "desc": "Burn out sensitive regions at 216 DPI and wipe metadata.",
        "action": "Burn redactions",
        "out": "redacted.pdf",
        "multi": false,
        "seo_h1": "Auto-Detect & Permanently Redact Sensitive Fields in PDFs (216-DPI Burn)",
        "seo_explain": "Automatically scan for emails, phone numbers, and reference IDs with a pre-burn review checklist, then rasterize and burn pixels so redacted text can never be recovered."
    },
    {
        "num": "20",
        "id": "watermark",
        "slug": "watermark-pdf",
        "cat": "Edit",
        "popular": false,
        "name": "Watermark PDF",
        "desc": "Stamp diagonal or margin text across every page.",
        "action": "Add watermark",
        "out": "watermarked.pdf",
        "multi": false,
        "seo_h1": "Stamp Custom Diagonal Watermarks on PDF Pages Locally",
        "seo_explain": "Add CONFIDENTIAL, DRAFT, or custom recipient watermarks with adjustable opacity across every page."
    },
    {
        "num": "21",
        "id": "pageNumbers",
        "slug": "bates-page-numbers-pdf",
        "cat": "Edit",
        "popular": false,
        "name": "Page & Bates numbers",
        "desc": "Add footer numbering or legal Bates stamps.",
        "action": "Add numbers",
        "out": "numbered.pdf",
        "multi": false,
        "seo_h1": "Add Page Numbers & Legal Bates Numbering to PDFs Offline",
        "seo_explain": "Stamp 'Page X of Y' footers or sequential legal Bates numbers (e.g. EXH-0001) across discovery packets in milliseconds."
    },
    {
        "num": "22",
        "id": "crop",
        "slug": "crop-pdf-margins",
        "cat": "Edit",
        "popular": false,
        "name": "Crop margins",
        "desc": "Trim page margins or standardize to A4 or Letter.",
        "action": "Apply crop",
        "out": "cropped.pdf",
        "multi": false,
        "seo_h1": "Crop PDF Margins and Normalize Page Geometry Locally",
        "seo_explain": "Trim whitespace margins and standardize page CropBox dimensions for clean printing and e-readers."
    },
    {
        "num": "23",
        "id": "flip",
        "slug": "flip-mirror-pdf",
        "cat": "Edit",
        "popular": false,
        "name": "Flip & mirror",
        "desc": "Mirror pages horizontally or vertically.",
        "action": "Mirror pages",
        "out": "flipped.pdf",
        "multi": false,
        "seo_h1": "Flip and Mirror PDF Pages Horizontally or Vertically",
        "seo_explain": "Create mirrored transfer prints or fix inverted camera scans in local memory."
    },
    {
        "num": "24",
        "id": "compress",
        "slug": "compress-pdf",
        "cat": "Optimize",
        "popular": true,
        "name": "Compress PDF",
        "desc": "Compact streams and re-encode images to shrink size.",
        "action": "Compress PDF",
        "out": "compressed.pdf",
        "multi": false,
        "seo_h1": "Compress PDF File Size Locally Without Uploading",
        "seo_explain": "Shrink oversized PDFs by compacting PDF object streams and stripping redundant metadata overhead in browser RAM."
    },
    {
        "num": "25",
        "id": "ocr",
        "slug": "ocr-searchable-pdf",
        "cat": "Optimize",
        "popular": false,
        "name": "OCR text index",
        "desc": "Extract page text and append a searchable index sheet.",
        "action": "Build OCR index",
        "out": "searchable.pdf",
        "multi": false,
        "seo_h1": "Local OCR & Searchable Text Index for PDFs",
        "seo_explain": "Extract readable text streams from every page and append a searchable index sheet without cloud OCR APIs."
    },
    {
        "num": "26",
        "id": "password",
        "slug": "protect-unlock-pdf-aes256",
        "cat": "Optimize",
        "popular": false,
        "name": "Protect & unlock",
        "desc": "Strip restrictions or seal in an AES-256-GCM vault.",
        "action": "Apply security",
        "out": "protected.pdf",
        "multi": false,
        "seo_h1": "Unlock PDF Restrictions or Seal in an AES-256-GCM Vault",
        "seo_explain": "Remove owner print/copy restrictions or encrypt sensitive PDFs using WebCrypto PBKDF2 + AES-256-GCM."
    },
    {
        "num": "27",
        "id": "metadata",
        "slug": "scrub-pdf-metadata",
        "cat": "Optimize",
        "popular": false,
        "name": "Scrub metadata",
        "desc": "Wipe or edit Title, Author, Subject and Producer fields.",
        "action": "Scrub metadata",
        "out": "clean-details.pdf",
        "multi": false,
        "seo_h1": "Document Detective & PDF Metadata Scrubber",
        "seo_explain": "Inspect and wipe hidden Author, Producer, CreationDate, XMP tags, and embedded scripts before sharing a PDF."
    },
    {
        "num": "28",
        "id": "workflow",
        "slug": "pdf-workflow-pipeline-compare",
        "cat": "Optimize",
        "popular": false,
        "name": "Compare & batch",
        "desc": "Diff two PDFs side-by-side or run a multi-step pass.",
        "action": "Run studio pass",
        "out": "studio-output.pdf",
        "multi": true,
        "seo_h1": "Build Shareable Multi-Step PDF Pipelines & Diff Documents",
        "seo_explain": "Chain multiple operations (Sanitize \u2192 Watermark \u2192 Bates Number \u2192 Compress) and share the pipeline recipe link without sharing your files."
    }
]
  JSON

  def self.all
    TOOLS
  end

  def self.count
    TOOLS.size
  end

  def self.by_category(category)
    return TOOLS if category.nil? || category == "All"
    TOOLS.select { |t| t[:cat].casecmp?(category) }
  end

  def self.find(id_or_slug)
    key = id_or_slug.to_s.downcase
    TOOLS.find { |t| t[:id].downcase == key || t[:slug].downcase == key } || TOOLS.first
  end
end
