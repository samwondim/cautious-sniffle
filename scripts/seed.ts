import { existsSync } from "node:fs";
import { hash } from "@node-rs/argon2";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  admins,
  bankAccounts,
  donations,
  galleryImages,
  givingOptions,
  impactStats,
  messages,
  projects,
  sectors,
  sessions,
  siteSettings,
  theme,
  volunteers,
} from "../src/db/schema";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

/**
 * Copy lifted verbatim from the approved design so the seeded site renders
 * identically to the mockup. `[Bracketed]` placeholders from the design are
 * replaced with realistic values for a demo organisation.
 */
const SETTINGS: Record<string, string> = {
  "org.name": "Empower Humanity",
  "org.tagline":
    "Working across health, education, livelihoods, and the environment.",

  "nav.mission": "Mission & Vision",
  "nav.sectors": "What We Do",
  "nav.work": "Our Work",
  "nav.contact": "Contact",
  "nav.donate": "Donate",

  // Concrete nouns, in the organisation's own terms — "Classrooms That Stay
  // Open" is one of its project titles. What this replaced, "Building lasting
  // change, one community at a time", contained nothing anyone could check.
  "hero.title":
    "Clinics that stay staffed. Classrooms that stay open. Work that pays.",
  // Both empty on purpose.
  //
  // The eyebrow recited the same four-sector list as `org.tagline`, two lines
  // above the subtitle that recited it again — six times across the site in
  // total. The hero does not need to repeat what the tagline already says.
  //
  // The subtitle is where one checkable fact belongs: a place, a year, a
  // number this organisation can stand behind. Seeding an invented one would
  // put a fabricated claim on a page that asks people for money, so it is
  // left for the team to fill in.
  "hero.eyebrow": "",
  "hero.subtitle": "",
  "hero.primaryLabel": "Contact Us",
  "hero.primaryHref": "#contact",
  "hero.secondaryLabel": "See Our Work",
  "hero.secondaryHref": "#work",

  "sectors.eyebrow": "What We Do",
  "sectors.title": "Four sectors, one shared goal.",

  "mission.eyebrow": "A community-led team working toward lasting change.",
  "mission.title": "Who We Are",
  "mission.body":
    "We're a multi-sector team working alongside communities across health, education, livelihoods, and the environment — combining what we believe with how we show up, program by program.",
  "mission.missionTitle": "Our Mission",
  "mission.missionBody":
    "To walk alongside communities as they build the health systems, schools, livelihoods, and natural resources they need — led by them, and sustained long after we leave.",
  "mission.visionTitle": "Our Vision",
  "mission.visionBody":
    "A world where no community's wellbeing depends on which sector happens to reach it — where health, education, livelihood, and environment are addressed together, by design.",

  "work.eyebrow": "Our Work",
  "work.title": "A selection of recent projects.",
  "work.subtitle":
    "Programs designed with communities, and sustained by the people who live in them.",

  "gallery.eyebrow": "Gallery",
  "gallery.title": "Moments from the field.",
  "gallery.subtitle":
    "A glimpse of the communities, teams, and places behind the work.",

  "give.eyebrow": "Make a Gift",
  "give.title": "Ways to Give",
  "give.body":
    "Whether it's a one-time gift or a monthly commitment, your support funds programs across health, education, livelihoods, and the environment.",
  "give.ctaLabel": "Donate Now",
  "give.ctaHref": "/donate",

  "volunteer.eyebrow": "Get Involved",
  "volunteer.title": "Become a volunteer.",
  "volunteer.titleLead": "Be a Part of the",
  "volunteer.titleHighlight": "Change",
  "volunteer.ctaLabel": "Become a Volunteer",
  "volunteer.ctaHref": "#volunteer-form",
  "volunteer.body":
    "Tell us a little about yourself and we'll follow up with opportunities that fit.",
  "volunteer.buttonLabel": "Register to Volunteer",

  "contact.email": "hello@empower-humanity.org",
  "contact.phone": "+1 555 0142 889",
  "contact.address": "Global programs · Remote-first",
  "social.emailHref": "mailto:hello@empower-humanity.org",
  "social.websiteHref": "#",
  "social.communityHref": "#contact",

  "footer.copyright": "© 2026 Empower Humanity. All rights reserved.",

  "donate.eyebrow": "Support Our Work",
  "donate.title": "Your gift, their tomorrow.",
  "donate.subtitle":
    "Every contribution goes directly toward health, education, livelihoods, and environmental programs led by the communities they serve.",
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
  "donate.secureBody":
    "Payments are processed securely. Empower Humanity is a registered nonprofit; gifts may be tax-deductible. Cancel a monthly gift anytime.",
};

