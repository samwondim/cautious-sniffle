import { Gallery } from "@/components/home/gallery";
import { Give } from "@/components/home/give";
import { Hero } from "@/components/home/hero";
import { Mission } from "@/components/home/mission";
import { Sectors } from "@/components/home/sectors";
import { Volunteer } from "@/components/home/volunteer";
import { Work } from "@/components/home/work";
import {
  getPublishedGalleryImages,
  getPublishedGivingOptions,
  getPublishedImpactStats,
  getPublishedProjects,
  getPublishedSectors,
  getSiteContent,
} from "@/lib/content";

export default async function HomePage() {
  const [content, sectors, stats, projects, givingOptions, galleryImages] =
    await Promise.all([
      getSiteContent(),
      getPublishedSectors(),
      getPublishedImpactStats(),
      getPublishedProjects(),
      getPublishedGivingOptions(),
      getPublishedGalleryImages(),
    ]);

  return (
    <>
      <Hero content={content} stats={stats} />
      <Sectors content={content} sectors={sectors} />
      <Mission content={content} />
      <Work content={content} projects={projects} />
      <Gallery content={content} images={galleryImages} />
      <Give content={content} options={givingOptions} />
      <Volunteer
        content={content}
        sectors={sectors.map((s) => ({ id: s.id, name: s.name }))}
      />
    </>
  );
}
