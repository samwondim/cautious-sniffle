import * as motion from "motion/react-client";

import { Icon } from "@/components/icons";
import { ManagedImage } from "@/components/managed-image";
import { Section } from "@/components/section";
import type { SiteContent } from "@/lib/content";
import { fadeIn, reveal } from "@/lib/motion";

/**
 * "Who We Are" — mission and vision, beside a photo slot.
 *
 * `showTitle` is false on `/about`, where the page's own `<h1>` already says
 * this and a second identical heading would just be repetition.
 */
export function Mission({
  content,
  showTitle = true,
  photoPriority = false,
}: {
  content: SiteContent;
  showTitle?: boolean;
  /** True on `/about`, where this photo is the largest thing on first paint. */
  photoPriority?: boolean;
}) {
  return (
    <Section id="mission" className="lg:py-28">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-18">
        <motion.div
          {...fadeIn({ amount: 0.2 })}
          className="relative hidden h-[560px] w-[500px] shrink-0 lg:block"
        >
          <div
            className="absolute right-[10px] top-0 h-[300px] w-[300px] rounded-full"
            style={{ background: "rgba(62,172,180,0.14)" }}
          />
          <div
            className="absolute bottom-0 left-0 h-[240px] w-[240px] rounded-3xl"
            style={{ background: "rgba(59,152,97,0.12)" }}
          />
          <div className="absolute top-[30px] left-[10px] h-[500px] w-[440px]">
            <ManagedImage
              value={content["mission.photo"]}
              alt={content["mission.photoCaption"] || ""}
              sizes="440px"
              placeholderSeed="eh-mission-portrait"
              placeholderWidth={880}
              placeholderHeight={1000}
              priority={photoPriority}
              className="h-full w-full rounded-[20px] border border-hairline-strong"
            />
          </div>
        </motion.div>

        <motion.div {...reveal()} className="flex flex-1 flex-col gap-6">
          {content["mission.eyebrow"] ? (
            <span className="inline-flex w-fit items-center rounded-full border border-accent/20 bg-accent/8 px-[18px] py-2 text-[13px] font-semibold text-accent">
              {content["mission.eyebrow"]}
            </span>
          ) : null}

          {showTitle ? (
            <h2 className="font-display text-[40px] leading-[1.1] text-ink md:text-[52px]">
              {content["mission.title"]}
            </h2>
          ) : null}

          {content["mission.body"] ? (
            <p className="max-w-[520px] text-[17px] leading-[1.65] text-slate">
              {content["mission.body"]}
            </p>
          ) : null}

          <div className="mt-2 flex flex-col gap-[22px]">
            <motion.div
              {...reveal({ distance: 16 })}
              className="flex items-start gap-4"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(62,172,180,0.14)" }}
              >
                <Icon name="flag" size={20} className="text-accent" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-ink">
                  {content["mission.missionTitle"]}
                </h3>
                <p className="max-w-[460px] text-[15px] leading-[1.55] text-slate">
                  {content["mission.missionBody"]}
                </p>
              </div>
            </motion.div>

            <motion.div
              {...reveal({ index: 1, distance: 16 })}
              className="flex items-start gap-4"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(59,152,97,0.12)" }}
              >
                <Icon name="eye" size={20} className="text-growth" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-ink">
                  {content["mission.visionTitle"]}
                </h3>
                <p className="max-w-[460px] text-[15px] leading-[1.55] text-slate">
                  {content["mission.visionBody"]}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
