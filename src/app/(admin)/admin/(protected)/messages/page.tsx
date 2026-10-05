import { desc } from "drizzle-orm";

import { updateLeadStatusAction } from "@/app/actions/admin";
import {
  AdminTable,
  StatusForm,
  type AdminColumn,
} from "@/components/admin/table";
import { db } from "@/db";
import { messages, type Message } from "@/db/schema";

export const metadata = { title: "Messages — Admin" };

const STATUSES = ["new", "in_progress", "archived"] as const;

const COLUMNS: AdminColumn<Message>[] = [
  {
    header: "From",
    mobile: "title",
    cell: (row) => (
      <>
        <span className="font-medium text-ink">{row.name}</span>
        <span className="block text-xs font-normal break-all text-slate">
          {row.email}
        </span>
      </>
    ),
  },
  {
    header: "Subject",
    cell: (row) => (
      <>
        <span className="font-medium text-ink">{row.subject}</span>
        <span className="mt-1 block max-w-[360px] text-xs whitespace-pre-wrap text-slate">
          {row.body}
        </span>
      </>
    ),
  },
  {
    header: "Status",
    mobile: "footer",
    cell: (row) => (
      <StatusForm
        action={updateLeadStatusAction}
        id={row.id}
        kind="message"
        status={row.status}
        options={STATUSES}
      />
    ),
  },
];

export default async function AdminMessagesPage() {
  const rows = await db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Messages</h1>
        <p className="mt-1 text-sm text-slate">
          Contact form submissions. Latest 100 shown.
        </p>
      </div>

      <AdminTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={COLUMNS}
        rowAlign="top"
        empty="No messages yet."
      />
    </div>
  );
}
