import { and, asc, eq, ne, sql } from "drizzle-orm";

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
  // One headline field, not three. The lead/highlight/tail split existed only
  // so the middle fragment could carry a squiggle underline; with that gone
  // the three rendered as one continuous sentence anyway.
  //
  // These defaults are what renders when a key has no row yet, so the
  // headline carries its real text here and not just in the seed — an
  // unseeded database must not produce an empty `<h1>`.
  "hero.title":
    "Clinics that stay staffed. Classrooms that stay open. Work that pays.",
  // Optional, and empty on purpose: the eyebrow used to recite the same
  // four-sector list as `org.tagline`, and the subtitle is where one
  // checkable fact belongs rather than a seeded abstraction.
  "hero.eyebrow": "",
  "hero.subtitle": "",
  "hero.primaryLabel": "Contact Us",
  "hero.primaryHref": "#contact",
  "hero.secondaryLabel": "See Our Work",
  "hero.secondaryHref": "#work",
  // Image slots. Empty means "use the designed placeholder photography"; a
  // value is a media-library reference or a pasted URL, the same as every
  // other image the admin manages.
  "hero.image": "",
  "hero.backdropImage": "",
  "mission.photo": "",
  "give.photo": "",
  "volunteer.backdropImage": "",
  "sectors.title": "Four sectors, one shared goal.",
  "sectors.moreLabel": "How we work in each sector",
  "sectors.ctaTitle": "Projects in every one of these sectors",
  "work.title": "A selection of recent projects.",
  "work.moreLabel": "See all projects",
  "work.supportLabel": "Support this work",
  "work.ctaTitle": "Support this work",
  "gallery.eyebrow": "Gallery",
  "gallery.title": "Moments from the field.",
  "gallery.subtitle":
    "A glimpse of the communities, teams, and places behind the work.",
  "gallery.moreLabel": "View the full gallery",
  "gallery.ctaTitle": "Every photograph here is a project",
  "give.title": "Ways to Give",
  "give.ctaLabel": "Donate Now",
  "give.ctaHref": "/donate",
  "give.detailsLabel": "See bank transfer details",
  "mission.ctaTitle": "See what that looks like in practice",
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
      partner: projects.partner,
      timeframe: projects.timeframe,
      beneficiaries: projects.beneficiaries,
      outcomes: projects.outcomes,
      sectorId: projects.sectorId,
      sectorName: sectors.name,
    })
    .from(projects)
    .leftJoin(sectors, eq(projects.sectorId, sectors.id))
    .where(and(eq(projects.id, id), eq(projects.status, "published")))
    .limit(1);
  return row;
}

/**
 * Other published projects to show at the foot of a detail page: same sector
 * first, then anything else, so a project in a one-project sector still gets
 * neighbours instead of an empty rail.
 */
export async function getRelatedProjects({
  excludeId,
  sectorId,
  limit = 3,
}: {
  excludeId: number;
  sectorId: number | null;
  limit?: number;
}) {
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
    .where(
      and(eq(projects.status, "published"), ne(projects.id, excludeId)),
    )
    .orderBy(
      // Same-sector rows sort first; `sortOrder` keeps the admin's ordering
      // within each group.
      sql`case when ${projects.sectorId} is not distinct from ${sectorId} then 0 else 1 end`,
      asc(projects.sortOrder),
      asc(projects.id),
    )
    .limit(limit);
}
