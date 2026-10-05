import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Media is stored in Postgres, so image bytes reach the server through
      // a Server Action rather than going to a storage service. The default
      // cap is 1MB; this leaves room for a resized image (capped at 3MB in
      // `src/lib/media-constants.ts`) plus its multipart envelope. Hosts
      // impose their own request limit on top — Vercel's serverless runtime
      // allows roughly 4.5MB — so raising this further would not help.
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Next 16 only serves qualities on this list (default: [75]); any
    // other `quality` value is rejected with a 400. 50 is here for the
    // hero backdrop, which sits under a near-opaque scrim.
    qualities: [50, 75],
    // Local images are allowlisted explicitly. Listing any pattern blocks
    // every other local path, so the brand marks have to appear here too.
    localPatterns: [
      { pathname: "/brand/**", search: "" },
      // Uploaded media, streamed from `src/app/api/media/[id]/route.ts`.
      { pathname: "/api/media/**", search: "" },
    ],
    remotePatterns: [
      {
        // Placeholder photography — see `src/lib/placeholder-image.ts`.
        // picsum.photos 302s to fastly.picsum.photos; the optimizer follows
        // that redirect server-side, so only this origin needs allowlisting.
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/seed/**",
        search: "",
      },
      {
        // Pinned picsum ids, for slots where the subject matters.
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/id/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
