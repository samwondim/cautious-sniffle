import { Icon, toIconName } from "@/components/icons";
import { Eyebrow, Section, SectionTitle } from "@/components/section";
import type { Sector } from "@/db/schema";
import type { SiteContent } from "@/lib/content";

/** "What We Do" — four sectors on the mint band. */
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
      <div className="flex flex-col gap-3">
        <Eyebrow>{content["sectors.eyebrow"]}</Eyebrow>
        <SectionTitle>{content["sectors.title"]}</SectionTitle>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {sectors.map((sector, index) => (
          <div
            key={sector.id}
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
            <p className="text-sm leading-[1.55] text-slate">{sector.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
