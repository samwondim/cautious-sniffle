import { MotionProvider } from "@/components/motion/motion-provider";
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
      {/* Scroll reveals ship their `initial` state as an inline `opacity: 0`,
          so without JavaScript the bands would never appear. Only
          `!important` beats an inline style. */}
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-countup]{visibility:visible!important}`}</style>
      </noscript>

      <SiteNav content={content} />
      <MotionProvider>
        <main className="flex-1">{children}</main>
      </MotionProvider>
      <SiteFooter content={content} />
    </div>
  );
}
