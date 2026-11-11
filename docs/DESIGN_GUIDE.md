# NoUploadPDF — Apple-Grade UI/UX Design Guide

Goal: it should feel like an Apple product page and an Apple app at once. Calm, spacious, tactile, and obviously trustworthy. Motion explains things; it never decorates.

## 1. Principles
1. **Clarity.** One idea per screen. One primary action. A headline you can read in 2 seconds.
2. **Deference.** The UI steps back; the user's document is the hero. Chrome is quiet, content is large.
3. **Depth.** Layers (glass, shadow, parallax) show hierarchy, not decoration.
4. **Proof over promises.** Every privacy claim has something to click, watch or verify next to it.
5. **Delight with restraint.** One signature moment per section. If an animation doesn't teach or reward, cut it.

## 2. Design tokens
```css
:root{
  /* color */
  --bg:#FBFBFA; --surface:#FFFFFF; --ink:#0B0B0C; --ink-2:#4B4F52; --muted:#86898C;
  --line:rgba(0,0,0,.08); --brand:#1F7A4D; --brand-ink:#0F5132; --brand-soft:#E8F5EE;
  --danger:#D92D20; --glass:rgba(255,255,255,.72);
  /* shape & depth */
  --r-sm:12px; --r-md:20px; --r-lg:28px; --r-xl:40px;
  --shadow-1:0 1px 2px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.06);
  --shadow-2:0 2px 4px rgba(0,0,0,.05),0 24px 64px rgba(0,0,0,.12);
  /* motion */
  --ease:cubic-bezier(.22,1,.36,1);        /* Apple-like ease-out */
  --spring:cubic-bezier(.34,1.56,.64,1);   /* tiny overshoot for press/release */
  --t-fast:160ms; --t-med:320ms; --t-slow:700ms;
  /* type */
  --font:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Inter",system-ui,sans-serif;
  --mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#0A0B0A; --surface:#141615; --ink:#F5F5F4; --ink-2:#B6BAB8; --muted:#8A8F8C;
  --line:rgba(255,255,255,.1); --brand:#4ADE80; --brand-ink:#86EFAC; --brand-soft:#0F2A1B;
  --glass:rgba(20,22,21,.72);
}}
:root[data-theme="dark"]{ /* same dark values: allow the manual toggle */ }
```
Rules: 8-pt spacing grid (8/16/24/32/48/80/120). Brand green appears only where it means "local / safe / done". Everything else is black, white and grey.

## 3. Typography
- Headline: 600–700 weight, **tracking -0.03 to -0.045em**, line-height 0.98–1.05, size `clamp(2.75rem, 7vw, 6rem)`.
- Subhead: 400 weight, `clamp(1.125rem, 1.6vw, 1.5rem)`, color `--ink-2`, max-width 38ch.
- Eyebrow / system labels: mono, 12px, uppercase, letter-spacing .12em.
- Never more than 2 type sizes in one card. Numbers in tabular-nums.
- Self-host the font (Inter variable) as the fallback, so no third-party request.

## 4. Materials
```css
.glass{background:var(--glass);backdrop-filter:blur(24px) saturate(180%);
       -webkit-backdrop-filter:blur(24px) saturate(180%);border:1px solid var(--line)}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);box-shadow:var(--shadow-1)}
```
- Nav: glass, 56px tall, shrinks to 48px on scroll, hairline border appears after 8px scroll.
- Corners are large (20–28px). Nested radii: inner = outer − padding.
- Use one soft radial gradient glow behind the hero object, never rainbow gradients.

## 5. Apple patterns mapped to your page
| Apple pattern | NoUploadPDF version |
|---|---|
| **Hero with a single product object** | Centered headline + 3D "vault" with PDF pages floating around it. Drop a file and the page flies into the vault; a faint "cloud" plane above shows a ✕. |
| **Sticky local nav that morphs** | Nav shrinks on scroll; the "Requests carrying your data: 0" pill stays pinned and ticks green on every action. |
| **Scrollytelling (pinned section)** | "How it works": one pinned stage, 3 steps change as you scroll (drop → edit → download), while the "device vs cloud" diagram animates. |
| **Bento feature grid** | Replace the long feature lists with a 6-tile bento: Redact, Compress to KB, Phone scan, Offline, Privacy monitor, 28 tools. Each tile has a tiny live animation. |
| **Big numbers** | `28 tools · 0 uploads · 200 KB target` count up when they enter the viewport. |
| **Product tour tabs** | The existing 5-tab preview becomes a segmented control with a sliding pill indicator. |
| **Compare** | Keep your honest comparison table. Add a toggle "Show where we lose" that expands the △ rows. |
| **Footer proof strip** | Build hash, license, "view source at this commit". |

