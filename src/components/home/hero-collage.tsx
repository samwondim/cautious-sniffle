"use client";

import { motion } from "motion/react";

import { ManagedBackdrop } from "@/components/managed-image";
import {
  HERO_ARC_VARIANTS,
  HERO_COLLAGE_VARIANTS,
  HERO_TILE_VARIANTS,
} from "@/lib/motion";
import { placeholderPhotoById } from "@/lib/placeholder-image";

/* -------------------------------------------------------------------------- */
/* Hero collage                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Tile geometry, derived once from the reference composition (an 838x768
 * canvas) and expressed as percentages of the collage box plus a per-tile
 * aspect ratio. The box itself is fluid (`aspect-[560/480]`), so the
 * arrangement scales to any width instead of living at one fixed pixel size.
 */
type TileSpec = {
  /** Percent of the collage box width. */
  left: number;
  /** Percent of the collage box height. */
  top: number;
  /** Percent of the collage box width. */
  width: number;
  /** Intrinsic w/h, preserved via `aspect-ratio`. */
  aspect: number;
  /**
   * Pinned picsum id. Seeds would give an arbitrary subject — a bridge, a
   * skyline — where this collage needs people, so each tile names its photo.
   */
  photoId: number;
  /** The centre tile overlaps the four around it. */
  z: number;
  /** `site_content` key the admin can point at its own photograph. */
  contentKey: string;
  /** Rendered width at the 560px design size; drives `sizes` + placeholder. */
  designWidth: number;
};

const TILES: TileSpec[] = [
  {
    left: (133 / 838) * 100,
    top: (40 / 768) * 100,
    width: (277 / 838) * 100,
    aspect: 277 / 285,
    photoId: 646,
    z: 2,
    contentKey: "hero.tile1Image",
    designWidth: 185,
  },
  {
    left: (485 / 838) * 100,
    top: (65 / 768) * 100,
    width: (235 / 838) * 100,
    aspect: 235 / 250,
    photoId: 129,
    z: 2,
    contentKey: "hero.tile2Image",
    designWidth: 157,
  },
  {
    left: (296 / 838) * 100,
    top: (196 / 768) * 100,
    width: (296 / 838) * 100,
    aspect: 296 / 297,
    photoId: 64,
    z: 3,
    contentKey: "hero.tile3Image",
    designWidth: 198,
  },
  {
    left: (175 / 838) * 100,
    top: (380 / 768) * 100,
    width: (235 / 838) * 100,
    aspect: 235 / 245,
    photoId: 65,
    z: 1,
    contentKey: "hero.tile4Image",
    designWidth: 157,
  },
  {
    left: (490 / 838) * 100,
    top: (395 / 768) * 100,
    width: (260 / 838) * 100,
    aspect: 260 / 270,
    photoId: 342,
    z: 1,
    contentKey: "hero.tile5Image",
    designWidth: 174,
  },
];

/**
 * Concentric quarter-arcs centred just off the collage's top-left corner, as
 * in the reference: growth green inside the inner arc, teal between the two,
 * and growth green again in the far corner beyond the outer one.
 *
 * Rendered as one SVG (two circles cropped by the rounded box) rather than
 * two oversized solid-colour divs, so nothing paints far offscreen.
 */
function Arcs() {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 560 480"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      variants={HERO_ARC_VARIANTS}
    >
      <rect width="560" height="480" fill="var(--growth)" />
      <circle cx="33" cy="0" r="575" fill="var(--teal)" />
      <circle cx="33" cy="0" r="254" fill="var(--growth)" />
    </motion.svg>
  );
}

function Tile({
  tile,
  image,
  priority,
}: {
  tile: TileSpec;
  /** Admin-supplied photograph for this tile, if there is one. */
  image: string | undefined;
  priority?: boolean;
}) {
  const { photoId, z, designWidth } = tile;
  return (
    <motion.div
      variants={HERO_TILE_VARIANTS}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      className="group absolute overflow-hidden rounded-[20px] ring-1 ring-white/80"
      style={{
        left: `${tile.left}%`,
        top: `${tile.top}%`,
        width: `${tile.width}%`,
        aspectRatio: `${tile.aspect}`,
        zIndex: z,
        boxShadow: "0 20px 45px -15px rgba(16,60,70,0.45)",
      }}
    >
      <ManagedBackdrop
        value={image}
        fallbackSrc={placeholderPhotoById({
          id: photoId,
          width: designWidth * 2,
          height: Math.round((designWidth / tile.aspect) * 2),
        })}
        sizes="(min-width: 1280px) 200px, (min-width: 1024px) 18vw, 0px"
        priority={priority}
        className="object-cover grayscale transition-[filter,transform] duration-700 ease-out group-hover:scale-[1.08] group-hover:grayscale-0"
      />
    </motion.div>
  );
}

export function HeroCollage({
  images,
}: {
  /** Admin-supplied photograph per tile `contentKey`. */
  images: Record<string, string | undefined>;
}) {
  return (
    <motion.div
      className="relative hidden aspect-[560/480] w-full max-w-[560px] shrink-0 md:block"
      variants={HERO_COLLAGE_VARIANTS}
      initial="hidden"
      animate="show"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-[24px]"
      >
        <Arcs />
      </div>

      {TILES.map((tile, index) => (
        <Tile
          key={tile.photoId}
          tile={tile}
          image={images[tile.contentKey]}
          priority={index === 2}
        />
      ))}
    </motion.div>
  );
}
