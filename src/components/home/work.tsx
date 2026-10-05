import Link from "next/link";

import { Icon } from "@/components/icons";
import { ManagedImage } from "@/components/managed-image";
import { Eyebrow, Section, SectionTitle } from "@/components/section";
import type { SiteContent } from "@/lib/content";

export type ProjectCard = {
  id: number;
  title: string;
  location: string;
  summary: string;
  imageUrl: string | null;
  sectorName: string | null;
};

/** Card sits in a 1/2/3-column grid, so the rendered width tracks the breakpoint. */
const CARD_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

function ProjectImage({ project }: { project: ProjectCard }) {
  // `ManagedImage` picks the right treatment for whatever `imageUrl` holds —
  // a media-library key, a pasted external URL, or nothing at all, in which
  // case a placeholder seeded by id keeps the same stand-in across requests.
  return (
    <ManagedImage
      value={project.imageUrl}
      alt={`${project.title} — ${project.location}`}
      sizes={CARD_SIZES}
      className="h-[210px] w-full"
      placeholderSeed={`eh-project-${project.id}`}
      placeholderWidth={800}
      placeholderHeight={420}
    />
  );
}

/** "Our Work" — recent projects on the cream band. */
export function Work({
  content,
  projects,
}: {
  content: SiteContent;
  projects: ProjectCard[];
}) {
  return (
    <Section id="work" tone="cream" className="py-20">
      <div className="flex max-w-[640px] flex-col gap-3">
        <Eyebrow>{content["work.eyebrow"]}</Eyebrow>
        <SectionTitle>{content["work.title"]}</SectionTitle>
        {content["work.subtitle"] ? (
          <p className="max-w-[560px] text-[17px] leading-[1.6] text-slate">
            {content["work.subtitle"]}
          </p>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <p className="mt-12 text-slate">No projects published yet.</p>
      ) : (
        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-white"
              style={{ boxShadow: "0 12px 28px rgba(16,60,70,0.08)" }}
            >
              <ProjectImage project={project} />

              <div className="flex flex-col gap-3.5 p-6">
                {project.sectorName ? (
                  <span
                    className="inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.06em] text-white uppercase"
                    style={{ background: "var(--growth)" }}
                  >
                    {project.sectorName}
                  </span>
                ) : null}

                <h3 className="font-display text-[21px] text-ink">
                  {project.title} — {project.location}
                </h3>

                <p className="text-[15px] leading-[1.6] text-slate">
                  {project.summary}
                </p>

                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent transition-opacity hover:opacity-65"
                >
                  View project
                  <span className="sr-only"> — {project.title}</span>
                  <Icon name="arrow-right" size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-12">
        <Link
          href="/donate"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-opacity hover:opacity-65"
        >
          Support this work
          <Icon name="arrow-right" size={16} />
        </Link>
      </div>
    </Section>
  );
}
