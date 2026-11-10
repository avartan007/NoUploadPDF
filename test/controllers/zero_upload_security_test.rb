require "test_helper"

class ZeroUploadSecurityTest < ActionDispatch::IntegrationTest
  test "blocks multipart file uploads at middleware boundary" do
    post "/", headers: { "CONTENT_TYPE" => "multipart/form-data; boundary=---123" }
    assert_response :forbidden
    assert_equal "0-bytes-uploaded-enforced", response.headers["X-NoUploadPDF-Policy"]
  end
end
