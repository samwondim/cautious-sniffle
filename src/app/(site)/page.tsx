import { BandSeam } from "@/components/band-seam";
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

/**
 * The home page is a tour, not an index: each band shows a taste and links to
 * the page that holds the rest. Sections are capped here rather than in the
 * queries, so the section pages reuse the same functions unsliced.
 */
const HOME_SECTORS = 4;
const HOME_PROJECTS = 3;
const HOME_GALLERY = 3;

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
      {/* The hero keeps a straight edge: the stat card hangs across it. From
          there the arcs alternate side, left then right then left. */}
      <Hero content={content} stats={stats} />
      <Sectors content={content} sectors={sectors.slice(0, HOME_SECTORS)} />
      <BandSeam from="mint" to="white" side="left" />
      <Mission content={content} />
      <BandSeam from="white" to="cream" side="right" />
      <Work content={content} projects={projects.slice(0, HOME_PROJECTS)} />
      <BandSeam from="cream" to="white" side="left" />
      <Gallery content={content} images={galleryImages.slice(0, HOME_GALLERY)} />
      <Give content={content} options={givingOptions} />
      <Volunteer
        content={content}
        sectors={sectors.map((s) => ({ id: s.id, name: s.name }))}
      />
    </>
  );
}
