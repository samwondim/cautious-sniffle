/**
 * The public origin of the site, used wherever a URL has to be absolute:
 * `metadataBase` (Open Graph and Twitter cards), the sitemap and robots.txt.
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_SITE_URL` — set this once the custom domain is live.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel's production domain, injected
 *    automatically on every Vercel deployment (previews included), so share
 *    cards from a preview still point at production rather than a preview URL.
 * 3. localhost, for development.
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}
