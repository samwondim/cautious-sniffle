import Link from "next/link";

import { StatValue } from "@/components/home/stat-value";
import { Icon, toIconName } from "@/components/icons";
import { ManagedBackdrop } from "@/components/managed-image";
import type { ImpactStat } from "@/db/schema";
import type { SiteContent } from "@/lib/content";
import {
  HERO_BACKDROP_ID,
  HERO_PHOTO_ID,
  placeholderPhotoById,
} from "@/lib/placeholder-image";

/**
 * Anchored to the copy rather than spread flat. The scrim this replaced was
 * lightest at the top, where the white headline sits, and heaviest at the
 * bottom under an opaque card that needs no protection — backwards with
 * respect to the only thing here that has to stay legible. The headline
 * measures 11.2:1 at the weakest point, and barely moves between a light and
 * a dark photograph, so legibility no longer depends on what is uploaded.
 */
const HERO_SCRIM =
  "linear-gradient(104deg, rgba(14,52,61,0.95) 0%, rgba(14,52,61,0.90) 45%, rgba(14,52,61,0.74) 100%)," +
  "linear-gradient(180deg, rgba(16,60,70,0) 55%, rgba(10,42,50,0.45) 100%)";

/** Layered rather than one flat drop, so the card reads as lit from above. */
const STAT_CARD_SHADOW = [
  "0 1px 2px rgba(16,60,70,0.10)",
  "0 8px 16px -8px rgba(16,60,70,0.20)",
  "0 32px 64px -24px rgba(16,60,70,0.35)",
  "inset 0 1px 0 rgba(255,255,255,0.65)",
].join(",");

export function Hero({
  content,
  stats,
}: {
  content: SiteContent;
  stats: ImpactStat[];
}) {
  return (
    // No `overflow-hidden`: the stat card hangs past the bottom edge onto the
    // next band by design.
    <section className="relative bg-ink px-6 pt-12 pb-20 md:px-10 md:pt-20 md:pb-32 lg:px-20 lg:pt-24">
      {/* Backdrop photograph. `bg-ink` on the section is the paint-in colour
          while this loads. Not preloaded: it sits under a 74-95% scrim, so
          arriving late costs almost nothing visually, whereas the card photo
          below arriving late leaves a visible empty frame. */}
      <div aria-hidden="true" className="absolute inset-0">
        <ManagedBackdrop
          value={content["hero.backdropImage"]}
          fallbackSrc={placeholderPhotoById({
            id: HERO_BACKDROP_ID,
            width: 2400,
            height: 1400,
          })}
          quality={50}
        />
        <div className="absolute inset-0" style={{ background: HERO_SCRIM }} />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
        <div className="flex flex-1 flex-col gap-6">
          {/* Empty by default — it used to recite the tagline's sector list. */}
          {content["hero.eyebrow"] ? (
            <span className="inline-flex w-fit items-center rounded-full border border-white/20 px-4 py-2 text-[0.8125rem] font-semibold tracking-[0.02em] text-gold">
              {content["hero.eyebrow"]}
            </span>
          ) : null}

          <h1 className="max-w-[640px] text-balance font-display text-display-sm text-white md:text-display-md lg:text-display">
            {content["hero.title"]}
          </h1>

          {content["hero.subtitle"] ? (
            <p className="max-w-[460px] text-[1rem] leading-[1.6] text-mist md:text-[1.125rem]">
              {content["hero.subtitle"]}
            </p>
          ) : null}

          <div className="mt-1 flex flex-wrap items-center gap-3 md:mt-2 md:gap-4">
            {content["hero.primaryLabel"] ? (
              <Link
                href={content["hero.primaryHref"] || "/#contact"}
                className="btn-gold flex-1 px-6 py-3.5 text-center text-sm font-semibold tracking-[0.04em] sm:flex-none md:px-8 md:py-4"
              >
                {content["hero.primaryLabel"]}
              </Link>
            ) : null}
            {content["hero.secondaryLabel"] ? (
              <Link
                href={content["hero.secondaryHref"] || "/#work"}
                className="btn-secondary btn-secondary-on-dark flex-1 px-6 py-3.5 text-center text-sm font-semibold tracking-[0.04em] sm:flex-none md:px-8 md:py-4"
              >
                {content["hero.secondaryLabel"]}
              </Link>
            ) : null}
          </div>
        </div>

        {/* One photograph, in colour, big enough to read. Replaced a five-tile
            collage whose tiles rendered at 157-198px, too small to carry a
            face, and which was hidden below `md` — so phones got no imagery
            at all. Unanimated on purpose: it is the LCP candidate. */}
        <div className="w-full shrink-0 lg:w-[46%] lg:max-w-[560px]">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden rounded-frame"
            style={{ boxShadow: "0 32px 64px -24px rgba(0,0,0,0.45)" }}
          >
            <ManagedBackdrop
              value={content["hero.image"]}
              fallbackSrc={placeholderPhotoById({
                id: HERO_PHOTO_ID,
                width: 1120,
                height: 1400,
              })}
              sizes="(min-width: 1024px) 560px, 100vw"
              preload
            />
          </div>
        </div>
      </div>

      {/* Floating stat card — overlaps the next section, per the design. */}
      {stats.length > 0 ? (
        <div className="relative z-10 mx-auto mt-12 w-full max-w-[980px] md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:translate-y-1/2 md:px-6">
          <div
            className="flex flex-col items-center gap-4 rounded-card bg-white px-5 py-5 md:flex-row md:justify-between md:gap-6 md:px-8 md:py-6"
            style={{ boxShadow: STAT_CARD_SHADOW }}
          >
            {stats.slice(0, 3).map((stat, index) => (
              <div key={stat.id} className="flex w-full items-center gap-3">
                {index > 0 ? (
                  <span className="hidden h-11 w-px bg-hairline md:block" />
                ) : null}
                {/* One tint for all three. These alternated on `index % 2`,
                    so the colour tracked array position — and `impact_stats`
                    has no category to key it to. */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-accent/12 md:h-11 md:w-11">
                  <Icon
                    name={toIconName(stat.icon)}
                    size={20}
                    className="text-accent"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[1rem] font-semibold text-ink md:text-stat">
                    <StatValue value={stat.value} /> {stat.label}
                  </span>
                  <span className="hidden text-[0.8125rem] text-slate sm:block">
                    {stat.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
