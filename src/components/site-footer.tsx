import Image from "next/image";
import Link from "next/link";

import { Icon, type IconName } from "@/components/icons";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import type { SiteContent } from "@/lib/content";
import { FOOTER_NAV_GROUPS } from "@/lib/navigation";

const SOCIALS: readonly {
  key: keyof SiteContent;
  icon: IconName;
  label: string;
}[] = [
  { key: "social.emailHref", icon: "mail", label: "Email" },
  { key: "social.websiteHref", icon: "globe", label: "Website" },
  { key: "social.communityHref", icon: "message", label: "Community updates" },
];

/** The brand guide's signature stripe, in its order. */
const STRIPE = ["bg-teal", "bg-sky", "bg-orange", "bg-growth", "bg-gold"];

/*
 * Small type on the ink band. `text-sage` is 3.44:1 on ink, under the 4.5:1
 * body text needs, so muted copy here is mist at reduced strength (≈5.4:1).
 */
const MUTED = "text-mist/70";
const LABEL = `eyebrow text-[12px] ${MUTED}`;
const LINK =
  "inline-flex min-h-11 items-center text-[15px] text-white transition-colors hover:text-gold md:min-h-0 md:py-1";
const LEGAL_LINK = `inline-flex min-h-11 items-center text-[13px] ${MUTED} transition-colors hover:text-white sm:min-h-0`;
const CHIP =
  "flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-mist transition-colors md:size-10";

/**
 * The site footer: a closing statement with the two things a reader can do
 * next, then a compact index, then the fine print and a tone-on-tone
 * wordmark that closes the page.
 *
 * Every optional CMS value — tagline, phone, address, email, socials, even
 * the closing line — can be empty, so the layout is built from the parts
 * that always exist (logo, links, buttons, wordmark) and the optional ones
 * only add to it. Nothing here animates in: the footer paints without JS.
 */
