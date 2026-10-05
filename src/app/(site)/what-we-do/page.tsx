import { BandSeam } from "@/components/band-seam";
import { SectorGrid } from "@/components/home/sectors";
import { PageCta } from "@/components/page-cta";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { getPublishedSectors, getSiteContent } from "@/lib/content";

export async function generateMetadata() {
  const content = await getSiteContent();
  return {
    title: content["sectors.title"] || "What We Do",
    description: content["org.tagline"],
  };
}

export default async function WhatWeDoPage() {
  const [content, sectors] = await Promise.all([
    getSiteContent(),
    getPublishedSectors(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={content["sectors.eyebrow"]}
        title={content["sectors.title"]}
        subtitle={content["org.tagline"]}
      />

      <Section className="lg:py-20">
        {sectors.length === 0 ? (
          <p className="text-slate">No sectors published yet.</p>
        ) : (
          <SectorGrid sectors={sectors} />
        )}
      </Section>

      <BandSeam from="white" to="mint" side="left" />

      <PageCta
        seamSide="right"
        title={
          content["sectors.ctaTitle"] ||
          "Projects in every one of these sectors"
        }
        body={content["work.subtitle"]}
        primary={{ label: content["nav.work"] || "Our Work", href: "/work" }}
        secondary={{
          label: content["volunteer.eyebrow"] || "Get Involved",
          href: "/#volunteer",
        }}
      />
    </>
  );
}
