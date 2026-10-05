import * as motion from "motion/react-client";
import Link from "next/link";

import { Icon } from "@/components/icons";
import { ManagedImage } from "@/components/managed-image";
import { Eyebrow, Section, SectionTitle } from "@/components/section";
import type { GalleryImage } from "@/db/schema";
import type { SiteContent } from "@/lib/content";
import { fadeIn, reveal } from "@/lib/motion";

/**
 * The captioned photo grid, shared by the home band (a slice) and `/gallery`
 * (every published image).
 */
export function GalleryGrid({
  images,
  priorityFirst = false,
}: {
  images: GalleryImage[];
  /**
   * True where the grid is the first thing under the hero (`/gallery`): its
   * leading image is then the page's LCP element and must not be lazy.
   */
  priorityFirst?: boolean;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image, index) => (
        <motion.figure
          key={image.id}
          {...reveal({ index })}
          className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-hairline bg-white"
        >
          <ManagedImage
            value={image.imageUrl}
            alt={image.title}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-[240px] w-full"
            placeholderSeed={`eh-gallery-${image.id}`}
            placeholderWidth={800}
            placeholderHeight={480}
            priority={priorityFirst && index === 0}
          />
          <figcaption className="flex flex-col gap-1 px-5 pb-5">
            <h3 className="text-[17px] font-semibold text-ink">
              {image.title}
            </h3>
            {image.caption ? (
              <p className="text-sm leading-[1.55] text-slate">
                {image.caption}
              </p>
            ) : null}
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}

/** "Gallery" — a few images from the field; the rest live on `/gallery`. */
export function Gallery({
  content,
  images,
}: {
  content: SiteContent;
  images: GalleryImage[];
}) {
  return (
    <Section id="gallery" tone="white" className="lg:py-28">
      <motion.div {...reveal()} className="flex max-w-[640px] flex-col gap-3">
        <Eyebrow>{content["gallery.eyebrow"]}</Eyebrow>
        <SectionTitle>{content["gallery.title"]}</SectionTitle>
        {content["gallery.subtitle"] ? (
          <p className="text-[17px] leading-[1.6] text-slate">
            {content["gallery.subtitle"]}
          </p>
        ) : null}
      </motion.div>

      {images.length === 0 ? (
        <p className="mt-12 text-slate">No gallery images published yet.</p>
      ) : (
        <div className="mt-12">
          <GalleryGrid images={images} />
        </div>
      )}

      <motion.div {...fadeIn()} className="mt-12">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-opacity hover:opacity-65"
        >
          View the full gallery
          <Icon name="arrow-right" size={16} />
        </Link>
      </motion.div>
    </Section>
  );
}
