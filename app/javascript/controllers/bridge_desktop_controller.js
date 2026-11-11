import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

// Desktop side of the phone -> Studio bridge (WebRTC DataChannel, peer-to-peer).
// On receiving a photo it fires window event "bridge:photo" with { blob, name }.
// Listen for it in your Studio queue code and add the blob as a file.
export default class extends Controller {
  static targets = ["url", "status", "count"]
  static values = { useStun: { type: Boolean, default: false } }

  connect() {
    this.room = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("")
    this.me = crypto.randomUUID()
    this.chunks = []
    this.meta = null
    this.received = 0
    const link = `${location.origin}/scan/${this.room}`
    if (this.hasUrlTarget) this.urlTarget.value = link
    window.dispatchEvent(new CustomEvent("bridge:url", { detail: { url: link, room: this.room } })) // render your QR from this
    this.status("Waiting for phone…")

    this.sub = createConsumer().subscriptions.create({ channel: "SignalChannel", room: this.room }, {
      received: (m) => this.onSignal(m)
    })
  }

  disconnect() {
    this.dc?.close(); this.pc?.close(); this.sub?.unsubscribe()
  }

  send(msg) { this.sub.send({ ...msg, from: this.me }) }
  status(t) { if (this.hasStatusTarget) this.statusTarget.textContent = t }

  async onSignal(m) {
    if (m.from === this.me) return
    try {
      if (m.type === "ready") return this.startPeer()
      if (m.type === "answer") return this.pc?.setRemoteDescription({ type: "answer", sdp: m.sdp })
      if (m.type === "ice" && this.pc) return this.pc.addIceCandidate(m.candidate)
    } catch (e) { console.warn("signal error", e) }
  }

  async startPeer() {
    this.pc?.close()
    // No STUN by default => nothing contacts a third party; works on the same Wi-Fi.
    const iceServers = this.useStunValue ? [{ urls: "stun:stun.l.google.com:19302" }] : []
    this.pc = new RTCPeerConnection({ iceServers })
    this.dc = this.pc.createDataChannel("photos")
    this.dc.binaryType = "arraybuffer"
    this.dc.onopen = () => this.status("● Phone connected (peer-to-peer)")
    this.dc.onclose = () => this.status("Phone disconnected")
    this.dc.onmessage = (e) => this.onData(e.data)
    this.pc.onicecandidate = (e) => e.candidate && this.send({ type: "ice", candidate: e.candidate.toJSON() })
    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)
    this.send({ type: "offer", sdp: offer.sdp })
  }

  async onData(d) {
    if (typeof d === "string") {
      const m = JSON.parse(d)
      if (m.t === "start") { this.meta = m; this.chunks = [] }
      if (m.t === "end" && this.meta) {
        const blob = new Blob(this.chunks, { type: "image/jpeg" })
        const hash = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer())
        const hex = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("")
        if (hex !== m.sha) return this.status("⚠ Photo rejected: checksum mismatch")
        this.received++
        if (this.hasCountTarget) this.countTarget.textContent = this.received
        window.dispatchEvent(new CustomEvent("bridge:photo", { detail: { blob, name: `scan-${this.received}.jpg`, sha256: hex } }))
        this.meta = null
      }
    } else {
      this.chunks.push(d)
    }
  }
}
