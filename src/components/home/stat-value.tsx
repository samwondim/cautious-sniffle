"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";

/**
 * Impact stat values are free text in the admin (`impact_stats.value`), so they
 * arrive as things like "12,400+", "98%" or "3 regions". This pulls out the
 * first number, leaving whatever sits either side of it untouched. Anything
 * with no number in it is returned as `null` and never animates — a CMS string
 * must not be able to break the hero.
 */
function parseValue(value: string) {
  const match = value.match(/^(\D*?)(\d[\d.,]*)(.*)$/);
  if (!match) return null;

  const [, prefix, digits, suffix] = match;
  // A trailing separator belongs to the sentence, not the number ("1,200, and").
  const number = digits.replace(/[.,]$/, "");
  const plain = number.replace(/,/g, "");
  const target = Number(plain);
  if (!Number.isFinite(target)) return null;

  const decimalPoint = plain.indexOf(".");

  return {
    prefix,
    suffix: digits.slice(number.length) + suffix,
    target,
    /** Keep the authored precision — "1.2M" must not count up to "1M". */
    decimals: decimalPoint === -1 ? 0 : plain.length - decimalPoint - 1,
    /** Only group thousands if the author did. */
    grouped: number.includes(","),
    /**
     * Digit count of the final number, reserved as a floor on the span's width
     * so the shorter counting text cannot drag the label beside it leftwards.
     * Digits only, never the separators, so the floor stays under the final
     * rendered width and no space is reserved that the value won't fill.
     */
    digitCount: plain.replace(/\D/g, "").length,
  };
}

const COUNT_DURATION = 1.2;

/**
 * Longest the number may stay hidden. Nothing should reach this — it is the
 * backstop for the case where the element never satisfies the viewport
 * observer, so a stat can never be permanently missing.
 */
const REVEAL_FALLBACK_MS = 2000;

/**
 * Counts up to its value when the stat card scrolls into view.
 *
 * The full value is server-rendered, so crawlers and a failed JS load still
 * read the real figure (the `<noscript>` rule in the site layout un-hides it).
 * With JavaScript the number starts hidden and appears as the count begins:
 * the alternative — painting "12,400+" from the server and then resetting it
 * to 0 at hydration — snaps the most-looked-at number on the site backwards.
 * `visibility` is used rather than `opacity` so the reserved box, and
 * therefore the layout, never changes.
 *
 * Text is written straight to the DOM node rather than through state: counting
 * re-renders nothing, which keeps a 1.2s animation off React's critical path.
 */
export function StatValue({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Memoised so the effect below keys off the value, not the render: a fresh
  // object every render would restart the count on each one.
  const parsed = useMemo(() => parseValue(value), [value]);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const animatable = parsed !== null && !shouldReduceMotion;

  // Reduced motion, or a value with no number in it: show it as authored.
  useEffect(() => {
    if (animatable || !ref.current) return;
    ref.current.style.visibility = "visible";
  }, [animatable]);

  useEffect(() => {
    if (!animatable) return;
    const timer = window.setTimeout(() => {
      if (ref.current) ref.current.style.visibility = "visible";
    }, REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [animatable]);

  useEffect(() => {
    const node = ref.current;
    if (!animatable || !parsed || !isInView || !node) return;

    const format = (latest: number) =>
      parsed.grouped
        ? latest.toLocaleString("en-US", {
            minimumFractionDigits: parsed.decimals,
            maximumFractionDigits: parsed.decimals,
          })
        : latest.toFixed(parsed.decimals);

    node.textContent = parsed.prefix + format(0) + parsed.suffix;
    node.style.visibility = "visible";

    const controls = animate(0, parsed.target, {
      duration: COUNT_DURATION,
      ease: "easeOut",
      onUpdate: (latest) => {
        node.textContent = parsed.prefix + format(latest) + parsed.suffix;
      },
      onComplete: () => {
        // Land on the authored string rather than a reformatted one.
        node.textContent = value;
      },
    });

    return () => controls.stop();
  }, [animatable, isInView, parsed, value]);

  if (!parsed) return <span className={className}>{value}</span>;

  return (
    // `tabular-nums` holds every digit the same width; `data-countup` is the
    // hook the layout's `<noscript>` rule uses to un-hide this.
    <span
      ref={ref}
      data-countup=""
      className={`inline-block tabular-nums ${className}`}
      style={{ visibility: "hidden", minWidth: `${parsed.digitCount}ch` }}
    >
      {value}
    </span>
  );
}
