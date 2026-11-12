import { SECURITY_HEADERS } from "./src/data/toolCatalog.js";

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir: "out",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: Object.entries(SECURITY_HEADERS).map(([key, value]) => ({ key, value }))
      }
    ];
  }
};

export default nextConfig;
