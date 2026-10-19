import type { MetadataRoute } from "next";
import { pwa, site } from "@/messages/mn";

// Installed on his phone it opens the admin; shortcuts jump to showing work
// and the inbox (long-press the home-screen icon).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: pwa.shortName,
    description: site.tagline,
    lang: "mn",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    background_color: "#f5f2ec",
    theme_color: "#a8461f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: pwa.shortcutPresent, url: "/uzuulekh", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: pwa.shortcutInquiries, url: "/admin/inquiries", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: pwa.shortcutNewProject, url: "/admin/projects/new", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
