import Link from "next/link";

import { PhotoFrame } from "@/components/home/photo-frame";
import { StatValue } from "@/components/home/stat-value";
import { ManagedBackdrop } from "@/components/managed-image";
import type { ImpactStat } from "@/db/schema";
import type { SiteContent } from "@/lib/content";
import {
  HERO_PHOTO_ID,
  placeholderPhotoById,
} from "@/lib/placeholder-image";

/**
 * The first screen has to answer three things at a glance — who this is,
 * who it helps, and what to do now — and it has to do it above the fold,
 * where most viewing time is spent. So the copy column is ordered exactly
 * that way: an identity line naming the organisation and the country, the
 * headline, one checkable sentence, then one dominant action (Donate) and
 * one secondary (the work itself).
 *
 * Hierarchy comes from type and spacing on a single ink ground: no backdrop
 * photograph under a scrim (it was downloaded and then covered at 74-95%),
 * no badge, no floating card. Nothing here starts hidden — the headline is
 * the LCP text on phones and must paint with the HTML.
 */
export function Hero({
  content,
  stats,
}: {
  content: SiteContent;
  stats: ImpactStat[];
}) {
  const shownStats = stats.slice(0, 3);

  return (
    <section className="bg-ink px-6 pt-10 pb-16 md:px-10 md:pt-16 md:pb-20 lg:px-20 lg:pt-20 lg:pb-24">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 md:gap-12 lg:flex-row lg:items-center lg:gap-16 xl:gap-20">
        <div className="flex min-w-0 flex-1 flex-col gap-5 md:gap-6">
          {/* Who this is and where it works, before anything else. A plain
              label, not a pill: the outline badge carried no meaning of its
              own. Mist rather than gold so the accent stays with Donate. */}
          {content["hero.eyebrow"] ? (
            <p className="eyebrow text-mist">{content["hero.eyebrow"]}</p>
          ) : null}

          {/* Stepped to `display-md` at `lg`: there the copy shares the row
              with the photograph, and at 56px the headline ran to six lines
              and pushed the buttons to the fold. Back to full size once the
              column is wide enough to hold it in three. */}
          <h1 className="max-w-[680px] text-balance font-display text-display-sm text-white md:text-display-md xl:text-display">
            {content["hero.title"]}
          </h1>

          {content["hero.subtitle"] ? (
            <p className="max-w-[520px] text-[1rem] leading-[1.6] text-mist md:text-[1.125rem]">
              {content["hero.subtitle"]}
            </p>
          ) : null}

          {/* One dominant action, one secondary. Both are at least 48px
              tall, and share the row on a phone rather than stacking. */}
          <div className="mt-2 flex flex-wrap items-center gap-3 md:gap-4">
            {content["hero.primaryLabel"] ? (
              <Link
                href={content["hero.primaryHref"] || "/donate"}
                className="btn-gold inline-flex min-h-12 flex-1 items-center justify-center px-7 text-[0.9375rem] font-semibold sm:flex-none md:px-9"
              >
                {content["hero.primaryLabel"]}
              </Link>
            ) : null}
            {content["hero.secondaryLabel"] ? (
              <Link
                href={content["hero.secondaryHref"] || "/work"}
                className="btn-secondary btn-secondary-on-dark inline-flex min-h-12 flex-1 items-center justify-center px-7 text-[0.9375rem] font-semibold sm:flex-none md:px-9"
              >
                {content["hero.secondaryLabel"]}
              </Link>
            ) : null}
          </div>
        </div>

        {/* One static photograph — real photography of the work, supplied
            through the admin's Hero image slot. Below `lg` it follows the
            buttons and is cropped landscape: putting it first, or keeping
            the 4:5 portrait, would push the headline and both actions off a
            phone's first screen, and NN/g's guidance for phones is to take
            the text off the image rather than lay it over one. */}
        <PhotoFrame className="aspect-[4/3] w-full shrink-0 rounded-frame sm:aspect-[3/2] lg:aspect-[4/5] lg:w-[38%] lg:max-w-[520px] xl:w-[42%]">
          <ManagedBackdrop
            value={content["hero.image"]}
            fallbackSrc={placeholderPhotoById({
              id: HERO_PHOTO_ID,
              width: 1040,
              height: 1300,
            })}
            sizes="(min-width: 1440px) 520px, (min-width: 1280px) 42vw, (min-width: 1024px) 38vw, (min-width: 768px) calc(100vw - 80px), calc(100vw - 48px)"
            preload
          />
        </PhotoFrame>
      </div>

      {/* Impact figures, set as type on the band: a big number, a short
          label, a hairline between. The white card with icon chips that sat
          across the band's lower edge was the stock template stat strip. */}
      {shownStats.length > 0 ? (
        <dl className="mx-auto mt-14 grid max-w-[1280px] border-t border-white/15 md:mt-16 sm:grid-cols-3">
          {shownStats.map((stat, index) => (
            <div
              key={stat.id}
              className={`flex flex-col gap-1 py-6 sm:py-0 sm:pt-8 ${
                index > 0
                  ? "border-t border-white/15 sm:border-t-0 sm:border-l sm:pl-8 lg:pl-10"
                  : ""
              } ${index < shownStats.length - 1 ? "sm:pr-8 lg:pr-10" : ""}`}
            >
              <dt className="order-2 text-[1rem] font-semibold text-mist">
                {stat.label}
              </dt>
              <dd className="order-1 font-display text-[2.5rem] leading-none text-white md:text-[3rem]">
                <StatValue value={stat.value} />
              </dd>
              {stat.detail ? (
                <dd className="order-3 text-[0.875rem] leading-[1.5] text-mist/70">
                  {stat.detail}
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
