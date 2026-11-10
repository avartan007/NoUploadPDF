class ScannerBridgeChannel < ApplicationCable::Channel
  # Signaling & fallback channel for the Phone -> Studio scanner.
  # Primary transfer uses WebRTC peer-to-peer RTCDataChannel (`webrtc_signal`)
  # so photo bytes travel directly from the phone browser to the desktop browser
  # with zero server inspection.
  MAX_FRAME_BYTES  = 12.megabytes
  MAX_TITLE_LENGTH = 100
  BASE64_REGEX     = /\A[A-Za-z0-9+\/\r\n]+=*\z/
  ALLOWED_FILTERS  = ["Auto-Flat", "B&W Document", "Grayscale", "Original Color", "High-Contrast Ink"].freeze

  def subscribed
    if room_code.blank?
      reject
    else
      stream_from stream_name
    end
  end

  def announce_device(data)
    clean_device = data["device"].to_s.gsub(/[^A-Za-z0-9 _\-\/\.\(\)]/, "").first(40).presence || "iPhone / Android"
    ActionCable.server.broadcast(stream_name, {
      event: "device_connected",
      device: clean_device,
      transport: data["transport"].to_s == "webrtc" ? "WebRTC P2P" : "Ready",
      timestamp: Time.now.utc.iso8601
    })
  end

  def request_device_ping
    ActionCable.server.broadcast(stream_name, { event: "ping_device" })
  end

  # WebRTC SDP Offer / Answer / ICE Candidate signaling (0 image bytes touch server)
  def webrtc_signal(data)
    sig_type = data["sig_type"].to_s
    return unless %w[offer answer ice_candidate p2p_ready].include?(sig_type)

    ActionCable.server.broadcast(stream_name, {
      event: "webrtc_signal",
      sender: data["sender"].to_s.first(16),
      sig_type: sig_type,
      sdp: data["sdp"],
      candidate: data["candidate"],
      device: data["device"].to_s.gsub(/[^A-Za-z0-9 _\-\/\.\(\)]/, "").first(40)
    })
  end

  # Fallback LAN relay only when WebRTC P2P is unavailable on restricted networks
  def relay_scan_frame(data)
    image = data["image"].to_s.strip
    return if image.blank? || image.bytesize > MAX_FRAME_BYTES
    return unless image.match?(BASE64_REGEX)

    clean_title = data["title"].to_s.gsub(/[<>'"&\\\/]/, "").strip.first(MAX_TITLE_LENGTH)
    clean_title = "Scanned Page" if clean_title.blank?
    clean_filter = ALLOWED_FILTERS.include?(data["filter"].to_s) ? data["filter"].to_s : "Auto-Flat"
    clean_device = data["device"].to_s.gsub(/[^A-Za-z0-9 _\-\/\.\(\)]/, "").first(40).presence || "iPhone / Android"

    ActionCable.server.broadcast(stream_name, {
      event: "incoming_page",
      image: image,
      title: clean_title,
      mode: "Document",
      filter: clean_filter,
      device: clean_device,
      transport: "LAN Fallback",
      width: data["width"].to_i.clamp(1, 8000),
      height: data["height"].to_i.clamp(1, 8000),
      timestamp: Time.now.utc.iso8601
    })
  end

  def request_capture
    ActionCable.server.broadcast(stream_name, { event: "capture_requested" })
  end

  private

  def room_code
    @room_code ||= ScannerBridge.normalize_room_code(params[:room_code])
  end

  def stream_name
    "scanner_bridge_#{room_code}"
  end
end
