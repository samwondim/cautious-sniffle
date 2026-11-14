import type { Metadata } from "next";

/**
 * Nothing under /admin belongs in search results — not even the login page,
 * which would otherwise advertise where the staff sign-in lives. `robots.ts`
 * also disallows the path, but a disallow alone does not stop a page that is
 * linked from elsewhere being listed; the meta tag does.
 *
 * Admin pages are also kept out of social previews: no share card.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  openGraph: null,
  twitter: null,
};

export default function AdminRootLayout({ children }: LayoutProps<"/">) {
  return children;
}
