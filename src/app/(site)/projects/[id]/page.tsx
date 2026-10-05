import * as motion from "motion/react-client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BandSeam } from "@/components/band-seam";
import { ProjectGrid } from "@/components/home/work";
import { Icon, type IconName } from "@/components/icons";
import { ManagedImage } from "@/components/managed-image";
import { PageCta } from "@/components/page-cta";
import { Eyebrow, Section, SectionTitle } from "@/components/section";
import {
  getPublishedProject,
  getRelatedProjects,
  getSiteContent,
} from "@/lib/content";
import { fadeIn, reveal } from "@/lib/motion";

/** Ids are the primary key, so anything non-numeric is a 404, not a lookup. */
function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

/** Body and outcomes are authored as plain text, one block per blank line. */
function paragraphs(value: string | null) {
  if (!value) return [];
  return value
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function lines(value: string | null) {
  if (!value) return [];
  return value
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export async function generateMetadata({ params }: PageProps<"/projects/[id]">) {
  const id = parseId((await params).id);
  const project = id === null ? undefined : await getPublishedProject(id);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — ${project.location}`,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[id]">) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const [project, content] = await Promise.all([
    getPublishedProject(id),
    getSiteContent(),
  ]);
  if (!project) notFound();

  const related = await getRelatedProjects({
    excludeId: project.id,
    sectorId: project.sectorId,
  });

  const body = paragraphs(project.body);
  const outcomes = lines(project.outcomes);

  /** The facts card only lists what has actually been filled in. */
  const facts: { label: string; value: string | null; icon: IconName }[] = [
    { label: "Location", value: project.location, icon: "map-pin" },
    { label: "Sector", value: project.sectorName, icon: "flag" },
    { label: "Timeframe", value: project.timeframe, icon: "calendar" },
    { label: "Partner", value: project.partner, icon: "building" },
    {
      label: "People reached",
      value: project.beneficiaries,
      icon: "hand-heart",
    },
  ];
  const shownFacts = facts.filter((f) => Boolean(f.value));

  return (
    <>
      <section className="bg-ink px-6 py-16 md:px-10 lg:px-20 lg:py-20">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
          <Link
            href="/work"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-mist transition-colors hover:text-white"
          >
            <Icon name="arrow-right" size={16} className="rotate-180" />
            Back to {content["nav.work"] || content["work.eyebrow"] || "our work"}
          </Link>

          {project.sectorName ? (
            <span
              className="inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.06em] text-white uppercase"
              style={{ background: "var(--olive)" }}
            >
              {project.sectorName}
            </span>
          ) : null}

          <h1 className="max-w-[860px] font-display text-[36px] leading-[1.14] text-white md:text-[48px]">
            {project.title}
          </h1>

          <p className="max-w-[680px] text-[18px] leading-[1.6] text-mist">
            {project.summary}
          </p>
        </div>
      </section>

      <Section className="lg:py-20">
        <div className="mx-auto max-w-[1180px]">
          {/* The photograph is the page's LCP element: eager, and never
              wrapped in anything that starts transparent. */}
          <div className="overflow-hidden rounded-2xl">
            <ManagedImage
              value={project.imageUrl}
              alt={`${project.title} — ${project.location}`}
              sizes="(min-width: 1180px) 1180px, 100vw"
              className="h-[280px] w-full md:h-[460px]"
              placeholderSeed={`eh-project-${project.id}`}
              placeholderWidth={1800}
              placeholderHeight={950}
              priority
            />
          </div>

          <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
            {/* Story column. */}
            <div className="flex min-w-0 flex-1 flex-col gap-10">
              {body.length > 0 ? (
                // One reveal for the whole body, not one per paragraph: copy
                // that keeps arriving late fights the reader's own pace.
                <motion.div
                  {...reveal({ distance: 16, amount: 0.15 })}
                  className="flex flex-col gap-5"
                >
                  {body.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-[17px] leading-[1.75] text-slate"
                    >
                      {paragraph}
                    </p>
                  ))}
                </motion.div>
              ) : null}

              {outcomes.length > 0 ? (
                <motion.div
                  {...reveal({ distance: 16, amount: 0.2 })}
                  className="rounded-2xl border border-hairline bg-mint/40 p-6 md:p-8"
                >
                  <h2 className="font-display text-[22px] text-ink">
                    What changed
                  </h2>
                  <ul className="mt-5 flex flex-col gap-3.5">
                    {outcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          style={{ background: "rgba(59,152,97,0.14)" }}
                        >
                          <Icon name="check" size={14} className="text-growth" />
                        </span>
                        <span className="text-[16px] leading-[1.6] text-ink">
                          {outcome}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}
            </div>

            {/* Facts rail — sticky on desktop, so it stays with the story. */}
            {shownFacts.length > 0 ? (
              <motion.aside
                {...reveal({ distance: 16, amount: 0.2 })}
                className="w-full shrink-0 lg:sticky lg:top-10 lg:w-[340px]"
              >
                <div
                  className="flex flex-col gap-5 rounded-2xl border border-hairline bg-white p-6"
                  style={{ boxShadow: "0 12px 28px rgba(16,60,70,0.08)" }}
                >
                  <h2 className="font-display text-[20px] text-ink">
                    At a glance
                  </h2>

                  <dl className="flex flex-col gap-4">
                    {shownFacts.map((fact) => (
                      <div key={fact.label} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: "rgba(62,172,180,0.14)" }}
                        >
                          <Icon
                            name={fact.icon}
                            size={16}
                            className="text-accent"
                          />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <dt className="text-[12px] font-semibold tracking-[0.06em] text-slate uppercase">
                            {fact.label}
                          </dt>
                          <dd className="text-[15px] leading-[1.5] font-semibold text-ink">
                            {fact.value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>

                  <Link
                    href={content["give.ctaHref"] || "/donate"}
                    className="btn-donate mt-1 w-full px-6 py-3.5 text-center text-sm font-semibold tracking-[0.06em]"
                  >
                    {content["work.supportLabel"] || "Support this work"}
                  </Link>
                </div>
              </motion.aside>
            ) : null}
          </div>

          <motion.div
            {...fadeIn({ amount: 0.8 })}
            className="mt-14 flex flex-wrap items-center gap-4 border-t border-hairline pt-8"
          >
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-opacity hover:opacity-65"
            >
              {content["work.moreLabel"] || "See all projects"}
              <Icon name="arrow-right" size={16} />
            </Link>
            <Link
              href="/#volunteer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-opacity hover:opacity-65"
            >
              {content["volunteer.eyebrow"] || "Get Involved"}
              <Icon name="arrow-right" size={16} />
            </Link>
          </motion.div>
        </div>
      </Section>

      {related.length > 0 ? (
        <>
          <BandSeam from="white" to="cream" side="right" />
          <Section tone="cream" className="lg:py-20">
            <motion.div {...reveal()} className="flex flex-col gap-3">
              <Eyebrow>{content["work.eyebrow"]}</Eyebrow>
              <SectionTitle>More of our work</SectionTitle>
            </motion.div>
            <div className="mt-12">
              <ProjectGrid projects={related} />
            </div>
          </Section>
          <BandSeam from="cream" to="white" side="left" />
        </>
      ) : null}

      <PageCta
        seamSide="right"
        tone="white"
        title={content["work.ctaTitle"] || "Support this work"}
        body={content["give.body"]}
        primary={{
          label: content["give.ctaLabel"] || "Donate",
          href: content["give.ctaHref"] || "/donate",
        }}
        secondary={{
          label: content["volunteer.eyebrow"] || "Get Involved",
          href: "/#volunteer",
        }}
      />
    </>
  );
}
