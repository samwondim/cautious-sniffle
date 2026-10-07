/**
 * Scroll-reveal tokens for the public site, plus the hero collage entrance.
 *
 * The sections that use these stay server components: they import
 * `motion/react-client`, whose components are pre-marked client components, and
 * spread the plain objects below. Everything here must therefore stay
 * serializable — no functions, no motion values.
 *
 * The hero collage (`src/components/home/hero-collage.tsx`) is the one
 * client-component exception: it imports these same tokens into `motion/react`
 * variants so the whole page shares one motion vocabulary.
 */

/** Expo-out. Reads as a settle rather than a slide. */
export const REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const REVEAL_DURATION = 0.5;

/**
 * Grid item counts come from Postgres and are editable in the admin, so the
 * stagger is capped: the sixth card onwards shares the last step instead of
 * pushing the tail of a long gallery a full second behind its heading.
 */
const STAGGER_STEP = 0.07;
const MAX_STAGGER_STEPS = 5;

type RevealOptions = {
  /** Position in a grid or list. Drives the stagger. */
  index?: number;
  /** Rise distance in pixels. */
  distance?: number;
  /** Fraction of the element that must be visible to trigger. */
  amount?: number;
};

function staggerDelay(index: number) {
  return Math.min(index, MAX_STAGGER_STEPS) * STAGGER_STEP;
}

function transition(index: number) {
  return {
    duration: REVEAL_DURATION,
    ease: REVEAL_EASE,
    delay: staggerDelay(index),
  };
}

/**
 * Fade and rise once, when the element scrolls into view.
 *
 * The rise is animated as a `transform` string rather than Motion's independent
 * `y`, so it runs on WAAPI: these reveals fire once, are never interrupted and
 * compose with nothing, so there is no reason to drive them from the main
 * thread or to set `will-change`.
 *
 * `data-reveal` is the hook the `<noscript>` rule in the site layout uses to
 * undo the server-rendered `opacity: 0` when JavaScript never arrives.
 */
export function reveal({ index = 0, distance = 24, amount = 0.3 }: RevealOptions = {}) {
  return {
    "data-reveal": "",
    initial: { opacity: 0, transform: `translateY(${distance}px)` },
    whileInView: { opacity: 1, transform: "translateY(0px)" },
    viewport: { once: true, amount },
    transition: transition(index),
  };
}

/**
 * Fade only, for anything whose position must not move: image boxes, where a
 * transform would shift the space `next/image` has reserved, and large
 * decorative photography, where a rise reads as a lurch.
 */
export function fadeIn({ index = 0, amount = 0.3 }: Omit<RevealOptions, "distance"> = {}) {
  return {
    "data-reveal": "",
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, amount },
    transition: transition(index),
  };
}

/* -------------------------------------------------------------------------- */
/* Hero collage entrance (lively spring stagger)                              */
/* -------------------------------------------------------------------------- */

/**
 * Shared hero tile spring: a lively settle, not a bounce. `stiffness` 260 /
 * `damping` 26 lands in ~0.7s with a hint of overshoot on scale only.
 */
export const HERO_TILE_SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 1,
} as const;

/** Stagger between tiles, with a beat after the copy starts to settle. */
export const HERO_COLLAGE_STAGGER = 0.12;
export const HERO_COLLAGE_DELAY = 0.15;

/** Container variant: fades in the arc backdrop, then staggers the tiles. */
export const HERO_COLLAGE_VARIANTS = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: HERO_COLLAGE_STAGGER,
      delayChildren: HERO_COLLAGE_DELAY,
    },
  },
} as const;

/** Backdrop arc variant: a slow fade so the tiles pop against it. */
export const HERO_ARC_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.8, ease: REVEAL_EASE },
  },
} as const;

/** Tile variant: fade, rise and un-scale into place. */
export const HERO_TILE_VARIANTS = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: HERO_TILE_SPRING,
  },
} as const;
