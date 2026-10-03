import Link from "next/link";
import { asc, eq } from "drizzle-orm";

import { deleteProjectAction } from "@/app/actions/admin";
import { DeleteButton } from "@/components/admin/ui";
import { db } from "@/db";
import { projects, sectors } from "@/db/schema";

export const metadata = { title: "Projects — Admin" };

export default async function AdminProjectsPage() {
  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      location: projects.location,
      status: projects.status,
      sortOrder: projects.sortOrder,
      sectorName: sectors.name,
    })
    .from(projects)
    .leftJoin(sectors, eq(projects.sectorId, sectors.id))
    .orderBy(asc(projects.sortOrder), asc(projects.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Projects</h1>
          <p className="mt-1 text-sm text-slate">
            Cards on “Our Work”. Only published projects appear on the site.
          </p>
        </div>
        <Link
          href="/admin/projects/edit"
          className="btn-donate px-5 py-2.5 text-sm font-semibold"
        >
          New project
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs tracking-wide text-slate uppercase">
              <th className="px-5 py-3 font-semibold">Title</th>
              <th className="px-5 py-3 font-semibold">Sector</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-slate">
                  No projects yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-ink">
                    {row.title}{" "}
                    <span className="font-normal text-slate">
                      — {row.location}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate">
                    {row.sectorName ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-accent">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/projects/edit?id=${row.id}`}
                        className="rounded-full border border-hairline px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-teal"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        id={row.id}
                        action={deleteProjectAction}
                        label="project"
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
