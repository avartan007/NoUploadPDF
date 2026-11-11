module NoUploadPdf
  class NoUploadGuardMiddleware
    SECURITY_HEADERS = {
      "X-NoUploadPDF-Zero-Storage" => "verified-0-bytes",
      "X-NoUploadPDF-Privacy"      => "processed-in-browser-0-bytes-uploaded",
      "X-Content-Type-Options"     => "nosniff",
      "X-Frame-Options"            => "DENY",
      "Referrer-Policy"            => "no-referrer",
      "Cross-Origin-Opener-Policy" => "same-origin",
      "Cross-Origin-Resource-Policy" => "same-origin",
      "Permissions-Policy"         => "camera=(self), microphone=(), geolocation=(), payment=(), usb=()"
    }.freeze

    BLOCKED_CONTENT_TYPES = %w[
      multipart/form-data
      application/pdf
      application/octet-stream
      image/jpeg
      image/png
      image/webp
      application/zip
    ].freeze

    def initialize(app)
      @app = app
    end

    def call(env)
      content_type = env["CONTENT_TYPE"].to_s.downcase
      request_method = env["REQUEST_METHOD"].to_s.upcase

      # Block any attempt to upload files or binary payloads to HTTP endpoints
      if %w[POST PUT PATCH].include?(request_method) &&
         BLOCKED_CONTENT_TYPES.any? { |t| content_type.include?(t) }
        return [
          403,
          SECURITY_HEADERS.merge(
            "Content-Type" => "application/json; charset=utf-8",
            "X-NoUploadPDF-Policy" => "0-bytes-uploaded-enforced"
          ),
          ['{"error":"NoUploadPDF Security Policy: Server-side file uploads are blocked (HTTP 403). All 28 PDF tools process files 100% locally in browser memory."}']
        ]
      end

      status, headers, response = @app.call(env)
      SECURITY_HEADERS.each { |k, v| headers[k] ||= v }
      [status, headers, response]
    end
  end
end
