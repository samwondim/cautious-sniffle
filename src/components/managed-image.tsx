import Image from "next/image";

import { PlaceholderPhoto } from "@/components/section";
import { resolveImageValue } from "@/lib/media";

/**
 * Renders whatever a content row's `image_url` happens to hold.
 *
 * That column can carry three things, and each needs different treatment:
 *
 * - a media-library object key — served from the Neon bucket, which is on
 *   `next/image`'s allowlist, so it goes through the optimiser;
 * - an external URL someone pasted in — not on the allowlist (and not
 *   knowable at build time), so it stays a plain `<img>`. This is the one
 *   remaining place that needs the eslint exception; it used to be repeated
 *   at all three call sites, back when every admin-supplied URL was external;
 * - nothing usable — seeded placeholder photography, so the slot still reads
 *   as designed rather than as an empty frame.
 *
 * Every branch fills a fixed-size frame supplied by the caller, so `fill` is
 * used throughout and no intrinsic dimensions are needed.
 */
export function ManagedImage({
  value,
  alt,
  sizes,
  className = "",
  placeholderSeed,
  placeholderWidth,
  placeholderHeight,
  priority,
}: {
  /** The stored `image_url` value: an object key, a URL, or null. */
  value: string | null | undefined;
  alt: string;
  /** Rendered width at each breakpoint; `fill` requests 100vw without it. */
  sizes: string;
  /** Sizing for the frame, e.g. `h-[210px] w-full`. */
  className?: string;
  /** Stable seed so an empty slot keeps the same stand-in photograph. */
  placeholderSeed: string;
  placeholderWidth: number;
  placeholderHeight: number;
  priority?: boolean;
}) {
  const resolved = resolveImageValue(value);

  if (resolved.kind === "placeholder") {
    return (
      <PlaceholderPhoto
        seed={placeholderSeed}
        alt={alt}
        sizes={sizes}
        width={placeholderWidth}
        height={placeholderHeight}
        className={className}
      />
    );
  }

  if (resolved.kind === "external") {
    return (
      <div className={`relative overflow-hidden bg-mint ${className}`}>
        {/* Arbitrary external origin: not on the optimiser's allowlist. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolved.url}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-mint ${className}`}>
      <Image
        src={resolved.url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

/**
 * Backdrop variant: fills a frame the caller has already positioned.
 *
 * `ManagedImage` brings its own `relative` wrapper, which fights a parent that
 * is already `absolute inset-0` — the hero and volunteer backdrops, and the
 * hero collage tiles. This renders the picture alone, so the caller keeps
 * ownership of the box.
 *
 * `fallbackSrc` is the designed stand-in for an empty slot, built with the
 * helpers in `src/lib/placeholder-image.ts`.
 */
export function ManagedBackdrop({
  value,
  fallbackSrc,
  alt = "",
  sizes = "100vw",
  quality,
  preload,
  className = "object-cover",
}: {
  value: string | null | undefined;
  fallbackSrc: string;
  /** Empty for decorative imagery, which is what every backdrop is. */
  alt?: string;
  sizes?: string;
  quality?: number;
  /**
   * Inserts a `<link rel=preload>` in the head. For the LCP candidate only —
   * preloading several competing candidates helps none of them. Note that
   * `loading="eager"` is not a lighter alternative: it emits a preload link
   * of its own. Replaces `priority`, deprecated in Next.js 16.
   */
  preload?: boolean;
  className?: string;
}) {
  const resolved = resolveImageValue(value);

  if (resolved.kind === "external") {
    return (
      /* Arbitrary external origin: not on the optimiser's allowlist. */
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={resolved.url}
        alt={alt}
        loading={preload ? "eager" : "lazy"}
        fetchPriority={preload ? "high" : undefined}
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    );
  }

  return (
    <Image
      src={resolved.kind === "placeholder" ? fallbackSrc : resolved.url}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      preload={preload}
      className={className}
    />
  );
}
