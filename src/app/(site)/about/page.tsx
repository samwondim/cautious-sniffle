import { BandSeam } from "@/components/band-seam";
import { Mission } from "@/components/home/mission";
import { PageCta } from "@/components/page-cta";
import { PageHero } from "@/components/page-hero";
import { getSiteContent } from "@/lib/content";

export async function generateMetadata() {
  const content = await getSiteContent();
  return {
    title: content["nav.mission"] || "Mission & Vision",
    description: content["mission.body"] || content["org.tagline"],
  };
}

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <>
      <PageHero
        eyebrow={content["nav.mission"]}
        title={content["mission.title"]}
        subtitle={content["org.tagline"]}
      />

      {/* The hero above carries the heading, so the band drops its own. */}
      <Mission content={content} showTitle={false} photoPriority />

      <BandSeam from="white" to="mint" side="right" />

      <PageCta
        seamSide="left"
        title="See what that looks like in practice"
        body={content["work.subtitle"]}
        primary={{ label: "Our Work", href: "/work" }}
        secondary={{ label: "What We Do", href: "/what-we-do" }}
      />
    </>
  );
}
