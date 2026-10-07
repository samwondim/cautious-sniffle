"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { MobileMenu } from "@/components/mobile-menu";
import type { SiteContent } from "@/lib/content";
import { PRIMARY_NAV } from "@/lib/navigation";

/** Scroll distance before the bar morphs into a floating pill. */
const SCROLL_THRESHOLD = 24;

/**
 * Gradient melt behind the bar at the top of the page: solid white up top,
 * dissolving into whatever section sits below. Fades out as the pill forms.
 */
const MELT_GRADIENT =
  "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%)";

export function SiteNav({ content }: { content: SiteContent }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    // Correct the state when landing mid-page (e.g. anchor links, restore).
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Sticky glass bar at the top; once the visitor scrolls a little the
    // header gains margins and the bar morphs into a floating pill. Every
    // morphing property transitions with the site's expo-out ease.
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        scrolled ? "px-4 pt-3 md:px-8" : "px-0 pt-0"
      }`}
    >
      <div
        className={`relative mx-auto max-w-[1440px] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          scrolled
            ? "h-14 rounded-full bg-white/85 shadow-[0_12px_32px_-12px_rgba(16,60,70,0.35)] ring-1 ring-ink/10"
            : "h-16"
        }`}
      >
        {/* Gradient melt: opaque at the bar, transparent where it meets the
            section below. Crossfades out as the pill forms. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
            scrolled ? "rounded-full opacity-0" : "opacity-100"
          }`}
          style={{ background: MELT_GRADIENT }}
        />

        <div
          className={`relative z-10 flex h-full items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
            scrolled ? "pr-2 pl-6 md:pr-3 md:pl-8" : "px-6 md:px-10 lg:px-20"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            aria-label={content["org.name"]}
          >
            <Image
              src="/brand/empower-humanity-logo.svg"
              alt={content["org.name"]}
              width={37}
              height={40}
              priority
              className="h-10 w-auto"
            />
            <span className="sr-only">{content["org.name"]}</span>
          </Link>

          {/* Six links at `md` is tight, so the gap grows with the viewport
              rather than wrapping the row. */}
          <nav className="hidden items-center gap-5 md:flex lg:gap-8">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[15px] font-medium transition-opacity hover:opacity-60"
              >
                {content[item.key] || item.fallback}
              </Link>
            ))}
            {/* Human orange is reserved for the one action we most want. */}
            <Link
              href="/donate"
              className="btn-donate px-6 py-2.5 text-[15px] font-semibold"
            >
              {content["nav.donate"]}
            </Link>
          </nav>

          <MobileMenu
            items={PRIMARY_NAV.map((item) => ({
              href: item.href,
              label: content[item.key] || item.fallback,
            }))}
            donateHref="/donate"
            donateLabel={content["nav.donate"]}
          />
        </div>
      </div>
    </header>
  );
}