## 6. Motion language
| Use | Duration | Easing |
|---|---|---|
| Hover / press | 160 ms | `--ease` / `--spring` on release |
| Cards, tabs, modals | 320 ms | `--ease` |
| Section reveals | 700 ms | `power3.out` |
| Scroll-linked | scrubbed | linear (`scrub: 0.6` for smoothing) |

Rules: animate only `transform` and `opacity`; stagger 60–90 ms; nothing loops forever except the single hero idle float; **everything has a `prefers-reduced-motion` fallback** (instant state change, no parallax, no 3D).

## 7. GSAP recipes
Vendor GSAP and ScrollTrigger into `/vendor/` (no CDN, so third-party loads stay 0). Check GSAP's current license terms before shipping.
```js
import { gsap } from "/vendor/gsap.min.js";
import { ScrollTrigger } from "/vendor/ScrollTrigger.min.js";
gsap.registerPlugin(ScrollTrigger);
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

// 1. Hero entrance
if (!calm) gsap.from("[data-hero] > *", { y: 32, opacity: 0, duration: .9, ease: "power3.out", stagger: .08 });

// 2. Pinned scrollytelling (3 steps)
const steps = gsap.utils.toArray(".story-step");
if (!calm) ScrollTrigger.create({
  trigger: ".story", start: "top top", end: () => "+=" + steps.length * 90 + "%",
  pin: true, scrub: .6,
  onUpdate: (s) => steps.forEach((el, i) =>
    el.classList.toggle("on", i === Math.min(steps.length - 1, Math.floor(s.progress * steps.length))))
});

// 3. Count-up numbers
document.querySelectorAll("[data-count]").forEach((el) => {
  const o = { v: 0 }, end = +el.dataset.count;
  ScrollTrigger.create({ trigger: el, start: "top 85%", once: true,
    onEnter: () => gsap.to(o, { v: end, duration: 1.2, ease: "power2.out", onUpdate: () => el.textContent = Math.round(o.v) }) });
});

// 4. Magnetic buttons
document.querySelectorAll("[data-magnetic]").forEach((b) => {
  const x = gsap.quickTo(b, "x", { duration: .4, ease: "power3" }), y = gsap.quickTo(b, "y", { duration: .4, ease: "power3" });
  b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect();
    x((e.clientX - r.left - r.width / 2) * .25); y((e.clientY - r.top - r.height / 2) * .25); });
  b.addEventListener("pointerleave", () => { x(0); y(0); });
});

// 5. Cursor spotlight on cards (pure CSS variable, no GSAP needed)
document.addEventListener("pointermove", (e) => {
  const c = e.target.closest?.(".spot"); if (!c) return; const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
});
```
```css
.spot{position:relative;overflow:hidden}
.spot::before{content:"";position:absolute;inset:0;opacity:0;transition:opacity .3s var(--ease);
  background:radial-gradient(240px circle at var(--mx) var(--my),rgba(31,122,77,.14),transparent 70%)}
.spot:hover::before{opacity:1}
```

