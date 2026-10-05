/**
 * The public site's routes, in one place, so the header, the mobile menu and
 * the footer can never drift apart.
 *
 * Labels come from `site_content`, which the admin edits; `fallback` is what
 * renders if a key has never been written. No new content keys were added for
 * the section pages — each reuses the label its band already had.
 */
export type NavItem = {
  /** `site_content` key holding the label. */
  key: string;
  href: string;
  /** Used when the key is absent from `site_content`. */
  fallback: string;
};

/** Header and mobile menu. `Donate` is rendered separately, as the lone CTA. */
export const PRIMARY_NAV: readonly NavItem[] = [
  { key: "nav.mission", href: "/about", fallback: "Mission & Vision" },
  { key: "nav.sectors", href: "/what-we-do", fallback: "What We Do" },
  { key: "nav.work", href: "/work", fallback: "Our Work" },
  { key: "gallery.eyebrow", href: "/gallery", fallback: "Gallery" },
  // Signing up is a home-page band, not a page: the form is the conversion
  // point and sits with the pitch beside it.
  { key: "volunteer.eyebrow", href: "/#volunteer", fallback: "Get Involved" },
] as const;

/** The footer carries the same routes plus the two the header has no room for. */
export const FOOTER_NAV: readonly NavItem[] = [
  ...PRIMARY_NAV,
  { key: "give.eyebrow", href: "/#give", fallback: "Make a Gift" },
  // The footer itself is `id="contact"`, so this is a same-page anchor.
  { key: "nav.contact", href: "/#contact", fallback: "Contact" },
] as const;
