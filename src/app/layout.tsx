import type { Metadata, Viewport } from "next";
import { geologica, manrope } from "./fonts";
import { site } from "@/messages/mn";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:4000"),
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { locale: site.locale, siteName: site.name, type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#13110f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${geologica.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
