import * as motion from "motion/react-client";
import Link from "next/link";

import { Icon, toIconName } from "@/components/icons";
import { Eyebrow, Section, SectionTitle } from "@/components/section";
import type { Sector } from "@/db/schema";
import type { SiteContent } from "@/lib/content";
import { fadeIn, reveal } from "@/lib/motion";

/**
 * The sector cards themselves, shared by the home band (which shows a slice)
 * and `/what-we-do` (which shows all of them).
 */
export function SectorGrid({ sectors }: { sectors: Sector[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {sectors.map((sector, index) => (
        <motion.div
          key={sector.id}
          {...reveal({ index, distance: 20 })}
          className="flex flex-col gap-2.5 border-t-2 pt-5"
          style={{
            borderTopColor: index % 2 === 1 ? "var(--growth)" : "var(--teal)",
          }}
        >
          <Icon
            name={toIconName(sector.icon)}
            size={30}
            className={index % 2 === 1 ? "text-growth" : "text-teal"}
          />
          <h3 className="text-[17px] font-semibold">{sector.name}</h3>
          <p className="text-sm leading-[1.55] text-slate">
            {sector.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/** "What We Do" — a taste of the sectors, in full on `/what-we-do`. */
export function Sectors({
  content,
  sectors,
}: {
  content: SiteContent;
  sectors: Sector[];
}) {
  // Extra top padding clears the hero stat card that overlaps this band. It is
  // repeated at `lg` because `Section`'s own `lg:py-24` is emitted after the
  // `md` layer, and its `padding-block` would otherwise win at desktop widths.
  return (
    <Section id="what-we-do" tone="mint" className="pt-20 md:pt-40 lg:pt-40">
      <motion.div {...reveal()} className="flex flex-col gap-3">
        <Eyebrow>{content["sectors.eyebrow"]}</Eyebrow>
        <SectionTitle>{content["sectors.title"]}</SectionTitle>
      </motion.div>

      <div className="mt-10">
        <SectorGrid sectors={sectors} />
      </div>

      <motion.div {...fadeIn()} className="mt-10">
        <Link
          href="/what-we-do"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-opacity hover:opacity-65"
        >
          {content["sectors.moreLabel"] || "How we work in each sector"}
          <Icon name="arrow-right" size={16} />
        </Link>
      </motion.div>
    </Section>
  );
}
