import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Caching is handled explicitly per route (revalidate + unstable_cache)
  // rather than by the component cache, because nearly every admin route
  // reads the session cookie and must stay dynamic.
  poweredByHeader: false,
  reactStrictMode: true,

  // The dev server is reached over 127.0.0.1 during local testing.
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  turbopack: {
    rules: {
      // Scope to project CSS only — using *.css would also match
      // Next.js internal font CSS ([next]/internal/font/google/...)
      // and break next/font/google resolution.
      "./src/**/*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
