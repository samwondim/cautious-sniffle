import Link from "next/link";
import { asc } from "drizzle-orm";

import { deleteGivingAction } from "@/app/actions/admin";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/db";
import { givingOptions } from "@/db/schema";

export const metadata = { title: "Giving options — Admin" };

export default async function AdminGivingPage() {
  const rows = await db
    .select()
    .from(givingOptions)
    .orderBy(asc(givingOptions.sortOrder), asc(givingOptions.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Giving options</h1>
          <p className="mt-1 text-sm text-slate">
            The “Ways to Give” list on the homepage and donate page.
          </p>
        </div>
        <Link
          href="/admin/giving/edit"
          className="btn-donate px-5 py-2.5 text-sm font-semibold"
        >
          New option
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs tracking-wide text-slate uppercase">
              <th className="px-5 py-3 font-semibold">Title</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-slate">
                  No giving options yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-ink">
                    {row.title}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-accent">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/giving/edit?id=${row.id}`}
                        className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-teal"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        id={row.id}
                        action={deleteGivingAction}
                        label="giving option"
                      />
                    </div>
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
