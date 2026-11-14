import Link from "next/link";

import { Eyebrow } from "@/components/section";

type Action =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

/**
 * The body of the 404 and error pages: the dark opening band every section
 * page starts with, a plain-language explanation, and somewhere useful to go.
 *
 * Kept free of hooks and data so it can render inside the site layout (with
 * nav and footer) and also stand alone when the layout itself has failed.
 */
export function StatusPage({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  links,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary: Action;
  secondary?: Action;
  links?: Array<{ label: string; href: string; description: string }>;
}) {
  return (
    <section className="flex flex-1 flex-col bg-ink px-6 py-20 md:px-10 md:py-28 lg:px-20">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
        <Eyebrow tone="gold">{eyebrow}</Eyebrow>
        <h1 className="max-w-[820px] font-display text-[40px] leading-[1.1] text-white md:text-[60px]">
          {title}
        </h1>
        <p className="max-w-[560px] text-[17px] leading-[1.65] text-mist">
          {body}
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <StatusAction action={primary} className="btn-gold" />
          {secondary ? (
            <StatusAction
              action={secondary}
              className="btn-secondary btn-secondary-on-dark"
            />
          ) : null}
        </div>

        {links?.length ? (
          <nav
            aria-label="Popular pages"
            className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col gap-1.5 bg-ink p-6 transition-colors duration-200 hover:bg-[#154a56] focus-visible:bg-[#154a56]"
              >
                <span className="flex items-center justify-between font-semibold text-white">
                  {link.label}
                  <span
                    aria-hidden
                    className="text-teal transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  >
                    →
                  </span>
                </span>
                <span className="text-sm leading-[1.55] text-mist/70">
                  {link.description}
                </span>
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  );
}

function StatusAction({
  action,
  className,
}: {
  action: Action;
  className: string;
}) {
  const classes = `${className} px-8 py-4 text-center text-sm font-semibold tracking-[0.04em]`;
  if (action.href !== undefined) {
    return (
      <Link href={action.href} className={classes}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={classes}>
      {action.label}
    </button>
  );
}
