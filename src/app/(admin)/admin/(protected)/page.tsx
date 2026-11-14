import Link from "next/link";
import { desc, eq, sql, type Table } from "drizzle-orm";

import { db } from "@/db";
import {
  donations,
  givingOptions,
  impactStats,
  messages,
  projects,
  sectors,
  volunteers,
} from "@/db/schema";
import { StatusBadge } from "@/components/admin/table";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Overview — Admin" };

async function count(table: Table): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(table);
  return row?.count ?? 0;
}

const CARDS = [
  { href: "/admin/sectors", label: "Sectors" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/stats", label: "Impact stats" },
  { href: "/admin/giving", label: "Giving options" },
] as const;

export default async function AdminHomePage() {
  const [
    sectorCount,
    projectCount,
    statCount,
    givingCount,
    donationCount,
    raisedByCurrency,
    pendingDonations,
    newVolunteers,
    newMessages,
    recentDonations,
    recentVolunteers,
  ] = await Promise.all([
    count(sectors),
    count(projects),
    count(impactStats),
    count(givingOptions),
    count(donations),
    // Per currency: an ETB gift and a USD gift cannot be added together.
    // bigint, because a year of birr in cents overflows a 32-bit sum; the
    // driver returns bigint as a string.
    db
      .select({
        currency: donations.currency,
        total: sql<string>`sum(${donations.amountCents})::bigint`,
      })
      .from(donations)
      .where(eq(donations.status, "completed"))
      .groupBy(donations.currency)
      .orderBy(desc(sql`sum(${donations.amountCents})`)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(donations)
      .where(eq(donations.status, "pending")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(volunteers)
      .where(eq(volunteers.status, "new")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(eq(messages.status, "new")),
    db
      .select()
      .from(donations)
      // `created_at` ties are common (the seed writes a batch in one
      // transaction), and without a unique tiebreaker Postgres is free to
      // return them in any order — so the list reshuffled between requests.
      .orderBy(desc(donations.createdAt), desc(donations.id))
      .limit(5),
    db
      .select()
      .from(volunteers)
      .orderBy(desc(volunteers.createdAt), desc(volunteers.id))
      .limit(5),
  ]);

  const raised =
    raisedByCurrency.length === 0
      ? "—"
      : raisedByCurrency
          .map((row) => formatMoney(Number(row.total), row.currency))
          .join(" · ");

  const stats = [
    { label: "Sectors", value: sectorCount, href: "/admin/sectors" },
    { label: "Projects", value: projectCount, href: "/admin/projects" },
    { label: "Impact stats", value: statCount, href: "/admin/stats" },
    { label: "Giving options", value: givingCount, href: "/admin/giving" },
    { label: "Donations", value: donationCount, href: "/admin/donations" },
    { label: "Raised (confirmed)", value: raised, href: "/admin/donations" },
    {
      label: "Transfers to confirm",
      value: pendingDonations[0]?.count ?? 0,
      href: "/admin/donations",
    },
    {
      label: "New volunteers",
      value: newVolunteers[0]?.count ?? 0,
      href: "/admin/volunteers",
    },
    {
      label: "New messages",
      value: newMessages[0]?.count ?? 0,
      href: "/admin/messages",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Overview</h1>
        <p className="mt-1 text-sm text-slate">
          Everything published here is live on the public site immediately.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-2xl font-semibold text-ink">{stat.value}</p>
            <p className="mt-1 text-sm text-slate">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/*
        `min-w-0` on the grid items is load-bearing: a grid item's default
        `min-width: auto` is its min-content width, so one long donor name
        widened the shared column past the viewport and the page scrolled
        sideways. Both items need it — they size the same column.
      */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-hairline bg-white p-6">
          <h2 className="font-display text-xl text-ink">Recent donations</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {recentDonations.length === 0 ? (
              <li className="text-sm text-slate">No donations yet.</li>
            ) : (
              recentDonations.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate text-ink">
                    {d.donorName}{" "}
                    <span className="text-slate">
                      · {formatMoney(d.amountCents, d.currency)}
                    </span>
                  </span>
                  <StatusBadge status={d.status} />
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="min-w-0 rounded-2xl border border-hairline bg-white p-6">
          <h2 className="font-display text-xl text-ink">Recent volunteers</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {recentVolunteers.length === 0 ? (
              <li className="text-sm text-slate">No volunteers yet.</li>
            ) : (
              recentVolunteers.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate text-ink">
                    {v.name} <span className="text-slate">· {v.interest}</span>
                  </span>
                  <StatusBadge status={v.status} />
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-hairline bg-white p-6">
        <h2 className="font-display text-xl text-ink">Manage content</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="btn-secondary px-5 py-2.5 text-sm font-semibold"
            >
              {card.label}
            </Link>
          ))}
          <Link
            href="/admin/content"
            className="btn-secondary px-5 py-2.5 text-sm font-semibold"
          >
            Site content
          </Link>
        </div>
      </section>
    </div>
  );
}
