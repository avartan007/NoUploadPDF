// Compress a PDF to (at most) a target size, e.g. 100 KB / 200 KB / 1 MB.
// Strategy: render pages -> JPEG at the best quality that fits -> rebuild PDF.
// Trade-off: text becomes an image (not selectable). Offer an "OCR after" option if you need it.
//
// Usage:
//   import { compressToTarget } from "lib/target_compress"
//   const r = await compressToTarget(arrayBuffer, 200 * 1024, { pdfjsLib, PDFLib, onProgress })
//   r => { bytes: Uint8Array, size, reached, quality, scale }

const SCALES = [2, 1.5, 1.2, 1, 0.8, 0.6]
const OVERHEAD_PER_PAGE = 1200

const toBlob = (canvas, q) => new Promise((res) => canvas.toBlob(res, "image/jpeg", q))

export async function compressToTarget(data, targetBytes, { pdfjsLib, PDFLib, onProgress = () => {} }) {
  const src = await pdfjsLib.getDocument({ data: data.slice(0) }).promise
  const n = src.numPages
  let best = null

  for (const [si, scale] of SCALES.entries()) {
    const canvases = []
    for (let p = 1; p <= n; p++) {
      const page = await src.getPage(p)
      const base = page.getViewport({ scale: 1 })
      const vp = page.getViewport({ scale })
      const c = document.createElement("canvas")
      c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height)
      const ctx = c.getContext("2d")
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height)
      await page.render({ canvasContext: ctx, viewport: vp }).promise
      canvases.push({ c, w: base.width, h: base.height })
      onProgress({ stage: "render", scale, page: p, pages: n, step: si, steps: SCALES.length })
    }

    const sizeAt = async (q) => {
      let total = n * OVERHEAD_PER_PAGE
      const blobs = []
      for (const { c } of canvases) { const b = await toBlob(c, q); blobs.push(b); total += b.size }
      return { total, blobs }
    }
    let lo = 0.25, hi = 0.9, fit = null
    const floor = await sizeAt(lo)
    if (floor.total <= targetBytes) {
      fit = { q: lo, ...floor }
      for (let i = 0; i < 6; i++) {
        const mid = (lo + hi) / 2
        const t = await sizeAt(mid)
        if (t.total <= targetBytes) { fit = { q: mid, ...t }; lo = mid } else hi = mid
        onProgress({ stage: "tune", quality: mid })
      }
    } else if (!best || floor.total < best.total) {
      best = { q: lo, scale, ...floor, dims: canvases.map(({ w, h }) => ({ w, h })) }
    }

    if (fit) {
      best = { ...fit, scale, dims: canvases.map(({ w, h }) => ({ w, h })), reached: true }
      break // highest scale (best readability) that fits wins
    }
  }

  const out = await PDFLib.PDFDocument.create()
  for (let i = 0; i < best.blobs.length; i++) {
    const img = await out.embedJpg(new Uint8Array(await best.blobs[i].arrayBuffer()))
    const { w, h } = best.dims[i]
    out.addPage([w, h]).drawImage(img, { x: 0, y: 0, width: w, height: h })
  }
  out.setTitle(""); out.setAuthor(""); out.setProducer("NoUploadPDF"); out.setCreator("")
  const bytes = await out.save()
  return { bytes, size: bytes.length, reached: !!best.reached && bytes.length <= targetBytes, quality: best.q, scale: best.scale }
}
