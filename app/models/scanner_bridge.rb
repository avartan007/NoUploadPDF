# Local, in-memory pairing details for the Phone (iPhone & Android) -> Mac/Desktop scanner bridge.
#
# There is no database and no persistence: a cryptographic room code is generated
# per desktop page load, the QR code points any iPhone or Android camera at
# /scan/<room_code>, and both sides meet on the same ActionCable stream in memory.
require "securerandom"

class ScannerBridge
  ROOM_CODE_LENGTH = 8
  ROOM_CODE_ALPHABET = ("A".."Z").to_a + ("2".."9").to_a - %w[I O]
  ROOM_CODE_FORMAT = /\A[A-Z0-9]{4,12}\z/

  class << self
    def new_room_code
      Array.new(ROOM_CODE_LENGTH) { ROOM_CODE_ALPHABET[SecureRandom.random_number(ROOM_CODE_ALPHABET.size)] }.join
    end

    def normalize_room_code(raw)
      code = raw.to_s.upcase.gsub(/[^A-Z0-9]/, "")
      code if code.match?(ROOM_CODE_FORMAT)
    end

    # Best private IPv4 address of this machine, used to build the LAN URL that
    # an iPhone or Android phone opens when scanning the QR code.
    def lan_ip
      candidates = Socket.ip_address_list.select do |addr|
        addr.ipv4? && !addr.ipv4_loopback? && !addr.ipv4_multicast?
      end

      private_addr = candidates.find(&:ipv4_private?)
      (private_addr || candidates.first)&.ip_address || "127.0.0.1"
    end

    def phone_url(request:, room_code:)
      is_local = %w[localhost 127.0.0.1 ::1].include?(request.host.to_s.downcase)
      if is_local
        port = request.port
        host = lan_ip
        default_port = (request.protocol == "https://" && port == 443) || (request.protocol == "http://" && port == 80)
        authority = default_port ? host : "#{host}:#{port}"
        "#{request.protocol}#{authority}/scan/#{room_code}"
      else
        "#{request.base_url}/scan/#{room_code}"
      end
    end
  end
end
