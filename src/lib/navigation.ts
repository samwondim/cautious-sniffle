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
  // Last before Donate: the hero's primary button is Donate, so this is the
  // only route to /contact above the footer.
  { key: "nav.contact", href: "/contact", fallback: "Contact" },
] as const;

/** A titled group of footer links. */
export type NavGroup = {
  /** Visible heading, also the group's accessible name. */
  label: string;
  items: readonly NavItem[];
};

const navItem = (href: string) => {
  const item = PRIMARY_NAV.find((entry) => entry.href === href);
  if (!item) throw new Error(`No primary nav item for ${href}`);
  return item;
};

/**
 * The footer carries the same routes, split into two short groups: what the
 * organisation is, and the ways to support it. Donate is listed as well as
 * shown as the footer's button, because scanning a column is how people look
 * for it. Contact has no link here: the footer's "Get in touch" button and
 * its contact column both cover it.
 */
export const FOOTER_NAV_GROUPS: readonly NavGroup[] = [
  {
    label: "Explore",
    items: [
      navItem("/about"),
      navItem("/what-we-do"),
      navItem("/work"),
      navItem("/gallery"),
    ],
  },
  {
    label: "Support",
    items: [
      navItem("/#volunteer"),
      { key: "give.eyebrow", href: "/#give", fallback: "Make a Gift" },
      { key: "nav.donate", href: "/donate", fallback: "Donate" },
    ],
  },
] as const;
