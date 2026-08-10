/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: every route is pre-rendered to HTML at build time and
  // served by the Supramono CDN (S3 + CloudFront). No server runtime.
  output: "export",
  // Directory-style output (/blog/post/index.html) — matches the CDN's
  // extensionless-path rewrite convention.
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    // Bridge: the Supramono build pipeline provides SUPRAMONO_API_URL /
    // SUPRAMONO_PUBLIC_KEY; local dev may use the NEXT_PUBLIC_ names.
    // Declaring them here inlines the values into BOTH the build-time and
    // browser bundles (they are public by design — see .env.example).
    NEXT_PUBLIC_SUPRAMONO_API_URL:
      process.env.NEXT_PUBLIC_SUPRAMONO_API_URL ??
      process.env.SUPRAMONO_API_URL ??
      "https://supramono.com",
    NEXT_PUBLIC_SUPRAMONO_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_SUPRAMONO_PUBLIC_KEY ??
      process.env.SUPRAMONO_PUBLIC_KEY ??
      "",
  },
};

export default nextConfig;
