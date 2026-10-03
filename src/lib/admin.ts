import { z } from "zod";

import { fieldErrorsFrom } from "./forms";

/** Zod schemas for everything the admin dashboard can write. */

const name = z.string().trim().min(1, "Required.").max(200);
const shortText = z.string().trim().max(200);
const longText = z.string().trim().max(5000);

export const sectorSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Required.")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only."),
  name: z.string().trim().min(1, "Required.").max(120),
  description: longText.min(1, "Required."),
  icon: z.string().trim().min(1, "Required.").max(40),
  sortOrder: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published"]).default("published"),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Required.").max(200),
  location: z.string().trim().min(1, "Required.").max(120),
  sectorId: z.coerce.number().int().nullable().default(null),
  summary: longText.min(1, "Required."),
  body: z
    .string()
    .trim()
    .max(20000)
    .optional()
    .transform((v) => (v ? v : null)),
  imageUrl: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : null)),
  sortOrder: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const statSchema = z.object({
  value: z.string().trim().min(1, "Required.").max(40),
  label: z.string().trim().min(1, "Required.").max(120),
  detail: z.string().trim().min(1, "Required.").max(160),
  icon: z.string().trim().min(1, "Required.").max(40),
  sortOrder: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published"]).default("published"),
});

export const givingSchema = z.object({
  title: z.string().trim().min(1, "Required.").max(120),
  description: longText.min(1, "Required."),
  icon: z.string().trim().min(1, "Required.").max(40),
  ctaLabel: z.string().trim().min(1, "Required.").max(60),
  ctaHref: z.string().trim().min(1, "Required.").max(200),
  sortOrder: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published"]).default("published"),
});

export const accountSchema = z.object({
  scope: z.enum(["local", "international"]),
  bankName: z.string().trim().min(1, "Required.").max(160),
  accountName: z.string().trim().min(1, "Required.").max(160),
  accountNumber: z.string().trim().min(1, "Required.").max(64),
  swiftCode: z
    .string()
    .trim()
    .max(11)
    .optional()
    .transform((v) => (v ? v : null)),
  branch: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : null)),
  currency: z.string().trim().min(1, "Required.").max(3),
  note: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  sortOrder: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const themeSchema = z.object({
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex colour like #3EACB4."),
});

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const ADMIN_IDLE: AdminActionState = { status: "idle" };

export function adminFieldErrors(error: z.ZodError): Record<string, string> {
  return fieldErrorsFrom(error);
}

/** Keep selects in sync with the shared icon set. */
export const ICON_OPTIONS = [
  "plus-circle",
  "book-open",
  "sprout",
  "leaf",
  "flag",
  "eye",
  "heart",
  "calendar",
  "building",
  "camera",
  "mail",
  "globe",
  "message",
  "phone",
  "map-pin",
  "arrow-right",
  "hand-heart",
] as const;

export { name as adminName, shortText as adminShortText, longText as adminLongText };
