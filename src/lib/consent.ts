/**
 * Cookie-backed consent state for the public site's cookie notice.
 *
 * v1 is a simple notice (accept / decline) with no granular categories and
 * no third-party scripts to gate yet. The cookie exists so the choice is
 * readable server-side — future analytics or embed components should check
 * `getConsent()` (in `./consent-server`) before rendering anything
 * non-essential.
 *
 * This module is client-safe: it must never import `next/headers`.
 */

export const CONSENT_COOKIE = "eh_consent";
export const CONSENT_VERSION = "v1";
/** 180 days, in seconds. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

export type ConsentStatus = "accepted" | "rejected" | null;

export function consentValue(status: "accepted" | "rejected"): string {
  return `${CONSENT_VERSION}:${status}`;
}

export function parseConsentValue(value: string | undefined): ConsentStatus {
  if (value === `${CONSENT_VERSION}:accepted`) return "accepted";
  if (value === `${CONSENT_VERSION}:rejected`) return "rejected";
  return null;
}
