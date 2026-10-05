/**
 * The curved seam between two colour bands.
 *
 * The hero collage is built from two concentric quarter-arcs
 * (`src/components/home/hero.tsx`), and this reuses that geometry at page
 * scale: the incoming band's colour arrives as a wide, shallow arc rather than
 * a ruled line. Arcs alternate side down a page, so the eye is carried left,
 * then right, as it scrolls — the arc rises exactly where the next band's
 * reveals begin, which is what ties the two together.
 *
 * Purely decorative: `aria-hidden`, no text, no animation of its own. The
 * hero's own bottom edge stays straight, because the floating stat card
 * crosses it.
 */

type BandTone = "white" | "mint" | "cream" | "ink" | "ink-deep";

/** Band backgrounds, matching the `tone` map in `Section`. */
const BAND_BG: Record<BandTone, string> = {
  white: "bg-white",
  mint: "bg-mint",
  cream: "bg-cream",
  ink: "bg-ink",
  "ink-deep": "bg-ink-deep",
};

/** Fills come from the same tokens the bands are painted with. */
const BAND_FILL: Record<BandTone, string> = {
  white: "#ffffff",
  mint: "var(--mint)",
  cream: "var(--cream)",
  ink: "var(--ink)",
  "ink-deep": "var(--ink-deep)",
};

/**
 * The seam is a quarter of an ellipse spanning the full band width and the
 * full seam height, which is what the hero's quarter-arcs are: a circle's
 * corner, cropped by its box. Radii equal to the viewBox keep it a true
 * quarter — a larger radius flattens into a plain diagonal.
 */
const ARC_WIDTH = 1440;
const ARC_HEIGHT = 120;

export function BandSeam({
  from,
  to,
  side = "left",
}: {
  /** Band above the seam. */
  from: BandTone;
  /** Band below it — the colour that rises into the arc. */
  to: BandTone;
  /** Which edge the incoming colour reaches first. */
  side?: "left" | "right";
}) {
  return (
    <div aria-hidden="true" className={`${BAND_BG[from]} leading-[0]`}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-12 w-full md:h-20 lg:h-[104px]"
      >
        <g
          transform={
            side === "right" ? "translate(1440,0) scale(-1,1)" : undefined
          }
        >
          <path
            d={`M0 0 A ${ARC_WIDTH} ${ARC_HEIGHT} 0 0 0 ${ARC_WIDTH} ${ARC_HEIGHT} L${ARC_WIDTH} ${ARC_HEIGHT} L0 ${ARC_HEIGHT} Z`}
            fill={BAND_FILL[to]}
          />
        </g>
      </svg>
    </div>
  );
}
