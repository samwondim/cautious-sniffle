/**
 * Media-library constants shared by server and client code.
 *
 * Kept free of imports on purpose: `src/lib/admin.ts` is reachable from
 * `"use client"` components, so anything both sides need lives here rather
 * than alongside server-only code.
 */

/**
 * SVG is deliberately absent: it is executable markup, and this application
 * serves uploads from its own origin, so accepting it would invite stored XSS.
 */
export const MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type MediaMimeType = (typeof MEDIA_MIME_TYPES)[number];

/**
 * Largest payload the upload action will accept, after the browser has
 * downscaled the image.
 *
 * Images are stored as `bytea` in Postgres and travel through a Server
 * Action, so this is bounded by two things: `serverActions.bodySizeLimit` in
 * `next.config.ts`, and the request body cap of whatever runs the function
 * (roughly 4.5 MB on Vercel's serverless runtime). It is deliberately lower
 * than either. The browser resizes before sending, so a phone photograph of
 * 6 MB arrives well under this.
 */
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

/** What the admin may select; anything larger is refused before resizing. */
export const MAX_SOURCE_BYTES = 30 * 1024 * 1024;

/** Longest edge kept when downscaling. Ample for full-bleed hero imagery. */
export const MAX_IMAGE_EDGE = 2200;

/**
 * How a content row refers to a library image: `media:<id>`.
 *
 * Matched positively, so a value only counts as a library reference if it
 * looks exactly like one — a negative test ("no scheme, so it must be ours")
 * would misread a root-relative path such as `/images/x.jpg`.
 */
const MEDIA_REF = /^media:(\d+)$/;

export function mediaRef(id: number): string {
  return `media:${id}`;
}

export function parseMediaRef(value: string): number | null {
  const match = MEDIA_REF.exec(value.trim());
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function isMediaRef(value: string): boolean {
  return parseMediaRef(value) !== null;
}

/** Public URL that streams an image's bytes. */
export function mediaPath(id: number): string {
  return `/api/media/${id}`;
}

/** Human-readable byte size for the library UI. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
