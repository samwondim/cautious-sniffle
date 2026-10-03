import Image from "next/image";
import Link from "next/link";

import { VolunteerForm } from "@/components/forms";
import type { SiteContent } from "@/lib/content";
import { placeholderPhoto } from "@/lib/placeholder-image";

/**
 * "Get Involved" — a two-panel card sitting on a full-bleed photograph, from
 * the design: the pitch on accent green, the sign-up form on white.
 */
export function Volunteer({
  content,
  sectors,
}: {
  content: SiteContent;
  sectors: { id: number; name: string }[];
}) {
  const lead = content["volunteer.titleLead"];
  const highlight = content["volunteer.titleHighlight"];

  return (
    <section id="volunteer" className="relative px-6 py-20 md:px-10 lg:px-20 lg:py-28">
      {/* Backdrop photograph, held in black and white so the green panel and
          the gold heading stay the only saturated things in the band. */}
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src={placeholderPhoto({
            seed: "eh-volunteer-backdrop",
            width: 2400,
            height: 1600,
          })}
          alt=""
          fill
          sizes="100vw"
          quality={50}
          className="object-cover grayscale"
        />
        <div className="absolute inset-0 bg-ink/30" />
      </div>

      <div
        className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 overflow-hidden lg:grid-cols-[3fr_2fr]"
        style={{ boxShadow: "0 30px 60px rgba(16,60,70,0.35)" }}
      >
        {/* Left panel — the pitch. */}
        <div className="flex flex-col gap-6 bg-accent px-8 py-12 md:px-12 lg:py-16">
          {content["volunteer.eyebrow"] ? (
            <span className="inline-flex w-fit rounded-full bg-white/15 px-5 py-2 text-[13px] font-medium text-white">
              {content["volunteer.eyebrow"]}
            </span>
          ) : null}

          <h2 className="font-display text-[40px] leading-[1.12] md:text-[52px]">
            {lead || highlight ? (
              <>
                <span className="text-gold">{lead}</span>{" "}
                <span className="text-white">{highlight}</span>
              </>
            ) : (
              <span className="text-white">{content["volunteer.title"]}</span>
            )}
          </h2>

          {content["volunteer.body"] ? (
            <p className="max-w-[440px] text-[16px] leading-[1.65] text-white/85">
              {content["volunteer.body"]}
            </p>
          ) : null}

          {content["volunteer.ctaLabel"] ? (
            <Link
              href={content["volunteer.ctaHref"] || "#volunteer-form"}
              className="mt-2 w-fit rounded-full bg-gold px-8 py-4 text-sm font-semibold tracking-[0.04em] text-ink transition-colors hover:bg-white"
            >
              {content["volunteer.ctaLabel"]}
            </Link>
          ) : null}
        </div>

        {/* Right panel — the form. */}
        <div className="flex flex-col justify-center bg-white px-8 py-12 md:px-12 lg:py-16">
          <VolunteerForm
            sectors={sectors}
            submitLabel={content["volunteer.buttonLabel"] || "Sign Up"}
          />
        </div>
      </div>
    </section>
  );
}