## 8. Three.js signature hero ("the Vault")
Idea: PDF pages orbit a frosted vault. Dropping a file makes a page fly in; a faint cloud plane above shows an ✕ and the file never goes there. One canvas, lazy-loaded, ~60 lines.
```js
// load only when the hero is visible, motion is allowed and the device is capable
const ok = !matchMedia("(prefers-reduced-motion: reduce)").matches
  && !navigator.connection?.saveData && innerWidth > 768 && (navigator.hardwareConcurrency || 4) >= 4;
if (ok) requestIdleCallback(async () => {
  const THREE = await import("/vendor/three.module.min.js");
  const el = document.querySelector("#hero-3d");
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2)); el.appendChild(r.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, .1, 50); cam.position.set(0, .4, 8);
  scene.add(new THREE.AmbientLight(0xffffff, 1.1)); const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 4, 5); scene.add(key);

  const vault = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1),
    new THREE.MeshPhysicalMaterial({ color: 0xe8f5ee, roughness: .15, transmission: .6, thickness: 1, clearcoat: 1 }));
  scene.add(vault);

  const pages = [...Array(7)].map((_, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.2), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: .8 }));
    m.userData = { a: i / 7 * Math.PI * 2, s: .15 + Math.random() * .1, y: (Math.random() - .5) * 1.4 }; scene.add(m); return m;
  });

  const size = () => { const w = el.clientWidth, h = el.clientHeight; r.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(el); size();

  let visible = true; new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(el);
  const mouse = { x: 0, y: 0 }; addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; });

  r.setAnimationLoop((t) => {
    if (!visible) return;
    t *= .001; vault.rotation.y = t * .25;
    pages.forEach((p) => { const d = p.userData, a = d.a + t * d.s; p.position.set(Math.cos(a) * 2.4, d.y + Math.sin(t + d.a) * .1, Math.sin(a) * 2.4); p.lookAt(0, d.y, 0); });
    cam.position.x += (mouse.x * 1.2 - cam.position.x) * .04; cam.position.y += (-mouse.y * .8 + .4 - cam.position.y) * .04; cam.lookAt(0, 0, 0);
    r.render(scene, cam);
  });
});
```
**Fallbacks:** a static high-quality PNG/SVG of the same scene is the default markup; the canvas replaces it only when the checks above pass. Budget: < 150 KB gzipped for three.js build (import only what you need), pause when off-screen (done above), cap DPR at 2.
**Drop interaction:** on `dragenter`, scale the vault 1.08 and tint brand-green; on drop, tween a new page from the cursor position into the vault with `gsap.to(page.position, {…})`, then fire the "0 bytes left your device" toast.

## 9. Interaction details that feel premium
- **Drop zone:** idle = dashed hairline; hover = border turns brand and the plus icon scales 1.06; drag-over = full-window frosted overlay "Release to open privately"; success = a quick check morph.
- **Buttons:** press scales to .97 in 120 ms, release uses `--spring`. Primary is black on light, white on dark.
- **Segmented controls:** a sliding pill animated with `transform`, not background swaps.
- **Page thumbnails (Studio):** drag to reorder with FLIP animation (`gsap.Flip`) so neighbors glide into place.
- **Progress:** a thin ring with a percentage, plus "Rendering page 4 of 12", never a spinner alone.
- **Result moment:** the file card slides up, size shrink animates (8.4 MB → 1.9 MB), confetti-free check, one primary Download button.
- **Haptics and sound:** `navigator.vibrate(8)` on mobile success (Android only); sound stays off by default, and uses a single soft tick for completion.
- **Skeletons** for thumbnails and a calm empty state with the sample-file button.
- **Command palette (`⌘K`):** glass sheet, fuzzy search, recent tools, keyboard hints on the right.

## 10. The trust UI (your differentiator, make it beautiful)
- A pinned pill: `● 0 requests carrying your data`. On click it opens a glass sheet with the live log, the Content-Security-Policy, the build hash and "Open DevTools" instructions.
- Show **where your file is** as a tiny diagram that updates: `Phone → Browser memory → Download`, with the cloud greyed out.
- Pairing screen: show a 4-digit confirmation code on both devices ("Is this your iPhone? 4821") before accepting a connection.
- State what the signaling relay can see, in one calm line under the QR.

## 11. Accessibility
- Contrast AA minimum (check green on white and on dark).
- Visible focus ring: 2px `--brand` + 2px offset. Full keyboard path for every tool.
- Reduced motion: no pinned scroll, no 3D, no parallax; reveals become instant.
- Touch targets ≥ 44px. Labels on every icon-only button. `aria-live="polite"` for progress and results.

## 12. Performance and privacy constraints
- All libraries vendored. Third-party loads on the page: **0** (exception: the PeerJS signaling connection, disclosed).
- Lazy-load Three.js, GSAP plugins and PDF.js workers. LCP target < 1.5 s on a mid phone.
- Use `font-display: swap`, preload only the hero font and critical CSS.
- Add a strict CSP in `vercel.json` that allows only `'self'` plus the exact signaling host.

## 13. Do and don't
**Do:** big whitespace, one hero object, real numbers, honest limits, calm motion, dark mode parity.
**Don't:** emoji as icons, more than one accent color, parallax on everything, auto-playing sound, stacked gradients, jargon ("Local Sentence Ranking"), or any claim without a proof link.

## 14. Section order for the landing page
Hero (vault + drop zone) → Presets ("Compress to 200 KB", Redact, Merge) → Scrollytelling "How it works" → Bento features → Live proof (monitor, CSP, build hash) → 28-tool grid → Honest comparison → FAQ → Creator note → Footer.
