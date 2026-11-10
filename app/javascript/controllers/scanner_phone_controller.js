import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

// Phone side (iPhone iOS & Android) of the PocketLens™ scanner bridge.
//
// Primary transport: WebRTC Peer-to-Peer (`RTCPeerConnection` + `RTCDataChannel`)
// so captured photos stream directly phone-to-browser with 0 server bytes.
// Universal fallback: `<input type="file" accept="image/*" capture="environment">`
export default class extends Controller {
  static targets = [
    "video", "canvas", "file", "gallery", "status", "statusDot", "deviceBadge",
    "sentCount", "previewList", "empty", "liveButton", "shutterButton",
    "hint", "filter", "banner", "adjustPanel", "adjustCanvas"
  ]

  static values = { room: String }

  static MAX_EDGE = 1700
  static JPEG_QUALITY = 0.86

  connect() {
    this.sent = 0
    this.queue = []
    this.stream = null
    this.adjustment = null
    this.draggingCorner = -1
    this.peerId = "phone-" + Math.random().toString(36).slice(2, 8)
    this.rtcPeer = null
    this.rtcChannel = null
    this.p2pReady = false
    this.deviceName = this.detectDeviceName()
    if (this.hasDeviceBadgeTarget) this.deviceBadgeTarget.textContent = this.deviceName
    this.watchSecureContext()
    this.subscribe()
  }

  disconnect() {
    clearInterval(this.heartbeatTimer)
    this.closeWebRtc()
    this.stopCamera()
    this.clearAdjustment()
    this.subscription?.unsubscribe()
    this.consumer?.disconnect()
  }

  detectDeviceName() {
    const ua = navigator.userAgent || ""
    const browser = /CriOS/i.test(ua) ? "Chrome" : (/FxiOS/i.test(ua) ? "Firefox" : (/Safari/i.test(ua) && !/Chrome/i.test(ua) ? "Safari" : "Browser"))
    if (/iPhone/i.test(ua)) return `iPhone (${browser})`
    if (/iPad/i.test(ua)) return `iPad (${browser})`
    if (/Android/i.test(ua)) {
      const m = ua.match(/;\s*([^;)]+?)\s+Build\//i)
      const model = m && m[1] ? m[1].trim().slice(0, 18) : "Android Phone"
      return `${model}`
    }
    if (/Macintosh/i.test(ua)) return `Mac (${browser})`
    return "Mobile Phone"
  }

  watchSecureContext() {
    const secure = window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1"
    if (!secure && this.hasHintTarget) {
      this.hintTarget.textContent = "Take Photo & Pick from Gallery work over any connection on iPhone and Android."
    }
  }

  subscribe() {
    this.consumer = createConsumer()

    this.subscription = this.consumer.subscriptions.create(
      { channel: "ScannerBridgeChannel", room_code: this.roomValue },
      {
        connected: () => {
          this.ready = true
          this.setStatus(`Connected to Studio as ${this.deviceName}`, true)
          this.announceDeviceToMac()
          this.initiateWebRtcOffer()
          clearInterval(this.heartbeatTimer)
          this.heartbeatTimer = setInterval(() => this.announceDeviceToMac(), 4000)
          this.flushQueue()
        },
        disconnected: () => {
          this.ready = false
          this.p2pReady = false
          this.setStatus("Reconnecting to Studio…", false)
        },
        received: (payload) => {
          if (payload.event === "capture_requested") this.onCaptureRequested()
          if (payload.event === "ping_device") {
            this.announceDeviceToMac()
            if (!this.p2pReady) this.initiateWebRtcOffer()
          }
          if (payload.event === "webrtc_signal" && payload.sender !== this.peerId) {
            this.handleWebRtcSignal(payload)
          }
        }
      }
    )
  }

  announceDeviceToMac() {
    if (!this.ready || !this.subscription) return
    this.subscription.perform("announce_device", {
      device: this.deviceName,
      transport: this.p2pReady ? "webrtc" : "ready"
    })
  }

