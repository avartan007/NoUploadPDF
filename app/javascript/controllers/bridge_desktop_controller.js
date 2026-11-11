import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

// Desktop side of the phone -> Studio bridge (WebRTC DataChannel, peer-to-peer).
// Enforces 4-digit SAS confirmation code, single-peer lock, magic-byte validation, and SHA-256 verification.
export default class extends Controller {
  static targets = ["url", "status", "count", "sas"]
  static values = { useStun: { type: Boolean, default: false } }

  connect() {
    this.room = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("")
    this.me = crypto.randomUUID()
    this.lockedPeer = null
    this.approved = false
    this.sasCode = String(1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000))
    this.chunks = []
    this.meta = null
    this.received = 0
    const link = `${location.origin}/scan/${this.room}`
    if (this.hasUrlTarget) this.urlTarget.value = link
    if (this.hasSasTarget) this.sasTarget.textContent = this.sasCode
    window.dispatchEvent(new CustomEvent("bridge:url", { detail: { url: link, room: this.room, sas: this.sasCode } }))
    this.status(`Waiting for phone… (Verify code ${this.sasCode})`)

    this.sub = createConsumer().subscriptions.create({ channel: "SignalChannel", room: this.room }, {
      received: (m) => this.onSignal(m)
    })
  }

  disconnect() {
    this.dc?.close(); this.pc?.close(); this.sub?.unsubscribe()
  }

  send(msg) { this.sub.send({ ...msg, from: this.me }) }
  status(t) { if (this.hasStatusTarget) this.statusTarget.textContent = t }

  approvePeer() {
    this.approved = true
    this.send({ type: "sas_approved", sas: this.sasCode })
    this.status(`● Phone verified & locked (Code ${this.sasCode})`)
  }

  rejectPeer() {
    this.approved = false
    this.lockedPeer = null
    this.send({ type: "sas_rejected" })
    this.dc?.close()
    this.pc?.close()
    this.status("Connection rejected. Generate a new QR to pair.")
  }

  async onSignal(m) {
    if (m.from === this.me) return
    if (this.lockedPeer && m.from !== this.lockedPeer) {
      console.warn("[Security] Blocked third-party peer attempt in locked room:", m.from)
      return
    }
    try {
      if (m.type === "ready") {
        this.lockedPeer = m.from
        return this.startPeer()
      }
      if (m.type === "answer") return this.pc?.setRemoteDescription({ type: "answer", sdp: m.sdp })
      if (m.type === "ice" && this.pc) return this.pc.addIceCandidate(m.candidate)
    } catch (e) { console.warn("signal error", e) }
  }

  async startPeer() {
    this.pc?.close()
    const iceServers = this.useStunValue ? [{ urls: "stun:stun.l.google.com:19302" }] : []
    this.pc = new RTCPeerConnection({ iceServers })
    this.dc = this.pc.createDataChannel("photos", { ordered: true })
    this.dc.binaryType = "arraybuffer"
    this.dc.onopen = () => {
      this.dc.send(JSON.stringify({ t: "sas_challenge", sas: this.sasCode }))
      window.dispatchEvent(new CustomEvent("bridge:sas_prompt", { detail: { sas: this.sasCode, peer: this.lockedPeer } }))
      this.status(`Is this your phone? Confirm code ${this.sasCode}`)
    }
    this.dc.onclose = () => this.status("Phone disconnected")
    this.dc.onmessage = (e) => this.onData(e.data)
    this.pc.onicecandidate = (e) => e.candidate && this.send({ type: "ice", candidate: e.candidate.toJSON() })
    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)
    this.send({ type: "offer", sdp: offer.sdp, sas: this.sasCode })
  }

  async onData(d) {
    if (typeof d === "string") {
      const m = JSON.parse(d)
      if (m.t === "sas_confirm" && m.sas === this.sasCode) {
        this.approved = true
        this.status(`● Phone connected & verified (${this.sasCode})`)
        return
      }
      if (!this.approved) {
        return this.status(`⚠ Waiting for 4-digit code confirmation (${this.sasCode})`)
      }
      if (m.t === "start") {
        if (m.size > 12 * 1024 * 1024) return this.status("⚠ Frame rejected: exceeds 12 MB limit")
        this.meta = m
        this.chunks = []
      }
      if (m.t === "end" && this.meta) {
        const blob = new Blob(this.chunks, { type: "image/jpeg" })
        const buf = await blob.arrayBuffer()
        const u8 = new Uint8Array(buf)
        const isJpeg = u8.length > 3 && u8[0] === 0xFF && u8[1] === 0xD8 && u8[2] === 0xFF
        const isPng = u8.length > 4 && u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4E && u8[3] === 0x47
        if (!isJpeg && !isPng) return this.status("⚠ Frame rejected: invalid image header")
        const hash = await crypto.subtle.digest("SHA-256", buf)
        const hex = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("")
        if (hex !== m.sha) return this.status("⚠ Photo rejected: SHA-256 checksum mismatch")
        this.received++
        if (this.hasCountTarget) this.countTarget.textContent = this.received
        window.dispatchEvent(new CustomEvent("bridge:photo", { detail: { blob, name: `scan-${this.received}.jpg`, sha256: hex } }))
        this.meta = null
      }
    } else if (this.approved) {
      this.chunks.push(d)
    }
  }
}
