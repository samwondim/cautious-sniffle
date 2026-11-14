import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

import { siteUrl } from "@/lib/site-url";

import "./globals.css";

/**
 * Brand guideline typefaces: Bricolage Grotesque Bold for headlines and
 * Figtree Regular/Semibold for body. Self-hosted by next/font, so there is
 * no runtime request to Google. Arial/Calibri remain the fallback where
 * these are unavailable (e.g. email).
 */
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const DESCRIPTION =
  "A multi-sector team working alongside communities across health, education, livelihoods, and the environment.";

/**
 * Icons come from the file conventions beside this layout — `favicon.ico`,
 * `icon.svg` and `apple-icon.png`, all cut from the logo mark without the
 * wordmark, which is unreadable at tab size. The share card is
 * `opengraph-image.tsx`; Twitter/X falls back to it.
 */
export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "Empower Humanity",
    template: "%s — Empower Humanity",
  },
  description: DESCRIPTION,
  applicationName: "Empower Humanity",
  openGraph: {
    type: "website",
    siteName: "Empower Humanity",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  // Matches the white nav bar, so mobile browser chrome continues the page
  // instead of framing it in the browser's default grey.
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${bricolage.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
