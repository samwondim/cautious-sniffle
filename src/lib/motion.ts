/**
 * Scroll-reveal tokens for the public site.
 *
 * The sections that use these stay server components: they import
 * `motion/react-client`, whose components are pre-marked client components, and
 * spread the plain objects below. Everything here must therefore stay
 * serializable — no functions, no motion values.
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
