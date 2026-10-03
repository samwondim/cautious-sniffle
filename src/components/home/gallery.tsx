import { Eyebrow, PlaceholderPhoto, Section, SectionTitle } from "@/components/section";
import type { GalleryImage } from "@/db/schema";
import type { SiteContent } from "@/lib/content";

/** "Gallery" — a photo grid with captions, managed from the admin site. */
export function Gallery({
  content,
  images,
}: {
  content: SiteContent;
  images: GalleryImage[];
}) {
  return (
    <Section id="gallery" tone="white" className="lg:py-28">
      <div className="flex max-w-[640px] flex-col gap-3">
        <Eyebrow>{content["gallery.eyebrow"]}</Eyebrow>
        <SectionTitle>{content["gallery.title"]}</SectionTitle>
        {content["gallery.subtitle"] ? (
          <p className="text-[17px] leading-[1.6] text-slate">
            {content["gallery.subtitle"]}
          </p>
        ) : null}
      </div>

      {images.length === 0 ? (
        <p className="mt-12 text-slate">No gallery images published yet.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <figure
              key={image.id}
              className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-hairline bg-white"
            >
              {image.imageUrl ? (
                // Admin-supplied URL: not optimizable at build time, so a
                // plain <img> avoids next/image's static allowlist.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  loading="lazy"
                  className="h-[240px] w-full object-cover"
                />
              ) : (
                <PlaceholderPhoto
                  seed={`eh-gallery-${image.id}`}
                  alt={image.title}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  width={800}
                  height={480}
                  className="h-[240px] w-full"
                />
              )}
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
            </figure>
          ))}
        </div>
      )}
    </Section>
  );
}
