import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Empower Humanity collects, uses, and protects personal information shared through donations, volunteering, and contact forms.",
};

const SECTIONS = [
  {
    heading: "Information we collect",
    body: [
      "When you donate, volunteer, or contact us, we collect the details you provide: your name, email address, and the contents of your message. Donation forms also record the gift amount and frequency (one-time or monthly) so we can process your gift.",
      "We do not collect payment card details on our own servers, and we do not build advertising profiles from your visits.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "We use your information to respond to your message, process and acknowledge donations, coordinate volunteering, and share updates you asked for. We do not sell or rent personal information.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use a small number of strictly-necessary cookies, such as the admin sign-in session, and a cookie that remembers your cookie-notice choice. We do not currently use analytics or advertising cookies. See our cookie policy for the full list.",
    ],
  },
  {
    heading: "Data retention and security",
    body: [
      "Form submissions are stored in our database so our team can follow up. Access is limited to authorized staff and administrators. Our admin area is protected by authenticated sessions with expiring credentials.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You may ask what information we hold about you, request a correction, or ask us to delete it. Contact us through the details in the site footer and we will respond as required by applicable law (including GDPR and CCPA/CPRA where they apply).",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How we handle the personal information you share with us."
      />
      <Section tone="white">
        <div className="mx-auto max-w-[820px]">
          <p className="text-sm text-slate">Last updated: October 2026</p>
          <div className="mt-8 flex flex-col gap-10">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display text-[24px] leading-[1.25] text-ink">
                  {section.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className="text-[16px] leading-[1.7] text-slate"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-[16px] leading-[1.7] text-slate">
            Questions about privacy or cookies? See our{" "}
            <Link
              href="/cookies"
              className="font-semibold text-teal-strong underline underline-offset-2 hover:text-ink"
            >
              cookie policy
            </Link>{" "}
            or reach us via the contact details in the site footer.
          </p>
        </div>
      </Section>
    </>
  );
}
