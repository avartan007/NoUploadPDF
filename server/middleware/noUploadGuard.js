// Express Zero-Upload Security Guard Middleware
// Rejects any multipart/form-data, application/pdf, or binary file upload with HTTP 403 Forbidden.
import { SECURITY_HEADERS } from "../../src/data/toolCatalog.js";

export function noUploadGuardMiddleware(req, res, next) {
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => {
    res.setHeader(k, v);
  });

  const method = (req.method || "GET").toUpperCase();
  const contentType = (req.headers["content-type"] || "").toLowerCase();

  if (
    ["POST", "PUT", "PATCH"].includes(method) ||
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/pdf") ||
    contentType.includes("application/octet-stream")
  ) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "UPLOAD_BLOCKED_BY_SERVER_POLICY",
        status: 403,
        message: "NoUploadPDF never accepts file uploads. All 28 PDF tools execute 100% inside your browser RAM."
      })
    );
    return;
  }

  next();
}
