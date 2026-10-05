import Image from "next/image";
import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";
import type { SiteContent } from "@/lib/content";
import { PRIMARY_NAV } from "@/lib/navigation";

export function SiteNav({ content }: { content: SiteContent }) {
  return (
    <header className="relative border-b border-hairline-strong">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-20">
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
          <Link
            href="/donate"
            className="text-[15px] font-medium transition-opacity hover:opacity-60"
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
    </header>
  );
}