const SECTORS = [
  {
    slug: "health",
    name: "Health & Wellbeing",
    description: "Clinics, maternal care, and community health training.",
    icon: "plus-circle",
    sortOrder: 1,
  },
  {
    slug: "education",
    name: "Education & Learning",
    description: "Classrooms, teacher training, and scholarships.",
    icon: "book-open",
    sortOrder: 2,
  },
  {
    slug: "livelihoods",
    name: "Livelihoods & Enterprise",
    description: "Skills training, small grants, and market access.",
    icon: "sprout",
    sortOrder: 3,
  },
  {
    slug: "environment",
    name: "Environment & Climate",
    description: "Water access, reforestation, and climate resilience.",
    icon: "leaf",
    sortOrder: 4,
  },
];

const IMPACT_STATS = [
  {
    value: "12,400+",
    label: "Lives Impacted",
    detail: "Across every sector we serve",
    icon: "plus-circle",
    sortOrder: 1,
  },
  {
    value: "8,900+",
    label: "Livelihoods Supported",
    detail: "Skills, grants, and market access",
    icon: "sprout",
    sortOrder: 2,
  },
  {
    value: "3,200+",
    label: "Children Educated",
    detail: "Classrooms, training, scholarships",
    icon: "book-open",
    sortOrder: 3,
  },
];

const GIVING_OPTIONS = [
  {
    title: "One-Time Gift",
    description: "Make an immediate impact with a single contribution.",
    icon: "heart",
    ctaLabel: "Give once",
    ctaHref: "/donate",
    sortOrder: 1,
  },
  {
    title: "Monthly Giving",
    description: "Provide steady, predictable support all year long.",
    icon: "calendar",
    ctaLabel: "Give monthly",
    ctaHref: "/donate",
    sortOrder: 2,
  },
  {
    title: "Corporate & Group Giving",
    description: "Partner with us through workplace giving or sponsorships.",
    icon: "building",
    ctaLabel: "Partner with us",
    ctaHref: "/donate",
    sortOrder: 3,
  },
];

/**
 * Banking details for the donate page.
 *
 * Bank names and BIC/SWIFT codes are real public routing identifiers, but every
 * account number here is a placeholder. `donate.placeholderNotice` is rendered
 * above these on the page; clear that setting once finance supplies the real
 * account numbers.
 */
const BANK_ACCOUNTS = [
  {
    scope: "local" as const,
    bankName: "Commercial Bank of Ethiopia",
    accountName: "Empower Humanity",
    accountNumber: "1000 0000 0000 01",
    branch: "Addis Ababa Main Branch",
    currency: "ETB",
    swiftCode: null,
    note: null,
    sortOrder: 1,
  },
  {
    scope: "local" as const,
    bankName: "Awash Bank",
    accountName: "Empower Humanity",
    accountNumber: "0130 0000 0000 02",
    branch: "Bole Branch, Addis Ababa",
    currency: "ETB",
    swiftCode: null,
    note: null,
    sortOrder: 2,
  },
  {
    scope: "local" as const,
    bankName: "Dashen Bank",
    accountName: "Empower Humanity",
    accountNumber: "5000 0000 0000 03",
    branch: "Kazanchis Branch, Addis Ababa",
    currency: "ETB",
    swiftCode: null,
    note: null,
    sortOrder: 3,
  },
  {
    scope: "local" as const,
    bankName: "Bank of Abyssinia",
    accountName: "Empower Humanity",
    accountNumber: "1234 0000 0000 04",
    branch: "Mexico Branch, Addis Ababa",
    currency: "ETB",
    swiftCode: null,
    note: null,
    sortOrder: 4,
  },
  {
    scope: "international" as const,
    bankName: "Commercial Bank of Ethiopia",
    accountName: "Empower Humanity",
    accountNumber: "1000 0000 0000 10",
    branch: "Addis Ababa Main Branch",
    currency: "USD",
    swiftCode: "CBETETAA",
    note: "For USD wires. Ask your bank to route via CBE's correspondent bank in New York.",
    sortOrder: 5,
  },
  {
    scope: "international" as const,
    bankName: "Awash Bank",
    accountName: "Empower Humanity",
    accountNumber: "0130 0000 0000 11",
    branch: "Bole Branch, Addis Ababa",
    currency: "EUR",
    swiftCode: "AWINETAA",
    note: "For EUR wires from the euro area.",
    sortOrder: 6,
  },
  {
    scope: "international" as const,
    bankName: "Dashen Bank",
    accountName: "Empower Humanity",
    accountNumber: "5000 0000 0000 12",
    branch: "Kazanchis Branch, Addis Ababa",
    currency: "GBP",
    swiftCode: "DASHETAA",
    note: "For GBP wires from the United Kingdom.",
    sortOrder: 7,
  },
];

