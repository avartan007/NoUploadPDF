# Launch Kit: GitHub Topics, Description, Reddit Posts & Hacker News (`avartan007/NoUploadPDF`)

Use this updated kit for your GitHub repository **About ⚙️** metadata, **Reddit (`r/webdev`, `r/reactjs`, `r/nextjs`, `r/selfhosted`, `r/privacy`)**, **Hacker News (`Show HN`)**, and **Product Hunt / X**.

---

## 1. GitHub Repository Description (Copy-Paste into GitHub "About" · < 160 chars)

```text
Local-first PDF studio built with Next.js, React, Three.js, GSAP & WebGL2. 28 browser-RAM PDF tools + WebRTC P2P phone camera scanner. 0 bytes uploaded.
```

---

## 2. GitHub Topics / Tags (20 High-Discovery Tags — Copy-Paste)

```text
nextjs react nodejs express threejs gsap webgl2 pdf-tools pdf privacy local-first webrtc webassembly redaction ocr pwa offline-first zero-knowledge open-source vercel
```

### Category Breakdown:
- **Core Stack & 3D/Shaders**: `nextjs`, `react`, `nodejs`, `express`, `threejs`, `gsap`, `webgl2`, `webassembly`
- **PDF & Document Tools**: `pdf-tools`, `pdf`, `redaction`, `ocr`
- **Privacy & Local-First**: `privacy`, `local-first`, `zero-knowledge`, `offline-first`, `webrtc`, `pwa`
- **Ecosystem**: `open-source`, `vercel`

---

## 3. Reddit Launch Posts (Copy-Paste)

### Option A: `r/reactjs` / `r/nextjs` / `r/webdev` (Technical Architecture & 3D/WebGL2 Focus)

**Title:**
> I migrated my 28-tool local-first PDF studio from Rails to Next.js + React + Three.js + GSAP + WebGL2 (0 bytes uploaded, works offline)

**Body:**
> Hey everyone!
>
> A while back I started building **NoUploadPDF** because I needed to redact and compress personal visa/tax PDFs under strict 200 KB portal limits without uploading sensitive documents to random cloud servers.
>
> Initially I prototyped the shell in Ruby on Rails, but since the app needs **zero database** and relies heavily on client-side WebAssembly, Three.js + GSAP 3D choreography, WebGL2 custom shaders, and WebRTC P2P data channels, I just completed a full migration to **Next.js + React + Node.js/Express**.
>
> **Live App:** https://nouploadpdf.vercel.app  
> **GitHub (MIT):** https://github.com/avartan007/NoUploadPDF
>
> ### What's under the hood in the Next.js + React build:
> 1. **4-Stage Three.js + GSAP Full-Screen Tornado → 3D Laptop Intro (`HeroThreeTornado.jsx`)**:
>    - Uses a dual-scene `THREE.WebGLRenderTarget(1600, 1000)` architecture. High-DPI procedural PDF pages stream from all 4 corners of the viewport into a full-screen 3D tornado, then funnel inside a machined-aluminum 3D laptop that zooms out and settles behind the headline.
> 2. **WebGL2 GLSL Ink-Bleed Theme & Text Reveal (`InkBleedEngine`) + SVG Liquid Ripple**:
>    - Both the headline reveal and the light/dark theme toggle use a custom WebGL2 fragment shader with domain-warped Perlin FBM + radial ink tendrils (`uTendril`, `uNoiseScale`), paired with an SVG `feTurbulence` + `feDisplacementMap` liquid ripple on the word *"leave"*.
> 3. **28 Client-Side PDF Tools (`pdf-lib`, `PDF.js`, `JSZip`, WebCrypto AES-256-GCM)**:
>    - Merge, Split, 216-DPI pixel-burn Redaction (rasterizes redacted pages so underlying text streams cannot be copied), Target-KB binary-search compression (`100 KB` / `200 KB`), Sign, Watermark, Bates numbering, PDF → Word/Markdown/PNG, and tool chaining in a mobile-responsive 3-pane Studio.
> 4. **WebRTC P2P Phone Camera Scanner (`PhoneScanner.jsx`)**:
>    - Scan a QR code on your phone to beam camera scans directly into the desktop Studio over an encrypted WebRTC `DataChannel` (`DTLS-SRTP`) with a 4-digit SAS verification gate and SHA-256 chunk verification.
> 5. **Verifiable Zero-Upload Guarantee**:
>    - Static deployment on Vercel + an Express middleware guard (`server/middleware/noUploadGuard.js`) that returns `HTTP 403 Forbidden` on any `POST`/`PUT`/`PATCH` or `multipart/form-data` request, plus strict `CSP` headers and an in-app live `fetch`/`XHR`/`PerformanceObserver` network monitor.
>
> Would love your feedback on the React component structure, mobile responsiveness, and the Three.js / WebGL2 animations!

