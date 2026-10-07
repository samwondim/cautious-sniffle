import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Which cookies Empower Humanity uses, why they are needed, and how to change your choice.",
};

const COOKIE_ROWS = [
  {
    name: "eh_consent",
    purpose:
      "Remembers your Accept / Decline choice for this cookie notice so the banner does not reappear.",
    duration: "180 days",
    type: "Strictly necessary (preference)",
  },
  {
    name: "eh_admin_session",
    purpose:
      "Keeps authorized staff signed in to the site administration area. Only set after an admin signs in; never set for public visitors.",
    duration: "30 days",
    type: "Strictly necessary (authentication)",
  },
];

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Cookie Policy"
        subtitle="The limited cookies we use, and how to manage your choice."
      />
      <Section tone="white">
        <div className="mx-auto max-w-[820px]">
          <p className="text-sm text-slate">Last updated: October 2026</p>

          <p className="mt-8 text-[16px] leading-[1.7] text-slate">
            We use cookies only where the site needs them to work. We do not
            currently use analytics, advertising, or cross-site tracking
            cookies. Our fonts are self-hosted, so simply reading these pages
            makes no requests to third-party font or tracking services.
          </p>

          <h2 className="mt-10 font-display text-[24px] leading-[1.25] text-ink">
            Cookies we set
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-hairline">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs tracking-wide text-slate uppercase">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Cookie
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Purpose
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Duration
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_ROWS.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-hairline align-top last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-[13px] text-ink">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 leading-relaxed text-slate">
                      {row.purpose}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate">
                      {row.duration}
                    </td>
                    <td className="px-4 py-3 text-slate">{row.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 font-display text-[24px] leading-[1.25] text-ink">
            Managing your choice
          </h2>
          <div className="mt-3 flex flex-col gap-3 text-[16px] leading-[1.7] text-slate">
            <p>
              Choosing “Decline” in our notice simply dismisses it — the
              strictly-necessary cookies above still apply, because the site
              cannot work without them. No optional cookies are set either way
              in this version of the site.
            </p>
            <p>
              You can change your mind at any time by clicking “Cookie
              settings” in the site footer, or by clearing cookies for this
              site in your browser settings, which will show the notice again
              on your next visit.
            </p>
          </div>

          <p className="mt-10 text-[16px] leading-[1.7] text-slate">
            For how we handle the information you send through our forms, see
            our{" "}
            <Link
              href="/privacy"
              className="font-semibold text-teal-strong underline underline-offset-2 hover:text-ink"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
