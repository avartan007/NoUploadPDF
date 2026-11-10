import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"
import qrcode from "qrcode"

const STUDIO_DB_NAME = "NoUploadPDFStudioDB"
const STUDIO_STORE_NAME = "scanned_handoff"
const STUDIO_CHANNEL = "nouploadpdf-studio"

export default class extends Controller {
  static targets = [
    "qr", "urlText", "statusDot", "statusText", "count",
    "list", "empty", "paper", "toolSelect", "studioButton", "askButton",
    "flash", "clearButton", "terminalLog", "p2pBadge", "directInput"
  ]

  static values = {
    room: String,
    phoneUrl: String
  }

  static PAPER_SIZES = {
    A4: [595.28, 841.89],
    Letter: [612, 792],
    Legal: [612, 1008],
    A5: [419.53, 595.28]
  }

  connect() {
    this.pages = []
    this.connectedDeviceName = null
    this.peerId = "desk-" + Math.random().toString(36).slice(2, 8)
    this.rtcPeer = null
    this.rtcChannel = null
    this.incomingChunks = {}
    this.resolveEffectivePhoneUrl()
    this.renderQr()
    this.renderList()
    this.subscribe()
  }

  disconnect() {
    this.closeWebRtc()
    this.subscription?.unsubscribe()
    this.consumer?.disconnect()
  }

