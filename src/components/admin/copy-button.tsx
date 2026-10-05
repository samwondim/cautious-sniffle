"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Compact copy control for values too long to show in full.
 *
 * `CopyValue` in `src/components/copy-value.tsx` renders its value as visible
 * text, which suits an account number on the donate page but would blow out a
 * thumbnail tile. This one copies without displaying.
 */
export function CopyButton({
  value,
  label,
  idleLabel = "Copy",
}: {
  value: string;
  /** Describes the value for screen readers, e.g. "image key". */
  label: string;
  idleLabel?: string;
}) {
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
      // Clipboard is unavailable over plain HTTP and blocked in some
      // browsers; there is nothing useful to do but leave the label alone.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-teal"
      >
        {copied ? "Copied" : idleLabel}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${label} copied` : ""}
      </span>
    </>
  );
}
