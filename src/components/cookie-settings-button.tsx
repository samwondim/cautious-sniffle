"use client";

import { openCookieSettings } from "@/components/cookie-banner";

/** Footer control that re-opens the cookie notice so visitors can change choice. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="text-[13px] text-sage transition-colors hover:text-white"
    >
      Cookie settings
    </button>
  );
}
