import type { Metadata } from "next";

import { StatusPage } from "@/components/status-page";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/**
 * Rendered for `notFound()` inside the site (an unpublished or deleted
 * project) and, via the `[...missing]` catch-all beside it, for any URL that
 * matches no route — so a mistyped link still gets the nav and footer.
 */
export default function NotFound() {
  return (
    <StatusPage
      eyebrow="Error 404"
      title="We couldn't find that page."
      body="The link may be out of date, or the page may have moved. Everything we do is still a click away."
      primary={{ label: "Back to home", href: "/" }}
      secondary={{ label: "Donate", href: "/donate" }}
      links={[
        {
          label: "Our Work",
          href: "/work",
          description: "Projects running in communities right now.",
        },
        {
          label: "What We Do",
          href: "/what-we-do",
          description: "Health, education, livelihoods and the environment.",
        },
        {
          label: "Gallery",
          href: "/gallery",
          description: "Moments from the field.",
        },
      ]}
    />
  );
}
