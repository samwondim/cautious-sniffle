import * as motion from "motion/react-client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BandSeam } from "@/components/band-seam";
import { Icon } from "@/components/icons";
import { ManagedImage } from "@/components/managed-image";
import { Section } from "@/components/section";
import { getPublishedProject, getSiteContent } from "@/lib/content";
import { fadeIn, reveal } from "@/lib/motion";

/** Ids are the primary key, so anything non-numeric is a 404, not a lookup. */
function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
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

  return (
    <>
      <section className="bg-ink px-6 py-16 md:px-10 lg:px-20 lg:py-20">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
          <Link
            href="/#work"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-mist transition-colors hover:text-white"
          >
            <Icon name="arrow-right" size={16} className="rotate-180" />
            Back to {content["work.eyebrow"] || "our work"}
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

          <span className="flex items-center gap-2 text-[15px] text-mist">
            <Icon name="map-pin" size={16} className="shrink-0" />
            {project.location}
          </span>
        </div>
      </section>

      <Section className="lg:py-20">
        <div className="mx-auto flex max-w-[900px] flex-col gap-10">
          <div className="overflow-hidden rounded-2xl">
            <ManagedImage
              value={project.imageUrl}
              alt={`${project.title} — ${project.location}`}
              sizes="(min-width: 900px) 900px, 100vw"
              className="h-[420px] w-full"
              placeholderSeed={`eh-project-${project.id}`}
              placeholderWidth={1800}
              placeholderHeight={950}
              priority
            />
          </div>

          <motion.p
            {...reveal({ distance: 12, amount: 0.6 })}
            className="text-[19px] leading-[1.6] font-medium text-ink"
          >
            {project.summary}
          </motion.p>

          {project.body ? (
            // One reveal for the whole body, not one per paragraph: long-form
            // copy that keeps arriving late fights the reader's own pace.
            <motion.div
              {...reveal({ distance: 16, amount: 0.15 })}
              className="flex flex-col gap-5"
            >
              {project.body
                .split(/\n{2,}/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-[17px] leading-[1.7] text-slate"
                  >
                    {paragraph}
                  </p>
                ))}
            </motion.div>
          ) : null}

          <motion.div
            {...fadeIn({ amount: 0.8 })}
            className="flex flex-wrap items-center gap-4 border-t border-hairline pt-8"
          >
            <Link
              href="/donate"
              className="bg-gold px-8 py-4 text-sm font-semibold tracking-[0.04em] text-ink transition-colors hover:bg-olive hover:text-white"
            >
              Support this work
            </Link>
            <Link
              href="/#work"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-opacity hover:opacity-65"
            >
              See other projects
              <Icon name="arrow-right" size={16} />
            </Link>
          </motion.div>
        </div>
      </Section>

      <BandSeam from="white" to="ink-deep" side="left" />
    </>
  );
}
