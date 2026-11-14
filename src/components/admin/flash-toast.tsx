"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { useToast } from "@/components/admin/toast";

/**
 * One-off toast after a redirect-based mutation (create/edit).
 *
 * The Server Action redirects back to the list with `?saved=1`; this fires the
 * toast once on arrival, then replaces the URL without that flag so a refresh
 * or a shared link does not replay it.
 */
export function FlashToast({
  message,
  param = "saved",
}: {
  message: string;
  param?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || !searchParams.has(param)) return;
    fired.current = true;
    toast({ message });

    const next = new URLSearchParams(searchParams.toString());
    next.delete(param);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [message, param, pathname, router, searchParams, toast]);

  return null;
}
