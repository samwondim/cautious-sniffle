import Link from "next/link";

import { HeroCollage } from "@/components/home/hero-collage";
import { StatValue } from "@/components/home/stat-value";
import { Icon, Squiggle, toIconName } from "@/components/icons";
import { ManagedBackdrop } from "@/components/managed-image";
import type { ImpactStat } from "@/db/schema";
import type { SiteContent } from "@/lib/content";
import {
  HERO_BACKDROP_ID,
  placeholderPhotoById,
} from "@/lib/placeholder-image";

/** `site_content` keys feeding the five collage tiles, in tile order. */
const COLLAGE_KEYS = [
  "hero.tile1Image",
  "hero.tile2Image",
  "hero.tile3Image",
  "hero.tile4Image",
  "hero.tile5Image",
] as const;

export function Hero({
  content,
  stats,
}: {
  content: SiteContent;
  stats: ImpactStat[];
}) {
  return (
    // No `overflow-hidden`: the stat card below deliberately hangs past
    // the bottom edge onto the next band. Nothing else here overflows.
    <section className="relative bg-ink px-6 pt-12 pb-20 md:px-10 md:pt-20 md:pb-32 lg:px-20 lg:pt-24">
      {/* Backdrop photograph. `bg-ink` on the section stays as the paint-in
          colour, and the scrim over the photo holds the white headline above
          7:1 contrast even where the image runs bright. */}
      <div aria-hidden="true" className="absolute inset-0">
        <ManagedBackdrop
          value={content["hero.backdropImage"]}
          fallbackSrc={placeholderPhotoById({
            id: HERO_BACKDROP_ID,
            width: 2400,
            height: 1400,
          })}
          priority
          // Sits under an 82-92% opaque scrim, so most of the detail is never
          // seen. Dropping quality trims the largest above-the-fold download
          // with no visible difference.
          quality={50}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(16,60,70,0.82) 0%, rgba(12,46,54,0.92) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col gap-16 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex flex-1 flex-col gap-6">
          {content["hero.eyebrow"] ? (
            <span className="inline-flex w-fit items-center rounded-full border border-white/16 bg-white/8 px-4 py-2 text-[12px] font-semibold tracking-[0.02em] text-gold md:px-5 md:py-2.5 md:text-[13px]">
              {content["hero.eyebrow"]}
            </span>
          ) : null}

          <h1 className="max-w-[680px] font-display text-[32px] leading-[1.08] text-white md:text-display">
            {content["hero.titleLead"]}{" "}
            <span className="relative inline-block">
              {content["hero.titleHighlight"]}
              <Squiggle className="absolute bottom-[-8px] left-0" />,
            </span>
            <br />
            {content["hero.titleTail"]}
          </h1>

          {content["hero.subtitle"] ? (
            <p className="max-w-[480px] text-[16px] leading-[1.6] text-mist md:text-[18px]">
              {content["hero.subtitle"]}
            </p>
          ) : null}

          {/* Desktop buttons — on mobile the CTAs render below the stat card. */}
          <div className="mt-1 hidden flex-wrap items-center gap-3 md:mt-2 md:flex md:gap-4">
            {content["hero.primaryLabel"] ? (
              <Link
                href={content["hero.primaryHref"] || "/#contact"}
                className="rounded-full bg-gold px-6 py-3.5 text-sm font-semibold tracking-[0.04em] text-ink transition-colors hover:bg-growth hover:text-white md:px-8 md:py-4"
              >
                {content["hero.primaryLabel"]}
              </Link>
            ) : null}
            {content["hero.secondaryLabel"] ? (
              <Link
                href={content["hero.secondaryHref"] || "/#work"}
                className="btn-secondary btn-secondary-on-dark px-6 py-3.5 text-sm font-semibold tracking-[0.04em] md:px-8 md:py-4"
              >
                {content["hero.secondaryLabel"]}
              </Link>
            ) : null}
          </div>
        </div>

        {/* Collage is decorative; hidden on narrow screens to preserve layout. */}
        <HeroCollage
          images={Object.fromEntries(
            COLLAGE_KEYS.map((key) => [key, content[key]]),
          )}
        />
      </div>

      {/* Floating stat card — overlaps the next section, per the design. */}
      {stats.length > 0 ? (
        <div className="relative z-10 mx-auto mt-10 w-full max-w-[980px] md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:translate-y-1/2 md:px-6">
          <div
            className="flex flex-col items-center gap-4 rounded-[20px] bg-white px-5 py-5 md:flex-row md:justify-between md:gap-6 md:px-8 md:py-6"
            style={{ boxShadow: "0 24px 48px rgba(16,60,70,0.30)" }}
          >
            {stats.slice(0, 3).map((stat, index) => (
              <div key={stat.id} className="flex w-full items-center gap-3">
                {index > 0 ? (
                  <span className="hidden h-11 w-px bg-hairline md:block" />
                ) : null}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl md:h-11 md:w-11"
                  style={{
                    background:
                      index % 2 === 1
                        ? "rgba(59,152,97,0.12)"
                        : "rgba(62,172,180,0.14)",
                  }}
                >
                  <Icon
                    name={toIconName(stat.icon)}
                    size={20}
                    className={index % 2 === 1 ? "text-olive" : "text-accent"}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[16px] font-semibold text-ink md:text-stat">
                    <StatValue value={stat.value} /> {stat.label}
                  </span>
                  <span className="hidden text-[13px] text-slate sm:block">
                    {stat.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Mobile CTAs — rendered below the stat card; desktop uses the copy above. */}
      <div className="relative z-10 mx-auto mt-6 flex w-full max-w-[980px] flex-wrap items-center gap-3 md:hidden">
        {content["hero.primaryLabel"] ? (
          <Link
            href={content["hero.primaryHref"] || "/#contact"}
            className="flex-1 rounded-full bg-gold px-6 py-3.5 text-center text-sm font-semibold tracking-[0.04em] text-ink transition-colors hover:bg-growth hover:text-white"
          >
            {content["hero.primaryLabel"]}
          </Link>
        ) : null}
        {content["hero.secondaryLabel"] ? (
          <Link
            href={content["hero.secondaryHref"] || "/#work"}
            className="btn-secondary btn-secondary-on-dark flex-1 px-6 py-3.5 text-center text-sm font-semibold tracking-[0.04em]"
          >
            {content["hero.secondaryLabel"]}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
