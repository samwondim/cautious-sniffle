import * as motion from "motion/react-client";
import Link from "next/link";

import { Icon, toIconName } from "@/components/icons";
import { ManagedImage } from "@/components/managed-image";
import { Eyebrow, Section, SectionTitle } from "@/components/section";
import type { GivingOption } from "@/db/schema";
import type { SiteContent } from "@/lib/content";
import { fadeIn, reveal } from "@/lib/motion";

/**
 * The icon-and-text giving rows of the "Ways to Give" band.
 */
export function GivingOptionList({ options }: { options: GivingOption[] }) {
  return (
    <div className="flex flex-col gap-5">
      {options.map((option, index) => (
        <motion.div
          key={option.id}
          {...reveal({ index, distance: 16 })}
          className="flex items-start gap-4"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background:
                option.icon === "building"
                  ? "rgba(59,152,97,0.12)"
                  : "rgba(62,172,180,0.14)",
            }}
          >
            <Icon
              name={toIconName(option.icon)}
              size={20}
              className={
                option.icon === "building" ? "text-growth" : "text-accent"
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-ink">{option.title}</h3>
            <p className="max-w-[420px] text-sm leading-[1.55] text-slate">
              {option.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** "Ways to Give" — giving options beside a photo slot. */
export function Give({
  content,
  options,
}: {
  content: SiteContent;
  options: GivingOption[];
}) {
  return (
    <Section id="give" className="lg:py-28">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-18">
        <motion.div {...reveal()} className="flex flex-1 flex-col gap-6">
          <Eyebrow>{content["give.eyebrow"]}</Eyebrow>
          <SectionTitle size="lg">{content["give.title"]}</SectionTitle>

          {content["give.body"] ? (
            <p className="max-w-[480px] text-[17px] leading-[1.6] text-slate">
              {content["give.body"]}
            </p>
          ) : null}

          <div className="mt-1">
            <GivingOptionList options={options} />
          </div>

          {content["give.ctaLabel"] ? (
            <Link
              href={content["give.ctaHref"] || "/donate"}
              className="btn-donate mt-2 w-fit px-8 py-4 text-sm font-semibold tracking-[0.08em]"
            >
              {content["give.ctaLabel"]}
            </Link>
          ) : null}

          <Link
            href="/donate"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent transition-opacity hover:opacity-65"
          >
            {content["give.detailsLabel"] || "See bank transfer details"}
            <Icon name="arrow-right" size={16} />
          </Link>
        </motion.div>

        <motion.div
          {...fadeIn({ amount: 0.2 })}
          className="relative hidden h-[520px] w-[480px] shrink-0 lg:block"
        >
          <div
            className="absolute top-0 left-0 h-[280px] w-[280px] rounded-full"
            style={{ background: "rgba(59,152,97,0.12)" }}
          />
          <div
            className="absolute right-[10px] bottom-0 h-[220px] w-[220px] rounded-3xl"
            style={{ background: "rgba(62,172,180,0.12)" }}
          />
          <div className="absolute top-[30px] right-0 h-[460px] w-[420px]">
            <ManagedImage
              value={content["give.photo"]}
              alt={content["give.photoCaption"] || ""}
              sizes="420px"
              placeholderSeed="eh-give-at-work"
              placeholderWidth={840}
              placeholderHeight={920}
              className="h-full w-full rounded-[20px] border border-hairline-strong"
            />
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
