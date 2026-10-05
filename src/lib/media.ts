import { isMediaRef, mediaPath, parseMediaRef } from "@/lib/media-constants";

/**
 * Interprets a stored image value.
 *
 * `projects.image_url` and `gallery_images.image_url` are plain `text`
 * columns holding either a media-library reference (`media:12`) or an
 * external URL someone pasted in. Keeping one column rather than adding a
 * foreign key preserves the paste-a-URL escape hatch and needed no data
 * migration — the cost is that nothing at the database level guarantees a
 * reference still resolves, so a deleted asset degrades to the placeholder
 * rather than breaking the page.
 */

const ABSOLUTE_URL = /^(https?:)?\/\//i;

export type ResolvedImage =
  /** A library image, served from this origin and optimisable. */
  | { kind: "managed"; url: string }
  /** An external URL: renderable, but not on the optimiser's allowlist. */
  | { kind: "external"; url: string }
  /** Nothing usable — the caller should fall back to placeholder art. */
  | { kind: "placeholder" };

export function resolveImageValue(
  value: string | null | undefined,
): ResolvedImage {
  const trimmed = value?.trim();
  if (!trimmed) return { kind: "placeholder" };

  const id = parseMediaRef(trimmed);
  if (id !== null) return { kind: "managed", url: mediaPath(id) };

  if (ABSOLUTE_URL.test(trimmed)) return { kind: "external", url: trimmed };

  // A stray relative path or junk: show the placeholder rather than emit a
  // URL that is certain to 404.
  return { kind: "placeholder" };
}

export { isMediaRef };