export function SiteFooter({ content }: { content: SiteContent }) {
  const orgName = content["org.name"] || "Empower Humanity";
  const tagline = content["org.tagline"]?.trim();
  const statement = content["footer.statement"]?.trim();
  const email = content["contact.email"]?.trim();
  const phone = content["contact.phone"]?.trim();
  const address = content["contact.address"]?.trim();

  // An icon that goes nowhere reads as broken, so unset links are hidden
  // rather than rendered as `#`. Bare in-page anchors count as unset: the
  // old defaults pointed the community icon at this footer. An email icon
  // that repeats the address already listed under Contact is dropped too.
  const socials = SOCIALS.filter((social) => {
    const href = content[social.key]?.trim();
    if (!href || href.startsWith("#")) return false;
    if (email && href.toLowerCase() === `mailto:${email.toLowerCase()}`) {
      return false;
    }
    return true;
  });

  const contactItems: {
    icon: IconName;
    text: string;
    href?: string;
  }[] = [
    ...(email ? [{ icon: "mail" as const, text: email, href: `mailto:${email}` }] : []),
    ...(phone
      ? [{ icon: "phone" as const, text: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` }]
      : []),
    ...(address ? [{ icon: "map-pin" as const, text: address }] : []),
  ];

  return (
    <footer id="contact" className="relative overflow-hidden bg-ink-deep text-white">
      <div className="mx-auto max-w-[1440px] px-6 pt-20 md:px-10 md:pt-24 lg:px-20">
        {/* Closing statement. Reads as the last band of the page, and on a
            phone it comes first, ahead of the index. */}
        <div
          className={`flex flex-col gap-8 xl:flex-row xl:justify-between xl:gap-16 ${statement ? "xl:items-end" : "xl:items-center"}`}
        >
          <div className="flex flex-col gap-6">
            <span aria-hidden="true" className="flex h-1 w-[60px] overflow-hidden rounded-full">
              {STRIPE.map((color) => (
                <span key={color} className={`flex-1 ${color}`} />
              ))}
            </span>
            {statement ? (
              <p className="max-w-[21ch] font-display text-[clamp(2rem,1.15rem+3.4vw,4rem)] leading-[1.04] tracking-[-0.025em] text-balance text-white">
                {statement}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row xl:shrink-0">
            <Link
              href="/donate"
              className="btn-gold inline-flex min-h-13 items-center justify-center gap-2 px-8 text-sm font-semibold tracking-[0.06em]"
            >
              <Icon name="heart" size={16} />
              {content["nav.donate"] || "Donate"}
            </Link>
            <Link
              href="/contact"
              className="btn-secondary btn-secondary-on-dark group inline-flex min-h-13 items-center justify-center gap-2 px-8 text-sm font-semibold tracking-[0.04em]"
            >
              {content["footer.contactLabel"] || "Get in touch"}
              <Icon
                name="arrow-right"
                size={16}
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-white/10 pt-12 md:mt-20 md:grid-cols-4 md:gap-x-10 md:pt-14 lg:grid-cols-12">
          {/* Brand. Holds its column on its own: the tagline and socials are
              extras, not what keeps it from looking empty. */}
          <div className="col-span-2 flex flex-col gap-5 md:col-span-4 lg:col-span-4">
            <Link
              href="/"
              className="w-fit rounded-sm transition-opacity hover:opacity-80"
              aria-label={`${orgName} — home`}
            >
              <Image
                src="/brand/empower-humanity-logo-white.svg"
                alt=""
                width={647}
                height={691}
                loading="lazy"
                className="h-[72px] w-auto"
              />
            </Link>
            {tagline ? (
              <p className={`max-w-[34ch] text-sm leading-relaxed ${MUTED}`}>{tagline}</p>
            ) : null}
            {socials.length > 0 ? (
              <ul className="flex items-center gap-2.5" aria-label="Follow us">
                {socials.map((social) => (
                  <li key={social.key}>
                    <a
                      href={content[social.key]}
                      aria-label={social.label}
                      className={`${CHIP} hover:border-white/40 hover:text-white`}
                    >
                      <Icon name={social.icon} size={17} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {FOOTER_NAV_GROUPS.map((group) => (
            <nav
              key={group.label}
              aria-label={group.label}
              className="flex flex-col gap-4 lg:col-span-2"
            >
              <h2 className={LABEL}>{group.label}</h2>
              <ul className="flex flex-col md:gap-1.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={LINK}>
                      {content[item.key] || item.fallback}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {contactItems.length > 0 ? (
            <div className="col-span-2 flex flex-col gap-4 lg:col-span-4">
              <h2 className={LABEL}>Contact</h2>
              <ul className="flex flex-col gap-2 md:gap-3">
                {contactItems.map((item) => {
                  const body = (
                    <>
                      <span className={CHIP}>
                        <Icon name={item.icon} size={17} />
                      </span>
                      <span className="min-w-0 text-[15px] [overflow-wrap:anywhere]">
                        {item.text}
                      </span>
                    </>
                  );
                  return (
                    <li key={item.icon}>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="flex w-fit max-w-full items-center gap-3 text-white transition-colors hover:text-gold hover:[&>span:first-child]:border-white/40"
                        >
                          {body}
                        </a>
                      ) : (
                        <span className="flex items-center gap-3 text-mist">{body}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:mt-20">
          <span className={`text-[13px] ${MUTED}`}>{content["footer.copyright"]}</span>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-6">
            <Link href="/privacy" className={LEGAL_LINK}>
              Privacy
            </Link>
            <Link href="/cookies" className={LEGAL_LINK}>
              Cookies
            </Link>
            <CookieSettingsButton className={`${LEGAL_LINK} cursor-pointer`} />
          </nav>
        </div>
      </div>

      <Wordmark name={orgName} />
    </footer>
  );
}

/*
 * Bricolage Bold capitals average roughly this many units per glyph at a
 * font size of 100; spaces are narrower. Only an estimate: `textLength`
 * below corrects the last few percent, so the word always spans the full
 * width whatever the name or the font that actually loads.
 */
const GLYPH_ADVANCE = 70;
const SPACE_ADVANCE = 24;
/** Bricolage's cap height, as a fraction of the font size. */
const CAP_HEIGHT = 0.72;
/**
 * How much of the cap height shows above the page's bottom edge. The rest is
 * cropped, so the word reads as sinking below the page rather than as a
 * heading that happens to sit last.
 */
const VISIBLE = 0.8;

/**
 * The organisation's name across the full width of the band, one tone
 * lighter than the ink, its foot cropped by the bottom edge: the page's
 * last line. An SVG scaled to its box rather than fluid type, so it can never
 * wrap, clip unevenly, or overflow at any viewport width. Decorative — the
 * logo above already names the organisation.
 */
function Wordmark({ name }: { name: string }) {
  const text = name.toUpperCase();
  const width = [...text].reduce(
    (sum, char) => sum + (char === " " ? SPACE_ADVANCE : GLYPH_ADVANCE),
    0,
  );
  const capHeight = 100 * CAP_HEIGHT;
  const height = Math.round(capHeight * VISIBLE);

  return (
    <div aria-hidden="true" className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-20">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block w-full fill-white/[0.06] select-none"
        role="presentation"
      >
        <text
          x="0"
          y={capHeight}
          textLength={width}
          lengthAdjust="spacingAndGlyphs"
          className="font-display"
          style={{ fontSize: 100, fontWeight: 800 }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}