---

### Option B: `r/privacy` / `r/selfhosted` / `r/InternetIsBeautiful` (Privacy & Utility Focus)

**Title:**
> I built an open-source, zero-upload PDF studio (28 tools + P2P phone scanner) that runs 100% in your browser RAM and works in Airplane Mode

**Body:**
> Almost every "free online PDF tool" uploads your contracts, bank statements, and IDs to a remote server and limits you to 2 free tasks a day.
>
> I built **NoUploadPDF** (Next.js + React + WebAssembly, MIT licensed) so every tool runs locally inside your browser tab:
> - **0 bytes uploaded**: There is no upload endpoint (static deployment + Express HTTP 403 upload blocker for self-hosters). Turn off Wi-Fi after loading the page and all 28 tools still work.
> - **True 216-DPI Redaction**: Instead of placing a removable black rectangle over text, it burns redactions into a 216-DPI rasterized page and strips XMP/Author metadata.
> - **100 KB / 200 KB Portal Compression**: Binary-search quality/scale compression for strict government and university upload portals.
> - **Peer-to-Peer Phone QR Scanner**: Pair your phone via QR code + 4-digit SAS verification code; photos stream peer-to-peer over WebRTC (`DTLS-SRTP`) directly into your desktop browser.
>
> **Try it:** https://nouploadpdf.vercel.app  
> **Source & Docker self-host:** https://github.com/avartan007/NoUploadPDF

---

## 4. Hacker News (`Show HN`) Post (Copy-Paste)

**Title:**
> Show HN: NoUploadPDF – 28 client-side PDF tools in Next.js/React + WebRTC phone scanner

**Text:**
> Hi HN,
>
> I built NoUploadPDF (https://nouploadpdf.vercel.app, repo: https://github.com/avartan007/NoUploadPDF) after needing to redact and compress personal PDFs to fit strict 200 KB upload limits without sending sensitive documents to a third-party server.
>
> We recently shifted the entire project from an early Rails prototype to a clean Next.js + React + Node.js/Express architecture (with no database) so we could push the client-side experience further:
>
> - **All 28 tools run in browser memory** using `pdf-lib`, `PDF.js`, `JSZip`, Canvas, and WebCrypto (`PBKDF2` + `AES-256-GCM`). Once loaded, the PWA (`sw.js`) works completely offline in Airplane Mode.
> - **Honest security & trade-offs**: There is no upload endpoint on the static build (and our Express server middleware explicitly returns HTTP 403 on any POST/PUT/multipart payload). Redaction rasterizes pages at 216 DPI so underlying text cannot be extracted. On the `/compare` section we also document where cloud tools still win (e.g., 500 MB+ files that exceed browser tab RAM, or CA-backed PKI signatures).
> - **WebRTC P2P Phone Scanner**: Scanning a QR code opens a WebRTC DataChannel (`DTLS-SRTP`) between your phone camera and desktop Studio, gated by a 4-digit SAS verification code and SHA-256 payload hashing. Signaling uses PeerJS only for the SDP/ICE handshake (and you can point it to your own self-hosted PeerJS server in the UI).
> - **Three.js + GSAP + WebGL2 Ink-Bleed UI**: Features a full-screen 3D document tornado that funnels into a 3D laptop model and a custom WebGL2 Perlin FBM ink-bleed shader for the text reveal and theme toggle.
>
> Everything is MIT-licensed. I'd love feedback on the security model, mobile UX, and code structure!
