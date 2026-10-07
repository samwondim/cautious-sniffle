"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  parseConsentValue,
  type ConsentStatus,
} from "@/lib/consent";

function readConsentFromDocument(): ConsentStatus {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  return parseConsentValue(match?.slice(CONSENT_COOKIE.length + 1));
}

function writeConsent(status: "accepted" | "rejected") {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE}=v1:${status}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  try {
    window.localStorage.setItem(CONSENT_COOKIE, `v1:${status}`);
  } catch {
    // Private browsing etc. — the cookie is the source of truth.
  }
}

/**
 * External store for banner visibility. `useSyncExternalStore` (instead of
 * `useState` + `useEffect`) keeps server prerender (hidden) and the first
 * client read (cookie present or not) consistent without a hydration
 * mismatch or a cascading render.
 */
let forceVisible = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): boolean {
  return forceVisible || readConsentFromDocument() === null;
}

function getServerSnapshot(): boolean {
  return false;
}

/** Re-opens the banner (used by the footer's "Cookie settings" control). */
export function openCookieSettings() {
  forceVisible = true;
  notify();
}

function choose(status: "accepted" | "rejected") {
  forceVisible = false;
  writeConsent(status);
  notify();
}

/**
 * Simple cookie collection notice shown until the visitor picks Accept or
 * Decline. Strictly-necessary cookies (e.g. the admin session) always apply;
 * v1 sets no analytics or marketing cookies, so Decline simply dismisses.
 */
export function CookieBanner() {
  const visible = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[720px] rounded-2xl border border-hairline bg-white p-5 shadow-[0_16px_48px_rgba(16,60,70,0.22)] md:inset-x-auto md:right-8 md:bottom-8 md:mx-0 md:max-w-[420px]"
    >
      <p className="text-sm leading-relaxed text-ink">
        <span className="font-semibold">We use limited cookies.</span> Essential
        cookies keep the site and admin sign-in working. We don&apos;t set
        analytics or advertising cookies.{" "}
        <Link
          href="/cookies"
          className="font-semibold text-teal-strong underline underline-offset-2 hover:text-ink"
        >
          Cookie policy
        </Link>
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="flex-1 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-strong"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose("rejected")}
          className="flex-1 rounded-full border border-hairline-strong px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
