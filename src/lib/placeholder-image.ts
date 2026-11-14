/**
 * Placeholder photography for slots that have no real image yet.
 *
 * The site is designed around photographs the organisation has not supplied
 * yet — the hero photograph, the mission and giving portraits, and any project
 * whose `imageUrl` is still null. Rather than leave those slots as empty
 * frames, they render stand-in photographs from `public/placeholders`.
 *
 * The files are local copies of Pexels-licensed photographs, so a page never
 * depends on a third-party image host at runtime. They are stand-ins, not final
 * art: real photography replaces one by dropping a file into the folder and
 * pointing the entry below at it. `next/image` optimises them like any other
 * local asset.
 *
 * Seeds matter: a given seed always resolves to the same photograph, so a page
 * does not reshuffle its imagery between requests. Slots whose subject matters
 * are pinned by name or id; the rest are spread across the pool that matches
 * the requested orientation. See `public/placeholders/README.md` for sources.
 */

const PLACEHOLDER_DIR = "/placeholders";

/** Slots whose stand-in should depict something specific. */
const CURATED: Record<string, string> = {
  // Cupped hands holding a seedling — care and stewardship.
  "eh-hero": "hero-growth",
  // A volunteer carrying a child through a community event.
  "eh-mission-portrait": "mission-community",
  // Young volunteers smiling together.
  "eh-give-at-work": "give-care",
  // Volunteers organising aid supplies for distribution.
  "eh-volunteer-backdrop": "volunteer-aid",
};

/** Portrait-shaped stand-ins, for framed portraits and tall cards. */
const PORTRAITS = ["mission-community", "give-care", "hero-growth"];

/** Landscape-shaped stand-ins, for bands, cards and wide frames. */
const LANDSCAPES = [
  "volunteer-aid",
  "children-village",
  "seedling",
  "classroom-learning",
  "health-outreach",
];

/**
 * Slots addressed by a legacy numeric id rather than a seed. Kept so the
 * pinned call sites (and older content) keep resolving to the intended
 * subject after the move to local files.
 */
const CURATED_BY_ID: Record<number, string> = {
  785: "hero-growth",
  1001: "volunteer-aid",
};

/**
 * Stable, cheap hash. It only needs to spread nearby seeds (project and gallery
 * ids) across the pool; cryptographic strength would be wasted here.
 */
function seedIndex(seed: string, length: number): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash % length;
}

function poolFor(width: number, height: number): string[] {
  return height > width ? PORTRAITS : LANDSCAPES;
}

/**
 * Resolve the stand-in for a slot.
 *
 * `width` and `height` describe the slot's proportions and choose the right
 * orientation. Rendered size is still controlled by CSS.
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
  const pool = poolFor(width, height);
  const name = CURATED[seed] ?? pool[seedIndex(seed, pool.length)];
  return `${PLACEHOLDER_DIR}/${name}.jpg`;
}

/**
 * Resolve the stand-in for a slot addressed by a pinned id.
 *
 * The ids used to select picsum photographs. They are kept in the signature so
 * the call sites written against them keep working; unknown ids fall back to
 * the orientation-appropriate pool.
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
  const pool = poolFor(width, height);
  const name =
    CURATED_BY_ID[id] ?? pool[seedIndex(String(id), pool.length)];
  return `${PLACEHOLDER_DIR}/${name}.jpg`;
}

/**
 * 785: cupped hands holding green growth — the hero portrait.
 */
export const HERO_PHOTO_ID = 785;

/**
 * 1001: people moving across open ground — read as texture under the hero
 * scrim, where only a human silhouette survives.
 */
export const HERO_BACKDROP_ID = 1001;
