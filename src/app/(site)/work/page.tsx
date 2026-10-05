import { BandSeam } from "@/components/band-seam";
import { ProjectGrid } from "@/components/home/work";
import { PageCta } from "@/components/page-cta";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { getPublishedProjects, getSiteContent } from "@/lib/content";

export async function generateMetadata() {
  const content = await getSiteContent();
  return {
    title: content["work.title"] || "Our Work",
    description: content["work.subtitle"] || content["org.tagline"],
  };
}

export default async function WorkPage() {
  const [content, projects] = await Promise.all([
    getSiteContent(),
    getPublishedProjects(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={content["work.eyebrow"]}
        title={content["work.title"]}
        subtitle={content["work.subtitle"]}
      />

      <Section tone="cream" className="lg:py-20">
        {projects.length === 0 ? (
          <p className="text-slate">No projects published yet.</p>
        ) : (
          <ProjectGrid projects={projects} priorityFirst />
        )}
      </Section>

      <BandSeam from="cream" to="white" side="right" />

      <PageCta
        seamSide="left"
        title={content["give.title"] || "Support this work"}
        body={content["give.body"]}
        primary={{ label: content["give.ctaLabel"] || "Donate", href: "/donate" }}
        secondary={{ label: "Volunteer with us", href: "/#volunteer" }}
        tone="white"
      />
    </>
  );
}
