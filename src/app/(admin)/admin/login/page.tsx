import Image from "next/image";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin login — Empower Humanity",
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f6f7] px-6 font-sans">
      <div className="w-full max-w-[420px] rounded-2xl border border-hairline bg-white p-8">
        <Image
          src="/brand/empower-humanity-logo.svg"
          alt="Empower Humanity"
          width={56}
          height={60}
          priority
          className="h-14 w-auto"
        />
        <h1 className="mt-5 font-display text-2xl text-ink">Admin login</h1>
        <p className="mt-1 text-sm text-slate">
          Manage site content, projects, and incoming submissions.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
