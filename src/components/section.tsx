import Image from "next/image";
import type { ReactNode } from "react";

import { placeholderPhoto } from "@/lib/placeholder-image";

/** Section band with the design's max width and gutters. */
export function Section({
  children,
  className = "",
  tone = "white",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "white" | "mint" | "cream" | "ink";
  id?: string;
}) {
  const tones = {
    white: "bg-white",
    mint: "bg-mint",
    cream: "bg-cream",
    ink: "bg-ink",
  } as const;

  return (
    <section id={id} className={`${tones[tone]} px-6 py-20 md:px-10 lg:px-20 lg:py-24 ${className}`}>
      <div className="mx-auto max-w-[1440px]">{children}</div>
    </section>
  );
}

/** Small uppercase kicker used above every section heading. */
export function Eyebrow({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "gold" | "ink";
}) {
  const tones = {
    accent: "text-accent",
    gold: "text-gold",
    ink: "text-ink",
  } as const;

  return <span className={`eyebrow ${tones[tone]}`}>{children}</span>;
}

/** Bricolage Grotesque section heading (brand display voice). */
export function SectionTitle({
  children,
  tone = "ink",
  size = "md",
}: {
  children: ReactNode;
  tone?: "ink" | "white";
  size?: "md" | "lg";
}) {
  const tones = { ink: "text-ink", white: "text-white" } as const;
  const sizes = {
    md: "text-[32px] leading-[1.2] md:text-[34px]",
    lg: "text-[44px] leading-[1.12] md:text-[52px]",
  } as const;

  return (
    <h2
      className={`font-display ${sizes[size]} ${tones[tone]}`}
    >
      {children}
    </h2>
  );
}

/**
 * Framed photograph filling its parent box.
 *
 * Slots that have no real image yet render seeded placeholder photography, so
 * the page reads as designed instead of showing an empty frame. See
 * `src/lib/placeholder-image.ts`.
 *
 * Positioning belongs to the caller: wrap this in the positioned element and
 * pass sizing through `className`, so the component's own `relative` (which
 * `fill` requires) never competes with an `absolute` from outside.
 */
export function PlaceholderPhoto({
  seed,
  alt,
  sizes,
  width,
  height,
  className = "",
  priority = false,
}: {
  /** Stable seed — the same seed always resolves to the same photograph. */
  seed: string;
  /** Empty string for purely decorative imagery. */
  alt: string;
  /** Rendered width at each breakpoint; without it `fill` requests 100vw. */
  sizes: string;
  /** Intrinsic proportions to request. Rendered size stays with CSS. */
  width: number;
  height: number;
  className?: string;
  /** Set on the photo a page paints first, so it is not lazy-loaded. */
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-mint ${className}`}>
      <Image
        src={placeholderPhoto({ seed, width, height })}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
