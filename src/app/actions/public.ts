"use server";

import { db } from "@/db";
import { donations, messages, volunteers } from "@/db/schema";
import {
  contactSchema,
  donationSchema,
  fieldErrorsFrom,
  volunteerSchema,
  type ActionState,
} from "@/lib/forms";

/**
 * Public form submissions. These are reachable by direct POST as well as
 * through the UI, so every one re-validates its input server-side.
 */

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const ERROR: ActionState = {
  status: "error",
  message: "Something went wrong. Please try again.",
};

export async function submitDonation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = donationSchema.safeParse({
    frequency: formString(formData, "frequency") || "one_time",
    amount: formString(formData, "amount"),
    customAmount: formString(formData, "customAmount"),
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    message: formString(formData, "message"),
    company: formString(formData, "company"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await db.insert(donations).values({
      frequency: parsed.data.frequency,
      amountCents: parsed.data.amountCents,
      currency: "USD",
      donorName: parsed.data.name,
      donorEmail: parsed.data.email,
      message: parsed.data.message,
      status: "completed",
    });
  } catch (error) {
    console.error("[donation] insert failed", error);
    return ERROR;
  }

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parsed.data.amountCents / 100);

  return {
    status: "success",
    message:
      parsed.data.frequency === "monthly"
        ? `Thank you — your monthly gift of ${amount} is set up. We'll email your receipt shortly.`
        : `Thank you — we've recorded your gift of ${amount}. We'll email your receipt shortly.`,
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
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await db.insert(volunteers).values(parsed.data);
  } catch (error) {
    console.error("[volunteer] insert failed", error);
    return ERROR;
  }

  return {
    status: "success",
    message: "Thanks for volunteering — we'll be in touch shortly.",
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
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await db.insert(messages).values(parsed.data);
  } catch (error) {
    console.error("[message] insert failed", error);
    return ERROR;
  }

  return {
    status: "success",
    message: "Message received — we'll reply within two working days.",
  };
}
