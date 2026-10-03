import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

import type { LayoutProps } from "@/types";

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

export const metadata: Metadata = {
  title: {
    default: "Empower Humanity",
    template: "%s — Empower Humanity",
  },
  description:
    "A multi-sector team working alongside communities across health, education, livelihoods, and the environment.",
  icons: {
    icon: "/brand/empower-humanity-logo.svg",
  },
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
