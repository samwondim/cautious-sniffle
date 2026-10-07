import { cookies } from "next/headers";

import {
  CONSENT_COOKIE,
  parseConsentValue,
  type ConsentStatus,
} from "@/lib/consent";

/** Server-side read of the visitor's cookie choice (`null` = no choice yet). */
export async function getConsent(): Promise<ConsentStatus> {
  const store = await cookies();
  return parseConsentValue(store.get(CONSENT_COOKIE)?.value);
}
