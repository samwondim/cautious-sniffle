import Link from "next/link";
import { eq } from "drizzle-orm";

import { upsertAccountAction } from "@/app/actions/admin";
import { AdminForm } from "@/components/admin/ui";
import { db } from "@/db";
import { bankAccounts } from "@/db/schema";

export const metadata = { title: "Edit bank account — Admin" };

export default async function AdminAccountEditPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const recordId = id ? Number(id) : undefined;

  let values: Record<string, string | number | null | undefined> | undefined;
  if (recordId && Number.isFinite(recordId)) {
    const [row] = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.id, recordId))
      .limit(1);
    if (row) {
      values = {
        scope: row.scope,
        bankName: row.bankName,
        accountName: row.accountName,
        accountNumber: row.accountNumber,
        swiftCode: row.swiftCode,
        branch: row.branch,
        currency: row.currency,
        note: row.note,
        sortOrder: row.sortOrder,
        status: row.status,
      };
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/accounts"
        className="w-fit text-sm font-semibold text-accent hover:opacity-70"
      >
        ← Back to bank accounts
      </Link>
      <h1 className="font-display text-3xl text-ink">
        {values ? "Edit account" : "New account"}
      </h1>
      <section className="rounded-2xl border border-hairline bg-white p-6">
        <AdminForm
          action={upsertAccountAction}
          recordId={values ? recordId : undefined}
          submitLabel={values ? "Save account" : "Create account"}
          values={values}
          fields={[
            {
              name: "scope",
              label: "Scope",
              type: "select",
              options: ["local", "international"],
            },
            { name: "bankName", label: "Bank name", type: "text" },
            { name: "accountName", label: "Account name", type: "text" },
            { name: "accountNumber", label: "Account number", type: "text" },
            {
              name: "swiftCode",
              label: "SWIFT / BIC (international only)",
              type: "text",
            },
            { name: "branch", label: "Branch", type: "text" },
            { name: "currency", label: "Currency (e.g. ETB)", type: "text" },
            { name: "note", label: "Note", type: "textarea" },
            { name: "sortOrder", label: "Sort order", type: "number" },
            {
              name: "status",
              label: "Status",
              type: "select",
              options: ["draft", "published"],
            },
          ]}
        />
      </section>
    </div>
  );
}
