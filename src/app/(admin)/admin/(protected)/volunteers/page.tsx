import { desc } from "drizzle-orm";

import { updateLeadStatusAction } from "@/app/actions/admin";
import { db } from "@/db";
import { volunteers } from "@/db/schema";

export const metadata = { title: "Volunteers — Admin" };

const STATUSES = ["new", "in_progress", "archived"] as const;

export default async function AdminVolunteersPage() {
  const rows = await db
    .select()
    .from(volunteers)
    .orderBy(desc(volunteers.createdAt))
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Volunteers</h1>
        <p className="mt-1 text-sm text-slate">
          Sign-ups from the volunteer form. Latest 100 shown.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs tracking-wide text-slate uppercase">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Interest</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-slate">
                  No volunteers yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-hairline align-top last:border-0"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{row.name}</p>
                    <p className="text-xs text-slate">{row.email}</p>
                    {row.message ? (
                      <p className="mt-1 max-w-[320px] text-xs text-slate">
                        {row.message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-slate">{row.interest}</td>
                  <td className="px-5 py-3">
                    <form
                      action={updateLeadStatusAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="kind" value="volunteer" />
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
