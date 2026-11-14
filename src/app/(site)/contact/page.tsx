import Link from "next/link";

import { ContactForm } from "@/components/forms";
import { Icon, type IconName } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { getSiteContent } from "@/lib/content";

export async function generateMetadata() {
  const content = await getSiteContent();
  return {
    title: content["nav.contact"] || "Contact",
    description: content["contact.subtitle"] || undefined,
  };
}

/**
 * Where "Contact Us" leads. Messages land in the admin's Messages inbox and,
 * when email alerts are configured, in the team's mailbox with Reply-To set
 * to the sender.
 *
 * The form is deliberately unanimated: it is the reason for the page, so it
 * must be usable the instant the page paints.
 */
export default async function ContactPage() {
  const content = await getSiteContent();

  const email = content["contact.email"];
  const phone = content["contact.phone"];
  const address = content["contact.address"];

  const direct: Array<{
    icon: IconName;
    label: string;
    value: string;
    href?: string;
  }> = [];
  if (email) {
    direct.push({ icon: "mail", label: "Email", value: email, href: `mailto:${email}` });
  }
  if (phone) {
    direct.push({
      icon: "phone",
      label: "Phone",
      value: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
    });
  }
  if (address) {
    direct.push({ icon: "map-pin", label: "Where we are", value: address });
  }

  return (
    <>
      <PageHero
        eyebrow={content["contact.eyebrow"] || "Contact"}
        title={content["contact.title"] || "Let's talk."}
        subtitle={content["contact.subtitle"]}
      />

      <Section className="lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-[28px] leading-[1.2] text-ink">
              Send us a message
            </h2>
            <ContactForm />
          </div>

          <aside className="flex flex-col gap-8">
            {direct.length > 0 ? (
              <div className="flex flex-col gap-5">
                <h2 className="field-label">Reach us directly</h2>
                <ul className="flex flex-col gap-3">
                  {direct.map((item) => {
                    const body = (
                      <>
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mint text-teal-strong">
                          <Icon name={item.icon} size={18} />
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="text-[13px] text-slate">{item.label}</span>
                          <span className="break-words font-semibold text-ink">
                            {item.value}
                          </span>
                        </span>
                      </>
                    );
                    return (
                      <li key={item.label}>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="flex items-center gap-4 rounded-2xl border border-hairline p-4 transition-colors duration-200 hover:border-teal hover:bg-mint/40"
                          >
                            {body}
                          </a>
                        ) : (
                          <div className="flex items-center gap-4 rounded-2xl border border-hairline p-4">
                            {body}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 rounded-2xl bg-ink p-7 text-white">
              <h2 className="font-display text-[22px] leading-[1.25]">
                Other ways to help
              </h2>
              <Link
                href="/donate"
                className="group flex items-center justify-between gap-4 border-t border-white/15 pt-4 text-[15px] font-semibold"
              >
                Give by bank transfer
                <Icon
                  name="arrow-right"
                  size={18}
                  className="text-gold transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </Link>
              <Link
                href="/#volunteer"
                className="group flex items-center justify-between gap-4 border-t border-white/15 pt-4 text-[15px] font-semibold"
              >
                Volunteer with us
                <Icon
                  name="arrow-right"
                  size={18}
                  className="text-gold transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
