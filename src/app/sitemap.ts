import type { MetadataRoute } from "next";

import { getPublishedProjects } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

/**
 * Project pages come from the CMS, so the sitemap is built per request, like
 * the public pages it lists — never at build time, which has no database.
 */
export const dynamic = "force-dynamic";

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/donate", priority: 0.9, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/what-we-do", priority: 0.8, changeFrequency: "monthly" },
  { path: "/work", priority: 0.8, changeFrequency: "weekly" },
  { path: "/gallery", priority: 0.6, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const projects = await getPublishedProjects();

  return [
    ...STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
      url: new URL(path, base).toString(),
      priority,
      changeFrequency,
    })),
    ...projects.map((project) => ({
      url: new URL(`/projects/${project.id}`, base).toString(),
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
  ];
}
