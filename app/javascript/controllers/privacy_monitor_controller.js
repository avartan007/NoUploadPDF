import { Controller } from "@hotwired/stimulus"

// Real (not cosmetic) outbound-request monitor.
// Import this file EARLY in application.js so the wrappers install before other code runs.
const S = (window.__nupMonitor ||= {
  log: [], dataRequests: 0, totalRequests: 0, bytesOut: 0, thirdParty: 0, signaling: 0, listeners: new Set()
})

function bodySize(body) {
  if (!body) return 0
  if (typeof body === "string") return new Blob([body]).size
  if (body instanceof Blob) return body.size
  if (body instanceof ArrayBuffer) return body.byteLength
  if (ArrayBuffer.isView(body)) return body.byteLength
  if (body instanceof URLSearchParams) return body.toString().length
  if (body instanceof FormData) {
    let n = 0
    for (const [, v] of body) n += v instanceof Blob ? v.size : String(v).length
    return n
  }
  return 1 // unknown body type: count it, never hide it
}

function record(kind, method, url, bytes) {
  let abs
  try { abs = new URL(url, location.href) } catch { return }
  const sameOrigin = abs.origin === location.origin
  S.log.push({ t: Date.now(), kind, method, url: abs.href, bytes, sameOrigin })
  if (S.log.length > 200) S.log.shift()
  if (kind === "websocket") S.signaling++
  else {
    S.totalRequests++
    if (bytes > 0) { S.dataRequests++; S.bytesOut += bytes }
    if (!sameOrigin) S.thirdParty++
  }
  S.listeners.forEach((fn) => fn(S))
}

if (!window.__nupPatched) {
  window.__nupPatched = true

  const _fetch = window.fetch
  window.fetch = function (input, init) {
    const req = input instanceof Request ? input : null
    const method = (init && init.method) || (req && req.method) || "GET"
    const bytes = init && init.body !== undefined ? bodySize(init.body) : req && req.body ? 1 : 0
    record("fetch", method, req ? req.url : String(input), bytes)
    return _fetch.apply(this, arguments)
  }

  const _open = XMLHttpRequest.prototype.open
  const _send = XMLHttpRequest.prototype.send
  XMLHttpRequest.prototype.open = function (m, u) { this.__nup = { m, u }; return _open.apply(this, arguments) }
  XMLHttpRequest.prototype.send = function (body) {
    if (this.__nup) record("xhr", this.__nup.m, this.__nup.u, bodySize(body))
    return _send.apply(this, arguments)
  }

  if (navigator.sendBeacon) {
    const _beacon = navigator.sendBeacon.bind(navigator)
    navigator.sendBeacon = (url, data) => { record("beacon", "POST", url, bodySize(data) || 1); return _beacon(url, data) }
  }

  // WebSocket traffic (ActionCable signaling) is tracked separately and labelled honestly.
  const _wsSend = WebSocket.prototype.send
  WebSocket.prototype.send = function (d) { record("websocket", "SEND", this.url, bodySize(d)); return _wsSend.apply(this, arguments) }

  // Catch every cross-origin resource the page loads (fonts, scripts, images...).
  try {
    new PerformanceObserver((list) => {
      list.getEntries().forEach((e) => {
        const u = new URL(e.name)
        if (u.origin !== location.origin) record("resource", "GET", e.name, 0)
      })
    }).observe({ type: "resource", buffered: true })
  } catch (_) {}
}

export default class extends Controller {
  static targets = ["data", "total", "third", "bytes", "signal", "log", "verdict"]

  connect() {
    this.fn = () => this.render()
    S.listeners.add(this.fn)
    this.render()
  }
  disconnect() { S.listeners.delete(this.fn) }

  render() {
    const set = (t, v) => t && (t.textContent = v)
    set(this.hasDataTarget && this.dataTarget, S.dataRequests)
    set(this.hasTotalTarget && this.totalTarget, S.totalRequests)
    set(this.hasThirdTarget && this.thirdTarget, S.thirdParty)
    set(this.hasBytesTarget && this.bytesTarget, S.bytesOut + " B")
    set(this.hasSignalTarget && this.signalTarget, S.signaling)
    if (this.hasVerdictTarget) {
      const clean = S.dataRequests === 0
      this.verdictTarget.textContent = clean ? "✔ Nothing carrying your data has left this tab" : "⚠ A request with a body was sent. See the log"
      this.verdictTarget.dataset.state = clean ? "ok" : "warn"
    }
    if (this.hasLogTarget) {
      this.logTarget.replaceChildren(
        ...S.log.slice(-30).reverse().map((e) => {
          const li = document.createElement("li")
          li.textContent = `${new Date(e.t).toLocaleTimeString()} ${e.kind.toUpperCase()} ${e.method} ${e.url} (${e.bytes} B)${e.sameOrigin ? "" : " · THIRD-PARTY"}`
          return li
        })
      )
    }
  }
}
