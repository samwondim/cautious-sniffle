"use client";

import Image from "next/image";
import { useEffect } from "react";

import { StatusPage } from "@/components/status-page";

/**
 * Catches failures in the site and admin layouts themselves — most often the
 * database being unreachable, since both layouts read from it before
 * rendering anything. There is no nav here (the nav is what failed to
 * load), so the logo stands in for it.
 */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-ink">
      <header className="px-6 pt-8 md:px-10 lg:px-20">
        <Image
          src="/brand/empower-humanity-logo-white.svg"
          alt="Empower Humanity"
          width={140}
          height={150}
          className="h-14 w-auto"
          priority
        />
      </header>
      <StatusPage
        eyebrow="Temporarily unavailable"
        title="We'll be right back."
        body="The site is having trouble reaching its content. This is usually brief — please try again in a moment."
        primary={{ label: "Try again", onClick: retry }}
      />
    </div>
  );
}
