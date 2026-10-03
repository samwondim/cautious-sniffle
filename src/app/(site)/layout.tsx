import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { getAccent, getSiteContent } from "@/lib/content";

/**
 * Public pages read live CMS content from Postgres, so they must never be
 * prerendered at build time.
 */
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [content, accent] = await Promise.all([getSiteContent(), getAccent()]);

  return (
    <div
      style={{ "--accent": accent } as React.CSSProperties}
      className="flex min-h-full flex-1 flex-col"
    >
      <SiteNav content={content} />
      <main className="flex-1">{children}</main>
      <SiteFooter content={content} />
    </div>
  );
}
