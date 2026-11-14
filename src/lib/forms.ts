import { z } from "zod";

/** Shape returned by every public form Server Action. */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level messages keyed by input name. */
  fieldErrors?: Record<string, string>;
  /**
   * What was submitted, returned on error. React resets a form after its
   * action runs — even when validation fails — so fields read their
   * `defaultValue` from here to come back filled instead of blank.
   */
  values?: Record<string, string>;
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

/**
 * Largest single transfer the form accepts, in major units of any currency.
 * `amount_cents` is a 32-bit integer, which tops out near 21.4 million; this
 * leaves headroom and routes genuinely large gifts to a conversation instead.
 */
export const MAX_TRANSFER_AMOUNT = 10_000_000;

/**
 * "I've sent a bank transfer" — the donor telling staff a gift is on its way,
 * so it can be matched against the statement and receipted. Nothing is paid
 * through the site; the row lands in the admin as `pending` until staff see
 * the money arrive.
 *
 * `currency` is checked for shape here; the action also checks it against
 * the currencies of the published bank accounts, which only it can read.
 */
export const transferNoticeSchema = z
  .object({
    frequency: z.enum(["one_time", "monthly"], {
      error: "Please choose one-off or monthly.",
    }),
    amount: z.string().trim().min(1, "Please enter the amount you sent."),
    currency: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/, "Please choose a currency."),
    name,
    email,
    message: z.string().trim().max(2000, "Please keep this under 2,000 characters.").optional(),
    company: honeypot.optional(),
  })
  .transform((data, ctx) => {
    // Accept what people actually type: "5,000", "5 000", "ETB 5000".
    const amountValue = Number.parseFloat(data.amount.replace(/[^\d.]/g, ""));

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Please enter the amount you sent.",
      });
      return z.NEVER;
    }
    if (amountValue > MAX_TRANSFER_AMOUNT) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "For a gift this size, please contact us directly so we can thank you properly.",
      });
      return z.NEVER;
    }

    return {
      frequency: data.frequency,
      amountCents: Math.round(amountValue * 100),
      currency: data.currency,
      name: data.name,
      email: data.email,
      message: data.message || null,
    };
  });

export type TransferNotice = z.output<typeof transferNoticeSchema>;

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
  body: z
    .string()
    .trim()
    .min(1, "Please add a message.")
    .min(10, "Please write a little more so we can help.")
    .max(5000, "Please keep this under 5,000 characters."),
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
