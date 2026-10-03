"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A value paired with a copy button — used for account numbers and SWIFT
 * codes, where retyping by hand is both tedious and risky.
 *
 * The value stays plain selectable text, so losing the clipboard (it is
 * unavailable over plain HTTP, and blocked in some browsers) costs nothing.
 */
export function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard access — the value is still on the page to select.
    }
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[15px] tracking-[0.02em] text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="rounded-md border border-hairline px-2 py-1 text-[11px] font-semibold tracking-[0.06em] text-slate uppercase transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      {/* Announced without moving focus, so the confirmation is not silent. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${label} copied` : ""}
      </span>
    </span>
  );
}
