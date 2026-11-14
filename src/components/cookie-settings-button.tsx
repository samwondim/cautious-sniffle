"use client";

import { openCookieSettings } from "@/components/cookie-banner";

/** Footer control that re-opens the cookie notice so visitors can change choice. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie settings
    </button>
  );
}
