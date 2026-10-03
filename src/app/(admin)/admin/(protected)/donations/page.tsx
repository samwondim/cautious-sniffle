import { desc } from "drizzle-orm";

import { updateDonationStatusAction } from "@/app/actions/admin";
import { db } from "@/db";
import { donations } from "@/db/schema";

export const metadata = { title: "Donations — Admin" };

const STATUSES = ["pending", "completed", "refunded", "failed"] as const;

export default async function AdminDonationsPage() {
  const rows = await db
    .select()
    .from(donations)
    .orderBy(desc(donations.createdAt))
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Donations</h1>
        <p className="mt-1 text-sm text-slate">
          Gifts recorded through the public form. Latest 100 shown.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs tracking-wide text-slate uppercase">
              <th className="px-5 py-3 font-semibold">Donor</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Frequency</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-slate">
                  No donations yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-hairline align-top last:border-0"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{row.donorName}</p>
                    <p className="text-xs text-slate">{row.donorEmail}</p>
                    {row.message ? (
                      <p className="mt-1 max-w-[320px] text-xs text-slate">
                        {row.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-ink">
                    {(row.amountCents / 100).toFixed(2)} {row.currency}
                  </td>
                  <td className="px-5 py-3 text-slate">{row.frequency}</td>
                  <td className="px-5 py-3">
                    <form
                      action={updateDonationStatusAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={row.id} />
                      <select
                        name="status"
                        defaultValue={row.status}
                        className="h-9 rounded-lg border border-hairline bg-white px-2 text-xs font-medium text-ink"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-teal"
                      >
                        Set
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