  // --- WebRTC Peer-to-Peer Sender (Phone -> Browser Direct RTCDataChannel) ---
  async initiateWebRtcOffer() {
    if (typeof RTCPeerConnection === "undefined" || !this.ready) return
    try {
      this.closeWebRtc()
      this.rtcPeer = new RTCPeerConnection({ iceServers: [] })
      this.rtcChannel = this.rtcPeer.createDataChannel("nouploadpdf-p2p-scan", { ordered: true })

      this.rtcChannel.onopen = () => {
        this.p2pReady = true
        this.setStatus(`🟢 WebRTC P2P Direct Link Active (${this.deviceName})`, true)
        this.announceDeviceToMac()
      }

      this.rtcChannel.onclose = () => {
        this.p2pReady = false
      }

      this.rtcPeer.onicecandidate = (ev) => {
        if (ev.candidate) {
          this.subscription?.perform("webrtc_signal", {
            sender: this.peerId,
            sig_type: "ice_candidate",
            candidate: ev.candidate.toJSON(),
            device: this.deviceName
          })
        }
      }

      const offer = await this.rtcPeer.createOffer()
      await this.rtcPeer.setLocalDescription(offer)
      this.subscription?.perform("webrtc_signal", {
        sender: this.peerId,
        sig_type: "offer",
        sdp: this.rtcPeer.localDescription.toJSON(),
        device: this.deviceName
      })
    } catch (err) {
      console.warn("[WebRTC P2P] Offer fallback:", err)
    }
  }

  async handleWebRtcSignal(payload) {
    if (!this.rtcPeer) return
    try {
      if (payload.sig_type === "answer" && payload.sdp) {
        await this.rtcPeer.setRemoteDescription(new RTCSessionDescription(payload.sdp))
      } else if (payload.sig_type === "ice_candidate" && payload.candidate) {
        await this.rtcPeer.addIceCandidate(new RTCIceCandidate(payload.candidate))
      }
    } catch (err) {
      console.warn("[WebRTC P2P] Signal error:", err)
    }
  }

  closeWebRtc() {
    this.p2pReady = false
    try { this.rtcChannel?.close() } catch {}
    try { this.rtcPeer?.close() } catch {}
    this.rtcChannel = null
    this.rtcPeer = null
  }