const PROJECTS = [
  {
    sectorSlug: "health",
    title: "Maternal Health Outreach",
    location: "Northern Province",
    summary:
      "Mobile clinics reached 640 expectant mothers with prenatal care, and trained 45 community health workers to keep that care local.",
    body: "Working with district health offices, we equipped two mobile clinic teams and stocked them for a full year of prenatal and postnatal visits. The lasting piece is the 45 community health workers trained alongside the clinicians — they now run monthly check-ins and referrals without external staff present.\n\nThe teams travel a fixed route, so families know which week the clinic reaches their village. That predictability is what turned one-off visits into continuous care: second and third appointments now outnumber first ones.",
    partner: "District Health Offices",
    timeframe: "2023 — ongoing",
    beneficiaries: "640 mothers",
    outcomes:
      "Two mobile clinic teams equipped and stocked for a full year\n45 community health workers trained and now working independently\nMonthly check-ins running without external staff present\nReferral times to the district hospital cut from days to hours",
    sortOrder: 1,
  },
  {
    sectorSlug: "education",
    title: "Classrooms That Stay Open",
    location: "Rift Valley District",
    summary:
      "Rebuilt six classrooms and funded a two-year teacher training cohort, lifting completion rates for 1,100 students.",
    body: "Six classrooms were rebuilt to withstand the rainy season, and a two-year teacher training cohort gave 38 teachers new skills in literacy instruction and inclusive classrooms. Enrolment held steady through both years instead of dipping after the harvest.\n\nRoofs and drainage came first, because a classroom that floods in May is empty by June. The training cohort followed once the buildings could be relied on.",
    partner: "Rift Valley Education Bureau",
    timeframe: "2022 — 2024",
    beneficiaries: "1,100 students",
    outcomes:
      "Six classrooms rebuilt to withstand the rainy season\n38 teachers through a two-year training cohort\nEnrolment held steady through both harvest seasons\nCompletion rates up for 1,100 students",
    sortOrder: 2,
  },
  {
    sectorSlug: "livelihoods",
    title: "Cooperative Starter Grants",
    location: "Coastal Region",
    summary:
      "Seeded 12 cooperatives with starter tools and market access training, supporting 480 households through their first year.",
    body: "Twelve cooperatives received starter tools, a small operating grant, and six months of market access coaching. All twelve were trading independently at the end of the year, with 480 households reporting steadier income across the dry season.\n\nThe coaching mattered more than the grant. Groups that had never negotiated with a buyer now set prices together, which is what held incomes up once our funding ended.",
    partner: "Coastal Cooperative Union",
    timeframe: "2024 — ongoing",
    beneficiaries: "480 households",
    outcomes:
      "12 cooperatives seeded with tools and an operating grant\nAll 12 trading independently within the first year\n480 households reporting steadier dry-season income\nSix months of market access coaching delivered",
    sortOrder: 3,
  },
];

const GALLERY_IMAGES = [
  {
    title: "Community health outreach",
    caption: "Mobile clinic day in the Northern Province.",
    imageUrl: null,
    sortOrder: 1,
  },
  {
    title: "Classroom reopening",
    caption: "Students back in rebuilt classrooms.",
    imageUrl: null,
    sortOrder: 2,
  },
  {
    title: "Cooperative training",
    caption: "Market access coaching for new cooperatives.",
    imageUrl: null,
    sortOrder: 3,
  },
  {
    title: "Reforestation day",
    caption: "Community tree-planting with local schools.",
    imageUrl: null,
    sortOrder: 4,
  },
  {
    title: "Water access project",
    caption: "New borehole serving 400 households.",
    imageUrl: null,
    sortOrder: 5,
  },
  {
    title: "Skills workshop",
    caption: "Livelihoods training cohort graduation.",
    imageUrl: null,
    sortOrder: 6,
  },
];

