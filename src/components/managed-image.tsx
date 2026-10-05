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
