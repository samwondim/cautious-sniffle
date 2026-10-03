import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities on this list (default: [75]); any
    // other `quality` value is rejected with a 400. 50 is here for the
    // hero backdrop, which sits under a near-opaque scrim.
    qualities: [50, 75],
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
