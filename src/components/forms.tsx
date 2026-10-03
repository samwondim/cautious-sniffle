"use client";

import { useActionState } from "react";

import { submitVolunteer } from "@/app/actions/public";
import { IDLE, type ActionState } from "@/lib/forms";

/** Honeypot input — visually hidden, ignored by humans, filled by bots. */
export function Honeypot({ name = "company" }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor={name}>Company</label>
      <input id={name} name={name} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-[12px] text-red-600">{error}</p>;
}

/** Inline result banner shared by all public forms. */
export function FormBanner({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;
  const isSuccess = state.status === "success";
  return (
    <p
      role="status"
      aria-live="polite"
      className={
        isSuccess
          ? "w-full text-sm font-medium text-accent"
          : "w-full text-sm font-medium text-red-700"
      }
    >
      {state.message}
    </p>
  );
}

export function VolunteerForm({
  sectors,
  submitLabel,
  initialState = IDLE,
}: {
  sectors: { id: number; name: string }[];
  submitLabel: string;
  initialState?: ActionState;
}) {
  const [state, action, pending] = useActionState(
    submitVolunteer,
    initialState,
  );

  // Stacked, placeholder-led layout from the design. Labels are kept in the
  // DOM but visually hidden: the look stays borderless while screen readers
  // still announce each field by name.
  return (
    <form
      id="volunteer-form"
      action={action}
      className="flex w-full flex-col gap-4"
    >
      <Honeypot />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="v-name" className="sr-only">
          Full Name
        </label>
        <input
          id="v-name"
          name="name"
          type="text"
          placeholder="Name"
          autoComplete="name"
          required
          className="field-input-soft"
        />
        <FieldError error={state.fieldErrors?.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="v-email" className="sr-only">
          Email
        </label>
        <input
          id="v-email"
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          className="field-input-soft"
        />
        <FieldError error={state.fieldErrors?.email} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="v-interest" className="sr-only">
          Area of interest
        </label>
        <select
          id="v-interest"
          name="interest"
          required
          defaultValue=""
          className="field-input-soft"
        >
          <option value="" disabled>
            Area of interest
          </option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.name}>
              {sector.name}
            </option>
          ))}
        </select>
        <FieldError error={state.fieldErrors?.interest} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-fit rounded-full bg-teal px-7 py-3.5 text-sm font-semibold tracking-[0.04em] text-ink transition-colors hover:bg-teal-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : submitLabel}
      </button>

      <FormBanner state={state} />
    </form>
  );
}
