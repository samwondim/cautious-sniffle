import { Eyebrow } from "@/components/section";

/**
 * Dark opening band for a section page.
 *
 * Deliberately unanimated: it holds the `<h1>` and is the first paint on every
 * route that uses it, so nothing here may start at `opacity: 0`.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-ink px-6 py-16 md:px-10 lg:px-20 lg:py-20">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
        {eyebrow ? <Eyebrow tone="gold">{eyebrow}</Eyebrow> : null}
        <h1 className="max-w-[820px] font-display text-[36px] leading-[1.14] text-white md:text-[52px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-[640px] text-[17px] leading-[1.65] text-mist">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
