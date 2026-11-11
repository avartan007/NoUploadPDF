# Relays ONLY small WebRTC handshake messages (SDP + ICE + 4-digit SAS verification).
# Photos travel peer-to-peer over the WebRTC DataChannel and never touch this server.
class SignalChannel < ApplicationCable::Channel
  ROOM = /\A[A-Z0-9\-]{6,20}\z/
  TYPES = %w[ready offer answer ice sas_verify sas_approved sas_rejected].freeze
  MAX_BYTES = 8_192

  def subscribed
    room = params[:room].to_s.upcase.strip
    return reject unless room.match?(ROOM)

    @room = room
    stream_from "signal:#{room}"
  end

  def receive(data)
    return unless data.is_a?(Hash)

    msg = data.slice("type", "from", "sdp", "candidate", "sas", "device")
    return unless TYPES.include?(msg["type"].to_s)
    return if msg.to_json.bytesize > MAX_BYTES

    # Sanitize strings to prevent XSS or injection over signaling
    msg["from"] = msg["from"].to_s.gsub(/[^a-zA-Z0-9\-]/, "").first(40)
    msg["sas"] = msg["sas"].to_s.gsub(/[^0-9]/, "").first(4) if msg["sas"]
    msg["device"] = msg["device"].to_s.gsub(/[^a-zA-Z0-9 _\-\/\.\(\)]/, "").first(40) if msg["device"]

    ActionCable.server.broadcast("signal:#{@room}", msg)
  end
end
