require "test_helper"

class ScannerBridgeChannelTest < ActionCable::Channel::TestCase
  tests ScannerBridgeChannel

  test "subscribes to a room specific stream" do
    subscribe room_code: "ab12cd"

    assert_predicate subscription, :confirmed?
    assert_has_stream "scanner_bridge_AB12CD"
  end

  test "rejects an invalid room code" do
    subscribe room_code: "!!"

    assert_predicate subscription, :rejected?
  end

  test "relays a captured frame to everyone in the room" do
    subscribe room_code: "ROOM01"

    perform :relay_scan_frame, {
      "image" => "jpeg-base64",
      "title" => "Page 1",
      "mode" => "Document",
      "filter" => "Auto-Flat",
      "width" => 1240,
      "height" => 1754
    }

    assert_broadcast_on("scanner_bridge_ROOM01", {
      event: "incoming_page",
      image: "jpeg-base64",
      title: "Page 1",
      mode: "Document",
      filter: "Auto-Flat",
      width: 1240,
      height: 1754
    })
  end

  test "drops frames larger than the relay limit" do
    subscribe room_code: "ROOM02"

    perform :relay_scan_frame, { "image" => "a" * (ScannerBridgeChannel::MAX_FRAME_BYTES + 1) }

    assert_no_broadcasts "scanner_bridge_ROOM02"
  end

  test "asks the paired phone to capture" do
    subscribe room_code: "ROOM03"

    perform :request_capture

    assert_broadcast_on("scanner_bridge_ROOM03", { event: "capture_requested" })
  end
end
