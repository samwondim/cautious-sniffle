"use client";

import { useEffect } from "react";

import { StatusPage } from "@/components/status-page";

/**
 * A page inside the site failed to render. The nav and footer survive (they
 * belong to the layout above this boundary), so the visitor is never
 * stranded. Failures in the layout itself land in `app/error.tsx`.
 */
export default function SiteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      eyebrow="Something went wrong"
      title="This page didn't load properly."
      body="It's on our side, not yours. Trying again usually fixes it — if it doesn't, the rest of the site is still working."
      primary={{ label: "Try again", onClick: retry }}
      secondary={{ label: "Back to home", href: "/" }}
    />
  );
}
