class ScannerController < ApplicationController
  before_action :set_no_store_headers

  # Desktop / Mac side: shows the pairing QR for iPhone & Android + the Studio handoff tray.
  def index
    @room_code = ScannerBridge.new_room_code
    @phone_url = ScannerBridge.phone_url(request: request, room_code: @room_code)
  end

  # Phone side (iPhone iOS Safari/Chrome or Android Chrome/Samsung/Pixel):
  # camera capture page opened by scanning the QR code.
  def phone
    @room_code = ScannerBridge.normalize_room_code(params[:room_code])
    @valid_room = @room_code.present?

    render :phone, layout: "scanner_phone"
  end

  private

  def set_no_store_headers
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
  end
end
