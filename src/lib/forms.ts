import { z } from "zod";

/** Shape returned by every public form Server Action. */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level messages keyed by input name. */
  fieldErrors?: Record<string, string>;
};

export const IDLE: ActionState = { status: "idle" };

const name = z
  .string()
  .trim()
  .min(2, "Please enter your full name.")
  .max(120, "That name is too long.");

const email = z
  .string()
  .trim()
  .min(1, "Please enter your email address.")
  .max(255)
  .email("Please enter a valid email address.");

const honeypot = z.string().max(0, "Rejected.");

export const donationSchema = z
  .object({
    frequency: z.enum(["one_time", "monthly"]),
    amount: z.union([z.literal(""), z.string()]).optional(),
    customAmount: z.string().trim().max(20).optional(),
    name,
    email,
    message: z.string().trim().max(2000).optional(),
    // Must stay empty; bots that fill every field get rejected.
    company: honeypot.optional(),
  })
  .transform((data, ctx) => {
    const custom = (data.customAmount ?? "").replace(/[^\d.]/g, "");
    const amountValue = custom
      ? Number.parseFloat(custom)
      : Number.parseFloat(data.amount ?? "");

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Please choose an amount or enter a custom gift.",
      });
      return z.NEVER;
    }
    if (amountValue < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "The minimum gift is $1.",
      });
      return z.NEVER;
    }
    if (amountValue > 1_000_000) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Please contact us directly for gifts above $1,000,000.",
      });
      return z.NEVER;
    }

    return {
      frequency: data.frequency,
      amountCents: Math.round(amountValue * 100),
      name: data.name,
      email: data.email,
      message: data.message?.trim() || null,
    };
  });

export type DonationInput = z.input<typeof donationSchema>;
export type DonationResult = z.output<typeof donationSchema>;

export const volunteerSchema = z.object({
  name,
  email,
  interest: z.string().trim().min(1, "Please choose an area of interest."),
  message: z.string().trim().max(2000).optional(),
  company: honeypot.optional(),
});

export type VolunteerInput = z.input<typeof volunteerSchema>;

export const contactSchema = z.object({
  name,
  email,
  subject: z.string().trim().min(3, "Please add a subject.").max(200),
  body: z.string().trim().min(10, "Please add a message.").max(5000),
  company: honeypot.optional(),
});

export type ContactInput = z.input<typeof contactSchema>;

/** Flattens a ZodError into the `{ field: message }` shape forms expect. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    // Keep the first message per field — that is the most specific one.
    out[key] ??= issue.message;
  }
  return out;
}

export const FORM_FIELD_CLASS = "field-input";
export const FORM_LABEL_CLASS = "field-label";
