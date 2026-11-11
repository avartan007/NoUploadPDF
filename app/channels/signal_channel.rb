# Relays ONLY small WebRTC handshake messages (SDP + ICE).
# Photos travel peer-to-peer over the WebRTC DataChannel and never touch this server.
class SignalChannel < ApplicationCable::Channel
  ROOM = /\A[A-Z0-9]{8}\z/
  TYPES = %w[ready offer answer ice].freeze
  MAX_BYTES = 8_192

  def subscribed
    room = params[:room].to_s
    return reject unless room.match?(ROOM)

    @room = room
    stream_from "signal:#{room}"
  end

  def receive(data)
    return unless data.is_a?(Hash)

    msg = data.slice("type", "from", "sdp", "candidate")
    return unless TYPES.include?(msg["type"])
    return if msg.to_json.bytesize > MAX_BYTES

    ActionCable.server.broadcast("signal:#{@room}", msg)
  end
end
