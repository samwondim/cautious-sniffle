/**
 * Placeholder photography for slots that have no real image yet.
 *
 * The site is designed around photographs the organisation has not supplied
 * yet — the hero collage, the mission and giving portraits, and any project
 * whose `imageUrl` is still null. Rather than leave those slots as empty
 * frames, they render stock photos from picsum.photos.
 *
 * These are stand-ins, not final art. Every URL is built here so that
 * swapping in real photography is a change to this one module plus the
 * `remotePatterns` entry in `next.config.ts`.
 *
 * Seeds matter: picsum's `/seed/:seed` route is deterministic, so a given
 * seed always resolves to the same photograph. Passing a stable seed (a
 * slot name, or a project's primary key) keeps the page from reshuffling
 * its imagery on every request.
 */

const PICSUM_ORIGIN = "https://picsum.photos";

/**
 * Build a deterministic placeholder URL at the given intrinsic size.
 *
 * `width` and `height` set the source image's aspect ratio. Rendered size is
 * still controlled by CSS, so these only need to match the slot's proportions.
 */
export function placeholderPhoto({
  seed,
  width,
  height,
}: {
  seed: string;
  width: number;
  height: number;
}): string {
  return `${PICSUM_ORIGIN}/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

/**
 * Build a URL for one specific picsum photograph.
 *
 * `/seed/:seed` picks an arbitrary photo, which is fine for the collage but no
 * good when the image has to actually depict something — the hero backdrop
 * needs a landscape, not whatever the seed happens to land on. Picsum ids are
 * stable, so pinning one fixes the subject.
 */
export function placeholderPhotoById({
  id,
  width,
  height,
}: {
  id: number;
  width: number;
  height: number;
}): string {
  return `${PICSUM_ORIGIN}/id/${id}/${width}/${height}`;
}

/** Picsum id 28 — a lush forest gorge, chosen for the hero backdrop. */
export const HERO_BACKDROP_ID = 28;
