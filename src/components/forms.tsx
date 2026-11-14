"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  submitContact,
  submitTransferNotice,
  submitVolunteer,
} from "@/app/actions/public";
import { Icon } from "@/components/icons";
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

export function FieldError({ id, error }: { id?: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="text-[13px] text-[#b42318]">
      {error}
    </p>
  );
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
          : "w-full text-sm font-medium text-[#b42318]"
      }
    >
      {state.message}
    </p>
  );
}

/**
 * Props for one input: wires the label, the error message and
 * `aria-invalid` together, and restores the submitted value after a failed
 * attempt (see `ActionState.values`).
 */
function fieldProps(state: ActionState, prefix: string, name: string) {
  const error = state.fieldErrors?.[name];
  const errorId = `${prefix}-${name}-error`;
  return {
    id: `${prefix}-${name}`,
    name,
    defaultValue: state.values?.[name],
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    error,
    errorId,
  } as const;
}

/**
 * After a failed submit, move focus to the first field with an error so
 * keyboard and screen-reader users land on what needs fixing.
 */
function useFocusFirstError(
  formRef: React.RefObject<HTMLFormElement | null>,
  state: ActionState,
) {
  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [formRef, state]);
}

/**
 * Replaces a form once it has gone through: a clear confirmation instead of
 * a line of text under a form that has just emptied itself.
 */
function SuccessPanel({
  message,
  againLabel,
  onAgain,
}: {
  message?: string;
  againLabel: string;
  onAgain: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    panel.focus({ preventScroll: true });
    // Bring it into view only if the visitor can't already see it; a
    // reflexive jump is disorienting when the panel is on screen.
    const { top, bottom } = panel.getBoundingClientRect();
    if (top < 96 || bottom > window.innerHeight) {
      panel.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }
  }, []);
  return (
    <div
      ref={ref}
      tabIndex={-1}
      // Focus lands here, so keep it clear of the sticky nav bar.
      className="flex scroll-mt-32 flex-col items-start gap-4 rounded-2xl border border-hairline bg-mint p-7 outline-none"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal text-ink">
        <Icon name="check" size={20} />
      </span>
      {/* Only the message is announced, not the button after it. */}
      <p role="status" aria-live="polite" className="text-[17px] leading-[1.6] text-ink">
        {message}
      </p>
      <button
        type="button"
        onClick={onAgain}
        className="text-sm font-semibold text-teal-strong underline-offset-4 hover:underline"
      >
        {againLabel}
      </button>
    </div>
  );
}

/** `useActionState` plus a way to put the form back after a success. */
function useFormFlow(
  action: (state: ActionState, formData: FormData) => Promise<ActionState>,
) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  const [dismissed, setDismissed] = useState<ActionState | null>(null);
  const showSuccess = state.status === "success" && dismissed !== state;
  // A fresh key after "send another" remounts the form empty.
  const formKey = dismissed === state ? "again" : "form";
  return {
    state: dismissed === state ? IDLE : state,
    formAction,
    pending,
    showSuccess,
    successMessage: state.message,
    reset: () => setDismissed(state),
    formKey,
  };
}