/** A little sample activity so the admin dashboard isn't empty on first run. */
const SAMPLE_DONATIONS = [
  {
    frequency: "monthly" as const,
    amountCents: 5000,
    donorName: "Amara Okafor",
    donorEmail: "amara.okafor@example.com",
    message: "For the maternal health teams — thank you.",
    status: "completed" as const,
  },
  {
    frequency: "one_time" as const,
    amountCents: 10000,
    donorName: "Liam Fischer",
    donorEmail: "liam.fischer@example.com",
    message: null,
    status: "completed" as const,
  },
  {
    frequency: "one_time" as const,
    amountCents: 2500,
    donorName: "Sofia Rinaldi",
    donorEmail: "sofia.rinaldi@example.com",
    message: null,
    status: "completed" as const,
  },
  {
    frequency: "monthly" as const,
    amountCents: 25000,
    donorName: "Northwind Collective",
    donorEmail: "giving@northwind.example.com",
    message: "Matched by our workplace giving program.",
    status: "completed" as const,
  },
];

const SAMPLE_VOLUNTEERS = [
  {
    name: "Priya Raman",
    email: "priya.raman@example.com",
    interest: "Education & Learning",
    message: "I'm a primary school teacher and can help with curriculum design.",
    status: "new" as const,
  },
  {
    name: "Tomas Keller",
    email: "tomas.keller@example.com",
    interest: "Environment & Climate",
    message: "Available for field work two weekends a month.",
    status: "in_progress" as const,
  },
];

const SAMPLE_MESSAGES = [
  {
    name: "Dana Whitfield",
    email: "dana.whitfield@example.com",
    subject: "Partnership enquiry",
    body: "We run a corporate volunteering program and would like to explore a partnership across two of your sectors.",
    status: "new" as const,
  },
  {
    name: "Ibrahim Sow",
    email: "ibrahim.sow@example.com",
    subject: "Question about monthly giving",
    body: "Can I change the amount of my monthly gift later without cancelling it?",
    status: "new" as const,
  },
];

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@empower-humanity.org";
  const password =
    process.env.SEED_ADMIN_PASSWORD ?? "empower-humanity-dev";

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  try {
    // Order matters: children before parents. `TRUNCATE ... CASCADE` would also
    // reset identity sequences in one shot, which keeps re-seeding idempotent.
    await db.execute(sql`
      TRUNCATE TABLE
        ${messages}, ${volunteers}, ${donations}, ${projects},
        ${givingOptions}, ${impactStats}, ${sectors}, ${bankAccounts},
        ${siteSettings}, ${sessions}, ${admins}, ${theme}
      RESTART IDENTITY CASCADE
    `);

    const passwordHash = await hash(password, {
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    });

    await db.insert(admins).values({
      email,
      passwordHash,
      name: "Site Administrator",
    });

    await db.insert(theme).values({ id: 1, accent: "#3EACB4" });

    await db.insert(siteSettings).values(
      Object.entries(SETTINGS).map(([key, value]) => ({ key, value })),
    );

    const insertedSectors = await db
      .insert(sectors)
      .values(SECTORS)
      .returning({ id: sectors.id, slug: sectors.slug });

    const sectorIdBySlug = new Map(
      insertedSectors.map((s) => [s.slug, s.id] as const),
    );

    await db.insert(impactStats).values(IMPACT_STATS);
    await db.insert(galleryImages).values(
      GALLERY_IMAGES.map((image) => ({ ...image, status: "published" as const })),
    );
    await db.insert(bankAccounts).values(
      BANK_ACCOUNTS.map((account) => ({
        ...account,
        status: "published" as const,
      })),
    );
    await db.insert(givingOptions).values(GIVING_OPTIONS);

    await db.insert(projects).values(
      PROJECTS.map(({ sectorSlug, ...project }) => ({
        ...project,
        sectorId: sectorIdBySlug.get(sectorSlug) ?? null,
        status: "published" as const,
      })),
    );

    await db.insert(donations).values(SAMPLE_DONATIONS);
    await db.insert(volunteers).values(SAMPLE_VOLUNTEERS);
    await db.insert(messages).values(SAMPLE_MESSAGES);

    console.log("Seed complete.");
    console.log(`  admin:    ${email}`);
    console.log(`  password: ${password}`);
    console.log(
      `  content:  ${Object.keys(SETTINGS).length} settings, ${SECTORS.length} sectors, ` +
        `${IMPACT_STATS.length} stats, ${PROJECTS.length} projects, ${GIVING_OPTIONS.length} giving options, ` +
        `${BANK_ACCOUNTS.length} bank accounts`,
    );
    console.log(
      `  sample:   ${SAMPLE_DONATIONS.length} donations, ${SAMPLE_VOLUNTEERS.length} volunteers, ${SAMPLE_MESSAGES.length} messages`,
    );
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error("Seed failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