  // Fixes public vs local URL: if visitor is on an HTTPS public host, always use window.location.origin
  resolveEffectivePhoneUrl() {
    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)
    if (!isLocalHost && window.location.origin) {
      this.effectiveUrl = `${window.location.origin}/scan/${this.roomValue}`
    } else {
      this.effectiveUrl = this.phoneUrlValue || `${window.location.origin}/scan/${this.roomValue}`
    }
  }

  usePublicOriginUrl(event) {
    event?.preventDefault()
    this.effectiveUrl = `${window.location.origin}/scan/${this.roomValue}`
    this.renderQr()
    this.flash("Switched QR to current site origin URL (WebRTC P2P ready)")
  }

  useLanUrl(event) {
    event?.preventDefault()
    this.effectiveUrl = this.phoneUrlValue
    this.renderQr()
    this.flash("Switched QR to local Wi-Fi IP URL")
  }

  renderQr() {
    if (!this.hasQrTarget) return
    const targetUrl = this.effectiveUrl || this.phoneUrlValue
    try {
      const generator = qrcode(0, "M")
      generator.addData(targetUrl)
      generator.make()
      this.qrTarget.innerHTML = generator.createSvgTag({ cellSize: 5, margin: 2, scalable: true })
    } catch {
      this.qrTarget.textContent = "Could not render QR code"
    }
    if (this.hasUrlTextTarget) this.urlTextTarget.value = targetUrl
  }

  async copyLink(event) {
    event.preventDefault()
    try {
      await navigator.clipboard.writeText(this.effectiveUrl || this.phoneUrlValue)
      this.flash("Phone pairing link copied!")
    } catch {
      this.flash("Select the link above to copy")
    }
  }

  // Direct <input type="file" accept="image/*" capture="environment" multiple> fallback
  // Works over any connection (HTTP, HTTPS, guest Wi-Fi, cellular) with zero network setup!
  openDirectCapture(event) {
    event?.preventDefault()
    if (this.hasDirectInputTarget) this.directInputTarget.click()
  }

  async handleDirectFiles(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ""
    if (!files.length) return

    this.flash(`Reading ${files.length} photo(s) directly in browser memory…`)
    for (const file of files) {
      try {
        const dataUrl = await this.readFileAsJpegDataUrl(file)
        const base64 = dataUrl.split(",")[1]
        const cleanTitle = file.name.replace(/\.[^.]+$/, "") || `Direct-Capture-${this.pages.length + 1}`
        this.addPage({
          image: base64,
          title: cleanTitle,
          mode: "Document",
          filter: "Direct Camera / File",
          device: "Direct Browser Capture (0 Server Bytes)",
          transport: "Direct Local File"
        })
      } catch (err) {
        console.error("[scanner] direct capture failed", err)
      }
    }
  }

  readFileAsJpegDataUrl(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const maxEdge = 1700
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height, 1))
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext("2d")
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.86))
      }
      img.onerror = () => reject(new Error("Image decode error"))
      img.src = URL.createObjectURL(file)
    })
  }

  subscribe() {
    this.consumer = createConsumer()

    this.subscription = this.consumer.subscriptions.create(
      { channel: "ScannerBridgeChannel", room_code: this.roomValue },
      {
        connected: () => {
          this.setConnected(true)
          setTimeout(() => this.subscription?.perform("request_device_ping"), 250)
        },
        disconnected: () => this.setConnected(false),
        received: (payload) => {
          if (payload.event === "device_connected") {
            this.setPhoneDeviceConnected(payload.device || "iPhone / Android", payload.transport)
          } else if (payload.event === "webrtc_signal" && payload.sender !== this.peerId) {
            this.handleWebRtcSignal(payload)
          } else if (payload.event === "incoming_page") {
            this.setPhoneDeviceConnected(payload.device || "iPhone / Android", payload.transport)
            this.addPage(payload)
          }
        }
      }
    )
  }

  // --- WebRTC Peer-to-Peer Receiver (Phone -> Browser Direct RTCDataChannel) ---
  async handleWebRtcSignal(payload) {
    if (typeof RTCPeerConnection === "undefined") return

    try {
      if (payload.sig_type === "offer" && payload.sdp) {
        this.closeWebRtc()
        this.rtcPeer = new RTCPeerConnection({ iceServers: [] })

        this.rtcPeer.onicecandidate = (ev) => {
          if (ev.candidate) {
            this.subscription?.perform("webrtc_signal", {
              sender: this.peerId,
              sig_type: "ice_candidate",
              candidate: ev.candidate.toJSON()
            })
          }
        }

        this.rtcPeer.ondatachannel = (ev) => {
          this.rtcChannel = ev.channel
          this.rtcChannel.onopen = () => {
            this.setP2pBadge("🟢 WebRTC P2P Direct Link Active · 0 Server Bytes")
            this.setPhoneDeviceConnected(payload.device || this.connectedDeviceName || "iPhone / Android", "WebRTC P2P")
          }
          this.rtcChannel.onmessage = (msgEv) => this.handleRtcDataMessage(msgEv.data)
        }

        await this.rtcPeer.setRemoteDescription(new RTCSessionDescription(payload.sdp))
        const answer = await this.rtcPeer.createAnswer()
        await this.rtcPeer.setLocalDescription(answer)
        this.subscription?.perform("webrtc_signal", {
          sender: this.peerId,
          sig_type: "answer",
          sdp: this.rtcPeer.localDescription.toJSON()
        })
      } else if (payload.sig_type === "ice_candidate" && payload.candidate && this.rtcPeer) {
        await this.rtcPeer.addIceCandidate(new RTCIceCandidate(payload.candidate))
      }
    } catch (err) {
      console.warn("[WebRTC P2P] Signaling fallback:", err)
    }
  }

  handleRtcDataMessage(rawString) {
    try {
      const msg = JSON.parse(rawString)
      if (msg.type === "scan_chunk") {
        if (!this.incomingChunks[msg.id]) {
          this.incomingChunks[msg.id] = { meta: msg, parts: new Array(msg.total) }
        }
        this.incomingChunks[msg.id].parts[msg.idx] = msg.chunk
        const entry = this.incomingChunks[msg.id]
        if (entry.parts.every((p) => typeof p === "string")) {
          const fullBase64 = entry.parts.join("")
          delete this.incomingChunks[msg.id]
          this.addPage({
            image: fullBase64,
            title: entry.meta.title || `P2P-Scan-${this.pages.length + 1}`,
            mode: "Document",
            filter: entry.meta.filter || "Auto-Flat",
            device: entry.meta.device || "Phone (WebRTC P2P)",
            transport: "WebRTC P2P (0 Server Bytes)",
            width: entry.meta.width || 1240,
            height: entry.meta.height || 1754
          })
        }
      }
    } catch (err) {
      console.error("[WebRTC P2P] Chunk parse error:", err)
    }
  }

  setP2pBadge(text) {
    if (this.hasP2pBadgeTarget) {
      this.p2pBadgeTarget.textContent = text
      this.p2pBadgeTarget.style.color = "#00673f"
      this.p2pBadgeTarget.style.background = "#e1f8eb"
    }
  }

  closeWebRtc() {
    try { this.rtcChannel?.close() } catch {}
    try { this.rtcPeer?.close() } catch {}
    this.rtcChannel = null
    this.rtcPeer = null
  }

  setConnected(connected) {
    if (this.connectedDeviceName && connected) return
    if (this.hasStatusDotTarget) {
      this.statusDotTarget.style.backgroundColor = connected ? "#f59e0b" : "#94a3b8"
    }
    if (this.hasStatusTextTarget) {
      this.statusTextTarget.textContent = connected
        ? "Waiting for iPhone or Android to scan QR…"
        : "Reconnecting…"
    }
  }

  setPhoneDeviceConnected(deviceName, transport = "WebRTC P2P") {
    this.connectedDeviceName = deviceName
    if (this.hasStatusDotTarget) {
      this.statusDotTarget.style.backgroundColor = "#00875a"
      this.statusDotTarget.style.boxShadow = "0 0 0 4px rgba(0, 135, 90, 0.2)"
    }
    if (this.hasStatusTextTarget) {
      this.statusTextTarget.textContent = `Connected: ${deviceName}`
      this.statusTextTarget.style.color = "#00673f"
      this.statusTextTarget.style.fontWeight = "600"
    }
    const banner = document.getElementById("connectedPhoneBanner")
    const nameEl = document.getElementById("connectedPhoneName")
    const modeEl = document.getElementById("connectedPhoneTransport")
    if (banner && nameEl) {
      nameEl.textContent = deviceName
      if (modeEl && transport) modeEl.textContent = `${transport} · Room ${this.roomValue}`
      banner.style.display = "flex"
    }
  }

  addPage(payload) {
    const cleanTitle = (payload.title || `Scan-${this.pages.length + 1}`).replace(/[<>'"&]/g, "")
    const device = payload.device || this.connectedDeviceName || "iPhone / Android"
    this.setPhoneDeviceConnected(device, payload.transport || "WebRTC P2P")
    this.pages.push({
      id: `page-${Date.now()}-${this.pages.length}`,
      image: payload.image,
      title: cleanTitle,
      mode: payload.mode || "Document",
      filter: payload.filter || "Auto-Flat",
      device: device,
      transport: payload.transport || "WebRTC P2P",
      rotation: 0,
      width: payload.width || 1240,
      height: payload.height || 1754
    })

    this.renderList()
    this.flash(`Photo #${this.pages.length} received (${payload.transport || "Direct P2P"}) — click "Open Scanned Photos in Studio →" below!`)
  }

  addSimulatedScan(event) {
    event?.preventDefault()
    const pageNum = this.pages.length + 1
    const canvas = document.createElement("canvas")
    canvas.width = 1000
    canvas.height = 1414
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#00875a"
    ctx.lineWidth = 4
    ctx.strokeRect(56, 56, canvas.width - 112, canvas.height - 112)

    ctx.fillStyle = "#0a0a0a"
    ctx.font = "bold 36px Helvetica, Arial, sans-serif"
    ctx.fillText(`SCANNED PAGE #0${pageNum}`, 96, 140)

    ctx.fillStyle = "#00875a"
    ctx.font = "22px Courier, monospace"
    ctx.fillText(`WebRTC Peer-to-Peer Scan · Room ${this.roomValue}`, 96, 185)

    ctx.fillStyle = "#334155"
    ctx.font = "24px Helvetica, Arial, sans-serif"
    const lines = [
      `Document Reference #${2040 + pageNum}`,
      "• High-contrast scan ready for live editing in the Studio.",
      "• Try rotating, signing, blacking out text, or target-size compression."
    ]
    lines.forEach((line, idx) => {
      ctx.fillText(line, 96, 260 + idx * 54)
    })

    const dataUrl = canvas.toDataURL("image/jpeg", 0.88)
    const base64 = dataUrl.split(",")[1]
    this.addPage({
      image: base64,
      title: `Scanned-Page-0${pageNum}`,
      mode: "Document",
      filter: "Auto-Flat",
      device: "iPhone (WebRTC P2P)",
      transport: "WebRTC P2P (0 Server Bytes)",
      width: canvas.width,
      height: canvas.height
    })
  }

  renderList() {
    if (this.hasCountTarget) this.countTarget.textContent = String(this.pages.length)
    if (this.hasEmptyTarget) this.emptyTarget.hidden = this.pages.length > 0
    if (this.hasStudioButtonTarget) this.studioButtonTarget.disabled = this.pages.length === 0
    if (this.hasClearButtonTarget) this.clearButtonTarget.disabled = this.pages.length === 0
    if (!this.hasListTarget) return

    this.listTarget.replaceChildren()

    this.pages.forEach((page, index) => {
      const card = document.createElement("div")
      card.style.cssText = "background:var(--surface-sunk);border:1px solid var(--outline);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px;"

      const thumbWrap = document.createElement("div")
      thumbWrap.style.cssText = "position:relative;background:#ffffff;border:1px solid var(--outline);border-radius:6px;height:150px;display:flex;align-items:center;justify-content:center;overflow:hidden;"

      const thumb = document.createElement("img")
      thumb.src = `data:image/jpeg;base64,${page.image}`
      thumb.alt = page.title
      thumb.style.cssText = `max-width:100%;max-height:100%;object-fit:contain;transform:rotate(${page.rotation || 0}deg);transition:transform 150ms;`

      const badge = document.createElement("span")
      badge.className = "mono"
      badge.textContent = `Page ${index + 1}`
      badge.style.cssText = "position:absolute;top:6px;left:6px;font-size:10px;background:#0a0a0a;color:#ffffff;padding:2px 7px;border-radius:4px;"

      thumbWrap.append(thumb, badge)

      const name = document.createElement("div")
      name.textContent = page.title
      name.style.cssText = "font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"

      const detail = document.createElement("div")
      detail.textContent = `📱 ${page.device || "Phone"} · ${page.transport || page.filter}`
      detail.style.cssText = "font-size:11px;color:var(--on-surface-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"

      const controls = document.createElement("div")
      controls.style.cssText = "display:flex;gap:4px;justify-content:space-between;"

      const rotBtn = document.createElement("button")
      rotBtn.type = "button"
      rotBtn.className = "btn-icon"
      rotBtn.textContent = "↻"
      rotBtn.title = "Rotate 90°"
      rotBtn.addEventListener("click", () => {
        page.rotation = ((page.rotation || 0) + 90) % 360
        this.renderList()
      })

      const upBtn = document.createElement("button")
      upBtn.type = "button"
      upBtn.className = "btn-icon"
      upBtn.textContent = "←"
      upBtn.title = "Move earlier"
      upBtn.disabled = index === 0
      upBtn.addEventListener("click", () => {
        if (index <= 0) return
        const tmp = this.pages[index - 1]
        this.pages[index - 1] = this.pages[index]
        this.pages[index] = tmp
        this.renderList()
      })

      const remove = document.createElement("button")
      remove.type = "button"
      remove.className = "btn-icon"
      remove.textContent = "×"
      remove.title = "Remove photo"
      remove.addEventListener("click", () => {
        this.pages.splice(index, 1)
        this.renderList()
      })

      controls.append(upBtn, rotBtn, remove)
      card.append(thumbWrap, name, detail, controls)
      this.listTarget.append(card)
    })
  }

  clearPages() {
    this.pages = []
    this.renderList()
    this.flash("Cleared scanned photos")
  }

  async sendToStudio(event) {
    event?.preventDefault()
    if (this.pages.length === 0) return
    const chosenTool = this.hasToolSelectTarget ? this.toolSelectTarget.value : "merge"
    await this.transferPhotosToStudio(chosenTool)
  }

  async transferPhotosToStudio(chosenTool) {
    if (!window.PDFLib) {
      this.flash("Loading PDF engine — please try again in a second")
      return
    }

    this.setBusy(true)

    try {
      const { PDFDocument, rgb, degrees } = window.PDFLib
      const mode = this.hasPaperTarget ? this.paperTarget.value : "A4"
      const [pageWidth, pageHeight] = this.constructor.PAPER_SIZES[mode] || this.constructor.PAPER_SIZES.A4

      const studioFiles = []

      for (let i = 0; i < this.pages.length; i++) {
        const page = this.pages[i]
        const rawJpgBytes = Uint8Array.from(atob(page.image), (c) => c.charCodeAt(0))
        const singleDoc = await PDFDocument.create()
        singleDoc.setTitle(page.title)
        singleDoc.setAuthor(page.device || "Phone Scanner")
        const embedded = await singleDoc.embedJpg(rawJpgBytes)

        const sheet = singleDoc.addPage([pageWidth, pageHeight])
        const scale = Math.min(pageWidth / embedded.width, pageHeight / embedded.height)
        const drawW = embedded.width * scale
        const drawH = embedded.height * scale

        sheet.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(1, 1, 1) })
        sheet.drawImage(embedded, {
          x: (pageWidth - drawW) / 2,
          y: (pageHeight - drawH) / 2,
          width: drawW,
          height: drawH
        })
        if (page.rotation) {
          sheet.setRotation(degrees(page.rotation))
        }

        const pdfBytes = await singleDoc.save()
        studioFiles.push({
          name: `${page.title.replace(/\.[^.]+$/, "")}.pdf`,
          bytes: pdfBytes,
          imageBase64: page.image,
          filter: page.filter,
          device: page.device || "iPhone / Android",
          pageCount: 1,
          textPreview: [`Scanned photo ${i + 1} from ${page.device || "Phone"}`]
        })
      }

      const studioTool = (chosenTool && chosenTool !== "studio_home") ? chosenTool : "merge"
      await this.saveToStudioIndexedDB(studioFiles, studioTool)

      try {
        if (typeof BroadcastChannel === "function") {
          const bc = new BroadcastChannel(STUDIO_CHANNEL)
          bc.postMessage({ type: "handoff-batch", files: studioFiles, tool: studioTool })
          bc.close()
        }
      } catch {}

      window.location.href = `/?from=scanner&tool=${encodeURIComponent(studioTool)}`
    } catch (error) {
      console.error("[scanner] Studio handoff failed", error)
      this.flash("Could not open Studio — please try again")
    } finally {
      this.setBusy(false)
    }
  }

  saveToStudioIndexedDB(studioFiles, chosenTool) {
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(STUDIO_DB_NAME, 1)
        req.onupgradeneeded = (e) => {
          const db = e.target.result
          if (!db.objectStoreNames.contains(STUDIO_STORE_NAME)) {
            db.createObjectStore(STUDIO_STORE_NAME, { keyPath: "id" })
          }
        }
        req.onsuccess = (e) => {
          const db = e.target.result
          const tx = db.transaction(STUDIO_STORE_NAME, "readwrite")
          const store = tx.objectStore(STUDIO_STORE_NAME)
          store.put({
            id: "latest_scan_batch",
            timestamp: Date.now(),
            tool: chosenTool,
            files: studioFiles
          })
          tx.oncomplete = () => {
            db.close()
            resolve(true)
          }
          tx.onerror = () => resolve(false)
        }
        req.onerror = () => resolve(false)
      } catch {
        resolve(false)
      }
    })
  }

  setBusy(busy) {
    if (this.hasStudioButtonTarget) {
      this.studioButtonTarget.disabled = busy || this.pages.length === 0
      this.studioButtonTarget.textContent = busy
        ? "Opening in Studio Workspace…"
        : "Open Scanned Photos in Studio →"
    }
  }

  flash(message) {
    if (!this.hasFlashTarget) return
    this.flashTarget.textContent = message
    clearTimeout(this.flashTimer)
    this.flashTimer = setTimeout(() => {
      if (this.flashTarget) this.flashTarget.textContent = ""
    }, 5000)
  }
}
