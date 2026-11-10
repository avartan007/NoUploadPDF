require "test_helper"

class ScannerBridgeModelTest < ActiveSupport::TestCase
  test "normalizes room codes" do
    assert_equal "AB12CD", ScannerBridge.normalize_room_code("ab-12 cd")
    assert_equal "AB12CD", ScannerBridge.normalize_room_code(" AB12CD ")
  end

  test "rejects junk room codes" do
    assert_nil ScannerBridge.normalize_room_code("!!")
    assert_nil ScannerBridge.normalize_room_code("")
    assert_nil ScannerBridge.normalize_room_code("A")
    assert_nil ScannerBridge.normalize_room_code("A" * 13)
  end

  test "generates a six character code" do
    code = ScannerBridge.new_room_code

    assert_match(/\A[A-Z0-9]{6}\z/, code)
    assert_equal 6, code.length
  end

  test "builds a LAN phone url" do
    request = Struct.new(:protocol, :port).new("http://", 3005)

    url = ScannerBridge.phone_url(request: request, room_code: "ABC123")

    assert_match %r{\Ahttps?://\d+\.\d+\.\d+\.\d+:3005/scan/ABC123\z}, url
  end
end
