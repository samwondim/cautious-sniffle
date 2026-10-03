import Image from "next/image";
import Link from "next/link";

import { MobileMenu } from "@/components/mobile-menu";
import type { SiteContent } from "@/lib/content";

const NAV_ITEMS = [
  { key: "nav.mission", href: "/#mission" },
  { key: "nav.sectors", href: "/#what-we-do" },
  { key: "nav.work", href: "/#work" },
  { key: "nav.contact", href: "/#contact" },
] as const;

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

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-[15px] font-medium transition-opacity hover:opacity-60"
            >
              {content[item.key]}
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
          items={NAV_ITEMS.map((item) => ({
            href: item.href,
            label: content[item.key],
          }))}
          donateHref="/donate"
          donateLabel={content["nav.donate"]}
        />
      </div>
    </header>
  );
}
