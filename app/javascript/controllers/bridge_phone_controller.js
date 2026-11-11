import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

const CHUNK = 16 * 1024

// Phone side. Markup: data-controller="bridge-phone" data-bridge-phone-room-value="<%= params[:id] %>"
// Needs HTTPS for the live camera. The file-input fallback (capture) works everywhere.
export default class extends Controller {
  static targets = ["video", "status", "fallback", "sent"]
  static values = { room: String, useStun: { type: Boolean, default: false } }

  async connect() {
    this.me = crypto.randomUUID()
    this.sentCount = 0
    this.sub = createConsumer().subscriptions.create({ channel: "SignalChannel", room: this.roomValue }, {
      connected: () => this.send({ type: "ready" }),
      received: (m) => this.onSignal(m)
    })
    this.startCamera()
  }

  disconnect() {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.dc?.close(); this.pc?.close(); this.sub?.unsubscribe()
  }

  send(m) { this.sub.send({ ...m, from: this.me }) }
  status(t) { if (this.hasStatusTarget) this.statusTarget.textContent = t }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } }, audio: false })
      this.videoTarget.srcObject = this.stream
      await this.videoTarget.play()
    } catch (e) {
      if (this.hasFallbackTarget) this.fallbackTarget.hidden = false // show <input type=file accept=image/* capture=environment>
      this.status("Camera unavailable. Use “Take photo” instead.")
    }
  }

  async onSignal(m) {
    if (m.from === this.me) return
    try {
      if (m.type === "offer") {
        this.pc?.close()
        const iceServers = this.useStunValue ? [{ urls: "stun:stun.l.google.com:19302" }] : []
        this.pc = new RTCPeerConnection({ iceServers })
        this.pc.onicecandidate = (e) => e.candidate && this.send({ type: "ice", candidate: e.candidate.toJSON() })
        this.pc.ondatachannel = (e) => {
          this.dc = e.channel
          this.dc.bufferedAmountLowThreshold = 1 << 20
          this.dc.onopen = () => this.status("● Connected to your computer")
          this.dc.onclose = () => this.status("Disconnected")
        }
        await this.pc.setRemoteDescription({ type: "offer", sdp: m.sdp })
        const answer = await this.pc.createAnswer()
        await this.pc.setLocalDescription(answer)
        this.send({ type: "answer", sdp: answer.sdp })
      } else if (m.type === "ice" && this.pc) {
        await this.pc.addIceCandidate(m.candidate)
      }
    } catch (e) { console.warn("signal error", e) }
  }

  capture() {
    const v = this.videoTarget
    const c = document.createElement("canvas")
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext("2d").drawImage(v, 0, 0)
    c.toBlob((b) => b && this.sendBlob(b), "image/jpeg", 0.88)
  }

  fileChosen(e) { [...e.target.files].forEach((f) => this.sendBlob(f)); e.target.value = "" }

  async sendBlob(blob) {
    if (!this.dc || this.dc.readyState !== "open") return this.status("Not connected yet. Wait for the green dot.")
    const buf = await blob.arrayBuffer()
    const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", buf))].map((b) => b.toString(16).padStart(2, "0")).join("")
    this.dc.send(JSON.stringify({ t: "start", size: buf.byteLength }))
    for (let i = 0; i < buf.byteLength; i += CHUNK) {
      while (this.dc.bufferedAmount > 4 << 20) await new Promise((r) => this.dc.addEventListener("bufferedamountlow", r, { once: true }))
      this.dc.send(buf.slice(i, i + CHUNK))
    }
    this.dc.send(JSON.stringify({ t: "end", sha }))
    this.sentCount++
    if (this.hasSentTarget) this.sentTarget.textContent = this.sentCount
  }
}