function SubmitButton({
  pending,
  label,
  pendingLabel,
  className,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
  className: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

const PRIMARY_BUTTON =
  "btn-donate w-full px-8 py-4 text-sm font-semibold tracking-[0.04em] sm:w-fit";

/* ------------------------------------------------------------------ */
/* Volunteer (home page band)                                           */
/* ------------------------------------------------------------------ */

export function VolunteerForm({
  sectors,
  submitLabel,
}: {
  sectors: { id: number; name: string }[];
  submitLabel: string;
}) {
  const flow = useFormFlow(submitVolunteer);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, flow.state);

  if (flow.showSuccess) {
    return (
      <SuccessPanel
        message={flow.successMessage}
        againLabel="Sign up someone else"
        onAgain={flow.reset}
      />
    );
  }

  const nameField = fieldProps(flow.state, "v", "name");
  const emailField = fieldProps(flow.state, "v", "email");
  const interestField = fieldProps(flow.state, "v", "interest");

  // Stacked, placeholder-led layout from the design. Labels are kept in the
  // DOM but visually hidden: the look stays borderless while screen readers
  // still announce each field by name.
  return (
    <form
      key={flow.formKey}
      ref={formRef}
      id="volunteer-form"
      action={flow.formAction}
      noValidate
      className="flex w-full flex-col gap-4"
    >
      <Honeypot />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={nameField.id} className="sr-only">
          Full Name
        </label>
        <input
          {...withoutError(nameField)}
          type="text"
          placeholder="Name"
          autoComplete="name"
          required
          className="field-input-soft"
        />
        <FieldError id={nameField.errorId} error={nameField.error} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={emailField.id} className="sr-only">
          Email
        </label>
        <input
          {...withoutError(emailField)}
          type="email"
          placeholder="Email"
          autoComplete="email"
          inputMode="email"
          required
          className="field-input-soft"
        />
        <FieldError id={emailField.errorId} error={emailField.error} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={interestField.id} className="sr-only">
          Area of interest
        </label>
        <select
          {...withoutError(interestField)}
          defaultValue={interestField.defaultValue ?? ""}
          required
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
        <FieldError id={interestField.errorId} error={interestField.error} />
      </div>

      <SubmitButton
        pending={flow.pending}
        label={submitLabel}
        pendingLabel="Sending…"
        className="mt-1 w-fit rounded-full bg-teal px-7 py-3.5 text-sm font-semibold tracking-[0.04em] text-ink transition-colors hover:bg-teal-strong hover:text-white"
      />

      {flow.state.status === "error" ? <FormBanner state={flow.state} /> : null}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Contact (/contact)                                                   */
/* ------------------------------------------------------------------ */

export function ContactForm() {
  const flow = useFormFlow(submitContact);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, flow.state);

  if (flow.showSuccess) {
    return (
      <SuccessPanel
        message={flow.successMessage}
        againLabel="Send another message"
        onAgain={flow.reset}
      />
    );
  }

  const name = fieldProps(flow.state, "c", "name");
  const email = fieldProps(flow.state, "c", "email");
  const subject = fieldProps(flow.state, "c", "subject");
  const body = fieldProps(flow.state, "c", "body");

  return (
    <form
      key={flow.formKey}
      ref={formRef}
      action={flow.formAction}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <Honeypot />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" field={name}>
          <input
            {...withoutError(name)}
            type="text"
            autoComplete="name"
            required
            className="field-input"
          />
        </Field>
        <Field label="Email" field={email}>
          <input
            {...withoutError(email)}
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            className="field-input"
          />
        </Field>
      </div>

      <Field label="Subject" field={subject}>
        <input
          {...withoutError(subject)}
          type="text"
          required
          maxLength={200}
          className="field-input"
        />
      </Field>

      <Field label="Message" field={body}>
        <textarea
          {...withoutError(body)}
          required
          rows={6}
          maxLength={5000}
          className="field-input"
        />
      </Field>

      <div className="flex flex-col gap-3">
        <SubmitButton
          pending={flow.pending}
          label="Send message"
          pendingLabel="Sending…"
          className={PRIMARY_BUTTON}
        />
        {flow.state.status === "error" ? (
          <FormBanner state={flow.state} />
        ) : null}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Transfer notice (/donate)                                            */
/* ------------------------------------------------------------------ */

export function TransferNoticeForm({ currencies }: { currencies: string[] }) {
  const flow = useFormFlow(submitTransferNotice);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, flow.state);

  if (flow.showSuccess) {
    return (
      <SuccessPanel
        message={flow.successMessage}
        againLabel="Tell us about another transfer"
        onAgain={flow.reset}
      />
    );
  }

  const amount = fieldProps(flow.state, "t", "amount");
  const currency = fieldProps(flow.state, "t", "currency");
  const frequency = fieldProps(flow.state, "t", "frequency");
  const name = fieldProps(flow.state, "t", "name");
  const email = fieldProps(flow.state, "t", "email");
  const message = fieldProps(flow.state, "t", "message");
  const chosenFrequency = frequency.defaultValue ?? "one_time";

  return (
    <form
      key={flow.formKey}
      ref={formRef}
      action={flow.formAction}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <Honeypot />

      <fieldset className="flex flex-col gap-2">
        <legend className="field-label mb-2">This gift is</legend>
        <div className="grid grid-cols-2 gap-2 rounded-full bg-mint p-1">
          {(
            [
              ["one_time", "One-off"],
              ["monthly", "Monthly"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="relative">
              <input
                type="radio"
                name="frequency"
                value={value}
                defaultChecked={chosenFrequency === value}
                className="peer sr-only"
              />
              <span className="flex h-11 cursor-pointer items-center justify-center rounded-full text-sm font-semibold text-slate transition-colors duration-150 peer-checked:bg-white peer-checked:text-ink peer-checked:shadow-[0_2px_8px_rgba(16,60,70,0.12)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                {label}
              </span>
            </label>
          ))}
        </div>
        <FieldError id={frequency.errorId} error={frequency.error} />
      </fieldset>

      <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
        <Field label="Amount sent" field={amount}>
          <input
            {...withoutError(amount)}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 5,000"
            required
            className="field-input"
          />
        </Field>
        <Field label="Currency" field={currency}>
          <select
            {...withoutError(currency)}
            defaultValue={currency.defaultValue ?? currencies[0]}
            required
            className="field-input"
          >
            {currencies.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" field={name}>
          <input
            {...withoutError(name)}
            type="text"
            autoComplete="name"
            required
            className="field-input"
          />
        </Field>
        <Field label="Email for your receipt" field={email}>
          <input
            {...withoutError(email)}
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            className="field-input"
          />
        </Field>
      </div>

      <Field
        label="Transfer reference or note"
        optional
        field={message}
      >
        <textarea
          {...withoutError(message)}
          rows={3}
          maxLength={2000}
          placeholder="The reference you used, or which project the gift is for"
          className="field-input"
        />
      </Field>

      <div className="flex flex-col gap-3">
        <SubmitButton
          pending={flow.pending}
          label="Let us know"
          pendingLabel="Sending…"
          className={PRIMARY_BUTTON}
        />
        {flow.state.status === "error" ? (
          <FormBanner state={flow.state} />
        ) : null}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

type FieldBinding = ReturnType<typeof fieldProps>;

/** Strip the helper-only keys before spreading onto a DOM element. */
function withoutError(field: FieldBinding) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- picked off so they don't reach the DOM
  const { error, errorId, ...dom } = field;
  return dom;
}

function Field({
  label,
  optional,
  field,
  children,
}: {
  label: string;
  optional?: boolean;
  field: FieldBinding;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={field.id} className="field-label">
        {label}
        {optional ? (
          <span className="ml-1.5 font-normal tracking-normal normal-case text-slate">
            (optional)
          </span>
        ) : null}
      </label>
      {children}
      <FieldError id={field.errorId} error={field.error} />
    </div>
  );
}
