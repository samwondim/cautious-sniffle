import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Restates `not-found.tsx`'s metadata: this page's own (otherwise empty)
 * metadata is what the browser ends up with, so without it the tab title
 * reverts to the bare site name once the page streams in.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/**
 * Catches every URL no other route matches and hands it to the site's own
 * `not-found.tsx`. Without this, unmatched URLs fall through to the root
 * not-found, which sits outside the site layout and so has no nav or footer.
 *
 * More specific routes — every page, /admin, /api, and the metadata files —
 * always win over a catch-all, so nothing real is shadowed.
 */
export default function CatchAll() {
  notFound();
}
