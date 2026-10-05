import * as motion from "motion/react-client";
import Link from "next/link";

import { BandSeam } from "@/components/band-seam";
import { Section } from "@/components/section";
import { reveal } from "@/lib/motion";

/**
 * Closing band for a section page: one sentence and the two things a reader
 * can do next. Every section page ends in one, so no page is a dead end.
 */
export function PageCta({
  title,
  body,
  primary,
  secondary,
  tone = "mint",
  seamSide = "left",
}: {
  title: string;
  body?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  tone?: "mint" | "white" | "cream";
  /** Side the closing arc into the footer rises from. */
  seamSide?: "left" | "right";
}) {
  return (
    <>
      <Section tone={tone}>
        <motion.div
          {...reveal({ distance: 16, amount: 0.4 })}
          className="mx-auto flex max-w-[720px] flex-col items-center gap-4 text-center"
        >
          <h2 className="font-display text-[28px] leading-[1.2] text-ink md:text-[32px]">
            {title}
          </h2>
          {body ? (
            <p className="text-[16px] leading-[1.65] text-slate">{body}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={primary.href}
              className="btn-donate px-8 py-4 text-sm font-semibold tracking-[0.08em]"
            >
              {primary.label}
            </Link>
            {secondary ? (
              <Link
                href={secondary.href}
                className="btn-secondary px-8 py-4 text-sm font-semibold tracking-[0.04em]"
              >
                {secondary.label}
              </Link>
            ) : null}
          </div>
        </motion.div>
      </Section>
      <BandSeam from={tone} to="ink-deep" side={seamSide} />
    </>
  );
}
