import Link from "next/link";

import { CopyValue } from "@/components/copy-value";
import { Icon, toIconName } from "@/components/icons";
import { Eyebrow, Section, SectionTitle } from "@/components/section";
import type { BankAccount } from "@/db/schema";
import {
  getPublishedBankAccounts,
  getPublishedGivingOptions,
  getSiteContent,
} from "@/lib/content";

export const metadata = {
  title: "Donate",
  description: "Bank transfer details for supporting Empower Humanity.",
};

/** One account, rendered as a definition list so labels pair with values. */
function AccountCard({ account }: { account: BankAccount }) {
  const rows: { label: string; value: string; copyable?: boolean }[] = [
    { label: "Account name", value: account.accountName },
    { label: "Account number", value: account.accountNumber, copyable: true },
  ];
  if (account.swiftCode) {
    rows.push({ label: "SWIFT / BIC", value: account.swiftCode, copyable: true });
  }
  if (account.branch) rows.push({ label: "Branch", value: account.branch });

  return (
    <article
      className="flex flex-col gap-5 rounded-2xl border border-hairline bg-white p-6"
      style={{ boxShadow: "0 12px 28px rgba(16,60,70,0.08)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background:
                account.scope === "international"
                  ? "rgba(59,152,97,0.12)"
                  : "rgba(62,172,180,0.14)",
            }}
          >
            <Icon
              name={account.scope === "international" ? "globe" : "building"}
              size={20}
              className={
                account.scope === "international" ? "text-growth" : "text-accent"
              }
            />
          </div>
          <h3 className="text-[17px] font-semibold text-ink">
            {account.bankName}
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-mint px-3 py-1 text-xs font-semibold tracking-[0.06em] text-accent">
          {account.currency}
        </span>
      </div>

      <dl className="flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <dt className="field-label">{row.label}</dt>
            <dd className="sm:text-right">
              {row.copyable ? (
                <CopyValue
                  value={row.value}
                  label={`${account.bankName} ${row.label.toLowerCase()}`}
                />
              ) : (
                <span className="text-[15px] text-ink">{row.value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {account.note ? (
        <p className="border-t border-hairline pt-4 text-[14px] leading-[1.55] text-slate">
          {account.note}
        </p>
      ) : null}
    </article>
  );
}

function AccountGroup({
  title,
  body,
  accounts,
}: {
  title: string;
  body?: string;
  accounts: BankAccount[];
}) {
  if (accounts.length === 0) return null;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-[620px] flex-col gap-2">
        <h2 className="font-display text-[30px] text-ink md:text-[34px]">
          {title}
        </h2>
        {body ? (
          <p className="text-[16px] leading-[1.6] text-slate">{body}</p>
        ) : null}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
}

export default async function DonatePage() {
  const [content, accounts, givingOptions] = await Promise.all([
    getSiteContent(),
    getPublishedBankAccounts(),
    getPublishedGivingOptions(),
  ]);

  const local = accounts.filter((a) => a.scope === "local");
  const international = accounts.filter((a) => a.scope === "international");
  const notice = content["donate.placeholderNotice"];

  return (
    <>
      <section className="bg-ink px-6 py-20 md:px-10 lg:px-20 lg:py-24">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
          <Eyebrow tone="gold">{content["donate.eyebrow"]}</Eyebrow>
          <h1 className="max-w-[720px] font-display text-[40px] leading-[1.12] text-white md:text-[52px]">
            {content["donate.title"]}
          </h1>
          {content["donate.subtitle"] ? (
            <p className="max-w-[620px] text-[17px] leading-[1.65] text-mist">
              {content["donate.subtitle"]}
            </p>
          ) : null}
        </div>
      </section>

      <Section className="lg:py-20">
        <div className="flex flex-col gap-14">
          {notice ? (
            // Guardrail while the seeded account numbers are placeholders.
            // Clearing `donate.placeholderNotice` removes this banner.
            <p
              role="note"
              className="flex items-start gap-3 rounded-xl border border-gold bg-gold/12 px-5 py-4 text-[15px] leading-[1.55] text-ink"
            >
              <Icon name="flag" size={18} className="mt-0.5 shrink-0 text-ink" />
              {notice}
            </p>
          ) : null}

          <AccountGroup
            title={content["donate.localTitle"] || "Local bank transfer"}
            body={content["donate.localBody"]}
            accounts={local}
          />

          <AccountGroup
            title={
              content["donate.internationalTitle"] || "International transfer"
            }
            body={content["donate.internationalBody"]}
            accounts={international}
          />

          {accounts.length === 0 ? (
            <p className="text-slate">
              Bank details are not published yet. Please{" "}
              <Link href="/#contact" className="font-semibold text-accent">
                contact us
              </Link>{" "}
              to arrange a gift.
            </p>
          ) : null}
        </div>
      </Section>

      {givingOptions.length > 0 ? (
        <Section tone="mint">
          <div className="flex flex-col gap-3">
            <Eyebrow>{content["donate.eyebrow"]}</Eyebrow>
            <SectionTitle>{content["donate.impactTitle"]}</SectionTitle>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {givingOptions.map((option, index) => (
              <div
                key={option.id}
                className="flex flex-col gap-2.5 border-t-2 pt-5"
                style={{
                  borderTopColor:
                    index % 2 === 1 ? "var(--growth)" : "var(--teal)",
                }}
              >
                <Icon
                  name={toIconName(option.icon)}
                  size={28}
                  className={index % 2 === 1 ? "text-growth" : "text-accent"}
                />
                <h3 className="text-[17px] font-semibold">{option.title}</h3>
                <p className="text-sm leading-[1.55] text-slate">
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {content["donate.secureBody"] ? (
        <Section>
          <div className="mx-auto flex max-w-[720px] flex-col items-center gap-3 text-center">
            <h2 className="font-display text-[26px] text-ink">
              {content["donate.secureTitle"]}
            </h2>
            <p className="text-[16px] leading-[1.65] text-slate">
              {content["donate.secureBody"]}
            </p>
          </div>
        </Section>
      ) : null}
    </>
  );
}
