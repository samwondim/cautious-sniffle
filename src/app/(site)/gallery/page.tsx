import { BandSeam } from "@/components/band-seam";
import { GalleryGrid } from "@/components/home/gallery";
import { PageCta } from "@/components/page-cta";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { getPublishedGalleryImages, getSiteContent } from "@/lib/content";

export async function generateMetadata() {
  const content = await getSiteContent();
  return {
    title: content["gallery.title"] || "Gallery",
    description: content["gallery.subtitle"] || content["org.tagline"],
  };
}

export default async function GalleryPage() {
  const [content, images] = await Promise.all([
    getSiteContent(),
    getPublishedGalleryImages(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={content["gallery.eyebrow"]}
        title={content["gallery.title"]}
        subtitle={content["gallery.subtitle"]}
      />

      <Section className="lg:py-20">
        {images.length === 0 ? (
          <p className="text-slate">No gallery images published yet.</p>
        ) : (
          <GalleryGrid images={images} priorityFirst />
        )}
      </Section>

      <BandSeam from="white" to="mint" side="left" />

      <PageCta
        seamSide="right"
        title={
          content["gallery.ctaTitle"] || "Every photograph here is a project"
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
