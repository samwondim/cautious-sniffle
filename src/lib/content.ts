import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  bankAccounts,
  galleryImages,
  givingOptions,
  impactStats,
  projects,
  sectors,
  siteSettings,
  theme,
} from "@/db/schema";

/**
 * Read-side helpers for the public site. Every query hits Postgres directly,
 * so the admin dashboard's edits are visible on the next request.
 */

export type SiteContent = Record<string, string>;

const SETTING_DEFAULTS: SiteContent = {
  "org.name": "Empower Humanity",
  "org.tagline": "",
  "nav.mission": "Mission & Vision",
  "nav.sectors": "What We Do",
  "nav.work": "Our Work",
  "nav.contact": "Contact",
  "nav.donate": "Donate",
  "hero.titleLead": "Building",
  "hero.titleHighlight": "lasting change",
  "hero.titleTail": "one community at a time.",
  "hero.primaryLabel": "Contact Us",
  "hero.primaryHref": "#contact",
  "hero.secondaryLabel": "See Our Work",
  "hero.secondaryHref": "#work",
  "sectors.title": "Four sectors, one shared goal.",
  "work.title": "A selection of recent projects.",
  "gallery.eyebrow": "Gallery",
  "gallery.title": "Moments from the field.",
  "gallery.subtitle":
    "A glimpse of the communities, teams, and places behind the work.",
  "give.title": "Ways to Give",
  "give.ctaLabel": "Donate Now",
  "give.ctaHref": "/donate",
  "volunteer.title": "Become a volunteer.",
  // The volunteer heading is split across two colours, the same way the hero
  // title is. `volunteer.title` stays as the fallback for databases that have
  // not been given the split pair.
  "volunteer.titleLead": "Be a Part of the",
  "volunteer.titleHighlight": "Change",
  "volunteer.ctaLabel": "Become a Volunteer",
  "volunteer.ctaHref": "#volunteer-form",
  "volunteer.buttonLabel": "Register to Volunteer",
  "contact.email": "",
  "contact.phone": "",
  "contact.address": "",
  "social.emailHref": "#",
  "social.websiteHref": "#",
  "social.communityHref": "#contact",
  "footer.copyright": "© 2026 Empower Humanity. All rights reserved.",
  "donate.eyebrow": "Support Our Work",
  "donate.title": "Your gift, their tomorrow.",
  "donate.formTitle": "Make a Gift",
  "donate.localTitle": "Local bank transfer",
  "donate.localBody":
    "Transfers from any Ethiopian bank. Please use your full name as the transfer reference so we can send you a receipt.",
  "donate.internationalTitle": "International transfer",
  "donate.internationalBody":
    "Wire from outside Ethiopia using the SWIFT/BIC code for the receiving bank. Your bank may charge a correspondent fee.",
  "donate.placeholderNotice":
    "These account details are placeholders pending confirmation from our finance team. Please contact us before sending a transfer.",
  "donate.projectsTitle": "Our Work",
  "donate.impactTitle": "Where Your Gift Goes",
  "donate.secureTitle": "Secure & accountable",
};

export async function getSiteContent(): Promise<SiteContent> {
  const rows = await db.select().from(siteSettings);
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  // Defaults backfill anything the admin has not written yet, so a partially
  // configured database still renders a complete page.
  return { ...SETTING_DEFAULTS, ...stored };
}

export async function getAccent(): Promise<string> {
  const [row] = await db.select({ accent: theme.accent }).from(theme).limit(1);
  return row?.accent ?? "#3EACB4";
}

export async function getPublishedSectors() {
  return db
    .select()
    .from(sectors)
    .where(eq(sectors.status, "published"))
    .orderBy(asc(sectors.sortOrder), asc(sectors.id));
}

export async function getPublishedImpactStats() {
  return db
    .select()
    .from(impactStats)
    .where(eq(impactStats.status, "published"))
    .orderBy(asc(impactStats.sortOrder), asc(impactStats.id));
}

export async function getPublishedGivingOptions() {
  return db
    .select()
    .from(givingOptions)
    .where(eq(givingOptions.status, "published"))
    .orderBy(asc(givingOptions.sortOrder), asc(givingOptions.id));
}

/** Published gallery images, in display order. */
export async function getPublishedGalleryImages() {
  return db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.status, "published"))
    .orderBy(asc(galleryImages.sortOrder), asc(galleryImages.id));
}

/** Published projects, joined with their sector so cards can show a badge. */
export async function getPublishedProjects() {
  return db
    .select({
      id: projects.id,
      title: projects.title,
      location: projects.location,
      summary: projects.summary,
      imageUrl: projects.imageUrl,
      sectorName: sectors.name,
    })
    .from(projects)
    .leftJoin(sectors, eq(projects.sectorId, sectors.id))
    .where(eq(projects.status, "published"))
    .orderBy(asc(projects.sortOrder), asc(projects.id));
}

export async function getPublishedProjectCount() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(eq(projects.status, "published"));
  return row?.count ?? 0;
}

/**
 * Published bank accounts for the donate page, local first then international,
 * each group in its own `sortOrder`.
 */
export async function getPublishedBankAccounts() {
  return db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.status, "published"))
    .orderBy(asc(bankAccounts.sortOrder), asc(bankAccounts.id));
}

/** A single published project, or `undefined` when there is no such row. */
export async function getPublishedProject(id: number) {
  const [row] = await db
    .select({
      id: projects.id,
      title: projects.title,
      location: projects.location,
      summary: projects.summary,
      body: projects.body,
      imageUrl: projects.imageUrl,
      sectorName: sectors.name,
    })
    .from(projects)
    .leftJoin(sectors, eq(projects.sectorId, sectors.id))
    .where(and(eq(projects.id, id), eq(projects.status, "published")))
    .limit(1);
  return row;
}
