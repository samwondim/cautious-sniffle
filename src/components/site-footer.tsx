import Image from "next/image";
import Link from "next/link";

import { Icon, type IconName } from "@/components/icons";
import type { SiteContent } from "@/lib/content";

const EXPLORE = [
  { key: "nav.mission", href: "/#mission" },
  { key: "nav.sectors", href: "/#what-we-do" },
  { key: "nav.work", href: "/#work" },
  { key: "nav.contact", href: "/#contact" },
] as const;

const SOCIALS: readonly {
  key: keyof SiteContent;
  icon: IconName;
  label: string;
}[] = [
  { key: "social.emailHref", icon: "mail", label: "Email" },
  { key: "social.websiteHref", icon: "globe", label: "Website" },
  { key: "social.communityHref", icon: "message", label: "Community updates" },
];

export function SiteFooter({ content }: { content: SiteContent }) {
  const email = content["contact.email"];
  const phone = content["contact.phone"];
  const address = content["contact.address"];

  return (
    <footer
      id="contact"
      className="bg-ink-deep px-6 pt-16 pb-8 md:px-10 lg:px-20"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between md:gap-16">
          <div className="flex max-w-[300px] flex-col gap-4">
            <Link
              href="/"
              className="transition-opacity hover:opacity-80"
              aria-label={content["org.name"]}
            >
              <Image
                src="/brand/empower-humanity-logo-white.svg"
                alt={content["org.name"]}
                width={56}
                height={60}
                loading="lazy"
                className="h-15 w-auto"
              />
            </Link>
            <p className="max-w-[260px] text-sm leading-relaxed text-mist">
              {content["org.tagline"]}
            </p>
            <div className="mt-1 flex items-center gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.key}
                  href={content[social.key] || "#"}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center border border-white/30 transition-colors hover:border-white"
                >
                  <Icon name={social.icon} size={16} className="text-white" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-xs font-semibold tracking-[0.1em] text-sage uppercase">
              Explore
            </span>
            {EXPLORE.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-sm text-white transition-colors hover:text-gold"
              >
                {content[item.key]}
              </Link>
            ))}
            <Link
              href="/donate"
              className="text-sm text-white transition-colors hover:text-gold"
            >
              {content["nav.donate"]}
            </Link>
          </div>

          <div className="flex max-w-[260px] flex-col gap-4">
            <span className="text-xs font-semibold tracking-[0.1em] text-sage uppercase">
              Contact
            </span>
            {email ? (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 text-sm text-mist transition-colors hover:text-white"
              >
                <Icon name="mail" size={15} className="shrink-0 text-mist" />
                {email}
              </a>
            ) : null}
            {phone ? (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-2.5 text-sm text-mist transition-colors hover:text-white"
              >
                <Icon name="phone" size={15} className="shrink-0 text-mist" />
                {phone}
              </a>
            ) : null}
            {address ? (
              <span className="flex items-center gap-2.5 text-sm text-mist">
                <Icon name="map-pin" size={15} className="shrink-0 text-mist" />
                {address}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-white/15 pt-6">
          <span className="text-[13px] text-sage">{content["footer.copyright"]}</span>
          <Link
            href="/admin"
            className="text-[13px] text-sage transition-colors hover:text-white"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
