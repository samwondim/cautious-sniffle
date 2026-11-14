"use server";

import { and, eq } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/db";
import { bankAccounts, donations, messages, volunteers } from "@/db/schema";
import {
  contactSchema,
  fieldErrorsFrom,
  transferNoticeSchema,
  volunteerSchema,
  type ActionState,
} from "@/lib/forms";
import { formatMoney } from "@/lib/money";
import { sendStaffAlert } from "@/lib/notify";

/**
 * Public form submissions. These are reachable by direct POST as well as
 * through the UI, so every one re-validates its input server-side.
 *
 * Each saves first, then schedules a staff email with `after()`: the visitor
 * gets their confirmation as soon as the row is written, and an email
 * problem can never turn a saved submission into an error message.
 */

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Echo the submission back (minus the honeypot) so the form refills. */
function submitted(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && key !== "company" && !key.startsWith("$")) {
      values[key] = value;
    }
  }
  return values;
}

const ERROR: ActionState = {
  status: "error",
  message: "Something went wrong on our side. Please try again in a moment.",
};

const CHECK_FIELDS: ActionState = {
  status: "error",
  message: "Please check the highlighted fields.",
};

export async function submitTransferNotice(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = transferNoticeSchema.safeParse({
    frequency: formString(formData, "frequency"),
    amount: formString(formData, "amount"),
    currency: formString(formData, "currency"),
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    message: formString(formData, "message"),
    company: formString(formData, "company"),
  });

  if (!parsed.success) {
    return {
      ...CHECK_FIELDS,
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: submitted(formData),
    };
  }
  const notice = parsed.data;

  try {
    // Only currencies the organisation actually publishes an account for.
    const [account] = await db
      .select({ id: bankAccounts.id })
      .from(bankAccounts)
      .where(
        and(
          eq(bankAccounts.status, "published"),
          eq(bankAccounts.currency, notice.currency),
        ),
      )
      .limit(1);
    if (!account) {
      return {
        ...CHECK_FIELDS,
        fieldErrors: { currency: "Please choose one of the listed currencies." },
        values: submitted(formData),
      };
    }

    await db.insert(donations).values({
      frequency: notice.frequency,
      amountCents: notice.amountCents,
      currency: notice.currency,
      donorName: notice.name,
      donorEmail: notice.email,
      message: notice.message,
      // Nothing has been verified yet: staff mark it completed once the
      // transfer shows up on the bank statement.
      status: "pending",
    });
  } catch (error) {
    console.error("[transfer-notice] insert failed", error);
    return { ...ERROR, values: submitted(formData) };
  }

  const amount = formatMoney(notice.amountCents, notice.currency);
  const monthly = notice.frequency === "monthly";

  after(() =>
    sendStaffAlert({
      subject: `Transfer to confirm: ${amount}${monthly ? " monthly" : ""} from ${notice.name}`,
      replyTo: { name: notice.name, email: notice.email },
      fields: [
        ["Amount", amount],
        ["Frequency", monthly ? "Monthly standing order" : "One-off"],
        ["Donor", notice.name],
        ["Email", notice.email],
        ["Reference / note", notice.message],
      ],
      adminPath: "/admin/donations",
      adminLabel: "Open Donations",
    }),
  );

  return {
    status: "success",
    message: monthly
      ? `Thank you, ${firstName(notice.name)}. We'll look out for your monthly ${amount} and email ${notice.email} once the first one arrives.`
      : `Thank you, ${firstName(notice.name)}. We'll look out for your ${amount} transfer and email a receipt to ${notice.email} once it arrives.`,
  };
}

export async function submitVolunteer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = volunteerSchema.safeParse({
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    interest: formString(formData, "interest"),
    message: formString(formData, "message"),
    company: formString(formData, "company"),
  });

  if (!parsed.success) {
    return {
      ...CHECK_FIELDS,
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: submitted(formData),
    };
  }
  const volunteer = parsed.data;

  try {
    await db.insert(volunteers).values(volunteer);
  } catch (error) {
    console.error("[volunteer] insert failed", error);
    return { ...ERROR, values: submitted(formData) };
  }

  after(() =>
    sendStaffAlert({
      subject: `New volunteer: ${volunteer.name} (${volunteer.interest})`,
      replyTo: { name: volunteer.name, email: volunteer.email },
      fields: [
        ["Name", volunteer.name],
        ["Email", volunteer.email],
        ["Interested in", volunteer.interest],
        ["Message", volunteer.message],
      ],
      adminPath: "/admin/volunteers",
      adminLabel: "Open Volunteers",
    }),
  );

  return {
    status: "success",
    message: `Thanks for volunteering, ${firstName(volunteer.name)} — we'll be in touch shortly.`,
  };
}

export async function submitContact(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    subject: formString(formData, "subject"),
    body: formString(formData, "body"),
    company: formString(formData, "company"),
  });

  if (!parsed.success) {
    return {
      ...CHECK_FIELDS,
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: submitted(formData),
    };
  }
  const message = parsed.data;

  try {
    await db.insert(messages).values(message);
  } catch (error) {
    console.error("[message] insert failed", error);
    return { ...ERROR, values: submitted(formData) };
  }

  after(() =>
    sendStaffAlert({
      subject: `Website message: ${message.subject}`,
      replyTo: { name: message.name, email: message.email },
      fields: [
        ["From", message.name],
        ["Email", message.email],
        ["Subject", message.subject],
        ["Message", message.body],
      ],
      adminPath: "/admin/messages",
      adminLabel: "Open Messages",
    }),
  );

  return {
    status: "success",
    message: `Thanks, ${firstName(message.name)} — your message is with our team. We reply within two working days.`,
  };
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0];
}
