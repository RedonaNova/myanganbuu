import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL ?? "http://localhost:4000";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/une", "/uzuulekh", "/holboo-barikh/amjilttai"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
