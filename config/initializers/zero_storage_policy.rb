# Enforces that Rails never writes temporary multipart files to /tmp or disk
Rack::Multipart::Parser::TEMPFILE_FACTORY = lambda { |filename, content_type|
  raise ActionController::BadRequest, "NoUploadPDF Policy: Server-side file uploads are disabled (0 bytes uploaded)."
}
