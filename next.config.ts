import type { NextConfig } from "next";

// Facebook previews (og:url, og:image) and the sitemap need the real public
// address. Shares already use the visitor's address, but previews cannot.
const siteUrl = process.env.SITE_URL ?? "";
if (process.argv.includes("build") && !/^https:\/\/(?!localhost|127\.)/.test(siteUrl)) {
  console.warn(`\n⚠ SITE_URL is "${siteUrl}". Set it to the public https address (e.g. https://myanganbuu.mn) or Facebook previews will break.\n`);
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Native modules stay out of the server bundle.
  serverExternalPackages: ["sharp", "@node-rs/argon2", "@react-pdf/renderer"],
  // Photos don't use next/image: variants are generated once at upload time
  // (src/lib/image-core.ts), served from /media and rendered by MediaImage.
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/tusul/:path*", destination: "/ajluud/:path*", permanent: true }];
  },
  async headers() {
    return [
      {
        // Let nginx stream partial-prerender responses instead of buffering.
        source: "/:path*{/}?",
        headers: [{ key: "X-Accel-Buffering", value: "no" }],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
