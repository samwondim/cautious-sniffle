import { relations } from "drizzle-orm";
import {
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Postgres `bytea`. Drizzle has no built-in for it; the `postgres` driver
 * reads and writes these columns as Node Buffers.
 */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const publicationStatus = pgEnum("publication_status", [
  "draft",
  "published",
]);

export const donationFrequency = pgEnum("donation_frequency", [
  "one_time",
  "monthly",
]);

export const donationStatus = pgEnum("donation_status", [
  "pending",
  "completed",
  "refunded",
  "failed",
]);

export const leadStatus = pgEnum("lead_status", [
  "new",
  "in_progress",
  "archived",
]);

/** Whether an account is for domestic (Ethiopian) or cross-border transfers. */
export const bankScope = pgEnum("bank_scope", ["local", "international"]);

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export const admins = pgTable(
  "admins",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("admins_email_idx").on(table.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    /** Opaque random token, stored as-is. Only the SHA-256 digest is persisted. */
    id: varchar("id", { length: 64 }).primaryKey(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("sessions_admin_id_idx").on(table.adminId)],
);

/* -------------------------------------------------------------------------- */
/* Site content                                                               */
/* -------------------------------------------------------------------------- */

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const theme = pgTable("theme", {
  id: integer("id").primaryKey(),
  accent: varchar("accent", { length: 7 }).notNull().default("#3EACB4"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sectors = pgTable(
  "sectors",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull(),
    /** Key into the shared icon set (see src/components/icons.tsx). */
    icon: varchar("icon", { length: 40 }).notNull().default("plus-circle"),
    /** Display order on the public "What We Do" grid. */
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("sectors_sort_order_idx").on(table.sortOrder)],
);

export const impactStats = pgTable(
  "impact_stats",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    value: varchar("value", { length: 40 }).notNull(),
    label: varchar("label", { length: 120 }).notNull(),
    detail: varchar("detail", { length: 160 }).notNull(),
    icon: varchar("icon", { length: 40 }).notNull().default("plus-circle"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("impact_stats_sort_order_idx").on(table.sortOrder)],
);

export const projects = pgTable(
  "projects",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 200 }).notNull(),
    location: varchar("location", { length: 120 }).notNull(),
    sectorId: integer("sector_id").references(() => sectors.id, {
      onDelete: "set null",
    }),
    summary: text("summary").notNull(),
    body: text("body"),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("projects_status_idx").on(table.status),
    index("projects_sector_id_idx").on(table.sectorId),
    index("projects_sort_order_idx").on(table.sortOrder),
  ],
);

export const givingOptions = pgTable(
  "giving_options",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 120 }).notNull(),
    description: text("description").notNull(),
    icon: varchar("icon", { length: 40 }).notNull().default("heart"),
    ctaLabel: varchar("cta_label", { length: 60 }).notNull(),
    ctaHref: varchar("cta_href", { length: 200 }).notNull().default("/donate"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("giving_options_sort_order_idx").on(table.sortOrder)],
);

export const galleryImages = pgTable(
  "gallery_images",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 200 }).notNull(),
    caption: text("caption"),
    /** Direct image URL. Empty slots render seeded placeholder photography. */
    imageUrl: text("image_url"),
    /** Display order in the public gallery grid. */
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("gallery_images_sort_order_idx").on(table.sortOrder)],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    originalFilename: varchar("original_filename", { length: 255 }).notNull(),
    contentType: varchar("content_type", { length: 100 }).notNull(),
    byteSize: integer("byte_size").notNull(),
    /**
     * Intrinsic pixel size, measured in the browser before upload. Nullable
     * and advisory: every render site uses `next/image` with `fill`, so these
     * only drive the library grid's own layout.
     */
    width: integer("width"),
    height: integer("height"),
    altText: varchar("alt_text", { length: 300 }).notNull().default(""),
    uploadedBy: integer("uploaded_by").references(() => admins.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("media_assets_created_at_idx").on(table.createdAt)],
);

/**
 * Image bytes, deliberately in their own table.
 *
 * Keeping them out of `media_assets` means a listing query can never
 * accidentally drag megabytes of image data back with it — `select()` on the
 * metadata table is safe by construction. The cascade also makes deletion
 * atomic: there is no second system to fall out of step with, so an asset
 * row and its bytes cannot outlive each other.
 */
export const mediaBlobs = pgTable("media_blobs", {
  mediaAssetId: integer("media_asset_id")
    .primaryKey()
    .references(() => mediaAssets.id, { onDelete: "cascade" }),
  data: bytea("data").notNull(),
});

/* -------------------------------------------------------------------------- */
/* Submissions                                                                */
/* -------------------------------------------------------------------------- */

export const donations = pgTable(
  "donations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    frequency: donationFrequency("frequency").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    donorName: varchar("donor_name", { length: 120 }).notNull(),
    donorEmail: varchar("donor_email", { length: 255 }).notNull(),
    message: text("message"),
    status: donationStatus("status").notNull().default("completed"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("donations_created_at_idx").on(table.createdAt),
    index("donations_status_idx").on(table.status),
  ],
);

export const volunteers = pgTable(
  "volunteers",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    interest: varchar("interest", { length: 80 }).notNull(),
    message: text("message"),
    status: leadStatus("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("volunteers_created_at_idx").on(table.createdAt),
    index("volunteers_status_idx").on(table.status),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 200 }).notNull(),
    body: text("body").notNull(),
    status: leadStatus("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("messages_created_at_idx").on(table.createdAt),
    index("messages_status_idx").on(table.status),
  ],
);

/* -------------------------------------------------------------------------- */
/* Relations                                                                  */
/* -------------------------------------------------------------------------- */

export const adminsRelations = relations(admins, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  admin: one(admins, { fields: [sessions.adminId], references: [admins.id] }),
}));

export const sectorsRelations = relations(sectors, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  sector: one(sectors, { fields: [projects.sectorId], references: [sectors.id] }),
}));

export const bankAccounts = pgTable(
  "bank_accounts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    scope: bankScope("scope").notNull(),
    bankName: varchar("bank_name", { length: 160 }).notNull(),
    accountName: varchar("account_name", { length: 160 }).notNull(),
    accountNumber: varchar("account_number", { length: 64 }).notNull(),
    /** BIC/SWIFT is 8 or 11 characters; only set for international accounts. */
    swiftCode: varchar("swift_code", { length: 11 }),
    branch: varchar("branch", { length: 120 }),
    currency: varchar("currency", { length: 3 }).notNull().default("ETB"),
    note: text("note"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("bank_accounts_scope_idx").on(table.scope),
    index("bank_accounts_status_idx").on(table.status),
    index("bank_accounts_sort_order_idx").on(table.sortOrder),
  ],
);

/* -------------------------------------------------------------------------- */
/* Inferred types                                                             */
/* -------------------------------------------------------------------------- */

export type Admin = typeof admins.$inferSelect;
export type Sector = typeof sectors.$inferSelect;
export type ImpactStat = typeof impactStats.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type GivingOption = typeof givingOptions.$inferSelect;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type MediaBlob = typeof mediaBlobs.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Volunteer = typeof volunteers.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Theme = typeof theme.$inferSelect;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type PublicationStatus = (typeof publicationStatus.enumValues)[number];
export type DonationFrequency = (typeof donationFrequency.enumValues)[number];
export type DonationStatus = (typeof donationStatus.enumValues)[number];
export type LeadStatus = (typeof leadStatus.enumValues)[number];
export type BankScope = (typeof bankScope.enumValues)[number];