  sendOverWebRtcDataChannel(payload) {
    if (!this.p2pReady || !this.rtcChannel || this.rtcChannel.readyState !== "open") return false
    try {
      const base64 = payload.image
      const chunkSize = 14000
      const total = Math.ceil(base64.length / chunkSize)
      const msgId = `p2p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      for (let idx = 0; idx < total; idx++) {
        const chunk = base64.slice(idx * chunkSize, (idx + 1) * chunkSize)
        this.rtcChannel.send(JSON.stringify({
          type: "scan_chunk",
          id: msgId,
          idx,
          total,
          chunk,
          title: payload.title,
          filter: payload.filter,
          device: payload.device,
          width: payload.width,
          height: payload.height
        }))
      }
      return true
    } catch (err) {
      console.warn("[WebRTC P2P] Send fallback:", err)
      return false
    }
  }

  setStatus(text, connected) {
    if (this.hasStatusTarget) this.statusTarget.textContent = text
    if (this.hasStatusDotTarget) {
      this.statusDotTarget.style.backgroundColor = connected ? "#00875a" : "#94a3b8"
    }
  }

  onCaptureRequested() {
    if (this.hasBannerTarget) {
      this.bannerTarget.hidden = false
      this.bannerTarget.textContent = "Desktop Studio requested a scan — tap Take Photo below."
    }
    navigator.vibrate?.(40)
  }

  openCamera(event) {
    event?.preventDefault()
    if (this.hasBannerTarget) this.bannerTarget.hidden = true
    this.fileTarget.click()
  }

  openGallery(event) {
    event?.preventDefault()
    if (this.hasBannerTarget) this.bannerTarget.hidden = true
    if (this.hasGalleryTarget) this.galleryTarget.click()
    else this.fileTarget.click()
  }

  async fileChosen(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    this.setStatus("Preparing captured photo…", false)

    try {
      const bitmap = await this.decode(file)
      this.beginAdjustment(bitmap, file.name.replace(/\.[^.]+$/, "") || `Scan-${this.sent + 1}`)
    } catch (error) {
      console.error("[scanner] photo processing failed", error)
      this.setStatus("Could not read that photo", false)
    }
  }

  async galleryChosen(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ""
    if (!files.length) return

    this.setStatus(`Sending ${files.length} photo(s) to Studio…`, true)
    for (const file of files) {
      try {
        const bitmap = await this.decode(file)
        const cleanTitle = file.name.replace(/\.[^.]+$/, "") || `Scan-${this.sent + 1}`
        const dataUrl = this.render(bitmap, cleanTitle)
        await this.send(dataUrl, cleanTitle)
        bitmap.close?.()
      } catch (err) {
        console.error("[scanner] gallery item failed", err)
      }
    }
  }

  async decode(file) {
    if (typeof createImageBitmap === "function") {
      try {
        return await createImageBitmap(file, { imageOrientation: "from-image" })
      } catch {}
    }

    return await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error("decode failed"))
      image.src = URL.createObjectURL(file)
    })
  }

  async startCamera(event) {
    event?.preventDefault()

    if (!navigator.mediaDevices?.getUserMedia) {
      this.setStatus("Use Take Photo or Pick from Gallery above", false)
      return
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 2048 } },
        audio: false
      })
      this.videoTarget.srcObject = this.stream
      this.videoTarget.hidden = false
      await this.videoTarget.play()

      if (this.hasShutterButtonTarget) this.shutterButtonTarget.hidden = false
      if (this.hasLiveButtonTarget) this.liveButtonTarget.textContent = "Stop Live Camera"
      this.setStatus("Live camera active — frame page and snap", true)
    } catch (error) {
      console.error("[scanner] getUserMedia failed", error)
      this.setStatus("Use Take Photo button above (works on any connection)", false)
    }
  }

  stopCamera() {
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    if (this.hasVideoTarget) {
      this.videoTarget.srcObject = null
      this.videoTarget.hidden = true
    }
    if (this.hasShutterButtonTarget) this.shutterButtonTarget.hidden = true
    if (this.hasLiveButtonTarget) this.liveButtonTarget.textContent = "Start Live Camera"
  }

  toggleCamera(event) {
    event?.preventDefault()
    if (this.stream) this.stopCamera()
    else this.startCamera()
  }

  async shoot(event) {
    event?.preventDefault()
    if (!this.videoTarget.videoWidth) return

    this.setStatus("Sending frame to Studio…", false)
    const dataUrl = this.render(this.videoTarget, `Live-Scan-${this.sent + 1}`)
    await this.send(dataUrl, `Live-Scan-${this.sent + 1}`)
  }

  beginAdjustment(source, title) {
    this.clearAdjustment()
    const sourceWidth = source.videoWidth || source.width
    const sourceHeight = source.videoHeight || source.height
    const scale = Math.min(1, 720 / Math.max(sourceWidth, sourceHeight))
    const canvas = this.adjustCanvasTarget
    canvas.width = Math.max(1, Math.round(sourceWidth * scale))
    canvas.height = Math.max(1, Math.round(sourceHeight * scale))

    this.adjustment = {
      source,
      sourceWidth,
      sourceHeight,
      title,
      corners: [
        { x: 0.04, y: 0.04 },
        { x: 0.96, y: 0.04 },
        { x: 0.96, y: 0.96 },
        { x: 0.04, y: 0.96 }
      ]
    }

    this.paintAdjustment()
    this.adjustPanelTarget.hidden = false
    this.adjustPanelTarget.scrollIntoView({ behavior: "smooth", block: "center" })
    this.setStatus("Adjust corners or tap Send As-Is", true)
  }

  paintAdjustment() {
    const adjustment = this.adjustment
    if (!adjustment) return

    const canvas = this.adjustCanvasTarget
    const context = canvas.getContext("2d")
    const { width, height } = canvas
    const points = adjustment.corners.map((corner) => ({
      x: corner.x * width,
      y: corner.y * height
    }))

    context.clearRect(0, 0, width, height)
    context.drawImage(adjustment.source, 0, 0, width, height)

    context.save()
    context.beginPath()
    context.rect(0, 0, width, height)
    context.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y))
    context.closePath()
    context.fillStyle = "rgba(8, 8, 10, 0.55)"
    context.fill("evenodd")
    context.restore()

    context.beginPath()
    context.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y))
    context.closePath()
    context.strokeStyle = "#10b981"
    context.lineWidth = 2.5
    context.stroke()

    const radius = Math.max(9, width * 0.024)
    points.forEach((point) => {
      context.beginPath()
      context.arc(point.x, point.y, radius, 0, Math.PI * 2)
      context.fillStyle = "#ffffff"
      context.fill()
      context.lineWidth = 2.5
      context.strokeStyle = "#00875a"
      context.stroke()
    })
  }

  canvasPoint(event) {
    const canvas = this.adjustCanvasTarget
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  adjustPointerDown(event) {
    if (!this.adjustment) return
    const canvas = this.adjustCanvasTarget
    const point = this.canvasPoint(event)
    const rect = canvas.getBoundingClientRect()
    const threshold = 38 * (canvas.width / Math.max(1, rect.width))

    let nearest = -1
    let distance = Infinity
    this.adjustment.corners.forEach((corner, index) => {
      const dx = corner.x * canvas.width - point.x
      const dy = corner.y * canvas.height - point.y
      const d = Math.hypot(dx, dy)
      if (d < distance) { distance = d; nearest = index }
    })

    if (distance <= threshold) {
      this.draggingCorner = nearest
      canvas.setPointerCapture?.(event.pointerId)
      event.preventDefault()
    }
  }

  adjustPointerMove(event) {
    if (this.draggingCorner < 0 || !this.adjustment) return
    const canvas = this.adjustCanvasTarget
    const point = this.canvasPoint(event)
    const corner = this.adjustment.corners[this.draggingCorner]
    corner.x = Math.min(1, Math.max(0, point.x / canvas.width))
    corner.y = Math.min(1, Math.max(0, point.y / canvas.height))
    this.paintAdjustment()
    event.preventDefault()
  }

  adjustPointerUp(event) {
    if (this.draggingCorner < 0) return
    this.draggingCorner = -1
    this.adjustCanvasTarget.releasePointerCapture?.(event.pointerId)
  }

  async confirmAdjust(event) {
    event?.preventDefault()
    const adjustment = this.adjustment
    if (!adjustment) return

    this.setStatus("Straightening & sending to Studio…", false)
    const warped = this.warpPerspective(adjustment)
    const ctx = warped.getContext("2d", { willReadFrequently: true })
    this.applyFilter(ctx, warped.width, warped.height, this.filterMode)
    const dataUrl = warped.toDataURL("image/jpeg", this.constructor.JPEG_QUALITY)
    const { title } = adjustment
    this.clearAdjustment()
    await this.send(dataUrl, title, { width: warped.width, height: warped.height })
  }

  async skipAdjust(event) {
    event?.preventDefault()
    const adjustment = this.adjustment
    if (!adjustment) return

    this.setStatus("Sending photo as-is to Studio…", false)
    const dataUrl = this.render(adjustment.source, adjustment.title)
    const { title } = adjustment
    this.clearAdjustment()
    await this.send(dataUrl, title)
  }

  clearAdjustment() {
    this.adjustment?.source?.close?.()
    this.adjustment = null
    this.draggingCorner = -1
    if (this.hasAdjustPanelTarget) this.adjustPanelTarget.hidden = true
  }

  warpPerspective(adjustment) {
    const maxSource = 2000
    const scale = Math.min(1, maxSource / Math.max(adjustment.sourceWidth, adjustment.sourceHeight))
    const sourceWidth = Math.max(1, Math.round(adjustment.sourceWidth * scale))
    const sourceHeight = Math.max(1, Math.round(adjustment.sourceHeight * scale))

    const sourceCanvas = document.createElement("canvas")
    sourceCanvas.width = sourceWidth
    sourceCanvas.height = sourceHeight
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true })
    sourceContext.drawImage(adjustment.source, 0, 0, sourceWidth, sourceHeight)
    const sourceData = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight).data

    const points = adjustment.corners.map((corner) => ({
      x: corner.x * sourceWidth,
      y: corner.y * sourceHeight
    }))
    const transform = this.squareToQuad(points)
    if (!transform) return sourceCanvas

    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
    const width = Math.round(Math.max(distance(points[0], points[1]), distance(points[3], points[2])))
    const height = Math.round(Math.max(distance(points[0], points[3]), distance(points[1], points[2])))
    const outputScale = Math.min(1, this.constructor.MAX_EDGE / Math.max(width, height, 1))
    const outputWidth = Math.max(1, Math.round(width * outputScale))
    const outputHeight = Math.max(1, Math.round(height * outputScale))

    const output = document.createElement("canvas")
    output.width = outputWidth
    output.height = outputHeight
    const outputContext = output.getContext("2d", { willReadFrequently: true })
    const outputFrame = outputContext.createImageData(outputWidth, outputHeight)
    const outputData = outputFrame.data
    const { a, b, c, d, e, f, g, h } = transform

    for (let y = 0; y < outputHeight; y++) {
      const t = (y + 0.5) / outputHeight
      for (let x = 0; x < outputWidth; x++) {
        const s = (x + 0.5) / outputWidth
        const denominator = g * s + h * t + 1
        let sx = (a * s + b * t + c) / denominator
        let sy = (d * s + e * t + f) / denominator
        sx = Math.min(sourceWidth - 1, Math.max(0, sx))
        sy = Math.min(sourceHeight - 1, Math.max(0, sy))

        const x0 = Math.floor(sx)
        const y0 = Math.floor(sy)
        const x1 = Math.min(sourceWidth - 1, x0 + 1)
        const y1 = Math.min(sourceHeight - 1, y0 + 1)
        const fx = sx - x0
        const fy = sy - y0

        const i00 = (y0 * sourceWidth + x0) * 4
        const i10 = (y0 * sourceWidth + x1) * 4
        const i01 = (y1 * sourceWidth + x0) * 4
        const i11 = (y1 * sourceWidth + x1) * 4
        const target = (y * outputWidth + x) * 4

        for (let channel = 0; channel < 3; channel++) {
          const top = sourceData[i00 + channel] * (1 - fx) + sourceData[i10 + channel] * fx
          const bottom = sourceData[i01 + channel] * (1 - fx) + sourceData[i11 + channel] * fx
          outputData[target + channel] = top * (1 - fy) + bottom * fy
        }
        outputData[target + 3] = 255
      }
    }

    outputContext.putImageData(outputFrame, 0, 0)
    return output
  }

  squareToQuad([p0, p1, p2, p3]) {
    const dx1 = p1.x - p2.x
    const dx2 = p3.x - p2.x
    const dx3 = p0.x - p1.x + p2.x - p3.x
    const dy1 = p1.y - p2.y
    const dy2 = p3.y - p2.y
    const dy3 = p0.y - p1.y + p2.y - p3.y
    const denominator = dx1 * dy2 - dx2 * dy1

    let g = 0
    let h = 0
    if (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) {
      if (Math.abs(denominator) < 1e-9) return null
      g = (dx3 * dy2 - dx2 * dy3) / denominator
      h = (dx1 * dy3 - dx3 * dy1) / denominator
    }

    return {
      a: p1.x - p0.x + g * p1.x,
      b: p3.x - p0.x + h * p3.x,
      c: p0.x,
      d: p1.y - p0.y + g * p1.y,
      e: p3.y - p0.y + h * p3.y,
      f: p0.y,
      g,
      h
    }
  }

  render(source) {
    const sourceWidth = source.videoWidth || source.width
    const sourceHeight = source.videoHeight || source.height
    const scale = Math.min(1, this.constructor.MAX_EDGE / Math.max(sourceWidth, sourceHeight))
    const width = Math.round(sourceWidth * scale)
    const height = Math.round(sourceHeight * scale)

    const canvas = this.hasCanvasTarget ? this.canvasTarget : document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext("2d", { willReadFrequently: true })
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, width, height)
    context.drawImage(source, 0, 0, width, height)

    this.applyFilter(context, width, height, this.filterMode)

    return canvas.toDataURL("image/jpeg", this.constructor.JPEG_QUALITY)
  }

  get filterMode() {
    return this.hasFilterTarget ? this.filterTarget.value : "auto"
  }

  applyFilter(context, width, height, mode) {
    if (mode === "color") return

    const frame = context.getImageData(0, 0, width, height)
    const pixels = frame.data
    const histogram = new Uint32Array(256)

    for (let i = 0; i < pixels.length; i += 4) {
      const luma = (pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114) | 0
      pixels[i] = pixels[i + 1] = pixels[i + 2] = luma
      histogram[luma]++
    }

    if (mode === "auto" || mode === "bw" || mode === "ink") {
      const total = width * height
      let low = 0
      let high = 255
      let accumulated = 0

      for (let value = 0; value < 256; value++) {
        accumulated += histogram[value]
        if (accumulated >= total * 0.02) { low = value; break }
      }

      accumulated = 0
      for (let value = 255; value >= 0; value--) {
        accumulated += histogram[value]
        if (accumulated >= total * 0.02) { high = value; break }
      }

      if (high <= low + 8) { low = 0; high = 255 }
      const range = high - low

      for (let i = 0; i < pixels.length; i += 4) {
        let value = ((pixels[i] - low) * 255) / range
        value = value < 0 ? 0 : value > 255 ? 255 : value
        if (mode === "bw") value = value > 148 ? 255 : 0
        else if (mode === "ink") value = value > 175 ? 255 : Math.max(0, (value - 30) * 0.7)
        pixels[i] = pixels[i + 1] = pixels[i + 2] = value
      }
    }

    context.putImageData(frame, 0, 0)
  }

  async send(dataUrl, title, dimensions = null) {
    let payloadUrl = dataUrl
    let base64 = payloadUrl.split(",")[1]

    let attempts = 0
    while (base64.length > 9_500_000 && attempts < 4) {
      payloadUrl = await this.shrink(payloadUrl, 0.78)
      base64 = payloadUrl.split(",")[1]
      attempts++
    }

    const payload = {
      image: base64,
      title: title || `Scan-${this.sent + 1}`,
      mode: "Document",
      filter: this.filterLabel,
      device: this.deviceName,
      width: dimensions?.width || (this.hasCanvasTarget ? this.canvasTarget.width : 0),
      height: dimensions?.height || (this.hasCanvasTarget ? this.canvasTarget.height : 0)
    }

    if (!this.ready) {
      this.queue.push(payload)
      this.setStatus("Queued — waiting for Studio connection", false)
      return
    }

    // Prefer direct WebRTC Peer-to-Peer DataChannel (0 server bytes)
    const sentViaP2p = this.sendOverWebRtcDataChannel(payload)
    if (!sentViaP2p) {
      this.subscription.perform("relay_scan_frame", payload)
    }

    this.sent++
    this.updateSent()
    this.renderPreview(payloadUrl)
    this.setStatus(
      sentViaP2p
        ? `Sent page ${this.sent} via WebRTC P2P (0 server bytes)`
        : `Sent page ${this.sent} to Studio`,
      true
    )
    navigator.vibrate?.(25)
  }

  shrink(dataUrl, factor) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(image.width * factor))
        canvas.height = Math.max(1, Math.round(image.height * factor))
        const context = canvas.getContext("2d")
        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.74))
      }
      image.onerror = () => reject(new Error("shrink failed"))
      image.src = dataUrl
    })
  }

  get filterLabel() {
    const labels = {
      auto: "Auto-Flat",
      bw: "B&W Document",
      ink: "High-Contrast Ink",
      grayscale: "Grayscale",
      color: "Original Color"
    }
    return labels[this.filterMode] || "Auto-Flat"
  }

  flushQueue() {
    if (!this.queue.length) return
    const pending = this.queue.splice(0)
    pending.forEach((payload) => {
      if (!this.sendOverWebRtcDataChannel(payload)) {
        this.subscription.perform("relay_scan_frame", payload)
      }
    })
    this.sent += pending.length
    this.updateSent()
    this.setStatus(`Sent ${pending.length} queued page(s) to Studio`, true)
  }

  updateSent() {
    if (this.hasSentCountTarget) this.sentCountTarget.textContent = String(this.sent)
    if (this.hasEmptyTarget) this.emptyTarget.hidden = this.sent > 0
  }

  renderPreview(dataUrl) {
    if (!this.hasPreviewListTarget) return

    const thumb = document.createElement("img")
    thumb.src = dataUrl
    thumb.alt = `Scan ${this.sent}`
    thumb.style.cssText = "width:54px;height:70px;object-fit:cover;border-radius:6px;border:1.5px solid #00875a;"
    this.previewListTarget.prepend(thumb)
  }

  async sendSamplePage(event) {
    event?.preventDefault()

    const canvas = document.createElement("canvas")
    canvas.width = 1240
    canvas.height = 1754

    const context = canvas.getContext("2d")
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "#0a0a0a"
    context.font = "bold 52px Helvetica, Arial, sans-serif"
    context.fillText(`Scanned Page #${this.sent + 1} (${this.deviceName})`, 90, 180)
    context.fillStyle = "#00875a"
    context.font = "30px Courier, monospace"
    context.fillText("Sent via WebRTC P2P to Studio at " + new Date().toLocaleTimeString(), 90, 245)
    context.strokeStyle = "#00875a"
    context.lineWidth = 6
    context.strokeRect(90, 310, canvas.width - 180, canvas.height - 460)

    const dataUrl = this.render(canvas, `Phone-Scan-${this.sent + 1}`)
    await this.send(dataUrl, `Phone-Scan-${this.sent + 1}`)
  }
}
