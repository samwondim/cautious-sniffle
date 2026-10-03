import Link from "next/link";
import { asc } from "drizzle-orm";

import { deleteSectorAction } from "@/app/actions/admin";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/db";
import { sectors } from "@/db/schema";

export const metadata = { title: "Sectors — Admin" };

export default async function AdminSectorsPage() {
  const rows = await db
    .select()
    .from(sectors)
    .orderBy(asc(sectors.sortOrder), asc(sectors.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Sectors</h1>
          <p className="mt-1 text-sm text-slate">
            The four cards on “What We Do”. Order is by sort order.
          </p>
        </div>
        <Link
          href="/admin/sectors/edit"
          className="btn-donate px-5 py-2.5 text-sm font-semibold"
        >
          New sector
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs tracking-wide text-slate uppercase">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Slug</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-slate">
                  No sectors yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-ink">{row.name}</td>
                  <td className="px-5 py-3 text-slate">{row.slug}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-accent">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate">{row.sortOrder}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/sectors/edit?id=${row.id}`}
                        className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-teal"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        id={row.id}
                        action={deleteSectorAction}
                        label="sector"
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
